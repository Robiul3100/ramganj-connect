import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  LogOut, LayoutDashboard, Shield, Activity, Users, TrendingUp,
  CheckCircle, XCircle, Trash2, RefreshCw, Search, Edit3, Save, X,
  Eye, Clock, AlertTriangle, Star, StarOff, Filter, Newspaper, Plus,
  Image as ImageIcon
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Tab = "dashboard" | "services" | "categories" | "pending" | "users" | "activity" | "emergency" | "blood" | "donations" | "announcements" | "slider" | "about" | "timeline" | "news";

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: "dashboard", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
  { id: "news", label: "নিউজ", icon: Newspaper },
  { id: "pending", label: "অপেক্ষমান", icon: Clock },
  { id: "services", label: "সেবাসমূহ", icon: Eye },
  { id: "categories", label: "ক্যাটাগরি", icon: Filter },
  { id: "users", label: "ইউজার", icon: Users },
  { id: "activity", label: "লগ", icon: Activity },
  { id: "emergency", label: "জরুরি", icon: AlertTriangle },
  { id: "blood", label: "রক্ত", icon: TrendingUp },
  { id: "donations", label: "অনুদান", icon: TrendingUp },
  { id: "announcements", label: "ঘোষণা", icon: TrendingUp },
  { id: "slider", label: "স্লাইডার", icon: TrendingUp },
  { id: "about", label: "সম্পর্কে", icon: TrendingUp },
  { id: "timeline", label: "টাইমলাইন", icon: TrendingUp },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, featured: 0, categories: 0 });
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [legacyData, setLegacyData] = useState<any[]>([]);
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [newsForm, setNewsForm] = useState({ title: "", body: "", thumbnail_url: "" });
  const [newsEditId, setNewsEditId] = useState<string | null>(null);
  const [newsUploading, setNewsUploading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/admin-login"); return; }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      if (!roles || !roles.some((r: any) => r.role === "admin")) { navigate("/admin-login"); return; }
      setCurrentUser(user);
    };
    checkAuth();
  }, [navigate]);

  const fetchCounts = useCallback(async () => {
    const [total, pending, approved, rejected, featured, cats] = await Promise.all([
      supabase.from("services").select("*", { count: "exact", head: true }),
      supabase.from("services").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("services").select("*", { count: "exact", head: true }).eq("status", "approved"),
      supabase.from("services").select("*", { count: "exact", head: true }).eq("status", "rejected"),
      supabase.from("services").select("*", { count: "exact", head: true }).eq("is_featured", true),
      supabase.from("service_categories").select("*", { count: "exact", head: true }),
    ]);
    setCounts({
      total: total.count || 0, pending: pending.count || 0, approved: approved.count || 0,
      rejected: rejected.count || 0, featured: featured.count || 0, categories: cats.count || 0,
    });
  }, []);

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase.from("service_categories").select("*").order("sort_order");
    setCategories(data || []);
  }, []);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("services").select("*, service_categories(name, slug)").order("created_at", { ascending: false });
    if (filterStatus !== "all") query = query.eq("status", filterStatus);
    if (filterCategory !== "all") query = query.eq("category_id", filterCategory);
    const { data } = await query;
    setServices(data || []);
    setLoading(false);
  }, [filterStatus, filterCategory]);

  useEffect(() => { fetchCounts(); fetchCategories(); }, [fetchCounts, fetchCategories]);

  useEffect(() => {
    if (activeTab === "services" || activeTab === "pending") fetchServices();
  }, [activeTab, fetchServices]);

  useEffect(() => {
    if (activeTab === "pending") setFilterStatus("pending");
    else if (activeTab === "services") setFilterStatus("all");
  }, [activeTab]);

  useEffect(() => {
    const ch = supabase.channel("admin_services_rt").on("postgres_changes", { event: "*", schema: "public", table: "services" }, () => {
      fetchServices(); fetchCounts();
    }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchServices, fetchCounts]);

  useEffect(() => {
    if (activeTab === "activity") {
      const fetch = async () => {
        setLoading(true);
        const { data } = await supabase.from("admin_activity_log").select("*").order("created_at", { ascending: false }).limit(50);
        setActivityLog(data || []);
        setLoading(false);
      };
      fetch();
    }
    if (activeTab === "users") {
      const fetch = async () => {
        setLoading(true);
        const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
        const { data: roles } = await supabase.from("user_roles").select("*");
        setUsersList((profiles || []).map((p: any) => ({
          ...p, roles: (roles || []).filter((r: any) => r.user_id === p.user_id).map((r: any) => r.role),
        })));
        setLoading(false);
      };
      fetch();
    }
    // Legacy tables
    const legacyTabs: Record<string, string> = {
      emergency: "emergency_calls", blood: "blood_donors", donations: "donations",
      announcements: "announcements", slider: "slider_items", about: "about_content", timeline: "timeline_events",
    };
    if (legacyTabs[activeTab]) {
      const fetch = async () => {
        setLoading(true);
        const { data } = await (supabase.from as any)(legacyTabs[activeTab]).select("*").order("created_at", { ascending: false });
        setLegacyData(data || []);
        setLoading(false);
      };
      fetch();
    }
    if (activeTab === "news") {
      const fetchNews = async () => {
        setLoading(true);
        const { data } = await supabase.from("news").select("*").order("published_at", { ascending: false });
        setNewsItems(data || []);
        setLoading(false);
      };
      fetchNews();
    }
  }, [activeTab]);

  const logActivity = useCallback(async (action: string, tableName?: string, recordId?: string, details?: string) => {
    if (!currentUser) return;
    await supabase.from("admin_activity_log").insert({
      user_id: currentUser.id, action, table_name: tableName || null, record_id: recordId || null, details: details || null,
    });
  }, [currentUser]);

  const updateServiceStatus = async (id: string, status: string, title: string) => {
    await supabase.from("services").update({ status }).eq("id", id);
    await logActivity(status, "services", id, title);
    toast({ title: status === "approved" ? "অনুমোদিত ✅" : status === "rejected" ? "প্রত্যাখ্যাত ❌" : "পেন্ডিং 🕐" });
    fetchCounts();
  };

  const toggleFeatured = async (id: string, current: boolean, title: string) => {
    await supabase.from("services").update({ is_featured: !current }).eq("id", id);
    await logActivity(!current ? "featured" : "unfeatured", "services", id, title);
    toast({ title: !current ? "ফিচার্ড ✨" : "আনফিচার্ড" });
  };

  const deleteService = async (id: string, title: string) => {
    if (!confirm("মুছে ফেলতে চান?")) return;
    await supabase.from("services").delete().eq("id", id);
    await logActivity("deleted", "services", id, title);
    toast({ title: "মুছে ফেলা হয়েছে" });
    fetchCounts();
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setEditData({ title: item.title, description: item.description || "", phone: item.phone || "", whatsapp: item.whatsapp || "", address: item.address || "", area: item.area || "", category_id: item.category_id || "" });
  };

  const saveEdit = async (id: string) => {
    await supabase.from("services").update(editData).eq("id", id);
    await logActivity("edited", "services", id, editData.title);
    setEditingId(null);
    toast({ title: "আপডেট হয়েছে ✅" });
  };

  const handleLogout = async () => {
    await logActivity("logout");
    await supabase.auth.signOut();
    navigate("/admin-login");
  };

  const filteredServices = services.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.phone || "").includes(searchTerm) ||
    (s.address || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderDashboard = () => (
    <div className="space-y-4">
      <div className="glass-card p-4 border-l-4 border-l-primary">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">স্বাগতম, এডমিন!</h2>
            <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
          </div>
        </div>
      </div>

      {counts.pending > 0 && (
        <button onClick={() => setActiveTab("pending")} className="w-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-left">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="font-bold text-amber-800 dark:text-amber-200">{counts.pending}টি অনুমোদন অপেক্ষমান</span>
          </div>
        </button>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "মোট সেবা", count: counts.total, color: "hsl(210,85%,55%)" },
          { label: "অনুমোদিত", count: counts.approved, color: "hsl(140,60%,45%)" },
          { label: "অপেক্ষমান", count: counts.pending, color: "hsl(40,85%,55%)" },
          { label: "প্রত্যাখ্যাত", count: counts.rejected, color: "hsl(0,70%,55%)" },
          { label: "ফিচার্ড", count: counts.featured, color: "hsl(45,90%,50%)" },
          { label: "ক্যাটাগরি", count: counts.categories, color: "hsl(270,50%,55%)" },
        ].map((s) => (
          <div key={s.label} className="glass-card p-3 border-l-4" style={{ borderColor: s.color }}>
            <span className="text-xl font-bold text-foreground">{s.count}</span>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "অপেক্ষমান", tab: "pending" as Tab },
          { label: "সকল সেবা", tab: "services" as Tab },
          { label: "ক্যাটাগরি", tab: "categories" as Tab },
          { label: "ইউজার", tab: "users" as Tab },
          { label: "অ্যাক্টিভিটি", tab: "activity" as Tab },
          { label: "জরুরি কল", tab: "emergency" as Tab },
        ].map((a) => (
          <button key={a.label} onClick={() => setActiveTab(a.tab)} className="glass-card p-3 text-center text-xs font-medium text-foreground hover:bg-primary/5 transition-colors">
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );

  const renderServicesList = () => (
    <div className="space-y-3">
      <div className="flex flex-col gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="নাম, ফোন, ঠিকানা দিয়ে খুঁজুন..." className="w-full bg-muted/50 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none border border-border" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {activeTab !== "pending" && (
            <select className="bg-muted/50 rounded-lg px-3 py-1.5 text-xs border border-border" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">সকল স্ট্যাটাস</option>
              <option value="approved">অনুমোদিত</option>
              <option value="pending">অপেক্ষমান</option>
              <option value="rejected">প্রত্যাখ্যাত</option>
            </select>
          )}
          <select className="bg-muted/50 rounded-lg px-3 py-1.5 text-xs border border-border" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">সকল ক্যাটাগরি</option>
            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <p className="text-xs text-muted-foreground">মোট: {filteredServices.length}টি</p>
      </div>

      {loading ? <p className="text-center text-muted-foreground py-8">লোড হচ্ছে...</p> : filteredServices.length === 0 ? <p className="text-center text-muted-foreground py-8">কোন ডাটা নেই</p> : (
        filteredServices.map((item: any) => (
          <div key={item.id} className="glass-card p-4">
            {editingId === item.id ? (
              <div className="space-y-2">
                <input className="w-full bg-muted/50 rounded-lg px-3 py-2 text-sm border border-border" value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} placeholder="শিরোনাম" />
                <textarea className="w-full bg-muted/50 rounded-lg px-3 py-2 text-sm border border-border min-h-[60px]" value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} placeholder="বিবরণ" />
                <div className="grid grid-cols-2 gap-2">
                  <input className="bg-muted/50 rounded-lg px-3 py-2 text-sm border border-border" value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} placeholder="ফোন" />
                  <input className="bg-muted/50 rounded-lg px-3 py-2 text-sm border border-border" value={editData.whatsapp} onChange={(e) => setEditData({ ...editData, whatsapp: e.target.value })} placeholder="WhatsApp" />
                </div>
                <input className="w-full bg-muted/50 rounded-lg px-3 py-2 text-sm border border-border" value={editData.address} onChange={(e) => setEditData({ ...editData, address: e.target.value })} placeholder="ঠিকানা" />
                <select className="w-full bg-muted/50 rounded-lg px-3 py-2 text-sm border border-border" value={editData.category_id} onChange={(e) => setEditData({ ...editData, category_id: e.target.value })}>
                  <option value="">ক্যাটাগরি নির্বাচন</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(item.id)} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1">
                    <Save className="w-3.5 h-3.5" /> সেভ
                  </button>
                  <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded-lg bg-muted text-foreground text-xs font-medium">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-foreground text-sm">{item.title}</h3>
                      {item.is_featured && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{item.service_categories?.name || "—"}</p>
                    {item.phone && <p className="text-xs text-muted-foreground">📞 {item.phone}</p>}
                    {item.address && <p className="text-xs text-muted-foreground">📍 {item.address}</p>}
                    {item.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>}
                    <p className="text-xs text-muted-foreground mt-1">📅 {new Date(item.created_at).toLocaleDateString("bn-BD")}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                    item.status === "approved" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" :
                    item.status === "rejected" ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" :
                    "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                  }`}>
                    {item.status === "approved" ? "✅" : item.status === "rejected" ? "❌" : "🕐"} {item.status}
                  </span>
                </div>
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {item.status !== "approved" && (
                    <button onClick={() => updateServiceStatus(item.id, "approved", item.title)} className="text-xs px-3 py-1.5 rounded-lg bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 font-medium">
                      <CheckCircle className="w-3.5 h-3.5 inline mr-1" />অনুমোদন
                    </button>
                  )}
                  {item.status !== "rejected" && (
                    <button onClick={() => updateServiceStatus(item.id, "rejected", item.title)} className="text-xs px-3 py-1.5 rounded-lg bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 font-medium">
                      <XCircle className="w-3.5 h-3.5 inline mr-1" />প্রত্যাখ্যান
                    </button>
                  )}
                  <button onClick={() => toggleFeatured(item.id, item.is_featured, item.title)} className="text-xs px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 font-medium">
                    {item.is_featured ? <StarOff className="w-3.5 h-3.5 inline mr-1" /> : <Star className="w-3.5 h-3.5 inline mr-1" />}
                    {item.is_featured ? "আনফিচার" : "ফিচার"}
                  </button>
                  <button onClick={() => startEdit(item)} className="text-xs px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-medium">
                    <Edit3 className="w-3.5 h-3.5 inline mr-1" />এডিট
                  </button>
                  <button onClick={() => deleteService(item.id, item.title)} className="text-xs px-3 py-1.5 rounded-lg bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 font-medium">
                    <Trash2 className="w-3.5 h-3.5 inline mr-1" />মুছুন
                  </button>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );

  const renderCategories = () => (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-foreground">ক্যাটাগরি ম্যানেজমেন্ট ({categories.length})</h2>
      {categories.map((c: any) => (
        <div key={c.id} className="glass-card p-3 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-foreground">{c.name}</h3>
            <p className="text-xs text-muted-foreground">/{c.slug} • আইকন: {c.icon}</p>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${c.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
            {c.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
          </span>
        </div>
      ))}
    </div>
  );

  const renderActivity = () => (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
        <Activity className="w-4 h-4 text-primary" /> সাম্প্রতিক কার্যকলাপ
      </h2>
      {loading ? <p className="text-center text-muted-foreground py-8">লোড হচ্ছে...</p> : activityLog.length === 0 ? <p className="text-center text-muted-foreground py-8">কোন অ্যাক্টিভিটি নেই</p> : (
        activityLog.map((log: any) => (
          <div key={log.id} className="glass-card p-3 flex items-start gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              log.action === "approved" ? "bg-green-100 text-green-600" : log.action === "deleted" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
            }`}>
              {log.action === "approved" ? <CheckCircle className="w-4 h-4" /> : log.action === "deleted" ? <Trash2 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground capitalize">{log.action}</p>
              {log.table_name && <p className="text-xs text-muted-foreground">{log.table_name}{log.details ? ` — ${log.details}` : ""}</p>}
              <p className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString("bn-BD")}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-foreground">ইউজার ম্যানেজমেন্ট ({usersList.length})</h2>
      {loading ? <p className="text-center text-muted-foreground py-8">লোড হচ্ছে...</p> : (
        usersList.map((user: any) => (
          <div key={user.id} className="glass-card p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-foreground">{user.display_name || "No Name"}</h3>
              <p className="text-xs text-muted-foreground">{user.phone || "—"}</p>
            </div>
            <div className="flex gap-1">
              {user.roles.map((r: string) => (
                <span key={r} className={`text-xs px-2 py-0.5 rounded-full font-medium ${r === "admin" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>
                  {r === "admin" ? "🛡️" : "👤"} {r}
                </span>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderLegacy = () => {
    if (loading) return <p className="text-center text-muted-foreground py-8">লোড হচ্ছে...</p>;
    if (legacyData.length === 0) return <p className="text-center text-muted-foreground py-8">কোন ডাটা নেই</p>;
    return (
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">মোট: {legacyData.length}টি</p>
        {legacyData.map((item: any) => {
          const name = item.title || item.name || item.text || item.method_name || item.article_title || item.donor_name || item.item_name || `${item.year || ""}`;
          return (
            <div key={item.id} className="glass-card p-3">
              <h3 className="font-bold text-sm text-foreground">{name}</h3>
              {item.phone && <p className="text-xs text-muted-foreground">📞 {item.phone}</p>}
              {item.description && <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>}
              <p className="text-xs text-muted-foreground mt-1">📅 {new Date(item.created_at).toLocaleDateString("bn-BD")}</p>
            </div>
          );
        })}
      </div>
    );
  };

  const handleNewsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewsUploading(true);
    const ext = file.name.split(".").pop();
    const path = `news/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) { toast({ title: "আপলোড ব্যর্থ", variant: "destructive" }); setNewsUploading(false); return; }
    const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
    setNewsForm({ ...newsForm, thumbnail_url: urlData.publicUrl });
    setNewsUploading(false);
  };

  const saveNews = async () => {
    if (!newsForm.title.trim()) { toast({ title: "শিরোনাম দিন", variant: "destructive" }); return; }
    if (newsEditId) {
      await supabase.from("news").update({ title: newsForm.title, body: newsForm.body, thumbnail_url: newsForm.thumbnail_url || null }).eq("id", newsEditId);
      await logActivity("edited", "news", newsEditId, newsForm.title);
      toast({ title: "নিউজ আপডেট হয়েছে ✅" });
    } else {
      await supabase.from("news").insert({ title: newsForm.title, body: newsForm.body, thumbnail_url: newsForm.thumbnail_url || null });
      await logActivity("created", "news", undefined, newsForm.title);
      toast({ title: "নিউজ প্রকাশিত হয়েছে ✅" });
    }
    setNewsForm({ title: "", body: "", thumbnail_url: "" });
    setNewsEditId(null);
    // refetch
    const { data } = await supabase.from("news").select("*").order("published_at", { ascending: false });
    setNewsItems(data || []);
  };

  const deleteNews = async (id: string, title: string) => {
    if (!confirm("মুছে ফেলতে চান?")) return;
    await supabase.from("news").delete().eq("id", id);
    await logActivity("deleted", "news", id, title);
    toast({ title: "মুছে ফেলা হয়েছে" });
    setNewsItems(newsItems.filter((n) => n.id !== id));
  };

  const toggleNewsActive = async (id: string, current: boolean) => {
    await supabase.from("news").update({ is_active: !current }).eq("id", id);
    setNewsItems(newsItems.map((n) => n.id === id ? { ...n, is_active: !current } : n));
    toast({ title: !current ? "সক্রিয় করা হয়েছে" : "নিষ্ক্রিয় করা হয়েছে" });
  };

  const renderNews = () => (
    <div className="space-y-4">
      {/* Form */}
      <div className="glass-card p-4 space-y-3">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-primary" /> {newsEditId ? "নিউজ এডিট" : "নতুন নিউজ যোগ করুন"}
        </h2>
        <input className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-sm border border-border outline-none" placeholder="নিউজ শিরোনাম" value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} />
        <textarea className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-sm border border-border outline-none min-h-[120px]" placeholder="নিউজ বিস্তারিত..." value={newsForm.body} onChange={(e) => setNewsForm({ ...newsForm, body: e.target.value })} />
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-primary font-medium cursor-pointer bg-primary/10 px-3 py-2 rounded-xl">
            <ImageIcon className="w-4 h-4" /> {newsUploading ? "আপলোড হচ্ছে..." : "থাম্বনেইল"}
            <input type="file" accept="image/*" className="hidden" onChange={handleNewsUpload} disabled={newsUploading} />
          </label>
          {newsForm.thumbnail_url && <img src={newsForm.thumbnail_url} alt="thumb" className="w-12 h-12 rounded-lg object-cover" />}
        </div>
        <div className="flex gap-2">
          <button onClick={saveNews} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-1.5">
            <Save className="w-4 h-4" /> {newsEditId ? "আপডেট" : "প্রকাশ করুন"}
          </button>
          {newsEditId && (
            <button onClick={() => { setNewsEditId(null); setNewsForm({ title: "", body: "", thumbnail_url: "" }); }} className="px-4 py-2.5 rounded-xl bg-muted text-foreground text-sm font-medium">
              বাতিল
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <p className="text-xs text-muted-foreground">মোট: {newsItems.length}টি নিউজ</p>
      {loading ? <p className="text-center text-muted-foreground py-8">লোড হচ্ছে...</p> : newsItems.map((item: any) => (
        <div key={item.id} className="glass-card p-3 flex gap-3">
          <div className="w-20 h-16 rounded-xl bg-muted overflow-hidden shrink-0">
            {item.thumbnail_url ? (
              <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><Newspaper className="w-5 h-5 text-muted-foreground/40" /></div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-sm line-clamp-1">{item.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(item.published_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
            </p>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              <button onClick={() => { setNewsEditId(item.id); setNewsForm({ title: item.title, body: item.body || "", thumbnail_url: item.thumbnail_url || "" }); }}
                className="text-xs px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-medium">
                <Edit3 className="w-3 h-3 inline mr-0.5" />এডিট
              </button>
              <button onClick={() => toggleNewsActive(item.id, item.is_active)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium ${item.is_active ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}>
                {item.is_active ? "✅ সক্রিয়" : "⏸ নিষ্ক্রিয়"}
              </button>
              <button onClick={() => deleteNews(item.id, item.title)}
                className="text-xs px-2.5 py-1 rounded-lg bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 font-medium">
                <Trash2 className="w-3 h-3 inline mr-0.5" />মুছুন
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return renderDashboard();
      case "services": case "pending": return renderServicesList();
      case "categories": return renderCategories();
      case "activity": return renderActivity();
      case "users": return renderUsers();
      case "news": return renderNews();
      default: return renderLegacy();
    }
  };

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto">
      <div className="gradient-primary p-4 flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5" /> এডমিন প্যানেল
        </h1>
        <div className="flex items-center gap-2">
          {counts.pending > 0 && (
            <span className="bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">{counts.pending}</span>
          )}
          <button onClick={handleLogout} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <LogOut className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      <div className="px-2 py-3 overflow-x-auto sticky top-[60px] z-40 bg-background/95 backdrop-blur-sm">
        <div className="flex gap-2 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}>
                <Icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pb-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
