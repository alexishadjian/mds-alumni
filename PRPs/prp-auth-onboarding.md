# Auth & Onboarding Alumni PRP

## Goal

Permettre aux admins d'importer des alumni en masse via CSV, d'envoyer des invitations par email, et aux alumni d'activer leur compte via un lien unique.

## Why

- **Admin** : Gestion efficace des promotions sans création manuelle de comptes.
- **Alumni** : Activation simple et sécurisée de leur compte.
- **École** : Contrôle total sur qui accède à la plateforme.

## What

### Scope inclus
- Import CSV (prévisualisation avant envoi)
- Envoi d'invitations par email (token unique par alumni)
- Page d'activation `/activate/[token]` (définir mot de passe)
- Page forgot-password + reset-password (Supabase Auth natif)
- Middleware : protection routes admin, redirection selon rôle

### Scope exclu
- Inscription libre (register actuel à adapter ou supprimer pour alumni)
- OAuth (Google, etc.) — V2+

### User stories
1. Admin importe CSV → prévisualise → envoie invitations
2. Alumni reçoit email → clique lien → définit mot de passe → compte activé
3. Alumni oublie mot de passe → demande reset → reçoit lien → réinitialise

## Technical Context

### Fichiers à référencer
- `src/app/api/auth/route.ts` - Server Actions signIn/signUp/signOut
- `src/utils/supabase/server.ts` - Client Supabase serveur
- `src/middleware.ts` - Protection routes, refresh session
- `docs/database.md` - Schéma profiles, colonnes onboarding

### Fichiers à implémenter/modifier
- `src/app/(auth)/activate/[token]/page.tsx` - Page activation
- `src/app/(auth)/forgot-password/page.tsx` - Demande reset
- `src/app/(auth)/reset-password/page.tsx` - Reset avec token
- `src/app/api/auth/activate/route.ts` - Validation token, activation
- `src/app/(admin)/admin/import/page.tsx` - Import CSV
- `src/app/api/import/csv/route.ts` - Upload + parse CSV
- `src/app/api/import/send-invitations/route.ts` - Envoi emails
- `src/middleware.ts` - Vérification rôle admin, redirections

### Patterns existants
- Server Actions avec `'use server'`
- `createClient(await cookies())` pour Supabase
- `redirect()` pour navigation post-action
- Formulaires avec `action={serverAction}`

## Implementation Details

### Database
- Migration : ajouter à `profiles` :
  - `is_activated` boolean DEFAULT false
  - `activation_token` text UNIQUE
  - `invitation_sent_at` timestamptz
- RLS : INSERT via service role pour import

### API
- `POST /api/import/csv` : FormData avec fichier CSV → parse → retourne rows + validation
- `POST /api/import/send-invitations` : body `{ profileIds: string[] }` → crée tokens, envoie emails
- `GET /api/auth/activate?token=xxx` : valide token, redirige vers page set-password

### Emails
- Utiliser Supabase Auth `inviteUserByEmail` ou custom avec Resend/SendGrid
- Template email : lien `https://domain.com/activate?token=xxx`

### Composants
- `CsvImport` : upload, preview table, bouton "Envoyer invitations"
- `ActivationForm` : champ mot de passe, validation

## Validation Criteria

### Fonctionnel
- [ ] Admin peut importer CSV et voir prévisualisation
- [ ] Admin peut envoyer invitations à une sélection
- [ ] Alumni reçoit email avec lien valide
- [ ] Clic sur lien → page activation → mot de passe défini → compte activé
- [ ] Forgot password → email reçu → reset fonctionne
- [ ] Middleware bloque /admin si non-admin

### Technique
- [ ] TypeScript compile sans erreur
- [ ] Tokens uniques et expirables (optionnel : TTL 7 jours)
- [ ] Pas d'exposition du token dans l'URL après activation

### Tests manuels
1. Import CSV avec données valides/invalides
2. Envoi invitation → vérifier email reçu
3. Activation avec token valide/invalide/expiré
4. Reset password flow complet
