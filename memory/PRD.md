# FitMaxPro - Product Requirements Document

## Original Problem Statement
Application de fitness "FitMaxPro" complète avec Live Streaming, Appels 1-to-1, programmes d'entraînement, course à pied, gamification et plus encore.

## Website URL
**https://fitmax-gains.preview.emergentagent.com**

## Session du 5 Mars 2026 - Refactorisation Backend

### ✅ REFACTORISATION BACKEND COMPLÉTÉE

Le backend monolithique (`server.py` ~6900 lignes) a été refactorisé en architecture modulaire:

```
backend/
├── server.py           # Point d'entrée (~100 lignes)
├── routes/
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
│   └── rewards.py      # Gamification
├── utils/
│   └── config.py       # Configuration centralisée
└── models/
    └── schemas.py      # Modèles Pydantic
```

### ✅ ARCHIVE GITHUB CRÉÉE

**Fichier**: `/app/FitMaxPro_GitHub_Final.zip` (1.3 MB)
- Code source complet refactorisé
- README.md avec documentation
- .env.example pour backend et frontend
- Dockerfiles inclus
- AUCUNE clé API ou credential

## All Implemented Features

### 🎥 LIVE STREAMING & APPELS (LiveKit)
- Changement de caméra avant/arrière
- Contrôles complets (Micro, Caméra, Partage d'écran)
- Appels 1-to-1 coach/abonnés
- Notifications d'appels entrants
- Chat en temps réel

### 📱 RÉSEAUX SOCIAUX
- Design moderne avec cartes et gradients
- Support complet (Instagram, YouTube, TikTok, etc.)
- Gestion admin

### 🏆 GAMIFICATION
- Système de points automatique
- Badges par paliers
- Hall of Fame
- Défis hebdomadaires

### 💳 ABONNEMENTS
- Intégration Stripe
- Période d'essai 7 jours
- Plans Standard/VIP

### 🏃 COURSE À PIED
- Suivi GPS
- Classement temps réel
- Défis hebdomadaires

## Test Credentials
- **Admin**: admin@fitmaxpro.com / admin123
- **User**: testuser@test.com / password123

## API Routes (v2.0)

### Authentification
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

### Entraînements
- GET /api/workouts
- GET /api/workouts/:id
- POST /api/workout/start
- POST /api/workout/end

### Live Streaming
- GET /api/lives
- GET /api/lives/analytics
- POST /api/lives
- POST /api/lives/:id/join

### Course à Pied
- GET /api/running/history
- GET /api/running/leaderboard
- GET /api/running/challenges

### Récompenses
- GET /api/rewards/catalog
- POST /api/rewards/redeem
- GET /api/rewards/my-points

## Backlog (P2-P3)
- Logique d'abonnement annuel Stripe (bloquer annulation avant 12 mois)
- Achats In-App natifs (RevenueCat)
- Notifications push pour les appels
- Refactorisation frontend AdminPage.js

## Technologies
- **Backend**: FastAPI, Motor (MongoDB), Pydantic
- **Frontend**: React, Tailwind CSS, ShadcnUI
- **WebRTC**: LiveKit
- **Paiements**: Stripe
- **Emails**: Resend
