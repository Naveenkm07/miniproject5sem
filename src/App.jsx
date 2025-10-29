import { useState } from 'react';
import { MemoryProvider, useMemories } from './contexts/MemoryContext';
import { AlbumProvider } from './contexts/AlbumContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useToast } from './hooks/useToast';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import UploadModal from './components/UploadModal';
import BulkUploadModal from './components/BulkUploadModal';
import ImportModal from './components/ImportModal';
import EditMemoryModal from './components/EditMemoryModal';
import AddToAlbumModal from './components/AddToAlbumModal';
import ShareModal from './components/ShareModal';
import RemindersModal from './components/RemindersModal';
import MemoryDetailModal from './components/MemoryDetailModal';
import MemoryLinksModal from './components/MemoryLinksModal';
import GoogleDriveBackup from './components/GoogleDriveBackup';
import DuplicateDetector from './components/DuplicateDetector';
import CollaborationModal from './components/CollaborationModal';
import InstallPrompt from './components/InstallPrompt';
import OfflineIndicator from './components/OfflineIndicator';
import Dashboard from './pages/Dashboard';
import Gallery from './pages/Gallery';
import Albums from './pages/Albums';
import AlbumView from './pages/AlbumView';
import Timeline from './pages/Timeline';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';
import './App.css';

