# FitMaxPro - Product Requirements Document

## Version
- **Version:** 3.1.0
- **Dernière mise à jour:** 6 Mars 2025

## Description du Produit
FitMaxPro est une application de fitness complète offrant du live streaming, des appels vidéo 1-to-1 coach/client, des programmes d'entraînement personnalisés, un suivi de course à pied avec GPS, un système de gamification, **mode hors-ligne**, **synchronisation multi-appareils** et **téléchargement automatique des favoris**.

---

## Fonctionnalités Implémentées

### Core Features
- [x] Authentification - Login/Signup avec JWT
- [x] Dashboard utilisateur - Vue d'ensemble personnalisée
- [x] Navigation responsive - Mobile et desktop

### Live Streaming
- [x] Streaming WebRTC avec LiveKit
- [x] Tokens JWT avec video grants
- [x] Appels vidéo 1-to-1 coach/client
- [x] Chat en temps réel
- [x] Lives programmés

### Entraînements
- [x] 72+ séances prédéfinies
- [x] Plans prise de masse / perte de poids
- [x] Exercices par groupe musculaire
- [x] Lecteur vidéo d'exercices
- [x] CRUD Admin avec upload vidéo/image
- [x] Compression vidéo FFmpeg (H.264, 720p)
- [x] Routes échauffement & étirements

### Mode Hors-ligne
- [x] Service IndexedDB (offlineStorage.js)
- [x] Hook useOffline.js
- [x] Composant OfflineManager.js
- [x] Service Worker avec cache API/images
- [x] Indicateur statut en ligne/hors-ligne
- [x] Bouton téléchargement par séance

### Favoris & Téléchargement Automatique (NOUVEAU)
- [x] Bouton cœur pour ajouter aux favoris
- [x] Stockage favoris dans IndexedDB
- [x] Téléchargement automatique des favoris
- [x] Paramètre on/off auto-download
- [x] Liste favoris avec statut téléchargement
- [x] Bouton "Télécharger tous les favoris"

### Synchronisation Multi-Appareils
- [x] WebSocket temps réel (/api/sync/ws/{user_id})
- [x] Hook useSync.js
- [x] Stratégie "Last write wins"
- [x] Compteur appareils connectés

### Course à Pied
- [x] Suivi GPS
- [x] Classements
- [x] Défis hebdomadaires

### Gamification
- [x] Points et récompenses
- [x] Hall of Fame
- [x] Badges

### Paiements
- [x] Stripe (abonnements web)
- [x] RevenueCat (achats in-app mobile) - Backend prêt
- [x] Logique abonnement annuel (blocage annulation avant 12 mois)

### Admin Panel
- [x] Dashboard analytique
- [x] Gestion abonnés
- [x] Statistiques lives
- [x] Gestion messages/avis
- [x] Upload de fichiers
- [x] Gestion séances

---

## Livrables

### Archive GitHub (6 Mars 2025)
- **Fichier:** `/app/FitMaxPro_GitHub_Final.zip` (2.7 MB)
- **Contenu:**
  - Code source complet (frontend + backend)
  - 20 modules de routes backend
  - Mode hors-ligne + favoris + sync multi-appareils
  - Dockerfiles et docker-compose.yml
  - Fichiers `.env.example` (SANS secrets/identifiants)
  - README.md avec instructions complètes
  - Configuration Android/iOS (Capacitor)

### Kit Marketing
- **Fichier:** `FitMaxPro_Marketing_Kit.zip` (4.6 MB)

---

## API Endpoints Clés

### Routines
- `GET /api/routines/warmup` - Échauffement (5 exercices)
- `GET /api/routines/stretching` - Étirements (5 exercices)

### Sync
- `WS /api/sync/ws/{user_id}` - WebSocket temps réel
- `GET /api/sync/status/{user_id}` - Statut connexion

### Admin Workouts
- `GET /api/workouts/admin/all` - Liste séances
- `POST /api/workouts/admin/upload/video` - Upload + compression

---

## Comptes de Test

| Type | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@fitmaxpro.com | admin123 |
| User | testuser@test.com | password123 |

---

## Backlog

### P1 - Haute Priorité
- [ ] Finaliser intégration frontend RevenueCat
- [ ] Refactoriser AdminPage.js (13 onglets restants)

### P2 - Moyenne Priorité
- [ ] Améliorer couverture tests Pytest
