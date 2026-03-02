import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserPreferences } from "@/hooks/useUserPreferences";

/**
 * Listens for admin_notifications via Supabase Realtime
 * and shows browser Notification when enabled.
 */
const NotificationListener = () => {
  const { prefs } = useUserPreferences();
  const enabledRef = useRef(prefs.notificationsEnabled);

  useEffect(() => {
    enabledRef.current = prefs.notificationsEnabled;
  }, [prefs.notificationsEnabled]);

  useEffect(() => {
    const channel = supabase
      .channel("user_notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "admin_notifications" },
        (payload: any) => {
          if (!enabledRef.current) return;
          const { title, body } = payload.new || {};
          if (!title) return;

          // Show browser notification
          if ("Notification" in window && Notification.permission === "granted") {
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
