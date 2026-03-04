# Guide de Publication FitMaxPro sur App Store et Google Play

## 📱 Vue d'ensemble

FitMaxPro est actuellement une **Progressive Web App (PWA)** / application web React. Pour la publier sur les stores, vous avez **2 options** :

### Option 1 : Wrapper avec Capacitor/Cordova (Recommandé - Plus rapide)
### Option 2 : Conversion native complète (Plus coûteux)

---

## 🍎 PUBLICATION SUR APPLE APP STORE

### Prérequis
1. **Compte Apple Developer** (99$/an) → https://developer.apple.com
2. **Mac avec Xcode** (obligatoire pour builder des apps iOS)
3. **Certificats de distribution** (créés dans Apple Developer Portal)

### Étapes avec Capacitor

#### 1. Installation de Capacitor
```bash
cd /app/frontend
npm install @capacitor/core @capacitor/cli @capacitor/ios
npx cap init FitMaxPro com.fitmaxpro.app
```

#### 2. Build de l'application React
```bash
npm run build
```

#### 3. Ajout de la plateforme iOS
```bash
npx cap add ios
npx cap sync ios
```

#### 4. Ouvrir dans Xcode
```bash
npx cap open ios
```

#### 5. Configuration dans Xcode
- Sélectionner votre Team (compte développeur)
- Configurer le Bundle Identifier : `com.fitmaxpro.app`
- Ajouter les icônes d'app (1024x1024 requis)
- Ajouter les screenshots pour les différentes tailles d'iPhone

#### 6. Archiver et soumettre
- Product → Archive
- Distribute App → App Store Connect
- Attendre la validation Apple (1-3 jours)

### Configuration App Store Connect
1. Créer une nouvelle app dans App Store Connect
2. Remplir les informations :
   - Nom : FitMaxPro
   - Catégorie : Health & Fitness
   - Prix : Gratuit (achats in-app)
   - Description, mots-clés, screenshots
   - Politique de confidentialité (OBLIGATOIRE)

### ⚠️ Points importants pour Apple
- **Achats in-app** : Apple prend 30% sur les abonnements. Vous DEVEZ utiliser le système d'achat Apple (pas Stripe directement)
- **Solution** : Intégrer **RevenueCat** qui gère les achats Apple et Google
- **Durée de validation** : 1-7 jours (première soumission)

---

## 🤖 PUBLICATION SUR GOOGLE PLAY STORE

### Prérequis
1. **Compte Google Play Developer** (25$ une fois) → https://play.google.com/console
2. **Android Studio** (gratuit, fonctionne sur Mac/Windows/Linux)
3. **Keystore de signature** (généré une fois, à conserver précieusement)

### Étapes avec Capacitor

#### 1. Ajout de la plateforme Android
```bash
cd /app/frontend
npx cap add android
npx cap sync android
```

#### 2. Ouvrir dans Android Studio
```bash
npx cap open android
```

#### 3. Configuration dans Android Studio
- Modifier `android/app/build.gradle` pour le versionCode
- Ajouter les icônes (ic_launcher) - 192x192 et 512x512
- Configurer le package name : `com.fitmaxpro.app`

#### 4. Générer le Keystore (une seule fois !)
```bash
keytool -genkey -v -keystore fitmaxpro-release.keystore -alias fitmaxpro -keyalg RSA -keysize 2048 -validity 10000
```
⚠️ **CONSERVEZ CE FICHIER ET LE MOT DE PASSE** - Impossible de mettre à jour l'app sans !

#### 5. Build de l'APK/AAB signé
- Build → Generate Signed Bundle/APK
- Choisir Android App Bundle (.aab) - requis par Google
- Sélectionner votre keystore

#### 6. Soumettre sur Google Play Console
1. Créer une nouvelle application
2. Remplir les informations :
   - Nom : FitMaxPro
   - Catégorie : Santé et remise en forme
   - Description courte/longue
   - Screenshots (min 2, max 8)
   - Icône 512x512
   - Graphic feature 1024x500
