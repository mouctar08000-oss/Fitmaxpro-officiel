import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button.jsx';
import { Dumbbell, Pill, TrendingUp, CreditCard, Instagram, Youtube, Gift, Footprints, Radio } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Custom icons
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [socialLinks, setSocialLinks] = useState({});

  useEffect(() => {
    fetchSubscription();
    fetchSocialLinks();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await axios.get(`${API}/user/subscription`, { withCredentials: true });
      setSubscription(response.data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const fetchSocialLinks = async () => {
    try {
      const response = await axios.get(`${API}/social-links`);
      setSocialLinks(response.data.links || {});
    } catch (error) {
      console.error('Error fetching social links:', error);
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

  const isFr = t('language') === 'fr' || navigator.language?.startsWith('fr');

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

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <Button
              onClick={() => navigate('/running')}
              className="bg-green-600 hover:bg-green-700 h-auto py-4 flex flex-col items-center gap-2"
            >
              <Footprints className="w-6 h-6" />
              <span>{isFr ? 'Course à Pied' : 'Running'}</span>
            </Button>
            <Button
              onClick={() => navigate('/live')}
              className="bg-red-600 hover:bg-red-700 h-auto py-4 flex flex-col items-center gap-2 relative"
            >
              <Radio className="w-6 h-6" />
              <span>Live</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full animate-pulse"></span>
            </Button>
            <Button
              onClick={() => navigate('/rewards')}
              className="bg-purple-600 hover:bg-purple-700 h-auto py-4 flex flex-col items-center gap-2"
            >
              <Gift className="w-6 h-6" />
              <span>{isFr ? 'Récompenses' : 'Rewards'}</span>
            </Button>
            <Button
              onClick={() => navigate('/progress')}
              className="bg-blue-600 hover:bg-blue-700 h-auto py-4 flex flex-col items-center gap-2"
            >
              <TrendingUp className="w-6 h-6" />
              <span>{isFr ? 'Progression' : 'Progress'}</span>
            </Button>
          </div>

          {/* Social Links Section */}
          {Object.keys(socialLinks).length > 0 && (
            <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6 mb-12">
              <h3 className="text-xl font-bold mb-4" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                {isFr ? 'SUIVEZ-NOUS' : 'FOLLOW US'}
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                {isFr ? 'Rejoignez la communauté FitMaxPro sur les réseaux sociaux !' : 'Join the FitMaxPro community on social media!'}
              </p>
              <div className="flex flex-wrap gap-3">
                {socialLinks.instagram && (
                  <a 
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <Instagram className="w-5 h-5" />
                    <span>Instagram</span>
                  </a>
                )}
                {socialLinks.youtube && (
                  <a 
                    href={socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <Youtube className="w-5 h-5" />
                    <span>YouTube</span>
                  </a>
                )}
                {socialLinks.tiktok && (
                  <a 
                    href={socialLinks.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-black border border-white/20 px-4 py-2 rounded-lg hover:bg-zinc-900 transition-colors"
                  >
                    <TikTokIcon />
                    <span>TikTok</span>
                  </a>
                )}
                {socialLinks.facebook && (
                  <a 
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>Facebook</span>
                  </a>
                )}
                {socialLinks.snapchat && (
                  <a 
                    href={socialLinks.snapchat}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-.809-.329-1.24-.719-1.24-1.138 0-.359.27-.689.72-.854.12-.044.298-.074.494-.074.12 0 .313.029.464.104.39.18.748.3 1.033.3.199 0 .33-.06.405-.105l-.03-.51c-.015-.06-.029-.12-.029-.18-.105-1.628-.225-3.654.304-4.847C7.865 1.054 11.217.793 12.206.793z"/>
                    </svg>
                    <span>Snapchat</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Dashboard;