# FitMaxPro - Application de Fitness Complète

Application de fitness professionnelle avec programmes d'entraînement, défis hebdomadaires, système de badges, appels vidéo, live streaming, et bien plus.

## 🚀 Fonctionnalités

### Pour les utilisateurs
- **138+ programmes d'entraînement** (Prise de masse, Perte de poids, Abdos, Jambes, Yoga, Programme Femmes)
- **Vidéos explicatives** pour chaque exercice
- **Défis hebdomadaires** avec récompenses en points
- **Système de badges** (Débutant → Bronze → Argent → Or → Platine → Diamant → Légende)
- **Hall of Fame** - Classement des membres par badges
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
- Attribution de points bonus
- Statistiques détaillées
- Notifications push broadcast

## 📋 Prérequis

- Node.js 18+
- Python 3.9+
- MongoDB 6+
- Yarn (recommandé) ou npm

## 🛠️ Installation

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

## 🔑 Configuration des Services

### Stripe (Paiements) - Obligatoire
1. Créez un compte sur [stripe.com](https://stripe.com)
2. Dashboard > Developers > API Keys
3. Copiez `STRIPE_API_KEY` (secret) et `STRIPE_PUBLIC_KEY` dans `.env`

### Resend (Emails) - Recommandé
1. Créez un compte sur [resend.com](https://resend.com)
2. Créez une clé API
3. Ajoutez `RESEND_API_KEY` dans `.env`

### LiveKit (Appels Vidéo) - Optionnel
1. Créez un compte sur [cloud.livekit.io](https://cloud.livekit.io) (gratuit)
2. Créez un projet
3. Settings > Keys
4. Ajoutez `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`

### RevenueCat (Achats In-App) - Pour mobile
1. Créez un compte sur [revenuecat.com](https://revenuecat.com)
2. Configurez vos produits iOS/Android
3. Ajoutez `REVENUECAT_API_KEY`

## 📱 Déploiement Mobile (Capacitor)

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

## 📁 Structure du Projet

```
fitmaxpro/
├── backend/
│   ├── server.py           # API FastAPI (~6500 lignes)
│   ├── requirements.txt    # Dépendances Python
│   ├── uploads/videos/     # Vidéos uploadées
│   └── .env.example        # Template configuration
├── frontend/
│   ├── src/
│   │   ├── components/     # Composants React réutilisables
│   │   ├── pages/          # Pages de l'application
│   │   ├── context/        # Contextes React (Auth)
│   │   └── hooks/          # Hooks personnalisés
│   ├── public/             # Assets statiques
│   ├── package.json        # Dépendances Node
│   └── .env.example        # Template configuration
├── README.md
├── docker-compose.yml      # Configuration Docker
└── GUIDE_APP_STORES.md     # Guide publication stores
```

## 🎯 Fonctionnalités Principales

### Défis Hebdomadaires
- 6 défis différents chaque semaine
- Récompenses de 50 à 150 points
- Progression en temps réel
- Notifications à la complétion

### Système de Badges
| Badge | Points requis | Emoji |
|-------|--------------|-------|
| Débutant | 0 | 🔘 |
| Bronze | 100 | 🥉 |
| Argent | 500 | 🥈 |
| Or | 1000 | 🥇 |
| Platine | 2500 | 💎 |
| Diamant | 5000 | 💠 |
| Légende | 10000 | 👑 |

### Points Automatiques
- +15 pts par séance complétée
- +1 pt par minute d'entraînement (max 30)
- +25 pts premier workout du jour
- +5-50 pts bonus série de jours consécutifs
- +25 pts par avis laissé

## 🔒 Sécurité

- **Ne jamais commiter** les fichiers `.env`
- Utilisez des clés de test Stripe en développement
- Les mots de passe sont hashés avec bcrypt
- Sessions JWT avec expiration

## 📞 Support

Pour toute question, contactez l'équipe de développement.

## 📄 Licence

Propriétaire - Tous droits réservés
