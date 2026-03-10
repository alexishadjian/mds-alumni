# MDS Alumni — Plateforme Alumni My Digital School

Plateforme de mise en réseau des anciens étudiants de My Digital School : annuaire, profils, offres d'emploi, événements et back-office administratif.

## Stack Technique

| Couche      | Technologie                                |
| ----------- | ------------------------------------------ |
| Framework   | Next.js 16 (App Router, Server Components) |
| UI          | React 19, TypeScript, Tailwind CSS 4       |
| Composants  | shadcn/ui + Radix UI                       |
| Backend     | Supabase (PostgreSQL, Auth, Storage, RLS)  |
| Animations  | Framer Motion                              |
| Déploiement | Vercel (+ Cron Jobs)                       |

**Design** — Minimal et moderne aux couleurs MDS : `#2CB8C5` (teal), `#662483` (violet), typographies Bricolage Grotesque (titres) et Inter (corps).

## Fonctionnalités Implémentées

- **Authentification & Onboarding** — Import CSV d'alumni, envoi d'invitations par email, activation par token unique, mot de passe oublié
- **Profils** — Édition complète avec contrôle de visibilité RGPD (public / community / private) champ par champ
- **Annuaire** — Recherche full-text, filtres par promotion/filière/ville, respect de la vie privée
- **Job Board** — Offres d'emploi avec filtres (secteur, type de contrat), gestion admin
- **Événements** — Gestion et affichage d'événements
- **Back-Office Admin** — CRUD promotions/filières/membres, import CSV, LinkedIn scraper, dashboard avec statistiques
- **Middleware** — Protection des routes par rôle (admin, alumni, visiteur)
- **Privacy by Design** — Filtrage côté serveur selon les paramètres de visibilité, RLS Supabase

---

## Méthodologie IA — Ce Qui a Été Mis en Place

Ce projet a été construit en exploitant au maximum les agents IA (Cursor, Gemini, GitHub Copilot) avec une méthodologie structurée pour garantir la qualité, la cohérence et la maintenabilité du code généré.

### 1. Méthode PRP (Product Requirement Prompt)

Chaque fonctionnalité majeure est spécifiée dans un **PRP** — un document structuré qui sert de brief complet pour l'agent IA avant toute implémentation.

**Structure d'un PRP :**

- **Goal** — Objectif clair en une phrase
- **Why** — Qui en bénéficie et comment
- **What** — Description détaillée, user stories, scope
- **Technical Context** — Fichiers à référencer, patterns existants
- **Implementation Details** — API, schéma DB, composants
- **Validation Criteria** — Checklist fonctionnelle et technique

**PRPs créés :**

| PRP                      | Périmètre                              |
| ------------------------ | -------------------------------------- |
| `prp-auth-onboarding.md` | Auth, import CSV, activation par token |
| `prp-profiles.md`        | Profils utilisateurs, privacy RGPD     |
| `prp-visibility.md`      | Niveaux de visibilité global du profil |
| `prp-directory.md`       | Annuaire avec recherche et filtres     |
| `prp-admin.md`           | Back-office complet                    |
| `prp-jobs.md`            | Job board carrière                     |

> Les PRPs permettent à n'importe quel agent IA de reprendre une fonctionnalité avec tout le contexte nécessaire, sans ambiguïté.

### 2. Workflow EPCT (Explore → Plan → Code → Test)

Workflow structuré en 4 phases imposé à chaque agent IA pour éviter les implémentations approximatives :

1. **Explore** — Lire le PRP, explorer les fichiers existants, identifier les patterns et dépendances
2. **Plan** — Écrire un plan d'implémentation détaillé (ordre : DB → API → Components → Pages)
3. **Code** — Implémenter en suivant les conventions du projet, lancer le linter
4. **Test** — Vérifier chaque critère de validation du PRP, tests manuels

Ce workflow est documenté dans `commands/explore-and-plan.md` et réutilisable par tout agent.

### 3. Commandes IA Réutilisables

Trois commandes ont été créées pour standardiser les interactions avec les agents :

| Commande          | Fichier                        | Rôle                                              |
| ----------------- | ------------------------------ | ------------------------------------------------- |
| **EPCT**          | `commands/explore-and-plan.md` | Workflow générique d'exploration et planification |
| **Create PRP**    | `commands/create-prp.md`       | Créer un nouveau PRP structuré pour une feature   |
| **Implement PRP** | `commands/implement-prp.md`    | Implémenter un PRP existant étape par étape       |

Ces commandes sont aussi exposées dans `.gemini/commands/` (fichiers `.toml`) pour être invocables directement depuis l'interface Gemini.

```
commands/
├── README.md              # Index des commandes disponibles
├── explore-and-plan.md    # Workflow EPCT
├── create-prp.md          # Création de PRP
└── implement-prp.md       # Implémentation de PRP

.gemini/commands/
├── epct.toml              # Commande Gemini → EPCT
├── create-prp.toml        # Commande Gemini → Create PRP
└── implement-prp.toml     # Commande Gemini → Implement PRP
```

### 4. Cursor Rules — Contexte Permanent pour l'Agent

Trois fichiers de règles dans `.cursor/rules/` injectent automatiquement du contexte à Cursor :

