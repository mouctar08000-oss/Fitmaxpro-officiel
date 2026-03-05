# FitMaxPro - Product Requirements Document

## Version
- **Version:** 2.5.0
- **Dernière mise à jour:** 5 Mars 2025

## Description du Produit
FitMaxPro est une application de fitness complète offrant du live streaming, des appels vidéo 1-to-1 coach/client, des programmes d'entraînement personnalisés, un suivi de course à pied avec GPS, et un système de gamification.

---

## Fonctionnalités Implémentées

### Core Features ✅
- [x] **Authentification** - Login/Signup avec JWT
- [x] **Dashboard utilisateur** - Vue d'ensemble personnalisée
- [x] **Navigation responsive** - Mobile et desktop

### Live Streaming ✅ (Mise à jour 5 Mars 2025)
- [x] Streaming WebRTC avec LiveKit
- [x] **Tokens JWT avec video grants** - Corrigé avec nouvelle syntaxe chaînée
- [x] Création de room LiveKit automatique
- [x] Chat en temps réel
- [x] **Bouton "Démarrer la caméra"** - Activation manuelle
- [x] Demandes de live (Live Requests)
- [x] Lives programmés

### Appels Vidéo 1-to-1 ✅
- [x] Appels coach/client avec LiveKit
- [x] Notifications d'appels entrants
- [x] Historique des appels

### Entraînements ✅
- [x] 72+ séances prédéfinies
- [x] Plans prise de masse / perte de poids
- [x] Exercices par groupe musculaire
- [x] Lecteur vidéo d'exercices

### Course à Pied ✅
- [x] Suivi GPS
- [x] Classements
- [x] Défis hebdomadaires

### Gamification ✅
- [x] Points et récompenses
- [x] Hall of Fame
- [x] Badges

### Paiements ✅
- [x] Stripe (abonnements web)
- [x] RevenueCat (achats in-app mobile) - Backend prêt
- [x] Webhooks configurés

### Admin Panel ✅
- [x] Dashboard analytique
- [x] Gestion abonnés
- [x] Statistiques lives
- [x] Gestion messages
- [x] Gestion avis
- [x] Liens réseaux sociaux
- [x] Gestion vidéos

---

## Architecture Technique

### Backend (FastAPI)
```
backend/
├── server.py              # Orchestrateur principal
├── routes/                # 18 modules de routes
│   ├── auth.py            # Authentification
│   ├── lives.py           # Live streaming
│   ├── livekit.py         # WebRTC
│   ├── payments.py        # Stripe
│   ├── iap.py             # RevenueCat
│   ├── notifications.py   # Push notifications
│   └── ...
├── utils/                 # Configuration
├── models/                # Pydantic schemas
└── tests/                 # Tests Pytest
```

### Frontend (React)
```
frontend/src/
├── components/
│   ├── admin/             # Composants admin (7 fichiers)
│   ├── ui/                # Shadcn components
│   ├── LiveKitRoom.js     # Composant streaming
│   └── ...
├── pages/
├── hooks/
│   └── usePushNotifications.js
└── context/
```

---

## Intégrations Tierces

| Service | Statut | Description |
|---------|--------|-------------|
| LiveKit | ✅ Configuré | WebRTC streaming |
| Stripe | ✅ Configuré | Paiements web |
| RevenueCat | ✅ Backend prêt | IAP mobile |
| Resend | ✅ Configuré | Emails |
| MongoDB | ✅ Actif | Base de données |

---

## Corrections Récentes (5 Mars 2025)

### Bug Caméra Live - RÉSOLU ✅
- **Problème:** Écran noir lors du live streaming
- **Cause:** Tokens JWT sans video grants (ancienne API livekit)
- **Solution:** 
  - Migration vers syntaxe chaînée `AccessToken().with_identity().with_grants()`
  - Création automatique de room LiveKit avant génération du token
  - Bouton "Démarrer la caméra" pour activation manuelle

### Routes API Corrigées
- `/api/lives/requests` - GET demandes de live
- `/api/lives/request` - POST nouvelle demande
- `/api/lives/scheduled` - GET lives programmés

---

## Livrables

### Archive GitHub ✅
- **Fichier:** `FitMaxPro_GitHub_Final.zip` (2.7 MB)
- **Contenu:**
  - Code source complet (frontend + backend)
  - Dockerfiles et docker-compose.yml
  - Fichiers `.env.example` (sans credentials)
  - README.md avec instructions
  - Configuration Android/iOS (Capacitor)

### Kit Marketing ✅ (5 Mars 2025)
- **Fichier:** `FitMaxPro_Marketing_Kit.zip` (4.6 MB)
- **Contenu:**
  - `MARKETING_KIT.md` - Guide complet avec tous les textes (descriptions, posts Instagram/Facebook/TikTok, scripts vidéos, hashtags)
  - 4 images promotionnelles générées:
    - `promo_hero.png` - Bannière principale (1536x1024)
    - `promo_live_streaming.png` - Promotion Lives (1024x1024)
    - `promo_workouts.png` - Promotion Entraînements (1024x1024)
    - `promo_running.png` - Promotion Running (1024x1024)

---

## Backlog / Tâches Futures

### P1 - Haute Priorité
- [ ] Finaliser intégration frontend RevenueCat
- [ ] Intégrer hook usePushNotifications dans App.js
- [ ] Compléter refactorisation AdminPage.js (14 onglets restants)

### P2 - Moyenne Priorité
- [ ] Logique abonnement annuel Stripe (blocage annulation)
- [ ] Améliorer couverture tests Pytest
- [ ] Optimisation performances frontend

### P3 - Basse Priorité
- [ ] Mode hors-ligne
- [ ] Synchronisation multi-appareils
- [ ] Analytics avancées

---

## Comptes de Test

| Type | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@fitmaxpro.com | admin123 |
| User | testuser@test.com | password123 |

---

## Notes Techniques

### Génération Token LiveKit (Nouvelle Syntaxe)
```python
from livekit.api import AccessToken, VideoGrants

token = (
    AccessToken(API_KEY, API_SECRET)
    .with_identity(user_id)
    .with_name(user_name)
    .with_grants(VideoGrants(
        room_join=True,
        room=room_name,
        can_publish=True,
        can_subscribe=True,
        can_publish_data=True
    ))
).to_jwt()
```

### Variables d'Environnement Requises

**Backend (.env):**
- MONGO_URL
- JWT_SECRET
- LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET
- STRIPE_API_KEY
- RESEND_API_KEY
- REVENUECAT_API_KEY
- VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY

**Frontend (.env):**
- REACT_APP_BACKEND_URL
- REACT_APP_STRIPE_PUBLIC_KEY
