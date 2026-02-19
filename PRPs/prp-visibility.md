# Profile Visibility PRP

## Goal
Permettre aux utilisateurs de gérer la visibilité de leur profil via trois niveaux : `public`, `community`, et `private`.

## Why
Offrir un contrôle granulaire sur la vie privée des alumni tout en maintenant un annuaire fonctionnel.

## What
- **Niveaux de visibilité :**
  - `public` : Toutes les informations du profil sont visibles par tout le monde.
  - `community` : Toutes les informations sont visibles uniquement par les utilisateurs connectés ayant un rôle (`admin`, `student`, `alumni`).
  - `private` : Seuls le nom, le prénom et le poste actuel sont visibles. Le reste du profil est masqué par un message "Profil privé".
- **Comportement :**
  - Dans l'annuaire : Les profils privés n'affichent que le nom et le poste.
  - Sur la page de profil : Si le profil est privé, afficher une interface restreinte.
  - Paramétrage : L'utilisateur peut modifier sa visibilité depuis son formulaire d'édition de profil.

## Technical Context

### Fichiers à référencer
- `src/types/index.ts` - Contient les types `Profile` et la logique de filtrage `filterProfileByPrivacy`.
- `src/lib/actions/profile.ts` - Contient les actions pour récupérer et mettre à jour les profils.
- `src/app/profile/[id]/page.tsx` - Page de détail du profil.
- `src/components/profile/profile-edit-form.tsx` - Formulaire d'édition du profil.

### Fichiers à implémenter/modifier
- `supabase/migrations/[timestamp]_add_visibility_to_profiles.sql` - Migration pour ajouter la colonne `visibility`.
- `src/types/index.ts` - Ajouter le champ `visibility` au type `Profile` et mettre à jour `filterProfileByPrivacy`.
- `src/lib/actions/profile.ts` - Mettre à jour `updateProfile` pour inclure `visibility`.
- `src/app/profile/[id]/page.tsx` - Gérer l'affichage restreint pour les profils `private` ou `community` (si non connecté).
- `src/components/profile/profile-edit-form.tsx` - Ajouter un champ de sélection pour la visibilité.

## Implementation Details

### Database (RLS & Schema)
```sql
-- Migration
ALTER TABLE public.profiles 
ADD COLUMN visibility text DEFAULT 'public' 
CHECK (visibility IN ('public', 'community', 'private'));
```
*Note : On utilise `text` avec une contrainte `CHECK` pour simplifier les types TS générés.*

### Types & Logic (`src/types/index.ts`)
Mettre à jour `filterProfileByPrivacy` pour prendre en compte le champ global `visibility` :
1. Si `visibility === 'private'` : masquer tout sauf `first_name`, `last_name`, `current_job_title`, `current_company`.
2. Si `visibility === 'community'` et `!isAuthenticated` : masquer tout sauf `first_name`, `last_name`, `current_job_title`, `current_company`.
3. Sinon, appliquer les filtres granulaires de `privacy_settings`.

### Composants
- **ProfilePage** : Si les données essentielles sont masquées par `filterProfileByPrivacy`, afficher un composant d'état "Profil privé".
- **ProfileEditForm** : Ajouter un `Select` shadcn pour le champ `visibility`.

## Validation Criteria

### Fonctionnel
- [ ] Un utilisateur peut passer son profil en `private`.
- [ ] En `private`, un visiteur non connecté ne voit que le nom et le poste.
- [ ] En `community`, un visiteur non connecté ne voit que le nom et le poste.
- [ ] En `community`, un utilisateur connecté voit toutes les infos.
- [ ] L'admin peut toujours tout voir.

### Technique
- [ ] Migration SQL appliquée avec succès.
- [ ] Les types TypeScript sont à jour.
- [ ] Pas de régression sur l'annuaire.

### Tests manuels
1. Se connecter avec un compte alumni.
2. Changer la visibilité en `private`.
3. Se déconnecter et consulter le profil : vérifier que les infos sont masquées.
4. Re-changer en `community`.
5. Se déconnecter et consulter le profil : vérifier que les infos sont masquées.
6. Se connecter avec un autre compte et consulter le profil : vérifier que les infos sont visibles.
