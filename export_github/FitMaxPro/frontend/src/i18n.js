import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  fr: {
    translation: {
      nav: {
        home: 'Accueil',
        workouts: 'Séances',
        supplements: 'Suppléments',
        pricing: 'Tarifs',
        dashboard: 'Dashboard',
        profile: 'Profil',
        logout: 'Déconnexion'
      },
      hero: {
        title: 'TRANSFORMEZ VOTRE CORPS',
        subtitle: 'Programmes professionnels de musculation et nutrition',
        cta: 'COMMENCER MAINTENANT',
        login: 'Se connecter'
      },
      features: {
        title: 'VOS OBJECTIFS, NOTRE EXPERTISE',
        mass: {
          title: 'Prise de Masse',
          desc: 'Programmes intensifs pour développer votre masse musculaire'
        },
        loss: {
          title: 'Perte de Poids',
          desc: 'Entraînements HIIT pour brûler les graisses efficacement'
        },
        supplements: {
          title: 'Suppléments',
          desc: 'Plans nutritionnels adaptés à vos objectifs'
        },
        levels: {
          title: 'Tous Niveaux',
          desc: 'Débutant, Amateur, Pro - progressez à votre rythme'
        }
      },
      pricing: {
        title: 'CHOISISSEZ VOTRE PLAN',
        subtitle: 'Annulez à tout moment pour les abonnements mensuels',
        monthly: 'Mensuel',
        annual: 'Annuel',
        standard: {
          name: 'Standard',
          features: ['Accès à toutes les séances', 'Programmes débutant & amateur', 'Support communauté']
        },
        vip: {
          name: 'VIP',
          features: ['Tout Standard +', 'Programmes pro avancés', 'Plans nutrition personnalisés', 'Support prioritaire']
        },
        supplements: {
          name: 'Suppléments',
          features: ['Plans nutritionnels complets', 'Guides de supplémentation', 'Conseils dosage personnalisés']
        },
        select: 'Choisir',
        current: 'Plan actuel'
      },
      login: {
        title: 'Connexion',
        subtitle: 'Accédez à vos programmes',
        email: 'Email',
        password: 'Mot de passe',
        loginBtn: 'Se connecter',
        or: 'OU',
        google: 'Continuer avec Google',
        noAccount: 'Pas de compte?',
        signup: 'Créer un compte'
      },
      dashboard: {
        welcome: 'Bienvenue',
        subscription: 'Votre abonnement',
        tier: 'Plan',
        status: 'Statut',
        active: 'Actif',
        inactive: 'Inactif',
        upgrade: 'Améliorer',
        cancel: 'Annuler',
        workouts: 'Vos Séances',
        browse: 'Parcourir toutes les séances',
        supplements: 'Suppléments',
        viewSupplements: 'Voir les suppléments'
      },
      workouts: {
        title: 'Catalogue de Séances',
        filter: 'Filtrer',
        all: 'Tous',
        beginner: 'Débutant',
        amateur: 'Amateur',
        pro: 'Pro',
        massGain: 'Prise de Masse',
        weightLoss: 'Perte de Poids',
        duration: 'min',
        view: 'Voir la séance'
      },
      workout: {
        exercises: 'Exercices',
        sets: 'Séries',
        reps: 'Reps',
        rest: 'Repos',
        back: 'Retour'
      },
      supplements: {
        title: 'Plans Nutritionnels',
        massGain: 'Prise de Masse',
        weightLoss: 'Perte de Poids',
        dosage: 'Dosage',
        timing: 'Moment',
        subscribe: 'Obtenir ce plan'
      },
      profile: {
        title: 'Mon Profil',
        info: 'Informations',
        subscription: 'Abonnement',
        tier: 'Plan',
        status: 'Statut',
        billing: 'Facturation',
        monthly: 'Mensuel',
        annual: 'Annuel',
        manage: 'Gérer l\'abonnement',
        cancel: 'Annuler l\'abonnement'
      },
      success: {
        title: 'Paiement Réussi!',
        message: 'Votre abonnement est maintenant actif',
        dashboard: 'Aller au dashboard'
      },
      footer: {
        tagline: 'Transformez votre corps avec FitMaxPro',
        rights: 'Tous droits réservés'
      }
    }
  },
  en: {
    translation: {
      nav: {
        home: 'Home',
        workouts: 'Workouts',
        supplements: 'Supplements',
        pricing: 'Pricing',
        dashboard: 'Dashboard',
        profile: 'Profile',
        logout: 'Logout'
      },
      hero: {
        title: 'TRANSFORM YOUR BODY',
        subtitle: 'Professional bodybuilding and nutrition programs',
        cta: 'START NOW',
        login: 'Login'
      },
      features: {
        title: 'YOUR GOALS, OUR EXPERTISE',
        mass: {
          title: 'Muscle Gain',
          desc: 'Intensive programs to build your muscle mass'
        },
        loss: {
          title: 'Weight Loss',
          desc: 'HIIT training to burn fat effectively'
        },
        supplements: {
          title: 'Supplements',
          desc: 'Nutrition plans adapted to your goals'
        },
        levels: {
          title: 'All Levels',
          desc: 'Beginner, Intermediate, Pro - progress at your pace'
        }
      },
      pricing: {
        title: 'CHOOSE YOUR PLAN',
        subtitle: 'Cancel anytime for monthly subscriptions',
        monthly: 'Monthly',
        annual: 'Annual',
        standard: {
          name: 'Standard',
          features: ['Access to all workouts', 'Beginner & Intermediate programs', 'Community support']
        },
        vip: {
          name: 'VIP',
          features: ['Everything Standard +', 'Advanced pro programs', 'Personalized nutrition plans', 'Priority support']
        },
        supplements: {
          name: 'Supplements',
          features: ['Complete nutrition plans', 'Supplementation guides', 'Personalized dosage advice']
        },
        select: 'Select',
        current: 'Current plan'
      },
      login: {
        title: 'Login',
        subtitle: 'Access your programs',
        email: 'Email',
        password: 'Password',
        loginBtn: 'Login',
        or: 'OR',
        google: 'Continue with Google',
        noAccount: 'No account?',
        signup: 'Sign up'
      },
      dashboard: {
        welcome: 'Welcome',
        subscription: 'Your subscription',
        tier: 'Plan',
        status: 'Status',
        active: 'Active',
        inactive: 'Inactive',
        upgrade: 'Upgrade',
        cancel: 'Cancel',
        workouts: 'Your Workouts',
        browse: 'Browse all workouts',
        supplements: 'Supplements',
        viewSupplements: 'View supplements'
      },
      workouts: {
        title: 'Workout Catalog',
        filter: 'Filter',
        all: 'All',
        beginner: 'Beginner',
        amateur: 'Intermediate',
        pro: 'Pro',
        massGain: 'Muscle Gain',
        weightLoss: 'Weight Loss',
        duration: 'min',
        view: 'View workout'
      },
      workout: {
        exercises: 'Exercises',
        sets: 'Sets',
        reps: 'Reps',
        rest: 'Rest',
        back: 'Back'
      },
      supplements: {
        title: 'Nutrition Plans',
        massGain: 'Muscle Gain',
        weightLoss: 'Weight Loss',
        dosage: 'Dosage',
        timing: 'Timing',
        subscribe: 'Get this plan'
      },
      profile: {
        title: 'My Profile',
        info: 'Information',
        subscription: 'Subscription',
        tier: 'Plan',
        status: 'Status',
        billing: 'Billing',
        monthly: 'Monthly',
        annual: 'Annual',
        manage: 'Manage subscription',
        cancel: 'Cancel subscription'
      },
      success: {
        title: 'Payment Successful!',
        message: 'Your subscription is now active',
        dashboard: 'Go to dashboard'
      },
      footer: {
        tagline: 'Transform your body with FitMaxPro',
        rights: 'All rights reserved'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;