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
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      const { data: setting } = await (supabase.from as any)("site_settings")
        .select("value").eq("key", "latest_news_enabled").single();
      if (setting?.value === "false") { setEnabled(false); return; }
      setEnabled(true);
      const { data } = await supabase
        .from("news")
        .select("id, title, thumbnail_url, published_at")
        .eq("is_active", true)
        .order("published_at", { ascending: false })
        .limit(10);
      setNews(data || []);
    };
    fetchNews();

    const ch = supabase
      .channel("latest_news_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "news" }, () => fetchNews())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  if (!enabled || news.length === 0) return null;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
    };
  };

  const items = [...news, ...news];

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

      <div className="overflow-hidden -mx-4 px-4">
        <div className="flex gap-3 marquee-left" style={{ width: "max-content" }}>
          {items.map((item, i) => {
            const { date, time } = formatDate(item.published_at);
            return (
              <Link
                to={`/news/${item.id}`}
                key={`${item.id}-${i}`}
                className="glass-card overflow-hidden w-[340px] shrink-0 flex flex-row items-stretch transition-transform duration-200 hover:scale-[1.02] rounded-2xl"
              >
                {/* Square thumbnail */}
                <div className="w-[150px] aspect-video bg-muted overflow-hidden shrink-0 rounded-l-2xl self-center">
                  {item.thumbnail_url ? (
                    <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/5">
                      <Newspaper className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                {/* Content side */}
                <div className="flex-1 p-3 flex flex-col justify-between min-w-0 relative">
                  {/* Live dot */}
                  <div className="absolute top-3 right-3">
                    <span className="w-3 h-3 rounded-full bg-red-500 block animate-pulse" />
                  </div>
                  <h3 className="font-bold text-foreground text-sm leading-snug line-clamp-3 pr-5">{item.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {time}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LatestNews;
