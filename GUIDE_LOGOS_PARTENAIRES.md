# 🖼️ Guide d'Ajout des Logos des Partenaires

Ce guide explique comment ajouter les logos de Konekte Group et InnovaPort dans le footer.

## 📁 Emplacement des Logos

Les logos doivent être placés dans le dossier :
```
public/logos/
```

## 📝 Fichiers Requis

Placez les logos avec ces noms exacts :

1. **`konekte-group-logo.png`** (ou `.jpg`, `.svg`, `.webp`)
   - Logo de Konekte Group
   - Format recommandé : PNG avec fond transparent ou SVG
   - Taille recommandée : 200x60px (ou proportionnel)

2. **`innovaport-logo.png`** (ou `.jpg`, `.svg`, `.webp`)
   - Logo d'InnovaPort
   - Format recommandé : PNG avec fond transparent ou SVG
   - Taille recommandée : 200x60px (ou proportionnel)

## 🎨 Formats Supportés

- **PNG** (recommandé avec fond transparent)
- **SVG** (recommandé pour la qualité et la scalabilité)
- **JPG/JPEG**
- **WebP**

## 📐 Tailles Recommandées

- **Hauteur** : 60-80px (sera redimensionné automatiquement)
- **Largeur** : Proportionnelle (max 200px)
- **Format** : Fond transparent de préférence

## ✅ Instructions

1. **Préparez vos logos** :
   - Assurez-vous que les logos sont de bonne qualité
   - Si possible, utilisez des versions avec fond transparent (PNG/SVG)

2. **Placez les fichiers** :
   - Copiez `konekte-group-logo.png` dans `public/logos/`
   - Copiez `innovaport-logo.png` dans `public/logos/`

3. **Vérifiez les noms** :
   - Les noms doivent être exactement :
     - `konekte-group-logo.png` (ou .jpg, .svg)
     - `innovaport-logo.png` (ou .jpg, .svg)

4. **Testez l'affichage** :
   - Redémarrez le serveur de développement : `npm run dev`
   - Vérifiez le footer de la page d'accueil
   - Les logos devraient apparaître sous "Financé par"

## 🎨 Affichage

Les logos seront affichés :
- **Section** : Footer (en bas de la page)
- **Position** : Sous "Financé par"
- **Style** : Inversés en blanc (pour s'adapter au fond sombre du footer)
- **Taille** : Responsive (s'adapte à la taille de l'écran)

## 🔄 Si les Logos n'Apparaissent Pas

Si les logos ne s'affichent pas :

1. **Vérifiez les noms de fichiers** : Ils doivent être exactement comme indiqué
2. **Vérifiez l'emplacement** : `public/logos/` (pas `src/` ou ailleurs)
3. **Vérifiez les extensions** : `.png`, `.jpg`, `.svg`, ou `.webp`
4. **Videz le cache** : `Ctrl+Shift+R` (Windows/Linux) ou `Cmd+Shift+R` (Mac)
5. **Redémarrez le serveur** : Arrêtez et relancez `npm run dev`

## 📱 Responsive

Les logos s'adaptent automatiquement :
- **Mobile** : Hauteur de 48px (h-12)
- **Desktop** : Hauteur de 64px (h-16)
- **Largeur** : Maximum 200px, proportionnelle

## 🎯 Résultat Attendu

Dans le footer, vous verrez :

```
┌─────────────────────────────────┐
│     Organisé par                │
│         GGTC                     │
│                                 │
│     Financé par                 │
│  [Logo Konekte]  [Logo Innova] │
└─────────────────────────────────┘
```

## 🔧 Personnalisation

Si vous souhaitez modifier l'affichage, éditez le fichier :
`src/components/landing/Footer.tsx`

Les logos sont dans la section "Organisateurs et Partenaires".

