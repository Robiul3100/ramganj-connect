import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  LogOut, LayoutDashboard, Image, Megaphone, Phone, Droplets, Briefcase, Calendar, 
  AlertTriangle, Globe, Heart, FileText, Clock, Users, Activity, Shield, 
  TrendingUp, Eye, CheckCircle, XCircle, Trash2, RefreshCw
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Tab = "dashboard" | "slider" | "announcements" | "emergency" | "blood" | "jobs" | "events" | "complaints" | "expatriate" | "donation" | "about" | "timeline" | "users" | "activity";

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: "dashboard", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
  { id: "activity", label: "অ্যাক্টিভিটি", icon: Activity },
  { id: "users", label: "ইউজার", icon: Users },
  { id: "slider", label: "স্লাইডার", icon: Image },
  { id: "announcements", label: "ঘোষণা", icon: Megaphone },
  { id: "emergency", label: "জরুরি কল", icon: Phone },
  { id: "blood", label: "রক্তদাতা", icon: Droplets },
  { id: "jobs", label: "চাকরি", icon: Briefcase },
  { id: "events", label: "ইভেন্ট", icon: Calendar },
  { id: "complaints", label: "অভিযোগ", icon: AlertTriangle },
  { id: "expatriate", label: "প্রবাসী", icon: Globe },
  { id: "donation", label: "অনুদান", icon: Heart },
  { id: "about", label: "রামগঞ্জ সম্পর্কে", icon: FileText },
  { id: "timeline", label: "টাইমলাইন", icon: Clock },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [pendingCounts, setPendingCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/admin-login"); return; }
      const { data: roles } = await (supabase.from as any)("user_roles").select("role").eq("user_id", user.id);
      if (!roles || !roles.some((r: any) => r.role === "admin")) { navigate("/admin-login"); return; }
      setCurrentUser(user);
    };
    checkAuth();
  }, [navigate]);

  const fetchCounts = useCallback(async () => {
    const tableNames = ["emergency_calls", "blood_donors", "jobs", "events", "complaints", "expatriate_forums", "donations", "slider_items", "announcements", "timeline_events"];
    const results: Record<string, number> = {};
    const pending: Record<string, number> = {};
    
    await Promise.all(tableNames.map(async (t) => {
      const { count } = await (supabase.from as any)(t).select("*", { count: "exact", head: true });
      results[t] = count || 0;
    }));

    // Pending approvals
    const approvalTables = ["blood_donors", "jobs", "events", "complaints", "expatriate_forums"];
    await Promise.all(approvalTables.map(async (t) => {
      const { count } = await (supabase.from as any)(t).select("*", { count: "exact", head: true }).eq("is_approved", false);
      pending[t] = count || 0;
    }));

    setCounts(results);
    setPendingCounts(pending);
  }, []);

  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  const logActivity = useCallback(async (action: string, tableName?: string, recordId?: string, details?: string) => {
    if (!currentUser) return;
    await (supabase.from as any)("admin_activity_log").insert({
      user_id: currentUser.id,
      action,
      table_name: tableName || null,
      record_id: recordId || null,
      details: details || null,
    });
  }, [currentUser]);

  const tableMap: Record<string, string> = {
    slider: "slider_items", announcements: "announcements", emergency: "emergency_calls",
    blood: "blood_donors", jobs: "jobs", events: "events", complaints: "complaints",
    expatriate: "expatriate_forums", donation: "donations", about: "about_content", timeline: "timeline_events",
  };

  useEffect(() => {
    if (activeTab === "dashboard") return;

    if (activeTab === "activity") {
      const fetchActivity = async () => {
        setLoading(true);
        const { data } = await (supabase.from as any)("admin_activity_log")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);
        setActivityLog(data || []);
        setLoading(false);
      };
      fetchActivity();
      const ch = supabase.channel("admin_activity_rt")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "admin_activity_log" }, () => fetchActivity())
        .subscribe();
      return () => { supabase.removeChannel(ch); };
    }

    if (activeTab === "users") {
      const fetchUsers = async () => {
        setLoading(true);
        const { data: profiles } = await (supabase.from as any)("profiles").select("*").order("created_at", { ascending: false });
        const { data: roles } = await (supabase.from as any)("user_roles").select("*");
        const merged = (profiles || []).map((p: any) => ({
          ...p,
          roles: (roles || []).filter((r: any) => r.user_id === p.user_id).map((r: any) => r.role),
        }));
        setUsersList(merged);
        setLoading(false);
      };
      fetchUsers();
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      const table = tableMap[activeTab];
      if (!table) return;
      const { data } = await (supabase.from as any)(table).select("*").order("created_at", { ascending: false });
      setTableData(data || []);
      setLoading(false);
    };
    fetchData();

    const table = tableMap[activeTab];
    if (table) {
      const ch = supabase.channel(`admin_${table}`).on("postgres_changes", { event: "*", schema: "public", table }, () => fetchData()).subscribe();
      return () => { supabase.removeChannel(ch); };
    }
  }, [activeTab]);

  const toggleApproval = async (table: string, id: string, currentVal: boolean, name: string) => {
    await (supabase.from as any)(table).update({ is_approved: !currentVal }).eq("id", id);
    await logActivity(!currentVal ? "approved" : "unapproved", table, id, name);
    toast({ title: !currentVal ? "অনুমোদিত ✅" : "অননুমোদিত ❌" });
    fetchCounts();
  };

  const toggleActive = async (table: string, id: string, currentVal: boolean, name: string) => {
    await (supabase.from as any)(table).update({ is_active: !currentVal }).eq("id", id);
    await logActivity(!currentVal ? "activated" : "deactivated", table, id, name);
    toast({ title: !currentVal ? "সক্রিয় ✅" : "নিষ্ক্রিয় ❌" });
  };

  const deleteItem = async (table: string, id: string, name: string) => {
    if (!confirm("মুছে ফেলতে চান?")) return;
    await (supabase.from as any)(table).delete().eq("id", id);
    await logActivity("deleted", table, id, name);
    toast({ title: "মুছে ফেলা হয়েছে" });
    fetchCounts();
  };

  const handleLogout = async () => {
    await logActivity("logout");
    await supabase.auth.signOut();
    navigate("/admin-login");
  };

  const totalPending = Object.values(pendingCounts).reduce((a, b) => a + b, 0);

  const renderDashboard = () => (
    <div className="space-y-5">
      {/* Welcome */}
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

      {/* Pending Alert */}
      {totalPending > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-sm text-amber-800 dark:text-amber-200">অনুমোদন অপেক্ষমান ({totalPending})</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {pendingCounts.blood_donors > 0 && (
              <button onClick={() => setActiveTab("blood")} className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-lg">
                রক্তদাতা ({pendingCounts.blood_donors})
              </button>
            )}
            {pendingCounts.jobs > 0 && (
              <button onClick={() => setActiveTab("jobs")} className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-lg">
                চাকরি ({pendingCounts.jobs})
              </button>
            )}
            {pendingCounts.events > 0 && (
              <button onClick={() => setActiveTab("events")} className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-lg">
                ইভেন্ট ({pendingCounts.events})
              </button>
            )}
            {pendingCounts.complaints > 0 && (
              <button onClick={() => setActiveTab("complaints")} className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-lg">
                অভিযোগ ({pendingCounts.complaints})
              </button>
            )}
            {pendingCounts.expatriate_forums > 0 && (
              <button onClick={() => setActiveTab("expatriate")} className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-lg">
                প্রবাসী ({pendingCounts.expatriate_forums})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">পরিসংখ্যান</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "জরুরি কল", count: counts.emergency_calls, icon: Phone, color: "hsl(0 70% 50%)" },
            { label: "রক্তদাতা", count: counts.blood_donors, icon: Droplets, color: "hsl(0 80% 55%)" },
            { label: "চাকরি", count: counts.jobs, icon: Briefcase, color: "hsl(210 85% 55%)" },
            { label: "ইভেন্ট", count: counts.events, icon: Calendar, color: "hsl(270 60% 55%)" },
            { label: "অভিযোগ", count: counts.complaints, icon: AlertTriangle, color: "hsl(15 80% 55%)" },
            { label: "প্রবাসী", count: counts.expatriate_forums, icon: Globe, color: "hsl(195 70% 50%)" },
            { label: "অনুদান", count: counts.donations, icon: Heart, color: "hsl(340 75% 60%)" },
            { label: "স্লাইডার", count: counts.slider_items, icon: Image, color: "hsl(150 60% 40%)" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="glass-card p-3.5 border-l-4 hover:scale-[1.02] transition-transform" style={{ borderColor: s.color }}>
                <div className="flex items-center justify-between mb-1">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xl font-bold text-foreground">{s.count ?? "..."}</span>
                </div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-bold text-foreground mb-3">⚡ দ্রুত অ্যাকশন</h2>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "স্লাইডার", tab: "slider" as Tab, icon: Image },
            { label: "ঘোষণা", tab: "announcements" as Tab, icon: Megaphone },
            { label: "জরুরি কল", tab: "emergency" as Tab, icon: Phone },
            { label: "অ্যাক্টিভিটি", tab: "activity" as Tab, icon: Activity },
            { label: "ইউজার", tab: "users" as Tab, icon: Users },
            { label: "সেটিংস", tab: "about" as Tab, icon: FileText },
          ].map((a) => {
            const Icon = a.icon;
            return (
              <button key={a.label} onClick={() => setActiveTab(a.tab)}
                className="glass-card p-3 flex flex-col items-center gap-1.5 hover:bg-primary/5 transition-colors">
                <Icon className="w-5 h-5 text-primary" />
                <span className="text-xs font-medium text-foreground">{a.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderActivity = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" /> সাম্প্রতিক কার্যকলাপ
        </h2>
        <div className="flex items-center gap-1 text-xs text-green-600">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          লাইভ
        </div>
      </div>
      {loading ? (
        <p className="text-center text-muted-foreground py-8">লোড হচ্ছে...</p>
      ) : activityLog.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">কোন অ্যাক্টিভিটি নেই</p>
      ) : (
        activityLog.map((log: any) => (
          <div key={log.id} className="glass-card p-3 flex items-start gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              log.action === "approved" ? "bg-green-100 text-green-600" :
              log.action === "deleted" ? "bg-red-100 text-red-600" :
              log.action === "logout" ? "bg-gray-100 text-gray-600" :
              "bg-blue-100 text-blue-600"
            }`}>
              {log.action === "approved" ? <CheckCircle className="w-4 h-4" /> :
               log.action === "deleted" ? <Trash2 className="w-4 h-4" /> :
               log.action === "logout" ? <LogOut className="w-4 h-4" /> :
               <Eye className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground capitalize">{log.action}</p>
              {log.table_name && <p className="text-xs text-muted-foreground">{log.table_name}{log.details ? ` — ${log.details}` : ""}</p>}
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(log.created_at).toLocaleString("bn-BD")}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
        <Users className="w-4 h-4 text-primary" /> ইউজার ম্যানেজমেন্ট
      </h2>
      {loading ? (
        <p className="text-center text-muted-foreground py-8">লোড হচ্ছে...</p>
      ) : usersList.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">কোন ইউজার নেই</p>
      ) : (
        usersList.map((user: any) => (
          <div key={user.id} className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-foreground truncate">{user.display_name || "No Name"}</h3>
                <p className="text-xs text-muted-foreground">{user.phone || "ফোন নেই"}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString("bn-BD")}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                {user.roles.map((r: string) => (
                  <span key={r} className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    r === "admin" ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" :
                    r === "moderator" ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" :
                    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  }`}>
                    {r === "admin" ? "🛡️ এডমিন" : r === "moderator" ? "👮 মডারেটর" : "👤 ইউজার"}
                  </span>
                ))}
                {user.roles.length === 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">👤 সাধারণ</span>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderTable = () => {
    const table = tableMap[activeTab];
    if (!table || loading) return <p className="text-center text-muted-foreground py-8">লোড হচ্ছে...</p>;
    if (tableData.length === 0) return <p className="text-center text-muted-foreground py-8">কোন ডাটা নেই</p>;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">মোট: {tableData.length}টি</p>
          <button onClick={() => setActiveTab(activeTab)} className="text-xs text-primary flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> রিফ্রেশ
          </button>
        </div>
        {tableData.map((item: any) => {
          const itemName = item.title || item.name || item.text || item.method_name || item.article_title || item.donor_name || `${item.year || ""}`;
          return (
            <div key={item.id} className="glass-card p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground text-sm truncate">{itemName}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.category || item.blood_group || item.country || item.account_number || ""}
                  </p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
                  )}
                  {item.phone && <p className="text-xs text-muted-foreground">📞 {item.phone}</p>}
                  {item.created_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      📅 {new Date(item.created_at).toLocaleDateString("bn-BD")}
                    </p>
                  )}
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {"is_approved" in item && (
                    <button onClick={() => toggleApproval(table, item.id, item.is_approved, itemName)}
                      className={`text-xs px-2 py-1 rounded-lg transition-colors ${item.is_approved ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"}`}>
                      {item.is_approved ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    </button>
                  )}
                  {"is_active" in item && (
                    <button onClick={() => toggleActive(table, item.id, item.is_active, itemName)}
                      className={`text-xs px-2 py-1 rounded-lg transition-colors ${item.is_active ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}>
                      {item.is_active ? "🟢" : "⚫"}
                    </button>
                  )}
                  <button onClick={() => deleteItem(table, item.id, itemName)}
                    className="text-xs px-2 py-1 rounded-lg bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto">
      <div className="gradient-primary p-4 flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5" /> এডমিন প্যানেল
        </h1>
        <div className="flex items-center gap-2">
          {totalPending > 0 && (
            <span className="bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
              {totalPending}
            </span>
          )}
          <button onClick={handleLogout} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <LogOut className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Tab bar */}
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
        {activeTab === "dashboard" ? renderDashboard() : 
         activeTab === "activity" ? renderActivity() :
         activeTab === "users" ? renderUsers() :
         renderTable()}
      </div>
    </div>
  );
};

export default AdminDashboard;
