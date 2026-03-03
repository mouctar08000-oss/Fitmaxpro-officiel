import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { 
  Play, 
  Pause, 
  Square, 
  MapPin, 
  Timer, 
  Zap,
  TrendingUp,
  Calendar,
  Award,
  ChevronRight,
  Navigation,
  Footprints,
  Flame,
  Target,
  Plus
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const API = process.env.REACT_APP_BACKEND_URL;

const RunningPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const isFr = t('language') === 'fr' || navigator.language?.startsWith('fr');
  
  // State
  const [activeTab, setActiveTab] = useState('track'); // track, history, stats
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [pace, setPace] = useState(0);
  const [calories, setCalories] = useState(0);
  const [runHistory, setRunHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Refs
  const timerRef = useRef(null);
  const watchIdRef = useRef(null);
  const lastPositionRef = useRef(null);
  
  // Fetch run history
  const fetchRunHistory = useCallback(async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('session_token');
      const response = await axios.get(`${API}/api/running/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRunHistory(response.data || []);
    } catch (err) {
      console.error('Error fetching run history:', err);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('session_token');
      const response = await axios.get(`${API}/api/running/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchRunHistory();
    fetchStats();
  }, [fetchRunHistory, fetchStats]);

  // Calculate distance between two points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Start tracking
  const startRun = () => {
    setIsRunning(true);
    setIsPaused(false);
    setElapsedTime(0);
    setDistance(0);
    setPace(0);
    setCalories(0);
    lastPositionRef.current = null;
    
    // Start timer
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    // Start GPS tracking
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          if (lastPositionRef.current) {
            const dist = calculateDistance(
              lastPositionRef.current.lat,
              lastPositionRef.current.lon,
              latitude,
              longitude
            );
            
            // Only add if moved more than 5 meters (0.005 km)
            if (dist > 0.005) {
              setDistance(prev => {
                const newDist = prev + dist;
                // Calculate pace (min/km)
                const timeInMinutes = elapsedTime / 60;
                if (newDist > 0) {
                  setPace(timeInMinutes / newDist);
                }
                // Calculate calories (rough estimate: 60 cal per km)
                setCalories(Math.round(newDist * 60));
                return newDist;
              });
            }
          }
          
          lastPositionRef.current = { lat: latitude, lon: longitude };
        },
        (error) => {
          console.error('GPS Error:', error);
          toast.error(isFr ? 'Erreur GPS. Activez la localisation.' : 'GPS Error. Enable location.');
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
    
    toast.success(isFr ? 'Course démarrée ! Bonne course !' : 'Run started! Good luck!');
  };

  // Pause run
  const pauseRun = () => {
    setIsPaused(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  // Resume run
  const resumeRun = () => {
    setIsPaused(false);
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
  };

  // Stop and save run
  const stopRun = async () => {
    setIsRunning(false);
    setIsPaused(false);
    
    // Stop timer and GPS
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    
    // Save run to backend
    if (distance > 0) {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('session_token');
        await axios.post(`${API}/api/running/log`, {
          distance: distance,
          duration: elapsedTime,
          pace: pace,
          calories: calories
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        toast.success(isFr 
          ? `Course enregistrée ! ${distance.toFixed(2)} km` 
          : `Run saved! ${distance.toFixed(2)} km`
        );
        
        fetchRunHistory();
        fetchStats();
      } catch (err) {
        console.error('Error saving run:', err);
        toast.error(isFr ? 'Erreur lors de l\'enregistrement' : 'Error saving run');
      }
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format pace
  const formatPace = (paceValue) => {
    if (!paceValue || paceValue === Infinity) return '--:--';
    const mins = Math.floor(paceValue);
    const secs = Math.round((paceValue - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Render tracking view
  const renderTrackingView = () => (
    <div className="space-y-6">
      {/* Main Stats Display */}
      <div className={`rounded-2xl p-8 text-center ${isRunning ? 'bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30' : 'bg-zinc-900 border border-zinc-800'}`}>
        {/* Distance */}
        <div className="mb-6">
          <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">
            {isFr ? 'Distance' : 'Distance'}
          </p>
          <p className="text-6xl font-bold text-white">
            {distance.toFixed(2)}
          </p>
          <p className="text-2xl text-gray-400">km</p>
        </div>
        
        {/* Time and Pace */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-black/30 rounded-xl p-4">
            <Timer className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{formatTime(elapsedTime)}</p>
            <p className="text-xs text-gray-500">{isFr ? 'Durée' : 'Duration'}</p>
          </div>
          
          <div className="bg-black/30 rounded-xl p-4">
            <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{formatPace(pace)}</p>
            <p className="text-xs text-gray-500">{isFr ? 'Allure/km' : 'Pace/km'}</p>
          </div>
          
          <div className="bg-black/30 rounded-xl p-4">
            <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{calories}</p>
            <p className="text-xs text-gray-500">{isFr ? 'Calories' : 'Calories'}</p>
          </div>
        </div>
        
        {/* Control Buttons */}
        <div className="flex justify-center gap-4">
          {!isRunning ? (
            <Button
              onClick={startRun}
              className="bg-green-500 hover:bg-green-600 text-white px-12 py-6 rounded-full text-xl font-bold"
            >
              <Play className="w-8 h-8 mr-2" />
              {isFr ? 'DÉMARRER' : 'START'}
            </Button>
          ) : (
            <>
              {isPaused ? (
                <Button
                  onClick={resumeRun}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-6 rounded-full"
                >
                  <Play className="w-6 h-6 mr-2" />
                  {isFr ? 'REPRENDRE' : 'RESUME'}
                </Button>
              ) : (
                <Button
                  onClick={pauseRun}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-6 rounded-full"
                >
                  <Pause className="w-6 h-6 mr-2" />
                  {isFr ? 'PAUSE' : 'PAUSE'}
                </Button>
              )}
              
              <Button
                onClick={stopRun}
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-6 rounded-full"
              >
                <Square className="w-6 h-6 mr-2" />
                {isFr ? 'TERMINER' : 'FINISH'}
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* GPS Status */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
          <span className="text-gray-400">
            {isRunning 
              ? (isFr ? 'GPS actif - Tracking en cours' : 'GPS active - Tracking') 
              : (isFr ? 'GPS en attente' : 'GPS standby')
            }
          </span>
        </div>
        <Navigation className={`w-5 h-5 ${isRunning ? 'text-green-400' : 'text-gray-600'}`} />
      </div>
    </div>
  );

  // Render history view
  const renderHistoryView = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Calendar className="w-5 h-5 text-red-500" />
        {isFr ? 'Historique des courses' : 'Run History'}
      </h2>
      
      {runHistory.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
          <Footprints className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">
            {isFr ? 'Aucune course enregistrée' : 'No runs recorded yet'}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {isFr ? 'Commencez votre première course !' : 'Start your first run!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {runHistory.map((run, idx) => (
            <div 
              key={run.run_id || idx}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Footprints className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">{run.distance?.toFixed(2)} km</p>
                    <p className="text-gray-500 text-sm">
                      {new Date(run.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-gray-400">{formatTime(run.duration)}</p>
                    <p className="text-gray-600">{isFr ? 'Durée' : 'Time'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400">{formatPace(run.pace)}</p>
                    <p className="text-gray-600">{isFr ? 'Allure' : 'Pace'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-orange-400">{run.calories}</p>
                    <p className="text-gray-600">kcal</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render stats view
  const renderStatsView = () => {
    const chartData = runHistory.slice(0, 7).reverse().map((run, idx) => ({
      day: new Date(run.created_at).toLocaleDateString('fr-FR', { weekday: 'short' }),
      distance: run.distance?.toFixed(2) || 0,
      calories: run.calories || 0
    }));

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
            <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{stats?.total_distance?.toFixed(1) || 0}</p>
            <p className="text-gray-500 text-sm">{isFr ? 'km total' : 'Total km'}</p>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
            <Footprints className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{stats?.total_runs || 0}</p>
            <p className="text-gray-500 text-sm">{isFr ? 'Courses' : 'Runs'}</p>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
            <Timer className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{formatTime(stats?.total_time || 0)}</p>
            <p className="text-gray-500 text-sm">{isFr ? 'Temps total' : 'Total time'}</p>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
            <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{stats?.total_calories || 0}</p>
            <p className="text-gray-500 text-sm">{isFr ? 'Calories' : 'Calories'}</p>
          </div>
        </div>
        
        {/* Progress Chart */}
        {chartData.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              {isFr ? 'Progression (7 derniers jours)' : 'Progress (Last 7 days)'}
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="day" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #333' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="distance" fill="#22c55e" name="Distance (km)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {/* Best Records */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            {isFr ? 'Records personnels' : 'Personal Records'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/30 rounded-lg p-4">
              <p className="text-gray-500 text-sm">{isFr ? 'Plus longue distance' : 'Longest run'}</p>
              <p className="text-2xl font-bold text-green-400">{stats?.best_distance?.toFixed(2) || 0} km</p>
            </div>
            <div className="bg-black/30 rounded-lg p-4">
              <p className="text-gray-500 text-sm">{isFr ? 'Meilleure allure' : 'Best pace'}</p>
              <p className="text-2xl font-bold text-blue-400">{formatPace(stats?.best_pace) || '--:--'} /km</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Footprints className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">{isFr ? 'Connexion requise' : 'Login required'}</h2>
          <Button onClick={() => navigate('/login')} className="bg-red-600 hover:bg-red-700">
            {isFr ? 'Se connecter' : 'Login'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Footprints className="w-8 h-8 text-green-500" />
            {isFr ? 'Course à Pied' : 'Running'}
          </h1>
          <p className="text-gray-400 mt-2">
            {isFr ? 'Suivez vos courses et votre progression' : 'Track your runs and progress'}
          </p>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-zinc-900 p-1 rounded-lg">
          {[
            { id: 'track', label: isFr ? 'Courir' : 'Run', icon: Play },
            { id: 'history', label: isFr ? 'Historique' : 'History', icon: Calendar },
            { id: 'stats', label: isFr ? 'Stats' : 'Stats', icon: TrendingUp }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-colors ${
                activeTab === tab.id 
                  ? 'bg-green-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Content */}
        {activeTab === 'track' && renderTrackingView()}
        {activeTab === 'history' && renderHistoryView()}
        {activeTab === 'stats' && renderStatsView()}
      </div>
    </div>
  );
};

export default RunningPage;
