# Profils Utilisateurs PRP

## Goal

Permettre aux alumni de créer, éditer leur profil et contrôler la visibilité de leurs données (RGPD) via `privacy_settings`.

## Why

- **Alumni** : Présence professionnelle, networking, contrôle de leurs données.
- **Visiteurs** : Découverte des alumni selon les préférences de visibilité.
- **Conformité** : RGPD — chaque alumni maîtrise l'exposition de ses coordonnées.

## What

### Scope inclus
- Page profil public `/profile/[id]` (lecture seule, filtrage selon privacy_settings)
- Page édition `/profile/edit` (authentifié, propriétaire uniquement)
- Champs obligatoires : Nom, Prénom, Email, Promotion, Filière
- Champs optionnels : Poste, Entreprise, Secteur, Bio, LinkedIn, Photo, Ville, Pays, Téléphone
- Paramètres de visibilité par champ (public / community / private)

### Scope exclu
- Badge Mentor (V2)
- Compétences / tags (V2)

### User stories
1. Alumni connecté édite son profil → sauvegarde
2. Visiteur anonyme voit profil → champs "public" uniquement
3. Alumni connecté voit profil → champs "public" + "community"
4. Alumni modifie privacy_settings → visibilité mise à jour immédiatement

## Technical Context

### Fichiers à référencer
- `docs/database.md` - Structure profiles, privacy_settings JSONB
- `src/utils/supabase/server.ts` - Client Supabase
- `src/app/page.tsx` - Pattern page existante
- `docs/architecture.md` - Structure dossiers components/profile

### Fichiers à implémenter/modifier
- `src/app/profile/[id]/page.tsx` - Profil public (Server Component)
- `src/app/(app)/profile/edit/page.tsx` - Édition profil
- `src/components/profile/profile-form.tsx` - Formulaire édition
- `src/components/profile/privacy-settings.tsx` - Toggles visibilité
- `src/components/profile/profile-card.tsx` - Carte profil (réutilisable annuaire)
- `src/lib/utils.ts` - Helper `filterProfileByPrivacy(profile, viewerRole)`
- `src/types/index.ts` - Types Profile, PrivacySettings

### Patterns existants
- Server Components par défaut
- `createClient(await cookies())` pour fetch
- Server Actions pour mutations
- Retour `{ success, error?, data? }`

## Implementation Details

### Types
```ts
type VisibilityLevel = 'public' | 'community' | 'private';

type PrivacySettings = {
  email_visibility: VisibilityLevel;
  phone_visibility: VisibilityLevel;
  linkedin_visibility: VisibilityLevel;
  city_visibility: VisibilityLevel;
  company_visibility: VisibilityLevel;
};
```

### Logique de filtrage
- `filterProfileByPrivacy(profile, isAuthenticated)` : retourne profil avec champs masqués selon `privacy_settings` et statut visiteur (anonyme vs alumni).

### Database
- `profiles` : colonnes déjà définies dans docs/database.md
- RLS : SELECT pour tous, UPDATE profil par propriétaire ou admin

### Composants
- **ProfileForm** : champs éditables, validation, Server Action
- **PrivacySettings** : selects pour chaque champ (public/community/private)
- **ProfileCard** : affichage condensé (nom, poste, entreprise, avatar) — réutilisé dans annuaire

### Upload avatar
- Supabase Storage bucket `avatars/{user_id}` 
- RLS : upload par propriétaire
- Champ `avatar_url` dans profiles

## Validation Criteria

### Fonctionnel
- [ ] Profil public affiche uniquement champs "public" pour anonyme
- [ ] Profil public affiche "public" + "community" pour alumni connecté
- [ ] Édition profil sauvegarde correctement
- [ ] Privacy settings modifiables et persistées
- [ ] Upload avatar fonctionne

### Technique
- [ ] TypeScript compile
- [ ] Pas de fuite de données (email/phone masqués si private)
- [ ] RLS profiles respecté

### Tests manuels
1. Créer profil → modifier → vérifier persistance
2. Changer visibilité email → vérifier anonyme vs connecté
3. Upload photo → vérifier affichage
