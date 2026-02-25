# Guide de Déploiement Mobile - FitMaxPro

## 📱 Configuration Capacitor Complète

FitMaxPro est maintenant configuré avec Capacitor pour être déployé sur iOS (App Store) et Android (Google Play Store) en tant qu'**application gratuite** avec abonnements in-app.

---

## 🎯 Modèle Économique

- **Téléchargement**: GRATUIT
- **Monétisation**: Abonnements in-app
  - Standard: 6,99€/mois ou 69,99€/an
  - VIP: 9,99€/mois ou 99,99€/an
  - Suppléments: 4,99€/mois

---

## 📋 Prérequis

### Pour iOS (App Store)
1. **Compte Apple Developer** (~99$/an)
   - S'inscrire: https://developer.apple.com/programs/
2. **Mac avec Xcode** (obligatoire pour build iOS)
3. **Certificats et Provisioning Profiles**

### Pour Android (Google Play Store)
1. **Compte Google Play Console** (~25$ paiement unique)
   - S'inscrire: https://play.google.com/console/signup
2. **Keystore pour signature** (on va le générer)

---

## 🚀 Étapes de Déploiement

### 1. Build de Production

```bash
cd /app/frontend

# Build de l'application web
yarn build

# Copier les assets vers les projets natifs
npx cap sync
```

### 2. Android - Google Play Store

#### A. Créer le projet Android
```bash
npx cap add android
```

#### B. Générer une Keystore (première fois uniquement)
```bash
keytool -genkey -v -keystore fitmaxpro-release.keystore -alias fitmaxpro -keyalg RSA -keysize 2048 -validity 10000
```
**⚠️ IMPORTANT**: Sauvegardez précieusement cette keystore et son mot de passe !

#### C. Configurer la signature
Éditer `/app/frontend/android/app/build.gradle`:

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file('../../fitmaxpro-release.keystore')
            storePassword 'VOTRE_MOT_DE_PASSE'
            keyAlias 'fitmaxpro'
            keyPassword 'VOTRE_MOT_DE_PASSE'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

#### D. Build APK/AAB de production
```bash
cd android
./gradlew bundleRelease  # Pour AAB (recommandé)
# OU
./gradlew assembleRelease  # Pour APK

# Le fichier sera dans: android/app/build/outputs/bundle/release/app-release.aab
```

#### E. Soumission sur Google Play Console

1. Aller sur https://play.google.com/console
2. "Créer une application"
3. Remplir les informations:
   - **Nom**: FitMaxPro
   - **Langue par défaut**: Français
   - **Type**: Application
   - **Gratuit/Payant**: Gratuit
4. **Fiche du Store**:
   - Titre: FitMaxPro
   - Description courte: "Transformez votre corps avec des programmes professionnels"
   - Description complète: [Voir section Descriptions ci-dessous]
   - Captures d'écran (minimum 2)
   - Icône (512x512px)
5. **Confidentialité**:
   - URL de la politique de confidentialité (à créer)
6. **Contenu de l'application**:
   - Classification du contenu
   - Public cible: 13+
7. **Production > Créer une version**:
   - Uploader le fichier AAB
   - Notes de version
8. **Soumettre pour examen**

---

### 3. iOS - App Store

#### A. Créer le projet iOS
```bash
npx cap add ios
```

#### B. Ouvrir dans Xcode (sur Mac uniquement)
```bash
npx cap open ios
```

#### C. Configuration dans Xcode

1. **Bundle Identifier**: `com.fitmaxpro.app`
2. **Version**: 1.0.0
3. **Build**: 1
4. **Signing & Capabilities**:
   - Sélectionner votre compte Apple Developer
   - Activer "Automatically manage signing"
5. **In-App Purchase Capability**:
   - Signing & Capabilities > + Capability > In-App Purchase

#### D. Build pour distribution
1. Dans Xcode: Product > Archive
2. Une fois l'archive créée, cliquer "Distribute App"
3. Choisir "App Store Connect"
4. Upload to App Store Connect

#### E. Soumission sur App Store Connect

