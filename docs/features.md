# Features - MDS Alumni

> Site alumni pour My Digital School.
> Design : minimal et moderne, blanc et bleu (couleurs MDS).

---

## 1. Gestion des Utilisateurs & Rôles

### 1.1 Rôles

| Rôle | Description | Accès |
|------|-------------|-------|
| **Admin** | Équipe école | Accès total, gestion des utilisateurs et contenus |
| **Alumni** | Ancien élève vérifié | Profil complet, annuaire, événements, peut être contacté |

Les visiteurs non connectés (étudiants, recruteurs, curieux) accèdent à l'annuaire en lecture seule (données publiques uniquement). Ils n'ont pas de compte.

### 1.2 Onboarding Alumni

1. **Pré-création** : L'Admin importe une liste CSV (firstname, lastname, promotion_name, promotion_year, role, email).
2. **Validation** : L'Admin visualise les données importées et choisit quand envoyer les invitations.
3. **Invitation** : Le système envoie un email avec un lien unique (token) d'activation.
4. **Activation** : L'Alumni clique sur le lien, définit son mot de passe.
5. **Enrichissement** : L'utilisateur est invité à compléter son profil (poste actuel, entreprise, bio, photo, URL LinkedIn).

### 1.3 Authentification

- Email + mot de passe (Supabase Auth natif).
- Lien d'activation par email avec token unique.
- Reset de mot de passe par email (Supabase Auth natif).

### 1.4 Confidentialité & RGPD

Chaque Alumni contrôle la visibilité de ses coordonnées (email, téléphone, LinkedIn, ville, entreprise) :

| Niveau | Visibilité |
|--------|-----------|
| **Tout le monde** (`public`) | Visible par tous, y compris les visiteurs non connectés |
| **Communauté** (`community`) | Visible uniquement par les Alumni connectés |
| **Privé** (`private`) | Masqué pour tout le monde |

Les paramètres sont stockés en JSONB dans la colonne `privacy_settings` de `profiles`.

---

## 2. Annuaire & Networking

### 2.1 Page d'accueil = Annuaire

L'annuaire est la page d'accueil du site. Il est accessible sans connexion en mode lecture seule (seules les données marquées "public" sont visibles). Les Alumni connectés voient aussi les données "communauté".

### 2.2 Profil Utilisateur

**Champs obligatoires :**
- Nom, Prénom
- Email
- Promotion (année)
- Diplôme / Filière

**Champs optionnels (enrichissement) :**
- Poste actuel
- Entreprise
- Secteur d'activité
- Bio / Description
- URL LinkedIn
- Photo de profil
- Localisation (Ville / Pays)
- Téléphone

### 2.3 Recherche & Filtres

- Recherche par mots-clés (nom, entreprise, compétence).
- Filtres à facettes :
  - Par Promotion / Année
  - Par Filière / Spécialité
  - Par Localisation (Ville / Pays)

---

## 3. Back-Office Admin

### 3.1 Gestion des Données

- **Promotions** : CRUD sur les promotions (nom, année).
- **Filières** : CRUD sur les filières / spécialités.
- **Membres** : CRUD utilisateurs, blocage d'accès.
- **Import CSV (dans l'onglet Membres)** : Import en masse avec les colonnes `firstname`, `lastname`, `promotion_name`, `promotion_year`, `role`, `email`, `linkedin_pseudo`, avec prévisualisation automatique puis confirmation manuelle de l'import. Rôles autorisés : `student`, `alumni`. Si une promotion du CSV n'existe pas, un avertissement est affiché et les membres concernés peuvent être importés sans promotion.

---

## 4. Espace Carrière (V2)

### 4.1 Job Board
- Types d'offres : CDI, CDD, Freelance, Stage, Alternance.
- Dépôt par Admins et Alumni.
- Liste chronologique avec filtres (type de contrat, secteur, localisation).

### 4.2 Offres Privilèges (Partenariats)
- Cartes partenaires : Logo, description, bouton "En profiter" (lien ou code promo).
- Géré par les Admins uniquement.

---

## 5. Vie de l'École (V2)

### 5.1 Événements
- Calendrier (Afterworks, Conférences, Remise de diplômes).
- Distinction visuelle entre événements "École" et "Réseau Alumni".
- Inscription aux événements.

### 5.2 Actualités
- Fil d'actualités / Blog pour les nouvelles de l'école.

---

## 6. Enrichissement (V2+)

### 6.1 Badge Mentor
- Switch "Disponible pour mentorat" sur le profil.
- Badge visible + filtrable dans l'annuaire.

### 6.2 Messagerie / Contact
- Formulaire de contact relais (l'email n'est jamais exposé sans consentement).
- Notifications par email.

### 6.3 Statistiques (Dashboard Admin)
- Nombre total d'inscrits vs diplômés importés.
- Répartition par type de contrat.
- Répartition géographique.
- Top entreprises.

---

## Résumé MVP / V2

### MVP
- Auth + Onboarding (import CSV en deux temps, invitation, activation)
- Profils utilisateurs (création, édition, visibilité RGPD)
- Annuaire public avec recherche et filtres (page d'accueil)
- Admin (gestion membres, promotions, filières, import CSV)

### V2
- Job Board + Offres Privilèges
- Événements + Actualités
- Badge Mentor
- Messagerie / Contact relais
- Statistiques admin
