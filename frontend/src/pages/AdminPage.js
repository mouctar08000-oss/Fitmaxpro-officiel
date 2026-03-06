import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navigation from '../components/Navigation';
import VideoUploader from '../components/VideoUploader';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
// Import refactored admin components
import { AdminDashboard, AdminSocialLinks, AdminLiveAnalytics, AdminWorkouts, AdminUsersManager } from '../components/admin';
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
  Copy,
  MessageCircle,
  Send,
  Timer,
  Phone,
  VideoIcon,
  Flame,
  Sparkles,
  LineChart,
  Mail,
  Bell,
  AlertTriangle,
  Star,
  Instagram,
  Footprints,
  Target,
  Zap,
  Heart,
  CheckCircle,
  Award,
  Calendar
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart
} from 'recharts';

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
  
  // User Progress states
  const [userProgress, setUserProgress] = useState([]);
  const [selectedUserProgress, setSelectedUserProgress] = useState(null);
  
  // Messaging states
  const [messages, setMessages] = useState([]);
  const [usersWithMessages, setUsersWithMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Routines states
  const [routines, setRoutines] = useState([]);
  const [expandedRoutine, setExpandedRoutine] = useState(null);
  const [editingRoutineExercise, setEditingRoutineExercise] = useState(null);
  const [newRoutineExercise, setNewRoutineExercise] = useState({
    name: '',
    description: '',
    duration: '30 secondes',
    image_url: '',
    video_url: ''
  });
  
  // Discipline tracking states
  const [routineStats, setRoutineStats] = useState(null);
  const [routineSessions, setRoutineSessions] = useState([]);
  const [selectedUserRoutines, setSelectedUserRoutines] = useState(null);
  
  // Evolution/Charts states
  const [evolutionData, setEvolutionData] = useState([]);
  const [selectedUserEvolution, setSelectedUserEvolution] = useState(null);
  const [selectedWorkoutAnalytics, setSelectedWorkoutAnalytics] = useState(null);
  
  // All subscribers evolution states
  const [allSubscribersEvolution, setAllSubscribersEvolution] = useState([]);
  const [sendingAlerts, setSendingAlerts] = useState(false);
  const [alertsHistory, setAlertsHistory] = useState([]);
  
  // Inactive users states
  const [inactiveUsers, setInactiveUsers] = useState([]);
  const [inactiveDaysThreshold, setInactiveDaysThreshold] = useState(7);
  const [selectedInactiveUsers, setSelectedInactiveUsers] = useState([]);
  const [loadingInactive, setLoadingInactive] = useState(false);
  const [customReminderMessage, setCustomReminderMessage] = useState('');
  
  // Cancellation requests states
  const [cancellationRequests, setCancellationRequests] = useState([]);
  const [loadingCancellations, setLoadingCancellations] = useState(false);
  
  // Weekly emails states
  const [weeklyEmailSettings, setWeeklyEmailSettings] = useState({
    enabled: true,
    send_day: 'monday',
    include_running_stats: true,
    include_workout_stats: true,
    include_points_earned: true,
    include_leaderboard_position: true,
    custom_intro_fr: '',
    custom_intro_en: ''
  });
  const [emailHistory, setEmailHistory] = useState({ batches: [], pending_count: 0 });
  const [sendingWeeklyEmails, setSendingWeeklyEmails] = useState(false);
  
  // Reviews management states
  const [allReviews, setAllReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  
  // Social links states
  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    youtube: '',
    tiktok: '',
    snapchat: '',
    facebook: ''
  });
  const [savingSocial, setSavingSocial] = useState(false);
  const [savingPlatform, setSavingPlatform] = useState(null); // Track which platform is being saved
  
  // Uploaded videos state
  const [uploadedVideos, setUploadedVideos] = useState([]);
  
  // Progress photos states
  const [usersProgressPhotos, setUsersProgressPhotos] = useState([]);
  const [selectedUserPhotos, setSelectedUserPhotos] = useState(null);
  
  // Running stats states
  const [runningStats, setRunningStats] = useState(null);
  const [allRunningData, setAllRunningData] = useState([]);
  const [selectedUserRunning, setSelectedUserRunning] = useState(null);
  
  // Live analytics states
  const [liveAnalytics, setLiveAnalytics] = useState(null);
  const [loadingLiveAnalytics, setLoadingLiveAnalytics] = useState(false);
  
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

  const fetchUserProgress = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/admin/all-user-progress`, { headers: getAuthHeaders() });
      setUserProgress(response.data.user_progress || []);
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  }, []);

  const fetchRoutines = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/admin/routines`, { headers: getAuthHeaders() });
      setRoutines(response.data.routines || []);
    } catch (error) {
      console.error('Error fetching routines:', error);
    }
  }, []);

  const fetchRoutineStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/admin/routine-sessions/stats`, { headers: getAuthHeaders() });
      setRoutineStats(response.data);
    } catch (error) {
      console.error('Error fetching routine stats:', error);
    }
  }, []);

  const fetchRoutineSessions = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/admin/routine-sessions`, { headers: getAuthHeaders() });
      setRoutineSessions(response.data.routine_sessions || []);
    } catch (error) {
      console.error('Error fetching routine sessions:', error);
    }
  }, []);

  const fetchUserRoutineSessions = async (userId) => {
    try {
      const response = await axios.get(`${API}/admin/user/${userId}/routine-sessions`, { headers: getAuthHeaders() });
      setSelectedUserRoutines(response.data);
    } catch (error) {
      console.error('Error fetching user routine sessions:', error);
      toast.error(isFr ? 'Erreur' : 'Error');
    }
  };

  const fetchEvolutionData = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/admin/analytics/evolution`, { headers: getAuthHeaders() });
      setEvolutionData(response.data.evolution || []);
    } catch (error) {
      console.error('Error fetching evolution data:', error);
    }
  }, []);

  const fetchUserEvolution = async (userId) => {
    try {
      const response = await axios.get(`${API}/admin/user/${userId}/evolution`, { headers: getAuthHeaders() });
      setSelectedUserEvolution(response.data);
    } catch (error) {
      console.error('Error fetching user evolution:', error);
      toast.error(isFr ? 'Erreur' : 'Error');
    }
  };

  const fetchWorkoutDetailedAnalytics = async (workoutId) => {
    try {
      const response = await axios.get(`${API}/admin/workout/${workoutId}/analytics`, { headers: getAuthHeaders() });
      setSelectedWorkoutAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching workout analytics:', error);
      toast.error(isFr ? 'Erreur' : 'Error');
    }
  };

  const fetchAllSubscribersEvolution = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/admin/all-subscribers-evolution`, { headers: getAuthHeaders() });
      setAllSubscribersEvolution(response.data.subscribers || []);
    } catch (error) {
      console.error('Error fetching all subscribers evolution:', error);
    }
  }, []);

  const fetchAlertsHistory = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/admin/inactivity-alerts`, { headers: getAuthHeaders() });
      setAlertsHistory(response.data.alerts || []);
    } catch (error) {
      console.error('Error fetching alerts history:', error);
    }
  }, []);

  const sendInactivityAlerts = async (daysThreshold = 3) => {
    setSendingAlerts(true);
    try {
      const response = await axios.post(
        `${API}/admin/send-inactivity-alerts?days_threshold=${daysThreshold}`,
        {},
        { headers: getAuthHeaders() }
      );
      toast.success(isFr 
        ? `${response.data.sent} alertes envoyées, ${response.data.already_sent_recently} déjà envoyées récemment`
        : `${response.data.sent} alerts sent, ${response.data.already_sent_recently} already sent recently`
      );
      fetchAlertsHistory();
      fetchAllSubscribersEvolution();
    } catch (error) {
      console.error('Error sending alerts:', error);
      toast.error(isFr ? 'Erreur lors de l\'envoi' : 'Error sending alerts');
    }
    setSendingAlerts(false);
  };

  const fetchUserSessions = async (userId) => {
    try {
      const response = await axios.get(`${API}/admin/user/${userId}/sessions`, { headers: getAuthHeaders() });
      setSelectedUserProgress(response.data);
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      toast.error(isFr ? 'Erreur' : 'Error');
    }
  };

  // Running data fetching
  const fetchRunningStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/admin/running/stats`, { headers: getAuthHeaders() });
      setRunningStats(response.data);
    } catch (error) {
      console.error('Error fetching running stats:', error);
    }
  }, []);

  const fetchAllRunningData = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/admin/running/all`, { headers: getAuthHeaders() });
      setAllRunningData(response.data.runs || []);
    } catch (error) {
      console.error('Error fetching running data:', error);
    }
  }, []);

  const fetchUserRunning = async (userId) => {
    try {
      const response = await axios.get(`${API}/admin/running/user/${userId}`, { headers: getAuthHeaders() });
      setSelectedUserRunning(response.data);
    } catch (error) {
      console.error('Error fetching user running data:', error);
      toast.error(isFr ? 'Erreur' : 'Error');
    }
  };

  // Reviews management
  const fetchAllReviews = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/admin/reviews`, { headers: getAuthHeaders() });
      setAllReviews(response.data.reviews || []);
      setReviewStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }, []);

  const respondToReview = async (reviewId) => {
    if (!replyText.trim()) return;
    try {
      await axios.put(`${API}/admin/reviews/${reviewId}/respond?response=${encodeURIComponent(replyText)}`, {}, { headers: getAuthHeaders() });
      toast.success(isFr ? 'Réponse envoyée!' : 'Response sent!');
      setReplyingTo(null);
      setReplyText('');
      fetchAllReviews();
    } catch (error) {
      console.error('Error responding to review:', error);
      toast.error(isFr ? 'Erreur' : 'Error');
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm(isFr ? 'Supprimer cet avis?' : 'Delete this review?')) return;
    try {
      await axios.delete(`${API}/admin/reviews/${reviewId}`, { headers: getAuthHeaders() });
      toast.success(isFr ? 'Avis supprimé' : 'Review deleted');
      fetchAllReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error(isFr ? 'Erreur' : 'Error');
    }
  };

  const adminLikeReview = async (reviewId) => {
    try {
      const response = await axios.post(`${API}/admin/reviews/${reviewId}/like`, {}, { headers: getAuthHeaders() });
      toast.success(response.data.admin_liked 
        ? (isFr ? 'Avis aimé!' : 'Review liked!') 
        : (isFr ? 'Like retiré' : 'Like removed'));
      fetchAllReviews();
    } catch (error) {
      console.error('Error liking review:', error);
      toast.error(isFr ? 'Erreur' : 'Error');
    }
  };

  // Social links management
  const fetchSocialLinks = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/social-links`);
      setSocialLinks(response.data.links || {});
    } catch (error) {
      console.error('Error fetching social links:', error);
    }
  }, []);

  // Fetch uploaded videos
  const fetchUploadedVideos = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/admin/videos`, { headers: getAuthHeaders() });
      setUploadedVideos(response.data.videos || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  }, []);

  const saveSocialLinks = async () => {
    setSavingSocial(true);
    try {
      await axios.put(`${API}/admin/social-links`, socialLinks, { headers: getAuthHeaders() });
      toast.success(isFr ? 'Liens enregistrés!' : 'Links saved!');
    } catch (error) {
      console.error('Error saving social links:', error);
      toast.error(isFr ? 'Erreur' : 'Error');
    }
    setSavingSocial(false);
  };

  // Save individual social link
  const saveSingleSocialLink = async (platform) => {
    setSavingPlatform(platform);
    try {
      await axios.put(`${API}/admin/social-link`, {
        platform: platform,
        url: socialLinks[platform] || ''
      }, { headers: getAuthHeaders() });
      toast.success(isFr ? `${platform} enregistré !` : `${platform} saved!`);
    } catch (error) {
      console.error(`Error saving ${platform}:`, error);
      toast.error(isFr ? 'Erreur' : 'Error');
    }
    setSavingPlatform(null);
  };

  // Delete individual social link
  const deleteSingleSocialLink = async (platform) => {
    setSavingPlatform(platform);
    try {
      await axios.delete(`${API}/admin/social-link/${platform}`, { headers: getAuthHeaders() });
      setSocialLinks(prev => {
        const updated = { ...prev };
        delete updated[platform];
        return updated;
      });
      toast.success(isFr ? `${platform} supprimé !` : `${platform} deleted!`);
    } catch (error) {
      console.error(`Error deleting ${platform}:`, error);
      toast.error(isFr ? 'Erreur' : 'Error');
    }
    setSavingPlatform(null);
  };

  // Inactive users management
  const fetchInactiveUsers = useCallback(async () => {
    setLoadingInactive(true);
    try {
      const response = await axios.get(`${API}/admin/inactive-users?days=${inactiveDaysThreshold}`, { headers: getAuthHeaders() });
      setInactiveUsers(response.data.inactive_users || []);
    } catch (error) {
      console.error('Error fetching inactive users:', error);
    }
    setLoadingInactive(false);
  }, [inactiveDaysThreshold]);

  const sendRemindersToInactive = async () => {
    if (selectedInactiveUsers.length === 0) {
      toast.error(isFr ? 'Sélectionnez des utilisateurs' : 'Select users');
      return;
    }
    setSendingAlerts(true);
    try {
      const response = await axios.post(`${API}/admin/inactive-users/send-reminder`, selectedInactiveUsers, {
        headers: getAuthHeaders(),
        params: { message_fr: customReminderMessage || undefined }
      });
      toast.success(isFr ? `${response.data.sent} rappels envoyés!` : `${response.data.sent} reminders sent!`);
      setSelectedInactiveUsers([]);
      setCustomReminderMessage('');
    } catch (error) {
      console.error('Error sending reminders:', error);
      toast.error(isFr ? 'Erreur' : 'Error');
    }
    setSendingAlerts(false);
  };

  // Cancellation requests management
  const fetchCancellationRequests = useCallback(async () => {
    setLoadingCancellations(true);
    try {
      const response = await axios.get(`${API}/admin/cancellation-requests`, { headers: getAuthHeaders() });
      setCancellationRequests(response.data.requests || []);
    } catch (error) {
      console.error('Error fetching cancellation requests:', error);
    }
    setLoadingCancellations(false);
  }, []);

  const processCancellationRequest = async (requestId, action) => {
    try {
      await axios.put(`${API}/admin/cancellation-requests/${requestId}/process?action=${action}`, {}, { headers: getAuthHeaders() });
      toast.success(isFr 
        ? (action === 'approve' ? 'Annulation approuvée' : 'Annulation refusée')
        : (action === 'approve' ? 'Cancellation approved' : 'Cancellation rejected')
      );
      fetchCancellationRequests();
    } catch (error) {
      console.error('Error processing cancellation:', error);
      toast.error(isFr ? 'Erreur' : 'Error');
    }
  };

  // Weekly emails management
  const fetchWeeklyEmailSettings = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/admin/weekly-email-settings`, { headers: getAuthHeaders() });
      setWeeklyEmailSettings(response.data);
    } catch (error) {
      console.error('Error fetching weekly email settings:', error);
    }
  }, []);

  const fetchEmailHistory = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/admin/email-history`, { headers: getAuthHeaders() });
      setEmailHistory(response.data);
    } catch (error) {
      console.error('Error fetching email history:', error);
    }
  }, []);

  const saveWeeklyEmailSettings = async () => {
    try {
      await axios.put(`${API}/admin/weekly-email-settings`, weeklyEmailSettings, { headers: getAuthHeaders() });
      toast.success(isFr ? 'Paramètres sauvegardés!' : 'Settings saved!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(isFr ? 'Erreur' : 'Error');
    }
  };

  const sendWeeklyEmailsNow = async () => {
    if (!window.confirm(isFr 
      ? 'Envoyer les emails de motivation à tous les abonnés actifs ?' 
      : 'Send motivation emails to all active subscribers?'
    )) return;
    
    setSendingWeeklyEmails(true);
    try {
      const response = await axios.post(`${API}/admin/send-weekly-emails`, {}, { headers: getAuthHeaders() });
      toast.success(isFr 
        ? `${response.data.sent} emails envoyés!` 
        : `${response.data.sent} emails sent!`
      );
      fetchEmailHistory();
    } catch (error) {
      console.error('Error sending emails:', error);
      toast.error(isFr ? 'Erreur' : 'Error');
    }
    setSendingWeeklyEmails(false);
  };

  // Progress photos management
  const fetchUsersProgressPhotos = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/admin/progress-photos`, { headers: getAuthHeaders() });
      setUsersProgressPhotos(response.data.users || []);
    } catch (error) {
      console.error('Error fetching progress photos:', error);
    }
  }, []);

  const fetchUserProgressPhotos = async (userId) => {
    try {
      const response = await axios.get(`${API}/admin/user/${userId}/progress-photos`, { headers: getAuthHeaders() });
      setSelectedUserPhotos(response.data);
    } catch (error) {
      console.error('Error fetching user photos:', error);
      toast.error(isFr ? 'Erreur' : 'Error');
    }
  };

  const fetchUsersWithMessages = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/admin/messages/users-with-messages`, { headers: getAuthHeaders() });
      setUsersWithMessages(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users with messages:', error);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/admin/messages/unread-count`, { headers: getAuthHeaders() });
      setUnreadCount(response.data.unread_count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, []);

  const fetchConversation = async (userId) => {
    try {
      const response = await axios.get(`${API}/messages/conversation/${userId}`, { headers: getAuthHeaders() });
      setSelectedConversation(response.data.user);
      setConversationMessages(response.data.messages || []);
      fetchUnreadCount();
      fetchUsersWithMessages();
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    try {
      await axios.post(`${API}/messages/send`, {
        content: newMessage,
        recipient_id: selectedConversation.user_id
      }, { headers: getAuthHeaders() });
      
      setNewMessage('');
      fetchConversation(selectedConversation.user_id);
      toast.success(isFr ? 'Message envoyé!' : 'Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(isFr ? 'Erreur' : 'Error');
    }
  };

  // Routine management functions
  const updateRoutineExercise = async (routineId, exerciseIndex, updates) => {
    setSaving(true);
    try {
      await axios.put(
        `${API}/admin/routines/${routineId}/exercises/${exerciseIndex}`,
        updates,
        { headers: getAuthHeaders() }
      );
      toast.success(isFr ? 'Exercice mis à jour!' : 'Exercise updated!');
      setEditingRoutineExercise(null);
      fetchRoutines();
    } catch (error) {
      console.error('Error updating routine exercise:', error);
      toast.error(isFr ? 'Erreur' : 'Error');
    }
    setSaving(false);
  };

  const addRoutineExercise = async (routineId) => {
    if (!newRoutineExercise.name) {
      toast.error(isFr ? 'Veuillez entrer le nom de l\'exercice' : 'Please enter exercise name');
      return;
    }
    setSaving(true);
    try {
      await axios.post(
        `${API}/admin/routines/${routineId}/exercises`,
        newRoutineExercise,
        { headers: getAuthHeaders() }
      );
      toast.success(isFr ? 'Exercice ajouté!' : 'Exercise added!');
      setNewRoutineExercise({
        name: '',
        description: '',
        duration: '30 secondes',
        image_url: '',
        video_url: ''
      });
      fetchRoutines();
    } catch (error) {
      console.error('Error adding routine exercise:', error);
      toast.error(isFr ? 'Erreur' : 'Error');
    }
    setSaving(false);
  };

  const deleteRoutineExercise = async (routineId, exerciseIndex) => {
    if (!window.confirm(isFr ? 'Supprimer cet exercice ?' : 'Delete this exercise?')) return;
    try {
      await axios.delete(
        `${API}/admin/routines/${routineId}/exercises/${exerciseIndex}`,
        { headers: getAuthHeaders() }
      );
      toast.success(isFr ? 'Exercice supprimé' : 'Exercise deleted');
      fetchRoutines();
    } catch (error) {
      console.error('Error deleting routine exercise:', error);
      toast.error(isFr ? 'Erreur' : 'Error');
    }
  };

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

  // Fetch live analytics
  const fetchLiveAnalytics = useCallback(async () => {
    setLoadingLiveAnalytics(true);
    try {
      const response = await axios.get(`${API}/lives/analytics`, { headers: getAuthHeaders() });
      setLiveAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching live analytics:', error);
    } finally {
      setLoadingLiveAnalytics(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchSubscribers(),
        fetchWorkoutAnalytics(),
        fetchWorkouts(),
        fetchSupplements(),
        fetchUserProgress(),
        fetchUsersWithMessages(),
        fetchUnreadCount(),
        fetchRoutines(),
        fetchRoutineStats(),
        fetchRoutineSessions(),
        fetchEvolutionData(),
        fetchAllSubscribersEvolution(),
        fetchAlertsHistory(),
        fetchAllReviews(),
        fetchSocialLinks(),
        fetchUploadedVideos(),
        fetchUsersProgressPhotos(),
        fetchRunningStats(),
        fetchAllRunningData(),
        fetchInactiveUsers(),
        fetchCancellationRequests(),
        fetchWeeklyEmailSettings(),
        fetchEmailHistory()
      ]);
      setLoading(false);
    };
    loadData();
  }, [fetchStats, fetchSubscribers, fetchWorkoutAnalytics, fetchWorkouts, fetchSupplements, fetchUserProgress, fetchUsersWithMessages, fetchUnreadCount, fetchRoutines, fetchRoutineStats, fetchRoutineSessions, fetchEvolutionData, fetchAllSubscribersEvolution, fetchAlertsHistory, fetchAllReviews, fetchSocialLinks, fetchUploadedVideos, fetchUsersProgressPhotos, fetchRunningStats, fetchAllRunningData, fetchInactiveUsers, fetchCancellationRequests, fetchWeeklyEmailSettings, fetchEmailHistory]);

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
              { id: 'coaching', icon: UserCog, label: isFr ? 'Coaching' : 'Coaching' },
              { id: 'progress', icon: TrendingUp, label: isFr ? 'Progrès' : 'Progress' },
              { id: 'running', icon: Footprints, label: isFr ? 'Course à Pied' : 'Running' },
              { id: 'discipline', icon: Timer, label: isFr ? 'Discipline' : 'Discipline' },
              { id: 'reviews', icon: MessageCircle, label: isFr ? 'Avis' : 'Reviews', badge: allReviews.length },
              { id: 'photos', icon: Image, label: isFr ? 'Photos Avant/Après' : 'Before/After Photos' },
              { id: 'messages', icon: MessageCircle, label: isFr ? 'Messages' : 'Messages', badge: unreadCount },
              { id: 'alerts', icon: AlertTriangle, label: isFr ? 'Alertes Inactifs' : 'Inactive Alerts' },
              { id: 'motivation', icon: Mail, label: isFr ? 'Emails Motivation' : 'Motivation Emails' },
              { id: 'subscriptions', icon: Crown, label: isFr ? 'Abonnements' : 'Subscriptions' },
              { id: 'social', icon: Users, label: isFr ? 'Réseaux Sociaux' : 'Social Media' },
              { id: 'live-analytics', icon: Video, label: isFr ? 'Stats Lives' : 'Live Stats' },
              { id: 'videos', icon: Video, label: isFr ? 'Vidéos' : 'Videos' },
              { id: 'analytics', icon: Activity, label: isFr ? 'Analytiques' : 'Analytics' },
              { id: 'workouts', icon: Dumbbell, label: isFr ? 'Séances' : 'Workouts' },
              { id: 'routines', icon: Flame, label: isFr ? 'Échauffement/Étirements' : 'Warm-Up/Stretching' },
              { id: 'create-workout', icon: Plus, label: isFr ? 'Créer Séance' : 'Create Workout' },
              { id: 'supplements', icon: Pill, label: isFr ? 'Nutrition' : 'Nutrition' }
            ].map(tab => (
              <Button
                key={tab.id}
                data-testid={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                className={`flex items-center gap-2 relative ${
                  activeTab === tab.id 
                    ? 'bg-[#EF4444] text-white' 
                    : 'border-[#27272a] text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </Button>
            ))}
          </div>

          {/* Dashboard Tab - Using refactored component */}
          {activeTab === 'dashboard' && (
            <AdminDashboard stats={stats} isFr={isFr} />
          )}

          {/* Subscribers Tab - NEW Users Manager */}
          {activeTab === 'subscribers' && (
            <AdminUsersManager />
          )}

          {/* Coaching Tab - All Subscribers Evolution & Alerts */}
          {activeTab === 'coaching' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <UserCog className="w-5 h-5 text-blue-400" />
                  {isFr ? 'Coaching - Suivi des Abonnés' : 'Coaching - Subscriber Tracking'}
                </h2>
                <div className="flex gap-2">
                  <Button
                    onClick={() => sendInactivityAlerts(3)}
                    disabled={sendingAlerts}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    {sendingAlerts ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4 mr-2" />
                    )}
                    {isFr ? 'Alerter inactifs (3j+)' : 'Alert inactive (3d+)'}
                  </Button>
                  <Button
                    onClick={() => sendInactivityAlerts(7)}
                    disabled={sendingAlerts}
                    variant="outline"
                    className="border-red-500 text-red-400 hover:bg-red-500/10"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    {isFr ? 'Alerter (7j+)' : 'Alert (7d+)'}
                  </Button>
                </div>
              </div>

              <p className="text-gray-400 text-sm">
                {isFr 
                  ? 'Suivez l\'évolution de tous vos abonnés, identifiez ceux qui ont besoin d\'encouragement et envoyez des alertes automatiques.'
                  : 'Track all your subscribers\' progress, identify those who need encouragement, and send automatic alerts.'}
              </p>

              {/* Subscribers Overview Table */}
              <div className="bg-[#121212] border border-[#27272a] rounded-lg overflow-hidden">
                <div className="p-4 border-b border-[#27272a] flex items-center justify-between">
                  <h3 className="font-bold flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#EF4444]" />
                    {isFr ? 'Tous les Abonnés' : 'All Subscribers'} ({allSubscribersEvolution.length})
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={fetchAllSubscribersEvolution}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-[#1a1a1a] sticky top-0">
                      <tr>
                        <th className="text-left p-3 text-gray-400 text-sm">{isFr ? 'Abonné' : 'Subscriber'}</th>
                        <th className="text-left p-3 text-gray-400 text-sm">{isFr ? 'Plan' : 'Plan'}</th>
                        <th className="text-left p-3 text-gray-400 text-sm">{isFr ? 'Séances (30j)' : 'Workouts (30d)'}</th>
                        <th className="text-left p-3 text-gray-400 text-sm">{isFr ? 'Échauff.' : 'Warm-Up'}</th>
                        <th className="text-left p-3 text-gray-400 text-sm">{isFr ? 'Étir.' : 'Stretch'}</th>
                        <th className="text-left p-3 text-gray-400 text-sm">{isFr ? 'Discipline' : 'Discipline'}</th>
                        <th className="text-left p-3 text-gray-400 text-sm">{isFr ? 'Inactif' : 'Inactive'}</th>
                        <th className="text-left p-3 text-gray-400 text-sm">{isFr ? 'Actions' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allSubscribersEvolution.map((sub, idx) => (
                        <tr key={idx} className={`border-t border-[#27272a] hover:bg-[#1a1a1a] ${
                          sub.status === 'inactive' ? 'bg-red-500/5' : 
                          sub.status === 'warning' ? 'bg-yellow-500/5' : ''
                        }`}>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                sub.status === 'active' ? 'bg-green-500' :
                                sub.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                              }`} />
                              <div>
                                <p className="font-medium">{sub.name}</p>
                                <p className="text-gray-500 text-xs">{sub.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${getSubscriptionColor(sub.subscription)}`}>
                              {sub.subscription?.toUpperCase() || 'NONE'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-[#EF4444] font-bold">{sub.workouts_30d}</span>
                          </td>
                          <td className="p-3">
                            <span className="text-orange-400">{sub.warmups_30d}</span>
                          </td>
                          <td className="p-3">
                            <span className="text-purple-400">{sub.stretching_30d}</span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-[#27272a] rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    sub.discipline_score >= 70 ? 'bg-green-500' :
                                    sub.discipline_score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${sub.discipline_score}%` }}
                                />
                              </div>
                              <span className={`text-sm font-bold ${
                                sub.discipline_score >= 70 ? 'text-green-400' :
                                sub.discipline_score >= 40 ? 'text-yellow-400' : 'text-red-400'
                              }`}>
                                {sub.discipline_score}%
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            {sub.days_inactive < 999 ? (
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                sub.days_inactive <= 3 ? 'bg-green-500/20 text-green-400' :
                                sub.days_inactive <= 7 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                                {sub.days_inactive}j
                              </span>
                            ) : (
                              <span className="text-gray-500 text-xs">{isFr ? 'Jamais' : 'Never'}</span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => fetchUserEvolution(sub.user_id)}
                                className="text-green-400"
                                title={isFr ? "Voir évolution" : "View evolution"}
                              >
                                <TrendingUp className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => fetchUserRoutineSessions(sub.user_id)}
                                className="text-blue-400"
                                title={isFr ? "Voir détails" : "View details"}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Selected User Evolution Chart */}
              {selectedUserEvolution && (
                <div className="bg-[#121212] border border-blue-500/30 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                      {selectedUserEvolution.user?.name} - {isFr ? 'Évolution Mensuelle' : 'Monthly Evolution'}
                    </h3>
                    <Button variant="ghost" onClick={() => setSelectedUserEvolution(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {selectedUserEvolution.evolution?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsLineChart data={selectedUserEvolution.evolution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="week" stroke="#666" tickFormatter={(val) => val.slice(5)} />
                        <YAxis stroke="#666" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#121212', border: '1px solid #27272a', borderRadius: '8px' }}
                          labelStyle={{ color: '#fff' }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="discipline_score" name={isFr ? "Score Discipline %" : "Discipline Score %"} stroke="#22C55E" strokeWidth={3} dot={{ fill: '#22C55E' }} />
                        <Line type="monotone" dataKey="workouts_completed" name={isFr ? "Séances" : "Workouts"} stroke="#EF4444" strokeWidth={2} />
                        <Line type="monotone" dataKey="warmups_completed" name={isFr ? "Échauffements" : "Warm-Ups"} stroke="#F97316" strokeWidth={2} />
                        <Line type="monotone" dataKey="stretching_completed" name={isFr ? "Étirements" : "Stretching"} stroke="#A855F7" strokeWidth={2} />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-500 text-center py-8">{isFr ? 'Pas assez de données' : 'Not enough data'}</p>
                  )}
                </div>
              )}

              {/* Alerts History */}
              {alertsHistory.length > 0 && (
                <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-orange-400" />
                    {isFr ? 'Historique des Alertes Envoyées' : 'Sent Alerts History'}
                  </h3>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {alertsHistory.slice(0, 20).map((alert, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-[#09090b] rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-orange-400" />
                          <div>
                            <p className="font-medium text-sm">{alert.user_email}</p>
                            <p className="text-gray-500 text-xs">
                              {new Date(alert.sent_at).toLocaleString(isFr ? 'fr-FR' : 'en-US')}
                            </p>
                          </div>
                        </div>
                        <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs">
                          {alert.days_inactive}j {isFr ? 'inactif' : 'inactive'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-yellow-400" />
                {isFr ? 'Gestion des Avis Clients' : 'Customer Reviews Management'}
              </h2>

              {/* Stats */}
              {reviewStats && (
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <div className="bg-[#121212] border border-[#27272a] rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-yellow-400">{reviewStats.average_rating}</p>
                    <p className="text-gray-500 text-xs">{isFr ? 'Note moyenne' : 'Avg Rating'}</p>
                  </div>
                  <div className="bg-[#121212] border border-[#27272a] rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold">{reviewStats.total}</p>
                    <p className="text-gray-500 text-xs">{isFr ? 'Total' : 'Total'}</p>
                  </div>
                  {[5,4,3,2,1].map(star => (
                    <div key={star} className="bg-[#121212] border border-[#27272a] rounded-lg p-3 text-center">
                      <p className="text-xl font-bold">{reviewStats.distribution?.[star] || 0}</p>
                      <p className="text-gray-500 text-xs flex items-center justify-center gap-1">
                        {star} <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {allReviews.length === 0 ? (
                  <div className="bg-[#121212] border border-[#27272a] rounded-lg p-8 text-center">
                    <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">{isFr ? 'Aucun avis' : 'No reviews'}</p>
                  </div>
                ) : (
                  allReviews.map(review => (
                    <div key={review.review_id} className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="font-bold">{review.user_name}</span>
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} />
                              ))}
                            </div>
                            <span className="text-gray-500 text-xs">
                              {new Date(review.created_at).toLocaleDateString(isFr ? 'fr-FR' : 'en-US')}
                            </span>
                            {/* Badge abonné vérifié */}
                            {review.verified_subscriber && (
                              <span className="flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                                <CheckCircle className="w-3 h-3" />
                                {isFr ? 'Vérifié' : 'Verified'}
                              </span>
                            )}
                            {/* Badge tier */}
                            {review.subscription_tier === 'vip' && (
                              <span className="flex items-center gap-1 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                                <Award className="w-3 h-3" />
                                VIP
                              </span>
                            )}
                            {!review.is_public && (
                              <span className="bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded text-xs">
                                {isFr ? 'Privé' : 'Private'}
                              </span>
                            )}
                            {/* Likes count */}
                            {(review.likes_count > 0 || review.admin_liked) && (
                              <span className="flex items-center gap-1 text-xs text-gray-400">
                                <Heart className={`w-3 h-3 ${review.admin_liked ? 'fill-red-400 text-red-400' : ''}`} />
                                {review.likes_count || 0}
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold mb-1">{review.title}</h3>
                          <p className="text-gray-400 text-sm">{review.content}</p>
                          
                          {/* Admin liked indicator */}
                          {review.admin_liked && (
                            <div className="mt-2">
                              <span className="inline-flex items-center gap-1 text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                                <Heart className="w-3 h-3 fill-current" />
                                {isFr ? 'Vous avez aimé' : 'You liked this'}
                              </span>
                            </div>
                          )}
                          
                          {/* Admin Response */}
                          {review.admin_response && (
                            <div className="mt-3 bg-green-500/10 border border-green-500/30 rounded p-3">
                              <p className="text-green-400 text-xs mb-1 font-bold">{isFr ? 'Votre réponse:' : 'Your response:'}</p>
                              <p className="text-gray-300 text-sm">{review.admin_response}</p>
                            </div>
                          )}
                          
                          {/* Reply Form */}
                          {replyingTo === review.review_id && (
                            <div className="mt-3 flex gap-2">
                              <Input
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder={isFr ? "Votre réponse..." : "Your response..."}
                                className="bg-[#09090b] border-[#27272a] flex-1"
                              />
                              <Button onClick={() => respondToReview(review.review_id)} className="bg-green-500">
                                <Send className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" onClick={() => { setReplyingTo(null); setReplyText(''); }}>
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          {/* Like button */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => adminLikeReview(review.review_id)}
                            className={`${review.admin_liked ? 'border-red-500 text-red-400 bg-red-500/10' : 'border-gray-500/30 text-gray-400'}`}
                            data-testid={`admin-like-${review.review_id}`}
                          >
                            <Heart className={`w-4 h-4 ${review.admin_liked ? 'fill-current' : ''}`} />
                          </Button>
                          {/* Reply button */}
                          {!review.admin_response && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setReplyingTo(review.review_id)}
                              className="border-green-500/30 text-green-400"
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          )}
                          {/* Delete button */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteReview(review.review_id)}
                            className="border-red-500/30 text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Image className="w-5 h-5 text-green-400" />
                {isFr ? 'Photos Avant/Après des Abonnés' : 'Subscribers Before/After Photos'}
              </h2>
              <p className="text-gray-400 text-sm">
                {isFr 
                  ? 'Visualisez la progression de vos abonnés grâce à leurs photos avant et après.'
                  : 'View your subscribers\' progress through their before and after photos.'}
              </p>

              {/* Users with photos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {usersProgressPhotos.length === 0 ? (
                  <div className="col-span-full bg-[#121212] border border-[#27272a] rounded-lg p-8 text-center">
                    <Image className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">{isFr ? 'Aucune photo de progression' : 'No progress photos'}</p>
                  </div>
                ) : (
                  usersProgressPhotos.map(userPhotos => (
                    <div 
                      key={userPhotos.user_id} 
                      className="bg-[#121212] border border-[#27272a] rounded-lg p-4 cursor-pointer hover:border-green-500/50 transition-colors"
                      onClick={() => fetchUserProgressPhotos(userPhotos.user_id)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold">{userPhotos.user_name}</h3>
                        <Eye className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <p className="text-orange-400 text-xs mb-1">{isFr ? 'AVANT' : 'BEFORE'}</p>
                          {userPhotos.before_photos.length > 0 ? (
                            <img 
                              src={userPhotos.before_photos[0].photo_url} 
                              alt="Before" 
                              className="w-full h-24 object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-24 bg-[#09090b] rounded flex items-center justify-center">
                              <span className="text-gray-600 text-xs">0</span>
                            </div>
                          )}
                          <p className="text-center text-gray-500 text-xs mt-1">{userPhotos.before_photos.length} photos</p>
                        </div>
                        <div className="flex-1">
                          <p className="text-green-400 text-xs mb-1">{isFr ? 'APRÈS' : 'AFTER'}</p>
                          {userPhotos.after_photos.length > 0 ? (
                            <img 
                              src={userPhotos.after_photos[0].photo_url} 
                              alt="After" 
                              className="w-full h-24 object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-24 bg-[#09090b] rounded flex items-center justify-center">
                              <span className="text-gray-600 text-xs">0</span>
                            </div>
                          )}
                          <p className="text-center text-gray-500 text-xs mt-1">{userPhotos.after_photos.length} photos</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Selected user photos detail */}
              {selectedUserPhotos && (
                <div className="bg-[#121212] border border-green-500/30 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">
                      {selectedUserPhotos.user?.name} - {isFr ? 'Progression' : 'Progress'}
                    </h3>
                    <Button variant="ghost" onClick={() => setSelectedUserPhotos(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-orange-400 font-bold mb-3">{isFr ? 'PHOTOS AVANT' : 'BEFORE PHOTOS'}</h4>
                      <div className="space-y-3">
                        {selectedUserPhotos.before_photos?.map((photo, idx) => (
                          <div key={idx} className="bg-[#09090b] rounded-lg overflow-hidden">
                            <img src={photo.photo_url} alt="Before" className="w-full h-48 object-cover" />
                            <div className="p-3">
                              <p className="text-gray-500 text-xs">
                                {new Date(photo.created_at).toLocaleDateString(isFr ? 'fr-FR' : 'en-US')}
                                {photo.weight_kg && ` • ${photo.weight_kg} kg`}
                              </p>
                              {photo.notes && <p className="text-gray-400 text-sm mt-1">{photo.notes}</p>}
                            </div>
                          </div>
                        ))}
                        {selectedUserPhotos.before_photos?.length === 0 && (
                          <p className="text-gray-500 text-center py-4">{isFr ? 'Aucune photo' : 'No photos'}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-green-400 font-bold mb-3">{isFr ? 'PHOTOS APRÈS' : 'AFTER PHOTOS'}</h4>
                      <div className="space-y-3">
                        {selectedUserPhotos.after_photos?.map((photo, idx) => (
                          <div key={idx} className="bg-[#09090b] rounded-lg overflow-hidden">
                            <img src={photo.photo_url} alt="After" className="w-full h-48 object-cover" />
                            <div className="p-3">
                              <p className="text-gray-500 text-xs">
                                {new Date(photo.created_at).toLocaleDateString(isFr ? 'fr-FR' : 'en-US')}
                                {photo.weight_kg && ` • ${photo.weight_kg} kg`}
                              </p>
                              {photo.notes && <p className="text-gray-400 text-sm mt-1">{photo.notes}</p>}
                            </div>
                          </div>
                        ))}
                        {selectedUserPhotos.after_photos?.length === 0 && (
                          <p className="text-gray-500 text-center py-4">{isFr ? 'Aucune photo' : 'No photos'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Inactive Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                {isFr ? 'Utilisateurs Inactifs' : 'Inactive Users'}
              </h2>
              <p className="text-gray-400 text-sm">
                {isFr 
                  ? 'Identifiez les abonnés inactifs et envoyez-leur des rappels pour les encourager à reprendre l\'entraînement.'
                  : 'Identify inactive subscribers and send them reminders to encourage them to resume training.'}
              </p>

              {/* Threshold selector */}
              <div className="bg-[#121212] border border-[#27272a] rounded-lg p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <label className="text-sm text-gray-400">
                    {isFr ? 'Inactifs depuis:' : 'Inactive for:'}
                  </label>
                  <div className="flex gap-2">
                    {[3, 7, 14, 30].map(days => (
                      <Button
                        key={days}
                        size="sm"
                        variant={inactiveDaysThreshold === days ? 'default' : 'outline'}
                        onClick={() => setInactiveDaysThreshold(days)}
                        className={inactiveDaysThreshold === days ? 'bg-orange-500' : 'border-[#27272a]'}
                      >
                        {days} {isFr ? 'jours' : 'days'}
                      </Button>
                    ))}
                  </div>
                  <Button onClick={fetchInactiveUsers} variant="outline" className="border-[#27272a] ml-auto">
                    <RefreshCw className={`w-4 h-4 mr-2 ${loadingInactive ? 'animate-spin' : ''}`} />
                    {isFr ? 'Actualiser' : 'Refresh'}
                  </Button>
                </div>
              </div>

              {/* Custom message */}
              <div className="bg-[#121212] border border-[#27272a] rounded-lg p-4">
                <label className="text-sm text-gray-400 mb-2 block">
                  {isFr ? 'Message personnalisé (optionnel):' : 'Custom message (optional):'}
                </label>
                <Input
                  value={customReminderMessage}
                  onChange={(e) => setCustomReminderMessage(e.target.value)}
                  placeholder={isFr ? "Vous nous manquez ! Revenez sur FitMaxPro..." : "We miss you! Come back to FitMaxPro..."}
                  className="bg-[#09090b] border-[#27272a]"
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#121212] border border-[#27272a] rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-orange-400">{inactiveUsers.length}</p>
                  <p className="text-gray-400 text-sm">{isFr ? 'Utilisateurs inactifs' : 'Inactive users'}</p>
                </div>
                <div className="bg-[#121212] border border-[#27272a] rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-yellow-400">{selectedInactiveUsers.length}</p>
                  <p className="text-gray-400 text-sm">{isFr ? 'Sélectionnés' : 'Selected'}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={() => setSelectedInactiveUsers(inactiveUsers.map(u => u.user_id))}
                  variant="outline"
                  className="border-[#27272a]"
                >
                  {isFr ? 'Tout sélectionner' : 'Select all'}
                </Button>
                <Button
                  onClick={() => setSelectedInactiveUsers([])}
                  variant="outline"
                  className="border-[#27272a]"
                >
                  {isFr ? 'Tout désélectionner' : 'Deselect all'}
                </Button>
                <Button
                  onClick={sendRemindersToInactive}
                  className="bg-orange-500 hover:bg-orange-600 ml-auto"
                  disabled={selectedInactiveUsers.length === 0 || sendingAlerts}
                >
                  {sendingAlerts ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4 mr-2" />
                  )}
                  {isFr ? `Envoyer rappel (${selectedInactiveUsers.length})` : `Send reminder (${selectedInactiveUsers.length})`}
                </Button>
              </div>

              {/* Inactive users list */}
              <div className="bg-[#121212] border border-[#27272a] rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#1a1a1a]">
                    <tr>
                      <th className="w-12 p-4"></th>
                      <th className="text-left p-4 text-gray-400 text-sm">{isFr ? 'Nom' : 'Name'}</th>
                      <th className="text-left p-4 text-gray-400 text-sm">Email</th>
                      <th className="text-left p-4 text-gray-400 text-sm">{isFr ? 'Abonnement' : 'Subscription'}</th>
                      <th className="text-left p-4 text-gray-400 text-sm">{isFr ? 'Dernière activité' : 'Last activity'}</th>
                      <th className="text-left p-4 text-gray-400 text-sm">{isFr ? 'Jours inactifs' : 'Days inactive'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inactiveUsers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-gray-400">
                          {loadingInactive ? (
                            <RefreshCw className="w-6 h-6 animate-spin mx-auto" />
                          ) : (
                            isFr ? 'Aucun utilisateur inactif trouvé' : 'No inactive users found'
                          )}
                        </td>
                      </tr>
                    ) : (
                      inactiveUsers.map(user => (
                        <tr key={user.user_id} className="border-t border-[#27272a] hover:bg-[#1a1a1a]">
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={selectedInactiveUsers.includes(user.user_id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedInactiveUsers([...selectedInactiveUsers, user.user_id]);
                                } else {
                                  setSelectedInactiveUsers(selectedInactiveUsers.filter(id => id !== user.user_id));
                                }
                              }}
                              className="w-4 h-4 rounded"
                            />
                          </td>
                          <td className="p-4 font-medium">{user.name}</td>
                          <td className="p-4 text-gray-400">{user.email}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs ${getTierBadge(user.subscription_tier)}`}>
                              {user.subscription_tier?.toUpperCase() || 'NONE'}
                            </span>
                          </td>
                          <td className="p-4 text-gray-400">
                            {user.last_activity ? formatDate(user.last_activity) : (isFr ? 'Jamais' : 'Never')}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              user.days_inactive > 14 ? 'bg-red-500/20 text-red-400' : 
                              user.days_inactive > 7 ? 'bg-orange-500/20 text-orange-400' : 
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {user.days_inactive} {isFr ? 'jours' : 'days'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Motivation Emails Tab */}
          {activeTab === 'motivation' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Mail className="w-5 h-5 text-green-400" />
                {isFr ? 'Emails de Motivation Hebdomadaires' : 'Weekly Motivation Emails'}
              </h2>
              <p className="text-gray-400 text-sm">
                {isFr 
                  ? 'Envoyez des emails personnalisés résumant les accomplissements de vos abonnés pour les motiver.'
                  : 'Send personalized emails summarizing your subscribers\' achievements to motivate them.'}
              </p>

              {/* Send Now Button */}
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-green-400 text-lg">
                      {isFr ? 'Envoyer maintenant' : 'Send Now'}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {isFr 
                        ? 'Envoie un email de motivation à tous les abonnés actifs avec leur résumé hebdomadaire.'
                        : 'Send a motivation email to all active subscribers with their weekly summary.'}
                    </p>
                  </div>
                  <Button
                    onClick={sendWeeklyEmailsNow}
                    className="bg-green-500 hover:bg-green-600 px-8"
                    disabled={sendingWeeklyEmails}
                  >
                    {sendingWeeklyEmails ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    {isFr ? 'Envoyer les emails' : 'Send emails'}
                  </Button>
                </div>
              </div>

              {/* Settings */}
              <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6 space-y-4">
                <h3 className="font-bold flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-400" />
                  {isFr ? 'Paramètres des emails' : 'Email Settings'}
                </h3>

                {/* Content options */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={weeklyEmailSettings.include_running_stats}
                      onChange={(e) => setWeeklyEmailSettings({...weeklyEmailSettings, include_running_stats: e.target.checked})}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm">{isFr ? 'Stats Course' : 'Running Stats'}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={weeklyEmailSettings.include_workout_stats}
                      onChange={(e) => setWeeklyEmailSettings({...weeklyEmailSettings, include_workout_stats: e.target.checked})}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm">{isFr ? 'Stats Séances' : 'Workout Stats'}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={weeklyEmailSettings.include_points_earned}
                      onChange={(e) => setWeeklyEmailSettings({...weeklyEmailSettings, include_points_earned: e.target.checked})}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm">{isFr ? 'Points Gagnés' : 'Points Earned'}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={weeklyEmailSettings.include_leaderboard_position}
                      onChange={(e) => setWeeklyEmailSettings({...weeklyEmailSettings, include_leaderboard_position: e.target.checked})}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm">{isFr ? 'Position Classement' : 'Leaderboard Position'}</span>
                  </label>
                </div>

                {/* Custom intro */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    {isFr ? 'Message d\'introduction personnalisé (Français):' : 'Custom intro message (French):'}
                  </label>
                  <Input
                    value={weeklyEmailSettings.custom_intro_fr || ''}
                    onChange={(e) => setWeeklyEmailSettings({...weeklyEmailSettings, custom_intro_fr: e.target.value})}
                    placeholder={isFr ? "Voici votre résumé hebdomadaire..." : "Here's your weekly summary..."}
                    className="bg-[#09090b] border-[#27272a]"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    {isFr ? 'Message d\'introduction personnalisé (Anglais):' : 'Custom intro message (English):'}
                  </label>
                  <Input
                    value={weeklyEmailSettings.custom_intro_en || ''}
                    onChange={(e) => setWeeklyEmailSettings({...weeklyEmailSettings, custom_intro_en: e.target.value})}
                    placeholder="Here's your weekly FitMaxPro summary..."
                    className="bg-[#09090b] border-[#27272a]"
                  />
                </div>

                <Button onClick={saveWeeklyEmailSettings} className="bg-[#EF4444]">
                  <Save className="w-4 h-4 mr-2" />
                  {isFr ? 'Sauvegarder les paramètres' : 'Save settings'}
                </Button>
              </div>

              {/* Email Preview */}
              <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-400" />
                  {isFr ? 'Aperçu de l\'email' : 'Email Preview'}
                </h3>
                <div className="bg-[#0a0a0a] rounded-lg p-6 border border-[#27272a]">
                  <h4 className="text-center text-[#EF4444] text-2xl font-bold mb-2">FITMAXPRO</h4>
                  <p className="text-center text-gray-500 mb-6">{isFr ? 'Résumé Hebdomadaire' : 'Weekly Summary'}</p>
                  <h5 className="text-center text-xl mb-4">{isFr ? 'Salut [Nom] ! 👋' : 'Hey [Name]! 👋'}</h5>
                  <p className="text-center text-gray-400 mb-6">
                    {weeklyEmailSettings.custom_intro_fr || (isFr ? 'Voici votre résumé hebdomadaire FitMaxPro !' : 'Here\'s your weekly FitMaxPro summary!')}
                  </p>
                  <div className="bg-[#1a1a1a] rounded-lg p-4 mb-6">
                    <h6 className="text-[#EF4444] font-bold mb-3">{isFr ? 'Vos accomplissements' : 'Your achievements'}</h6>
                    {weeklyEmailSettings.include_running_stats && <p className="my-2">🏃 X km {isFr ? 'parcourus' : 'run'}</p>}
                    {weeklyEmailSettings.include_workout_stats && <p className="my-2">💪 X {isFr ? 'séances complétées' : 'workouts completed'}</p>}
                    {weeklyEmailSettings.include_points_earned && <p className="my-2">⭐ X {isFr ? 'points gagnés' : 'points earned'}</p>}
                  </div>
                  <p className="text-center text-[#EF4444] font-bold text-lg mb-6">
                    🔥 {isFr ? 'INCROYABLE ! Vous êtes sur une lancée exceptionnelle !' : 'AMAZING! You\'re on an incredible streak!'}
                  </p>
                  <div className="text-center">
                    <span className="bg-[#EF4444] text-white px-6 py-3 rounded-lg inline-block">
                      {isFr ? 'Continuer l\'entraînement' : 'Continue Training'}
                    </span>
                  </div>
                </div>
              </div>

              {/* History */}
              <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {isFr ? 'Historique des envois' : 'Send History'}
                  </h3>
                  {emailHistory.pending_count > 0 && (
                    <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs">
                      {emailHistory.pending_count} {isFr ? 'en attente' : 'pending'}
                    </span>
                  )}
                </div>
                <div className="space-y-2 max-h-60 overflow-auto">
                  {emailHistory.batches?.length > 0 ? (
                    emailHistory.batches.map((batch, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-[#27272a]">
                        <div>
                          <span className="text-gray-400">{formatDate(batch.sent_at)}</span>
                          <span className="text-gray-500 text-sm ml-2">({batch.type})</span>
                        </div>
                        <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">
                          {batch.results?.sent || 0} {isFr ? 'envoyés' : 'sent'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      {isFr ? 'Aucun envoi pour le moment' : 'No sends yet'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Subscriptions Tab */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                {isFr ? 'Gestion des Abonnements' : 'Subscription Management'}
              </h2>
              <p className="text-gray-400 text-sm">
                {isFr 
                  ? 'Gérez les demandes d\'annulation et les abonnements annuels.'
                  : 'Manage cancellation requests and annual subscriptions.'}
              </p>

              {/* Cancellation Requests */}
              <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    {isFr ? 'Demandes d\'annulation' : 'Cancellation Requests'}
                  </h3>
                  <Button onClick={fetchCancellationRequests} variant="ghost" size="sm">
                    <RefreshCw className={`w-4 h-4 ${loadingCancellations ? 'animate-spin' : ''}`} />
                  </Button>
                </div>

                {cancellationRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Crown className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    {isFr ? 'Aucune demande d\'annulation en attente' : 'No pending cancellation requests'}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cancellationRequests.filter(r => r.status === 'pending').map(request => (
                      <div key={request.request_id} className="bg-[#1a1a1a] border border-[#27272a] rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold">{request.user_email}</p>
                            <p className="text-sm text-gray-400">
                              {isFr ? 'Plan:' : 'Plan:'} {request.plan_type?.toUpperCase() || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-400">
                              {isFr ? 'Date:' : 'Date:'} {formatDate(request.created_at)}
                            </p>
                            {request.reason && (
                              <p className="text-sm text-orange-400 mt-2">
                                {isFr ? 'Raison:' : 'Reason:'} {request.reason}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => processCancellationRequest(request.request_id, 'reject')}
                              className="border-red-500/30 text-red-400"
                            >
                              <X className="w-4 h-4 mr-1" />
                              {isFr ? 'Refuser' : 'Reject'}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => processCancellationRequest(request.request_id, 'approve')}
                              className="bg-green-500"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              {isFr ? 'Approuver' : 'Approve'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Annual Subscription Info */}
              <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  {isFr ? 'Règles des Abonnements Annuels' : 'Annual Subscription Rules'}
                </h3>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-blue-400 text-sm">
                    {isFr 
                      ? '• Les abonnements annuels ont un engagement de 12 mois.\n• L\'annulation n\'est possible qu\'après la fin de la période d\'engagement.\n• Les demandes d\'annulation anticipées seront visibles ici pour traitement manuel.'
                      : '• Annual subscriptions have a 12-month commitment.\n• Cancellation is only possible after the commitment period ends.\n• Early cancellation requests will be visible here for manual processing.'}
                  </p>
                </div>
              </div>

              {/* History */}
              <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
                <h3 className="font-bold mb-4">{isFr ? 'Historique des annulations' : 'Cancellation History'}</h3>
                <div className="space-y-2 max-h-60 overflow-auto">
                  {cancellationRequests.filter(r => r.status !== 'pending').map(request => (
                    <div key={request.request_id} className="flex items-center justify-between py-2 border-b border-[#27272a]">
                      <span className="text-gray-400">{request.user_email}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        request.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {request.status === 'approved' 
                          ? (isFr ? 'Approuvée' : 'Approved') 
                          : (isFr ? 'Refusée' : 'Rejected')}
                      </span>
                    </div>
                  ))}
                  {cancellationRequests.filter(r => r.status !== 'pending').length === 0 && (
                    <p className="text-gray-500 text-center py-4">{isFr ? 'Aucun historique' : 'No history'}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Social Media Tab */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-pink-400" />
                {isFr ? 'Gestion des Réseaux Sociaux' : 'Social Media Management'}
              </h2>
              <p className="text-gray-400 text-sm">
                {isFr 
                  ? 'Ajoutez vos liens de réseaux sociaux. Ils seront affichés dans le footer du site et sur le Dashboard. Laissez un champ vide pour ne pas afficher ce réseau.'
                  : 'Add your social media links. They will be displayed in the site footer and Dashboard. Leave a field empty to hide that network.'}
              </p>

              {/* Info Alert */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-400 text-sm">
                  {isFr 
                    ? '💡 Conseil : Ajoutez uniquement les réseaux sociaux où vous êtes actif. Les liens vides ne seront pas affichés aux abonnés.'
                    : '💡 Tip: Only add social networks where you are active. Empty links will not be shown to subscribers.'}
                </p>
              </div>

              <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6 space-y-4">
                <h3 className="font-bold text-lg mb-4">{isFr ? 'Vos Réseaux Sociaux' : 'Your Social Networks'}</h3>
                
                {/* Instagram */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Instagram className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm text-gray-400 mb-1 block">Instagram</label>
                    <Input
                      value={socialLinks.instagram || ''}
                      onChange={(e) => setSocialLinks({...socialLinks, instagram: e.target.value})}
                      placeholder="https://instagram.com/votre-compte"
                      className="bg-[#09090b] border-[#27272a]"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() => saveSingleSocialLink('instagram')}
                    disabled={savingPlatform === 'instagram'}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {savingPlatform === 'instagram' ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </Button>
                  {socialLinks.instagram && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteSingleSocialLink('instagram')}
                      disabled={savingPlatform === 'instagram'}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                {/* YouTube */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm text-gray-400 mb-1 block">YouTube</label>
                    <Input
                      value={socialLinks.youtube || ''}
                      onChange={(e) => setSocialLinks({...socialLinks, youtube: e.target.value})}
                      placeholder="https://youtube.com/@votre-chaine"
                      className="bg-[#09090b] border-[#27272a]"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() => saveSingleSocialLink('youtube')}
                    disabled={savingPlatform === 'youtube'}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {savingPlatform === 'youtube' ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </Button>
                  {socialLinks.youtube && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteSingleSocialLink('youtube')}
                      disabled={savingPlatform === 'youtube'}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                {/* TikTok */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-black border border-[#27272a] rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs">TT</span>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm text-gray-400 mb-1 block">TikTok</label>
                    <Input
                      value={socialLinks.tiktok || ''}
                      onChange={(e) => setSocialLinks({...socialLinks, tiktok: e.target.value})}
                      placeholder="https://tiktok.com/@votre-compte"
                      className="bg-[#09090b] border-[#27272a]"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() => saveSingleSocialLink('tiktok')}
                    disabled={savingPlatform === 'tiktok'}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {savingPlatform === 'tiktok' ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </Button>
                  {socialLinks.tiktok && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteSingleSocialLink('tiktok')}
                      disabled={savingPlatform === 'tiktok'}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                {/* Facebook */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">f</span>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm text-gray-400 mb-1 block">Facebook</label>
                    <Input
                      value={socialLinks.facebook || ''}
                      onChange={(e) => setSocialLinks({...socialLinks, facebook: e.target.value})}
                      placeholder="https://facebook.com/votre-page"
                      className="bg-[#09090b] border-[#27272a]"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() => saveSingleSocialLink('facebook')}
                    disabled={savingPlatform === 'facebook'}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {savingPlatform === 'facebook' ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </Button>
                  {socialLinks.facebook && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteSingleSocialLink('facebook')}
                      disabled={savingPlatform === 'facebook'}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                {/* Snapchat */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-black font-bold text-lg">👻</span>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm text-gray-400 mb-1 block">Snapchat</label>
                    <Input
                      value={socialLinks.snapchat || ''}
                      onChange={(e) => setSocialLinks({...socialLinks, snapchat: e.target.value})}
                      placeholder="https://snapchat.com/add/votre-compte"
                      className="bg-[#09090b] border-[#27272a]"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() => saveSingleSocialLink('snapchat')}
                    disabled={savingPlatform === 'snapchat'}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {savingPlatform === 'snapchat' ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </Button>
                  {socialLinks.snapchat && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteSingleSocialLink('snapchat')}
                      disabled={savingPlatform === 'snapchat'}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                {/* Twitter/X */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-black border border-[#27272a] rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">X</span>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm text-gray-400 mb-1 block">X (Twitter)</label>
                    <Input
                      value={socialLinks.twitter || ''}
                      onChange={(e) => setSocialLinks({...socialLinks, twitter: e.target.value})}
                      placeholder="https://x.com/votre-compte"
                      className="bg-[#09090b] border-[#27272a]"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() => saveSingleSocialLink('twitter')}
                    disabled={savingPlatform === 'twitter'}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {savingPlatform === 'twitter' ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </Button>
                  {socialLinks.twitter && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteSingleSocialLink('twitter')}
                      disabled={savingPlatform === 'twitter'}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                {/* WhatsApp */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm text-gray-400 mb-1 block">WhatsApp</label>
                    <Input
                      value={socialLinks.whatsapp || ''}
                      onChange={(e) => setSocialLinks({...socialLinks, whatsapp: e.target.value})}
                      placeholder="https://wa.me/33612345678"
                      className="bg-[#09090b] border-[#27272a]"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() => saveSingleSocialLink('whatsapp')}
                    disabled={savingPlatform === 'whatsapp'}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {savingPlatform === 'whatsapp' ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </Button>
                  {socialLinks.whatsapp && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteSingleSocialLink('whatsapp')}
                      disabled={savingPlatform === 'whatsapp'}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                {/* Telegram */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm text-gray-400 mb-1 block">Telegram</label>
                    <Input
                      value={socialLinks.telegram || ''}
                      onChange={(e) => setSocialLinks({...socialLinks, telegram: e.target.value})}
                      placeholder="https://t.me/votre-compte"
                      className="bg-[#09090b] border-[#27272a]"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() => saveSingleSocialLink('telegram')}
                    disabled={savingPlatform === 'telegram'}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {savingPlatform === 'telegram' ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </Button>
                  {socialLinks.telegram && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteSingleSocialLink('telegram')}
                      disabled={savingPlatform === 'telegram'}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                {/* Website */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg">🌐</span>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm text-gray-400 mb-1 block">{isFr ? 'Site Web' : 'Website'}</label>
                    <Input
                      value={socialLinks.website || ''}
                      onChange={(e) => setSocialLinks({...socialLinks, website: e.target.value})}
                      placeholder="https://votre-site.com"
                      className="bg-[#09090b] border-[#27272a]"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() => saveSingleSocialLink('website')}
                    disabled={savingPlatform === 'website'}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {savingPlatform === 'website' ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </Button>
                  {socialLinks.website && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteSingleSocialLink('website')}
                      disabled={savingPlatform === 'website'}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-4 mt-6 pt-4 border-t border-[#27272a]">
                  <Button 
                    onClick={() => setSocialLinks({})} 
                    variant="outline" 
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isFr ? 'Tout supprimer' : 'Clear all'}
                  </Button>
                  <Button onClick={saveSocialLinks} className="bg-[#EF4444] flex-1" disabled={savingSocial}>
                    {savingSocial ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {isFr ? 'Enregistrer les liens' : 'Save links'}
                  </Button>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-400" />
                  {isFr ? 'Aperçu (liens actifs)' : 'Preview (active links)'}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(socialLinks).filter(([_, url]) => url).length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      {isFr ? 'Aucun réseau social configuré' : 'No social networks configured'}
                    </p>
                  ) : (
                    Object.entries(socialLinks).filter(([_, url]) => url).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] rounded-lg hover:bg-[#27272a] transition-colors"
                      >
                        {platform === 'instagram' && <Instagram className="w-4 h-4 text-pink-400" />}
                        {platform === 'youtube' && <Video className="w-4 h-4 text-red-500" />}
                        {platform === 'tiktok' && <span className="text-xs font-bold">TT</span>}
                        {platform === 'facebook' && <span className="text-blue-500 font-bold">f</span>}
                        {platform === 'snapchat' && <span>👻</span>}
                        {platform === 'twitter' && <span className="font-bold">X</span>}
                        {platform === 'whatsapp' && <Phone className="w-4 h-4 text-green-500" />}
                        {platform === 'telegram' && <Send className="w-4 h-4 text-blue-400" />}
                        {platform === 'website' && <span>🌐</span>}
                        <span className="capitalize">{platform}</span>
                      </a>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Live Analytics Tab */}
          {activeTab === 'live-analytics' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Video className="w-6 h-6 text-[#EF4444]" />
                  {isFr ? 'Statistiques des Lives' : 'Live Streaming Analytics'}
                </h2>
                <Button onClick={fetchLiveAnalytics} disabled={loadingLiveAnalytics}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loadingLiveAnalytics ? 'animate-spin' : ''}`} />
                  {isFr ? 'Actualiser' : 'Refresh'}
                </Button>
              </div>

              {loadingLiveAnalytics ? (
                <div className="flex items-center justify-center py-20">
                  <RefreshCw className="w-8 h-8 animate-spin text-[#EF4444]" />
                </div>
              ) : !liveAnalytics ? (
                <div className="text-center py-20">
                  <Video className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 mb-4">{isFr ? 'Chargez les statistiques pour les voir' : 'Load statistics to view them'}</p>
                  <Button onClick={fetchLiveAnalytics}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {isFr ? 'Charger les stats' : 'Load Stats'}
                  </Button>
                </div>
              ) : (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-6">
                      <div className="text-red-200 text-sm mb-1">{isFr ? 'Total Lives' : 'Total Lives'}</div>
                      <div className="text-3xl font-bold">{liveAnalytics.summary.total_lives}</div>
                      <div className="text-red-200 text-xs mt-2">
                        {liveAnalytics.summary.active_lives} {isFr ? 'actifs' : 'active'}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6">
                      <div className="text-blue-200 text-sm mb-1">{isFr ? 'Spectateurs Total' : 'Total Viewers'}</div>
                      <div className="text-3xl font-bold">{liveAnalytics.summary.total_viewers_all_time}</div>
                      <div className="text-blue-200 text-xs mt-2">
                        ~{liveAnalytics.averages.avg_peak_viewers} {isFr ? 'moy./live' : 'avg/live'}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6">
                      <div className="text-green-200 text-sm mb-1">{isFr ? 'Durée Totale' : 'Total Duration'}</div>
                      <div className="text-3xl font-bold">{Math.round(liveAnalytics.summary.total_duration_minutes / 60)}h</div>
                      <div className="text-green-200 text-xs mt-2">
                        ~{liveAnalytics.averages.avg_duration_minutes} {isFr ? 'min moy.' : 'min avg'}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6">
                      <div className="text-purple-200 text-sm mb-1">{isFr ? 'Engagement' : 'Engagement'}</div>
                      <div className="text-3xl font-bold">{liveAnalytics.summary.total_chat_messages + liveAnalytics.summary.total_reactions}</div>
                      <div className="text-purple-200 text-xs mt-2">
                        {liveAnalytics.summary.total_chat_messages} msgs + {liveAnalytics.summary.total_reactions} ❤️
                      </div>
                    </div>
                  </div>

                  {/* Top Performers */}
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Top by Viewers */}
                    <div className="bg-[#121212] border border-[#27272a] rounded-xl p-6">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-400" />
                        {isFr ? 'Top Spectateurs' : 'Top by Viewers'}
                      </h3>
                      {liveAnalytics.top_performers.by_viewers.length === 0 ? (
                        <p className="text-gray-500 text-sm">{isFr ? 'Aucun live terminé' : 'No ended lives'}</p>
                      ) : (
                        <div className="space-y-3">
                          {liveAnalytics.top_performers.by_viewers.map((live, idx) => (
                            <div key={live.live_id} className="flex items-center gap-3 bg-[#1a1a1a] p-3 rounded-lg">
                              <span className={`text-lg font-bold ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-600' : 'text-gray-600'}`}>
                                #{idx + 1}
                              </span>
                              <div className="flex-1 truncate">
                                <p className="font-medium truncate">{live.title}</p>
                                <p className="text-xs text-gray-500">{new Date(live.created_at).toLocaleDateString()}</p>
                              </div>
                              <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm font-bold">
                                {live.peak_viewers} 👥
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Top by Duration */}
                    <div className="bg-[#121212] border border-[#27272a] rounded-xl p-6">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-green-400" />
                        {isFr ? 'Top Durée' : 'Top by Duration'}
                      </h3>
                      {liveAnalytics.top_performers.by_duration.length === 0 ? (
                        <p className="text-gray-500 text-sm">{isFr ? 'Aucun live terminé' : 'No ended lives'}</p>
                      ) : (
                        <div className="space-y-3">
                          {liveAnalytics.top_performers.by_duration.map((live, idx) => (
                            <div key={live.live_id} className="flex items-center gap-3 bg-[#1a1a1a] p-3 rounded-lg">
                              <span className={`text-lg font-bold ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-600' : 'text-gray-600'}`}>
                                #{idx + 1}
                              </span>
                              <div className="flex-1 truncate">
                                <p className="font-medium truncate">{live.title}</p>
                                <p className="text-xs text-gray-500">{new Date(live.created_at).toLocaleDateString()}</p>
                              </div>
                              <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm font-bold">
                                {live.duration_minutes} min
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Top by Engagement */}
                    <div className="bg-[#121212] border border-[#27272a] rounded-xl p-6">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-pink-400" />
                        {isFr ? 'Top Engagement' : 'Top by Engagement'}
                      </h3>
                      {liveAnalytics.top_performers.by_engagement.length === 0 ? (
                        <p className="text-gray-500 text-sm">{isFr ? 'Aucun live terminé' : 'No ended lives'}</p>
                      ) : (
                        <div className="space-y-3">
                          {liveAnalytics.top_performers.by_engagement.map((live, idx) => (
                            <div key={live.live_id} className="flex items-center gap-3 bg-[#1a1a1a] p-3 rounded-lg">
                              <span className={`text-lg font-bold ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-600' : 'text-gray-600'}`}>
                                #{idx + 1}
                              </span>
                              <div className="flex-1 truncate">
                                <p className="font-medium truncate">{live.title}</p>
                                <p className="text-xs text-gray-500">{new Date(live.created_at).toLocaleDateString()}</p>
                              </div>
                              <span className="bg-pink-500/20 text-pink-400 px-2 py-1 rounded text-sm font-bold">
                                {live.engagement} 💬
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Lives History */}
                  <div className="bg-[#121212] border border-[#27272a] rounded-xl p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#EF4444]" />
                      {isFr ? 'Historique des Lives' : 'Lives History'}
                    </h3>
                    {liveAnalytics.recent_lives.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">{isFr ? 'Aucun live enregistré' : 'No lives recorded'}</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="text-left text-gray-400 text-sm border-b border-[#27272a]">
                              <th className="pb-3 pl-3">{isFr ? 'Titre' : 'Title'}</th>
                              <th className="pb-3">{isFr ? 'Statut' : 'Status'}</th>
                              <th className="pb-3">{isFr ? 'Date' : 'Date'}</th>
                              <th className="pb-3">{isFr ? 'Durée' : 'Duration'}</th>
                              <th className="pb-3">{isFr ? 'Pic Spectateurs' : 'Peak Viewers'}</th>
                              <th className="pb-3">{isFr ? 'Messages' : 'Messages'}</th>
                              <th className="pb-3">{isFr ? 'Réactions' : 'Reactions'}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {liveAnalytics.recent_lives.map(live => (
                              <tr key={live.live_id} className="border-b border-[#27272a]/50 hover:bg-[#1a1a1a]">
                                <td className="py-3 pl-3">
                                  <div className="flex items-center gap-2">
                                    {live.vip_only && <Crown className="w-4 h-4 text-yellow-400" />}
                                    <span className="truncate max-w-[200px]">{live.title}</span>
                                  </div>
                                </td>
                                <td className="py-3">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    live.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                    live.status === 'ended' ? 'bg-gray-500/20 text-gray-400' :
                                    'bg-blue-500/20 text-blue-400'
                                  }`}>
                                    {live.status === 'active' ? (isFr ? 'En direct' : 'Live') :
                                     live.status === 'ended' ? (isFr ? 'Terminé' : 'Ended') :
                                     (isFr ? 'Programmé' : 'Scheduled')}
                                  </span>
                                </td>
                                <td className="py-3 text-gray-400 text-sm">
                                  {new Date(live.created_at).toLocaleDateString()}
                                </td>
                                <td className="py-3">
                                  {live.duration_minutes > 0 ? `${live.duration_minutes} min` : '-'}
                                </td>
                                <td className="py-3">
                                  <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4 text-blue-400" />
                                    {live.peak_viewers}
                                  </span>
                                </td>
                                <td className="py-3">
                                  <span className="flex items-center gap-1">
                                    <MessageCircle className="w-4 h-4 text-purple-400" />
                                    {live.chat_messages_count}
                                  </span>
                                </td>
                                <td className="py-3">
                                  <span className="flex items-center gap-1">
                                    <Heart className="w-4 h-4 text-pink-400" />
                                    {live.total_reactions}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Videos Management Tab */}
          {activeTab === 'videos' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Video className="w-5 h-5 text-[#EF4444]" />
                  {isFr ? 'Gestion des Vidéos' : 'Video Management'}
                </h2>
                <Button
                  onClick={async () => {
                    try {
                      const response = await axios.get(`${API}/admin/videos`, { headers: getAuthHeaders() });
                      setUploadedVideos(response.data.videos || []);
                    } catch (error) {
                      console.error('Error fetching videos:', error);
                    }
                  }}
                  variant="outline"
                  className="border-[#27272a]"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {isFr ? 'Actualiser' : 'Refresh'}
                </Button>
              </div>

              {/* Upload New Video */}
              <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-green-400" />
                  {isFr ? 'Uploader une nouvelle vidéo' : 'Upload New Video'}
                </h3>
                <VideoUploader
                  value=""
                  onChange={() => {}}
                  onUploadComplete={async () => {
                    // Refresh video list after upload
                    try {
                      const response = await axios.get(`${API}/admin/videos`, { headers: getAuthHeaders() });
                      setUploadedVideos(response.data.videos || []);
                    } catch (error) {
                      console.error('Error refreshing videos:', error);
                    }
                  }}
                />
              </div>

              {/* Video Library */}
              <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Video className="w-4 h-4 text-blue-400" />
                  {isFr ? 'Bibliothèque de Vidéos' : 'Video Library'} ({uploadedVideos.length})
                </h3>
                
                {uploadedVideos.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{isFr ? 'Aucune vidéo uploadée' : 'No videos uploaded'}</p>
                    <p className="text-sm">{isFr ? 'Uploadez vos vidéos d\'exercices ci-dessus' : 'Upload your exercise videos above'}</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {uploadedVideos.map((video) => (
                      <div key={video.video_id} className="bg-[#09090b] border border-[#27272a] rounded-lg overflow-hidden">
                        <div className="aspect-video bg-black flex items-center justify-center">
                          <video
                            src={`${API.replace('/api', '')}${video.url}`}
                            className="w-full h-full object-cover"
                            preload="metadata"
                          />
                        </div>
                        <div className="p-3">
                          <p className="font-medium text-sm truncate">{video.original_name}</p>
                          <p className="text-gray-400 text-xs">
                            {(video.size / (1024 * 1024)).toFixed(1)} MB • {new Date(video.uploaded_at).toLocaleDateString('fr-FR')}
                          </p>
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`${API.replace('/api', '')}${video.url}`, '_blank')}
                              className="flex-1"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              {isFr ? 'Voir' : 'View'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                navigator.clipboard.writeText(video.url);
                                toast.success(isFr ? 'URL copiée !' : 'URL copied!');
                              }}
                              className="flex-1"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              {isFr ? 'Copier URL' : 'Copy URL'}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={async () => {
                                if (window.confirm(isFr ? 'Supprimer cette vidéo ?' : 'Delete this video?')) {
                                  try {
                                    await axios.delete(`${API}/admin/videos/${video.video_id}`, { headers: getAuthHeaders() });
                                    setUploadedVideos(prev => prev.filter(v => v.video_id !== video.video_id));
                                    toast.success(isFr ? 'Vidéo supprimée' : 'Video deleted');
                                  } catch (error) {
                                    toast.error(isFr ? 'Erreur' : 'Error');
                                  }
                                }
                              }}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Help Section */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h4 className="font-bold text-blue-400 mb-2">{isFr ? 'Comment utiliser les vidéos' : 'How to use videos'}</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• {isFr ? 'Uploadez vos vidéos d\'exercices (MP4, WebM, MOV, AVI - max 500MB)' : 'Upload your exercise videos (MP4, WebM, MOV, AVI - max 500MB)'}</li>
                  <li>• {isFr ? 'Lors de la création d\'un exercice, utilisez le composant "Uploader" ou collez un lien YouTube' : 'When creating an exercise, use the "Upload" component or paste a YouTube link'}</li>
                  <li>• {isFr ? 'Les vidéos uploadées sont streamées avec support du seek (avance/retour)' : 'Uploaded videos are streamed with seek support (forward/backward)'}</li>
                  <li>• {isFr ? 'Les abonnés peuvent regarder les vidéos en temps réel pendant leurs exercices' : 'Subscribers can watch videos in real-time during their exercises'}</li>
                </ul>
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
                      <th className="text-left p-4 text-gray-400 text-sm">{isFr ? 'Détails' : 'Details'}</th>
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
                        <td className="p-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => fetchWorkoutDetailedAnalytics(wa.workout_id)}
                            className="text-blue-400"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-gray-400">
                          {isFr ? 'Aucune donnée disponible' : 'No data available'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Selected Workout Analytics Detail */}
              {selectedWorkoutAnalytics && (
                <div className="bg-[#121212] border border-blue-500/30 rounded-lg p-6 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Dumbbell className="w-5 h-5 text-blue-400" />
                      {selectedWorkoutAnalytics.workout?.title} - {isFr ? 'Détails' : 'Details'}
                    </h3>
                    <Button variant="ghost" onClick={() => setSelectedWorkoutAnalytics(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-[#09090b] rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-blue-400">{selectedWorkoutAnalytics.stats?.total_sessions}</p>
                      <p className="text-gray-500 text-xs">{isFr ? 'Sessions' : 'Sessions'}</p>
                    </div>
                    <div className="bg-[#09090b] rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-green-400">{selectedWorkoutAnalytics.stats?.completed_sessions}</p>
                      <p className="text-gray-500 text-xs">{isFr ? 'Complétées' : 'Completed'}</p>
                    </div>
                    <div className="bg-[#09090b] rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-yellow-400">{selectedWorkoutAnalytics.stats?.completion_rate}%</p>
                      <p className="text-gray-500 text-xs">{isFr ? 'Taux' : 'Rate'}</p>
                    </div>
                    <div className="bg-[#09090b] rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold">{Math.floor(selectedWorkoutAnalytics.stats?.avg_duration_seconds / 60)}m</p>
                      <p className="text-gray-500 text-xs">{isFr ? 'Durée Moy.' : 'Avg Duration'}</p>
                    </div>
                    <div className="bg-[#09090b] rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-purple-400">{selectedWorkoutAnalytics.stats?.total_duration_minutes}m</p>
                      <p className="text-gray-500 text-xs">{isFr ? 'Temps Total' : 'Total Time'}</p>
                    </div>
                  </div>

                  {/* Users who did this workout */}
                  <h4 className="font-bold mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#EF4444]" />
                    {isFr ? 'Utilisateurs ayant fait cette séance' : 'Users who did this workout'}
                  </h4>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {selectedWorkoutAnalytics.users?.map((user, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-[#09090b] rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            idx === 0 ? 'bg-yellow-500 text-black' : 
                            idx === 1 ? 'bg-gray-400 text-black' : 
                            idx === 2 ? 'bg-amber-600 text-white' : 
                            'bg-[#27272a] text-white'
                          }`}>
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-gray-500 text-xs">{user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            <span className="text-green-400">{user.completed}</span>
                            <span className="text-gray-500">/{user.total_sessions}</span>
                          </p>
                          <p className="text-gray-500 text-xs">{user.total_duration_minutes}m {isFr ? 'total' : 'total'}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => fetchUserEvolution(user.user_id)}
                          className="text-green-400"
                        >
                          <TrendingUp className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Running Tab */}
          {activeTab === 'running' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Footprints className="w-5 h-5 text-green-500" />
                  {isFr ? 'Course à Pied - Suivi des Abonnés' : 'Running - Subscriber Tracking'}
                </h2>
                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      const title = prompt(isFr ? 'Titre de la notification:' : 'Notification title:', isFr ? '🏃 Défi Running !' : '🏃 Running Challenge!');
                      if (!title) return;
                      const body = prompt(isFr ? 'Message:' : 'Message:', isFr ? 'Nouveau défi disponible ! Venez courir !' : 'New challenge available! Come run!');
                      if (!body) return;
                      
                      try {
                        const response = await axios.post(`${API}/admin/notifications/broadcast`, {
                          title,
                          body,
                          url: '/running'
                        }, { headers: getAuthHeaders() });
                        toast.success(`${isFr ? 'Notification envoyée à' : 'Notification sent to'} ${response.data.sent} ${isFr ? 'abonnés' : 'subscribers'}`);
                      } catch (err) {
                        toast.error(isFr ? 'Erreur d\'envoi' : 'Send error');
                      }
                    }}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    {isFr ? 'Notifier tous' : 'Notify all'}
                  </Button>
                  <Button
                    onClick={() => { fetchRunningStats(); fetchAllRunningData(); }}
                    variant="outline"
                    className="border-[#27272a]"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {isFr ? 'Actualiser' : 'Refresh'}
                  </Button>
                </div>
              </div>

              {/* Global Running Stats */}
              {runningStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6 text-center">
                    <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-3xl font-bold">{runningStats.global_stats?.total_distance?.toFixed(1) || 0}</p>
                    <p className="text-gray-500 text-sm">{isFr ? 'km total' : 'Total km'}</p>
                  </div>
                  <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6 text-center">
                    <Footprints className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-3xl font-bold">{runningStats.global_stats?.total_runs || 0}</p>
                    <p className="text-gray-500 text-sm">{isFr ? 'Courses totales' : 'Total Runs'}</p>
                  </div>
                  <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6 text-center">
                    <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-3xl font-bold">
                      {Math.floor((runningStats.global_stats?.total_time || 0) / 3600)}h{Math.floor(((runningStats.global_stats?.total_time || 0) % 3600) / 60)}m
                    </p>
                    <p className="text-gray-500 text-sm">{isFr ? 'Temps total' : 'Total Time'}</p>
                  </div>
                  <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6 text-center">
                    <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                    <p className="text-3xl font-bold">{runningStats.global_stats?.total_calories || 0}</p>
                    <p className="text-gray-500 text-sm">{isFr ? 'Calories brûlées' : 'Calories Burned'}</p>
                  </div>
                </div>
              )}

              {/* Top Runners Leaderboard */}
              {runningStats?.top_runners && runningStats.top_runners.length > 0 && (
                <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    {isFr ? 'Top Coureurs' : 'Top Runners'}
                  </h3>
                  <div className="space-y-3">
                    {runningStats.top_runners.map((runner, idx) => (
                      <div 
                        key={runner.user_id}
                        className="flex items-center justify-between p-4 bg-black/30 rounded-lg hover:bg-black/50 cursor-pointer transition-colors"
                        onClick={() => fetchUserRunning(runner.user_id)}
                      >
                        <div className="flex items-center gap-4">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            idx === 0 ? 'bg-yellow-500 text-black' :
                            idx === 1 ? 'bg-gray-400 text-black' :
                            idx === 2 ? 'bg-orange-600 text-white' :
                            'bg-zinc-700 text-white'
                          }`}>
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-bold">{runner.user_name}</p>
                            <p className="text-gray-500 text-sm">{runner.total_runs} {isFr ? 'courses' : 'runs'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-bold">{runner.total_distance} km</p>
                          <p className="text-gray-500 text-sm">
                            {isFr ? 'Allure moy:' : 'Avg pace:'} {runner.avg_pace?.toFixed(2) || '--'} min/km
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Runs */}
              <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  {isFr ? 'Courses Récentes' : 'Recent Runs'}
                </h3>
                {allRunningData.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    {isFr ? 'Aucune course enregistrée' : 'No runs recorded yet'}
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {allRunningData.slice(0, 20).map((run) => (
                      <div 
                        key={run.run_id}
                        className="flex items-center justify-between p-4 bg-black/30 rounded-lg hover:bg-black/50 cursor-pointer transition-colors"
                        onClick={() => fetchUserRunning(run.user_id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                            <Footprints className="w-6 h-6 text-green-500" />
                          </div>
                          <div>
                            <p className="font-bold">{run.user_name}</p>
                            <p className="text-gray-500 text-sm">
                              {new Date(run.created_at).toLocaleDateString()} - {new Date(run.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <p className="text-white font-bold">{run.distance?.toFixed(2)} km</p>
                            <p className="text-gray-600">{isFr ? 'Distance' : 'Distance'}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-white">{Math.floor(run.duration / 60)}:{(run.duration % 60).toString().padStart(2, '0')}</p>
                            <p className="text-gray-600">{isFr ? 'Durée' : 'Duration'}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-blue-400">{run.pace?.toFixed(2)}</p>
                            <p className="text-gray-600">min/km</p>
                          </div>
                          <div className="text-center">
                            <p className="text-orange-400">{run.calories}</p>
                            <p className="text-gray-600">kcal</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected User Running Details Modal */}
              {selectedUserRunning && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                  <div className="bg-[#121212] border border-[#27272a] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                    <div className="p-6 border-b border-[#27272a] flex justify-between items-center sticky top-0 bg-[#121212]">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Footprints className="w-6 h-6 text-green-500" />
                        {selectedUserRunning.user?.name} - {isFr ? 'Historique Course' : 'Running History'}
                      </h3>
                      <Button variant="ghost" onClick={() => setSelectedUserRunning(null)}>
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                    
                    <div className="p-6 space-y-6">
                      {/* User Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-black/30 rounded-lg p-4 text-center">
                          <p className="text-2xl font-bold text-green-400">{selectedUserRunning.stats?.total_distance}</p>
                          <p className="text-gray-500 text-sm">{isFr ? 'km total' : 'Total km'}</p>
                        </div>
                        <div className="bg-black/30 rounded-lg p-4 text-center">
                          <p className="text-2xl font-bold">{selectedUserRunning.stats?.total_runs}</p>
                          <p className="text-gray-500 text-sm">{isFr ? 'Courses' : 'Runs'}</p>
                        </div>
                        <div className="bg-black/30 rounded-lg p-4 text-center">
                          <p className="text-2xl font-bold text-purple-400">
                            {Math.floor((selectedUserRunning.stats?.total_time || 0) / 3600)}h{Math.floor(((selectedUserRunning.stats?.total_time || 0) % 3600) / 60)}m
                          </p>
                          <p className="text-gray-500 text-sm">{isFr ? 'Temps total' : 'Total Time'}</p>
                        </div>
                        <div className="bg-black/30 rounded-lg p-4 text-center">
                          <p className="text-2xl font-bold text-orange-400">{selectedUserRunning.stats?.total_calories}</p>
                          <p className="text-gray-500 text-sm">{isFr ? 'Calories' : 'Calories'}</p>
                        </div>
                      </div>

                      {/* Progress Chart */}
                      {selectedUserRunning.runs && selectedUserRunning.runs.length > 1 && (
                        <div className="bg-black/30 rounded-lg p-4">
                          <h4 className="font-bold mb-4 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            {isFr ? 'Progression' : 'Progress'}
                          </h4>
                          <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={[...selectedUserRunning.runs].reverse().slice(-10).map((r, i) => ({
                              name: new Date(r.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
                              distance: r.distance,
                              pace: r.pace
                            }))}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                              <XAxis dataKey="name" stroke="#666" fontSize={12} />
                              <YAxis stroke="#666" fontSize={12} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#121212', border: '1px solid #333' }}
                                labelStyle={{ color: '#fff' }}
                              />
                              <Area type="monotone" dataKey="distance" stroke="#22c55e" fill="#22c55e20" name="Distance (km)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {/* Run History */}
                      <div>
                        <h4 className="font-bold mb-4">{isFr ? 'Historique détaillé' : 'Detailed History'}</h4>
                        <div className="space-y-2">
                          {selectedUserRunning.runs?.map((run, idx) => (
                            <div key={run.run_id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                              <div className="flex items-center gap-3">
                                <span className="text-gray-500 text-sm w-20">
                                  {new Date(run.created_at).toLocaleDateString()}
                                </span>
                                <span className="font-bold text-green-400">{run.distance?.toFixed(2)} km</span>
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                <span>{Math.floor(run.duration / 60)}:{(run.duration % 60).toString().padStart(2, '0')}</span>
                                <span className="text-blue-400">{run.pace?.toFixed(2)} min/km</span>
                                <span className="text-orange-400">{run.calories} kcal</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Discipline Tab - Warmup & Stretching Tracking */}
          {activeTab === 'discipline' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Timer className="w-5 h-5 text-green-400" />
                  {isFr ? 'Suivi de Discipline - Échauffements & Étirements' : 'Discipline Tracking - Warm-Up & Stretching'}
                </h2>
                <Button 
                  onClick={() => { fetchRoutineStats(); fetchRoutineSessions(); }}
                  variant="outline"
                  className="border-[#27272a]"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {isFr ? 'Actualiser' : 'Refresh'}
                </Button>
              </div>

              {/* Global Stats Cards */}
              {routineStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Warmup Stats */}
                  <div className="bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/30 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Flame className="w-8 h-8 text-orange-400" />
                      <div>
                        <h3 className="font-bold text-orange-400">{isFr ? 'Échauffements' : 'Warm-Ups'}</h3>
                        <p className="text-gray-400 text-xs">{isFr ? 'Sessions totales' : 'Total sessions'}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">{isFr ? 'Total' : 'Total'}</span>
                        <span className="font-bold">{routineStats.warmup.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">{isFr ? 'Complétés' : 'Completed'}</span>
                        <span className="font-bold text-green-400">{routineStats.warmup.completed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">{isFr ? 'Taux' : 'Rate'}</span>
                        <span className="font-bold text-orange-400">{routineStats.warmup.completion_rate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">{isFr ? 'Durée moy.' : 'Avg duration'}</span>
                        <span className="font-bold">{Math.floor(routineStats.warmup.avg_duration_seconds / 60)}m {routineStats.warmup.avg_duration_seconds % 60}s</span>
                      </div>
                    </div>
                  </div>

                  {/* Stretching Stats */}
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Sparkles className="w-8 h-8 text-purple-400" />
                      <div>
                        <h3 className="font-bold text-purple-400">{isFr ? 'Étirements' : 'Stretching'}</h3>
                        <p className="text-gray-400 text-xs">{isFr ? 'Sessions totales' : 'Total sessions'}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">{isFr ? 'Total' : 'Total'}</span>
                        <span className="font-bold">{routineStats.stretching.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">{isFr ? 'Complétés' : 'Completed'}</span>
                        <span className="font-bold text-green-400">{routineStats.stretching.completed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">{isFr ? 'Taux' : 'Rate'}</span>
                        <span className="font-bold text-purple-400">{routineStats.stretching.completion_rate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">{isFr ? 'Durée moy.' : 'Avg duration'}</span>
                        <span className="font-bold">{Math.floor(routineStats.stretching.avg_duration_seconds / 60)}m {routineStats.stretching.avg_duration_seconds % 60}s</span>
                      </div>
                    </div>
                  </div>

                  {/* Top Disciplined Users */}
                  <div className="md:col-span-2 bg-[#121212] border border-[#27272a] rounded-lg p-6">
                    <h3 className="font-bold text-green-400 mb-4 flex items-center gap-2">
                      <Crown className="w-5 h-5" />
                      {isFr ? 'Top 5 Abonnés les Plus Disciplinés' : 'Top 5 Most Disciplined Subscribers'}
                    </h3>
                    {routineStats.top_disciplined_users?.length > 0 ? (
                      <div className="space-y-3">
                        {routineStats.top_disciplined_users.slice(0, 5).map((user, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-[#09090b] rounded-lg p-3">
                            <div className="flex items-center gap-3">
                              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                idx === 0 ? 'bg-yellow-500 text-black' : 
                                idx === 1 ? 'bg-gray-400 text-black' : 
                                idx === 2 ? 'bg-amber-600 text-white' : 
                                'bg-[#27272a] text-white'
                              }`}>
                                {idx + 1}
                              </span>
                              <div>
                                <p className="font-medium">{user.user_name}</p>
                                <p className="text-gray-500 text-xs">{user.user_email}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-400">{user.total_completed} {isFr ? 'routines' : 'routines'}</p>
                              <p className="text-gray-500 text-xs">
                                <span className="text-orange-400">{user.warmup_count}</span> + <span className="text-purple-400">{user.stretching_count}</span>
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => fetchUserEvolution(user._id)}
                                className="text-green-400"
                                title={isFr ? "Voir évolution" : "View evolution"}
                              >
                                <TrendingUp className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => fetchUserRoutineSessions(user._id)}
                                className="text-blue-400"
                                title={isFr ? "Voir détails" : "View details"}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">{isFr ? 'Aucune donnée' : 'No data yet'}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Evolution Charts */}
              {evolutionData.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Weekly Activity Chart */}
                  <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <LineChart className="w-5 h-5 text-blue-400" />
                      {isFr ? 'Activité des 7 Derniers Jours' : 'Last 7 Days Activity'}
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={evolutionData}>
                        <defs>
                          <linearGradient id="colorWorkouts" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="colorWarmups" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F97316" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#F97316" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="colorStretching" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#A855F7" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#A855F7" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="day" stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#121212', border: '1px solid #27272a', borderRadius: '8px' }}
                          labelStyle={{ color: '#fff' }}
                        />
                        <Legend />
                        <Area type="monotone" dataKey="workouts_completed" name={isFr ? "Séances" : "Workouts"} stroke="#EF4444" fillOpacity={1} fill="url(#colorWorkouts)" />
                        <Area type="monotone" dataKey="warmups_completed" name={isFr ? "Échauffements" : "Warm-Ups"} stroke="#F97316" fillOpacity={1} fill="url(#colorWarmups)" />
                        <Area type="monotone" dataKey="stretching_completed" name={isFr ? "Étirements" : "Stretching"} stroke="#A855F7" fillOpacity={1} fill="url(#colorStretching)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Duration Chart */}
                  <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-green-400" />
                      {isFr ? 'Temps d\'Entraînement (minutes)' : 'Training Time (minutes)'}
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={evolutionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="day" stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#121212', border: '1px solid #27272a', borderRadius: '8px' }}
                          labelStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="duration_minutes" name={isFr ? "Durée (min)" : "Duration (min)"} fill="#22C55E" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* User Evolution Detail Modal */}
              {selectedUserEvolution && (
                <div className="bg-[#121212] border border-blue-500/30 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                      {selectedUserEvolution.user?.name} - {isFr ? 'Évolution Mensuelle' : 'Monthly Evolution'}
                    </h3>
                    <Button variant="ghost" onClick={() => setSelectedUserEvolution(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {selectedUserEvolution.evolution?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsLineChart data={selectedUserEvolution.evolution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="week" stroke="#666" tickFormatter={(val) => val.slice(5)} />
                        <YAxis stroke="#666" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#121212', border: '1px solid #27272a', borderRadius: '8px' }}
                          labelStyle={{ color: '#fff' }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="discipline_score" name={isFr ? "Score Discipline %" : "Discipline Score %"} stroke="#22C55E" strokeWidth={3} dot={{ fill: '#22C55E' }} />
                        <Line type="monotone" dataKey="workouts_completed" name={isFr ? "Séances" : "Workouts"} stroke="#EF4444" strokeWidth={2} />
                        <Line type="monotone" dataKey="warmups_completed" name={isFr ? "Échauffements" : "Warm-Ups"} stroke="#F97316" strokeWidth={2} />
                        <Line type="monotone" dataKey="stretching_completed" name={isFr ? "Étirements" : "Stretching"} stroke="#A855F7" strokeWidth={2} />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-500 text-center py-8">{isFr ? 'Pas assez de données' : 'Not enough data'}</p>
                  )}
                </div>
              )}

              {/* Selected User Details */}
              {selectedUserRoutines && (
                <div className="bg-[#121212] border border-green-500/30 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <UserCog className="w-5 h-5 text-green-400" />
                      {selectedUserRoutines.user?.name || 'Unknown'} - {isFr ? 'Détails Discipline' : 'Discipline Details'}
                    </h3>
                    <Button variant="ghost" onClick={() => setSelectedUserRoutines(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* User Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-[#09090b] rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-green-400">{selectedUserRoutines.stats.discipline_score}%</p>
                      <p className="text-gray-500 text-xs">{isFr ? 'Score Discipline' : 'Discipline Score'}</p>
                    </div>
                    <div className="bg-[#09090b] rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold">{selectedUserRoutines.stats.total_workouts}</p>
                      <p className="text-gray-500 text-xs">{isFr ? 'Séances Totales' : 'Total Workouts'}</p>
                    </div>
                    <div className="bg-[#09090b] rounded-lg p-4 text-center border border-orange-500/30">
                      <p className="text-2xl font-bold text-orange-400">{selectedUserRoutines.stats.warmup.completed}</p>
                      <p className="text-gray-500 text-xs">{isFr ? 'Échauffements' : 'Warm-Ups'}</p>
                    </div>
                    <div className="bg-[#09090b] rounded-lg p-4 text-center border border-purple-500/30">
                      <p className="text-2xl font-bold text-purple-400">{selectedUserRoutines.stats.stretching.completed}</p>
                      <p className="text-gray-500 text-xs">{isFr ? 'Étirements' : 'Stretching'}</p>
                    </div>
                    <div className="bg-[#09090b] rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-blue-400">
                        {Math.floor((selectedUserRoutines.stats.warmup.total_time_seconds + selectedUserRoutines.stats.stretching.total_time_seconds) / 60)}m
                      </p>
                      <p className="text-gray-500 text-xs">{isFr ? 'Temps Total' : 'Total Time'}</p>
                    </div>
                  </div>

                  {/* Sessions History */}
                  <h4 className="font-bold mb-3">{isFr ? 'Historique des Sessions' : 'Sessions History'}</h4>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {selectedUserRoutines.sessions?.length > 0 ? selectedUserRoutines.sessions.map((session, idx) => (
                      <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${
                        session.routine_type === 'warmup' ? 'bg-orange-500/10 border border-orange-500/20' : 'bg-purple-500/10 border border-purple-500/20'
                      }`}>
                        <div className="flex items-center gap-3">
                          {session.routine_type === 'warmup' ? (
                            <Flame className="w-5 h-5 text-orange-400" />
                          ) : (
                            <Sparkles className="w-5 h-5 text-purple-400" />
                          )}
                          <div>
                            <p className={`font-medium ${session.routine_type === 'warmup' ? 'text-orange-400' : 'text-purple-400'}`}>
                              {session.routine_type === 'warmup' ? (isFr ? 'Échauffement' : 'Warm-Up') : (isFr ? 'Étirements' : 'Stretching')}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {new Date(session.started_at).toLocaleString(isFr ? 'fr-FR' : 'en-US')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${session.completed ? 'text-green-400' : 'text-red-400'}`}>
                            {session.completed ? (isFr ? 'Complété' : 'Completed') : (isFr ? 'Abandonné' : 'Abandoned')}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {Math.floor(session.duration_seconds / 60)}m {session.duration_seconds % 60}s
                          </p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-gray-500 text-center py-4">{isFr ? 'Aucune session' : 'No sessions'}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Recent Sessions Table */}
              <div className="bg-[#121212] border border-[#27272a] rounded-lg overflow-hidden">
                <h3 className="font-bold p-4 border-b border-[#27272a] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#EF4444]" />
                  {isFr ? 'Sessions Récentes (Échauffements & Étirements)' : 'Recent Sessions (Warm-Up & Stretching)'}
                </h3>
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-[#1a1a1a] sticky top-0">
                      <tr>
                        <th className="text-left p-3 text-gray-400 text-sm">{isFr ? 'Abonné' : 'Subscriber'}</th>
                        <th className="text-left p-3 text-gray-400 text-sm">{isFr ? 'Type' : 'Type'}</th>
                        <th className="text-left p-3 text-gray-400 text-sm">{isFr ? 'Début' : 'Started'}</th>
                        <th className="text-left p-3 text-gray-400 text-sm">{isFr ? 'Durée' : 'Duration'}</th>
                        <th className="text-left p-3 text-gray-400 text-sm">{isFr ? 'Statut' : 'Status'}</th>
                        <th className="text-left p-3 text-gray-400 text-sm">{isFr ? 'Action' : 'Action'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {routineSessions.length > 0 ? routineSessions.slice(0, 50).map((session, idx) => (
                        <tr key={idx} className="border-t border-[#27272a] hover:bg-[#1a1a1a]">
                          <td className="p-3">
                            <p className="font-medium">{session.user_name}</p>
                            <p className="text-gray-500 text-xs">{session.user_email}</p>
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm ${
                              session.routine_type === 'warmup' 
                                ? 'bg-orange-500/20 text-orange-400' 
                                : 'bg-purple-500/20 text-purple-400'
                            }`}>
                              {session.routine_type === 'warmup' ? (
                                <><Flame className="w-3 h-3" /> {isFr ? 'Échauffement' : 'Warm-Up'}</>
                              ) : (
                                <><Sparkles className="w-3 h-3" /> {isFr ? 'Étirements' : 'Stretching'}</>
                              )}
                            </span>
                          </td>
                          <td className="p-3 text-gray-400 text-sm">
                            {new Date(session.started_at).toLocaleString(isFr ? 'fr-FR' : 'en-US', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="p-3">
                            <span className="font-mono">{Math.floor(session.duration_seconds / 60)}m {session.duration_seconds % 60}s</span>
                          </td>
                          <td className="p-3">
                            {session.completed ? (
                              <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm flex items-center gap-1 w-fit">
                                <Check className="w-3 h-3" />
                                {isFr ? 'Complété' : 'Completed'}
                              </span>
                            ) : (
                              <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-sm flex items-center gap-1 w-fit">
                                <X className="w-3 h-3" />
                                {isFr ? 'Abandonné' : 'Abandoned'}
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => fetchUserRoutineSessions(session.user_id)}
                              className="text-blue-400"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-gray-400">
                            {isFr ? 'Aucune session d\'échauffement ou d\'étirement enregistrée' : 'No warm-up or stretching sessions recorded'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* User Progress Tab */}
          {activeTab === 'progress' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Users Progress List */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#EF4444]" />
                  {isFr ? 'Progrès des Abonnés' : 'Subscriber Progress'}
                </h2>

                <div className="bg-[#121212] border border-[#27272a] rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[#1a1a1a]">
                      <tr>
                        <th className="text-left p-4 text-gray-400 text-sm">{isFr ? 'Utilisateur' : 'User'}</th>
                        <th className="text-left p-4 text-gray-400 text-sm">{isFr ? 'Séances' : 'Sessions'}</th>
                        <th className="text-left p-4 text-gray-400 text-sm">{isFr ? 'Taux' : 'Rate'}</th>
                        <th className="text-left p-4 text-gray-400 text-sm">{isFr ? 'Temps Total' : 'Total Time'}</th>
                        <th className="text-left p-4 text-gray-400 text-sm">{isFr ? 'Durée Moy.' : 'Avg Duration'}</th>
                        <th className="text-left p-4 text-gray-400 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userProgress.length > 0 ? userProgress.map((up, idx) => (
                        <tr 
                          key={up.user_id || idx} 
                          className={`border-t border-[#27272a] hover:bg-[#1a1a1a] cursor-pointer ${
                            selectedUserProgress?.user?.user_id === up.user_id ? 'bg-[#1a1a1a]' : ''
                          }`}
                          onClick={() => fetchUserSessions(up.user_id)}
                        >
                          <td className="p-4">
                            <div className="font-medium">{up.user_name}</div>
                            <div className="text-gray-500 text-xs">{up.user_email}</div>
                          </td>
                          <td className="p-4">
                            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm">
                              {up.total_sessions}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-sm ${
                              parseFloat(up.completion_rate) >= 80 
                                ? 'bg-green-500/20 text-green-400' 
                                : parseFloat(up.completion_rate) >= 50 
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-red-500/20 text-red-400'
                            }`}>
                              {up.completion_rate}
                            </span>
                          </td>
                          <td className="p-4 text-purple-400">{up.total_duration_formatted}</td>
                          <td className="p-4 text-gray-400">{up.avg_duration_formatted}</td>
                          <td className="p-4">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                fetchUserSessions(up.user_id);
                              }}
                              className="text-[#EF4444] hover:text-white"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-gray-400">
                            {isFr ? 'Aucune donnée de progression disponible' : 'No progress data available'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* User Sessions Detail */}
              <div className="space-y-4">
                {selectedUserProgress ? (
                  <div className="bg-[#121212] border border-[#27272a] rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#27272a]">
                      <div className="p-3 bg-[#EF4444]/20 rounded-full">
                        <Timer className="w-6 h-6 text-[#EF4444]" />
                      </div>
                      <div>
                        <h3 className="font-bold">{selectedUserProgress.user?.name}</h3>
                        <p className="text-gray-400 text-sm">{selectedUserProgress.user?.email}</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-[#09090b] p-3 rounded-lg text-center">
                        <p className="text-2xl font-bold text-blue-400">{selectedUserProgress.stats?.total_sessions}</p>
                        <p className="text-gray-500 text-xs">{isFr ? 'Séances' : 'Sessions'}</p>
                      </div>
                      <div className="bg-[#09090b] p-3 rounded-lg text-center">
                        <p className="text-2xl font-bold text-green-400">{selectedUserProgress.stats?.completion_rate}</p>
                        <p className="text-gray-500 text-xs">{isFr ? 'Taux' : 'Rate'}</p>
                      </div>
                      <div className="bg-[#09090b] p-3 rounded-lg text-center">
                        <p className="text-2xl font-bold text-purple-400">{selectedUserProgress.stats?.total_duration_formatted}</p>
                        <p className="text-gray-500 text-xs">{isFr ? 'Temps Total' : 'Total Time'}</p>
                      </div>
                      <div className="bg-[#09090b] p-3 rounded-lg text-center">
                        <p className="text-2xl font-bold text-yellow-400">{selectedUserProgress.stats?.avg_session_duration}</p>
                        <p className="text-gray-500 text-xs">{isFr ? 'Durée Moy.' : 'Avg Duration'}</p>
                      </div>
                    </div>

                    {/* Sessions List */}
                    <h4 className="font-bold text-gray-400 text-sm mb-2">{isFr ? 'Historique des Séances' : 'Session History'}</h4>
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {selectedUserProgress.sessions?.map((session, idx) => (
                        <div key={idx} className="bg-[#09090b] p-3 rounded flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {session.completed ? 
                              <Check className="w-4 h-4 text-green-400" /> : 
                              <X className="w-4 h-4 text-red-400" />
                            }
                            <div>
                              <p className="text-sm font-medium truncate max-w-[150px]">{session.workout_title}</p>
                              <p className="text-gray-500 text-xs">{formatDate(session.started_at)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold">{formatDuration(session.duration_seconds)}</p>
                            {session.total_pause_seconds > 0 && (
                              <p className="text-yellow-400 text-xs">
                                {isFr ? 'Pause:' : 'Pause:'} {formatDuration(session.total_pause_seconds)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6 text-center text-gray-400">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>{isFr ? 'Sélectionnez un utilisateur' : 'Select a user to view details'}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Users with Messages List */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-[#EF4444]" />
                  {isFr ? 'Conversations' : 'Conversations'}
                </h2>

                <div className="space-y-2">
                  {usersWithMessages.length > 0 ? usersWithMessages.map((u, idx) => (
                    <div 
                      key={u.user_id || idx}
                      onClick={() => fetchConversation(u.user_id)}
                      className={`bg-[#121212] border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedConversation?.user_id === u.user_id 
                          ? 'border-[#EF4444]' 
                          : 'border-[#27272a] hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold">{u.sender_name}</h3>
                        {u.unread_count > 0 && (
                          <span className="bg-[#EF4444] text-white text-xs rounded-full px-2 py-0.5">
                            {u.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs mb-1">{u.sender_email}</p>
                      <p className="text-gray-500 text-sm truncate">{u.last_content}</p>
                      <p className="text-gray-600 text-xs mt-1">{formatDate(u.last_message)}</p>
                    </div>
                  )) : (
                    <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6 text-center text-gray-400">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>{isFr ? 'Aucun message' : 'No messages yet'}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Conversation */}
              <div className="lg:col-span-2">
                {selectedConversation ? (
                  <div className="bg-[#121212] border border-[#27272a] rounded-lg overflow-hidden h-[600px] flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-[#27272a] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#EF4444]/20 rounded-full">
                          <MessageCircle className="w-5 h-5 text-[#EF4444]" />
                        </div>
                        <div>
                          <h3 className="font-bold">{selectedConversation.name}</h3>
                          <p className="text-gray-400 text-sm">{selectedConversation.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                          onClick={() => toast.info(isFr ? 'Fonctionnalité d\'appel à venir!' : 'Call feature coming soon!')}
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          {isFr ? 'Appeler' : 'Call'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                          onClick={() => toast.info(isFr ? 'Fonctionnalité vidéo à venir!' : 'Video feature coming soon!')}
                        >
                          <VideoIcon className="w-4 h-4 mr-1" />
                          {isFr ? 'Vidéo' : 'Video'}
                        </Button>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {conversationMessages.map((msg, idx) => (
                        <div 
                          key={idx} 
                          className={`flex ${msg.is_from_admin ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] p-3 rounded-lg ${
                            msg.is_from_admin 
                              ? 'bg-[#EF4444] text-white' 
                              : 'bg-[#27272a] text-white'
                          }`}>
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-xs mt-1 ${msg.is_from_admin ? 'text-white/60' : 'text-gray-500'}`}>
                              {formatDate(msg.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-[#27272a] flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={isFr ? "Écrivez votre message..." : "Write your message..."}
                        className="bg-[#09090b] border-[#27272a]"
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      />
                      <Button 
                        onClick={sendMessage} 
                        className="bg-[#EF4444]"
                        disabled={!newMessage.trim()}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#121212] border border-[#27272a] rounded-lg p-12 text-center text-gray-400 h-[600px] flex flex-col items-center justify-center">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">{isFr ? 'Sélectionnez une conversation' : 'Select a conversation'}</p>
                    <p className="text-sm mt-2">{isFr ? 'Répondez aux messages de vos abonnés' : 'Reply to your subscribers messages'}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Workouts Tab */}
          {activeTab === 'workouts' && (
            <AdminWorkouts />
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
                      <option value="mass_gain">{isFr ? 'Prise de masse' : 'Mass Gain'}</option>
                      <option value="weight_loss">{isFr ? 'Perte de poids' : 'Weight Loss'}</option>
                      <option value="abs">{isFr ? 'Abdominaux' : 'Abs'}</option>
                      <option value="legs_glutes">{isFr ? 'Jambes & Fessiers' : 'Legs & Glutes'}</option>
                      <option value="women_fitness">{isFr ? 'Spécial Femme' : 'Women Special'}</option>
                      <option value="yoga">{isFr ? 'Yoga & Détente' : 'Yoga & Relaxation'}</option>
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
                    <div className="lg:col-span-2">
                      <VideoUploader
                        value={newExercise.video_url}
                        onChange={(url) => setNewExercise(prev => ({ ...prev, video_url: url }))}
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

          {/* Routines Tab */}
          {activeTab === 'routines' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                {isFr ? 'Gestion Échauffement & Étirements' : 'Warm-Up & Stretching Management'}
              </h2>
              <p className="text-gray-400 text-sm">
                {isFr 
                  ? 'Gérez les exercices d\'échauffement (avant la séance) et d\'étirements (après la séance). Ces routines sont automatiquement affichées sur chaque page de séance.'
                  : 'Manage warm-up exercises (before workout) and stretching exercises (after workout). These routines are automatically displayed on each workout page.'}
              </p>

              {routines.length === 0 ? (
                <div className="bg-[#121212] border border-[#27272a] rounded-lg p-8 text-center">
                  <Sparkles className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">
                    {isFr ? 'Aucune routine trouvée. Exécutez le script de seeding.' : 'No routines found. Run the seeding script.'}
                  </p>
                </div>
              ) : (
                routines.map(routine => {
                  const isWarmup = routine.type === 'warmup';
                  const Icon = isWarmup ? Flame : Sparkles;
                  const colorClass = isWarmup ? 'text-orange-400' : 'text-purple-400';
                  const bgClass = isWarmup ? 'bg-orange-500/10 border-orange-500/30' : 'bg-purple-500/10 border-purple-500/30';
                  
                  return (
                    <div key={routine.routine_id} className={`border rounded-lg overflow-hidden ${bgClass}`}>
                      <div 
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5"
                        onClick={() => setExpandedRoutine(expandedRoutine === routine.routine_id ? null : routine.routine_id)}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-6 h-6 ${colorClass}`} />
                          <div>
                            <h3 className={`font-bold ${colorClass}`}>{routine.title}</h3>
                            <p className="text-gray-400 text-sm">
                              {routine.exercises?.length || 0} {isFr ? 'exercices' : 'exercises'} • {routine.duration} • {routine.language?.toUpperCase()}
                            </p>
                          </div>
                        </div>
                        {expandedRoutine === routine.routine_id ? <ChevronUp /> : <ChevronDown />}
                      </div>

                      {expandedRoutine === routine.routine_id && (
                        <div className="border-t border-[#27272a] p-4 space-y-4">
                          {/* Exercises List */}
                          <div className="space-y-3">
                            {routine.exercises?.map((exercise, idx) => (
                              <div key={idx} className="bg-[#09090b] rounded-lg p-4">
                                {editingRoutineExercise === `${routine.routine_id}-${idx}` ? (
                                  <div className="space-y-3">
                                    <Input
                                      placeholder={isFr ? "Nom de l'exercice" : "Exercise name"}
                                      defaultValue={exercise.name}
                                      id={`routine-ex-name-${routine.routine_id}-${idx}`}
                                      className="bg-[#121212] border-[#27272a]"
                                    />
                                    <Input
                                      placeholder="Description"
                                      defaultValue={exercise.description}
                                      id={`routine-ex-desc-${routine.routine_id}-${idx}`}
                                      className="bg-[#121212] border-[#27272a]"
                                    />
                                    <Input
                                      placeholder={isFr ? "Durée (ex: 30 secondes)" : "Duration (e.g., 30 seconds)"}
                                      defaultValue={exercise.duration}
                                      id={`routine-ex-duration-${routine.routine_id}-${idx}`}
                                      className="bg-[#121212] border-[#27272a]"
                                    />
                                    <Input
                                      placeholder="Image URL"
                                      defaultValue={exercise.image_url}
                                      id={`routine-ex-image-${routine.routine_id}-${idx}`}
                                      className="bg-[#121212] border-[#27272a]"
                                    />
                                    <Input
                                      placeholder="Video URL (YouTube embed)"
                                      defaultValue={exercise.video_url}
                                      id={`routine-ex-video-${routine.routine_id}-${idx}`}
                                      className="bg-[#121212] border-[#27272a]"
                                    />
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() => {
                                          const updates = {
                                            name: document.getElementById(`routine-ex-name-${routine.routine_id}-${idx}`).value,
                                            description: document.getElementById(`routine-ex-desc-${routine.routine_id}-${idx}`).value,
                                            duration: document.getElementById(`routine-ex-duration-${routine.routine_id}-${idx}`).value,
                                            image_url: document.getElementById(`routine-ex-image-${routine.routine_id}-${idx}`).value,
                                            video_url: document.getElementById(`routine-ex-video-${routine.routine_id}-${idx}`).value
                                          };
                                          updateRoutineExercise(routine.routine_id, idx, updates);
                                        }}
                                        className="bg-green-500 hover:bg-green-600"
                                        disabled={saving}
                                      >
                                        <Save className="w-4 h-4 mr-2" />
                                        {isFr ? 'Sauvegarder' : 'Save'}
                                      </Button>
                                      <Button
                                        variant="outline"
                                        onClick={() => setEditingRoutineExercise(null)}
                                        className="border-[#27272a]"
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-start gap-4">
                                    {exercise.image_url && (
                                      <img 
                                        src={exercise.image_url} 
                                        alt={exercise.name}
                                        className="w-20 h-20 rounded object-cover"
                                      />
                                    )}
                                    <div className="flex-1">
                                      <h4 className="font-bold">{exercise.name}</h4>
                                      <p className="text-gray-500 text-sm">{exercise.description}</p>
                                      <div className="flex items-center gap-4 mt-2 text-sm">
                                        <span className={`${colorClass} flex items-center gap-1`}>
                                          <Clock className="w-3 h-3" />
                                          {exercise.duration}
                                        </span>
                                        {exercise.video_url && (
                                          <span className="text-red-400 flex items-center gap-1">
                                            <Video className="w-3 h-3" />
                                            {isFr ? 'Vidéo' : 'Video'} ✓
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setEditingRoutineExercise(`${routine.routine_id}-${idx}`)}
                                        className="border-[#27272a]"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => deleteRoutineExercise(routine.routine_id, idx)}
                                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Add New Exercise Form */}
                          <div className="bg-[#1a1a1a] rounded-lg p-4 border border-dashed border-[#27272a]">
                            <h4 className={`font-bold mb-3 ${colorClass}`}>
                              <Plus className="w-4 h-4 inline mr-2" />
                              {isFr ? 'Ajouter un exercice' : 'Add Exercise'}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <Input
                                placeholder={isFr ? "Nom de l'exercice *" : "Exercise name *"}
                                value={newRoutineExercise.name}
                                onChange={(e) => setNewRoutineExercise({...newRoutineExercise, name: e.target.value})}
                                className="bg-[#121212] border-[#27272a]"
                              />
                              <Input
                                placeholder={isFr ? "Durée (ex: 30 secondes)" : "Duration (e.g., 30 seconds)"}
                                value={newRoutineExercise.duration}
                                onChange={(e) => setNewRoutineExercise({...newRoutineExercise, duration: e.target.value})}
                                className="bg-[#121212] border-[#27272a]"
                              />
                              <Input
                                placeholder="Description"
                                value={newRoutineExercise.description}
                                onChange={(e) => setNewRoutineExercise({...newRoutineExercise, description: e.target.value})}
                                className="bg-[#121212] border-[#27272a] md:col-span-2"
                              />
                              <Input
                                placeholder="Image URL"
                                value={newRoutineExercise.image_url}
                                onChange={(e) => setNewRoutineExercise({...newRoutineExercise, image_url: e.target.value})}
                                className="bg-[#121212] border-[#27272a]"
                              />
                              <div className="col-span-2">
                                <VideoUploader
                                  value={newRoutineExercise.video_url}
                                  onChange={(url) => setNewRoutineExercise({...newRoutineExercise, video_url: url})}
                                />
                              </div>
                            </div>
                            <Button
                              onClick={() => addRoutineExercise(routine.routine_id)}
                              className={isWarmup ? "mt-3 bg-orange-500 hover:bg-orange-600" : "mt-3 bg-purple-500 hover:bg-purple-600"}
                              disabled={saving}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              {isFr ? 'Ajouter' : 'Add'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
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

                  {expandedSupplement === supplement.supplement_id && (
                    <div className="border-t border-[#27272a] p-4 space-y-4">
                      {/* Add New Meal Section */}
                      <div className="bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/30 rounded-lg p-4">
                        <h4 className="font-bold text-green-400 mb-3 flex items-center gap-2">
                          <Plus className="w-5 h-5" />
                          {isFr ? 'Ajouter un Nouveau Repas' : 'Add New Meal'}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Input
                            placeholder={isFr ? "Nom du repas *" : "Meal name *"}
                            id={`new-meal-name-${supplement.supplement_id}`}
                            className="bg-[#09090b] border-[#27272a]"
                          />
                          <Input
                            placeholder={isFr ? "Description" : "Description"}
                            id={`new-meal-desc-${supplement.supplement_id}`}
                            className="bg-[#09090b] border-[#27272a]"
                          />
                          <Input
                            placeholder="Calories (ex: 450)"
                            type="number"
                            id={`new-meal-cal-${supplement.supplement_id}`}
                            className="bg-[#09090b] border-[#27272a]"
                          />
                          <Input
                            placeholder={isFr ? "Protéines g" : "Protein g"}
                            type="number"
                            id={`new-meal-prot-${supplement.supplement_id}`}
                            className="bg-[#09090b] border-[#27272a]"
                          />
                          <Input
                            placeholder={isFr ? "Glucides g" : "Carbs g"}
                            type="number"
                            id={`new-meal-carbs-${supplement.supplement_id}`}
                            className="bg-[#09090b] border-[#27272a]"
                          />
                          <Input
                            placeholder={isFr ? "Lipides g" : "Fat g"}
                            type="number"
                            id={`new-meal-fat-${supplement.supplement_id}`}
                            className="bg-[#09090b] border-[#27272a]"
                          />
                          <Input
                            placeholder="Image URL (optionnel)"
                            id={`new-meal-img-${supplement.supplement_id}`}
                            className="bg-[#09090b] border-[#27272a] md:col-span-2"
                          />
                        </div>
                        <Button
                          onClick={async () => {
                            const name = document.getElementById(`new-meal-name-${supplement.supplement_id}`).value;
                            if (!name) {
                              toast.error(isFr ? 'Veuillez entrer le nom du repas' : 'Please enter meal name');
                              return;
                            }
                            setSaving(true);
                            try {
                              await axios.post(`${API}/admin/supplements/${supplement.supplement_id}/meals`, {
                                name,
                                description: document.getElementById(`new-meal-desc-${supplement.supplement_id}`).value || '',
                                calories: parseInt(document.getElementById(`new-meal-cal-${supplement.supplement_id}`).value) || 0,
                                protein: parseInt(document.getElementById(`new-meal-prot-${supplement.supplement_id}`).value) || 0,
                                carbs: parseInt(document.getElementById(`new-meal-carbs-${supplement.supplement_id}`).value) || 0,
                                fat: parseInt(document.getElementById(`new-meal-fat-${supplement.supplement_id}`).value) || 0,
                                image_url: document.getElementById(`new-meal-img-${supplement.supplement_id}`).value || ''
                              }, { headers: getAuthHeaders() });
                              toast.success(isFr ? 'Repas ajouté!' : 'Meal added!');
                              // Clear fields
                              document.getElementById(`new-meal-name-${supplement.supplement_id}`).value = '';
                              document.getElementById(`new-meal-desc-${supplement.supplement_id}`).value = '';
                              document.getElementById(`new-meal-cal-${supplement.supplement_id}`).value = '';
                              document.getElementById(`new-meal-prot-${supplement.supplement_id}`).value = '';
                              document.getElementById(`new-meal-carbs-${supplement.supplement_id}`).value = '';
                              document.getElementById(`new-meal-fat-${supplement.supplement_id}`).value = '';
                              document.getElementById(`new-meal-img-${supplement.supplement_id}`).value = '';
                              fetchSupplements();
                            } catch (error) {
                              toast.error(isFr ? 'Erreur lors de l\'ajout' : 'Error adding meal');
                            }
                            setSaving(false);
                          }}
                          disabled={saving}
                          className="mt-3 bg-green-600 hover:bg-green-700"
                        >
                          {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                          {isFr ? 'Ajouter le Repas' : 'Add Meal'}
                        </Button>
                      </div>

                      {/* Existing Meals */}
                      <h4 className="font-bold text-white flex items-center gap-2 pt-2">
                        <Pill className="w-5 h-5 text-green-400" />
                        {isFr ? 'Repas Existants' : 'Existing Meals'} ({supplement.meals?.length || 0})
                      </h4>
                      {supplement.meals?.map((meal, idx) => (
                        <div key={`${supplement.supplement_id}-meal-${idx}`} className="bg-[#09090b] p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {meal.image_url && (
                                <img src={meal.image_url} alt={meal.name} className="w-12 h-12 rounded object-cover" />
                              )}
                              <div>
                                <h4 className="font-medium">{meal.name}</h4>
                                <p className="text-gray-500 text-xs">
                                  {meal.calories}cal • {meal.protein}g prot • {meal.carbs}g carbs • {meal.fat}g fat
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingMeal(editingMeal === `${supplement.supplement_id}-${idx}` ? null : `${supplement.supplement_id}-${idx}`)}
                                className="text-gray-400 hover:text-white"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={async () => {
                                  if (!window.confirm(isFr ? 'Supprimer ce repas?' : 'Delete this meal?')) return;
                                  try {
                                    await axios.delete(`${API}/admin/supplements/${supplement.supplement_id}/meals/${idx}`, { headers: getAuthHeaders() });
                                    toast.success(isFr ? 'Repas supprimé' : 'Meal deleted');
                                    fetchSupplements();
                                  } catch (error) {
                                    toast.error(isFr ? 'Erreur' : 'Error');
                                  }
                                }}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
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
                              {meal.recipe && (
                                <span className="flex items-center gap-1 text-green-400">
                                  <Check className="w-3 h-3" />
                                  {isFr ? 'Recette ✓' : 'Recipe ✓'}
                                </span>
                              )}
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
