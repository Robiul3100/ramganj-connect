import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Newspaper, ChevronRight, Calendar, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface NewsItem {
  id: string;
  title: string;
  thumbnail_url: string | null;
  published_at: string;
}

const LatestNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      const { data } = await supabase
        .from("news")
        .select("id, title, thumbnail_url, published_at")
        .eq("is_active", true)
        .order("published_at", { ascending: false })
        .limit(5);
      setNews(data || []);
    };
    fetchNews();

    const ch = supabase
      .channel("latest_news_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "news" }, () => fetchNews())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  if (news.length === 0) return null;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
    };
  };

  // First item as featured card, rest as list
  const [featured, ...rest] = news;

  return (
    <section className="px-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Newspaper className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground">আজকের আপডেট</h2>
        </div>
        <Link to="/news" className="text-xs text-primary font-semibold flex items-center gap-0.5 bg-primary/10 px-3 py-1.5 rounded-full">
          সব দেখুন <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Featured / Hero news */}
      <Link to={`/news/${featured.id}`} className="glass-card overflow-hidden block mb-3">
        <div className="w-full aspect-[2.2/1] bg-muted overflow-hidden relative">
          {featured.thumbnail_url ? (
            <img src={featured.thumbnail_url} alt={featured.title} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/5">
              <Newspaper className="w-10 h-10 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="font-bold text-white text-sm leading-snug line-clamp-2 drop-shadow-sm">{featured.title}</h3>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-[10px] text-white/80 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {formatDate(featured.published_at).date}
              </span>
              <span className="text-[10px] text-white/80 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {formatDate(featured.published_at).time}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Rest as compact list */}
      {rest.length > 0 && (
        <div className="space-y-2">
          {rest.map((item) => {
            const { date, time } = formatDate(item.published_at);
            return (
              <Link to={`/news/${item.id}`} key={item.id} className="glass-card flex gap-3 p-2.5 items-center">
                <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden shrink-0">
                  {item.thumbnail_url ? (
                    <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/5">
                      <Newspaper className="w-5 h-5 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground text-xs leading-snug line-clamp-2">{item.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Calendar className="w-2.5 h-2.5" /> {date}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" /> {time}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default LatestNews;
