-- ============================================
-- DONNÉES INITIALES POUR LES FICHIERS ÉDITABLES
-- ============================================
-- Ce script insère des exemples de fichiers modifiables dans la table editable_files
-- Exécutez ce script après avoir créé la table editable_files

-- Exemple 1: Fichier de contenu pour la section Hero
INSERT INTO public.editable_files (file_path, file_name, file_type, content, description, category, is_active)
VALUES (
  'content/hero-section',
  'hero-section.txt',
  'content',
  'Maîtrisez l''IA pour le Développement Web

Aprann teknoloji IA ki ap révòlsyone kòd la — fòmasyon enligne, kontini, ak asistans pou ou pa janm bloke!

Réserver ma place',
  'Contenu de la section Hero (titre, description, CTA)',
  'landing',
  true
)
ON CONFLICT (file_path) DO NOTHING;

-- Exemple 2: Fichier de contenu pour les avantages
INSERT INTO public.editable_files (file_path, file_name, file_type, content, description, category, is_active)
VALUES (
  'content/benefits',
  'benefits.txt',
  'content',
  'Support continu
Accès à une communauté et ressources après le séminaire

Projets pratiques
Travaillez sur des projets réels avec assistance IA

Technologies modernes
Découvrez les dernières innovations en développement web',
  'Liste des avantages du séminaire',
  'landing',
  true
)
ON CONFLICT (file_path) DO NOTHING;

-- Exemple 3: Configuration des couleurs (CSS personnalisé)
INSERT INTO public.editable_files (file_path, file_name, file_type, content, description, category, is_active)
VALUES (
  'styles/custom-colors.css',
  'custom-colors.css',
  'style',
  '/* Couleurs personnalisées pour le site */
:root {
  --primary-color: #3b82f6;
  --secondary-color: #8b5cf6;
  --accent-color: #f59e0b;
  --success-color: #10b981;
  --danger-color: #ef4444;
}

/* Personnalisation du gradient */
.gradient-primary {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
}',
  'Fichier CSS pour personnaliser les couleurs du site',
  'styles',
  true
)
ON CONFLICT (file_path) DO NOTHING;

-- Exemple 4: Configuration des métadonnées SEO
INSERT INTO public.editable_files (file_path, file_name, file_type, content, description, category, is_active)
VALUES (
  'config/seo-metadata.json',
  'seo-metadata.json',
  'config',
  '{
  "title": "Konekte Event Hub - Séminaire IA",
  "description": "Maîtrisez l''IA pour le Développement Web - Séminaire intensif de 3 jours",
  "keywords": "IA, développement web, séminaire, formation, Haïti, Konekte",
  "author": "Konekte Group",
  "ogImage": "/og-image.png"
}',
  'Métadonnées SEO pour le site',
  'config',
  true
)
ON CONFLICT (file_path) DO NOTHING;

-- Exemple 5: Messages personnalisés
INSERT INTO public.editable_files (file_path, file_name, file_type, content, description, category, is_active)
VALUES (
  'content/messages.json',
  'messages.json',
  'content',
  '{
  "welcome": "Bienvenue au séminaire Konekte",
  "registrationSuccess": "Votre inscription a été enregistrée avec succès !",
  "paymentPending": "Votre paiement est en attente de confirmation",
  "paymentSuccess": "Paiement confirmé ! Votre inscription est validée",
  "paymentError": "Une erreur est survenue lors du paiement. Veuillez réessayer."
}',
  'Messages personnalisés affichés aux utilisateurs',
  'content',
  true
)
ON CONFLICT (file_path) DO NOTHING;

-- Vérification des fichiers insérés
SELECT '--- FICHIERS ÉDITABLES CRÉÉS ---' as info;
SELECT file_path, file_name, file_type, category, is_active 
FROM public.editable_files 
ORDER BY category, file_path;

