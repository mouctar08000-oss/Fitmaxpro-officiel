# FitMaxPro - Product Requirements Document

## Original Problem Statement
Application de fitness "FitMaxPro" complète avec Live Streaming, Appels Audio/Vidéo, gestion d'abonnements, programmes d'entraînement, course à pied, et panneau d'administration.

## Website URL
**https://fitmax-gains.preview.emergentagent.com**

## All Implemented Features (March 3, 2026)

### 🏃 COURSE À PIED ✅ NEW
- **Page /running** : Interface complète de suivi de course
- **Onglet Courir** : Boutons Démarrer/Pause/Reprendre/Terminer, suivi GPS, Distance, Durée, Allure, Calories
- **Onglet Historique** : Liste de toutes les courses passées avec **bouton partage** pour chaque course
- **Onglet Stats** : Statistiques totales, graphique de progression (7 derniers jours), Records personnels
- **Onglet Classement** : Leaderboard public avec podium Top 3, rang de l'utilisateur, badge "You"
- **Onglet Défis** : 
  - Défis hebdomadaires (5km, 10km, 20km, 3 courses, 5 courses, 500 cal, 1000 cal)
  - Barres de progression en temps réel
  - Badges permanents (7 badges : First Run, Marathon, Century, Dedicated, Speed Demon, Long Runner, Calorie Burner)
- **Partage Social** : Modal de partage avec carte visuelle + boutons Instagram, TikTok, X (Twitter), WhatsApp, Copier stats
- **Notifications Push** : 
  - Bouton "Enable notifs" pour activer les notifications
  - Notification quand un défi est presque complété
  - Notification quand quelqu'un vous dépasse au classement
  - Admin peut envoyer des notifications broadcast à tous les abonnés
- **Admin** : Onglet "Course à Pied" avec stats globales, Top Runners, courses récentes, bouton "Notify all"
- **Admin Utilisateur** : L'admin peut lui-même faire des courses, sauvegarder et voir sa progression
- **Endpoints API** : `/api/running/*`, `/api/notifications/*`, `/api/admin/notifications/broadcast`

### 🍽️ RECETTES COMPLÈTES ✅ NEW
- **Toutes les recettes mises à jour** avec détails complets :
  - Ingrédients avec quantités précises
  - Étapes numérotées et détaillées
  - Temps de préparation et cuisson
  - Nombre de portions
  - Niveau de difficulté
  - Conseils du chef
  - Substitutions possibles
- **26+ recettes complètes** pour Prise de Masse et Perte de Poids

### 🎥 LIVE STREAMING ✅
- **Page /live** : Interface complète de streaming style TikTok
- **Création de session Live** (Admin) avec option Public/VIP
- **Interface de diffusion** avec badge LIVE, compteur viewers
- **Chat en temps réel** intégré (MOCKED - nécessite LiveKit)

### 📞 APPELS AUDIO/VIDÉO ✅
- **Page /call** : Interface d'appel complète
- **Appel Audio/Vidéo** : Contrôles micro/caméra/raccrocher
- **Chronomètre** de durée d'appel (MOCKED - nécessite LiveKit)

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
- Gestion des réseaux sociaux
- **Vue Course à Pied** : Stats globales, Top Runners, progression des abonnés
- Vue historique des appels

### 📱 Navigation
- **Running** (Course à Pied) - Nouveau
- **Live** avec indicateur rouge pulsant
- **Coach** pour messagerie et appels

## Test Credentials
- Email: mouctar08000@hotmail.com
- Password: Football-du-08
- Role: admin
- Subscription: VIP

