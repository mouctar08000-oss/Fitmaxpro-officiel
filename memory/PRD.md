# FitMaxPro - Product Requirements Document

## Original Problem Statement
Application de fitness "FitMaxPro" complète avec Live Streaming, Appels 1-to-1, programmes d'entraînement, course à pied, gamification et plus encore.

## Website URL
**https://fitmax-gains.preview.emergentagent.com**

---

## Session du 5 Mars 2026 - Refactorisation Complète

### ✅ REFACTORISATION BACKEND COMPLÉTÉE

Le backend monolithique (`server.py` ~6900 lignes) a été **entièrement refactorisé** en architecture modulaire :

```
backend/
├── server.py           # Point d'entrée (~80 lignes)
├── routes/
│   ├── __init__.py     # Exports centralisés
│   ├── auth.py         # Authentification
│   ├── payments.py     # Paiements Stripe
│   ├── workouts.py     # Entraînements
│   ├── supplements.py  # Nutrition
│   ├── messages.py     # Messagerie
│   ├── reminders.py    # Rappels
│   ├── user.py         # Profil utilisateur
│   ├── social.py       # Réseaux sociaux
│   ├── lives.py        # Live streaming
│   ├── livekit.py      # WebRTC calls
│   ├── running.py      # Course à pied
│   ├── rewards.py      # Gamification
│   └── reviews.py      # Avis
├── utils/
│   └── config.py       # Configuration centralisée
└── models/
    └── schemas.py      # Modèles Pydantic
```

### ✅ REFACTORISATION FRONTEND INITIÉE

Création de composants admin réutilisables :

```
frontend/src/components/admin/
├── index.js
├── AdminDashboard.js     # Tableau de bord
├── AdminSocialLinks.js   # Gestion réseaux sociaux
└── AdminLiveAnalytics.js # Stats des lives
```

`AdminPage.js` utilise maintenant ces composants, réduisant sa taille et améliorant la maintenabilité.

### ✅ ARCHIVE GITHUB CRÉÉE

**Fichier**: `/app/FitMaxPro_GitHub_Final.zip` (1.3 MB)
- ✅ Code source complet et refactorisé
- ✅ README.md avec documentation complète
- ✅ .env.example pour backend et frontend
- ✅ Dockerfiles inclus
- ✅ **AUCUNE clé API ou credential**

---

## All Implemented Features

### 🎥 LIVE STREAMING & APPELS (LiveKit)
- Streaming en direct avec WebRTC
- Changement de caméra avant/arrière
- Contrôles complets (Micro, Caméra, Partage d'écran)
- Appels 1-to-1 coach/abonnés
- Notifications d'appels entrants
- Chat en temps réel
- Statistiques d'engagement

### 📱 RÉSEAUX SOCIAUX
- Design moderne avec cartes et gradients
- Support complet (Instagram, YouTube, TikTok, Facebook, etc.)
- Gestion admin complète

### 🏆 GAMIFICATION
- Système de points automatique
- 5 récompenses échangeables
- Badges par paliers
- Hall of Fame
- Défis hebdomadaires

### 💪 ENTRAÎNEMENTS
- 72 séances d'entraînement
- 2 plans nutritionnels
- Échauffements et étirements
- Suivi des sessions

### 💳 ABONNEMENTS
- Intégration Stripe
- Période d'essai 7 jours
- Plans Standard/VIP

### 🏃 COURSE À PIED
- Suivi GPS
- Classement temps réel
- Défis hebdomadaires

---

## API Endpoints (v2.0 Refactorisée)

### Authentification (`/api/auth`)
- POST /register - Inscription
- POST /login - Connexion
- POST /logout - Déconnexion
- GET /me - Utilisateur actuel

### Entraînements (`/api/workouts`)
- GET / - Liste des entraînements
- GET /{id} - Détail d'un entraînement

### Live Streaming (`/api/lives`)
- GET / - Lives actifs
- GET /analytics - Statistiques (admin)
- GET /scheduled - Lives programmés
- POST / - Créer un live (admin)
- POST /{id}/join - Rejoindre un live

### Course à Pied (`/api/running`)
- GET /history - Historique
- GET /leaderboard - Classement
- GET /challenges - Défis

### Récompenses (`/api/rewards`)
- GET /catalog - Catalogue
- POST /redeem - Échanger des points
- GET /my-points - Mes points

### Avis (`/api/reviews`)
- GET / - Avis publics
- POST / - Créer un avis

---

## Test Credentials
- **Admin**: admin@fitmaxpro.com / admin123
- **User**: testuser@test.com / password123

---

## Backlog (P2-P3)

### P2 - Prochaines améliorations
- [ ] Compléter la refactorisation de `AdminPage.js` (extraire tous les onglets)
- [ ] Logique d'abonnement annuel Stripe (bloquer annulation avant 12 mois)
- [ ] Tests automatisés (pytest)

### P3 - Future
- [ ] Achats In-App natifs (RevenueCat)
- [ ] Notifications push pour les appels

---

## Technologies
- **Backend**: FastAPI, Motor (MongoDB), Pydantic, LiveKit Python SDK
- **Frontend**: React, Tailwind CSS, ShadcnUI, LiveKit React SDK, Recharts
- **WebRTC**: LiveKit
- **Paiements**: Stripe
- **Emails**: Resend

---

## Changelog

### 5 Mars 2026
- ✅ Refactorisation complète du backend (6900 -> 80 lignes dans server.py)
- ✅ Création de 14 modules de routes
- ✅ Début de refactorisation frontend avec 3 composants admin
- ✅ Archive GitHub finale générée sans credentials
