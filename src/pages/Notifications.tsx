import { useState, useEffect, useCallback } from "react";
import { Bell, Calendar, ExternalLink, CheckCheck } from "lucide-react";
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

const READ_KEY = "read_notifications";

const getReadIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(READ_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
};

const saveReadIds = (ids: Set<string>) => {
  const arr = Array.from(ids).slice(-200);
  localStorage.setItem(READ_KEY, JSON.stringify(arr));
};

const NotificationSkeleton = () => (
  <div className="glass-card p-4 flex items-start gap-3">
    <div className="w-10 h-10 rounded-full skeleton-shimmer shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-4/5 rounded-md skeleton-shimmer" />
      <div className="h-3 w-full rounded skeleton-shimmer" />
      <div className="h-3 w-2/3 rounded skeleton-shimmer" />
      <div className="h-2.5 w-32 rounded skeleton-shimmer mt-1" />
    </div>
  </div>
);

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState<Set<string>>(getReadIds);

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
      .on("postgres_changes", { event: "*", schema: "public", table: "admin_notifications" }, () => fetchNotifications())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveReadIds(next);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setReadIds((prev) => {
      const next = new Set(prev);
      notifications.forEach((n) => next.add(n.id));
      saveReadIds(next);
      return next;
    });
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  const handleClick = (n: Notification) => {
    markAsRead(n.id);
    if (n.redirect_url) {
      window.location.href = n.redirect_url;
    }
  };

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto pb-20">
      <PageHeader title="নোটিফিকেশন" color="linear-gradient(135deg, hsl(40,80%,50%), hsl(25,85%,55%))" />

      {notifications.length > 0 && (
        <div className="px-4 flex items-center justify-between mb-2">
          <p className="text-xs text-muted-foreground">
            {unreadCount > 0 ? (
              <span className="inline-flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
                {unreadCount}টি অপঠিত
              </span>
            ) : (
              <span className="flex items-center gap-1 text-muted-foreground">
                <CheckCheck className="w-3.5 h-3.5" />
                সব পড়া হয়েছে
              </span>
            )}
          </p>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="text-xs text-primary font-medium hover:underline">
              সব পঠিত করুন
            </button>
          )}
        </div>
      )}

      <div className="px-4 -mt-0 space-y-3">
        {loading && notifications.length === 0 && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <NotificationSkeleton key={i} />)}
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

        {notifications.map((n) => {
          const isRead = readIds.has(n.id);
          return (
            <div
              key={n.id}
              className={`glass-card p-4 flex items-start gap-3 cursor-pointer transition-all duration-200 ${
                isRead ? "opacity-70 hover:opacity-90" : "border-l-[3px] border-l-primary shadow-sm hover:shadow-md"
              }`}
              onClick={() => handleClick(n)}
            >
              {n.image_url ? (
                <img src={n.image_url} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
              ) : (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isRead ? "bg-muted" : "bg-primary/10"}`}>
                  <Bell className={`w-5 h-5 ${isRead ? "text-muted-foreground" : "text-primary"}`} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-1.5">
                  <p className={`text-sm leading-snug flex-1 ${isRead ? "font-medium text-muted-foreground" : "font-bold text-foreground"}`}>
                    {n.title}
                  </p>
                  {!isRead && <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-1.5" />}
                </div>
                {n.body && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.body}</p>}
                <div className="flex items-center gap-2 mt-1.5">
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(n.created_at).toLocaleDateString("bn-BD", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                  {n.redirect_url && <ExternalLink className="w-3 h-3 text-primary" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
};

export default Notifications;
