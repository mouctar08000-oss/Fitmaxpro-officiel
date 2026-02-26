# Guide Stripe - FitMaxPro

Ce guide explique comment configurer Stripe pour gérer les paiements et abonnements.

## 1. Créer un compte Stripe

1. Aller sur https://stripe.com
2. Cliquer sur "Commencer"
3. Créer un compte avec votre email

## 2. Récupérer les clés API

### Mode Test (développement)

1. Aller sur https://dashboard.stripe.com/test/apikeys
2. Copier la **Clé secrète** (commence par `sk_test_`)
3. Copier la **Clé publique** (commence par `pk_test_`)

### Mode Live (production)

1. Compléter la vérification de votre compte
2. Aller sur https://dashboard.stripe.com/apikeys
3. Copier les clés Live (commencent par `sk_live_` et `pk_live_`)

## 3. Configurer le Backend

Éditer `backend/.env` :

```env
STRIPE_API_KEY=sk_test_votre_cle_secrete_ici
```

## 4. Configurer le Webhook

Les webhooks permettent à Stripe de notifier votre application des événements (paiement réussi, annulation, etc.)

### En développement (avec Stripe CLI)

1. Installer Stripe CLI : https://stripe.com/docs/stripe-cli

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows (avec scoop)
scoop install stripe
```

2. Se connecter :
```bash
stripe login
```

3. Lancer le webhook local :
```bash
stripe listen --forward-to localhost:8001/api/webhook/stripe
```

4. Copier le **webhook signing secret** affiché (commence par `whsec_`)

5. Ajouter dans `backend/.env` :
```env
STRIPE_WEBHOOK_SECRET=whsec_votre_secret_ici
```

### En production

1. Aller sur https://dashboard.stripe.com/webhooks
2. Cliquer "Ajouter un endpoint"
3. URL : `https://votre-domaine.com/api/webhook/stripe`
4. Sélectionner les événements :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.trial_will_end`
5. Copier le signing secret dans votre `.env`

## 5. Plans d'abonnement

L'application est configurée avec ces plans :

| Plan | Prix mensuel | Prix annuel | Essai gratuit |
|------|-------------|-------------|---------------|
| Standard | 6,99€ | 69,99€ | 7 jours |
| VIP | 9,99€ | 99,99€ | 7 jours |
| Supplements | 4,99€ | - | 7 jours |

Les prix sont définis dans `backend/server.py` (variable `PACKAGES`).

## 6. Tester les paiements

### Cartes de test

| Numéro | Résultat |
|--------|----------|
| 4242 4242 4242 4242 | Paiement réussi |
| 4000 0000 0000 0002 | Carte refusée |
| 4000 0000 0000 3220 | Authentification 3D Secure |

- **Date d'expiration** : N'importe quelle date future
- **CVC** : N'importe quels 3 chiffres
- **Code postal** : N'importe lequel

### Processus de test

1. Créer un compte sur votre application
2. Aller sur la page Tarification
3. Cliquer sur "Essayer gratuitement"
4. Utiliser une carte de test
5. Vérifier que l'abonnement est créé

## 7. Gérer les abonnements

### Dashboard Stripe

- **Voir les clients** : https://dashboard.stripe.com/customers
- **Voir les abonnements** : https://dashboard.stripe.com/subscriptions
- **Voir les paiements** : https://dashboard.stripe.com/payments

### Annuler un abonnement

1. Aller sur https://dashboard.stripe.com/subscriptions
2. Trouver l'abonnement
3. Cliquer "Annuler"

### Rembourser

1. Aller sur https://dashboard.stripe.com/payments
2. Trouver le paiement
3. Cliquer "Rembourser"

## 8. Passer en production

Checklist avant de passer en mode Live :

- [ ] Remplacer les clés test par les clés live
- [ ] Configurer le webhook de production
- [ ] Tester un vrai paiement (petit montant)
- [ ] Vérifier les emails de confirmation Stripe
- [ ] Activer les notifications par email dans Stripe

---

## Support

- Documentation Stripe : https://stripe.com/docs
- Support Stripe : https://support.stripe.com
