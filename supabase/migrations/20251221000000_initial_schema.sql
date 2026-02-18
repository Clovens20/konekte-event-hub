-- ============================================
-- MIGRATION INITIALE COMPLÈTE
-- Konekte Event Hub - Schema Initial
-- ============================================
-- Cette migration crée toutes les tables, types, fonctions et politiques nécessaires
-- Elle est idempotente : peut être exécutée plusieurs fois sans erreur

-- ============================================
-- 1. CRÉATION DES TYPES ENUM
-- ============================================

-- Type pour les niveaux d'expérience
DO $$ BEGIN
  CREATE TYPE public.experience_level AS ENUM ('Débutant', 'Intermédiaire', 'Avancé');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Type pour les statuts d'inscription
DO $$ BEGIN
  CREATE TYPE public.inscription_status AS ENUM ('Confirmé', 'En attente', 'Annulé');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Type pour les pourcentages de paiement
DO $$ BEGIN
  CREATE TYPE public.payment_percentage AS ENUM ('25', '50', '100');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Type pour les types de codes promo
DO $$ BEGIN
  CREATE TYPE public.promo_type AS ENUM ('percentage', 'fixed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Type pour les rôles d'application
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 2. CRÉATION DES TABLES
-- ============================================

-- Table: Informations du séminaire
CREATE TABLE IF NOT EXISTS public.seminar_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre TEXT NOT NULL DEFAULT 'Maîtriser l''IA pour le Développement Web',
  description TEXT NOT NULL DEFAULT 'Formez-vous aux outils d''IA essentiels pour développer des applications web.',
  lieu TEXT NOT NULL DEFAULT 'En ligne',
  date_debut DATE NOT NULL DEFAULT '2025-03-15',
  date_fin DATE NOT NULL DEFAULT '2025-03-17',
  nombre_places_total INTEGER NOT NULL DEFAULT 100,
  organisateur TEXT NOT NULL DEFAULT 'Konekte Group',
  prix_base INTEGER NOT NULL DEFAULT 5000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: Modules du programme
CREATE TABLE IF NOT EXISTS public.program_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jour INTEGER NOT NULL,
  titre TEXT NOT NULL,
  description TEXT NOT NULL,
  ordre INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: Avantages du séminaire
CREATE TABLE IF NOT EXISTS public.benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icon TEXT NOT NULL DEFAULT 'Award',
  titre TEXT NOT NULL,
  description TEXT NOT NULL,
  ordre INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: Codes promotionnels
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  type promo_type NOT NULL DEFAULT 'percentage',
  valeur INTEGER NOT NULL,
  date_expiration DATE,
  utilisations_max INTEGER DEFAULT 0,
  utilisations_actuelles INTEGER NOT NULL DEFAULT 0,
  actif BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: Inscriptions
CREATE TABLE IF NOT EXISTS public.inscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_complet TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT NOT NULL,
  niveau_experience experience_level NOT NULL,
  motivation TEXT,
  montant_paye INTEGER NOT NULL,
  pourcentage_paye payment_percentage NOT NULL,
  code_promo TEXT,
  statut inscription_status NOT NULL DEFAULT 'En attente',
  transaction_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: Configuration du footer
CREATE TABLE IF NOT EXISTS public.footer_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  copyright TEXT NOT NULL DEFAULT '© 2025 Konekte Group. Tous droits réservés.',
  email TEXT NOT NULL DEFAULT 'contact@konekte.ht',
  telephone TEXT NOT NULL DEFAULT '+509 XXXX XXXX',
  adresse TEXT NOT NULL DEFAULT 'En ligne',
  facebook TEXT,
  instagram TEXT,
  linkedin TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: Utilisateurs admin (legacy, non utilisé directement)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: Rôles utilisateurs
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- ============================================
-- 3. ACTIVATION DE RLS (Row Level Security)
-- ============================================

ALTER TABLE public.seminar_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. SUPPRESSION DES ANCIENNES POLITIQUES (si elles existent)
-- ============================================

DROP POLICY IF EXISTS "Public can read seminar info" ON public.seminar_info;
DROP POLICY IF EXISTS "Public can read program modules" ON public.program_modules;
DROP POLICY IF EXISTS "Public can read benefits" ON public.benefits;
DROP POLICY IF EXISTS "Public can read footer config" ON public.footer_config;
DROP POLICY IF EXISTS "Public can read active promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Public can insert inscriptions" ON public.inscriptions;
DROP POLICY IF EXISTS "Admins can manage seminar info" ON public.seminar_info;
DROP POLICY IF EXISTS "Admins can manage program modules" ON public.program_modules;
DROP POLICY IF EXISTS "Admins can manage benefits" ON public.benefits;
DROP POLICY IF EXISTS "Admins can manage promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Admins can manage inscriptions" ON public.inscriptions;
DROP POLICY IF EXISTS "Admins can manage footer config" ON public.footer_config;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can read admin users" ON public.admin_users;

-- ============================================
-- 5. CRÉATION DES POLITIQUES RLS
-- ============================================

-- Politiques publiques (lecture)
CREATE POLICY "Public can read seminar info" 
  ON public.seminar_info FOR SELECT 
  USING (true);

CREATE POLICY "Public can read program modules" 
  ON public.program_modules FOR SELECT 
  USING (true);

CREATE POLICY "Public can read benefits" 
  ON public.benefits FOR SELECT 
  USING (true);

CREATE POLICY "Public can read footer config" 
  ON public.footer_config FOR SELECT 
  USING (true);

-- Politique pour les codes promo actifs (lecture publique)
CREATE POLICY "Public can read active promo codes" 
  ON public.promo_codes FOR SELECT 
  USING (actif = true);

-- Politique pour l'insertion d'inscriptions (publique)
CREATE POLICY "Public can insert inscriptions" 
  ON public.inscriptions FOR INSERT 
  WITH CHECK (true);

-- ============================================
-- 6. FONCTIONS SQL
-- ============================================

-- Fonction: Vérifier si un utilisateur a un rôle
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Fonction: Obtenir le nombre d'inscriptions actives
CREATE OR REPLACE FUNCTION public.get_inscription_count()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER 
  FROM public.inscriptions 
  WHERE statut != 'Annulé'
$$;

-- Fonction: Incrémenter l'utilisation d'un code promo
CREATE OR REPLACE FUNCTION public.increment_promo_usage(promo_code TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.promo_codes 
  SET utilisations_actuelles = utilisations_actuelles + 1
  WHERE code = promo_code;
END;
$$;

-- Fonction: Valider et calculer la réduction d'un code promo
CREATE OR REPLACE FUNCTION public.validate_promo_code(
  promo_code TEXT,
  base_amount INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  promo_record RECORD;
  discount_amount INTEGER;
  final_amount INTEGER;
BEGIN
  -- Trouver le code promo
  SELECT * INTO promo_record
  FROM public.promo_codes
  WHERE code = promo_code
    AND actif = true;
  
  -- Vérifier si le code existe
  IF NOT FOUND THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Code promo introuvable'
    );
  END IF;
  
  -- Vérifier l'expiration
  IF promo_record.date_expiration IS NOT NULL AND promo_record.date_expiration < CURRENT_DATE THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Code promo expiré'
    );
  END IF;
  
  -- Vérifier la limite d'utilisation
  IF promo_record.utilisations_max > 0 AND promo_record.utilisations_actuelles >= promo_record.utilisations_max THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Code promo épuisé'
    );
  END IF;
  
  -- Calculer la réduction
  IF promo_record.type = 'percentage' THEN
    discount_amount := (base_amount * promo_record.valeur) / 100;
  ELSE
    discount_amount := promo_record.valeur;
  END IF;
  
  -- S'assurer que la réduction ne dépasse pas le montant de base
  IF discount_amount > base_amount THEN
    discount_amount := base_amount;
  END IF;
  
  final_amount := base_amount - discount_amount;
  
  -- Retourner le résultat de validation
  RETURN json_build_object(
    'valid', true,
    'code', promo_record.code,
    'type', promo_record.type,
    'valeur', promo_record.valeur,
    'discount', discount_amount,
    'final_amount', final_amount
  );
