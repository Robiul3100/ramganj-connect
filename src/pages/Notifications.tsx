import { useState, useEffect } from "react";
import { Bell, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";

interface Announcement {
  id: string;
  text: string;
  created_at: string;
}

const Notifications = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("announcements").select("*").eq("is_active", true).order("created_at", { ascending: false });
      if (data) setAnnouncements(data);
    };
    fetch();
    const ch = supabase.channel("notif_rt").on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, () => fetch()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto pb-20">
      <PageHeader title="নোটিফিকেশন" color="linear-gradient(135deg, hsl(40,80%,50%), hsl(25,85%,55%))" />

      <div className="px-4 -mt-2 space-y-3">
        {announcements.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-foreground text-lg">কোনো নোটিফিকেশন নেই</h3>
            <p className="text-sm text-muted-foreground mt-1">নতুন আপডেট আসলে এখানে দেখাবে।</p>
          </div>
        )}

        {announcements.map((a) => (
          <div key={a.id} className="glass-card p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{a.text}</p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(a.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default Notifications;
