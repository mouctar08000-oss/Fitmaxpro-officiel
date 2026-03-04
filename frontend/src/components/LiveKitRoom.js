import React, { useState, useEffect, useRef } from 'react';
import {
  LiveKitRoom as LKRoom,
  VideoConference,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
  useParticipants,
  useLocalParticipant,
  useRoomContext,
  TrackToggle,
  DisconnectButton,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track, RoomEvent, LocalVideoTrack } from 'livekit-client';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Users, 
  MessageCircle,
  Settings,
  Maximize,
  Minimize,
  Camera,
  CameraOff,
  MonitorUp
} from 'lucide-react';
import { Button } from './ui/button';

// Custom Video Display Component
const VideoDisplay = ({ track, isLocal, name, isMuted }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (track && videoRef.current) {
      track.attach(videoRef.current);
      return () => {
        track.detach(videoRef.current);
      };
    }
  }, [track]);

  if (!track) {
    return (
      <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <CameraOff className="w-16 h-16 mx-auto mb-2 text-zinc-600" />
          <p className="text-zinc-500">{name || 'Caméra désactivée'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className="w-full h-full object-cover"
        style={{ transform: isLocal ? 'scaleX(-1)' : 'none' }}
      />
      {name && (
        <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-sm text-white flex items-center gap-2">
          {isLocal && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
          {name}
          {isMuted && <MicOff className="w-3 h-3 text-red-400" />}
        </div>
      )}
    </div>
  );
};

// Room Content with explicit video handling
const RoomContentWithVideo = ({ isBroadcaster, roomName, isFullscreen, setIsFullscreen, onDisconnect }) => {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioEnabled, setLocalAudioEnabled] = useState(true);
  const [localVideoEnabled, setLocalVideoEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  // Get all video tracks
  const videoTracks = useTracks([Track.Source.Camera], { onlySubscribed: false });

  // Enable camera and microphone for broadcaster
  useEffect(() => {
    if (isBroadcaster && room && localParticipant) {
      const enableMedia = async () => {
        try {
          // Enable camera
          await localParticipant.setCameraEnabled(true);
          console.log('Camera enabled');
          
          // Enable microphone
          await localParticipant.setMicrophoneEnabled(true);
          console.log('Microphone enabled');
          
          setIsConnected(true);
        } catch (err) {
          console.error('Error enabling media:', err);
        }
      };
      
      enableMedia();
    }
  }, [isBroadcaster, room, localParticipant]);

  // Track local video
  useEffect(() => {
    if (localParticipant) {
      const videoTrack = localParticipant.getTrackPublication(Track.Source.Camera)?.track;
      setLocalVideoTrack(videoTrack);
      
      // Listen for track changes
      const handleTrackPublished = () => {
        const newVideoTrack = localParticipant.getTrackPublication(Track.Source.Camera)?.track;
        setLocalVideoTrack(newVideoTrack);
      };
      
      localParticipant.on('trackPublished', handleTrackPublished);
      localParticipant.on('trackUnpublished', handleTrackPublished);
      
      return () => {
        localParticipant.off('trackPublished', handleTrackPublished);
        localParticipant.off('trackUnpublished', handleTrackPublished);
      };
    }
  }, [localParticipant]);

  const toggleCamera = async () => {
    if (localParticipant) {
      const enabled = !localVideoEnabled;
      await localParticipant.setCameraEnabled(enabled);
      setLocalVideoEnabled(enabled);
    }
  };

  const toggleMicrophone = async () => {
    if (localParticipant) {
      const enabled = !localAudioEnabled;
      await localParticipant.setMicrophoneEnabled(enabled);
      setLocalAudioEnabled(enabled);
    }
  };

  const handleDisconnect = () => {
    if (room) {
      room.disconnect();
    }
    onDisconnect?.();
  };

  // Get remote participants (excluding local)
  const remoteParticipants = participants.filter(p => p.identity !== localParticipant?.identity);

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Main Video Area */}
      <div className="flex-1 relative min-h-0 p-2">
        {isBroadcaster ? (
          // Broadcaster view - show local video prominently
          <div className="h-full grid gap-2" style={{ 
            gridTemplateColumns: remoteParticipants.length > 0 ? '1fr 200px' : '1fr' 
          }}>
            {/* Main local video */}
            <div className="relative rounded-lg overflow-hidden bg-zinc-900">
              <VideoDisplay 
                track={localVideoTrack}
                isLocal={true}
                name={`${localParticipant?.name || 'Vous'} (EN DIRECT)`}
                isMuted={!localAudioEnabled}
              />
              {!localVideoTrack && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
                    <p className="text-zinc-400 mb-4">Caméra non détectée</p>
                    <Button onClick={toggleCamera} className="bg-red-600 hover:bg-red-700">
                      <Camera className="w-4 h-4 mr-2" />
                      Activer la caméra
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Remote participants sidebar */}
            {remoteParticipants.length > 0 && (
              <div className="flex flex-col gap-2 overflow-y-auto">
                {remoteParticipants.map(participant => {
                  const videoTrack = participant.getTrackPublication(Track.Source.Camera)?.track;
                  return (
                    <div key={participant.identity} className="h-32 rounded-lg overflow-hidden bg-zinc-900">
                      <VideoDisplay 
                        track={videoTrack}
                        isLocal={false}
                        name={participant.name || participant.identity}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          // Viewer view - show broadcaster video
          <div className="h-full">
            {videoTracks.length > 0 ? (
              <div className="h-full grid gap-2" style={{ 
                gridTemplateColumns: videoTracks.length > 1 ? 'repeat(auto-fit, minmax(300px, 1fr))' : '1fr' 
              }}>
                {videoTracks.map(({ participant, track }) => (
                  <div key={participant.identity} className="rounded-lg overflow-hidden bg-zinc-900">
                    <VideoDisplay 
                      track={track}
                      isLocal={participant.identity === localParticipant?.identity}
                      name={participant.name || participant.identity}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-zinc-900 rounded-lg">
                <div className="text-center">
                  <Video className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
                  <p className="text-zinc-400">En attente du flux vidéo...</p>
                  <p className="text-zinc-500 text-sm mt-2">Le coach va bientôt démarrer la diffusion</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Controls Bar */}
      <div className="bg-zinc-900/90 backdrop-blur p-3 shrink-0 border-t border-zinc-800">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {/* Left - Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              <span className="text-white font-medium">EN DIRECT</span>
            </div>
            <span className="text-zinc-500">•</span>
            <div className="flex items-center gap-1 text-zinc-400">
              <Users className="w-4 h-4" />
              <span>{participants.length}</span>
            </div>
          </div>
          
          {/* Center - Controls */}
          <div className="flex items-center gap-2">
            {isBroadcaster && (
              <>
                <Button
                  onClick={toggleMicrophone}
                  variant={localAudioEnabled ? "secondary" : "destructive"}
                  size="icon"
                  className="rounded-full w-12 h-12"
                >
                  {localAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </Button>
                
                <Button
                  onClick={toggleCamera}
                  variant={localVideoEnabled ? "secondary" : "destructive"}
                  size="icon"
                  className="rounded-full w-12 h-12"
                >
                  {localVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </Button>
              </>
            )}
            
            <Button
              onClick={handleDisconnect}
              variant="destructive"
              size="icon"
              className="rounded-full w-12 h-12 bg-red-600 hover:bg-red-700"
            >
              <PhoneOff className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Right - Fullscreen */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsFullscreen(!isFullscreen)}
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:text-white"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>
      
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
  const [connectionError, setConnectionError] = useState(null);

  if (!token || !serverUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-black text-white p-8">
        <div className="text-center">
          <Video className="w-16 h-16 mx-auto mb-4 text-gray-500 animate-pulse" />
          <p className="text-gray-400">Connexion au serveur de streaming...</p>
        </div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="flex items-center justify-center h-full bg-black text-white p-8">
        <div className="text-center max-w-md">
          <VideoOff className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-bold mb-2">Erreur de connexion</h3>
          <p className="text-gray-400 mb-4">{connectionError}</p>
          <Button
            onClick={() => {
              setConnectionError(null);
              window.location.reload();
            }}
            className="bg-red-600 hover:bg-red-700"
          >
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
        onDisconnected={() => {
          console.log('Disconnected from room');
          onDisconnect?.();
        }}
        onError={(error) => {
          console.error('LiveKit error:', error);
          setConnectionError(error.message);
        }}
        options={{
          adaptiveStream: true,
          dynacast: true,
          videoCaptureDefaults: {
            resolution: { width: 1280, height: 720 },
            facingMode: 'user',
          },
          publishDefaults: {
            videoSimulcastLayers: [
              { width: 640, height: 360, bitrate: 500000 },
              { width: 1280, height: 720, bitrate: 1500000 },
            ],
            videoCodec: 'vp8',
          },
        }}
      >
        <RoomContentWithVideo 
          isBroadcaster={isBroadcaster} 
          roomName={roomName}
          isFullscreen={isFullscreen}
          setIsFullscreen={setIsFullscreen}
          onDisconnect={onDisconnect}
        />
      </LKRoom>
    </div>
  );
};

// Participant Count Component
const ParticipantCount = () => {
  const participants = useParticipants();
  
  return (
    <span className="flex items-center gap-1 text-gray-400 text-sm">
      <Users className="w-4 h-4" />
      {participants.length}
    </span>
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

export default LiveKitVideoRoom;
