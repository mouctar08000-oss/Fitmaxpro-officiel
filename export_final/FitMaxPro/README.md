# FitMaxPro 🏋️

Application de fitness complète avec streaming en direct, programmes d'entraînement, gamification et plus encore.

## 🌟 Fonctionnalités

### 🎥 Live Streaming & Appels
- Streaming en direct avec WebRTC (LiveKit)
- Appels vidéo 1-to-1 entre coach et abonnés
- Chat en temps réel pendant les lives
- Réactions en direct (🔥❤️💪👏)

### 💪 Programmes d'Entraînement
- +70 séances d'entraînement
- Niveaux débutant, intermédiaire, avancé
- Échauffements et étirements
- Suivi des sessions et du temps

### 🏃 Course à Pied
- Suivi GPS des courses
- Classement en temps réel
- Défis hebdomadaires
- Statistiques détaillées

### 🎮 Gamification
- Système de points
- Badges et récompenses
- Hall of Fame
- Échange de points contre des récompenses

### 💳 Abonnements
- Intégration Stripe
- Période d'essai de 7 jours
- Plans Standard et VIP
- In-App Purchases (RevenueCat)

### 📱 Réseaux Sociaux
- Liens vers tous les réseaux sociaux
- Gestion admin complète

## 🚀 Installation

### Prérequis
- Node.js 18+
- Python 3.10+
- MongoDB 6+
- Compte Stripe (pour les paiements)
- Compte LiveKit (pour le streaming)

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

### Docker (Recommandé)

```bash
docker-compose up -d
```

## 📁 Structure du Projet

```
FitMaxPro/
├── backend/
│   ├── routes/           # Routes API modulaires
│   │   ├── auth.py       # Authentification
│   │   ├── workouts.py   # Entraînements
│   │   ├── lives.py      # Live streaming
│   │   ├── livekit.py    # WebRTC
│   │   ├── running.py    # Course à pied
│   │   ├── rewards.py    # Gamification
│   │   └── ...
│   ├── utils/            # Utilitaires
│   │   └── config.py     # Configuration centralisée
│   ├── models/           # Modèles Pydantic
│   └── server.py         # Point d'entrée FastAPI
├── frontend/
│   ├── src/
│   │   ├── components/   # Composants React
│   │   ├── pages/        # Pages de l'app
│   │   ├── context/      # Contexte Auth
│   │   └── hooks/        # Hooks personnalisés
│   └── public/
└── docker-compose.yml
```

## 🔐 Credentials de Test

- **Admin:** admin@fitmaxpro.com / admin123
- **User:** testuser@test.com / password123

## 📄 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Utilisateur actuel

### Entraînements
- `GET /api/workouts` - Liste des entraînements
- `GET /api/workouts/:id` - Détail d'un entraînement
- `POST /api/workout/start` - Démarrer une session
- `POST /api/workout/end` - Terminer une session

### Live Streaming
- `GET /api/lives` - Lives actifs
- `POST /api/lives` - Créer un live (admin)
- `POST /api/lives/:id/join` - Rejoindre un live
- `GET /api/lives/analytics` - Statistiques (admin)

### Course à Pied
- `GET /api/running/history` - Historique
- `GET /api/running/leaderboard` - Classement
- `GET /api/running/challenges` - Défis

### Récompenses
- `GET /api/rewards/catalog` - Catalogue
- `POST /api/rewards/redeem` - Échanger des points

## 🛠 Technologies

- **Backend:** FastAPI, Motor (MongoDB async), Pydantic
- **Frontend:** React, Tailwind CSS, ShadcnUI
- **WebRTC:** LiveKit
- **Paiements:** Stripe
- **Emails:** Resend
- **In-App:** RevenueCat

## 📝 Licence

MIT License - Voir LICENSE

## 👨‍💻 Auteur

Développé avec ❤️ pour FitMaxPro
