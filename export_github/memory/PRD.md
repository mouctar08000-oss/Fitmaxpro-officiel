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

### 🎁 SYSTÈME DE RÉCOMPENSES ✅ NEW
- **Page /rewards** : Boutique de récompenses avec points
- **Catalogue** : 6 récompenses échangeables
  - 👑 Accès VIP 1 jour (200 pts)
  - 🏆 Accès VIP 7 jours (1000 pts)
  - 💪 Session coaching gratuite (500 pts)
  - 🥗 Plan nutrition personnalisé (750 pts)
  - 🥇 Badge Or Exclusif (300 pts)
  - ⭐ Priorité Live (150 pts)
- **Onglets** : Shop, My Rewards, History
- **Section "Comment gagner des points"** explicative
- **Admin** : Endpoint pour donner des points bonus
- **Endpoints API** : `/api/rewards/*`, `/api/admin/rewards/*`

### 📺 LIVE STREAMING AMÉLIORÉ ✅ UPDATED
- **WebRTC LiveKit** : Intégration complète prête à l'emploi (backend + frontend)
- **Demande de Live Avancée** : Les abonnés peuvent demander une session live avec :
  - 10 thèmes/programmes : Prise de Masse, Perte de Poids, Jambes, Programme Femmes, Abdominaux, Yoga & Stretching, Cardio & HIIT, Nutrition & Conseils, Q&A, Autre
  - 6 types d'exercice : Débutant, Intermédiaire, Avancé, Échauffement, Étirements, Technique
  - Titre personnalisé et message au coach
  - Aperçu de la demande avant envoi
- **Programmation** : L'admin peut programmer des lives à l'avance
- **Vue Admin** : Section "Demandes de Live" avec compteur, bouton "Accepter"
- **Section "Lives Programmés"** avec date et heure

### ⭐ SYSTÈME D'AVIS AMÉLIORÉ ✅ NEW (Session 3)
- **Dashboard** : Section "VOTRE AVIS COMPTE !" avec note moyenne et statistiques
  - Boutons "Voir les avis" et "Donner mon avis"
  - Affichage des étoiles et du nombre d'avis en temps réel
- **Actions rapides** : Bouton jaune "Donner un Avis" parmi Running, Live, Rewards, Progress
- **Navigation** : Lien "Avis/Reviews" avec icône étoile dans le menu principal et mobile
- **Page /reviews** :
  - Formulaire de création d'avis (note, titre, contenu, public/privé)
  - Liste de tous les avis publics avec nom, date, note, contenu
  - Réponses du coach visibles
- **Admin Panel** : Onglet "Reviews" avec :
  - Statistiques (note moyenne, total, distribution par étoiles)
  - Liste de TOUS les avis (publics et privés)
  - Boutons Répondre et Supprimer
- **Endpoints API** : `/api/reviews`, `/api/user/reviews`, `/api/admin/reviews/*`

### 📱 RÉSEAUX SOCIAUX VISIBLES ✅ NEW
- **Dashboard** : Section "SUIVEZ-NOUS" avec boutons colorés
  - Instagram (gradient violet/rose)
  - YouTube (rouge)
  - TikTok (noir)
  - Facebook (bleu)
  - Snapchat (jaune)
- **Boutons d'action rapide** : Running, Live, Rewards, Progress
- **Footer** : Liens sociaux sur toutes les pages publiques
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

### March 3, 2026 - Session 3
- ✅ **Système d'Avis Amélioré** - Visibilité maximale pour tous
  - Bouton "Voir tous les avis" sur la landing page (témoignages)
  - Page /reviews accessible à TOUS (même non connectés)
  - Badges "Verified" (abonné vérifié) et "VIP" affichés
  - Bouton Like (coeur) avec compteur sur chaque avis
  - Badge "Liked by Coach" quand l'admin a aimé
  - Admin Panel: 3 boutons (❤️ Aimer, ✈️ Répondre, 🗑️ Supprimer)
  - Seuls les abonnés actifs peuvent créer des avis (verified_subscriber=True)
- ✅ **Automatisation des Points**
  - +25 points pour chaque avis créé
  - +10 points base pour chaque course
  - +5 points par km parcouru
  - +25 points bonus pour 5km+
  - +50 points bonus pour 10km+
- ✅ **Nettoyage des faux avis** - Suppression des avis de test
- ✅ **Améliorations P2 - Alertes Inactifs**
  - Onglet Admin "Inactive Alerts" avec sélecteur de jours (3, 7, 14, 30)
  - Message personnalisé pour les rappels
  - Envoi de rappels email aux utilisateurs sélectionnés
  - Tableau des utilisateurs inactifs avec détails
- ✅ **Améliorations P2 - Abonnements Annuels**
  - Logique d'engagement 12 mois pour abonnements annuels
  - Vérification `can_cancel` avant annulation
  - Demandes d'annulation avec approbation admin
  - Onglet Admin "Subscriptions" avec gestion des demandes
- ✅ **Améliorations P2 - Préparation In-App Purchases**
  - 4 produits IAP définis (standard/vip × monthly/annual)
  - Endpoint de vérification d'achat (RevenueCat prêt)
  - Stockage des reçus pour vérification manuelle
