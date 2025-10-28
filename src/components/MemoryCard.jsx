import { getCategoryIcon, formatFileSize } from '../utils/helpers';

const MemoryCard = ({ memory, onClick, onToggleFavorite }) => {
  const handleFavoriteClick = (e) => {
    e.stopPropagation(); // Prevent opening detail modal
    if (onToggleFavorite) {
      onToggleFavorite(memory.id);
    }
  };

  const renderPreview = () => {
    // Use thumbnail if available, otherwise use full file data
    const displayData = memory.thumbnail || memory.fileData;

    if (memory.fileType.startsWith('image/')) {
      return <img src={displayData} alt={memory.title} />;
    } else if (memory.fileType.startsWith('video/')) {
      // For videos, always use thumbnail if available, otherwise show full video
      return memory.thumbnail ? (
        <img src={memory.thumbnail} alt={memory.title} />
      ) : (
        <video src={memory.fileData} muted />
      );
    } else {
      return <div className="file-icon">{getCategoryIcon(memory.category)}</div>;
    }
  };

  const formattedDate = new Date(memory.dateAdded).toLocaleDateString();

  return (
    <div className="memory-card" onClick={() => onClick(memory)}>
      <div className="memory-preview">
        {renderPreview()}
        {/* Favorite Star Button */}
        {onToggleFavorite && (
          <button
            className="favorite-btn"
            onClick={handleFavoriteClick}
            title={memory.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'rgba(0, 0, 0, 0.6)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '18px',
              transition: 'all 0.2s ease',
              zIndex: 10
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {memory.isFavorite ? '⭐' : '☆'}
          </button>
        )}
      </div>
      <div className="memory-info">
        <h3 className="memory-title">{memory.title}</h3>
        <p className="memory-description">{memory.description}</p>
        <div className="memory-meta">
          <span className="memory-category">
            {getCategoryIcon(memory.category)} {memory.category}
          </span>
          <span className="memory-date">{formattedDate}</span>
        </div>
        {memory.tags.length > 0 && (
          <div className="memory-tags">
            {memory.tags.map((tag, index) => (
              <span key={index} className="memory-tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryCard;
