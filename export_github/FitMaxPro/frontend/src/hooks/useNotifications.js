import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

// VAPID public key - Generated for FitMaxPro
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const useNotifications = () => {
  const [permission, setPermission] = useState('default');
  const [subscription, setSubscription] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
      
      // Check for existing subscription
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((sub) => {
          setSubscription(sub);
        });
      });
    }
  }, []);

  const registerServiceWorker = useCallback(async () => {
    if (!isSupported) return null;
    
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }, [isSupported]);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;
    
    setLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      setLoading(false);
      return result === 'granted';
    } catch (error) {
      console.error('Permission request failed:', error);
      setLoading(false);
      return false;
    }
  }, [isSupported]);

  const subscribe = useCallback(async () => {
    if (!isSupported || permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return null;
    }
    
    setLoading(true);
    try {
      // Register service worker first
      await registerServiceWorker();
      
      const registration = await navigator.serviceWorker.ready;
      
      // Subscribe to push notifications
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
      
      setSubscription(sub);
      
      // Send subscription to backend
      const token = localStorage.getItem('token') || localStorage.getItem('session_token');
      if (token) {
        await axios.post(`${API}/api/notifications/subscribe`, {
          subscription: sub.toJSON()
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setLoading(false);
      return sub;
    } catch (error) {
      console.error('Subscription failed:', error);
      setLoading(false);
      return null;
    }
  }, [isSupported, permission, requestPermission, registerServiceWorker]);

  const unsubscribe = useCallback(async () => {
    if (!subscription) return true;
    
    setLoading(true);
    try {
      await subscription.unsubscribe();
      
      // Notify backend
      const token = localStorage.getItem('token') || localStorage.getItem('session_token');
      if (token) {
        await axios.post(`${API}/api/notifications/unsubscribe`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setSubscription(null);
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Unsubscribe failed:', error);
      setLoading(false);
      return false;
    }
  }, [subscription]);

  // Show local notification (for testing)
  const showLocalNotification = useCallback((title, options = {}) => {
    if (permission !== 'granted') return;
    
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        body: options.body || '',
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag: options.tag || 'fitmaxpro-local',
        data: options.data || {},
        ...options
      });
    });
  }, [permission]);

  return {
    permission,
    subscription,
    isSupported,
    loading,
    requestPermission,
    subscribe,
    unsubscribe,
    showLocalNotification,
    isSubscribed: !!subscription
  };
};

export default useNotifications;
