# 📦 CODE COMPLET FITMAXPRO - À Copier sur GitHub

## 🚀 Instructions pour créer votre Repository GitHub

### Étape 1 : Créer le repository
1. Allez sur https://github.com/new
2. Nom : `fitmaxpro`
3. Description : `Application fitness avec programmes d'entraînement et nutrition`
4. Privé ou Public selon votre choix
5. Cliquez "Create repository"

### Étape 2 : Créer les fichiers
Copiez chaque fichier ci-dessous dans votre repository GitHub.

---

# 📁 Structure des Dossiers

```
fitmaxpro/
├── backend/
│   ├── server.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── Dockerfile
│   ├── seed_detailed_workouts.py
│   └── seed_media_content.py
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   ├── index.css
│   │   ├── i18n.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── components/
│   │   │   ├── Navigation.js
│   │   │   ├── Footer.js
│   │   │   ├── ProtectedRoute.js
│   │   │   └── ui/  (composants Shadcn)
│   │   └── pages/
│   │       ├── LandingPage.js
│   │       ├── LoginPage.js
│   │       ├── SignupPage.js
│   │       ├── Dashboard.js
│   │       ├── PricingPage.js
│   │       ├── WorkoutsPage.js
│   │       ├── WorkoutDetailPage.js
│   │       ├── SupplementsPage.js
│   │       ├── SuccessPage.js
│   │       ├── AuthCallback.js
│   │       └── AdminPage.js
│   ├── package.json
│   ├── .env.example
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── tailwind.config.js
│   └── capacitor.config.json
├── docs/
│   ├── GUIDE_INSTALLATION.md
│   ├── GUIDE_STRIPE.md
│   └── GUIDE_DEPLOIEMENT.md
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

# ⬇️ FICHIERS À COPIER

## 📄 README.md (Racine)

```markdown
# FitMaxPro - Application Fitness

Application de fitness complète avec programmes d'entraînement, plans nutritionnels et système d'abonnement.

## Fonctionnalités

- **Authentification** : Email/mot de passe + Google OAuth
- **Programmes d'entraînement** : Débutant, Amateur, Pro (Prise de masse & Perte de poids)
- **Nutrition** : Suppléments et recettes avec macros
- **Médias** : Images et vidéos YouTube pour chaque exercice
- **Paiements** : Stripe avec 7 jours d'essai gratuit
- **Internationalisation** : Français et Anglais

## Installation rapide

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
cp .env.example .env
# Éditer .env avec vos clés
uvicorn server:app --port 8001 --reload
```

### 2. Frontend

```bash
cd frontend
yarn install
cp .env.example .env
# Éditer .env
yarn start
```

## Technologies

- **Backend** : FastAPI, MongoDB, Stripe
- **Frontend** : React, Tailwind CSS, Shadcn/UI
```

---

## 📄 .gitignore (Racine)

```
node_modules/
venv/
__pycache__/
*.pyc
.pytest_cache/
.env
.env.local
.env.production
build/
dist/
*.egg-info/
.idea/
.vscode/
*.swp
.DS_Store
Thumbs.db
*.log
coverage/
.coverage
android/
ios/
```

---

## 📄 docker-compose.yml (Racine)

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    container_name: fitmaxpro-db
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=fitmaxpro
    restart: always
    networks:
      - fitmaxpro-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: fitmaxpro-backend
    environment:
      - MONGO_URL=mongodb://mongodb:27017
      - DB_NAME=fitmaxpro
      - STRIPE_API_KEY=${STRIPE_API_KEY}
      - STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongodb
    restart: always
    networks:
      - fitmaxpro-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: fitmaxpro-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: always
    networks:
      - fitmaxpro-network

volumes:
  mongodb_data:

networks:
  fitmaxpro-network:
    driver: bridge
