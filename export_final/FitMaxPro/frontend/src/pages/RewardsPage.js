import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { 
  Gift, 
  Trophy, 
  Star, 
  Crown, 
  Zap,
  Clock,
  Check,
  ChevronRight,
  Sparkles,
  Award,
  ShoppingBag,
  History,
  Target,
  Flame,
  Timer
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import Navigation from '../components/Navigation';

const API = process.env.REACT_APP_BACKEND_URL;

const RewardsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const isFr = t('language') === 'fr' || navigator.language?.startsWith('fr');
  
  const [activeTab, setActiveTab] = useState('challenges');
  const [catalog, setCatalog] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [lifetimePoints, setLifetimePoints] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [myRewards, setMyRewards] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [challengesInfo, setChallengesInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [claimingId, setClaimingId] = useState(null);

  const fetchCatalog = useCallback(async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('session_token');
      const response = await axios.get(`${API}/api/rewards/catalog`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCatalog(response.data.rewards || []);
    } catch (err) {
      console.error('Error fetching catalog:', err);
    }
  }, []);

  const fetchPoints = useCallback(async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('session_token');
      const response = await axios.get(`${API}/api/rewards/points`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserPoints(response.data.total_points || 0);
      setLifetimePoints(response.data.lifetime_points || 0);
      setTransactions(response.data.transactions || []);
    } catch (err) {
      console.error('Error fetching points:', err);
    }
  }, []);

  const fetchMyRewards = useCallback(async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('session_token');
      const response = await axios.get(`${API}/api/rewards/my-rewards`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyRewards(response.data.rewards || []);
    } catch (err) {
      console.error('Error fetching rewards:', err);
    }
  }, []);

  const fetchChallenges = useCallback(async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('session_token');
      const response = await axios.get(`${API}/api/challenges/weekly`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChallenges(response.data.challenges || []);
      setChallengesInfo({
        week_start: response.data.week_start,
        week_end: response.data.week_end,
        days_remaining: response.data.days_remaining
      });
    } catch (err) {
      console.error('Error fetching challenges:', err);
    }
  }, []);

  const claimChallenge = async (challengeId) => {
    setClaimingId(challengeId);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('session_token');
      const response = await axios.post(
        `${API}/api/challenges/claim/${challengeId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(isFr 
        ? `🎉 +${response.data.points_awarded} points gagnés !` 
        : `🎉 +${response.data.points_awarded} points earned!`
      );
      
      // Refresh data
      fetchChallenges();
      fetchPoints();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error claiming reward');
    } finally {
      setClaimingId(null);
    }
  };

  useEffect(() => {
    fetchCatalog();
    fetchChallenges();
    fetchPoints();
    fetchMyRewards();
  }, [fetchCatalog, fetchChallenges, fetchPoints, fetchMyRewards]);

  const handleRedeem = async (rewardId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('session_token');
      const response = await axios.post(
        `${API}/api/rewards/redeem/${rewardId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(isFr ? '🎁 Récompense débloquée !' : '🎁 Reward unlocked!');
      setUserPoints(response.data.remaining_points);
      fetchMyRewards();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Error';
      if (msg === 'Not enough points') {
        toast.error(isFr ? 'Points insuffisants' : 'Not enough points');
      } else {
        toast.error(msg);
      }
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Gift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">{isFr ? 'Connexion requise' : 'Login required'}</h2>
          <Button onClick={() => navigate('/login')}>{isFr ? 'Se connecter' : 'Login'}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header with Points */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Gift className="w-8 h-8 text-purple-500" />
                {isFr ? 'Récompenses' : 'Rewards'}
              </h1>
              <p className="text-gray-400 mt-2">
                {isFr ? 'Échangez vos points contre des avantages exclusifs' : 'Exchange your points for exclusive benefits'}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-yellow-500">
                <Star className="w-6 h-6 fill-yellow-500" />
                <span className="text-4xl font-bold">{userPoints}</span>
              </div>
              <p className="text-gray-500 text-sm">{isFr ? 'points disponibles' : 'available points'}</p>
            </div>
          </div>
          
          {/* Mini Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-purple-500/20">
            <div className="text-center">
              <Trophy className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
              <p className="text-xl font-bold">{lifetimePoints}</p>
              <p className="text-gray-500 text-xs">{isFr ? 'Points gagnés' : 'Lifetime earned'}</p>
            </div>
            <div className="text-center">
              <ShoppingBag className="w-5 h-5 text-green-500 mx-auto mb-1" />
              <p className="text-xl font-bold">{myRewards.length}</p>
              <p className="text-gray-500 text-xs">{isFr ? 'Récompenses' : 'Rewards'}</p>
            </div>
            <div className="text-center">
              <Zap className="w-5 h-5 text-purple-500 mx-auto mb-1" />
              <p className="text-xl font-bold">{transactions.length}</p>
              <p className="text-gray-500 text-xs">{isFr ? 'Transactions' : 'Transactions'}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-zinc-900 p-1 rounded-lg overflow-x-auto">
          {[
            { id: 'challenges', label: isFr ? 'Défis' : 'Challenges', icon: Target },
            { id: 'shop', label: isFr ? 'Boutique' : 'Shop', icon: ShoppingBag },
            { id: 'my-rewards', label: isFr ? 'Récompenses' : 'Rewards', icon: Award },
            { id: 'history', label: isFr ? 'Historique' : 'History', icon: History }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-purple-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Challenges Tab */}
        {activeTab === 'challenges' && (
          <div>
            {/* Week Info */}
            <div className="flex items-center justify-between mb-4 bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Flame className="w-6 h-6 text-orange-500" />
                <div>
                  <h3 className="font-bold">{isFr ? 'Défis Hebdomadaires' : 'Weekly Challenges'}</h3>
                  <p className="text-sm text-gray-400">
                    {isFr 
                      ? `Se termine dans ${challengesInfo.days_remaining || 0} jours` 
                      : `Ends in ${challengesInfo.days_remaining || 0} days`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-orange-400">
                <Timer className="w-5 h-5" />
                <span className="font-bold">{challengesInfo.days_remaining || 0}j</span>
              </div>
            </div>

            {/* Challenges Grid */}
            <div className="space-y-3">
              {challenges.map((challenge) => {
                const isCompleted = challenge.is_completed;
                const isClaimed = challenge.is_claimed;
                
                return (
                  <div 
                    key={challenge.id}
                    className={`bg-zinc-900 border rounded-xl p-4 transition-all ${
                      isClaimed 
                        ? 'border-green-500/30 bg-green-500/5' 
                        : isCompleted 
                          ? 'border-yellow-500/50 bg-yellow-500/5' 
                          : 'border-zinc-800 hover:border-purple-500/50'
                    }`}
                    data-testid={`challenge-${challenge.id}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Emoji */}
                      <div className={`text-3xl p-2 rounded-lg ${
                        isClaimed ? 'bg-green-500/20' : isCompleted ? 'bg-yellow-500/20' : 'bg-zinc-800'
                      }`}>
                        {challenge.emoji}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold">
                            {isFr ? challenge.name_fr : challenge.name_en}
                          </h3>
                          {isClaimed && (
                            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              {isFr ? 'Réclamé' : 'Claimed'}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm mb-3">
                          {isFr ? challenge.description_fr : challenge.description_en}
                        </p>
                        
                        {/* Progress Bar */}
                        <div className="mb-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500">
                              {challenge.progress}/{challenge.target}
                            </span>
                            <span className={`font-bold ${
                              isCompleted ? 'text-green-400' : 'text-purple-400'
                            }`}>
                              {challenge.percentage}%
                            </span>
                          </div>
                          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${
                                isClaimed 
                                  ? 'bg-green-500' 
                                  : isCompleted 
                                    ? 'bg-yellow-500' 
                                    : 'bg-purple-500'
                              }`}
                              style={{ width: `${challenge.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Reward & Action */}
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-yellow-500 mb-2">
                          <Star className="w-4 h-4 fill-yellow-500" />
                          <span className="font-bold">+{challenge.points_reward}</span>
                        </div>
                        
                        {isCompleted && !isClaimed && (
                          <Button
                            size="sm"
                            onClick={() => claimChallenge(challenge.id)}
                            disabled={claimingId === challenge.id}
                            className="bg-yellow-500 hover:bg-yellow-600 text-black"
                          >
                            {claimingId === challenge.id ? (
                              <span className="animate-spin">⏳</span>
                            ) : (
                              isFr ? 'Réclamer' : 'Claim'
                            )}
                          </Button>
                        )}
                        
                        {isClaimed && (
                          <div className="flex items-center gap-1 text-green-400 text-sm">
                            <Check className="w-4 h-4" />
                            {isFr ? 'Terminé' : 'Done'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {challenges.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{isFr ? 'Aucun défi disponible' : 'No challenges available'}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Shop Tab */}
        {activeTab === 'shop' && (
          <div className="grid md:grid-cols-2 gap-4">
            {catalog.map((reward) => (
              <div 
                key={reward.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-purple-500/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{reward.icon}</span>
                  <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 fill-yellow-500" />
                    <span className="font-bold">{reward.points_cost}</span>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold mb-2">
                  {isFr ? reward.name_fr : reward.name_en}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  {isFr ? reward.description_fr : reward.description_en}
                </p>
                
                {reward.duration_hours && (
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                    <Clock className="w-4 h-4" />
                    <span>
                      {reward.duration_hours >= 168 
                        ? `${Math.floor(reward.duration_hours / 24)} ${isFr ? 'jours' : 'days'}`
                        : `${reward.duration_hours} ${isFr ? 'heures' : 'hours'}`
                      }
                    </span>
                  </div>
                )}
                
                <Button
                  onClick={() => handleRedeem(reward.id)}
                  disabled={loading || userPoints < reward.points_cost}
                  className={`w-full ${
                    userPoints >= reward.points_cost 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'bg-gray-700 cursor-not-allowed'
                  }`}
                >
                  {userPoints >= reward.points_cost ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      {isFr ? 'Échanger' : 'Redeem'}
                    </>
                  ) : (
                    <>
                      {isFr ? `Besoin de ${reward.points_cost - userPoints} pts` : `Need ${reward.points_cost - userPoints} pts`}
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* My Rewards Tab */}
        {activeTab === 'my-rewards' && (
          <div className="space-y-4">
            {myRewards.length === 0 ? (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">{isFr ? 'Aucune récompense' : 'No rewards yet'}</h3>
                <p className="text-gray-400 mb-4">
                  {isFr ? 'Échangez vos points dans la boutique !' : 'Redeem your points in the shop!'}
                </p>
                <Button onClick={() => setActiveTab('shop')} className="bg-purple-600 hover:bg-purple-700">
                  {isFr ? 'Voir la boutique' : 'View shop'}
                </Button>
              </div>
            ) : (
              myRewards.map((reward) => {
                const isExpired = reward.expires_at && new Date(reward.expires_at) < new Date();
                
                return (
                  <div 
                    key={reward.reward_id}
                    className={`bg-zinc-900 border rounded-lg p-4 ${
                      isExpired ? 'border-gray-700 opacity-50' : 'border-green-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isExpired ? 'bg-gray-800' : 'bg-green-500/20'
                        }`}>
                          {isExpired ? (
                            <Clock className="w-6 h-6 text-gray-500" />
                          ) : (
                            <Check className="w-6 h-6 text-green-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold">{reward.name}</p>
                          <p className="text-gray-500 text-sm">
                            {isFr ? 'Obtenu le' : 'Redeemed on'} {new Date(reward.redeemed_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      {reward.expires_at && (
                        <div className={`text-sm ${isExpired ? 'text-red-400' : 'text-green-400'}`}>
                          {isExpired 
                            ? (isFr ? 'Expiré' : 'Expired')
                            : `${isFr ? 'Expire le' : 'Expires'} ${new Date(reward.expires_at).toLocaleDateString()}`
                          }
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-2">
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold">{isFr ? 'Aucune transaction' : 'No transactions'}</h3>
              </div>
            ) : (
              transactions.map((tx, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.points > 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {tx.points > 0 ? (
                        <Zap className="w-5 h-5 text-green-500" />
                      ) : (
                        <ShoppingBag className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{tx.reason}</p>
                      <p className="text-gray-500 text-sm">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`font-bold ${tx.points > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.points > 0 ? '+' : ''}{tx.points}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* How to earn points */}
        <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            {isFr ? 'Comment gagner des points ?' : 'How to earn points?'}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: '🏃', label: isFr ? 'Complétez des défis de course' : 'Complete running challenges', points: '50-200' },
              { icon: '💪', label: isFr ? 'Terminez une séance d\'entraînement' : 'Complete a workout', points: '25' },
              { icon: '📅', label: isFr ? 'Connectez-vous quotidiennement' : 'Daily login', points: '10' },
              { icon: '⭐', label: isFr ? 'Débloquez un badge' : 'Unlock a badge', points: '50-100' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-black/30 rounded-lg">
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-sm">{item.label}</p>
                </div>
                <span className="text-yellow-500 font-bold">+{item.points}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardsPage;
