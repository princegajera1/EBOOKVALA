import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Share, CheckCircle2 } from "lucide-react";

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Check if already running as standalone PWA
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true ||
      document.referrer.includes("android-app://");

    setIsStandalone(isStandaloneMode);

    // 2. Detect iOS Safari
    const ua = window.navigator.userAgent.toLowerCase();
    const isAppleIOS = /iphone|ipad|ipod/.test(ua) && !window.MSStream;
    setIsIOS(isAppleIOS);

    // 3. Check persistent dismissal flag in localStorage
    const isDismissed = localStorage.getItem("pwa_install_prompt_dismissed") === "true";

    if (!isStandaloneMode && !isDismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);

      // 4. Capture beforeinstallprompt event for Android / Chrome / Desktop
      const handleBeforeInstallPrompt = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        if (localStorage.getItem("pwa_install_prompt_dismissed") !== "true") {
          setShowPrompt(true);
        }
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }
  }, []);

  // Custom event trigger when user clicks "Install App" button in navbar/dock
  useEffect(() => {
    const handleTriggerInstall = () => {
      setShowPrompt(true);
      if (deferredPrompt) {
        deferredPrompt.prompt();
      }
    };
    window.addEventListener("trigger-pwa-install", handleTriggerInstall);
    return () => window.removeEventListener("trigger-pwa-install", handleTriggerInstall);
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    localStorage.setItem("pwa_install_prompt_dismissed", "true");
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log("[PWA Install] Choice outcome:", outcome);
      setDeferredPrompt(null);
      setShowPrompt(false);
    } else {
      setShowPrompt(false);
      const { toast } = await import("react-hot-toast");
      toast.success("To install: Tap your browser menu (⋮) and select 'Install app' or 'Add to Home Screen' 📲", {
        duration: 5000
      });
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa_install_prompt_dismissed", "true");
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className="fixed bottom-5 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 select-none"
      >
        <div className="bg-brand-card/95 backdrop-blur-xl border border-brand-border/80 rounded-2xl p-4 shadow-brand-hover flex flex-col gap-3 transition-colors duration-300">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-brand-accent/10 border border-brand-accent/25 flex items-center justify-center shrink-0">
                <img src="/pwa-192x192.png" alt="EBOOKVALA Logo" className="h-7 w-7 object-contain rounded-lg" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-display font-black text-brand-text flex items-center gap-1.5">
                  Install EBOOKVALA App
                  <span className="text-[9px] font-mono font-bold bg-brand-accent/15 text-brand-accent px-1.5 py-0.5 rounded-full border border-brand-accent/30">
                    PWA
                  </span>
                </h4>
                <p className="text-[11px] text-brand-text-secondary font-medium mt-0.5">
                  Fast native reading experience on mobile & desktop.
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-full text-brand-text-secondary hover:text-brand-text hover:bg-brand-bg-secondary transition-colors cursor-pointer shrink-0"
              title="Dismiss"
              aria-label="Dismiss PWA install prompt"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Benefits */}
          <div className="flex items-center justify-between text-[10px] font-semibold text-brand-text-secondary bg-brand-bg-secondary/70 p-2.5 rounded-xl border border-brand-border/60">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
              <span>Offline Reading</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-brand-accent shrink-0" />
              <span>Full Screen</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-purple-400 shrink-0" />
              <span>0 MB Download</span>
            </div>
          </div>

          {/* Actions */}
          {isIOS ? (
            <div className="bg-brand-accent/10 border border-brand-accent/30 rounded-xl p-2.5 text-xs text-brand-text font-medium flex items-center gap-2 text-left">
              <Share className="h-4 w-4 text-brand-accent shrink-0 animate-bounce" />
              <span>
                To install on iPhone: Tap <strong>Share</strong> 📤 then select <strong>'Add to Home Screen' ➕</strong>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={handleInstallClick}
                className="flex-1 h-9.5 bg-brand-accent hover:bg-brand-accent/90 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <Download className="h-3.5 w-3.5" /> Install App Now
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 h-9.5 bg-brand-bg-secondary hover:bg-brand-bg-secondary/80 text-brand-text-secondary hover:text-brand-text text-xs font-bold rounded-xl border border-brand-border/60 transition-colors cursor-pointer"
              >
                Later
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;
