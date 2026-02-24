# Documentation Technique - Application de Gestion des Candidatures

## Architecture des Composants

### Vue d'ensemble
L'application suit une architecture modulaire basée sur Vue 3 avec une séparation claire des responsabilités :

```
src/
├── components/
│   ├── ui/                    # Composants réutilisables (shadcn/ui)
│   ├── CandidatureList.vue    # Liste principale avec filtres
│   └── CandidatureDetail.vue  # Vue détaillée d'une candidature
├── stores/
│   ├── candidature.ts         # État des filtres (Pinia)
│   └── theme.ts              # Gestion du thème
├── lib/
│   ├── api.ts                # Couche d'API (TanStack Query)
│   └── utils.ts              # Utilitaires (cn function)
├── router/
│   └── index.ts              # Configuration des routes
└── types.ts                  # Définitions TypeScript
```

### Hiérarchie des Composants

```
App.vue
├── RouterView
    ├── CandidatureList (/)
    │   ├── ThemeToggle
    │   ├── Card (Filtres)
    │   │   ├── Input (recherche)
    │   │   ├── Select (statut)
    │   │   └── Select (poste)
    │   ├── Table/Card List (résultats)
    │   └── Button (chargement)
    └── CandidatureDetail (/candidatures/:id)
        ├── Button (retour)
        ├── Card (informations)
        ├── Card (édition)
        └── Card (commentaires)
```

### Responsabilités

- **CandidatureList**: Gestion de la liste, filtres, recherche, pagination infinie
- **CandidatureDetail**: Affichage détaillé, édition du statut, ajout de commentaires
- **Composants UI**: Composants réutilisables pour cohérence visuelle

## Stratégie de Communication avec l'API REST

### Architecture API
L'application communique avec une API REST hébergée sur Render (`https://gestion-des-candidatures-be.onrender.com`) utilisant JSON Server.

### Gestion d'État avec TanStack Vue Query

#### Queries (Lecture)
```typescript
// Query infinie pour la pagination
const { data, fetchNextPage, hasNextPage } = useCandidatures(activeFilters)

// Query simple pour les détails
const { data: candidature } = useCandidature(id)

// Queries pour les données de référence
const { data: statuts } = useStatuts()
const { data: postes } = usePostes()
```

#### Mutations (Écriture)
```typescript
// Mutation pour les mises à jour
const updateMutation = useUpdateCandidature()

await updateMutation.mutateAsync({
  id: candidatureId,
  data: { statut: newStatut, commentaires: newComments }
})
```

### Stratégie de Cache
- **Stale Time**: 5 minutes pour les candidatures, 10 minutes pour les données statiques
- **Invalidation**: Après mutation, invalidation sélective des queries
- **Optimistic Updates**: Mises à jour locales immédiates avec rollback en cas d'erreur

### Gestion des Erreurs
- Gestion centralisée des erreurs HTTP
- États de chargement et d'erreur dans l'UI
- Boutons de retry pour les échecs temporaires

## Gestion de l'État et Synchronisation avec JSON Server

### Double Gestion d'État

#### 1. État UI (Pinia)
```typescript
// Store pour les filtres utilisateur
const useCandidatureStore = defineStore("candidature", () => {
  const filters = ref<CandidatureFilters>({ ...DEFAULT_FILTERS })
  const searchQuery = ref("")

  // Actions synchrones pour l'UI
  const setFilters = (newFilters) => { /* ... */ }
  const setSearchQuery = (query) => { /* ... */ }
})
```

#### 2. État Serveur (TanStack Query)
```typescript
// Cache intelligent des données API
const { data, isPending, error } = useQuery({
  queryKey: ["candidatures", filters],
  queryFn: fetchCandidatures,
  staleTime: 5 * 60 * 1000
})
```

### Synchronisation
- **Filtres → API**: Les changements de filtres déclenchent automatiquement de nouvelles queries
- **Mutations → Cache**: Les updates invalident le cache approprié
- **Reactive**: L'UI se met à jour automatiquement quand les données changent

### Avantages
- **Performance**: Cache local réduit les appels API
- **UX**: États de chargement et optimisations optimistes
- **Fiabilité**: Gestion d'erreur et retry automatiques

## Décisions Techniques et Justification

### Framework et Langage
- **Vue 3 + Composition API**: Plus performant et flexible que Vue 2, meilleure TypeScript
- **TypeScript**: Sécurité des types, meilleure maintenabilité, autocomplétion IDE

### Gestion d'État
- **Pinia**: Officiel pour Vue 3, plus simple que Vuex
- **TanStack Vue Query**: Spécialisé pour les données serveur, cache intelligent, mutations optimistes

### UI/UX
- **Tailwind CSS**: Utilitaire-first, cohérence, personnalisation facile
- **shadcn/ui**: Composants accessibles, cohérents, customisables
- **Responsive**: Design mobile-first, table sur desktop, cartes sur mobile

### Build et Outils
- **Vite**: Build ultra-rapide, HMR performant
- **Vue Router**: Routage côté client avec historique
- **JSON Server**: Backend mock rapide pour le développement

### Choix d'Architecture
- **Composition API**: Plus lisible, meilleure réutilisabilité
- **Composants fonctionnels**: Simplicité, testabilité
- **Séparation logique**: API, stores, composants distincts

## Problèmes Rencontrés et Solutions

### 1. Configuration TypeScript Path Aliases
**Problème**: Erreur "Cannot find module '@/lib/utils'" malgré configuration correcte
**Cause**: `tsconfig.app.json` n'héritait pas des paths du `tsconfig.json` de base
**Solution**: Modifier l'extends pour utiliser `./tsconfig.json` au lieu de `@vue/tsconfig/tsconfig.dom.json`

### 2. Gestion des Filtres et Recherche
**Problème**: Recherche debounced causait des conflits avec les filtres
**Solution**: Reset de la pagination à chaque changement de filtre/recherche

### 3. Synchronisation État Local/Serveur
**Problème**: Updates optimistes pouvaient rester en cache après erreurs
**Solution**: Invalidation sélective des queries après mutations réussies

### 4. Responsive Design
**Problème**: Table trop large sur mobile
**Solution**: Affichage conditionnel table/cartes selon la taille d'écran

## Points d'Amélioration Identifiés

### Performance
- **Virtualisation**: Pour listes très longues (>1000 éléments)
- **Lazy Loading**: Des composants non critiques
- **Service Worker**: Cache offline pour PWA

### UX/UI
- **Skeleton Loading**: États de chargement plus fins
- **Toast Notifications**: Feedback utilisateur pour actions
- **Drag & Drop**: Réordonnancement des statuts/candidatures
- **Bulk Actions**: Sélection multiple pour updates groupés

### Fonctionnalités
- **Filtres Avancés**: Dates, compétences, salaire
- **Export**: CSV/PDF des candidatures filtrées
- **Notifications**: Alertes pour nouvelles candidatures
- **Dashboard**: Statistiques et métriques RH

### Technique
- **Tests**: Unitaires, intégration, E2E avec Vitest/Cypress
- **Error Boundaries**: Gestion d'erreur au niveau composant
- **Logging**: Monitoring des erreurs en production
- **API Rate Limiting**: Gestion des limites API
- **Real-time**: WebSockets pour updates temps réel

### Architecture
- **Micro-frontends**: Séparation en modules indépendants
- **Feature Flags**: Déploiement progressif des nouvelles fonctionnalités
- **Internationalisation**: Support multi-langue
- **Theme System**: Thèmes personnalisables par entreprise

---
