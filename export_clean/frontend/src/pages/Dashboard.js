import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button.jsx';
import { Dumbbell, Pill, TrendingUp, CreditCard, Instagram, Youtube, Gift, Footprints, Radio, Star, MessageSquare, Trophy, Flame, Target, Zap, Award, Crown, Gem, Medal } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Badge System Configuration
const POINT_BADGES = [
  { 
    id: 'starter', 
    name_fr: 'Débutant', 
    name_en: 'Starter', 
    threshold: 0, 
    icon: Medal, 
    color: 'from-gray-400 to-gray-600', 
    textColor: 'text-gray-400',
    bgColor: 'bg-gray-500/20'
  },
  { 
    id: 'bronze', 
    name_fr: 'Bronze', 
    name_en: 'Bronze', 
    threshold: 100, 
    icon: Medal, 
    color: 'from-amber-600 to-amber-800', 
    textColor: 'text-amber-500',
    bgColor: 'bg-amber-500/20'
  },
  { 
    id: 'silver', 
    name_fr: 'Argent', 
    name_en: 'Silver', 
    threshold: 500, 
    icon: Award, 
    color: 'from-slate-300 to-slate-500', 
    textColor: 'text-slate-300',
    bgColor: 'bg-slate-400/20'
  },
  { 
    id: 'gold', 
    name_fr: 'Or', 
    name_en: 'Gold', 
    threshold: 1000, 
    icon: Trophy, 
    color: 'from-yellow-400 to-yellow-600', 
    textColor: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20'
  },
  { 
    id: 'platinum', 
    name_fr: 'Platine', 
    name_en: 'Platinum', 
    threshold: 2500, 
    icon: Crown, 
    color: 'from-cyan-300 to-cyan-500', 
    textColor: 'text-cyan-300',
    bgColor: 'bg-cyan-400/20'
  },
  { 
    id: 'diamond', 
    name_fr: 'Diamant', 
    name_en: 'Diamond', 
    threshold: 5000, 
    icon: Gem, 
    color: 'from-blue-400 to-purple-500', 
    textColor: 'text-blue-400',
    bgColor: 'bg-blue-500/20'
  },
  { 
    id: 'legend', 
    name_fr: 'Légende', 
    name_en: 'Legend', 
    threshold: 10000, 
    icon: Crown, 
    color: 'from-red-500 via-purple-500 to-blue-500', 
    textColor: 'text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-purple-400 to-blue-400',
    bgColor: 'bg-gradient-to-r from-red-500/20 via-purple-500/20 to-blue-500/20'
  }
];

// Get current badge based on points
const getCurrentBadge = (points) => {
  let currentBadge = POINT_BADGES[0];
  for (const badge of POINT_BADGES) {
    if (points >= badge.threshold) {
      currentBadge = badge;
    } else {
      break;
    }
  }
  return currentBadge;
};

