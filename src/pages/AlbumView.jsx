import { useState } from 'react';
import { useAlbums } from '../contexts/AlbumContext';
import { useMemories } from '../contexts/MemoryContext';
import MemoryCard from '../components/MemoryCard';
import { exportAlbumAsZip, openSlideshow, exportSlideshow, printPhotoAlbum } from '../utils/exportUtils';

const AlbumView = ({ albumId, onBack, onOpenMemoryDetail, showToast }) => {
  const { albums, getAlbumMemories, removeMemoryFromAlbum } = useAlbums();
  const { memories, toggleFavorite } = useMemories();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  const album = albums.find(a => a.id === albumId);
  const albumMemories = getAlbumMemories(albumId, memories);

  const handleExportAsZip = async () => {
    try {
      setExporting(true);
      setShowExportMenu(false);
      showToast('info', 'Preparing ZIP file...');
      await exportAlbumAsZip(album, memories, albumMemories);
      showToast('success', `Album exported! (${albumMemories.length} memories)`);
    } catch (error) {
      showToast('error', 'Failed to export album');
    } finally {
      setExporting(false);
    }
  };

  const handleOpenSlideshow = () => {
    setShowExportMenu(false);
    const images = albumMemories.filter(m => m.fileType.startsWith('image/'));
    if (images.length === 0) {
      showToast('error', 'No images in this album');
      return;
    }
    openSlideshow(images, { autoplay: true, interval: 3000, showTitles: true });
    showToast('success', 'Slideshow opened in new window');
  };

  const handleExportSlideshow = () => {
    setShowExportMenu(false);
    const images = albumMemories.filter(m => m.fileType.startsWith('image/'));
    if (images.length === 0) {
      showToast('error', 'No images in this album');
      return;
    }
    exportSlideshow(images, album.name, { autoplay: true, interval: 3000, showTitles: true });
    showToast('success', 'Slideshow HTML file downloaded');
  };

  const handlePrintAlbum = () => {
    setShowExportMenu(false);
    const images = albumMemories.filter(m => m.fileType.startsWith('image/'));
    if (images.length === 0) {
      showToast('error', 'No images in this album');
      return;
    }
    printPhotoAlbum(images, album.name);
  };

  if (!album) {
    return (
      <div className="container">
        <div className="page-header">
          <button className="btn btn--outline" onClick={onBack}>
            ← Back to Albums
          </button>
        </div>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2>Album not found</h2>
        </div>
      </div>
    );
  }

  const handleRemoveMemory = (memoryId) => {
    if (window.confirm('Remove this memory from the album?')) {
      removeMemoryFromAlbum(albumId, memoryId);
      showToast('success', 'Memory removed from album');
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <button className="btn btn--outline" onClick={onBack}>
          ← Back to Albums
        </button>
        <h1>{album.name}</h1>
        {albumMemories.length > 0 && (
          <div style={{ position: 'relative' }}>
            <button 
              className="btn btn--primary" 
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={exporting}
            >
              {exporting ? '⏳ Exporting...' : '📥 Export'}
            </button>
            {showExportMenu && (
              <>
                <div 
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 999
                  }}
                  onClick={() => setShowExportMenu(false)}
                />
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  background: 'var(--glass-bg-strong)',
                  backdropFilter: 'var(--backdrop-blur)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '12px',
                  minWidth: '220px',
                  boxShadow: 'var(--shadow-xl)',
                  zIndex: 1000
                }}>
                  <div style={{
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: 'var(--color-text-secondary)',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Export Options
                  </div>
                  <button
                    onClick={handleExportAsZip}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 'var(--radius-base)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '4px',
                      transition: 'all 0.2s ease',
                      color: 'var(--color-text)',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-secondary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span>📦</span>
                    <span>Export as ZIP</span>
                  </button>
                  <button
                    onClick={handleOpenSlideshow}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 'var(--radius-base)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '4px',
                      transition: 'all 0.2s ease',
                      color: 'var(--color-text)',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-secondary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span>🎬</span>
                    <span>View Slideshow</span>
                  </button>
                  <button
                    onClick={handleExportSlideshow}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 'var(--radius-base)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '4px',
                      transition: 'all 0.2s ease',
                      color: 'var(--color-text)',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-secondary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span>💾</span>
                    <span>Save Slideshow</span>
                  </button>
                  <button
                    onClick={handlePrintAlbum}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 'var(--radius-base)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'all 0.2s ease',
                      color: 'var(--color-text)',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-secondary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span>🖨</span>
                    <span>Print Album</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {album.description && (
        <p style={{ 
          marginBottom: '24px', 
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--font-size-base)'
        }}>
          {album.description}
        </p>
      )}

      <div style={{ 
        marginBottom: '24px',
        padding: '12px 16px',
        backgroundColor: 'var(--color-secondary)',
        borderRadius: 'var(--radius-base)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          {albumMemories.length} {albumMemories.length === 1 ? 'memory' : 'memories'} in this album
        </span>
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
          Created {new Date(album.dateCreated).toLocaleDateString()}
        </span>
      </div>

      {albumMemories.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '2px dashed var(--color-border)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📷</div>
          <h3>No Memories Yet</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Add memories to this album from the Gallery or Memory Detail view
          </p>
        </div>
      ) : (
        <div className="memory-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {albumMemories.map(memory => (
            <div key={memory.id} style={{ position: 'relative' }}>
              <MemoryCard
                memory={memory}
                onClick={onOpenMemoryDetail}
                onToggleFavorite={toggleFavorite}
              />
              <button
                className="btn btn--outline btn--sm"
                onClick={() => handleRemoveMemory(memory.id)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  zIndex: 11,
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  border: 'none',
                  padding: '4px 8px',
                  fontSize: 'var(--font-size-xs)'
                }}
              >
                Remove from Album
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlbumView;
