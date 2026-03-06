# FitMaxPro - Product Requirements Document

## Version
- **Version:** 3.0.0
- **Dernière mise à jour:** 6 Mars 2025

## Description du Produit
FitMaxPro est une application de fitness complète offrant du live streaming, des appels vidéo 1-to-1 coach/client, des programmes d'entraînement personnalisés, un suivi de course à pied avec GPS, un système de gamification, **mode hors-ligne** et **synchronisation multi-appareils**.

---

## Fonctionnalités Implémentées

### Core Features
- [x] **Authentification** - Login/Signup avec JWT
- [x] **Dashboard utilisateur** - Vue d'ensemble personnalisée
- [x] **Navigation responsive** - Mobile et desktop

### Live Streaming
- [x] Streaming WebRTC avec LiveKit
- [x] **Tokens JWT avec video grants** - Corrigé avec syntaxe chaînée
- [x] Création de room LiveKit automatique
- [x] Chat en temps réel
- [x] **Bouton "Démarrer la caméra"** - Activation manuelle
- [x] Demandes de live (Live Requests)
- [x] Lives programmés

### Appels Vidéo 1-to-1
- [x] Appels coach/client avec LiveKit
- [x] Notifications d'appels entrants
- [x] Historique des appels

### Entraînements
- [x] 72+ séances prédéfinies
- [x] Plans prise de masse / perte de poids
- [x] Exercices par groupe musculaire
- [x] Lecteur vidéo d'exercices

### Admin Panel - Gestion des Séances
- [x] **CRUD complet** - Créer, Lire, Modifier, Supprimer
- [x] **Upload vidéos** - Max 500MB avec compression automatique
- [x] **Upload images** - Max 10MB
- [x] **Compression vidéo FFmpeg** - H.264, 720p, optimisé web
- [x] Gestion des exercices par séance

### Routines (NOUVEAU 6 Mars 2025)
- [x] **Routes /api/routines/warmup** - Échauffement avec 5 exercices
- [x] **Routes /api/routines/stretching** - Étirements avec 5 exercices
- [x] Suivi des sessions de routine

### Mode Hors-ligne (NOUVEAU 6 Mars 2025)
- [x] **Service offlineStorage.js** - IndexedDB pour données locales
- [x] **Hook useOffline.js** - Gestion état hors-ligne
- [x] **Composant OfflineManager.js** - UI téléchargement
- [x] **Service Worker amélioré** - Cache API et images
- [x] **Indicateur statut** - Badge vert "Online" / orange "Offline"
- [x] **Bouton téléchargement** - Sur chaque séance

### Synchronisation Multi-Appareils (NOUVEAU 6 Mars 2025)
- [x] **Route WebSocket /api/sync/ws/{user_id}** - Sync temps réel
- [x] **Hook useSync.js** - Connexion WebSocket
- [x] **Stratégie "Last write wins"** - Gestion conflits
- [x] **Compteur appareils connectés**
- [x] **Sync progression workout**

### Course à Pied
- [x] Suivi GPS
- [x] Classements
- [x] Défis hebdomadaires

### Gamification
- [x] Points et récompenses
- [x] Hall of Fame
- [x] Badges

### Paiements
- [x] Stripe (abonnements web)
- [x] RevenueCat (achats in-app mobile) - Backend prêt
- [x] Webhooks configurés
- [x] **Logique abonnement annuel** - Blocage annulation avant 12 mois
- [x] Réactivation d'abonnement

### Admin Panel
- [x] Dashboard analytique
- [x] Gestion abonnés
- [x] Statistiques lives
- [x] Gestion messages
- [x] Gestion avis
- [x] Liens réseaux sociaux
- [x] Gestion vidéos
- [x] **Gestion séances**

---

## Architecture Technique

### Backend (FastAPI) - 20 modules de routes
```
backend/routes/
├── auth.py            # Authentification
├── lives.py           # Live streaming
├── livekit.py         # WebRTC
├── payments.py        # Stripe + logique annuelle
├── workouts.py        # CRUD admin + upload + compression
├── routines.py        # NOUVEAU - Échauffement & étirements
├── sync.py            # NOUVEAU - WebSocket sync
├── iap.py             # RevenueCat
├── notifications.py   # Push notifications
└── ...
```

### Frontend (React)
```
frontend/src/
├── components/
│   ├── OfflineManager.js  # NOUVEAU - Gestion hors-ligne
│   └── admin/
├── hooks/
│   ├── useOffline.js      # NOUVEAU - Hook hors-ligne
│   ├── useSync.js         # NOUVEAU - Hook WebSocket
│   └── ...
├── services/
│   └── offlineStorage.js  # NOUVEAU - IndexedDB
└── public/
    └── sw.js              # MODIFIÉ - Cache amélioré
```

---

## Tests Validés (6 Mars 2025)

### Bug "Workout not found"
- **Statut:** CORRIGÉ
- **Cause:** Routes /api/routines manquantes
- **Solution:** Création de routines.py avec échauffement et étirements

### Compression Vidéo FFmpeg
- **Statut:** PASSÉ
- Format sortie: H.264, 720p, optimisé streaming

### Logique Abonnement Annuel Stripe
- **Statut:** PASSÉ
- Abonnement annuel: Annulation bloquée (HTTP 403)
- Abonnement mensuel: Annulation autorisée (can_cancel=true)

### Mode Hors-ligne
- **Statut:** PASSÉ
- Indicateur "Online" affiché
- Bouton "Download" fonctionnel

---

## Livrables

### Archive GitHub (Mis à jour 6 Mars 2025)
- **Fichier:** `FitMaxPro_GitHub_Final.zip` (2.7 MB)
- **Contenu:**
  - Code source complet (frontend + backend)
  - 20 modules de routes backend
  - Mode hors-ligne + sync multi-appareils
  - Dockerfiles et docker-compose.yml
  - Fichiers `.env.example` (sans credentials)
  - README.md avec instructions
  - Configuration Android/iOS (Capacitor)

### Kit Marketing
- **Fichier:** `FitMaxPro_Marketing_Kit.zip` (4.6 MB)

---

## Backlog / Tâches Futures

### P1 - Haute Priorité
- [ ] Finaliser intégration frontend RevenueCat
- [ ] Compléter refactorisation AdminPage.js (13 onglets restants)

### P2 - Moyenne Priorité
- [ ] Améliorer couverture tests Pytest
- [ ] Optimisation performances frontend

### P3 - Basse Priorité (Complétées)
- [x] ~~Mode hors-ligne~~
- [x] ~~Synchronisation multi-appareils~~

---

## API Endpoints Clés

### Routines (NOUVEAU)
- `GET /api/routines/warmup` - Échauffement (5 exercices)
- `GET /api/routines/stretching` - Étirements (5 exercices)
- `POST /api/routine/start` - Démarrer session routine
- `POST /api/routine/end` - Terminer session routine

### Sync (NOUVEAU)
- `WS /api/sync/ws/{user_id}` - WebSocket temps réel
- `GET /api/sync/status/{user_id}` - Statut connexion
- `POST /api/sync/trigger/{user_id}` - Déclencher sync

### Admin Workouts
- `GET /api/workouts/admin/all` - Liste toutes les séances
- `POST /api/workouts/admin/create` - Créer une séance
- `POST /api/workouts/admin/upload/video` - Upload + compression

### Abonnements
- `GET /api/payments/subscription` - Détails + can_cancel
- `POST /api/payments/cancel` - Annulation (bloquée si annuel)

---

## Comptes de Test

| Type | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@fitmaxpro.com | admin123 |
| User | testuser@test.com | password123 |
