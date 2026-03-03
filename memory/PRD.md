# FitMaxPro - Product Requirements Document

## Original Problem Statement
Application de fitness nommée "FitMaxPro" avec:
- Plans de paiement: VIP (9,99€/mois), Standard (6,99€/mois), Supplément (4,99€)
- Séances de musculation pour débutants, amateurs et professionnels
- Programmes: prise de masse, perte de poids, jambes/fessiers, spécial femme, **ABDOMINAUX**, **YOGA/DÉTENTE**
- Suppléments nutritionnels avec recettes détaillées
- Internationalisation: Français et Anglais
- Système de tracking des séances avec chronomètre et pauses
- Messagerie directe entre abonnés et coach
- Rappels d'entraînement programmables
- Échauffement avant chaque séance et étirements après
- Panneau d'administration complet avec suivi des progrès utilisateurs
- **Live Streaming pour coaching en direct (EN ATTENTE)**
- **Système d'avis clients**
- **Photos Avant/Après**
- **Gestion des réseaux sociaux**

## Website URL
**https://fitmax-gains.preview.emergentagent.com**

## All Implemented Features (March 3, 2026)

### 1. Workout Programs ✅ UPDATED
| Type | Nombre | Description |
|------|--------|-------------|
| mass_gain | 44 | Prise de masse (débutant à pro) |
| weight_loss | 24 | Perte de poids (débutant à pro) |
| **abs** | **18** | **Abdominaux (9 FR + 9 EN)** ✅ NEW |
| legs_glutes | 16 | Jambes & Fessiers |
| women_fitness | 18 | Spécial Femmes |
| **yoga** | **18** | **Yoga & Détente (9 FR + 9 EN)** ✅ NEW |
| **TOTAL** | **138** | Séances d'entraînement |

### 2. Session Tracking System ✅
- Bouton "START WORKOUT" sur chaque séance
- Barre de tracking rouge avec chronomètre
- Boutons PAUSE/RESUME et FINISH
- Chronomètre de pause en jaune

### 3. Warm-Up & Stretching System ✅
- 8 exercices d'échauffement (FR + EN) avec vidéos YouTube
- 10 exercices d'étirement (FR + EN) avec vidéos YouTube
- Tracking début/fin automatique
- **Vidéos modifiables par l'admin**

### 4. User Progress Tracking ✅
- Page /my-progress avec statistiques
- Graphiques d'évolution (7 derniers jours)
- Onglets: Overview, Charts, History
- Discipline score et streak

### 5. Admin Panel ✅ COMPLETE
| Onglet | Fonctionnalité |
|--------|----------------|
| Dashboard | Stats générales (138 workouts, users, VIP) |
| Subscribers | Liste des abonnés |
| **Coaching** | Vue détaillée par abonné + alertes inactivité |
| Progress | Historique des séances |
| Discipline | Suivi échauffements/étirements |
| **Reviews** | Gestion des avis clients |
| **Before/After Photos** | Photos de progression |
| Messages | Messagerie avec abonnés |
| **Social Media** | Gestion Instagram/TikTok/YouTube/Facebook/Snapchat |
| Analytics | Stats par séance |
| Workouts | Création/modification séances |
| **Warm-Up/Stretching** | Modification des vidéos d'exercices |
| Nutrition | Gestion des repas |

### 6. Reviews System ✅
- Page /reviews pour laisser un avis (note + commentaire)
- Admin peut voir tous les avis
- Statistiques par étoiles

### 7. Social Media Management ✅
- Admin peut ajouter/modifier les liens sociaux
- Instagram, YouTube, TikTok, Snapchat, Facebook
- Liens affichés dans le footer

### 8. Progress Photos ✅
- Utilisateurs peuvent uploader photos avant/après
- Admin peut voir les photos de tous les abonnés

### 9. Inactivity Alerts ✅
- Endpoint /api/admin/send-inactivity-alerts
- Envoie des emails aux abonnés inactifs via Resend

### 10. Email Integration ✅
- Resend configuré et fonctionnel
- Templates HTML professionnels

## Bug Fixed Today (March 3, 2026)

