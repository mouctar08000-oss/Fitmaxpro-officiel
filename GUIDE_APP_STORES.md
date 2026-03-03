# Guide de Publication FitMaxPro sur App Store & Google Play

## 📱 Vue d'ensemble

Ce guide détaille les étapes pour publier l'application FitMaxPro sur l'App Store (iOS) et Google Play (Android) en utilisant Capacitor.

## 🎨 Assets Générés

Les assets suivants ont été générés et sont disponibles dans `/frontend/public/assets/` :

### Icône de l'Application
- **Source** : `/frontend/public/assets/icons/icon-1024.png` (1024x1024)
- Cette icône sera automatiquement redimensionnée pour toutes les tailles requises

### Splash Screen
- **Source** : `/frontend/public/assets/splash/splash-1024x1536.png` (1024x1536)
- Écran de démarrage affiché lors du chargement de l'application

---

## 🔧 Prérequis

### Pour iOS (App Store)
- Mac avec macOS Monterey (12) ou supérieur
- Xcode 14+ installé depuis l'App Store
- Compte Apple Developer ($99/an) : https://developer.apple.com/programs/enroll/
- Certificats de distribution iOS configurés

### Pour Android (Google Play)
- Android Studio installé : https://developer.android.com/studio
- JDK 17+ installé
- Compte Google Play Developer ($25 unique) : https://play.google.com/console/signup
- Keystore de signature créé

### Outils requis
```bash
# Node.js 18+ et npm
node -v  # Doit être >= 18

# Capacitor CLI
npm install -g @capacitor/cli

# CocoaPods (pour iOS)
sudo gem install cocoapods
```

---

## 📦 Étape 1 : Préparation du Projet

### 1.1 Build de Production React
```bash
cd /app/frontend

# Créer le build de production
yarn build

# Vérifier que le dossier build/ existe
ls -la build/
```

### 1.2 Configurer Capacitor
Le fichier `capacitor.config.ts` devrait contenir :

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fitmaxpro.app',
  appName: 'FitMaxPro',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0a0a0a",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;
```

### 1.3 Synchroniser Capacitor
```bash
# Synchroniser le build avec les projets natifs
npx cap sync
```

---

## 🍎 Étape 2 : Publication iOS (App Store)

### 2.1 Ajouter la plateforme iOS
```bash
npx cap add ios
npx cap sync ios
```

### 2.2 Configurer les icônes iOS
Créez les icônes aux tailles requises dans `ios/App/App/Assets.xcassets/AppIcon.appiconset/`:

| Taille | Fichier | Usage |
|--------|---------|-------|
| 20x20 | icon-20.png | Notifications |
| 29x29 | icon-29.png | Settings |
| 40x40 | icon-40.png | Spotlight |
| 60x60 | icon-60.png | iPhone |
| 76x76 | icon-76.png | iPad |
| 83.5x83.5 | icon-83.5.png | iPad Pro |
| 1024x1024 | icon-1024.png | App Store |

Script de génération des icônes :
```bash
# Installer ImageMagick si nécessaire
brew install imagemagick

