// IndexedDB utility for Memoria Vault
// Provides async storage for memories using IndexedDB

const DB_NAME = 'MemoriaVaultDB';
const DB_VERSION = 1;
const STORE_NAME = 'memories';

/**
 * Initialize and open IndexedDB connection
 */
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        
        // Create indexes for efficient querying
        objectStore.createIndex('dateAdded', 'dateAdded', { unique: false });
        objectStore.createIndex('dateCreated', 'dateCreated', { unique: false });
        objectStore.createIndex('category', 'category', { unique: false });
        objectStore.createIndex('title', 'title', { unique: false });
      }
    };
  });
};

/**
 * Get all memories from IndexedDB
 */
export const getAllMemories = async () => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error('Failed to get memories'));
      };
    });
  } catch (error) {
    console.error('Error getting memories:', error);
    return [];
  }
};

/**
 * Add a new memory to IndexedDB
 */
export const addMemory = async (memory) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.add(memory);

      request.onsuccess = () => {
        resolve(memory);
      };

      request.onerror = () => {
        reject(new Error('Failed to add memory'));
      };
    });
  } catch (error) {
    console.error('Error adding memory:', error);
    throw error;
  }
};

/**
 * Update an existing memory in IndexedDB
 */
export const updateMemory = async (memory) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.put(memory);

      request.onsuccess = () => {
        resolve(memory);
      };

      request.onerror = () => {
        reject(new Error('Failed to update memory'));
      };
    });
  } catch (error) {
    console.error('Error updating memory:', error);
    throw error;
  }
};

/**
 * Delete a memory from IndexedDB
 */
export const deleteMemory = async (memoryId) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.delete(memoryId);

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = () => {
        reject(new Error('Failed to delete memory'));
      };
    });
  } catch (error) {
    console.error('Error deleting memory:', error);
    throw error;
  }
};

/**
 * Clear all memories from IndexedDB
 */
export const clearAllMemories = async () => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.clear();

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = () => {
        reject(new Error('Failed to clear memories'));
      };
    });
  } catch (error) {
    console.error('Error clearing memories:', error);
    throw error;
  }
};

/**
 * Get a single memory by ID
 */
export const getMemoryById = async (memoryId) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.get(memoryId);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error('Failed to get memory'));
      };
    });
  } catch (error) {
    console.error('Error getting memory:', error);
    return null;
  }
};

/**
 * Migrate data from localStorage to IndexedDB
 * This function handles the one-time migration of existing data
 */
export const migrateFromLocalStorage = async () => {
  try {
    // Check if migration is needed
    const stored = localStorage.getItem('memoria-vault-data');
    if (!stored) {
      console.log('No localStorage data to migrate');
      return { success: true, migrated: 0 };
    }

    // Parse existing data
    const memories = JSON.parse(stored);
    if (!Array.isArray(memories) || memories.length === 0) {
      console.log('No memories to migrate');
      return { success: true, migrated: 0 };
    }

    console.log(`Migrating ${memories.length} memories to IndexedDB...`);

    // Add all memories to IndexedDB
    const db = await openDB();
    let migratedCount = 0;

    for (const memory of memories) {
      try {
        await new Promise((resolve, reject) => {
          const transaction = db.transaction([STORE_NAME], 'readwrite');
          const objectStore = transaction.objectStore(STORE_NAME);
          const request = objectStore.add(memory);

          request.onsuccess = () => {
            migratedCount++;
            resolve();
          };

          request.onerror = (event) => {
            // Skip duplicates
            if (event.target.error.name === 'ConstraintError') {
              console.log(`Skipping duplicate memory: ${memory.id}`);
              resolve();
            } else {
              reject(event.target.error);
            }
          };
        });
      } catch (error) {
        console.error(`Failed to migrate memory ${memory.id}:`, error);
      }
    }

    console.log(`Successfully migrated ${migratedCount} memories`);

    // Create backup of localStorage data before clearing
    localStorage.setItem('memoria-vault-data-backup', stored);
    
    // Clear old localStorage data
    localStorage.removeItem('memoria-vault-data');
    
    // Set migration flag
    localStorage.setItem('memoria-vault-migrated', 'true');

    return { success: true, migrated: migratedCount };
  } catch (error) {
    console.error('Migration error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if IndexedDB is supported
 */
export const isIndexedDBSupported = () => {
  return 'indexedDB' in window;
};

/**
 * Get storage estimation (if supported)
 */
export const getStorageEstimate = async () => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
        usagePercentage: estimate.quota ? ((estimate.usage / estimate.quota) * 100).toFixed(2) : 0
      };
    } catch (error) {
      console.error('Error getting storage estimate:', error);
      return null;
    }
  }
  return null;
};
