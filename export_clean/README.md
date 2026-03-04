# FitMaxPro - Application de Fitness Complète

Application de fitness professionnelle avec programmes d'entraînement, suivi nutritionnel, appels vidéo, live streaming, et système de récompenses.

## Fonctionnalités

### Pour les utilisateurs
- **138+ programmes d'entraînement** (Prise de masse, Perte de poids, Abdos, Jambes, Yoga, Programme Femmes)
- **Vidéos explicatives** pour chaque exercice
- **Suivi de course à pied** avec GPS, historique, statistiques et classements
- **Plans nutritionnels** avec recettes détaillées
- **Système de points et récompenses**
- **Messagerie avec le coach**
- **Appels audio/vidéo** avec le coach (via LiveKit)
- **Live streaming** pour les séances en groupe

### Pour l'administrateur
- Gestion complète des utilisateurs et abonnements
- Création et modification des programmes
- Upload de vidéos d'exercices
- Gestion des réseaux sociaux
- Statistiques détaillées
- Notifications push broadcast

## Installation

### Prérequis
- Node.js 18+
- Python 3.9+
- MongoDB 6+

### Backend

```bash
cd backend

# Créer l'environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou: venv\Scripts\activate  # Windows

# Installer les dépendances
pip install -r requirements.txt

# Configurer les variables d'environnement
cp .env.example .env
# Éditez .env avec vos clés API

# Lancer le serveur
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend

```bash
cd frontend

# Installer les dépendances
yarn install

# Configurer les variables d'environnement
cp .env.example .env
# Éditez .env avec l'URL de votre backend

# Lancer en développement
yarn start

# Build pour production
yarn build
```

## Configuration des Services Externes

### Stripe (Paiements)
1. Créez un compte sur [stripe.com](https://stripe.com)
2. Récupérez vos clés API dans Dashboard > Developers > API Keys
3. Ajoutez `STRIPE_API_KEY` et `STRIPE_PUBLIC_KEY` dans `.env`

### Resend (Emails)
1. Créez un compte sur [resend.com](https://resend.com)
2. Créez une clé API
3. Ajoutez `RESEND_API_KEY` dans `.env`

### LiveKit (Appels Vidéo)
1. Créez un compte sur [livekit.io](https://livekit.io)
2. Créez un projet cloud gratuit
3. Ajoutez `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` dans `.env`

### RevenueCat (Achats In-App)
1. Créez un compte sur [revenuecat.com](https://revenuecat.com)
2. Configurez vos produits iOS/Android
3. Ajoutez `REVENUECAT_API_KEY` dans `.env`

## Structure du Projet

```
fitmaxpro/
├── backend/
│   ├── server.py          # API FastAPI principale
│   ├── requirements.txt   # Dépendances Python
│   ├── uploads/           # Fichiers uploadés
│   └── .env.example       # Template des variables
├── frontend/
│   ├── src/
│   │   ├── components/    # Composants React
│   │   ├── pages/         # Pages de l'application
│   │   └── context/       # Contextes React
│   ├── public/            # Assets statiques
│   ├── package.json       # Dépendances Node
│   └── .env.example       # Template des variables
└── README.md
```

## API Endpoints Principaux

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/forgot-password` - Mot de passe oublié

### Workouts
- `GET /api/workouts` - Liste des programmes
- `POST /api/workout/start` - Démarrer une séance
- `POST /api/workout/end` - Terminer (+ points automatiques)

### Course à Pied
- `POST /api/running/log` - Enregistrer une course
- `GET /api/running/stats` - Statistiques
- `GET /api/running/leaderboard` - Classement

### Paiements
- `POST /api/checkout/create` - Créer une session Stripe
- `POST /api/iap/verify-purchase` - Vérifier achat in-app

## Déploiement Mobile (Capacitor)

```bash
cd frontend

# Build production
yarn build

# Synchroniser avec Capacitor
npx cap sync

# Ouvrir dans Android Studio
npx cap open android

# Ouvrir dans Xcode
npx cap open ios
```

## Compte Admin par Défaut

Après le premier démarrage, créez un compte admin en base de données ou utilisez le seed script fourni.

## Support

Pour toute question, contactez l'équipe de développement.

## Licence

Propriétaire - Tous droits réservés
