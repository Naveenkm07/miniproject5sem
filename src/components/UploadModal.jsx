import { useState } from 'react';
import { generateThumbnail } from '../utils/thumbnail';
import { detectFileCategory, readFileAsDataURL } from '../utils/helpers';

const UploadModal = ({ isOpen, onClose, onSave }) => {
  const [files, setFiles] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    dateCreated: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  const handleFileSelection = (selectedFiles) => {
    if (selectedFiles.length === 0) return;

    setFiles(selectedFiles);
    const file = selectedFiles[0];

    // Auto-fill form
    setFormData({
      title: file.name.replace(/\.[^/.]+$/, ''),
      description: '',
      category: detectFileCategory(file.type),
      tags: '',
      dateCreated: new Date().toISOString().split('T')[0]
    });

    setShowForm(true);
  };

  const handleFileInputChange = (e) => {
    handleFileSelection(e.target.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelection(e.dataTransfer.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files || files.length === 0) return;

    setLoading(true);
    try {
      const file = files[0];
      const fileData = await readFileAsDataURL(file);

      // Generate thumbnail for images and videos
      let thumbnail = null;
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        try {
          thumbnail = await generateThumbnail(file);
        } catch (error) {
          console.error('Error generating thumbnail:', error);
          // Continue without thumbnail
        }
      }

      const memory = {
        ...formData,
        tags: formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0),
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileData,
        thumbnail
      };

      onSave(memory);
      handleClose();
    } catch (error) {
      console.error('Error saving memory:', error);
      alert('Failed to save memory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFiles(null);
    setShowForm(false);
    setFormData({
      title: '',
      description: '',
      category: '',
      tags: '',
      dateCreated: new Date().toISOString().split('T')[0]
    });
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal" onClick={handleBackdropClick}>
      <div className="modal-backdrop"></div>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Upload Memory</h2>
          <button className="modal-close" onClick={handleClose}>✕</button>
        </div>
        <div className="modal-body">
          {!showForm ? (
            <div
              className={`upload-area ${isDragging ? 'dragover' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fileInput').click()}
            >
              <div className="upload-content">
                <div className="upload-icon">📁</div>
                <h3>Drop files here or click to browse</h3>
                <p>Supports photos, videos, audio, and documents</p>
              </div>
              <input
                type="file"
                id="fileInput"
                multiple
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
              />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="memory-form">
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Photos">📷 Photos</option>
                  <option value="Videos">🎥 Videos</option>
                  <option value="Audio">🎵 Audio</option>
                  <option value="Documents">📄 Documents</option>
                  <option value="Notes">📝 Notes</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tags (comma-separated)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="family, vacation, special"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Date Created</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.dateCreated}
                  onChange={(e) => setFormData({ ...formData, dateCreated: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn--outline" onClick={handleClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Memory'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
