# Projet prêt pour les tests — Checklist

## Ce qui est déjà en place

- **Landing** : Hero, Programme (modules formation), Avantages, Tarifs, Footer, formulaire d’inscription (Rezève plas mwen).
- **Admin** : Connexion, Dashboard, Seminè, Pwogram, Modil Fòmasyon, Tèks Fòmilè, Avantaj, Kòd Promosyon, Enskripsyon, Pye paj, Fichye, Logo.
- **Inscription** : Formulaire → enregistrement en « En attente » → redirection Bazik → après paiement, webhook ou page retour met l’inscription en « Confirmé ».
- **Places** : Affichage « 250 plas disponib » qui diminue avec le nombre d’inscriptions (hors Annulé).
- **Migrations** : Tables (seminar_info, inscriptions, editable_files, formation_modules, site_texts, etc.) et migrations présentes dans `supabase/migrations/`.
- **Edge Functions** : `create-bazik-payment`, `bazik-webhook`, `verify-bazik-payment`, `send-email`, `payment-callback`.
- **.env** : Supabase (URL, anon key) et Bazik (API_KEY, USER_ID, etc.) configurés.

---

## À faire avant de tester

### 1. Base de données Supabase

- Appliquer **toutes les migrations** sur le projet Supabase (Dashboard → SQL Editor : exécuter les scripts dans l’ordre des dates, ou `supabase db push` si le projet est lié).
- Vérifier qu’il existe au moins une ligne dans **seminar_info** (sinon exécuter `DONNEES_INITIALES.sql` ou créer une entrée via Admin → Seminè).
- Créer un **utilisateur admin** : dans Supabase → Authentication → créer un utilisateur (email/mot de passe), puis dans la table **user_roles** ajouter une ligne `user_id = <id de l’utilisateur>`, `role = 'admin'`.

### 2. Lancer l’app en local

```bash
npm install
npm run dev
```

Puis ouvrir **http://localhost:8080**.

### 3. Tester la landing

- Page d’accueil, sections Programme, Tarifs, bouton « Rezève plas mwen ».
- Clic sur « Rezève plas mwen » → formulaire d’inscription.
- Après envoi du formulaire → redirection vers Bazik (paiement). Sans paiement réel, l’inscription reste en « En attente » ; tu peux la passer en « Confirmé » à la main en base ou attendre le webhook.

### 4. Tester l’admin

- Aller sur **http://localhost:8080/admin/login** et se connecter avec le compte admin.
- Vérifier les onglets : Tablo bò, Seminè, Fichye, Enskripsyon, etc.
- **Fichye** : nécessite que la table **editable_files** existe (migration `20251225000000_editable_files.sql`). Si la page reste blanche ou erreur, exécuter cette migration.

### 5. Paiement et confirmation automatique

- **Webhook** : dans Supabase → Edge Functions → Secrets, définir **BAZIK_WEBHOOK_SECRET** (secret fourni par Bazik). Déployer `bazik-webhook`. Dans Bazik, configurer l’URL du webhook vers `https://kphcemnaaovtnvwbvwse.supabase.co/functions/v1/bazik-webhook`.
- **Retour après paiement** : l’URL de retour (success/error) doit pointer vers ton site, ex. `http://localhost:8080/payment-callback` en dev ou `https://konekte-event-hub.vercel.app/payment-callback` en prod. Vérifier que `create-bazik-payment` utilise bien cette URL (ou l’origine de la requête).

### 6. Optionnel (emails)

- Pour les emails (accès formation, solde restant), déployer **send-email** et **payment-callback**, et définir dans les secrets : **RESEND_API_KEY**, **FROM_EMAIL**, **SYSTEME_IO_INVITE_URL**, **APP_URL**, **BAZIK_SECRET_KEY** (ou **BAZIK_API_KEY**).

---

## En résumé

- **Oui, le projet est prêt pour être testé** une fois :
  1. Les migrations appliquées sur Supabase.
  2. Un utilisateur admin créé (auth + user_roles).
  3. `npm run dev` lancé et l’app ouverte sur http://localhost:8080.

- Pour un test **complet** incluant paiement et confirmation auto : configurer le webhook Bazik (URL + secret) et l’URL de retour de paiement.
