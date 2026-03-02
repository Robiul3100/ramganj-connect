import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Bell, Send, RefreshCw, Trash2, Clock, ChevronDown, Megaphone } from "lucide-react";

interface AdminNotification {
  id: string;
  title: string;
  body: string;
  icon_name: string;
  created_at: string;
}

const AdminNotificationPanel = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data } = await (supabase.from as any)("admin_notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    setNotifications(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const sendNotification = async () => {
    if (!title.trim()) {
      toast({ title: "শিরোনাম দিন", variant: "destructive" });
      return;
    }
    setSending(true);
    const { error } = await (supabase.from as any)("admin_notifications").insert({
      title: title.trim(),
      body: body.trim(),
    });
    if (error) {
      toast({ title: "পাঠাতে ব্যর্থ হয়েছে", variant: "destructive" });
    } else {
      toast({ title: "✅ নোটিফিকেশন পাঠানো হয়েছে!" });
      setTitle("");
      setBody("");
      fetchNotifications();
    }
    setSending(false);
  };

  const deleteNotification = async (id: string) => {
    await (supabase.from as any)("admin_notifications").delete().eq("id", id);
    toast({ title: "মুছে ফেলা হয়েছে" });
    fetchNotifications();
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("bn-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-primary" /> পুশ নোটিফিকেশন
        </h2>
        <button
          onClick={fetchNotifications}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> রিফ্রেশ
        </button>
      </div>

      {/* Compose notification */}
      <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bell className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground">নোটিফিকেশন পাঠান</h3>
            <p className="text-[10px] text-muted-foreground">সকল ইউজারের কাছে পুশ নোটিফিকেশন যাবে</p>
          </div>
        </div>

        <input
          type="text"
          placeholder="নোটিফিকেশনের শিরোনাম *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
        />
        <textarea
          placeholder="বিস্তারিত বার্তা (ঐচ্ছিক)"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none min-h-[80px] focus:border-primary/40 focus:ring-2 focus:ring-primary/10 resize-none transition-all"
        />
        <button
          onClick={sendNotification}
          disabled={sending || !title.trim()}
          className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {sending ? "পাঠানো হচ্ছে..." : "নোটিফিকেশন পাঠান"}
        </button>
      </div>

      {/* History toggle */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="w-full flex items-center justify-between px-4 py-3 bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl text-sm font-medium text-foreground hover:bg-muted/30 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          পাঠানো নোটিফিকেশন ({notifications.length})
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showHistory ? "rotate-180" : ""}`} />
      </button>

      {/* History list */}
      {showHistory && (
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-6 text-muted-foreground text-sm">লোড হচ্ছে...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">কোনো নোটিফিকেশন পাঠানো হয়নি</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-4 flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-foreground">{n.title}</p>
                  {n.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                  <p className="text-[10px] text-muted-foreground/70 mt-1">{formatDate(n.created_at)}</p>
                </div>
                <button
                  onClick={() => deleteNotification(n.id)}
                  className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <div className="bg-muted/30 border border-border/50 rounded-2xl p-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          💡 <strong>টিপস:</strong> নোটিফিকেশন পাঠালে যেসব ইউজারের ব্রাউজার নোটিফিকেশন চালু আছে তারা সাথে সাথে দেখতে পাবে।
          রিয়েলটাইমে কাজ করে।
        </p>
      </div>
    </div>
  );
};

export default AdminNotificationPanel;
