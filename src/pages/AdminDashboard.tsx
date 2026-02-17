import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, LayoutDashboard, Image, Megaphone, Phone, Droplets, Briefcase, Calendar, AlertTriangle, Globe, Heart, FileText, Clock, Settings } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Tab = "dashboard" | "slider" | "announcements" | "emergency" | "blood" | "jobs" | "events" | "complaints" | "expatriate" | "donation" | "about" | "timeline";

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: "dashboard", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
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

  useEffect(() => {
    // Check auth
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/admin-login"); return; }
      const { data: roles } = await (supabase.from as any)("user_roles").select("role").eq("user_id", user.id);
      if (!roles || !roles.some(r => r.role === "admin")) { navigate("/admin-login"); }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const fetchCounts = async () => {
      const tableNames = ["emergency_calls", "blood_donors", "jobs", "events", "complaints", "expatriate_forums", "donations", "slider_items", "announcements", "timeline_events"];
      const results: Record<string, number> = {};
      for (const t of tableNames) {
        const { count } = await (supabase.from as any)(t).select("*", { count: "exact", head: true });
        results[t] = count || 0;
      }
      setCounts(results);
    };
    fetchCounts();
  }, []);

  const tableMap: Record<string, string> = {
    slider: "slider_items", announcements: "announcements", emergency: "emergency_calls",
    blood: "blood_donors", jobs: "jobs", events: "events", complaints: "complaints",
    expatriate: "expatriate_forums", donation: "donations", about: "about_content", timeline: "timeline_events",
  };

  useEffect(() => {
    if (activeTab === "dashboard") return;
    const fetchData = async () => {
      setLoading(true);
      const table = tableMap[activeTab];
      if (!table) return;
      const { data } = await (supabase.from as any)(table).select("*").order("created_at", { ascending: false });
      setTableData(data || []);
      setLoading(false);
    };
    fetchData();

    // Realtime
    const table = tableMap[activeTab];
    if (table) {
      const ch = supabase.channel(`admin_${table}`).on("postgres_changes", { event: "*", schema: "public", table }, () => fetchData()).subscribe();
      return () => { supabase.removeChannel(ch); };
    }
  }, [activeTab]);

  const toggleApproval = async (table: string, id: string, currentVal: boolean) => {
    await (supabase.from as any)(table).update({ is_approved: !currentVal }).eq("id", id);
    toast({ title: !currentVal ? "অনুমোদিত ✅" : "অননুমোদিত ❌" });
  };

  const toggleActive = async (table: string, id: string, currentVal: boolean) => {
    await (supabase.from as any)(table).update({ is_active: !currentVal }).eq("id", id);
    toast({ title: !currentVal ? "সক্রিয় ✅" : "নিষ্ক্রিয় ❌" });
  };

  const deleteItem = async (table: string, id: string) => {
    if (!confirm("মুছে ফেলতে চান?")) return;
    await (supabase.from as any)(table).delete().eq("id", id);
    toast({ title: "মুছে ফেলা হয়েছে" });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin-login");
  };

  const renderDashboard = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground">📊 ওভারভিউ</h2>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "জরুরি কল", count: counts.emergency_calls, color: "hsl(0,70%,50%)" },
          { label: "রক্তদাতা", count: counts.blood_donors, color: "hsl(0,80%,55%)" },
          { label: "চাকরি", count: counts.jobs, color: "hsl(210,85%,55%)" },
          { label: "ইভেন্ট", count: counts.events, color: "hsl(270,60%,55%)" },
          { label: "অভিযোগ", count: counts.complaints, color: "hsl(15,80%,55%)" },
          { label: "প্রবাসী ফোরাম", count: counts.expatriate_forums, color: "hsl(195,70%,50%)" },
          { label: "অনুদান", count: counts.donations, color: "hsl(340,75%,60%)" },
          { label: "স্লাইডার", count: counts.slider_items, color: "hsl(150,60%,40%)" },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4 border-l-4" style={{ borderColor: s.color }}>
            <p className="text-2xl font-bold text-foreground">{s.count ?? "..."}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTable = () => {
    const table = tableMap[activeTab];
    if (!table || loading) return <p className="text-center text-muted-foreground py-8">লোড হচ্ছে...</p>;
    if (tableData.length === 0) return <p className="text-center text-muted-foreground py-8">কোন ডাটা নেই</p>;

    return (
      <div className="space-y-3">
        {tableData.map((item: any) => (
          <div key={item.id} className="glass-card p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground text-sm truncate">
                  {item.title || item.name || item.text || item.method_name || item.article_title || item.donor_name || `${item.year}`}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.category || item.blood_group || item.country || item.account_number || item.description || ""}
                </p>
                {item.phone && <p className="text-xs text-muted-foreground">📞 {item.phone}</p>}
                {item.created_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    📅 {new Date(item.created_at).toLocaleDateString("bn-BD")}
                  </p>
                )}
              </div>
              <div className="flex gap-1.5 shrink-0">
                {"is_approved" in item && (
                  <button onClick={() => toggleApproval(table, item.id, item.is_approved)}
                    className={`text-xs px-2 py-1 rounded-lg ${item.is_approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {item.is_approved ? "✅" : "⏳"}
                  </button>
                )}
                {"is_active" in item && (
                  <button onClick={() => toggleActive(table, item.id, item.is_active)}
                    className={`text-xs px-2 py-1 rounded-lg ${item.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                    {item.is_active ? "🟢" : "⚫"}
                  </button>
                )}
                <button onClick={() => deleteItem(table, item.id)}
                  className="text-xs px-2 py-1 rounded-lg bg-red-100 text-red-700">🗑️</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto">
      <div className="gradient-primary p-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">⚙️ এডমিন প্যানেল</h1>
        <button onClick={handleLogout} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
          <LogOut className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Tab bar */}
      <div className="px-2 py-3 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                <Icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pb-8">
        {activeTab === "dashboard" ? renderDashboard() : renderTable()}
      </div>
    </div>
  );
};

export default AdminDashboard;
