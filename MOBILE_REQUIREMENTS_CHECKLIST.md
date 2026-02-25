# Informations Requises pour Publication sur les Stores

## 📋 Checklist Avant Soumission

### Comptes Requis
- [ ] Compte Apple Developer ($99/an) - https://developer.apple.com/programs/
- [ ] Compte Google Play Console ($25 one-time) - https://play.google.com/console/signup

### Informations de l'Application
- **Nom**: FitMaxPro
- **Bundle ID**: com.fitmaxpro.app
- **Version**: 1.0.0
- **Catégorie**: Santé et Forme / Fitness
- **Classification**: 13+ (contenu fitness/nutrition)
- **Prix**: Gratuit (avec achats in-app)

### Documents Légaux Requis (OBLIGATOIRE)
- [ ] **Politique de confidentialité** (URL publique requise)
- [ ] **Conditions d'utilisation** (URL publique requise)
- [ ] **Email de support** (visible publiquement)

### Abonnements In-App à Configurer

#### Standard Mensuel
- ID produit: `standard_monthly`
- Prix: 6,99€
- Période: 1 mois
- Description: "Accès à tous les programmes débutant et amateur"

#### Standard Annuel
- ID produit: `standard_annual`
- Prix: 69,99€
- Période: 12 mois
- Description: "Accès à tous les programmes débutant et amateur (économie de 2 mois)"

#### VIP Mensuel
- ID produit: `vip_monthly`
- Prix: 9,99€
- Période: 1 mois
- Description: "Tous les programmes + nutrition personnalisée + support prioritaire"

#### VIP Annuel
- ID produit: `vip_annual`
- Prix: 99,99€
- Période: 12 mois
- Description: "Tous les programmes + nutrition personnalisée (économie de 2 mois)"

#### Suppléments
- ID produit: `supplements_monthly`
- Prix: 4,99€
- Période: 1 mois
- Description: "Plans nutritionnels complets et guides de supplémentation"

### Ressources Graphiques à Préparer

