import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Don't track admin pages
    if (location.pathname.startsWith("/admin")) return;

    const track = async () => {
      await (supabase.from as any)("page_views").insert({
        page_path: location.pathname,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent || null,
      });
    };
    track();
  }, [location.pathname]);
};

export default usePageTracking;
