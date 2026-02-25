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
      const response = await axios.get(`${API}/workouts/${workoutId}?language=${i18n.language}`);
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
            
            <div className="space-y-4">
              {workout.exercises.map((exercise, index) => (
                <div
                  key={index}
                  data-testid={`exercise-${index}`}
                  className="bg-[#121212] border border-[#27272a] p-6 rounded-md hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl font-bold text-gray-600">{index + 1}</span>
                        <h3 
                          className="text-2xl font-bold"
                          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                        >
                          {exercise.name}
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">{t('workout.sets')}: </span>
                          <span className="font-bold">{exercise.sets}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">{t('workout.reps')}: </span>
                          <span className="font-bold">{exercise.reps}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">{t('workout.rest')}: </span>
                          <span className="font-bold">{exercise.rest}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutDetailPage;