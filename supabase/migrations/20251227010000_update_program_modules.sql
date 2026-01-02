-- Migration: Mise à jour du programme du séminaire
-- Date: 2025-12-27
-- Description: Remplacement du programme actuel par la version formalisée et professionnelle

-- Désactiver temporairement RLS pour permettre la migration
ALTER TABLE public.program_modules DISABLE ROW LEVEL SECURITY;

-- Supprimer tous les anciens modules pour repartir à zéro
DELETE FROM public.program_modules;

-- Insérer les nouveaux modules du programme
-- Jour 1 : Fondamentaux et Outils IA Gratuits
INSERT INTO public.program_modules (jour, titre, description, ordre)
VALUES (
  1,
  'Fondamentaux et Outils IA Gratuits',
  'Introduction aux outils d''intelligence artificielle pour le développement

Concepts de base
• Qu''est-ce qu''un prompt ?
• Stratégies pour créer des prompts efficaces

Découverte des outils IA gratuits
• Copilot
• Claude AI
• ChatGPT

Plateformes de développement no-code/low-code
• Présentation de Lovable
• Présentation d''Antigravity
• Présentation d''Emergent',
  1
);

-- Jour 2 : Intégration et Workflow de Développement
INSERT INTO public.program_modules (jour, titre, description, ordre)
VALUES (
  2,
  'Intégration et Workflow de Développement',
  'De la génération à l''édition : maîtriser la chaîne de développement

Outils de développement essentiels
• Supabase : backend et base de données
• GitHub : gestion de version et collaboration
• Cursor : éditeur de code assisté par IA

Workflow d''intégration
• Exporter un projet depuis Lovable, Emergent ou Antigravity
• Transférer le projet vers GitHub
• Importer et éditer le projet dans Cursor
• Bonnes pratiques d''intégration continue',
  2
);

-- Jour 3 : Projet Pratique en Direct
INSERT INTO public.program_modules (jour, titre, description, ordre)
VALUES (
  3,
  'Projet Pratique en Direct',
  'Mise en application : développement collaboratif d''un projet réel

Sélection du projet
• Choix collaboratif du projet à développer
• Définition des objectifs et fonctionnalités

Développement en direct
• Développement collaboratif avec assistance IA
• Résolution de problèmes en temps réel
• Déploiement et tests

Certification
• Présentation des réalisations
• Remise des certificats de participation',
  3
);

-- Réactiver RLS après la migration
ALTER TABLE public.program_modules ENABLE ROW LEVEL SECURITY;

-- Vérification : Afficher les modules insérés
SELECT 
  'Module inséré' as status,
  jour,
  titre,
  ordre,
  LENGTH(description) as description_length
FROM public.program_modules
ORDER BY jour, ordre;

