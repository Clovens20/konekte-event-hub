# 📋 Instructions pour Ajouter les Logos

## ⚠️ IMPORTANT : Les logos doivent être placés dans ce dossier

Pour que les logos s'affichent, vous devez placer les fichiers dans :
```
public/logos/
```

## 📁 Fichiers Requis

Placez les logos avec ces noms **EXACTS** :

1. **`konekte-group-logo.png`** (ou `.jpg`, `.jpeg`, `.svg`, `.webp`)
   - Nom du fichier : `konekte-group-logo` + extension
   - Exemples valides :
     - `konekte-group-logo.png` ✅
     - `konekte-group-logo.jpg` ✅
     - `konekte-group-logo.svg` ✅

2. **`innovaport-logo.png`** (ou `.jpg`, `.jpeg`, `.svg`, `.webp`)
   - Nom du fichier : `innovaport-logo` + extension
   - Exemples valides :
     - `innovaport-logo.png` ✅
     - `innovaport-logo.jpg` ✅
     - `innovaport-logo.svg` ✅

## ✅ Étapes

1. **Téléchargez ou préparez vos logos**
   - Format recommandé : PNG avec fond transparent
   - Taille : 200x60px ou similaire

2. **Renommez les fichiers** :
   - Logo Konekte Group → `konekte-group-logo.png`
   - Logo InnovaPort → `innovaport-logo.png`

3. **Copiez dans le dossier** :
   ```
   public/logos/konekte-group-logo.png
   public/logos/innovaport-logo.png
   ```

4. **Redémarrez le serveur** :
   ```bash
   npm run dev
   ```

5. **Videz le cache du navigateur** :
   - Windows/Linux : `Ctrl + Shift + R`
   - Mac : `Cmd + Shift + R`

## 🔍 Vérification

Après avoir ajouté les logos, vérifiez que les fichiers existent :

```bash
# Dans le terminal, depuis la racine du projet
dir public\logos
```

Vous devriez voir :
- `konekte-group-logo.png` (ou autre extension)
- `innovaport-logo.png` (ou autre extension)
- `README.md`
- `INSTRUCTIONS.md`

## 🎨 Formats Supportés

- PNG (recommandé)
- JPG/JPEG
- SVG (recommandé pour la qualité)
- WebP

## ⚠️ Problèmes Courants

### Les logos ne s'affichent pas ?

1. **Vérifiez les noms** : Ils doivent être EXACTEMENT `konekte-group-logo` et `innovaport-logo`
2. **Vérifiez l'emplacement** : `public/logos/` (pas `src/` ou ailleurs)
3. **Vérifiez les extensions** : `.png`, `.jpg`, `.svg`, etc.
4. **Redémarrez le serveur** : `npm run dev`
5. **Videz le cache** : `Ctrl+Shift+R` ou `Cmd+Shift+R`

### Les logos s'affichent en texte ?

Cela signifie que les fichiers n'ont pas été trouvés. Vérifiez les points ci-dessus.

## 📝 Note

Le système essaie automatiquement plusieurs formats :
- `.png`
- `.jpg`
- `.jpeg`
- `.svg`
- `.webp`

Donc vous pouvez utiliser n'importe lequel de ces formats, tant que le nom de base est correct.