| Fichier               | Contenu                                                                                      |
| --------------------- | -------------------------------------------------------------------------------------------- |
| `project-context.mdc` | Contexte global du projet (stack, couleurs, fonts, rôles, scope MVP) — **alwaysApply: true** |
| `conventions.mdc`     | Conventions de code (nommage, Server Components, Server Actions, gestion d'erreurs)          |
| `database.mdc`        | Référence rapide DB (tables, relations, RLS, clients Supabase, privacy settings)             |

> `project-context.mdc` est appliqué automatiquement à chaque prompt, ce qui garantit que Cursor a toujours le contexte du projet.

### 5. Documentation Technique Centralisée

Un dossier `docs/` sert de source de vérité unique pour les agents IA et les développeurs :

| Document          | Contenu                                         |
| ----------------- | ----------------------------------------------- |
| `architecture.md` | Stack, structure, conventions, design system    |
| `database.md`     | Schéma complet, tables, colonnes, RLS, privacy  |
| `features.md`     | Features MVP détaillées, rôles, flux onboarding |
| `pages.md`        | Routes, layouts, protections middleware         |
| `roadmap.md`      | Phases du projet, état d'avancement             |

Les commandes et PRPs référencent systématiquement ces docs, forçant l'agent à les consulter avant d'implémenter.

### 6. Skills IA Spécialisées

Quatre skills sont installées (lockées dans `skills-lock.json`) pour enrichir les agents avec des best practices vérifiées :

| Skill                                | Source           | Périmètre                                                 |
| ------------------------------------ | ---------------- | --------------------------------------------------------- |
| **Supabase Postgres Best Practices** | Supabase         | Optimisation queries, RLS, schema design, connexions      |
| **Vercel React Best Practices**      | Vercel Labs      | Performance React/Next.js, bundles, SSR, re-renders       |
| **Frontend Design**                  | Anthropic        | Interfaces production-grade, design distinctif            |
| **UI/UX Pro Max**                    | nextlevelbuilder | 50+ styles, 161 palettes, 57 font pairings, guidelines UX |

Ces skills sont automatiquement proposées aux agents quand le contexte correspond (ex : écriture de queries Postgres → skill Supabase activée).

---

## Bonnes Pratiques IA Appliquées

### Structuration du Contexte

- **Contexte permanent** via `.cursor/rules/` — L'agent a toujours le stack, les conventions et le schéma DB
- **Docs comme source de vérité** — Les PRPs et commandes pointent vers `docs/` pour éviter les hallucinations
- **PRPs auto-suffisants** — Chaque PRP contient tout le contexte pour être implémenté de manière autonome

### Workflow Reproductible

- **EPCT systématique** — Chaque feature suit Explore → Plan → Code → Test
- **Ordre d'implémentation** — DB → Server Actions → Components → Pages (bottom-up)
- **Validation Criteria** — Checklist testable à la fin de chaque PRP

### Multi-Agent Compatible

- **Commandes cross-agent** — Même workflow utilisable par Cursor, Gemini et GitHub Copilot
- **Skills partagées** — Best practices accessibles à tous les agents via `.agents/skills/`
- **Docs versionées** — Le contexte du projet évolue avec le code

### Qualité du Code Généré

- **Conventions strictes** — Nommage, structure de fichiers, patterns React/Next.js documentés
- **Server Components par défaut** — `"use client"` uniquement quand nécessaire
- **Privacy by Design** — Filtrage serveur systématique, RLS enforced
- **Type Safety** — TypeScript strict, types dérivés du schéma Supabase

### Réduction des Hallucinations

- **Docs à jour** — Schéma DB, routes, features maintenues en sync avec le code
- **Patterns existants** — Les PRPs référencent des fichiers existants comme exemples
- **Validation explicite** — Critères d'acceptation testables, pas de "ça devrait marcher"

---

## Structure du Projet

```
mds-alumni/
├── README.md                    # Ce fichier
├── docs/                        # Documentation technique
│   ├── architecture.md
│   ├── database.md
│   ├── features.md
│   ├── pages.md
│   └── roadmap.md
├── PRPs/                        # Product Requirement Prompts
│   ├── prp-admin.md
│   ├── prp-auth-onboarding.md
│   ├── prp-directory.md
│   ├── prp-jobs.md
│   ├── prp-profiles.md
│   └── prp-visibility.md
├── commands/                    # Commandes IA réutilisables
│   ├── README.md
│   ├── explore-and-plan.md
│   ├── create-prp.md
│   └── implement-prp.md
├── .cursor/rules/               # Contexte permanent Cursor
│   ├── project-context.mdc
│   ├── conventions.mdc
│   └── database.mdc
├── .gemini/commands/            # Commandes Gemini
│   ├── epct.toml
│   ├── create-prp.toml
│   └── implement-prp.toml
├── .agents/skills/              # Skills IA spécialisées
│   ├── supabase-postgres-best-practices/
│   ├── vercel-react-best-practices/
│   ├── frontend-design/
│   └── ui-ux-pro-max/
├── skills-lock.json             # Versions lockées des skills
├── vercel.json                  # Config Vercel (Cron Jobs)
└── src/                         # Code source Next.js
    ├── app/                     # App Router (routes, layouts)
    ├── components/              # Composants React
    ├── lib/                     # Actions, services, utils
    ├── hooks/                   # Custom hooks
    ├── types/                   # Types TypeScript
    └── middleware.ts            # Protection des routes
```

## Démarrage

```bash
cd src
npm install
npm run dev
```

Variables d'environnement requises dans `src/.env.local` :

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