const AppContent = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [bulkUploadModalOpen, setBulkUploadModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addToAlbumModalOpen, setAddToAlbumModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [remindersModalOpen, setRemindersModalOpen] = useState(false);
  const [linksModalOpen, setLinksModalOpen] = useState(false);
  const [googleDriveModalOpen, setGoogleDriveModalOpen] = useState(false);
  const [duplicateDetectorOpen, setDuplicateDetectorOpen] = useState(false);
  const [collaborationModalOpen, setCollaborationModalOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [currentAlbumId, setCurrentAlbumId] = useState(null);
  const { toasts, showToast, removeToast } = useToast();
  const { memories, addMemory, updateMemory, deleteMemory, importMemory, clearAllData, toggleFavorite } = useMemories();

  const handleSaveMemory = async (memory) => {
    try {
      await addMemory(memory);
      showToast('success', 'Memory saved successfully!');
    } catch (error) {
      showToast('error', 'Failed to save memory. Please try again.');
    }
  };

  const handleDeleteMemory = async (memoryId) => {
    try {
      await deleteMemory(memoryId);
      showToast('success', 'Memory deleted successfully');
    } catch (error) {
      showToast('error', 'Failed to delete memory. Please try again.');
    }
  };

  const handleOpenMemoryDetail = (memory) => {
    setSelectedMemory(memory);
    setDetailModalOpen(true);
  };

  const handleImportMemory = async (memory, importMode, conflictStrategy) => {
    try {
      // If replace mode, clear all data first
      if (importMode === 'replace' && memories.length > 0) {
        await clearAllData();
      }
      
      await importMemory(memory, importMode, conflictStrategy);
      return true;
    } catch (error) {
      if (error.message === 'DUPLICATE_SKIPPED') {
        // This is expected for skipped duplicates
        throw error;
      }
      showToast('error', 'Failed to import memory');
      throw error;
    }
  };

  const handleEditMemory = (memory) => {
    setSelectedMemory(memory);
    setDetailModalOpen(false);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (memoryId, updates) => {
    try {
      await updateMemory(memoryId, updates);
      showToast('success', 'Memory updated successfully!');
      setEditModalOpen(false);
      setSelectedMemory(null);
    } catch (error) {
      showToast('error', 'Failed to update memory. Please try again.');
      throw error;
    }
  };

  const handleToggleFavorite = async (memoryId) => {
    try {
      await toggleFavorite(memoryId);
    } catch (error) {
      showToast('error', 'Failed to update favorite status');
    }
  };

  const handleOpenAlbumView = (albumId) => {
    setCurrentAlbumId(albumId);
    setCurrentPage('albumView');
  };

  const handleBackToAlbums = () => {
    setCurrentAlbumId(null);
    setCurrentPage('albums');
  };

  const handleOpenAddToAlbum = (memory) => {
    setSelectedMemory(memory);
    setAddToAlbumModalOpen(true);
  };

  const handleOpenShare = (memory) => {
    setSelectedMemory(memory);
    setDetailModalOpen(false);
    setShareModalOpen(true);
  };

  const handleOpenLinks = (memory) => {
    setSelectedMemory(memory);
    setDetailModalOpen(false);
    setLinksModalOpen(true);
  };

  const exportDataForBackup = () => {
    return {
      memories,
      exportDate: new Date().toISOString(),
      version: '2.0'
    };
  };

  const importDataFromBackup = async (data) => {
    if (!data.memories || !Array.isArray(data.memories)) {
      throw new Error('Invalid backup data format');
    }

    // Clear existing data
    await clearAllData();

    // Import memories one by one
    for (const memory of data.memories) {
      await importMemory(memory, 'merge', 'skip');
    }
  };

  const handleOpenCollaboration = (album) => {
    setSelectedAlbum(album);
    setCollaborationModalOpen(true);
  };

  const handleDownload = () => {
    showToast('success', 'Memory downloaded successfully');
  };

  const renderPage = () => {
    const props = {
      onOpenUpload: () => setUploadModalOpen(true),
      onOpenBulkUpload: () => setBulkUploadModalOpen(true),
      onOpenImport: () => setImportModalOpen(true),
      onOpenReminders: () => setRemindersModalOpen(true),
      onOpenGoogleDrive: () => setGoogleDriveModalOpen(true),
      onOpenDuplicateDetector: () => setDuplicateDetectorOpen(true),
      onNavigate: setCurrentPage,
      onOpenMemoryDetail: handleOpenMemoryDetail,
      showToast
    };

    switch (currentPage) {
      case 'dashboard': return <Dashboard {...props} />;
      case 'gallery': return <Gallery {...props} />;
      case 'albums': return <Albums {...props} onOpenAlbumView={handleOpenAlbumView} onOpenCollaboration={handleOpenCollaboration} />;
      case 'albumView': return <AlbumView albumId={currentAlbumId} onBack={handleBackToAlbums} onOpenMemoryDetail={handleOpenMemoryDetail} showToast={showToast} />;
      case 'timeline': return <Timeline {...props} />;
      case 'stats': return <Statistics />;
      case 'settings': return <Settings {...props} />;
      default: return <Dashboard {...props} />;
    }
  };

  return (
    <div id="app">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="main-content">{renderPage()}</main>
      <UploadModal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)} onSave={handleSaveMemory} showToast={showToast} />
      <BulkUploadModal isOpen={bulkUploadModalOpen} onClose={() => setBulkUploadModalOpen(false)} onSave={handleSaveMemory} />
      <ImportModal 
        isOpen={importModalOpen} 
        onClose={() => setImportModalOpen(false)} 
        onImport={handleImportMemory}
        existingMemoriesCount={memories.length}
      />
      <EditMemoryModal
        isOpen={editModalOpen}
        memory={selectedMemory}
        onClose={() => { setEditModalOpen(false); setSelectedMemory(null); }}
        onSave={handleSaveEdit}
      />
      <AddToAlbumModal
        isOpen={addToAlbumModalOpen}
        memoryId={selectedMemory?.id}
        onClose={() => { setAddToAlbumModalOpen(false); setSelectedMemory(null); }}
        showToast={showToast}
      />
      <MemoryDetailModal 
        isOpen={detailModalOpen} 
        memory={selectedMemory} 
        onClose={() => setDetailModalOpen(false)} 
        onDelete={handleDeleteMemory} 
        onDownload={handleDownload}
        onToggleFavorite={handleToggleFavorite}
        onEdit={handleEditMemory}
        onAddToAlbum={handleOpenAddToAlbum}
        onShare={handleOpenShare}
        onOpenLinks={handleOpenLinks}
        showToast={showToast}
      />
      <ShareModal
        isOpen={shareModalOpen}
        memory={selectedMemory}
        onClose={() => { setShareModalOpen(false); setSelectedMemory(null); }}
        showToast={showToast}
      />
      <RemindersModal
        isOpen={remindersModalOpen}
        onClose={() => setRemindersModalOpen(false)}
        showToast={showToast}
        memories={memories}
      />
      <MemoryLinksModal
        isOpen={linksModalOpen}
        memory={selectedMemory}
        onClose={() => { setLinksModalOpen(false); setSelectedMemory(null); }}
        showToast={showToast}
      />
      <GoogleDriveBackup
        isOpen={googleDriveModalOpen}
        onClose={() => setGoogleDriveModalOpen(false)}
        showToast={showToast}
        exportDataFn={exportDataForBackup}
        importDataFn={importDataFromBackup}
      />
      <DuplicateDetector
        isOpen={duplicateDetectorOpen}
        onClose={() => setDuplicateDetectorOpen(false)}
        showToast={showToast}
      />
      <CollaborationModal
        isOpen={collaborationModalOpen}
        album={selectedAlbum}
        onClose={() => {
          setCollaborationModalOpen(false);
          setSelectedAlbum(null);
        }}
        showToast={showToast}
      />
      <Toast toasts={toasts} onRemove={removeToast} />
      <InstallPrompt />
      <OfflineIndicator />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <MemoryProvider>
        <AlbumProvider>
          <AppContent />
        </AlbumProvider>
      </MemoryProvider>
    </ThemeProvider>
  );
}

export default App;
