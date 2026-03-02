import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DynamicSiteSettings {
  app_title: string;
  app_description: string;
  og_image: string;
  pwa_icon: string;
  app_short_name: string;
  app_theme_color: string;
}

/**
 * Fetches site settings and applies them to document head dynamically.
 * Must be used inside the app root.
 */
const useDynamicMeta = () => {
  const [settings, setSettings] = useState<Partial<DynamicSiteSettings>>({});

  useEffect(() => {
    const keys = ["app_title", "app_description", "og_image", "pwa_icon", "app_short_name", "app_theme_color"];

    const fetch = async () => {
      const { data } = await (supabase.from as any)("site_settings")
        .select("key, value")
        .in("key", keys);
      if (!data) return;

      const map: Record<string, string> = {};
      (data as { key: string; value: string }[]).forEach((s) => {
        if (s.value) map[s.key] = s.value;
      });
      setSettings(map);

      // Apply to document head
      if (map.app_title) {
        document.title = map.app_title;
        updateMeta("og:title", map.app_title);
        updateMeta("twitter:title", map.app_title);
      }

      if (map.app_description) {
        updateMeta("description", map.app_description, "name");
        updateMeta("og:description", map.app_description);
        updateMeta("twitter:description", map.app_description);
      }

      if (map.og_image) {
        updateMeta("og:image", map.og_image);
        updateMeta("twitter:image", map.og_image);
      }

      if (map.app_theme_color) {
        updateMeta("theme-color", map.app_theme_color, "name");
      }
    };

    fetch();
  }, []);

  return settings;
};

function updateMeta(key: string, value: string, attr: "property" | "name" = "property") {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = value;
}

export default useDynamicMeta;
