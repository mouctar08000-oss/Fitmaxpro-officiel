# FitMaxPro - Application Fitness

Application de fitness complète avec programmes d'entraînement, plans nutritionnels et système d'abonnement.

## Fonctionnalités

- **Authentification** : Email/mot de passe + Google OAuth
- **Programmes d'entraînement** : Débutant, Amateur, Pro (Prise de masse & Perte de poids)
- **Nutrition** : Suppléments et recettes avec macros
- **Médias** : Images et vidéos YouTube pour chaque exercice
- **Paiements** : Stripe avec 7 jours d'essai gratuit
- **Internationalisation** : Français et Anglais

## Structure du projet

```
FitMaxPro/
├── backend/
│   ├── server.py              # API FastAPI principale
│   ├── requirements.txt       # Dépendances Python
│   ├── seed_detailed_workouts.py  # Script de peuplement des exercices
│   ├── seed_media_content.py  # Script d'ajout des médias
│   ├── fix_videos.py          # Script de correction des vidéos
│   └── .env.example           # Template des variables d'environnement
├── frontend/
│   ├── src/
│   │   ├── components/        # Composants React réutilisables
│   │   ├── pages/             # Pages de l'application
│   │   ├── context/           # Contextes React (Auth)
│   │   ├── i18n.js            # Configuration internationalisation
│   │   └── App.js             # Point d'entrée de l'application
│   ├── public/                # Fichiers statiques
│   ├── package.json           # Dépendances Node.js
│   └── .env.example           # Template des variables d'environnement
└── docs/
    ├── GUIDE_INSTALLATION.md  # Guide d'installation
    ├── GUIDE_STRIPE.md        # Configuration Stripe
    └── GUIDE_DEPLOIEMENT.md   # Guide de déploiement
```

## Prérequis

- **Node.js** >= 18.x
- **Python** >= 3.9
- **MongoDB** (local ou Atlas)
- **Compte Stripe** (pour les paiements)

## Installation rapide

### 1. Cloner le repository

```bash
git clone https://github.com/votre-username/fitmaxpro.git
cd fitmaxpro
```

### 2. Configuration Backend

```bash
cd backend

# Créer l'environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

# Installer les dépendances
pip install -r requirements.txt

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés
```

### 3. Configuration Frontend

```bash
cd frontend

# Installer les dépendances
yarn install
# ou
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec votre URL backend
```

### 4. Lancer l'application

**Terminal 1 - Backend :**
```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Terminal 2 - Frontend :**
```bash
cd frontend
yarn start
# ou
npm start
```

L'application sera accessible sur `http://localhost:3000`

## Variables d'environnement

### Backend (.env)

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=fitmaxpro
STRIPE_API_KEY=sk_test_votre_cle_stripe
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret
GOOGLE_CLIENT_ID=votre_google_client_id
GOOGLE_CLIENT_SECRET=votre_google_client_secret
JWT_SECRET=votre_secret_jwt_tres_long
```

### Frontend (.env)

```env
REACT_APP_BACKEND_URL=http://localhost:8001
REACT_APP_GOOGLE_CLIENT_ID=votre_google_client_id
```

## Peupler la base de données

```bash
cd backend

# Ajouter les programmes d'entraînement
python seed_detailed_workouts.py

# Ajouter les images et vidéos
python seed_media_content.py
```

## API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Utilisateur connecté
- `POST /api/auth/logout` - Déconnexion

### Programmes
- `GET /api/workouts` - Liste des programmes
- `GET /api/workouts/{id}` - Détail d'un programme

### Nutrition
- `GET /api/supplements` - Plans nutritionnels

### Paiements
- `POST /api/payments/checkout` - Créer une session Stripe
- `GET /api/payments/status/{id}` - Statut du paiement
- `POST /api/webhook/stripe` - Webhook Stripe

## Déploiement

### Option 1 : Heroku
Voir `docs/GUIDE_DEPLOIEMENT.md`

### Option 2 : VPS (DigitalOcean, OVH, etc.)
Voir `docs/GUIDE_DEPLOIEMENT.md`

### Option 3 : Docker
```bash
docker-compose up -d
```

## Technologies utilisées

### Backend
- FastAPI (Python)
- MongoDB + Motor (async)
- Stripe API
- Passlib + JWT (authentification)

### Frontend
- React 18
- Tailwind CSS
- Shadcn/UI
- i18next (internationalisation)
- Axios

## Licence

Ce projet est la propriété de son créateur. Tous droits réservés.

## Support

Pour toute question, contactez : msoumah.etion@gmail.com
