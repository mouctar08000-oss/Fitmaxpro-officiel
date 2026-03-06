import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import ExercisePlayer from '../components/ExercisePlayer';
import OfflineManager from '../components/OfflineManager';
import { Button } from '../components/ui/button.jsx';
import { 
  ArrowLeft, Clock, Dumbbell, Play, X, 
  PlayCircle, StopCircle, PauseCircle, 
  Timer, TrendingUp, CheckCircle2, Flame,
  Sparkles, ChevronDown, ChevronUp, MonitorPlay
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
  const [warmupRoutine, setWarmupRoutine] = useState(null);
  const [stretchingRoutine, setStretchingRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);
  
  // Real-time exercise player mode
  const [showExercisePlayer, setShowExercisePlayer] = useState(false);
  const [exercisePlayerType, setExercisePlayerType] = useState(null); // 'workout', 'warmup', 'stretching'
  
  // Expanded sections
  const [warmupExpanded, setWarmupExpanded] = useState(false);
  const [stretchingExpanded, setStretchingExpanded] = useState(false);
  
  // Main workout session tracking
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
  
  // Warmup & Stretching session tracking
  const [warmupSessionId, setWarmupSessionId] = useState(null);
  const [warmupActive, setWarmupActive] = useState(false);
  const [warmupStartTime, setWarmupStartTime] = useState(null);
  const [warmupElapsed, setWarmupElapsed] = useState(0);
  const [warmupCompleted, setWarmupCompleted] = useState(false);
  
  const [stretchingSessionId, setStretchingSessionId] = useState(null);
  const [stretchingActive, setStretchingActive] = useState(false);
  const [stretchingStartTime, setStretchingStartTime] = useState(null);
  const [stretchingElapsed, setStretchingElapsed] = useState(0);
  const [stretchingCompleted, setStretchingCompleted] = useState(false);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('session_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchWorkout = async () => {
    setLoading(true);
    try {
      const lang = isFr ? 'fr' : 'en';
      const [workoutRes, warmupRes, stretchingRes] = await Promise.all([
        axios.get(`${API}/workouts/${workoutId}?language=${lang}`),
        axios.get(`${API}/routines/warmup?language=${lang}`),
        axios.get(`${API}/routines/stretching?language=${lang}`)
      ]);
      setWorkout(workoutRes.data);
      setWarmupRoutine(warmupRes.data);
      setStretchingRoutine(stretchingRes.data);
    } catch (error) {
      console.error('Error fetching workout:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkout();
  }, [workoutId, isFr]);

  // Timer for main session
  useEffect(() => {
    let interval;
    if (sessionActive && !isPaused && sessionStartTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - sessionStartTime) / 1000) - totalPauseTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionActive, isPaused, sessionStartTime, totalPauseTime]);

  // Timer for pause
  useEffect(() => {
    let interval;
    if (isPaused && pauseStartTime) {
      interval = setInterval(() => {
        setPauseElapsedTime(Math.floor((Date.now() - pauseStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused, pauseStartTime]);

  // Timer for warmup
  useEffect(() => {
    let interval;
    if (warmupActive && warmupStartTime) {
      interval = setInterval(() => {
        setWarmupElapsed(Math.floor((Date.now() - warmupStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [warmupActive, warmupStartTime]);

  // Timer for stretching
  useEffect(() => {
    let interval;
    if (stretchingActive && stretchingStartTime) {
      interval = setInterval(() => {
        setStretchingElapsed(Math.floor((Date.now() - stretchingStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [stretchingActive, stretchingStartTime]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ===== WARMUP FUNCTIONS =====
  const startWarmup = async () => {
    try {
      const response = await axios.post(
        `${API}/routine/start?routine_type=warmup`,
        {},
        { headers: getAuthHeaders() }
      );
      setWarmupSessionId(response.data.session_id);
      setWarmupActive(true);
      setWarmupStartTime(Date.now());
      setWarmupElapsed(0);
      setWarmupExpanded(true);
      toast.success(isFr ? 'Échauffement démarré!' : 'Warm-up started!');
    } catch (error) {
      console.error('Error starting warmup:', error);
      toast.error(isFr ? 'Erreur' : 'Error');
    }
  };

  const endWarmup = async (completed = true) => {
    if (!warmupSessionId) return;
    try {
      const response = await axios.post(
        `${API}/routine/end?session_id=${warmupSessionId}&completed=${completed}`,
        {},
        { headers: getAuthHeaders() }
      );
      setWarmupActive(false);
      setWarmupSessionId(null);
      setWarmupStartTime(null);
      setWarmupCompleted(completed);
      toast.success(
        completed 
          ? (isFr ? `Échauffement terminé! (${response.data.duration_formatted})` : `Warm-up completed! (${response.data.duration_formatted})`)
          : (isFr ? 'Échauffement arrêté' : 'Warm-up stopped')
      );
    } catch (error) {
      console.error('Error ending warmup:', error);
    }
  };

  // ===== MAIN SESSION FUNCTIONS =====
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
    }
  };

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
    }
  };

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
    }
  };

  // ===== STRETCHING FUNCTIONS =====
  const startStretching = async () => {
    try {
      const response = await axios.post(
        `${API}/routine/start?routine_type=stretching&workout_session_id=${sessionId || ''}`,
        {},
        { headers: getAuthHeaders() }
      );
      setStretchingSessionId(response.data.session_id);
      setStretchingActive(true);
      setStretchingStartTime(Date.now());
      setStretchingElapsed(0);
      setStretchingExpanded(true);
      toast.success(isFr ? 'Étirements démarrés!' : 'Stretching started!');
    } catch (error) {
      console.error('Error starting stretching:', error);
    }
  };

  const endStretching = async (completed = true) => {
    if (!stretchingSessionId) return;
    try {
      const response = await axios.post(
        `${API}/routine/end?session_id=${stretchingSessionId}&completed=${completed}`,
        {},
        { headers: getAuthHeaders() }
      );
      setStretchingActive(false);
      setStretchingSessionId(null);
      setStretchingStartTime(null);
      setStretchingCompleted(completed);
      toast.success(
        completed 
          ? (isFr ? `Étirements terminés! (${response.data.duration_formatted})` : `Stretching completed! (${response.data.duration_formatted})`)
          : (isFr ? 'Étirements arrêtés' : 'Stretching stopped')
      );
    } catch (error) {
      console.error('Error ending stretching:', error);
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

  // Component for routine exercises
  const RoutineSection = ({ routine, type, isExpanded, setExpanded, isActive, elapsed, onStart, onEnd, isCompleted }) => {
    const isWarmup = type === 'warmup';
    const bgColor = isWarmup ? 'from-orange-500/20 to-orange-500/5' : 'from-purple-500/20 to-purple-500/5';
    const borderColor = isWarmup ? 'border-orange-500/30' : 'border-purple-500/30';
    const textColor = isWarmup ? 'text-orange-400' : 'text-purple-400';
    const Icon = isWarmup ? Flame : Sparkles;

    return (
      <div className={`bg-gradient-to-r ${bgColor} border ${borderColor} rounded-lg overflow-hidden mb-6`}>
        <div 
          className="p-4 flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isWarmup ? 'bg-orange-500/20' : 'bg-purple-500/20'}`}>
              <Icon className={`w-6 h-6 ${textColor}`} />
            </div>
            <div>
              <h3 className={`font-bold text-lg ${textColor}`}>
                {routine?.title || (isWarmup ? (isFr ? 'Échauffement' : 'Warm-Up') : (isFr ? 'Étirements' : 'Stretching'))}
              </h3>
              <p className="text-gray-400 text-sm">
                {routine?.exercises?.length || 0} {isFr ? 'exercices' : 'exercises'} • {routine?.duration || '5-7 min'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isCompleted && (
              <span className="text-green-400 text-sm flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                {isFr ? 'Terminé' : 'Completed'}
              </span>
            )}
            {isActive && (
              <span className={`${textColor} font-mono font-bold`}>
                {formatTime(elapsed)}
              </span>
            )}
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>

        {isExpanded && (
          <div className="border-t border-[#27272a] p-4">
            {/* Control Buttons */}
            {user && (
              <div className="flex gap-2 mb-4">
                {!isActive ? (
                  <>
                    <Button
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setExercisePlayerType(type);
                        setShowExercisePlayer(true);
                      }}
                      variant="outline"
                      className={isWarmup ? 'border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white' : 'border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white'}
                      data-testid={`${type}-video-mode-btn`}
                    >
                      <MonitorPlay className="w-5 h-5 mr-2" />
                      {isFr ? 'MODE VIDÉO' : 'VIDEO MODE'}
                    </Button>
                    <Button
                      onClick={(e) => { e.stopPropagation(); onStart(); }}
                      className={isWarmup ? 'bg-orange-500 hover:bg-orange-600' : 'bg-purple-500 hover:bg-purple-600'}
                      data-testid={`start-${type}-btn`}
                    >
                      <PlayCircle className="w-5 h-5 mr-2" />
                      {isFr ? 'DÉMARRER' : 'START'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={(e) => { e.stopPropagation(); onEnd(true); }}
                      className="bg-green-500 hover:bg-green-600"
                      data-testid={`end-${type}-btn`}
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      {isFr ? 'TERMINER' : 'FINISH'}
                    </Button>
                    <Button
                      onClick={(e) => { e.stopPropagation(); onEnd(false); }}
                      variant="ghost"
                      className="text-gray-400"
                    >
                      <StopCircle className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Exercises List */}
            <div className="space-y-3">
              {routine?.exercises?.map((exercise, idx) => (
                <div 
                  key={idx} 
                  className="bg-[#09090b] rounded-lg p-3 flex items-center gap-4"
                >
                  {exercise.image_url && (
                    <img 
                      src={exercise.image_url} 
                      alt={exercise.name}
                      className="w-16 h-16 rounded object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium">{exercise.name}</h4>
                    <p className="text-gray-500 text-xs">{exercise.description}</p>
                    <p className={`${textColor} text-sm mt-1`}>
                      <Clock className="w-3 h-3 inline mr-1" />
                      {exercise.duration}
                    </p>
                  </div>
                  {exercise.video_url && (
                    <Button
                      size="sm"
                      onClick={() => setActiveVideo(exercise.video_url)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#09090b] noise-bg">
      <Navigation />
      
      {/* Session Tracking Bar */}
      {(sessionActive || warmupActive || stretchingActive) && (
        <div className={`fixed top-16 left-0 right-0 z-40 shadow-lg ${
          warmupActive ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500' :
          stretchingActive ? 'bg-gradient-to-r from-purple-500 via-purple-600 to-purple-500' :
          'bg-gradient-to-r from-[#EF4444] via-[#DC2626] to-[#EF4444]'
        }`} data-testid="session-bar">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  {warmupActive && <Flame className="w-6 h-6" />}
                  {stretchingActive && <Sparkles className="w-6 h-6" />}
                  {sessionActive && !warmupActive && !stretchingActive && <Timer className="w-6 h-6 animate-pulse" />}
                  <span className="font-bold text-2xl font-mono" data-testid="elapsed-time">
                    {warmupActive ? formatTime(warmupElapsed) : 
                     stretchingActive ? formatTime(stretchingElapsed) : 
                     formatTime(elapsedTime)}
                  </span>
                </div>
                <span className="text-white/80 text-sm">
                  {warmupActive ? (isFr ? 'Échauffement' : 'Warm-Up') :
                   stretchingActive ? (isFr ? 'Étirements' : 'Stretching') :
                   (isFr ? 'Séance en cours' : 'Workout in progress')}
                </span>
                {isPaused && (
                  <div className="flex items-center gap-2 bg-yellow-500/30 px-3 py-1 rounded-full">
                    <PauseCircle className="w-5 h-5 text-yellow-300" />
                    <span className="font-mono font-bold text-yellow-300" data-testid="pause-time">
                      {formatTime(pauseElapsedTime)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {sessionActive && !warmupActive && !stretchingActive && (
                  <>
                    {!isPaused ? (
                      <Button onClick={startPause} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold" data-testid="pause-btn">
                        <PauseCircle className="w-5 h-5 mr-2" />
                        PAUSE
                      </Button>
                    ) : (
                      <Button onClick={endPause} className="bg-green-500 hover:bg-green-600 text-white font-bold animate-pulse" data-testid="resume-btn">
                        <PlayCircle className="w-5 h-5 mr-2" />
                        {isFr ? 'REPRENDRE' : 'RESUME'}
                      </Button>
                    )}
                    <Button onClick={() => endSession(true)} className="bg-white text-[#EF4444] hover:bg-gray-100 font-bold" data-testid="end-session-btn">
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      {isFr ? 'TERMINER' : 'FINISH'}
                    </Button>
                  </>
                )}
                {warmupActive && (
                  <Button onClick={() => endWarmup(true)} className="bg-white text-orange-500 hover:bg-gray-100 font-bold">
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    {isFr ? 'TERMINER ÉCHAUFFEMENT' : 'FINISH WARM-UP'}
                  </Button>
                )}
                {stretchingActive && (
                  <Button onClick={() => endStretching(true)} className="bg-white text-purple-500 hover:bg-gray-100 font-bold">
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    {isFr ? 'TERMINER ÉTIREMENTS' : 'FINISH STRETCHING'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className={`py-12 px-4 sm:px-6 lg:px-8 ${(sessionActive || warmupActive || stretchingActive) ? 'pt-28' : ''}`}>
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

          {/* Workout Image and Info */}
          <div 
            className="h-96 rounded-md mb-8 bg-cover bg-center relative overflow-hidden"
            style={{ backgroundImage: `url(${workout.image_url})` }}
          >
            {!sessionActive && !warmupActive && user && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-4">
                <Button
                  onClick={() => {
                    setExercisePlayerType('warmup');
                    setShowExercisePlayer(true);
                  }}
                  variant="outline"
                  className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-6 py-5 text-lg font-bold rounded-sm"
                  data-testid="warmup-video-mode-btn"
                >
                  <MonitorPlay className="w-6 h-6 mr-2" />
                  {isFr ? 'MODE VIDÉO' : 'VIDEO MODE'}
                </Button>
                <Button
                  onClick={startWarmup}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-xl font-bold rounded-sm hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] transition-all hover:scale-105"
                  data-testid="start-warmup-btn"
                >
                  <Flame className="w-8 h-8 mr-3" />
                  {isFr ? 'COMMENCER L\'ÉCHAUFFEMENT' : 'START WARM-UP'}
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
              {user && (
                <>
                  <OfflineManager workout={workout} />
                  <Button
                    onClick={() => navigate('/my-progress')}
                    variant="outline"
                    className="border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444] hover:text-white"
                    data-testid="my-progress-btn"
                  >
                    <TrendingUp className="w-5 h-5 mr-2" />
                    {isFr ? 'Mon Évolution' : 'My Progress'}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* WARM-UP SECTION */}
          <RoutineSection
            routine={warmupRoutine}
            type="warmup"
            isExpanded={warmupExpanded}
            setExpanded={setWarmupExpanded}
            isActive={warmupActive}
            elapsed={warmupElapsed}
            onStart={startWarmup}
            onEnd={endWarmup}
            isCompleted={warmupCompleted}
          />

          {/* MAIN WORKOUT SECTION */}
          <div className={`bg-[#121212] border ${sessionActive ? 'border-[#EF4444]' : 'border-[#27272a]'} rounded-lg p-6 mb-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 
                className="text-3xl font-bold flex items-center gap-3"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                <Dumbbell className="w-8 h-8 text-[#EF4444]" />
                {isFr ? 'SÉANCE PRINCIPALE' : 'MAIN WORKOUT'}
              </h2>
              {user && !sessionActive && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setExercisePlayerType('workout');
                      setShowExercisePlayer(true);
                    }}
                    variant="outline"
                    className="border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444] hover:text-white"
                    data-testid="video-mode-btn"
                  >
                    <MonitorPlay className="w-5 h-5 mr-2" />
                    {isFr ? 'MODE VIDÉO' : 'VIDEO MODE'}
                  </Button>
                  <Button
                    onClick={startSession}
                    className="bg-[#EF4444] hover:bg-[#DC2626]"
                    data-testid="start-session-btn"
                  >
                    <PlayCircle className="w-5 h-5 mr-2" />
                    {isFr ? 'DÉMARRER' : 'START'}
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {workout.exercises.map((exercise, index) => (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <div className="flex items-center justify-center py-2" data-testid={`rest-separator-${index}`}>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#EAB308] to-transparent"></div>
                      <div className="mx-4 flex items-center gap-2 bg-[#EAB308]/10 border border-[#EAB308]/30 px-4 py-2 rounded-full">
                        <Clock className="w-4 h-4 text-[#EAB308]" />
                        <span className="text-[#EAB308] font-bold text-sm">
                          {isFr ? 'REPOS' : 'REST'}: {workout.exercises[index - 1]?.rest || '60s'}
                        </span>
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#EAB308] to-transparent"></div>
                    </div>
                  )}
                  <div className="bg-[#09090b] rounded-lg overflow-hidden flex flex-col lg:flex-row">
                    {exercise.image_url && (
                      <div className="lg:w-64 h-48 lg:h-auto flex-shrink-0 relative group">
                        <img src={exercise.image_url} alt={exercise.name} className="w-full h-full object-cover" />
                        {exercise.video_url && (
                          <button
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
                    <div className="flex-1 p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`text-3xl font-bold ${sessionActive ? 'text-[#EF4444]' : 'text-gray-600'}`}>{index + 1}</span>
                        <h3 className="text-2xl font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                          {exercise.name}
                        </h3>
                      </div>
                      {exercise.description && <p className="text-gray-400 text-sm mb-4">{exercise.description}</p>}
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="bg-[#121212] p-3 rounded-sm">
                          <span className="text-gray-400 block text-xs mb-1">{t('workout.sets')}</span>
                          <span className="font-bold text-lg">{exercise.sets}</span>
                        </div>
                        <div className="bg-[#121212] p-3 rounded-sm">
                          <span className="text-gray-400 block text-xs mb-1">{t('workout.reps')}</span>
                          <span className="font-bold text-lg">{exercise.reps}</span>
                        </div>
                        <div className="bg-[#121212] p-3 rounded-sm border-2 border-[#EAB308]">
                          <span className="text-[#EAB308] block text-xs mb-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {t('workout.rest')}
                          </span>
                          <span className="font-bold text-lg text-[#EAB308]">{exercise.rest}</span>
                        </div>
                      </div>
                      {exercise.video_url && (
                        <Button
                          onClick={() => setActiveVideo(exercise.video_url)}
                          className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-sm"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {isFr ? 'Voir la vidéo' : 'Watch Video'}
                        </Button>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* STRETCHING SECTION */}
          <RoutineSection
            routine={stretchingRoutine}
            type="stretching"
            isExpanded={stretchingExpanded}
            setExpanded={setStretchingExpanded}
            isActive={stretchingActive}
            elapsed={stretchingElapsed}
            onStart={startStretching}
            onEnd={endStretching}
            isCompleted={stretchingCompleted}
          />

          {/* Video Modal - Enhanced for real-time workout viewing */}
          {activeVideo && (
            <div 
              className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
              onClick={() => setActiveVideo(null)}
            >
              <div 
                className="relative w-full max-w-5xl bg-[#121212] rounded-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 bg-[#09090b] border-b border-[#27272a]">
                  <div className="flex items-center gap-3">
                    <Play className="w-5 h-5 text-[#EF4444]" />
                    <span className="font-bold">{isFr ? 'Vidéo Explicative' : 'Exercise Video'}</span>
                  </div>
                  <button
                    onClick={() => setActiveVideo(null)}
                    className="w-10 h-10 bg-white/10 hover:bg-red-500/20 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="aspect-video bg-black">
                  {/* Support for YouTube, Vimeo, and direct video URLs */}
                  {activeVideo.includes('youtube.com') || activeVideo.includes('youtu.be') ? (
                    <iframe
                      src={activeVideo.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/') + (activeVideo.includes('?') ? '&' : '?') + 'autoplay=1'}
                      title="Exercise Video"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : activeVideo.includes('vimeo.com') ? (
                    <iframe
                      src={activeVideo.replace('vimeo.com/', 'player.vimeo.com/video/') + '?autoplay=1'}
                      title="Exercise Video"
                      className="w-full h-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={activeVideo}
                      className="w-full h-full"
                      controls
                      autoPlay
                      loop
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
                <div className="p-4 bg-[#09090b] border-t border-[#27272a]">
                  <p className="text-gray-400 text-sm text-center">
                    {isFr 
                      ? '💡 Astuce : Regardez la vidéo et faites l\'exercice en même temps pour une forme parfaite !'
                      : '💡 Tip: Watch the video and do the exercise at the same time for perfect form!'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Real-time Exercise Player */}
          {showExercisePlayer && (
            <ExercisePlayer
              exercises={
                exercisePlayerType === 'workout' 
                  ? workout?.exercises || []
                  : exercisePlayerType === 'warmup'
                    ? warmupRoutine?.exercises || []
                    : stretchingRoutine?.exercises || []
              }
              onComplete={() => {
                setShowExercisePlayer(false);
                toast.success(isFr ? '🎉 Séance terminée ! Bravo !' : '🎉 Workout complete! Great job!');
              }}
              onClose={() => setShowExercisePlayer(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutDetailPage;
