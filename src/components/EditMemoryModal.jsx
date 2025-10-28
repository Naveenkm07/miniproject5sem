import { useState, useEffect } from 'react';

const EditMemoryModal = ({ isOpen, memory, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    dateCreated: ''
  });
  const [isModified, setIsModified] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initialize form data when memory changes
  useEffect(() => {
    if (memory) {
      setFormData({
        title: memory.title || '',
        description: memory.description || '',
        category: memory.category || '',
        tags: Array.isArray(memory.tags) ? memory.tags.join(', ') : '',
        dateCreated: memory.dateCreated || ''
      });
      setIsModified(false);
    }
  }, [memory]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsModified(true);
  };

  const handleSave = async () => {
    if (!memory) return;

    setSaving(true);
    try {
      const updates = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        tags: formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0),
        dateCreated: formData.dateCreated
      };

      await onSave(memory.id, updates);
      handleClose();
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (isModified) {
      const confirmClose = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmClose) return;
    }
    setIsModified(false);
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen || !memory) return null;

  return (
    <div className="modal" onClick={handleBackdropClick}>
      <div className="modal-backdrop"></div>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Memory</h2>
          <button className="modal-close" onClick={handleClose}>✕</button>
        </div>
        <div className="modal-body">
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="memory-form">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                type="text"
                className="form-control"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="4"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Add a description for this memory..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-control"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
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
                onChange={(e) => handleChange('tags', e.target.value)}
              />
              <p className="setting-description" style={{ marginTop: '4px', fontSize: 'var(--font-size-xs)' }}>
                Separate tags with commas
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Date Created</label>
              <input
                type="date"
                className="form-control"
                value={formData.dateCreated}
                onChange={(e) => handleChange('dateCreated', e.target.value)}
              />
            </div>

            {/* Read-only info */}
            <div style={{ 
              marginTop: '20px', 
              padding: '12px', 
              backgroundColor: 'var(--color-secondary)', 
              borderRadius: 'var(--radius-base)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)'
            }}>
              <div><strong>File:</strong> {memory.fileName}</div>
              <div><strong>Date Added:</strong> {new Date(memory.dateAdded).toLocaleDateString()}</div>
              <div style={{ marginTop: '4px', fontSize: 'var(--font-size-xs)' }}>
                Note: File and date added cannot be changed
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: '20px' }}>
              <button 
                type="button" 
                className="btn btn--outline" 
                onClick={handleClose}
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn--primary"
                disabled={saving || !isModified}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMemoryModal;
