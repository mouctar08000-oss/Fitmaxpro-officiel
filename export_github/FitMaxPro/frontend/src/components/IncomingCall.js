import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Phone, Video, PhoneOff, User } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

/**
 * Hook to check for incoming calls
 */
export const useIncomingCalls = () => {
  const { user } = useAuth();
  const [incomingCall, setIncomingCall] = useState(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('session_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  // Check for pending calls periodically
  useEffect(() => {
    if (!user) return;

    const checkPendingCalls = async () => {
      try {
        const response = await axios.get(`${API}/api/livekit/calls/pending`, {
          headers: getAuthHeaders()
        });
        
        if (response.data.calls && response.data.calls.length > 0) {
          // Get the most recent pending call
          const pendingCall = response.data.calls[0];
          setIncomingCall(pendingCall);
        } else {
          setIncomingCall(null);
        }
      } catch (err) {
        // Silently fail - don't spam console
      }
    };

    // Check immediately
    checkPendingCalls();

    // Then check every 5 seconds
    const interval = setInterval(checkPendingCalls, 5000);

    return () => clearInterval(interval);
  }, [user, getAuthHeaders]);

  const clearIncomingCall = () => setIncomingCall(null);

  return { incomingCall, clearIncomingCall };
};

/**
 * Incoming Call Modal Component
 */
export const IncomingCallNotification = ({ call, onAccept, onDecline }) => {
  const navigate = useNavigate();
  const [isRinging, setIsRinging] = useState(true);

  // Auto-dismiss after 30 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsRinging(false);
      onDecline?.();
    }, 30000);

    return () => clearTimeout(timeout);
  }, [onDecline]);

  const handleAccept = async () => {
    setIsRinging(false);
    // Navigate to call page with incoming call parameters
    navigate(`/call?type=${call.call_type}&call_id=${call.call_id}&incoming=true`);
    onAccept?.();
  };

  const handleDecline = async () => {
    setIsRinging(false);
    try {
      const token = localStorage.getItem('session_token');
      await axios.post(
        `${API}/api/livekit/calls/${call.call_id}/answer`,
        null,
        {
          params: { accept: false },
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );
    } catch (err) {
      console.error('Error declining call:', err);
    }
    onDecline?.();
  };

  if (!isRinging || !call) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 rounded-2xl p-8 text-center max-w-sm w-full mx-4 shadow-2xl border border-zinc-700">
        {/* Caller Avatar */}
        <div className="relative mb-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center animate-pulse">
            <span className="text-4xl font-bold text-white">
              {call.caller_name?.charAt(0)?.toUpperCase() || 'C'}
            </span>
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <span className="bg-green-500 text-xs px-3 py-1 rounded-full text-white font-medium animate-bounce">
              Appel entrant
            </span>
          </div>
        </div>

        {/* Caller Info */}
        <h3 className="text-2xl font-bold text-white mb-2">
          {call.caller_name || 'Coach FitMax'}
        </h3>
        <p className="text-gray-400 mb-8 flex items-center justify-center gap-2">
          {call.call_type === 'video' ? (
            <>
              <Video className="w-4 h-4" />
              Appel vidéo entrant...
            </>
          ) : (
            <>
              <Phone className="w-4 h-4" />
              Appel audio entrant...
            </>
          )}
        </p>

        {/* Ringtone animation */}
        <div className="flex justify-center gap-1 mb-6">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-green-500 rounded-full animate-pulse"
              style={{
                height: `${20 + Math.random() * 20}px`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-6">
          <button
            onClick={handleDecline}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all hover:scale-110 shadow-lg"
          >
            <PhoneOff className="w-7 h-7 text-white" />
          </button>
          <button
            onClick={handleAccept}
            className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center transition-all hover:scale-110 shadow-lg animate-pulse"
          >
            {call.call_type === 'video' ? (
              <Video className="w-7 h-7 text-white" />
            ) : (
              <Phone className="w-7 h-7 text-white" />
            )}
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

export default IncomingCallNotification;
