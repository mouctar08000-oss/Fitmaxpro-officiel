# 🎯 Guide de Gestion de FitMaxPro - Votre Application

## 👨‍💼 Propriétaire et Gestion

Vous êtes maintenant le propriétaire et gestionnaire complet de l'application FitMaxPro. Ce guide vous explique comment gérer tous les aspects de votre application.

---

## 💳 Configuration Stripe (✅ Configuré)

### Vos Clés Stripe

**Clé Secrète (Backend)**: 
```
sk_test_51T4jBgRhIT8pGgphr3p1kTTXUMDQrkGXndQx52hV0QSpO2Edkwvn54ffLwqadneK31qEq8VL4hmjIwbK2V6pK2Ru00k7TZlifP
```

**Clé Publique (Frontend - si nécessaire)**:
```
pk_test_51T4jBgRhIT8pGgphNh0ugLz0k8CvV13sj55TzwITyUgykbOJXyjy6nVXFBG37v1YiIrMcG5PzziSdDLc3V4dYfNb00bnvJPxNY
```

**⚠️ IMPORTANT**: Ces clés sont actuellement en mode TEST. Pour recevoir de vrais paiements :

1. **Connectez-vous sur Stripe** : https://dashboard.stripe.com/
2. **Passez en mode Live** : 
   - Complétez la vérification de votre compte
   - Ajoutez vos informations bancaires
3. **Remplacez les clés** :
   - `sk_test_...` → `sk_live_...`
   - `pk_test_...` → `pk_live_...`

### Tarifs Configurés

Votre application propose 3 types d'abonnements :

| Plan | Prix Mensuel | Prix Annuel |
|------|-------------|-------------|
| **Standard** | 6,99€/mois | 69,99€/an (économie 2 mois) |
| **VIP** | 9,99€/mois | 99,99€/an (économie 2 mois) |
| **Suppléments** | 4,99€/mois | - |

**Pour modifier les prix** : Éditez `/app/backend/server.py` ligne 218-226

---

## 💰 Gestion des Paiements et Revenus

### Accès à votre Dashboard Stripe

1. **Tableau de bord** : https://dashboard.stripe.com/
2. **Paiements** : Voir tous les paiements reçus
3. **Clients** : Liste de vos abonnés
4. **Abonnements** : Gestion des abonnements actifs
5. **Virements** : Configurez vos virements bancaires automatiques

### Virements vers votre compte bancaire

**Configuration** :
1. Dashboard Stripe → **Paramètres** → **Informations sur l'entreprise**
2. Ajoutez vos coordonnées bancaires
3. Choisissez la fréquence des virements :
   - **Quotidien** (recommandé) : Virements automatiques chaque jour
   - **Hebdomadaire** : Tous les lundis
   - **Mensuel** : Le 1er du mois

**Commission Stripe** : ~2,9% + 0,30€ par transaction

### Suivre vos Revenus

**MRR (Monthly Recurring Revenue)** :
```
- Standard : Nombre d'abonnés × 6,99€
- VIP : Nombre d'abonnés × 9,99€
- Suppléments : Nombre d'abonnés × 4,99€
```

**Exemple** :
- 10 Standard = 69,90€/mois
- 5 VIP = 49,95€/mois
- 3 Suppléments = 14,97€/mois
- **Total MRR** = 134,82€/mois

---

## 📊 Gestion de la Base de Données

### Accès MongoDB

**Environnement Local** :
```bash
mongosh mongodb://localhost:27017/test_database
```

**Environnement Production** :
- Une base MongoDB Atlas sera créée automatiquement lors du déploiement
- Accès via le dashboard Emergent

### Collections Principales

#### 1. `users` - Utilisateurs
```javascript
// Structure
{
  user_id: "user_abc123",
  email: "client@example.com",
  name: "Jean Dupont",
  subscription_tier: "vip",        // none, standard, vip, supplements
  subscription_status: "active",   // active, inactive, cancelled
  created_at: "2026-02-25T..."
}
```

**Commandes utiles** :
```bash
# Voir tous les utilisateurs
mongosh --eval "db.users.find({}, {_id:0}).pretty()"

# Compter les abonnés par plan
mongosh --eval "db.users.aggregate([
  {$group: {_id: '$subscription_tier', count: {$sum: 1}}}
])"

# Voir les abonnés actifs
mongosh --eval "db.users.find(
  {subscription_status: 'active'}, 
  {email:1, subscription_tier:1, _id:0}
).pretty()"
```

#### 2. `payment_transactions` - Historique des paiements
```javascript
{
  session_id: "cs_test_...",
  user_id: "user_abc123",
  amount: 9.99,
  currency: "eur",
  tier: "vip",
  billing_cycle: "monthly",
  payment_status: "paid",
  created_at: "2026-02-25T..."
}
```

**Commandes utiles** :
```bash
# Voir tous les paiements
mongosh --eval "db.payment_transactions.find({}, {_id:0}).limit(10).pretty()"

# Total des revenus
mongosh --eval "db.payment_transactions.aggregate([
  {$match: {payment_status: 'paid'}},
  {$group: {_id: null, total: {$sum: '$amount'}}}
])"
```

