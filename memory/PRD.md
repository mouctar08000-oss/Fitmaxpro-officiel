# FitMaxPro - Product Requirements Document

## Original Problem Statement
Application de fitness "FitMaxPro" complète avec Live Streaming, Appels 1-to-1, programmes d'entraînement, course à pied, gamification et plus encore.

## Website URL
**https://fitmax-gains.preview.emergentagent.com**

---

## Session du 5 Mars 2026 - Refactorisation Complète + Nouvelles Fonctionnalités

### ✅ REFACTORISATION BACKEND COMPLÉTÉE

Le backend monolithique (`server.py` ~6900 lignes) a été **entièrement refactorisé** en architecture modulaire :

```
backend/
├── server.py           # Point d'entrée (~80 lignes)
├── routes/
│   ├── __init__.py     # Exports centralisés
│   ├── auth.py         # Authentification
│   ├── payments.py     # Paiements Stripe
│   ├── workouts.py     # Entraînements
│   ├── supplements.py  # Nutrition
│   ├── messages.py     # Messagerie
│   ├── reminders.py    # Rappels
│   ├── user.py         # Profil utilisateur
│   ├── social.py       # Réseaux sociaux
│   ├── lives.py        # Live streaming
│   ├── livekit.py      # WebRTC calls
│   ├── running.py      # Course à pied
│   ├── rewards.py      # Gamification
│   ├── reviews.py      # Avis
│   ├── iap.py          # 🆕 RevenueCat In-App Purchases
│   └── notifications.py # 🆕 Push Notifications
├── utils/
│   └── config.py       # Configuration centralisée
└── models/
    └── schemas.py      # Modèles Pydantic
```

### ✅ REFACTORISATION FRONTEND INITIÉE

Création de composants admin réutilisables :

```
frontend/src/components/admin/
├── index.js
├── AdminDashboard.js     # Tableau de bord
├── AdminSocialLinks.js   # Gestion réseaux sociaux
├── AdminLiveAnalytics.js # Stats des lives
└── AdminSubscribers.js   # Gestion abonnés
```

### ✅ ACHATS IN-APP NATIFS (RevenueCat)

Nouvelle route `/api/iap/` pour gérer les abonnements iOS/Android :

- `GET /api/iap/products` - Liste des produits IAP
- `GET /api/iap/status` - Statut d'abonnement utilisateur
- `POST /api/iap/webhook` - Webhook RevenueCat pour sync des abonnements
- Support des événements: INITIAL_PURCHASE, RENEWAL, CANCELLATION, EXPIRATION, BILLING_ISSUE

**Configuration requise:**
1. Créer un compte RevenueCat
2. Configurer les produits dans App Store Connect / Google Play Console
3. Ajouter `REVENUECAT_API_KEY` dans les variables d'environnement

### ✅ NOTIFICATIONS PUSH POUR LES APPELS

Nouvelle route `/api/notifications/` avec support complet des push notifications :

- `GET /api/notifications/vapid-key` - Clé publique VAPID
- `POST /api/notifications/subscribe` - S'abonner aux notifications
- `POST /api/notifications/call-notification` - Envoyer une notification d'appel
- `POST /api/notifications/admin/broadcast` - Broadcast admin
- Service Worker mis à jour (`sw.js`) avec gestion des appels entrants

**Fonctionnalités:**
- Notifications d'appels entrants avec boutons "Répondre" / "Refuser"
- Vibration spéciale pour les appels
- Interaction requise (notification persistante)
- Ouverture automatique de la page d'appel

### ✅ ARCHIVE GITHUB FINALE

**Fichier**: `/app/FitMaxPro_GitHub_Final.zip` (1.3 MB)
- ✅ Code source complet et refactorisé (16 modules de routes)
- ✅ README.md avec documentation complète
- ✅ .env.example pour backend et frontend
- ✅ Dockerfiles inclus
- ✅ Hook usePushNotifications pour le frontend
- ✅ **AUCUNE clé API ou credential**

---

## All Implemented Features

### 🎥 LIVE STREAMING & APPELS (LiveKit)
- Streaming en direct avec WebRTC
- Changement de caméra avant/arrière
- Contrôles complets (Micro, Caméra, Partage d'écran)
- Appels 1-to-1 coach/abonnés
- **🆕 Notifications push pour les appels entrants**
- Chat en temps réel
- Statistiques d'engagement

### 📱 ACHATS IN-APP
- **🆕 Intégration RevenueCat**
- Support iOS (App Store) et Android (Google Play)
- Gestion automatique des webhooks
- 4 produits configurés (Standard/VIP mensuel et annuel)
- Synchronisation des abonnements en temps réel

### 🔔 NOTIFICATIONS PUSH
- **🆕 Service Worker dédié**
- **🆕 VAPID keys configurées**
- **🆕 Notifications d'appels interactives**
- **🆕 Broadcast admin vers tous les utilisateurs**

### 🏆 GAMIFICATION
- Système de points automatique
- 5 récompenses échangeables
- Badges par paliers
- Hall of Fame
- Défis hebdomadaires

### 💪 ENTRAÎNEMENTS
- 72 séances d'entraînement
- 2 plans nutritionnels
- Échauffements et étirements
- Suivi des sessions

### 💳 ABONNEMENTS
- Intégration Stripe (web)
- **🆕 Intégration RevenueCat (mobile)**
- Période d'essai 7 jours
- Plans Standard/VIP

### 🏃 COURSE À PIED
- Suivi GPS
- Classement temps réel
- Défis hebdomadaires

---

## API Endpoints (v2.0 - 16 modules)

| Module | Routes | Description |
|--------|--------|-------------|
| auth | 6 | Authentification |
| payments | 3 | Paiements Stripe |
| workouts | 8 | Entraînements |
| supplements | 2 | Nutrition |
| messages | 4 | Messagerie |
| reminders | 7 | Rappels |
| user | 3 | Profil |
| social | 4 | Réseaux sociaux |
| lives | 12 | Live streaming |
| livekit | 10 | WebRTC |
| running | 5 | Course à pied |
| rewards | 8 | Gamification |
| reviews | 6 | Avis |
| **iap** | 5 | In-App Purchases |
| **notifications** | 7 | Push Notifications |

---

## Test Credentials
- **Admin**: admin@fitmaxpro.com / admin123
- **User**: testuser@test.com / password123

---

## Technologies
- **Backend**: FastAPI, Motor (MongoDB), Pydantic, LiveKit Python SDK, pywebpush
- **Frontend**: React, Tailwind CSS, ShadcnUI, LiveKit React SDK, Recharts
- **WebRTC**: LiveKit
- **Paiements**: Stripe, RevenueCat
- **Emails**: Resend
- **Push**: Web Push API, VAPID

---

## Changelog

### 5 Mars 2026
- ✅ Refactorisation complète du backend (6900 -> 80 lignes dans server.py)
- ✅ Création de 16 modules de routes
- ✅ Début de refactorisation frontend avec 4 composants admin
- ✅ **Intégration RevenueCat pour les achats In-App**
- ✅ **Notifications push pour les appels entrants**
- ✅ Archive GitHub finale générée sans credentials

---

## Backlog Restant

### P2 - Améliorations
- [ ] Compléter la refactorisation de `AdminPage.js` (extraire tous les onglets)
- [ ] Tests automatisés (pytest)
- [ ] Logique abonnement annuel (bloquer annulation avant 12 mois)
