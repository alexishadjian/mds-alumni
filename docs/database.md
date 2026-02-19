# Database Schema - MDS Alumni (Supabase)

> Ce fichier reflète le schéma réel de la base Supabase.
> Les tables marquées "V2" ne sont pas prioritaires pour le MVP mais existent déjà.

## Vue d'ensemble

```
auth.users (Supabase natif)
    │
    └── profiles ──────── promotion_year
            │                  
            └──────────── programs
                          
jobs ──────── profiles (via user_id)
events
student_bonus
```

---

## Tables

### auth.users (Supabase Auth - natif)

Gérée automatiquement par Supabase Auth. On ne modifie pas cette table.

---

### profiles

Profil étendu lié à `auth.users`. Contient aussi les privacy settings en JSONB.

| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| id | uuid | PK, FK → auth.users.id | Identifiant unique |
| email | text | NOT NULL, UNIQUE | Email |
| first_name | text | | Prénom |
| last_name | text | | Nom |
| avatar_url | text | | Photo de profil (Supabase Storage) |
| promotion_year_id | bigint | FK → promotion_year.id | Promotion |
| program_id | bigint | FK → programs.id | Filière / Programme |
| role | text | DEFAULT 'student' | 'admin', 'alumni', 'student' |
| current_job_title | text | | Poste actuel |
| current_company | text | | Entreprise actuelle |
| current_sector | text | | Secteur d'activité |
| current_contract_type | text | | Type de contrat actuel |
| linkedin_url | text | | URL profil LinkedIn |
| bio | text | | Bio / description |
| skills | text[] | | Compétences |
| location_city | text | | Ville |
| location_country | text | | Pays |
| is_mentor | boolean | DEFAULT false | Disponible pour mentorat |
| mentor_topics | text[] | | Sujets de mentorat |
| privacy_settings | jsonb | DEFAULT (voir ci-dessous) | Paramètres de visibilité RGPD |
| created_at | timestamptz | DEFAULT now() | Date de création |
| updated_at | timestamptz | DEFAULT now() | Dernière modification |

**Structure de `privacy_settings` (JSONB) :**

```json
{
  "email_visibility": "community",
  "phone_visibility": "private",
  "linkedin_visibility": "community",
  "city_visibility": "public",
  "company_visibility": "public"
}
```

Valeurs possibles pour chaque champ : `"public"`, `"community"`, `"private"`.

| Champ | Default | Description |
|-------|---------|-------------|
| email_visibility | "community" | Visibilité de l'email |
| phone_visibility | "private" | Visibilité du téléphone |
| linkedin_visibility | "community" | Visibilité du LinkedIn |
| city_visibility | "public" | Visibilité de la ville |
| company_visibility | "public" | Visibilité de l'entreprise actuelle |

**Colonnes à ajouter pour l'onboarding :**

| Colonne | Type | Description |
|---------|------|-------------|
| is_activated | boolean DEFAULT false | Compte activé via le lien d'invitation |
| activation_token | text UNIQUE | Token d'activation (onboarding) |
| invitation_sent_at | timestamptz | Date d'envoi de l'invitation |

---

### promotion_year

| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| id | bigint | PK, GENERATED ALWAYS AS IDENTITY | Identifiant |
| year | integer | NOT NULL, UNIQUE | Année de promotion |
| label | text | | Nom / label de la promotion |
| created_at | timestamptz | DEFAULT now() | Date de création |

---

### programs

Filières / Programmes.

| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| id | bigint | PK, GENERATED ALWAYS AS IDENTITY | Identifiant |
| name | text | NOT NULL | Nom du programme |
| slug | text | NOT NULL, UNIQUE | Slug URL-friendly |

---

### jobs (V2)

| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Identifiant unique |
| user_id | uuid | FK → profiles.id | Auteur |
| title | text | NOT NULL | Titre du poste |
| company_name | text | NOT NULL | Entreprise |
| description | text | NOT NULL | Description de l'offre |
| contract_type | text | NOT NULL | Type de contrat |
| location | text | | Localisation |
| apply_url | text | | Lien de candidature |
| is_active | boolean | DEFAULT true | Offre active |
| created_at | timestamptz | DEFAULT now() | Date de création |

---

### events (V2)

| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Identifiant unique |
| title | text | NOT NULL | Titre |
| description | text | | Description |
| event_date | timestamptz | NOT NULL | Date de l'événement |
| location | text | | Lieu |
| type | text | CHECK ('school', 'alumni') | Type d'événement |
| image_url | text | | Image de couverture |
| registration_link | text | | Lien d'inscription externe |
| created_at | timestamptz | DEFAULT now() | Date de création |

---

### student_bonus (V2)

Offres privilèges / avantages étudiants.

| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Identifiant unique |
| partner_name | text | NOT NULL | Nom du partenaire |
| logo_url | text | | Logo du partenaire |
| description | text | NOT NULL | Description |
| promo_code | text | | Code promo |
| claim_link | text | | Lien pour en profiter |
| expiration_date | date | | Date d'expiration |

---

## Row Level Security (RLS)

### profiles
- **SELECT** : Tout le monde (y compris anonyme) peut lire les profils. Les champs sensibles sont filtrés côté application selon `privacy_settings`.
- **UPDATE** : Le propriétaire du profil ou un Admin.
- **INSERT** : Service role uniquement (flow d'onboarding / import CSV).
- **DELETE** : Admin uniquement.

### promotion_year / programs
- **SELECT** : Tout le monde (y compris anonyme, pour les filtres de l'annuaire).
- **INSERT / UPDATE / DELETE** : Admin uniquement.

### jobs (V2)
- **SELECT** : Tous les utilisateurs authentifiés.
- **INSERT / UPDATE / DELETE** : Auteur ou Admin.

### events (V2)
- **SELECT** : Tous les utilisateurs authentifiés.
- **INSERT / UPDATE / DELETE** : Admin uniquement.

### student_bonus (V2)
- **SELECT** : Tous les utilisateurs authentifiés.
- **INSERT / UPDATE / DELETE** : Admin uniquement.
