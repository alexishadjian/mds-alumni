# Back-Office Admin PRP

## Goal

Fournir aux admins un espace dédié pour gérer les promotions, filières, membres et l'import CSV. Toutes les routes admin sont protégées et accessibles uniquement aux utilisateurs avec rôle `admin`.

## Why

- **Admin** : Gestion centralisée des données de la plateforme.
- **École** : Contrôle qualité des données, onboarding des promotions.
- **Sécurité** : Accès restreint, audit trail implicite.

## What

### Scope inclus
- **Promotions** : CRUD (nom/année)
- **Filières (Programs)** : CRUD (nom, slug)
- **Membres** : Liste, détail, édition, blocage d'accès
- **Import CSV** : Upload, prévisualisation, envoi invitations (détails dans prp-auth-onboarding)

### Scope exclu
- Statistiques dashboard (V2)
- Logs d'audit (V2)

### User stories
1. Admin crée une promotion "2025"
2. Admin crée une filière "Développement Web"
3. Admin liste les membres → filtre par promotion → édite un profil
4. Admin bloque un membre → celui-ci ne peut plus se connecter
5. Admin importe CSV → prévisualise → envoie invitations

## Technical Context

### Fichiers à référencer
- `src/middleware.ts` - Protection routes (à étendre pour /admin)
- `docs/database.md` - Tables promotion_year, programs, profiles
- `docs/architecture.md` - Structure (admin)/admin/
- `prp-auth-onboarding.md` - Import CSV détaillé

### Fichiers à implémenter/modifier
- `src/app/(admin)/admin/layout.tsx` - Layout admin (sidebar, header)
- `src/app/(admin)/admin/page.tsx` - Dashboard (liens vers sections)
- `src/app/(admin)/admin/promotions/page.tsx` - Liste + CRUD
- `src/app/(admin)/admin/programs/page.tsx` - Liste + CRUD
- `src/app/(admin)/admin/members/page.tsx` - Liste membres
- `src/app/(admin)/admin/members/[id]/page.tsx` - Détail/édition membre
- `src/app/(admin)/admin/import/page.tsx` - Import CSV (voir prp-auth-onboarding)
- `src/components/admin/promotion-form.tsx` - Formulaire promotion
- `src/components/admin/program-form.tsx` - Formulaire filière
- `src/components/admin/member-table.tsx` - Tableau membres
- `src/components/admin/sidebar.tsx` - Navigation admin
- `src/middleware.ts` - Vérifier rôle admin sur /admin/*

### Patterns existants
- Server Components
- Server Actions pour mutations
- RLS : INSERT/UPDATE/DELETE admin sur promotion_year, programs

## Implementation Details

### Middleware
- Sur `/admin/*` : vérifier session + `profiles.role === 'admin'`
- Si non admin → redirect `/` ou `/login`
- Utiliser `createClient` avec cookies pour récupérer user + profile

### Layout admin
- Sidebar : Promotions, Filières, Membres, Import
- Header : nom admin, déconnexion
- Design cohérent avec le reste (shadcn/ui)

### CRUD Promotions
- Liste : SELECT promotion_year
- Create : formulaire année → INSERT
- Edit : formulaire pré-rempli → UPDATE
- Delete : confirmation → DELETE (attention FK profiles)

### CRUD Programs
- Liste : SELECT programs
- Create : formulaire nom, slug → INSERT
- Edit/Delete : idem

### Gestion Membres
- Liste : SELECT profiles avec joins (promotion_year, programs)
- Filtres : par promotion, filière, rôle
- Détail : page avec formulaire édition (comme profile/edit mais admin peut tout modifier)
- Blocage : champ `is_blocked` ou désactivation auth ? — à définir (Supabase Auth admin peut désactiver user)

### Database
- RLS déjà décrit dans docs/database.md
- Option : colonne `is_blocked` sur profiles si pas d'usage direct Supabase Auth admin API

## Validation Criteria

### Fonctionnel
- [ ] Non-admin ne peut pas accéder à /admin
- [ ] CRUD promotions fonctionne
- [ ] CRUD filières fonctionne
- [ ] Liste membres avec filtres
- [ ] Édition membre par admin
- [ ] Blocage membre empêche connexion
- [ ] Import CSV (voir prp-auth-onboarding)

### Technique
- [ ] TypeScript compile
- [ ] RLS respecté (admin uniquement pour mutations)
- [ ] Middleware bloque correctement

### Tests manuels
1. Connexion en tant qu'alumni → tentative /admin → redirect
2. Connexion admin → accès OK
3. Créer/éditer/supprimer promotion et filière
4. Bloquer membre → tenter connexion avec ce compte