#### 3. `workouts` - Séances d'entraînement
```bash
# Compter les séances par niveau
mongosh --eval "db.workouts.aggregate([
  {$group: {_id: '$level', count: {$sum: 1}}}
])"
```

#### 4. `supplements` - Plans nutritionnels
```bash
# Voir tous les plans
mongosh --eval "db.supplements.find({language: 'fr'}, {_id:0, title:1}).pretty()"
```

---

## 🛠️ Gestion Technique de l'Application

### Démarrer/Arrêter l'Application

**Voir le statut** :
```bash
sudo supervisorctl status
```

**Redémarrer un service** :
```bash
sudo supervisorctl restart backend    # Redémarrer le backend
sudo supervisorctl restart frontend   # Redémarrer le frontend
sudo supervisorctl restart all        # Redémarrer tout
```

**Arrêter/Démarrer** :
```bash
sudo supervisorctl stop backend
sudo supervisorctl start backend
```

### Consulter les Logs

**Backend** :
```bash
# Logs en temps réel
tail -f /var/log/supervisor/backend.out.log

# Voir les erreurs
tail -f /var/log/supervisor/backend.err.log

# Dernières 50 lignes
tail -n 50 /var/log/supervisor/backend.out.log
```

**Frontend** :
```bash
tail -f /var/log/supervisor/frontend.out.log
```

### Modifier les Variables d'Environnement

**Backend** :
```bash
nano /app/backend/.env
# Modifiez les variables
# Redémarrez : sudo supervisorctl restart backend
```

**Frontend** :
```bash
nano /app/frontend/.env
# Modifiez les variables
# Redémarrez : sudo supervisorctl restart frontend
```

---

## 📝 Modifier le Contenu de l'Application

### 1. Ajouter une Nouvelle Séance d'Entraînement

**Script Python** :
```bash
cd /app/backend
python3 -c "
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import uuid

async def add_workout():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['test_database']
    
    workout = {
        'workout_id': f'workout_{uuid.uuid4().hex[:8]}',
        'title': 'Mon Nouveau Programme',
        'description': 'Description du programme',
        'level': 'beginner',  # beginner, amateur, pro
        'program_type': 'mass_gain',  # mass_gain, weight_loss
        'duration': 60,
        'language': 'fr',
        'image_url': 'https://images.pexels.com/photos/...',
        'exercises': [
            {'name': 'Exercice 1', 'sets': 3, 'reps': '10-12', 'rest': '90s'},
            {'name': 'Exercice 2', 'sets': 4, 'reps': '8-10', 'rest': '120s'}
        ]
    }
    
    await db.workouts.insert_one(workout)
    print('✅ Séance ajoutée!')

asyncio.run(add_workout())
"
```

### 2. Modifier les Prix

**Fichier** : `/app/backend/server.py` (ligne 218-226)

```python
PACKAGES = {
    "standard_monthly": {"amount": 6.99, "tier": "standard", "billing": "monthly"},
    "standard_annual": {"amount": 69.99, "tier": "standard", "billing": "annual"},
    "vip_monthly": {"amount": 9.99, "tier": "vip", "billing": "monthly"},
    "vip_annual": {"amount": 99.99, "tier": "vip", "billing": "annual"},
    "supplements": {"amount": 4.99, "tier": "supplements", "billing": "monthly"}
}
```

**Après modification** :
```bash
sudo supervisorctl restart backend
```

### 3. Changer les Traductions

**Fichier** : `/app/frontend/src/i18n.js`

Modifiez les textes dans les sections `fr` et `en`.

---

## 👥 Gestion des Utilisateurs

### Voir les Abonnés

```bash
mongosh --eval "
  db.users.find(
    {subscription_status: 'active'},
    {email: 1, name: 1, subscription_tier: 1, _id: 0}
  ).pretty()
"
```

### Changer l'Abonnement d'un Utilisateur

```bash
mongosh --eval "
  db.users.updateOne(
    {email: 'user@example.com'},
    {\$set: {
      subscription_tier: 'vip',
      subscription_status: 'active'
    }}
  )
"
```

### Supprimer un Utilisateur

```bash
mongosh --eval "
  db.users.deleteOne({email: 'user@example.com'})
"
```

---

## 🚀 Déploiement en Production

### URL de Production

Après déploiement sur Emergent :
```
https://fitmax-gains.emergent.host
```

### Mettre à Jour les Clés Stripe en Production

**Via l'interface Emergent** :
1. Dashboard Emergent → Votre App → **Environment Variables**
2. Modifier `STRIPE_API_KEY` avec votre clé live
3. Redéployer l'application

**Ou via le fichier .env avant déploiement** :
```bash
nano /app/backend/.env
# Remplacez sk_test_... par sk_live_...
```

---

## 📈 Statistiques et Analytics

### Revenus Mensuels

