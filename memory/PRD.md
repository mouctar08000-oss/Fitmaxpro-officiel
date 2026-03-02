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
- Rappels d'entraînement programmables
- Panneau d'administration complet avec suivi des progrès utilisateurs

## Website URL
**https://fitmax-gains.preview.emergentagent.com**

## All Implemented Features (March 2026)

### 1. Session Tracking System ✅
- **Bouton "START WORKOUT"** sur chaque séance
- **Barre de tracking rouge** en haut avec chronomètre
- **Bouton PAUSE/RESUME** pour gérer les temps de repos
- **Bouton FINISH** pour terminer la séance
- **Chronomètre de pause** en jaune pendant les pauses
- **Messages de feedback** avec temps total

### 2. User Progress Tracking ✅
- Page **/my-progress** pour voir son évolution
- Statistiques: Séances totales, Séances terminées, Temps total, Taux de complétion
- Historique détaillé de chaque séance avec durée et pauses

### 3. Coach Messaging System ✅
- Page **/messages** pour contacter le coach
- Options affichées: Audio Call, Video Call (Coming soon), Text Chat (Available)
- Chat en temps réel avec Coach FitMaxPro

### 4. Workout Reminders ✅ NEW
- Page **/reminders** pour programmer ses rappels
- **Sélection de séance** parmi tous les workouts
- **Choix du jour** (Lundi à Dimanche)
- **Choix de l'heure** précise
- **Option "Répéter chaque semaine"**
- **Notes optionnelles** 
- **Section "Upcoming Reminders"** avec aperçu coloré des prochains rappels
- **Liste complète** avec activation/désactivation, accès direct, suppression
- **Badge "Weekly"** pour les répétitions hebdomadaires

### 5. Admin Features ✅
- **Onglet Progress**: Voir les progrès de tous les abonnés
- **Onglet Messages**: Recevoir et répondre aux messages des abonnés
- **Gestion complète** des séances, nutrition, utilisateurs

### 6. Complete Website (Landing Page) ✅
- Hero section avec statistiques
- Sections: How It Works, Programs, Why FitMaxPro, Testimonials, FAQ
- CTA final avec garantie 30 jours
- Footer complet

### 7. Nutrition Content (84 repas) ✅
- 21 repas par plan (FR + EN)
- Recettes complètes avec ingrédients et étapes
- Gestion admin des repas

## Navigation Links
- **Progress** (rouge) - /my-progress
- **Coach** (vert) - /messages  
- **Reminders** (jaune) - /reminders

## Test Credentials
- Admin Email: mouctar08000@hotmail.com
- Admin Password: Football-du-08
- Subscription: VIP

## API Endpoints (Reminders)
- POST /api/reminders - Créer un rappel
- GET /api/reminders - Liste de mes rappels
- PUT /api/reminders/{id} - Modifier un rappel
- DELETE /api/reminders/{id} - Supprimer un rappel
- POST /api/reminders/{id}/toggle - Activer/Désactiver
- GET /api/reminders/today - Rappels d'aujourd'hui
- GET /api/reminders/upcoming - Prochains rappels (7 jours)

## Prioritized Backlog

### P0 - Critical
- Implémenter les appels audio/vidéo (WebRTC)
- Achats in-app natifs pour les stores
- Notifications push réelles (PWA ou mobile)

### P1 - Important
- Guide de soumission aux App Stores
- Configuration domaine personnalisé
- Email de rappel automatique

### P2 - Nice to Have
- Graphiques d'évolution des progrès
- Système de badges/achievements
- Partage de progrès sur réseaux sociaux

## Known Issues
- ⚠️ Export GitHub - Bug plateforme Emergent
