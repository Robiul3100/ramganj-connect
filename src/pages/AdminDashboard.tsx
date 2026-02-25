import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  LogOut, LayoutDashboard, Shield, Activity, Users, TrendingUp,
  CheckCircle, XCircle, Trash2, Search, Edit3, Save, X,
  Eye, Clock, AlertTriangle, Star, StarOff, Filter, Newspaper, Plus,
  Image as ImageIcon, ChevronRight, Bell, Settings, Zap, BarChart3,
  Menu, XIcon, Globe, FileText, Phone, Droplets, Heart, Megaphone,
  SlidersHorizontal, Info, History, ChevronDown, ArrowUpRight, Sparkles,
  RefreshCw, MoreHorizontal, CalendarDays, Hash, Layers,
  Stethoscope, Building2, Pill, GraduationCap, Store, ShoppingBag,
  Briefcase, SearchX, CalendarHeart, Plane, Ambulance, ShieldAlert,
  Flame, Bus, Lightbulb, Scale, Landmark, UsersRound, MapPin,
  Package, Tractor, Home, BookOpen, UtensilsCrossed, Wrench,
  ScrollText, HeartHandshake, Microscope, Car, Building, Rocket,
  Hotel, Coffee, Video, Flower2, type LucideIcon, ArrowLeft
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import SiteSettingsPanel from "@/components/SiteSettingsPanel";
import AnalyticsCharts from "@/components/AnalyticsCharts";
import AddServiceForm from "@/components/admin/AddServiceForm";

type Tab = "dashboard" | "services" | "categories" | "pending" | "users" | "activity" | "emergency" | "blood" | "donations" | "announcements" | "slider" | "about" | "timeline" | "news" | "site_settings" | "advertisements";

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
      { id: "categories" as Tab, label: "ক্যাটাগরি", icon: Layers },
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
      { id: "advertisements" as Tab, label: "বিজ্ঞাপন", icon: ImageIcon },
      { id: "about" as Tab, label: "সম্পর্কে", icon: Info },
      { id: "timeline" as Tab, label: "টাইমলাইন", icon: History },
    ],
  },
  {
    label: "সিস্টেম",
    items: [
      { id: "site_settings" as Tab, label: "সাইট সেটিং", icon: Settings },
      { id: "users" as Tab, label: "ইউজার", icon: Users },
      { id: "activity" as Tab, label: "অ্যাক্টিভিটি", icon: Activity },
    ],
  },
];

const allTabs = tabGroups.flatMap(g => g.items);

// Legacy table configs for CRUD
const legacyTableConfig: Record<string, { table: string; fields: { name: string; label: string; type?: string; options?: string[] }[]; nameKey: string }> = {
  emergency: {
    table: "emergency_calls",
    nameKey: "name",
    fields: [
      { name: "name", label: "নাম" },
      { name: "phone", label: "ফোন নম্বর" },
      { name: "description", label: "বিবরণ" },
      { name: "sort_order", label: "ক্রম", type: "number" },
    ],
  },
  blood: {
    table: "blood_donors",
    nameKey: "name",
    fields: [
      { name: "name", label: "নাম" },
      { name: "phone", label: "ফোন নম্বর" },
      { name: "blood_group", label: "রক্তের গ্রুপ", type: "select", options: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] },
      { name: "address", label: "ঠিকানা" },
    ],
  },
  announcements: {
    table: "announcements",
    nameKey: "text",
    fields: [
      { name: "text", label: "ঘোষণার টেক্সট" },
    ],
  },
  timeline: {
    table: "timeline_events",
    nameKey: "title",
    fields: [
      { name: "title", label: "শিরোনাম" },
      { name: "year", label: "সাল", type: "number" },
      { name: "description", label: "বিবরণ" },
      { name: "sort_order", label: "ক্রম", type: "number" },
    ],
  },
};

