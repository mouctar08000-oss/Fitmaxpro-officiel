# FitMaxPro - Product Requirements Document

## Original Problem Statement
Application de fitness nommée "FitMaxPro" avec:
- Plans de paiement: VIP (9,99€/mois), Standard (6,99€/mois), Supplément (4,99€)
- Séances de musculation pour débutants, amateurs et professionnels
- Programmes prise de masse, perte de poids, jambes/fessiers, spécial femme
- Suppléments nutritionnels avec recettes détaillées (20+ repas par plan)
- Internationalisation: Français et Anglais
- Système de tracking des séances avec début/fin et pauses
- Messagerie directe entre abonnés et coach
- Panneau d'administration complet avec suivi des progrès utilisateurs

## Website URL
**https://fitmax-gains.preview.emergentagent.com**

## Implemented Features (March 2026)

### Session Tracking System ✅ NEW
- **Bouton "START WORKOUT"** sur chaque séance
- **Barre de tracking rouge** en haut avec chronomètre
- **Bouton PAUSE/RESUME** pour gérer les temps de repos
- **Bouton FINISH** pour terminer la séance
- **Chronomètre de pause** en jaune pendant les pauses
- **Messages de feedback** : "Session started!", "Pause started...", "Great job! Session completed in Xm Xs"

### User Progress Tracking ✅ NEW
- Page **/my-progress** pour voir son évolution
- Statistiques: Séances totales, Séances terminées, Temps total, Taux de complétion
- Historique détaillé de chaque séance avec durée et pauses
- Statut: Terminée (vert) ou Arrêtée (rouge)

### Coach Messaging System ✅ NEW
- Page **/messages** pour contacter le coach
- Options affichées: Audio Call, Video Call (Coming soon), Text Chat (Available)
- Chat en temps réel avec Coach FitMaxPro
- Indicateur "Online"
- Envoi de messages avec confirmation

### Admin Features ✅ NEW
- **Onglet Progress**: Voir les progrès de tous les abonnés
  - Tableau avec: Utilisateur, Séances, Taux de complétion, Temps Total, Durée Moyenne
  - Détail par utilisateur avec historique complet des séances
- **Onglet Messages**: Recevoir et répondre aux messages des abonnés
  - Liste des conversations
  - Badge avec nombre de messages non lus
  - Boutons Appeler et Vidéo (à venir)
  - Interface de chat pour répondre

### Complete Website (Landing Page)
- Hero section avec badge "7 jours essai gratuit" et statistiques
- Section "Comment ça marche" en 4 étapes
- Grille de 4 programmes avec images
- Section "Pourquoi FitMaxPro?" avec 3 features
- 3 Témoignages clients avec avatars et étoiles
- FAQ accordéon avec 5 questions
- CTA final avec garantie 30 jours
- Footer complet avec liens App Store/Google Play

### Nutrition Content (84 repas total)
- **Pack Prise de Masse (FR)**: 21 repas avec recettes complètes
- **Pack Perte de Poids (FR)**: 21 repas avec recettes complètes
- **Mass Gain Pack (EN)**: 21 repas avec recettes complètes
- **Weight Loss Pack (EN)**: 21 repas avec recettes complètes
- Gestion admin: Ajout/Suppression de repas

## Test Credentials
- Admin Email: mouctar08000@hotmail.com
- Admin Password: Football-du-08
- Subscription: VIP

## API Endpoints (New)

### Session Tracking
- POST /api/workout/start?workout_id={id} - Démarrer une séance
- POST /api/workout/end?session_id={id}&completed={bool} - Terminer une séance
- POST /api/workout/pause/start?session_id={id} - Démarrer une pause
- POST /api/workout/pause/end?session_id={id}&pause_id={id} - Terminer une pause
- GET /api/workout/my-sessions - Historique de mes séances
- GET /api/workout/session/{session_id} - Détails d'une séance

### Admin Progress
- GET /api/admin/all-user-progress - Progrès de tous les utilisateurs
- GET /api/admin/user/{user_id}/sessions - Séances d'un utilisateur spécifique

### Messaging
- POST /api/messages/send - Envoyer un message
- GET /api/messages/inbox - Ma boîte de réception
- GET /api/messages/conversation/{user_id} - Conversation avec un utilisateur (admin)
- GET /api/admin/messages/unread-count - Nombre de messages non lus
- GET /api/admin/messages/users-with-messages - Liste des utilisateurs avec messages

## Navigation Links
- **Progress** (rouge) - /my-progress
- **Coach** (vert) - /messages

## Prioritized Backlog

### P0 - Critical
- Implémenter les appels audio/vidéo en temps réel (WebRTC)
- Achats in-app natifs (Apple/Google) pour publication stores

### P1 - Important
- Guide de soumission aux App Stores
- Configuration domaine personnalisé (fitmax-gains.com)
- Notifications push pour nouveaux messages

### P2 - Nice to Have
- Photos pour les étapes des recettes
- Système de rappels d'entraînement
- Graphiques d'évolution des progrès

## Known Issues
- ⚠️ Export GitHub - Bug plateforme Emergent (support technique requis)
