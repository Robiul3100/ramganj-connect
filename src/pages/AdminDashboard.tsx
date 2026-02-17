import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  LogOut, LayoutDashboard, Shield, Activity, Users, TrendingUp,
  CheckCircle, XCircle, Trash2, Search, Edit3, Save, X,
  Eye, Clock, AlertTriangle, Star, StarOff, Filter, Newspaper, Plus,
  Image as ImageIcon, ChevronRight, Bell, Settings, Zap, BarChart3,
  Menu, XIcon, Globe, FileText, Phone, Droplets, Heart, Megaphone,
  SlidersHorizontal, Info, History
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Tab = "dashboard" | "services" | "categories" | "pending" | "users" | "activity" | "emergency" | "blood" | "donations" | "announcements" | "slider" | "about" | "timeline" | "news";

const tabGroups = [
  {
    label: "প্রধান",
    items: [
      { id: "dashboard" as Tab, label: "ড্যাশবোর্ড", icon: LayoutDashboard },
      { id: "pending" as Tab, label: "অপেক্ষমান", icon: Clock },
      { id: "news" as Tab, label: "নিউজ", icon: Newspaper },
    ],
  },
  {
    label: "সেবা ম্যানেজমেন্ট",
    items: [
      { id: "services" as Tab, label: "সেবাসমূহ", icon: Globe },
      { id: "categories" as Tab, label: "ক্যাটাগরি", icon: Filter },
    ],
  },
  {
    label: "কমিউনিটি",
    items: [
      { id: "emergency" as Tab, label: "জরুরি কল", icon: Phone },
      { id: "blood" as Tab, label: "রক্তদাতা", icon: Droplets },
      { id: "donations" as Tab, label: "অনুদান", icon: Heart },
    ],
  },
  {
    label: "কন্টেন্ট",
    items: [
      { id: "announcements" as Tab, label: "ঘোষণা", icon: Megaphone },
      { id: "slider" as Tab, label: "স্লাইডার", icon: SlidersHorizontal },
      { id: "about" as Tab, label: "সম্পর্কে", icon: Info },
      { id: "timeline" as Tab, label: "টাইমলাইন", icon: History },
    ],
  },
  {
    label: "সিস্টেম",
    items: [
      { id: "users" as Tab, label: "ইউজার", icon: Users },
      { id: "activity" as Tab, label: "অ্যাক্টিভিটি লগ", icon: Activity },
    ],
  },
];

