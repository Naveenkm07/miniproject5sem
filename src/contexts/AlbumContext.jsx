import { createContext, useContext, useState, useEffect } from 'react';
import * as indexedDB from '../utils/indexedDB';

const AlbumContext = createContext();

export const useAlbums = () => {
  const context = useContext(AlbumContext);
  if (!context) {
    throw new Error('useAlbums must be used within AlbumProvider');
  }
  return context;
};

export const AlbumProvider = ({ children }) => {
  const [albums, setAlbums] = useState([]);
  const [smartAlbums, setSmartAlbums] = useState([]);

  // Load albums from IndexedDB on mount
  useEffect(() => {
    const loadAlbums = async () => {
      try {
        const stored = localStorage.getItem('memoria-vault-albums');
        if (stored) {
          setAlbums(JSON.parse(stored));
        }
        
        // Load smart albums
        const smartStored = localStorage.getItem('memoria-vault-smart-albums');
        if (smartStored) {
          setSmartAlbums(JSON.parse(smartStored));
        }
      } catch (error) {
        console.error('Error loading albums:', error);
      }
    };

    loadAlbums();
  }, []);

  // Save albums to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('memoria-vault-albums', JSON.stringify(albums));
    } catch (error) {
      console.error('Error saving albums:', error);
    }
  }, [albums]);

  // Save smart albums
  useEffect(() => {
    try {
      localStorage.setItem('memoria-vault-smart-albums', JSON.stringify(smartAlbums));
    } catch (error) {
      console.error('Error saving smart albums:', error);
    }
  }, [smartAlbums]);

  const createAlbum = (albumData) => {
    const newAlbum = {
      ...albumData,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      dateCreated: new Date().toISOString(),
      memoryIds: albumData.memoryIds || [],
      parentAlbumId: albumData.parentAlbumId || null, // Support for nested albums
      isSmartAlbum: false
    };

    setAlbums(prev => [...prev, newAlbum]);
    return newAlbum;
  };

  const updateAlbum = (albumId, updates) => {
    setAlbums(prev => prev.map(album => 
      album.id === albumId ? { ...album, ...updates } : album
    ));
  };

  const deleteAlbum = (albumId) => {
    setAlbums(prev => prev.filter(album => album.id !== albumId));
  };

  const addMemoryToAlbum = (albumId, memoryId) => {
    setAlbums(prev => prev.map(album => {
      if (album.id === albumId) {
        // Prevent duplicates
        if (album.memoryIds.includes(memoryId)) {
          return album;
        }
        return {
          ...album,
          memoryIds: [...album.memoryIds, memoryId]
        };
      }
      return album;
    }));
  };

  const removeMemoryFromAlbum = (albumId, memoryId) => {
    setAlbums(prev => prev.map(album => {
      if (album.id === albumId) {
        return {
          ...album,
          memoryIds: album.memoryIds.filter(id => id !== memoryId)
        };
      }
      return album;
    }));
  };

  const getAlbumMemories = (albumId, allMemories) => {
    const album = albums.find(a => a.id === albumId);
    if (!album) return [];
    
    return allMemories.filter(memory => 
      album.memoryIds.includes(memory.id)
    );
  };

  const getMemoryAlbums = (memoryId) => {
    return albums.filter(album => 
      album.memoryIds.includes(memoryId)
    );
  };

  const createSmartAlbum = (smartAlbumData) => {
    const newSmartAlbum = {
      ...smartAlbumData,
      id: `smart_${Date.now().toString(36)}`,
      dateCreated: new Date().toISOString(),
      isSmartAlbum: true
    };

    setSmartAlbums(prev => [...prev, newSmartAlbum]);
    return newSmartAlbum;
  };

  const updateSmartAlbum = (albumId, updates) => {
    setSmartAlbums(prev => prev.map(album => 
      album.id === albumId ? { ...album, ...updates } : album
    ));
  };

  const deleteSmartAlbum = (albumId) => {
    setSmartAlbums(prev => prev.filter(album => album.id !== albumId));
  };

  const getChildAlbums = (parentAlbumId) => {
    return albums.filter(album => album.parentAlbumId === parentAlbumId);
  };

  const getRootAlbums = () => {
    return albums.filter(album => !album.parentAlbumId);
  };

  const value = {
    albums,
    smartAlbums,
    createAlbum,
    updateAlbum,
    deleteAlbum,
    addMemoryToAlbum,
    removeMemoryFromAlbum,
    getAlbumMemories,
    getMemoryAlbums,
    createSmartAlbum,
    updateSmartAlbum,
    deleteSmartAlbum,
    getChildAlbums,
    getRootAlbums
  };

  return (
    <AlbumContext.Provider value={value}>
      {children}
    </AlbumContext.Provider>
  );
};