# Générer toutes les tailles
cd /app/frontend/public/assets/icons
convert icon-1024.png -resize 20x20 icon-20.png
convert icon-1024.png -resize 29x29 icon-29.png
convert icon-1024.png -resize 40x40 icon-40.png
convert icon-1024.png -resize 60x60 icon-60.png
convert icon-1024.png -resize 76x76 icon-76.png
convert icon-1024.png -resize 83x83 icon-83.png
convert icon-1024.png -resize 120x120 icon-120.png
convert icon-1024.png -resize 152x152 icon-152.png
convert icon-1024.png -resize 167x167 icon-167.png
convert icon-1024.png -resize 180x180 icon-180.png
```

### 2.3 Ouvrir dans Xcode
```bash
npx cap open ios
```

### 2.4 Configuration dans Xcode
1. **Signing & Capabilities** :
   - Sélectionner votre Team (Apple Developer Account)
   - Activer "Automatically manage signing"
   - Bundle Identifier : `com.fitmaxpro.app`

2. **Info.plist** - Ajouter les permissions :
   ```xml
   <key>NSCameraUsageDescription</key>
   <string>FitMaxPro needs camera access for video calls and live streaming</string>
   
   <key>NSMicrophoneUsageDescription</key>
   <string>FitMaxPro needs microphone access for audio calls and live streaming</string>
   
   <key>NSPhotoLibraryUsageDescription</key>
   <string>FitMaxPro needs photo library access to upload progress photos</string>
   ```

3. **Deployment Target** : iOS 14.0 minimum

### 2.5 Archiver et Soumettre
1. **Product** → **Archive**
2. Une fois archivé, cliquer sur **Distribute App**
3. Sélectionner **App Store Connect** → **Upload**
4. Suivre les étapes de validation

### 2.6 App Store Connect
1. Aller sur https://appstoreconnect.apple.com
2. **My Apps** → **+** → **New App**
3. Remplir les informations :
   - **Nom** : FitMaxPro
   - **Sous-titre** : Votre Coach Fitness Personnel
   - **Catégorie** : Health & Fitness
   - **Description** : (voir section Métadonnées ci-dessous)
4. Ajouter les captures d'écran
5. Soumettre pour Review

---

## 🤖 Étape 3 : Publication Android (Google Play)

### 3.1 Ajouter la plateforme Android
```bash
npx cap add android
npx cap sync android
```

### 3.2 Configurer les icônes Android
Les icônes doivent être placées dans `android/app/src/main/res/`:

| Dossier | Taille | DPI |
|---------|--------|-----|
| mipmap-mdpi | 48x48 | 160 |
| mipmap-hdpi | 72x72 | 240 |
| mipmap-xhdpi | 96x96 | 320 |
| mipmap-xxhdpi | 144x144 | 480 |
| mipmap-xxxhdpi | 192x192 | 640 |

Script de génération :
```bash
cd /app/frontend/public/assets/icons
convert icon-1024.png -resize 48x48 ic_launcher-mdpi.png
convert icon-1024.png -resize 72x72 ic_launcher-hdpi.png
convert icon-1024.png -resize 96x96 ic_launcher-xhdpi.png
convert icon-1024.png -resize 144x144 ic_launcher-xxhdpi.png
convert icon-1024.png -resize 192x192 ic_launcher-xxxhdpi.png
```

### 3.3 Créer la Keystore de Signature
```bash
# Générer une nouvelle keystore (À CONSERVER PRÉCIEUSEMENT !)
keytool -genkey -v -keystore fitmaxpro-release.keystore \
  -alias fitmaxpro \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Répondre aux questions :
