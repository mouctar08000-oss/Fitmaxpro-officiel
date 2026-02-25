import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { Button } from '../components/ui/button.jsx';
import { Dumbbell, Pill, TrendingUp, CreditCard } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await axios.get(`${API}/user/subscription`, { withCredentials: true });
      setSubscription(response.data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const getTierColor = (tier) => {
    switch(tier) {
      case 'vip': return '#EAB308';
      case 'standard': return '#3B82F6';
      case 'supplements': return '#10B981';
      default: return '#6B7280';
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] noise-bg">
      <Navigation />
      
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 
              className="text-4xl sm:text-5xl font-bold mb-2"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              data-testid="dashboard-welcome"
            >
              {t('dashboard.welcome')}, {user?.name}
            </h1>
            <p className="text-gray-400">Prêt à vous entraîner aujourd'hui?</p>
          </div>

          {/* Subscription Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div 
              className="bg-[#121212] border border-[#27272a] p-6 rounded-md"
              data-testid="subscription-card"
            >
              <div className="flex items-center gap-3 mb-4">
                <CreditCard style={{ color: getTierColor(user?.subscription_tier) }} />
                <h3 className="text-xl font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                  {t('dashboard.subscription')}
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('dashboard.tier')}:</span>
                  <span className="font-bold uppercase" style={{ color: getTierColor(user?.subscription_tier) }}>
                    {user?.subscription_tier}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('dashboard.status')}:</span>
                  <span className={user?.subscription_status === 'active' ? 'text-green-500' : 'text-gray-500'}>
                    {user?.subscription_status === 'active' ? t('dashboard.active') : t('dashboard.inactive')}
                  </span>
                </div>
              </div>
              {user?.subscription_tier === 'none' && (
                <Button
                  data-testid="upgrade-btn"
                  onClick={() => navigate('/pricing')}
                  className="w-full mt-4 bg-[#FAFAFA] text-[#09090b] hover:bg-white font-bold rounded-sm"
                >
                  {t('dashboard.upgrade')}
                </Button>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-[#121212] border border-[#27272a] p-6 rounded-md">
              <div className="flex items-center gap-3 mb-4">
                <Dumbbell className="text-[#EF4444]" />
                <h3 className="text-xl font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                  Prise de Masse
                </h3>
              </div>
              <p className="text-gray-400 mb-4">Programmes intensifs pour développer votre masse musculaire</p>
              <Button
                data-testid="mass-gain-btn"
                onClick={() => navigate('/workouts?type=mass_gain')}
                className="w-full bg-[#EF4444] hover:bg-[#DC2626] font-bold rounded-sm"
              >
                Voir les séances
              </Button>
            </div>

            <div className="bg-[#121212] border border-[#27272a] p-6 rounded-md">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="text-[#3B82F6]" />
                <h3 className="text-xl font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                  Perte de Poids
                </h3>
              </div>
              <p className="text-gray-400 mb-4">HIIT et cardio pour brûler les graisses efficacement</p>
              <Button
                data-testid="weight-loss-btn"
                onClick={() => navigate('/workouts?type=weight_loss')}
                className="w-full bg-[#3B82F6] hover:bg-[#2563EB] font-bold rounded-sm"
              >
                Voir les séances
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div 
              className="bg-[#121212] border border-[#27272a] p-8 rounded-md hover:border-white/20 transition-colors"
              style={{
                backgroundImage: 'url(https://images.pexels.com/photos/8874917/pexels-photo-8874917.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="bg-black/70 backdrop-blur-sm p-6 rounded-md">
                <h3 
                  className="text-3xl font-bold mb-4"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  {t('dashboard.workouts')}
                </h3>
                <p className="text-gray-300 mb-6">Accédez à tous vos programmes d'entraînement</p>
                <Button
                  data-testid="browse-workouts-btn"
                  onClick={() => navigate('/workouts')}
                  className="bg-[#FAFAFA] text-[#09090b] hover:bg-white font-bold rounded-sm hover:-translate-y-1 transition-all"
                >
                  {t('dashboard.browse')}
                </Button>
              </div>
            </div>

            <div 
              className="bg-[#121212] border border-[#27272a] p-8 rounded-md hover:border-white/20 transition-colors"
              style={{
                backgroundImage: 'url(https://images.pexels.com/photos/15120889/pexels-photo-15120889.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="bg-black/70 backdrop-blur-sm p-6 rounded-md">
                <h3 
                  className="text-3xl font-bold mb-4"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  {t('dashboard.supplements')}
                </h3>
                <p className="text-gray-300 mb-6">Découvrez nos plans de supplémentation</p>
                <Button
                  data-testid="view-supplements-btn"
                  onClick={() => navigate('/supplements')}
                  className="bg-[#10B981] hover:bg-[#059669] font-bold rounded-sm hover:-translate-y-1 transition-all"
                >
                  {t('dashboard.viewSupplements')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;