### Scripts de Seeding - Stratégie UPSERT ✅
**Problème résolu**: Les scripts de seeding ne s'écrasent plus mutuellement.
- Tous les scripts utilisent maintenant `update_one(..., upsert=True)`
- IDs stables au lieu de `uuid.uuid4()`

### Badge de type programme ✅
**Problème résolu**: Les badges affichent maintenant le bon type (Abs, Yoga, etc.)

## Test Credentials
- Admin Email: mouctar08000@hotmail.com
- Admin Password: Football-du-08
- Subscription: VIP

## Prioritized Backlog

### P0 - Critical (Prochaine étape)
- ⏳ **Live Streaming** - Coaching en direct style TikTok/Instagram
  - Technologie recommandée: **LiveKit**
  - Fonctionnalités: Broadcaster, viewers, chat temps réel, accès VIP
  - **Playbook obtenu, prêt pour implémentation**

### P1 - Important
- ⏳ Appels Audio/Vidéo Coach-Abonné (boutons dans Messages)
- 🔲 Achats in-app natifs (RevenueCat)
- 🔲 Notifications push réelles

### P2 - Nice to Have
- 🔲 Refactorisation backend (server.py ~3000 lignes)
- 🔲 Refactorisation frontend (AdminPage.js ~3700 lignes)
- 🔲 Guide soumission App Stores
- 🔲 Domaine personnalisé (fitmax-gains.com)

## 3rd Party Integrations
| Service | Usage | Status |
|---------|-------|--------|
| Stripe | Paiements | ✅ Configuré |
| Resend | Emails | ✅ Fonctionnel |
| YouTube | Vidéos exercices | ✅ Embeds fonctionnels |
| Pexels | Images stock | ✅ URLs utilisées |
| LiveKit | Live Streaming | ⏳ Playbook prêt |

## Key API Endpoints
```
GET  /api/workouts?program_type=abs&language=fr
GET  /api/routines/warmup?language=fr
GET  /api/reviews
POST /api/reviews
GET  /api/social-links
PUT  /api/admin/social-links
GET  /api/admin/reviews
GET  /api/admin/progress-photos
POST /api/admin/send-inactivity-alerts
GET  /api/user/evolution
GET  /api/admin/all-subscribers-evolution
```

## File Structure (Key Files)
```
/app/
├── backend/
│   ├── server.py                 # API FastAPI (~3000 lignes)
│   ├── seed_detailed_workouts.py # Mass/Weight Loss (CORRIGÉ)
│   ├── seed_abs_complete.py      # Abdominaux (NEW - 18 séances)
│   ├── seed_yoga_workouts.py     # Yoga/Détente (NEW - 18 séances)
│   ├── add_leg_workouts.py       # Jambes (CORRIGÉ)
│   └── add_women_workouts.py     # Femmes (CORRIGÉ)
├── frontend/src/pages/
│   ├── WorkoutsPage.js           # Catalogue (UPDATED - filtres yoga/abs)
│   ├── AdminPage.js              # Panneau admin (~3700 lignes)
│   ├── MyProgressPage.js         # Progression utilisateur
│   ├── ReviewsPage.js            # Avis clients
│   └── ProgressPhotosPage.js     # Photos avant/après
└── memory/
    └── PRD.md
```

## Test Reports
- /app/test_reports/iteration_5.json - 100% tests passés (20/20)

## Changelog

### March 3, 2026 (Session 2)
- ✅ Ajouté 12 nouvelles séances d'abdominaux (6 FR + 6 EN) - Total: 18
- ✅ Ajouté 18 nouvelles séances de Yoga/Détente (9 FR + 9 EN)
- ✅ Corrigé l'affichage des badges de type (Abs, Yoga, etc.)
- ✅ Ajouté le filtre "Yoga & Relaxation" dans WorkoutsPage
- ✅ Total workouts: 138 (était 108)
- ✅ Tests passés: 100% (20/20)

### March 3, 2026 (Session 1)
- ✅ Corrigé bug critique des scripts de seeding
- ✅ Vérifié fonctionnement Reviews, Social Media, Progress
- ✅ Vérifié graphiques d'évolution utilisateur et admin
