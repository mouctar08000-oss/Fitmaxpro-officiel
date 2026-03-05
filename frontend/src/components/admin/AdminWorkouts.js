import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  Plus, Pencil, Trash2, Save, X, Video, Image, 
  Clock, Dumbbell, ChevronDown, ChevronUp, Search,
  GripVertical, Play
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const AdminWorkouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterProgram, setFilterProgram] = useState('');
  const [options, setOptions] = useState({ levels: [], program_types: [], languages: [] });
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [expandedWorkout, setExpandedWorkout] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'BEGINNER',
    program_type: 'general',
    duration_minutes: 30,
    image_url: '',
    video_url: '',
    language: 'fr',
    tags: [],
    exercises: []
  });

  const fetchWorkouts = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/api/workouts/admin/all`, { withCredentials: true });
      setWorkouts(response.data.workouts || []);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      toast.error('Erreur lors du chargement des séances');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOptions = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/api/workouts/admin/options`, { withCredentials: true });
      setOptions(response.data);
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  }, []);

  useEffect(() => {
    fetchWorkouts();
    fetchOptions();
  }, [fetchWorkouts, fetchOptions]);

  const handleCreateWorkout = () => {
    setEditingWorkout(null);
    setFormData({
      title: '',
      description: '',
      level: 'BEGINNER',
      program_type: 'general',
      duration_minutes: 30,
      image_url: '',
      video_url: '',
      language: 'fr',
      tags: [],
      exercises: []
    });
    setShowModal(true);
  };

  const handleEditWorkout = (workout) => {
    setEditingWorkout(workout);
    setFormData({
      title: workout.title || '',
      description: workout.description || '',
      level: workout.level || 'BEGINNER',
      program_type: workout.program_type || 'general',
      duration_minutes: workout.duration_minutes || 30,
      image_url: workout.image_url || '',
      video_url: workout.video_url || '',
      language: workout.language || 'fr',
      tags: workout.tags || [],
      exercises: workout.exercises || []
    });
    setShowModal(true);
  };

  const handleDeleteWorkout = async (workoutId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette séance ?')) return;
    
    try {
      await axios.delete(`${API}/api/workouts/admin/${workoutId}`, { withCredentials: true });
      toast.success('Séance supprimée');
      fetchWorkouts();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleSaveWorkout = async () => {
    if (!formData.title.trim()) {
      toast.error('Le titre est requis');
      return;
    }

    try {
      if (editingWorkout) {
        await axios.put(`${API}/api/workouts/admin/${editingWorkout.workout_id}`, formData, { withCredentials: true });
        toast.success('Séance mise à jour');
      } else {
        await axios.post(`${API}/api/workouts/admin/create`, formData, { withCredentials: true });
        toast.success('Séance créée');
      }
      setShowModal(false);
      fetchWorkouts();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleAddExercise = () => {
    setFormData({
      ...formData,
      exercises: [
        ...formData.exercises,
        {
          name: '',
          description: '',
          duration_seconds: 45,
          video_url: '',
          image_url: '',
          sets: 3,
          reps: '12',
          rest_seconds: 60
        }
      ]
    });
  };

  const handleUpdateExercise = (index, field, value) => {
    const newExercises = [...formData.exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setFormData({ ...formData, exercises: newExercises });
  };

  const handleRemoveExercise = (index) => {
    const newExercises = formData.exercises.filter((_, i) => i !== index);
    setFormData({ ...formData, exercises: newExercises });
  };

  const filteredWorkouts = workouts.filter(workout => {
    const matchesSearch = workout.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workout.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = !filterLevel || workout.level === filterLevel;
    const matchesProgram = !filterProgram || workout.program_type === filterProgram;
    return matchesSearch && matchesLevel && matchesProgram;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestion des Séances</h2>
          <p className="text-gray-400">{workouts.length} séances au total</p>
        </div>
        <button
          onClick={handleCreateWorkout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouvelle Séance
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
          />
        </div>
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-red-500"
        >
          <option value="">Tous les niveaux</option>
          {options.levels.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
        <select
          value={filterProgram}
          onChange={(e) => setFilterProgram(e.target.value)}
          className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-red-500"
        >
          <option value="">Tous les programmes</option>
          {options.program_types.map(pt => (
            <option key={pt.value} value={pt.value}>{pt.label}</option>
          ))}
        </select>
      </div>

      {/* Workouts List */}
      <div className="space-y-4">
        {filteredWorkouts.map(workout => (
          <div key={workout.workout_id} className="bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-hidden">
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {workout.image_url ? (
                    <img src={workout.image_url} alt={workout.title} className="w-20 h-20 rounded-lg object-cover" />
                  ) : (
                    <div className="w-20 h-20 bg-zinc-700 rounded-lg flex items-center justify-center">
                      <Dumbbell className="w-8 h-8 text-zinc-500" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-white">{workout.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{workout.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-0.5 bg-red-600/20 text-red-400 text-xs rounded">{workout.level}</span>
                      <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 text-xs rounded">{workout.program_type}</span>
                      <span className="px-2 py-0.5 bg-zinc-600 text-zinc-300 text-xs rounded flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {workout.duration_minutes} min
                      </span>
                      <span className="px-2 py-0.5 bg-zinc-600 text-zinc-300 text-xs rounded">
                        {workout.exercise_count || workout.exercises?.length || 0} exercices
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpandedWorkout(expandedWorkout === workout.workout_id ? null : workout.workout_id)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                  >
                    {expandedWorkout === workout.workout_id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => handleEditWorkout(workout)}
                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-600/20 rounded-lg transition-colors"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteWorkout(workout.workout_id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-600/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Expanded Exercises */}
            {expandedWorkout === workout.workout_id && workout.exercises && (
              <div className="border-t border-zinc-700 p-4 bg-zinc-900/50">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Exercices ({workout.exercises.length})</h4>
                <div className="space-y-2">
                  {workout.exercises.map((exercise, idx) => (
                    <div key={exercise.exercise_id || idx} className="flex items-center gap-3 p-2 bg-zinc-800 rounded-lg">
                      <span className="text-zinc-500 text-sm w-6">{idx + 1}.</span>
                      {exercise.video_url ? (
                        <Play className="w-4 h-4 text-green-400" />
                      ) : (
                        <div className="w-4 h-4" />
                      )}
                      <span className="text-white flex-1">{exercise.name}</span>
                      <span className="text-gray-400 text-sm">{exercise.sets}x{exercise.reps}</span>
                      <span className="text-gray-500 text-sm">{exercise.rest_seconds}s repos</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredWorkouts.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucune séance trouvée</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-zinc-900 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-zinc-900 border-b border-zinc-700 p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">
                {editingWorkout ? 'Modifier la séance' : 'Nouvelle séance'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Titre *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                    placeholder="Ex: Séance Pectoraux - Niveau Avancé"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                    placeholder="Description de la séance..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Niveau</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                  >
                    {options.levels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Programme</label>
                  <select
                    value={formData.program_type}
                    onChange={(e) => setFormData({ ...formData, program_type: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                  >
                    {options.program_types.map(pt => (
                      <option key={pt.value} value={pt.value}>{pt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Durée (min)</label>
                  <input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Langue</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                  >
                    {options.languages.map(lang => (
                      <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    <Image className="w-4 h-4 inline mr-1" /> URL Image
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    <Video className="w-4 h-4 inline mr-1" /> URL Vidéo
                  </label>
                  <input
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>

              {/* Exercises */}
              <div className="border-t border-zinc-700 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium text-white">Exercices ({formData.exercises.length})</h4>
                  <button
                    onClick={handleAddExercise}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter un exercice
                  </button>
                </div>
                
                <div className="space-y-4">
                  {formData.exercises.map((exercise, index) => (
                    <div key={index} className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-zinc-500" />
                          <span className="text-sm font-medium text-gray-400">Exercice {index + 1}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveExercise(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="md:col-span-2">
                          <input
                            type="text"
                            value={exercise.name}
                            onChange={(e) => handleUpdateExercise(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
                            placeholder="Nom de l'exercice *"
                          />
                        </div>
                        <input
                          type="text"
                          value={exercise.description}
                          onChange={(e) => handleUpdateExercise(index, 'description', e.target.value)}
                          className="px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
                          placeholder="Description"
                        />
                        <input
                          type="url"
                          value={exercise.video_url}
                          onChange={(e) => handleUpdateExercise(index, 'video_url', e.target.value)}
                          className="px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
                          placeholder="URL vidéo"
                        />
                        <div className="grid grid-cols-4 gap-2">
                          <div>
                            <label className="text-xs text-gray-500">Séries</label>
                            <input
                              type="number"
                              value={exercise.sets}
                              onChange={(e) => handleUpdateExercise(index, 'sets', parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-1.5 bg-zinc-700 border border-zinc-600 rounded text-white text-sm focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Reps</label>
                            <input
                              type="text"
                              value={exercise.reps}
                              onChange={(e) => handleUpdateExercise(index, 'reps', e.target.value)}
                              className="w-full px-2 py-1.5 bg-zinc-700 border border-zinc-600 rounded text-white text-sm focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Durée(s)</label>
                            <input
                              type="number"
                              value={exercise.duration_seconds}
                              onChange={(e) => handleUpdateExercise(index, 'duration_seconds', parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-1.5 bg-zinc-700 border border-zinc-600 rounded text-white text-sm focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Repos(s)</label>
                            <input
                              type="number"
                              value={exercise.rest_seconds}
                              onChange={(e) => handleUpdateExercise(index, 'rest_seconds', parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-1.5 bg-zinc-700 border border-zinc-600 rounded text-white text-sm focus:outline-none focus:border-red-500"
                            />
                          </div>
                        </div>
                        <input
                          type="url"
                          value={exercise.image_url}
                          onChange={(e) => handleUpdateExercise(index, 'image_url', e.target.value)}
                          className="px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
                          placeholder="URL image"
                        />
                      </div>
                    </div>
                  ))}
                  
                  {formData.exercises.length === 0 && (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-zinc-700 rounded-lg">
                      <Dumbbell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Aucun exercice ajouté</p>
                      <p className="text-sm">Cliquez sur "Ajouter un exercice" pour commencer</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-zinc-900 border-t border-zinc-700 p-4 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveWorkout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                {editingWorkout ? 'Mettre à jour' : 'Créer la séance'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWorkouts;
