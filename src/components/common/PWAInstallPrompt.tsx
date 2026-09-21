'use client';

import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import logoImg from '@/assets/logo.png';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user previously dismissed
    const isDismissed = localStorage.getItem('nivicouture_pwa_dismissed');
    if (isDismissed) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
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
    setDismissed(true);
    localStorage.setItem('nivicouture_pwa_dismissed', 'true');
  };

  if (!showPrompt || dismissed) return null;

  return (
    <div className="fixed top-16 left-4 right-4 z-50 max-w-md mx-auto bg-[#062E28]/95 backdrop-blur-md text-white rounded-2xl p-3.5 shadow-2xl border border-[#D4AF37]/30 flex items-center justify-between gap-3 animate-fadeIn">
      <div className="flex items-center gap-3">
        <img
          src={typeof logoImg === 'string' ? logoImg : (logoImg as any)?.src || '/logo.png'}
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== '/logo.png') {
              target.src = '/logo.png';
            }
          }}
          alt="NiVi Couture"
          className="w-10 h-10 rounded-full object-cover shrink-0 shadow-md border border-[#D4AF37]"
        />
        <div className="flex flex-col">
          <span className="text-xs font-bold leading-tight flex items-center gap-1 text-[#D4AF37]">
            Install NiVi Couture App
          </span>
          <span className="text-[10px] text-stone-200 leading-tight">
            Add to home screen for VIP designer bridal & festive couture
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleInstallClick}
          className="bg-[#D4AF37] hover:bg-[#c49f2c] text-[#062E28] px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 transition"
        >
          <Download className="w-3 h-3" />
          <span>Install</span>
        </button>
        <button
          onClick={handleDismiss}
          className="p-1 text-stone-300 hover:text-white rounded-full"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