# - Mot de passe keystore : (choisir un mot de passe fort)
# - Prénom et Nom : FitMaxPro
# - Organisation : FitMaxPro
# - Ville, État, Pays : (vos informations)
```

⚠️ **IMPORTANT** : Conservez la keystore et les mots de passe en lieu sûr. Si vous les perdez, vous ne pourrez plus mettre à jour l'application !

### 3.4 Configurer la Signature
Créer `android/app/signing.properties` :
```properties
storeFile=../fitmaxpro-release.keystore
storePassword=VOTRE_MOT_DE_PASSE
keyAlias=fitmaxpro
keyPassword=VOTRE_MOT_DE_PASSE
```

Modifier `android/app/build.gradle` :
```groovy
android {
    ...
    signingConfigs {
        release {
            def signingProps = new Properties()
            file("signing.properties").withInputStream { signingProps.load(it) }
            storeFile file(signingProps['storeFile'])
            storePassword signingProps['storePassword']
            keyAlias signingProps['keyAlias']
            keyPassword signingProps['keyPassword']
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

### 3.5 Ouvrir dans Android Studio
```bash
npx cap open android
```

### 3.6 Build Release APK/AAB
```bash
cd android

# Build AAB (recommandé pour Google Play)
./gradlew bundleRelease

# Le fichier sera dans : app/build/outputs/bundle/release/app-release.aab

# OU Build APK
./gradlew assembleRelease

# Le fichier sera dans : app/build/outputs/apk/release/app-release.apk
```

### 3.7 Google Play Console
1. Aller sur https://play.google.com/console
2. **Create app** :
   - **App name** : FitMaxPro
   - **Default language** : Français
   - **App or game** : App
   - **Free or paid** : Paid (si applicable)

3. **Dashboard** → Compléter les sections :
   - Store listing (description, captures d'écran)
   - Content rating
   - Target audience
   - Data safety

4. **Release** → **Production** → **Create new release**
5. Uploader le fichier `.aab`
6. Review and release

---

## 📝 Métadonnées App Stores

### Description Courte (80 caractères)
```
FitMaxPro - Votre coach fitness personnel avec programmes sur mesure
```

### Description Complète
```
🏋️ FITMAXPRO - TRANSFORMEZ VOTRE CORPS

FitMaxPro est votre application de coaching fitness complète, conçue pour vous accompagner dans votre transformation physique, que vous souhaitiez prendre de la masse, perdre du poids, ou simplement améliorer votre condition physique.

✨ FONCTIONNALITÉS PRINCIPALES

📱 PROGRAMMES D'ENTRAÎNEMENT
• Prise de masse musculaire
• Perte de poids
• Programme spécial jambes
• Programme femmes
• Abdominaux sculptés
• Yoga & stretching

🍎 NUTRITION PERSONNALISÉE
• Plans alimentaires adaptés
• Recettes healthy détaillées
• Calcul des macros
• Conseils nutritionnels

📊 SUIVI DE PROGRESSION
• Graphiques d'évolution
• Photos avant/après
• Historique des séances
• Statistiques détaillées

🏃 COURSE À PIED
• Suivi GPS en temps réel
• Statistiques de course
• Défis hebdomadaires
• Classement communautaire

🎥 COACHING EN DIRECT
• Sessions live avec votre coach
• Appels vidéo personnalisés
• Chat en temps réel
• Replay des sessions

💬 COMMUNAUTÉ
• Messagerie avec le coach
• Partage de progression
• Système de récompenses
• Avis vérifiés

🔔 NOTIFICATIONS & RAPPELS
• Rappels d'entraînement
• Alertes de nouveaux lives
• Motivation quotidienne

Rejoignez des milliers de personnes qui ont déjà transformé leur vie avec FitMaxPro !

---
FitMaxPro - Dépassez vos limites. 💪
```

### Mots-clés (iOS)
```
fitness, musculation, coach, entraînement, sport, perte de poids, masse musculaire, workout, gym, exercice
```

### Captures d'écran Requises

#### iPhone
- 6.7" (1290 x 2796) - iPhone 14 Pro Max
- 6.5" (1284 x 2778) - iPhone 14 Plus
- 5.5" (1242 x 2208) - iPhone 8 Plus

#### iPad
- 12.9" (2048 x 2732) - iPad Pro

#### Android
- Phone: 1080 x 1920 minimum
- Tablet 7": 1200 x 1920
- Tablet 10": 1800 x 2560

---

## 🔐 Configuration LiveKit (WebRTC)

Pour activer le streaming vidéo en direct :

### 1. Créer un compte LiveKit Cloud
1. Aller sur https://cloud.livekit.io
2. Créer un compte gratuit
3. Créer un nouveau projet

### 2. Récupérer les clés API
Dans le dashboard LiveKit :
- **WebSocket URL** : `wss://your-project.livekit.cloud`
- **API Key** : `APIxxxxxxxxx`
- **API Secret** : `xxxxxxxxxxxxxxxxx`

### 3. Configurer l'environnement
Ajouter dans `/app/backend/.env` :
```env
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=APIxxxxxxxxx
LIVEKIT_API_SECRET=xxxxxxxxxxxxxxxxx
```

### 4. Redémarrer le backend
```bash
sudo supervisorctl restart backend
```

---

## 🚀 Commandes Rapides

```bash
# Build et sync
cd /app/frontend
yarn build && npx cap sync

# Ouvrir iOS
npx cap open ios

# Ouvrir Android
npx cap open android

# Build Android release
cd android && ./gradlew bundleRelease

# Mettre à jour après modifications
npx cap copy
npx cap sync
```

---

## 📞 Support

Pour toute question concernant la publication :
- Documentation Capacitor : https://capacitorjs.com/docs
- Apple Developer : https://developer.apple.com/support/
- Google Play Support : https://support.google.com/googleplay/android-developer

---

*Document généré le 3 Mars 2026 pour FitMaxPro*
