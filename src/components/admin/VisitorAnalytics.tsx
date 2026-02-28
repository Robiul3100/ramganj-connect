import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Eye, Globe, TrendingUp, Clock, RefreshCw, Users } from "lucide-react";

interface PageViewStats {
  todayViews: number;
  totalViews: number;
  uniqueToday: number;
  topPages: { page_path: string; count: number }[];
  recentVisitors: { page_path: string; created_at: string; user_agent: string }[];
  hourlyData: { hour: string; count: number }[];
}

const VisitorAnalytics = () => {
  const [stats, setStats] = useState<PageViewStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [todayRes, totalRes, topRes, recentRes] = await Promise.all([
      (supabase.from as any)("page_views")
        .select("*", { count: "exact", head: false })
        .gte("created_at", todayStart.toISOString()),
      (supabase.from as any)("page_views")
        .select("*", { count: "exact", head: true }),
      (supabase.from as any)("page_views")
        .select("page_path")
        .gte("created_at", todayStart.toISOString()),
      (supabase.from as any)("page_views")
        .select("page_path, created_at, user_agent")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    // Count top pages
    const pageCounts: Record<string, number> = {};
    const uniqueAgents = new Set<string>();
    if (todayRes.data) {
      todayRes.data.forEach((v: any) => {
        pageCounts[v.page_path] = (pageCounts[v.page_path] || 0) + 1;
        if (v.user_agent) uniqueAgents.add(v.user_agent);
      });
    }
    
    const topPages = Object.entries(pageCounts)
      .map(([page_path, count]) => ({ page_path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Hourly data
    const hourlyMap: Record<string, number> = {};
    if (todayRes.data) {
      todayRes.data.forEach((v: any) => {
        const h = new Date(v.created_at).getHours();
        const key = `${h}:00`;
        hourlyMap[key] = (hourlyMap[key] || 0) + 1;
      });
    }
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      count: hourlyMap[`${i}:00`] || 0,
    }));

    setStats({
      todayViews: todayRes.count || todayRes.data?.length || 0,
      totalViews: totalRes.count || 0,
      uniqueToday: uniqueAgents.size,
      topPages,
      recentVisitors: recentRes.data || [],
      hourlyData,
    });
    setLoading(false);
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-10 h-10 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-sm text-muted-foreground font-medium">অ্যানালিটিক্স লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!stats) return null;

  const pageNameMap: Record<string, string> = {
    "/": "হোমপেজ",
    "/services": "সেবাসমূহ",
    "/emergency-calls": "জরুরি সেবা",
    "/blood-bank": "ব্লাড ব্যাংক",
    "/offices": "অফিস",
    "/news": "নিউজ",
    "/about-ramganj": "সম্পর্কে",
    "/contact": "যোগাযোগ",
    "/donation": "অনুদান",
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" /> ভিজিটর অ্যানালিটিক্স
        </h3>
        <button onClick={fetchStats} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
          <RefreshCw className="w-3 h-3" /> রিফ্রেশ
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "আজকের ভিউ", value: stats.todayViews, icon: Eye, gradient: "from-blue-500 to-cyan-500" },
          { label: "ইউনিক ভিজিটর", value: stats.uniqueToday, icon: Users, gradient: "from-emerald-500 to-teal-500" },
          { label: "মোট পেজ ভিউ", value: stats.totalViews, icon: Globe, gradient: "from-violet-500 to-purple-500" },
        ].map((s) => (
          <div key={s.label} className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-4 group hover:shadow-lg transition-all">
            <div className={`absolute top-0 right-0 w-16 h-16 rounded-full bg-gradient-to-br ${s.gradient} opacity-[0.07] -translate-y-1/3 translate-x-1/3`} />
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-2`}>
              <s.icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-xl font-bold text-foreground">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Hourly Chart (Simple bar) */}
      <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4">
        <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> আজকের ঘণ্টা ভিত্তিক ভিউ
        </p>
        <div className="flex items-end gap-[2px] h-20">
          {stats.hourlyData.map((h, i) => {
            const max = Math.max(...stats.hourlyData.map(d => d.count), 1);
            const height = (h.count / max) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group/bar">
                <div
                  className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-sm transition-all group-hover/bar:opacity-80"
                  style={{ height: `${Math.max(height, 2)}%` }}
                  title={`${h.hour} — ${h.count} ভিউ`}
                />
                {i % 4 === 0 && (
                  <span className="text-[7px] text-muted-foreground/60">{i}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Pages */}
      {stats.topPages.length > 0 && (
        <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" /> আজকের টপ পেজ
          </p>
          <div className="space-y-2">
            {stats.topPages.map((p, i) => {
              const max = stats.topPages[0].count;
              const width = (p.count / max) * 100;
              return (
                <div key={p.page_path} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-foreground font-medium truncate">
                      {i + 1}. {pageNameMap[p.page_path] || p.page_path}
                    </span>
                    <span className="text-[10px] font-bold text-primary shrink-0 ml-2">{p.count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Visitors */}
      <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4">
        <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5" /> সাম্প্রতিক ভিজিট
        </p>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {stats.recentVisitors.map((v, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5 border-b border-border/30 last:border-0">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Eye className="w-3 h-3 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-foreground truncate">
                  {pageNameMap[v.page_path] || v.page_path}
                </p>
                <p className="text-[9px] text-muted-foreground">
                  {new Date(v.created_at).toLocaleString("bn-BD", { hour: "2-digit", minute: "2-digit", hour12: true })}
                  {v.user_agent && ` • ${v.user_agent.includes("Mobile") ? "📱 মোবাইল" : "💻 ডেস্কটপ"}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VisitorAnalytics;
