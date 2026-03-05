import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  User,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { LiveKitVideoRoom, IncomingCallModal } from '../components/LiveKitRoom';

const API = process.env.REACT_APP_BACKEND_URL;

const CallPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get call parameters from URL
  const callType = searchParams.get('type') || 'video';
  const calleeId = searchParams.get('callee') || 'coach';
  const incomingCallId = searchParams.get('call_id');
  const isIncoming = searchParams.get('incoming') === 'true';
  
  // LiveKit state
  const [liveKitStatus, setLiveKitStatus] = useState(null);
  const [liveKitToken, setLiveKitToken] = useState(null);
  const [liveKitServerUrl, setLiveKitServerUrl] = useState(null);
  const [roomName, setRoomName] = useState(null);
  const [callId, setCallId] = useState(incomingCallId || null);
  
  // Call state
  const [callStatus, setCallStatus] = useState('initializing');
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState(null);
  const [callerInfo, setCallerInfo] = useState(null);
  
  const isFr = t('language') === 'fr' || navigator.language?.startsWith('fr');

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('session_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  // Check LiveKit status on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        const response = await axios.get(`${API}/api/livekit/status`, {
          headers: getAuthHeaders()
        });
        setLiveKitStatus(response.data);
        
        if (!response.data.configured) {
          setError(isFr ? 'Service d\'appel non configuré' : 'Call service not configured');
          return;
        }

        if (isIncoming && incomingCallId) {
          // This is an incoming call - answer it
          await answerIncomingCall(incomingCallId);
        } else {
          // This is an outgoing call - initiate it
          await initiateCall();
        }
      } catch (err) {
        console.error('Error initializing call:', err);
        setError(err.response?.data?.detail || 'Connection error');
      }
    };
    
    initialize();
  }, []);

  // Answer incoming call
  const answerIncomingCall = async (callIdToAnswer) => {
    setCallStatus('connecting');
    
    try {
      const response = await axios.post(
        `${API}/api/livekit/calls/${callIdToAnswer}/answer`,
        null,
        {
          params: { accept: true },
          headers: getAuthHeaders()
        }
      );
      
      if (response.data.token && response.data.server_url) {
        setLiveKitToken(response.data.token);
        setLiveKitServerUrl(response.data.server_url);
        setRoomName(response.data.room_name);
        setCallId(callIdToAnswer);
        setCallerInfo({ name: response.data.caller_name });
        setCallStatus('active');
        toast.success(isFr ? 'Appel connecté !' : 'Call connected!');
      }
    } catch (err) {
      console.error('Error answering call:', err);
      setError(err.response?.data?.detail || 'Failed to answer call');
    }
  };

  // Initiate outgoing call
  const initiateCall = async () => {
    setCallStatus('connecting');
    
    try {
      const response = await axios.post(
        `${API}/api/livekit/calls/initiate`,
        null,
        {
          params: { callee_id: calleeId, call_type: callType },
          headers: getAuthHeaders()
        }
      );
      
      if (response.data.token && response.data.server_url) {
        setLiveKitToken(response.data.token);
        setLiveKitServerUrl(response.data.server_url);
        setRoomName(response.data.room_name);
        setCallId(response.data.call_id);
        setCallStatus('ringing');
        
        // Wait for callee to answer (in production: push notification)
        // For now, auto-connect after a delay
        setTimeout(() => {
          setCallStatus('active');
          toast.success(isFr ? 'Appel connecté !' : 'Call connected!');
        }, 3000);
      } else {
        setError(response.data.message || 'Failed to initiate call');
      }
    } catch (err) {
      console.error('Error initiating call:', err);
      setError(err.response?.data?.detail || 'Failed to initiate call');
    }
  };

  // Call duration timer
  useEffect(() => {
    let timer;
    if (callStatus === 'active') {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callStatus]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // End call
  const endCall = useCallback(() => {
    setCallStatus('ended');
    toast.info(isFr ? 'Appel terminé' : 'Call ended');
    setTimeout(() => navigate(-1), 1500);
  }, [navigate, isFr]);

  // Handle disconnect from LiveKit
  const handleDisconnect = useCallback(() => {
    endCall();
  }, [endCall]);

  // Render connecting state
  if (callStatus === 'initializing' || callStatus === 'connecting') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isFr ? 'Connexion en cours...' : 'Connecting...'}
          </h2>
          <p className="text-gray-400">
            {isFr ? 'Veuillez patienter' : 'Please wait'}
          </p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold text-white mb-2">
            {isFr ? 'Erreur de connexion' : 'Connection Error'}
          </h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              {isFr ? 'Réessayer' : 'Retry'}
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)} className="border-gray-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {isFr ? 'Retour' : 'Back'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render ringing state
  if (callStatus === 'ringing') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center animate-pulse">
            {callType === 'video' ? (
              <Video className="w-10 h-10 text-white" />
            ) : (
              <Phone className="w-10 h-10 text-white" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isFr ? 'Appel en cours...' : 'Calling...'}
          </h2>
          <p className="text-gray-400 mb-8">
            {isFr ? 'En attente de réponse' : 'Waiting for answer'}
          </p>
          <Button onClick={endCall} className="bg-red-600 hover:bg-red-700 rounded-full w-16 h-16">
            <PhoneOff className="w-6 h-6" />
          </Button>
        </div>
      </div>
    );
  }

  // Render ended state
  if (callStatus === 'ended') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <PhoneOff className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold text-white mb-2">
            {isFr ? 'Appel terminé' : 'Call Ended'}
          </h2>
          <p className="text-gray-400 mb-2">
            {isFr ? 'Durée :' : 'Duration:'} {formatDuration(callDuration)}
          </p>
        </div>
      </div>
    );
  }

  // Render active call with LiveKit
  return (
    <div className="min-h-screen bg-black">
      {/* Call Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 px-3 py-1.5 rounded-full flex items-center gap-2">
              <Wifi className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">
                {callType === 'video' ? (isFr ? 'Appel Vidéo' : 'Video Call') : (isFr ? 'Appel Audio' : 'Audio Call')}
              </span>
            </div>
            <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <span className="text-white text-sm font-mono">{formatDuration(callDuration)}</span>
            </div>
          </div>
          
          {callerInfo && (
            <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-white text-sm">{callerInfo.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* LiveKit Video Room */}
      {liveKitToken && liveKitServerUrl && (
        <div className="h-screen">
          <LiveKitVideoRoom
            token={liveKitToken}
            serverUrl={liveKitServerUrl}
            roomName={roomName}
            isBroadcaster={true}
            participantName={user?.name || 'User'}
            onDisconnect={handleDisconnect}
          />
        </div>
      )}
    </div>
  );
};

export default CallPage;
