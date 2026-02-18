# Annuaire (Page d'accueil) PRP

## Goal

Afficher l'annuaire des alumni sur la page d'accueil avec recherche par mots-clés et filtres à facettes (promotion, filière, localisation). Accessible en lecture seule aux visiteurs anonymes, avec données enrichies pour les alumni connectés.

## Why

- **Visiteurs** (recruteurs, étudiants, curieux) : Découvrir la communauté sans compte.
- **Alumni** : Networking, retrouver des anciens, contacter selon visibilité.
- **École** : Vitrine de la communauté, attractivité.

## What

### Scope inclus
- Page d'accueil = annuaire (liste de profils)
- Recherche full-text (nom, entreprise, compétences)
- Filtres : Promotion/Année, Filière, Ville/Pays
- Affichage selon privacy_settings (anonyme vs connecté)
- Pagination ou infinite scroll
- Design minimal, blanc et bleu MDS

### Scope exclu
- Badge Mentor filtrable (V2)
- Tri avancé (V2)
- Export CSV (V2)

### User stories
1. Visiteur arrive sur / → voit annuaire (données public uniquement)
2. Alumni connecté arrive sur / → voit annuaire (public + community)
3. Utilisateur tape "Dupont" → résultats filtrés
4. Utilisateur filtre par promotion 2023 → résultats filtrés
5. Clic sur profil → redirection /profile/[id]

## Technical Context

### Fichiers à référencer
- `src/app/page.tsx` - Page d'accueil actuelle
- `docs/database.md` - Tables profiles, promotion_year, programs
- `docs/architecture.md` - components/directory/
- `src/components/profile/profile-card.tsx` (PRP profiles) - Carte réutilisable

### Fichiers à implémenter/modifier
- `src/app/page.tsx` - Remplacer par annuaire
- `src/components/directory/search-bar.tsx` - Champ recherche
- `src/components/directory/filters.tsx` - Filtres facettes
- `src/components/directory/alumni-grid.tsx` - Grille de ProfileCard
- `src/components/directory/empty-state.tsx` - Aucun résultat
- `src/app/api/directory/route.ts` (optionnel) - API si client-side search
- `src/lib/directory.ts` - Fonctions `getDirectoryProfiles()`, `getFiltersOptions()`

### Patterns existants
- Server Components pour fetch initial
- `nuqs` pour state URL (recherche, filtres) — si client-side
- Ou : formulaire GET avec query params pour SEO et simplicité

## Implementation Details

### Data fetching
- Server Component : fetch profiles avec joins (promotion_year, programs)
- Filtrage côté DB : WHERE sur promotion_year_id, program_id, location_country, location_city
- Recherche : `ilike` sur first_name, last_name, current_company, skills (ou full-text si besoin)
- Appliquer `filterProfileByPrivacy()` côté serveur selon session

### Filtres
- Dropdowns ou checkboxes pour :
  - Promotion (liste promotion_year)
  - Filière (liste programs)
  - Pays (distinct location_country)
  - Ville (distinct location_city, optionnel)
- State : URL query params (`?promotion=2023&program=dev`) pour partage et SEO

### Composants
- **SearchBar** : input texte, debounce si client-side
- **Filters** : selects/checkboxes, valeurs depuis DB
- **AlumniGrid** : grille responsive de ProfileCard
- **EmptyState** : message si 0 résultat

### Pagination
- 24 ou 36 profils par page
- `offset` / `limit` ou cursor-based

## Validation Criteria

### Fonctionnel
- [ ] Annuaire affiche les profils avec bonnes données
- [ ] Anonyme voit uniquement champs public
- [ ] Connecté voit public + community
- [ ] Recherche filtre correctement
- [ ] Filtres (promotion, filière, pays) fonctionnent
- [ ] Clic carte → profil détaillé

### Technique
- [ ] TypeScript compile
- [ ] Pas de N+1 queries (joins optimisés)
- [ ] Page performante (pas de sur-fetch)

### Tests manuels
1. Recherche "Dupont", "Google", etc.
2. Combiner filtres
3. Vérifier visibilité anonyme vs connecté
4. Pagination
