# Implémentation des Paiements In-App Natifs

## 🔄 Architecture Hybride : Web (Stripe) + Mobile (Native IAP)

FitMaxPro utilise actuellement Stripe pour les paiements web. Pour les apps mobiles sur App Store et Google Play, **Apple et Google imposent l'utilisation de leurs systèmes de paiement** pour les contenus numériques et abonnements (commission 15-30%).

---

## 📱 Solution Recommandée: RevenueCat

**RevenueCat** est un SDK qui simplifie la gestion des abonnements cross-platform en unifiant:
- iOS StoreKit
- Google Play Billing
- Stripe (pour le web)
- Amazon Appstore

### Avantages
✅ Un seul code pour iOS + Android + Web
✅ Gestion automatique des renouvellements
✅ Analytics et dashboard
✅ Webhooks pour synchronisation backend
✅ Gratuit jusqu'à $2.5k MRR

---

## 🚀 Implémentation avec RevenueCat

### 1. Installation

```bash
cd /app/frontend
yarn add @revenuecat/purchases-capacitor
npx cap sync
```

### 2. Configuration Backend

Créer un compte sur https://app.revenuecat.com et configurer:

**a. Projets:**
- iOS: Bundle ID `com.fitmaxpro.app`
- Android: Package `com.fitmaxpro.app`

**b. Products (Abonnements):**
Créer 5 produits dans RevenueCat qui correspondent à vos SKUs:

| RevenueCat ID | iOS SKU | Android SKU | Prix |
|---------------|---------|-------------|------|
| standard_monthly | standard_monthly | standard_monthly | 6,99€ |
| standard_annual | standard_annual | standard_annual | 69,99€ |
| vip_monthly | vip_monthly | vip_monthly | 9,99€ |
| vip_annual | vip_annual | vip_annual | 99,99€ |
| supplements | supplements_monthly | supplements_monthly | 4,99€ |

