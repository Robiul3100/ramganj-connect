import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid, Area, AreaChart } from "recharts";
import { TrendingUp, Users, CheckCircle, RefreshCw, CalendarDays } from "lucide-react";

type Period = "7d" | "30d";

interface DayData {
  date: string;
  label: string;
  visitors: number;
  submissions: number;
  approved: number;
  rejected: number;
}

const TrendCharts = () => {
  const [period, setPeriod] = useState<Period>("7d");
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrends = useCallback(async () => {
    setLoading(true);
    const days = period === "7d" ? 7 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    const iso = startDate.toISOString();

    const [viewsRes, servicesRes] = await Promise.all([
      (supabase.from as any)("page_views").select("created_at").gte("created_at", iso),
      (supabase.from as any)("services").select("created_at, status").gte("created_at", iso),
    ]);

    // Build day buckets
    const buckets: Record<string, DayData> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const key = d.toISOString().slice(0, 10);
      const label = period === "7d"
        ? d.toLocaleDateString("bn-BD", { weekday: "short" })
        : `${d.getDate()}`;
      buckets[key] = { date: key, label, visitors: 0, submissions: 0, approved: 0, rejected: 0 };
    }

    (viewsRes.data || []).forEach((v: any) => {
      const key = v.created_at?.slice(0, 10);
      if (buckets[key]) buckets[key].visitors++;
    });

    (servicesRes.data || []).forEach((s: any) => {
      const key = s.created_at?.slice(0, 10);
      if (buckets[key]) {
        buckets[key].submissions++;
        if (s.status === "approved") buckets[key].approved++;
        if (s.status === "rejected") buckets[key].rejected++;
      }
    });

    setData(Object.values(buckets));
    setLoading(false);
  }, [period]);

  useEffect(() => { fetchTrends(); }, [fetchTrends]);

  const totals = useMemo(() => ({
    visitors: data.reduce((s, d) => s + d.visitors, 0),
    submissions: data.reduce((s, d) => s + d.submissions, 0),
    approved: data.reduce((s, d) => s + d.approved, 0),
  }), [data]);

  const approvalRate = totals.submissions > 0
    ? Math.round((totals.approved / totals.submissions) * 100)
    : 0;

  if (loading) {
    return (
      <div className="bg-card border border-border/60 rounded-2xl p-6 flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" /> ট্রেন্ড অ্যানালিটিক্স
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted/60 rounded-xl p-0.5 border border-border/40">
            {(["7d", "30d"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  period === p
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p === "7d" ? "৭ দিন" : "৩০ দিন"}
              </button>
            ))}
          </div>
          <button onClick={fetchTrends} className="text-muted-foreground hover:text-primary transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: "মোট ভিজিটর", value: totals.visitors, icon: Users, gradient: "from-blue-500 to-cyan-500" },
          { label: "সাবমিশন", value: totals.submissions, icon: CalendarDays, gradient: "from-emerald-500 to-teal-500" },
          { label: "অনুমোদন হার", value: `${approvalRate}%`, icon: CheckCircle, gradient: "from-violet-500 to-purple-500" },
        ].map((s) => (
          <div key={s.label} className="relative overflow-hidden rounded-2xl bg-card border border-border/60 p-3 group">
            <div className={`absolute top-0 right-0 w-12 h-12 rounded-full bg-gradient-to-br ${s.gradient} opacity-[0.07] -translate-y-1/3 translate-x-1/3`} />
            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-1.5`}>
              <s.icon className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-lg font-extrabold text-foreground">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Visitor Growth Chart */}
      <div className="bg-card border border-border/60 rounded-2xl p-4">
        <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" /> ভিজিটর গ্রোথ
        </p>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="visitorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(210,85%,55%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(210,85%,55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 12,
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--card))",
                }}
              />
              <Area type="monotone" dataKey="visitors" stroke="hsl(210,85%,55%)" fill="url(#visitorGrad)" strokeWidth={2} name="ভিজিটর" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Submissions & Approvals Chart */}
      <div className="bg-card border border-border/60 rounded-2xl p-4">
        <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5" /> সেবা সাবমিশন ও অনুমোদন
        </p>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 12,
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--card))",
                }}
              />
              <Bar dataKey="submissions" fill="hsl(150,60%,40%)" radius={[4, 4, 0, 0]} name="সাবমিশন" />
              <Bar dataKey="approved" fill="hsl(210,85%,55%)" radius={[4, 4, 0, 0]} name="অনুমোদিত" />
              <Bar dataKey="rejected" fill="hsl(0,60%,50%)" radius={[4, 4, 0, 0]} name="প্রত্যাখ্যাত" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-4 mt-2">
          {[
            { label: "সাবমিশন", color: "hsl(150,60%,40%)" },
            { label: "অনুমোদিত", color: "hsl(210,85%,55%)" },
            { label: "প্রত্যাখ্যাত", color: "hsl(0,60%,50%)" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: l.color }} />
              <span className="text-[10px] text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendCharts;
