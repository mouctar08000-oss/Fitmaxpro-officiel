# Guide de Déploiement - FitMaxPro

Ce guide couvre plusieurs options de déploiement pour votre application.

---

## Option 1 : Railway (Recommandé - Simple)

Railway est une plateforme cloud simple qui gère automatiquement le déploiement.

### Étapes

1. Créer un compte sur https://railway.app
2. Connecter votre repository GitHub
3. Railway détecte automatiquement la configuration
4. Ajouter les variables d'environnement
5. Déployer !

### Coût
- Gratuit pour commencer (limite de 500h/mois)
- ~5$/mois pour un usage normal

---

## Option 2 : Render

### Backend (Web Service)

1. Aller sur https://render.com
2. New > Web Service
3. Connecter GitHub
4. Configuration :
   - **Build Command** : `pip install -r requirements.txt`
   - **Start Command** : `uvicorn server:app --host 0.0.0.0 --port $PORT`
5. Ajouter les variables d'environnement
6. Déployer

### Frontend (Static Site)

1. New > Static Site
2. Configuration :
   - **Build Command** : `yarn build`
   - **Publish Directory** : `build`

### Base de données

1. New > PostgreSQL ou utiliser MongoDB Atlas

---

## Option 3 : VPS (DigitalOcean, OVH, Hetzner)

### Prérequis
- VPS Ubuntu 22.04
- Domaine configuré

### Installation serveur

```bash
# Connexion SSH
ssh root@votre-ip

# Mise à jour
apt update && apt upgrade -y

# Installer les dépendances
apt install -y python3 python3-pip python3-venv nodejs npm nginx certbot python3-certbot-nginx

# Installer MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-org
systemctl start mongod
systemctl enable mongod
```

### Déployer l'application

```bash
# Créer un utilisateur
useradd -m -s /bin/bash fitmaxpro
su - fitmaxpro

# Cloner le projet
git clone https://github.com/votre-username/fitmaxpro.git
cd fitmaxpro

# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
nano .env  # Configurer les variables

# Frontend
cd ../frontend
npm install
cp .env.example .env
nano .env  # Configurer REACT_APP_BACKEND_URL
npm run build
```

### Configurer Nginx

```nginx
# /etc/nginx/sites-available/fitmaxpro
server {
    listen 80;
    server_name votre-domaine.com;

    # Frontend
    location / {
        root /home/fitmaxpro/fitmaxpro/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activer le site
ln -s /etc/nginx/sites-available/fitmaxpro /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# SSL avec Let's Encrypt
certbot --nginx -d votre-domaine.com
```

### Configurer systemd (Backend)

```ini
# /etc/systemd/system/fitmaxpro-backend.service
[Unit]
Description=FitMaxPro Backend
After=network.target

[Service]
User=fitmaxpro
WorkingDirectory=/home/fitmaxpro/fitmaxpro/backend
Environment="PATH=/home/fitmaxpro/fitmaxpro/backend/venv/bin"
ExecStart=/home/fitmaxpro/fitmaxpro/backend/venv/bin/uvicorn server:app --host 127.0.0.1 --port 8001
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload
systemctl start fitmaxpro-backend
systemctl enable fitmaxpro-backend
```

---

## Option 4 : Docker

### Dockerfile Backend

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

### Dockerfile Frontend

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .
RUN yarn build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    volumes:
      - mongodb_data:/data/db
    restart: always

  backend:
    build: ./backend
    environment:
      - MONGO_URL=mongodb://mongodb:27017
      - DB_NAME=fitmaxpro
    depends_on:
      - mongodb
    restart: always

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: always

volumes:
  mongodb_data:
```

### Lancer

```bash
docker-compose up -d
```

---

## Checklist de déploiement

- [ ] Variables d'environnement configurées
- [ ] Clés Stripe en mode LIVE
- [ ] Webhook Stripe configuré avec URL de production
- [ ] SSL/HTTPS activé
- [ ] MongoDB sécurisé (authentification)
- [ ] Sauvegardes automatiques configurées
- [ ] Monitoring mis en place

---

## Domaine personnalisé

1. Acheter un domaine (OVH, Namecheap, Google Domains)
2. Configurer les DNS :
   - Type A : `@` → IP de votre serveur
   - Type A : `www` → IP de votre serveur
3. Attendre la propagation (jusqu'à 48h)

---

## Support

Pour toute question technique, contactez : msoumah.etion@gmail.com
