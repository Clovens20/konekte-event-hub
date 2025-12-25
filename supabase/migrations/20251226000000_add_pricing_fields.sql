-- Migration: Ajouter les champs pour la section tarification modifiable
-- Date: 2025-12-26

-- Ajouter les champs pour la section pricing dans seminar_info
ALTER TABLE public.seminar_info 
ADD COLUMN IF NOT EXISTS pricing_badge_text TEXT DEFAULT 'Tarif spécial lancement',
ADD COLUMN IF NOT EXISTS pricing_title TEXT DEFAULT 'Investissez dans votre avenir',
ADD COLUMN IF NOT EXISTS pricing_subtitle TEXT DEFAULT 'Un investissement unique pour des compétences qui vous accompagneront toute votre carrière',
ADD COLUMN IF NOT EXISTS pricing_features JSONB DEFAULT '[
  "3 jours de formation intensive",
  "Certificat officiel Konekte Group",
  "Matériel pédagogique complet",
  "Accès à la communauté exclusive",
  "3 mois de support post-formation",
  "Projets pratiques guidés"
]'::jsonb,
ADD COLUMN IF NOT EXISTS pricing_promo_notice TEXT DEFAULT 'Codes promo disponibles lors de l''inscription';

-- Mettre à jour les enregistrements existants avec les valeurs par défaut si NULL
UPDATE public.seminar_info
SET 
  pricing_badge_text = COALESCE(pricing_badge_text, 'Tarif spécial lancement'),
  pricing_title = COALESCE(pricing_title, 'Investissez dans votre avenir'),
  pricing_subtitle = COALESCE(pricing_subtitle, 'Un investissement unique pour des compétences qui vous accompagneront toute votre carrière'),
  pricing_features = COALESCE(pricing_features, '[
    "3 jours de formation intensive",
    "Certificat officiel Konekte Group",
    "Matériel pédagogique complet",
    "Accès à la communauté exclusive",
    "3 mois de support post-formation",
    "Projets pratiques guidés"
  ]'::jsonb),
  pricing_promo_notice = COALESCE(pricing_promo_notice, 'Codes promo disponibles lors de l''inscription')
WHERE pricing_badge_text IS NULL 
   OR pricing_title IS NULL 
   OR pricing_subtitle IS NULL 
   OR pricing_features IS NULL 
   OR pricing_promo_notice IS NULL;