```

---

# 📁 BACKEND

## 📄 backend/.env.example

```
MONGO_URL=mongodb://localhost:27017
DB_NAME=fitmaxpro
STRIPE_API_KEY=sk_test_votre_cle_stripe
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret
GOOGLE_CLIENT_ID=votre_google_client_id
GOOGLE_CLIENT_SECRET=votre_google_client_secret
JWT_SECRET=votre_secret_jwt_super_long_minimum_32_caracteres
APP_URL=http://localhost:3000
```

## 📄 backend/Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends gcc && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

## 📄 backend/requirements.txt

```
fastapi==0.110.1
uvicorn==0.25.0
motor==3.3.1
pymongo==4.5.0
python-dotenv==1.2.1
pydantic==2.12.5
passlib==1.7.4
bcrypt==4.0.1
python-jose==3.5.0
httpx==0.28.1
stripe==14.3.0
email-validator==2.3.0
python-multipart==0.0.22
```

---

# 📁 FRONTEND

## 📄 frontend/.env.example

```
REACT_APP_BACKEND_URL=http://localhost:8001
REACT_APP_GOOGLE_CLIENT_ID=votre_google_client_id
```

## 📄 frontend/package.json

```json
{
  "name": "fitmaxpro-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@capacitor/android": "6.2.0",
    "@capacitor/app": "6.0.1",
    "@capacitor/cli": "6.2.0",
    "@capacitor/core": "6.2.0",
    "@capacitor/ios": "6.2.0",
    "@radix-ui/react-dialog": "^1.1.11",
    "@radix-ui/react-dropdown-menu": "^2.1.12",
    "@radix-ui/react-label": "^2.1.4",
    "@radix-ui/react-slot": "^1.2.0",
    "@radix-ui/react-tabs": "^1.1.9",
    "axios": "^1.8.4",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "i18next": "^25.8.13",
    "i18next-browser-languagedetector": "^8.2.1",
    "lucide-react": "^0.507.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-i18next": "^16.5.4",
    "react-router-dom": "^7.5.1",
    "react-scripts": "5.0.1",
    "sonner": "^2.0.3",
    "tailwind-merge": "^3.2.0",
    "tailwindcss-animate": "^1.0.7"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test"
  },
  "browserslist": {
    "production": [">0.2%", "not dead", "not op_mini all"],
    "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
  },
  "devDependencies": {
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17"
  }
}
```

## 📄 frontend/Dockerfile

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

RUN yarn build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

## 📄 frontend/nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 📄 frontend/tailwind.config.js

```javascript
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))'
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};
```

## 📄 frontend/capacitor.config.json

```json
{
  "appId": "com.fitmaxpro.app",
  "appName": "FitMaxPro",
  "webDir": "build",
  "server": {
    "androidScheme": "https"
  },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 2000,
      "backgroundColor": "#09090b",
      "showSpinner": false
    }
  }
}
```

---

# ⚠️ NOTE IMPORTANTE

Ce fichier contient la structure et les fichiers de configuration.

**Les fichiers de code source complets (server.py, pages React, etc.) sont très longs.**

**Pour obtenir le code complet :**
1. Contactez le support Emergent pour résoudre le problème "Save to GitHub"
2. Ou continuez à me demander les fichiers individuellement

**Fichiers déjà documentés dans cette session :**
- ✅ backend/server.py (890 lignes)
- ✅ frontend/src/App.js
- ✅ frontend/src/i18n.js
- ✅ frontend/src/context/AuthContext.js
- ✅ frontend/src/pages/*.js (toutes les pages)
- ✅ frontend/src/components/*.js

---

# 📱 PUBLICATION APP STORE / GOOGLE PLAY

## Prérequis

| Élément | Coût | Lien |
|---------|------|------|
| Apple Developer | 99$/an | https://developer.apple.com/programs/ |
| Google Play Console | 25$ (une fois) | https://play.google.com/console/signup |

## Étapes

1. **Créer les comptes développeurs**
2. **Générer l'icône** (1024x1024px) avec Canva
3. **Prendre des captures d'écran** de l'app
4. **Builder l'application** :
   ```bash
   cd frontend
   yarn build
   npx cap add android
   npx cap add ios
   npx cap sync
   ```
5. **Soumettre aux stores**

Voir les guides détaillés :
- `/docs/GUIDE_DEPLOIEMENT.md`
- `PUBLICATION_APP_STORES.md`
- `MOBILE_DEPLOYMENT_GUIDE.md`
