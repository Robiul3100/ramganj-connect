import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Newspaper, ChevronRight, Calendar } from "lucide-react";
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

  return (
    <section className="px-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">আজকের আপডেট</h2>
        </div>
        <Link to="/news" className="text-xs text-primary font-medium flex items-center gap-0.5">
          সব দেখুন <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
        {news.map((item) => (
          <Link
            to={`/news/${item.id}`}
            key={item.id}
            className="glass-card min-w-[200px] max-w-[220px] snap-start overflow-hidden flex flex-col"
          >
            <div className="w-full h-28 bg-muted overflow-hidden">
              {item.thumbnail_url ? (
                <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Newspaper className="w-8 h-8 text-muted-foreground/40" />
                </div>
              )}
            </div>
            <div className="p-3 flex-1 flex flex-col">
              <h3 className="font-bold text-foreground text-xs leading-snug line-clamp-2 mb-1.5">{item.title}</h3>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-auto">
                <Calendar className="w-3 h-3" />
                {new Date(item.published_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default LatestNews;