- ✅ **Emails de Motivation Hebdomadaires**
  - Onglet Admin "Motivation Emails" avec aperçu
  - Configuration personnalisable (stats running, workouts, points, classement)
  - Messages d'intro personnalisés FR/EN
  - Historique des envois
- ✅ **Gestion Complète des Réseaux Sociaux**
  - Faux comptes supprimés
  - 9 réseaux supportés: Instagram, YouTube, TikTok, Facebook, Snapchat, X, WhatsApp, Telegram, Website
  - Bouton de suppression individuel pour chaque réseau
  - Bouton "Clear all" pour tout supprimer
  - Aperçu en temps réel des liens actifs
  - Affichage conditionnel sur Dashboard et Footer
- ✅ **Intégration WebRTC Réelle (LiveKit)**
  - Backend: Endpoints `/api/livekit/*` pour tokens, rooms, participants
  - Frontend: Composant `LiveKitVideoRoom` avec `@livekit/components-react`
  - Support Live Streaming (one-to-many) et Appels (one-to-one)
  - Message clair quand WebRTC non configuré avec instructions
  - Prêt pour activation avec clés API LiveKit

### March 3, 2026 - Session 2
- ✅ **Course à Pied** - Fonctionnalité complète (5 onglets)
- ✅ **Partage Social** - Instagram, TikTok, X, WhatsApp
- ✅ **Classement / Leaderboard** - Podium Top 3, badges
- ✅ **Défis Hebdomadaires + Badges** - 7 défis, 7 badges
- ✅ **Notifications Push** - Service Worker, alertes automatiques
- ✅ **Système de Récompenses** - Boutique de points, 6 récompenses échangeables
- ✅ **Live Streaming Amélioré** - Demande de live, programmation, notifications
- ✅ **Réseaux Sociaux Visibles** - Dashboard avec boutons colorés, action rapide
- ✅ **Recettes Complètes** - 26+ recettes détaillées

### March 3, 2026 - Session 1
- ✅ Live Streaming interface
- ✅ Appels Audio/Vidéo interface
- ✅ 18 séances abdominaux
- ✅ 18 séances Yoga/Détente
- ✅ Admin création séances tous types
- ✅ Guides TikTok Pro et App Stores
- ✅ Total: 138 séances d'entraînement

### December 2025 - Session 4
- ✅ **Formulaire Demande de Live Amélioré** - 10 thèmes, 6 types d'exercice, aperçu
- ✅ **Notifications Push Automatiques pour Lives** :
  - Notification immédiate quand un live démarre (tous les abonnés notifiés)
  - Notification quand un live est programmé (avec date formatée)
  - Messages personnalisés pour les utilisateurs ayant fait des demandes
  - Respect des restrictions VIP (seuls les VIP notifiés pour les lives VIP)
- ✅ **Gestion Individuelle des Réseaux Sociaux** :
  - Chaque réseau social peut être enregistré séparément (bouton ✓ vert)
  - Suppression individuelle (bouton poubelle rouge)
  - APIs: PUT /api/admin/social-link, DELETE /api/admin/social-link/{platform}
- ✅ **Authentification Améliorée** :
  - Bouton œil pour voir/masquer mot de passe (Login + Signup)
  - Lien "Mot de passe oublié ?" avec page dédiée
  - Session persistante (1 an + auto-renouvellement) - plus besoin de se reconnecter
  - API /api/auth/forgot-password pour réinitialisation
- ✅ **Système d'Upload de Vidéos d'Exercices** :
  - Nouvel onglet "Vidéos" dans l'admin panel
  - Upload de vidéos (MP4, WebM, MOV, AVI - max 500MB)
  - Streaming vidéo avec support du seek (avance/retour)
  - Composant VideoUploader intégré dans les formulaires d'exercices
  - Bibliothèque de vidéos avec prévisualisation, copie URL, suppression
  - Alternative : coller un lien YouTube/Vimeo
- ✅ **Mode "Vidéo en Temps Réel" pour Séances** :
  - Bouton "MODE VIDÉO" sur toutes les séances (workout, échauffement, étirements)
  - ExercisePlayer plein écran avec vidéo + instructions
  - Timer automatique pour exercices chronométrés et temps de repos
  - Navigation entre exercices avec liste complète
  - Suivi des sets complétés
  - Support vidéos YouTube et uploadées
- ✅ **Séances Abdominaux Complètes** :
  - 18 programmes d'abdos (Débutant, Intermédiaire, Avancé)
  - FR + EN disponibles
  - Chaque exercice avec vidéo YouTube explicative
- ✅ **Tests complets** - Backend et Frontend 100% passés

## Test Reports
- `/app/test_reports/iteration_11.json` - Tests Demande de Live (100% pass - Backend 6/6, Frontend UI complet)
- `/app/test_reports/iteration_10.json` - Tests Emails Motivation (100% pass)
- `/app/test_reports/iteration_9.json` - Tests P2 complets (100% pass)
- `/app/test_reports/iteration_8.json` - Tests Avis complets avec likes et points (95-100% pass)
- `/app/test_reports/iteration_7.json` - Tests Système d'Avis (100% pass)
- `/app/test_reports/iteration_6.json` - Tests Course à Pied (100% pass)
- `/app/test_reports/iteration_5.json` - Tests précédents
