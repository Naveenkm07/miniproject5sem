import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { promptInstall, isStandalone } from '../utils/pwa';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Don't show if already installed
    if (isStandalone()) {
      return;
    }

    // Check if user previously dismissed the prompt
    const dismissed = localStorage.getItem('install-prompt-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      
      // Don't show again for 7 days after dismissal
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after 30 seconds or on second visit
      const visitCount = parseInt(localStorage.getItem('visit-count') || '0', 10);
      localStorage.setItem('visit-count', (visitCount + 1).toString());

      if (visitCount >= 1) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 30000); // 30 seconds
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    const installed = await promptInstall(deferredPrompt);
    
    if (installed) {
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.removeItem('install-prompt-dismissed');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('install-prompt-dismissed', new Date().toISOString());
  };

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <div className="glass-card rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Dismiss"
        >
          <X size={18} className="text-gray-400" />
        </button>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Smartphone size={24} className="text-white" />
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">
                Install Memoria Vault
              </h3>
              <p className="text-sm opacity-70 mb-4">
                Install our app for quick access, offline support, and a better experience!
              </p>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleInstall}
                  className="flex-1 btn-primary flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all hover:scale-105"
                >
                  <Download size={18} />
                  <span>Install Now</span>
                </button>
                
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2.5 rounded-xl font-medium opacity-70 hover:opacity-100 hover:bg-white/5 transition-all"
                >
                  Not Now
                </button>
              </div>

              {/* Features */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="text-center">
                    <div className="font-semibold mb-1">⚡ Fast</div>
                    <div className="opacity-60">Quick Access</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold mb-1">📴 Offline</div>
                    <div className="opacity-60">Works Offline</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold mb-1">🔔 Alerts</div>
                    <div className="opacity-60">Notifications</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
