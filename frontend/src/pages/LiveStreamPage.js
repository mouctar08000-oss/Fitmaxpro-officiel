import React, { useState, useEffect, useCallback } from 'react';
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
  Hand
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;

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
      setActiveLives(response.data || []);
    } catch (err) {
      console.error('Error fetching lives:', err);
    }
  }, []);

  // Fetch scheduled lives and requests
  const fetchSchedule = useCallback(async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('session_token');
      const response = await axios.get(`${API}/api/live/schedule`, {
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
      const response = await axios.get(`${API}/api/live/requests`, {
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
    const interval = setInterval(fetchActiveLives, 10000);
    return () => clearInterval(interval);
  }, [fetchActiveLives, fetchSchedule, fetchRequests]);

  // Request a live session (subscriber)
  const requestLive = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('session_token');
      await axios.post(`${API}/api/live/request`, {
        title: requestTitle || (isFr ? 'Demande de Live' : 'Live Request'),
        message: requestMessage || (isFr ? 'Je souhaite une session live' : 'I would like a live session')
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(isFr ? 'Demande envoyée au coach !' : 'Request sent to coach!');
      setShowRequestForm(false);
      setRequestTitle('');
      setRequestMessage('');
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
        await axios.post(`${API}/api/live/schedule`, {
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
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API}/api/lives/${live.live_id}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCurrentLive({ ...live, token: response.data.token });
      setIsBroadcaster(false);
      setIsStreaming(true);
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
      const token = localStorage.getItem('token');
      await axios.post(`${API}/api/lives/${currentLive.live_id}/end`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCurrentLive(null);
      setIsStreaming(false);
      setIsBroadcaster(false);
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
            className="bg-red-600 hover:bg-red-700"
          >
            <Play className="w-4 h-4 mr-2" />
            {t('live.startLive', 'Start Live')}
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
                className="w-full bg-black border border-zinc-700 rounded-md p-3 text-white min-h-[100px]"
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
                  ? 'Seuls les abonnés VIP (9,99€) pourront rejoindre' 
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
              <p className="text-xs text-gray-500 mt-1">
                {isFr ? 'Laissez vide pour démarrer maintenant' : 'Leave empty to start now'}
              </p>
            </div>
            
            <div className="flex gap-4 pt-4">
              <Button 
                onClick={createLive}
                disabled={loading || !liveTitle.trim()}
                className="bg-red-600 hover:bg-red-700 flex-1"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : scheduledTime ? (
                  <Calendar className="w-4 h-4 mr-2" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                {scheduledTime ? (isFr ? 'Programmer' : 'Schedule') : (isFr ? 'Démarrer Live' : 'Go Live')}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
                className="border-zinc-700"
              >
                {t('common.cancel', 'Cancel')}
              </Button>
            </div>
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
            <div>
              <label className="text-sm text-gray-400 block mb-2">
                {isFr ? 'Sujet souhaité' : 'Desired topic'}
              </label>
              <Input
                value={requestTitle}
                onChange={(e) => setRequestTitle(e.target.value)}
                placeholder={isFr ? "Ex: Questions sur la nutrition" : "Ex: Questions about nutrition"}
                className="bg-black border-zinc-700"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400 block mb-2">
                {isFr ? 'Message (optionnel)' : 'Message (optional)'}
              </label>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder={isFr ? "Décrivez ce que vous aimeriez aborder..." : "Describe what you'd like to discuss..."}
                className="w-full bg-black border border-zinc-700 rounded-md p-3 text-white min-h-[100px]"
              />
            </div>
            
            <div className="flex gap-4">
              <Button 
                onClick={requestLive}
                disabled={loading}
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
                onClick={() => setShowRequestForm(false)}
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
        {/* Video placeholder - In production, this would be the LiveKit video */}
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
          <div className="text-center">
            <Video className="w-24 h-24 text-red-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold mb-2">{currentLive?.title}</h2>
            <p className="text-gray-400">{currentLive?.description}</p>
            
            {isBroadcaster && (
              <div className="mt-6">
                <span className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full">
                  <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
                  LIVE
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Viewer count */}
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          <span className="text-sm">LIVE</span>
          <span className="text-gray-400">•</span>
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{viewerCount}</span>
        </div>
        
        {/* Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full">
          {isBroadcaster && (
            <>
              <button
                onClick={() => setVideoEnabled(!videoEnabled)}
                className={`p-2 rounded-full ${videoEnabled ? 'bg-zinc-700' : 'bg-red-500'}`}
              >
                {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`p-2 rounded-full ${audioEnabled ? 'bg-zinc-700' : 'bg-red-500'}`}
              >
                {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
            </>
          )}
          
          <button
            onClick={isBroadcaster ? endLive : leaveLive}
            className="p-2 rounded-full bg-red-500 hover:bg-red-600"
          >
            <Square className="w-5 h-5" />
          </button>
        </div>
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
