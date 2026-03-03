import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Shield, TrendingUp, CheckCircle, XCircle, Trash2, Search, Edit3, Save, X,
  Eye, Clock, AlertTriangle, Star, StarOff, Filter, Plus,
  Image as ImageIcon, ChevronRight, Bell, Zap,
  Globe, FileText, Phone, Droplets, Heart, Megaphone,
  SlidersHorizontal, Info, History, Hash, Layers,
  Stethoscope, Building2, Pill, GraduationCap, Store, ShoppingBag,
  Briefcase, SearchX, CalendarHeart, Plane, Ambulance, ShieldAlert,
  Flame, Bus, Lightbulb, Scale, Landmark, UsersRound, MapPin,
  Package, Tractor, Home, BookOpen, UtensilsCrossed, Wrench,
  ScrollText, HeartHandshake, Microscope, Car, Building, Rocket,
  Hotel, Coffee, Video, Flower2, type LucideIcon,
  Newspaper, Settings, Activity, CalendarDays, ArrowUpRight, RefreshCw, Users
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AdminLayout, { type AdminTab } from "@/components/admin/AdminLayout";
import SiteSettingsPanel from "@/components/SiteSettingsPanel";
import AnalyticsCharts from "@/components/AnalyticsCharts";
import AddServiceForm from "@/components/admin/AddServiceForm";
import VisitorAnalytics from "@/components/admin/VisitorAnalytics";
import AdminNotificationPanel from "@/components/admin/AdminNotificationPanel";
import AppSettingsPanel from "@/components/admin/AppSettingsPanel";
import ServiceGridManager from "@/components/admin/ServiceGridManager";
import TrendCharts from "@/components/admin/TrendCharts";
import AdminNewsManager from "@/components/admin/AdminNewsManager";
import AdminSliderManager from "@/components/admin/AdminSliderManager";
import AdminAdsManager from "@/components/admin/AdminAdsManager";
import AdminAboutManager from "@/components/admin/AdminAboutManager";
import SwipeUpEditor from "@/components/admin/SwipeUpEditor";
import AdminDeveloperProfile from "@/components/admin/AdminDeveloperProfile";
import AdminLostFoundManager from "@/components/admin/AdminLostFoundManager";
import AdminEventsManager from "@/components/admin/AdminEventsManager";
import AdminPoliceManager from "@/components/admin/AdminPoliceManager";
import AdminServicesByCategory from "@/components/admin/AdminServicesByCategory";

// Legacy table configs for CRUD
const legacyTableConfig: Record<string, { table: string; fields: { name: string; label: string; type?: string; options?: string[] }[]; nameKey: string }> = {
  emergency: {
    table: "emergency_calls", nameKey: "name",
    fields: [
      { name: "name", label: "নাম" },
      { name: "phone", label: "ফোন নম্বর" },
      { name: "description", label: "বিবরণ" },
      { name: "sort_order", label: "ক্রম", type: "number" },
    ],
  },
  blood: {
    table: "blood_donors", nameKey: "name",
    fields: [
      { name: "name", label: "নাম" },
      { name: "phone", label: "ফোন নম্বর" },
      { name: "blood_group", label: "রক্তের গ্রুপ", type: "select", options: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] },
      { name: "address", label: "ঠিকানা" },
    ],
  },
  announcements: {
    table: "announcements", nameKey: "text",
    fields: [{ name: "text", label: "ঘোষণার টেক্সট" }],
  },
  timeline: {
    table: "timeline_events", nameKey: "title",
    fields: [
      { name: "title", label: "শিরোনাম" },
      { name: "year", label: "সাল", type: "number" },
      { name: "description", label: "বিবরণ" },
      { name: "sort_order", label: "ক্রম", type: "number" },
    ],
  },
  offices: {
    table: "offices", nameKey: "name",
    fields: [
      { name: "name", label: "অফিসের নাম" },
      { name: "designation", label: "পদবী" },
      { name: "phone", label: "ফোন নম্বর" },
      { name: "address", label: "ঠিকানা" },
      { name: "category", label: "ক্যাটাগরি", type: "select", options: ["সরকারি", "আধা-সরকারি", "স্বায়ত্তশাসিত", "বেসরকারি"] },
      { name: "visiting_hours", label: "ভিজিটিং সময়" },
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
  "restaurant": { icon: Coffee, gradient: "from-amber-600 to-yellow-600" },
  "video": { icon: Video, gradient: "from-red-600 to-rose-600" },
  "nursery": { icon: Flower2, gradient: "from-green-500 to-lime-500" },
};

// Shared UI components
const StatusBadge = ({ status }: { status: string }) => {
  const cfg: Record<string, string> = {
    approved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    rejected: "bg-red-500/10 text-red-600 dark:text-red-400",
  };
  return <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${cfg[status] || cfg.pending}`}>{status === "approved" ? "✅ অনুমোদিত" : status === "rejected" ? "❌ প্রত্যাখ্যাত" : "🕐 অপেক্ষমান"}</span>;
};

const ActionBtn = ({ variant, onClick, icon, label }: { variant: string; onClick: () => void; icon: React.ReactNode; label: string }) => {
  const styles: Record<string, string> = {
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15",
    danger: "bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/15",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/15",
    info: "bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/15",
  };
  return (
    <button onClick={onClick} className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1 ${styles[variant]}`}>
      {icon} {label}
    </button>
  );
};

