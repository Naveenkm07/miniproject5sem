import { useAlbums } from '../contexts/AlbumContext';
import { useMemories } from '../contexts/MemoryContext';
import MemoryCard from '../components/MemoryCard';

const AlbumView = ({ albumId, onBack, onOpenMemoryDetail, showToast }) => {
  const { albums, getAlbumMemories, removeMemoryFromAlbum } = useAlbums();
  const { memories, toggleFavorite } = useMemories();
  
  const album = albums.find(a => a.id === albumId);
  const albumMemories = getAlbumMemories(albumId, memories);

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
