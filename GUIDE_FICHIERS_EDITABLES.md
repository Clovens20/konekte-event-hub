# 📁 Guide de Gestion des Fichiers Éditables

Ce guide explique comment utiliser le système de gestion de fichiers depuis l'interface admin.

## 🎯 Vue d'ensemble

Le système de fichiers éditables permet de modifier et gérer tous les fichiers du projet directement depuis l'interface admin, sans avoir besoin d'accéder au code source.

## 🚀 Installation

### 1. Appliquer la migration SQL

Exécutez la migration dans Supabase :

```sql
-- Fichier: supabase/migrations/20251225000000_editable_files.sql
```

Cette migration crée :
- La table `editable_files` pour stocker les fichiers
- Les politiques RLS (Row Level Security)
- Les fonctions SQL nécessaires

### 2. Charger les données initiales (optionnel)

Exécutez le script de données initiales :

```sql
-- Fichier: DONNEES_FICHIERS_EDITABLES.sql
```

Ce script crée des exemples de fichiers modifiables.

## 📋 Types de Fichiers

Le système supporte plusieurs types de fichiers :

- **`component`** : Composants React/TypeScript
- **`config`** : Fichiers de configuration (JSON, etc.)
- **`style`** : Fichiers CSS/SCSS
- **`content`** : Contenu textuel (messages, descriptions)
- **`static`** : Fichiers statiques (images, documents)

## 🎨 Utilisation dans l'Interface Admin

### Accéder à la Gestion des Fichiers

1. Connectez-vous à l'interface admin : `/admin/login`
2. Cliquez sur **"Fichiers"** dans le menu de navigation
3. Vous verrez la liste de tous les fichiers modifiables

### Modifier un Fichier

1. **Sélectionner un fichier** : Cliquez sur un fichier dans la liste de gauche
2. **Éditer le contenu** : Le contenu s'affiche dans l'éditeur à droite
3. **Sauvegarder** : Cliquez sur le bouton "Sauvegarder"
4. **Application automatique** : Les modifications sont immédiatement disponibles

### Rechercher un Fichier

- Utilisez la barre de recherche pour trouver un fichier par nom ou chemin
- Filtrez par type (composant, config, style, etc.)
- Filtrez par catégorie (landing, admin, config, styles)

## 💻 Utilisation dans le Code

### Charger un Fichier dans un Composant

```typescript
import { useEditableFile } from '@/hooks/useEditableFiles';

const MyComponent = () => {
  const { data: heroContent, isLoading } = useEditableFile('content/hero-section');
  
  if (isLoading) return <div>Chargement...</div>;
  
  return (
    <div>
      <h1>{heroContent}</h1>
    </div>
  );
};
```

### Charger Plusieurs Fichiers par Catégorie

```typescript
import { useEditableFilesByCategory } from '@/hooks/useEditableFiles';

const BenefitsSection = () => {
  const { data: benefitsFiles } = useEditableFilesByCategory('landing');
  
  return (
    <div>
      {benefitsFiles.map(file => (
        <div key={file.file_path}>
          {file.content}
        </div>
      ))}
    </div>
  );
};
```

## 📝 Ajouter un Nouveau Fichier Éditable

### Via l'Interface Admin (à venir)

Une fonctionnalité pour créer de nouveaux fichiers sera ajoutée prochainement.

### Via SQL

```sql
INSERT INTO public.editable_files (
  file_path,
  file_name,
  file_type,
  content,
  description,
  category,
  is_active
) VALUES (
  'content/my-custom-content',
  'my-custom-content.txt',
  'content',
  'Mon contenu personnalisé',
  'Description de ce que fait ce fichier',
  'landing',
  true
);
```

## 🔧 Structure des Fichiers

### Format du `file_path`

Le `file_path` doit être unique et descriptif :

- **Contenu** : `content/hero-section`, `content/benefits`
- **Configuration** : `config/seo-metadata.json`, `config/settings.json`
- **Styles** : `styles/custom-colors.css`, `styles/animations.css`
- **Composants** : `components/custom-button.tsx` (pour référence)

### Catégories Disponibles

- **`landing`** : Fichiers pour la page d'accueil
- **`admin`** : Fichiers pour l'interface admin
- **`config`** : Fichiers de configuration
- **`styles`** : Fichiers de style

## ⚡ Application Automatique

Les modifications sont appliquées automatiquement :

1. **Sauvegarde** : Le contenu est sauvegardé dans Supabase
2. **Cache** : React Query met à jour le cache automatiquement
3. **Affichage** : Les composants utilisant `useEditableFile` se mettent à jour automatiquement

## 🔒 Sécurité

- **Lecture publique** : Tous les fichiers actifs sont lisibles publiquement
- **Écriture admin uniquement** : Seuls les administrateurs peuvent modifier les fichiers
- **Validation** : Les modifications sont validées avant sauvegarde

## 📊 Bonnes Pratiques

1. **Descriptions claires** : Ajoutez toujours une description pour chaque fichier
2. **Chemins cohérents** : Utilisez une structure de chemins logique
3. **Catégorisation** : Classez les fichiers par catégorie
4. **Backup** : Faites des sauvegardes régulières de vos fichiers
5. **Test** : Testez les modifications avant de les mettre en production

## 🐛 Dépannage

### Le fichier ne s'affiche pas

- Vérifiez que `is_active = true`
- Vérifiez que le `file_path` est correct
- Vérifiez les logs de la console

### Les modifications ne s'appliquent pas

- Videz le cache du navigateur
- Vérifiez que React Query a bien invalidé le cache
- Redémarrez le serveur de développement si nécessaire

### Erreur de permissions

- Vérifiez que vous êtes connecté en tant qu'admin
- Vérifiez les politiques RLS dans Supabase

## 🚀 Prochaines Améliorations

- [ ] Création de fichiers depuis l'interface
- [ ] Éditeur de code avec coloration syntaxique
- [ ] Prévisualisation en temps réel
- [ ] Historique des modifications
- [ ] Upload de fichiers statiques (images, documents)
- [ ] Export/Import de fichiers

## 📞 Support

Pour toute question, consultez la documentation ou contactez l'équipe de développement.

