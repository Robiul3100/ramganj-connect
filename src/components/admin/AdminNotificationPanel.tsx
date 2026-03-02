import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Bell, Send, RefreshCw, Trash2, Clock, ChevronDown, Megaphone,
  Image as ImageIcon, Link, Users, MapPin, Tag, User, Save,
  Edit3, X, CheckCircle, AlertTriangle, Loader2, Eye, Calendar,
} from "lucide-react";
import { isFirebaseConfigured } from "@/lib/firebase";

interface AdminNotification {
  id: string;
  title: string;
  body: string;
  icon_name: string;
  image_url: string | null;
  redirect_url: string | null;
  target_type: string;
  target_value: string | null;
  status: string;
  scheduled_at: string | null;
  is_draft: boolean;
  sent_count: number;
  failed_count: number;
  created_at: string;
}

const targetOptions = [
  { value: "all", label: "সকল ইউজার", icon: Users },
  { value: "area", label: "নির্দিষ্ট এলাকা", icon: MapPin },
  { value: "category", label: "ক্যাটাগরি সাবস্ক্রাইবার", icon: Tag },
  { value: "individual", label: "নির্দিষ্ট ইউজার", icon: User },
];

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle; color: string }> = {
  sent: { label: "প্রেরিত", icon: CheckCircle, color: "text-emerald-500 bg-emerald-500/10" },
  pending: { label: "অপেক্ষমান", icon: Clock, color: "text-amber-500 bg-amber-500/10" },
  failed: { label: "ব্যর্থ", icon: AlertTriangle, color: "text-red-500 bg-red-500/10" },
  draft: { label: "ড্রাফট", icon: Edit3, color: "text-blue-500 bg-blue-500/10" },
  scheduled: { label: "নির্ধারিত", icon: Calendar, color: "text-purple-500 bg-purple-500/10" },
};

