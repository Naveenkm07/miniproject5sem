import { useState, useEffect } from 'react';
import { WifiOff, Wifi, Cloud, CloudOff } from 'lucide-react';
import { isOnline, addConnectivityListeners } from '../utils/pwa';

const OfflineIndicator = () => {
  const [online, setOnline] = useState(isOnline());
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      setToastMessage('Back online! Your changes will sync now.');
      setShowToast(true);
      
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    };

    const handleOffline = () => {
      setOnline(false);
      setToastMessage('You\'re offline. Changes will sync when reconnected.');
      setShowToast(true);
    };

    const cleanup = addConnectivityListeners(handleOnline, handleOffline);

    return cleanup;
  }, []);

  return (
    <>
      {/* Persistent banner when offline */}
      {!online && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500/90 backdrop-blur-sm text-white px-4 py-2 text-center text-sm font-medium shadow-lg">
          <div className="flex items-center justify-center space-x-2">
            <WifiOff size={16} />
            <span>You're offline - Changes will sync when reconnected</span>
          </div>
        </div>
      )}

      {/* Toast notification for status changes */}
      {showToast && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up">
          <div
            className={`glass-card rounded-2xl shadow-2xl border border-white/20 px-6 py-4 ${
              online
                ? 'bg-green-500/20 border-green-500/30'
                : 'bg-orange-500/20 border-orange-500/30'
            }`}
          >
            <div className="flex items-center space-x-3">
              {online ? (
                <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Wifi size={20} className="text-white" />
                </div>
              ) : (
                <div className="flex-shrink-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <WifiOff size={20} className="text-white" />
                </div>
              )}

              <div className="flex-1">
                <p className="font-medium">{toastMessage}</p>
              </div>

              <button
                onClick={() => setShowToast(false)}
                className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status indicator in bottom corner (optional) */}
      <div className="fixed bottom-4 right-4 z-40 opacity-50 hover:opacity-100 transition-opacity">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
            online
              ? 'bg-green-500 text-white'
              : 'bg-orange-500 text-white animate-pulse'
          }`}
          title={online ? 'Online' : 'Offline'}
        >
          {online ? <Cloud size={18} /> : <CloudOff size={18} />}
        </div>
      </div>
    </>
  );
};

export default OfflineIndicator;