1. Aller sur https://appstoreconnect.apple.com
2. "Mes apps" > "+" > "Nouvelle app"
3. Remplir les informations:
   - **Plateforme**: iOS
   - **Nom**: FitMaxPro
   - **Langue principale**: Français
   - **Bundle ID**: com.fitmaxpro.app
   - **SKU**: FITMAXPRO001
4. **Informations de l'app**:
   - Catégorie principale: Santé et forme
   - Catégorie secondaire: Style de vie
5. **Tarifs et disponibilité**:
   - Prix: Gratuit
   - Disponibilité: Tous les pays
6. **Préparation pour soumission**:
   - Captures d'écran (6,5", 5,5", iPad Pro)
   - Textes promotionnels
   - Description [Voir section ci-dessous]
   - Mots-clés: fitness,musculation,nutrition,sport,entrainement
   - URL d'assistance
   - Politique de confidentialité
7. **Build**: Sélectionner le build uploadé
8. **Soumettre pour examen**

---

## 🔐 Configuration des Abonnements In-App

### Google Play Console

1. **Monétiser > Produits > Abonnements**
2. Créer 3 produits d'abonnement:

**Standard Mensuel**:
- ID: `standard_monthly`
- Nom: Abonnement Standard
- Prix: 6,99€
- Période: 1 mois
- Essai gratuit: 7 jours (optionnel)

**VIP Mensuel**:
- ID: `vip_monthly`
- Nom: Abonnement VIP
- Prix: 9,99€
- Période: 1 mois

**Suppléments**:
- ID: `supplements_monthly`
- Nom: Pack Suppléments
- Prix: 4,99€
- Période: 1 mois

### App Store Connect

1. **Fonctionnalités > Achats in-app**
2. Créer les mêmes 3 abonnements avec les mêmes IDs
3. Créer un **Groupe d'abonnements**: "FitMaxPro Memberships"
4. Configurer les niveaux d'abonnement

---

## 📝 Descriptions pour les Stores

### Description Courte (80 caractères max)
```
Transformez votre corps avec des programmes fitness professionnels
```

### Description Complète

**Français:**
```
🏋️ FITMAXPRO - VOTRE COACH FITNESS PERSONNEL

Atteignez vos objectifs avec FitMaxPro, l'application de fitness qui propose des programmes d'entraînement professionnels et des plans nutritionnels adaptés à tous les niveaux.

💪 PROGRAMMES D'ENTRAÎNEMENT
• Prise de masse musculaire
• Perte de poids et définition
• 3 niveaux : Débutant, Amateur, Pro
• Séances détaillées avec exercices, séries et temps de repos

🥗 NUTRITION & SUPPLÉMENTS
• Plans nutritionnels personnalisés
• Guides de supplémentation
• Conseils dosage selon vos objectifs

✨ FONCTIONNALITÉS
• Interface moderne et intuitive
• Multi-langue (Français/Anglais)
• Suivi de progression
• Accès illimité aux programmes

📱 ABONNEMENTS
Standard (6,99€/mois) : Tous les programmes débutant et amateur
VIP (9,99€/mois) : Programmes pro avancés + nutrition personnalisée
Suppléments (4,99€/mois) : Plans nutritionnels complets

Téléchargement GRATUIT - Commencez votre transformation dès aujourd'hui !

Support : [VOTRE_EMAIL]
Politique de confidentialité : [VOTRE_URL]
Conditions d'utilisation : [VOTRE_URL]
```

**Anglais:**
```
🏋️ FITMAXPRO - YOUR PERSONAL FITNESS COACH

Achieve your goals with FitMaxPro, the fitness app offering professional workout programs and nutrition plans for all levels.

💪 WORKOUT PROGRAMS
• Muscle gain
• Weight loss and definition
• 3 levels: Beginner, Intermediate, Pro
• Detailed sessions with exercises, sets, and rest times

🥗 NUTRITION & SUPPLEMENTS
• Personalized nutrition plans
• Supplementation guides
• Dosage advice based on your goals

✨ FEATURES
• Modern and intuitive interface
• Multi-language (French/English)
• Progress tracking
• Unlimited access to programs

📱 SUBSCRIPTIONS
Standard (€6.99/month): All beginner and intermediate programs
VIP (€9.99/month): Advanced pro programs + personalized nutrition
Supplements (€4.99/month): Complete nutrition plans

FREE Download - Start your transformation today!

Support: [YOUR_EMAIL]
Privacy Policy: [YOUR_URL]
Terms of Use: [YOUR_URL]
```

