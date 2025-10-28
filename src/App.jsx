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
import MemoryDetailModal from './components/MemoryDetailModal';
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

  const handleDownload = () => {
    showToast('success', 'Memory downloaded successfully');
  };

  const renderPage = () => {
    const props = {
      onOpenUpload: () => setUploadModalOpen(true),
      onOpenBulkUpload: () => setBulkUploadModalOpen(true),
      onOpenImport: () => setImportModalOpen(true),
      onNavigate: setCurrentPage,
      onOpenMemoryDetail: handleOpenMemoryDetail,
      showToast
    };

    switch (currentPage) {
      case 'dashboard': return <Dashboard {...props} />;
      case 'gallery': return <Gallery {...props} />;
      case 'albums': return <Albums {...props} onOpenAlbumView={handleOpenAlbumView} />;
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
      <UploadModal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)} onSave={handleSaveMemory} />
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
      />
      <Toast toasts={toasts} onRemove={removeToast} />
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
