import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  LiveKitRoom as LKRoom,
  VideoTrack,
  AudioTrack,
  useTracks,
  useParticipants,
  useLocalParticipant,
  useRoomContext,
  RoomAudioRenderer,
  TrackRefContext,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track, RoomEvent, createLocalVideoTrack, createLocalAudioTrack } from 'livekit-client';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Users, 
  Maximize,
  Minimize,
  Camera,
  CameraOff,
  RefreshCw,
  AlertCircle,
  Wifi,
  WifiOff,
  ScreenShare,
  ScreenShareOff
} from 'lucide-react';
import { Button } from './ui/button';

// Enhanced Video Tile Component with direct MediaStream handling
const VideoTile = ({ participant, isLocal = false, className = '' }) => {
  const videoRef = useRef(null);
  const [videoTrack, setVideoTrack] = useState(null);
  const [hasVideo, setHasVideo] = useState(false);

  useEffect(() => {
    if (!participant) return;

    const updateVideoTrack = () => {
      const publication = participant.getTrackPublication(Track.Source.Camera);
      const track = publication?.track;
      
      if (track && videoRef.current) {
        // Attach track to video element
        track.attach(videoRef.current);
        setVideoTrack(track);
        setHasVideo(true);
      } else {
        setVideoTrack(null);
        setHasVideo(false);
      }
    };

    // Initial check
    updateVideoTrack();

    // Listen for track events
    participant.on('trackSubscribed', updateVideoTrack);
    participant.on('trackUnsubscribed', updateVideoTrack);
    participant.on('trackPublished', updateVideoTrack);
    participant.on('trackUnpublished', updateVideoTrack);
    participant.on('trackMuted', updateVideoTrack);
    participant.on('trackUnmuted', updateVideoTrack);

    return () => {
      participant.off('trackSubscribed', updateVideoTrack);
      participant.off('trackUnsubscribed', updateVideoTrack);
      participant.off('trackPublished', updateVideoTrack);
      participant.off('trackUnpublished', updateVideoTrack);
      participant.off('trackMuted', updateVideoTrack);
      participant.off('trackUnmuted', updateVideoTrack);
      
      // Detach track on cleanup
      if (videoTrack && videoRef.current) {
        videoTrack.detach(videoRef.current);
      }
    };
  }, [participant]);

  const isMuted = participant?.isMicrophoneEnabled === false;
  const displayName = participant?.name || participant?.identity || 'Participant';

  return (
    <div className={`relative bg-zinc-900 rounded-lg overflow-hidden ${className}`}>
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
          style={{ transform: isLocal ? 'scaleX(-1)' : 'none' }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-zinc-700 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="text-zinc-400 text-sm">{displayName}</p>
            <p className="text-zinc-600 text-xs mt-1">Caméra désactivée</p>
          </div>
        </div>
      )}
      
      {/* Name badge */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        <div className="bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
          {isLocal && (
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          )}
          <span className="text-white text-sm font-medium">{displayName}</span>
          {isMuted && <MicOff className="w-3 h-3 text-red-400" />}
        </div>
      </div>
    </div>
  );
};

// Main Room Content Component
const RoomContent = ({ isBroadcaster, onDisconnect, isFullscreen, setIsFullscreen }) => {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();
  
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState(null);

  // Initialize media for broadcaster
  useEffect(() => {
    if (!isBroadcaster || !localParticipant || !room) return;

    const initMedia = async () => {
      setIsConnecting(true);
      setError(null);
      
      try {
        // Enable camera
        await localParticipant.setCameraEnabled(true);
        setIsCameraOn(true);
        console.log('Camera enabled successfully');
        
        // Enable microphone
        await localParticipant.setMicrophoneEnabled(true);
        setIsMicOn(true);
        console.log('Microphone enabled successfully');
        
        setIsConnecting(false);
      } catch (err) {
        console.error('Error initializing media:', err);
        setIsConnecting(false);
        
        if (err.name === 'NotAllowedError') {
          setError('Veuillez autoriser l\'accès à la caméra et au microphone');
        } else if (err.name === 'NotFoundError') {
          setError('Aucune caméra ou microphone détecté');
        } else {
          setError(err.message || 'Erreur lors de l\'initialisation');
        }
      }
    };

    // Small delay to ensure room is fully connected
    const timer = setTimeout(initMedia, 500);
    return () => clearTimeout(timer);
  }, [isBroadcaster, localParticipant, room]);

  // Toggle camera
  const toggleCamera = async () => {
    if (!localParticipant) return;
    
    try {
      const newState = !isCameraOn;
      await localParticipant.setCameraEnabled(newState);
      setIsCameraOn(newState);
      setError(null);
    } catch (err) {
      console.error('Error toggling camera:', err);
      setError('Impossible d\'activer la caméra');
    }
  };

  // Toggle microphone
  const toggleMic = async () => {
    if (!localParticipant) return;
    
    try {
      const newState = !isMicOn;
      await localParticipant.setMicrophoneEnabled(newState);
      setIsMicOn(newState);
    } catch (err) {
      console.error('Error toggling mic:', err);
    }
  };

  // Toggle screen share
  const toggleScreenShare = async () => {
    if (!localParticipant) return;
    
    try {
      const newState = !isScreenSharing;
      await localParticipant.setScreenShareEnabled(newState);
      setIsScreenSharing(newState);
    } catch (err) {
      console.error('Error toggling screen share:', err);
    }
  };

  // End call
  const handleEndCall = () => {
    if (room) {
      room.disconnect();
    }
    onDisconnect?.();
  };

  // Retry camera
  const retryCamera = async () => {
    setError(null);
    setIsConnecting(true);
    
    try {
      // First request permission directly
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach(t => t.stop());
      
      // Then enable via LiveKit
      await localParticipant?.setCameraEnabled(true);
      setIsCameraOn(true);
      await localParticipant?.setMicrophoneEnabled(true);
      setIsMicOn(true);
      setIsConnecting(false);
    } catch (err) {
      setIsConnecting(false);
      setError(err.message || 'Erreur lors de l\'activation de la caméra');
    }
  };

  // Get remote participants
  const remoteParticipants = participants.filter(p => 
    p.identity !== localParticipant?.identity
  );

  const totalViewers = remoteParticipants.length;

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Top Bar */}
      <div className="bg-gradient-to-b from-black/90 to-transparent p-4 absolute top-0 left-0 right-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="bg-red-600 px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-red-500/30">
              <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
              <span className="font-bold text-white">EN DIRECT</span>
            </div>
            
            {/* Connection status */}
            <div className="bg-green-600/80 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <Wifi className="w-4 h-4 text-white" />
              <span className="text-white text-sm">Connecté</span>
            </div>
            
            {/* Viewer count */}
            <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-300" />
              <span className="text-white text-sm">{totalViewers} spectateur{totalViewers !== 1 ? 's' : ''}</span>
            </div>
          </div>
          
          {/* End button for broadcaster */}
          {isBroadcaster && (
            <Button
              onClick={handleEndCall}
              className="bg-red-600 hover:bg-red-700 px-6 py-2 text-lg font-bold shadow-lg"
              data-testid="end-live-btn"
            >
              <PhoneOff className="w-5 h-5 mr-2" />
              TERMINER LE LIVE
            </Button>
          )}
          
          {/* Leave button for viewers */}
          {!isBroadcaster && (
            <Button
              onClick={handleEndCall}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              Quitter
            </Button>
          )}
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 p-4 pt-20">
        {isBroadcaster ? (
          // Broadcaster View
          <div className="h-full grid gap-4" style={{
            gridTemplateColumns: remoteParticipants.length > 0 ? '1fr 280px' : '1fr'
          }}>
            {/* Main video - Local participant */}
            <div className="relative h-full">
              {isConnecting ? (
                <div className="h-full flex items-center justify-center bg-zinc-900 rounded-lg">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-white text-lg">Connexion à la caméra...</p>
                    <p className="text-zinc-500 text-sm mt-2">Veuillez autoriser l'accès si demandé</p>
                  </div>
                </div>
              ) : error ? (
                <div className="h-full flex items-center justify-center bg-zinc-900 rounded-lg">
                  <div className="text-center max-w-md px-6">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                    <h3 className="text-xl font-bold text-white mb-2">Erreur Caméra</h3>
                    <p className="text-zinc-400 mb-6">{error}</p>
                    <Button onClick={retryCamera} className="bg-red-600 hover:bg-red-700">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Réessayer
                    </Button>
                    <p className="text-zinc-600 text-xs mt-4">
                      Astuce: Vérifiez que votre navigateur a les permissions pour la caméra
                    </p>
                  </div>
                </div>
              ) : localParticipant ? (
                <VideoTile 
                  participant={localParticipant} 
                  isLocal={true}
                  className="h-full"
                />
              ) : null}
            </div>
            
            {/* Sidebar with remote participants */}
            {remoteParticipants.length > 0 && (
              <div className="flex flex-col gap-3 overflow-y-auto">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Spectateurs ({remoteParticipants.length})
                </h3>
                {remoteParticipants.map(participant => (
                  <VideoTile
                    key={participant.identity}
                    participant={participant}
                    isLocal={false}
                    className="h-40"
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          // Viewer View - Show all participants including broadcaster
          <div className="h-full">
            {participants.length > 0 ? (
              <div className="h-full grid gap-4" style={{
                gridTemplateColumns: participants.length > 1 
                  ? 'repeat(auto-fit, minmax(400px, 1fr))' 
                  : '1fr'
              }}>
                {participants
                  .filter(p => p.identity !== localParticipant?.identity)
                  .map(participant => (
                    <VideoTile
                      key={participant.identity}
                      participant={participant}
                      isLocal={false}
                      className="h-full min-h-[300px]"
                    />
                  ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-zinc-900 rounded-lg">
                <div className="text-center">
                  <Video className="w-16 h-16 mx-auto mb-4 text-zinc-600 animate-pulse" />
                  <p className="text-white text-lg">En attente du flux vidéo...</p>
                  <p className="text-zinc-500 text-sm mt-2">Le coach va bientôt démarrer la diffusion</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      {isBroadcaster && (
        <div className="bg-zinc-900/95 backdrop-blur-lg p-4 border-t border-zinc-800">
          <div className="flex items-center justify-center gap-4">
            {/* Mic toggle */}
            <Button
              onClick={toggleMic}
              variant={isMicOn ? "secondary" : "destructive"}
              size="lg"
              className={`rounded-full w-14 h-14 ${isMicOn ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-red-600 hover:bg-red-700'}`}
              data-testid="toggle-mic-btn"
            >
              {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </Button>
            
            {/* Camera toggle */}
            <Button
              onClick={toggleCamera}
              variant={isCameraOn ? "secondary" : "destructive"}
              size="lg"
              className={`rounded-full w-14 h-14 ${isCameraOn ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-red-600 hover:bg-red-700'}`}
              data-testid="toggle-camera-btn"
            >
              {isCameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </Button>
            
            {/* Screen share toggle */}
            <Button
              onClick={toggleScreenShare}
              variant={isScreenSharing ? "secondary" : "outline"}
              size="lg"
              className={`rounded-full w-14 h-14 ${isScreenSharing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-zinc-700 hover:bg-zinc-600'}`}
              data-testid="toggle-screen-btn"
            >
              {isScreenSharing ? <ScreenShareOff className="w-6 h-6" /> : <ScreenShare className="w-6 h-6" />}
            </Button>
            
            <div className="w-px h-10 bg-zinc-700 mx-2"></div>
            
            {/* Fullscreen toggle */}
            <Button
              onClick={() => setIsFullscreen(!isFullscreen)}
              variant="outline"
              size="lg"
              className="rounded-full w-14 h-14 bg-zinc-700 hover:bg-zinc-600 border-none"
            >
              {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
            </Button>
            
            {/* End call */}
            <Button
              onClick={handleEndCall}
              size="lg"
              className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700"
              data-testid="end-call-btn"
            >
              <PhoneOff className="w-6 h-6" />
            </Button>
          </div>
        </div>
      )}

      {/* Audio renderer for all participants */}
      <RoomAudioRenderer />
    </div>
  );
};

// Main LiveKit Video Room Component
export const LiveKitVideoRoom = ({ 
  token, 
  serverUrl, 
  roomName, 
  onDisconnect,
  isBroadcaster = false,
  participantName = 'User'
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionState, setConnectionState] = useState('connecting');
  const [connectionError, setConnectionError] = useState(null);

  if (!token || !serverUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-black text-white p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Connexion au serveur de streaming...</p>
        </div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="flex items-center justify-center h-full bg-black text-white p-8">
        <div className="text-center max-w-md">
          <WifiOff className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-bold mb-2">Erreur de connexion</h3>
          <p className="text-gray-400 mb-4">{connectionError}</p>
          <Button
            onClick={() => {
              setConnectionError(null);
              window.location.reload();
            }}
            className="bg-red-600 hover:bg-red-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'relative h-full'} bg-black rounded-lg overflow-hidden`}>
      <LKRoom
        token={token}
        serverUrl={serverUrl}
        connect={true}
        video={isBroadcaster}
        audio={isBroadcaster}
        onConnected={() => {
          console.log('Connected to LiveKit room');
          setConnectionState('connected');
        }}
        onDisconnected={() => {
          console.log('Disconnected from LiveKit room');
          setConnectionState('disconnected');
          onDisconnect?.();
        }}
        onError={(error) => {
          console.error('LiveKit connection error:', error);
          setConnectionError(error.message);
        }}
        options={{
          adaptiveStream: true,
          dynacast: true,
          videoCaptureDefaults: {
            resolution: { width: 1280, height: 720, frameRate: 30 },
            facingMode: 'user',
          },
          audioCaptureDefaults: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          publishDefaults: {
            videoSimulcastLayers: [
              { width: 320, height: 180, bitrate: 150000, fps: 15 },
              { width: 640, height: 360, bitrate: 500000, fps: 24 },
              { width: 1280, height: 720, bitrate: 1500000, fps: 30 },
            ],
            screenShareSimulcastLayers: [
              { width: 1280, height: 720, bitrate: 1500000, fps: 15 },
            ],
            videoCodec: 'vp8',
          },
        }}
      >
        <RoomContent 
          isBroadcaster={isBroadcaster}
          onDisconnect={onDisconnect}
          isFullscreen={isFullscreen}
          setIsFullscreen={setIsFullscreen}
        />
      </LKRoom>
    </div>
  );
};

// Simple Call Component for 1-to-1 calls
export const LiveKitCall = ({
  token,
  serverUrl,
  roomName,
  callerName,
  isVideo = true,
  onDisconnect
}) => {
  return (
    <LiveKitVideoRoom
      token={token}
      serverUrl={serverUrl}
      roomName={roomName}
      isBroadcaster={true}
      participantName={callerName}
      onDisconnect={onDisconnect}
    />
  );
};

// Incoming Call Modal Component
export const IncomingCallModal = ({
  isOpen,
  callerName,
  callerAvatar,
  isVideo = true,
  onAccept,
  onDecline
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 rounded-2xl p-8 text-center max-w-sm w-full mx-4 shadow-2xl border border-zinc-700">
        {/* Caller Avatar */}
        <div className="relative mb-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center animate-pulse">
            {callerAvatar ? (
              <img src={callerAvatar} alt={callerName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-4xl font-bold text-white">
                {callerName?.charAt(0)?.toUpperCase() || '?'}
              </span>
            )}
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <span className="bg-green-500 text-xs px-3 py-1 rounded-full text-white font-medium animate-bounce">
              Appel entrant
            </span>
          </div>
        </div>

        {/* Caller Info */}
        <h3 className="text-2xl font-bold text-white mb-2">{callerName || 'Inconnu'}</h3>
        <p className="text-gray-400 mb-8 flex items-center justify-center gap-2">
          {isVideo ? (
            <>
              <Video className="w-4 h-4" />
              Appel vidéo entrant...
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              Appel audio entrant...
            </>
          )}
        </p>

        {/* Action Buttons */}
        <div className="flex justify-center gap-6">
          <button
            onClick={onDecline}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all hover:scale-110 shadow-lg"
          >
            <PhoneOff className="w-7 h-7 text-white" />
          </button>
          <button
            onClick={onAccept}
            className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center transition-all hover:scale-110 shadow-lg animate-pulse"
          >
            {isVideo ? <Video className="w-7 h-7 text-white" /> : <Mic className="w-7 h-7 text-white" />}
          </button>
        </div>

        {/* Labels */}
        <div className="flex justify-center gap-12 mt-3">
          <span className="text-xs text-gray-500">Refuser</span>
          <span className="text-xs text-gray-500">Accepter</span>
        </div>
      </div>
    </div>
  );
};

export default LiveKitVideoRoom;
