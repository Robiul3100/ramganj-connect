import { useState, useEffect } from "react";
import { Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AnnouncementBar = () => {
  const [text, setText] = useState("আসসালামু আলাইকুম — রামগঞ্জ সেবায় স্বাগতম!");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await (supabase.from as any)("announcements")
        .select("text")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (data) setText(data.text);
    };
    fetch();

    const ch = supabase.channel("announce_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, () => fetch())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return (
    <div className="px-4">
      <div className="announcement-bar">
        <span className="update-badge">
          <Zap className="w-3.5 h-3.5" />
          আপডেট
        </span>
        <p className="text-sm text-muted-foreground truncate">{text}</p>
      </div>
    </div>
  );
};

export default AnnouncementBar;
