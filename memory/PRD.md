# FitMaxPro - Product Requirements Document

## Original Problem Statement
Application de fitness nommée "FitMaxPro" avec:
- Plans de paiement: VIP (9,99€/mois), Standard (6,99€/mois), Supplément (4,99€)
- Séances de musculation pour débutants, amateurs et professionnels
- Programmes prise de masse, perte de poids, jambes/fessiers, spécial femme
- Suppléments nutritionnels avec recettes détaillées
- Internationalisation: Français et Anglais
- Authentification: Email/mot de passe et Google OAuth
- Paiements Stripe avec abonnements mensuels et annuels (7 jours essai gratuit)
- Panneau d'administration complet
- Site web professionnel pour l'application

## User Personas
- Débutants en musculation cherchant des programmes structurés
- Amateurs souhaitant progresser avec des exercices plus avancés
- Professionnels nécessitant des programmes intensifs
- Femmes cherchant des programmes spécifiques (jambes/fessiers)
- Tous niveaux intéressés par les plans nutritionnels

## Core Requirements
1. ✅ Application full-stack React/FastAPI/MongoDB
2. ✅ Authentification (email/password + Google OAuth)
3. ✅ Intégration Stripe pour paiements (essai 7 jours)
4. ✅ Catalogue de 51 programmes d'entraînement détaillés
5. ✅ Plans nutritionnels avec suppléments (4 plans)
6. ✅ Internationalisation (FR/EN)
7. ✅ Images et vidéos pour chaque exercice (Pexels + YouTube)
8. ✅ Recettes et repas avec macros nutritionnels
9. ✅ Panneau d'administration complet
10. ✅ Site web professionnel avec landing page
11. ✅ Modification des photos de couverture des séances
12. ✅ Page QR Code pour partage
13. 🔄 Préparation mobile (Capacitor) - Config créée
14. ❌ Achats in-app natifs (iOS/Android) - Non implémenté
15. ❌ Soumission App Stores - Non fait

## Implemented Features (March 2026)

### Website (Landing Page)
- Hero section avec badge "7 jours essai gratuit"
- Statistiques (50+ programmes, 1000+ exercices, 4 plans nutrition, 24/7 support)
- Section "Comment ça marche" en 4 étapes
- Grille de programmes avec images
- Section "Pourquoi FitMaxPro?" (Vidéos HD, Temps de repos, Multi-plateforme)
- Témoignages clients avec avatars et étoiles
- FAQ accordéon (5 questions)
- CTA final avec garantie 30 jours
- Footer complet avec liens, boutons App Store/Google Play, Stripe badge

### Authentication
- Email/password signup et login
- Google OAuth via Emergent Auth
- Session management avec JWT et localStorage
- Redirection correcte vers /dashboard après login ✅

### Workouts (51 programmes)
- 3 niveaux: Débutant, Amateur, Pro
- 4 types: Prise de masse, Perte de poids, Jambes/Fessiers, Spécial Femme
- Images Pexels pour chaque exercice
- Vidéos YouTube intégrées
- Temps de repos visible entre exercices

### Admin Panel (/admin)
- Dashboard avec statistiques (utilisateurs, abonnés, sessions)
- Gestion des abonnés (liste, détails, annulation)
- Analytiques des séances (taux de complétion, durée)
- Gestion des séances (créer, modifier, supprimer)
- **Modification des photos de couverture des séances** ✅
- Gestion des exercices par séance
- Gestion des plans nutrition

### Supplements & Nutrition (4 plans)
- Onglets Suppléments et Repas
- Images pour chaque nutriment et repas
- Vidéos de recettes YouTube
- Macros nutritionnels (Cal, Prot, Carb, Fat)
- Recettes détaillées avec ingrédients et étapes

### Payments
- Intégration Stripe complète
- Abonnements mensuels et annuels
- Essai gratuit de 7 jours
- Webhook pour confirmation de paiement

### Additional Features
- Page QR Code (/qrcode) pour partage
- Internationalisation FR/EN avec toggle dans nav

## Prioritized Backlog

### P0 - Critical
- Implémenter achats in-app natifs (Apple/Google) pour distribution stores
- Guide de soumission aux App Stores

### P1 - Important
- Vérifier logique engagement annuel dans Stripe
- Configuration domaine personnalisé (fitmax-gains.com)
- Photos pour les étapes des recettes

### P2 - Nice to Have
- Refactorisation backend (server.py -> routes modulaires)
- Refactorisation frontend (AdminPage.js -> composants)
- Système de notifications push

## Technical Architecture

```
/app/
├── backend/
│   ├── server.py              # API FastAPI (+1200 lignes)
│   ├── add_leg_workouts.py    # Seeding jambes/fessiers
│   ├── add_women_workouts.py  # Seeding spécial femme
│   ├── add_recipes.py         # Seeding recettes
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.js    # Site web complet
│   │   │   ├── AdminPage.js      # Panneau admin (+1300 lignes)
│   │   │   ├── QRCodePage.js     # Page QR Code
│   │   │   └── ...
│   │   ├── components/
│   │   │   ├── Footer.js         # Footer complet
│   │   │   └── ...
│   │   ├── context/AuthContext.js
│   │   └── i18n.js
│   ├── capacitor.config.json
│   └── package.json
└── memory/
    └── PRD.md
```

## Key API Endpoints
- POST /api/auth/login - Connexion email
- POST /api/auth/register - Inscription
- GET /api/auth/me - Utilisateur courant
- GET /api/workouts - Liste programmes
- GET /api/workouts/{id} - Détail programme
- GET /api/supplements - Plans nutritionnels
- POST /api/payments/checkout - Session Stripe
- GET /api/admin/stats - Statistiques admin
- GET /api/admin/subscribers - Liste abonnés
- PUT /api/admin/workouts/{id}/full - Modifier séance (incl. photo couverture)

## Test Credentials
- Admin Email: mouctar08000@hotmail.com
- Admin Password: Football-du-08
- Subscription: VIP

## Known Issues (Resolved)
- ✅ Redirection après connexion - CORRIGÉ
- ⚠️ Export GitHub - Bug plateforme Emergent (support technique requis)
- ⚠️ React key warning dans AdminPage - Mineur, données dupliquées possibles

## Environment
- Frontend URL: https://fitmax-gains.preview.emergentagent.com
- Backend: FastAPI sur port 8001
- Database: MongoDB local
- Payments: Stripe test mode
