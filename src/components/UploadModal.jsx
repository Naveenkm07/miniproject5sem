import { useState } from 'react';
import { generateThumbnail } from '../utils/thumbnail';
import { detectFileCategory, readFileAsDataURL } from '../utils/helpers';
import { generateSmartTags, smartCategorize } from '../utils/aiFeatures';
import PhotoEditor from './PhotoEditor';
import CameraCapture from './CameraCapture';
import { Camera, Image as ImageIcon, Sparkles } from 'lucide-react';

const UploadModal = ({ isOpen, onClose, onSave, showToast }) => {
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
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [editingImage, setEditingImage] = useState(null);

  const handleFileSelection = (selectedFiles) => {
    if (selectedFiles.length === 0) return;

    setFiles(selectedFiles);
    const file = selectedFiles[0];

    // Smart categorization
    const smartCategory = smartCategorize(file);

    // Auto-fill form
    setFormData({
      title: file.name.replace(/\.[^/.]+$/, ''),
      description: '',
      category: smartCategory,
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

      // Generate AI smart tags and merge with user tags
      const smartTags = generateSmartTags(memory);
      const combinedTags = [...new Set([...memory.tags, ...smartTags])];
      memory.tags = combinedTags;

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
    setShowPhotoEditor(false);
    setShowCamera(false);
    setEditingImage(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      tags: '',
      dateCreated: new Date().toISOString().split('T')[0]
    });
    onClose();
  };

  const handleCameraCapture = async (imageData) => {
    // Convert camera image to File object
    const blob = await (await fetch(imageData)).blob();
    const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
    handleFileSelection([file]);
  };

  const handleEditPhoto = () => {
    if (files && files[0] && files[0].type.startsWith('image/')) {
      readFileAsDataURL(files[0]).then(data => {
        setEditingImage(data);
        setShowPhotoEditor(true);
      });
    }
  };

  const handlePhotoEdited = async (editedImageData) => {
    // Convert edited image to File object
    const blob = await (await fetch(editedImageData)).blob();
    const file = new File([blob], files[0].name, { type: 'image/jpeg' });
    handleFileSelection([file]);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal" onClick={handleBackdropClick}>
        <div className="modal-backdrop"></div>
        <div className="modal-content">
          <div className="modal-header">
            <h2>Upload Memory</h2>
            <button className="modal-close" onClick={handleClose}>✕</button>
          </div>
          <div className="modal-body">
            {!showForm ? (
              <>
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
                
                {/* Quick Action Buttons */}
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowCamera(true)}
                    className="btn btn--outline flex-1 flex items-center justify-center gap-2"
                  >
                    <Camera size={18} />
                    Take Photo
                  </button>
                </div>
              </>
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
                {files && files[0] && files[0].type.startsWith('image/') && (
                  <button type="button" className="btn btn--outline" onClick={handleEditPhoto}>
                    ✏️ Edit Photo
                  </button>
                )}
                <button type="submit" className="btn btn--primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Memory'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>

    {/* Photo Editor Modal */}
    <PhotoEditor
      isOpen={showPhotoEditor}
      image={editingImage}
      onClose={() => setShowPhotoEditor(false)}
      onSave={handlePhotoEdited}
      showToast={showToast}
    />

    {/* Camera Capture Modal */}
    <CameraCapture
      isOpen={showCamera}
      onClose={() => setShowCamera(false)}
      onCapture={handleCameraCapture}
      showToast={showToast}
    />
    </>
  );
};

export default UploadModal;
