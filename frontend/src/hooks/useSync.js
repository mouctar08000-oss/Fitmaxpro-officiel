/**
 * FitMaxPro - useSync Hook
 * Real-time synchronization across devices using WebSocket
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;
const PING_INTERVAL = 30000;

const useSync = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [deviceCount, setDeviceCount] = useState(1);
  const [lastSync, setLastSync] = useState(null);
  const [syncData, setSyncData] = useState(null);
  
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const pingIntervalRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Get WebSocket URL
  const getWsUrl = useCallback(() => {
    if (!user?.user_id) return null;
    const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
    const wsProtocol = backendUrl.startsWith('https') ? 'wss' : 'ws';
    const wsHost = backendUrl.replace(/^https?:\/\//, '');
    return `${wsProtocol}://${wsHost}/api/sync/ws/${user.user_id}`;
  }, [user?.user_id]);

  // Handle incoming messages
  const handleMessage = useCallback((event) => {
    try {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'connected':
          setDeviceCount(message.data?.device_count || 1);
          setSyncData(message.data?.user_data);
          setLastSync(new Date().toISOString());
          break;
          
        case 'progress_updated':
          // Another device updated progress
          setSyncData(prev => ({
            ...prev,
            ...message.data
          }));
          setLastSync(message.timestamp);
          toast.info('Progress synced from another device');
          break;
          
        case 'session_updated':
          // Workout session updated on another device
          setLastSync(message.timestamp);
          break;
          
        case 'full_sync':
          setSyncData(message.data);
          setLastSync(message.data?.synced_at || new Date().toISOString());
          break;
          
        case 'pong':
          // Keep-alive response
          break;
          
        case 'data_updated':
          // Generic data update
          setLastSync(message.timestamp);
          break;
          
        default:
          console.log('[Sync] Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('[Sync] Error parsing message:', error);
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    const wsUrl = getWsUrl();
    if (!wsUrl || wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('[Sync] Connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;
        
        // Start ping interval
        pingIntervalRef.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'ping' }));
          }
        }, PING_INTERVAL);
      };

      wsRef.current.onmessage = handleMessage;

      wsRef.current.onclose = () => {
        console.log('[Sync] Disconnected');
        setIsConnected(false);
        clearInterval(pingIntervalRef.current);
        
        // Attempt to reconnect
        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts.current++;
          console.log(`[Sync] Reconnecting... Attempt ${reconnectAttempts.current}`);
          reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_DELAY);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('[Sync] WebSocket error:', error);
      };
    } catch (error) {
      console.error('[Sync] Failed to connect:', error);
    }
  }, [getWsUrl, handleMessage]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    clearInterval(pingIntervalRef.current);
    clearTimeout(reconnectTimeoutRef.current);
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Send sync message
  const sendSync = useCallback((type, data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, data }));
      return true;
    }
    return false;
  }, []);

  // Sync workout progress
  const syncProgress = useCallback((progressData) => {
    return sendSync('sync_progress', progressData);
  }, [sendSync]);

  // Sync session data
  const syncSession = useCallback((sessionData) => {
    return sendSync('sync_session', sessionData);
  }, [sendSync]);

  // Request full sync
  const requestFullSync = useCallback(() => {
    return sendSync('request_full_sync', {});
  }, [sendSync]);

  // Connect when user is available
  useEffect(() => {
    if (user?.user_id) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user?.user_id, connect, disconnect]);

  return {
    isConnected,
    deviceCount,
    lastSync,
    syncData,
    syncProgress,
    syncSession,
    requestFullSync,
    reconnect: connect
  };
};

export default useSync;
