# FitMaxPro - Product Requirements Document

## Version
- **Version:** 2.6.0
- **Derniere mise a jour:** 5 Mars 2025

## Description du Produit
FitMaxPro est une application de fitness complete offrant du live streaming, des appels video 1-to-1 coach/client, des programmes d'entrainement personnalises, un suivi de course a pied avec GPS, et un systeme de gamification.

---

## Fonctionnalites Implementees

### Core Features
- [x] **Authentification** - Login/Signup avec JWT
- [x] **Dashboard utilisateur** - Vue d'ensemble personnalisee
- [x] **Navigation responsive** - Mobile et desktop

### Live Streaming (Corrige 5 Mars 2025)
- [x] Streaming WebRTC avec LiveKit
- [x] **Tokens JWT avec video grants** - Corrige avec nouvelle syntaxe chainee
- [x] Creation de room LiveKit automatique
- [x] Chat en temps reel
- [x] **Bouton "Demarrer la camera"** - Activation manuelle
- [x] Demandes de live (Live Requests)
- [x] Lives programmes

### Appels Video 1-to-1
- [x] Appels coach/client avec LiveKit
- [x] Notifications d'appels entrants
- [x] Historique des appels

### Entrainements
- [x] 72+ seances predefinies
- [x] Plans prise de masse / perte de poids
- [x] Exercices par groupe musculaire
- [x] Lecteur video d'exercices

### Admin Panel - Gestion des Seances (NOUVEAU 5 Mars 2025)
- [x] **CRUD complet** - Creer, Lire, Modifier, Supprimer
- [x] **Upload videos** - Max 500MB avec compression automatique
- [x] **Upload images** - Max 10MB
- [x] **Compression video FFmpeg** - H.264, 720p, optimise web
- [x] Gestion des exercices par seance

### Course a Pied
- [x] Suivi GPS
- [x] Classements
- [x] Defis hebdomadaires

### Gamification
- [x] Points et recompenses
- [x] Hall of Fame
- [x] Badges

### Paiements (Mis a jour 5 Mars 2025)
- [x] Stripe (abonnements web)
- [x] RevenueCat (achats in-app mobile) - Backend pret
- [x] Webhooks configures
- [x] **Logique abonnement annuel** - Blocage annulation avant 12 mois
- [x] Reactivation d'abonnement

### Admin Panel
- [x] Dashboard analytique
- [x] Gestion abonnes
- [x] Statistiques lives
- [x] Gestion messages
- [x] Gestion avis
- [x] Liens reseaux sociaux
- [x] Gestion videos
- [x] **Gestion seances** (NOUVEAU)

---

## Architecture Technique

### Backend (FastAPI)
```
backend/
├── server.py              # Orchestrateur principal
├── routes/                # 18 modules de routes
│   ├── auth.py            # Authentification
│   ├── lives.py           # Live streaming
│   ├── livekit.py         # WebRTC
│   ├── payments.py        # Stripe + logique annuelle
│   ├── workouts.py        # CRUD admin + upload + compression
│   ├── iap.py             # RevenueCat
│   ├── notifications.py   # Push notifications
│   └── ...
├── utils/                 # Configuration
├── models/                # Pydantic schemas
├── tests/                 # Tests Pytest
└── uploads/               # Fichiers uploades
    ├── videos/
    └── images/
```

### Frontend (React)
```
frontend/src/
├── components/
│   ├── admin/             # Composants admin
│   │   ├── AdminWorkouts.js  # NOUVEAU - Gestion seances
│   │   └── ...
│   ├── ui/                # Shadcn components
│   └── LiveKitRoom.js     # Composant streaming
├── pages/
├── hooks/
│   └── usePushNotifications.js
└── context/
```

---

## Tests Valides (5 Mars 2025)

### Compression Video FFmpeg
- **Statut:** PASSE
- Fichier test: 48KB -> 43KB (9.6% compression)
- Format sortie: H.264, 720p, optimise streaming

### Logique Abonnement Annuel Stripe
- **Statut:** PASSE
- Abonnement annuel: Annulation bloquee (HTTP 403)
- Message: "334 jours restants avant annulation possible"
- Abonnement mensuel: Annulation autorisee (can_cancel=true)

---

## Livrables

### Archive GitHub (Mis a jour 5 Mars 2025)
- **Fichier:** `FitMaxPro_GitHub_Final.zip` (2.7 MB)
- **Contenu:**
  - Code source complet (frontend + backend)
  - Dockerfiles et docker-compose.yml
  - Fichiers `.env.example` (sans credentials)
  - README.md avec instructions
  - Configuration Android/iOS (Capacitor)
  - Compression video FFmpeg integree

### Kit Marketing
- **Fichier:** `FitMaxPro_Marketing_Kit.zip` (4.6 MB)
- **Contenu:**
  - `MARKETING_KIT.md` - Guide complet avec tous les textes
  - 4 images promotionnelles generees

---

## Backlog / Taches Futures

### P1 - Haute Priorite
- [ ] Finaliser integration frontend RevenueCat
- [ ] Completer refactorisation AdminPage.js (13 onglets restants)

### P2 - Moyenne Priorite
- [ ] Ameliorer couverture tests Pytest
- [ ] Optimisation performances frontend

### P3 - Basse Priorite
- [ ] Mode hors-ligne
- [ ] Synchronisation multi-appareils
- [ ] Analytics avancees

---

## API Endpoints Cles

### Admin Workouts (NOUVEAU)
- `GET /api/workouts/admin/all` - Liste toutes les seances
- `POST /api/workouts/admin/create` - Creer une seance
- `PUT /api/workouts/admin/{workout_id}` - Modifier une seance
- `DELETE /api/workouts/admin/{workout_id}` - Supprimer une seance
- `POST /api/workouts/admin/upload/video` - Upload + compression video
- `POST /api/workouts/admin/upload/image` - Upload image

### Abonnements (MIS A JOUR)
- `GET /api/payments/subscription` - Details + can_cancel + jours restants
- `POST /api/payments/cancel` - Annulation (bloquee si annuel)
- `POST /api/payments/reactivate` - Reactivation

---

## Comptes de Test

| Type | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@fitmaxpro.com | admin123 |
| User | testuser@test.com | password123 |

---

## Variables d'Environnement Requises

### Backend (.env)
- MONGO_URL
- DB_NAME
- JWT_SECRET
- LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET
- STRIPE_API_KEY
- RESEND_API_KEY
- REVENUECAT_API_KEY
- VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY

### Frontend (.env)
- REACT_APP_BACKEND_URL
- REACT_APP_STRIPE_PUBLIC_KEY
