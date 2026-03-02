import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { isFirebaseConfigured } from "@/lib/firebase";
import { usePushNotifications } from "@/hooks/usePushNotifications";

/**
 * Listens for admin_notifications via Supabase Realtime
 * and shows browser Notification when enabled.
 * Also auto-subscribes to FCM when notifications are enabled.
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

  // Realtime fallback for browser notifications (works even without FCM)
  useEffect(() => {
    const channel = supabase
      .channel("user_notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "admin_notifications" },
        (payload: any) => {
          if (!enabledRef.current) return;
          const { title, body, is_draft } = payload.new || {};
          if (!title || is_draft) return;

          // Show browser notification as fallback (FCM handles its own)
          if ("Notification" in window && Notification.permission === "granted") {
            // Avoid duplicate if FCM already showed it - use a simple dedup
            const key = `notif_${payload.new.id}`;
            if (sessionStorage.getItem(key)) return;
            sessionStorage.setItem(key, "1");

            new Notification(title, {
              body: body || "",
              icon: "/favicon.ico",
              badge: "/favicon.ico",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
};

export default NotificationListener;
