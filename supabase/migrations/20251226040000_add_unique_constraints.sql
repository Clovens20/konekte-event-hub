-- Migration: Ajouter contraintes UNIQUE pour éviter les doublons
-- Date: 2025-12-26

-- Contrainte UNIQUE sur transaction_id pour éviter les inscriptions en double
-- Cette contrainte empêche la création de plusieurs inscriptions avec le même transaction_id
DO $$ 
BEGIN
  -- Vérifier si la contrainte existe déjà
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'inscriptions_transaction_id_unique' 
    AND conrelid = 'public.inscriptions'::regclass
  ) THEN
    -- Ajouter la contrainte UNIQUE sur transaction_id (seulement si transaction_id n'est pas NULL)
    -- Note: PostgreSQL ne supporte pas directement UNIQUE avec NULL, donc on utilise un index unique partiel
    CREATE UNIQUE INDEX IF NOT EXISTS inscriptions_transaction_id_unique 
    ON public.inscriptions(transaction_id) 
    WHERE transaction_id IS NOT NULL;
  END IF;
END $$;

-- Optionnel: Contrainte UNIQUE sur email si vous voulez empêcher plusieurs inscriptions par email
-- Décommentez si nécessaire (attention: un utilisateur peut vouloir s'inscrire plusieurs fois)
-- DO $$ 
-- BEGIN
--   IF NOT EXISTS (
--     SELECT 1 FROM pg_constraint 
--     WHERE conname = 'inscriptions_email_unique' 
--     AND conrelid = 'public.inscriptions'::regclass
--   ) THEN
--     ALTER TABLE public.inscriptions 
--     ADD CONSTRAINT inscriptions_email_unique UNIQUE (email);
--   END IF;
-- END $$;

COMMENT ON INDEX inscriptions_transaction_id_unique IS 'Empêche les inscriptions en double avec le même transaction_id';

