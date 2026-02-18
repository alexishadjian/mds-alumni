# Architecture - MDS Alumni

## Stack Technique

| Outil | Usage |
|-------|-------|
| **Next.js 16** | Framework React (App Router, Server Components) |
| **React 19** | UI |
| **TypeScript** | Typage statique |
| **Tailwind CSS 4** | Styling |
| **shadcn/ui** | Composants UI (Radix + Tailwind) |
| **Supabase** | Base de données PostgreSQL, Auth, Storage, RLS |
| **Supabase Auth** | Authentification (email/password, emails natifs) |
| **Supabase Storage** | Upload d'images (avatars) |
| **Vercel** | Déploiement |

## Design

- Style : minimal et moderne.
- Couleurs : blanc et bleu (couleurs MDS).
- Typographie : Geist (déjà configuré par défaut dans Next.js).

---

## Structure des Dossiers (MVP)

```
src/
├── app/
│   ├── (public)/                 # Routes publiques (auth)
│   │   ├── login/
│   │   ├── activate/[token]/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   │
│   ├── (app)/                    # Routes authentifiées
│   │   └── profile/
│   │       └── edit/
│   │
│   ├── (admin)/                  # Routes admin
│   │   └── admin/
│   │       ├── members/
│   │       │   └── [id]/
│   │       ├── promotions/
│   │       ├── programs/
│   │       └── import/
│   │
│   ├── profile/
│   │   └── [id]/                 # Profil public (accessible à tous)
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   ├── activate/
│   │   │   └── callback/
│   │   └── import/
│   │       ├── csv/
│   │       └── send-invitations/
│   │
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Page d'accueil = Annuaire
│
├── components/
│   ├── ui/                       # Composants shadcn/ui
│   ├── layout/                   # Header, Sidebar, Footer
│   ├── directory/                # Composants annuaire (SearchBar, Filters, AlumniCard)
│   ├── profile/                  # Composants profil (ProfileForm, PrivacySettings)
│   ├── admin/                    # Composants admin (MemberTable, CsvImport, PromotionForm)
│   └── shared/                   # Composants partagés (Pagination, EmptyState, etc.)
│
├── lib/
│   ├── actions/
│   │   └── auth.ts               # Server Actions auth (signIn, signUp, signOut)
│   ├── supabase/
│   │   ├── client.ts             # Client Supabase (browser)
│   │   ├── server.ts             # Client Supabase (server, cookies)
│   │   └── admin.ts              # Client Supabase (service role)
│   ├── utils.ts                  # Utilitaires (cn, formatDate, etc.)
│   └── constants.ts              # Constantes (rôles, enums, config)
│
├── hooks/
│   └── use-auth.ts               # Hook d'authentification
│
├── types/
│   └── index.ts                  # Types TypeScript (Database, Profile, etc.)
│
└── middleware.ts                  # Protection des routes, redirections
```

---

## Conventions

### Nommage
- **Fichiers/dossiers** : kebab-case (`alumni-card.tsx`, `use-auth.ts`)
- **Composants** : PascalCase (`AlumniCard`, `ProfileForm`)
- **Fonctions/variables** : camelCase (`getProfile`, `isAuthenticated`)
- **Types/Interfaces** : PascalCase (`Profile`, `PrivacySettings`)
- **Constantes** : UPPER_SNAKE_CASE (`USER_ROLES`, `VISIBILITY_LEVELS`)

### Composants
- **Server Components** par défaut. `"use client"` uniquement quand nécessaire (interactivité, hooks, événements DOM).
- Un composant = un fichier.
- Props typées avec `interface`.

### Data Fetching
- **Server Components** : Fetch via le client Supabase server (`lib/supabase/server.ts`).
- **Mutations** : Server Actions de Next.js (dans `lib/actions/`).
- **Client Components** : Via hooks custom si nécessaire.

### Auth & Middleware
- Le `middleware.ts` vérifie la session Supabase via les cookies.
- Les routes admin vérifient le rôle en plus de l'authentification.
- Le client Supabase server utilise `cookies()` de Next.js.

### Gestion d'erreurs
- Fichiers `error.tsx` et `not-found.tsx` dans chaque groupe de routes.
- Les Server Actions retournent `{ success: boolean, error?: string, data?: T }`.

### Environnement

Variables d'environnement requises (`.env.local`) :

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
