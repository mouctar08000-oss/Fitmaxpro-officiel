# FitMaxPro - Product Requirements Document

## Original Problem Statement
Application de fitness nommée "FitMaxPro" avec:
- Plans de paiement: VIP (9,99€/mois), Standard (6,99€/mois), Supplément (4,99€)
- Séances de musculation pour débutants, amateurs et professionnels
- Programmes prise de masse, perte de poids, jambes/fessiers, spécial femme, **ABDOMINAUX (NEW)**
- Suppléments nutritionnels avec recettes détaillées (20+ repas par plan)
- Internationalisation: Français et Anglais
- Système de tracking des séances avec début/fin et pauses
- Messagerie directe entre abonnés et coach
- Rappels d'entraînement programmables
- Échauffement avant chaque séance et étirements après
- Panneau d'administration complet avec suivi des progrès utilisateurs
- **Live Streaming pour coaching en direct (DEMANDÉ)**

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
- **Graphiques d'évolution** (NEW)

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

### 5. Warm-Up & Stretching System ✅
- **Section Échauffement** avant chaque séance (8 exercices, 5-7 min)
- **Section Étirements** après chaque séance (10 exercices, 5-10 min)
- **Tracking de début/fin** pour échauffement et étirements
- **Bouton START WARM-UP** sur l'image de la séance
- **Vidéos YouTube explicatives** pour chaque exercice
- **Support bilingue** (FR/EN)

### 6. Email Reminders Integration ✅
- **Intégration Resend** pour envoi d'emails
- **Template HTML** professionnel avec branding FitMaxPro
- **Bouton CTA** dans l'email pour commencer la séance
- **Configuration dans .env**: RESEND_API_KEY, SENDER_EMAIL

### 7. Admin Discipline Tracking ✅
- **Onglet "Discipline"** dans le panneau admin
- **Statistiques globales** échauffements et étirements
- **Top 5 abonnés les plus disciplinés** avec score et détails
- **Historique complet** de toutes les sessions
- **Graphiques d'évolution**

### 8. Workout Programs ✅ UPDATED March 2026
- **Prise de Masse** (mass_gain): 44 séances
- **Perte de Poids** (weight_loss): 24 séances
- **Abdominaux** (abs): 6 séances ✅ NEW
- **Jambes/Fessiers** (legs_glutes): 16 séances
- **Spécial Femmes** (women_fitness): 18 séances
- **TOTAL: 108 séances d'entraînement**

### 9. Complete Website (Landing Page) ✅
- Hero section avec statistiques
- Sections: How It Works, Programs, Why FitMaxPro, Testimonials, FAQ
- CTA final avec garantie 30 jours
- Footer complet

### 10. Nutrition Content (84 repas) ✅
- 21 repas par plan (FR + EN)
- Recettes complètes avec ingrédients et étapes
- Gestion admin des repas

## Bug Fixed Today (March 3, 2026) ✅

### Scripts de Seeding - Stratégie UPSERT
**Problème**: Les scripts de seeding s'écrasaient mutuellement, causant une perte de données.

**Solution implémentée**:
- Remplacement de `delete_many()` par `update_one(..., upsert=True)`
- Utilisation d'IDs stables au lieu de `uuid.uuid4()` généré à chaque exécution
- Scripts modifiés:
  - `seed_detailed_workouts.py`
  - `add_abs_workouts.py`
  - `add_leg_workouts.py`
  - `add_women_workouts.py`

**Résultat**: Les scripts peuvent être ré-exécutés sans perte de données.

## API Endpoints

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/routines/warmup` | GET | Récupérer les exercices d'échauffement |
| `/api/routines/stretching` | GET | Récupérer les exercices d'étirement |
| `/api/routine/start` | POST | Démarrer une session (warmup/stretching) |
| `/api/routine/end` | POST | Terminer une session avec durée |
| `/api/admin/routines` | GET | Liste de toutes les routines (admin) |
| `/api/reminders/{id}/send-email` | POST | Envoyer un email de rappel |
| `/api/admin/analytics/evolution` | GET | Données d'évolution (7 jours) |
| `/api/workouts` | GET | Récupérer les séances avec filtres |
| `/api/reviews` | GET/POST | Gestion des avis |
| `/api/social-links` | GET/PUT | Gestion des réseaux sociaux |
| `/api/progress-photos` | GET/POST | Gestion des photos avant/après |

## Test Credentials
- Admin Email: mouctar08000@hotmail.com
- Admin Password: Football-du-08
- Subscription: VIP

## Prioritized Backlog

### P0 - Critical (En cours)
- ⏳ **Live Streaming** - Coaching en direct style TikTok/Instagram
  - Technologie recommandée: **LiveKit**
  - Fonctionnalités: Broadcaster, viewers, chat temps réel, accès VIP
  - Complexité: Élevée (nécessite intégration tierce)

### P1 - Important
- 🔲 Achats in-app natifs pour les stores (RevenueCat)
- 🔲 Notifications push réelles (PWA ou mobile)
- 🔲 Appels Audio/Vidéo Coach-Abonné
- 🔲 Finaliser système d'avis/reviews
- 🔲 Finaliser liens réseaux sociaux
- 🔲 Finaliser photos avant/après

### P2 - Nice to Have
- 🔲 Guide de soumission aux App Stores
- 🔲 Configuration domaine personnalisé (fitmax-gains.com)
- 🔲 Refactorisation backend (server.py > 3000 lignes)
- 🔲 Refactorisation frontend (AdminPage.js > 3700 lignes)

## Known Issues
- ⚠️ Export GitHub - Bug plateforme Emergent (en attente du support)

## 3rd Party Integrations
| Service | Usage | Status |
|---------|-------|--------|
| Stripe | Paiements | ✅ Configuré avec clé test |
| Resend | Emails de rappel | ✅ Configuré et fonctionnel |
| YouTube | Vidéos exercices | ✅ Embeds fonctionnels |
| Pexels | Images stock | ✅ URLs utilisées |
| LiveKit | Live Streaming | ⏳ Playbook obtenu, prêt à implémenter |

## File Structure (Key Files)
- `/app/backend/server.py` - API FastAPI (~3000 lignes)
- `/app/backend/seed_detailed_workouts.py` - Script de seeding (CORRIGÉ)
- `/app/backend/add_abs_workouts.py` - Séances abdos (CORRIGÉ)
- `/app/backend/add_leg_workouts.py` - Séances jambes (CORRIGÉ)
- `/app/backend/add_women_workouts.py` - Séances femmes (CORRIGÉ)
- `/app/frontend/src/pages/WorkoutsPage.js` - Catalogue séances
- `/app/frontend/src/pages/AdminPage.js` - Panneau admin (~3700 lignes)

## Test Reports
- `/app/test_reports/iteration_4.json` - Dernier rapport

## Changelog

### March 3, 2026
- ✅ Corrigé bug critique des scripts de seeding (perte de données)
- ✅ Ajouté 6 nouvelles séances d'abdominaux (FR + EN)
- ✅ Total workouts passé de 51 à 108
- ✅ Vérifié filtre "Abs" fonctionnel sur la page Workouts
- ⏳ Obtenu playbook LiveKit pour Live Streaming
