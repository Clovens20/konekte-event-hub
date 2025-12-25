# 📋 Guide : Appliquer la Migration pour la Section Tarification

## 🎯 Objectif

Cette migration permet de rendre la section tarification modifiable depuis l'interface admin.

## 📝 Migration à Appliquer

Fichier : `supabase/migrations/20251226000000_add_pricing_fields.sql`

## 🚀 Étapes

### Option 1 : Via Supabase Dashboard (Recommandé)

1. **Connectez-vous à votre projet Supabase**
2. **Allez dans SQL Editor** dans le menu de gauche
3. **Cliquez sur New Query**
4. **Ouvrez le fichier** `supabase/migrations/20251226000000_add_pricing_fields.sql`
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

Après avoir appliqué la migration, vérifiez que les nouveaux champs existent :

```sql
SELECT 
  pricing_badge_text,
  pricing_title,
  pricing_subtitle,
  pricing_features,
  pricing_promo_notice
FROM public.seminar_info;
```

Vous devriez voir les valeurs par défaut pour chaque champ.

## 🎨 Nouveaux Champs Ajoutés

1. **`pricing_badge_text`** : Texte du badge (ex: "Tarif spécial lancement")
2. **`pricing_title`** : Titre principal de la section
3. **`pricing_subtitle`** : Sous-titre descriptif
4. **`pricing_features`** : Liste des avantages (format JSON)
5. **`pricing_promo_notice`** : Notice pour les codes promo

## 📱 Utilisation dans l'Admin

Une fois la migration appliquée :

1. **Connectez-vous à l'interface admin** : `/admin`
2. **Allez dans "Séminaire"** : `/admin/seminar`
3. **Faites défiler jusqu'à "Section Tarification"**
4. **Modifiez les champs** :
   - Badge
   - Titre principal
   - Sous-titre
   - Avantages inclus (une par ligne)
   - Notice codes promo
5. **Cliquez sur "Enregistrer les modifications"**

## 🔄 Mise à Jour Automatique

Les modifications sont automatiquement reflétées sur la page d'accueil dans la section tarification.

## ⚠️ Note

Si vous avez déjà des données dans `seminar_info`, la migration ajoutera les valeurs par défaut pour les nouveaux champs.

