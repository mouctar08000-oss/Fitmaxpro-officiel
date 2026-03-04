import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import { Button } from '../components/ui/button.jsx';
import { 
  ArrowLeft, Clock, Dumbbell, TrendingUp, 
  Calendar, Timer, CheckCircle2, XCircle,
  Trophy, Flame, Target, Sparkles, Award
} from 'lucide-react';
import axios from 'axios';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line
} from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MyProgressPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isFr = i18n.language?.startsWith('fr');
  
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [evolution, setEvolution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('session_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionsRes, evolutionRes] = await Promise.all([
          axios.get(`${API}/workout/my-sessions`, { headers: getAuthHeaders() }),
          axios.get(`${API}/user/evolution`, { headers: getAuthHeaders() })
        ]);
        setSessions(sessionsRes.data.sessions);
        setStats(sessionsRes.data.stats);
        setEvolution(evolutionRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user, getAuthHeaders]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString(isFr ? 'fr-FR' : 'en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '-';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#09090b] noise-bg">
        <Navigation />
        <div className="py-20 px-4 text-center">
          <p className="text-gray-400 text-lg mb-4">
            {isFr ? 'Connectez-vous pour voir votre évolution' : 'Login to see your progress'}
          </p>
          <Button onClick={() => navigate('/login')} className="bg-[#EF4444]">
            {isFr ? 'Se connecter' : 'Login'}
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] noise-bg">
      <Navigation />
      
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Button
            onClick={() => navigate('/workouts')}
            variant="ghost"
            className="mb-6 text-gray-400 hover:text-white"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isFr ? 'Retour aux séances' : 'Back to workouts'}
          </Button>

          {/* Page Title */}
          <div className="mb-8">
            <h1 
              className="text-5xl font-bold mb-4 flex items-center gap-4"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              data-testid="progress-title"
            >
              <TrendingUp className="w-12 h-12 text-[#EF4444]" />
              {isFr ? 'MON ÉVOLUTION' : 'MY PROGRESS'}
            </h1>
            <p className="text-gray-400 text-lg">
              {isFr 
                ? 'Suivez vos performances et votre progression' 
                : 'Track your performance and progress'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-[#27272a] pb-4">
            {[
              { id: 'overview', label: isFr ? 'Aperçu' : 'Overview', icon: TrendingUp },
              { id: 'charts', label: isFr ? 'Graphiques' : 'Charts', icon: Award },
              { id: 'history', label: isFr ? 'Historique' : 'History', icon: Calendar }
            ].map(tab => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                className={activeTab === tab.id ? 'bg-[#EF4444]' : 'text-gray-400'}
                data-testid={`tab-${tab.id}`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
                <div className="bg-gradient-to-br from-[#EF4444]/20 to-[#EF4444]/5 border border-[#EF4444]/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Dumbbell className="w-5 h-5 text-[#EF4444]" />
                    <span className="text-gray-400 text-xs">
                      {isFr ? 'Séances' : 'Workouts'}
                    </span>
                  </div>
                  <p className="text-3xl font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                    {evolution?.stats?.total_workouts || 0}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-5 h-5 text-orange-400" />
                    <span className="text-gray-400 text-xs">
                      {isFr ? 'Échauffements' : 'Warm-Ups'}
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-orange-400" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                    {evolution?.stats?.total_warmups || 0}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-400 text-xs">
                      {isFr ? 'Étirements' : 'Stretching'}
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-purple-400" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                    {evolution?.stats?.total_stretching || 0}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Timer className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-400 text-xs">
                      {isFr ? 'Temps total' : 'Total Time'}
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-blue-400" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                    {evolution?.stats?.total_duration_minutes || 0}m
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span className="text-gray-400 text-xs">
                      {isFr ? 'Discipline' : 'Discipline'}
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-green-400" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                    {evolution?.stats?.discipline_score || 0}%
                  </p>
                </div>

                <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <span className="text-gray-400 text-xs">
                      {isFr ? 'Série actuelle' : 'Current Streak'}
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-yellow-400" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                    {evolution?.stats?.current_streak || 0} {isFr ? 'j' : 'd'}
                  </p>
                </div>
              </div>

              {/* Quick Chart - Last 7 Days */}
              {evolution?.daily && evolution.daily.length > 0 && (
                <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6 mb-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                    <TrendingUp className="w-5 h-5 text-[#EF4444]" />
                    {isFr ? 'ACTIVITÉ DES 7 DERNIERS JOURS' : 'LAST 7 DAYS ACTIVITY'}
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={evolution.daily}>
                      <defs>
                        <linearGradient id="colorWorkoutsUser" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorWarmupsUser" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F97316" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#F97316" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorStretchingUser" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#A855F7" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#A855F7" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="day" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#121212', border: '1px solid #27272a', borderRadius: '8px' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="workouts" name={isFr ? "Séances" : "Workouts"} stroke="#EF4444" fillOpacity={1} fill="url(#colorWorkoutsUser)" />
                      <Area type="monotone" dataKey="warmups" name={isFr ? "Échauffements" : "Warm-Ups"} stroke="#F97316" fillOpacity={1} fill="url(#colorWarmupsUser)" />
                      <Area type="monotone" dataKey="stretching" name={isFr ? "Étirements" : "Stretching"} stroke="#A855F7" fillOpacity={1} fill="url(#colorStretchingUser)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Discipline Score Explanation */}
              <div className="bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/30 rounded-lg p-6">
                <h3 className="font-bold mb-3 text-green-400 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  {isFr ? 'Votre Score de Discipline' : 'Your Discipline Score'}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  {isFr 
                    ? 'Le score de discipline mesure si vous faites vos échauffements avant et vos étirements après chaque séance. Un score de 100% signifie que vous complétez toujours les deux !'
                    : 'The discipline score measures if you do your warm-ups before and stretches after each workout. A 100% score means you always complete both!'}
                </p>
                <div className="w-full bg-[#27272a] rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-400 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${evolution?.stats?.discipline_score || 0}%` }}
                  />
                </div>
                <p className="text-center mt-2 text-2xl font-bold text-green-400">
                  {evolution?.stats?.discipline_score || 0}%
                </p>
              </div>
            </>
          )}

          {/* Charts Tab */}
          {activeTab === 'charts' && (
            <div className="space-y-6">
              {/* Weekly Evolution */}
              {evolution?.weekly && evolution.weekly.length > 0 && (
                <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                    <Calendar className="w-5 h-5 text-blue-400" />
                    {isFr ? 'ÉVOLUTION HEBDOMADAIRE (4 SEMAINES)' : 'WEEKLY EVOLUTION (4 WEEKS)'}
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={evolution.weekly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="week" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#121212', border: '1px solid #27272a', borderRadius: '8px' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="discipline_score" name={isFr ? "Score Discipline %" : "Discipline Score %"} stroke="#22C55E" strokeWidth={3} dot={{ fill: '#22C55E', strokeWidth: 2 }} />
                      <Line type="monotone" dataKey="workouts" name={isFr ? "Séances" : "Workouts"} stroke="#EF4444" strokeWidth={2} />
                      <Line type="monotone" dataKey="warmups" name={isFr ? "Échauffements" : "Warm-Ups"} stroke="#F97316" strokeWidth={2} />
                      <Line type="monotone" dataKey="stretching" name={isFr ? "Étirements" : "Stretching"} stroke="#A855F7" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Training Time */}
              {evolution?.daily && (
                <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                    <Clock className="w-5 h-5 text-green-400" />
                    {isFr ? 'TEMPS D\'ENTRAÎNEMENT PAR JOUR (MINUTES)' : 'TRAINING TIME PER DAY (MINUTES)'}
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={evolution.daily}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="day" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#121212', border: '1px solid #27272a', borderRadius: '8px' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="duration_minutes" name={isFr ? "Durée (min)" : "Duration (min)"} fill="#22C55E" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Weekly Comparison */}
              {evolution?.weekly && (
                <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    {isFr ? 'TEMPS D\'ENTRAÎNEMENT PAR SEMAINE' : 'TRAINING TIME PER WEEK'}
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={evolution.weekly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="week" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#121212', border: '1px solid #27272a', borderRadius: '8px' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="duration_minutes" name={isFr ? "Durée (min)" : "Duration (min)"} fill="#A855F7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="bg-[#121212] border border-[#27272a] rounded-lg overflow-hidden">
              <div className="p-6 border-b border-[#27272a]">
                <h2 
                  className="text-2xl font-bold flex items-center gap-3"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  <Calendar className="w-6 h-6 text-[#EF4444]" />
                  {isFr ? 'HISTORIQUE DES SÉANCES' : 'SESSION HISTORY'}
                </h2>
              </div>

              {sessions.length === 0 ? (
                <div className="p-12 text-center">
                  <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg mb-4">
                    {isFr 
                      ? 'Aucune séance enregistrée pour le moment' 
                      : 'No sessions recorded yet'}
                  </p>
                  <Button onClick={() => navigate('/workouts')} className="bg-[#EF4444]">
                    {isFr ? 'Commencer une séance' : 'Start a workout'}
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-[#27272a]">
                  {sessions.map((session, idx) => (
                    <div 
                      key={session.session_id || idx} 
                      className="p-4 hover:bg-[#1a1a1a] transition-colors"
                      data-testid={`session-${idx}`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-lg ${session.completed ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                            {session.completed 
                              ? <CheckCircle2 className="w-6 h-6 text-green-400" />
                              : <XCircle className="w-6 h-6 text-red-400" />
                            }
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{session.workout_title}</h3>
                            <p className="text-gray-400 text-sm flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {formatDate(session.started_at)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <p className="text-gray-500 text-xs mb-1">
                              {isFr ? 'Durée' : 'Duration'}
                            </p>
                            <p className="font-bold text-lg flex items-center gap-1">
                              <Timer className="w-4 h-4 text-blue-400" />
                              {formatDuration(session.duration_seconds)}
                            </p>
                          </div>
                          
                          {session.total_pause_seconds > 0 && (
                            <div className="text-center">
                              <p className="text-gray-500 text-xs mb-1">
                                {isFr ? 'Pauses' : 'Pauses'}
                              </p>
                              <p className="font-bold text-yellow-400">
                                {formatDuration(session.total_pause_seconds)}
                              </p>
                            </div>
                          )}
                          
                          <div className="text-center">
                            <p className="text-gray-500 text-xs mb-1">
                              {isFr ? 'Statut' : 'Status'}
                            </p>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              session.completed 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {session.completed 
                                ? (isFr ? 'Terminée' : 'Completed') 
                                : (isFr ? 'Arrêtée' : 'Stopped')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Motivational Section */}
          {evolution?.stats?.total_workouts > 0 && (
            <div className="mt-8 bg-gradient-to-r from-[#EF4444]/20 via-[#EF4444]/10 to-transparent border border-[#EF4444]/30 rounded-lg p-6">
              <div className="flex items-center gap-4">
                <Trophy className="w-12 h-12 text-[#EAB308]" />
                <div>
                  <h3 className="text-xl font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                    {isFr ? 'BRAVO!' : 'GREAT JOB!'}
                  </h3>
                  <p className="text-gray-400">
                    {isFr 
                      ? `Vous avez complété ${evolution.stats.total_workouts} séance${evolution.stats.total_workouts > 1 ? 's' : ''} ce mois-ci. ${evolution.stats.discipline_score >= 80 ? 'Votre discipline est excellente!' : 'Continuez vos échauffements et étirements!'}` 
                      : `You have completed ${evolution.stats.total_workouts} session${evolution.stats.total_workouts > 1 ? 's' : ''} this month. ${evolution.stats.discipline_score >= 80 ? 'Your discipline is excellent!' : 'Keep doing your warm-ups and stretches!'}`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProgressPage;
