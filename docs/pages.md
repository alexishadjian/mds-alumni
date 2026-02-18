# Pages & Routes - MDS Alumni

## Routes Publiques (sans authentification)

| Route | Page | Description |
|-------|------|-------------|
| `/` | Annuaire (accueil) | Liste des alumni avec recherche et filtres. Données publiques uniquement pour les visiteurs non connectés. |
| `/profile/[id]` | Profil Alumni (public) | Vue publique d'un profil (champs selon privacy settings, niveau "public" uniquement) |
| `/login` | Connexion | Formulaire email + mot de passe |
| `/forgot-password` | Mot de passe oublié | Formulaire de réinitialisation |
| `/reset-password` | Nouveau mot de passe | Formulaire pour définir un nouveau mot de passe (via lien email) |
| `/activate/[token]` | Activation de compte | Définir son mot de passe lors du premier accès (onboarding) |

---

## Routes Authentifiées — `(app)`

Layout commun : Header avec navigation + avatar utilisateur.

L'annuaire (`/`) et les profils (`/profile/[id]`) affichent les données "communauté" en plus des données "public" quand l'utilisateur est connecté.

| Route | Page | Description |
|-------|------|-------------|
| `/profile/edit` | Éditer mon profil | Formulaire d'édition + paramètres de visibilité RGPD |

### V2

| Route | Page | Description |
|-------|------|-------------|
| `/jobs` | Offres d'emploi | Liste des offres avec filtres |
| `/jobs/[id]` | Détail d'une offre | Description complète + bouton postuler |
| `/jobs/new` | Poster une offre | Formulaire de création (Alumni + Admin) |
| `/events` | Événements | Liste/calendrier avec distinction école/alumni |
| `/events/[id]` | Détail d'un événement | Description, date, lieu, bouton inscription |
| `/news` | Fil d'actualités | Liste des articles publiés |
| `/news/[id]` | Article | Contenu complet |
| `/perks` | Offres partenaires | Grille de cartes partenaires |

---

## Routes Admin — `(admin)`

Layout commun : Sidebar de navigation admin. Accessible uniquement aux utilisateurs avec le rôle `admin`.

### MVP

| Route | Page | Description |
|-------|------|-------------|
| `/admin/members` | Gestion des membres | Liste, recherche, édition, blocage, suppression |
| `/admin/members/[id]` | Détail membre | Voir/éditer un profil depuis l'admin |
| `/admin/import` | Import CSV | Upload CSV + prévisualisation + envoi des invitations |
| `/admin/promotions` | Promotions | CRUD années de promotion |
| `/admin/programs` | Programmes | CRUD filières/programmes (nom, slug) |

### V2

| Route | Page | Description |
|-------|------|-------------|
| `/admin/jobs` | Offres d'emploi | CRUD offres, activation/désactivation |
| `/admin/events` | Événements | CRUD événements, voir les inscrits |
| `/admin/news` | Actualités | CRUD articles, publication/brouillon |
| `/admin/perks` | Offres Privilèges | CRUD offres partenaires |
| `/admin/stats` | Statistiques | Dashboard visuel |

---

## API Routes — `app/api/`

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/auth/activate` | POST | Activer un compte alumni (vérifier token, set password) |
| `/api/auth/callback` | GET | Callback Supabase Auth (confirmation email, reset password) |
| `/api/import/csv` | POST | Importer un fichier CSV d'alumni (admin, service role) |
| `/api/import/send-invitations` | POST | Envoyer les emails d'invitation (admin, sélection des alumni) |

---

## Middleware

Le fichier `middleware.ts` gère :

1. **`/login`, `/activate/*`, `/forgot-password`, `/reset-password`** : Si déjà connecté → redirect vers `/`.
2. **`/profile/edit`** : Si non connecté → redirect vers `/login`.
3. **`/admin/*`** : Si non connecté → redirect vers `/login`. Si connecté mais rôle pas `admin` → redirect vers `/`.
4. **`/`, `/profile/[id]`** : Accessibles à tous. Le middleware passe l'info de session au layout pour adapter l'affichage (public vs communauté).
