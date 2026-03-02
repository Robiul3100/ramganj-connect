import { useState, useEffect, useCallback } from "react";
import { X, Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const STORAGE_KEY = "pwa_install_state";
const SKIP_COOLDOWN_DAYS = 3;

interface InstallState {
  installed: boolean;
  skippedAt: string | null;
  skipCount: number;
}

const getState = (): InstallState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { installed: false, skippedAt: null, skipCount: 0 };
  } catch {
    return { installed: false, skippedAt: null, skipCount: 0 };
  }
};

const saveState = (s: InstallState) => localStorage.setItem(STORAGE_KEY, JSON.stringify(s));

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const state = getState();
    if (state.installed) return;

    // Check skip cooldown
    if (state.skippedAt) {
      const diff = Date.now() - new Date(state.skippedAt).getTime();
      if (diff < SKIP_COOLDOWN_DAYS * 86400000) return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Delay to not overwhelm user on first load
      setTimeout(() => setVisible(true), 4000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Check if already installed (standalone)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      saveState({ ...state, installed: true });
      return;
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      saveState({ installed: true, skippedAt: null, skipCount: 0 });
      toast.success("অ্যাপ ইনস্টল হচ্ছে! 🎉");
    }
    setDeferredPrompt(null);
    setVisible(false);
  }, [deferredPrompt]);

  const handleSkip = useCallback(() => {
    const state = getState();
    saveState({ ...state, skippedAt: new Date().toISOString(), skipCount: state.skipCount + 1 });
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-20 z-[60] flex justify-center px-4 animate-in slide-in-from-bottom-8 duration-500">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Smartphone className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm leading-tight">
              রামগঞ্জ সিটি অ্যাপ ইনস্টল করুন
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
              হোম স্ক্রিনে যোগ করুন — অফলাইনেও ব্যবহার করুন
            </p>
          </div>
          <button
            onClick={handleSkip}
            className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted transition-colors"
            aria-label="বন্ধ করুন"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={handleSkip}>
            পরে
          </Button>
          <Button size="sm" className="flex-1 gap-1.5 text-xs" onClick={handleInstall}>
            <Download className="h-3.5 w-3.5" />
            ইনস্টল করুন
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