END;
$$;

-- ============================================
-- 7. POLITIQUES ADMIN (après création de has_role)
-- ============================================

-- Politiques pour la gestion complète par les admins
CREATE POLICY "Admins can manage seminar info" 
  ON public.seminar_info FOR ALL 
  TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage program modules" 
  ON public.program_modules FOR ALL 
  TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage benefits" 
  ON public.benefits FOR ALL 
  TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage promo codes" 
  ON public.promo_codes FOR ALL 
  TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage inscriptions" 
  ON public.inscriptions FOR ALL 
  TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage footer config" 
  ON public.footer_config FOR ALL 
  TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage user roles" 
  ON public.user_roles FOR ALL 
  TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can read admin users" 
  ON public.admin_users FOR SELECT 
  TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 8. DONNÉES INITIALES (optionnel)
-- ============================================

-- Insérer une ligne par défaut dans seminar_info si elle n'existe pas
INSERT INTO public.seminar_info (id, titre, description, lieu, date_debut, date_fin, nombre_places_total, organisateur, prix_base)
SELECT 
  gen_random_uuid(),
  'Maîtriser l''IA pour le Développement Web',
  'Formez-vous aux outils d''IA essentiels pour développer des applications web modernes.',
  'En ligne',
  '2025-03-15',
  '2025-03-17',
  100,
  'Konekte Group',
  5000
WHERE NOT EXISTS (SELECT 1 FROM public.seminar_info);

-- Insérer une ligne par défaut dans footer_config si elle n'existe pas
INSERT INTO public.footer_config (id, copyright, email, telephone, adresse)
SELECT 
  gen_random_uuid(),
  '© 2025 Konekte Group. Tous droits réservés.',
  'contact@konekte.ht',
  '+509 XXXX XXXX',
  'En ligne'
WHERE NOT EXISTS (SELECT 1 FROM public.footer_config);

-- ============================================
-- FIN DE LA MIGRATION
-- ============================================

