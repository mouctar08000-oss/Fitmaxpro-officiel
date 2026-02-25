# FitMaxPro - Product Requirements Document

## Original Problem Statement
Application de fitness nommée "FitMaxPro" avec:
- Plans de paiement: VIP (9,99€/mois), Standard (6,99€/mois), Supplément (4,99€)
- Séances de musculation pour débutants, amateurs et professionnels
- Programmes prise de masse et perte de poids
- Suppléments nutritionnels
- Internationalisation: Français et Anglais
- Authentification: Email/mot de passe et Google OAuth
- Paiements Stripe avec abonnements mensuels et annuels

## User Personas
- Débutants en musculation cherchant des programmes structurés
- Amateurs souhaitant progresser avec des exercices plus avancés
- Professionnels nécessitant des programmes intensifs
- Tous niveaux intéressés par les plans nutritionnels

## Core Requirements
1. ✅ Application full-stack React/FastAPI/MongoDB
2. ✅ Authentification (email/password + Google OAuth)
3. ✅ Intégration Stripe pour paiements
4. ✅ Catalogue de programmes d'entraînement détaillés
5. ✅ Plans nutritionnels avec suppléments
6. ✅ Internationalisation (FR/EN)
7. ✅ Images et vidéos pour chaque exercice (Pexels + YouTube)
8. ✅ Recettes et repas avec macros nutritionnels
9. 🔄 Préparation mobile (Capacitor) - En cours
10. ❌ Achats in-app natifs (iOS/Android) - Non implémenté
11. ❌ Soumission App Stores - Non fait

## Implemented Features (Dec 2025)

### Authentication
- Email/password signup et login
- Google OAuth via Emergent Auth
- Session management avec JWT et localStorage fallback

### Workouts
- Catalogue de 34 programmes (FR + EN)
- 3 niveaux: Débutant, Amateur, Pro
- 2 types: Prise de masse, Perte de poids
- Images Pexels pour chaque exercice
- Vidéos YouTube intégrées avec modal

### Supplements & Nutrition
- 4 packs nutritionnels (2 FR, 2 EN)
- Onglets Suppléments et Repas
- Images pour chaque nutriment et repas
- Vidéos de recettes YouTube
- Affichage des macros (Cal, Prot, Carb, Fat)

### Payments
- Intégration Stripe complète
- Abonnements mensuels et annuels
- Webhook pour confirmation de paiement

### UI/UX
- Design sombre moderne
- Navigation responsive
- Modal vidéo avec fermeture
- Filtres par niveau et type de programme

## Prioritized Backlog

### P0 - Critical
- Implémenter achats in-app natifs (Apple/Google) pour distribution stores

### P1 - Important
- Vérifier logique engagement annuel dans Stripe
- Build et soumission App Stores
- Améliorer gestion erreurs login

### P2 - Nice to Have
- Tableau de bord admin
- Statistiques utilisateurs
- Système de favoris

## Technical Architecture

```
/app/
├── backend/
│   ├── server.py           # API FastAPI
│   ├── seed_detailed_workouts.py
│   ├── seed_media_content.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/          # React pages
│   │   ├── components/     # Composants UI
│   │   ├── context/        # AuthContext
│   │   └── i18n.js         # Traductions
│   ├── capacitor.config.json
│   └── package.json
└── memory/
    └── PRD.md
```

## API Endpoints
- POST /api/auth/login - Connexion email
- POST /api/auth/register - Inscription
- GET /api/auth/me - Utilisateur courant
- GET /api/workouts - Liste programmes
- GET /api/workouts/{id} - Détail programme
- GET /api/supplements - Plans nutritionnels
- POST /api/payments/checkout - Session Stripe

## Test Credentials
- Email: msoumah.etion@gmail.com
- Password: Football-du-08
- Subscription: VIP

## Known Issues
- Certaines vidéos YouTube peuvent être indisponibles (contenu externe)
- La session peut ne pas persister sur tous les navigateurs (fallback localStorage actif)
