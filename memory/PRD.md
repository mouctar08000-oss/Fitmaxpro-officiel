# FitMaxPro - Product Requirements Document

## Original Problem Statement
Application de fitness "FitMaxPro" complète avec Live Streaming, Appels Audio/Vidéo, gestion d'abonnements, programmes d'entraînement, course à pied, et panneau d'administration.

## Website URL
**https://fitmax-gains.preview.emergentagent.com**

## All Implemented Features (March 4, 2026)

### 🎥 INTÉGRATION WEBRTC COMPLÈTE (LiveKit) ✅ UPDATED
- **Backend**: Endpoints complets `/api/livekit/*` pour tokens, rooms, appels
- **Frontend**: `CallPage.js` entièrement refait avec intégration LiveKit réelle
- **Mode démo**: Fonctionne sans clés LiveKit (simulation d'appel)
- **Mode production**: Connexion WebRTC réelle quand les clés sont configurées
- **Appels 1-to-1**: Initiation, réponse, fin d'appel avec logging
- **Live Streaming**: Support one-to-many via LiveKit

### 🏆 AUTOMATISATION DES POINTS ✅ UPDATED
Points automatiques pour:
- **Avis créé**: +25 points
- **Course à pied**:
  - +10 points de base
  - +5 points par km
  - +25 bonus pour 5km+
  - +50 bonus pour 10km+
- **Séance d'entraînement terminée** (NOUVEAU):
  - +15 points de base
  - +1 point par minute (max 30)
  - +25 bonus premier workout du jour
  - +5 à +50 bonus pour série de jours consécutifs

### 💳 ABONNEMENT ANNUEL STRIPE ✅
- Logique d'engagement 12 mois implémentée
- Vérification `can_cancel` avant annulation
- Demandes d'annulation avec approbation admin
- Onglet Admin "Subscriptions" avec gestion des demandes

### 📱 ACHATS IN-APP (RevenueCat) ✅ UPDATED
- Intégration complète avec l'API RevenueCat
- Vérification automatique des reçus quand clé API configurée
- Webhook pour mises à jour de statut en temps réel
- 4 produits IAP définis (standard/vip × monthly/annual)
- Mode manuel : stockage des reçus pour vérification admin

### 🏃 COURSE À PIED ✅
- **Page /running** : Interface complète de suivi de course
- **5 Onglets** : Courir, Historique, Stats, Classement, Défis
- **Partage Social** : Instagram, TikTok, X, WhatsApp
- **Badges permanents** : 7 badges à débloquer
- **Notifications Push** : Défis complétés, classement

### 🎁 SYSTÈME DE RÉCOMPENSES ✅
- **Page /rewards** : Boutique de récompenses avec points
- **6 récompenses** : Accès VIP, coaching, nutrition, badges

### 📺 LIVE STREAMING ✅
- Interface complète style TikTok
- Demande de Live avec 10 thèmes/programmes
- Programmation des lives par l'admin
- Notifications automatiques aux utilisateurs

### 📞 APPELS AUDIO/VIDÉO ✅
- Interface d'appel complète
- Contrôles micro/caméra/speaker
- Chronomètre et logging des appels
- Prêt pour LiveKit (en attente des clés)

### 📊 Workout Programs (138 séances)
| Type | Nombre | Description |
|------|--------|-------------|
| mass_gain | 44 | Prise de masse |
| weight_loss | 24 | Perte de poids |
| abs | 18 | Abdominaux |
| legs_glutes | 16 | Jambes & Fessiers |
| women_fitness | 18 | Spécial Femmes |
| yoga | 18 | Yoga & Détente |
| **TOTAL** | **138** | |

### 🛠️ Admin Capabilities ✅
- Création libre de séances (tous types/niveaux)
- Modification des vidéos d'exercices
- Upload de vidéos personnalisées
- Gestion des réseaux sociaux (individuelle)
- Statistiques détaillées
- Gestion des abonnements et annulations

## Test Credentials
- Email: test@test.com
- Password: test123
- Role: user

## Key API Endpoints

### LiveKit / Appels
```
GET /api/livekit/status - Statut LiveKit
POST /api/livekit/calls/initiate - Initier un appel
POST /api/livekit/calls/{id}/answer - Répondre
POST /api/livekit/calls/{id}/end - Terminer
```

### In-App Purchases
```
GET /api/iap/products - Produits disponibles
POST /api/iap/verify-purchase - Vérifier achat
POST /api/iap/webhook/revenuecat - Webhook RevenueCat
GET /api/iap/subscription-status - Statut abonnement
```

### Workout Points
```
POST /api/workout/start - Démarrer (renvoie session_id)
POST /api/workout/end - Terminer (renvoie points_earned)
GET /api/rewards/points - Points de l'utilisateur
```

### Abonnements
```
GET /api/subscription/can-cancel - Vérifier si peut annuler
POST /api/subscription/request-cancel - Demander annulation
GET /api/admin/cancellation-requests - Liste demandes (admin)
PUT /api/admin/cancellation-requests/{id}/process - Traiter (admin)
```

## Code Source

### Archive Disponible
`/app/FitMaxPro_Code_Source_Complet.zip` contient :
- ✅ Backend complet (server.py, requirements.txt)
- ✅ Frontend complet (React, tous composants)
- ✅ Fichiers `.env.example` (sans données sensibles)
- ✅ README.md avec instructions d'installation
- ✅ .gitignore configuré
- ✅ docker-compose.yml
- ✅ Configuration Capacitor pour mobile

### Configuration Requise
Pour activer toutes les fonctionnalités, configurer dans `.env` :
- `STRIPE_API_KEY` / `STRIPE_PUBLIC_KEY` - Paiements
- `RESEND_API_KEY` - Emails
- `LIVEKIT_URL` / `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` - Appels vidéo
- `REVENUECAT_API_KEY` - Achats in-app

## Changelog

### March 4, 2026 - Session 5
- ✅ **Intégration WebRTC Complète** - CallPage.js refait avec LiveKit
- ✅ **Automatisation Points Workout** - Points pour séances terminées
- ✅ **Intégration RevenueCat Complète** - Vérification automatique des achats
- ✅ **Tableau de Bord des Points** - Widget visuel sur le Dashboard
- ✅ **Système de Badges par Paliers** - 7 niveaux de badges:
  - 🔘 Débutant (0 pts)
  - 🥉 Bronze (100 pts)
  - 🥈 Argent (500 pts)
  - 🥇 Or (1000 pts)
  - 💎 Platine (2500 pts)
  - 💠 Diamant (5000 pts)
  - 👑 Légende (10000 pts)
  - Barre de progression vers le prochain niveau
  - Mini-badges visuels (débloqués/verrouillés)
- ✅ **Archive Code Source** - ZIP propre sans données sensibles

### March 3, 2026 - Sessions 1-4
- ✅ Système d'Avis Amélioré avec likes
- ✅ Course à Pied complète
- ✅ Système de Récompenses
- ✅ Live Streaming amélioré
- ✅ Session persistante (1 an)
- ✅ Upload vidéos d'exercices
- ✅ Mode vidéo temps réel
- ✅ Gestion réseaux sociaux individuelle

## Prioritized Backlog

### ✅ Completed
- Intégration WebRTC (LiveKit) ✅
- Automatisation des points ✅
- Logique abonnement annuel ✅
- Achats in-app (RevenueCat) ✅
- Code source exporté ✅

### P0 - Refactorisation (Important pour maintenabilité)
- ⏳ Découper `server.py` (~5900 lignes) en APIRouters
- ⏳ Découper `AdminPage.js` (~5000 lignes) en composants

### P2 - Futures améliorations
- 🔲 Cron job pour emails automatiques
- 🔲 Configuration icônes/splash Capacitor pour stores
- 🔲 Tests unitaires backend/frontend

## Files Modified Today
- `frontend/src/pages/CallPage.js` - Refonte complète LiveKit
- `backend/server.py` - Points workout + RevenueCat complet
- `/app/export_clean/*` - Nouvelle archive propre

## Test Reports
- `/app/test_reports/iteration_11.json` - Tests précédents