**c. Entitlements (Droits d'accès):**
- `standard`: Accès aux programmes débutant/amateur
- `vip`: Accès à tous les programmes + nutrition
- `supplements`: Accès aux plans nutritionnels

### 3. Configuration dans les Stores

#### App Store Connect
1. Aller dans **Fonctionnalités > Achats in-app**
2. Créer un **Groupe d'abonnements**: "FitMaxPro Memberships"
3. Créer les 5 abonnements avec IDs correspondants
4. Copier le **Shared Secret** dans RevenueCat

#### Google Play Console
1. Aller dans **Monétiser > Produits > Abonnements**
2. Créer les 5 abonnements
3. Configurer **Service credentials** (JSON key)
4. Uploader dans RevenueCat

### 4. Code Frontend - Initialisation

Créer `/app/frontend/src/services/purchases.js`:

```javascript
import { Purchases } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

const REVENUECAT_API_KEY_IOS = 'votre_key_ios';
const REVENUECAT_API_KEY_ANDROID = 'votre_key_android';

export const initializePurchases = async (userId) => {
  if (!Capacitor.isNativePlatform()) {
    console.log('Web platform - using Stripe');
    return;
  }

  const platform = Capacitor.getPlatform();
  const apiKey = platform === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;

  try {
    await Purchases.configure({ apiKey });
    
    // Identifier l'utilisateur
    if (userId) {
      await Purchases.logIn({ appUserID: userId });
    }
    
    console.log('RevenueCat initialized');
  } catch (error) {
    console.error('RevenueCat initialization error:', error);
  }
};

export const getAvailablePackages = async () => {
  try {
    const offerings = await Purchases.getOfferings();
    
    if (offerings.current !== null) {
      return offerings.current.availablePackages;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching packages:', error);
    return [];
  }
};

export const purchasePackage = async (packageToPurchase) => {
  try {
    const purchaseResult = await Purchases.purchasePackage({
      aPackage: packageToPurchase
    });
    
    const { customerInfo } = purchaseResult;
    
    // Vérifier les entitlements actifs
    if (customerInfo.entitlements.active['vip']) {
      return { success: true, tier: 'vip', info: customerInfo };
    } else if (customerInfo.entitlements.active['standard']) {
      return { success: true, tier: 'standard', info: customerInfo };
    } else if (customerInfo.entitlements.active['supplements']) {
      return { success: true, tier: 'supplements', info: customerInfo };
    }
    
    return { success: false, error: 'No active entitlements' };
  } catch (error) {
    if (error.code === 'PURCHASE_CANCELLED') {
      return { success: false, cancelled: true };
    }
    
    console.error('Purchase error:', error);
    return { success: false, error: error.message };
  }
};

export const restorePurchases = async () => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return { success: true, info: customerInfo };
  } catch (error) {
    console.error('Restore error:', error);
    return { success: false, error: error.message };
  }
};

export const getCustomerInfo = async () => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('Error fetching customer info:', error);
    return null;
  }
};

export const checkSubscriptionStatus = async () => {
  try {
    const customerInfo = await getCustomerInfo();
    
    if (!customerInfo) return { tier: 'none', status: 'inactive' };
    
    const entitlements = customerInfo.entitlements.active;
    
    if (entitlements['vip']) {
      return { tier: 'vip', status: 'active', expiresAt: entitlements['vip'].expirationDate };
    } else if (entitlements['standard']) {
      return { tier: 'standard', status: 'active', expiresAt: entitlements['standard'].expirationDate };
    } else if (entitlements['supplements']) {
      return { tier: 'supplements', status: 'active', expiresAt: entitlements['supplements'].expirationDate };
    }
    
    return { tier: 'none', status: 'inactive' };
  } catch (error) {
    console.error('Error checking subscription:', error);
    return { tier: 'none', status: 'inactive' };
  }
};
```

### 5. Modification de PricingPage.js

Ajouter la détection de plateforme:

```javascript
import { Capacitor } from '@capacitor/core';
import { purchasePackage } from '../services/purchases';

const PricingPage = () => {
  const isMobile = Capacitor.isNativePlatform();
  
  const handleSubscribe = async (tier) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    
    try {
      if (isMobile) {
        // Mobile: Utiliser RevenueCat
        const packages = await getAvailablePackages();
        const selectedPackage = packages.find(p => 
          p.identifier === `${tier}_${billingCycle}`
        );
        
        if (selectedPackage) {
          const result = await purchasePackage(selectedPackage);
          
          if (result.success) {
            toast.success('Abonnement activé !');
            await checkAuth(); // Refresh user info
            navigate('/dashboard');
          } else if (result.cancelled) {
            toast.info('Achat annulé');
          } else {
            toast.error('Erreur lors de l\'achat');
          }
        }
      } else {
        // Web: Utiliser Stripe existant
        const response = await axios.post(
          `${API}/payments/checkout`,
          {
            tier,
            billing_cycle: billingCycle,
            origin_url: window.location.origin
          },
          { withCredentials: true }
        );
        
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Erreur lors du paiement');
    } finally {
      setLoading(false);
    }
  };
  
  // ... reste du code
};
```

### 6. Initialiser dans App.js

```javascript
import { initializePurchases } from './services/purchases';

function App() {
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      initializePurchases(user.user_id);
    }
  }, [user]);
  
  // ... reste du code
}
```

### 7. Webhooks Backend

RevenueCat envoie des webhooks pour synchroniser les abonnements:

Ajouter dans `/app/backend/server.py`:

```python
@api_router.post("/webhook/revenuecat")
async def revenuecat_webhook(request: Request):
    body = await request.json()
    
    event_type = body.get("type")
    app_user_id = body.get("app_user_id")
    
    if event_type == "INITIAL_PURCHASE":
        # Nouvel abonnement
        product_id = body.get("product_id")
        # Mettre à jour l'utilisateur dans la base
        await db.users.update_one(
            {"user_id": app_user_id},
            {"$set": {
                "subscription_tier": get_tier_from_product(product_id),
                "subscription_status": "active"
            }}
        )
    
    elif event_type == "RENEWAL":
        # Renouvellement automatique
        pass
    
    elif event_type == "CANCELLATION":
        # Annulation
        await db.users.update_one(
            {"user_id": app_user_id},
            {"$set": {"subscription_status": "cancelled"}}
        )
    
    elif event_type == "EXPIRATION":
        # Expiration
        await db.users.update_one(
            {"user_id": app_user_id},
            {"$set": {
                "subscription_tier": "none",
                "subscription_status": "inactive"
            }}
        )
    
    return {"status": "success"}

def get_tier_from_product(product_id: str) -> str:
    if "vip" in product_id:
        return "vip"
    elif "standard" in product_id:
        return "standard"
    elif "supplements" in product_id:
        return "supplements"
    return "none"
```

Configurer l'URL webhook dans RevenueCat:
```
https://fitmax-gains.preview.emergentagent.com/api/webhook/revenuecat
```

---

## 🧪 Tests des Achats In-App

### iOS Sandbox Testing
1. Dans Xcode: Product > Scheme > Edit Scheme
2. Run > Options > StoreKit Configuration
3. Créer un fichier `.storekit` avec vos produits
4. Ou utiliser un compte sandbox dans Settings

### Android Testing
1. Créer une liste de testeurs dans Google Play Console
2. Uploader un build en **Internal Testing**
3. Installer l'app via le lien de test
4. Tester avec carte de test Google

---

## 📊 Analytics & Dashboard

RevenueCat fournit automatiquement:
- MRR (Monthly Recurring Revenue)
- Taux de conversion
- Churn rate
- Revenus par produit
- Active subscribers

Dashboard: https://app.revenuecat.com

---

## 🔐 Sécurité

### Validation Server-Side
Toujours valider les achats côté serveur via webhooks RevenueCat.
**Ne jamais faire confiance uniquement au client.**

### User ID Mapping
Lier l'app_user_id RevenueCat à votre user_id MongoDB pour synchronisation.

---

## 💰 Comparaison des Commissions

| Plateforme | Commission Année 1 | Commission Année 2+ |
|------------|-------------------|-------------------|
| App Store | 30% | 15% |
| Google Play | 15% (< $1M) | 15% |
| Stripe (Web) | ~2.9% + 0.30€ | ~2.9% + 0.30€ |

**Important**: Les revenus des apps mobiles passent par Apple/Google, les 6.99€ deviennent ~4.89€ (30%) ou ~5.94€ (15%) nets.

---

## 📝 Checklist Implémentation

- [ ] Créer compte RevenueCat
- [ ] Configurer produits dans App Store Connect
- [ ] Configurer produits dans Google Play Console
- [ ] Configurer produits dans RevenueCat
- [ ] Installer SDK `@revenuecat/purchases-capacitor`
- [ ] Créer service purchases.js
- [ ] Modifier PricingPage pour détecter plateforme
- [ ] Initialiser dans App.js
- [ ] Implémenter webhook backend
- [ ] Tester en sandbox iOS
- [ ] Tester en sandbox Android
- [ ] Vérifier synchronisation avec backend

---

## 🆘 Troubleshooting

### "Unable to purchase"
- Vérifier que les produits sont bien configurés dans les stores
- Vérifier que l'app utilise le bon Bundle ID / Package Name
- Attendre 2-3h après création des produits

### "Receipt validation failed"
- Vérifier les credentials dans RevenueCat
- Vérifier le Shared Secret (iOS) / Service Account (Android)

### Abonnement non reconnu
- Vérifier les entitlements dans RevenueCat
- Vérifier que le mapping produit → entitlement est correct
- Tester avec `getCustomerInfo()` pour debug

---

**✅ Avec cette implémentation, FitMaxPro supportera:**
- Paiements web via Stripe (commission ~3%)
- Paiements iOS via App Store (commission 15-30%)
- Paiements Android via Google Play (commission 15-30%)
- Synchronisation automatique des abonnements
- Restauration des achats
- Gestion du churn

**Temps d'implémentation estimé: 1-2 jours**
