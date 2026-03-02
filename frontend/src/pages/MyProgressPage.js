import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import { Button } from '../components/ui/button.jsx';
import { 
  ArrowLeft, Clock, Dumbbell, TrendingUp, 
  Calendar, Timer, CheckCircle2, XCircle,
  Trophy, Flame, Target
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MyProgressPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isFr = i18n.language?.startsWith('fr');
  
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('session_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get(`${API}/workout/my-sessions`, {
          headers: getAuthHeaders()
        });
        setSessions(response.data.sessions);
        setStats(response.data.stats);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSessions();
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

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
              <div className="bg-gradient-to-br from-[#EF4444]/20 to-[#EF4444]/5 border border-[#EF4444]/30 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-[#EF4444] rounded-lg">
                    <Dumbbell className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-gray-400 text-sm">
                    {isFr ? 'Séances totales' : 'Total Sessions'}
                  </span>
                </div>
                <p className="text-4xl font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                  {stats.total_sessions}
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-gray-400 text-sm">
                    {isFr ? 'Séances terminées' : 'Completed'}
                  </span>
                </div>
                <p className="text-4xl font-bold text-green-400" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                  {stats.completed_sessions}
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Timer className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-gray-400 text-sm">
                    {isFr ? 'Temps total' : 'Total Time'}
                  </span>
                </div>
                <p className="text-4xl font-bold text-blue-400" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                  {stats.total_duration_formatted}
                </p>
              </div>

              <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/30 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-yellow-500 rounded-lg">
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-gray-400 text-sm">
                    {isFr ? 'Taux de complétion' : 'Completion Rate'}
                  </span>
                </div>
                <p className="text-4xl font-bold text-yellow-400" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                  {stats.total_sessions > 0 
                    ? `${Math.round((stats.completed_sessions / stats.total_sessions) * 100)}%` 
                    : '0%'}
                </p>
              </div>
            </div>
          )}

          {/* Sessions History */}
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
                    
                    {/* Pause Details */}
                    {session.pauses && session.pauses.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[#27272a]">
                        <p className="text-gray-500 text-xs mb-2">
                          {isFr ? 'Détail des pauses' : 'Pause Details'} ({session.pauses.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {session.pauses.map((pause, pIdx) => (
                            <span 
                              key={pIdx}
                              className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs px-2 py-1 rounded"
                            >
                              {formatDuration(pause.duration_seconds)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Motivational Section */}
          {stats && stats.completed_sessions > 0 && (
            <div className="mt-8 bg-gradient-to-r from-[#EF4444]/20 via-[#EF4444]/10 to-transparent border border-[#EF4444]/30 rounded-lg p-6">
              <div className="flex items-center gap-4">
                <Trophy className="w-12 h-12 text-[#EAB308]" />
                <div>
                  <h3 className="text-xl font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                    {isFr ? 'BRAVO!' : 'GREAT JOB!'}
                  </h3>
                  <p className="text-gray-400">
                    {isFr 
                      ? `Vous avez complété ${stats.completed_sessions} séance${stats.completed_sessions > 1 ? 's' : ''} pour un total de ${stats.total_duration_formatted}. Continuez comme ça!` 
                      : `You have completed ${stats.completed_sessions} session${stats.completed_sessions > 1 ? 's' : ''} for a total of ${stats.total_duration_formatted}. Keep it up!`}
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
