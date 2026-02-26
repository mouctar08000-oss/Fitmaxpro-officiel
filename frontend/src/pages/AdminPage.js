import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navigation from '../components/Navigation';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { 
  Settings, 
  Dumbbell, 
  Pill, 
  Users, 
  Save, 
  ChevronDown, 
  ChevronUp,
  Image,
  Video,
  Edit,
  Check,
  X,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('workouts');
  const [stats, setStats] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [supplements, setSupplements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedWorkout, setExpandedWorkout] = useState(null);
  const [expandedSupplement, setExpandedSupplement] = useState(null);
  const [editingExercise, setEditingExercise] = useState(null);
  const [editingNutrient, setEditingNutrient] = useState(null);
  const [editingMeal, setEditingMeal] = useState(null);
  const [saving, setSaving] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('session_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/admin/stats`, {
        withCredentials: true,
        headers: getAuthHeaders()
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchWorkouts = async () => {
    try {
      const response = await axios.get(`${API}/admin/workouts`, {
        withCredentials: true,
        headers: getAuthHeaders()
      });
      setWorkouts(response.data);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      toast.error('Erreur lors du chargement des séances');
    }
  };

  const fetchSupplements = async () => {
    try {
      const response = await axios.get(`${API}/admin/supplements`, {
        withCredentials: true,
        headers: getAuthHeaders()
      });
      setSupplements(response.data);
    } catch (error) {
      console.error('Error fetching supplements:', error);
      toast.error('Erreur lors du chargement des suppléments');
    }
  };

  useEffect(() => {
    if (!user || user.subscription_tier !== 'vip') {
      navigate('/dashboard');
      return;
    }
    
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchWorkouts(), fetchSupplements()]);
      setLoading(false);
    };
    loadData();
  }, [user, navigate]);

  const updateExercise = async (workoutId, exerciseIndex, exerciseData, language) => {
    setSaving(true);
    try {
      await axios.put(
        `${API}/admin/workouts/${workoutId}/exercise/${exerciseIndex}?language=${language}`,
        exerciseData,
        { withCredentials: true, headers: getAuthHeaders() }
      );
      toast.success('Exercice mis à jour !');
      setEditingExercise(null);
      await fetchWorkouts();
    } catch (error) {
      console.error('Error updating exercise:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const updateNutrient = async (supplementId, nutrientIndex, nutrientData) => {
    setSaving(true);
    try {
      await axios.put(
        `${API}/admin/supplements/${supplementId}/nutrient/${nutrientIndex}`,
        nutrientData,
        { withCredentials: true, headers: getAuthHeaders() }
      );
      toast.success('Nutriment mis à jour !');
      setEditingNutrient(null);
      await fetchSupplements();
    } catch (error) {
      console.error('Error updating nutrient:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const updateMeal = async (supplementId, mealIndex, mealData) => {
    setSaving(true);
    try {
      await axios.put(
        `${API}/admin/supplements/${supplementId}/meal/${mealIndex}`,
        mealData,
        { withCredentials: true, headers: getAuthHeaders() }
      );
      toast.success('Repas mis à jour !');
      setEditingMeal(null);
      await fetchSupplements();
    } catch (error) {
      console.error('Error updating meal:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

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
      
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-[#EF4444]" />
              <h1 
                className="text-4xl font-bold"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                Administration
              </h1>
            </div>
            <Button
              onClick={() => {
                fetchWorkouts();
                fetchSupplements();
                fetchStats();
                toast.success('Données rafraîchies');
              }}
              className="bg-[#27272a] hover:bg-[#3f3f46]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Rafraîchir
            </Button>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-[#121212] border border-[#27272a] p-4 rounded-md">
                <Users className="w-6 h-6 text-blue-500 mb-2" />
                <p className="text-2xl font-bold">{stats.total_users}</p>
                <p className="text-sm text-gray-400">Utilisateurs</p>
              </div>
              <div className="bg-[#121212] border border-[#27272a] p-4 rounded-md">
                <Dumbbell className="w-6 h-6 text-red-500 mb-2" />
                <p className="text-2xl font-bold">{stats.total_workouts}</p>
                <p className="text-sm text-gray-400">Séances</p>
              </div>
              <div className="bg-[#121212] border border-[#27272a] p-4 rounded-md">
                <Pill className="w-6 h-6 text-green-500 mb-2" />
                <p className="text-2xl font-bold">{stats.total_supplements}</p>
                <p className="text-sm text-gray-400">Suppléments</p>
              </div>
              <div className="bg-[#121212] border border-[#27272a] p-4 rounded-md">
                <span className="text-2xl mb-2">👑</span>
                <p className="text-2xl font-bold">{stats.vip_users}</p>
                <p className="text-sm text-gray-400">VIP</p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <Button
              onClick={() => setActiveTab('workouts')}
              className={activeTab === 'workouts' 
                ? 'bg-[#EF4444] hover:bg-[#DC2626]' 
                : 'bg-[#27272a] hover:bg-[#3f3f46]'
              }
            >
              <Dumbbell className="w-4 h-4 mr-2" />
              Séances ({workouts.length})
            </Button>
            <Button
              onClick={() => setActiveTab('supplements')}
              className={activeTab === 'supplements' 
                ? 'bg-[#10B981] hover:bg-[#059669]' 
                : 'bg-[#27272a] hover:bg-[#3f3f46]'
              }
            >
              <Pill className="w-4 h-4 mr-2" />
              Suppléments ({supplements.length})
            </Button>
          </div>

          {/* Workouts Tab */}
          {activeTab === 'workouts' && (
            <div className="space-y-4">
              <p className="text-gray-400 mb-4">
                Cliquez sur une séance pour modifier les images et vidéos des exercices.
              </p>
              
              {workouts.map((workout) => (
                <div 
                  key={`${workout.workout_id}-${workout.language}`}
                  className="bg-[#121212] border border-[#27272a] rounded-md overflow-hidden"
                >
                  {/* Workout Header */}
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#1a1a1a]"
                    onClick={() => setExpandedWorkout(
                      expandedWorkout === `${workout.workout_id}-${workout.language}` 
                        ? null 
                        : `${workout.workout_id}-${workout.language}`
                    )}
                  >
                    <div className="flex items-center gap-4">
                      {workout.image_url && (
                        <img 
                          src={workout.image_url} 
                          alt={workout.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div>
                        <h3 className="font-bold text-lg">{workout.title}</h3>
                        <p className="text-sm text-gray-400">
                          {workout.level} • {workout.program_type} • {workout.language.toUpperCase()} • {workout.exercises?.length || 0} exercices
                        </p>
                      </div>
                    </div>
                    {expandedWorkout === `${workout.workout_id}-${workout.language}` 
                      ? <ChevronUp className="w-5 h-5" /> 
                      : <ChevronDown className="w-5 h-5" />
                    }
                  </div>

                  {/* Exercises List */}
                  {expandedWorkout === `${workout.workout_id}-${workout.language}` && (
                    <div className="border-t border-[#27272a] p-4 space-y-4">
                      {workout.exercises?.map((exercise, index) => (
                        <div 
                          key={index}
                          className="bg-[#09090b] border border-[#27272a] p-4 rounded-md"
                        >
                          {editingExercise === `${workout.workout_id}-${workout.language}-${index}` ? (
                            // Edit Mode
                            <ExerciseEditForm
                              exercise={exercise}
                              onSave={(data) => updateExercise(workout.workout_id, index, data, workout.language)}
                              onCancel={() => setEditingExercise(null)}
                              saving={saving}
                            />
                          ) : (
                            // View Mode
                            <div className="flex items-start gap-4">
                              {exercise.image_url && (
                                <img 
                                  src={exercise.image_url} 
                                  alt={exercise.name}
                                  className="w-24 h-24 object-cover rounded"
                                />
                              )}
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-bold">{index + 1}. {exercise.name}</h4>
                                  <Button
                                    size="sm"
                                    onClick={() => setEditingExercise(`${workout.workout_id}-${workout.language}-${index}`)}
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    <Edit className="w-4 h-4 mr-1" />
                                    Modifier
                                  </Button>
                                </div>
                                <p className="text-sm text-gray-400 mt-1">
                                  {exercise.sets} séries • {exercise.reps} reps • {exercise.rest} repos
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-xs">
                                  <span className="flex items-center gap-1 text-gray-500">
                                    <Image className="w-3 h-3" />
                                    {exercise.image_url ? 'Image ✓' : 'Pas d\'image'}
                                  </span>
                                  <span className="flex items-center gap-1 text-gray-500">
                                    <Video className="w-3 h-3" />
                                    {exercise.video_url ? 'Vidéo ✓' : 'Pas de vidéo'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Supplements Tab */}
          {activeTab === 'supplements' && (
            <div className="space-y-4">
              <p className="text-gray-400 mb-4">
                Cliquez sur un supplément pour modifier les images et vidéos des nutriments et repas.
              </p>
              
              {supplements.map((supplement) => (
                <div 
                  key={supplement.supplement_id}
                  className="bg-[#121212] border border-[#27272a] rounded-md overflow-hidden"
                >
                  {/* Supplement Header */}
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#1a1a1a]"
                    onClick={() => setExpandedSupplement(
                      expandedSupplement === supplement.supplement_id 
                        ? null 
                        : supplement.supplement_id
                    )}
                  >
                    <div className="flex items-center gap-4">
                      {supplement.image_url && (
                        <img 
                          src={supplement.image_url} 
                          alt={supplement.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div>
                        <h3 className="font-bold text-lg">{supplement.title}</h3>
                        <p className="text-sm text-gray-400">
                          {supplement.program_type} • {supplement.language.toUpperCase()} • {supplement.nutrients?.length || 0} nutriments • {supplement.meals?.length || 0} repas
                        </p>
                      </div>
                    </div>
                    {expandedSupplement === supplement.supplement_id 
                      ? <ChevronUp className="w-5 h-5" /> 
                      : <ChevronDown className="w-5 h-5" />
                    }
                  </div>

                  {/* Nutrients & Meals */}
                  {expandedSupplement === supplement.supplement_id && (
                    <div className="border-t border-[#27272a] p-4">
                      {/* Nutrients */}
                      <h4 className="font-bold mb-3 flex items-center gap-2">
                        <Pill className="w-4 h-4 text-green-500" />
                        Nutriments
                      </h4>
                      <div className="space-y-3 mb-6">
                        {supplement.nutrients?.map((nutrient, index) => (
                          <div 
                            key={index}
                            className="bg-[#09090b] border border-[#27272a] p-4 rounded-md"
                          >
                            {editingNutrient === `${supplement.supplement_id}-${index}` ? (
                              <NutrientEditForm
                                nutrient={nutrient}
                                onSave={(data) => updateNutrient(supplement.supplement_id, index, data)}
                                onCancel={() => setEditingNutrient(null)}
                                saving={saving}
                              />
                            ) : (
                              <div className="flex items-start gap-4">
                                {nutrient.image_url && (
                                  <img 
                                    src={nutrient.image_url} 
                                    alt={nutrient.name}
                                    className="w-20 h-20 object-cover rounded"
                                  />
                                )}
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <h5 className="font-bold">{nutrient.name}</h5>
                                    <Button
                                      size="sm"
                                      onClick={() => setEditingNutrient(`${supplement.supplement_id}-${index}`)}
                                      className="bg-blue-600 hover:bg-blue-700"
                                    >
                                      <Edit className="w-4 h-4 mr-1" />
                                      Modifier
                                    </Button>
                                  </div>
                                  <p className="text-sm text-gray-400">{nutrient.dosage} • {nutrient.timing}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Meals */}
                      {supplement.meals && supplement.meals.length > 0 && (
                        <>
                          <h4 className="font-bold mb-3 flex items-center gap-2">
                            <span>🍽️</span>
                            Repas
                          </h4>
                          <div className="space-y-3">
                            {supplement.meals.map((meal, index) => (
                              <div 
                                key={index}
                                className="bg-[#09090b] border border-[#27272a] p-4 rounded-md"
                              >
                                {editingMeal === `${supplement.supplement_id}-${index}` ? (
                                  <MealEditForm
                                    meal={meal}
                                    onSave={(data) => updateMeal(supplement.supplement_id, index, data)}
                                    onCancel={() => setEditingMeal(null)}
                                    saving={saving}
                                  />
                                ) : (
                                  <div className="flex items-start gap-4">
                                    {meal.image_url && (
                                      <img 
                                        src={meal.image_url} 
                                        alt={meal.name}
                                        className="w-24 h-24 object-cover rounded"
                                      />
                                    )}
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <h5 className="font-bold">{meal.name}</h5>
                                        <Button
                                          size="sm"
                                          onClick={() => setEditingMeal(`${supplement.supplement_id}-${index}`)}
                                          className="bg-blue-600 hover:bg-blue-700"
                                        >
                                          <Edit className="w-4 h-4 mr-1" />
                                          Modifier
                                        </Button>
                                      </div>
                                      <p className="text-sm text-gray-400">{meal.description}</p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {meal.calories} Cal • {meal.proteins}g prot • {meal.carbs}g carb • {meal.fats}g fat
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Composant formulaire d'édition d'exercice
const ExerciseEditForm = ({ exercise, onSave, onCancel, saving }) => {
  const [formData, setFormData] = useState({
    name: exercise.name || '',
    sets: exercise.sets || 3,
    reps: exercise.reps || '10',
    rest: exercise.rest || '60s',
    description: exercise.description || '',
    image_url: exercise.image_url || '',
    video_url: exercise.video_url || ''
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Nom de l'exercice</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="bg-[#121212] border-[#27272a]"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Description</label>
          <Input
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="bg-[#121212] border-[#27272a]"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Séries</label>
          <Input
            type="number"
            value={formData.sets}
            onChange={(e) => setFormData({...formData, sets: parseInt(e.target.value)})}
            className="bg-[#121212] border-[#27272a]"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Répétitions</label>
          <Input
            value={formData.reps}
            onChange={(e) => setFormData({...formData, reps: e.target.value})}
            className="bg-[#121212] border-[#27272a]"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Repos</label>
          <Input
            value={formData.rest}
            onChange={(e) => setFormData({...formData, rest: e.target.value})}
            className="bg-[#121212] border-[#27272a]"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1 flex items-center gap-2">
          <Image className="w-4 h-4" />
          URL de l'image
        </label>
        <Input
          value={formData.image_url}
          onChange={(e) => setFormData({...formData, image_url: e.target.value})}
          placeholder="https://images.pexels.com/..."
          className="bg-[#121212] border-[#27272a]"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1 flex items-center gap-2">
          <Video className="w-4 h-4" />
          URL de la vidéo YouTube (format embed)
        </label>
        <Input
          value={formData.video_url}
          onChange={(e) => setFormData({...formData, video_url: e.target.value})}
          placeholder="https://www.youtube.com/embed/VIDEO_ID"
          className="bg-[#121212] border-[#27272a]"
        />
      </div>

      {formData.image_url && (
        <div>
          <p className="text-sm text-gray-400 mb-2">Aperçu de l'image :</p>
          <img src={formData.image_url} alt="Preview" className="w-32 h-32 object-cover rounded" />
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <Button onClick={onCancel} variant="outline" className="border-gray-600">
          <X className="w-4 h-4 mr-1" />
          Annuler
        </Button>
        <Button 
          onClick={() => onSave(formData)} 
          disabled={saving}
          className="bg-green-600 hover:bg-green-700"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
          ) : (
            <Check className="w-4 h-4 mr-1" />
          )}
          Enregistrer
        </Button>
      </div>
    </div>
  );
};

// Composant formulaire d'édition de nutriment
const NutrientEditForm = ({ nutrient, onSave, onCancel, saving }) => {
  const [formData, setFormData] = useState({
    name: nutrient.name || '',
    dosage: nutrient.dosage || '',
    timing: nutrient.timing || '',
    description: nutrient.description || '',
    image_url: nutrient.image_url || '',
    video_url: nutrient.video_url || ''
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Nom</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="bg-[#121212] border-[#27272a]"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Dosage</label>
          <Input
            value={formData.dosage}
            onChange={(e) => setFormData({...formData, dosage: e.target.value})}
            className="bg-[#121212] border-[#27272a]"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm text-gray-400 mb-1">Moment de prise</label>
        <Input
          value={formData.timing}
          onChange={(e) => setFormData({...formData, timing: e.target.value})}
          className="bg-[#121212] border-[#27272a]"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Description</label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="bg-[#121212] border-[#27272a]"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1 flex items-center gap-2">
          <Image className="w-4 h-4" />
          URL de l'image
        </label>
        <Input
          value={formData.image_url}
          onChange={(e) => setFormData({...formData, image_url: e.target.value})}
          className="bg-[#121212] border-[#27272a]"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1 flex items-center gap-2">
          <Video className="w-4 h-4" />
          URL de la vidéo YouTube
        </label>
        <Input
          value={formData.video_url}
          onChange={(e) => setFormData({...formData, video_url: e.target.value})}
          className="bg-[#121212] border-[#27272a]"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button onClick={onCancel} variant="outline" className="border-gray-600">
          <X className="w-4 h-4 mr-1" />
          Annuler
        </Button>
        <Button 
          onClick={() => onSave(formData)} 
          disabled={saving}
          className="bg-green-600 hover:bg-green-700"
        >
          {saving ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
          Enregistrer
        </Button>
      </div>
    </div>
  );
};

// Composant formulaire d'édition de repas
const MealEditForm = ({ meal, onSave, onCancel, saving }) => {
  const [formData, setFormData] = useState({
    name: meal.name || '',
    description: meal.description || '',
    calories: meal.calories || 0,
    proteins: meal.proteins || 0,
    carbs: meal.carbs || 0,
    fats: meal.fats || 0,
    image_url: meal.image_url || '',
    video_url: meal.video_url || ''
  });

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1">Nom du repas</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="bg-[#121212] border-[#27272a]"
        />
      </div>
      
      <div>
        <label className="block text-sm text-gray-400 mb-1">Description</label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="bg-[#121212] border-[#27272a]"
        />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Calories</label>
          <Input
            type="number"
            value={formData.calories}
            onChange={(e) => setFormData({...formData, calories: parseInt(e.target.value)})}
            className="bg-[#121212] border-[#27272a]"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Protéines (g)</label>
          <Input
            type="number"
            value={formData.proteins}
            onChange={(e) => setFormData({...formData, proteins: parseInt(e.target.value)})}
            className="bg-[#121212] border-[#27272a]"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Glucides (g)</label>
          <Input
            type="number"
            value={formData.carbs}
            onChange={(e) => setFormData({...formData, carbs: parseInt(e.target.value)})}
            className="bg-[#121212] border-[#27272a]"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Lipides (g)</label>
          <Input
            type="number"
            value={formData.fats}
            onChange={(e) => setFormData({...formData, fats: parseInt(e.target.value)})}
            className="bg-[#121212] border-[#27272a]"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1 flex items-center gap-2">
          <Image className="w-4 h-4" />
          URL de l'image
        </label>
        <Input
          value={formData.image_url}
          onChange={(e) => setFormData({...formData, image_url: e.target.value})}
          className="bg-[#121212] border-[#27272a]"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1 flex items-center gap-2">
          <Video className="w-4 h-4" />
          URL de la vidéo YouTube
        </label>
        <Input
          value={formData.video_url}
          onChange={(e) => setFormData({...formData, video_url: e.target.value})}
          className="bg-[#121212] border-[#27272a]"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button onClick={onCancel} variant="outline" className="border-gray-600">
          <X className="w-4 h-4 mr-1" />
          Annuler
        </Button>
        <Button 
          onClick={() => onSave(formData)} 
          disabled={saving}
          className="bg-green-600 hover:bg-green-700"
        >
          {saving ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
          Enregistrer
        </Button>
      </div>
    </div>
  );
};

export default AdminPage;
