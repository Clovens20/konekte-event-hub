# 🚀 Guide de Déploiement sur Vercel

Ce guide vous explique comment déployer votre application sur Vercel.

## 📋 Prérequis

1. Compte Vercel (gratuit) : https://vercel.com/signup
2. Projet Git connecté à GitHub
3. Variables d'environnement configurées

## 🔧 Méthode 1 : Déploiement via l'interface Vercel (Recommandé)

### Étape 1 : Connecter votre projet

1. Allez sur https://vercel.com/new
2. Cliquez sur "Import Git Repository"
3. Sélectionnez votre dépôt GitHub : `konekte20/konekte-event-hub`
4. Cliquez sur "Import"

### Étape 2 : Configuration du projet

Vercel détectera automatiquement :
- **Framework Preset** : Vite
- **Build Command** : `npm run build`
- **Output Directory** : `dist`
- **Install Command** : `npm install`

Vous pouvez laisser les valeurs par défaut ou les modifier si nécessaire.

### Étape 3 : Configurer les variables d'environnement

Dans la section "Environment Variables", ajoutez :

```
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=votre_cle_publique_supabase
```

⚠️ **Important** : Ne mettez PAS les secrets Supabase Edge Functions ici (ils sont gérés dans Supabase).

### Étape 4 : Déployer

1. Cliquez sur "Deploy"
2. Attendez que le build se termine (environ 1-2 minutes)
3. Votre application sera disponible à l'URL : `https://votre-projet.vercel.app`

## 🔧 Méthode 2 : Déploiement via CLI Vercel

### Étape 1 : Installer Vercel CLI

```bash
npm install -g vercel
```

### Étape 2 : Se connecter

```bash
vercel login
```

### Étape 3 : Déployer

```bash
# Premier déploiement (développement)
vercel

# Déploiement en production
vercel --prod
```

### Étape 4 : Configurer les variables d'environnement

```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
```

## 🔄 Configuration automatique après déploiement

### Mettre à jour l'URL de callback Bazik.io

Après le déploiement, mettez à jour dans Supabase Dashboard > Edge Functions > Secrets :

```
BAZIK_CALLBACK_URL=https://votre-projet.vercel.app/payment-callback
```

### Mettre à jour l'URL de webhook Bazik.io

Dans votre compte Bazik.io, configurez :

```
https://votre-projet.supabase.co/functions/v1/bazik-webhook
```

## 📝 Variables d'environnement requises

### Variables côté client (Vercel)

Ces variables doivent être préfixées par `VITE_` pour être accessibles dans le navigateur :

```
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=votre_cle_publique
```

### Variables côté serveur (Supabase Edge Functions)

Ces variables sont configurées dans Supabase Dashboard > Edge Functions > Secrets :

```
BAZIK_API_KEY=votre_cle_api_bazik
BAZIK_USER_ID=bzk_9e8e5a7e_1766258015
BAZIK_BASE_URL=https://api.bazik.io
BAZIK_CALLBACK_URL=https://votre-projet.vercel.app/payment-callback
BAZIK_WEBHOOK_SECRET=whsec_05793fb8eef583126368a3dc67961039
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
```

## 🔍 Vérification après déploiement

1. **Vérifier que l'application se charge** : `https://votre-projet.vercel.app`
2. **Vérifier les variables d'environnement** : Vercel Dashboard > Settings > Environment Variables
3. **Tester le formulaire d'inscription**
4. **Tester le flux de paiement Bazik.io**
5. **Vérifier les logs** : Vercel Dashboard > Deployments > [votre déploiement] > Functions Logs

## 🐛 Dépannage

### Erreur : "Environment variable not found"

- Vérifiez que les variables sont bien configurées dans Vercel Dashboard
- Vérifiez que les variables commencent par `VITE_` pour être accessibles côté client
- Redéployez après avoir ajouté/modifié des variables

### Erreur : "Build failed"

- Vérifiez les logs de build dans Vercel Dashboard
- Vérifiez que `npm run build` fonctionne en local
- Vérifiez que toutes les dépendances sont dans `package.json`

### L'application ne se charge pas

- Vérifiez que le build s'est terminé avec succès
- Vérifiez les logs de runtime dans Vercel Dashboard
- Vérifiez que les variables d'environnement sont correctes

### Les routes ne fonctionnent pas (404)

- Vercel devrait automatiquement rediriger toutes les routes vers `index.html` grâce à `vercel.json`
- Si le problème persiste, vérifiez la configuration dans `vercel.json`

## 🔄 Déploiements automatiques

Vercel déploie automatiquement :
- **Chaque push sur `main`** → Déploiement en production
- **Chaque pull request** → Déploiement de prévisualisation

Vous pouvez désactiver cela dans Vercel Dashboard > Settings > Git.

## 📚 Documentation Vercel

- Documentation Vercel : https://vercel.com/docs
- Guide Vite sur Vercel : https://vercel.com/guides/deploying-vite-with-vercel

## ✅ Checklist de déploiement

- [ ] Compte Vercel créé
- [ ] Projet connecté à GitHub
- [ ] Variables d'environnement configurées dans Vercel
- [ ] Build réussi
- [ ] Application accessible
- [ ] URL de callback Bazik.io mise à jour
- [ ] URL de webhook Bazik.io configurée
- [ ] Test du formulaire d'inscription
- [ ] Test du flux de paiement

