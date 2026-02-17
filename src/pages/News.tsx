import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Newspaper, Search, Radio, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";

interface NewsItem {
  id: string;
  title: string;
  thumbnail_url: string | null;
  published_at: string;
  view_count: number;
}

const News = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("news")
        .select("id, title, thumbnail_url, published_at, view_count")
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

  const filtered = news.filter((n) => n.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-destructive" />
            <h1 className="text-lg font-bold text-foreground">খবর ও সংবাদ</h1>
          </div>
          <div className="flex items-center gap-1 bg-destructive/10 px-2.5 py-1 rounded-full">
            <Radio className="w-3 h-3 text-destructive animate-pulse" />
            <span className="text-[10px] font-bold text-destructive">LIVE</span>
          </div>
        </div>
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="খবর খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/60 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="px-4 pt-3 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground mt-3">লোড হচ্ছে...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card border-dashed flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Newspaper className="w-7 h-7 text-muted-foreground/40" />
            </div>
            <h3 className="font-bold text-foreground text-base">কোনো খবর নেই</h3>
            <p className="text-sm text-muted-foreground mt-1">বর্তমানে কোনো ব্রেকিং নিউজ পাওয়া যায়নি।</p>
          </div>
        ) : (
          filtered.map((item) => (
            <Link
              to={`/news/${item.id}`}
              key={item.id}
              className="glass-card overflow-hidden block group transition-all duration-200 hover:shadow-lg hover:scale-[1.01] border border-primary/10"
            >
              {/* Full-width 16:9 thumbnail */}
              <div className="w-full aspect-video bg-muted overflow-hidden relative">
                {item.thumbnail_url ? (
                  <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/5">
                    <Newspaper className="w-12 h-12 text-muted-foreground/20" />
                  </div>
                )}
                {/* View count badge */}
                <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 shadow-sm">
                  <Eye className="w-3.5 h-3.5 text-destructive" />
                  <span className="text-xs font-bold text-foreground">{item.view_count}</span>
                </div>
              </div>
              {/* Title below thumbnail */}
              <div className="p-3">
                <h3 className="font-bold text-foreground text-base leading-snug group-hover:text-primary transition-colors">{item.title}</h3>
              </div>
            </Link>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default News;
