// Service Worker for FitMaxPro Push Notifications & Calls
const CACHE_NAME = 'fitmaxpro-v2';

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installed');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activated');
  event.waitUntil(clients.claim());
});

// Push notification received
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let data = {
    title: 'FitMaxPro',
    body: 'Nouvelle notification',
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: 'fitmaxpro-notification',
    data: {}
  };
  
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }
  
  // Special handling for incoming calls
  const isCall = data.data?.type === 'incoming_call';
  
  const options = {
    body: data.body,
    icon: data.icon || '/logo192.png',
    badge: data.badge || '/logo192.png',
    tag: data.tag || 'fitmaxpro-notification',
    data: data.data || {},
    vibrate: isCall ? [500, 200, 500, 200, 500] : [200, 100, 200],
    requireInteraction: isCall || data.requireInteraction || false,
    actions: data.actions || [],
    silent: false
  };
  
  // For calls, add answer/decline actions
  if (isCall && !options.actions.length) {
    options.actions = [
      { action: 'answer', title: '📞 Répondre' },
      { action: 'decline', title: '❌ Refuser' }
    ];
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  event.notification.close();
  
  const notificationData = event.notification.data || {};
  const isCall = notificationData.type === 'incoming_call';
  
  let urlToOpen = '/';
  
  if (isCall) {
    if (event.action === 'answer') {
      // Open call page with answer=true
      urlToOpen = `/call?room=${notificationData.room_name}&answer=true`;
    } else if (event.action === 'decline') {
      // Send decline to backend and don't open
      declineCall(notificationData.room_name);
      return;
    } else {
      // Clicked on notification body - open call page
      urlToOpen = `/call?room=${notificationData.room_name}&answer=true`;
    }
  } else {
    urlToOpen = notificationData.url || '/';
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Open a new window if none is open
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Notification close handler (for calls declined by closing)
self.addEventListener('notificationclose', (event) => {
  const notificationData = event.notification.data || {};
  
  if (notificationData.type === 'incoming_call') {
    console.log('[SW] Call notification dismissed');
    // Optionally decline the call
  }
});

// Helper to decline a call
async function declineCall(roomName) {
  try {
    // Extract call_id from room_name
    const callId = roomName.split('_').pop();
    
    await fetch(`/api/livekit/calls/${callId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accept: false })
    });
    
    console.log('[SW] Call declined');
  } catch (error) {
    console.error('[SW] Error declining call:', error);
  }
}

// Background sync for offline notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notifications') {
    console.log('[SW] Syncing notifications');
  }
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
