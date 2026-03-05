# FitMaxPro 🏋️

Application de fitness complète avec streaming en direct, programmes d'entraînement, gamification, achats in-app et notifications push.

## 🌟 Fonctionnalités

### 🎥 Live Streaming & Appels (LiveKit)
- Streaming en direct avec WebRTC
- Appels vidéo 1-to-1 coach/abonnés
- Changement de caméra avant/arrière
- Chat en temps réel
- Notifications push pour les appels entrants

### 💪 Programmes d'Entraînement
- +70 séances d'entraînement
- Plans nutritionnels
- Échauffements et étirements
- Suivi des sessions

### 🏃 Course à Pied
- Suivi GPS
- Classement en temps réel
- Défis hebdomadaires
- Statistiques détaillées

### 🎮 Gamification
- Système de points
- 5 récompenses échangeables
- Hall of Fame
- Badges par paliers

### 💳 Abonnements
- **Web**: Intégration Stripe
- **Mobile**: Intégration RevenueCat (iOS/Android)
- Période d'essai de 7 jours
- Plans Standard et VIP

### 🔔 Notifications Push
- Service Worker dédié
- Notifications d'appels interactives
- Broadcast admin

## 🚀 Installation

### Prérequis
- Node.js 18+
- Python 3.10+
- MongoDB 6+
- Comptes: Stripe, LiveKit, RevenueCat (optionnel)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou: venv\Scripts\activate  # Windows

pip install -r requirements.txt

cp .env.example .env
# Éditez .env avec vos credentials

uvicorn server:app --host 0.0.0.0 --port 8001
```

### Frontend

```bash
cd frontend
yarn install

cp .env.example .env
# Éditez .env

yarn start
```

### Docker

```bash
docker-compose up -d
```

## 📁 Structure du Projet

```
FitMaxPro/
├── backend/
│   ├── routes/           # 16 modules API
│   │   ├── auth.py       # Authentification
│   │   ├── workouts.py   # Entraînements
│   │   ├── lives.py      # Live streaming
│   │   ├── livekit.py    # WebRTC
│   │   ├── running.py    # Course à pied
│   │   ├── rewards.py    # Gamification
│   │   ├── iap.py        # Achats In-App
│   │   ├── notifications.py # Push Notifications
│   │   └── ...
│   ├── utils/config.py   # Configuration
│   ├── models/schemas.py # Modèles Pydantic
│   ├── tests/            # Tests pytest
│   └── server.py         # Point d'entrée
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/    # Composants admin refactorisés
│   │   │   └── ui/       # ShadcnUI
│   │   ├── pages/        # Pages de l'app
│   │   ├── hooks/        # Hooks personnalisés
│   │   └── context/      # Contexte Auth
│   └── public/
│       └── sw.js         # Service Worker
└── docker-compose.yml
```

## 🔐 Credentials de Test

- **Admin:** admin@fitmaxpro.com / admin123
- **User:** testuser@test.com / password123

## 📄 API Endpoints

| Module | Routes | Description |
|--------|--------|-------------|
| `/api/auth` | 6 | Authentification |
| `/api/payments` | 3 | Paiements Stripe |
| `/api/workouts` | 8 | Entraînements |
| `/api/supplements` | 2 | Nutrition |
| `/api/messages` | 4 | Messagerie |
| `/api/reminders` | 7 | Rappels |
| `/api/lives` | 12 | Live streaming |
| `/api/livekit` | 10 | WebRTC/Appels |
| `/api/running` | 5 | Course à pied |
| `/api/rewards` | 8 | Gamification |
| `/api/reviews` | 6 | Avis |
| `/api/iap` | 5 | In-App Purchases |
| `/api/notifications` | 7 | Push Notifications |

## 🧪 Tests

```bash
cd backend
pytest tests/ -v
```

## 🛠 Technologies

- **Backend:** FastAPI, Motor (MongoDB), Pydantic, pywebpush
- **Frontend:** React, Tailwind CSS, ShadcnUI
- **WebRTC:** LiveKit
- **Paiements:** Stripe, RevenueCat
- **Emails:** Resend
- **Push:** Web Push API

## 📝 Licence

MIT License

## 👨‍💻 Auteur

Développé avec ❤️ pour FitMaxPro
