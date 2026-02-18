---
description: Implémenter une feature en suivant un PRP existant (Explore, Plan, Code, Test)
---

# Implémenter un PRP

Tu es chargé d'implémenter une feature en suivant le PRP spécifié et le workflow EPCT.

## Contexte

- **Projet** : MDS Alumni — plateforme alumni pour My Digital School
- **Stack** : Next.js 16, React 19, TypeScript, Tailwind, Supabase, shadcn/ui
- **Docs** : `docs/architecture.md`, `docs/database.md`, `docs/features.md`

## Workflow EPCT

### 1. Explore
- Lire le PRP complet dans `PRPs/`
- Identifier les fichiers à référencer et à modifier
- Parcourir le codebase pour les patterns existants
- Vérifier les dépendances entre PRPs (ex: profiles avant directory)

### 2. Plan
- Rédiger un plan d'implémentation détaillé
- Ordre des tâches : DB migrations → API → composants → pages
- Inclure tests et vérifications
- Poser des questions si ambiguïté

### 3. Code
- Suivre les conventions `.cursor/rules/`
- Respecter le style du codebase
- Implémenter selon le PRP (Technical Context, Implementation Details)
- Exécuter le linter et corriger les erreurs

### 4. Test
- Vérifier les critères de validation du PRP
- Tests manuels selon la section "Tests manuels"
- Vérifier en navigateur si UX impactée

## PRPs disponibles

| PRP | Fichier | Dépendances |
|-----|---------|-------------|
| Auth & Onboarding | `PRPs/prp-auth-onboarding.md` | - |
| Profils | `PRPs/prp-profiles.md` | - |
| Annuaire | `PRPs/prp-directory.md` | Profils |
| Admin | `PRPs/prp-admin.md` | Auth, Profils |

## Ordre recommandé MVP

1. **prp-auth-onboarding** — Base auth, import, activation
2. **prp-profiles** — Profils et privacy
3. **prp-admin** — Back-office (promotions, filières, membres, import)
4. **prp-directory** — Annuaire page d'accueil

---

**Input:** $ARGUMENTS

Indique le PRP à implémenter (ex: `prp-auth-onboarding` ou `prp-profiles`). Je vais suivre le workflow EPCT.
