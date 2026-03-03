# FitMaxPro - Product Requirements Document

## Original Problem Statement
Application de fitness "FitMaxPro" complète avec Live Streaming, gestion d'abonnements, programmes d'entraînement, et panneau d'administration.

## Website URL
**https://fitmax-gains.preview.emergentagent.com**

## Implemented Features (March 3, 2026)

### 🎥 LIVE STREAMING ✅ NEW
- **Page /live** : Interface complète de streaming
- **Création de session Live** (Admin) :
  - Titre et description personnalisables
  - Option Public ou VIP uniquement
- **Interface de diffusion** :
  - Badge LIVE avec compteur de viewers
  - Contrôles caméra/micro
  - Bouton Stop pour terminer
- **Chat en temps réel** intégré
- **Endpoints API** :
  - `GET/POST /api/lives` - Lister/Créer
  - `POST /api/lives/{id}/join` - Rejoindre
  - `POST /api/lives/{id}/end` - Terminer
  - `GET/POST /api/lives/{id}/chat` - Chat

### 📊 Workout Programs (138 séances)
| Type | Nombre | Status |
|------|--------|--------|
| mass_gain | 44 | ✅ |
| weight_loss | 24 | ✅ |
| **abs** | **18** | ✅ NEW |
| legs_glutes | 16 | ✅ |
| women_fitness | 18 | ✅ |
| **yoga** | **18** | ✅ NEW |

### 🛠️ Admin Capabilities ✅
**Création libre de séances** (tous niveaux/types) :
- Tous les types disponibles : Mass Gain, Weight Loss, Abs, Legs, Women, Yoga
- Tous les niveaux : Beginner, Intermediate, Advanced
- Ajout d'exercices avec vidéos YouTube
- Modification des photos de couverture
- Modification des vidéos d'échauffement/étirements

### 📱 Navigation
Le lien **Live** avec indicateur rouge est maintenant dans la barre de navigation.

## Test Credentials
- Email: mouctar08000@hotmail.com
- Password: Football-du-08
- Role: admin
- Subscription: VIP

## Prioritized Backlog

### P0 - Completed ✅
- ✅ Live Streaming (style TikTok)
- ✅ Création de séances par l'admin (tous types/niveaux)
- ✅ Séances Abdominaux (18)
- ✅ Séances Yoga/Détente (18)

### P1 - En cours
- ⏳ Appels Audio/Vidéo direct avec abonnés
- ⏳ Intégration vidéo réelle (WebRTC/LiveKit)

### P2 - À faire
- 🔲 Achats in-app (RevenueCat)
- 🔲 Configuration Capacitor pour App Stores
- 🔲 Refactorisation backend/frontend

## Files Modified Today
- `frontend/src/pages/LiveStreamPage.js` - NEW
- `frontend/src/pages/AdminPage.js` - Added all program types
- `frontend/src/pages/WorkoutsPage.js` - Added Yoga filter
- `frontend/src/components/Navigation.js` - Added Live link
- `frontend/src/App.js` - Added /live route
- `backend/server.py` - Added Live endpoints + User model updated
- `backend/seed_abs_complete.py` - 18 abs workouts
- `backend/seed_yoga_workouts.py` - 18 yoga workouts

## Changelog

### March 3, 2026
- ✅ **Live Streaming** - Implémenté avec chat en temps réel
- ✅ **18 séances abdominaux** - Tous niveaux avec vidéos YouTube
- ✅ **18 séances Yoga/Détente** - Méditation, Flow, Relaxation
- ✅ **Admin** - Peut créer séances pour tous types (Abs, Yoga inclus)
- ✅ **Total** : 138 séances d'entraînement
- ✅ **Role admin** configuré pour mouctar08000@hotmail.com
