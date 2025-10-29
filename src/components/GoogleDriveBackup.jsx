import { useState, useEffect } from 'react';
import { X, Cloud, Upload, Download, Trash2, RefreshCw, CheckCircle, AlertCircle, HardDrive } from 'lucide-react';
import {
  initializeGoogleAPI,
  requestAccessToken,
  signOut,
  isSignedIn,
  uploadBackup,
  listBackups,
  downloadBackup,
  deleteBackup,
  getStorageUsage,
} from '../utils/googleDrive';

const GoogleDriveBackup = ({ isOpen, onClose, showToast, exportDataFn, importDataFn }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [backups, setBackups] = useState([]);
  const [storageInfo, setStorageInfo] = useState(null);
  const [selectedBackup, setSelectedBackup] = useState(null);

  useEffect(() => {
    if (isOpen) {
      initGoogleDrive();
    }
  }, [isOpen]);

  const initGoogleDrive = async () => {
    try {
      setLoading(true);
      await initializeGoogleAPI();
      setIsInitialized(true);
      
      // Check if already signed in
      if (window.gapi?.client?.getToken()) {
        setIsSignedIn(true);
        await loadBackups();
        await loadStorageInfo();
      }
    } catch (error) {
      console.error('Failed to initialize Google Drive:', error);
      showToast('error', 'Failed to initialize Google Drive');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setLoading(true);
      await requestAccessToken();
      setIsSignedIn(true);
      showToast('success', 'Successfully signed in to Google Drive!');
      await loadBackups();
      await loadStorageInfo();
    } catch (error) {
      console.error('Sign in failed:', error);
      showToast('error', 'Failed to sign in to Google Drive');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut();
    setIsSignedIn(false);
    setBackups([]);
    setStorageInfo(null);
    showToast('info', 'Signed out from Google Drive');
  };

  const loadBackups = async () => {
    try {
      const files = await listBackups();
      setBackups(files);
    } catch (error) {
      console.error('Failed to load backups:', error);
      showToast('error', 'Failed to load backups');
    }
  };

  const loadStorageInfo = async () => {
    try {
      const info = await getStorageUsage();
      setStorageInfo(info);
    } catch (error) {
      console.error('Failed to load storage info:', error);
    }
  };

  const handleBackupNow = async () => {
    try {
      setLoading(true);
      const data = exportDataFn();
      await uploadBackup(data);
      showToast('success', 'Backup uploaded to Google Drive!');
      await loadBackups();
      await loadStorageInfo();
    } catch (error) {
      console.error('Backup failed:', error);
      showToast('error', 'Failed to upload backup');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (fileId) => {
    if (!confirm('Restore from this backup? Your current data will be replaced.')) {
      return;
    }

    try {
      setLoading(true);
      const data = await downloadBackup(fileId);
      await importDataFn(data);
      showToast('success', 'Data restored from Google Drive backup!');
      onClose();
    } catch (error) {
      console.error('Restore failed:', error);
      showToast('error', 'Failed to restore backup');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (!confirm('Delete this backup from Google Drive?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteBackup(fileId);
      showToast('success', 'Backup deleted from Google Drive');
      await loadBackups();
      await loadStorageInfo();
    } catch (error) {
      console.error('Delete failed:', error);
      showToast('error', 'Failed to delete backup');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
        <div className="modal-header">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Cloud size={20} className="text-white" />
            </div>
            <h2>Google Drive Backup</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {!isInitialized ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
              <p className="opacity-70">Initializing Google Drive...</p>
            </div>
          ) : !isSignedIn ? (
            <div className="text-center py-12">
              <Cloud size={64} className="mx-auto mb-4 opacity-30" />
              <h3 className="text-xl font-semibold mb-3">Connect to Google Drive</h3>
              <p className="opacity-70 mb-6">
                Sign in with your Google account to backup and restore your memories
              </p>
              <button
                onClick={handleSignIn}
                disabled={loading}
                className="btn btn--primary px-6 py-3"
              >
                {loading ? 'Signing in...' : 'Sign in with Google'}
              </button>
              
              <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-left">
                <h4 className="font-semibold mb-2">✨ Features:</h4>
                <ul className="text-sm opacity-70 space-y-1">
                  <li>☁️ 15GB free storage</li>
                  <li>🔄 Auto-backup on schedule</li>
                  <li>📱 Access from any device</li>
                  <li>🔒 Secure and encrypted</li>
                </ul>
              </div>
            </div>
          ) : (
            <>
              {/* Storage Info */}
              {storageInfo && (
                <div className="glass-card rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <HardDrive size={20} className="text-blue-500" />
                      <div>
                        <div className="font-semibold">Google Drive Storage</div>
                        <div className="text-sm opacity-70">
                          {formatFileSize(storageInfo.usage)} of {formatFileSize(storageInfo.limit)} used
                        </div>
                      </div>
                    </div>
                    <span className="text-lg font-semibold">{storageInfo.percentUsed}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all"
                      style={{ width: `${storageInfo.percentUsed}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Backups ({backups.length})</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={loadBackups}
                    disabled={loading}
                    className="btn btn--sm btn--outline flex items-center space-x-2"
                  >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    <span>Refresh</span>
                  </button>
                  <button
                    onClick={handleBackupNow}
                    disabled={loading}
                    className="btn btn--sm btn--primary flex items-center space-x-2"
                  >
                    <Upload size={16} />
                    <span>Backup Now</span>
                  </button>
                </div>
              </div>

              {/* Backup List */}
              {backups.length === 0 ? (
                <div className="text-center py-12 opacity-50">
                  <Cloud size={48} className="mx-auto mb-3 opacity-30" />
                  <p>No backups found</p>
                  <p className="text-sm mt-2">Click "Backup Now" to create your first backup</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {backups.map((backup) => (
                    <div
                      key={backup.id}
                      className={`glass-card rounded-xl p-4 transition-all ${
                        selectedBackup === backup.id ? 'border-2 border-indigo-500' : ''
                      }`}
                      onClick={() => setSelectedBackup(backup.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium mb-1">{backup.name}</div>
                          <div className="text-sm opacity-70">
                            <div>📅 {formatDate(backup.modifiedTime)}</div>
                            <div>💾 {formatFileSize(backup.size)}</div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestore(backup.id);
                            }}
                            disabled={loading}
                            className="btn btn--sm btn--primary flex items-center space-x-1"
                            title="Restore"
                          >
                            <Download size={14} />
                            <span>Restore</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(backup.id);
                            }}
                            disabled={loading}
                            className="btn btn--sm btn--outline text-red-500 hover:bg-red-500/10"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Sign Out */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <button
                  onClick={handleSignOut}
                  className="btn btn--outline btn--sm"
                >
                  Sign Out from Google Drive
                </button>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn--outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleDriveBackup;
