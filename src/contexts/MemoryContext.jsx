import { createContext, useContext, useState, useEffect } from 'react';
import * as indexedDB from '../utils/indexedDB';
import { generateThumbnail } from '../utils/thumbnail';

const MemoryContext = createContext();

export const useMemories = () => {
  const context = useContext(MemoryContext);
  if (!context) {
    throw new Error('useMemories must be used within MemoryProvider');
  }
  return context;
};

export const MemoryProvider = ({ children }) => {
  const [memories, setMemories] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    sortBy: 'dateAdded',
    showFavorites: '' // '' = all, 'true' = favorites only
  });

  // Load data from IndexedDB on mount and handle migration
  useEffect(() => {
    const loadMemories = async () => {
      try {
        // Check if IndexedDB is supported
        if (!indexedDB.isIndexedDBSupported()) {
          console.warn('IndexedDB not supported, falling back to localStorage');
          // Fallback to localStorage
          const stored = localStorage.getItem('memoria-vault-data');
          if (stored) {
            setMemories(JSON.parse(stored));
          }
          return;
        }

        // Check if migration is needed
        const migrated = localStorage.getItem('memoria-vault-migrated');
        if (!migrated) {
          console.log('First time using IndexedDB, checking for migration...');
          const result = await indexedDB.migrateFromLocalStorage();
          if (result.success) {
            console.log(`Migration completed: ${result.migrated} memories migrated`);
          }
        }

        // Load memories from IndexedDB
        const loadedMemories = await indexedDB.getAllMemories();
        setMemories(loadedMemories);
      } catch (error) {
        console.error('Error loading memories:', error);
      }
    };

    loadMemories();
  }, []);

  // Note: We no longer sync to localStorage as IndexedDB operations are handled per-action
  // This prevents unnecessary writes and improves performance

  const addMemory = async (memory) => {
    const newMemory = {
      ...memory,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      dateAdded: new Date().toISOString(),
      isFavorite: memory.isFavorite || false,
      thumbnail: memory.thumbnail || null // Add thumbnail field
    };
    
    try {
      // Add to IndexedDB
      await indexedDB.addMemory(newMemory);
      // Update local state
      setMemories(prev => [...prev, newMemory]);
      return newMemory;
    } catch (error) {
      console.error('Error adding memory:', error);
      throw error;
    }
  };

  const deleteMemory = async (memoryId) => {
    try {
      // Delete from IndexedDB
      await indexedDB.deleteMemory(memoryId);
      // Update local state
      setMemories(prev => prev.filter(m => m.id !== memoryId));
      return true;
    } catch (error) {
      console.error('Error deleting memory:', error);
      throw error;
    }
  };

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const getFilteredMemories = () => {
    let filtered = [...memories];

    // Favorites filter
    if (filters.showFavorites === 'true') {
      filtered = filtered.filter(memory => memory.isFavorite === true);
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(memory =>
        memory.title.toLowerCase().includes(searchTerm) ||
        memory.description.toLowerCase().includes(searchTerm) ||
        memory.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(memory => memory.category === filters.category);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'dateAdded':
          return new Date(b.dateAdded) - new Date(a.dateAdded);
        case 'dateCreated':
          return new Date(b.dateCreated) - new Date(a.dateCreated);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const exportAllData = () => {
    try {
      const data = {
        memories,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `memoria-vault-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Export error:', error);
      return false;
    }
  };

  const clearAllData = async () => {
    try {
      // Clear IndexedDB
      await indexedDB.clearAllMemories();
      // Clear local state
      setMemories([]);
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  };

  const updateMemory = async (memoryId, updates) => {
    try {
      const memory = memories.find(m => m.id === memoryId);
      if (!memory) {
        throw new Error('Memory not found');
      }

      const updatedMemory = {
        ...memory,
        ...updates,
        // Preserve these fields
        id: memory.id,
        dateAdded: memory.dateAdded,
        fileName: memory.fileName,
        fileType: memory.fileType,
        fileSize: memory.fileSize,
        fileData: memory.fileData
      };

      // Update in IndexedDB
      await indexedDB.updateMemory(updatedMemory);
      // Update local state
      setMemories(prev => prev.map(m => 
        m.id === memoryId ? updatedMemory : m
      ));
      return updatedMemory;
    } catch (error) {
      console.error('Error updating memory:', error);
      throw error;
    }
  };

  const toggleFavorite = async (memoryId) => {
    try {
      const memory = memories.find(m => m.id === memoryId);
      if (!memory) return;

      const updatedMemory = {
        ...memory,
        isFavorite: !memory.isFavorite
      };

      // Update in IndexedDB
      await indexedDB.updateMemory(updatedMemory);
      // Update local state
      setMemories(prev => prev.map(m => 
        m.id === memoryId ? updatedMemory : m
      ));
      return updatedMemory;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  };

  const importMemory = async (memory, importMode, conflictStrategy) => {
    try {
      if (importMode === 'replace') {
        // For replace mode, caller should clear data first
        await indexedDB.addMemory(memory);
        setMemories(prev => [...prev, memory]);
        return true;
      }

      // Merge mode - check for duplicates
      const existing = memories.find(m => m.id === memory.id);
      
      if (existing) {
        if (conflictStrategy === 'skip') {
          // Skip this memory
          throw new Error('DUPLICATE_SKIPPED');
        } else if (conflictStrategy === 'overwrite') {
          // Update existing memory
          await indexedDB.updateMemory(memory);
          setMemories(prev => prev.map(m => m.id === memory.id ? memory : m));
          return true;
        }
      } else {
        // New memory - add it
        await indexedDB.addMemory(memory);
        setMemories(prev => [...prev, memory]);
        return true;
      }
    } catch (error) {
      throw error;
    }
  };

  const value = {
    memories,
    filters,
    addMemory,
    updateMemory,
    deleteMemory,
    toggleFavorite,
    updateFilters,
    getFilteredMemories,
    exportAllData,
    clearAllData,
    importMemory
  };

  return (
    <MemoryContext.Provider value={value}>
      {children}
    </MemoryContext.Provider>
  );
};