const slugIconMap: Record<string, { icon: LucideIcon; gradient: string }> = {
  "doctors": { icon: Stethoscope, gradient: "from-blue-500 to-indigo-500" },
  "hospitals": { icon: Building2, gradient: "from-sky-500 to-blue-500" },
  "pharmacy": { icon: Pill, gradient: "from-emerald-500 to-green-500" },
  "education": { icon: GraduationCap, gradient: "from-violet-500 to-purple-500" },
  "shops": { icon: Store, gradient: "from-amber-500 to-orange-500" },
  "marketplace": { icon: ShoppingBag, gradient: "from-pink-500 to-rose-500" },
  "jobs": { icon: Briefcase, gradient: "from-cyan-500 to-teal-500" },
  "lost-found": { icon: SearchX, gradient: "from-orange-500 to-red-500" },
  "events": { icon: CalendarHeart, gradient: "from-fuchsia-500 to-pink-500" },
  "expatriate": { icon: Plane, gradient: "from-indigo-500 to-blue-500" },
  "ambulance": { icon: Ambulance, gradient: "from-red-500 to-rose-500" },
  "police": { icon: ShieldAlert, gradient: "from-slate-600 to-blue-600" },
  "fire": { icon: Flame, gradient: "from-orange-600 to-red-600" },
  "transport": { icon: Bus, gradient: "from-teal-500 to-cyan-500" },
  "electricity": { icon: Lightbulb, gradient: "from-yellow-500 to-amber-500" },
  "legal": { icon: Scale, gradient: "from-gray-500 to-slate-600" },
  "bank": { icon: Landmark, gradient: "from-emerald-600 to-teal-600" },
  "organizations": { icon: UsersRound, gradient: "from-purple-500 to-indigo-500" },
  "tourism": { icon: MapPin, gradient: "from-green-500 to-emerald-500" },
  "courier": { icon: Package, gradient: "from-amber-600 to-orange-500" },
  "agriculture": { icon: Tractor, gradient: "from-lime-600 to-green-600" },
  "rent": { icon: Home, gradient: "from-blue-600 to-indigo-600" },
  "tuition": { icon: BookOpen, gradient: "from-violet-600 to-purple-600" },
  "food": { icon: UtensilsCrossed, gradient: "from-red-500 to-orange-500" },
  "repair": { icon: Wrench, gradient: "from-zinc-500 to-slate-600" },
  "deed-writer": { icon: ScrollText, gradient: "from-amber-700 to-yellow-600" },
  "marriage": { icon: HeartHandshake, gradient: "from-rose-500 to-pink-500" },
  "diagnostic": { icon: Microscope, gradient: "from-cyan-600 to-blue-600" },
  "car-rental": { icon: Car, gradient: "from-blue-500 to-sky-500" },
  "municipal": { icon: Building, gradient: "from-slate-500 to-zinc-600" },
  "entrepreneur": { icon: Rocket, gradient: "from-orange-500 to-amber-500" },
  "hotel": { icon: Hotel, gradient: "from-indigo-500 to-violet-500" },
  "restaurant": { icon: Coffee, gradient: "from-amber-600 to-brown-500" },
  "video": { icon: Video, gradient: "from-red-600 to-rose-600" },
  "nursery": { icon: Flower2, gradient: "from-green-500 to-lime-500" },
};

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
  const [newsForm, setNewsForm] = useState({ title: "", body: "", thumbnail_url: "", published_at: "" });
  const [newsEditId, setNewsEditId] = useState<string | null>(null);
  const [newsUploading, setNewsUploading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sliderItems, setSliderItems] = useState<any[]>([]);
  const [sliderForm, setSliderForm] = useState({ title: "", image_url: "", sort_order: 0 });
  const [sliderEditId, setSliderEditId] = useState<string | null>(null);
  const [sliderUploading, setSliderUploading] = useState(false);
  const [adItems, setAdItems] = useState<any[]>([]);
  const [adForm, setAdForm] = useState({ title: "", description: "", image_url: "", link_url: "", sort_order: 0, expire_at: "" });
  const [adEditId, setAdEditId] = useState<string | null>(null);
  const [adUploading, setAdUploading] = useState(false);
  // New states for add service form
  const [showAddService, setShowAddService] = useState(false);
  const [addServiceCategoryId, setAddServiceCategoryId] = useState<string>("");
  // Legacy add form
  const [showLegacyForm, setShowLegacyForm] = useState(false);
  const [legacyForm, setLegacyForm] = useState<Record<string, string>>({});
  const [legacyEditId, setLegacyEditId] = useState<string | null>(null);
  // About content form
  const [aboutForm, setAboutForm] = useState({ article_title: "", article_body: "", meta_description: "" });
  const [aboutLoaded, setAboutLoaded] = useState(false);
  const [aboutSaving, setAboutSaving] = useState(false);

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

  const fetchLegacyData = useCallback(async (tabName: string) => {
    const legacyTabs: Record<string, string> = {
      emergency: "emergency_calls", blood: "blood_donors", donations: "donations",
      announcements: "announcements", about: "about_content", timeline: "timeline_events",
    };
    if (!legacyTabs[tabName]) return;
    setLoading(true);
    const { data } = await (supabase.from as any)(legacyTabs[tabName]).select("*").order("created_at", { ascending: false });
    setLegacyData(data || []);
    setLoading(false);
  }, []);

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
      announcements: "announcements", about: "about_content", timeline: "timeline_events",
    };
    if (legacyTabs[activeTab]) {
      fetchLegacyData(activeTab);
    }
    if (activeTab === "about" && !aboutLoaded) {
      const fetchAbout = async () => {
        const { data } = await (supabase.from as any)("about_content").select("*").limit(1).single();
        if (data) {
          setAboutForm({ article_title: data.article_title || "", article_body: data.article_body || "", meta_description: data.meta_description || "" });
          setAboutLoaded(true);
        }
      };
      fetchAbout();
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
    if (activeTab === "slider") {
      const fetchSlider = async () => {
        setLoading(true);
        const { data } = await (supabase.from as any)("slider_items").select("*").order("sort_order");
        setSliderItems(data || []);
        setLoading(false);
      };
      fetchSlider();
    }
    if (activeTab === "advertisements" || activeTab === "dashboard") {
      const fetchAds = async () => {
        setLoading(true);
        const { data } = await (supabase.from as any)("advertisements").select("*").order("sort_order");
        setAdItems(data || []);
        setLoading(false);
      };
      fetchAds();
    }
    // Reset legacy form when tab changes
    setShowLegacyForm(false);
    setLegacyForm({});
    setLegacyEditId(null);
  }, [activeTab, fetchLegacyData]);

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
    setEditData({ title: item.title, description: item.description || "", phone: item.phone || "", whatsapp: item.whatsapp || "", address: item.address || "", area: item.area || "", category_id: item.category_id || "", image_url: item.image_url || "" });
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
    const publishedAt = newsForm.published_at ? new Date(newsForm.published_at).toISOString() : new Date().toISOString();
    if (newsEditId) {
      await supabase.from("news").update({ title: newsForm.title, body: newsForm.body, thumbnail_url: newsForm.thumbnail_url || null, published_at: publishedAt }).eq("id", newsEditId);
      await logActivity("edited", "news", newsEditId, newsForm.title);
      toast({ title: "নিউজ আপডেট হয়েছে ✅" });
    } else {
      await supabase.from("news").insert({ title: newsForm.title, body: newsForm.body, thumbnail_url: newsForm.thumbnail_url || null, published_at: publishedAt });
      await logActivity("created", "news", undefined, newsForm.title);
      toast({ title: "নিউজ প্রকাশিত হয়েছে ✅" });
    }
    setNewsForm({ title: "", body: "", thumbnail_url: "", published_at: "" });
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

  // Legacy CRUD
  const saveLegacyItem = async () => {
    const config = legacyTableConfig[activeTab];
    if (!config) return;
    const requiredField = config.fields[0].name;
    if (!legacyForm[requiredField]?.trim()) {
      toast({ title: `${config.fields[0].label} দিন`, variant: "destructive" });
      return;
    }
    const insertData: Record<string, any> = {};
    config.fields.forEach(f => {
      if (legacyForm[f.name] !== undefined && legacyForm[f.name] !== "") {
        insertData[f.name] = f.type === "number" ? parseInt(legacyForm[f.name]) || 0 : legacyForm[f.name];
      }
    });
    // Set defaults for approval
    if (activeTab === "blood") insertData.is_approved = true;
    if (activeTab === "emergency") insertData.is_active = true;

    if (legacyEditId) {
      await (supabase.from as any)(config.table).update(insertData).eq("id", legacyEditId);
      await logActivity("edited", config.table, legacyEditId, legacyForm[requiredField]);
      toast({ title: "আপডেট হয়েছে ✅" });
    } else {
      await (supabase.from as any)(config.table).insert(insertData);
      await logActivity("created", config.table, undefined, legacyForm[requiredField]);
      toast({ title: "সফলভাবে যোগ হয়েছে ✅" });
    }
    setShowLegacyForm(false);
    setLegacyForm({});
    setLegacyEditId(null);
    fetchLegacyData(activeTab);
  };

  const deleteLegacyItem = async (id: string, name: string) => {
    const config = legacyTableConfig[activeTab];
    if (!config) return;
    if (!confirm("মুছে ফেলতে চান?")) return;
    await (supabase.from as any)(config.table).delete().eq("id", id);
    await logActivity("deleted", config.table, id, name);
    toast({ title: "মুছে ফেলা হয়েছে" });
    setLegacyData(legacyData.filter(d => d.id !== id));
  };

  const startLegacyEdit = (item: any) => {
    const config = legacyTableConfig[activeTab];
    if (!config) return;
    const formData: Record<string, string> = {};
    config.fields.forEach(f => {
      formData[f.name] = item[f.name]?.toString() || "";
    });
    setLegacyForm(formData);
    setLegacyEditId(item.id);
    setShowLegacyForm(true);
  };

  const activeTabData = allTabs.find(t => t.id === activeTab);

  // Open add service form for a specific category
  const openAddServiceForCategory = (categoryId: string) => {
    setAddServiceCategoryId(categoryId);
    setShowAddService(true);
    setActiveTab("services");
    setFilterCategory(categoryId);
    setSidebarOpen(false);
  };

  // ===================== RENDER SECTIONS =====================

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Pending Alert */}
      {counts.pending > 0 && (
        <button onClick={() => setActiveTab("pending")} className="w-full group">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 hover:border-amber-300 dark:hover:border-amber-700 transition-all">
            <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-amber-800 dark:text-amber-200 text-sm">{counts.pending}টি অনুমোদন অপেক্ষমান</p>
              <p className="text-xs text-amber-600/80 dark:text-amber-400/80">ট্যাপ করে রিভিউ করুন</p>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      )}

      {/* Stats */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" /> পরিসংখ্যান
          </h3>
          <button onClick={() => fetchCounts()} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
            <RefreshCw className="w-3 h-3" /> রিফ্রেশ
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "মোট সেবা", count: counts.total, icon: Globe, gradient: "from-blue-500 to-cyan-500" },
            { label: "অনুমোদিত", count: counts.approved, icon: CheckCircle, gradient: "from-emerald-500 to-teal-500" },
            { label: "অপেক্ষমান", count: counts.pending, icon: Clock, gradient: "from-amber-500 to-orange-500" },
            { label: "প্রত্যাখ্যাত", count: counts.rejected, icon: XCircle, gradient: "from-rose-500 to-red-500" },
            { label: "ফিচার্ড", count: counts.featured, icon: Star, gradient: "from-yellow-500 to-amber-500" },
            { label: "ক্যাটাগরি", count: counts.categories, icon: Layers, gradient: "from-violet-500 to-purple-500" },
          ].map((s) => (
            <div key={s.label} className="relative overflow-hidden rounded-2xl bg-card border border-border p-4 group hover:shadow-md transition-all">
              <div className={`absolute top-0 right-0 w-20 h-20 rounded-full bg-gradient-to-br ${s.gradient} opacity-[0.07] -translate-y-1/3 translate-x-1/3 group-hover:opacity-[0.12] transition-opacity`} />
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-3`}>
                <s.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-2xl font-bold text-foreground">{s.count}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Charts */}
      <AnalyticsCharts categories={categories} adItems={adItems} />

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-accent" /> দ্রুত অ্যাকশন
        </h3>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: "অপেক্ষমান", tab: "pending" as Tab, icon: Clock, desc: "রিভিউ", gradient: "from-amber-500 to-orange-500" },
            { label: "সকল সেবা", tab: "services" as Tab, icon: Globe, desc: "সেবা", gradient: "from-blue-500 to-cyan-500" },
            { label: "নিউজ", tab: "news" as Tab, icon: Newspaper, desc: "প্রকাশ", gradient: "from-emerald-500 to-teal-500" },
            { label: "ক্যাটাগরি", tab: "categories" as Tab, icon: Layers, desc: "ম্যানেজ", gradient: "from-violet-500 to-purple-500" },
            { label: "ইউজার", tab: "users" as Tab, icon: Users, desc: "তালিকা", gradient: "from-pink-500 to-rose-500" },
            { label: "লগ", tab: "activity" as Tab, icon: Activity, desc: "দেখুন", gradient: "from-slate-500 to-zinc-500" },
          ].map((a) => (
            <button key={a.label} onClick={() => { setActiveTab(a.tab); setSidebarOpen(false); }}
              className="bg-card border border-border rounded-2xl p-3 text-left hover:shadow-md hover:border-primary/20 transition-all group">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${a.gradient} flex items-center justify-center mb-2 group-hover:scale-105 transition-transform`}>
                <a.icon className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-xs font-bold text-foreground leading-tight">{a.label}</p>
              <p className="text-[10px] text-muted-foreground">{a.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Service Editors Grid - with + buttons */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" /> সার্ভিস পেজে ডাটা যোগ করুন
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {categories.filter((c: any) => c.is_active).map((cat: any) => {
            const match = slugIconMap[cat.slug] || { icon: Globe, gradient: "from-gray-500 to-slate-500" };
            const IconComp = match.icon;
            return (
              <div key={cat.id} className="bg-card border border-border rounded-2xl p-3 hover:shadow-md hover:border-primary/20 transition-all group relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-12 h-12 rounded-full bg-gradient-to-br ${match.gradient} opacity-[0.06] -translate-y-1/3 translate-x-1/3 group-hover:opacity-[0.12] transition-opacity`} />
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${match.gradient} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                    <IconComp className="w-3.5 h-3.5 text-white" />
                  </div>
                  <button
                    onClick={() => openAddServiceForCategory(cat.id)}
                    className="w-7 h-7 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                    title={`${cat.name} এ নতুন সেবা যোগ করুন`}
                  >
                    <Plus className="w-3.5 h-3.5 text-primary" />
                  </button>
                </div>
                <p className="text-xs font-bold text-foreground leading-tight truncate">{cat.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => { setActiveTab("services"); setFilterCategory(cat.id); setSidebarOpen(false); }}
                    className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-0.5 transition-colors"
                  >
                    <Eye className="w-2.5 h-2.5" /> দেখুন
                  </button>
                  <button
                    onClick={() => openAddServiceForCategory(cat.id)}
                    className="text-[10px] text-primary font-semibold flex items-center gap-0.5"
                  >
                    <Plus className="w-2.5 h-2.5" /> যোগ করুন
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content Editors Grid */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-accent" /> কন্টেন্ট এডিটর
        </h3>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: "ঘোষণা", tab: "announcements" as Tab, icon: Megaphone, gradient: "from-red-500 to-rose-500" },
            { label: "স্লাইডার", tab: "slider" as Tab, icon: SlidersHorizontal, gradient: "from-blue-500 to-sky-500" },
            { label: "বিজ্ঞাপন", tab: "advertisements" as Tab, icon: ImageIcon, gradient: "from-yellow-500 to-orange-500" },
            { label: "সম্পর্কে", tab: "about" as Tab, icon: Info, gradient: "from-teal-500 to-cyan-500" },
            { label: "টাইমলাইন", tab: "timeline" as Tab, icon: History, gradient: "from-violet-500 to-indigo-500" },
            { label: "জরুরি কল", tab: "emergency" as Tab, icon: Phone, gradient: "from-orange-500 to-amber-500" },
            { label: "রক্তদাতা", tab: "blood" as Tab, icon: Droplets, gradient: "from-red-600 to-rose-500" },
            { label: "অনুদান", tab: "donations" as Tab, icon: Heart, gradient: "from-pink-500 to-fuchsia-500" },
            { label: "নিউজ", tab: "news" as Tab, icon: Newspaper, gradient: "from-emerald-500 to-green-500" },
            { label: "সেটিংস", tab: "site_settings" as Tab, icon: Settings, gradient: "from-slate-500 to-gray-500" },
          ].map((item) => (
            <button key={item.label} onClick={() => { setActiveTab(item.tab); setSidebarOpen(false); }}
              className="bg-card border border-border rounded-2xl p-3 text-left hover:shadow-md hover:border-primary/20 transition-all group relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-12 h-12 rounded-full bg-gradient-to-br ${item.gradient} opacity-[0.06] -translate-y-1/3 translate-x-1/3 group-hover:opacity-[0.12] transition-opacity`} />
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-2 group-hover:scale-105 transition-transform`}>
                <item.icon className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-xs font-bold text-foreground leading-tight">{item.label}</p>
              <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                <ArrowUpRight className="w-2.5 h-2.5" /> ম্যানেজ
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderServicesList = () => (
    <div className="space-y-4">
      {/* Add Service Form */}
      {showAddService && (
        <AddServiceForm
          categories={categories}
          preselectedCategoryId={addServiceCategoryId}
          onClose={() => { setShowAddService(false); setAddServiceCategoryId(""); }}
          onSaved={() => { fetchServices(); fetchCounts(); }}
          logActivity={logActivity}
        />
      )}

      {/* Search & Filters */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="নাম, ফোন বা ঠিকানা দিয়ে খুঁজুন..." className="w-full bg-muted/50 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none border border-border focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          {!showAddService && (
            <button
              onClick={() => { setShowAddService(true); setAddServiceCategoryId(filterCategory !== "all" ? filterCategory : ""); }}
              className="shrink-0 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" /> যোগ করুন
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {activeTab !== "pending" && (
            <select className="bg-muted/50 rounded-xl px-3 py-2 text-xs border border-border focus:border-primary/40 outline-none" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">সকল স্ট্যাটাস</option>
              <option value="approved">অনুমোদিত</option>
              <option value="pending">অপেক্ষমান</option>
              <option value="rejected">প্রত্যাখ্যাত</option>
            </select>
          )}
          <select className="bg-muted/50 rounded-xl px-3 py-2 text-xs border border-border focus:border-primary/40 outline-none" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">সকল ক্যাটাগরি</option>
            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="flex-1" />
          <span className="text-xs text-muted-foreground flex items-center gap-1 bg-muted/50 px-3 py-2 rounded-xl">
            <Hash className="w-3 h-3" /> {filteredServices.length}টি
          </span>
        </div>
      </div>

      {loading ? <LoadingState /> : filteredServices.length === 0 ? <EmptyState /> : (
        <div className="space-y-3">
          {filteredServices.map((item: any) => (
            <div key={item.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-all">
              {editingId === item.id ? (
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Edit3 className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">এডিট মোড</span>
                  </div>
                  <input className="w-full bg-muted/50 rounded-xl px-4 py-2.5 text-sm border border-border focus:border-primary/40 focus:ring-2 focus:ring-primary/10 outline-none transition-all" value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} placeholder="শিরোনাম" />
                  <textarea className="w-full bg-muted/50 rounded-xl px-4 py-2.5 text-sm border border-border min-h-[70px] focus:border-primary/40 focus:ring-2 focus:ring-primary/10 outline-none transition-all resize-none" value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} placeholder="বিবরণ" />
                  <div className="grid grid-cols-2 gap-2">
                    <input className="bg-muted/50 rounded-xl px-4 py-2.5 text-sm border border-border focus:border-primary/40 outline-none" value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} placeholder="📞 ফোন" />
                    <input className="bg-muted/50 rounded-xl px-4 py-2.5 text-sm border border-border focus:border-primary/40 outline-none" value={editData.whatsapp} onChange={(e) => setEditData({ ...editData, whatsapp: e.target.value })} placeholder="💬 WhatsApp" />
                  </div>
                  <input className="w-full bg-muted/50 rounded-xl px-4 py-2.5 text-sm border border-border focus:border-primary/40 outline-none" value={editData.address} onChange={(e) => setEditData({ ...editData, address: e.target.value })} placeholder="📍 ঠিকানা" />
                  <select className="w-full bg-muted/50 rounded-xl px-4 py-2.5 text-sm border border-border focus:border-primary/40 outline-none" value={editData.category_id} onChange={(e) => setEditData({ ...editData, category_id: e.target.value })}>
                    <option value="">ক্যাটাগরি নির্বাচন</option>
                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">ছবি</label>
                    <input className="w-full bg-muted/50 rounded-xl px-4 py-2.5 text-sm border border-border focus:border-primary/40 outline-none" value={editData.image_url} onChange={(e) => setEditData({ ...editData, image_url: e.target.value })} placeholder="ছবির লিংক (URL)" />
                    <div className="flex items-center gap-3 mt-2">
                      <label className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold cursor-pointer bg-primary/10 px-4 py-2 rounded-xl hover:bg-primary/15 transition-colors">
                        <ImageIcon className="w-3.5 h-3.5" /> আপলোড
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const ext = file.name.split(".").pop();
                          const path = `services/${Date.now()}.${ext}`;
                          const { error } = await supabase.storage.from("media").upload(path, file);
                          if (error) { toast({ title: "আপলোড ব্যর্থ", variant: "destructive" }); return; }
                          const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
                          setEditData({ ...editData, image_url: urlData.publicUrl });
                        }} />
                      </label>
                      {editData.image_url && <img src={editData.image_url} alt="" className="w-10 h-10 rounded-xl object-cover border border-border" />}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => saveEdit(item.id)} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                      <Save className="w-4 h-4" /> সেভ করুন
                    </button>
                    <button onClick={() => setEditingId(null)} className="px-5 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors">
                      বাতিল
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <div className="flex gap-3">
                    {item.image_url && (
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-muted">
                        <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-bold text-foreground text-sm truncate">{item.title}</h3>
                            {item.is_featured && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.service_categories?.name || "—"}</p>
                        </div>
                        <StatusBadge status={item.status} />
                      </div>
                      {item.phone && <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1"><Phone className="w-3 h-3" /> {item.phone}</p>}
                      {item.address && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">📍 {item.address}</p>}
                      {item.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{item.description}</p>}
                      <p className="text-[10px] text-muted-foreground/60 mt-1.5 flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" /> {new Date(item.created_at).toLocaleDateString("bn-BD")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 mt-3 pt-3 border-t border-border/50 flex-wrap">
                    {item.status !== "approved" && (
                      <ActionBtn variant="success" onClick={() => updateServiceStatus(item.id, "approved", item.title)} icon={<CheckCircle className="w-3.5 h-3.5" />} label="অনুমোদন" />
                    )}
                    {item.status !== "rejected" && (
                      <ActionBtn variant="danger" onClick={() => updateServiceStatus(item.id, "rejected", item.title)} icon={<XCircle className="w-3.5 h-3.5" />} label="প্রত্যাখ্যান" />
                    )}
                    <ActionBtn variant="warning" onClick={() => toggleFeatured(item.id, item.is_featured, item.title)} icon={item.is_featured ? <StarOff className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />} label={item.is_featured ? "আনফিচার" : "ফিচার"} />
                    <ActionBtn variant="info" onClick={() => startEdit(item)} icon={<Edit3 className="w-3.5 h-3.5" />} label="এডিট" />
                    <ActionBtn variant="danger" onClick={() => deleteService(item.id, item.title)} icon={<Trash2 className="w-3.5 h-3.5" />} label="মুছুন" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCategories = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-bold text-foreground">ক্যাটাগরি তালিকা</h2>
        <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">{categories.length}টি</span>
      </div>
      {categories.map((c: any, i: number) => (
        <div key={c.id} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between hover:shadow-sm transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-sm font-bold text-primary">
              {i + 1}
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">{c.name}</h3>
              <p className="text-xs text-muted-foreground">/{c.slug} • {c.icon}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openAddServiceForCategory(c.id)}
              className="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
              title="নতুন সেবা যোগ করুন"
            >
              <Plus className="w-4 h-4 text-primary" />
            </button>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${c.is_active ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}>
              {c.is_active ? "✅ সক্রিয়" : "⏸ নিষ্ক্রিয়"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderActivity = () => (
    <div className="space-y-3">
      {loading ? <LoadingState /> : activityLog.length === 0 ? <EmptyState /> : (
        activityLog.map((log: any) => (
          <div key={log.id} className="bg-card border border-border rounded-2xl p-4 flex items-start gap-3 hover:shadow-sm transition-all">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              log.action === "approved" ? "bg-emerald-500/10 text-emerald-600" : 
              log.action === "deleted" ? "bg-red-500/10 text-red-600" : 
              log.action === "edited" ? "bg-blue-500/10 text-blue-600" :
              log.action === "rejected" ? "bg-orange-500/10 text-orange-600" :
              "bg-muted text-muted-foreground"
            }`}>
              {log.action === "approved" ? <CheckCircle className="w-4 h-4" /> : 
               log.action === "deleted" ? <Trash2 className="w-4 h-4" /> : 
               log.action === "edited" ? <Edit3 className="w-4 h-4" /> :
               log.action === "rejected" ? <XCircle className="w-4 h-4" /> :
               <Activity className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground capitalize">{log.action}</p>
              {log.table_name && <p className="text-xs text-muted-foreground mt-0.5">{log.table_name}{log.details ? ` — ${log.details}` : ""}</p>}
              <p className="text-[10px] text-muted-foreground/60 mt-1">{new Date(log.created_at).toLocaleString("bn-BD")}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-bold text-foreground">ইউজার তালিকা</h2>
        <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">{usersList.length}জন</span>
      </div>
      {loading ? <LoadingState /> : (
        usersList.map((user: any) => (
          <div key={user.id} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 hover:shadow-sm transition-all">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <span className="text-base font-bold text-primary">{(user.display_name || "U").charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-foreground truncate">{user.display_name || "No Name"}</h3>
              <p className="text-xs text-muted-foreground">{user.phone || "—"}</p>
            </div>
            <div className="flex gap-1.5">
              {user.roles.map((r: string) => (
                <span key={r} className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${
                  r === "admin" ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20" : "bg-muted text-muted-foreground"
                }`}>
                  {r === "admin" ? "🛡️ " : "👤 "}{r}
                </span>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderLegacy = () => {
    const config = legacyTableConfig[activeTab];
    const hasCRUD = !!config;

    if (loading) return <LoadingState />;

    return (
      <div className="space-y-4">
        {/* Add form for legacy sections */}
        {hasCRUD && (
          <>
            {showLegacyForm ? (
              <div className="bg-card border-2 border-primary/20 rounded-2xl p-5 space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-primary" />
                    </div>
                    <h2 className="text-sm font-bold text-foreground">
                      {legacyEditId ? "এডিট করুন" : "নতুন যোগ করুন"}
                    </h2>
                  </div>
                  <button onClick={() => { setShowLegacyForm(false); setLegacyForm({}); setLegacyEditId(null); }} className="w-8 h-8 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                {config.fields.map((field) => (
                  <div key={field.name}>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{field.label}</label>
                    {field.type === "select" && field.options ? (
                      <select
                        className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40 transition-all"
                        value={legacyForm[field.name] || ""}
                        onChange={(e) => setLegacyForm({ ...legacyForm, [field.name]: e.target.value })}
                      >
                        <option value="">নির্বাচন করুন</option>
                        {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input
                        type={field.type === "number" ? "number" : "text"}
                        className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                        placeholder={field.label}
                        value={legacyForm[field.name] || ""}
                        onChange={(e) => setLegacyForm({ ...legacyForm, [field.name]: e.target.value })}
                      />
                    )}
                  </div>
                ))}
                <button
                  onClick={saveLegacyItem}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <Save className="w-4 h-4" /> {legacyEditId ? "আপডেট করুন" : "যোগ করুন"}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLegacyForm(true)}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 text-primary text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/10 transition-colors"
              >
                <Plus className="w-4 h-4" /> নতুন {activeTabData?.label} যোগ করুন
              </button>
            )}
          </>
        )}

        {/* Data list */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground flex items-center gap-1"><Hash className="w-3 h-3" /> মোট: {legacyData.length}টি</span>
        </div>
        {legacyData.length === 0 ? <EmptyState /> : legacyData.map((item: any) => {
          const name = item.title || item.name || item.text || item.method_name || item.article_title || item.donor_name || item.item_name || `${item.year || ""}`;
          return (
            <div key={item.id} className="bg-card border border-border rounded-2xl p-4 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-foreground">{name}</h3>
                  {item.phone && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Phone className="w-3 h-3" /> {item.phone}</p>}
                  {item.blood_group && <p className="text-xs text-muted-foreground mt-0.5">🩸 {item.blood_group}</p>}
                  {item.address && <p className="text-xs text-muted-foreground mt-0.5">📍 {item.address}</p>}
                  {item.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description}</p>}
                  {item.year && <p className="text-xs text-muted-foreground mt-0.5">📅 {item.year}</p>}
                  <p className="text-[10px] text-muted-foreground/60 mt-1.5 flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" /> {new Date(item.created_at).toLocaleDateString("bn-BD")}
                  </p>
                </div>
                {/* Active/Approved badge */}
                {item.is_active !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${item.is_active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                    {item.is_active ? "✅" : "⏸"}
                  </span>
                )}
                {item.is_approved !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${item.is_approved ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                    {item.is_approved ? "✅" : "🕐"}
                  </span>
                )}
              </div>
              {/* Actions */}
              {hasCRUD && (
                <div className="flex gap-1.5 mt-3 pt-3 border-t border-border/50 flex-wrap">
                  <ActionBtn variant="info" onClick={() => startLegacyEdit(item)} icon={<Edit3 className="w-3 h-3" />} label="এডিট" />
                  <ActionBtn variant="danger" onClick={() => deleteLegacyItem(item.id, name)} icon={<Trash2 className="w-3 h-3" />} label="মুছুন" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderNews = () => (
    <div className="space-y-4">
      {/* News Form */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Newspaper className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-sm font-bold text-foreground">{newsEditId ? "নিউজ এডিট" : "নতুন নিউজ যোগ করুন"}</h2>
        </div>
        <input className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all" placeholder="নিউজ শিরোনাম" value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} />
        <textarea className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none min-h-[180px] focus:border-primary/40 focus:ring-2 focus:ring-primary/10 font-mono transition-all resize-none" placeholder="বিস্তারিত নিউজ (HTML সাপোর্টেড)..." value={newsForm.body} onChange={(e) => setNewsForm({ ...newsForm, body: e.target.value })} />
        <p className="text-[10px] text-muted-foreground">HTML কোড পেস্ট করতে পারবেন — হেডিং, কালার, বুলেট পয়েন্ট, এলাইনমেন্ট ইত্যাদি সাপোর্টেড</p>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">প্রকাশের তারিখ ও সময়</label>
          <input type="datetime-local" className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all" value={newsForm.published_at} onChange={(e) => setNewsForm({ ...newsForm, published_at: e.target.value })} />
          <p className="text-[10px] text-muted-foreground mt-1">খালি রাখলে বর্তমান সময় ব্যবহার হবে</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-xs text-primary font-semibold cursor-pointer bg-primary/10 px-4 py-2.5 rounded-xl hover:bg-primary/15 transition-colors">
            <ImageIcon className="w-4 h-4" /> {newsUploading ? "আপলোড হচ্ছে..." : "থাম্বনেইল"}
            <input type="file" accept="image/*" className="hidden" onChange={handleNewsUpload} disabled={newsUploading} />
          </label>
          {newsForm.thumbnail_url && <img src={newsForm.thumbnail_url} alt="thumb" className="w-14 h-14 rounded-xl object-cover border border-border" />}
        </div>
        <div className="flex gap-2">
          <button onClick={saveNews} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
            <Save className="w-4 h-4" /> {newsEditId ? "আপডেট" : "প্রকাশ করুন"}
          </button>
          {newsEditId && (
            <button onClick={() => { setNewsEditId(null); setNewsForm({ title: "", body: "", thumbnail_url: "", published_at: "" }); }} className="px-5 py-3 rounded-xl bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors">
              বাতিল
            </button>
          )}
        </div>
      </div>

      {/* News List */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground flex items-center gap-1"><Hash className="w-3 h-3" /> {newsItems.length}টি নিউজ</span>
      </div>
      {loading ? <LoadingState /> : newsItems.map((item: any) => (
        <div key={item.id} className="bg-card border border-border rounded-2xl p-4 flex gap-3 hover:shadow-sm transition-all">
          <div className="w-20 h-16 rounded-xl bg-muted overflow-hidden shrink-0">
            {item.thumbnail_url ? (
              <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><Newspaper className="w-5 h-5 text-muted-foreground/30" /></div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-sm line-clamp-1">{item.title}</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              {new Date(item.published_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
            </p>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              <ActionBtn variant="info" onClick={() => { setNewsEditId(item.id); setNewsForm({ title: item.title, body: item.body || "", thumbnail_url: item.thumbnail_url || "", published_at: item.published_at ? new Date(item.published_at).toISOString().slice(0, 16) : "" }); }} icon={<Edit3 className="w-3 h-3" />} label="এডিট" />
              <button onClick={() => toggleNewsActive(item.id, item.is_active)}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-colors ${item.is_active ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                {item.is_active ? "✅ সক্রিয়" : "⏸ নিষ্ক্রিয়"}
              </button>
              <ActionBtn variant="danger" onClick={() => deleteNews(item.id, item.title)} icon={<Trash2 className="w-3 h-3" />} label="মুছুন" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const saveAboutContent = async () => {
    setAboutSaving(true);
    const { data: existing } = await (supabase.from as any)("about_content").select("id").limit(1).single();
    if (existing) {
      await (supabase.from as any)("about_content").update({
        article_title: aboutForm.article_title,
        article_body: aboutForm.article_body,
        meta_description: aboutForm.meta_description || null,
      }).eq("id", existing.id);
    } else {
      await (supabase.from as any)("about_content").insert({
        article_title: aboutForm.article_title,
        article_body: aboutForm.article_body,
        meta_description: aboutForm.meta_description || null,
      });
    }
    await logActivity("edited", "about_content", undefined, aboutForm.article_title);
    toast({ title: "আর্টিকেল আপডেট হয়েছে ✅" });
    setAboutSaving(false);
  };

  const renderAbout = () => (
    <div className="space-y-6">
      {/* Article Editor */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">আর্টিকেল এডিট করুন</h2>
            <p className="text-[10px] text-muted-foreground">রামগঞ্জ সম্পর্কে পেজের মূল কন্টেন্ট</p>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">আর্টিকেল শিরোনাম</label>
          <input
            className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
            placeholder="যেমন: রামগঞ্জ সম্পর্কে"
            value={aboutForm.article_title}
            onChange={(e) => setAboutForm({ ...aboutForm, article_title: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">মেটা বিবরণ (SEO)</label>
          <input
            className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
            placeholder="সার্চ ইঞ্জিনে দেখানো হবে (ঐচ্ছিক)"
            value={aboutForm.meta_description}
            onChange={(e) => setAboutForm({ ...aboutForm, meta_description: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">আর্টিকেল বডি</label>
          <textarea
            className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none min-h-[250px] focus:border-primary/40 focus:ring-2 focus:ring-primary/10 font-mono transition-all resize-y"
            placeholder="রামগঞ্জ সম্পর্কে বিস্তারিত লিখুন..."
            value={aboutForm.article_body}
            onChange={(e) => setAboutForm({ ...aboutForm, article_body: e.target.value })}
          />
          <p className="text-[10px] text-muted-foreground mt-1">নতুন লাইনে লিখলে নতুন প্যারাগ্রাফ তৈরি হবে</p>
        </div>
        <button
          onClick={saveAboutContent}
          disabled={aboutSaving}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {aboutSaving ? "সেভ হচ্ছে..." : "আর্টিকেল সেভ করুন"}
        </button>
      </div>

      {/* Timeline Management Section */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
              <History className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">টাইমলাইন ম্যানেজমেন্ট</h2>
              <p className="text-[10px] text-muted-foreground">ঐতিহাসিক ইভেন্ট যোগ/এডিট করুন</p>
            </div>
          </div>
          <button
            onClick={() => { setActiveTab("timeline"); }}
            className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
          >
            সব দেখুন <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <button
          onClick={() => { setActiveTab("timeline"); setShowLegacyForm(true); }}
          className="w-full py-3 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 text-primary text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/10 transition-colors"
        >
          <Plus className="w-4 h-4" /> নতুন টাইমলাইন ইভেন্ট যোগ করুন
        </button>
      </div>
    </div>
  );

  const renderSiteSettings = () => <SiteSettingsPanel />;

  const refreshSliderItems = async () => {
    const { data } = await (supabase.from as any)("slider_items").select("*").order("sort_order");
    setSliderItems(data || []);
  };

  const handleSliderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSliderUploading(true);
    const ext = file.name.split(".").pop();
    const path = `slider/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("slider-images").upload(path, file);
    if (error) { toast({ title: "আপলোড ব্যর্থ", variant: "destructive" }); setSliderUploading(false); return; }
    const { data: urlData } = supabase.storage.from("slider-images").getPublicUrl(path);
    setSliderForm({ ...sliderForm, image_url: urlData.publicUrl });
    setSliderUploading(false);
  };

  const saveSlider = async () => {
    if (!sliderForm.title.trim() || !sliderForm.image_url.trim()) {
      toast({ title: "শিরোনাম ও ছবি দিন", variant: "destructive" }); return;
    }
    if (sliderEditId) {
      await (supabase.from as any)("slider_items").update({ title: sliderForm.title, image_url: sliderForm.image_url, sort_order: sliderForm.sort_order }).eq("id", sliderEditId);
      await logActivity("edited", "slider_items", sliderEditId, sliderForm.title);
      toast({ title: "স্লাইডার আপডেট হয়েছে ✅" });
    } else {
      await (supabase.from as any)("slider_items").insert({ title: sliderForm.title, image_url: sliderForm.image_url, sort_order: sliderForm.sort_order });
      await logActivity("created", "slider_items", undefined, sliderForm.title);
      toast({ title: "নতুন স্লাইড যোগ হয়েছে ✅" });
    }
    setSliderForm({ title: "", image_url: "", sort_order: 0 });
    setSliderEditId(null);
    refreshSliderItems();
  };

  const deleteSlider = async (id: string, title: string) => {
    if (!confirm("এই স্লাইড মুছে ফেলতে চান?")) return;
    await (supabase.from as any)("slider_items").delete().eq("id", id);
    await logActivity("deleted", "slider_items", id, title);
    toast({ title: "মুছে ফেলা হয়েছে" });
    setSliderItems(sliderItems.filter((s) => s.id !== id));
  };

  const toggleSliderActive = async (id: string, current: boolean) => {
    await (supabase.from as any)("slider_items").update({ is_active: !current }).eq("id", id);
    setSliderItems(sliderItems.map((s) => s.id === id ? { ...s, is_active: !current } : s));
    toast({ title: !current ? "সক্রিয় করা হয়েছে" : "নিষ্ক্রিয় করা হয়েছে" });
  };

  const renderSlider = () => (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-sm font-bold text-foreground">{sliderEditId ? "স্লাইড এডিট" : "নতুন স্লাইড যোগ করুন"}</h2>
        </div>
        <input className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all" placeholder="স্লাইড শিরোনাম" value={sliderForm.title} onChange={(e) => setSliderForm({ ...sliderForm, title: e.target.value })} />
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">ক্রম (Sort Order)</label>
          <input type="number" className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all" placeholder="0" value={sliderForm.sort_order} onChange={(e) => setSliderForm({ ...sliderForm, sort_order: parseInt(e.target.value) || 0 })} />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">ছবি</label>
          <input className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all" placeholder="ছবির লিংক (URL)" value={sliderForm.image_url} onChange={(e) => setSliderForm({ ...sliderForm, image_url: e.target.value })} />
          <div className="flex items-center gap-3 mt-2">
            <label className="inline-flex items-center gap-2 text-xs text-primary font-semibold cursor-pointer bg-primary/10 px-4 py-2.5 rounded-xl hover:bg-primary/15 transition-colors">
              <ImageIcon className="w-4 h-4" /> {sliderUploading ? "আপলোড হচ্ছে..." : "ছবি আপলোড"}
              <input type="file" accept="image/*" className="hidden" onChange={handleSliderUpload} disabled={sliderUploading} />
            </label>
            {sliderForm.image_url && <img src={sliderForm.image_url} alt="preview" className="w-20 h-12 rounded-xl object-cover border border-border" />}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={saveSlider} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
            <Save className="w-4 h-4" /> {sliderEditId ? "আপডেট" : "যোগ করুন"}
          </button>
          {sliderEditId && (
            <button onClick={() => { setSliderEditId(null); setSliderForm({ title: "", image_url: "", sort_order: 0 }); }} className="px-5 py-3 rounded-xl bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors">
              বাতিল
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground flex items-center gap-1"><Hash className="w-3 h-3" /> {sliderItems.length}টি স্লাইড</span>
      </div>
      {loading ? <LoadingState /> : sliderItems.length === 0 ? <EmptyState /> : sliderItems.map((item: any) => (
        <div key={item.id} className="bg-card border border-border rounded-2xl p-4 flex gap-3 hover:shadow-sm transition-all">
          <div className="w-24 h-16 rounded-xl bg-muted overflow-hidden shrink-0">
            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-sm line-clamp-1">{item.title}</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">ক্রম: {item.sort_order}</p>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              <ActionBtn variant="info" onClick={() => { setSliderEditId(item.id); setSliderForm({ title: item.title, image_url: item.image_url, sort_order: item.sort_order }); }} icon={<Edit3 className="w-3 h-3" />} label="এডিট" />
              <button onClick={() => toggleSliderActive(item.id, item.is_active)}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-colors ${item.is_active ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                {item.is_active ? "✅ সক্রিয়" : "⏸ নিষ্ক্রিয়"}
              </button>
              <ActionBtn variant="danger" onClick={() => deleteSlider(item.id, item.title)} icon={<Trash2 className="w-3 h-3" />} label="মুছুন" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // ========== ADVERTISEMENTS CRUD ==========
  const handleAdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAdUploading(true);
    const ext = file.name.split(".").pop();
    const path = `ads/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) { toast({ title: "আপলোড ব্যর্থ", variant: "destructive" }); setAdUploading(false); return; }
    const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
    setAdForm({ ...adForm, image_url: urlData.publicUrl });
    setAdUploading(false);
  };

  const saveAd = async () => {
    if (!adForm.title.trim()) { toast({ title: "শিরোনাম দিন", variant: "destructive" }); return; }
    const expireVal = adForm.expire_at ? new Date(adForm.expire_at).toISOString() : null;
    if (adEditId) {
      await (supabase.from as any)("advertisements").update({ title: adForm.title, description: adForm.description || null, image_url: adForm.image_url || null, link_url: adForm.link_url || null, sort_order: adForm.sort_order, expire_at: expireVal }).eq("id", adEditId);
      await logActivity("edited", "advertisements", adEditId, adForm.title);
      toast({ title: "বিজ্ঞাপন আপডেট হয়েছে ✅" });
    } else {
      await (supabase.from as any)("advertisements").insert({ title: adForm.title, description: adForm.description || null, image_url: adForm.image_url || null, link_url: adForm.link_url || null, sort_order: adForm.sort_order, expire_at: expireVal });
      await logActivity("created", "advertisements", undefined, adForm.title);
      toast({ title: "বিজ্ঞাপন যোগ হয়েছে ✅" });
    }
    setAdForm({ title: "", description: "", image_url: "", link_url: "", sort_order: 0, expire_at: "" });
    setAdEditId(null);
    const { data } = await (supabase.from as any)("advertisements").select("*").order("sort_order");
    setAdItems(data || []);
  };

  const deleteAd = async (id: string, title: string) => {
    if (!confirm("এই বিজ্ঞাপন মুছে ফেলতে চান?")) return;
    await (supabase.from as any)("advertisements").delete().eq("id", id);
    await logActivity("deleted", "advertisements", id, title);
    toast({ title: "মুছে ফেলা হয়েছে" });
    setAdItems(adItems.filter((a) => a.id !== id));
  };

  const toggleAdActive = async (id: string, current: boolean) => {
    await (supabase.from as any)("advertisements").update({ is_active: !current }).eq("id", id);
    setAdItems(adItems.map((a) => a.id === id ? { ...a, is_active: !current } : a));
    toast({ title: !current ? "সক্রিয় করা হয়েছে" : "নিষ্ক্রিয় করা হয়েছে" });
  };

  const renderAdvertisements = () => (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-sm font-bold text-foreground">{adEditId ? "বিজ্ঞাপন এডিট" : "নতুন বিজ্ঞাপন যোগ করুন"}</h2>
        </div>
        <input className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all" placeholder="বিজ্ঞাপনের শিরোনাম" value={adForm.title} onChange={(e) => setAdForm({ ...adForm, title: e.target.value })} />
        <input className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all" placeholder="বিবরণ (ঐচ্ছিক)" value={adForm.description} onChange={(e) => setAdForm({ ...adForm, description: e.target.value })} />
        <input className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all" placeholder="লিংক URL (ঐচ্ছিক)" value={adForm.link_url} onChange={(e) => setAdForm({ ...adForm, link_url: e.target.value })} />
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">ক্রম (Sort Order)</label>
          <input type="number" className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all" placeholder="0" value={adForm.sort_order} onChange={(e) => setAdForm({ ...adForm, sort_order: parseInt(e.target.value) || 0 })} />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">মেয়াদ শেষের তারিখ (ঐচ্ছিক)</label>
          <input type="datetime-local" className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all" value={adForm.expire_at} onChange={(e) => setAdForm({ ...adForm, expire_at: e.target.value })} />
          <p className="text-[10px] text-muted-foreground mt-1">খালি রাখলে মেয়াদ শেষ হবে না। সময় পার হলে অটোমেটিক নিষ্ক্রিয় হবে।</p>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">বিজ্ঞাপনের ছবি</label>
          <input className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all" placeholder="ছবির লিংক (URL)" value={adForm.image_url} onChange={(e) => setAdForm({ ...adForm, image_url: e.target.value })} />
          <div className="flex items-center gap-3 mt-2">
            <label className="inline-flex items-center gap-2 text-xs text-primary font-semibold cursor-pointer bg-primary/10 px-4 py-2.5 rounded-xl hover:bg-primary/15 transition-colors">
              <ImageIcon className="w-4 h-4" /> {adUploading ? "আপলোড হচ্ছে..." : "ছবি আপলোড"}
              <input type="file" accept="image/*" className="hidden" onChange={handleAdUpload} disabled={adUploading} />
            </label>
            {adForm.image_url && <img src={adForm.image_url} alt="preview" className="w-20 h-14 rounded-xl object-cover border border-border" />}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={saveAd} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
            <Save className="w-4 h-4" /> {adEditId ? "আপডেট" : "যোগ করুন"}
          </button>
          {adEditId && (
            <button onClick={() => { setAdEditId(null); setAdForm({ title: "", description: "", image_url: "", link_url: "", sort_order: 0, expire_at: "" }); }} className="px-5 py-3 rounded-xl bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors">
              বাতিল
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground flex items-center gap-1"><Hash className="w-3 h-3" /> {adItems.length}টি বিজ্ঞাপন</span>
      </div>
      {loading ? <LoadingState /> : adItems.length === 0 ? <EmptyState /> : adItems.map((item: any) => (
        <div key={item.id} className="bg-card border border-border rounded-2xl p-4 flex gap-3 hover:shadow-sm transition-all">
          {item.image_url ? (
            <div className="w-24 h-16 rounded-xl bg-muted overflow-hidden shrink-0">
              <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <ImageIcon className="w-6 h-6 text-primary/40" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-sm line-clamp-1">{item.title}</h3>
            {item.description && <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{item.description}</p>}
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[10px] text-muted-foreground">ক্রম: {item.sort_order}</p>
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">• 👆 {item.click_count ?? 0} ক্লিক</span>
              {item.expire_at && (
                <span className={`text-[10px] flex items-center gap-0.5 ${new Date(item.expire_at) < new Date() ? "text-red-500 font-semibold" : "text-muted-foreground"}`}>
                  • ⏰ {new Date(item.expire_at) < new Date() ? "মেয়াদ শেষ" : new Date(item.expire_at).toLocaleDateString("bn-BD")}
                </span>
              )}
            </div>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              <ActionBtn variant="info" onClick={() => { setAdEditId(item.id); setAdForm({ title: item.title, description: item.description || "", image_url: item.image_url || "", link_url: item.link_url || "", sort_order: item.sort_order, expire_at: item.expire_at ? new Date(item.expire_at).toISOString().slice(0, 16) : "" }); }} icon={<Edit3 className="w-3 h-3" />} label="এডিট" />
              <button onClick={() => toggleAdActive(item.id, item.is_active)}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-colors ${item.is_active ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                {item.is_active ? "✅ সক্রিয়" : "⏸ নিষ্ক্রিয়"}
              </button>
              <ActionBtn variant="danger" onClick={() => deleteAd(item.id, item.title)} icon={<Trash2 className="w-3 h-3" />} label="মুছুন" />
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
      case "slider": return renderSlider();
      case "advertisements": return renderAdvertisements();
      case "about": return renderAbout();
      case "site_settings": return renderSiteSettings();
      default: return renderLegacy();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Gradient Header */}
      <div className="relative overflow-hidden" style={{ background: "var(--gradient-primary)" }}>
        <div className="flex items-center justify-between px-4 py-5 pb-12 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">অ্যাডমিন প্যানেল</h1>
              <p className="text-[11px] text-white/70">রামগঞ্জ সেবা ম্যানেজমেন্ট</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Menu className="w-5 h-5 text-white" />
            </button>
            {counts.pending > 0 && (
              <button onClick={() => setActiveTab("pending")} className="relative w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">{counts.pending}</span>
              </button>
            )}
            <button onClick={handleLogout} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center" title="লগআউট">
              <LogOut className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-background rounded-t-3xl" />
      </div>

      <div className="flex max-w-6xl mx-auto -mt-2">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-[240px] shrink-0 sticky top-0 h-screen border-r border-border bg-card/40">
          <nav className="flex-1 overflow-y-auto p-3 space-y-5 pt-4">
            {tabGroups.map(group => (
              <div key={group.label}>
                <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/70 font-bold px-3 mb-2">{group.label}</p>
                <div className="space-y-0.5">
                  {group.items.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                          isActive 
                            ? "bg-primary text-primary-foreground shadow-sm" 
                            : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                        }`}>
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{tab.label}</span>
                        {tab.id === "pending" && counts.pending > 0 && (
                          <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${isActive ? "bg-primary-foreground/20" : "bg-destructive text-destructive-foreground"}`}>{counts.pending}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
          <div className="p-3 border-t border-border">
            <div className="px-3 py-2">
              <p className="text-[10px] text-muted-foreground/70 truncate">{currentUser?.email}</p>
              <p className="text-[10px] text-emerald-500 font-medium flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> অনলাইন
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-[280px] bg-card border-r border-border flex flex-col" style={{ animation: "slideInLeft 0.2s ease-out" }}>
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-bold text-foreground">এডমিন প্যানেল</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 rounded-xl bg-muted/80 hover:bg-muted flex items-center justify-center transition-colors">
                  <XIcon className="w-4 h-4 text-foreground" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto p-3 space-y-5">
                {tabGroups.map(group => (
                  <div key={group.label}>
                    <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/70 font-bold px-3 mb-2">{group.label}</p>
                    <div className="space-y-0.5">
                      {group.items.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                          <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                              isActive 
                                ? "bg-primary text-primary-foreground shadow-sm" 
                                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                            }`}>
                            <Icon className="w-4 h-4 shrink-0" />
                            <span>{tab.label}</span>
                            {tab.id === "pending" && counts.pending > 0 && (
                              <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-primary-foreground/20" : "bg-destructive text-destructive-foreground"}`}>{counts.pending}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
              <div className="p-4 border-t border-border">
                <p className="text-xs text-muted-foreground truncate px-1">{currentUser?.email}</p>
                <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors mt-2">
                  <LogOut className="w-4 h-4" /> লগআউট
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Mobile Tab Scroller */}
          <div className="lg:hidden sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
            <div className="px-3 py-2.5 overflow-x-auto">
              <div className="flex gap-1.5 min-w-max">
                {allTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                        activeTab === tab.id 
                          ? "bg-primary text-primary-foreground shadow-sm" 
                          : "bg-card text-muted-foreground border border-border"
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
          </div>

          {/* Page Header */}
          {activeTab !== "dashboard" && activeTabData && (
            <div className="px-5 pt-5 pb-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <activeTabData.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground leading-tight">{activeTabData.label}</h2>
                </div>
              </div>
            </div>
          )}

          <div className="p-5">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

// ===================== UTILITY COMPONENTS =====================

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="w-10 h-10 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
    <p className="text-sm text-muted-foreground font-medium">লোড হচ্ছে...</p>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="w-14 h-14 rounded-2xl bg-muted/80 flex items-center justify-center mb-4">
      <FileText className="w-7 h-7 text-muted-foreground/40" />
    </div>
    <p className="text-sm text-muted-foreground font-medium">কোন ডাটা নেই</p>
    <p className="text-xs text-muted-foreground/60 mt-1">নতুন কন্টেন্ট যোগ করুন</p>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { bg: string; icon: string }> = {
    approved: { bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20", icon: "✅" },
    rejected: { bg: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20", icon: "❌" },
    pending: { bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20", icon: "🕐" },
  };
  const c = config[status] || config.pending;
  return (
    <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold shrink-0 ${c.bg}`}>
      {c.icon} {status === "approved" ? "অনুমোদিত" : status === "rejected" ? "প্রত্যাখ্যাত" : "অপেক্ষমান"}
    </span>
  );
};

type ActionVariant = "success" | "danger" | "warning" | "info";

const ActionBtn = ({ variant, onClick, icon, label }: { variant: ActionVariant; onClick: () => void; icon: React.ReactNode; label: string }) => {
  const variantMap: Record<ActionVariant, string> = {
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20",
    danger: "bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border border-red-500/20",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/20",
    info: "bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border border-blue-500/20",
  };
  return (
    <button onClick={onClick} className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${variantMap[variant]}`}>
      {icon}{label}
    </button>
  );
};

export default AdminDashboard;
