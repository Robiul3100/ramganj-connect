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

  // Listen for FCM foreground messages → show in-app toast
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
          const redirectUrl = payload.data?.redirect_url;

          // Dedup with realtime channel
          const notifId = payload.data?.notification_id;
          if (notifId) {
            const key = `notif_${notifId}`;
            if (sessionStorage.getItem(key)) return;
            sessionStorage.setItem(key, "1");
          }

          toast(title, {
            description: body,
            duration: 6000,
            action: redirectUrl
              ? { label: "দেখুন", onClick: () => window.location.assign(redirectUrl) }
              : undefined,
          });
        });
      } catch (err) {
        console.warn("Foreground FCM listener failed:", err);
      }
    };

    setupForegroundListener();
    return () => { unsubscribe?.(); };
  }, []);

  // Realtime fallback → in-app toast + browser notification
  useEffect(() => {
    const channel = supabase
      .channel("user_notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "admin_notifications" },
        (payload: any) => {
          if (!enabledRef.current) return;
          const { title, body, is_draft, redirect_url } = payload.new || {};
          if (!title || is_draft) return;

          const key = `notif_${payload.new.id}`;
          if (sessionStorage.getItem(key)) return;
          sessionStorage.setItem(key, "1");

          // In-app toast
          toast(title, {
            description: body || "",
            duration: 6000,
            action: redirect_url
              ? { label: "দেখুন", onClick: () => window.location.assign(redirect_url) }
              : undefined,
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
