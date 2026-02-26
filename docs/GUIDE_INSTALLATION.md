# Guide d'Installation - FitMaxPro

Ce guide vous explique comment installer et lancer FitMaxPro sur votre machine locale.

## Prérequis

### Logiciels requis

| Logiciel | Version minimum | Téléchargement |
|----------|-----------------|----------------|
| Node.js | 18.x | https://nodejs.org |
| Python | 3.9+ | https://python.org |
| MongoDB | 6.0+ | https://mongodb.com |
| Git | 2.x | https://git-scm.com |

### Comptes nécessaires

- **Stripe** : https://stripe.com (pour les paiements)
- **Google Cloud** : https://console.cloud.google.com (pour OAuth - optionnel)

---

## Installation pas à pas

### Étape 1 : Cloner le projet

```bash
git clone https://github.com/votre-username/fitmaxpro.git
cd fitmaxpro
```

### Étape 2 : Installer MongoDB

**Option A - MongoDB local :**
```bash
# macOS avec Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt install mongodb
sudo systemctl start mongodb

# Windows
# Télécharger l'installateur sur mongodb.com
```

**Option B - MongoDB Atlas (Cloud) :**
1. Créer un compte sur https://cloud.mongodb.com
2. Créer un cluster gratuit (M0)
3. Copier l'URL de connexion

### Étape 3 : Configurer le Backend

```bash
cd backend

# Créer l'environnement virtuel Python
python -m venv venv

# Activer l'environnement
# Linux/macOS :
source venv/bin/activate
# Windows :
venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Créer le fichier de configuration
cp .env.example .env
```

Éditer `backend/.env` :
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=fitmaxpro
STRIPE_API_KEY=sk_test_votre_cle
JWT_SECRET=un_secret_tres_long_et_securise
```

### Étape 4 : Configurer le Frontend

```bash
cd ../frontend

# Installer les dépendances (utiliser yarn de préférence)
yarn install
# ou
npm install

# Créer le fichier de configuration
cp .env.example .env
```

Éditer `frontend/.env` :
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

### Étape 5 : Peupler la base de données

```bash
cd ../backend

# S'assurer que l'environnement virtuel est activé
source venv/bin/activate  # Linux/macOS

# Ajouter les programmes d'entraînement
python seed_detailed_workouts.py

# Ajouter les images et vidéos
python seed_media_content.py
```

### Étape 6 : Lancer l'application

**Terminal 1 - Backend :**
```bash
cd backend
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Terminal 2 - Frontend :**
```bash
cd frontend
yarn start
```

### Étape 7 : Accéder à l'application

Ouvrir votre navigateur sur : **http://localhost:3000**

---

## Vérification de l'installation

### Tester le backend
```bash
curl http://localhost:8001/health
# Devrait retourner : {"status":"healthy"}
```

### Tester le frontend
Ouvrir http://localhost:3000 et vérifier que la page d'accueil s'affiche.

---

## Résolution des problèmes courants

### Erreur : "Module not found"
```bash
# Backend
pip install -r requirements.txt

# Frontend
yarn install
```

### Erreur : "Connection refused" MongoDB
```bash
# Vérifier que MongoDB est lancé
sudo systemctl status mongodb  # Linux
brew services list            # macOS
```

### Erreur : Port déjà utilisé
```bash
# Trouver et tuer le processus
lsof -i :8001  # Backend
lsof -i :3000  # Frontend
kill -9 <PID>
```

---

## Prochaines étapes

1. [Configurer Stripe](GUIDE_STRIPE.md)
2. [Déployer en production](GUIDE_DEPLOIEMENT.md)
