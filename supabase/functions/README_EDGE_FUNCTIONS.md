# Edge Functions — Variables d'environnement

## Confirmation automatique après paiement

Quand un visiteur paie (Bazik), l’inscription passe de **« En attente »** à **« Confirmé »** automatiquement, sans action dans l’admin.

- **Webhook** : si Bazik est configuré pour appeler `bazik-webhook`, la confirmation se fait dès que Bazik envoie le statut de paiement réussi.
- **Retour sur le site** : quand l’utilisateur revient sur `/payment-callback`, l’appel à `verify-bazik-payment` vérifie le paiement et met à jour l’inscription en « Confirmé » si le paiement est bien complété.

Dans Bazik, configure l’URL du webhook vers :  
`https://<PROJECT_REF>.supabase.co/functions/v1/bazik-webhook`

---

## send-email

Envoi d'emails via Resend (accès formation, solde restant).

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `RESEND_API_KEY` | Oui | Clé API Resend (https://resend.com) |
| `FROM_EMAIL` | Non | Expéditeur (défaut: noreply@konektegroup.com). Doit être un domaine vérifié dans Resend. |
| `SYSTEME_IO_INVITE_URL` | Non | URL d'invitation Systeme.io pour l'accès à la formation. Si vide, le lien dans l'email sera vide. |

## payment-callback

Webhook appelé par Bazik après un paiement. Met à jour les inscriptions, envoie les emails (via send-email) et crée le lien de paiement du solde en cas de paiement partiel.

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `SUPABASE_URL` | Oui (auto) | Fourni par Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Oui (auto) | Fourni par Supabase |
| `BAZIK_SECRET_KEY` ou `BAZIK_API_KEY` | Oui | Clé API Bazik pour créer le lien de paiement du solde (API v1/payments) |
| `APP_URL` | Non | URL du site (défaut: https://konektegroup.com). Utilisée pour callback_url et liens dans les emails. |

**Note :** Configure dans le tableau de bord Bazik l’URL du webhook vers cette Edge Function, par ex.  
`https://<PROJECT_REF>.supabase.co/functions/v1/payment-callback`

## Déploiement des secrets

```bash
# Exemple
supabase secrets set RESEND_API_KEY=re_xxxx
supabase secrets set FROM_EMAIL=noreply@votredomaine.com
supabase secrets set SYSTEME_IO_INVITE_URL=https://app.systeme.io/...
supabase secrets set BAZIK_SECRET_KEY=votre_cle_bazik
supabase secrets set APP_URL=https://votresite.com
```

Puis déployer les fonctions :

```bash
supabase functions deploy send-email
supabase functions deploy payment-callback
```
