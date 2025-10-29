import { useState, useEffect } from 'react';
import { Smartphone, HardDrive, Database, RefreshCw, Trash2, Download, CheckCircle } from 'lucide-react';
import { 
  isStandalone, 
  checkStorageQuota, 
  requestPersistentStorage,
  clearAllCaches 
} from '../utils/pwa';

const PWASettings = ({ showToast }) => {
  const [isPWA, setIsPWA] = useState(false);
  const [storageInfo, setStorageInfo] = useState(null);
  const [isPersistent, setIsPersistent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsPWA(isStandalone());
    loadStorageInfo();
    checkPersistence();
  }, []);

  const loadStorageInfo = async () => {
    const info = await checkStorageQuota();
    setStorageInfo(info);
  };

  const checkPersistence = async () => {
    if (navigator.storage && navigator.storage.persisted) {
      const persisted = await navigator.storage.persisted();
      setIsPersistent(persisted);
    }
  };

  const handleRequestPersistence = async () => {
    setLoading(true);
    const granted = await requestPersistentStorage();
    setIsPersistent(granted);
    setLoading(false);
    
    if (granted) {
      showToast('success', 'Persistent storage enabled! Your data is now protected.');
    } else {
      showToast('info', 'Persistent storage request denied by browser.');
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Clear all cached data? This will not delete your memories, only temporary cached files.')) {
      return;
    }

    setLoading(true);
    await clearAllCaches();
    await loadStorageInfo();
    setLoading(false);
    
    showToast('success', 'Cache cleared successfully!');
  };

  const getStorageColor = (percent) => {
    if (percent < 50) return 'text-green-500';
    if (percent < 75) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* PWA Status */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isPWA ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
            }`}>
              <Smartphone size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Progressive Web App</h3>
              <p className="text-sm opacity-70">
                {isPWA ? 'Running as installed app' : 'Running in browser'}
              </p>
            </div>
          </div>
          
          {isPWA && (
            <div className="flex items-center space-x-2 text-green-500">
              <CheckCircle size={20} />
              <span className="font-medium">Active</span>
            </div>
          )}
        </div>

        {!isPWA && (
          <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <p className="text-sm">
              💡 <strong>Tip:</strong> Install this app for a better experience with offline support and quick access!
            </p>
          </div>
        )}
      </div>

      {/* Storage Information */}
      {storageInfo && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-indigo-500/20 text-indigo-500 rounded-xl flex items-center justify-center">
              <HardDrive size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Storage Usage</h3>
              <p className="text-sm opacity-70">
                {storageInfo.usageMB} MB of {storageInfo.quotaMB} MB used
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="opacity-70">Storage</span>
              <span className={`font-medium ${getStorageColor(storageInfo.percentUsed)}`}>
                {storageInfo.percentUsed}%
              </span>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  storageInfo.percentUsed < 50 ? 'bg-green-500' :
                  storageInfo.percentUsed < 75 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${storageInfo.percentUsed}%` }}
              />
            </div>
          </div>

          {/* Storage Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={loadStorageInfo}
              disabled={loading}
              className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            
            <button
              onClick={handleClearCache}
              disabled={loading}
              className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <Trash2 size={18} />
              <span>Clear Cache</span>
            </button>
          </div>
        </div>
      )}

      {/* Persistent Storage */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isPersistent ? 'bg-green-500/20 text-green-500' : 'bg-orange-500/20 text-orange-500'
            }`}>
              <Database size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Persistent Storage</h3>
              <p className="text-sm opacity-70">
                {isPersistent ? 'Enabled - Data protected' : 'Not enabled'}
              </p>
            </div>
          </div>
          
          {isPersistent && (
            <div className="flex items-center space-x-2 text-green-500">
              <CheckCircle size={20} />
            </div>
          )}
        </div>

        <p className="text-sm opacity-70 mb-4">
          Persistent storage prevents the browser from automatically clearing your data when storage is low.
        </p>

        {!isPersistent && (
          <button
            onClick={handleRequestPersistence}
            disabled={loading}
            className="btn-primary w-full py-3 rounded-xl flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Download size={18} />
            <span>{loading ? 'Requesting...' : 'Enable Persistent Storage'}</span>
          </button>
        )}
      </div>

      {/* PWA Features */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">PWA Features</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
            <span className="text-sm">📴 Offline Mode</span>
            <span className="text-green-500 font-medium">Active</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
            <span className="text-sm">🔄 Background Sync</span>
            <span className="text-green-500 font-medium">Enabled</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
            <span className="text-sm">🔔 Push Notifications</span>
            <span className="text-green-500 font-medium">Supported</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
            <span className="text-sm">⚡ Cache-First Loading</span>
            <span className="text-green-500 font-medium">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWASettings;
