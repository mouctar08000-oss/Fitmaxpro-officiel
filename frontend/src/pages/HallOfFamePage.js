import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { 
  Trophy, Crown, Medal, Award, Gem, Star, 
  User, Flame, TrendingUp, Users, ChevronRight
} from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

// Badge icons mapping
const BADGE_ICONS = {
  starter: Medal,
  bronze: Medal,
  silver: Award,
  gold: Trophy,
  platinum: Crown,
  diamond: Gem,
  legend: Crown
};

const BADGE_COLORS = {
  starter: 'from-gray-400 to-gray-600',
  bronze: 'from-amber-600 to-amber-800',
  silver: 'from-slate-300 to-slate-500',
  gold: 'from-yellow-400 to-yellow-600',
  platinum: 'from-cyan-300 to-cyan-500',
  diamond: 'from-blue-400 to-purple-500',
  legend: 'from-red-500 via-purple-500 to-blue-500'
};

const HallOfFamePage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [hallOfFame, setHallOfFame] = useState([]);
  const [badgeDistribution, setBadgeDistribution] = useState({});
  const [badgesInfo, setBadgesInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBadgeFilter, setSelectedBadgeFilter] = useState(null);
  
  const isFr = t('language') === 'fr' || navigator.language?.startsWith('fr');

  useEffect(() => {
    fetchHallOfFame();
  }, []);

  const fetchHallOfFame = async () => {
    try {
      const response = await axios.get(`${API}/api/rewards/hall-of-fame`);
      setHallOfFame(response.data.hall_of_fame || []);
      setBadgeDistribution(response.data.badge_distribution || {});
      setBadgesInfo(response.data.badges_info || []);
    } catch (error) {
      console.error('Error fetching hall of fame:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = selectedBadgeFilter 
    ? hallOfFame.filter(u => u.badge.id === selectedBadgeFilter)
    : hallOfFame;

  const getRankStyle = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500/30 to-yellow-600/30 border-yellow-500/50';
    if (rank === 2) return 'bg-gradient-to-r from-slate-400/30 to-slate-500/30 border-slate-400/50';
    if (rank === 3) return 'bg-gradient-to-r from-amber-600/30 to-amber-700/30 border-amber-600/50';
    return 'bg-zinc-900/50 border-zinc-800';
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Award className="w-6 h-6 text-slate-300" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
  };

  const currentUserRank = hallOfFame.find(u => u.user_id === user?.user_id);

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-10 h-10 text-yellow-400" />
            <h1 className="text-4xl font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              {isFr ? 'HALL OF FAME' : 'HALL OF FAME'}
            </h1>
            <Trophy className="w-10 h-10 text-yellow-400" />
          </div>
          <p className="text-gray-400">
            {isFr 
              ? 'Les membres les plus dévoués de la communauté FitMaxPro' 
              : 'The most dedicated members of the FitMaxPro community'}
          </p>
        </div>

        {/* Your Rank Card (if logged in) */}
        {currentUserRank && (
          <div className="mb-8 bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-purple-400">#{currentUserRank.rank}</div>
                <div>
                  <p className="text-lg font-semibold">{isFr ? 'Votre classement' : 'Your Ranking'}</p>
                  <p className="text-gray-400 text-sm">
                    {currentUserRank.badge.emoji} {isFr ? currentUserRank.badge.name_fr : currentUserRank.badge.name_en}
                    {' • '}{currentUserRank.lifetime_points.toLocaleString()} pts
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">{isFr ? 'Badges débloqués' : 'Badges unlocked'}</p>
                <p className="text-2xl font-bold text-purple-400">
                  {currentUserRank.badges_unlocked}/{currentUserRank.total_badges}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Badge Distribution */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            {isFr ? 'DISTRIBUTION DES BADGES' : 'BADGE DISTRIBUTION'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {badgesInfo.map((badge) => {
              const Icon = BADGE_ICONS[badge.id] || Medal;
              const count = badgeDistribution[badge.id] || 0;
              const isSelected = selectedBadgeFilter === badge.id;
              
              return (
                <button
                  key={badge.id}
                  onClick={() => setSelectedBadgeFilter(isSelected ? null : badge.id)}
                  className={`p-4 rounded-lg border transition-all ${
                    isSelected 
                      ? `bg-gradient-to-br ${BADGE_COLORS[badge.id]} border-white/50 scale-105` 
                      : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                  }`}
                  data-testid={`badge-filter-${badge.id}`}
                >
                  <div className={`w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    isSelected ? 'bg-white/20' : `bg-gradient-to-br ${BADGE_COLORS[badge.id]}`
                  }`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs font-medium truncate">
                    {isFr ? badge.name_fr : badge.name_en}
                  </p>
                  <p className="text-lg font-bold">{count}</p>
                </button>
              );
            })}
          </div>
          {selectedBadgeFilter && (
            <button 
              onClick={() => setSelectedBadgeFilter(null)}
              className="mt-3 text-sm text-purple-400 hover:text-purple-300"
            >
              {isFr ? '← Voir tous les utilisateurs' : '← Show all users'}
            </button>
          )}
        </div>

        {/* Top 3 Podium */}
        {!selectedBadgeFilter && hallOfFame.length >= 3 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              {isFr ? 'PODIUM' : 'TOP 3'}
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {/* 2nd Place */}
              <div className="order-1 mt-8">
                <PodiumCard user={hallOfFame[1]} rank={2} isFr={isFr} />
              </div>
              {/* 1st Place */}
              <div className="order-2">
                <PodiumCard user={hallOfFame[0]} rank={1} isFr={isFr} />
              </div>
              {/* 3rd Place */}
              <div className="order-3 mt-12">
                <PodiumCard user={hallOfFame[2]} rank={3} isFr={isFr} />
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div>
          <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            {isFr ? 'CLASSEMENT COMPLET' : 'FULL LEADERBOARD'}
            {selectedBadgeFilter && (
              <span className="text-sm font-normal text-gray-400 ml-2">
                ({filteredUsers.length} {isFr ? 'utilisateurs' : 'users'})
              </span>
            )}
          </h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              {isFr ? 'Aucun utilisateur trouvé' : 'No users found'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((userData, index) => {
                const BadgeIcon = BADGE_ICONS[userData.badge.id] || Medal;
                const isCurrentUser = userData.user_id === user?.user_id;
                
                return (
                  <div
                    key={userData.user_id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                      getRankStyle(userData.rank)
                    } ${isCurrentUser ? 'ring-2 ring-purple-500' : ''}`}
                    data-testid={`leaderboard-row-${userData.rank}`}
                  >
                    {/* Rank */}
                    <div className="w-12 flex items-center justify-center">
                      {getRankIcon(userData.rank)}
                    </div>
                    
                    {/* User Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {userData.picture ? (
                        <img 
                          src={userData.picture} 
                          alt={userData.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold truncate flex items-center gap-2">
                          {userData.name}
                          {isCurrentUser && (
                            <span className="text-xs bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded">
                              {isFr ? 'Vous' : 'You'}
                            </span>
                          )}
                          {userData.subscription_tier === 'vip' && (
                            <Star className="w-4 h-4 text-yellow-400" />
                          )}
                        </p>
                        <p className="text-sm text-gray-400">
                          {userData.badges_unlocked} {isFr ? 'badges' : 'badges'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Badge */}
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-full bg-gradient-to-br ${BADGE_COLORS[userData.badge.id]}`}>
                        <BadgeIcon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm hidden sm:block">
                        {isFr ? userData.badge.name_fr : userData.badge.name_en}
                      </span>
                    </div>
                    
                    {/* Points */}
                    <div className="text-right">
                      <p className="font-bold text-lg">{userData.lifetime_points.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">pts</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-blue-400" />
            <p className="text-2xl font-bold">{hallOfFame.length}</p>
            <p className="text-xs text-gray-400">{isFr ? 'Membres actifs' : 'Active members'}</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 text-center">
            <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
            <p className="text-2xl font-bold">{badgeDistribution.legend || 0}</p>
            <p className="text-xs text-gray-400">{isFr ? 'Légendes' : 'Legends'}</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-400" />
            <p className="text-2xl font-bold">
              {hallOfFame.length > 0 
                ? Math.round(hallOfFame.reduce((sum, u) => sum + u.lifetime_points, 0) / hallOfFame.length)
                : 0}
            </p>
            <p className="text-xs text-gray-400">{isFr ? 'Points moyens' : 'Avg points'}</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 text-center">
            <Flame className="w-6 h-6 mx-auto mb-2 text-orange-400" />
            <p className="text-2xl font-bold">
              {hallOfFame.length > 0 ? hallOfFame[0]?.lifetime_points.toLocaleString() : 0}
            </p>
            <p className="text-xs text-gray-400">{isFr ? 'Record de points' : 'Top points'}</p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

// Podium Card Component
const PodiumCard = ({ user, rank, isFr }) => {
  if (!user) return null;
  
  const BadgeIcon = BADGE_ICONS[user.badge.id] || Medal;
  const heights = { 1: 'h-40', 2: 'h-32', 3: 'h-24' };
  const colors = {
    1: 'from-yellow-500 to-yellow-600',
    2: 'from-slate-400 to-slate-500',
    3: 'from-amber-600 to-amber-700'
  };
  
  return (
    <div className="text-center">
      {/* User Avatar */}
      <div className="relative inline-block mb-2">
        {user.picture ? (
          <img 
            src={user.picture} 
            alt={user.name}
            className={`${rank === 1 ? 'w-20 h-20' : 'w-16 h-16'} rounded-full object-cover border-4 ${
              rank === 1 ? 'border-yellow-400' : rank === 2 ? 'border-slate-300' : 'border-amber-600'
            }`}
          />
        ) : (
          <div className={`${rank === 1 ? 'w-20 h-20' : 'w-16 h-16'} bg-zinc-800 rounded-full flex items-center justify-center border-4 ${
            rank === 1 ? 'border-yellow-400' : rank === 2 ? 'border-slate-300' : 'border-amber-600'
          }`}>
            <User className="w-8 h-8 text-gray-400" />
          </div>
        )}
        {/* Badge */}
        <div className={`absolute -bottom-1 -right-1 p-1.5 rounded-full bg-gradient-to-br ${BADGE_COLORS[user.badge.id]}`}>
          <BadgeIcon className="w-4 h-4 text-white" />
        </div>
      </div>
      
      {/* Name */}
      <p className="font-semibold truncate px-2">{user.name}</p>
      
      {/* Points */}
      <p className="text-sm text-gray-400">{user.lifetime_points.toLocaleString()} pts</p>
      
      {/* Podium Stand */}
      <div className={`${heights[rank]} mt-3 bg-gradient-to-t ${colors[rank]} rounded-t-lg flex items-center justify-center`}>
        <span className="text-4xl font-bold text-white/80">{rank}</span>
      </div>
    </div>
  );
};

export default HallOfFamePage;
