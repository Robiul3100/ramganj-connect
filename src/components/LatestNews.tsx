import { useState, useEffect, useRef } from "react";
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNews = async () => {
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

  // Auto-scroll LEFT
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || news.length <= 1) return;

    const interval = setInterval(() => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScroll - 2) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: 220, behavior: "smooth" });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [news]);

  if (news.length === 0) return null;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
    };
  };

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

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {news.map((item) => {
          const { date, time } = formatDate(item.published_at);
          return (
            <Link
              to={`/news/${item.id}`}
              key={item.id}
              className="glass-card overflow-hidden min-w-[220px] max-w-[220px] snap-start shrink-0 block"
            >
              {/* 16:9 Thumbnail */}
              <div className="w-full aspect-video bg-muted overflow-hidden relative">
                {item.thumbnail_url ? (
                  <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/5">
                    <Newspaper className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              {/* Content */}
              <div className="p-2.5">
                <h3 className="font-bold text-foreground text-xs leading-snug line-clamp-2 mb-1.5">{item.title}</h3>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <Calendar className="w-2.5 h-2.5" /> {date}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" /> {time}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default LatestNews;
