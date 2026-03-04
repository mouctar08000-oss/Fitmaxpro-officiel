# FitMaxPro - Application Fitness Complète

Application de fitness professionnelle avec programmes d'entraînement, vidéos en temps réel, suivi de progression, coaching en direct.

## 🚀 Fonctionnalités Principales

### 💪 Programmes d'Entraînement
- **856 exercices** avec vidéos YouTube fonctionnelles
- **6 catégories** : Abdos, Jambes/Fessiers, Prise de Masse, Perte de Poids, Fitness Femmes, Yoga
- **Mode Vidéo Temps Réel** : Regardez et faites l'exercice simultanément
- **Timer automatique** : Chronométrage exercices + repos
- **Échauffement & Étirements** inclus

### 👤 Authentification
- Email/mot de passe + Google OAuth
- Session persistante (1 an)
- Bouton voir/masquer mot de passe
- Page "Mot de passe oublié"

### 📺 Live Streaming (WebRTC)
- Coaching en direct via LiveKit
- Demandes de live par les abonnés
- Notifications push automatiques

### 🏃 Course à Pied
- Suivi GPS (distance, durée, vitesse)
- Points automatiques par distance

### ⭐ Système d'Avis
- Avis publics avec notes et likes
- Badges "Abonné Vérifié" / "Aimé par le Coach"
- 25 points par avis

### 💬 Messagerie
- Chat privé avec le coach
- Notifications temps réel

### 🎁 Récompenses
- Système de points automatique
- 5 niveaux : Bronze → Diamant

### 👨‍💼 Panel Admin
- Dashboard statistiques
- Gestion utilisateurs/contenus
- Upload vidéos
- Réseaux sociaux individuels
- Emails automatiques

## 🛠️ Technologies

- **Frontend** : React 18, Tailwind CSS, Shadcn/UI, Capacitor (iOS/Android)
- **Backend** : FastAPI, MongoDB, JWT
- **Intégrations** : Stripe, Resend, LiveKit

## 📦 Installation

### Frontend
```bash
cd frontend
cp .env.example .env
# Éditer .env avec vos valeurs
yarn install
yarn start
```

### Backend
```bash
cd backend
cp .env.example .env
# Éditer .env avec vos valeurs
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

## 📱 Build Mobile

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

## 📁 Structure

```
FitMaxPro/
├── frontend/          # React App
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── context/
│   ├── android/       # Capacitor Android
│   └── ios/           # Capacitor iOS
├── backend/           # FastAPI
│   ├── server.py
│   ├── routes/
│   └── tests/
└── memory/            # Documentation
```

## 📄 Licence

Propriétaire - FitMaxPro
