import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { isFirebaseConfigured } from "@/lib/firebase";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { toast } from "sonner";

/**
 * Listens for admin_notifications via Supabase Realtime
 * and shows browser Notification when enabled.
 * Also auto-subscribes to FCM and handles foreground messages.
 */

// Use a small wrapper around storage so dedup works across multiple tabs.
// Falls back to in-memory if storage is unavailable (private mode).
const DEDUP_KEY_PREFIX = "notif_dedup_";
const DEDUP_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const markSeen = (id: string): boolean => {
  try {
    const raw = localStorage.getItem(DEDUP_KEY_PREFIX + id);
    if (raw) {
      const ts = Number(raw);
      if (Number.isFinite(ts) && Date.now() - ts < DEDUP_TTL_MS) return true;
    }
    localStorage.setItem(DEDUP_KEY_PREFIX + id, String(Date.now()));
    return false;
  } catch {
    // Storage unavailable - allow notification (no dedup)
    return false;
  }
};

const NotificationListener = () => {
  const { prefs } = useUserPreferences();
  const enabledRef = useRef(prefs.notificationsEnabled);
  const { subscribe, isSubscribed } = usePushNotifications();

  useEffect(() => {
    enabledRef.current = prefs.notificationsEnabled;
  }, [prefs.notificationsEnabled]);

  // Auto-subscribe to FCM when notifications enabled and Firebase is configured
  useEffect(() => {
    if (prefs.notificationsEnabled && !isSubscribed && isFirebaseConfigured()) {
      subscribe();
    }
  }, [prefs.notificationsEnabled, isSubscribed, subscribe]);

  // Listen for FCM foreground messages - show in-app toast
  useEffect(() => {
    if (!isFirebaseConfigured()) return;

    let unsubscribe: (() => void) | null = null;

    const setupForegroundListener = async () => {
      try {
        const { initializeApp, getApps } = await import("firebase/app");
        const { getMessaging: getMsg, onMessage, isSupported } = await import("firebase/messaging");
        const { firebaseConfig } = await import("@/lib/firebase");

        const supported = await isSupported();
        if (!supported) return;

        const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
        const messaging = getMsg(app);

        unsubscribe = onMessage(messaging, (payload) => {
          if (!enabledRef.current) return;

          const title = payload.notification?.title || "নতুন নোটিফিকেশন";
          const body = payload.notification?.body || "";

          // Dedup across tabs via localStorage
          const notifId = payload.data?.notification_id;
          if (notifId && markSeen(notifId)) return;

          toast(title, {
            description: body,
            duration: 6000,
            action: {
              label: "দেখুন",
              onClick: () => {
                window.location.href = "/notifications";
              },
            },
          });
        });
      } catch (err) {
        console.warn("Foreground FCM listener failed:", err);
      }
    };

    setupForegroundListener();
    return () => { unsubscribe?.(); };
  }, []);

  // Realtime fallback - in-app toast + browser notification
  useEffect(() => {
    const channel = supabase
      .channel("user_notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "admin_notifications" },
        (payload: any) => {
          if (!enabledRef.current) return;
          const { title, body, is_draft, id } = payload.new || {};
          if (!title || is_draft) return;
          if (!id || markSeen(id)) return;

          // In-app toast - clicking "দেখুন" goes to notifications page
          toast(title, {
            description: body || "",
            duration: 6000,
            action: {
              label: "দেখুন",
              onClick: () => {
                window.location.href = "/notifications";
              },
            },
          });

          // Browser notification (background tab)
          if ("Notification" in window && Notification.permission === "granted" && document.hidden) {
            new Notification(title, {
              body: body || "",
              icon: "/favicon.ico",
            });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return null;
};

export default NotificationListener;