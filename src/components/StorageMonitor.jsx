import { useState, useEffect } from 'react';
import { HardDrive, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { getStorageEstimate } from '../utils/indexedDB';

/**
 * Storage Monitor Component
 * Real-time storage usage monitoring and warnings
 */
const StorageMonitor = ({ showToast }) => {
  const [storageInfo, setStorageInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState('stable');

  useEffect(() => {
    loadStorageInfo();
    
    // Check storage every 30 seconds
    const interval = setInterval(loadStorageInfo, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadStorageInfo = async () => {
    try {
      const info = await getStorageEstimate();
      
      // Compare with previous storage
      const previousUsage = localStorage.getItem('storage_usage');
      if (previousUsage) {
        const prev = parseFloat(previousUsage);
        const current = info.usagePercentage;
        
        if (current > prev + 5) {
          setTrend('increasing');
          if (current > 80) {
            showToast('warning', 'Storage usage is high! Consider cleaning up old data.');
          }
        } else if (current < prev - 5) {
          setTrend('decreasing');
        } else {
          setTrend('stable');
        }
      }
      
      localStorage.setItem('storage_usage', info.usagePercentage.toString());
      setStorageInfo(info);
    } catch (error) {
      console.error('Failed to load storage info:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStorageStatus = () => {
    if (!storageInfo) return 'unknown';
    
    const usage = parseFloat(storageInfo.usagePercentage);
    if (usage < 50) return 'healthy';
    if (usage < 75) return 'moderate';
    if (usage < 90) return 'high';
    return 'critical';
  };

  const getStatusColor = () => {
    const status = getStorageStatus();
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'moderate': return 'text-yellow-500';
      case 'high': return 'text-orange-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    const status = getStorageStatus();
    switch (status) {
      case 'healthy': return <CheckCircle size={20} className="text-green-500" />;
      case 'moderate': 
      case 'high': 
      case 'critical': return <AlertTriangle size={20} className={getStatusColor()} />;
      default: return <HardDrive size={20} />;
    }
  };

  if (loading || !storageInfo) {
    return (
      <div className="glass-card rounded-xl p-4">
        <div className="animate-pulse flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/10 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-4 bg-white/10 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-white/10 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
            {getStatusIcon()}
          </div>
          <div>
            <div className="font-semibold">Storage Usage</div>
            <div className="text-sm opacity-70">
              {(storageInfo.usage / (1024 * 1024)).toFixed(2)} MB used
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {trend === 'increasing' && (
            <TrendingUp size={16} className="text-red-500" title="Usage increasing" />
          )}
          <span className={`text-lg font-semibold ${getStatusColor()}`}>
            {parseFloat(storageInfo.usagePercentage).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              parseFloat(storageInfo.usagePercentage) < 50
                ? 'bg-green-500'
                : parseFloat(storageInfo.usagePercentage) < 75
                ? 'bg-yellow-500'
                : parseFloat(storageInfo.usagePercentage) < 90
                ? 'bg-orange-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${storageInfo.usagePercentage}%` }}
          />
        </div>
      </div>

      {/* Warning Messages */}
      {parseFloat(storageInfo.usagePercentage) > 80 && (
        <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
          <div className="text-sm flex items-start space-x-2">
            <AlertTriangle size={16} className="text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-orange-500">Storage Running Low</div>
              <div className="opacity-70 text-xs mt-1">
                Consider deleting old memories or backing up to Google Drive
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 bg-white/5 rounded-lg">
          <div className="opacity-70">Available</div>
          <div className="font-semibold">
            {((storageInfo.quota - storageInfo.usage) / (1024 * 1024 * 1024)).toFixed(2)} GB
          </div>
        </div>
        <div className="p-2 bg-white/5 rounded-lg">
          <div className="opacity-70">Total Quota</div>
          <div className="font-semibold">
            {(storageInfo.quota / (1024 * 1024 * 1024)).toFixed(2)} GB
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageMonitor;
