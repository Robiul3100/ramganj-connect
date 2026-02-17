import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Newspaper, Calendar, Clock } from "lucide-react";
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

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    const dayName = d.toLocaleDateString("bn-BD", { weekday: "long" });
    return { date, time, dayName };
  };

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto pb-20">
      <PageHeader title="আজকের রামগঞ্জ" color="linear-gradient(135deg, hsl(210,85%,50%), hsl(200,80%,45%))" />

      <div className="px-4 -mt-2 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground mt-3">লোড হচ্ছে...</p>
          </div>
        ) : news.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Newspaper className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-foreground text-lg">কোনো নিউজ নেই</h3>
            <p className="text-sm text-muted-foreground mt-1">নতুন নিউজ প্রকাশিত হলে এখানে দেখাবে।</p>
          </div>
        ) : (
          news.map((item) => {
            const { date, time, dayName } = formatDate(item.published_at);
            return (
              <Link to={`/news/${item.id}`} key={item.id} className="glass-card flex gap-3 p-3 hover:shadow-md transition-shadow">
                <div className="w-28 h-20 rounded-xl bg-muted overflow-hidden shrink-0">
                  {item.thumbnail_url ? (
                    <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Newspaper className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <h3 className="font-bold text-foreground text-sm leading-snug line-clamp-2">{item.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Calendar className="w-3 h-3 shrink-0" />
                    <span>{date}</span>
                    <span>||</span>
                    <Clock className="w-3 h-3 shrink-0" />
                    <span>{time}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{dayName}</span>
                </div>
              </Link>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default News;
