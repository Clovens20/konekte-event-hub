# Modification de la Section Programme

## Fonctionnalité Ajoutée

Un bouton "Modifier la section" a été ajouté dans l'interface admin (`/admin/program`) pour permettre la modification du badge, du titre et de la description de la section "Programme du Séminaire" sur le site public.

## Changements Apportés

### 1. Base de Données

**Migration créée** : `supabase/migrations/20251227020000_add_program_section_fields.sql`

Ajout de 3 nouveaux champs dans la table `seminar_info` :
- `program_badge_text` : Texte du badge (ex: "Programme complet")
- `program_title` : Titre principal (ex: "Programme du Séminaire")
- `program_subtitle` : Sous-titre/Description (ex: "Trois jours intensifs...")

### 2. Interface Admin

**Fichier modifié** : `src/pages/admin/AdminProgram.tsx`

- Ajout d'un bouton "Modifier la section" avec icône Settings
- Dialog modal pour éditer les 3 champs
- Sauvegarde automatique avec feedback utilisateur
- Mise à jour immédiate du cache React Query

### 3. Site Public

**Fichier modifié** : `src/components/landing/ProgramSection.tsx`

- Utilisation des données de la base de données au lieu de valeurs codées en dur
- Fallback vers les valeurs par défaut si les champs sont vides

### 4. Types TypeScript

**Fichier modifié** : `src/lib/types.ts`

- Ajout des champs optionnels dans l'interface `SeminarInfo`

## Application de la Migration

### Option 1 : Via Supabase CLI
```bash
supabase migration up
```

### Option 2 : Via le Dashboard Supabase
1. Allez dans **SQL Editor**
2. Exécutez le contenu de `supabase/migrations/20251227020000_add_program_section_fields.sql`

## Utilisation

1. Connectez-vous à l'interface admin (`/admin/program`)
2. Cliquez sur le bouton **"Modifier la section"** (icône Settings)
3. Modifiez les 3 champs :
   - **Badge** : Texte affiché dans le badge (ex: "Programme complet")
   - **Titre principal** : Titre de la section (ex: "Programme du Séminaire")
   - **Sous-titre** : Description de la section
4. Cliquez sur **"Enregistrer"**
5. Les modifications sont visibles immédiatement sur le site public

## Valeurs par Défaut

Si les champs ne sont pas définis, les valeurs par défaut suivantes sont utilisées :
- Badge : "Programme complet"
- Titre : "Programme du Séminaire"
- Sous-titre : "Trois jours intensifs pour maîtriser les outils d'IA qui transforment le développement web"

## Notes Techniques

- Les modifications sont sauvegardées dans la table `seminar_info`
- Le cache React Query est invalidé et refetché automatiquement
- Les modifications sont visibles immédiatement sans rechargement de page
- Compatible avec le système de cache existant