---

## 🖼️ Ressources Graphiques Requises

### Icône de l'application
- **iOS**: 1024x1024px (PNG sans transparence)
- **Android**: 512x512px (PNG, 32-bit avec alpha)

### Splash Screen
- 2732x2732px (background #09090b avec logo centré)

### Captures d'écran

**iOS** (obligatoire):
- iPhone 6.5" (1242x2688px) - 3 à 10 captures
- iPhone 5.5" (1242x2208px) - 3 à 10 captures
- iPad Pro 12.9" (2048x2732px) - 3 à 10 captures

**Android** (obligatoire):
- Téléphone (min 320px de largeur) - 2 à 8 captures
- Tablette 7" (optionnel)
- Tablette 10" (optionnel)

**Contenu suggéré pour captures d'écran**:
1. Landing page / Hero
2. Catalogue de workouts
3. Détail d'une séance
4. Dashboard utilisateur
5. Plans nutritionnels
6. Page de pricing

---

## ⚙️ Adaptation du Code pour Mobile

### Détecter la plateforme
```javascript
import { Capacitor } from '@capacitor/core';

const isMobile = Capacitor.isNativePlatform();
const platform = Capacitor.getPlatform(); // 'ios', 'android', 'web'
```

### Utiliser les paiements natifs au lieu de Stripe
Pour les apps mobiles, Apple et Google imposent l'utilisation de leurs systèmes de paiement (commission 15-30%).

**Installation**:
```bash
yarn add @capgo/capacitor-purchases
npx cap sync
```

**Code d'exemple** (à implémenter):
```javascript
import { CapacitorPurchases } from '@capgo/capacitor-purchases';

// Initialisation
await CapacitorPurchases.setup({ 
  apiKey: 'VOTRE_REVENUECAT_KEY' // ou directement StoreKit/Play Billing
});

// Acheter un abonnement
const result = await CapacitorPurchases.purchasePackage({ 
  identifier: 'standard_monthly' 
});
```

---

## 📦 Commandes Récapitulatives

```bash
# Build production
cd /app/frontend
yarn build

# Sync avec Capacitor
npx cap sync

# Android
npx cap add android
npx cap open android
# Build: ./gradlew bundleRelease

# iOS (sur Mac uniquement)
npx cap add ios
npx cap open ios
# Build: Xcode > Product > Archive
```

---

## ⚠️ Notes Importantes

1. **Review Times**:
   - Google Play: 1-3 jours
   - App Store: 1-7 jours

2. **Commissions**:
   - Apple: 30% première année, 15% après
   - Google: 15% (< 1M$), 30% au-delà

3. **Politique de confidentialité**: OBLIGATOIRE (créer une page dédiée)

4. **Conditions d'utilisation**: OBLIGATOIRE

5. **Support Email**: Requis pour la soumission

6. **Age Rating**:
   - Recommandé: 13+ (fitness/health content)

---

## 🎨 Génération des Icônes et Splash Screens

Je vais créer un script pour générer automatiquement toutes les tailles d'icônes:

```bash
# Installer outil de génération
npm install -g cordova-res

# À partir d'une icône source (icon.png 1024x1024)
# et splash screen source (splash.png 2732x2732)
cordova-res ios --skip-config --copy
cordova-res android --skip-config --copy
```

---

## 📞 Support & Contact

Pour toute question sur le déploiement:
1. Documentation Capacitor: https://capacitorjs.com/docs
2. Google Play Console Help: https://support.google.com/googleplay/android-developer
3. App Store Connect Help: https://developer.apple.com/help/app-store-connect

---

**✅ FitMaxPro est maintenant prêt pour le déploiement mobile !**

Une fois les comptes créés et les ressources graphiques prêtes, le processus de soumission prend environ 2-3 heures par plateforme.