3. Uploader l'AAB dans "Production" ou "Test interne"

### ⚠️ Points importants pour Google
- **Politique de facturation** : Google prend aussi 15-30%
- **Validation** : Plus rapide qu'Apple (quelques heures à 3 jours)
- **Intégration paiements** : Utiliser Google Play Billing ou **RevenueCat**

---

## 💳 INTÉGRATION DES ACHATS IN-APP (OBLIGATOIRE)

### Pourquoi RevenueCat ?
Les stores **interdisent** l'utilisation de Stripe pour les achats dans l'app. Vous DEVEZ utiliser leurs systèmes natifs.

**RevenueCat** unifie :
- Apple App Store (StoreKit)
- Google Play (Billing Library)
- Gestion des abonnements
- Analytics

### Configuration RevenueCat
1. Créer un compte sur https://www.revenuecat.com (gratuit jusqu'à 2500$/mois)
2. Ajouter vos apps iOS et Android
3. Créer vos produits dans App Store Connect et Google Play Console
4. Lier les produits à RevenueCat
5. Intégrer le SDK dans votre app

### Prix à configurer
| Plan | Prix App Store | Prix Google Play |
|------|----------------|------------------|
| VIP | 9,99 €/mois | 9,99 €/mois |
| Standard | 6,99 €/mois | 6,99 €/mois |
| Supplément | 4,99 € (one-time) | 4,99 € (one-time) |

---

## 📋 CHECKLIST AVANT SOUMISSION

### Documents requis
- [ ] **Politique de confidentialité** (URL publique obligatoire)
- [ ] **Conditions d'utilisation**
- [ ] **URL de support** (email ou page web)

### Assets graphiques
| Asset | Taille | Requis pour |
|-------|--------|-------------|
| Icône app | 1024x1024 | iOS & Android |
| Feature graphic | 1024x500 | Google Play |
| Screenshots iPhone | 6.5" et 5.5" | iOS |
| Screenshots Android | 16:9 ou 9:16 | Android |

### Tests à effectuer
- [ ] Login/Signup fonctionne
- [ ] Paiements fonctionnent (sandbox)
- [ ] Notifications push
- [ ] Mode hors-ligne (PWA)
- [ ] Performance (pas de crash)

---

## 🚀 TIMELINE ESTIMÉE

| Étape | Durée |
|-------|-------|
| Configuration Capacitor | 1 jour |
| Build iOS + Tests | 2-3 jours |
| Build Android + Tests | 1-2 jours |
| Intégration RevenueCat | 2-3 jours |
| Création comptes développeur | 1 jour |
| Préparation assets | 1 jour |
| Soumission + Validation Apple | 3-7 jours |
| Soumission + Validation Google | 1-3 jours |
| **TOTAL** | **~2-3 semaines** |

---

## 💰 COÛTS

| Item | Coût |
|------|------|
| Apple Developer (annuel) | 99 $/an |
| Google Play (une fois) | 25 $ |
| RevenueCat | Gratuit < 2500$/mois |
| Mac (si pas déjà) | ~1000-2000 € |
| **Total démarrage** | ~125 $ + Mac |

---

## 🔧 COMMANDES RAPIDES

```bash
# Installation complète
cd /app/frontend
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap init FitMaxPro com.fitmaxpro.app

# Build React
npm run build

# iOS
npx cap add ios
npx cap sync ios
npx cap open ios

# Android
npx cap add android  
npx cap sync android
npx cap open android
```

---

## 📞 BESOIN D'AIDE ?

Si vous souhaitez que je :
1. Configure Capacitor pour vous
2. Prépare les builds iOS/Android
3. Intègre RevenueCat pour les paiements in-app
4. Crée les assets graphiques (icônes, screenshots)

Dites-le moi et je peux vous guider étape par étape !
