import { useEffect, useRef } from "react";
import { toast } from "sonner";

/**
 * Shows toast when the browser goes offline / comes back online.
 */
const useNetworkStatus = () => {
  const wasOffline = useRef(false);

  useEffect(() => {
    const onOffline = () => {
      wasOffline.current = true;
      toast.warning("আপনি অফলাইনে আছেন", {
        description: "ইন্টারনেট সংযোগ বিচ্ছিন্ন হয়েছে",
        duration: Infinity,
        id: "network-status",
      });
    };

    const onOnline = () => {
      if (wasOffline.current) {
        wasOffline.current = false;
        toast.success("অনলাইনে ফিরে এসেছেন! 🎉", {
          description: "ইন্টারনেট সংযোগ পুনরায় স্থাপিত হয়েছে",
          duration: 4000,
          id: "network-status",
        });
      }
    };

    // Check initial state
    if (!navigator.onLine) onOffline();

    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, []);
};

export default useNetworkStatus;
