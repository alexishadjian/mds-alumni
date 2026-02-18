# Roadmap - MDS Alumni

## Phase 1 — MVP

L'objectif est d'avoir un site fonctionnel avec l'annuaire comme page d'accueil, les profils, et l'admin de base.

### 1.1 Setup Projet
- [ ] Installer shadcn/ui + composants de base (Button, Input, Card, Table, Dialog, etc.)
- [ ] Configurer les clients Supabase (browser, server, admin/service role)
- [ ] Créer les types TypeScript depuis le schéma Supabase
- [ ] Configurer les variables d'environnement (.env.local)
- [ ] Mettre en place les layouts (public, app, admin)
- [ ] Configurer le middleware (protection des routes par rôle)

### 1.2 Base de Données Supabase
- [x] Tables créées (profiles, promotion_year, programs, jobs, events, student_bonus)
- [ ] Ajouter les colonnes d'onboarding à profiles (is_activated, activation_token, invitation_sent_at)
- [ ] Mettre à jour le default de privacy_settings (ajouter company_visibility, linkedin_visibility, city_visibility)
- [ ] Configurer les RLS policies
- [ ] Créer le bucket Storage pour les avatars

### 1.3 Authentification & Onboarding
- [ ] Page de connexion (`/login`)
- [ ] Page mot de passe oublié + réinitialisation
- [ ] Page d'activation de compte (`/activate/[token]`)
- [ ] Route API callback Supabase Auth
- [ ] Middleware de protection des routes

### 1.4 Annuaire (Page d'accueil)
- [ ] Page annuaire (`/`) avec liste des alumni
- [ ] Recherche par mots-clés
- [ ] Filtres à facettes (promotion, filière, localisation)
- [ ] Affichage adapté : données publiques pour visiteurs, + communauté pour connectés
- [ ] Pagination

### 1.5 Profils
- [ ] Page profil public (`/profile/[id]`) avec respect des privacy settings
- [ ] Page édition de profil (`/profile/edit`)
- [ ] Paramètres de visibilité RGPD
- [ ] Upload de photo de profil (Supabase Storage)

### 1.6 Admin
- [ ] Layout admin avec sidebar
- [ ] Gestion des membres (`/admin/members`) : liste, recherche, édition, blocage
- [ ] Détail d'un membre (`/admin/members/[id]`)
- [ ] Gestion des promotions (`/admin/promotions`) : CRUD années
- [ ] Gestion des programmes (`/admin/programs`) : CRUD filières
- [ ] Import CSV (`/admin/import`) : upload, prévisualisation, envoi des invitations

---

## Phase 2 — Carrière & Contenu

### 2.1 Job Board
- [x] Table `jobs` déjà créée
- [ ] Page liste des offres avec filtres
- [ ] Page détail d'une offre
- [ ] Formulaire de création (Alumni + Admin)
- [ ] Admin : gestion des offres

### 2.2 Événements
- [x] Table `events` déjà créée
- [ ] Créer la table event_registrations
- [ ] Page liste/calendrier
- [ ] Page détail + inscription
- [ ] Admin : CRUD événements

### 2.3 Actualités
- [ ] Créer la table news_articles
- [ ] Page fil d'actualités + page article
- [ ] Admin : CRUD articles

---

## Phase 3 — Enrichissement

### 3.1 Offres Privilèges
- [x] Table `student_bonus` déjà créée
- [ ] Page grille des offres
- [ ] Admin : CRUD offres partenaires

### 3.2 Badge Mentor
- [x] Colonnes `is_mentor` et `mentor_topics` déjà dans profiles
- [ ] Switch sur le profil + badge visuel
- [ ] Filtre "Mentors uniquement" dans l'annuaire

### 3.3 Messagerie / Contact
- [ ] Formulaire de contact relais
- [ ] Notifications par email

### 3.4 Statistiques Admin
- [ ] Dashboard avec graphiques
- [ ] Métriques : inscrits, contrats, géographie, top entreprises
