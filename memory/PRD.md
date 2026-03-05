# FitMaxPro - Product Requirements Document

## Original Problem Statement
Application de fitness "FitMaxPro" complète avec Live Streaming, Appels 1-to-1, programmes d'entraînement, course à pied, gamification et plus encore.

## Website URL
**https://fitmax-gains.preview.emergentagent.com**

---

## ✅ SESSION FINALE - 5 Mars 2026

### ARCHIVE GITHUB PRÊTE

📦 **`/app/FitMaxPro_GitHub_Final.zip`** (1.3 MB - 162 fichiers)

**Contenu:**
- ✅ Backend refactorisé (16 modules de routes)
- ✅ Frontend avec composants admin refactorisés
- ✅ Tests pytest
- ✅ Docker (docker-compose.yml + Dockerfiles)
- ✅ README.md documenté
- ✅ .env.example pour backend et frontend
- ✅ **AUCUNE CLÉ API NI CREDENTIAL**

---

### Architecture Backend

```
backend/
├── server.py           # Point d'entrée (~80 lignes)
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
│   ├── rewards.py      # Gamification
│   ├── reviews.py      # Avis
│   ├── iap.py          # In-App Purchases (RevenueCat)
│   └── notifications.py # Push Notifications
├── utils/config.py     # Configuration centralisée
├── models/schemas.py   # Modèles Pydantic
└── tests/              # Tests pytest
```

### Architecture Frontend

```
frontend/src/
├── components/
│   ├── admin/          # 7 composants refactorisés
│   │   ├── AdminDashboard.js
│   │   ├── AdminSubscribers.js
│   │   ├── AdminLiveAnalytics.js
│   │   ├── AdminSocialLinks.js
│   │   ├── AdminMessages.js
│   │   ├── AdminVideos.js
│   │   └── AdminReviews.js
│   └── ui/             # ShadcnUI
├── pages/              # 24 pages
├── hooks/              # usePushNotifications, etc.
└── public/
    └── sw.js           # Service Worker
```

---

### Fonctionnalités Complètes

| Catégorie | Fonctionnalités |
|-----------|-----------------|
| 🎥 **Live & Appels** | Streaming LiveKit, Appels 1-to-1, Notifications push |
| 💪 **Entraînements** | 72 séances, Plans nutrition, Suivi |
| 🏃 **Course** | GPS, Classement, Défis |
| 🎮 **Gamification** | Points, Récompenses, Hall of Fame |
| 💳 **Paiements** | Stripe (web), RevenueCat (mobile) |
| 🔔 **Notifications** | Push Web, Appels entrants |

---

### Configuration Requise

#### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=fitmaxpro
STRIPE_API_KEY=sk_test_...
LIVEKIT_URL=wss://...
LIVEKIT_API_KEY=...
REVENUECAT_API_KEY=...
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
```

#### Frontend (.env)
```
REACT_APP_BACKEND_URL=http://localhost:8001
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...
```

---

### Credentials de Test
- **Admin:** admin@fitmaxpro.com / admin123
- **User:** testuser@test.com / password123

---

### Technologies
- **Backend:** FastAPI, Motor, Pydantic, pywebpush
- **Frontend:** React, Tailwind CSS, ShadcnUI
- **WebRTC:** LiveKit
- **Paiements:** Stripe, RevenueCat
- **Emails:** Resend

---

## Changelog

### 5 Mars 2026
- ✅ Refactorisation backend complète (6900 → 80 lignes)
- ✅ 16 modules de routes créés
- ✅ 7 composants admin frontend créés
- ✅ Intégration RevenueCat (achats In-App)
- ✅ Notifications push pour appels entrants
- ✅ Tests pytest
- ✅ Archive GitHub finale générée
