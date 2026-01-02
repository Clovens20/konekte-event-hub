-- Migration: Ajouter index pour optimiser la vérification des rôles admin
-- Date: 2025-12-27
-- Problème: La fonction has_role() était lente car elle cherchait dans user_roles sans index optimisé
-- Solution: Ajouter un index composite sur (user_id, role) pour accélérer les requêtes

-- Index composite pour accélérer la fonction has_role()
-- Cette requête est appelée à chaque chargement de page admin
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role ON public.user_roles(user_id, role);

-- Index sur user_id seul (pour les requêtes qui filtrent uniquement par user_id)
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- Commentaire pour documentation
COMMENT ON INDEX idx_user_roles_user_id_role IS 'Index composite pour optimiser has_role() - appelé fréquemment lors de l''accès admin';
COMMENT ON INDEX idx_user_roles_user_id IS 'Index pour les requêtes filtrant par user_id uniquement';

