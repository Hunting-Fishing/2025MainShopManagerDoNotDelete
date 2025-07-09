const CACHE_NAME = 'efficient-order-master-v1.0.0';
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`;

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Assets to cache on first request
const CACHE_PATTERNS = [
  /\.(?:js|css|html|svg|png|jpg|jpeg|webp|woff2?)$/,
  /^https:\/\/fonts\.googleapis\.com/,
  /^https:\/\/fonts\.gstatic\.com/
];

// Network-first patterns (always try network first)
const NETWORK_FIRST_PATTERNS = [
  /\/api\//,
  /supabase/
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) return;

  // Network-first strategy for API calls
  if (NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(request.url))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(request);
        })
    );
    return;
  }

  // Cache-first strategy for static assets
  if (CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }

          // Not in cache, fetch from network
          return fetch(request)
            .then((response) => {
              // Cache successful responses
              if (response.ok) {
                const responseClone = response.clone();
                caches.open(DYNAMIC_CACHE)
                  .then((cache) => cache.put(request, responseClone));
              }
              return response;
            })
            .catch(() => {
              // Network failed, show offline page for navigation requests
              if (request.mode === 'navigate') {
                return caches.match('/offline.html');
              }
            });
        })
    );
    return;
  }

  // Default: network-first with cache fallback
  event.respondWith(
    fetch(request)
      .catch(() => {
        return caches.match(request)
          .then((response) => {
            if (response) {
              return response;
            }
            
            // Show offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// Background sync for work order updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'work-order-sync') {
    event.waitUntil(syncWorkOrders());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: data.data,
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  }
});

// Helper functions
async function syncWorkOrders() {
  try {
    // Get pending work orders from IndexedDB
    const pendingUpdates = await getPendingWorkOrderUpdates();
    
    for (const update of pendingUpdates) {
      try {
        // Try to sync with server
        await fetch('/api/work-orders/' + update.id, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(update.data)
        });
        
        // Remove from pending updates if successful
        await removePendingUpdate(update.id);
      } catch (error) {
        console.error('Failed to sync work order:', update.id, error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function getPendingWorkOrderUpdates() {
  // Implementation would use IndexedDB to store pending updates
  return [];
}

async function removePendingUpdate(id) {
  // Implementation would remove from IndexedDB
}

// Message handler for skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Notify clients when a new version is available
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    event.ports[0].postMessage({
      type: 'SW_UPDATE_AVAILABLE',
      version: CACHE_NAME
    });
  }
});