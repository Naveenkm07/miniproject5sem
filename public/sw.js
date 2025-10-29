// Memoria Vault Service Worker
// Provides offline functionality and caching

const CACHE_NAME = 'memoria-vault-v1';
const RUNTIME_CACHE = 'memoria-runtime-v1';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/index.css',
  '/src/App.css',
  '/src/dashboard-pro.css',
  '/src/themes.css'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip POST requests (form submissions, uploads)
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version
          return cachedResponse;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache the fetched response
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        }).catch(() => {
          // Offline fallback
          return caches.match('/index.html');
        });
      })
  );
});

// Background sync for uploading when online
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);
  
  if (event.tag === 'sync-memories') {
    event.waitUntil(syncMemories());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New memory reminder',
    icon: '/pwa-icon-192.png',
    badge: '/badge-icon.png',
    vibrate: [200, 100, 200],
    tag: 'memoria-notification',
    requireInteraction: true,
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'close', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Memoria Vault', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper: Sync memories when back online
async function syncMemories() {
  try {
    // Get pending uploads from IndexedDB
    const db = await openDB();
    const tx = db.transaction('pending-uploads', 'readonly');
    const store = tx.objectStore('pending-uploads');
    const pendingUploads = await store.getAll();

    if (pendingUploads.length === 0) {
      return;
    }

    console.log('[SW] Syncing', pendingUploads.length, 'pending uploads');

    // Process each pending upload
    for (const upload of pendingUploads) {
      // In a real app, you'd send this to your backend
      // For now, we'll just log it
      console.log('[SW] Would sync:', upload);
    }

    // Clear pending uploads after successful sync
    const clearTx = db.transaction('pending-uploads', 'readwrite');
    const clearStore = clearTx.objectStore('pending-uploads');
    await clearStore.clear();

  } catch (error) {
    console.error('[SW] Sync failed:', error);
    throw error;
  }
}

// Helper: Open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MemoriaVaultDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('pending-uploads')) {
        db.createObjectStore('pending-uploads', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

console.log('[SW] Service Worker loaded');
