import { useState, useEffect } from "react";
import { Bell, Calendar, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";

interface Notification {
  id: string;
  title: string;
  body: string;
  image_url: string | null;
  redirect_url: string | null;
  icon_name: string | null;
  status: string;
  created_at: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data } = await (supabase.from as any)("admin_notifications")
      .select("id, title, body, image_url, redirect_url, icon_name, status, created_at")
      .eq("is_draft", false)
      .in("status", ["sent", "pending"])
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel("notifications_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "admin_notifications" },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto pb-20">
      <PageHeader title="নোটিফিকেশন" color="linear-gradient(135deg, hsl(40,80%,50%), hsl(25,85%,55%))" />

      <div className="px-4 -mt-2 space-y-3">
        {loading && notifications.length === 0 && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-foreground text-lg">কোনো নোটিফিকেশন নেই</h3>
            <p className="text-sm text-muted-foreground mt-1">নতুন আপডেট আসলে এখানে দেখাবে।</p>
          </div>
        )}

        {notifications.map((n) => (
          <div
            key={n.id}
            className="glass-card p-4 flex items-start gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => {
              if (n.redirect_url) window.location.href = n.redirect_url;
            }}
          >
            {n.image_url ? (
              <img
                src={n.image_url}
                alt=""
                className="w-12 h-12 rounded-xl object-cover shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-5 h-5 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground leading-snug">{n.title}</p>
              {n.body && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.body}</p>
              )}
              <div className="flex items-center gap-2 mt-1.5">
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(n.created_at).toLocaleDateString("bn-BD", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                {n.redirect_url && (
                  <ExternalLink className="w-3 h-3 text-primary" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default Notifications;
