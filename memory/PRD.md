# FitMaxPro - Product Requirements Document

## Original Problem Statement
Application de fitness "FitMaxPro" complète avec Live Streaming, Appels 1-to-1, programmes d'entraînement, course à pied, gamification et plus encore.

## Website URL
**https://fitmax-gains.preview.emergentagent.com**

## All Implemented Features (March 5, 2026)

### 🎥 LIVE STREAMING WEBRTC (LiveKit) ✅ PERFECTED
- Streaming en direct avec LiveKit WebRTC
- Interface professionnelle avec contrôles complets
- Chat en temps réel pendant les lives
- Système de demandes de live pour les abonnés

### 📞 APPELS 1-TO-1 (LiveKit) ✅ NOUVEAU
- **Appels vidéo/audio** entre coach et abonnés
- **Boutons d'appel** dans le panneau Admin (Video Call / Audio Call)
- **Icône téléphone** dans la liste des abonnés
- **Système d'appels entrants** avec notification modale
- **Vérification périodique** des appels en attente
- **Interface d'appel** complète avec :
  - Badge "Video Call" / "Audio Call"
  - Chronomètre d'appel
  - Contrôles : Micro, Caméra, Partage d'écran, Plein écran
  - Bouton fin d'appel

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
- ✅ **Bug écran noir CORRIGÉ** dans le Live Streaming
- ✅ **Appels 1-to-1 implémentés** via LiveKit
  - Nouveau composant `CallPage.js`
  - Nouveau composant `IncomingCall.js`
  - Boutons d'appel dans AdminPage
  - Système de notification d'appels entrants
- ✅ **Archive GitHub mise à jour** avec toutes les nouvelles fonctionnalités

## Test Credentials
- **Admin**: admin@fitmaxpro.com / admin123
- **User**: test@test.com / test123

## Key API Endpoints

### Appels 1-to-1
```
POST /api/livekit/calls/initiate - Initier un appel
GET /api/livekit/calls/pending - Appels en attente
POST /api/livekit/calls/{call_id}/answer - Répondre à un appel
```

### Live Streaming
```
GET /api/livekit/status - Statut LiveKit
POST /api/lives - Créer un live
POST /api/lives/{id}/join - Rejoindre un live
POST /api/lives/{id}/end - Terminer un live
```

## Files Modified/Created Today
- `/app/frontend/src/pages/CallPage.js` - Page d'appel réécrite
- `/app/frontend/src/components/IncomingCall.js` - NOUVEAU - Notification d'appels entrants
- `/app/frontend/src/pages/AdminPage.js` - Boutons d'appel ajoutés
- `/app/frontend/src/App.js` - Hook d'appels entrants intégré
- `/app/frontend/src/components/LiveKitRoom.js` - Bug écran noir corrigé

## Prioritized Backlog

### ✅ Completed
- Live Streaming fonctionnel ✅
- Appels 1-to-1 implémentés ✅
- Archive GitHub générée ✅

### P0 - Refactorisation (Recommandé)
- ⏳ Découper `server.py` (6820 lignes) en APIRouters
- ⏳ Découper `AdminPage.js` (4980 lignes) en composants

### P1 - Prochaines fonctionnalités
- 🔲 Push notifications pour appels entrants (Firebase Cloud Messaging)
- 🔲 Historique des appels

### P2 - Améliorations futures
- 🔲 Tests unitaires
- 🔲 Configuration Capacitor pour stores
