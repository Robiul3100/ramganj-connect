import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { firebaseConfig, VAPID_KEY, isFirebaseConfigured } from "@/lib/firebase";

let messagingInstance: any = null;

/**
 * Dynamically load Firebase SDK and get messaging instance.
 * We lazy-load to avoid bundling Firebase when not configured.
 */
const getMessaging = async () => {
  if (messagingInstance) return messagingInstance;
  if (!isFirebaseConfigured()) return null;

  const { initializeApp, getApps } = await import("firebase/app");
  const { getMessaging: getMsg, isSupported } = await import("firebase/messaging");

  const supported = await isSupported();
  if (!supported) return null;

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  messagingInstance = getMsg(app);

  // Send config to service worker
  if ("serviceWorker" in navigator) {
    const reg = await navigator.serviceWorker.ready;
    reg.active?.postMessage({
      type: "FIREBASE_CONFIG",
      config: firebaseConfig,
    });
  }

  return messagingInstance;
};

export const usePushNotifications = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    // Check if already subscribed (token in localStorage)
    const stored = localStorage.getItem("fcm_token");
    if (stored) {
      setToken(stored);
      setIsSubscribed(true);
    }

    // Check support
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setSupported(false);
    }
    if (!isFirebaseConfigured()) {
      setSupported(false);
    }
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isFirebaseConfigured()) {
      console.warn("Firebase not configured");
      return false;
    }

    setLoading(true);
    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setLoading(false);
        return false;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );

      const messaging = await getMessaging();
      if (!messaging) {
        setLoading(false);
        return false;
      }

      const { getToken } = await import("firebase/messaging");
      const fcmToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      if (!fcmToken) {
        setLoading(false);
        return false;
      }

      // Store token in database
      await (supabase.from as any)("push_subscriptions").upsert(
        {
          fcm_token: fcmToken,
          endpoint: "fcm",
          user_agent: navigator.userAgent,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "fcm_token" }
      );

      localStorage.setItem("fcm_token", fcmToken);
      setToken(fcmToken);
      setIsSubscribed(true);
      setLoading(false);
      return true;
    } catch (err) {
      console.error("Push subscription failed:", err);
      setLoading(false);
      return false;
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    const stored = localStorage.getItem("fcm_token");
    if (stored) {
      await (supabase.from as any)("push_subscriptions")
        .update({ is_active: false })
        .eq("fcm_token", stored);
      localStorage.removeItem("fcm_token");
    }
    setToken(null);
    setIsSubscribed(false);
  }, []);

  return { token, isSubscribed, loading, supported, subscribe, unsubscribe };
};