const LoadingState = () => (
  <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="bg-card border border-border/60 rounded-2xl p-4 animate-pulse"><div className="h-4 bg-muted rounded w-2/3 mb-2" /><div className="h-3 bg-muted rounded w-1/3" /></div>)}</div>
);

const EmptyState = () => (
  <div className="text-center py-12"><p className="text-muted-foreground text-sm">কোন ডেটা নেই</p></div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [showExitConfirm, setShowExitConfirm] = useState(false);
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
  const [showAddService, setShowAddService] = useState(false);
  const [addServiceCategoryId, setAddServiceCategoryId] = useState<string>("");
  const [showLegacyForm, setShowLegacyForm] = useState(false);
  const [legacyForm, setLegacyForm] = useState<Record<string, string>>({});
  const [legacyEditId, setLegacyEditId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [todayStats, setTodayStats] = useState({ visitors: 0, newSubmissions: 0 });
  const [adItems, setAdItems] = useState<any[]>([]);

  // Browser back button management
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

  const handleTabChange = useCallback((tab: AdminTab) => {
    const mainTabs: AdminTab[] = ["dashboard", "all_services", "all_settings", "analytics"];
    // Push history state so browser back works
    window.history.pushState({ adminTab: tab }, "");
    setActiveTab(tab);
  }, []);

  useEffect(() => {
    // Push initial state
    window.history.pushState({ adminTab: "dashboard" }, "");

    const handlePopState = (e: PopStateEvent) => {
      const current = activeTabRef.current;
      const mainTabs: AdminTab[] = ["dashboard", "all_services", "all_settings", "analytics"];
      
      // Service sub-tabs → go to all_services hub
      const serviceSubTabs: AdminTab[] = ["services", "pending", "categories", "service_grid", "news", "slider", "advertisements", "about", "timeline", "emergency", "blood", "donations", "offices", "announcements"];
      // Settings sub-tabs → go to all_settings hub
      const settingsSubTabs: AdminTab[] = ["site_settings", "app_settings", "notifications", "users", "activity"];

      if (serviceSubTabs.includes(current)) {
        e.preventDefault();
        window.history.pushState({ adminTab: "all_services" }, "");
        setActiveTab("all_services");
      } else if (settingsSubTabs.includes(current)) {
        e.preventDefault();
        window.history.pushState({ adminTab: "all_settings" }, "");
        setActiveTab("all_settings");
      } else if (current === "all_services" || current === "all_settings" || current === "analytics") {
        e.preventDefault();
        window.history.pushState({ adminTab: "dashboard" }, "");
        setActiveTab("dashboard");
      } else if (current === "dashboard") {
        // Trying to leave admin panel - show confirmation
        e.preventDefault();
        window.history.pushState({ adminTab: "dashboard" }, "");
        setShowExitConfirm(true);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Auth check
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

  // Realtime subscriptions
  useEffect(() => {
    const ch = supabase.channel("admin_services_rt").on("postgres_changes", { event: "*", schema: "public", table: "services" }, (payload: any) => {
      fetchServices(); fetchCounts();
      if (payload.eventType === "INSERT" && payload.new?.status === "pending") {
        toast({ title: "🔔 নতুন সেবা সাবমিশন!", description: payload.new?.title || "" });
      }
    }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchServices, fetchCounts]);

  const fetchLegacyData = useCallback(async (tabName: string) => {
    const legacyTabs: Record<string, string> = {
      emergency: "emergency_calls", blood: "blood_donors", donations: "donations",
      announcements: "announcements", timeline: "timeline_events",
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
      announcements: "announcements",
    };
    if (legacyTabs[activeTab]) fetchLegacyData(activeTab);
    if (activeTab === "dashboard") {
      const fetchAds = async () => {
        const { data } = await (supabase.from as any)("advertisements").select("*").order("sort_order");
        setAdItems(data || []);
      };
      fetchAds();
    }
    setShowLegacyForm(false);
    setLegacyForm({});
    setLegacyEditId(null);
    setSelectedIds(new Set());
  }, [activeTab, fetchLegacyData]);

  const logActivity = useCallback(async (action: string, tableName?: string, recordId?: string, details?: string) => {
    if (!currentUser) return;
    await supabase.from("admin_activity_log").insert({
      user_id: currentUser.id, action, table_name: tableName || null, record_id: recordId || null, details: details || null,
    });
  }, [currentUser]);

  const fetchTodayStats = useCallback(async () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const iso = todayStart.toISOString();
    const [visitorsRes, submissionsRes] = await Promise.all([
      supabase.from("page_views").select("*", { count: "exact", head: true }).gte("created_at", iso),
      supabase.from("services").select("*", { count: "exact", head: true }).gte("created_at", iso),
    ]);
    setTodayStats({ visitors: visitorsRes.count || 0, newSubmissions: submissionsRes.count || 0 });
  }, []);

  useEffect(() => { fetchTodayStats(); }, [fetchTodayStats]);

  // Service actions
  const updateServiceStatus = async (id: string, status: string, title: string) => {
    await supabase.from("services").update({ status }).eq("id", id);
    await logActivity(status, "services", id, title);
    toast({ title: status === "approved" ? "অনুমোদিত ✅" : status === "rejected" ? "প্রত্যাখ্যাত ❌" : "পেন্ডিং 🕐" });
    fetchCounts();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredServices.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredServices.map((s: any) => s.id)));
  };
  const bulkUpdateStatus = async (status: string) => {
    if (selectedIds.size === 0) return;
    if (!confirm(`${selectedIds.size}টি সেবা ${status === "approved" ? "অনুমোদন" : "প্রত্যাখ্যান"} করতে চান?`)) return;
    for (const id of selectedIds) await supabase.from("services").update({ status }).eq("id", id);
    toast({ title: `${selectedIds.size}টি সেবা আপডেট হয়েছে ✅` });
    setSelectedIds(new Set()); fetchServices(); fetchCounts();
  };
  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`${selectedIds.size}টি সেবা মুছে ফেলতে চান?`)) return;
    for (const id of selectedIds) await supabase.from("services").delete().eq("id", id);
    toast({ title: `${selectedIds.size}টি সেবা মুছে ফেলা হয়েছে` });
    setSelectedIds(new Set()); fetchServices(); fetchCounts();
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
    toast({ title: "মুছে ফেলা হয়েছে" }); fetchCounts();
  };
  const startEdit = (item: any) => {
    setEditingId(item.id);
    const meta = item.metadata || {};
    setEditData({
      title: item.title, description: item.description || "", phone: item.phone || "",
      whatsapp: item.whatsapp || "", address: item.address || "", area: item.area || "",
      category_id: item.category_id || "", image_url: item.image_url || "",
      meta_degrees: (meta.degrees || []).join(", "), meta_specialty: meta.specialty || "",
      meta_hospital_name: meta.hospital_name || "", meta_registration_no: meta.registration_no || "",
      meta_experience: meta.experience || "", meta_chamber_time: meta.chamber_time || "",
      meta_consultation_fee: meta.consultation_fee || "", meta_shop_category: meta.shop_category || "",
      meta_owner_name: meta.owner_name || "", meta_edu_category: meta.edu_category || "",
      meta_established_year: meta.established_year || "", meta_principal_name: meta.principal_name || "",
      meta_company: meta.company || "", meta_job_category: meta.job_category || "",
      meta_salary_range: meta.salary_range || "", meta_deadline: meta.deadline || "",
    });
  };
  const saveEdit = async (id: string) => {
    const metadata: Record<string, any> = {};
    if (editData.meta_degrees) metadata.degrees = editData.meta_degrees.split(",").map((d: string) => d.trim()).filter(Boolean);
    ["specialty", "hospital_name", "registration_no", "experience", "chamber_time", "consultation_fee", "shop_category", "owner_name", "edu_category", "established_year", "principal_name", "company", "job_category", "salary_range", "deadline"].forEach(k => {
      if (editData[`meta_${k}`]) metadata[k] = editData[`meta_${k}`];
    });
    const { meta_degrees, meta_specialty, meta_hospital_name, meta_registration_no, meta_experience, meta_chamber_time, meta_consultation_fee, meta_shop_category, meta_owner_name, meta_edu_category, meta_established_year, meta_principal_name, meta_company, meta_job_category, meta_salary_range, meta_deadline, ...baseData } = editData;
    await supabase.from("services").update({ ...baseData, metadata }).eq("id", id);
    await logActivity("edited", "services", id, editData.title);
    setEditingId(null);
    toast({ title: "আপডেট হয়েছে ✅" });
  };

  const filteredServices = services.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.phone || "").includes(searchTerm) ||
    (s.address || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddServiceForCategory = (categoryId: string) => {
    setAddServiceCategoryId(categoryId);
    setShowAddService(true);
    handleTabChange("services");
    setFilterCategory(categoryId);
  };

  // Legacy CRUD
  const saveLegacyItem = async () => {
    const config = legacyTableConfig[activeTab];
    if (!config) return;
    const requiredField = config.fields[0].name;
    if (!legacyForm[requiredField]?.trim()) { toast({ title: `${config.fields[0].label} দিন`, variant: "destructive" }); return; }
    const insertData: Record<string, any> = {};
    config.fields.forEach(f => {
      if (legacyForm[f.name] !== undefined && legacyForm[f.name] !== "") {
        insertData[f.name] = f.type === "number" ? parseInt(legacyForm[f.name]) || 0 : legacyForm[f.name];
      }
    });
    if (activeTab === "blood") insertData.is_approved = true;
    if (activeTab === "emergency") insertData.is_active = true;
    if (legacyEditId) {
      await (supabase.from as any)(config.table).update(insertData).eq("id", legacyEditId);
      toast({ title: "আপডেট হয়েছে ✅" });
    } else {
      await (supabase.from as any)(config.table).insert(insertData);
      toast({ title: "যোগ হয়েছে ✅" });
    }
    setShowLegacyForm(false); setLegacyForm({}); setLegacyEditId(null);
    fetchLegacyData(activeTab);
  };
  const deleteLegacyItem = async (id: string, name: string) => {
    const config = legacyTableConfig[activeTab];
    if (!config) return;
    if (!confirm("মুছে ফেলতে চান?")) return;
    await (supabase.from as any)(config.table).delete().eq("id", id);
    toast({ title: "মুছে ফেলা হয়েছে" });
    setLegacyData(legacyData.filter(d => d.id !== id));
  };
  const startLegacyEdit = (item: any) => {
    const config = legacyTableConfig[activeTab];
    if (!config) return;
    const formData: Record<string, string> = {};
    config.fields.forEach(f => { formData[f.name] = item[f.name]?.toString() || ""; });
    setLegacyForm(formData); setLegacyEditId(item.id); setShowLegacyForm(true);
  };

  // ============ RENDER SECTIONS ============

  const renderDashboard = () => (
    <div className="space-y-5">
      {/* Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-background border border-border/50 p-5">
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">স্বাগতম, অ্যাডমিন</h2>
            <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: "আজকের ভিজিটর", count: todayStats.visitors, icon: TrendingUp, gradient: "from-cyan-500 to-blue-500" },
          { label: "নতুন সাবমিশন", count: todayStats.newSubmissions, icon: Plus, gradient: "from-emerald-500 to-green-500" },
          { label: "পেন্ডিং অ্যাকশন", count: counts.pending, icon: AlertTriangle, gradient: "from-amber-500 to-orange-500" },
        ].map(s => (
          <div key={s.label} className="relative overflow-hidden rounded-2xl bg-card border border-border/60 p-3.5 group hover:shadow-md transition-all">
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-2 shadow-sm`}>
              <s.icon className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-xl font-extrabold text-foreground">{s.count}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pending Alert */}
      {counts.pending > 0 && (
        <button onClick={() => handleTabChange("pending")} className="w-full group">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 transition-all">
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {[
          { label: "মোট সেবা", count: counts.total, color: "text-primary" },
          { label: "অনুমোদিত", count: counts.approved, color: "text-emerald-500" },
          { label: "প্রত্যাখ্যাত", count: counts.rejected, color: "text-red-500" },
          { label: "ফিচার্ড", count: counts.featured, color: "text-amber-500" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border/60 rounded-2xl p-3.5">
            <p className={`text-lg font-extrabold ${s.color}`}>{s.count}</p>
            <p className="text-[10px] text-muted-foreground font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Trend Charts */}
      <TrendCharts />

      {/* Quick Category Overview */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" /> ক্যাটাগরি ওভারভিউ
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          {categories.slice(0, 8).map((cat: any) => {
            const iconData = slugIconMap[cat.slug];
            const Icon = iconData?.icon || Globe;
            const gradient = iconData?.gradient || "from-primary to-primary/80";
            return (
              <div key={cat.id} className="bg-card border border-border/60 rounded-2xl p-3.5 hover:shadow-md transition-all group">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs font-bold text-foreground truncate">{cat.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" /> {cat.view_count}</span>
                  <button onClick={() => openAddServiceForCategory(cat.id)} className="text-[10px] text-primary font-semibold flex items-center gap-0.5">
                    <Plus className="w-2.5 h-2.5" /> যোগ
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Content Links */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" /> দ্রুত নেভিগেশন
        </h3>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: "ঘোষণা", tab: "announcements" as AdminTab, icon: Megaphone, gradient: "from-red-500 to-rose-500" },
            { label: "নিউজ", tab: "news" as AdminTab, icon: Newspaper, gradient: "from-emerald-500 to-green-500" },
            { label: "সেটিংস", tab: "site_settings" as AdminTab, icon: Settings, gradient: "from-slate-500 to-gray-500" },
            { label: "স্লাইডার", tab: "slider" as AdminTab, icon: SlidersHorizontal, gradient: "from-blue-500 to-sky-500" },
            { label: "বিজ্ঞাপন", tab: "advertisements" as AdminTab, icon: ImageIcon, gradient: "from-yellow-500 to-orange-500" },
            { label: "অফিস", tab: "offices" as AdminTab, icon: Building2, gradient: "from-teal-500 to-cyan-500" },
          ].map(item => (
            <button key={item.label} onClick={() => handleTabChange(item.tab)}
              className="bg-card border border-border/60 rounded-2xl p-3.5 text-left hover:shadow-md transition-all group">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-2 shadow-sm`}>
                <item.icon className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-xs font-bold text-foreground">{item.label}</p>
              <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                <ArrowUpRight className="w-2.5 h-2.5" /> ম্যানেজ
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Charts */}
      <AnalyticsCharts categories={categories} adItems={adItems} />
    </div>
  );

  const renderServicesList = () => (
    <div className="space-y-4">
      <AddServiceForm
        open={showAddService}
        categories={categories}
        preselectedCategoryId={addServiceCategoryId}
        onClose={() => { setShowAddService(false); setAddServiceCategoryId(""); }}
        onSaved={() => { fetchServices(); fetchCounts(); }}
        logActivity={logActivity}
      />

      {/* SwipeUp Service Editor */}
      <SwipeUpEditor
        open={!!editingId}
        onClose={() => setEditingId(null)}
        title="সেবা এডিট করুন"
        subtitle={editData.title || ""}
        icon={<Edit3 className="w-4 h-4 text-white" />}
        headerGradient="from-blue-500 to-indigo-500"
      >
        <input className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50 transition-all" value={editData.title || ""} onChange={(e) => setEditData({ ...editData, title: e.target.value })} placeholder="শিরোনাম" />
        <textarea className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 min-h-[70px] outline-none resize-none focus:border-primary/50 transition-all" value={editData.description || ""} onChange={(e) => setEditData({ ...editData, description: e.target.value })} placeholder="বিবরণ" />
        <div className="grid grid-cols-2 gap-2">
          <input className="bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50 transition-all" value={editData.phone || ""} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} placeholder="📞 ফোন" />
          <input className="bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50 transition-all" value={editData.whatsapp || ""} onChange={(e) => setEditData({ ...editData, whatsapp: e.target.value })} placeholder="💬 WhatsApp" />
        </div>
        <input className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50 transition-all" value={editData.address || ""} onChange={(e) => setEditData({ ...editData, address: e.target.value })} placeholder="📍 ঠিকানা" />
        <select className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50 transition-all" value={editData.category_id || ""} onChange={(e) => setEditData({ ...editData, category_id: e.target.value })}>
          <option value="">ক্যাটাগরি নির্বাচন</option>
          {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50 transition-all" value={editData.image_url || ""} onChange={(e) => setEditData({ ...editData, image_url: e.target.value })} placeholder="ছবির লিংক" />
        <div className="flex gap-2 pt-2">
          <button onClick={() => { if (editingId) saveEdit(editingId); }} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"><Save className="w-4 h-4" /> সেভ</button>
          <button onClick={() => setEditingId(null)} className="px-5 py-3 rounded-xl bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors">বাতিল</button>
        </div>
      </SwipeUpEditor>

      <div className="bg-card border border-border/60 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="নাম, ফোন বা ঠিকানা..." className="w-full bg-muted/40 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none border border-border/60 focus:border-primary/50 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          {!showAddService && (
            <button onClick={() => { setShowAddService(true); setAddServiceCategoryId(filterCategory !== "all" ? filterCategory : ""); }}
              className="shrink-0 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> যোগ
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {activeTab !== "pending" && (
            <select className="bg-muted/40 rounded-xl px-3 py-2 text-xs border border-border/60 outline-none" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">সকল স্ট্যাটাস</option>
              <option value="approved">অনুমোদিত</option>
              <option value="pending">অপেক্ষমান</option>
              <option value="rejected">প্রত্যাখ্যাত</option>
            </select>
          )}
          <select className="bg-muted/40 rounded-xl px-3 py-2 text-xs border border-border/60 outline-none" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">সকল ক্যাটাগরি</option>
            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <span className="text-xs text-muted-foreground flex items-center gap-1 bg-muted/40 px-3 py-2 rounded-xl border border-border/60 ml-auto">
            <Hash className="w-3 h-3" /> {filteredServices.length}টি
          </span>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-3.5 flex items-center gap-2 flex-wrap sticky top-16 z-30">
          <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">{selectedIds.size}টি নির্বাচিত</span>
          <div className="flex-1" />
          <ActionBtn variant="success" onClick={() => bulkUpdateStatus("approved")} icon={<CheckCircle className="w-3.5 h-3.5" />} label="অনুমোদন" />
          <ActionBtn variant="danger" onClick={() => bulkUpdateStatus("rejected")} icon={<XCircle className="w-3.5 h-3.5" />} label="প্রত্যাখ্যান" />
          <ActionBtn variant="danger" onClick={bulkDelete} icon={<Trash2 className="w-3.5 h-3.5" />} label="মুছুন" />
          <button onClick={() => setSelectedIds(new Set())} className="text-xs text-muted-foreground hover:text-foreground px-2 py-1">বাতিল</button>
        </div>
      )}

      {loading ? <LoadingState /> : filteredServices.length === 0 ? <EmptyState /> : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <button onClick={toggleSelectAll}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${selectedIds.size === filteredServices.length && filteredServices.length > 0 ? "bg-primary border-primary" : "border-border hover:border-primary/50"}`}>
              {selectedIds.size === filteredServices.length && filteredServices.length > 0 && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
            </button>
            <span className="text-xs text-muted-foreground">সব নির্বাচন</span>
          </div>
          {filteredServices.map((item: any) => (
            <div key={item.id} className={`bg-card border rounded-2xl overflow-hidden hover:shadow-md transition-all ${selectedIds.has(item.id) ? "border-primary/40 bg-primary/[0.02]" : "border-border/60"}`}>
              <div className="p-4">
                <div className="flex gap-3">
                  <button onClick={() => toggleSelect(item.id)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-1 transition-all ${selectedIds.has(item.id) ? "bg-primary border-primary" : "border-border hover:border-primary/50"}`}>
                    {selectedIds.has(item.id) && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
                  </button>
                  {item.image_url && <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-muted border border-border/40"><img src={item.image_url} alt="" className="w-full h-full object-cover" /></div>}
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
                    {item.phone && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Phone className="w-3 h-3" /> {item.phone}</p>}
                  </div>
                </div>
                <div className="flex gap-1.5 mt-3 pt-3 border-t border-border/40 flex-wrap">
                  {item.status !== "approved" && <ActionBtn variant="success" onClick={() => updateServiceStatus(item.id, "approved", item.title)} icon={<CheckCircle className="w-3.5 h-3.5" />} label="অনুমোদন" />}
                  {item.status !== "rejected" && <ActionBtn variant="danger" onClick={() => updateServiceStatus(item.id, "rejected", item.title)} icon={<XCircle className="w-3.5 h-3.5" />} label="প্রত্যাখ্যান" />}
                  <ActionBtn variant="warning" onClick={() => toggleFeatured(item.id, item.is_featured, item.title)} icon={item.is_featured ? <StarOff className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />} label={item.is_featured ? "আনফিচার" : "ফিচার"} />
                  <ActionBtn variant="info" onClick={() => startEdit(item)} icon={<Edit3 className="w-3.5 h-3.5" />} label="এডিট" />
                  <ActionBtn variant="danger" onClick={() => deleteService(item.id, item.title)} icon={<Trash2 className="w-3.5 h-3.5" />} label="মুছুন" />
                </div>
              </div>
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
        <div key={c.id} className="bg-card border border-border/60 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-sm font-bold text-primary">{i + 1}</div>
            <div>
              <h3 className="font-bold text-sm text-foreground">{c.name}</h3>
              <p className="text-xs text-muted-foreground">/{c.slug}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => openAddServiceForCategory(c.id)} className="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors" title="নতুন সেবা যোগ">
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
      {loading ? <LoadingState /> : activityLog.length === 0 ? <EmptyState /> : activityLog.map((log: any) => (
        <div key={log.id} className="bg-card border border-border/60 rounded-2xl p-4 flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            log.action === "approved" ? "bg-emerald-500/10 text-emerald-600" :
            log.action === "deleted" ? "bg-red-500/10 text-red-600" :
            log.action === "edited" ? "bg-blue-500/10 text-blue-600" :
            "bg-muted text-muted-foreground"
          }`}>
            {log.action === "approved" ? <CheckCircle className="w-4 h-4" /> :
             log.action === "deleted" ? <Trash2 className="w-4 h-4" /> :
             log.action === "edited" ? <Edit3 className="w-4 h-4" /> :
             <Activity className="w-4 h-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground capitalize">{log.action}</p>
            {log.table_name && <p className="text-xs text-muted-foreground mt-0.5">{log.table_name}{log.details ? ` — ${log.details}` : ""}</p>}
            <p className="text-[10px] text-muted-foreground/60 mt-1">{new Date(log.created_at).toLocaleString("bn-BD")}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-bold text-foreground">ইউজার তালিকা</h2>
        <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">{usersList.length}জন</span>
      </div>
      {loading ? <LoadingState /> : usersList.map((user: any) => (
        <div key={user.id} className="bg-card border border-border/60 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-base font-bold text-primary">{(user.display_name || "U").charAt(0)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-foreground truncate">{user.display_name || "No Name"}</h3>
            <p className="text-xs text-muted-foreground">{user.phone || "—"}</p>
          </div>
          <div className="flex gap-1.5">
            {user.roles.map((r: string) => (
              <span key={r} className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${r === "admin" ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20" : "bg-muted text-muted-foreground"}`}>
                {r === "admin" ? "🛡️ " : "👤 "}{r}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderLegacy = () => {
    const config = legacyTableConfig[activeTab];
    const hasCRUD = !!config;
    if (loading) return <LoadingState />;
    const activeTabLabel = activeTab === "emergency" ? "জরুরি কল" : activeTab === "blood" ? "রক্তদাতা" : activeTab === "donations" ? "অনুদান" : activeTab === "announcements" ? "ঘোষণা" : activeTab === "offices" ? "অফিস" : "";
    return (
      <div className="space-y-4">
        {hasCRUD && (
          <>
            <SwipeUpEditor
              open={showLegacyForm}
              onClose={() => { setShowLegacyForm(false); setLegacyForm({}); setLegacyEditId(null); }}
              title={legacyEditId ? "এডিট করুন" : `নতুন ${activeTabLabel} যোগ করুন`}
              subtitle={activeTabLabel}
              icon={<Plus className="w-4 h-4 text-white" />}
              headerGradient="from-primary to-primary/80"
            >
              {config.fields.map(field => (
                <div key={field.name}>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">{field.label}</label>
                  {field.type === "select" && field.options ? (
                    <select className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50 transition-all" value={legacyForm[field.name] || ""} onChange={(e) => setLegacyForm({ ...legacyForm, [field.name]: e.target.value })}>
                      <option value="">নির্বাচন করুন</option>
                      {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={field.type === "number" ? "number" : "text"} className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50 transition-all" placeholder={field.label} value={legacyForm[field.name] || ""} onChange={(e) => setLegacyForm({ ...legacyForm, [field.name]: e.target.value })} />
                  )}
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <button onClick={saveLegacyItem} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                  <Save className="w-4 h-4" /> {legacyEditId ? "আপডেট" : "যোগ করুন"}
                </button>
                <button onClick={() => { setShowLegacyForm(false); setLegacyForm({}); setLegacyEditId(null); }} className="px-5 py-3 rounded-xl bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors">
                  বাতিল
                </button>
              </div>
            </SwipeUpEditor>
            <button onClick={() => setShowLegacyForm(true)} className="w-full py-3.5 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 text-primary text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/10 transition-all">
              <Plus className="w-4 h-4" /> নতুন {activeTabLabel} যোগ করুন
            </button>
          </>
        )}
        <span className="text-xs text-muted-foreground flex items-center gap-1"><Hash className="w-3 h-3" /> মোট: {legacyData.length}টি</span>
        {legacyData.length === 0 ? <EmptyState /> : legacyData.map((item: any) => {
          const name = item.title || item.name || item.text || item.method_name || item.donor_name || item.item_name || `${item.year || ""}`;
          return (
            <div key={item.id} className="bg-card border border-border/60 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-foreground">{name}</h3>
                  {item.phone && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Phone className="w-3 h-3" /> {item.phone}</p>}
                  {item.blood_group && <p className="text-xs text-muted-foreground mt-0.5">🩸 {item.blood_group}</p>}
                  {item.address && <p className="text-xs text-muted-foreground mt-0.5">📍 {item.address}</p>}
                  {item.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description}</p>}
                  <p className="text-[10px] text-muted-foreground/60 mt-1.5"><CalendarDays className="w-3 h-3 inline mr-1" />{new Date(item.created_at).toLocaleDateString("bn-BD")}</p>
                </div>
                {item.is_active !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${item.is_active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                    {item.is_active ? "✅" : "⏸"}
                  </span>
                )}
              </div>
              {hasCRUD && (
                <div className="flex gap-1.5 mt-3 pt-3 border-t border-border/40 flex-wrap">
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

  // ============ ALL SERVICES HUB ============
  const [serviceHubSearch, setServiceHubSearch] = useState("");

  const serviceHubSections = [
    { id: "services" as AdminTab, label: "সেবাসমূহ", desc: "ক্যাটাগরি অনুযায়ী সেবা ম্যানেজ", icon: Globe, gradient: "from-primary to-primary/80" },
    { id: "pending" as AdminTab, label: "অপেক্ষমান", desc: `${counts.pending}টি অনুমোদন বাকি`, icon: Clock, gradient: "from-amber-500 to-orange-500" },
    { id: "categories" as AdminTab, label: "ক্যাটাগরি", desc: "ক্যাটাগরি ম্যানেজ করুন", icon: Layers, gradient: "from-violet-500 to-purple-500" },
    { id: "service_grid" as AdminTab, label: "সার্ভিস গ্রিড", desc: "হোমপেজ গ্রিড আইকন", icon: SlidersHorizontal, gradient: "from-blue-500 to-indigo-500" },
    { id: "news" as AdminTab, label: "নিউজ", desc: "সংবাদ প্রকাশ ও এডিট", icon: Newspaper, gradient: "from-emerald-500 to-green-500" },
    { id: "slider" as AdminTab, label: "স্লাইডার", desc: "হোমপেজ স্লাইডার ছবি", icon: SlidersHorizontal, gradient: "from-sky-500 to-blue-500" },
    { id: "advertisements" as AdminTab, label: "বিজ্ঞাপন", desc: "বিজ্ঞাপন ম্যানেজ করুন", icon: ImageIcon, gradient: "from-yellow-500 to-orange-500" },
    { id: "about" as AdminTab, label: "সম্পর্কে / গ্যালারি", desc: "পেজ কন্টেন্ট ও গ্যালারি", icon: Info, gradient: "from-teal-500 to-cyan-500" },
    { id: "timeline" as AdminTab, label: "টাইমলাইন", desc: "ইতিহাসের ইভেন্ট", icon: History, gradient: "from-indigo-500 to-violet-500" },
    { id: "emergency" as AdminTab, label: "জরুরি কল", desc: "জরুরি নম্বর ম্যানেজ", icon: Phone, gradient: "from-red-500 to-rose-500" },
    { id: "blood" as AdminTab, label: "রক্তদাতা", desc: "রক্তদাতা তালিকা", icon: Droplets, gradient: "from-rose-500 to-pink-500" },
    { id: "donations" as AdminTab, label: "অনুদান", desc: "অনুদান রেকর্ড", icon: Heart, gradient: "from-pink-500 to-fuchsia-500" },
    { id: "offices" as AdminTab, label: "অফিস", desc: "অফিস ও কর্মকর্তা", icon: Building2, gradient: "from-slate-500 to-zinc-600" },
    { id: "announcements" as AdminTab, label: "ঘোষণা", desc: "মার্কি ঘোষণা ম্যানেজ", icon: Megaphone, gradient: "from-orange-500 to-red-500" },
    { id: "events" as AdminTab, label: "ইভেন্ট", desc: "ইভেন্ট ম্যানেজ করুন", icon: CalendarHeart, gradient: "from-fuchsia-500 to-pink-500" },
    { id: "police" as AdminTab, label: "পুলিশ", desc: "পুলিশ থানা ও কর্মকর্তা", icon: ShieldAlert, gradient: "from-slate-600 to-blue-600" },
  ];

  const filteredHubSections = serviceHubSections.filter(s =>
    s.label.toLowerCase().includes(serviceHubSearch.toLowerCase()) ||
    s.desc.toLowerCase().includes(serviceHubSearch.toLowerCase())
  );

  const renderAllServicesHub = () => (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="সেকশন খুঁজুন..."
          className="w-full bg-card rounded-2xl pl-10 pr-4 py-3.5 text-sm outline-none border border-border/60 focus:border-primary/50 transition-all"
          value={serviceHubSearch}
          onChange={(e) => setServiceHubSearch(e.target.value)}
        />
      </div>

      {/* Pending Alert */}
      {counts.pending > 0 && (
        <button onClick={() => handleTabChange("pending")} className="w-full group">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-amber-800 dark:text-amber-200 text-sm">{counts.pending}টি অনুমোদন অপেক্ষমান</p>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      )}

      {/* Section Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {filteredHubSections.map(section => (
          <button
            key={section.id}
            onClick={() => handleTabChange(section.id)}
            className="bg-card border border-border/60 rounded-2xl p-3.5 text-left hover:shadow-md transition-all group"
          >
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${section.gradient} flex items-center justify-center mb-2.5 shadow-sm group-hover:scale-105 transition-transform`}>
              <section.icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs font-bold text-foreground leading-tight">{section.label}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{section.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );

  // ============ ALL SETTINGS HUB ============
  const [settingsHubSearch, setSettingsHubSearch] = useState("");

  const settingsHubSections = [
    { id: "site_settings" as AdminTab, label: "সাইট সেটিং", desc: "সাইটের মূল তথ্য", icon: Settings, gradient: "from-slate-500 to-zinc-600" },
    { id: "app_settings" as AdminTab, label: "অ্যাপ সেটিং", desc: "PWA ও SEO সেটিং", icon: Globe, gradient: "from-blue-500 to-indigo-500" },
    { id: "notifications" as AdminTab, label: "নোটিফিকেশন", desc: "পুশ নোটিফিকেশন পাঠান", icon: Bell, gradient: "from-emerald-500 to-green-500" },
    { id: "users" as AdminTab, label: "ইউজার", desc: "ইউজার ও রোল ম্যানেজ", icon: Users, gradient: "from-violet-500 to-purple-500" },
    { id: "developer_profile" as AdminTab, label: "ডেভেলপার প্রোফাইল", desc: "ডেভেলপারের তথ্য এডিট", icon: UsersRound, gradient: "from-pink-500 to-rose-500" },
    { id: "activity" as AdminTab, label: "অ্যাক্টিভিটি লগ", desc: "সকল কার্যকলাপ দেখুন", icon: Activity, gradient: "from-amber-500 to-orange-500" },
  ];

  const filteredSettingsSections = settingsHubSections.filter(s =>
    s.label.toLowerCase().includes(settingsHubSearch.toLowerCase()) ||
    s.desc.toLowerCase().includes(settingsHubSearch.toLowerCase())
  );

  const renderAllSettingsHub = () => (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="সেটিং খুঁজুন..."
          className="w-full bg-card rounded-2xl pl-10 pr-4 py-3.5 text-sm outline-none border border-border/60 focus:border-primary/50 transition-all"
          value={settingsHubSearch}
          onChange={(e) => setSettingsHubSearch(e.target.value)}
        />
      </div>

      {/* Section List */}
      <div className="space-y-2.5">
        {filteredSettingsSections.map(section => (
          <button
            key={section.id}
            onClick={() => handleTabChange(section.id)}
            className="w-full bg-card border border-border/60 rounded-2xl p-4 flex items-center gap-3.5 hover:shadow-md transition-all group text-left"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${section.gradient} flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform`}>
              <section.icon className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">{section.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{section.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return renderDashboard();
      case "all_services": return renderAllServicesHub();
      case "all_settings": return renderAllSettingsHub();
      case "services": return <AdminServicesByCategory logActivity={logActivity} />;
      case "pending": return renderServicesList();
      case "categories": return renderCategories();
      case "activity": return renderActivity();
      case "users": return renderUsers();
      case "news": return <AdminNewsManager logActivity={logActivity} />;
      case "slider": return <AdminSliderManager logActivity={logActivity} />;
      case "advertisements": return <AdminAdsManager logActivity={logActivity} />;
      case "about": case "timeline": return <AdminAboutManager logActivity={logActivity} />;
      case "site_settings": return <SiteSettingsPanel />;
      case "app_settings": return <AppSettingsPanel />;
      case "notifications": return <AdminNotificationPanel />;
      case "analytics": return <VisitorAnalytics />;
      case "service_grid": return <ServiceGridManager />;
      case "developer_profile": return <AdminDeveloperProfile logActivity={logActivity} />;
      case "lost_found": return <AdminLostFoundManager logActivity={logActivity} />;
      case "events": return <AdminEventsManager logActivity={logActivity} />;
      case "police": return <AdminPoliceManager logActivity={logActivity} />;
      default: return renderLegacy();
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20" />
          <div><div className="h-4 bg-muted rounded w-32 mb-2" /><div className="h-3 bg-muted rounded w-24" /></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdminLayout
        activeTab={activeTab}
        onTabChange={handleTabChange}
        currentUser={currentUser}
        pendingCount={counts.pending}
      >
        {renderContent()}
      </AdminLayout>

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowExitConfirm(false)} />
          <div className="relative bg-card rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7 text-destructive" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">অ্যাডমিন প্যানেল থেকে বের হবেন?</h3>
              <p className="text-sm text-muted-foreground mt-1">আপনি কি নিশ্চিত যে হোমপেজে ফিরে যেতে চান?</p>
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm font-semibold hover:bg-muted/80 transition-colors"
              >
                থাকুন
              </button>
              <button
                onClick={() => { setShowExitConfirm(false); navigate("/"); }}
                className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-bold hover:opacity-90 transition-opacity"
              >
                বের হন
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
