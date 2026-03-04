import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { 
  Bell, ArrowLeft, Plus, Clock, Dumbbell, 
  Trash2, Calendar, Check, X, ChevronRight,
  BellRing, BellOff, Edit, Save
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RemindersPage = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isFr = i18n.language?.startsWith('fr');
  
  const [reminders, setReminders] = useState([]);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  
  // Form state
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedTime, setSelectedTime] = useState('08:00');
  const [repeatWeekly, setRepeatWeekly] = useState(true);
  const [notes, setNotes] = useState('');

  const days = isFr 
    ? ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
    : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('session_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchReminders = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/reminders`, {
        headers: getAuthHeaders()
      });
      setReminders(response.data.reminders || []);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  }, [getAuthHeaders]);

  const fetchUpcoming = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/reminders/upcoming`, {
        headers: getAuthHeaders()
      });
      setUpcomingReminders(response.data.upcoming || []);
    } catch (error) {
      console.error('Error fetching upcoming:', error);
    }
  }, [getAuthHeaders]);

  const fetchWorkouts = useCallback(async () => {
    try {
      const lang = isFr ? 'fr' : 'en';
      const response = await axios.get(`${API}/workouts?language=${lang}`);
      setWorkouts(response.data || []);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
  }, [isFr]);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        await Promise.all([fetchReminders(), fetchUpcoming(), fetchWorkouts()]);
      }
      setLoading(false);
    };
    loadData();
  }, [user, fetchReminders, fetchUpcoming, fetchWorkouts]);

  const createReminder = async () => {
    if (!selectedWorkout) {
      toast.error(isFr ? 'Sélectionnez une séance' : 'Select a workout');
      return;
    }

    try {
      await axios.post(`${API}/reminders`, {
        workout_id: selectedWorkout.workout_id,
        workout_title: selectedWorkout.title,
        day_of_week: selectedDay,
        time: selectedTime,
        repeat_weekly: repeatWeekly,
        notes: notes || null
      }, { headers: getAuthHeaders() });

      toast.success(isFr ? 'Rappel créé!' : 'Reminder created!');
      setShowAddForm(false);
      resetForm();
      fetchReminders();
      fetchUpcoming();
    } catch (error) {
      console.error('Error creating reminder:', error);
      toast.error(isFr ? 'Erreur' : 'Error');
    }
  };

  const toggleReminder = async (reminderId) => {
    try {
      const response = await axios.post(`${API}/reminders/${reminderId}/toggle`, {}, {
        headers: getAuthHeaders()
      });
      toast.success(response.data.is_active 
        ? (isFr ? 'Rappel activé' : 'Reminder activated')
        : (isFr ? 'Rappel désactivé' : 'Reminder deactivated')
      );
      fetchReminders();
      fetchUpcoming();
    } catch (error) {
      console.error('Error toggling reminder:', error);
      toast.error(isFr ? 'Erreur' : 'Error');
    }
  };

  const deleteReminder = async (reminderId) => {
    if (!window.confirm(isFr ? 'Supprimer ce rappel?' : 'Delete this reminder?')) return;

    try {
      await axios.delete(`${API}/reminders/${reminderId}`, {
        headers: getAuthHeaders()
      });
      toast.success(isFr ? 'Rappel supprimé' : 'Reminder deleted');
      fetchReminders();
      fetchUpcoming();
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast.error(isFr ? 'Erreur' : 'Error');
    }
  };

  const resetForm = () => {
    setSelectedWorkout(null);
    setSelectedDay(0);
    setSelectedTime('08:00');
    setRepeatWeekly(true);
    setNotes('');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#09090b] noise-bg">
        <Navigation />
        <div className="py-20 px-4 text-center">
          <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-4">
            {isFr ? 'Connectez-vous pour gérer vos rappels' : 'Login to manage your reminders'}
          </p>
          <Button onClick={() => navigate('/login')} className="bg-[#EF4444]">
            {isFr ? 'Se connecter' : 'Login'}
          </Button>
        </div>
      </div>
    );
  }

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
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="mb-4 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isFr ? 'Retour' : 'Back'}
          </Button>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 
                className="text-4xl font-bold flex items-center gap-3"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                data-testid="reminders-title"
              >
                <Bell className="w-10 h-10 text-[#EF4444]" />
                {isFr ? 'MES RAPPELS' : 'MY REMINDERS'}
              </h1>
              <p className="text-gray-400 mt-2">
                {isFr 
                  ? 'Programmez vos séances d\'entraînement' 
                  : 'Schedule your workout sessions'}
              </p>
            </div>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-[#EF4444] hover:bg-[#DC2626]"
              data-testid="add-reminder-btn"
            >
              <Plus className="w-5 h-5 mr-2" />
              {isFr ? 'Nouveau Rappel' : 'New Reminder'}
            </Button>
          </div>

          {/* Upcoming Reminders */}
          {upcomingReminders.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BellRing className="w-5 h-5 text-yellow-400" />
                {isFr ? 'Prochains Rappels' : 'Upcoming Reminders'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingReminders.slice(0, 3).map((r, idx) => (
                  <div 
                    key={r.reminder_id || idx}
                    className={`bg-gradient-to-br ${
                      r.days_until === 0 
                        ? 'from-[#EF4444]/20 to-[#EF4444]/5 border-[#EF4444]/50' 
                        : r.days_until === 1 
                          ? 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/50'
                          : 'from-blue-500/20 to-blue-500/5 border-blue-500/50'
                    } border rounded-lg p-4`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-bold ${
                        r.days_until === 0 ? 'text-[#EF4444]' : r.days_until === 1 ? 'text-yellow-400' : 'text-blue-400'
                      }`}>
                        {r.days_until === 0 
                          ? (isFr ? "Aujourd'hui" : 'Today')
                          : r.days_until === 1 
                            ? (isFr ? 'Demain' : 'Tomorrow')
                            : (isFr ? r.day_name_fr : r.day_name_en)}
                      </span>
                      <span className="text-white font-bold">{r.time}</span>
                    </div>
                    <p className="font-medium truncate">{r.workout_title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Reminder Form */}
          {showAddForm && (
            <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6 mb-8" data-testid="add-reminder-form">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-400" />
                {isFr ? 'Créer un Rappel' : 'Create Reminder'}
              </h3>

              <div className="space-y-4">
                {/* Select Workout */}
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">
                    {isFr ? 'Séance *' : 'Workout *'}
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {workouts.slice(0, 12).map((w) => (
                      <button
                        key={w.workout_id}
                        onClick={() => setSelectedWorkout(w)}
                        className={`p-3 rounded-lg text-left text-sm transition-colors ${
                          selectedWorkout?.workout_id === w.workout_id
                            ? 'bg-[#EF4444] text-white'
                            : 'bg-[#09090b] border border-[#27272a] hover:border-[#EF4444]/50'
                        }`}
                      >
                        <Dumbbell className="w-4 h-4 mb-1" />
                        <p className="truncate font-medium">{w.title}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Select Day */}
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">
                    {isFr ? 'Jour *' : 'Day *'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {days.map((day, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedDay(idx)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedDay === idx
                            ? 'bg-[#EF4444] text-white'
                            : 'bg-[#09090b] border border-[#27272a] hover:border-[#EF4444]/50'
                        }`}
                      >
                        {day.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Select Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">
                      {isFr ? 'Heure *' : 'Time *'}
                    </label>
                    <Input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="bg-[#09090b] border-[#27272a]"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => setRepeatWeekly(!repeatWeekly)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm w-full justify-center ${
                        repeatWeekly
                          ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                          : 'bg-[#09090b] border border-[#27272a] text-gray-400'
                      }`}
                    >
                      {repeatWeekly ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      {isFr ? 'Répéter chaque semaine' : 'Repeat weekly'}
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">
                    {isFr ? 'Notes (optionnel)' : 'Notes (optional)'}
                  </label>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={isFr ? "Ex: Séance avec poids lourds" : "Ex: Heavy weights session"}
                    className="bg-[#09090b] border-[#27272a]"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={createReminder}
                    className="bg-[#EF4444] hover:bg-[#DC2626]"
                    data-testid="save-reminder-btn"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isFr ? 'Créer le Rappel' : 'Create Reminder'}
                  </Button>
                  <Button
                    onClick={() => { setShowAddForm(false); resetForm(); }}
                    variant="outline"
                    className="border-[#27272a]"
                  >
                    {isFr ? 'Annuler' : 'Cancel'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* All Reminders */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#EF4444]" />
              {isFr ? 'Tous les Rappels' : 'All Reminders'} ({reminders.length})
            </h2>

            {reminders.length === 0 ? (
              <div className="bg-[#121212] border border-[#27272a] rounded-lg p-12 text-center">
                <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">
                  {isFr ? 'Aucun rappel programmé' : 'No reminders scheduled'}
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  {isFr 
                    ? 'Créez des rappels pour ne jamais manquer vos séances!' 
                    : 'Create reminders to never miss your workouts!'}
                </p>
                <Button 
                  onClick={() => setShowAddForm(true)} 
                  className="bg-[#EF4444]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isFr ? 'Créer mon premier rappel' : 'Create my first reminder'}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {reminders.map((reminder, idx) => (
                  <div 
                    key={reminder.reminder_id || idx}
                    className={`bg-[#121212] border rounded-lg p-4 transition-colors ${
                      reminder.is_active 
                        ? 'border-[#27272a] hover:border-[#EF4444]/50' 
                        : 'border-[#27272a] opacity-50'
                    }`}
                    data-testid={`reminder-${idx}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${
                          reminder.is_active ? 'bg-[#EF4444]/20' : 'bg-gray-500/20'
                        }`}>
                          {reminder.is_active 
                            ? <BellRing className="w-6 h-6 text-[#EF4444]" />
                            : <BellOff className="w-6 h-6 text-gray-500" />
                          }
                        </div>
                        <div>
                          <h3 className="font-bold">{reminder.workout_title}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {isFr ? reminder.day_name_fr : reminder.day_name_en}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {reminder.time}
                            </span>
                            {reminder.repeat_weekly && (
                              <span className="text-green-400 text-xs">
                                {isFr ? 'Hebdo' : 'Weekly'}
                              </span>
                            )}
                          </div>
                          {reminder.notes && (
                            <p className="text-gray-500 text-xs mt-1">{reminder.notes}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleReminder(reminder.reminder_id)}
                          className={reminder.is_active ? 'text-green-400' : 'text-gray-400'}
                        >
                          {reminder.is_active ? <BellRing className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/workout/${reminder.workout_id}`)}
                          className="text-blue-400"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteReminder(reminder.reminder_id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemindersPage;