#### Icône de l'application
- [ ] Icône 1024x1024px (iOS) - PNG sans transparence
- [ ] Icône 512x512px (Android) - PNG avec alpha
- **Design**: Logo FitMaxPro avec haltère rouge (#EF4444) sur fond noir (#09090b)

#### Feature Graphic (Android uniquement)
- [ ] 1024x500px - Image promotionnelle horizontale
- **Contenu suggéré**: Hero image avec texte "TRANSFORMEZ VOTRE CORPS"

#### Captures d'écran

**À prendre depuis l'app mobile:**

1. **Landing Page** (Hero section)
   - Montrer: Titre principal, boutons CTA, design moderne

2. **Catalogue Workouts**
   - Montrer: Grille de séances avec filtres, badges niveau/type

3. **Détail d'une Séance**
   - Montrer: Liste d'exercices, séries/reps, durée

4. **Dashboard Utilisateur**
   - Montrer: Info abonnement, quick actions vers workouts

5. **Plans Nutritionnels**
   - Montrer: Cards suppléments avec détails nutriments

6. **Page Pricing**
   - Montrer: 3 cartes de tarifs avec features

**Tailles requises:**
- iOS iPhone 6.5": 1242x2688px (3-10 captures)
- iOS iPhone 5.5": 1242x2208px (3-10 captures)
- iOS iPad Pro: 2048x2732px (3-10 captures)
- Android: Min 320px largeur (2-8 captures)

### Textes Marketing

#### Titre (30 caractères max)
```
FitMaxPro - Coach Fitness
```

#### Sous-titre iOS (30 caractères max)
```
Programmes Pro & Nutrition
```

#### Promotion Text iOS (170 caractères max)
```
Transformez votre corps avec des programmes d'entraînement professionnels et des plans nutritionnels adaptés à tous les niveaux. Gratuit à télécharger !
```

#### Mots-clés iOS (100 caractères max, séparés par virgules)
```
fitness,musculation,nutrition,sport,entrainement,gym,muscle,perte,poids,pro
```

#### Description courte Android (80 caractères max)
```
Programmes fitness pro et nutrition. Gratuit avec abonnements in-app
```

### Informations de Contact
- [ ] **Email support**: support@fitmaxpro.com (exemple - à remplacer)
- [ ] **Site web**: https://fitmaxpro.com (exemple - à remplacer)
- [ ] **URL Politique confidentialité**: À créer
- [ ] **URL Conditions utilisation**: À créer

### Configuration Technique

#### Android Build
```bash
# Créer keystore (première fois)
keytool -genkey -v -keystore fitmaxpro-release.keystore \
  -alias fitmaxpro -keyalg RSA -keysize 2048 -validity 10000

# Informations keystore à sauvegarder:
# - Chemin: /app/frontend/fitmaxpro-release.keystore
# - Alias: fitmaxpro
# - Mot de passe store: [À DÉFINIR ET SAUVEGARDER]
# - Mot de passe clé: [À DÉFINIR ET SAUVEGARDER]
```

#### iOS Certificates
- [ ] iOS Distribution Certificate
- [ ] App Store Provisioning Profile
- [ ] Push Notification Certificate (si notifications)

### Tests Avant Soumission
- [ ] Test sur device Android physique
- [ ] Test sur device iOS physique
- [ ] Test des achats in-app (sandbox)
- [ ] Test de restauration d'abonnement
- [ ] Test en mode hors-ligne (contenu minimal)
- [ ] Test des deep links (si applicable)
- [ ] Test rotation écran
- [ ] Test sur différentes tailles d'écran

### Questionnaire de Review

#### Apple Review Questions
1. **L'app nécessite-t-elle un login ?** Oui (Google OAuth)
2. **Compte test fourni ?** Oui (à créer)
3. **Instructions spéciales ?** L'app est gratuite, abonnements in-app disponibles
4. **Utilise des services externes ?** Oui (Google OAuth, Backend API)

#### Google Play Review Questions
1. **Contenu pour adultes ?** Non
2. **Achats in-app ?** Oui (abonnements)
3. **Publicités ?** Non
4. **Public cible ?** 13+
5. **Accès spécial requis ?** Compte Google pour OAuth

### Timeline Estimé

1. **Préparation assets**: 2-3 jours
   - Création icônes
   - Screenshots
   - Textes marketing
   - Documents légaux

2. **Configuration comptes**: 1 jour
   - Apple Developer enrollment
   - Google Play Console setup
   - Achats in-app configuration

3. **Build & tests**: 1-2 jours
   - Build Android & iOS
   - Tests devices
   - Tests achats sandbox

4. **Soumission**: 2-3 heures
   - Upload builds
   - Remplir fiches store
   - Soumission review

5. **Review & Approbation**: 1-7 jours
   - Google: généralement 1-3 jours
   - Apple: généralement 2-7 jours

**Total: 5-14 jours** du début à la publication

---

## 🎯 Prochaines Actions Prioritaires

1. **Créer les comptes développeurs** (Apple + Google)
2. **Préparer les documents légaux** (Privacy Policy + Terms of Service)
3. **Créer l'email de support** pour l'app
4. **Designer l'icône 1024x1024** (ou utiliser service comme AppIcon.co)
5. **Prendre les screenshots** des pages principales
6. **Exécuter le script de build**: `bash /app/scripts/prepare-mobile.sh`

---

## 💡 Services Utiles

### Génération d'Icônes
- https://appicon.co - Génère toutes les tailles d'icônes
- https://www.figma.com - Design custom

### Captures d'Écran
- iPhone et Android Simulators dans Android Studio / Xcode
- Outils: https://www.mokupframes.com (ajoute des frames devices)

### Documents Légaux
- https://www.termsfeed.com - Générateur Privacy Policy
- https://www.freeprivacypolicy.com - Alternative gratuite

### Gestion Abonnements (optionnel)
- https://www.revenuecat.com - Simplifie la gestion multi-plateformes
- Prix: Gratuit jusqu'à $2.5k MRR

---

**Questions ou besoin d'aide ?** 
Consultez le guide complet: `/app/MOBILE_DEPLOYMENT_GUIDE.md`
