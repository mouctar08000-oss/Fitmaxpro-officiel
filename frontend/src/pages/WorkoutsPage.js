import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { Button } from '../components/ui/button.jsx';
import { Clock, Dumbbell } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const WorkoutsPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'all');

  const fetchWorkouts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      // Normalize language to just 'fr' or 'en'
      const lang = i18n.language?.startsWith('fr') ? 'fr' : 'en';
      params.append('language', lang);
      if (levelFilter !== 'all') params.append('level', levelFilter);
      if (typeFilter !== 'all') params.append('program_type', typeFilter);

      const response = await axios.get(`${API}/workouts?${params.toString()}`);
      setWorkouts(response.data);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelFilter, typeFilter, i18n.language]);

  const getLevelColor = (level) => {
    switch(level) {
      case 'beginner': return '#10B981';
      case 'amateur': return '#3B82F6';
      case 'pro': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'mass_gain': return '#EF4444';
      case 'weight_loss': return '#3B82F6';
      case 'legs_glutes': return '#EC4899';
      case 'women': return '#A855F7';
      case 'abs': return '#F97316';
      default: return '#6B7280';
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] noise-bg">
      <Navigation />
      
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 
            className="text-5xl font-bold mb-8"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            data-testid="workouts-title"
          >
            {t('workouts.title')}
          </h1>

          {/* Filters */}
          <div className="mb-8 flex flex-wrap gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">{t('workouts.filter')} - Niveau</label>
              <select
                data-testid="level-filter"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="bg-[#121212] border border-[#27272a] text-white px-4 py-2 rounded-sm focus:border-white focus:outline-none"
              >
                <option value="all">{t('workouts.all')}</option>
                <option value="beginner">{t('workouts.beginner')}</option>
                <option value="amateur">{t('workouts.amateur')}</option>
                <option value="pro">{t('workouts.pro')}</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">{t('workouts.filter')} - Programme</label>
              <select
                data-testid="type-filter"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-[#121212] border border-[#27272a] text-white px-4 py-2 rounded-sm focus:border-white focus:outline-none"
              >
                <option value="all">{t('workouts.all')}</option>
                <option value="mass_gain">{t('workouts.massGain')}</option>
                <option value="weight_loss">{t('workouts.weightLoss')}</option>
                <option value="legs_glutes">{i18n.language?.startsWith('fr') ? 'Jambes & Fessiers' : 'Legs & Glutes'}</option>
                <option value="women">{i18n.language?.startsWith('fr') ? 'Spécial Femme' : 'Women Special'}</option>
                <option value="abs">{i18n.language?.startsWith('fr') ? 'Abdominaux' : 'Abs'}</option>
              </select>
            </div>
          </div>

          {/* Workouts Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workouts.map((workout) => (
                <div
                  key={workout.workout_id}
                  data-testid={`workout-card-${workout.workout_id}`}
                  className="bg-[#121212] border border-[#27272a] rounded-md overflow-hidden hover:border-white/20 transition-colors group"
                >
                  <div 
                    className="h-48 bg-cover bg-center"
                    style={{ backgroundImage: `url(${workout.image_url})` }}
                  />
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span 
                        className="text-xs font-bold px-3 py-1 rounded-sm uppercase"
                        style={{ 
                          backgroundColor: getLevelColor(workout.level),
                          color: '#000'
                        }}
                      >
                        {t(`workouts.${workout.level}`)}
                      </span>
                      <span 
                        className="text-xs font-bold px-3 py-1 rounded-sm"
                        style={{ 
                          backgroundColor: getTypeColor(workout.program_type),
                          color: '#fff'
                        }}
                      >
                        {workout.program_type === 'mass_gain' ? t('workouts.massGain') : t('workouts.weightLoss')}
                      </span>
                    </div>
                    
                    <h3 
                      className="text-2xl font-bold mb-2"
                      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                    >
                      {workout.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{workout.description}</p>
                    
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{workout.duration} {t('workouts.duration')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Dumbbell className="w-4 h-4" />
                        <span>{workout.exercises.length} exercices</span>
                      </div>
                    </div>

                    <Button
                      data-testid={`view-workout-btn-${workout.workout_id}`}
                      onClick={() => navigate(`/workout/${workout.workout_id}`)}
                      className="w-full bg-[#FAFAFA] text-[#09090b] hover:bg-white font-bold rounded-sm hover:-translate-y-1 transition-all"
                    >
                      {t('workouts.view')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutsPage;