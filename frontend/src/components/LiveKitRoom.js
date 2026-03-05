import React, { useState, useEffect, useRef } from 'react';
import {
  LiveKitRoom as LKRoom,
  RoomAudioRenderer,
  useRoomContext,
  useParticipants,
  useLocalParticipant,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';
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
  ScreenShare,
  ScreenShareOff
} from 'lucide-react';
import { Button } from './ui/button';

// Simple Video Element that attaches directly to a track
const SimpleVideoView = ({ track, isLocal = false, className = '' }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !track) return;

    track.attach(videoElement);
    console.log('Track attached:', track.sid);

    return () => {
      track.detach(videoElement);
    };
  }, [track]);

  if (!track) {
    return (
      <div className={`bg-zinc-900 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <CameraOff className="w-12 h-12 mx-auto mb-2 text-zinc-600" />
          <p className="text-zinc-500 text-sm">Caméra désactivée</p>
        </div>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={isLocal}
      className={`object-cover ${className}`}
      style={{ transform: isLocal ? 'scaleX(-1)' : 'none' }}
    />
  );
};

// Participant Video Tile
const ParticipantVideo = ({ participant, isLocal = false, className = '' }) => {
  const [videoTrack, setVideoTrack] = useState(null);
  const [audioMuted, setAudioMuted] = useState(false);

  useEffect(() => {
    if (!participant) return;

    const updateTracks = () => {
      const cameraPub = participant.getTrackPublication(Track.Source.Camera);
      setVideoTrack(cameraPub?.track || null);
      const micPub = participant.getTrackPublication(Track.Source.Microphone);
      setAudioMuted(!micPub?.track || micPub.isMuted);
    };

    updateTracks();
    participant.on('trackPublished', updateTracks);
    participant.on('trackUnpublished', updateTracks);
    participant.on('trackSubscribed', updateTracks);
    participant.on('trackUnsubscribed', updateTracks);
    participant.on('trackMuted', updateTracks);
    participant.on('trackUnmuted', updateTracks);

    return () => {
      participant.off('trackPublished', updateTracks);
      participant.off('trackUnpublished', updateTracks);
      participant.off('trackSubscribed', updateTracks);
      participant.off('trackUnsubscribed', updateTracks);
      participant.off('trackMuted', updateTracks);
      participant.off('trackUnmuted', updateTracks);
    };
  }, [participant]);

  const displayName = participant?.name || participant?.identity || 'Participant';

  return (
    <div className={`relative bg-zinc-900 rounded-lg overflow-hidden ${className}`}>
      <SimpleVideoView track={videoTrack} isLocal={isLocal} className="w-full h-full" />
      <div className="absolute bottom-3 left-3">
        <div className="bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
          {isLocal && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
          <span className="text-white text-sm font-medium">{displayName}</span>
          {audioMuted && <MicOff className="w-3 h-3 text-red-400" />}
        </div>
      </div>
    </div>
  );
};

// Main Room Content
const RoomContent = ({ isBroadcaster, onDisconnect, isFullscreen, setIsFullscreen }) => {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();
  
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);

  // Initialize camera for broadcaster
  useEffect(() => {
    if (!isBroadcaster || !localParticipant || !room) return;

    let mounted = true;

    const initializeMedia = async () => {
      setIsInitializing(true);
      setError(null);

      // Try to enable camera
      try {
        await localParticipant.setCameraEnabled(true);
        console.log('Camera enabled');
        if (mounted) {
          setIsCameraOn(true);
          const cameraPub = localParticipant.getTrackPublication(Track.Source.Camera);
          if (cameraPub?.track) {
            setLocalVideoTrack(cameraPub.track);
          }
        }
      } catch (camErr) {
        console.warn('Camera failed:', camErr.message);
        if (mounted) {
          setError(`Caméra: ${camErr.message}`);
        }
      }
      
      // Try to enable microphone
      try {
        await localParticipant.setMicrophoneEnabled(true);
        console.log('Mic enabled');
        if (mounted) setIsMicOn(true);
      } catch (micErr) {
        console.warn('Mic failed:', micErr.message);
      }

      if (mounted) setIsInitializing(false);
    };

    const timer = setTimeout(initializeMedia, 1000);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [isBroadcaster, localParticipant, room]);

  // Track local video changes
  useEffect(() => {
    if (!localParticipant) return;

    const updateLocalVideo = () => {
      const cameraPub = localParticipant.getTrackPublication(Track.Source.Camera);
      setLocalVideoTrack(cameraPub?.track || null);
      setIsCameraOn(!!cameraPub?.track && !cameraPub.isMuted);
    };

    localParticipant.on('trackPublished', updateLocalVideo);
    localParticipant.on('trackUnpublished', updateLocalVideo);
    localParticipant.on('trackMuted', updateLocalVideo);
    localParticipant.on('trackUnmuted', updateLocalVideo);

    return () => {
      localParticipant.off('trackPublished', updateLocalVideo);
      localParticipant.off('trackUnpublished', updateLocalVideo);
      localParticipant.off('trackMuted', updateLocalVideo);
      localParticipant.off('trackUnmuted', updateLocalVideo);
    };
  }, [localParticipant]);

  const toggleCamera = async () => {
    if (!localParticipant) return;
    try {
      setError(null);
      const newState = !isCameraOn;
      await localParticipant.setCameraEnabled(newState);
      setIsCameraOn(newState);
      if (newState) {
        const cameraPub = localParticipant.getTrackPublication(Track.Source.Camera);
        setLocalVideoTrack(cameraPub?.track || null);
      } else {
        setLocalVideoTrack(null);
      }
    } catch (err) {
      setError(`Erreur caméra: ${err.message}`);
    }
  };

  const toggleMic = async () => {
    if (!localParticipant) return;
    try {
      const newState = !isMicOn;
      await localParticipant.setMicrophoneEnabled(newState);
      setIsMicOn(newState);
    } catch (err) {
      console.error('Mic error:', err);
    }
  };

  const toggleScreenShare = async () => {
    if (!localParticipant) return;
    try {
      const newState = !isScreenSharing;
      await localParticipant.setScreenShareEnabled(newState);
      setIsScreenSharing(newState);
    } catch (err) {
      console.error('Screen share error:', err);
    }
  };

  const handleDisconnect = () => {
    room?.disconnect();
    onDisconnect?.();
  };

  const retryCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach(t => t.stop());
      await localParticipant?.setCameraEnabled(true);
      await localParticipant?.setMicrophoneEnabled(true);
      setIsCameraOn(true);
      setIsMicOn(true);
      const cameraPub = localParticipant?.getTrackPublication(Track.Source.Camera);
      setLocalVideoTrack(cameraPub?.track || null);
    } catch (err) {
      setError(`Erreur: ${err.message}`);
    }
  };

  const remoteParticipants = participants.filter(p => p.identity !== localParticipant?.identity);

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Top Bar */}
      <div className="bg-gradient-to-b from-black/90 to-transparent p-4 absolute top-0 left-0 right-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-red-500/30">
              <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
              <span className="font-bold text-white">EN DIRECT</span>
            </div>
            <div className="bg-green-600/80 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <Wifi className="w-4 h-4 text-white" />
              <span className="text-white text-sm">Connecté</span>
            </div>
            <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-300" />
              <span className="text-white text-sm">{remoteParticipants.length} spectateur{remoteParticipants.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
          
          {isBroadcaster && (
            <Button onClick={handleDisconnect} className="bg-red-600 hover:bg-red-700 px-6 py-2 text-lg font-bold shadow-lg" data-testid="end-live-btn">
              <PhoneOff className="w-5 h-5 mr-2" />
              TERMINER LE LIVE
            </Button>
          )}
          
          {!isBroadcaster && (
            <Button onClick={handleDisconnect} variant="outline" className="border-white/30 text-white hover:bg-white/10">
              Quitter
            </Button>
          )}
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 p-4 pt-20">
        {isBroadcaster ? (
          <div className="h-full grid gap-4" style={{ gridTemplateColumns: remoteParticipants.length > 0 ? '1fr 280px' : '1fr' }}>
            {/* Local Video */}
            <div className="relative h-full rounded-lg overflow-hidden">
              {isInitializing ? (
                <div className="h-full flex items-center justify-center bg-zinc-900 rounded-lg">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-white text-lg">Activation de la caméra...</p>
                    <p className="text-zinc-500 text-sm mt-2">Autorisez l'accès si demandé</p>
                  </div>
                </div>
              ) : (
                <div className="h-full bg-zinc-900 rounded-lg overflow-hidden relative">
                  {localVideoTrack ? (
                    <SimpleVideoView track={localVideoTrack} isLocal={true} className="w-full h-full" />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                      <div className="text-center max-w-md px-6">
                        {error ? (
                          <>
                            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                            <h3 className="text-xl font-bold text-white mb-2">Caméra non disponible</h3>
                            <p className="text-zinc-400 mb-4 text-sm">{error}</p>
                          </>
                        ) : (
                          <>
                            <CameraOff className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
                            <h3 className="text-lg font-bold text-white mb-2">Caméra désactivée</h3>
                          </>
                        )}
                        <Button onClick={retryCamera} className="bg-red-600 hover:bg-red-700">
                          <Camera className="w-4 h-4 mr-2" />
                          Activer la caméra
                        </Button>
                        <p className="text-zinc-600 text-xs mt-4">
                          Vérifiez les permissions de votre navigateur
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    <span className="text-white text-sm font-medium">{localParticipant?.name || 'Vous'} (EN DIRECT)</span>
                    {!isMicOn && <MicOff className="w-3 h-3 text-red-400" />}
                    {!isCameraOn && <VideoOff className="w-3 h-3 text-yellow-400" />}
                  </div>
                </div>
              )}
            </div>
            
            {/* Remote Participants */}
            {remoteParticipants.length > 0 && (
              <div className="flex flex-col gap-3 overflow-y-auto">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Spectateurs ({remoteParticipants.length})
                </h3>
                {remoteParticipants.map(participant => (
                  <ParticipantVideo key={participant.identity} participant={participant} isLocal={false} className="h-40" />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-full">
            {participants.filter(p => p.identity !== localParticipant?.identity).length > 0 ? (
              <div className="h-full grid gap-4" style={{ gridTemplateColumns: participants.length > 2 ? 'repeat(auto-fit, minmax(400px, 1fr))' : '1fr' }}>
                {participants.filter(p => p.identity !== localParticipant?.identity).map(participant => (
                  <ParticipantVideo key={participant.identity} participant={participant} isLocal={false} className="h-full min-h-[300px]" />
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-zinc-900 rounded-lg">
                <div className="text-center">
                  <Video className="w-16 h-16 mx-auto mb-4 text-zinc-600 animate-pulse" />
                  <p className="text-white text-lg">En attente du flux vidéo...</p>
                  <p className="text-zinc-500 text-sm mt-2">Le coach va bientôt démarrer</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      {isBroadcaster && !isInitializing && (
        <div className="bg-zinc-900/95 backdrop-blur-lg p-4 border-t border-zinc-800">
          <div className="flex items-center justify-center gap-4">
            <Button onClick={toggleMic} size="lg" className={`rounded-full w-14 h-14 ${isMicOn ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-red-600 hover:bg-red-700'}`} data-testid="toggle-mic-btn">
              {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </Button>
            <Button onClick={toggleCamera} size="lg" className={`rounded-full w-14 h-14 ${isCameraOn ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-red-600 hover:bg-red-700'}`} data-testid="toggle-camera-btn">
              {isCameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </Button>
            <Button onClick={toggleScreenShare} size="lg" className={`rounded-full w-14 h-14 ${isScreenSharing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-zinc-700 hover:bg-zinc-600'}`} data-testid="toggle-screen-btn">
              {isScreenSharing ? <ScreenShareOff className="w-6 h-6" /> : <ScreenShare className="w-6 h-6" />}
            </Button>
            <div className="w-px h-10 bg-zinc-700 mx-2"></div>
            <Button onClick={() => setIsFullscreen(!isFullscreen)} size="lg" className="rounded-full w-14 h-14 bg-zinc-700 hover:bg-zinc-600">
              {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
            </Button>
            <Button onClick={handleDisconnect} size="lg" className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700" data-testid="end-call-btn">
              <PhoneOff className="w-6 h-6" />
            </Button>
          </div>
        </div>
      )}

      <RoomAudioRenderer />
    </div>
  );
};

// Main Component
export const LiveKitVideoRoom = ({ token, serverUrl, roomName, onDisconnect, isBroadcaster = false, participantName = 'User' }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  if (!token || !serverUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-black text-white p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Connexion au serveur...</p>
        </div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="flex items-center justify-center h-full bg-black text-white p-8">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-bold mb-2">Erreur de connexion</h3>
          <p className="text-gray-400 mb-4">{connectionError}</p>
          <Button onClick={() => { setConnectionError(null); window.location.reload(); }} className="bg-red-600 hover:bg-red-700">
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
        video={false}
        audio={false}
        onConnected={() => console.log('Connected to LiveKit')}
        onDisconnected={() => { console.log('Disconnected'); onDisconnect?.(); }}
        onError={(error) => { console.error('LiveKit error:', error); setConnectionError(error.message); }}
        options={{
          adaptiveStream: true,
          dynacast: true,
          videoCaptureDefaults: { resolution: { width: 1280, height: 720, frameRate: 30 }, facingMode: 'user' },
          audioCaptureDefaults: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        }}
      >
        <RoomContent isBroadcaster={isBroadcaster} onDisconnect={onDisconnect} isFullscreen={isFullscreen} setIsFullscreen={setIsFullscreen} />
      </LKRoom>
    </div>
  );
};

export const LiveKitCall = ({ token, serverUrl, roomName, callerName, isVideo = true, onDisconnect }) => {
  return <LiveKitVideoRoom token={token} serverUrl={serverUrl} roomName={roomName} isBroadcaster={true} participantName={callerName} onDisconnect={onDisconnect} />;
};

export const IncomingCallModal = ({ isOpen, callerName, callerAvatar, isVideo = true, onAccept, onDecline }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 rounded-2xl p-8 text-center max-w-sm w-full mx-4 shadow-2xl border border-zinc-700">
        <div className="relative mb-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center animate-pulse">
            {callerAvatar ? (
              <img src={callerAvatar} alt={callerName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-4xl font-bold text-white">{callerName?.charAt(0)?.toUpperCase() || '?'}</span>
            )}
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <span className="bg-green-500 text-xs px-3 py-1 rounded-full text-white font-medium animate-bounce">Appel entrant</span>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">{callerName || 'Inconnu'}</h3>
        <p className="text-gray-400 mb-8 flex items-center justify-center gap-2">
          {isVideo ? <><Video className="w-4 h-4" />Appel vidéo entrant...</> : <><Mic className="w-4 h-4" />Appel audio entrant...</>}
        </p>
        <div className="flex justify-center gap-6">
          <button onClick={onDecline} className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all hover:scale-110 shadow-lg">
            <PhoneOff className="w-7 h-7 text-white" />
          </button>
          <button onClick={onAccept} className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center transition-all hover:scale-110 shadow-lg animate-pulse">
            {isVideo ? <Video className="w-7 h-7 text-white" /> : <Mic className="w-7 h-7 text-white" />}
          </button>
        </div>
        <div className="flex justify-center gap-12 mt-3">
          <span className="text-xs text-gray-500">Refuser</span>
          <span className="text-xs text-gray-500">Accepter</span>
        </div>
      </div>
    </div>
  );
};

export default LiveKitVideoRoom;
