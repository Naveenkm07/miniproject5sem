import { useState } from 'react';
import { copyShareLinkToClipboard } from '../utils/exportUtils';

const ShareModal = ({ isOpen, memory, onClose, showToast }) => {
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !memory) return null;

  const handleCopyLink = async () => {
    try {
      const url = await copyShareLinkToClipboard(memory);
      setShareUrl(url);
      setCopied(true);
      showToast('success', 'Link copied to clipboard!');
      
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      showToast('error', 'Failed to copy link');
    }
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: memory.title,
          text: memory.description || 'Check out this memory from Memoria Vault',
          url: window.location.href
        });
        showToast('success', 'Shared successfully!');
      } catch (error) {
        if (error.name !== 'AbortError') {
          showToast('error', 'Failed to share');
        }
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-backdrop"></div>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2>📤 Share Memory</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Memory Preview */}
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            background: 'var(--color-secondary)',
            borderRadius: 'var(--radius-base)',
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            {memory.thumbnail && (
              <img 
                src={memory.thumbnail} 
                alt={memory.title}
                style={{
                  width: '80px',
                  height: '80px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-sm)'
                }}
              />
            )}
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem' }}>{memory.title}</h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                {memory.description?.substring(0, 50)}
                {memory.description && memory.description.length > 50 && '...'}
              </p>
            </div>
          </div>

          {/* Share Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="btn btn--outline"
              style={{
                width: '100%',
                justifyContent: 'flex-start',
                padding: '16px',
                background: copied ? 'var(--color-primary)' : 'transparent',
                color: copied ? 'white' : 'var(--color-text)'
              }}
            >
              <span style={{ fontSize: '1.5rem', marginRight: '12px' }}>
                {copied ? '✅' : '🔗'}
              </span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '600' }}>
                  {copied ? 'Link Copied!' : 'Copy Share Link'}
                </div>
                <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                  {copied ? shareUrl.substring(0, 40) + '...' : 'Get a shareable link'}
                </div>
              </div>
            </button>

            {/* Native Share (if supported) */}
            {navigator.share && (
              <button
                onClick={handleShareNative}
                className="btn btn--outline"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: '16px'
                }}
              >
                <span style={{ fontSize: '1.5rem', marginRight: '12px' }}>📱</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: '600' }}>Share via...</div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                    Use your device's share menu
                  </div>
                </div>
              </button>
            )}

            {/* Download */}
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = memory.fileData;
                link.download = `${memory.title}.${memory.fileType?.split('/')[1] || 'jpg'}`;
                link.click();
                showToast('success', 'Download started!');
              }}
              className="btn btn--outline"
              style={{
                width: '100%',
                justifyContent: 'flex-start',
                padding: '16px'
              }}
            >
              <span style={{ fontSize: '1.5rem', marginRight: '12px' }}>💾</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '600' }}>Download</div>
                <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                  Save to your device
                </div>
              </div>
            </button>
          </div>

          {/* Info */}
          <div style={{
            marginTop: '24px',
            padding: '12px',
            background: 'var(--color-secondary)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            color: 'var(--color-text-secondary)'
          }}>
            <strong>ℹ️ Note:</strong> The share link contains a preview of this memory. Full file access requires the recipient to have access to your Memoria Vault.
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn--outline">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
