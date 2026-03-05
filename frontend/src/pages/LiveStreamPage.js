import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Users, 
  MessageCircle, 
  Send, 
  X, 
  Play,
  Square,
  Crown,
  Lock,
  Unlock,
  RefreshCw,
  Calendar,
  Clock,
  Plus,
  Hand,
  Wifi,
  WifiOff,
  AlertCircle,
  Camera,
  CameraOff
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { LiveKitVideoRoom, LiveKitCall, IncomingCallModal } from '../components/LiveKitRoom';

const API = process.env.REACT_APP_BACKEND_URL;

// Camera Preview Component
const CameraPreview = () => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const startCamera = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 360, facingMode: 'user' },
          audio: false
        });
        
        if (mounted) {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Camera error:', err);
        if (mounted) {
          setIsLoading(false);
          if (err.name === 'NotAllowedError') {
            setError('Veuillez autoriser l\'accès à la caméra');
          } else if (err.name === 'NotFoundError') {
            setError('Aucune caméra détectée');
          } else {
            setError(err.message || 'Erreur caméra');
          }
        }
      }
    };

    startCamera();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const retryCamera = async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setError(null);
    setIsLoading(true);
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 360, facingMode: 'user' },
        audio: false
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Erreur caméra');
    }
  };

  return (
    <div className="relative aspect-video bg-zinc-800 rounded-lg overflow-hidden">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-3 border-3 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-400 text-sm">Chargement de la caméra...</p>
          </div>
        </div>
      ) : error ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <CameraOff className="w-12 h-12 mx-auto mb-3 text-red-500" />
            <p className="text-red-400 text-sm mb-3">{error}</p>
            <Button onClick={retryCamera} size="sm" className="bg-red-600 hover:bg-red-700">
              <RefreshCw className="w-3 h-3 mr-1" />
              Réessayer
            </Button>
          </div>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />
          <div className="absolute bottom-2 left-2 bg-green-600 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
            <Camera className="w-3 h-3" />
            Caméra active
          </div>
        </>
      )}
    </div>
  );
};

const LiveStreamPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [activeLives, setActiveLives] = useState([]);
  const [scheduledLives, setScheduledLives] = useState([]);
  const [liveRequests, setLiveRequests] = useState([]);
  const [currentLive, setCurrentLive] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isBroadcaster, setIsBroadcaster] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // For admin: creating a new live
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [liveTitle, setLiveTitle] = useState('');
  const [liveDescription, setLiveDescription] = useState('');
  const [isVipOnly, setIsVipOnly] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  
  // For subscribers: requesting a live
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestTitle, setRequestTitle] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [requestCategory, setRequestCategory] = useState('');
  const [requestExerciseType, setRequestExerciseType] = useState('');
  
  // Live request categories
  const liveCategories = [
    { id: 'masse', labelFr: 'Prise de Masse', labelEn: 'Mass Gain' },
    { id: 'perte', labelFr: 'Perte de Poids', labelEn: 'Weight Loss' },
    { id: 'jambes', labelFr: 'Jambes', labelEn: 'Legs' },
    { id: 'femmes', labelFr: 'Programme Femmes', labelEn: 'Women Program' },
    { id: 'abdos', labelFr: 'Abdominaux', labelEn: 'Abs' },
    { id: 'yoga', labelFr: 'Yoga & Stretching', labelEn: 'Yoga & Stretching' },
    { id: 'cardio', labelFr: 'Cardio & HIIT', labelEn: 'Cardio & HIIT' },
    { id: 'nutrition', labelFr: 'Nutrition & Conseils', labelEn: 'Nutrition & Tips' },
    { id: 'qa', labelFr: 'Q&A / Questions-Réponses', labelEn: 'Q&A Session' },
    { id: 'autre', labelFr: 'Autre', labelEn: 'Other' }
  ];
  
  const exerciseTypes = [
    { id: 'debutant', labelFr: 'Niveau Débutant', labelEn: 'Beginner Level' },
    { id: 'intermediaire', labelFr: 'Niveau Intermédiaire', labelEn: 'Intermediate Level' },
    { id: 'avance', labelFr: 'Niveau Avancé', labelEn: 'Advanced Level' },
    { id: 'echauffement', labelFr: 'Échauffement', labelEn: 'Warm-up' },
    { id: 'etirements', labelFr: 'Étirements', labelEn: 'Stretching' },
    { id: 'technique', labelFr: 'Technique & Form', labelEn: 'Technique & Form' }
  ];
  
  // LiveKit WebRTC states
  const [liveKitStatus, setLiveKitStatus] = useState({ configured: false });
  const [liveKitToken, setLiveKitToken] = useState(null);
  const [liveKitServerUrl, setLiveKitServerUrl] = useState(null);
  const [isWebRTCConnected, setIsWebRTCConnected] = useState(false);
  
  const isAdmin = user?.role === 'admin';
  const isVIP = user?.subscription?.type === 'vip';
  
  const isFr = t('language') === 'fr' || navigator.language?.startsWith('fr');

  // Fetch active lives
  const fetchActiveLives = useCallback(async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('session_token');
      const response = await axios.get(`${API}/api/lives`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Handle new API format with active/scheduled arrays
      const data = response.data;
      if (data.active !== undefined) {
        setActiveLives(data.active || []);
        setScheduledLives(data.scheduled || []);
      } else if (Array.isArray(data)) {
        setActiveLives(data);
      } else {
        setActiveLives([]);
      }
    } catch (err) {
      console.error('Error fetching lives:', err);
      setActiveLives([]);
    }
  }, []);

  // Fetch scheduled lives and requests
  const fetchSchedule = useCallback(async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('session_token');
      const response = await axios.get(`${API}/api/lives/scheduled`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setScheduledLives(response.data.scheduled_lives || []);
    } catch (err) {
      console.error('Error fetching schedule:', err);
    }
  }, []);

  // Fetch live requests
  const fetchRequests = useCallback(async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('session_token');
      const response = await axios.get(`${API}/api/lives/requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLiveRequests(response.data.requests || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
  }, []);

  useEffect(() => {
    fetchActiveLives();
    fetchSchedule();
    fetchRequests();
    checkLiveKitStatus();
    const interval = setInterval(fetchActiveLives, 10000);
    return () => clearInterval(interval);
  }, [fetchActiveLives, fetchSchedule, fetchRequests]);

  // Check LiveKit WebRTC status
  const checkLiveKitStatus = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('session_token');
      const response = await axios.get(`${API}/api/livekit/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLiveKitStatus(response.data);
    } catch (err) {
      console.error('Error checking LiveKit status:', err);
      setLiveKitStatus({ configured: false });
    }
  };

  // Get LiveKit token for joining a room
  const getLiveKitToken = async (roomName, canPublish = false) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('session_token');
      const response = await axios.post(`${API}/api/livekit/token`, {
        room_name: roomName,
        can_publish: canPublish,
        can_subscribe: true,
        room_type: 'live'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setLiveKitToken(response.data.token);
      setLiveKitServerUrl(response.data.server_url);
      setIsWebRTCConnected(true);
      
      return response.data;
    } catch (err) {
      console.error('Error getting LiveKit token:', err);
      toast.error(err.response?.data?.detail || 'Error connecting to video service');
      return null;
    }
  };

  // Request a live session (subscriber)
  const requestLive = async () => {
    if (!requestCategory) {
      toast.error(isFr ? 'Veuillez sélectionner un thème' : 'Please select a topic');
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('session_token');
      const categoryLabel = liveCategories.find(c => c.id === requestCategory)?.[isFr ? 'labelFr' : 'labelEn'] || requestCategory;
      const exerciseLabel = exerciseTypes.find(e => e.id === requestExerciseType)?.[isFr ? 'labelFr' : 'labelEn'] || '';
      
      const fullTitle = requestTitle || `${categoryLabel}${exerciseLabel ? ` - ${exerciseLabel}` : ''}`;
      
      await axios.post(`${API}/api/live/request`, {
        title: fullTitle,
        message: requestMessage || (isFr ? 'Je souhaite une session live' : 'I would like a live session'),
        category: requestCategory,
        exercise_type: requestExerciseType,
        category_label: categoryLabel,
        exercise_label: exerciseLabel
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(isFr ? 'Demande envoyée au coach !' : 'Request sent to coach!');
      setShowRequestForm(false);
      setRequestTitle('');
      setRequestMessage('');
      setRequestCategory('');
      setRequestExerciseType('');
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error');
    } finally {
      setLoading(false);
    }
  };

  // Create a new live stream (admin only)
  const createLive = async () => {
    if (!liveTitle.trim()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('session_token');
      
      if (scheduledTime) {
        // Schedule for later
        await axios.post(`${API}/api/lives/schedule`, {
          title: liveTitle,
          description: liveDescription,
          is_vip: isVipOnly,
          scheduled_time: scheduledTime
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        toast.success(isFr ? 'Live programmé !' : 'Live scheduled!');
        setShowCreateForm(false);
        fetchSchedule();
      } else {
        // Start now
        const response = await axios.post(`${API}/api/lives`, {
          title: liveTitle,
          description: liveDescription,
          vip_only: isVipOnly
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setCurrentLive(response.data);
        setIsBroadcaster(true);
        setIsStreaming(true);
        setShowCreateForm(false);
        fetchActiveLives();
        
        // Use the host token directly from the response
        if (response.data.host_token && response.data.livekit_url) {
          setLiveKitToken(response.data.host_token);
          setLiveKitServerUrl(response.data.livekit_url);
          setIsWebRTCConnected(true);
          toast.success(isFr ? '🎥 Caméra prête ! Vous êtes en direct.' : '🎥 Camera ready! You are live.');
        } else if (response.data.token && response.data.server_url) {
          // Alternative field names from backend
          setLiveKitToken(response.data.token);
          setLiveKitServerUrl(response.data.server_url);
          setIsWebRTCConnected(true);
          toast.success(isFr ? '🎥 Caméra prête ! Vous êtes en direct.' : '🎥 Camera ready! You are live.');
        } else if (liveKitStatus.configured && response.data.live_id) {
          // Fallback: get token via API
          const roomName = response.data.livekit_room_name || `live_${response.data.live_id}`;
          const lkToken = await getLiveKitToken(roomName, true);
          if (lkToken) {
            toast.success(isFr ? 'WebRTC connecté !' : 'WebRTC connected!');
          }
        }
      }
      
      setLiveTitle('');
      setLiveDescription('');
      setScheduledTime('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create live');
    } finally {
      setLoading(false);
    }
  };

  // Join a live stream as viewer
  const joinLive = async (live) => {
    if (live.vip_only && !isVIP && !isAdmin) {
      setError('Cette session live est réservée aux abonnés VIP');
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('session_token');
      const response = await axios.post(`${API}/api/lives/${live.live_id}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCurrentLive({ ...live, token: response.data.token });
      setIsBroadcaster(false);
      setIsStreaming(true);
      
      // If LiveKit is configured, get token for viewing
      if (liveKitStatus.configured && live.live_id) {
        const roomName = `live_${live.live_id}`;
        const lkToken = await getLiveKitToken(roomName, false); // canPublish = false for viewer
        if (lkToken) {
          toast.success(isFr ? 'WebRTC connecté !' : 'WebRTC connected!');
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to join live');
    } finally {
      setLoading(false);
    }
  };

  // End live stream (admin only)
  const endLive = async () => {
    if (!currentLive) return;
    
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('session_token');
      await axios.post(`${API}/api/lives/${currentLive.live_id}/end`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCurrentLive(null);
      setIsStreaming(false);
      setIsBroadcaster(false);
      setLiveKitToken(null);
      setIsWebRTCConnected(false);
      fetchActiveLives();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to end live');
    }
  };

  // Leave live stream (viewer)
  const leaveLive = () => {
    setCurrentLive(null);
    setIsStreaming(false);
    setIsBroadcaster(false);
    setLiveKitToken(null);
    setIsWebRTCConnected(false);
  };

  // Send chat message
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentLive) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/api/lives/${currentLive.live_id}/chat`, {
        message: newMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setChatMessages(prev => [...prev, {
        user: user?.name,
        message: newMessage,
        timestamp: new Date().toISOString()
      }]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Render active lives list
  const renderLivesList = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Video className="w-8 h-8 text-red-500" />
            {t('live.title', 'Live Coaching')}
          </h1>
          <p className="text-gray-400 mt-2">
            {t('live.subtitle', 'Join live training sessions with your coach')}
          </p>
        </div>
        
        {isAdmin ? (
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 px-6 py-3 text-lg font-bold shadow-lg shadow-red-500/30 transition-all hover:scale-105"
            data-testid="start-live-btn"
          >
            <Play className="w-5 h-5 mr-2" />
            {isFr ? 'DÉMARRER UN LIVE' : 'START LIVE'}
          </Button>
        ) : (
          <Button 
            onClick={() => setShowRequestForm(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Hand className="w-4 h-4 mr-2" />
            {isFr ? 'Demander un Live' : 'Request Live'}
          </Button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-400">
          {error}
          <button onClick={() => setError(null)} className="float-right">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Create Live Form (Admin) */}
      {showCreateForm && isAdmin && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Video className="w-5 h-5 text-red-500" />
            {t('live.createNew', 'Create New Live Session')}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Side - Form */}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  {t('live.sessionTitle', 'Session Title')} *
                </label>
                <Input
                  value={liveTitle}
                  onChange={(e) => setLiveTitle(e.target.value)}
                  placeholder="Ex: Séance abdos en direct"
                  className="bg-black border-zinc-700"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  {t('live.description', 'Description')}
                </label>
                <textarea
                  value={liveDescription}
                  onChange={(e) => setLiveDescription(e.target.value)}
                  placeholder="Description de la session..."
                  className="w-full bg-black border border-zinc-700 rounded-md p-3 text-white min-h-[80px]"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsVipOnly(!isVipOnly)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    isVipOnly 
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400' 
                      : 'bg-zinc-800 border-zinc-700 text-gray-400'
                  }`}
                >
                  {isVipOnly ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  {isVipOnly ? 'VIP Only' : 'Public'}
                </button>
                
                <span className="text-sm text-gray-500">
                  {isVipOnly 
                    ? 'Seuls les abonnés VIP pourront rejoindre' 
                    : 'Tous les abonnés pourront rejoindre'
                  }
                </span>
              </div>
              
              {/* Schedule Option */}
              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  {isFr ? 'Programmer pour plus tard (optionnel)' : 'Schedule for later (optional)'}
                </label>
                <Input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="bg-black border-zinc-700"
                />
              </div>
            </div>
            
            {/* Right Side - Camera Preview */}
            <div className="space-y-3">
              <label className="text-sm text-gray-400 block">
                {isFr ? 'Aperçu de votre caméra' : 'Camera Preview'}
              </label>
              <CameraPreview />
            </div>
          </div>
          
          <div className="flex gap-4 pt-6 mt-4 border-t border-zinc-800">
            <Button 
              onClick={createLive}
              disabled={loading || !liveTitle.trim()}
              className={`flex-1 py-4 text-lg font-bold transition-all ${
                scheduledTime 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-lg shadow-red-500/30 hover:scale-[1.02]'
              }`}
              data-testid="confirm-start-live-btn"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              ) : scheduledTime ? (
                <Calendar className="w-5 h-5 mr-2" />
              ) : (
                <>
                  <span className="w-3 h-3 bg-white rounded-full mr-3 animate-pulse"></span>
                  <Play className="w-5 h-5 mr-2" />
                </>
              )}
              {scheduledTime ? (isFr ? 'PROGRAMMER LE LIVE' : 'SCHEDULE LIVE') : (isFr ? 'DÉMARRER LE LIVE MAINTENANT' : 'GO LIVE NOW')}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowCreateForm(false)}
              className="border-zinc-700 px-6"
            >
              {t('common.cancel', 'Cancel')}
            </Button>
          </div>
        </div>
      )}

      {/* Request Live Form (Subscribers) */}
      {showRequestForm && !isAdmin && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Hand className="w-5 h-5 text-purple-500" />
            {isFr ? 'Demander une session Live' : 'Request a Live Session'}
          </h2>
          
          <div className="space-y-4">
            {/* Category Selection */}
            <div>
              <label className="text-sm text-gray-400 block mb-2">
                {isFr ? 'Thème / Programme *' : 'Topic / Program *'}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {liveCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setRequestCategory(cat.id)}
                    className={`p-3 rounded-lg text-sm font-medium transition-all ${
                      requestCategory === cat.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                    }`}
                  >
                    {isFr ? cat.labelFr : cat.labelEn}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Exercise Type Selection */}
            <div>
              <label className="text-sm text-gray-400 block mb-2">
                {isFr ? 'Type d\'exercice (optionnel)' : 'Exercise Type (optional)'}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                {exerciseTypes.map(ex => (
                  <button
                    key={ex.id}
                    onClick={() => setRequestExerciseType(requestExerciseType === ex.id ? '' : ex.id)}
                    className={`p-2 rounded-lg text-xs font-medium transition-all ${
                      requestExerciseType === ex.id
                        ? 'bg-green-600 text-white'
                        : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                    }`}
                  >
                    {isFr ? ex.labelFr : ex.labelEn}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Custom Title */}
            <div>
              <label className="text-sm text-gray-400 block mb-2">
                {isFr ? 'Titre personnalisé (optionnel)' : 'Custom title (optional)'}
              </label>
              <Input
                value={requestTitle}
                onChange={(e) => setRequestTitle(e.target.value)}
                placeholder={isFr ? "Ex: Séance spéciale biceps et triceps" : "Ex: Special biceps and triceps session"}
                className="bg-black border-zinc-700"
              />
            </div>
            
            {/* Message */}
            <div>
              <label className="text-sm text-gray-400 block mb-2">
                {isFr ? 'Message au coach (optionnel)' : 'Message to coach (optional)'}
              </label>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder={isFr ? "Décrivez ce que vous aimeriez aborder, vos questions, objectifs..." : "Describe what you'd like to cover, your questions, goals..."}
                className="w-full bg-black border border-zinc-700 rounded-md p-3 text-white min-h-[100px]"
              />
            </div>
            
            {/* Preview */}
            {requestCategory && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <p className="text-purple-400 text-sm font-bold mb-1">
                  {isFr ? 'Aperçu de votre demande:' : 'Preview of your request:'}
                </p>
                <p className="text-white">
                  {requestTitle || `${liveCategories.find(c => c.id === requestCategory)?.[isFr ? 'labelFr' : 'labelEn']}${requestExerciseType ? ` - ${exerciseTypes.find(e => e.id === requestExerciseType)?.[isFr ? 'labelFr' : 'labelEn']}` : ''}`}
                </p>
              </div>
            )}
            
            <div className="flex gap-4">
              <Button 
                onClick={requestLive}
                disabled={loading || !requestCategory}
                className="bg-purple-600 hover:bg-purple-700 flex-1"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {isFr ? 'Envoyer la demande' : 'Send Request'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowRequestForm(false);
                  setRequestCategory('');
                  setRequestExerciseType('');
                  setRequestTitle('');
                  setRequestMessage('');
                }}
                className="border-zinc-700"
              >
                {isFr ? 'Annuler' : 'Cancel'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Lives */}
      {scheduledLives.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            {isFr ? 'Lives Programmés' : 'Scheduled Lives'}
          </h2>
          
          <div className="grid gap-3">
            {scheduledLives.map(live => (
              <div 
                key={live.live_id}
                className="bg-zinc-900 border border-blue-500/30 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-bold">{live.title}</h3>
                      <p className="text-blue-400 text-sm flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(live.scheduled_time).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {live.is_vip && (
                    <span className="bg-amber-500 text-black text-xs px-2 py-1 rounded font-bold">VIP</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Requests (Admin view) */}
      {isAdmin && liveRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Hand className="w-5 h-5 text-purple-500" />
            {isFr ? 'Demandes de Live' : 'Live Requests'}
            <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">{liveRequests.filter(r => r.status === 'pending').length}</span>
          </h2>
          
          <div className="grid gap-3">
            {liveRequests.filter(r => r.status === 'pending').map(request => (
              <div 
                key={request.request_id}
                className="bg-zinc-900 border border-purple-500/30 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">{request.user_name}</p>
                    <p className="text-gray-400">{request.title}</p>
                    {request.message && <p className="text-gray-500 text-sm mt-1">"{request.message}"</p>}
                    <p className="text-gray-600 text-xs mt-2">{new Date(request.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setLiveTitle(request.title);
                        setShowCreateForm(true);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      {isFr ? 'Accepter' : 'Accept'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Lives */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          {t('live.activeSessions', 'Active Sessions')}
        </h2>
        
        {activeLives.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
            <Video className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              {t('live.noActiveLives', 'No live sessions at the moment')}
            </p>
            <p className="text-gray-500 text-sm mt-2">
              {t('live.checkBack', 'Check back later or follow us on social media for announcements')}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {activeLives.map(live => (
              <div 
                key={live.live_id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-red-500/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <Video className="w-8 h-8 text-red-500" />
                      </div>
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></span>
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        {live.title}
                        {live.vip_only && (
                          <span className="bg-amber-500 text-black text-xs px-2 py-0.5 rounded font-bold flex items-center gap-1">
                            <Crown className="w-3 h-3" /> VIP
                          </span>
                        )}
                      </h3>
                      <p className="text-gray-400 text-sm">{live.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {live.viewer_count || 0} viewers
                        </span>
                        <span>Coach FitMaxPro</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => joinLive(live)}
                    disabled={live.vip_only && !isVIP && !isAdmin}
                    className={`${
                      live.vip_only && !isVIP && !isAdmin 
                        ? 'bg-gray-600 cursor-not-allowed' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {live.vip_only && !isVIP && !isAdmin ? (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        VIP Only
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        {t('live.join', 'Join')}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Lives Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">
          {t('live.howItWorks', 'How Live Sessions Work')}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Video className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-bold mb-2">{t('live.step1Title', 'Join Live')}</h3>
            <p className="text-gray-400 text-sm">
              {t('live.step1Desc', 'Click "Join" when a session is active to participate')}
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="font-bold mb-2">{t('live.step2Title', 'Interact')}</h3>
            <p className="text-gray-400 text-sm">
              {t('live.step2Desc', 'Chat with your coach and ask questions in real-time')}
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="font-bold mb-2">{t('live.step3Title', 'Train Together')}</h3>
            <p className="text-gray-400 text-sm">
              {t('live.step3Desc', 'Follow along with the workout in real-time')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Render live stream view
  const renderLiveView = () => (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-120px)]">
      {/* Video Section */}
      <div className="flex-1 bg-black rounded-lg overflow-hidden relative">
        {/* LiveKit WebRTC Video - Real streaming */}
        {liveKitToken && liveKitServerUrl && liveKitStatus.configured ? (
          <LiveKitVideoRoom
            token={liveKitToken}
            serverUrl={liveKitServerUrl}
            roomName={currentLive?.live_id ? `live_${currentLive.live_id}` : 'unknown'}
            isBroadcaster={isBroadcaster}
            participantName={user?.name || 'Viewer'}
            onDisconnect={() => {
              setIsWebRTCConnected(false);
              if (!isBroadcaster) {
                leaveLive();
              }
            }}
          />
        ) : (
          // Fallback: Video placeholder when LiveKit not configured
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
            <div className="text-center">
              {liveKitStatus.configured === false && (
                <div className="mb-4 bg-orange-500/20 border border-orange-500/50 rounded-lg p-4 max-w-md mx-auto">
                  <div className="flex items-center gap-2 justify-center text-orange-400 mb-2">
                    <WifiOff className="w-5 h-5" />
                    <span className="font-bold">{isFr ? 'WebRTC non configuré' : 'WebRTC not configured'}</span>
                  </div>
                  <p className="text-sm text-orange-300">
                    {isFr 
                      ? 'Pour activer la vidéo en direct, configurez LiveKit dans le fichier .env (LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET)'
                      : 'To enable live video, configure LiveKit in .env file (LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET)'}
                  </p>
                </div>
              )}
              <Video className="w-24 h-24 text-red-500 mx-auto mb-4 animate-pulse" />
              <h2 className="text-2xl font-bold mb-2">{currentLive?.title}</h2>
              <p className="text-gray-400">{currentLive?.description}</p>
              
              {isBroadcaster && (
                <div className="mt-6">
                  <span className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full">
                    <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
                    LIVE {liveKitStatus.configured ? '(WebRTC)' : '(Simulé)'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Top Bar with Live Status and End Button */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            {/* Left - Live Status */}
            <div className="flex items-center gap-4">
              <div className="bg-red-600 px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
                <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
                <span className="font-bold text-white">EN DIRECT</span>
              </div>
              {isWebRTCConnected && (
                <div className="bg-green-600/80 px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-white" />
                  <span className="text-white text-sm">Connecté</span>
                </div>
              )}
              <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-300" />
                <span className="text-white text-sm">{viewerCount} spectateurs</span>
              </div>
            </div>
            
            {/* Right - End Live Button */}
            {isBroadcaster && (
              <Button
                onClick={endLive}
                className="bg-red-600 hover:bg-red-700 px-6 py-2 text-lg font-bold shadow-lg animate-pulse hover:animate-none"
                data-testid="end-live-btn"
              >
                <Square className="w-5 h-5 mr-2" />
                {isFr ? 'TERMINER LE LIVE' : 'END LIVE'}
              </Button>
            )}
            
            {/* Right - Leave Button for Viewers */}
            {!isBroadcaster && (
              <Button
                onClick={leaveLive}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-4 py-2"
                data-testid="leave-live-btn"
              >
                <X className="w-4 h-4 mr-2" />
                {isFr ? 'Quitter' : 'Leave'}
              </Button>
            )}
          </div>
        </div>
        
        {/* Controls Bar at Bottom - Only show if LiveKit not handling them */}
        {!liveKitToken && isBroadcaster && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-xl">
            <button
              onClick={() => setVideoEnabled(!videoEnabled)}
              className={`p-3 rounded-full transition-all ${videoEnabled ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-red-500 hover:bg-red-600'}`}
              data-testid="toggle-camera-btn"
            >
              {videoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`p-3 rounded-full transition-all ${audioEnabled ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-red-500 hover:bg-red-600'}`}
              data-testid="toggle-mic-btn"
            >
              {audioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>
            <div className="w-px h-8 bg-zinc-600"></div>
            <button
              onClick={endLive}
              className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition-all"
              data-testid="end-live-bottom-btn"
            >
              <Square className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
      
      {/* Chat Section */}
      <div className="w-full lg:w-80 bg-zinc-900 border border-zinc-800 rounded-lg flex flex-col">
        <div className="p-4 border-b border-zinc-800">
          <h3 className="font-bold flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-red-500" />
            Live Chat
          </h3>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {chatMessages.length === 0 ? (
            <p className="text-gray-500 text-center text-sm">
              {t('live.noMessages', 'No messages yet. Start the conversation!')}
            </p>
          ) : (
            chatMessages.map((msg, idx) => (
              <div key={idx} className="bg-zinc-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-red-400">{msg.user}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm">{msg.message}</p>
              </div>
            ))
          )}
        </div>
        
        {/* Input */}
        <div className="p-4 border-t border-zinc-800">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={t('live.typeMessage', 'Type a message...')}
              className="bg-black border-zinc-700"
            />
            <Button onClick={sendMessage} size="icon" className="bg-red-600 hover:bg-red-700">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Connexion requise</h2>
          <p className="text-gray-400 mb-4">Connectez-vous pour accéder aux sessions live</p>
          <Button onClick={() => navigate('/login')} className="bg-red-600 hover:bg-red-700">
            Se connecter
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isStreaming ? renderLiveView() : renderLivesList()}
      </div>
    </div>
  );
};

export default LiveStreamPage;
