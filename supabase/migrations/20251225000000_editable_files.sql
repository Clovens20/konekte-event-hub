-- ============================================
-- MIGRATION : TABLE POUR FICHIERS ÉDITABLES
-- ============================================
-- Cette table permet de stocker les fichiers modifiables depuis l'interface admin

-- Table: Fichiers éditable
CREATE TABLE IF NOT EXISTS public.editable_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path TEXT NOT NULL UNIQUE, -- Chemin du fichier (ex: "src/components/landing/HeroSection.tsx")
  file_name TEXT NOT NULL, -- Nom du fichier (ex: "HeroSection.tsx")
  file_type TEXT NOT NULL, -- Type: 'component', 'config', 'style', 'content', 'static'
  content TEXT NOT NULL, -- Contenu du fichier
  description TEXT, -- Description de ce que fait ce fichier
  category TEXT, -- Catégorie: 'landing', 'admin', 'config', 'styles', etc.
  is_active BOOLEAN NOT NULL DEFAULT true, -- Si le fichier est actif
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_editable_files_path ON public.editable_files(file_path);
CREATE INDEX IF NOT EXISTS idx_editable_files_type ON public.editable_files(file_type);
CREATE INDEX IF NOT EXISTS idx_editable_files_category ON public.editable_files(category);

-- RLS Policies
ALTER TABLE public.editable_files ENABLE ROW LEVEL SECURITY;

-- Policy: Lecture publique (pour l'application)
CREATE POLICY "Public read access" ON public.editable_files
  FOR SELECT
  USING (true);

-- Policy: Seuls les admins peuvent modifier
CREATE POLICY "Admin write access" ON public.editable_files
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_editable_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_editable_files_updated_at
  BEFORE UPDATE ON public.editable_files
  FOR EACH ROW
  EXECUTE FUNCTION update_editable_files_updated_at();

-- Fonction pour obtenir le contenu d'un fichier
CREATE OR REPLACE FUNCTION get_file_content(file_path_param TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  file_content TEXT;
BEGIN
  SELECT content INTO file_content
  FROM public.editable_files
  WHERE file_path = file_path_param
    AND is_active = true;
  
  RETURN COALESCE(file_content, '');
END;
$$;

