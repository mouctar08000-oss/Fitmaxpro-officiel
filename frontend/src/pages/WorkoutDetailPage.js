import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navigation from '../components/Navigation';
import { Button } from '../components/ui/button.jsx';
import { ArrowLeft, Clock, Dumbbell, Play, X } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const WorkoutDetailPage = () => {
  const { workoutId } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);

  const fetchWorkout = async () => {
    setLoading(true);
    try {
      // Normalize language to just 'fr' or 'en'
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
      
      <div className="py-12 px-4 sm:px-6 lg:px-8">
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
            className="h-96 rounded-md mb-8 bg-cover bg-center"
            style={{ backgroundImage: `url(${workout.image_url})` }}
          />

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
                  {/* Séparateur de repos entre les exercices */}
                  {index > 0 && (
                    <div className="flex items-center justify-center py-4" data-testid={`rest-separator-${index}`}>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#EAB308] to-transparent"></div>
                      <div className="mx-4 flex items-center gap-2 bg-[#EAB308]/10 border border-[#EAB308]/30 px-4 py-2 rounded-full">
                        <Clock className="w-5 h-5 text-[#EAB308]" />
                        <span className="text-[#EAB308] font-bold text-sm">
                          {i18n.language?.startsWith('fr') ? 'REPOS' : 'REST'}: {workout.exercises[index - 1]?.rest || '60s'}
                        </span>
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#EAB308] to-transparent"></div>
                    </div>
                  )}
                  <div
                    data-testid={`exercise-${index}`}
                    className="bg-[#121212] border border-[#27272a] rounded-md overflow-hidden hover:border-white/20 transition-colors"
                  >
                  <div className="flex flex-col lg:flex-row">
                    {/* Image de l'exercice */}
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
                    
                    {/* Détails de l'exercice */}
                    <div className="flex-1 p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl font-bold text-gray-600">{index + 1}</span>
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
                          {i18n.language === 'fr' ? 'Voir la vidéo' : 'Watch Video'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Vidéo */}
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