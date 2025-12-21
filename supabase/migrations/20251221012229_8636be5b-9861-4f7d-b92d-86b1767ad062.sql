-- Create enum for experience levels
CREATE TYPE public.experience_level AS ENUM ('Débutant', 'Intermédiaire', 'Avancé');

-- Create enum for inscription status
CREATE TYPE public.inscription_status AS ENUM ('Confirmé', 'En attente', 'Annulé');

-- Create enum for payment percentage
CREATE TYPE public.payment_percentage AS ENUM ('25', '50', '100');

-- Create enum for promo type
CREATE TYPE public.promo_type AS ENUM ('percentage', 'fixed');

-- Seminar info table
CREATE TABLE public.seminar_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre TEXT NOT NULL DEFAULT 'Maîtriser l''IA pour le Développement Web',
  description TEXT NOT NULL DEFAULT 'Formez-vous aux outils d''IA essentiels pour développer des applications web.',
  lieu TEXT NOT NULL DEFAULT 'Saint-Marc, Haïti',
  date_debut DATE NOT NULL DEFAULT '2025-03-15',
  date_fin DATE NOT NULL DEFAULT '2025-03-17',
  nombre_places_total INTEGER NOT NULL DEFAULT 100,
  organisateur TEXT NOT NULL DEFAULT 'Konekte Group',
  prix_base INTEGER NOT NULL DEFAULT 5000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Program modules table
CREATE TABLE public.program_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jour INTEGER NOT NULL,
  titre TEXT NOT NULL,
  description TEXT NOT NULL,
  ordre INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Benefits table
CREATE TABLE public.benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icon TEXT NOT NULL DEFAULT 'Award',
  titre TEXT NOT NULL,
  description TEXT NOT NULL,
  ordre INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Promo codes table
CREATE TABLE public.promo_codes (
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

-- Inscriptions table
CREATE TABLE public.inscriptions (
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

-- Footer config table
CREATE TABLE public.footer_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  copyright TEXT NOT NULL DEFAULT '© 2025 Konekte Group. Tous droits réservés.',
  email TEXT NOT NULL DEFAULT 'contact@konekte.ht',
  telephone TEXT NOT NULL DEFAULT '+509 XXXX XXXX',
  adresse TEXT NOT NULL DEFAULT 'Saint-Marc, Haïti',
  facebook TEXT,
  instagram TEXT,
  linkedin TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin users table (for admin authentication)
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.seminar_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Public read policies for landing page content
CREATE POLICY "Public can read seminar info" ON public.seminar_info FOR SELECT USING (true);
CREATE POLICY "Public can read program modules" ON public.program_modules FOR SELECT USING (true);
CREATE POLICY "Public can read benefits" ON public.benefits FOR SELECT USING (true);
CREATE POLICY "Public can read footer config" ON public.footer_config FOR SELECT USING (true);

-- Public can read active promo codes (for validation)
CREATE POLICY "Public can read active promo codes" ON public.promo_codes FOR SELECT USING (actif = true);

-- Public can insert inscriptions
CREATE POLICY "Public can insert inscriptions" ON public.inscriptions FOR INSERT WITH CHECK (true);

-- Admin role enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
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

-- Admin policies for all tables
CREATE POLICY "Admins can manage seminar info" ON public.seminar_info FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage program modules" ON public.program_modules FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage benefits" ON public.benefits FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage promo codes" ON public.promo_codes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage inscriptions" ON public.inscriptions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage footer config" ON public.footer_config FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage user roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Function to get inscription count
CREATE OR REPLACE FUNCTION public.get_inscription_count()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER FROM public.inscriptions WHERE statut != 'Annulé'
$$;

-- Function to increment promo code usage
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