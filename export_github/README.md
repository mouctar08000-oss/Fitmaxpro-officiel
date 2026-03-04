# FitMaxPro - Application Fitness Complète

Application de fitness professionnelle avec programmes d'entraînement, suivi de progression, coaching en direct, et plus encore.

## 🚀 Fonctionnalités

### 👤 Utilisateurs
- **Authentification** : Email/mot de passe + Google OAuth
- **Session persistante** : Restez connecté jusqu'à déconnexion manuelle
- **Profil utilisateur** : Gestion des informations personnelles

### 💪 Programmes d'Entraînement
- **6 catégories** : Abdos, Jambes/Fessiers, Prise de Masse, Perte de Poids, Fitness Femmes, Yoga
- **856 exercices** avec vidéos explicatives YouTube
- **Mode Vidéo Temps Réel** : Regardez la vidéo pendant l'exercice
- **Timer automatique** : Chronométrage des exercices et temps de repos
- **Échauffement & Étirements** : Routines complètes

### 📺 Live Streaming (WebRTC)
- **Coaching en direct** via LiveKit
- **Demandes de live** : Les abonnés peuvent suggérer des thèmes
- **Notifications push** : Alertes automatiques pour les lives

### 🏃 Course à Pied
- **Suivi GPS** : Distance, durée, vitesse
- **Historique** : Toutes vos courses enregistrées
- **Points automatiques** : Récompenses basées sur la distance

### ⭐ Système d'Avis
- **Avis publics** avec notes
- **Likes** : Utilisateurs et admin peuvent aimer les avis
- **Badges** : "Abonné Vérifié", "Aimé par le Coach"
- **Points automatiques** : 25 points par avis

### 💬 Messagerie
- **Chat privé** avec le coach
- **Historique des conversations**
- **Notifications** en temps réel

### 📊 Suivi de Progression
- **Photos avant/après**
- **Graphiques d'évolution**
- **Historique des séances**

### 🎁 Système de Récompenses
- **Points** : Gagnés automatiquement
- **Niveaux** : Bronze, Argent, Or, Platine, Diamant
- **Actions récompensées** : Avis, courses, séances complétées

### 💳 Paiements (Stripe)
- **Abonnements** : Standard, VIP, Annuel
- **Checkout sécurisé**
- **Gestion des abonnements**

### 👨‍💼 Panel Admin
- **Dashboard** : Statistiques en temps réel
- **Gestion utilisateurs** : Abonnés, rôles, permissions
- **Gestion contenu** : Workouts, exercices, vidéos
- **Upload vidéos** : Système complet d'upload
- **Réseaux sociaux** : Liens individuels par plateforme
- **Emails** : Alertes inactivité, motivation hebdomadaire

## 🛠️ Technologies

### Frontend
- **React** 18
- **Tailwind CSS** + Shadcn/UI
- **React Router** v6
- **Axios** pour les API
- **i18next** (FR/EN)
- **Capacitor** (iOS/Android)

### Backend
- **FastAPI** (Python)
- **MongoDB** (Motor async driver)
- **JWT** Authentication
- **Stripe** Payments
- **Resend** Email
- **LiveKit** WebRTC

## 📦 Installation

### Prérequis
- Node.js 18+
- Python 3.11+
- MongoDB 6+

### Frontend
```bash
cd frontend
cp .env.example .env
# Éditez .env avec vos valeurs
yarn install
yarn start
```

### Backend
```bash
cd backend
cp .env.example .env
# Éditez .env avec vos valeurs
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001
```

### Seeding des données
```bash
cd backend
python seed_data.py
python seed_detailed_workouts.py
python seed_abs_complete.py
python seed_yoga_workouts.py
```

## 📱 Build Mobile (Capacitor)

### Android
```bash
cd frontend
yarn build
npx cap sync android
npx cap open android
```

### iOS
```bash
cd frontend
yarn build
npx cap sync ios
npx cap open ios
```

Consultez `GUIDE_APP_STORES.md` pour le guide complet de publication.

## 🔧 Configuration

### Variables d'environnement requises

#### Frontend (.env)
- `REACT_APP_BACKEND_URL` : URL de l'API backend

#### Backend (.env)
- `MONGO_URL` : URL de connexion MongoDB
- `STRIPE_SECRET_KEY` : Clé secrète Stripe
- `RESEND_API_KEY` : Clé API Resend (emails)

### Variables optionnelles
- LiveKit (live streaming)
- VAPID keys (push notifications)

## 📁 Structure du Projet

```
fitmaxpro/
├── frontend/
│   ├── src/
│   │   ├── components/     # Composants réutilisables
│   │   ├── pages/          # Pages de l'application
│   │   ├── context/        # Context React (Auth)
│   │   └── hooks/          # Custom hooks
│   ├── public/             # Assets statiques
│   ├── android/            # Build Android (Capacitor)
│   └── ios/                # Build iOS (Capacitor)
├── backend/
│   ├── server.py           # API FastAPI principale
│   ├── routes/             # Routes additionnelles
│   ├── utils/              # Utilitaires
│   └── tests/              # Tests unitaires
└── memory/
    └── PRD.md              # Documentation produit
```

## 🧪 Tests

```bash
cd backend
pytest tests/ -v
```

## 📄 Licence

Propriétaire - FitMaxPro

## 👨‍💻 Auteur

Développé avec ❤️ pour FitMaxPro
