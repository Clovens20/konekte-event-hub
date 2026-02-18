-- Colonnes pour paiement partiel + envoi d'emails (accès formation / solde restant)
-- montant_total: total à payer (dérivable de montant_paye + pourcentage_paye, mais stocké pour cohérence)
-- remaining_transaction_id: transaction Bazik pour le solde restant (paiement partiel)

ALTER TABLE public.inscriptions
  ADD COLUMN IF NOT EXISTS montant_total INTEGER,
  ADD COLUMN IF NOT EXISTS remaining_transaction_id TEXT;

COMMENT ON COLUMN public.inscriptions.montant_total IS 'Montant total à payer (HTG). Rempli au premier paiement ou à l''inscription.';
COMMENT ON COLUMN public.inscriptions.remaining_transaction_id IS 'transaction_id du lien de paiement pour le solde restant (paiement partiel 25% ou 50%).';

-- Remplir montant_total pour les lignes existantes: montant_paye / (pourcentage_paye/100)
UPDATE public.inscriptions
SET montant_total = CASE
  WHEN pourcentage_paye = '25' THEN montant_paye * 4
  WHEN pourcentage_paye = '50' THEN montant_paye * 2
  WHEN pourcentage_paye = '100' THEN montant_paye
  ELSE montant_paye
END
WHERE montant_total IS NULL AND montant_paye IS NOT NULL;
