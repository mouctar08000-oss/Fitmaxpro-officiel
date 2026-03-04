# FitMaxPro - Application de Fitness Complète 💪

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-47A248.svg)](https://www.mongodb.com/)

Application de fitness professionnelle avec programmes d'entraînement, défis hebdomadaires, système de badges, appels vidéo, live streaming, et bien plus.

## 🚀 Fonctionnalités

### Pour les utilisateurs
- **138+ programmes d'entraînement** avec vidéos explicatives
- **Défis hebdomadaires** avec récompenses en points
- **Système de badges** (Débutant → Légende)
- **Hall of Fame** - Classement communautaire
- **Suivi de course à pied** avec GPS
- **Plans nutritionnels** détaillés
- **Messagerie avec le coach**
- **Appels audio/vidéo** (via LiveKit)
- **Live streaming** pour les séances en groupe

### Pour l'administrateur
- Gestion complète des utilisateurs et abonnements
- Création/modification des programmes et exercices
- Upload de vidéos personnalisées
- Statistiques détaillées
- Notifications push broadcast

## 📋 Prérequis

- Node.js 18+
- Python 3.9+
- MongoDB 6+
- Yarn (recommandé)

## 🛠️ Installation

### 1. Cloner le repository

```bash
git clone https://github.com/your-username/fitmaxpro.git
cd fitmaxpro
```

### 2. Configuration Backend

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
# ⚠️ IMPORTANT: Éditez .env avec vos vraies valeurs

# Lancer le serveur
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### 3. Configuration Frontend

```bash
cd frontend

# Installer les dépendances
yarn install

# Configurer les variables d'environnement
cp .env.example .env
# ⚠️ IMPORTANT: Éditez .env avec vos vraies valeurs

# Lancer en développement
yarn start
```

## 🔑 Configuration des Services Externes

### Stripe (Paiements) - Obligatoire
1. Créez un compte sur [stripe.com](https://stripe.com)
2. Récupérez vos clés dans Dashboard > Developers > API Keys
3. Ajoutez-les dans `backend/.env` et `frontend/.env`

### Resend (Emails) - Recommandé
1. Créez un compte sur [resend.com](https://resend.com)
2. Créez une clé API
3. Ajoutez-la dans `backend/.env`

### LiveKit (Appels Vidéo) - Optionnel
1. Créez un compte sur [cloud.livekit.io](https://cloud.livekit.io)
2. Créez un projet et récupérez vos clés
3. Ajoutez-les dans `backend/.env`
4. *Note: L'app fonctionne en mode démo sans ces clés*

### RevenueCat (In-App Purchases) - Mobile uniquement
1. Créez un compte sur [revenuecat.com](https://revenuecat.com)
2. Configurez vos produits iOS/Android
3. Ajoutez la clé dans `backend/.env`

## 📁 Structure du Projet

```
fitmaxpro/
├── backend/
│   ├── server.py           # API FastAPI
│   ├── requirements.txt    # Dépendances Python
│   ├── uploads/videos/     # Vidéos uploadées
│   └── .env.example        # Template config
├── frontend/
│   ├── src/
│   │   ├── components/     # Composants React
│   │   ├── pages/          # Pages de l'app
│   │   └── context/        # Contextes React
│   ├── public/             # Assets statiques
│   └── .env.example        # Template config
├── docker-compose.yml      # Config Docker
└── README.md
```

## 🐳 Déploiement avec Docker

```bash
# Build et lancement
docker-compose up -d

# Vérifier les logs
docker-compose logs -f
```

## 📱 Déploiement Mobile (Capacitor)

```bash
cd frontend
yarn build
npx cap sync
npx cap open android  # ou: npx cap open ios
```

## 🔒 Sécurité

⚠️ **IMPORTANT pour les repositories publics :**

- **NE JAMAIS** commiter les fichiers `.env`
- Utilisez toujours `.env.example` comme template
- Les mots de passe sont hashés avec bcrypt
- Sessions JWT avec expiration
- Validez le `.gitignore` avant chaque commit

## 🎯 Système de Points

| Action | Points |
|--------|--------|
| Séance complétée | +15 pts |
| Bonus par minute | +1 pt (max 30) |
| Premier workout du jour | +25 pts |
| Série de jours | +5-50 pts |
| Avis laissé | +25 pts |
| Défi hebdomadaire | +50-150 pts |

## 🏆 Badges

| Badge | Points requis |
|-------|--------------|
| 🔘 Débutant | 0 |
| 🥉 Bronze | 100 |
| 🥈 Argent | 500 |
| 🥇 Or | 1000 |
| 💎 Platine | 2500 |
| 💠 Diamant | 5000 |
| 👑 Légende | 10000 |

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 Support

Pour toute question, ouvrez une issue sur GitHub.

---

Développé avec ❤️ par l'équipe FitMaxPro
