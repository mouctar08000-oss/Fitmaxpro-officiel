// Service Worker for FitMaxPro Push Notifications, Calls & Offline Support
const CACHE_NAME = 'fitmaxpro-v3';
const STATIC_CACHE = 'fitmaxpro-static-v1';
const API_CACHE = 'fitmaxpro-api-v1';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo192.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installed');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE && name !== API_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => clients.claim())
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses for workouts
          if (response.ok && url.pathname.includes('/workouts')) {
            const responseClone = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached API response when offline
          return caches.match(request);
        })
    );
    return;
  }

  // Handle static assets and images
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((response) => {
        // Cache images
        if (response.ok && (request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i))) {
          const responseClone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
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
