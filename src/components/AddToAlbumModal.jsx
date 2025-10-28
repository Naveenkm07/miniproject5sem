import { useState } from 'react';
import { useAlbums } from '../contexts/AlbumContext';

const AddToAlbumModal = ({ isOpen, memoryId, onClose, showToast }) => {
  const { albums, addMemoryToAlbum, getMemoryAlbums } = useAlbums();
  const [selectedAlbums, setSelectedAlbums] = useState([]);
  const memoryAlbums = getMemoryAlbums(memoryId);

  const handleToggleAlbum = (albumId) => {
    if (selectedAlbums.includes(albumId)) {
      setSelectedAlbums(prev => prev.filter(id => id !== albumId));
    } else {
      setSelectedAlbums(prev => [...prev, albumId]);
    }
  };

  const handleSave = () => {
    selectedAlbums.forEach(albumId => {
      addMemoryToAlbum(albumId, memoryId);
    });
    
    if (selectedAlbums.length > 0) {
      showToast('success', `Added to ${selectedAlbums.length} album${selectedAlbums.length > 1 ? 's' : ''}`);
    }
    
    setSelectedAlbums([]);
    onClose();
  };

  const handleClose = () => {
    setSelectedAlbums([]);
    onClose();
  };

  if (!isOpen) return null;

  const isInAlbum = (albumId) => memoryAlbums.some(a => a.id === albumId);

  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal-backdrop"></div>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add to Album</h2>
          <button className="modal-close" onClick={handleClose}>✕</button>
        </div>
        <div className="modal-body">
          {albums.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                No albums yet. Create an album first!
              </p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '16px', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                Select albums to add this memory to:
              </div>
              
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {albums.map(album => {
                  const alreadyInAlbum = isInAlbum(album.id);
                  const selected = selectedAlbums.includes(album.id);
                  
                  return (
                    <div
                      key={album.id}
                      onClick={() => !alreadyInAlbum && handleToggleAlbum(album.id)}
                      style={{
                        padding: '12px 16px',
                        marginBottom: '8px',
                        borderRadius: 'var(--radius-base)',
                        border: `2px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        backgroundColor: alreadyInAlbum ? 'var(--color-secondary)' : 'var(--color-surface)',
                        cursor: alreadyInAlbum ? 'not-allowed' : 'pointer',
                        opacity: alreadyInAlbum ? 0.6 : 1,
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={alreadyInAlbum || selected}
                        disabled={alreadyInAlbum}
                        onChange={() => {}}
                        style={{ width: '18px', height: '18px', cursor: alreadyInAlbum ? 'not-allowed' : 'pointer' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                          {album.name}
                        </div>
                        {album.description && (
                          <div style={{ 
                            fontSize: 'var(--font-size-sm)', 
                            color: 'var(--color-text-secondary)',
                            marginTop: '4px'
                          }}>
                            {album.description}
                          </div>
                        )}
                        {alreadyInAlbum && (
                          <div style={{ 
                            fontSize: 'var(--font-size-xs)', 
                            color: 'var(--color-success)',
                            marginTop: '4px'
                          }}>
                            ✓ Already in this album
                          </div>
                        )}
                      </div>
                      <div style={{ 
                        fontSize: 'var(--font-size-sm)', 
                        color: 'var(--color-text-secondary)' 
                      }}>
                        {album.memoryIds.length} {album.memoryIds.length === 1 ? 'memory' : 'memories'}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="form-actions" style={{ marginTop: '20px' }}>
                <button className="btn btn--outline" onClick={handleClose}>
                  Cancel
                </button>
                <button 
                  className="btn btn--primary" 
                  onClick={handleSave}
                  disabled={selectedAlbums.length === 0}
                >
                  Add to {selectedAlbums.length || ''} Album{selectedAlbums.length !== 1 ? 's' : ''}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddToAlbumModal;
