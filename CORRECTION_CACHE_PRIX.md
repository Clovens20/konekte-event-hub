# Correction : Prix du séminaire non mis à jour sur le site public

## Problème Identifié

Lors de la modification du prix du séminaire dans l'interface admin, la modification ne se reflétait pas immédiatement sur le site public.

## Cause du Problème

Le problème venait de la configuration du cache React Query :

1. **Invalidation insuffisante** : `invalidateQueries` marque les données comme "stale" mais ne force pas toujours un refetch immédiat, surtout avec `refetchOnMount: false` configuré globalement dans `App.tsx`.

2. **Cache trop long** : Le `staleTime` global de 5 minutes empêchait le refetch même après invalidation.

3. **Refetch non forcé** : Même après invalidation, les composants du site public ne refetchaient pas les données car `refetchOnMount: false` était configuré globalement.

## Solutions Appliquées

### ✅ 1. Forcer le refetch après modification (`AdminSeminar.tsx`)

**Avant** :
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['seminar-info'] });
  // ...
}
```

**Après** :
```typescript
onSuccess: () => {
  // Invalider et forcer le refetch immédiat de toutes les queries liées
  queryClient.invalidateQueries({ queryKey: ['seminar-info'] });
  // Forcer le refetch immédiat des queries actives
  queryClient.refetchQueries({ queryKey: ['seminar-info'], type: 'active' });
  // ...
}
```

**Bénéfice** : Force le refetch immédiat de toutes les queries actives qui utilisent `['seminar-info']`, garantissant que les modifications sont visibles instantanément.

### ✅ 2. Configuration optimisée du hook `useSeminarInfo` (`useSeminarData.ts`)

**Avant** :
```typescript
export const useSeminarInfo = () => {
  return useQuery({
    queryKey: ['seminar-info'],
    queryFn: async () => { /* ... */ },
    // Pas de configuration spécifique - utilise les valeurs par défaut
  });
};
```

**Après** :
```typescript
export const useSeminarInfo = () => {
  return useQuery({
    queryKey: ['seminar-info'],
    queryFn: async () => { /* ... */ },
    staleTime: 30 * 1000, // 30 secondes - cache court pour voir les modifications rapidement
    refetchOnMount: true, // Refetch si les données sont stale
  });
};
```

**Bénéfices** :
- Cache de 30 secondes : assez court pour voir les modifications rapidement, assez long pour éviter trop de requêtes
- `refetchOnMount: true` : vérifie si les données sont à jour à chaque montage du composant (surcharge la config globale)

## Résultat

Maintenant, lorsque vous modifiez le prix (ou toute autre information) du séminaire dans l'interface admin :

1. ✅ La mutation invalide le cache
2. ✅ Le refetch est forcé immédiatement pour toutes les queries actives
3. ✅ Le site public affiche les nouvelles données dans les 30 secondes suivantes (ou immédiatement si la page est rechargée)

## Test

Pour tester la correction :

1. Ouvrez le site public dans un onglet
2. Notez le prix actuel affiché
3. Modifiez le prix dans l'interface admin
4. Rechargez la page publique (ou attendez 30 secondes)
5. Le nouveau prix devrait être visible immédiatement

## Notes Techniques

- `invalidateQueries` : Marque les données comme "stale" mais ne refetch pas toujours
- `refetchQueries` : Force le refetch immédiat des queries spécifiées
- `type: 'active'` : Ne refetch que les queries actuellement utilisées par des composants montés
- `staleTime: 30 * 1000` : Les données sont considérées comme "fraîches" pendant 30 secondes
- `refetchOnMount: true` : Surcharge la config globale pour ce hook spécifique

