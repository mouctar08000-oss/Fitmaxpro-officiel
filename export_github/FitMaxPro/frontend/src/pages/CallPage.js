import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Volume2,
  VolumeX,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

// LiveKit imports (conditionally loaded)
let LiveKitRoom, VideoConference, RoomAudioRenderer, ControlBar;
try {
  const livekit = require('@livekit/components-react');
  LiveKitRoom = livekit.LiveKitRoom;
  VideoConference = livekit.VideoConference;
  RoomAudioRenderer = livekit.RoomAudioRenderer;
  ControlBar = livekit.ControlBar;
  require('@livekit/components-styles');
} catch (e) {
  console.log('LiveKit components not available');
}

const API = process.env.REACT_APP_BACKEND_URL;

const CallPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const callType = searchParams.get('type') || 'audio';
  const calleeId = searchParams.get('callee') || 'coach';
  
  // LiveKit state
  const [liveKitStatus, setLiveKitStatus] = useState(null);
  const [liveKitToken, setLiveKitToken] = useState(null);
  const [liveKitServerUrl, setLiveKitServerUrl] = useState(null);
  const [roomName, setRoomName] = useState(null);
  const [callId, setCallId] = useState(null);
  
  // Call state
  const [callStatus, setCallStatus] = useState('initializing');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'video');
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [error, setError] = useState(null);
  
  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const timerRef = useRef(null);
  const localStreamRef = useRef(null);
  
  const isFr = t('language') === 'fr' || navigator.language?.startsWith('fr');

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('session_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  // Check LiveKit status on mount
  useEffect(() => {
    const checkLiveKitStatus = async () => {
      try {
        const response = await axios.get(`${API}/api/livekit/status`, {
          headers: getAuthHeaders()
        });
        setLiveKitStatus(response.data);
        
        if (response.data.configured) {
          // LiveKit is available, initiate real call
          initiateRealCall();
        } else {
          // LiveKit not configured, use mock mode
          initiateMockCall();
        }
      } catch (err) {
        console.error('Error checking LiveKit status:', err);
        // Fallback to mock mode
        initiateMockCall();
      }
    };
    
    checkLiveKitStatus();
    
    return () => {
      // Cleanup on unmount
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Initiate real LiveKit call
  const initiateRealCall = async () => {
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
        
        // Simulate answer (in production, this would be push notification + callee acceptance)
        setTimeout(() => {
          setCallStatus('active');
          toast.success(isFr ? 'Appel connecté !' : 'Call connected!');
        }, 3000);
      } else {
        // Token not received, fall back to mock
        initiateMockCall();
      }
    } catch (err) {
      console.error('Error initiating call:', err);
      initiateMockCall();
    }
  };

  // Mock call for when LiveKit is not configured
  const initiateMockCall = async () => {
    setCallStatus('connecting');
    
    setTimeout(() => {
      setCallStatus('ringing');
    }, 1500);

    setTimeout(async () => {
      setCallStatus('active');
      toast.success(isFr ? 'Appel connecté (mode démo) !' : 'Call connected (demo mode)!');
      
      // Setup local media for mock call
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: callType === 'video'
        });
        localStreamRef.current = stream;
        
        if (localVideoRef.current && callType === 'video') {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Media access error:', err);
      }
    }, 4000);
  };

  // Call duration timer
  useEffect(() => {
    if (callStatus === 'active') {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [callStatus]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // End call
  const endCall = async () => {
    setCallStatus('ended');
    
    // Stop local media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Log call to backend
    try {
      if (callId) {
        await axios.post(
          `${API}/api/livekit/calls/${callId}/end`,
          null,
          {
            params: { duration: callDuration },
            headers: getAuthHeaders()
          }
        );
      } else {
        // Log mock call
        await axios.post(`${API}/api/calls/log`, {
          call_type: callType,
          duration: callDuration,
          callee_id: calleeId
        }, {
          headers: getAuthHeaders()
        });
      }
    } catch (err) {
      console.error('Error logging call:', err);
    }

    setTimeout(() => {
      navigate('/messages');
    }, 2000);
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
    }
  };

  // Toggle video
  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !isVideoEnabled;
      });
    }
  };

  // Render LiveKit real call
  const renderLiveKitCall = () => {
    if (!LiveKitRoom || !liveKitToken || !liveKitServerUrl) {
      return renderMockCall();
    }

    return (
      <div className="min-h-screen bg-black">
        <LiveKitRoom
          token={liveKitToken}
          serverUrl={liveKitServerUrl}
          connect={true}
          video={callType === 'video'}
          audio={true}
          onDisconnected={() => {
            setCallStatus('ended');
            setTimeout(() => navigate('/messages'), 2000);
          }}
          onError={(error) => {
            console.error('LiveKit error:', error);
            setError(error.message);
          }}
        >
          <div className="h-screen flex flex-col">
            {/* Video Area */}
            <div className="flex-1 relative">
              <VideoConference />
              
              {/* Call Info Overlay */}
              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-3 z-10">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-green-400 font-mono">{formatDuration(callDuration)}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-400">Coach FitMaxPro</span>
              </div>
            </div>
            
            {/* Controls */}
            <div className="bg-[#1a1a1a] p-4">
              <div className="flex items-center justify-center gap-4">
                <ControlBar
                  variation="minimal"
                  controls={{
                    microphone: true,
                    camera: callType === 'video',
                    screenShare: false,
                    leave: false,
                    chat: false,
                  }}
                />
                <Button
                  onClick={endCall}
                  className="bg-red-500 hover:bg-red-600 rounded-full p-4"
                  data-testid="end-call-btn"
                >
                  <PhoneOff className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </div>
          
          <RoomAudioRenderer />
        </LiveKitRoom>
      </div>
    );
  };

  // Render mock call (when LiveKit not available)
  const renderMockCall = () => {
    if (callStatus === 'active') {
      return (
        <div className="min-h-screen bg-black relative overflow-hidden">
          {/* Video backgrounds */}
          {callType === 'video' && (
            <>
              {/* Remote video (full screen) */}
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold">Coach FitMaxPro</h2>
                  </div>
                </div>
              </div>
              
              {/* Local video (picture-in-picture) */}
              <div className="absolute top-4 right-4 w-32 h-44 bg-zinc-800 rounded-lg overflow-hidden border-2 border-zinc-700 shadow-lg">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!isVideoEnabled && (
                  <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                    <VideoOff className="w-8 h-8 text-gray-500" />
                  </div>
                )}
              </div>
            </>
          )}

          {/* Audio call UI */}
          {callType === 'audio' && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
              <div className="text-center">
                <div className="w-32 h-32 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-24 h-24 bg-green-500/30 rounded-full flex items-center justify-center animate-pulse">
                    <User className="w-12 h-12 text-green-500" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-2">Coach FitMaxPro</h2>
                <p className="text-green-400">{isFr ? 'En cours' : 'In progress'}</p>
              </div>
            </div>
          )}

          {/* Call info bar */}
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-3">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-green-400 font-mono">{formatDuration(callDuration)}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-400">Coach FitMaxPro</span>
          </div>

          {/* Demo mode indicator */}
          {!liveKitStatus?.configured && (
            <div className="absolute top-4 right-4 sm:right-auto sm:left-1/2 sm:transform sm:-translate-x-1/2 bg-yellow-500/20 border border-yellow-500/50 px-3 py-1 rounded-full">
              <span className="text-yellow-400 text-xs">
                {isFr ? 'Mode Démo' : 'Demo Mode'}
              </span>
            </div>
          )}

          {/* Controls */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-4 bg-black/70 backdrop-blur-sm px-6 py-4 rounded-full">
              <button
                onClick={toggleMute}
                className={`p-4 rounded-full transition-colors ${
                  isMuted ? 'bg-red-500' : 'bg-zinc-700 hover:bg-zinc-600'
                }`}
                data-testid="mute-btn"
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>

              {callType === 'video' && (
                <button
                  onClick={toggleVideo}
                  className={`p-4 rounded-full transition-colors ${
                    !isVideoEnabled ? 'bg-red-500' : 'bg-zinc-700 hover:bg-zinc-600'
                  }`}
                  data-testid="video-toggle-btn"
                >
                  {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                </button>
              )}

              <button
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`p-4 rounded-full transition-colors ${
                  !isSpeakerOn ? 'bg-red-500' : 'bg-zinc-700 hover:bg-zinc-600'
                }`}
                data-testid="speaker-btn"
              >
                {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
              </button>

              <button
                onClick={endCall}
                className="p-4 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                data-testid="end-call-btn"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // Render connecting screen
  if (callStatus === 'initializing' || callStatus === 'connecting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <User className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Coach FitMaxPro</h2>
          <p className="text-gray-400 mb-8">
            {isFr ? 'Connexion en cours...' : 'Connecting...'}
          </p>
          <div className="flex justify-center gap-4">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  // Render ringing screen
  if (callStatus === 'ringing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <div className="w-24 h-24 bg-green-500/30 rounded-full flex items-center justify-center">
              {callType === 'video' ? (
                <Video className="w-12 h-12 text-green-500" />
              ) : (
                <Phone className="w-12 h-12 text-green-500" />
              )}
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Coach FitMaxPro</h2>
          <p className="text-green-400 mb-8 animate-pulse">
            {isFr ? 'Appel en cours...' : 'Calling...'}
          </p>
          
          <Button
            onClick={endCall}
            className="bg-red-500 hover:bg-red-600 rounded-full p-4"
            data-testid="cancel-call-btn"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
        </div>
      </div>
    );
  }

  // Render ended screen
  if (callStatus === 'ended') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <PhoneOff className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {isFr ? 'Appel terminé' : 'Call ended'}
          </h2>
          <p className="text-gray-400 mb-4">
            {isFr ? 'Durée' : 'Duration'}: {formatDuration(callDuration)}
          </p>
          <p className="text-gray-500">
            {isFr ? 'Retour à la messagerie...' : 'Returning to messages...'}
          </p>
        </div>
      </div>
    );
  }

  // Render error screen
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {isFr ? 'Erreur de connexion' : 'Connection Error'}
          </h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => {
                setError(null);
                setCallStatus('initializing');
                if (liveKitStatus?.configured) {
                  initiateRealCall();
                } else {
                  initiateMockCall();
                }
              }}
              className="bg-green-500 hover:bg-green-600"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {isFr ? 'Réessayer' : 'Retry'}
            </Button>
            <Button
              onClick={() => navigate('/messages')}
              variant="outline"
            >
              {isFr ? 'Retour' : 'Back'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render active call
  if (callStatus === 'active') {
    if (liveKitStatus?.configured && liveKitToken) {
      return renderLiveKitCall();
    }
    return renderMockCall();
  }

  return null;
};

export default CallPage;
