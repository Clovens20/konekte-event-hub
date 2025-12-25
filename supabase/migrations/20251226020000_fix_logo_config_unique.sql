-- Migration de correction: Corriger la contrainte unique sur logo_config
-- Date: 2025-12-26

-- Supprimer l'ancienne contrainte unique sur location seule (si elle existe)
DO $$ 
BEGIN
  -- Vérifier si la contrainte existe et la supprimer
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'logo_config_location_key' 
    AND conrelid = 'public.logo_config'::regclass
  ) THEN
    ALTER TABLE public.logo_config DROP CONSTRAINT logo_config_location_key;
  END IF;
END $$;

-- Ajouter la contrainte unique sur (location, logo_type) si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'logo_config_location_logo_type_key' 
    AND conrelid = 'public.logo_config'::regclass
  ) THEN
    ALTER TABLE public.logo_config 
    ADD CONSTRAINT logo_config_location_logo_type_key UNIQUE (location, logo_type);
  END IF;
END $$;