// Get next badge
const getNextBadge = (points) => {
  for (const badge of POINT_BADGES) {
    if (points < badge.threshold) {
      return badge;
    }
  }
  return null; // Max level reached
};

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
  const [reviewStats, setReviewStats] = useState({ total_reviews: 0, average_rating: 0 });
  const [pointsData, setPointsData] = useState({ total_points: 0, lifetime_points: 0, transactions: [], active_rewards: [] });
  const [workoutStats, setWorkoutStats] = useState({ total_sessions: 0, completed_sessions: 0, streak_days: 0 });

  useEffect(() => {
    fetchSubscription();
    fetchSocialLinks();
    fetchReviewStats();
    fetchPointsData();
    fetchWorkoutStats();
  }, []);

  const fetchReviewStats = async () => {
    try {
      const response = await axios.get(`${API}/reviews`);
      setReviewStats({
        total_reviews: response.data.total_reviews || 0,
        average_rating: response.data.average_rating || 0
      });
    } catch (error) {
      console.error('Error fetching review stats:', error);
    }
  };

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

  const fetchPointsData = async () => {
    try {
      const token = localStorage.getItem('session_token');
      if (!token) return;
      const response = await axios.get(`${API}/rewards/points`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPointsData(response.data);
    } catch (error) {
      console.error('Error fetching points:', error);
    }
  };

  const fetchWorkoutStats = async () => {
    try {
      const token = localStorage.getItem('session_token');
      if (!token) return;
      const response = await axios.get(`${API}/workout/my-sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const stats = response.data.stats || {};
      
      // Calculate streak from sessions
      const sessions = response.data.sessions || [];
      let streakDays = 0;
      if (sessions.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let checkDate = new Date(today);
        
        for (let i = 0; i < 30; i++) {
          const dayStart = new Date(checkDate);
          const dayEnd = new Date(checkDate);
          dayEnd.setDate(dayEnd.getDate() + 1);
          
          const hasSession = sessions.some(s => {
            const sessionDate = new Date(s.started_at);
            return sessionDate >= dayStart && sessionDate < dayEnd && s.completed;
          });
          
          if (hasSession) {
            streakDays++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else if (i > 0) {
            break;
          } else {
            checkDate.setDate(checkDate.getDate() - 1);
          }
        }
      }
      
      setWorkoutStats({
        total_sessions: stats.total_sessions || 0,
        completed_sessions: stats.completed_sessions || 0,
        streak_days: streakDays
      });
    } catch (error) {
      console.error('Error fetching workout stats:', error);
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

            {/* Points Dashboard Widget with Badges */}
            {(() => {
              const currentBadge = getCurrentBadge(pointsData.lifetime_points);
              const nextBadge = getNextBadge(pointsData.lifetime_points);
              const BadgeIcon = currentBadge.icon;
              const progressToNext = nextBadge 
                ? ((pointsData.lifetime_points - currentBadge.threshold) / (nextBadge.threshold - currentBadge.threshold)) * 100 
                : 100;
              
              return (
                <div 
                  className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30 p-6 rounded-md cursor-pointer hover:border-purple-400/50 transition-all"
                  onClick={() => navigate('/rewards')}
                  data-testid="points-dashboard-widget"
                >
                  {/* Header with Current Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full bg-gradient-to-br ${currentBadge.color}`}>
                        <BadgeIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                          {isFr ? 'MES POINTS' : 'MY POINTS'}
                        </h3>
                        <p className={`text-xs font-semibold ${currentBadge.textColor}`}>
                          {isFr ? currentBadge.name_fr : currentBadge.name_en}
                        </p>
                      </div>
                    </div>
                    <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
                  </div>
                  
                  {/* Main Points Display */}
                  <div className="text-center mb-3">
                    <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                      {pointsData.total_points.toLocaleString()}
                    </div>
                    <p className="text-gray-400 text-xs">{isFr ? 'points disponibles' : 'points available'}</p>
                  </div>
                  
                  {/* Progress to Next Badge */}
                  {nextBadge && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className={currentBadge.textColor}>{isFr ? currentBadge.name_fr : currentBadge.name_en}</span>
                        <span className={nextBadge.textColor}>{isFr ? nextBadge.name_fr : nextBadge.name_en}</span>
                      </div>
                      <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${nextBadge.color} transition-all duration-500`}
                          style={{ width: `${Math.min(progressToNext, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 text-center mt-1">
                        {nextBadge.threshold - pointsData.lifetime_points} pts {isFr ? 'pour' : 'to'} {isFr ? nextBadge.name_fr : nextBadge.name_en}
                      </p>
                    </div>
                  )}
                  
                  {/* Badge Showcase - Mini */}
                  <div className="flex justify-center gap-1 mb-3">
                    {POINT_BADGES.slice(1).map((badge) => {
                      const isUnlocked = pointsData.lifetime_points >= badge.threshold;
                      const Icon = badge.icon;
                      return (
                        <div 
                          key={badge.id}
                          className={`p-1.5 rounded-full transition-all ${
                            isUnlocked 
                              ? `bg-gradient-to-br ${badge.color} scale-100` 
                              : 'bg-gray-800/50 scale-90 opacity-40'
                          }`}
                          title={`${isFr ? badge.name_fr : badge.name_en} (${badge.threshold} pts)`}
                        >
                          <Icon className={`w-3 h-3 ${isUnlocked ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div className="bg-black/30 rounded-lg p-2">
                      <div className="flex items-center justify-center gap-1 text-orange-400 mb-1">
                        <Flame className="w-4 h-4" />
                        <span className="font-bold">{workoutStats.streak_days}</span>
                      </div>
                      <p className="text-xs text-gray-500">{isFr ? 'jours' : 'days'}</p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-2">
                      <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                        <Target className="w-4 h-4" />
                        <span className="font-bold">{workoutStats.completed_sessions}</span>
                      </div>
                      <p className="text-xs text-gray-500">{isFr ? 'séances' : 'sessions'}</p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-2">
                      <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
                        <Star className="w-4 h-4" />
                        <span className="font-bold">{pointsData.lifetime_points.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-gray-500">{isFr ? 'total' : 'total'}</p>
                    </div>
                  </div>
                  
                  {/* Active Rewards Badge */}
                  {pointsData.active_rewards?.length > 0 && (
                    <div className="mb-3 pt-2 border-t border-purple-500/20">
                      <p className="text-xs text-purple-300 flex items-center gap-1">
                        <Gift className="w-3 h-3" />
                        {pointsData.active_rewards.length} {isFr ? 'récompense(s) active(s)' : 'active reward(s)'}
                      </p>
                    </div>
                  )}
                  
                  {/* Call to Action */}
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/rewards');
                    }}
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    {isFr ? 'Échanger mes points' : 'Redeem points'}
                  </Button>
                </div>
              );
            })()}

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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
            <Button
              onClick={() => navigate('/running')}
              className="bg-green-600 hover:bg-green-700 h-auto py-4 flex flex-col items-center gap-2"
              data-testid="quick-running-btn"
            >
              <Footprints className="w-6 h-6" />
              <span>{isFr ? 'Course à Pied' : 'Running'}</span>
            </Button>
            <Button
              onClick={() => navigate('/live')}
              className="bg-red-600 hover:bg-red-700 h-auto py-4 flex flex-col items-center gap-2 relative"
              data-testid="quick-live-btn"
            >
              <Radio className="w-6 h-6" />
              <span>Live</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full animate-pulse"></span>
            </Button>
            <Button
              onClick={() => navigate('/rewards')}
              className="bg-purple-600 hover:bg-purple-700 h-auto py-4 flex flex-col items-center gap-2"
              data-testid="quick-rewards-btn"
            >
              <Gift className="w-6 h-6" />
              <span>{isFr ? 'Récompenses' : 'Rewards'}</span>
            </Button>
            <Button
              onClick={() => navigate('/reviews')}
              className="bg-yellow-500 hover:bg-yellow-600 h-auto py-4 flex flex-col items-center gap-2"
              data-testid="quick-reviews-btn"
            >
              <Star className="w-6 h-6" />
              <span>{isFr ? 'Donner un Avis' : 'Leave Review'}</span>
            </Button>
            <Button
              onClick={() => navigate('/my-progress')}
              className="bg-blue-600 hover:bg-blue-700 h-auto py-4 flex flex-col items-center gap-2"
              data-testid="quick-progress-btn"
            >
              <TrendingUp className="w-6 h-6" />
              <span>{isFr ? 'Progression' : 'Progress'}</span>
            </Button>
          </div>

          {/* Reviews Section - Prominent Call to Action */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-6 mb-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-yellow-500 p-3 rounded-full">
                  <MessageSquare className="w-8 h-8 text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                    {isFr ? 'VOTRE AVIS COMPTE !' : 'YOUR OPINION MATTERS!'}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star}
                          className={`w-4 h-4 ${star <= Math.round(reviewStats.average_rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`}
                        />
                      ))}
                    </div>
                    <span>{reviewStats.average_rating.toFixed(1)}</span>
                    <span className="text-gray-500">({reviewStats.total_reviews} {isFr ? 'avis' : 'reviews'})</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate('/reviews')}
                  variant="outline"
                  className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
                  data-testid="view-reviews-btn"
                >
                  {isFr ? 'Voir les avis' : 'View reviews'}
                </Button>
                <Button
                  onClick={() => navigate('/reviews')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                  data-testid="leave-review-btn"
                >
                  <Star className="w-4 h-4 mr-2" />
                  {isFr ? 'Donner mon avis' : 'Leave a review'}
                </Button>
              </div>
            </div>
          </div>

          {/* Social Links Section */}
          {Object.keys(socialLinks).filter(k => socialLinks[k]).length > 0 && (
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
                    <span className="text-lg">👻</span>
                    <span>Snapchat</span>
                  </a>
                )}
                {socialLinks.twitter && (
                  <a 
                    href={socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-black border border-white/20 px-4 py-2 rounded-lg hover:bg-zinc-900 transition-colors"
                  >
                    <span className="font-bold">X</span>
                    <span>Twitter</span>
                  </a>
                )}
                {socialLinks.whatsapp && (
                  <a 
                    href={socialLinks.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-green-500 px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span>WhatsApp</span>
                  </a>
                )}
                {socialLinks.telegram && (
                  <a 
                    href={socialLinks.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-blue-500 px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    <span>Telegram</span>
                  </a>
                )}
                {socialLinks.website && (
                  <a 
                    href={socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <span className="text-lg">🌐</span>
                    <span>{isFr ? 'Site Web' : 'Website'}</span>
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