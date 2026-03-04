# Étape 1 : Build
FROM node:18-alpine as build

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json yarn.lock ./

# Installer les dépendances
RUN yarn install --frozen-lockfile

# Copier le code source
COPY . .

# Variables d'environnement pour le build
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

# Build de production
RUN yarn build

# Étape 2 : Serveur Nginx
FROM nginx:alpine

# Copier le build
COPY --from=build /app/build /usr/share/nginx/html

# Copier la configuration Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
