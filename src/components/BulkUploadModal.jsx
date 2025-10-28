import { useState } from 'react';
import { generateThumbnail } from '../utils/thumbnail';
import { detectFileCategory, readFileAsDataURL, getCategoryIcon } from '../utils/helpers';

const BulkUploadModal = ({ isOpen, onClose, onSave }) => {
  const [files, setFiles] = useState([]);
  const [currentStep, setCurrentStep] = useState('select'); // 'select', 'metadata', 'uploading'
  const [isDragging, setIsDragging] = useState(false);
  const [batchMode, setBatchMode] = useState(true);
  const [uploadProgress, setUploadProgress] = useState({});
  const [batchMetadata, setBatchMetadata] = useState({
    category: '',
    tags: '',
    dateCreated: new Date().toISOString().split('T')[0]
  });
  const [individualMetadata, setIndividualMetadata] = useState({});

  const handleFileSelection = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    const newFiles = fileArray.map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      file: file,
      title: file.name.replace(/\.[^/.]+$/, ''),
      description: '',
      category: detectFileCategory(file.type),
      tags: [],
      dateCreated: new Date().toISOString().split('T')[0],
      preview: null
    }));

    // Generate previews for images
    newFiles.forEach(async (fileObj) => {
      if (fileObj.file.type.startsWith('image/')) {
        const preview = await readFileAsDataURL(fileObj.file);
        setFiles(prev => prev.map(f => 
          f.id === fileObj.id ? { ...f, preview } : f
        ));
      }
    });

    setFiles(prev => [...prev, ...newFiles]);
    setCurrentStep('metadata');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelection(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    if (files.length === 1) {
      setCurrentStep('select');
    }
  };

  const updateIndividualMetadata = (fileId, field, value) => {
    setIndividualMetadata(prev => ({
      ...prev,
      [fileId]: {
        ...prev[fileId],
        [field]: value
      }
    }));
  };

  const handleUpload = async () => {
    setCurrentStep('uploading');
    const totalFiles = files.length;
    let completed = 0;

    for (const fileObj of files) {
      try {
        setUploadProgress(prev => ({
          ...prev,
          [fileObj.id]: { status: 'uploading', progress: 0 }
        }));

        const fileData = await readFileAsDataURL(fileObj.file);

        // Generate thumbnail
        let thumbnail = null;
        if (fileObj.file.type.startsWith('image/') || fileObj.file.type.startsWith('video/')) {
          try {
            thumbnail = await generateThumbnail(fileObj.file);
          } catch (error) {
            console.error('Error generating thumbnail:', error);
          }
        }

        // Determine metadata to use
        let metadata;
        if (batchMode) {
          metadata = {
            title: fileObj.title,
            description: batchMetadata.description || '',
            category: batchMetadata.category || fileObj.category,
            tags: batchMetadata.tags
              .split(',')
              .map(tag => tag.trim())
              .filter(tag => tag.length > 0),
            dateCreated: batchMetadata.dateCreated
          };
        } else {
          const individual = individualMetadata[fileObj.id] || {};
          metadata = {
            title: individual.title || fileObj.title,
            description: individual.description || '',
            category: individual.category || fileObj.category,
            tags: (individual.tags || '')
              .split(',')
              .map(tag => tag.trim())
              .filter(tag => tag.length > 0),
            dateCreated: individual.dateCreated || fileObj.dateCreated
          };
        }

        const memory = {
          ...metadata,
          fileName: fileObj.file.name,
          fileType: fileObj.file.type,
          fileSize: fileObj.file.size,
          fileData,
          thumbnail
        };

        await onSave(memory);

        setUploadProgress(prev => ({
          ...prev,
          [fileObj.id]: { status: 'complete', progress: 100 }
        }));

        completed++;

      } catch (error) {
        console.error('Error uploading file:', error);
        setUploadProgress(prev => ({
          ...prev,
          [fileObj.id]: { status: 'error', progress: 0 }
        }));
      }
    }

    // Close modal after all uploads
    setTimeout(() => {
      handleClose();
    }, 1000);
  };

  const handleClose = () => {
    setFiles([]);
    setCurrentStep('select');
    setUploadProgress({});
    setBatchMode(true);
    setBatchMetadata({
      category: '',
      tags: '',
      dateCreated: new Date().toISOString().split('T')[0]
    });
    setIndividualMetadata({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal-backdrop"></div>
      <div className="modal-content modal-lg">
        <div className="modal-header">
          <h2>Bulk Upload - {files.length} file{files.length !== 1 ? 's' : ''} selected</h2>
          <button className="modal-close" onClick={handleClose}>✕</button>
        </div>
        <div className="modal-body">
          {currentStep === 'select' && (
            <div
              className={`upload-area ${isDragging ? 'dragover' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('bulkFileInput').click()}
            >
              <div className="upload-content">
                <div className="upload-icon">📁</div>
                <h3>Drop multiple files here or click to browse</h3>
                <p>Upload photos, videos, audio, and documents all at once</p>
              </div>
              <input
                type="file"
                id="bulkFileInput"
                multiple
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                onChange={(e) => handleFileSelection(e.target.files)}
                style={{ display: 'none' }}
              />
            </div>
          )}

          {currentStep === 'metadata' && (
            <div className="bulk-upload-metadata">
              {/* Mode Toggle */}
              <div className="form-group">
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                  <button
                    className={`btn ${batchMode ? 'btn--primary' : 'btn--outline'}`}
                    onClick={() => setBatchMode(true)}
                  >
                    Batch Mode (Same metadata for all)
                  </button>
                  <button
                    className={`btn ${!batchMode ? 'btn--primary' : 'btn--outline'}`}
                    onClick={() => setBatchMode(false)}
                  >
                    Individual Mode (Edit each file)
                  </button>
                </div>
              </div>

              {/* Batch Metadata Form */}
              {batchMode && (
                <div className="batch-metadata-form" style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'var(--color-secondary)', borderRadius: 'var(--radius-base)' }}>
                  <h3 style={{ marginTop: 0 }}>Apply to All Files:</h3>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-control"
                      value={batchMetadata.category}
                      onChange={(e) => setBatchMetadata({ ...batchMetadata, category: e.target.value })}
                    >
                      <option value="">Keep individual categories</option>
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
                      placeholder="vacation, summer, 2024"
                      value={batchMetadata.tags}
                      onChange={(e) => setBatchMetadata({ ...batchMetadata, tags: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date Created</label>
                    <input
                      type="date"
                      className="form-control"
                      value={batchMetadata.dateCreated}
                      onChange={(e) => setBatchMetadata({ ...batchMetadata, dateCreated: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* File Queue */}
              <div className="file-queue" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {files.map((fileObj) => (
                  <div key={fileObj.id} className="file-queue-item" style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '12px',
                    marginBottom: '12px',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-base)'
                  }}>
                    {/* Preview */}
                    <div style={{ width: '60px', height: '60px', flexShrink: 0, borderRadius: 'var(--radius-sm)', overflow: 'hidden', backgroundColor: 'var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {fileObj.preview ? (
                        <img src={fileObj.preview} alt={fileObj.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '24px' }}>{getCategoryIcon(fileObj.category)}</span>
                      )}
                    </div>

                    {/* File Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {batchMode ? (
                        <>
                          <div style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {fileObj.title}
                          </div>
                          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                            {fileObj.category} • {(fileObj.file.size / 1024).toFixed(1)} KB
                          </div>
                        </>
                      ) : (
                        <>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Title"
                            value={individualMetadata[fileObj.id]?.title || fileObj.title}
                            onChange={(e) => updateIndividualMetadata(fileObj.id, 'title', e.target.value)}
                            style={{ marginBottom: '8px' }}
                          />
                          <select
                            className="form-control"
                            value={individualMetadata[fileObj.id]?.category || fileObj.category}
                            onChange={(e) => updateIndividualMetadata(fileObj.id, 'category', e.target.value)}
                          >
                            <option value="Photos">📷 Photos</option>
                            <option value="Videos">🎥 Videos</option>
                            <option value="Audio">🎵 Audio</option>
                            <option value="Documents">📄 Documents</option>
                            <option value="Notes">📝 Notes</option>
                          </select>
                        </>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      className="btn btn--outline btn--sm"
                      onClick={() => removeFile(fileObj.id)}
                      style={{ flexShrink: 0 }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="form-actions" style={{ marginTop: '20px' }}>
                <button className="btn btn--outline" onClick={() => setCurrentStep('select')}>
                  Add More Files
                </button>
                <button className="btn btn--primary" onClick={handleUpload} disabled={files.length === 0}>
                  Upload {files.length} File{files.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          )}

          {currentStep === 'uploading' && (
            <div className="upload-progress">
              <h3>Uploading {files.length} files...</h3>
              <div style={{ marginTop: '20px' }}>
                {files.map((fileObj) => {
                  const progress = uploadProgress[fileObj.id];
                  return (
                    <div key={fileObj.id} style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>{fileObj.title}</span>
                        <span>
                          {progress?.status === 'complete' && '✅ Complete'}
                          {progress?.status === 'uploading' && '⏳ Uploading...'}
                          {progress?.status === 'error' && '❌ Error'}
                          {!progress && '⏸️ Waiting...'}
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: 'var(--color-secondary)',
                        borderRadius: 'var(--radius-full)',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${progress?.progress || 0}%`,
                          height: '100%',
                          backgroundColor: progress?.status === 'error' ? 'var(--color-error)' : 'var(--color-primary)',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;
