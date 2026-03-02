# FitMaxPro - Product Requirements Document

## Original Problem Statement
Application de fitness nommée "FitMaxPro" avec:
- Plans de paiement: VIP (9,99€/mois), Standard (6,99€/mois), Supplément (4,99€)
- Séances de musculation pour débutants, amateurs et professionnels
- Programmes prise de masse, perte de poids, jambes/fessiers, spécial femme
- Suppléments nutritionnels avec recettes détaillées (20+ repas par plan)
- Internationalisation: Français et Anglais
- Authentification: Email/mot de passe et Google OAuth
- Paiements Stripe avec abonnements mensuels et annuels (7 jours essai gratuit)
- Panneau d'administration complet avec gestion des repas
- Site web professionnel pour l'application

## User Personas
- Débutants en musculation cherchant des programmes structurés
- Amateurs souhaitant progresser avec des exercices plus avancés
- Professionnels nécessitant des programmes intensifs
- Femmes cherchant des programmes spécifiques (jambes/fessiers)
- Tous niveaux intéressés par les plans nutritionnels

## Core Requirements (All Implemented ✅)
1. ✅ Application full-stack React/FastAPI/MongoDB
2. ✅ Authentification (email/password + Google OAuth)
3. ✅ Intégration Stripe pour paiements (essai 7 jours)
4. ✅ Catalogue de 51 programmes d'entraînement détaillés
5. ✅ 4 Plans nutritionnels avec 21 repas chacun (84 repas total)
6. ✅ Internationalisation (FR/EN)
7. ✅ Images et vidéos pour chaque exercice et repas
8. ✅ Recettes détaillées avec ingrédients et étapes
9. ✅ Panneau d'administration complet avec gestion des repas
10. ✅ Site web professionnel avec landing page complète
11. ✅ Modification des photos de couverture des séances
12. ✅ Page QR Code pour partage
13. ✅ Ajout/Suppression de repas depuis l'admin

## Website URL
**https://fitmax-gains.preview.emergentagent.com**

## Implemented Features (March 2026)

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
- Chaque repas inclut: nom, description, calories, protéines, glucides, lipides, image, recette

### Admin Panel Features
- Dashboard avec statistiques globales
- Gestion des abonnés (liste, détails, annulation)
- Analytiques des séances
- Gestion complète des séances (CRUD)
- **Modification des photos de couverture** ✅
- **Ajout de nouveaux repas** ✅
- **Suppression de repas** ✅
- Modification des médias (images/vidéos)

### API Endpoints (Nouveaux)
- POST /api/admin/supplements/{id}/meals - Ajouter un repas
- DELETE /api/admin/supplements/{id}/meals/{index} - Supprimer un repas

## Test Credentials
- Admin Email: mouctar08000@hotmail.com
- Admin Password: Football-du-08
- Subscription: VIP

## Prioritized Backlog

### P0 - Critical
- Implémenter achats in-app natifs (Apple/Google) pour distribution stores

### P1 - Important
- Guide de soumission aux App Stores
- Configuration domaine personnalisé (fitmax-gains.com)

### P2 - Nice to Have
- Photos pour les étapes des recettes
- Refactorisation backend (server.py -> routes modulaires)
- Refactorisation frontend (AdminPage.js -> composants)

## Known Issues
- ⚠️ Export GitHub - Bug plateforme Emergent (support technique requis)
