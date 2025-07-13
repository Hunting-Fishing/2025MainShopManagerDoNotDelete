// Service Worker for PWA functionality
const CACHE_NAME = 'order-master-v1.0.0';
const STATIC_CACHE_NAME = 'order-master-static-v1';
const DYNAMIC_CACHE_NAME = 'order-master-dynamic-v1';

// Files to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests and API calls
  if (!request.url.startsWith(self.location.origin) || 
      request.url.includes('/api/') ||
      request.url.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Return cached response if found
        if (response) {
          return response;
        }

        // For navigation requests, try network first, then offline page
        if (request.mode === 'navigate') {
          return fetch(request)
            .then((response) => {
              // Cache successful navigation responses
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(DYNAMIC_CACHE_NAME)
                  .then((cache) => cache.put(request, responseClone));
              }
              return response;
            })
            .catch(() => {
              // Return offline page for navigation requests
              return caches.match('/offline.html');
            });
        }

        // For other requests, try network then cache
        return fetch(request)
          .then((response) => {
            // Cache successful responses
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE_NAME)
                .then((cache) => cache.put(request, responseClone));
            }
            return response;
          })
          .catch(() => {
            // Return fallback for failed requests
            return new Response('Offline content not available', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered');
  
  if (event.tag === 'sync-work-orders') {
    event.waitUntil(syncWorkOrders());
  }
  
  if (event.tag === 'sync-inventory') {
    event.waitUntil(syncInventory());
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from Order Master',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icon-192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Order Master', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'SW_UPDATE_AVAILABLE') {
    // Broadcast update available message
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'SW_UPDATE_AVAILABLE'
        });
      });
    });
  }
});

// Background sync functions
async function syncWorkOrders() {
  try {
    console.log('Service Worker: Syncing work orders...');
    // Get offline work orders from IndexedDB
    const offlineData = await getOfflineWorkOrders();
    
    if (offlineData.length > 0) {
      // Sync with server
      await Promise.all(offlineData.map(syncSingleWorkOrder));
      console.log('Service Worker: Work orders synced successfully');
    }
  } catch (error) {
    console.error('Service Worker: Error syncing work orders:', error);
  }
}

async function syncInventory() {
  try {
    console.log('Service Worker: Syncing inventory...');
    // Get offline inventory updates from IndexedDB
    const offlineUpdates = await getOfflineInventoryUpdates();
    
    if (offlineUpdates.length > 0) {
      // Sync with server
      await Promise.all(offlineUpdates.map(syncSingleInventoryUpdate));
      console.log('Service Worker: Inventory synced successfully');
    }
  } catch (error) {
    console.error('Service Worker: Error syncing inventory:', error);
  }
}

// Placeholder functions for IndexedDB operations
async function getOfflineWorkOrders() {
  // Implementation would use IndexedDB to get offline work orders
  return [];
}

async function getOfflineInventoryUpdates() {
  // Implementation would use IndexedDB to get offline inventory updates
  return [];
}

async function syncSingleWorkOrder(workOrder) {
  // Implementation would sync a single work order with the server
  console.log('Syncing work order:', workOrder.id);
}

async function syncSingleInventoryUpdate(update) {
  // Implementation would sync a single inventory update with the server
  console.log('Syncing inventory update:', update.id);
}