const AdminNotificationPanel = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [targetType, setTargetType] = useState("all");
  const [targetValue, setTargetValue] = useState("");
  const [scheduleType, setScheduleType] = useState<"instant" | "scheduled">("instant");
  const [scheduledAt, setScheduledAt] = useState("");

  const [filterStatus, setFilterStatus] = useState("all");

  const firebaseReady = isFirebaseConfigured();

  const fetchNotifications = async () => {
    setLoading(true);
    const { data } = await (supabase.from as any)("admin_notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setNotifications(data || []);
    setLoading(false);
  };

  const fetchSubscriberCount = async () => {
    const { count } = await (supabase.from as any)("push_subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);
    setSubscriberCount(count || 0);
  };

  useEffect(() => {
    fetchNotifications();
    fetchSubscriberCount();
  }, []);

  const resetForm = () => {
    setTitle(""); setBody(""); setImageUrl(""); setRedirectUrl("");
    setTargetType("all"); setTargetValue(""); setScheduleType("instant");
    setScheduledAt(""); setEditingId(null);
  };

  const saveDraft = async () => {
    if (!title.trim()) {
      toast({ title: "শিরোনাম দিন", variant: "destructive" });
      return;
    }
    const payload: any = {
      title: title.trim(),
      body: body.trim(),
      image_url: imageUrl.trim() || null,
      redirect_url: redirectUrl.trim() || null,
      target_type: targetType,
      target_value: targetValue.trim() || null,
      is_draft: true,
      status: "draft",
      scheduled_at: scheduleType === "scheduled" && scheduledAt ? scheduledAt : null,
    };

    if (editingId) {
      await (supabase.from as any)("admin_notifications").update(payload).eq("id", editingId);
      toast({ title: "✅ ড্রাফট আপডেট হয়েছে" });
    } else {
      await (supabase.from as any)("admin_notifications").insert(payload);
      toast({ title: "✅ ড্রাফট সংরক্ষিত হয়েছে" });
    }
    resetForm();
    fetchNotifications();
  };

  const sendNotification = async (notificationId?: string) => {
    if (!title.trim() && !notificationId) {
      toast({ title: "শিরোনাম দিন", variant: "destructive" });
      return;
    }

    setSending(true);

    try {
      let nId = notificationId;

      if (!nId) {
        // Create notification record first
        const payload: any = {
          title: title.trim(),
          body: body.trim(),
          image_url: imageUrl.trim() || null,
          redirect_url: redirectUrl.trim() || null,
          target_type: targetType,
          target_value: targetValue.trim() || null,
          is_draft: false,
          status: scheduleType === "scheduled" ? "scheduled" : "pending",
          scheduled_at: scheduleType === "scheduled" && scheduledAt ? scheduledAt : null,
        };

        if (editingId) {
          await (supabase.from as any)("admin_notifications").update(payload).eq("id", editingId);
          nId = editingId;
        } else {
          const { data } = await (supabase.from as any)("admin_notifications").insert(payload).select("id").single();
          nId = data?.id;
        }
      }

      if (scheduleType === "scheduled") {
        toast({ title: "⏰ নোটিফিকেশন নির্ধারিত সময়ে পাঠানো হবে" });
        resetForm();
        fetchNotifications();
        setSending(false);
        return;
      }

      // Get the notification data for sending
      const { data: notifData } = await (supabase.from as any)("admin_notifications")
        .select("*")
        .eq("id", nId)
        .single();

      if (!notifData) throw new Error("Notification not found");

      // Call edge function to send via FCM
      const { data: result, error } = await supabase.functions.invoke("send-push-notification", {
        body: {
          notification_id: nId,
          title: notifData.title,
          body: notifData.body,
          image_url: notifData.image_url,
          redirect_url: notifData.redirect_url,
          target_type: notifData.target_type,
          target_value: notifData.target_value,
        },
      });

      if (error) throw error;

      toast({
        title: `✅ নোটিফিকেশন পাঠানো হয়েছে!`,
        description: `${result?.sent || 0} জনকে পাঠানো হয়েছে${result?.failed ? `, ${result.failed} জন ব্যর্থ` : ""}`,
      });

      resetForm();
      fetchNotifications();
    } catch (err: any) {
      console.error("Send notification error:", err);
      toast({
        title: "পাঠাতে ব্যর্থ হয়েছে",
        description: err.message || "কিছু একটা সমস্যা হয়েছে",
        variant: "destructive",
      });
    }

    setSending(false);
  };

  const editNotification = (n: AdminNotification) => {
    setTitle(n.title);
    setBody(n.body);
    setImageUrl(n.image_url || "");
    setRedirectUrl(n.redirect_url || "");
    setTargetType(n.target_type);
    setTargetValue(n.target_value || "");
    setScheduledAt(n.scheduled_at || "");
    setScheduleType(n.scheduled_at ? "scheduled" : "instant");
    setEditingId(n.id);
    setShowHistory(false);
  };

  const deleteNotification = async (id: string) => {
    await (supabase.from as any)("admin_notifications").delete().eq("id", id);
    toast({ title: "মুছে ফেলা হয়েছে" });
    if (editingId === id) resetForm();
    fetchNotifications();
  };

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString("bn-BD", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const filteredNotifications = filterStatus === "all"
    ? notifications
    : notifications.filter((n) =>
      filterStatus === "draft" ? n.is_draft : n.status === filterStatus
    );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-primary" /> পুশ নোটিফিকেশন এডিটর
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            👥 {subscriberCount} সাবস্ক্রাইবার
          </span>
          <button
            onClick={() => { fetchNotifications(); fetchSubscriberCount(); }}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> রিফ্রেশ
          </button>
        </div>
      </div>

      {/* Firebase config warning */}
      {!firebaseReady && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-foreground">Firebase কনফিগার করা হয়নি</p>
            <p className="text-xs text-muted-foreground mt-1">
              <code className="bg-muted px-1 py-0.5 rounded text-[10px]">src/lib/firebase.ts</code> ফাইলে আপনার Firebase প্রজেক্টের কনফিগ কী বসান।
              এবং Lovable Cloud সিক্রেটে <code className="bg-muted px-1 py-0.5 rounded text-[10px]">FCM_SERVER_KEY</code> যোগ করুন।
            </p>
          </div>
        </div>
      )}

      {/* Compose notification */}
      <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">
                {editingId ? "নোটিফিকেশন সম্পাদনা" : "নোটিফিকেশন কম্পোজ করুন"}
              </h3>
              <p className="text-[10px] text-muted-foreground">FCM দিয়ে সকল ডিভাইসে পাঠান</p>
            </div>
          </div>
          {editingId && (
            <button onClick={resetForm} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <X className="w-3.5 h-3.5" /> বাতিল
            </button>
          )}
        </div>

        {/* Title */}
        <input
          type="text"
          placeholder="নোটিফিকেশনের শিরোনাম *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
        />

        {/* Body */}
        <textarea
          placeholder="বিস্তারিত বার্তা (ঐচ্ছিক)"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none min-h-[80px] focus:border-primary/40 focus:ring-2 focus:ring-primary/10 resize-none transition-all"
        />

        {/* Image URL */}
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="url"
            placeholder="ইমেজ URL (ঐচ্ছিক)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="flex-1 bg-muted/50 rounded-xl px-4 py-2.5 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>

        {/* Redirect URL */}
        <div className="flex items-center gap-2">
          <Link className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="রিডাইরেক্ট URL বা পেজ পাথ (ঐচ্ছিক — যেমন /news)"
            value={redirectUrl}
            onChange={(e) => setRedirectUrl(e.target.value)}
            className="flex-1 bg-muted/50 rounded-xl px-4 py-2.5 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>

        {/* Target Type */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">টার্গেট অডিয়েন্স</p>
          <div className="grid grid-cols-2 gap-2">
            {targetOptions.map((opt) => {
              const active = targetType === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setTargetType(opt.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 bg-card/60 text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  <opt.icon className="w-3.5 h-3.5" />
                  {opt.label}
                </button>
              );
            })}
          </div>
          {(targetType === "area" || targetType === "category" || targetType === "individual") && (
            <input
              type="text"
              placeholder={
                targetType === "area" ? "এলাকার নাম লিখুন" :
                targetType === "category" ? "ক্যাটাগরি নাম লিখুন" :
                "ইউজার আইডি লিখুন"
              }
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              className="w-full bg-muted/50 rounded-xl px-4 py-2.5 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 mt-2 transition-all"
            />
          )}
        </div>

        {/* Schedule */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">প্রেরণের সময়</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setScheduleType("instant")}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                scheduleType === "instant"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/50 bg-card/60 text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <Send className="w-3.5 h-3.5" /> এখনই পাঠান
            </button>
            <button
              onClick={() => setScheduleType("scheduled")}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                scheduleType === "scheduled"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/50 bg-card/60 text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" /> নির্ধারিত সময়ে
            </button>
          </div>
          {scheduleType === "scheduled" && (
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full bg-muted/50 rounded-xl px-4 py-2.5 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 mt-2 transition-all"
            />
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={saveDraft}
            disabled={sending || !title.trim()}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold flex items-center justify-center gap-2 hover:bg-muted/50 transition-all disabled:opacity-50 text-foreground"
          >
            <Save className="w-4 h-4" /> ড্রাফট সংরক্ষণ
          </button>
          <button
            onClick={() => sendNotification()}
            disabled={sending || !title.trim()}
            className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {sending ? "পাঠানো হচ্ছে..." : "পাঠান"}
          </button>
        </div>
      </div>

      {/* History toggle */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="w-full flex items-center justify-between px-4 py-3 bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl text-sm font-medium text-foreground hover:bg-muted/30 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          নোটিফিকেশন হিস্ট্রি ({notifications.length})
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showHistory ? "rotate-180" : ""}`} />
      </button>

      {/* History */}
      {showHistory && (
        <div className="space-y-3">
          {/* Filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {[
              { value: "all", label: "সব" },
              { value: "sent", label: "প্রেরিত" },
              { value: "pending", label: "অপেক্ষমান" },
              { value: "draft", label: "ড্রাফট" },
              { value: "failed", label: "ব্যর্থ" },
              { value: "scheduled", label: "নির্ধারিত" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilterStatus(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  filterStatus === f.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-6 text-muted-foreground text-sm">লোড হচ্ছে...</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">কোনো নোটিফিকেশন নেই</div>
          ) : (
            filteredNotifications.map((n) => {
              const st = n.is_draft ? statusConfig.draft : (statusConfig[n.status] || statusConfig.pending);
              const StIcon = st.icon;
              return (
                <div
                  key={n.id}
                  className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-4 space-y-2"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${st.color}`}>
                      <StIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-foreground">{n.title}</p>
                      {n.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${st.color}`}>
                          {st.label}
                        </span>
                        {n.sent_count > 0 && (
                          <span className="text-[10px] text-muted-foreground">
                            ✅ {n.sent_count} জন
                          </span>
                        )}
                        {n.failed_count > 0 && (
                          <span className="text-[10px] text-red-500">
                            ❌ {n.failed_count} ব্যর্থ
                          </span>
                        )}
                        {n.redirect_url && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Link className="w-2.5 h-2.5" /> {n.redirect_url}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">{formatDate(n.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {(n.is_draft || n.status === "draft" || n.status === "scheduled") && (
                        <button
                          onClick={() => {
                            editNotification(n);
                          }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          title="সম্পাদনা"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {(n.is_draft || n.status === "draft") && (
                        <button
                          onClick={() => {
                            setTitle(n.title); setBody(n.body);
                            setImageUrl(n.image_url || ""); setRedirectUrl(n.redirect_url || "");
                            setTargetType(n.target_type); setTargetValue(n.target_value || "");
                            setEditingId(n.id);
                            sendNotification(n.id);
                          }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                          title="এখনই পাঠান"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(n.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tips */}
      <div className="bg-muted/30 border border-border/50 rounded-2xl p-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          💡 <strong>সেটআপ গাইড:</strong><br />
          ১. Firebase Console থেকে প্রজেক্ট তৈরি করুন<br />
          ২. <code className="bg-muted px-1 py-0.5 rounded text-[10px]">src/lib/firebase.ts</code> এ কনফিগ কী বসান<br />
          ৩. Lovable Cloud সিক্রেটে <code className="bg-muted px-1 py-0.5 rounded text-[10px]">FCM_SERVER_KEY</code> যোগ করুন<br />
          ৪. নোটিফিকেশন Background ও Foreground উভয় অবস্থায় কাজ করবে
        </p>
      </div>
    </div>
  );
};

export default AdminNotificationPanel;
