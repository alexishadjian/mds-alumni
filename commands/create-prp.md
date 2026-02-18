---
description: Créer un PRP (Product Requirement Prompt) pour une feature MDS Alumni
---

# Create PRP (Product Requirement Prompt)

Tu es chargé de créer un PRP complet pour une nouvelle feature de la plateforme MDS Alumni.

## Qu'est-ce qu'un PRP ?

Un PRP combine :
- **Exigences produit** (quoi construire et pourquoi)
- **Contexte codebase** (patterns existants, fichiers à référencer)
- **Guidance d'implémentation** (comment construire)
- **Critères de validation** (comment vérifier)

## Processus de recherche

### 1. Documentation
- Lire `docs/features.md` pour le scope
- Consulter `docs/architecture.md` et `docs/database.md`
- Vérifier `.cursor/rules/` pour les conventions

### 2. Exploration codebase
- Identifier les features similaires
- Trouver les fichiers pertinents
- Comprendre les patterns (Supabase, Server Actions, RLS)

### 3. Template de sortie

Créer un fichier dans `PRPs/` avec cette structure :

```markdown
# [Nom Feature] PRP

## Goal
[Une phrase claire sur ce qu'on construit]

## Why
[Justification - qui bénéficie et comment]

## What
[Description détaillée]
- Périmètre (inclus/exclu)
- User stories ou cas d'usage

## Technical Context

### Fichiers à référencer
- `path/to/file.ts` - [pourquoi pertinent]
- ...

### Fichiers à implémenter/modifier
- `path/to/new.ts` - [rôle]
- `path/to/existing.ts` - [modifications]
- ...

### Patterns existants à suivre
[Patterns du projet à répliquer]

## Implementation Details

### API/Endpoints (si applicable)
[Spécifications request/response]

### Database (si applicable)
[Schéma, migrations, RLS]

### Composants (si applicable)
[Composants UI à créer/modifier]

## Validation Criteria

### Fonctionnel
- [ ] [Critère testable 1]
- [ ] [Critère testable 2]

### Technique
- [ ] TypeScript compile sans erreur
- [ ] RLS respecte les règles
- [ ] Pas d'erreurs console

### Tests manuels
1. [Étapes de vérification]
```

## Confirmation

Avant de finaliser, confirmer avec l'utilisateur :
1. Périmètre correct
2. Approche alignée
3. Aucune exigence manquante

Si l'utilisateur confirme, sauvegarder dans `PRPs/[feature-name].md`.

---

**Input:** $ARGUMENTS

Décris la feature à implémenter. Je vais explorer le codebase et créer un PRP complet.
