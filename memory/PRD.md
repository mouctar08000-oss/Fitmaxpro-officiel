# FitMaxPro - Product Requirements Document

## Original Problem Statement
Application de fitness "FitMaxPro" complète avec Live Streaming, Appels Audio/Vidéo, gestion d'abonnements, programmes d'entraînement, et panneau d'administration.

## Website URL
**https://fitmax-gains.preview.emergentagent.com**

## All Implemented Features (March 3, 2026)

### 🎥 LIVE STREAMING ✅
- **Page /live** : Interface complète de streaming style TikTok
- **Création de session Live** (Admin) avec option Public/VIP
- **Interface de diffusion** avec badge LIVE, compteur viewers
- **Chat en temps réel** intégré
- **Endpoints API** : `/api/lives`, `/api/lives/{id}/join`, `/api/lives/{id}/chat`

### 📞 APPELS AUDIO/VIDÉO ✅ NEW
- **Page /call** : Interface d'appel complète
- **Appel Audio** : Disponible pour tous les abonnés
- **Appel Vidéo** : Avec accès caméra/micro
- **Contrôles** : Mute, Caméra on/off, Haut-parleur, Raccrocher
- **Chronomètre** de durée d'appel
- **Historique des appels** enregistré en base

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
- Modification des photos de couverture
- Gestion des réseaux sociaux (Instagram, TikTok, etc.)
- Vue historique des appels

### 📱 Navigation
- **Live** avec indicateur rouge pulsant
- **Coach** pour messagerie et appels

## Test Credentials
- Email: mouctar08000@hotmail.com
- Password: Football-du-08
- Role: admin
- Subscription: VIP

## Key API Endpoints
```
# Live Streaming
GET/POST /api/lives
POST /api/lives/{id}/join
POST /api/lives/{id}/end
GET/POST /api/lives/{id}/chat

# Calls
POST /api/calls/log
GET /api/admin/calls/history

# Workouts
GET /api/workouts?program_type=abs
GET /api/workouts?program_type=yoga
```

## Documentation Created
- `/app/memory/GUIDE_APP_STORES.md` - Guide publication iOS/Android
- `/app/memory/GUIDE_TIKTOK_PRO.md` - Guide création compte TikTok Pro

## Prioritized Backlog

### ✅ Completed
- ✅ Live Streaming (style TikTok)
- ✅ Appels Audio/Vidéo
- ✅ Création de séances par l'admin
- ✅ 18 séances Abdominaux
- ✅ 18 séances Yoga/Détente

### P1 - En cours
- ⏳ Intégration WebRTC réelle (LiveKit cloud)

### P2 - À faire
- 🔲 Achats in-app (RevenueCat)
- 🔲 Configuration Capacitor pour App Stores
- 🔲 Refactorisation backend/frontend

## Files Modified Today
- `frontend/src/pages/LiveStreamPage.js` - Live streaming
- `frontend/src/pages/CallPage.js` - NEW - Appels audio/vidéo
- `frontend/src/pages/MessagesPage.js` - Boutons appels activés
- `frontend/src/pages/AdminPage.js` - Tous types de programmes
- `frontend/src/pages/WorkoutsPage.js` - Filtre Yoga
- `frontend/src/components/Navigation.js` - Lien Live
- `frontend/src/App.js` - Routes /live et /call
- `backend/server.py` - Endpoints Live + Calls
- `backend/seed_abs_complete.py` - 18 séances abdos
- `backend/seed_yoga_workouts.py` - 18 séances yoga

## Changelog

### March 3, 2026
- ✅ **Live Streaming** - Interface complète avec chat
- ✅ **Appels Audio/Vidéo** - Interface d'appel avec contrôles
- ✅ **18 séances abdominaux** - Tous niveaux avec vidéos
- ✅ **18 séances Yoga/Détente** - Méditation, Flow, Relaxation
- ✅ **Admin** - Création séances tous types
- ✅ **Guides** - TikTok Pro et App Stores
- ✅ **Total** : 138 séances d'entraînement
