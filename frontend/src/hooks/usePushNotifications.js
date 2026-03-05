import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState('default');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if push notifications are supported
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);

    if (supported && 'Notification' in window) {
      setPermission(Notification.permission);
    }

    // Check existing subscription
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      if (!('serviceWorker' in navigator)) return;

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (err) {
      console.error('Error checking subscription:', err);
    }
  };

  const subscribe = useCallback(async () => {
    if (!isSupported) {
      setError('Push notifications are not supported in this browser');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Request notification permission
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        setError('Notification permission denied');
        setLoading(false);
        return false;
      }

      // Get VAPID public key from backend
      const { data: vapidData } = await axios.get(`${API_URL}/api/notifications/vapid-key`);
      
      if (!vapidData.configured) {
        setError('Push notifications not configured on server');
        setLoading(false);
        return false;
      }

      // Register service worker if not already registered
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidData.publicKey)
      });

      // Send subscription to backend
      const subscriptionJson = subscription.toJSON();
      await axios.post(`${API_URL}/api/notifications/subscribe`, {
        endpoint: subscriptionJson.endpoint,
        keys: subscriptionJson.keys
      });

      setIsSubscribed(true);
      setLoading(false);
      return true;

    } catch (err) {
      console.error('Error subscribing to push:', err);
      setError(err.message || 'Failed to subscribe to notifications');
      setLoading(false);
      return false;
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from push
        await subscription.unsubscribe();

        // Remove subscription from backend
        await axios.delete(`${API_URL}/api/notifications/unsubscribe`, {
          params: { endpoint: subscription.endpoint }
        });
      }

      setIsSubscribed(false);
      setLoading(false);
      return true;

    } catch (err) {
      console.error('Error unsubscribing:', err);
      setError(err.message || 'Failed to unsubscribe');
      setLoading(false);
      return false;
    }
  }, []);

  return {
    isSupported,
    isSubscribed,
    permission,
    loading,
    error,
    subscribe,
    unsubscribe,
    checkSubscription
  };
}

// Helper function to convert VAPID key
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

export default usePushNotifications;
