import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { BarChart3, Eye, MousePointerClick } from "lucide-react";

const COLORS = [
  "hsl(210,85%,55%)", "hsl(150,60%,40%)", "hsl(330,55%,55%)", "hsl(270,60%,55%)",
  "hsl(30,75%,50%)", "hsl(185,60%,42%)", "hsl(0,60%,50%)", "hsl(120,45%,40%)",
  "hsl(250,40%,50%)", "hsl(50,80%,45%)", "hsl(195,70%,50%)", "hsl(340,70%,55%)",
];

interface Props {
  categories: any[];
  adItems: any[];
}

const AnalyticsCharts = ({ categories, adItems }: Props) => {
  const catData = useMemo(() =>
    categories
      .filter((c: any) => (c.view_count ?? 0) > 0)
      .sort((a: any, b: any) => (b.view_count ?? 0) - (a.view_count ?? 0))
      .slice(0, 10)
      .map((c: any) => ({ name: c.name.length > 10 ? c.name.slice(0, 10) + "…" : c.name, ভিউ: c.view_count ?? 0 })),
    [categories]
  );

  const adData = useMemo(() =>
    adItems
      .filter((a: any) => (a.click_count ?? 0) > 0)
      .sort((a: any, b: any) => (b.click_count ?? 0) - (a.click_count ?? 0))
      .slice(0, 10)
      .map((a: any) => ({ name: a.title.length > 12 ? a.title.slice(0, 12) + "…" : a.title, ক্লিক: a.click_count ?? 0 })),
    [adItems]
  );

  if (catData.length === 0 && adData.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-primary" /> অ্যানালিটিক্স
      </h3>

      {catData.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" /> ক্যাটাগরি ভিউ (টপ ১০)
          </p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-30} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Bar dataKey="ভিউ" radius={[6, 6, 0, 0]}>
                  {catData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {adData.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
            <MousePointerClick className="w-3.5 h-3.5" /> বিজ্ঞাপন ক্লিক
          </p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={adData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-30} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Bar dataKey="ক্লিক" radius={[6, 6, 0, 0]}>
                  {adData.map((_, i) => (
                    <Cell key={i} fill={COLORS[(i + 4) % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsCharts;
