# Mise à Jour du Programme du Séminaire

## Nouveau Programme

Le programme du séminaire a été mis à jour avec une version formalisée et professionnelle.

### Structure

Le programme est organisé en **3 jours** avec un module par jour :

1. **Jour 1 : Fondamentaux et Outils IA Gratuits**
   - Introduction aux outils d'IA
   - Concepts de base (prompts, stratégies)
   - Outils IA gratuits (Copilot, Claude AI, ChatGPT)
   - Plateformes no-code/low-code (Lovable, Antigravity, Emergent)

2. **Jour 2 : Intégration et Workflow de Développement**
   - Outils essentiels (Supabase, GitHub, Cursor)
   - Workflow d'intégration complet
   - Bonnes pratiques

3. **Jour 3 : Projet Pratique en Direct**
   - Sélection collaborative du projet
   - Développement en direct avec IA
   - Certification

## Application de la Migration

### Option 1 : Via Supabase CLI

```bash
supabase migration up
```

### Option 2 : Via le Dashboard Supabase

1. Allez dans **SQL Editor** dans le dashboard Supabase
2. Exécutez le contenu du fichier :
   ```
   supabase/migrations/20251227010000_update_program_modules.sql
   ```

## Résultat

Après l'exécution de la migration :
- ✅ Les anciens modules sont supprimés
- ✅ Les 3 nouveaux modules sont insérés
- ✅ Le programme est visible immédiatement sur le site public
- ✅ Le programme est modifiable via l'interface admin

## Vérification

Pour vérifier que la migration a bien fonctionné :

```sql
SELECT jour, titre, ordre 
FROM public.program_modules 
ORDER BY jour, ordre;
```

Vous devriez voir 3 modules :
- Jour 1 : Fondamentaux et Outils IA Gratuits
- Jour 2 : Intégration et Workflow de Développement
- Jour 3 : Projet Pratique en Direct

## Modification via l'Interface Admin

Vous pouvez également modifier le programme via l'interface admin :
1. Connectez-vous à `/admin/program`
2. Supprimez les anciens modules
3. Créez les 3 nouveaux modules avec le contenu fourni

## Notes

- Les modules sont affichés dans l'ordre défini par le champ `ordre`
- Chaque module peut être modifié individuellement via l'interface admin
- Les modifications sont visibles immédiatement sur le site public

