import { useState } from 'react';
import { useAlbums } from '../contexts/AlbumContext';
import { useMemories } from '../contexts/MemoryContext';

const Albums = ({ onOpenAlbumView, showToast }) => {
  const { albums, createAlbum, deleteAlbum } = useAlbums();
  const { memories } = useMemories();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumDescription, setNewAlbumDescription] = useState('');

  const handleCreateAlbum = (e) => {
    e.preventDefault();
    if (!newAlbumName.trim()) return;

    createAlbum({
      name: newAlbumName.trim(),
      description: newAlbumDescription.trim(),
      coverImage: null
    });

    showToast('success', 'Album created successfully!');
    setNewAlbumName('');
    setNewAlbumDescription('');
    setShowCreateModal(false);
  };

  const handleDeleteAlbum = (albumId, albumName) => {
    if (window.confirm(`Delete album "${albumName}"? Memories will not be deleted.`)) {
      deleteAlbum(albumId);
      showToast('success', 'Album deleted successfully');
    }
  };

  const getAlbumCover = (album) => {
    if (album.coverImage) return album.coverImage;
    
    // Use first memory's thumbnail or fileData
    if (album.memoryIds.length > 0) {
      const firstMemory = memories.find(m => m.id === album.memoryIds[0]);
      if (firstMemory) {
        return firstMemory.thumbnail || firstMemory.fileData;
      }
    }
    
    return null;
  };

  const getAlbumMemoryCount = (album) => {
    return album.memoryIds.length;
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Albums</h1>
        <button 
          className="btn btn--primary"
          onClick={() => setShowCreateModal(true)}
        >
          ➕ Create Album
        </button>
      </div>

      {albums.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          color: 'var(--color-text-secondary)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📁</div>
          <h2>No Albums Yet</h2>
          <p>Create your first album to organize your memories</p>
          <button 
            className="btn btn--primary"
            onClick={() => setShowCreateModal(true)}
            style={{ marginTop: '20px' }}
          >
            Create Your First Album
          </button>
        </div>
      ) : (
        <div className="albums-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {albums.map(album => (
            <div 
              key={album.id}
              className="album-card"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                border: '1px solid var(--color-border)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer'
              }}
              onClick={() => onOpenAlbumView(album.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Album Cover */}
              <div style={{
                height: '200px',
                backgroundColor: 'var(--color-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {getAlbumCover(album) ? (
                  <img 
                    src={getAlbumCover(album)} 
                    alt={album.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div style={{ fontSize: '64px', opacity: 0.3 }}>📁</div>
                )}
              </div>

              {/* Album Info */}
              <div style={{ padding: '16px' }}>
                <h3 style={{ 
                  margin: '0 0 8px 0',
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 'var(--font-weight-semibold)'
                }}>
                  {album.name}
                </h3>
                
                {album.description && (
                  <p style={{
                    margin: '0 0 12px 0',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {album.description}
                  </p>
                )}

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)',
                  marginTop: '12px'
                }}>
                  <span>
                    {getAlbumMemoryCount(album)} {getAlbumMemoryCount(album) === 1 ? 'memory' : 'memories'}
                  </span>
                  <button
                    className="btn btn--outline btn--sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAlbum(album.id, album.name);
                    }}
                    style={{ padding: '4px 12px' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Album Modal */}
      {showCreateModal && (
        <div className="modal" onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}>
          <div className="modal-backdrop"></div>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Album</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateAlbum}>
                <div className="form-group">
                  <label className="form-label">Album Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newAlbumName}
                    onChange={(e) => setNewAlbumName(e.target.value)}
                    placeholder="e.g., Summer Vacation 2024"
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={newAlbumDescription}
                    onChange={(e) => setNewAlbumDescription(e.target.value)}
                    placeholder="Describe this album..."
                  />
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn btn--outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn--primary"
                  >
                    Create Album
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Albums;
