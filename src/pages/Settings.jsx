import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useMemories } from '../contexts/MemoryContext';
import { getStorageEstimate } from '../utils/indexedDB';
import PWASettings from '../components/PWASettings';

const Settings = ({ showToast, onOpenImport, onOpenReminders, onOpenGoogleDrive, onOpenDuplicateDetector }) => {
  const { theme, setTheme } = useTheme();
  const { exportAllData, clearAllData } = useMemories();
  const [storageInfo, setStorageInfo] = useState(null);

  useEffect(() => {
    const loadStorageInfo = async () => {
      const info = await getStorageEstimate();
      setStorageInfo(info);
    };
    loadStorageInfo();
  }, []);

  const handleExport = () => {
    const success = exportAllData();
    showToast(success ? 'success' : 'error', success ? 'Data exported successfully' : 'Failed to export data');
  };

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      try {
        await clearAllData();
        showToast('success', 'All data cleared successfully');
      } catch (error) {
        showToast('error', 'Failed to clear data. Please try again.');
      }
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Settings</h1>
      </div>
      <div className="settings-content">
        <div className="settings-section">
          <h3>Storage Information</h3>
          {storageInfo ? (
            <>
              <div className="setting-item">
                <label className="form-label">Storage Used</label>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                  {(storageInfo.usage / (1024 * 1024)).toFixed(2)} MB
                </div>
                <p className="setting-description">
                  {storageInfo.usagePercentage}% of available storage used
                </p>
              </div>
              <div className="setting-item">
                <label className="form-label">Available Storage</label>
                <div style={{ fontSize: '18px', color: 'var(--color-text-secondary)' }}>
                  {(storageInfo.quota / (1024 * 1024 * 1024)).toFixed(2)} GB
                </div>
                <p className="setting-description">
                  IndexedDB storage quota for this app
                </p>
              </div>
            </>
          ) : (
            <p className="setting-description">Loading storage information...</p>
          )}
        </div>
        <div className="settings-section">
          <h3>Appearance</h3>
          <div className="setting-item">
            <label className="form-label">Theme</label>
            <select className="form-control" value={theme} onChange={(e) => setTheme(e.target.value)}>
              <option value="system">System Default</option>
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode</option>
            </select>
          </div>
        </div>
        <div className="settings-section">
          <h3>Reminders & Notifications</h3>
          <div className="setting-item">
            <button className="btn btn--primary" onClick={onOpenReminders}>
              ⏰ Manage Reminders
            </button>
            <p className="setting-description">
              Set up reminders for birthdays, anniversaries, and special memories
            </p>
          </div>
        </div>
        <div className="settings-section">
          <h3>Progressive Web App</h3>
          <PWASettings showToast={showToast} />
        </div>
        <div className="settings-section">
          <h3>Cloud Backup & Sync</h3>
          <div className="setting-item">
            <button className="btn btn--primary" onClick={onOpenGoogleDrive}>
              ☁️ Google Drive Backup
            </button>
            <p className="setting-description">
              Backup and restore your memories to Google Drive (15GB free storage)
            </p>
          </div>
        </div>
        <div className="settings-section">
          <h3>AI-Powered Tools</h3>
          <div className="setting-item">
            <button className="btn btn--primary" onClick={onOpenDuplicateDetector}>
              🤖 Find Duplicates
            </button>
            <p className="setting-description">
              AI-powered duplicate detection to clean up your library
            </p>
          </div>
        </div>
        <div className="settings-section">
          <h3>Data Management</h3>
          <div className="setting-item">
            <button className="btn btn--primary" onClick={onOpenImport}>Import Data</button>
            <p className="setting-description">Restore memories from a backup file</p>
          </div>
          <div className="setting-item">
            <button className="btn btn--outline" onClick={handleExport}>Export All Data</button>
            <p className="setting-description">Download all your memories and data</p>
          </div>
          <div className="setting-item">
            <button className="btn btn--outline" onClick={handleClear}>Clear All Data</button>
            <p className="setting-description">Remove all memories from local storage</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
