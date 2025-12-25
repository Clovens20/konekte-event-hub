# 📋 Guide : Appliquer la Migration pour la Gestion des Logos

## 🎯 Objectif

Cette migration permet de gérer les logos (header et footer) depuis l'interface admin.

## 📝 Migration à Appliquer

Fichier : `supabase/migrations/20251226010000_add_logo_config.sql`

## 🚀 Étapes

### Option 1 : Via Supabase Dashboard (Recommandé)

1. **Connectez-vous à votre projet Supabase**
2. **Allez dans SQL Editor** dans le menu de gauche
3. **Cliquez sur New Query**
4. **Ouvrez le fichier** `supabase/migrations/20251226010000_add_logo_config.sql`
5. **Copiez tout le contenu** du fichier
6. **Collez-le dans l'éditeur SQL** de Supabase
7. **Cliquez sur Run** (ou appuyez sur `Ctrl+Enter`)

### Option 2 : Via Supabase CLI

```bash
# Dans le dossier du projet
cd konekte-event-hub

# Appliquer la migration
supabase db push
```

## ✅ Vérification

Après avoir appliqué la migration, vérifiez que la table existe :

```sql
SELECT * FROM public.logo_config;
```

Vous devriez voir 4 enregistrements par défaut :
- GGTC (header)
- GGTC (footer)
- Konekte Group (footer)
- InnovaPort (footer)

## 🎨 Nouvelle Table Créée

**`logo_config`** : Stocke la configuration des logos
- `location` : 'header' ou 'footer'
- `logo_type` : 'ggtc', 'konekte-group', 'innovaport'
- `file_path` : Chemin du fichier (ex: '/logos/ggtc-logo.jpg')
- `file_name` : Nom du fichier (ex: 'ggtc-logo.jpg')
- `display_text` : Texte à afficher (optionnel)
- `display_order` : Ordre d'affichage
- `is_active` : Actif ou non

## 📱 Utilisation dans l'Admin

Une fois la migration appliquée :

1. **Connectez-vous à l'interface admin** : `/admin`
2. **Allez dans "Logos"** : `/admin/logos`
3. **Vous verrez deux sections** :
   - **Logos du Header** : Logo GGTC
   - **Logos du Footer** : Logos GGTC, Konekte Group, InnovaPort
4. **Cliquez sur "Modifier"** pour chaque logo
5. **Entrez le nom du fichier** (ex: `ggtc-logo.jpg`)
6. **Cliquez sur "Enregistrer"**

## 📁 Fichiers Requis

Les logos doivent être placés dans `public/logos/` :
- `ggtc-logo.jpg` (ou .png, .svg)
- `konekte-group-logo.png` (ou .jpg, .svg)
- `innovaport-logo.png` (ou .jpg, .svg)

## 🔄 Mise à Jour Automatique

Les modifications sont automatiquement reflétées sur :
- **Header** : Logo GGTC
- **Footer** : Section "Organisé par" et "Financé par"

## ⚠️ Note

- Les logos doivent être placés manuellement dans `public/logos/`
- Le système charge les logos depuis `/logos/` (dossier public)
- Si un logo n'est pas trouvé, le texte de remplacement s'affiche