```bash
mongosh --eval "
  db.payment_transactions.aggregate([
    {
      \$match: {
        payment_status: 'paid',
        created_at: {
          \$gte: new Date('2026-02-01'),
          \$lt: new Date('2026-03-01')
        }
      }
    },
    {
      \$group: {
        _id: null,
        total: {\$sum: '\$amount'},
        count: {\$sum: 1}
      }
    }
  ])
"
```

### Nombre d'Utilisateurs par Plan

```bash
mongosh --eval "
  db.users.aggregate([
    {\$group: {
      _id: '\$subscription_tier',
      count: {\$sum: 1}
    }}
  ])
"
```

### Taux de Conversion

```bash
# Total utilisateurs inscrits
mongosh --eval "db.users.countDocuments({})"

# Utilisateurs avec abonnement actif
mongosh --eval "db.users.countDocuments({subscription_status: 'active'})"
```

---

## 🔐 Sécurité et Maintenance

### Sauvegarder la Base de Données

**Export complet** :
```bash
mongodump --uri="mongodb://localhost:27017/test_database" --out=/app/backups/$(date +%Y%m%d)
```

**Restaurer une sauvegarde** :
```bash
mongorestore --uri="mongodb://localhost:27017/test_database" /app/backups/20260225
```

### Mettre à Jour les Dépendances

**Backend** :
```bash
cd /app/backend
pip install --upgrade -r requirements.txt
pip freeze > requirements.txt
sudo supervisorctl restart backend
```

**Frontend** :
```bash
cd /app/frontend
yarn upgrade
sudo supervisorctl restart frontend
```

---

## 📞 Support et Aide

### Fichiers de Documentation

1. **`/app/README.md`** - Vue d'ensemble du projet
2. **`/app/DEPLOYMENT_FIXES.md`** - Corrections de déploiement
3. **`/app/DEPLOYMENT_READINESS_REPORT.md`** - Rapport de déploiement
4. **`/app/MOBILE_DEPLOYMENT_GUIDE.md`** - Guide App Store/Google Play
5. **`/app/IN_APP_PURCHASES_IMPLEMENTATION.md`** - Paiements mobiles

### Structure des Fichiers

```
/app/
├── backend/
│   ├── server.py           # API principale
│   ├── .env                # Variables d'environnement (VOS CLÉS ICI)
│   └── requirements.txt    # Dépendances Python
├── frontend/
│   ├── src/
│   │   ├── App.js         # Application React principale
│   │   ├── i18n.js        # Traductions FR/EN
│   │   └── pages/         # Pages de l'application
│   ├── .env               # Variables frontend
│   └── package.json       # Dépendances Node.js
└── scripts/               # Scripts utilitaires
```

---

## 💡 Conseils de Gestion

### Croissance de l'Application

**Phase 1 : 0-100 utilisateurs**
- Concentrez-vous sur le contenu (séances, nutrition)
- Sollicitez des retours utilisateurs
- Testez les paiements avec des amis

**Phase 2 : 100-1000 utilisateurs**
- Ajoutez plus de séances d'entraînement
- Créez du contenu premium pour VIP
- Optimisez les conversions (Standard → VIP)

**Phase 3 : 1000+ utilisateurs**
- Envisagez les apps mobiles (guides fournis)
- Ajoutez des fonctionnalités communautaires
- Investissez dans le marketing

### Maximiser les Revenus

1. **Essai gratuit** : Offrez 7 jours gratuits pour augmenter les conversions
2. **Plan annuel** : Promouvez l'économie de 2 mois
3. **Upsell VIP** : Mettez en avant les programmes pro
4. **Cross-sell Suppléments** : Recommandez aux utilisateurs Standard/VIP

### Rétention des Utilisateurs

- **Contenu régulier** : Ajoutez 1-2 nouvelles séances par mois
- **Emails** : Envoyez des conseils fitness hebdomadaires
- **Communauté** : Créez un groupe Discord ou Telegram
- **Support** : Répondez rapidement aux questions

---

## 🎯 Checklist Propriétaire

### Quotidien
- [ ] Vérifier le statut de l'application : `sudo supervisorctl status`
- [ ] Consulter les nouveaux paiements sur Stripe
- [ ] Vérifier les erreurs dans les logs

### Hebdomadaire
- [ ] Analyser les statistiques (nouveaux users, MRR)
- [ ] Sauvegarder la base de données
- [ ] Ajouter du nouveau contenu (séances/nutrition)

### Mensuel
- [ ] Vérifier les virements bancaires Stripe
- [ ] Mettre à jour les dépendances
- [ ] Planifier nouvelles fonctionnalités

---

## ✅ Votre Application est Prête !

**FitMaxPro** est maintenant **100% sous votre contrôle** :

✅ Votre compte Stripe configuré  
✅ Tous les paiements viennent sur votre compte  
✅ Gestion complète de la base de données  
✅ Contrôle total du contenu  
✅ Accès à tous les fichiers et logs  

**Vous êtes le propriétaire et gestionnaire unique de FitMaxPro !**

---

**Questions ?** Consultez les autres guides dans `/app/` ou modifiez directement les fichiers selon vos besoins.
