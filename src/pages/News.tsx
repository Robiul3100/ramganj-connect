import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Newspaper, Calendar, Clock, Search, Radio } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";

interface NewsItem {
  id: string;
  title: string;
  thumbnail_url: string | null;
  published_at: string;
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
        .select("id, title, thumbnail_url, published_at")
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

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const date = d.toLocaleDateString("bn-BD", { day: "2-digit", month: "short", year: "numeric" });
    const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    const dayName = d.toLocaleDateString("bn-BD", { weekday: "long" });
    return { date, time, dayName };
  };

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto pb-20">
      {/* Custom header */}
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

        {/* Search */}
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

      <div className="px-4 pt-3 space-y-3">
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
          <>
            {/* Featured first news */}
            {filtered.length > 0 && (() => {
              const first = filtered[0];
              const { date, time } = formatDate(first.published_at);
              return (
                <Link to={`/news/${first.id}`} className="glass-card overflow-hidden block group transition-all duration-200 hover:shadow-lg hover:scale-[1.01]">
                  <div className="w-full aspect-video bg-muted overflow-hidden relative">
                    {first.thumbnail_url ? (
                      <img src={first.thumbnail_url} alt={first.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/5">
                        <Newspaper className="w-12 h-12 text-muted-foreground/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="bg-destructive text-white text-[9px] font-bold px-2 py-0.5 rounded-full">ব্রেকিং</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="font-bold text-white text-sm leading-snug line-clamp-2 drop-shadow-sm">{first.title}</h3>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-white/80">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {time}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })()}

            {/* Rest as cards */}
            {filtered.slice(1).map((item) => {
              const { date, time } = formatDate(item.published_at);
              return (
                <Link to={`/news/${item.id}`} key={item.id} className="glass-card flex gap-3 p-2.5 items-center group transition-all duration-200 hover:shadow-md hover:scale-[1.01]">
                  <div className="w-24 h-[54px] rounded-lg bg-muted overflow-hidden shrink-0">
                    {item.thumbnail_url ? (
                      <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/5">
                        <Newspaper className="w-5 h-5 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground text-xs leading-snug line-clamp-2 group-hover:text-primary transition-colors">{item.title}</h3>
                    <div className="flex items-center gap-2 text-[9px] text-muted-foreground mt-1">
                      <span className="flex items-center gap-0.5"><Calendar className="w-2.5 h-2.5" /> {date}</span>
                      <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {time}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default News;
