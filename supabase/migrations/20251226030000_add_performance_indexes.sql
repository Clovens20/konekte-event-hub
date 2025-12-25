-- Migration: Ajouter les indexes de performance pour gérer 100+ utilisateurs simultanés
-- Date: 2025-12-26

-- Indexes pour la table inscriptions (recherches fréquentes)
CREATE INDEX IF NOT EXISTS idx_inscriptions_email ON public.inscriptions(email);
CREATE INDEX IF NOT EXISTS idx_inscriptions_transaction_id ON public.inscriptions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_inscriptions_statut ON public.inscriptions(statut);
CREATE INDEX IF NOT EXISTS idx_inscriptions_created_at ON public.inscriptions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inscriptions_code_promo ON public.inscriptions(code_promo) WHERE code_promo IS NOT NULL;

-- Index composite pour les requêtes admin fréquentes
CREATE INDEX IF NOT EXISTS idx_inscriptions_statut_created_at ON public.inscriptions(statut, created_at DESC);

-- Index pour promo_codes (déjà indexé via UNIQUE, mais ajouter un index sur actif pour les requêtes filtrées)
CREATE INDEX IF NOT EXISTS idx_promo_codes_actif ON public.promo_codes(actif) WHERE actif = true;

-- Index pour seminar_info (recherches fréquentes)
CREATE INDEX IF NOT EXISTS idx_seminar_info_updated_at ON public.seminar_info(updated_at DESC);

-- Index pour program_modules (tri par jour et ordre)
CREATE INDEX IF NOT EXISTS idx_program_modules_jour_ordre ON public.program_modules(jour, ordre);

-- Index pour benefits (tri par ordre)
CREATE INDEX IF NOT EXISTS idx_benefits_ordre ON public.benefits(ordre);

-- Commentaires pour documentation
COMMENT ON INDEX idx_inscriptions_email IS 'Index pour recherche rapide par email (admin, vérification doublons)';
COMMENT ON INDEX idx_inscriptions_transaction_id IS 'Index pour vérification rapide des transactions de paiement';
COMMENT ON INDEX idx_inscriptions_statut IS 'Index pour filtrage par statut dans l''interface admin';
COMMENT ON INDEX idx_inscriptions_created_at IS 'Index pour tri chronologique (DESC) des inscriptions';
COMMENT ON INDEX idx_inscriptions_statut_created_at IS 'Index composite pour requêtes admin fréquentes (statut + date)';

