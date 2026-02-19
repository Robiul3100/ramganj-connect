import { useState, useEffect } from "react";
import { Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AnnouncementBar = () => {
  const [text, setText] = useState("আসসালামু আলাইকুম — রামগঞ্জ সেবায় স্বাগতম!");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      // Fetch enabled setting
      const { data: setting } = await (supabase.from as any)("site_settings")
        .select("value")
        .eq("key", "announcement_bar_enabled")
        .single();
      setEnabled(setting?.value === "true");

      // Fetch latest announcement text
      const { data } = await (supabase.from as any)("announcements")
        .select("text")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (data) setText(data.text);
    };
    fetchAll();

    // Realtime for announcements
    const ch1 = supabase.channel("announce_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, fetchAll)
      .subscribe();

    // Realtime for settings
    const ch2 = supabase.channel("settings_announce_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "site_settings" }, fetchAll)
      .subscribe();

    return () => {
      supabase.removeChannel(ch1);
      supabase.removeChannel(ch2);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className="px-4">
      <div className="announcement-bar overflow-hidden">
        <span className="update-badge shrink-0">
          <Zap className="w-3.5 h-3.5" />
          আপডেট
        </span>
        <div className="overflow-hidden flex-1 min-w-0">
          <p className="text-sm text-muted-foreground whitespace-nowrap marquee-text">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
