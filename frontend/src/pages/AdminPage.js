import React, { useState, useEffect, useCallback } from 'react';
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
  RefreshCw,
  Crown,
  Clock,
  Activity,
  TrendingUp,
  Trash2,
  Eye,
  UserCog,
  BarChart3,
  Plus,
  Copy
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminPage = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isFr = i18n.language?.startsWith('fr');
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [supplements, setSupplements] = useState([]);
  const [workoutAnalytics, setWorkoutAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedWorkout, setExpandedWorkout] = useState(null);
  const [expandedSupplement, setExpandedSupplement] = useState(null);
  const [editingExercise, setEditingExercise] = useState(null);
  const [editingNutrient, setEditingNutrient] = useState(null);
  const [editingMeal, setEditingMeal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  
  // New workout creation states
  const [showCreateWorkout, setShowCreateWorkout] = useState(false);
  const [newWorkout, setNewWorkout] = useState({
    title: '',
    description: '',
    level: 'beginner',
    program_type: 'legs_glutes',
    duration: 45,
    language: 'fr',
    image_url: '',
    exercises: []
  });
  const [newExercise, setNewExercise] = useState({
    name: '',
    description: '',
    sets: 3,
    reps: '12',
    rest: '60s',
    image_url: '',
    video_url: ''
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('session_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/admin/stats`, { headers: getAuthHeaders() });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const fetchSubscribers = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/admin/subscribers`, { headers: getAuthHeaders() });
      setSubscribers(response.data.subscribers || []);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    }
  }, []);

  const fetchWorkoutAnalytics = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/admin/workout-analytics`, { headers: getAuthHeaders() });
      setWorkoutAnalytics(response.data.workout_analytics || []);
    } catch (error) {
      console.error('Error fetching workout analytics:', error);
    }
  }, []);

  const fetchWorkouts = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/admin/workouts`, { headers: getAuthHeaders() });
      setWorkouts(response.data || []);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
  }, []);

  const fetchSupplements = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/admin/supplements`, { headers: getAuthHeaders() });
      setSupplements(response.data || []);
    } catch (error) {
      console.error('Error fetching supplements:', error);
    }
  }, []);

  const fetchUserDetails = async (userId) => {
    try {
      const response = await axios.get(`${API}/admin/subscriber/${userId}`, { headers: getAuthHeaders() });
      setSelectedUser(response.data);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error(isFr ? 'Erreur lors du chargement' : 'Error loading user');
    }
  };

  const updateSubscription = async (userId, tier, status) => {
    try {
      await axios.put(`${API}/admin/subscriber/${userId}/subscription`, {
        user_id: userId,
        subscription_tier: tier,
        subscription_status: status
      }, { headers: getAuthHeaders() });
      toast.success(isFr ? 'Abonnement mis à jour' : 'Subscription updated');
      setEditingSubscription(null);
      fetchSubscribers();
      fetchStats();
    } catch (error) {
      toast.error(isFr ? 'Erreur lors de la mise à jour' : 'Update failed');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm(isFr ? 'Voulez-vous vraiment supprimer cet utilisateur ?' : 'Are you sure you want to delete this user?')) {
      return;
    }
    try {
      await axios.delete(`${API}/admin/subscriber/${userId}`, { headers: getAuthHeaders() });
      toast.success(isFr ? 'Utilisateur supprimé' : 'User deleted');
      setSelectedUser(null);
      fetchSubscribers();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error deleting user');
    }
  };

  // Workout management functions
  const createWorkout = async () => {
    if (!newWorkout.title || !newWorkout.description) {
      toast.error(isFr ? 'Veuillez remplir le titre et la description' : 'Please fill title and description');
      return;
    }
    setSaving(true);
    try {
      await axios.post(`${API}/admin/workouts`, newWorkout, { headers: getAuthHeaders() });
      toast.success(isFr ? 'Séance créée avec succès!' : 'Workout created successfully!');
      setShowCreateWorkout(false);
      setNewWorkout({
        title: '',
        description: '',
        level: 'beginner',
        program_type: 'legs_glutes',
        duration: 45,
        language: 'fr',
        image_url: '',
        exercises: []
      });
      fetchWorkouts();
    } catch (error) {
      toast.error(isFr ? 'Erreur lors de la création' : 'Creation failed');
    }
    setSaving(false);
  };

  const deleteWorkout = async (workoutId) => {
    if (!window.confirm(isFr ? 'Voulez-vous vraiment supprimer cette séance ?' : 'Are you sure you want to delete this workout?')) {
      return;
    }
    try {
      await axios.delete(`${API}/admin/workouts/${workoutId}`, { headers: getAuthHeaders() });
      toast.success(isFr ? 'Séance supprimée' : 'Workout deleted');
      fetchWorkouts();
    } catch (error) {
      toast.error(isFr ? 'Erreur lors de la suppression' : 'Delete failed');
    }
  };

  const addExerciseToNewWorkout = () => {
    if (!newExercise.name) {
      toast.error(isFr ? 'Veuillez entrer le nom de l\'exercice' : 'Please enter exercise name');
      return;
    }
    setNewWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, { ...newExercise }]
    }));
    setNewExercise({
      name: '',
      description: '',
      sets: 3,
      reps: '12',
      rest: '60s',
      image_url: '',
      video_url: ''
    });
    toast.success(isFr ? 'Exercice ajouté' : 'Exercise added');
  };

  const removeExerciseFromNewWorkout = (index) => {
    setNewWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const addExerciseToExistingWorkout = async (workoutId) => {
    if (!newExercise.name) {
      toast.error(isFr ? 'Veuillez entrer le nom de l\'exercice' : 'Please enter exercise name');
      return;
    }
    try {
      await axios.post(`${API}/admin/workouts/${workoutId}/exercises`, newExercise, { headers: getAuthHeaders() });
      toast.success(isFr ? 'Exercice ajouté!' : 'Exercise added!');
      setNewExercise({
        name: '',
        description: '',
        sets: 3,
        reps: '12',
        rest: '60s',
        image_url: '',
        video_url: ''
      });
      fetchWorkouts();
    } catch (error) {
      toast.error(isFr ? 'Erreur' : 'Error');
    }
  };

  const deleteExerciseFromWorkout = async (workoutId, exerciseIndex) => {
    if (!window.confirm(isFr ? 'Supprimer cet exercice ?' : 'Delete this exercise?')) return;
    try {
      await axios.delete(`${API}/admin/workouts/${workoutId}/exercises/${exerciseIndex}`, { headers: getAuthHeaders() });
      toast.success(isFr ? 'Exercice supprimé' : 'Exercise deleted');
      fetchWorkouts();
    } catch (error) {
      toast.error(isFr ? 'Erreur' : 'Error');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchSubscribers(),
        fetchWorkoutAnalytics(),
        fetchWorkouts(),
        fetchSupplements()
      ]);
      setLoading(false);
    };
    loadData();
  }, [fetchStats, fetchSubscribers, fetchWorkoutAnalytics, fetchWorkouts, fetchSupplements]);

  // Check if user is admin
  useEffect(() => {
    if (user && user.subscription_tier !== 'vip' && user.email !== 'admin@fitmaxpro.com') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const saveExerciseMedia = async (workoutId, exerciseIndex, field, value) => {
    setSaving(true);
    try {
      const workout = workouts.find(w => w.workout_id === workoutId);
      const exercise = { ...workout.exercises[exerciseIndex], [field]: value };
      
      await axios.put(
        `${API}/admin/workouts/${workoutId}/exercise/${exerciseIndex}`,
        exercise,
        { headers: getAuthHeaders() }
      );
      toast.success(isFr ? 'Sauvegardé !' : 'Saved!');
      fetchWorkouts();
    } catch (error) {
      toast.error(isFr ? 'Erreur de sauvegarde' : 'Save error');
    }
    setSaving(false);
    setEditingExercise(null);
  };

  const saveMealMedia = async (supplementId, mealIndex, field, value) => {
    setSaving(true);
    try {
      const supplement = supplements.find(s => s.supplement_id === supplementId);
      const meal = { ...supplement.meals[mealIndex], [field]: value };
      
      await axios.put(
        `${API}/admin/supplements/${supplementId}/meal/${mealIndex}`,
        meal,
        { headers: getAuthHeaders() }
      );
      toast.success(isFr ? 'Sauvegardé !' : 'Saved!');
      fetchSupplements();
    } catch (error) {
      toast.error(isFr ? 'Erreur de sauvegarde' : 'Save error');
    }
    setSaving(false);
    setEditingMeal(null);
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString(isFr ? 'fr-FR' : 'en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTierBadge = (tier) => {
    const colors = {
      vip: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      standard: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      supplements: 'bg-green-500/20 text-green-400 border-green-500/30',
      none: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[tier] || colors.none;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-[#EF4444] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Navigation />
      
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              <Settings className="w-8 h-8 text-[#EF4444]" />
              {isFr ? 'PANNEAU D\'ADMINISTRATION' : 'ADMIN PANEL'}
            </h1>
            <p className="text-gray-400 mt-2">
              {isFr ? 'Gérez votre application FitMaxPro' : 'Manage your FitMaxPro application'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-[#27272a] pb-4">
            {[
              { id: 'dashboard', icon: BarChart3, label: isFr ? 'Tableau de bord' : 'Dashboard' },
              { id: 'subscribers', icon: Users, label: isFr ? 'Abonnés' : 'Subscribers' },
              { id: 'analytics', icon: TrendingUp, label: isFr ? 'Analytiques' : 'Analytics' },
              { id: 'workouts', icon: Dumbbell, label: isFr ? 'Séances' : 'Workouts' },
              { id: 'create-workout', icon: Plus, label: isFr ? 'Créer Séance' : 'Create Workout' },
              { id: 'supplements', icon: Pill, label: isFr ? 'Nutrition' : 'Nutrition' }
            ].map(tab => (
              <Button
                key={tab.id}
                data-testid={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                className={`flex items-center gap-2 ${
                  activeTab === tab.id 
                    ? 'bg-[#EF4444] text-white' 
                    : 'border-[#27272a] text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && stats && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-6 h-6 text-[#EF4444]" />
                    <span className="text-gray-400 text-sm">{isFr ? 'Total Utilisateurs' : 'Total Users'}</span>
                  </div>
                  <p className="text-3xl font-bold">{stats.total_users}</p>
                </div>
                
                <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Crown className="w-6 h-6 text-yellow-400" />
                    <span className="text-gray-400 text-sm">{isFr ? 'Abonnés VIP' : 'VIP Subscribers'}</span>
                  </div>
                  <p className="text-3xl font-bold text-yellow-400">{stats.vip_users}</p>
                </div>
                
                <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Activity className="w-6 h-6 text-blue-400" />
                    <span className="text-gray-400 text-sm">{isFr ? 'Standard' : 'Standard'}</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-400">{stats.standard_users}</p>
                </div>
                
                <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Pill className="w-6 h-6 text-green-400" />
                    <span className="text-gray-400 text-sm">{isFr ? 'Suppléments' : 'Supplements'}</span>
                  </div>
                  <p className="text-3xl font-bold text-green-400">{stats.supplements_users || 0}</p>
                </div>
              </div>

              {/* Workout Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Dumbbell className="w-6 h-6 text-[#EF4444]" />
                    <span className="text-gray-400 text-sm">{isFr ? 'Séances Lancées' : 'Sessions Started'}</span>
                  </div>
                  <p className="text-3xl font-bold">{stats.total_workout_sessions || 0}</p>
                </div>
                
                <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Check className="w-6 h-6 text-green-400" />
                    <span className="text-gray-400 text-sm">{isFr ? 'Séances Complétées' : 'Completed Sessions'}</span>
                  </div>
                  <p className="text-3xl font-bold text-green-400">{stats.completed_workout_sessions || 0}</p>
                </div>
                
                <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-6 h-6 text-purple-400" />
                    <span className="text-gray-400 text-sm">{isFr ? 'Temps Total' : 'Total Time'}</span>
                  </div>
                  <p className="text-3xl font-bold text-purple-400">
                    {formatDuration(stats.total_workout_duration_seconds || 0)}
                  </p>
                </div>
              </div>

              {/* Content Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-[#EF4444]" />
                    {isFr ? 'Programmes d\'entraînement' : 'Workout Programs'}
                  </h3>
                  <p className="text-4xl font-bold">{stats.total_workouts}</p>
                </div>
                
                <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Pill className="w-5 h-5 text-green-400" />
                    {isFr ? 'Plans Nutrition' : 'Nutrition Plans'}
                  </h3>
                  <p className="text-4xl font-bold">{stats.total_supplements}</p>
                </div>
              </div>
            </div>
          )}

          {/* Subscribers Tab */}
          {activeTab === 'subscribers' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Subscribers List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#EF4444]" />
                    {isFr ? 'Liste des Abonnés' : 'Subscribers List'} ({subscribers.length})
                  </h2>
                  <Button onClick={fetchSubscribers} variant="outline" size="sm" className="border-[#27272a]">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>

                <div className="bg-[#121212] border border-[#27272a] rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[#1a1a1a]">
                      <tr>
                        <th className="text-left p-4 text-gray-400 text-sm">{isFr ? 'Nom' : 'Name'}</th>
                        <th className="text-left p-4 text-gray-400 text-sm">Email</th>
                        <th className="text-left p-4 text-gray-400 text-sm">{isFr ? 'Abonnement' : 'Subscription'}</th>
                        <th className="text-left p-4 text-gray-400 text-sm">{isFr ? 'Séances' : 'Sessions'}</th>
                        <th className="text-left p-4 text-gray-400 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map((sub, idx) => (
                        <tr 
                          key={sub.user_id} 
                          className={`border-t border-[#27272a] hover:bg-[#1a1a1a] cursor-pointer ${
                            selectedUser?.user?.user_id === sub.user_id ? 'bg-[#1a1a1a]' : ''
                          }`}
                          onClick={() => fetchUserDetails(sub.user_id)}
                        >
                          <td className="p-4">
                            <div className="font-medium">{sub.name || '-'}</div>
                          </td>
                          <td className="p-4 text-gray-400 text-sm">{sub.email}</td>
                          <td className="p-4">
                            {editingSubscription === sub.user_id ? (
                              <select
                                className="bg-[#09090b] border border-[#27272a] rounded px-2 py-1 text-sm"
                                defaultValue={sub.subscription_tier}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  updateSubscription(sub.user_id, e.target.value, 'active');
                                }}
                              >
                                <option value="none">None</option>
                                <option value="standard">Standard</option>
                                <option value="vip">VIP</option>
                                <option value="supplements">Supplements</option>
                              </select>
                            ) : (
                              <span className={`px-2 py-1 rounded text-xs border ${getTierBadge(sub.subscription_tier)}`}>
                                {sub.subscription_tier?.toUpperCase() || 'NONE'}
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="text-gray-400">{sub.stats?.total_sessions || 0}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => fetchUserDetails(sub.user_id)}
                                className="text-gray-400 hover:text-white"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => setEditingSubscription(editingSubscription === sub.user_id ? null : sub.user_id)}
                                className="text-blue-400 hover:text-blue-300"
                              >
                                <UserCog className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => deleteUser(sub.user_id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* User Details Panel */}
              <div className="lg:col-span-1">
                {selectedUser ? (
                  <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6 sticky top-24">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-[#EF4444]" />
                      {isFr ? 'Détails Utilisateur' : 'User Details'}
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-gray-400 text-sm">{isFr ? 'Nom' : 'Name'}</p>
                        <p className="font-bold">{selectedUser.user?.name || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Email</p>
                        <p className="font-bold text-sm">{selectedUser.user?.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">{isFr ? 'Abonnement' : 'Subscription'}</p>
                        <span className={`px-3 py-1 rounded text-sm border inline-block mt-1 ${getTierBadge(selectedUser.user?.subscription_tier)}`}>
                          {selectedUser.user?.subscription_tier?.toUpperCase() || 'NONE'}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">{isFr ? 'Inscrit le' : 'Joined'}</p>
                        <p className="font-bold">{formatDate(selectedUser.user?.created_at)}</p>
                      </div>

                      <hr className="border-[#27272a]" />

                      <h4 className="font-bold text-[#EF4444]">{isFr ? 'Statistiques' : 'Statistics'}</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#09090b] p-3 rounded">
                          <p className="text-gray-400 text-xs">{isFr ? 'Séances' : 'Sessions'}</p>
                          <p className="text-xl font-bold">{selectedUser.stats?.total_sessions || 0}</p>
                        </div>
                        <div className="bg-[#09090b] p-3 rounded">
                          <p className="text-gray-400 text-xs">{isFr ? 'Complétées' : 'Completed'}</p>
                          <p className="text-xl font-bold text-green-400">{selectedUser.stats?.completed_sessions || 0}</p>
                        </div>
                        <div className="col-span-2 bg-[#09090b] p-3 rounded">
                          <p className="text-gray-400 text-xs">{isFr ? 'Temps Total' : 'Total Time'}</p>
                          <p className="text-xl font-bold text-purple-400">{selectedUser.stats?.total_duration_formatted || '0h 0m'}</p>
                        </div>
                      </div>

                      {selectedUser.workout_stats?.length > 0 && (
                        <>
                          <h4 className="font-bold text-[#EF4444] mt-4">{isFr ? 'Par Séance' : 'By Workout'}</h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {selectedUser.workout_stats.map((ws, idx) => (
                              <div key={idx} className="bg-[#09090b] p-2 rounded text-sm">
                                <p className="font-medium truncate">{ws.workout_title}</p>
                                <div className="flex justify-between text-gray-400 text-xs mt-1">
                                  <span>{ws.launches} {isFr ? 'lancements' : 'launches'}</span>
                                  <span>{ws.completed} {isFr ? 'complétées' : 'completed'}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6 text-center text-gray-400">
                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>{isFr ? 'Sélectionnez un utilisateur pour voir ses détails' : 'Select a user to view details'}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#EF4444]" />
                {isFr ? 'Analytiques des Séances' : 'Workout Analytics'}
              </h2>

              <div className="bg-[#121212] border border-[#27272a] rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#1a1a1a]">
                    <tr>
                      <th className="text-left p-4 text-gray-400 text-sm">{isFr ? 'Séance' : 'Workout'}</th>
                      <th className="text-left p-4 text-gray-400 text-sm">{isFr ? 'Lancements' : 'Launches'}</th>
                      <th className="text-left p-4 text-gray-400 text-sm">{isFr ? 'Complétées' : 'Completed'}</th>
                      <th className="text-left p-4 text-gray-400 text-sm">{isFr ? 'Taux' : 'Rate'}</th>
                      <th className="text-left p-4 text-gray-400 text-sm">{isFr ? 'Durée Moy.' : 'Avg Duration'}</th>
                      <th className="text-left p-4 text-gray-400 text-sm">{isFr ? 'Temps Total' : 'Total Time'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workoutAnalytics.length > 0 ? workoutAnalytics.map((wa, idx) => (
                      <tr key={idx} className="border-t border-[#27272a] hover:bg-[#1a1a1a]">
                        <td className="p-4 font-medium">{wa.workout_title}</td>
                        <td className="p-4">
                          <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm">
                            {wa.total_launches}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm">
                            {wa.completed_count}
                          </span>
                        </td>
                        <td className="p-4 text-yellow-400">{wa.completion_rate}</td>
                        <td className="p-4 text-gray-400">{wa.avg_duration_formatted}</td>
                        <td className="p-4 text-purple-400">{wa.total_duration_formatted}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-gray-400">
                          {isFr ? 'Aucune donnée disponible' : 'No data available'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Workouts Tab */}
          {activeTab === 'workouts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-[#EF4444]" />
                  {isFr ? 'Gestion des Séances' : 'Workout Management'} ({workouts.length})
                </h2>
                <Button onClick={() => setActiveTab('create-workout')} className="bg-[#EF4444]">
                  <Plus className="w-4 h-4 mr-2" />
                  {isFr ? 'Nouvelle Séance' : 'New Workout'}
                </Button>
              </div>

              {workouts.map(workout => (
                <div key={workout.workout_id} className="bg-[#121212] border border-[#27272a] rounded-lg overflow-hidden">
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#1a1a1a]"
                    onClick={() => setExpandedWorkout(expandedWorkout === workout.workout_id ? null : workout.workout_id)}
                  >
                    <div className="flex-1">
                      <h3 className="font-bold">{workout.title}</h3>
                      <p className="text-gray-400 text-sm">{workout.level} • {workout.program_type} • {workout.language} • {workout.exercises?.length || 0} exercices</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteWorkout(workout.workout_id);
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      {expandedWorkout === workout.workout_id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>

                  {expandedWorkout === workout.workout_id && (
                    <div className="border-t border-[#27272a] p-4 space-y-4">
                      {workout.exercises?.map((exercise, idx) => (
                        <div key={idx} className="bg-[#09090b] p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">{exercise.name}</h4>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingExercise(editingExercise === `${workout.workout_id}-${idx}` ? null : `${workout.workout_id}-${idx}`)}
                                className="text-gray-400 hover:text-white"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteExerciseFromWorkout(workout.workout_id, idx)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {editingExercise === `${workout.workout_id}-${idx}` ? (
                            <div className="space-y-3">
                              <div>
                                <label className="text-gray-400 text-sm flex items-center gap-2">
                                  <Image className="w-4 h-4" /> Image URL
                                </label>
                                <div className="flex gap-2 mt-1">
                                  <Input
                                    defaultValue={exercise.image_url || ''}
                                    className="bg-[#121212] border-[#27272a]"
                                    id={`img-${workout.workout_id}-${idx}`}
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => saveExerciseMedia(workout.workout_id, idx, 'image_url', document.getElementById(`img-${workout.workout_id}-${idx}`).value)}
                                    disabled={saving}
                                    className="bg-[#EF4444]"
                                  >
                                    <Save className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              <div>
                                <label className="text-gray-400 text-sm flex items-center gap-2">
                                  <Video className="w-4 h-4" /> Video URL
                                </label>
                                <div className="flex gap-2 mt-1">
                                  <Input
                                    defaultValue={exercise.video_url || ''}
                                    className="bg-[#121212] border-[#27272a]"
                                    id={`vid-${workout.workout_id}-${idx}`}
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => saveExerciseMedia(workout.workout_id, idx, 'video_url', document.getElementById(`vid-${workout.workout_id}-${idx}`).value)}
                                    disabled={saving}
                                    className="bg-[#EF4444]"
                                  >
                                    <Save className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-4 text-sm text-gray-400">
                              <span className="flex items-center gap-1">
                                <Image className="w-3 h-3" />
                                {exercise.image_url ? 'Image ✓' : 'No image'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Video className="w-3 h-3" />
                                {exercise.video_url ? 'Video ✓' : 'No video'}
                              </span>
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

          {/* Create Workout Tab */}
          {activeTab === 'create-workout' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#EF4444]" />
                {isFr ? 'Créer une Nouvelle Séance' : 'Create New Workout'}
              </h2>

              <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
                {/* Workout Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">{isFr ? 'Titre de la séance *' : 'Workout Title *'}</label>
                    <Input
                      value={newWorkout.title}
                      onChange={(e) => setNewWorkout(prev => ({ ...prev, title: e.target.value }))}
                      placeholder={isFr ? 'Ex: Jambes & Fessiers - Débutant' : 'Ex: Legs & Glutes - Beginner'}
                      className="bg-[#09090b] border-[#27272a]"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">{isFr ? 'Durée (minutes)' : 'Duration (minutes)'}</label>
                    <Input
                      type="number"
                      value={newWorkout.duration}
                      onChange={(e) => setNewWorkout(prev => ({ ...prev, duration: parseInt(e.target.value) || 45 }))}
                      className="bg-[#09090b] border-[#27272a]"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">{isFr ? 'Niveau' : 'Level'}</label>
                    <select
                      value={newWorkout.level}
                      onChange={(e) => setNewWorkout(prev => ({ ...prev, level: e.target.value }))}
                      className="w-full bg-[#09090b] border border-[#27272a] rounded-md px-3 py-2 text-white"
                    >
                      <option value="beginner">{isFr ? 'Débutant' : 'Beginner'}</option>
                      <option value="intermediate">{isFr ? 'Intermédiaire' : 'Intermediate'}</option>
                      <option value="advanced">{isFr ? 'Avancé' : 'Advanced'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">{isFr ? 'Type de programme' : 'Program Type'}</label>
                    <select
                      value={newWorkout.program_type}
                      onChange={(e) => setNewWorkout(prev => ({ ...prev, program_type: e.target.value }))}
                      className="w-full bg-[#09090b] border border-[#27272a] rounded-md px-3 py-2 text-white"
                    >
                      <option value="legs_glutes">{isFr ? 'Jambes & Fessiers' : 'Legs & Glutes'}</option>
                      <option value="mass_gain">{isFr ? 'Prise de masse' : 'Mass Gain'}</option>
                      <option value="weight_loss">{isFr ? 'Perte de poids' : 'Weight Loss'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">{isFr ? 'Langue' : 'Language'}</label>
                    <select
                      value={newWorkout.language}
                      onChange={(e) => setNewWorkout(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full bg-[#09090b] border border-[#27272a] rounded-md px-3 py-2 text-white"
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">{isFr ? 'Image URL (optionnel)' : 'Image URL (optional)'}</label>
                    <Input
                      value={newWorkout.image_url}
                      onChange={(e) => setNewWorkout(prev => ({ ...prev, image_url: e.target.value }))}
                      placeholder="https://..."
                      className="bg-[#09090b] border-[#27272a]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-gray-400 text-sm block mb-2">{isFr ? 'Description *' : 'Description *'}</label>
                    <textarea
                      value={newWorkout.description}
                      onChange={(e) => setNewWorkout(prev => ({ ...prev, description: e.target.value }))}
                      placeholder={isFr ? 'Décrivez cette séance...' : 'Describe this workout...'}
                      className="w-full bg-[#09090b] border border-[#27272a] rounded-md px-3 py-2 text-white min-h-[100px]"
                    />
                  </div>
                </div>

                {/* Add Exercise Section */}
                <div className="border-t border-[#27272a] pt-6 mb-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-[#EF4444]" />
                    {isFr ? 'Ajouter des Exercices' : 'Add Exercises'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="text-gray-400 text-xs block mb-1">{isFr ? 'Nom de l\'exercice *' : 'Exercise Name *'}</label>
                      <Input
                        value={newExercise.name}
                        onChange={(e) => setNewExercise(prev => ({ ...prev, name: e.target.value }))}
                        placeholder={isFr ? 'Ex: Squats' : 'Ex: Squats'}
                        className="bg-[#09090b] border-[#27272a]"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs block mb-1">Séries</label>
                      <Input
                        type="number"
                        value={newExercise.sets}
                        onChange={(e) => setNewExercise(prev => ({ ...prev, sets: parseInt(e.target.value) || 3 }))}
                        className="bg-[#09090b] border-[#27272a]"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs block mb-1">Reps</label>
                      <Input
                        value={newExercise.reps}
                        onChange={(e) => setNewExercise(prev => ({ ...prev, reps: e.target.value }))}
                        placeholder="12"
                        className="bg-[#09090b] border-[#27272a]"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs block mb-1">Repos</label>
                      <Input
                        value={newExercise.rest}
                        onChange={(e) => setNewExercise(prev => ({ ...prev, rest: e.target.value }))}
                        placeholder="60s"
                        className="bg-[#09090b] border-[#27272a]"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs block mb-1">Video YouTube URL</label>
                      <Input
                        value={newExercise.video_url}
                        onChange={(e) => setNewExercise(prev => ({ ...prev, video_url: e.target.value }))}
                        placeholder="https://www.youtube.com/embed/..."
                        className="bg-[#09090b] border-[#27272a]"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs block mb-1">Image URL</label>
                      <Input
                        value={newExercise.image_url}
                        onChange={(e) => setNewExercise(prev => ({ ...prev, image_url: e.target.value }))}
                        placeholder="https://..."
                        className="bg-[#09090b] border-[#27272a]"
                      />
                    </div>
                    <div className="lg:col-span-3">
                      <label className="text-gray-400 text-xs block mb-1">Description</label>
                      <Input
                        value={newExercise.description}
                        onChange={(e) => setNewExercise(prev => ({ ...prev, description: e.target.value }))}
                        placeholder={isFr ? 'Instructions pour l\'exercice...' : 'Exercise instructions...'}
                        className="bg-[#09090b] border-[#27272a]"
                      />
                    </div>
                  </div>
                  
                  <Button onClick={addExerciseToNewWorkout} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    {isFr ? 'Ajouter cet exercice' : 'Add this exercise'}
                  </Button>
                </div>

                {/* Exercise List */}
                {newWorkout.exercises.length > 0 && (
                  <div className="border-t border-[#27272a] pt-6 mb-6">
                    <h4 className="font-bold mb-4">{isFr ? 'Exercices ajoutés' : 'Added Exercises'} ({newWorkout.exercises.length})</h4>
                    <div className="space-y-2">
                      {newWorkout.exercises.map((ex, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-[#09090b] p-3 rounded">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 bg-[#EF4444] rounded-full flex items-center justify-center text-sm font-bold">{idx + 1}</span>
                            <div>
                              <span className="font-medium">{ex.name}</span>
                              <span className="text-gray-400 text-sm ml-2">{ex.sets}x{ex.reps} - {ex.rest}</span>
                            </div>
                            {ex.video_url && <Video className="w-4 h-4 text-green-400" />}
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => removeExerciseFromNewWorkout(idx)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Create Button */}
                <div className="flex gap-4">
                  <Button 
                    onClick={createWorkout} 
                    disabled={saving || !newWorkout.title || !newWorkout.description}
                    className="bg-[#EF4444] hover:bg-[#DC2626] flex-1"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                    {isFr ? 'Créer la Séance' : 'Create Workout'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setNewWorkout({
                        title: '',
                        description: '',
                        level: 'beginner',
                        program_type: 'legs_glutes',
                        duration: 45,
                        language: 'fr',
                        image_url: '',
                        exercises: []
                      });
                    }}
                    className="border-[#27272a]"
                  >
                    <X className="w-4 h-4 mr-2" />
                    {isFr ? 'Réinitialiser' : 'Reset'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Supplements Tab */}
          {activeTab === 'supplements' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Pill className="w-5 h-5 text-green-400" />
                {isFr ? 'Gestion Nutrition' : 'Nutrition Management'}
              </h2>

              {supplements.map(supplement => (
                <div key={supplement.supplement_id} className="bg-[#121212] border border-[#27272a] rounded-lg overflow-hidden">
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#1a1a1a]"
                    onClick={() => setExpandedSupplement(expandedSupplement === supplement.supplement_id ? null : supplement.supplement_id)}
                  >
                    <div>
                      <h3 className="font-bold">{supplement.title}</h3>
                      <p className="text-gray-400 text-sm">{supplement.meals?.length || 0} {isFr ? 'repas' : 'meals'} • {supplement.language}</p>
                    </div>
                    {expandedSupplement === supplement.supplement_id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>

                  {expandedSupplement === supplement.supplement_id && supplement.meals && (
                    <div className="border-t border-[#27272a] p-4 space-y-4">
                      {supplement.meals.map((meal, idx) => (
                        <div key={idx} className="bg-[#09090b] p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">{meal.name}</h4>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingMeal(editingMeal === `${supplement.supplement_id}-${idx}` ? null : `${supplement.supplement_id}-${idx}`)}
                              className="text-gray-400 hover:text-white"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>

                          {editingMeal === `${supplement.supplement_id}-${idx}` ? (
                            <div className="space-y-3">
                              <div>
                                <label className="text-gray-400 text-sm flex items-center gap-2">
                                  <Image className="w-4 h-4" /> Image URL
                                </label>
                                <div className="flex gap-2 mt-1">
                                  <Input
                                    defaultValue={meal.image_url || ''}
                                    className="bg-[#121212] border-[#27272a]"
                                    id={`meal-img-${supplement.supplement_id}-${idx}`}
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => saveMealMedia(supplement.supplement_id, idx, 'image_url', document.getElementById(`meal-img-${supplement.supplement_id}-${idx}`).value)}
                                    disabled={saving}
                                    className="bg-[#EF4444]"
                                  >
                                    <Save className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              <div>
                                <label className="text-gray-400 text-sm flex items-center gap-2">
                                  <Video className="w-4 h-4" /> Video URL
                                </label>
                                <div className="flex gap-2 mt-1">
                                  <Input
                                    defaultValue={meal.video_url || ''}
                                    className="bg-[#121212] border-[#27272a]"
                                    id={`meal-vid-${supplement.supplement_id}-${idx}`}
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => saveMealMedia(supplement.supplement_id, idx, 'video_url', document.getElementById(`meal-vid-${supplement.supplement_id}-${idx}`).value)}
                                    disabled={saving}
                                    className="bg-[#EF4444]"
                                  >
                                    <Save className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-4 text-sm text-gray-400">
                              <span className="flex items-center gap-1">
                                <Image className="w-3 h-3" />
                                {meal.image_url ? 'Image ✓' : 'No image'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Video className="w-3 h-3" />
                                {meal.video_url ? 'Video ✓' : 'No video'}
                              </span>
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
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
