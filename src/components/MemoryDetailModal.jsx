import { getCategoryIcon, formatFileSize } from '../utils/helpers';
import CommentsSection from './CommentsSection';

const MemoryDetailModal = ({ isOpen, memory, onClose, onDelete, onDownload, onToggleFavorite, onEdit, onAddToAlbum, onShare, onOpenLinks, showToast }) => {
  if (!isOpen || !memory) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this memory? This action cannot be undone.')) {
      onDelete(memory.id);
      onClose();
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = memory.fileData;
    link.download = memory.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onDownload();
  };

  const handleToggleFavorite = () => {
    if (onToggleFavorite && memory) {
      onToggleFavorite(memory.id);
    }
  };

  const renderPreview = () => {
    if (memory.fileType.startsWith('image/')) {
      return <img src={memory.fileData} alt={memory.title} />;
    } else if (memory.fileType.startsWith('video/')) {
      return <video src={memory.fileData} controls />;
    } else {
      return <div className="file-icon">{getCategoryIcon(memory.category)}</div>;
    }
  };

  return (
    <div className="modal" onClick={handleBackdropClick}>
      <div className="modal-backdrop"></div>
      <div className="modal-content modal-lg">
        <div className="modal-header">
          <h2>{memory.title}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="memory-detail">
            <div className="memory-detail-preview">
              {renderPreview()}
            </div>
            <div className="memory-detail-info">
              <h3>{memory.title}</h3>
              <p className="memory-detail-description">{memory.description}</p>

              <div className="memory-detail-meta">
                <div className="meta-item">
                  <strong>Category:</strong> {getCategoryIcon(memory.category)} {memory.category}
                </div>
                <div className="meta-item">
                  <strong>Date Created:</strong> {new Date(memory.dateCreated).toLocaleDateString()}
                </div>
                <div className="meta-item">
                  <strong>Date Added:</strong> {new Date(memory.dateAdded).toLocaleDateString()}
                </div>
                <div className="meta-item">
                  <strong>File Name:</strong> {memory.fileName}
                </div>
                <div className="meta-item">
                  <strong>File Size:</strong> {formatFileSize(memory.fileSize)}
                </div>
                {memory.tags.length > 0 && (
                  <div className="meta-item">
                    <strong>Tags:</strong>
                    <div className="memory-tags" style={{ marginTop: '8px' }}>
                      {memory.tags.map((tag, index) => (
                        <span key={index} className="memory-tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-6">
            <CommentsSection memoryId={memory.id} showToast={showToast} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn--outline" onClick={handleDelete}>Delete</button>
          {onEdit && (
            <button 
              className="btn btn--outline" 
              onClick={() => onEdit(memory)}
              style={{ marginLeft: 'auto', marginRight: '8px' }}
            >
              ✏️ Edit
            </button>
          )}
          {onOpenLinks && (
            <button 
              className="btn btn--outline" 
              onClick={() => onOpenLinks(memory)}
            >
              🔗 Links
            </button>
          )}
          {onShare && (
            <button 
              className="btn btn--outline" 
              onClick={() => onShare(memory)}
            >
              📤 Share
            </button>
          )}
          {onAddToAlbum && (
            <button 
              className="btn btn--outline" 
              onClick={() => onAddToAlbum(memory)}
            >
              📁 Add to Album
            </button>
          )}
          {onToggleFavorite && (
            <button 
              className="btn btn--outline" 
              onClick={handleToggleFavorite}
            >
              {memory?.isFavorite ? '⭐ Remove from Favorites' : '☆ Add to Favorites'}
            </button>
          )}
          <button className="btn btn--primary" onClick={handleDownload}>Download</button>
        </div>
      </div>
    </div>
  );
};

export default MemoryDetailModal;
