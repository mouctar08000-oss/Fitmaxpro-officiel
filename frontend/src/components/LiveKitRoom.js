import React, { useState, useEffect, useRef } from 'react';
import {
  LiveKitRoom as LKRoom,
  RoomAudioRenderer,
  useRoomContext,
  useParticipants,
  useLocalParticipant,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track, facingModeFromLocalTrack, createLocalVideoTrack } from 'livekit-client';
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
  ScreenShareOff,
  SwitchCamera,
  Smartphone
} from 'lucide-react';
import { Button } from './ui/button';

// Simple Video Element that attaches directly to a track
const SimpleVideoView = ({ track, isLocal = false, isMirrored = true, className = '' }) => {
  const videoRef = useRef(null);
  const [isAttached, setIsAttached] = useState(false);
  const [attachError, setAttachError] = useState(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !track) {
      console.log('SimpleVideoView: Missing video element or track', { hasVideo: !!videoElement, hasTrack: !!track });
      setIsAttached(false);
      return;
    }

    console.log('SimpleVideoView: Attaching track to video element', { 
      trackSid: track.sid, 
      trackKind: track.kind,
      trackSource: track.source,
      isLocal 
    });

    try {
      // Clear any previous src
      videoElement.srcObject = null;
      
      // Attach the track
      track.attach(videoElement);
      setIsAttached(true);
      setAttachError(null);
      
      // Force play
      videoElement.play().catch(e => {
        console.warn('Auto-play blocked:', e);
      });
      
      console.log('SimpleVideoView: Track attached successfully');
    } catch (err) {
      console.error('SimpleVideoView: Failed to attach track:', err);
      setAttachError(err.message);
    }

    return () => {
      try {
        console.log('SimpleVideoView: Detaching track');
        track.detach(videoElement);
        setIsAttached(false);
      } catch (err) {
        console.warn('Error detaching track:', err);
      }
    };
  }, [track, isLocal]);

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

  if (attachError) {
    return (
      <div className={`bg-zinc-900 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-2 text-red-500" />
          <p className="text-red-400 text-sm">Erreur vidéo: {attachError}</p>
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
      style={{ 
        transform: isLocal && isMirrored ? 'scaleX(-1)' : 'none',
        backgroundColor: '#18181b' 
      }}
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
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState(null);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [facingMode, setFacingMode] = useState('user');
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [hasUserStartedMedia, setHasUserStartedMedia] = useState(false);

  // Get available cameras on mount
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(d => d.kind === 'videoinput');
        setAvailableCameras(cameras);
        console.log('Available cameras:', cameras.length);
      } catch (err) {
        console.error('Error getting devices:', err);
      }
    };
    getDevices();
  }, []);

  // Start media when user clicks the button
  const startMedia = async () => {
    if (!localParticipant || !room) {
      console.error('No localParticipant or room available');
      setError('Connexion non établie. Veuillez rafraîchir la page.');
      return;
    }
    
    setIsInitializing(true);
    setError(null);
    setHasUserStartedMedia(true);

    try {
      console.log('Starting media initialization...');
      console.log('Room state:', room.state);
      console.log('LocalParticipant:', localParticipant.identity);

      // Method 1: Try using createLocalVideoTrack directly for more control
      console.log('Creating local video track...');
      const videoTrack = await createLocalVideoTrack({
        facingMode: 'user',
        resolution: { width: 1280, height: 720, frameRate: 24 }
      });
      
      console.log('Video track created:', videoTrack);
      
      // Publish the track to the room
      console.log('Publishing video track...');
      await localParticipant.publishTrack(videoTrack);
      console.log('Video track published');
      
      // Set the local track for display
      setLocalVideoTrack(videoTrack);
      setIsCameraOn(true);

      // Enable microphone
      console.log('Enabling microphone...');
      await localParticipant.setMicrophoneEnabled(true);
      console.log('Mic enabled');
      setIsMicOn(true);
      
    } catch (err) {
      console.error('Media initialization failed:', err);
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      
      // Fallback: Try the standard method
      try {
        console.log('Trying fallback method with setCameraEnabled...');
        await localParticipant.setCameraEnabled(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const cameraPub = localParticipant.getTrackPublication(Track.Source.Camera);
        if (cameraPub?.track) {
          setLocalVideoTrack(cameraPub.track);
          setIsCameraOn(true);
          await localParticipant.setMicrophoneEnabled(true);
          setIsMicOn(true);
          console.log('Fallback method successful');
          return;
        }
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
      }
      
      let errorMsg = err.message;
      if (err.name === 'NotAllowedError' || err.message?.includes('Permission')) {
        errorMsg = 'Accès à la caméra refusé. Veuillez autoriser l\'accès dans les paramètres du navigateur.';
      } else if (err.name === 'NotFoundError' || err.message?.includes('not found')) {
        errorMsg = 'Aucune caméra détectée sur cet appareil.';
      } else if (err.name === 'NotReadableError' || err.message?.includes('Could not start')) {
        errorMsg = 'La caméra est utilisée par une autre application ou indisponible.';
      } else if (err.message?.includes('timeout') || err.message?.includes('Timeout')) {
        errorMsg = 'Délai d\'attente dépassé. Veuillez réessayer.';
      }
      setError(errorMsg);
    } finally {
      setIsInitializing(false);
    }
  };

  // Track local video changes
  useEffect(() => {
    if (!localParticipant) return;

    const updateLocalVideo = () => {
      const cameraPub = localParticipant.getTrackPublication(Track.Source.Camera);
      console.log('updateLocalVideo called:', { 
        hasCameraPub: !!cameraPub, 
        hasTrack: !!cameraPub?.track,
        isMuted: cameraPub?.isMuted,
        trackSid: cameraPub?.track?.sid
      });
      
      if (cameraPub?.track) {
        setLocalVideoTrack(cameraPub.track);
        setIsCameraOn(!cameraPub.isMuted);
      } else {
        setLocalVideoTrack(null);
        setIsCameraOn(false);
      }
    };

    // Initial check
    updateLocalVideo();
    
    // Subscribe to events
    localParticipant.on('trackPublished', updateLocalVideo);
    localParticipant.on('trackUnpublished', updateLocalVideo);
    localParticipant.on('trackMuted', updateLocalVideo);
    localParticipant.on('trackUnmuted', updateLocalVideo);
    localParticipant.on('localTrackPublished', updateLocalVideo);

    return () => {
      localParticipant.off('trackPublished', updateLocalVideo);
      localParticipant.off('trackUnpublished', updateLocalVideo);
      localParticipant.off('trackMuted', updateLocalVideo);
      localParticipant.off('trackUnmuted', updateLocalVideo);
      localParticipant.off('localTrackPublished', updateLocalVideo);
    };
  }, [localParticipant]);

  // Switch camera (front/back)
  const switchCamera = async () => {
    if (!localParticipant || isSwitchingCamera) return;
    
    setIsSwitchingCamera(true);
    
    try {
      const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
      
      // Create new video track with different facing mode
      const newTrack = await createLocalVideoTrack({
        facingMode: newFacingMode,
        resolution: { width: 1280, height: 720, frameRate: 30 }
      });
      
      // Get current camera publication
      const currentCameraPub = localParticipant.getTrackPublication(Track.Source.Camera);
      
      if (currentCameraPub) {
        // Unpublish current track
        await localParticipant.unpublishTrack(currentCameraPub.track);
      }
      
      // Publish new track
      await localParticipant.publishTrack(newTrack);
      
      setFacingMode(newFacingMode);
      setLocalVideoTrack(newTrack);
      setError(null);
      
      console.log('Switched to', newFacingMode === 'user' ? 'front' : 'back', 'camera');
    } catch (err) {
      console.error('Error switching camera:', err);
      setError(`Erreur: ${err.message}`);
    } finally {
      setIsSwitchingCamera(false);
    }
  };

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
    await startMedia();
  };

  const remoteParticipants = participants.filter(p => p.identity !== localParticipant?.identity);

  // Show start button if broadcaster hasn't started media yet
  if (isBroadcaster && !hasUserStartedMedia && !isInitializing) {
    return (
      <div className="h-full flex flex-col bg-black">
        {/* Top Bar */}
        <div className="bg-gradient-to-b from-black/90 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-600 px-4 py-2 rounded-lg flex items-center gap-2">
                <span className="font-bold text-white">PRÊT À DIFFUSER</span>
              </div>
              <div className="bg-green-600/80 px-3 py-1.5 rounded-lg flex items-center gap-2">
                <Wifi className="w-4 h-4 text-white" />
                <span className="text-white text-sm">Connecté au serveur</span>
              </div>
            </div>
            <Button onClick={() => { room?.disconnect(); onDisconnect?.(); }} variant="outline" className="border-white/30 text-white hover:bg-white/10">
              Annuler
            </Button>
          </div>
        </div>

        {/* Start Camera Section */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Camera className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Démarrer votre Live</h2>
            <p className="text-gray-400 mb-6">
              Cliquez sur le bouton ci-dessous pour activer votre caméra et microphone, puis commencer la diffusion en direct.
            </p>
            <Button 
              onClick={startMedia} 
              size="lg" 
              className="bg-red-600 hover:bg-red-700 px-8 py-6 text-lg font-bold"
              data-testid="start-live-btn"
            >
              <Video className="w-6 h-6 mr-3" />
              DÉMARRER LA CAMÉRA
            </Button>
            <p className="text-gray-600 text-sm mt-4">
              Vous devrez peut-être autoriser l'accès à la caméra dans votre navigateur
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Top Bar */}
      <div className="bg-gradient-to-b from-black/90 to-transparent p-4 absolute top-0 left-0 right-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isCameraOn ? (
              <div className="bg-red-600 px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-red-500/30">
                <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
                <span className="font-bold text-white">EN DIRECT</span>
              </div>
            ) : (
              <div className="bg-yellow-600 px-4 py-2 rounded-lg flex items-center gap-2">
                <span className="font-bold text-white">PRÉPARATION</span>
              </div>
            )}
            <div className="bg-green-600/80 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <Wifi className="w-4 h-4 text-white" />
              <span className="text-white text-sm">Connecté</span>
            </div>
            <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-300" />
              <span className="text-white text-sm">{remoteParticipants.length} spectateur{remoteParticipants.length !== 1 ? 's' : ''}</span>
            </div>
            {/* Camera indicator */}
            {isCameraOn && (
              <div className="bg-blue-600/80 px-3 py-1.5 rounded-lg flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-white" />
                <span className="text-white text-sm">
                  {facingMode === 'user' ? 'Caméra avant' : 'Caméra arrière'}
                </span>
              </div>
            )}
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
                    <SimpleVideoView 
                      track={localVideoTrack} 
                      isLocal={true} 
                      isMirrored={facingMode === 'user'}
                      className="w-full h-full" 
                    />
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
                  
                  {/* Switch Camera Button - Floating */}
                  {isCameraOn && availableCameras.length > 1 && (
                    <button
                      onClick={switchCamera}
                      disabled={isSwitchingCamera}
                      className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm p-3 rounded-full hover:bg-black/90 transition-all disabled:opacity-50"
                      title={facingMode === 'user' ? 'Passer à la caméra arrière' : 'Passer à la caméra avant'}
                    >
                      {isSwitchingCamera ? (
                        <RefreshCw className="w-6 h-6 text-white animate-spin" />
                      ) : (
                        <SwitchCamera className="w-6 h-6 text-white" />
                      )}
                    </button>
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
          <div className="flex items-center justify-center gap-3">
            {/* Mic */}
            <Button onClick={toggleMic} size="lg" className={`rounded-full w-14 h-14 ${isMicOn ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-red-600 hover:bg-red-700'}`} data-testid="toggle-mic-btn">
              {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </Button>
            
            {/* Camera */}
            <Button onClick={toggleCamera} size="lg" className={`rounded-full w-14 h-14 ${isCameraOn ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-red-600 hover:bg-red-700'}`} data-testid="toggle-camera-btn">
              {isCameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </Button>
            
            {/* Switch Camera */}
            {availableCameras.length > 1 && (
              <Button 
                onClick={switchCamera} 
                size="lg" 
                disabled={!isCameraOn || isSwitchingCamera}
                className={`rounded-full w-14 h-14 ${facingMode === 'environment' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-zinc-700 hover:bg-zinc-600'} disabled:opacity-50`}
                data-testid="switch-camera-btn"
                title={facingMode === 'user' ? 'Caméra arrière' : 'Caméra avant'}
              >
                {isSwitchingCamera ? (
                  <RefreshCw className="w-6 h-6 animate-spin" />
                ) : (
                  <SwitchCamera className="w-6 h-6" />
                )}
              </Button>
            )}
            
            {/* Screen Share */}
            <Button onClick={toggleScreenShare} size="lg" className={`rounded-full w-14 h-14 ${isScreenSharing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-zinc-700 hover:bg-zinc-600'}`} data-testid="toggle-screen-btn">
              {isScreenSharing ? <ScreenShareOff className="w-6 h-6" /> : <ScreenShare className="w-6 h-6" />}
            </Button>
            
            <div className="w-px h-10 bg-zinc-700 mx-1"></div>
            
            {/* Fullscreen */}
            <Button onClick={() => setIsFullscreen(!isFullscreen)} size="lg" className="rounded-full w-14 h-14 bg-zinc-700 hover:bg-zinc-600">
              {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
            </Button>
            
            {/* End */}
            <Button onClick={handleDisconnect} size="lg" className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700" data-testid="end-call-btn">
              <PhoneOff className="w-6 h-6" />
            </Button>
          </div>
          
          {/* Camera info */}
          {isCameraOn && availableCameras.length > 1 && (
            <p className="text-center text-zinc-500 text-xs mt-2">
              {facingMode === 'user' ? '📷 Caméra avant (selfie)' : '📷 Caméra arrière'}
            </p>
          )}
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
        onConnected={() => console.log('Connected to LiveKit room')}
        onDisconnected={() => { console.log('Disconnected from LiveKit'); onDisconnect?.(); }}
        onError={(error) => { console.error('LiveKit connection error:', error); setConnectionError(error.message); }}
        options={{
          adaptiveStream: true,
          dynacast: true,
          stopLocalTrackOnUnpublish: true,
          videoCaptureDefaults: { 
            resolution: { width: 1280, height: 720, frameRate: 24 }, 
            facingMode: 'user'
          },
          audioCaptureDefaults: { 
            echoCancellation: true, 
            noiseSuppression: true, 
            autoGainControl: true 
          }
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
