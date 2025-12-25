-- Migration: Ajouter la configuration des logos
-- Date: 2025-12-26

-- Table pour stocker la configuration des logos
CREATE TABLE IF NOT EXISTS public.logo_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location TEXT NOT NULL, -- 'header' ou 'footer'
  logo_type TEXT NOT NULL, -- 'ggtc', 'konekte-group', 'innovaport'
  file_path TEXT, -- Chemin du fichier dans public/logos/
  file_name TEXT, -- Nom du fichier
  display_text TEXT, -- Texte à afficher (optionnel)
  display_order INTEGER DEFAULT 0, -- Ordre d'affichage
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Contrainte unique sur location + logo_type pour éviter les doublons
  UNIQUE(location, logo_type)
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_logo_config_location ON public.logo_config (location);
CREATE INDEX IF NOT EXISTS idx_logo_config_type ON public.logo_config (logo_type);

-- RLS pour logo_config
ALTER TABLE public.logo_config ENABLE ROW LEVEL SECURITY;

-- Politiques:
-- Les utilisateurs authentifiés (admin) peuvent tout faire
CREATE POLICY "Admins can manage logo config"
  ON public.logo_config FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Lecture publique pour tous
CREATE POLICY "Public can read logo config"
  ON public.logo_config FOR SELECT
  TO public
  USING (is_active = true);

-- Données initiales
INSERT INTO public.logo_config (location, logo_type, file_path, file_name, display_text, display_order, is_active)
VALUES
  ('header', 'ggtc', '/logos/ggtc-logo.jpg', 'ggtc-logo.jpg', 'GGTC', 1, true),
  ('footer', 'ggtc', '/logos/ggtc-logo.jpg', 'ggtc-logo.jpg', 'GGTC', 1, true),
  ('footer', 'konekte-group', '/logos/konekte-group-logo.png', 'konekte-group-logo.png', 'Konekte Group', 2, true),
  ('footer', 'innovaport', '/logos/innovaport-logo.png', 'innovaport-logo.png', 'InnovaPort', 3, true)
ON CONFLICT DO NOTHING;

