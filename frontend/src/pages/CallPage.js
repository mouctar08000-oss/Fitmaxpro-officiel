import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
  MessageCircle,
  User,
  X,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;

const CallPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const callType = searchParams.get('type') || 'audio'; // 'audio' or 'video'
  const calleeId = searchParams.get('callee') || 'coach';
  
  // Call state
  const [callStatus, setCallStatus] = useState('connecting'); // connecting, ringing, active, ended
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'video');
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  
  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const timerRef = useRef(null);
  
  const isAdmin = user?.role === 'admin';
  const isFr = t('language') === 'fr' || navigator.language?.startsWith('fr');

  // Simulate call connection
  useEffect(() => {
    // Simulate connecting
    const connectTimer = setTimeout(() => {
      setCallStatus('ringing');
    }, 1500);

    // Simulate answer (in production, this would be WebRTC signaling)
    const answerTimer = setTimeout(() => {
      setCallStatus('active');
      toast.success(isFr ? 'Appel connecté !' : 'Call connected!');
    }, 4000);

    return () => {
      clearTimeout(connectTimer);
      clearTimeout(answerTimer);
    };
  }, [isFr]);

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

  // Request camera/microphone access
  useEffect(() => {
    const setupMedia = async () => {
      try {
        const constraints = {
          audio: true,
          video: callType === 'video'
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (localVideoRef.current && callType === 'video') {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Media access error:', err);
        toast.error(isFr 
          ? 'Impossible d\'accéder à la caméra/micro' 
          : 'Cannot access camera/microphone'
        );
      }
    };

    if (callStatus === 'active' || callStatus === 'ringing') {
      setupMedia();
    }
  }, [callStatus, callType, isFr]);

  // Format duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // End call
  const endCall = async () => {
    setCallStatus('ended');
    
    // Stop media tracks
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    
    // Log call to backend
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('session_token');
      await axios.post(`${API}/api/calls/log`, {
        call_type: callType,
        duration: callDuration,
        callee_id: calleeId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Error logging call:', err);
    }

    // Navigate back after delay
    setTimeout(() => {
      navigate('/messages');
    }, 2000);
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
    }
  };

  // Toggle video
  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getVideoTracks().forEach(track => {
        track.enabled = !isVideoEnabled;
      });
    }
  };

  // Render connecting screen
  if (callStatus === 'connecting') {
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

  // Render active call
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
            {/* Placeholder when no remote video */}
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

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center gap-4 bg-black/70 backdrop-blur-sm px-6 py-4 rounded-full">
          {/* Mute button */}
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full transition-colors ${
              isMuted ? 'bg-red-500' : 'bg-zinc-700 hover:bg-zinc-600'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {/* Video toggle (only for video calls) */}
          {callType === 'video' && (
            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full transition-colors ${
                !isVideoEnabled ? 'bg-red-500' : 'bg-zinc-700 hover:bg-zinc-600'
              }`}
            >
              {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>
          )}

          {/* Speaker toggle */}
          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`p-4 rounded-full transition-colors ${
              !isSpeakerOn ? 'bg-red-500' : 'bg-zinc-700 hover:bg-zinc-600'
            }`}
          >
            {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>

          {/* End call button */}
          <button
            onClick={endCall}
            className="p-4 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallPage;
