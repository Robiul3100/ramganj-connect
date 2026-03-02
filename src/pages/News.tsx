import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Newspaper, Eye, Calendar, Clock, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import PageAdBanner from "@/components/PageAdBanner";
import BottomNav from "@/components/BottomNav";

interface NewsItem {
  id: string;
  title: string;
  body: string;
  thumbnail_url: string | null;
  published_at: string;
  view_count: number;
}

const newsColors = {
  gradient: "linear-gradient(135deg, hsl(355,68%,50%), hsl(15,75%,55%))",
  accent: "hsl(355,68%,50%)",
  bg: "hsl(355,68%,92%)",
};

const NewsCardSkeleton = () => (
  <div className="rounded-2xl overflow-hidden border border-border/60">
    <div className="w-full aspect-video skeleton-shimmer" />
    <div className="p-4 space-y-2.5">
      <div className="h-4 w-11/12 rounded-md skeleton-shimmer" />
      <div className="h-4 w-3/4 rounded-md skeleton-shimmer" />
      <div className="flex items-center gap-3 pt-1">
        <div className="h-3 w-24 rounded skeleton-shimmer" />
        <div className="h-3 w-16 rounded skeleton-shimmer" />
      </div>
    </div>
  </div>
);

const News = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("news")
        .select("id, title, body, thumbnail_url, published_at, view_count")
        .eq("is_active", true)
        .order("published_at", { ascending: false });
      setNews(data || []);
      setLoading(false);
    };
    fetchNews();

    const ch = supabase
      .channel("news_list_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "news" }, () => fetchNews())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const filtered = news;

  const totalViews = news.reduce((sum, n) => sum + n.view_count, 0);

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto pb-20">
      <PageHeader title="খবর ও সংবাদ" color={newsColors.gradient} />

      <div className="px-4 -mt-2 space-y-3">
        {/* Stats Bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-card rounded-xl px-3 py-2 border border-border/50">
            <Newspaper className="w-4 h-4" style={{ color: newsColors.accent }} />
            <span className="text-xs font-semibold text-foreground">{news.length}</span>
            <span className="text-[10px] text-muted-foreground">সংবাদ</span>
          </div>
          <div className="flex-1 flex items-center gap-2 bg-card rounded-xl px-3 py-2 border border-border/50">
            <Eye className="w-4 h-4" style={{ color: newsColors.accent }} />
            <span className="text-xs font-semibold text-foreground">{totalViews}</span>
            <span className="text-[10px] text-muted-foreground">মোট ভিউ</span>
          </div>
          <div className="flex-1 flex items-center gap-2 bg-card rounded-xl px-3 py-2 border border-border/50">
            <TrendingUp className="w-4 h-4" style={{ color: newsColors.accent }} />
            <span className="text-[10px] text-muted-foreground">লাইভ</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: newsColors.accent }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: newsColors.accent }} />
            </span>
          </div>
        </div>

        {/* Ad Banner */}
        <PageAdBanner pageSlug="news" />

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <NewsCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border flex flex-col items-center justify-center py-16 text-center bg-card">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Newspaper className="w-7 h-7 text-muted-foreground/40" />
            </div>
            <h3 className="font-bold text-foreground text-base">কোনো খবর নেই</h3>
            <p className="text-sm text-muted-foreground mt-1">বর্তমানে কোনো সংবাদ পাওয়া যায়নি।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-6">
            {filtered.map((item, index) => (
              <Link
                to={`/news/${item.id}`}
                key={item.id}
                className="rounded-2xl overflow-hidden bg-card border transition-all duration-200 hover:shadow-lg hover:scale-[1.01] active:scale-[0.98] group"
                style={{ borderColor: newsColors.accent + "30" }}
              >
                {/* Accent top bar */}
                <div className="h-1 w-full" style={{ background: newsColors.gradient }} />

                {/* Thumbnail */}
                <div className="w-full aspect-video bg-muted overflow-hidden relative">
                  {item.thumbnail_url ? (
                    <img
                      src={item.thumbnail_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: newsColors.bg }}>
                      <Newspaper className="w-12 h-12 text-muted-foreground/20" />
                    </div>
                  )}
                  {/* View count badge */}
                  <div className="absolute top-2.5 right-2.5 bg-card/90 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1 shadow-sm border border-border/30">
                    <Eye className="w-3 h-3" style={{ color: newsColors.accent }} />
                    <span className="text-[10px] font-bold text-foreground">{item.view_count}</span>
                  </div>
                  {/* Breaking badge for first item */}
                  {index === 0 && (
                    <div className="absolute top-2.5 left-2.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm" style={{ background: newsColors.accent }}>
                      সর্বশেষ
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-3.5 space-y-2">
                  <h3 className="font-bold text-foreground text-[15px] leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(item.published_at).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(item.published_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}</span>
                    </div>
                    <span className="text-muted-foreground/40">•</span>
                    <span>{new Date(item.published_at).toLocaleDateString("bn-BD", { weekday: "long" })}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default News;
