-- ============================================
-- DONNÉES INITIALES POUR TESTER L'APPLICATION
-- ============================================
-- Exécutez ce script après avoir créé les tables pour avoir des données de test

-- 1. Mettre à jour les informations du séminaire (si nécessaire)
-- Met à jour seulement si une ligne existe déjà
UPDATE public.seminar_info
SET 
  titre = 'Fòmasyon an kreyòl sou AI kodè',
  description = 'Aprann teknoloji IA ki ap révòlsyone kòd la — fòmasyon enligne, kontini, ak asistans pou ou pa janm bloke!',
  lieu = 'En ligne',
  date_debut = '2025-03-15',
  date_fin = '2025-03-17',
  nombre_places_total = 250,
  organisateur = 'Konekte Group',
  prix_base = 5000,
  program_badge_text = 'Pwogram konplè',
  program_title = 'Fòmasyon Anliy Kontini — Aksè 24/7 ak Asistans Pèsonalize',
  program_subtitle = 'Aprann zouti IA ki ap transfòme devlopman web ak mobil modèn nan — nan pwòp rítm ou, nenpòt ki lè.',
  updated_at = now()
WHERE id = (SELECT id FROM public.seminar_info LIMIT 1);

-- Si aucune ligne n'existe, en créer une
INSERT INTO public.seminar_info (titre, description, lieu, date_debut, date_fin, nombre_places_total, organisateur, prix_base)
SELECT 
  'Maîtriser l''IA pour le Développement Web',
  'Aprann teknoloji IA ki ap révòlsyone kòd la — fòmasyon enligne, kontini, ak asistans pou ou pa janm bloke!',
  'En ligne',
  '2025-03-15',
  '2025-03-17',
  250,
  'Konekte Group',
  5000
WHERE NOT EXISTS (SELECT 1 FROM public.seminar_info);

-- 2. Insérer des modules de programme de test (seulement si la table est vide)
INSERT INTO public.program_modules (jour, titre, description, ordre)
SELECT * FROM (VALUES 
  (1, 'Introduction à l''IA et ChatGPT', 'Découverte des concepts fondamentaux de l''IA générative et prise en main de ChatGPT pour le développement', 1),
  (1, 'Prompt Engineering', 'Techniques avancées pour créer des prompts efficaces et obtenir les meilleurs résultats', 2),
  (1, 'Intégration dans le workflow', 'Comment intégrer l''IA dans votre processus de développement quotidien', 3),
  (2, 'GitHub Copilot et Cursor', 'Maîtrise des outils d''IA pour l''édition de code et l''autocomplétion intelligente', 1),
  (2, 'Développement avec Claude', 'Utilisation de Claude AI pour la génération de code et la résolution de problèmes', 2),
  (2, 'Projet pratique', 'Mise en pratique sur un projet réel avec assistance IA', 3),
  (3, 'Optimisation et bonnes pratiques', 'Techniques pour optimiser votre utilisation de l''IA et éviter les pièges courants', 1),
  (3, 'Déploiement et CI/CD', 'Automatisation du déploiement avec l''aide de l''IA', 2),
  (3, 'Projet final et certification', 'Présentation des projets et remise des certificats', 3)
) AS v(jour, titre, description, ordre)
WHERE NOT EXISTS (
  SELECT 1 FROM public.program_modules 
  WHERE program_modules.jour = v.jour 
    AND program_modules.titre = v.titre
);

-- 3. Insérer des avantages de test (seulement si la table est vide)
INSERT INTO public.benefits (icon, titre, description, ordre)
SELECT * FROM (VALUES 
  ('BookOpen', 'Support continu', 'Accès à une communauté et ressources après le séminaire', 1),
  ('Code', 'Projets pratiques', 'Travaillez sur des projets réels avec assistance IA', 2),
  ('Zap', 'Technologies modernes', 'Découvrez les dernières innovations en développement web', 3)
) AS v(icon, titre, description, ordre)
WHERE NOT EXISTS (
  SELECT 1 FROM public.benefits 
  WHERE benefits.titre = v.titre
);

-- 4. Insérer des codes promo de test
INSERT INTO public.promo_codes (code, type, valeur, date_expiration, utilisations_max, actif)
VALUES 
  ('EARLY25', 'percentage', 25, '2025-02-15', 50, true),
  ('STUDENT15', 'percentage', 15, '2025-03-01', 30, true),
  ('GROUP500', 'fixed', 500, NULL, 20, true),
  ('VIP1000', 'fixed', 1000, '2025-02-28', 10, true)
ON CONFLICT (code) DO NOTHING;

-- 5. Mettre à jour la configuration du footer
UPDATE public.footer_config
SET 
  copyright = '© 2025 Konekte Group. Tous droits réservés.',
  email = 'contact@konekte.ht',
  telephone = '+509 3712 3456',
  adresse = 'En ligne',
  facebook = 'https://facebook.com/konektegroup',
  instagram = 'https://instagram.com/konektegroup',
  linkedin = 'https://linkedin.com/company/konektegroup',
  updated_at = now()
WHERE id = (SELECT id FROM public.footer_config LIMIT 1);

-- Si aucune ligne n'existe, en créer une
INSERT INTO public.footer_config (copyright, email, telephone, adresse, facebook, instagram, linkedin)
SELECT 
  '© 2025 Konekte Group. Tous droits réservés.',
  'contact@konekte.ht',
  '+509 3712 3456',
  'En ligne',
  'https://facebook.com/konektegroup',
  'https://instagram.com/konektegroup',
  'https://linkedin.com/company/konektegroup'
WHERE NOT EXISTS (SELECT 1 FROM public.footer_config);

-- 6. Vérification des données insérées
SELECT 'Modules de programme' as type, COUNT(*) as nombre FROM public.program_modules;
SELECT 'Avantages' as type, COUNT(*) as nombre FROM public.benefits;
SELECT 'Codes promo' as type, COUNT(*) as nombre FROM public.promo_codes;
SELECT 'Informations séminaire' as type, COUNT(*) as nombre FROM public.seminar_info;
SELECT 'Configuration footer' as type, COUNT(*) as nombre FROM public.footer_config;

-- 7. Test de la fonction validate_promo_code
SELECT 
  'Test validate_promo_code (EARLY25)' as test,
  public.validate_promo_code('EARLY25', 5000) as resultat;

-- 8. Aperçu des données insérées
SELECT '=== APERÇU DES DONNÉES ===' as info;

SELECT 'Modules de programme' as table_name, jour, titre, ordre 
FROM public.program_modules 
ORDER BY jour, ordre;

SELECT 'Avantages' as table_name, titre, ordre 
FROM public.benefits 
ORDER BY ordre;

SELECT 'Codes promo' as table_name, code, type, valeur, actif 
FROM public.promo_codes 
ORDER BY code;

