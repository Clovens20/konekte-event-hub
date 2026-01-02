-- Migration: Ajouter les champs pour la section Programme
-- Date: 2025-12-27
-- Description: Ajouter les champs pour personnaliser le badge, titre et description de la section Programme

-- Ajouter les colonnes pour la section Programme
ALTER TABLE public.seminar_info 
ADD COLUMN IF NOT EXISTS program_badge_text TEXT DEFAULT 'Programme complet',
ADD COLUMN IF NOT EXISTS program_title TEXT DEFAULT 'Programme du Séminaire',
ADD COLUMN IF NOT EXISTS program_subtitle TEXT DEFAULT 'Trois jours intensifs pour maîtriser les outils d''IA qui transforment le développement web';

-- Mettre à jour les valeurs par défaut si elles sont NULL
UPDATE public.seminar_info
SET 
  program_badge_text = COALESCE(program_badge_text, 'Programme complet'),
  program_title = COALESCE(program_title, 'Programme du Séminaire'),
  program_subtitle = COALESCE(program_subtitle, 'Trois jours intensifs pour maîtriser les outils d''IA qui transforment le développement web')
WHERE program_badge_text IS NULL OR program_title IS NULL OR program_subtitle IS NULL;