const allTabs = tabGroups.flatMap(g => g.items);

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // --- All business logic remains exactly the same ---
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

  const activeTabData = allTabs.find(t => t.id === activeTab);

  // ===================== RENDER SECTIONS =====================

  const renderHero = () => (
    <div className="relative overflow-hidden rounded-2xl mx-4 mt-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent opacity-90" />
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
      <div className="relative px-5 py-8 text-primary-foreground">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">রামগঞ্জ সেবা</h1>
            <p className="text-sm opacity-80">অ্যাডমিন কন্ট্রোল প্যানেল</p>
          </div>
        </div>
        <p className="text-sm opacity-90 mb-5">সকল সেবা, কমিউনিটি ও কন্টেন্ট ম্যানেজ করুন একটি জায়গা থেকে।</p>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "মোট সেবা", value: counts.total, icon: Globe },
            { label: "অনুমোদিত", value: counts.approved, icon: CheckCircle },
            { label: "অপেক্ষমান", value: counts.pending, icon: Clock },
          ].map(s => (
            <div key={s.label} className="bg-primary-foreground/15 backdrop-blur-sm rounded-xl p-3 text-center">
              <s.icon className="w-4 h-4 mx-auto mb-1 opacity-80" />
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-[10px] opacity-70">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-5">
      {/* Pending Alert */}
      {counts.pending > 0 && (
        <button onClick={() => setActiveTab("pending")} className="w-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-left flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <span className="font-bold text-amber-800 dark:text-amber-200 text-sm">{counts.pending}টি অনুমোদন অপেক্ষমান</span>
              <p className="text-xs text-amber-600 dark:text-amber-400">এখনই রিভিউ করুন</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-amber-500 group-hover:translate-x-1 transition-transform" />
        </button>
      )}

      {/* Stats Grid */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" /> পরিসংখ্যান
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "মোট সেবা", count: counts.total, icon: Globe, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
            { label: "অনুমোদিত", count: counts.approved, icon: CheckCircle, color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
            { label: "অপেক্ষমান", count: counts.pending, icon: Clock, color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
            { label: "প্রত্যাখ্যাত", count: counts.rejected, icon: XCircle, color: "bg-red-500/10 text-red-600 dark:text-red-400" },
            { label: "ফিচার্ড", count: counts.featured, icon: Star, color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" },
            { label: "ক্যাটাগরি", count: counts.categories, icon: Filter, color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
          ].map((s) => (
            <div key={s.label} className="glass-card p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.count}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-accent" /> দ্রুত অ্যাকশন
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { label: "অপেক্ষমান", tab: "pending" as Tab, icon: Clock, desc: "রিভিউ করুন" },
            { label: "সকল সেবা", tab: "services" as Tab, icon: Globe, desc: "সেবা দেখুন" },
            { label: "নিউজ", tab: "news" as Tab, icon: Newspaper, desc: "প্রকাশ করুন" },
            { label: "ক্যাটাগরি", tab: "categories" as Tab, icon: Filter, desc: "ম্যানেজ করুন" },
            { label: "ইউজার", tab: "users" as Tab, icon: Users, desc: "ব্যবস্থাপনা" },
            { label: "অ্যাক্টিভিটি", tab: "activity" as Tab, icon: Activity, desc: "লগ দেখুন" },
          ].map((a) => (
            <button key={a.label} onClick={() => { setActiveTab(a.tab); setSidebarOpen(false); }}
              className="glass-card p-4 text-left hover:shadow-md transition-all group">
              <a.icon className="w-5 h-5 text-primary mb-2" />
              <p className="text-sm font-bold text-foreground">{a.label}</p>
              <p className="text-xs text-muted-foreground">{a.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderServicesList = () => (
    <div className="space-y-3">
      <div className="flex flex-col gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="নাম, ফোন, ঠিকানা দিয়ে খুঁজুন..." className="w-full bg-card rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none border border-border focus:ring-2 focus:ring-primary/20 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {activeTab !== "pending" && (
            <select className="bg-card rounded-xl px-3 py-2 text-xs border border-border" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">সকল স্ট্যাটাস</option>
              <option value="approved">অনুমোদিত</option>
              <option value="pending">অপেক্ষমান</option>
              <option value="rejected">প্রত্যাখ্যাত</option>
            </select>
          )}
          <select className="bg-card rounded-xl px-3 py-2 text-xs border border-border" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">সকল ক্যাটাগরি</option>
            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <p className="text-xs text-muted-foreground">মোট: {filteredServices.length}টি</p>
      </div>

      {loading ? <LoadingState /> : filteredServices.length === 0 ? <EmptyState /> : (
        filteredServices.map((item: any) => (
          <div key={item.id} className="glass-card p-4 border border-border/50">
            {editingId === item.id ? (
              <div className="space-y-2">
                <input className="w-full bg-muted/50 rounded-xl px-3 py-2 text-sm border border-border focus:ring-2 focus:ring-primary/20" value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} placeholder="শিরোনাম" />
                <textarea className="w-full bg-muted/50 rounded-xl px-3 py-2 text-sm border border-border min-h-[60px] focus:ring-2 focus:ring-primary/20" value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} placeholder="বিবরণ" />
                <div className="grid grid-cols-2 gap-2">
                  <input className="bg-muted/50 rounded-xl px-3 py-2 text-sm border border-border" value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} placeholder="ফোন" />
                  <input className="bg-muted/50 rounded-xl px-3 py-2 text-sm border border-border" value={editData.whatsapp} onChange={(e) => setEditData({ ...editData, whatsapp: e.target.value })} placeholder="WhatsApp" />
                </div>
                <input className="w-full bg-muted/50 rounded-xl px-3 py-2 text-sm border border-border" value={editData.address} onChange={(e) => setEditData({ ...editData, address: e.target.value })} placeholder="ঠিকানা" />
                <select className="w-full bg-muted/50 rounded-xl px-3 py-2 text-sm border border-border" value={editData.category_id} onChange={(e) => setEditData({ ...editData, category_id: e.target.value })}>
                  <option value="">ক্যাটাগরি নির্বাচন</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(item.id)} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1">
                    <Save className="w-3.5 h-3.5" /> সেভ
                  </button>
                  <button onClick={() => setEditingId(null)} className="px-4 py-2.5 rounded-xl bg-muted text-foreground text-xs font-medium">
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
                    {item.phone && <p className="text-xs text-muted-foreground mt-1">📞 {item.phone}</p>}
                    {item.address && <p className="text-xs text-muted-foreground">📍 {item.address}</p>}
                    {item.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>}
                    <p className="text-xs text-muted-foreground mt-1">📅 {new Date(item.created_at).toLocaleDateString("bn-BD")}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {item.status !== "approved" && (
                    <ActionBtn color="emerald" onClick={() => updateServiceStatus(item.id, "approved", item.title)} icon={<CheckCircle className="w-3.5 h-3.5" />} label="অনুমোদন" />
                  )}
                  {item.status !== "rejected" && (
                    <ActionBtn color="red" onClick={() => updateServiceStatus(item.id, "rejected", item.title)} icon={<XCircle className="w-3.5 h-3.5" />} label="প্রত্যাখ্যান" />
                  )}
                  <ActionBtn color="amber" onClick={() => toggleFeatured(item.id, item.is_featured, item.title)} icon={item.is_featured ? <StarOff className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />} label={item.is_featured ? "আনফিচার" : "ফিচার"} />
                  <ActionBtn color="blue" onClick={() => startEdit(item)} icon={<Edit3 className="w-3.5 h-3.5" />} label="এডিট" />
                  <ActionBtn color="red" onClick={() => deleteService(item.id, item.title)} icon={<Trash2 className="w-3.5 h-3.5" />} label="মুছুন" />
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
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">ক্যাটাগরি ম্যানেজমেন্ট</h2>
        <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">{categories.length}টি</span>
      </div>
      {categories.map((c: any) => (
        <div key={c.id} className="glass-card p-4 flex items-center justify-between border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Filter className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">{c.name}</h3>
              <p className="text-xs text-muted-foreground">/{c.slug} • আইকন: {c.icon}</p>
            </div>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${c.is_active ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}>
            {c.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
          </span>
        </div>
      ))}
    </div>
  );

  const renderActivity = () => (
    <div className="space-y-3">
      {loading ? <LoadingState /> : activityLog.length === 0 ? <EmptyState /> : (
        activityLog.map((log: any) => (
          <div key={log.id} className="glass-card p-4 flex items-start gap-3 border border-border/50">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              log.action === "approved" ? "bg-emerald-500/10 text-emerald-600" : log.action === "deleted" ? "bg-red-500/10 text-red-600" : "bg-blue-500/10 text-blue-600"
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
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">ইউজার ম্যানেজমেন্ট</h2>
        <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">{usersList.length}জন</span>
      </div>
      {loading ? <LoadingState /> : (
        usersList.map((user: any) => (
          <div key={user.id} className="glass-card p-4 flex items-center gap-3 border border-border/50">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-foreground">{user.display_name || "No Name"}</h3>
              <p className="text-xs text-muted-foreground">{user.phone || "—"}</p>
            </div>
            <div className="flex gap-1">
              {user.roles.map((r: string) => (
                <span key={r} className={`text-xs px-2.5 py-1 rounded-full font-medium ${r === "admin" ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-muted text-muted-foreground"}`}>
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
    if (loading) return <LoadingState />;
    if (legacyData.length === 0) return <EmptyState />;
    return (
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">মোট: {legacyData.length}টি</p>
        {legacyData.map((item: any) => {
          const name = item.title || item.name || item.text || item.method_name || item.article_title || item.donor_name || item.item_name || `${item.year || ""}`;
          return (
            <div key={item.id} className="glass-card p-4 border border-border/50">
              <h3 className="font-bold text-sm text-foreground">{name}</h3>
              {item.phone && <p className="text-xs text-muted-foreground mt-1">📞 {item.phone}</p>}
              {item.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description}</p>}
              <p className="text-xs text-muted-foreground mt-1">📅 {new Date(item.created_at).toLocaleDateString("bn-BD")}</p>
            </div>
          );
        })}
      </div>
    );
  };

  const renderNews = () => (
    <div className="space-y-4">
      <div className="glass-card p-5 space-y-3 border border-border/50">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-primary" /> {newsEditId ? "নিউজ এডিট" : "নতুন নিউজ যোগ করুন"}
        </h2>
        <input className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:ring-2 focus:ring-primary/20" placeholder="নিউজ শিরোনাম" value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} />
        <textarea className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none min-h-[120px] focus:ring-2 focus:ring-primary/20" placeholder="নিউজ বিস্তারিত..." value={newsForm.body} onChange={(e) => setNewsForm({ ...newsForm, body: e.target.value })} />
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-primary font-medium cursor-pointer bg-primary/10 px-4 py-2.5 rounded-xl hover:bg-primary/15 transition-colors">
            <ImageIcon className="w-4 h-4" /> {newsUploading ? "আপলোড হচ্ছে..." : "থাম্বনেইল"}
            <input type="file" accept="image/*" className="hidden" onChange={handleNewsUpload} disabled={newsUploading} />
          </label>
          {newsForm.thumbnail_url && <img src={newsForm.thumbnail_url} alt="thumb" className="w-14 h-14 rounded-xl object-cover border border-border" />}
        </div>
        <div className="flex gap-2">
          <button onClick={saveNews} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
            <Save className="w-4 h-4" /> {newsEditId ? "আপডেট" : "প্রকাশ করুন"}
          </button>
          {newsEditId && (
            <button onClick={() => { setNewsEditId(null); setNewsForm({ title: "", body: "", thumbnail_url: "" }); }} className="px-5 py-3 rounded-xl bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors">
              বাতিল
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">মোট: {newsItems.length}টি নিউজ</p>
      </div>
      {loading ? <LoadingState /> : newsItems.map((item: any) => (
        <div key={item.id} className="glass-card p-4 flex gap-3 border border-border/50">
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
              <ActionBtn color="blue" onClick={() => { setNewsEditId(item.id); setNewsForm({ title: item.title, body: item.body || "", thumbnail_url: item.thumbnail_url || "" }); }} icon={<Edit3 className="w-3 h-3" />} label="এডিট" />
              <button onClick={() => toggleNewsActive(item.id, item.is_active)}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${item.is_active ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                {item.is_active ? "✅ সক্রিয়" : "⏸ নিষ্ক্রিয়"}
              </button>
              <ActionBtn color="red" onClick={() => deleteNews(item.id, item.title)} icon={<Trash2 className="w-3 h-3" />} label="মুছুন" />
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
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3 max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
              <Menu className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-foreground hidden sm:inline">এডমিন প্যানেল</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {counts.pending > 0 && (
              <button onClick={() => setActiveTab("pending")} className="relative w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                <Bell className="w-4 h-4 text-foreground" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">{counts.pending}</span>
              </button>
            )}
            <button onClick={handleLogout} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-destructive/10 transition-colors">
              <LogOut className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex max-w-5xl mx-auto">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-60 shrink-0 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto border-r border-border p-3 space-y-4">
          {tabGroups.map(group => (
            <div key={group.label}>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold px-3 mb-1.5">{group.label}</p>
              {group.items.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all mb-0.5 ${
                      isActive ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}>
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.id === "pending" && counts.pending > 0 && (
                      <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-primary-foreground/20" : "bg-destructive text-destructive-foreground"}`}>{counts.pending}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-72 bg-card border-r border-border p-4 overflow-y-auto animate-slide-up" style={{ animation: "none", transform: "translateX(0)" }}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-bold text-foreground">এডমিন প্যানেল</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
                  <XIcon className="w-4 h-4 text-foreground" />
                </button>
              </div>
              {tabGroups.map(group => (
                <div key={group.label} className="mb-4">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold px-3 mb-1.5">{group.label}</p>
                  {group.items.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5 ${
                          isActive ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}>
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                        {tab.id === "pending" && counts.pending > 0 && (
                          <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-primary-foreground/20" : "bg-destructive text-destructive-foreground"}`}>{counts.pending}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground px-3">{currentUser?.email}</p>
                <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors mt-2">
                  <LogOut className="w-4 h-4" /> লগআউট
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {activeTab === "dashboard" && renderHero()}

          {/* Tab header for non-dashboard */}
          {activeTab !== "dashboard" && activeTabData && (
            <div className="px-4 pt-4 pb-2">
              <div className="flex items-center gap-2">
                <activeTabData.icon className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">{activeTabData.label}</h2>
              </div>
            </div>
          )}

          {/* Mobile Tab Scroller */}
          <div className="lg:hidden px-2 py-2 overflow-x-auto">
            <div className="flex gap-1.5 min-w-max">
              {allTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                      activeTab === tab.id ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground"
                    }`}>
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                    {tab.id === "pending" && counts.pending > 0 && (
                      <span className={`text-[10px] font-bold px-1 rounded-full ${activeTab === tab.id ? "bg-primary-foreground/20" : "bg-destructive text-destructive-foreground"}`}>{counts.pending}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-4 pb-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

// ===================== UTILITY COMPONENTS =====================

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
    <p className="text-sm text-muted-foreground">লোড হচ্ছে...</p>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
      <FileText className="w-6 h-6 text-muted-foreground" />
    </div>
    <p className="text-sm text-muted-foreground">কোন ডাটা নেই</p>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => (
  <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
    status === "approved" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
    status === "rejected" ? "bg-red-500/10 text-red-600 dark:text-red-400" :
    "bg-amber-500/10 text-amber-600 dark:text-amber-400"
  }`}>
    {status === "approved" ? "✅" : status === "rejected" ? "❌" : "🕐"} {status}
  </span>
);

const ActionBtn = ({ color, onClick, icon, label }: { color: string; onClick: () => void; icon: React.ReactNode; label: string }) => {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20",
    red: "bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20",
  };
  return (
    <button onClick={onClick} className={`text-xs px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors ${colorMap[color] || colorMap.blue}`}>
      {icon}{label}
    </button>
  );
};

export default AdminDashboard;
