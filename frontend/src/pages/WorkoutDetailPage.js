import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import { Button } from '../components/ui/button.jsx';
import { 
  ArrowLeft, Clock, Dumbbell, Play, X, 
  PlayCircle, StopCircle, PauseCircle, 
  Timer, TrendingUp, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const WorkoutDetailPage = () => {
  const { workoutId } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isFr = i18n.language?.startsWith('fr');
  
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);
  
  // Session tracking state
  const [sessionId, setSessionId] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Pause tracking state
  const [isPaused, setIsPaused] = useState(false);
  const [pauseId, setPauseId] = useState(null);
  const [pauseStartTime, setPauseStartTime] = useState(null);
  const [pauseElapsedTime, setPauseElapsedTime] = useState(0);
  const [totalPauseTime, setTotalPauseTime] = useState(0);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('session_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchWorkout = async () => {
    setLoading(true);
    try {
      const lang = i18n.language?.startsWith('fr') ? 'fr' : 'en';
      const response = await axios.get(`${API}/workouts/${workoutId}?language=${lang}`);
      setWorkout(response.data);
    } catch (error) {
      console.error('Error fetching workout:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workoutId, i18n.language]);

  // Timer for session elapsed time
  useEffect(() => {
    let interval;
    if (sessionActive && !isPaused && sessionStartTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - sessionStartTime) / 1000) - totalPauseTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionActive, isPaused, sessionStartTime, totalPauseTime]);

  // Timer for pause elapsed time
  useEffect(() => {
    let interval;
    if (isPaused && pauseStartTime) {
      interval = setInterval(() => {
        setPauseElapsedTime(Math.floor((Date.now() - pauseStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused, pauseStartTime]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start workout session
  const startSession = async () => {
    try {
      const response = await axios.post(
        `${API}/workout/start?workout_id=${workoutId}`,
        {},
        { headers: getAuthHeaders() }
      );
      setSessionId(response.data.session_id);
      setSessionActive(true);
      setSessionStartTime(Date.now());
      setElapsedTime(0);
      setTotalPauseTime(0);
      toast.success(isFr ? 'Séance démarrée! Bon entraînement!' : 'Session started! Have a great workout!');
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error(isFr ? 'Erreur lors du démarrage' : 'Error starting session');
    }
  };

  // End workout session
  const endSession = async (completed = true) => {
    if (!sessionId) return;
    
    try {
      const response = await axios.post(
        `${API}/workout/end?session_id=${sessionId}&completed=${completed}`,
        {},
        { headers: getAuthHeaders() }
      );
      
      setSessionActive(false);
      setSessionId(null);
      setSessionStartTime(null);
      setIsPaused(false);
      setPauseId(null);
      
      const duration = response.data.duration_formatted;
      toast.success(
        completed 
          ? (isFr ? `Bravo! Séance terminée en ${duration}` : `Great job! Session completed in ${duration}`)
          : (isFr ? `Séance arrêtée (${duration})` : `Session stopped (${duration})`)
      );
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error(isFr ? 'Erreur lors de la fin de séance' : 'Error ending session');
    }
  };

  // Start pause
  const startPause = async () => {
    if (!sessionId) return;
    
    try {
      const response = await axios.post(
        `${API}/workout/pause/start?session_id=${sessionId}`,
        {},
        { headers: getAuthHeaders() }
      );
      setPauseId(response.data.pause_id);
      setIsPaused(true);
      setPauseStartTime(Date.now());
      setPauseElapsedTime(0);
      toast.info(isFr ? 'Pause en cours...' : 'Pause started...');
    } catch (error) {
      console.error('Error starting pause:', error);
      toast.error(isFr ? 'Erreur' : 'Error');
    }
  };

  // End pause
  const endPause = async () => {
    if (!sessionId || !pauseId) return;
    
    try {
      const response = await axios.post(
        `${API}/workout/pause/end?session_id=${sessionId}&pause_id=${pauseId}`,
        {},
        { headers: getAuthHeaders() }
      );
      setTotalPauseTime(prev => prev + pauseElapsedTime);
      setIsPaused(false);
      setPauseId(null);
      setPauseStartTime(null);
      setPauseElapsedTime(0);
      toast.success(isFr ? `Pause terminée (${response.data.pause_duration_formatted})` : `Pause ended (${response.data.pause_duration_formatted})`);
    } catch (error) {
      console.error('Error ending pause:', error);
      toast.error(isFr ? 'Erreur' : 'Error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <p className="text-gray-400">Workout not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] noise-bg">
      <Navigation />
      
      {/* Session Tracking Bar - Fixed at top when active */}
      {sessionActive && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-[#EF4444] via-[#DC2626] to-[#EF4444] shadow-lg" data-testid="session-bar">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              {/* Timer Display */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Timer className="w-6 h-6 animate-pulse" />
                  <span className="font-bold text-2xl font-mono" data-testid="elapsed-time">
                    {formatTime(elapsedTime)}
                  </span>
                </div>
                
                {isPaused && (
                  <div className="flex items-center gap-2 bg-yellow-500/30 px-3 py-1 rounded-full">
                    <PauseCircle className="w-5 h-5 text-yellow-300" />
                    <span className="font-mono font-bold text-yellow-300" data-testid="pause-time">
                      {formatTime(pauseElapsedTime)}
                    </span>
                  </div>
                )}
              </div>

              {/* Control Buttons */}
              <div className="flex items-center gap-2">
                {!isPaused ? (
                  <Button
                    onClick={startPause}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                    data-testid="pause-btn"
                  >
                    <PauseCircle className="w-5 h-5 mr-2" />
                    {isFr ? 'PAUSE' : 'PAUSE'}
                  </Button>
                ) : (
                  <Button
                    onClick={endPause}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold animate-pulse"
                    data-testid="resume-btn"
                  >
                    <PlayCircle className="w-5 h-5 mr-2" />
                    {isFr ? 'REPRENDRE' : 'RESUME'}
                  </Button>
                )}
                
                <Button
                  onClick={() => endSession(true)}
                  className="bg-white text-[#EF4444] hover:bg-gray-100 font-bold"
                  data-testid="end-session-btn"
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  {isFr ? 'TERMINER' : 'FINISH'}
                </Button>
                
                <Button
                  onClick={() => endSession(false)}
                  variant="ghost"
                  className="text-white/70 hover:text-white hover:bg-white/10"
                  data-testid="stop-session-btn"
                >
                  <StopCircle className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className={`py-12 px-4 sm:px-6 lg:px-8 ${sessionActive ? 'pt-28' : ''}`}>
        <div className="max-w-4xl mx-auto">
          <Button
            data-testid="back-btn"
            onClick={() => navigate('/workouts')}
            variant="ghost"
            className="mb-6 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('workout.back')}
          </Button>

          <div 
            className="h-96 rounded-md mb-8 bg-cover bg-center relative overflow-hidden"
            style={{ backgroundImage: `url(${workout.image_url})` }}
          >
            {/* Start Session Overlay */}
            {!sessionActive && user && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Button
                  onClick={startSession}
                  className="bg-[#EF4444] hover:bg-[#DC2626] text-white px-8 py-6 text-xl font-bold rounded-sm hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all hover:scale-105"
                  data-testid="start-session-btn"
                >
                  <PlayCircle className="w-8 h-8 mr-3" />
                  {isFr ? 'DÉMARRER LA SÉANCE' : 'START WORKOUT'}
                </Button>
              </div>
            )}
          </div>

          <div className="mb-8">
            <h1 
              className="text-5xl font-bold mb-4"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              data-testid="workout-title"
            >
              {workout.title}
            </h1>
            <p className="text-gray-400 text-lg mb-6">{workout.description}</p>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-[#121212] border border-[#27272a] px-4 py-2 rounded-sm">
                <Clock className="w-5 h-5" />
                <span>{workout.duration} {t('workouts.duration')}</span>
              </div>
              <div className="flex items-center gap-2 bg-[#121212] border border-[#27272a] px-4 py-2 rounded-sm">
                <Dumbbell className="w-5 h-5" />
                <span>{workout.exercises.length} exercices</span>
              </div>
              
              {/* My Progress Button */}
              {user && (
                <Button
                  onClick={() => navigate('/my-progress')}
                  variant="outline"
                  className="border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444] hover:text-white"
                  data-testid="my-progress-btn"
                >
                  <TrendingUp className="w-5 h-5 mr-2" />
                  {isFr ? 'Mon Évolution' : 'My Progress'}
                </Button>
              )}
            </div>
          </div>

          {/* Exercises */}
          <div>
            <h2 
              className="text-3xl font-bold mb-6"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {t('workout.exercises')}
            </h2>
            
            <div className="space-y-6">
              {workout.exercises.map((exercise, index) => (
                <React.Fragment key={index}>
                  {/* Rest Separator */}
                  {index > 0 && (
                    <div className="flex items-center justify-center py-4" data-testid={`rest-separator-${index}`}>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#EAB308] to-transparent"></div>
                      <div className="mx-4 flex items-center gap-2 bg-[#EAB308]/10 border border-[#EAB308]/30 px-4 py-2 rounded-full">
                        <Clock className="w-5 h-5 text-[#EAB308]" />
                        <span className="text-[#EAB308] font-bold text-sm">
                          {isFr ? 'REPOS' : 'REST'}: {workout.exercises[index - 1]?.rest || '60s'}
                        </span>
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#EAB308] to-transparent"></div>
                    </div>
                  )}
                  <div
                    data-testid={`exercise-${index}`}
                    className={`bg-[#121212] border rounded-md overflow-hidden transition-colors ${
                      sessionActive ? 'border-[#EF4444]/30 hover:border-[#EF4444]' : 'border-[#27272a] hover:border-white/20'
                    }`}
                  >
                  <div className="flex flex-col lg:flex-row">
                    {/* Exercise Image */}
                    {exercise.image_url && (
                      <div className="lg:w-64 h-48 lg:h-auto flex-shrink-0 relative group">
                        <img 
                          src={exercise.image_url} 
                          alt={exercise.name}
                          className="w-full h-full object-cover"
                        />
                        {exercise.video_url && (
                          <button
                            data-testid={`play-video-${index}`}
                            onClick={() => setActiveVideo(exercise.video_url)}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                              <Play className="w-8 h-8 text-[#09090b] ml-1" fill="currentColor" />
                            </div>
                          </button>
                        )}
                      </div>
                    )}
                    
                    {/* Exercise Details */}
                    <div className="flex-1 p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`text-3xl font-bold ${sessionActive ? 'text-[#EF4444]' : 'text-gray-600'}`}>{index + 1}</span>
                        <h3 
                          className="text-2xl font-bold"
                          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                        >
                          {exercise.name}
                        </h3>
                      </div>
                      
                      {exercise.description && (
                        <p className="text-gray-400 text-sm mb-4">{exercise.description}</p>
                      )}
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="bg-[#09090b] p-3 rounded-sm">
                          <span className="text-gray-400 block text-xs mb-1">{t('workout.sets')}</span>
                          <span className="font-bold text-lg">{exercise.sets}</span>
                        </div>
                        <div className="bg-[#09090b] p-3 rounded-sm">
                          <span className="text-gray-400 block text-xs mb-1">{t('workout.reps')}</span>
                          <span className="font-bold text-lg">{exercise.reps}</span>
                        </div>
                        <div className="bg-[#09090b] p-3 rounded-sm border-2 border-[#EAB308]">
                          <span className="text-[#EAB308] block text-xs mb-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {t('workout.rest')}
                          </span>
                          <span className="font-bold text-lg text-[#EAB308]">{exercise.rest}</span>
                        </div>
                      </div>
                      
                      {exercise.video_url && (
                        <Button
                          data-testid={`watch-video-btn-${index}`}
                          onClick={() => setActiveVideo(exercise.video_url)}
                          className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-sm"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {isFr ? 'Voir la vidéo' : 'Watch Video'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Video Modal */}
          {activeVideo && (
            <div 
              className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
              onClick={() => setActiveVideo(null)}
            >
              <div 
                className="relative w-full max-w-4xl bg-[#121212] rounded-md overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  data-testid="close-video-modal"
                  onClick={() => setActiveVideo(null)}
                  className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="aspect-video">
                  <iframe
                    src={`${activeVideo}?autoplay=1`}
                    title="Exercise Video"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutDetailPage;
