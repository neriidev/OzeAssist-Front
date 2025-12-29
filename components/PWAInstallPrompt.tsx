import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Salvar no localStorage para não mostrar novamente por um tempo
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Verificar se foi dispensado recentemente (24 horas)
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) {
        setShowPrompt(false);
      }
    }
  }, []);

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-4 flex items-start gap-3">
        <div className="flex-1">
          <h3 className="font-bold text-slate-900 text-sm mb-1">
            Instalar OzeAssist
          </h3>
          <p className="text-xs text-slate-600 mb-3">
            Instale o app para acesso rápido e uso offline
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="flex-1 bg-teal-600 text-white text-xs font-semibold py-2 px-3 rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-1"
            >
              <Download className="w-3 h-3" />
              Instalar
            </button>
            <button
              onClick={handleDismiss}
              className="text-xs text-slate-500 hover:text-slate-700 py-2 px-3"
            >
              Agora não
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;