## Key API Endpoints
```
# Running / Course à Pied (NEW)
POST /api/running/log - Enregistrer une course
GET /api/running/history - Historique des courses
GET /api/running/stats - Statistiques de l'utilisateur
GET /api/running/{run_id} - Détails d'une course
DELETE /api/running/{run_id} - Supprimer une course
GET /api/admin/running/all - Toutes les courses (Admin)
GET /api/admin/running/stats - Stats globales + Top Runners (Admin)
GET /api/admin/running/user/{user_id} - Courses d'un utilisateur (Admin)

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

### ✅ Completed (This Session)
- ✅ Course à Pied complète (Frontend + Backend + Admin)
- ✅ Recettes détaillées avec conseils et substitutions
- ✅ Live Streaming interface (Mocked)
- ✅ Appels Audio/Vidéo interface (Mocked)
- ✅ 18 séances Abdominaux
- ✅ 18 séances Yoga/Détente

### P1 - En cours
- ⏳ Intégration WebRTC réelle (LiveKit cloud) - Nécessite clés API
- ⏳ Refactorisation backend/frontend (fichiers trop volumineux)

### P2 - À faire
- 🔲 Achats in-app (RevenueCat)
- 🔲 Configuration Capacitor pour App Stores (icônes, splash screens)
- 🔲 Alertes email automatiques (cron job)
- 🔲 Logique abonnement annuel non annulable

## Files Modified Today
- `frontend/src/pages/RunningPage.js` - Page Course à Pied
- `frontend/src/pages/AdminPage.js` - Onglet Running ajouté
- `frontend/src/App.js` - Route /running
- `frontend/src/components/Navigation.js` - Lien Running
- `frontend/src/pages/SupplementsPage.js` - Affichage conseils/substitutions
- `backend/server.py` - Endpoints Running
- `backend/update_recipes_complete.py` - Scripts mise à jour recettes
- `backend/update_recipes_part2.py` - Scripts mise à jour recettes

## Changelog

### March 3, 2026 - Session 2
- ✅ **Course à Pied** - Fonctionnalité complète
  - Page /running avec 5 onglets (Courir, Historique, Stats, Classement, Défis)
  - Suivi GPS, Distance, Durée, Allure, Calories
  - Graphique de progression (7 derniers jours)
  - Records personnels
  - Admin: Stats globales, Top Runners, détails par utilisateur
- ✅ **Partage Social des Courses** - NEW
  - Modal de partage avec carte visuelle (stats de la course)
  - Partage vers Instagram, TikTok, X (Twitter), WhatsApp
  - Bouton "Copier les stats" pour le presse-papiers
- ✅ **Classement / Leaderboard** - NEW
  - Podium Top 3 avec médailles or/argent/bronze
  - Liste complète des coureurs avec rang
  - Badge "You" pour identifier l'utilisateur connecté
- ✅ **Défis Hebdomadaires + Badges** - NEW
  - 7 défis hebdomadaires avec barres de progression
  - 7 badges permanents à débloquer (First Run, Marathon, Century, etc.)
  - Système de points pour les défis complétés
- ✅ **Notifications Push** - NEW
  - Service Worker pour les notifications push
  - Bouton "Enable notifs" dans la page Running
  - Notifications automatiques quand défi presque complété
  - Notifications quand quelqu'un vous dépasse au classement
  - Admin: Bouton "Notify all" pour broadcast à tous les abonnés
- ✅ **Admin Running** - L'admin peut également faire des courses et voir sa progression
- ✅ **Recettes Complètes** - 26+ recettes mises à jour
  - Ingrédients précis, étapes détaillées
  - Conseils du chef, substitutions possibles
  - Interface améliorée avec sections dédiées

### March 3, 2026 - Session 1
- ✅ Live Streaming interface
- ✅ Appels Audio/Vidéo interface
- ✅ 18 séances abdominaux
- ✅ 18 séances Yoga/Détente
- ✅ Admin création séances tous types
- ✅ Guides TikTok Pro et App Stores
- ✅ Total: 138 séances d'entraînement

## Test Reports
- `/app/test_reports/iteration_6.json` - Tests Course à Pied (100% pass)
- `/app/test_reports/iteration_5.json` - Tests précédents
