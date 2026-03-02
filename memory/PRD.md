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
- Échauffement avant chaque séance et étirements après
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

### 4. Workout Reminders ✅
- Page **/reminders** pour programmer ses rappels
- Sélection de séance, jour, heure
- Option "Répéter chaque semaine"
- Notes optionnelles
- Section "Upcoming Reminders"
- Liste complète avec activation/désactivation

### 5. Warm-Up & Stretching System ✅ NEW (March 2026)
- **Section Échauffement** avant chaque séance (8 exercices, 5-7 min)
- **Section Étirements** après chaque séance (10 exercices, 5-10 min)
- **Tracking de début/fin** pour échauffement et étirements
- **Bouton START WARM-UP** sur l'image de la séance
- **Chronomètre dédié** pour chaque phase (orange pour échauffement, violet pour étirements)
- **Vidéos YouTube explicatives** pour chaque exercice
- **Admin peut modifier** les vidéos et détails de chaque exercice
- **Support bilingue** (FR/EN)

### 6. Email Reminders Integration ✅ NEW (March 2026)
- **Intégration Resend** pour envoi d'emails
- **Template HTML** professionnel avec branding FitMaxPro
- **Bouton CTA** dans l'email pour commencer la séance
- **Configuration dans .env**: RESEND_API_KEY, SENDER_EMAIL

### 7. Admin Routines Management ✅ NEW (March 2026)
- **Onglet "Warm-Up/Stretching"** dans le panneau admin
- **Visualisation** des 4 routines (échauffement FR/EN, étirements FR/EN)
- **Édition** de chaque exercice (nom, description, durée, image, vidéo)
- **Ajout** de nouveaux exercices
- **Suppression** d'exercices existants

### 8. Admin Discipline Tracking ✅ NEW (March 2026)
- **Onglet "Discipline"** dans le panneau admin
- **Statistiques globales** échauffements et étirements (total, complétés, taux, durée moyenne)
- **Top 5 abonnés les plus disciplinés** avec score et détails
- **Historique complet** de toutes les sessions (type, début, durée, statut)
- **Vue détaillée par abonné** avec score de discipline et historique
- **Graphiques d'évolution** :
  - Activité des 7 derniers jours (Séances, Échauffements, Étirements)
  - Temps d'entraînement par jour (minutes)
  - Évolution mensuelle par utilisateur (score discipline, séances complétées)
- **Analytics détaillées par séance** : utilisateurs, taux de complétion, durées

### 9. Admin Features ✅
- Onglet Progress: Voir les progrès de tous les abonnés
- Onglet Messages: Recevoir et répondre aux messages des abonnés
- Gestion complète des séances, nutrition, utilisateurs

### 9. Complete Website (Landing Page) ✅
- Hero section avec statistiques
- Sections: How It Works, Programs, Why FitMaxPro, Testimonials, FAQ
- CTA final avec garantie 30 jours
- Footer complet

### 10. Nutrition Content (84 repas) ✅
- 21 repas par plan (FR + EN)
- Recettes complètes avec ingrédients et étapes
- Gestion admin des repas

## API Endpoints - Routines

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/routines/warmup` | GET | Récupérer les exercices d'échauffement |
| `/api/routines/stretching` | GET | Récupérer les exercices d'étirement |
| `/api/routine/start` | POST | Démarrer une session (warmup/stretching) |
| `/api/routine/end` | POST | Terminer une session avec durée |
| `/api/admin/routines` | GET | Liste de toutes les routines (admin) |
| `/api/admin/routines/{id}/exercises/{index}` | PUT | Modifier un exercice |
| `/api/admin/routines/{id}/exercises` | POST | Ajouter un exercice |
| `/api/admin/routines/{id}/exercises/{index}` | DELETE | Supprimer un exercice |
| `/api/reminders/{id}/send-email` | POST | Envoyer un email de rappel |
| `/api/admin/analytics/evolution` | GET | Données d'évolution (7 jours) pour graphiques |
| `/api/admin/user/{id}/evolution` | GET | Évolution mensuelle d'un utilisateur |
| `/api/admin/workout/{id}/analytics` | GET | Analytics détaillées d'une séance |

## Test Credentials
- Admin Email: mouctar08000@hotmail.com
- Admin Password: Football-du-08
- Subscription: VIP

## Navigation Links
- **Progress** (rouge) - /my-progress
- **Coach** (vert) - /messages  
- **Reminders** (jaune) - /reminders
- **Admin** - /admin

## Prioritized Backlog

### P0 - Critical
- Achats in-app natifs pour les stores (RevenueCat)
- Notifications push réelles (PWA ou mobile)

### P1 - Important
- Guide de soumission aux App Stores
- Ajouter plus de programmes d'entraînement
- Configuration domaine personnalisé (fitmax-gains.com)
- Refactorisation backend (server.py > 2000 lignes)
- Refactorisation frontend (AdminPage.js > 1900 lignes)

### P2 - Nice to Have
- Appels Audio/Vidéo WebRTC (placeholders en place)
- Graphiques d'évolution des progrès
- Système de badges/achievements
- Partage de progrès sur réseaux sociaux

## Known Issues
- ⚠️ Export GitHub - Bug plateforme Emergent (en attente du support)

## 3rd Party Integrations
| Service | Usage | Status |
|---------|-------|--------|
| Stripe | Paiements | ✅ Configuré avec clé test |
| Resend | Emails de rappel | ✅ Configuré et fonctionnel |
| YouTube | Vidéos exercices | ✅ Embeds fonctionnels |
| Pexels | Images stock | ✅ URLs utilisées |

## File Structure (Key Files)
- `/app/backend/server.py` - API FastAPI (2100+ lignes - refactorisation nécessaire)
- `/app/backend/add_warmup_stretching.py` - Script de seeding routines
- `/app/frontend/src/pages/WorkoutDetailPage.js` - Page de détail séance
- `/app/frontend/src/pages/AdminPage.js` - Panneau admin (1960+ lignes)
- `/app/frontend/src/pages/RemindersPage.js` - Page rappels

## Test Reports
- `/app/test_reports/iteration_4.json` - Dernier rapport (100% passé)
