# FitMaxPro - Product Requirements Document

## Original Problem Statement
Application de fitness "FitMaxPro" complète avec Live Streaming, programmes d'entraînement, course à pied, gamification et plus encore.

## Website URL
**https://fitmax-gains.preview.emergentagent.com**

## All Implemented Features (March 5, 2026)

### 🎥 LIVE STREAMING WEBRTC (LiveKit) ✅ PERFECTED
- **Composant LiveKitRoom.js** entièrement réécrit pour un rendu vidéo parfait
- **Connexion différée** : Se connecte au serveur SANS demander la caméra d'abord
- **Activation manuelle** : Caméra/micro activés APRÈS la connexion
- **Gestion d'erreurs** : Si la caméra échoue, le live reste actif
- **Interface complète** :
  - Badges : EN DIRECT, Connecté, Spectateurs
  - Contrôles : Micro, Caméra, Partage d'écran, Plein écran
  - Bouton "TERMINER LE LIVE" visible
  - Bouton "Activer la caméra" si non disponible
- **Live Chat** en temps réel

### 🏆 GAMIFICATION COMPLÈTE ✅
- Système de points automatique
- Badges par paliers (Bronze, Argent, Or, etc.)
- Hall of Fame
- Défis hebdomadaires

### 💳 ABONNEMENTS ✅
- Intégration Stripe
- Logique d'engagement 12 mois
- Achats in-app via RevenueCat

### 🏃 COURSE À PIED ✅
- Suivi GPS
- Statistiques et classement
- Défis hebdomadaires

## Changelog

### March 5, 2026 - Session 7
- ✅ **Bug écran noir CORRIGÉ** : LiveKit se connecte maintenant sans demander la caméra immédiatement
- ✅ **Interface live améliorée** : Contrôles visibles même si caméra non disponible
- ✅ **Archive GitHub mise à jour** avec les dernières corrections
- ⏳ **Refactorisation backend** : Structure de base créée (/backend/routes/, /backend/models/, /backend/utils/)
- ⏳ **Refactorisation frontend** : Dossier /frontend/src/pages/admin/ créé

### March 4, 2026 - Session 6
- ✅ Composant LiveKitRoom.js réécrit
- ✅ Aperçu caméra avant démarrage du live
- ✅ Tests passés : 100% des fonctionnalités live

## Test Credentials
- **Admin**: admin@fitmaxpro.com / admin123
- **User**: test@test.com / test123

## Prioritized Backlog

### ✅ Completed
- Live Streaming fonctionnel ✅
- Archive GitHub générée ✅

### P0 - Refactorisation (En cours)
- ⏳ Découper `server.py` (6820 lignes) en APIRouters
  - Structure créée : `/backend/routes/`, `/backend/models/`, `/backend/utils/`
  - Fichiers créés : `config.py`, `schemas.py`, `auth.py`
- ⏳ Découper `AdminPage.js` (4965 lignes) en composants
  - Dossier créé : `/frontend/src/pages/admin/`

### P1 - Prochaines fonctionnalités
- 🔲 Appels 1-to-1 via LiveKit
- 🔲 Tests unitaires

### P2 - Améliorations futures
- 🔲 Cron job pour emails automatiques
- 🔲 Configuration Capacitor pour stores

## Files Modified Today
- `/app/frontend/src/components/LiveKitRoom.js` - Bug écran noir corrigé
- `/app/backend/utils/config.py` - Configuration partagée (NOUVEAU)
- `/app/backend/models/schemas.py` - Modèles Pydantic (NOUVEAU)
- `/app/backend/utils/auth.py` - Utilitaires auth (NOUVEAU)
- `/app/FitMaxPro_GitHub_Public.zip` - Archive mise à jour

## Architecture Refactorisation (Planifiée)

### Backend (/app/backend/)
```
backend/
├── server.py          # Point d'entrée (à réduire)
├── routes/
│   ├── __init__.py
│   ├── auth.py        # Authentification
│   ├── workouts.py    # Programmes
│   ├── admin.py       # Administration
│   ├── live.py        # Live streaming
│   ├── points.py      # Gamification
│   ├── running.py     # Course
│   └── messages.py    # Messages
├── models/
│   ├── __init__.py
│   └── schemas.py     # ✅ Créé
└── utils/
    ├── __init__.py
    ├── config.py      # ✅ Créé
    └── auth.py        # ✅ Créé
```

### Frontend (/app/frontend/src/pages/)
```
pages/
├── AdminPage.js       # À découper
└── admin/
    ├── DashboardTab.js
    ├── SubscribersTab.js
    ├── WorkoutsTab.js
    ├── AnalyticsTab.js
    └── ...
```
