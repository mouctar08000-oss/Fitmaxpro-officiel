import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button.jsx';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs.jsx';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Check } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PricingPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (tier) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
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
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Erreur lors du paiement');
    } finally {
      setLoading(false);
    }
  };

  const pricingPlans = [
    {
      name: t('pricing.standard.name'),
      tier: 'standard',
      price: billingCycle === 'monthly' ? '6.99' : '69.99',
      features: t('pricing.standard.features', { returnObjects: true }),
      color: '#3B82F6'
    },
    {
      name: t('pricing.vip.name'),
      tier: 'vip',
      price: billingCycle === 'monthly' ? '9.99' : '99.99',
      features: t('pricing.vip.features', { returnObjects: true }),
      color: '#EAB308',
      popular: true
    },
    {
      name: t('pricing.supplements.name'),
      tier: 'supplements',
      price: '4.99',
      features: t('pricing.supplements.features', { returnObjects: true }),
      color: '#10B981'
    }
  ];

  return (
    <div className="min-h-screen bg-[#09090b] noise-bg">
      <Navigation />
      
      <div className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 
              className="text-5xl sm:text-6xl font-bold mb-4"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              data-testid="pricing-title"
            >
              {t('pricing.title')}
            </h1>
            <p className="text-gray-400 text-lg mb-8">{t('pricing.subtitle')}</p>
            
            {billingCycle !== 'supplements' && (
              <Tabs value={billingCycle} onValueChange={setBillingCycle} className="inline-flex">
                <TabsList data-testid="billing-cycle-tabs" className="bg-[#121212] border border-[#27272a]">
                  <TabsTrigger value="monthly" data-testid="monthly-tab">{t('pricing.monthly')}</TabsTrigger>
                  <TabsTrigger value="annual" data-testid="annual-tab">{t('pricing.annual')}</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <div
                key={plan.tier}
                data-testid={`pricing-card-${plan.tier}`}
                className={`relative bg-[#121212] border-2 ${
                  plan.popular ? 'border-[#EAB308]' : 'border-[#27272a]'
                } p-8 rounded-md hover:border-white/20 transition-colors`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#EAB308] text-black px-4 py-1 rounded-sm text-sm font-bold">
                      VIP
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 
                    className="text-3xl font-bold mb-4"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif", color: plan.color }}
                  >
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold">{plan.price}€</span>
                    <span className="text-gray-400">/{plan.tier === 'supplements' ? 'mois' : billingCycle === 'monthly' ? 'mois' : 'an'}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: plan.color }} />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  data-testid={`subscribe-btn-${plan.tier}`}
                  onClick={() => handleSubscribe(plan.tier)}
                  disabled={loading || (user && user.subscription_tier === plan.tier)}
                  className={`w-full font-bold py-6 rounded-sm transition-all hover:-translate-y-1 ${
                    plan.popular
                      ? 'bg-[#EAB308] text-black hover:bg-[#F59E0B]'
                      : 'bg-[#FAFAFA] text-[#09090b] hover:bg-white'
                  }`}
                >
                  {user && user.subscription_tier === plan.tier ? t('pricing.current') : t('pricing.select')}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PricingPage;