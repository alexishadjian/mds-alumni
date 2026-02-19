# Career (Carrière) Feature PRP

## Goal
Implémenter une plateforme complète de gestion et d'affichage d'offres d'emploi (Job Board) pour MDS Alumni, avec un design moderne et "percutant".

## Why
Permettre aux administrateurs de proposer des opportunités professionnelles aux alumni et étudiants, et offrir à ces derniers un outil de recherche d'emploi performant au sein de leur réseau.

## What
- **Panel Admin** :
    - Liste des offres d'emploi sous forme de tableau.
    - Création, modification et suppression des offres via une modale.
    - Champs : Titre, Entreprise, Secteur (nouveau), Type de contrat, Localisation, Description, URL de candidature, État (actif/inactif).
- **Page Jobs (Public)** :
    - Affichage des offres actives sous forme de cartes au design moderne.
    - Barre de recherche (titre, entreprise).
    - Filtres par Secteur et Type de contrat (CDI, CDD, Freelance, Stage, Alternance).
    - Style "qui claque" : Gradients MDS, animations au survol, typographie Geist/Bricolage, mise en page aérée.

## Technical Context

### Fichiers à référencer
- `src/components/admin/members-table.tsx` - Modèle pour les tableaux admin.
- `src/components/admin/member-dialog.tsx` - Modèle pour les modales de création/édition.
- `src/lib/actions/members.ts` - Modèle pour les Server Actions CRUD.
- `src/types/index.ts` - Pour les définitions de types.

### Fichiers à implémenter/modifier
- `supabase/migrations/[timestamp]_add_sector_to_jobs.sql` - Migration pour ajouter `sector` et gérer les RLS.
- `src/lib/actions/jobs.ts` - Server Actions CRUD (getJobs, createJob, updateJob, deleteJob).
- `src/app/(admin)/admin/jobs/page.tsx` - Page de gestion des jobs (admin).
- `src/components/admin/jobs-table.tsx` - Tableau admin pour les offres.
- `src/components/admin/job-dialog.tsx` - Modale admin pour les offres.
- `src/app/(main)/jobs/page.tsx` - Page d'affichage des offres (public).
- `src/components/jobs/job-card.tsx` - Carte d'offre d'emploi "stylée".
- `src/components/jobs/job-filters.tsx` - Composant de filtrage et recherche.

### Patterns existants à suivre
- Server Components pour le fetching initial.
- Client Components pour les formulaires, tables interactives et filtres.
- Shadcn/ui pour les composants de base (Button, Input, Dialog, Select).
- Lucide-react pour les icônes.

## Implementation Details

### Database
```sql
ALTER TABLE public.jobs ADD COLUMN sector text;
-- RLS : SELECT pour tous les authentifiés, ALL pour les admins.
```

### Server Actions (`src/lib/actions/jobs.ts`)
- `getJobs(filters?: JobFilters)` : Retourne la liste des offres.
- `upsertJob(job: Partial<Job>)` : Crée ou modifie une offre (Admin only).
- `deleteJob(id: string)` : Supprime une offre (Admin only).

### UI Design
- **Job Card** : Utiliser un gradient de bordure discret, des badges colorés pour les types de contrat (ex: bleu pour CDI, violet pour Alternance), et un effet de scale/ombre au survol.
- **Filters** : Une barre latérale ou supérieure collante avec des boutons de sélection rapide pour les filtres.

## Validation Criteria

### Fonctionnel
- [ ] L'admin peut créer une offre avec tous les champs requis.
- [ ] L'admin peut modifier ou supprimer une offre existante.
- [ ] Les offres apparaissent instantanément sur la page `/jobs` après création.
- [ ] La recherche et les filtres (secteur, contrat) fonctionnent correctement.
- [ ] Les offres inactives ne sont pas affichées sur la page publique.

### Technique
- [ ] TypeScript compile sans erreur.
- [ ] Les RLS Supabase empêchent la modification des jobs par des non-admins.
- [ ] Performance : Les filtres sont réactifs.

### Tests manuels
1. Créer un job "Développeur Fullstack" en CDI dans le secteur "Tech" via l'admin.
2. Vérifier sa présence sur `/jobs`.
3. Filtrer par "Freelance" et vérifier qu'il disparaît.
4. Passer le job en "inactif" et vérifier qu'il disparaît du public.
