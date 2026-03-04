# FitMaxPro - Application de Fitness Complète

Une application de fitness moderne et complète avec Live Streaming, programmes d'entraînement, course à pied, gamification et plus encore.

## Fonctionnalités

### 🎥 Live Streaming (WebRTC)
- Streaming en direct avec LiveKit
- Aperçu caméra avant diffusion
- Contrôles complets (micro, caméra, partage d'écran)
- Chat en temps réel pendant les lives
- Système de demandes de live pour les abonnés

### 🏋️ Programmes d'Entraînement
- 138 séances d'entraînement
- 6 catégories : Masse, Perte de poids, Abdos, Jambes, Femmes, Yoga
- Plus de 2500 vidéos d'exercices
- Suivi de progression

### 🏃 Course à Pied
- Suivi GPS en temps réel
- Historique des courses
- Statistiques détaillées
- Classement des coureurs
- Défis hebdomadaires

### 🎮 Gamification
- Système de points automatique
- Badges par paliers (Bronze, Argent, Or, etc.)
- Hall of Fame
- Défis hebdomadaires avec récompenses
- Boutique de récompenses

### 💳 Abonnements
- Intégration Stripe
- Plans Standard et VIP
- Abonnements mensuels et annuels
- Achats in-app via RevenueCat

### 📞 Appels Audio/Vidéo
- Appels 1-to-1 avec les coachs
- Intégration LiveKit WebRTC

## Stack Technique

### Backend
- **Framework**: FastAPI (Python)
- **Base de données**: MongoDB
- **Authentication**: JWT
- **Paiements**: Stripe
- **Emails**: Resend
- **WebRTC**: LiveKit
- **In-App Purchases**: RevenueCat

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI
- **Internationalisation**: i18next
- **WebRTC**: LiveKit React SDK

## Installation

### Prérequis
- Node.js 18+
- Python 3.9+
- MongoDB

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

pip install -r requirements.txt

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés API

# Lancer le serveur
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### Frontend

```bash
cd frontend
yarn install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec l'URL de votre backend

# Lancer le serveur de développement
yarn start
```

## Configuration

### Variables d'environnement Backend (.env)

```env
# MongoDB
MONGO_URL=mongodb://localhost:27017
DB_NAME=fitmaxpro

# JWT
SECRET_KEY=votre_secret_key_securise

# Stripe (Paiements)
STRIPE_API_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend (Emails)
RESEND_API_KEY=re_...

# LiveKit (WebRTC)
LIVEKIT_URL=wss://votre-projet.livekit.cloud
LIVEKIT_API_KEY=API...
LIVEKIT_API_SECRET=...

# RevenueCat (In-App Purchases)
REVENUECAT_API_KEY=...
```

### Variables d'environnement Frontend (.env)

```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

## Structure du Projet

```
FitMaxPro/
├── backend/
│   ├── server.py          # API FastAPI principale
│   ├── requirements.txt   # Dépendances Python
│   └── .env.example       # Template des variables d'env
├── frontend/
│   ├── src/
│   │   ├── components/    # Composants React
│   │   ├── pages/         # Pages de l'application
│   │   ├── context/       # Contextes React (Auth, etc.)
│   │   └── App.js         # Point d'entrée React
│   ├── package.json       # Dépendances Node.js
│   └── .env.example       # Template des variables d'env
├── README.md
├── LICENSE
└── docker-compose.yml
```

## Comptes de Test

- **Admin**: admin@fitmaxpro.com / admin123
- **Utilisateur**: test@test.com / test123

## API Endpoints Principaux

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

### Live Streaming
- `GET /api/lives` - Liste des lives actifs
- `POST /api/lives` - Créer un live (admin)
- `POST /api/lives/{id}/join` - Rejoindre un live
- `POST /api/lives/{id}/end` - Terminer un live

### Programmes
- `GET /api/programs` - Liste des programmes
- `GET /api/workouts/{program_type}` - Séances d'un programme

### Course à Pied
- `POST /api/running/sessions` - Enregistrer une course
- `GET /api/running/stats` - Statistiques

### Gamification
- `GET /api/rewards/points` - Points de l'utilisateur
- `GET /api/badges/status` - Statut des badges
- `GET /api/hall-of-fame` - Classement

## Déploiement

### Docker

```bash
docker-compose up -d
```

### Production
- Backend: Déployer sur Railway, Render, ou Heroku
- Frontend: Déployer sur Vercel, Netlify, ou AWS Amplify
- Base de données: MongoDB Atlas

## Licence

MIT License - voir le fichier [LICENSE](LICENSE)

## Auteur

FitMaxPro Team

---

**Note**: Cette application est prête pour la production. Assurez-vous de configurer toutes les clés API nécessaires avant le déploiement.
