# Changelog

Historique de toutes les modifications du projet MDS Alumni.

Repo : [alexishadjian/mds-alumni](https://github.com/alexishadjian/mds-alumni)

**Contributeurs** : Alexis Hadjian (`alexis`), Mathis Laversin (`matlav`)

---

## [unreleased] — develop (2026-03-10)

### Maintenance

- `6d7495d` — Restauration du dossier `.agents/skills/` supprimé par erreur — _matlav_

---

## Pull Request #4 — `develop` → `main` (2026-02-20)

> Mergée par **Alexis** le 20 février 2026 (`d5fe0a4`)

### Features

- `90f1028` — **Home page** : création de la page d'accueil avec animations Framer Motion — _alexis_
- `dd517c0` — **Alumni card** : séparation de l'affichage du poste et de l'entreprise sur la carte alumni — _alexis_
- `13f2b37` — **Search** : ajout de filtres de recherche supplémentaires sur la page membres — _alexis_
- `79e87f2` — **LinkedIn Scraper** : création du scraper LinkedIn pour récupérer les données des profils — _alexis_
- `8f148e3` — **Scraper** : amélioration du téléchargement d'avatars et du feedback UI pendant le scraping — _alexis_

### Refactoring

- `a080f95` — **LinkedIn scraper** : ajustement des délais de scraping — _alexis_

### Bug Fixes

- `c241f5c` — **Home page** : correction du type safety pour le easing de transition dans l'animation fadeUp — _alexis_
- `cb5d3d6` — **Vercel** : mise à jour du cron schedule pour le scraping LinkedIn — _alexis_

---

## Pull Request #3 — `develop` → `main` (2026-02-19)

> Mergée par **Mathis Laversin** le 19 février 2026 (`8887be0`)

### Features

- `96b1f01` — **Admin** : création du dashboard admin, onglets promotions et membres — _alexis_
- `ea3ac95` — **Promotions** : ajout de couleurs de badges par promotion — _alexis_
- `c31896a` — **LinkedIn pseudo** : ajout du support du pseudo LinkedIn dans les profils — _alexis_

### Refactoring

- `ef1dcea` — **Routes** : séparation des routes en groupes (main, admin, auth) — _alexis_

### Maintenance

- `d66d891` — Suppression des CSV d'import inutilisés, mise à jour de la visibilité du profil dans le formulaire d'édition — _matlav_
- `8d842bf` — Résolution des conflits de merge, suppression des fichiers CSV inutilisés — _matlav_

### Bug Fixes

- `b708c5d` — Correction du build qui ne fonctionnait plus — _matlav_

---

## Pull Request #1 — `feat/alumni-flow` → `develop` (2026-02-19)

> Mergée par **Mathis Laversin** le 19 février 2026 (`8445e14`)

### Features

- `216d238` — **Auth & UI** : implémentation de la redirection d'authentification dans le middleware, mise à jour des styles et layouts des pages login/register, ajout de variables CSS de couleurs et animations, nouvelles dépendances UI — _matlav_

---

## Setup Initial (2026-02-18)

### Features

- `b11b650` — **Supabase Auth** : setup de l'authentification Supabase — _matlav_
- `2bf2909` — **PRPs & Commandes** : ajout des Product Requirement Prompts et des commandes IA — _matlav_
- `2c00955` — **Fonts** : ajout des polices Bricolage Grotesque et Inter — _matlav_
- `9792af9` — **Fonts** : utilisation des polices dans le layout — _matlav_

### Refactoring

- `4ca0797` — **Auth** : déplacement des server actions depuis les API routes vers `lib/actions/` — _alexis_

### Documentation

- `9e16f2c` — Mise à jour du contexte projet : spécifications design et typographie — _alexis_
- `ac9aee8` — Mise à jour de la documentation projet pour les fonctionnalités IA — _alexis_
- `beda3e8` — Initialisation de la documentation projet et IA — _matlav_

### Init

- `a0d4f8a` — **Premier commit** : initialisation du projet Next.js avec Supabase — _alexis_

---

## Branches

| Branche | Statut | Description |
|---|---|---|
| `main` | Production | Branche principale, merges via Pull Requests |
| `develop` | Développement | Branche de travail active |
| `feat/alumni-flow` | Mergée (PR #1) | Authentification et flow alumni |
| `feat/alumni` | Locale | Feature auth/actions |
| `feat/improve-alumni` | Active | Améliorations profils alumni |

## Pull Requests

| PR | Titre | Date | Auteur du merge | Commits |
|---|---|---|---|---|
| #1 | `feat/alumni-flow` → `develop` | 19 fév. 2026 | Mathis Laversin | 1 |
| #3 | `develop` → `main` | 19 fév. 2026 | Mathis Laversin | 7 |
| #4 | `develop` → `main` | 20 fév. 2026 | Alexis | 8 |
