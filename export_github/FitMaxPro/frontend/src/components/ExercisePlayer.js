import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button.jsx';
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  Volume2, 
  VolumeX,
  Maximize,
  Minimize,
  Timer,
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ExercisePlayer = ({ exercises, onComplete, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [completedExercises, setCompletedExercises] = useState([]);
  const containerRef = useRef(null);
  const timerRef = useRef(null);

  const currentExercise = exercises[currentIndex];
  const totalSets = parseInt(currentExercise?.sets) || 3;
  const restTime = parseInt(currentExercise?.rest?.replace(/[^0-9]/g, '')) || 30;

  // Parse reps/duration
  const getRepsOrDuration = () => {
    const reps = currentExercise?.reps || '10';
    if (reps.toString().includes('sec')) {
      return { type: 'timed', value: parseInt(reps) };
    }
    return { type: 'reps', value: parseInt(reps) };
  };

  const repsInfo = getRepsOrDuration();

  // Timer effect
  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            if (isResting) {
              // Rest finished, start next set or exercise
              setIsResting(false);
              if (currentSet < totalSets) {
                setCurrentSet(prev => prev + 1);
                if (repsInfo.type === 'timed') {
                  setTimeLeft(repsInfo.value);
                }
              } else {
                // Exercise complete
                handleNextExercise();
              }
            } else if (repsInfo.type === 'timed') {
              // Timed exercise finished, start rest
              if (currentSet < totalSets) {
                setIsResting(true);
                setTimeLeft(restTime);
              } else {
                handleNextExercise();
              }
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, timeLeft, isResting, currentSet, totalSets, repsInfo, restTime]);

  // Start exercise
  const handleStart = () => {
    setIsPlaying(true);
    if (repsInfo.type === 'timed') {
      setTimeLeft(repsInfo.value);
    }
  };

  // Complete current set manually (for rep-based exercises)
  const handleCompleteSet = () => {
    if (currentSet < totalSets) {
      setIsResting(true);
      setTimeLeft(restTime);
      setCurrentSet(prev => prev + 1);
    } else {
      handleNextExercise();
    }
  };

  // Next exercise
  const handleNextExercise = () => {
    setCompletedExercises(prev => [...prev, currentIndex]);
    
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentSet(1);
      setIsResting(false);
      setTimeLeft(0);
      setIsPlaying(false);
    } else {
      // All exercises complete
      onComplete?.();
    }
  };

  // Previous exercise
  const handlePrevExercise = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setCurrentSet(1);
      setIsResting(false);
      setTimeLeft(0);
      setIsPlaying(false);
    }
  };

  // Skip to specific exercise
  const handleSkipTo = (index) => {
    setCurrentIndex(index);
    setCurrentSet(1);
    setIsResting(false);
    setTimeLeft(0);
    setIsPlaying(false);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get video URL
  const getVideoUrl = () => {
    const url = currentExercise?.video_url || '';
    if (!url) return null;
    
    // Handle uploaded videos
    if (url.startsWith('/api/videos/')) {
      return `${BACKEND_URL}${url.replace('/api', '')}`;
    }
    
    // Handle YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const embedUrl = url
        .replace('watch?v=', 'embed/')
        .replace('youtu.be/', 'youtube.com/embed/');
      return embedUrl + (embedUrl.includes('?') ? '&' : '?') + 'autoplay=1&loop=1&mute=' + (isMuted ? '1' : '0');
    }
    
    return url;
  };

  const videoUrl = getVideoUrl();

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 bg-[#09090b] z-50 flex flex-col ${isFullscreen ? '' : ''}`}
    >
      {/* Header */}
      <div className="bg-[#121212] border-b border-[#27272a] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Retour
          </Button>
          <div>
            <h2 className="font-bold text-lg">{currentExercise?.name}</h2>
            <p className="text-gray-400 text-sm">
              Exercice {currentIndex + 1}/{exercises.length} • Set {currentSet}/{totalSets}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Video Section */}
        <div className="flex-1 bg-black flex items-center justify-center relative">
          {videoUrl ? (
            videoUrl.includes('youtube.com') ? (
              <iframe
                src={videoUrl}
                title={currentExercise?.name}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={videoUrl}
                className="w-full h-full object-contain"
                autoPlay
                loop
                muted={isMuted}
                controls={false}
              />
            )
          ) : (
            <div className="text-center text-gray-400">
              <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Pas de vidéo disponible</p>
              <p className="text-sm">Suivez les instructions ci-dessous</p>
            </div>
          )}

          {/* Timer Overlay */}
          {isPlaying && (repsInfo.type === 'timed' || isResting) && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-lg px-6 py-3">
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-1">
                  {isResting ? '😤 REPOS' : '💪 EN COURS'}
                </p>
                <p className="text-4xl font-bold font-mono text-white">
                  {formatTime(timeLeft)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div className="w-full lg:w-96 bg-[#121212] border-l border-[#27272a] flex flex-col">
          {/* Exercise Info */}
          <div className="p-4 border-b border-[#27272a]">
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              <div className="bg-[#09090b] rounded-lg p-3">
                <p className="text-gray-400 text-xs mb-1">Sets</p>
                <p className="font-bold text-xl">{currentSet}/{totalSets}</p>
              </div>
              <div className="bg-[#09090b] rounded-lg p-3">
                <p className="text-gray-400 text-xs mb-1">Reps</p>
                <p className="font-bold text-xl">{currentExercise?.reps}</p>
              </div>
              <div className="bg-[#09090b] rounded-lg p-3">
                <p className="text-gray-400 text-xs mb-1">Repos</p>
                <p className="font-bold text-xl">{restTime}s</p>
              </div>
            </div>

            <div className="bg-[#09090b] rounded-lg p-4">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Timer className="w-4 h-4 text-[#EF4444]" />
                Instructions
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {currentExercise?.description || 'Suivez la vidéo pour réaliser correctement l\'exercice.'}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="p-4 border-b border-[#27272a]">
            {!isPlaying ? (
              <Button
                onClick={handleStart}
                className="w-full bg-[#EF4444] hover:bg-[#DC2626] py-6 text-lg font-bold"
              >
                <Play className="w-6 h-6 mr-2" />
                Commencer
              </Button>
            ) : isResting ? (
              <div className="text-center">
                <p className="text-yellow-400 font-bold mb-2">⏱️ Temps de repos</p>
                <Button
                  onClick={() => {
                    setIsResting(false);
                    setTimeLeft(0);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <SkipForward className="w-5 h-5 mr-2" />
                  Passer le repos
                </Button>
              </div>
            ) : repsInfo.type === 'reps' ? (
              <Button
                onClick={handleCompleteSet}
                className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg font-bold"
              >
                <CheckCircle className="w-6 h-6 mr-2" />
                Set {currentSet} terminé !
              </Button>
            ) : (
              <div className="text-center">
                <p className="text-[#EF4444] font-bold mb-2">🔥 Tenez bon !</p>
                <Button
                  onClick={() => setIsPlaying(false)}
                  variant="outline"
                  className="w-full"
                >
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </Button>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-2 mt-4">
              <Button
                onClick={handlePrevExercise}
                disabled={currentIndex === 0}
                variant="outline"
                className="flex-1"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Précédent
              </Button>
              <Button
                onClick={handleNextExercise}
                variant="outline"
                className="flex-1"
              >
                Suivant
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Exercise List */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="font-bold text-sm text-gray-400 mb-3">TOUS LES EXERCICES</h3>
            <div className="space-y-2">
              {exercises.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSkipTo(idx)}
                  className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${
                    idx === currentIndex 
                      ? 'bg-[#EF4444]/20 border border-[#EF4444]' 
                      : completedExercises.includes(idx)
                        ? 'bg-green-500/10 border border-green-500/30'
                        : 'bg-[#09090b] border border-[#27272a] hover:border-gray-600'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    idx === currentIndex 
                      ? 'bg-[#EF4444] text-white' 
                      : completedExercises.includes(idx)
                        ? 'bg-green-500 text-white'
                        : 'bg-[#27272a] text-gray-400'
                  }`}>
                    {completedExercises.includes(idx) ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${idx === currentIndex ? 'text-white' : 'text-gray-300'}`}>
                      {ex.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {ex.sets} sets × {ex.reps}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExercisePlayer;
