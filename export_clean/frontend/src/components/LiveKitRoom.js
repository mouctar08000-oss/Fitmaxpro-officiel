import React, { useState, useEffect, useCallback } from 'react';
import {
  LiveKitRoom as LKRoom,
  VideoConference,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
  useParticipants,
  useRoomContext,
  Chat,
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
  MessageCircle,
  Settings,
  Maximize,
  Minimize
} from 'lucide-react';
import { Button } from './ui/button';

// Simple LiveKit Video Room Component
export const LiveKitVideoRoom = ({ 
  token, 
  serverUrl, 
  roomName, 
  onDisconnect,
  isBroadcaster = false,
  participantName = 'User'
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!token || !serverUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-black text-white p-8">
        <div className="text-center">
          <Video className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <p className="text-gray-400">Connexion en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'relative'} bg-black rounded-lg overflow-hidden`}>
      <LKRoom
        token={token}
        serverUrl={serverUrl}
        connect={true}
        video={isBroadcaster}
        audio={true}
        onDisconnected={() => {
          console.log('Disconnected from room');
          onDisconnect?.();
        }}
        onError={(error) => {
          console.error('LiveKit error:', error);
        }}
      >
        <div className="h-full flex flex-col">
          {/* Video Grid */}
          <div className="flex-1 relative">
            <VideoConference />
          </div>
          
          {/* Controls */}
          <div className="bg-[#1a1a1a] p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-white text-sm">{roomName}</span>
                <ParticipantCount />
              </div>
              <div className="flex items-center gap-2">
                <ControlBar 
                  variation="minimal"
                  controls={{
                    microphone: true,
                    camera: isBroadcaster,
                    screenShare: isBroadcaster,
                    leave: true,
                    chat: false,
                  }}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="text-white"
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Audio Renderer (for subscribers) */}
        <RoomAudioRenderer />
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
  onEnd,
  callType = 'video'
}) => {
  const [callDuration, setCallDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let interval;
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration(d => d + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!token || !serverUrl) {
    return (
      <div className="flex items-center justify-center h-64 bg-[#121212] rounded-lg">
        <div className="text-center text-white">
          <div className="animate-pulse mb-4">
            <Video className="w-12 h-12 mx-auto text-green-400" />
          </div>
          <p>Connexion à {callerName}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black rounded-lg overflow-hidden">
      <LKRoom
        token={token}
        serverUrl={serverUrl}
        connect={true}
        video={callType === 'video'}
        audio={true}
        onConnected={() => setIsConnected(true)}
        onDisconnected={() => {
          onEnd?.(callDuration);
        }}
      >
        <div className="relative aspect-video">
          <VideoConference />
          
          {/* Call Info Overlay */}
          <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full">
            <span className="text-white text-sm font-mono">{formatDuration(callDuration)}</span>
          </div>
          
          {/* Call Controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-4 bg-black/70 rounded-full px-6 py-3">
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
                onClick={() => onEnd?.(callDuration)}
                className="bg-red-500 hover:bg-red-600 rounded-full p-3"
              >
                <PhoneOff className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
        
        <RoomAudioRenderer />
      </LKRoom>
    </div>
  );
};

// Incoming Call Modal
export const IncomingCallModal = ({
  callerName,
  callType,
  onAccept,
  onDecline
}) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#121212] border border-[#27272a] rounded-xl p-8 text-center max-w-sm mx-4">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          {callType === 'video' ? (
            <Video className="w-10 h-10 text-green-400" />
          ) : (
            <Mic className="w-10 h-10 text-green-400" />
          )}
        </div>
        
        <h3 className="text-white text-xl font-bold mb-2">
          Appel {callType === 'video' ? 'Vidéo' : 'Audio'} Entrant
        </h3>
        <p className="text-gray-400 mb-6">{callerName}</p>
        
        <div className="flex justify-center gap-4">
          <Button
            onClick={onDecline}
            className="bg-red-500 hover:bg-red-600 rounded-full p-4"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
          <Button
            onClick={onAccept}
            className="bg-green-500 hover:bg-green-600 rounded-full p-4"
          >
            {callType === 'video' ? (
              <Video className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LiveKitVideoRoom;
