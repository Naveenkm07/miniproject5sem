/**
 * PWA Utilities - Service Worker Registration and Management
 */

/**
 * Register the service worker
 */
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered successfully:', registration);

      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000); // Check every hour

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available, prompt user to refresh
            if (confirm('New version available! Reload to update?')) {
              window.location.reload();
            }
          }
        });
      });

      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
};

/**
 * Unregister the service worker (for development/debugging)
 */
export const unregisterServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    console.log('Service Worker unregistered');
  }
};

/**
 * Check if the app is running in standalone mode (installed as PWA)
 */
export const isStandalone = () => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
};

/**
 * Check if the app is installable
 */
export const checkInstallability = () => {
  return new Promise((resolve) => {
    let deferredPrompt = null;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      resolve(deferredPrompt);
    });

    // Timeout after 2 seconds if event doesn't fire
    setTimeout(() => {
      if (!deferredPrompt) {
        resolve(null);
      }
    }, 2000);
  });
};

/**
 * Prompt user to install the app
 */
export const promptInstall = async (deferredPrompt) => {
  if (!deferredPrompt) {
    console.warn('Install prompt not available');
    return false;
  }

  try {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User response to install prompt: ${outcome}`);
    return outcome === 'accepted';
  } catch (error) {
    console.error('Error prompting install:', error);
    return false;
  }
};

/**
 * Check online/offline status
 */
export const isOnline = () => {
  return navigator.onLine;
};

/**
 * Add listeners for online/offline events
 */
export const addConnectivityListeners = (onOnline, onOffline) => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
};

/**
 * Request persistent storage
 */
export const requestPersistentStorage = async () => {
  if (navigator.storage && navigator.storage.persist) {
    const isPersisted = await navigator.storage.persist();
    console.log(`Persistent storage granted: ${isPersisted}`);
    return isPersisted;
  }
  return false;
};

/**
 * Check storage quota and usage
 */
export const checkStorageQuota = async () => {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;
    const percentUsed = ((usage / quota) * 100).toFixed(2);

    return {
      usage,
      quota,
      percentUsed,
      usageMB: (usage / (1024 * 1024)).toFixed(2),
      quotaMB: (quota / (1024 * 1024)).toFixed(2)
    };
  }
  return null;
};

/**
 * Send message to service worker
 */
export const sendMessageToSW = async (message) => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(message);
  }
};

/**
 * Listen for messages from service worker
 */
export const addSWMessageListener = (handler) => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', handler);
    
    return () => {
      navigator.serviceWorker.removeEventListener('message', handler);
    };
  }
  return () => {};
};

/**
 * Clear all caches
 */
export const clearAllCaches = async () => {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('All caches cleared');
  }
};
