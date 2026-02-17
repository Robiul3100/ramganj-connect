import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Newspaper } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";

interface NewsItem {
  id: string;
  title: string;
  body: string;
  thumbnail_url: string | null;
  published_at: string;
}

const NewsDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      if (!id) return;
      setLoading(true);
      const { data } = await supabase
        .from("news")
        .select("id, title, body, thumbnail_url, published_at")
        .eq("id", id)
        .eq("is_active", true)
        .single();
      setNews(data);
      setLoading(false);
    };
    fetchNews();
  }, [id]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
    const dayName = d.toLocaleDateString("bn-BD", { weekday: "long" });
    return `${date} || ${time} — ${dayName}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background max-w-4xl mx-auto flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-background max-w-4xl mx-auto pb-20">
        <div className="gradient-primary p-4 flex items-center gap-3">
          <button onClick={() => navigate("/news")} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">নিউজ</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
          <Newspaper className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="font-bold text-foreground text-lg">নিউজটি পাওয়া যায়নি</h3>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 gradient-primary p-4 flex items-center gap-3">
        <button onClick={() => navigate("/news")} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-lg font-bold text-white truncate">নিউজ বিস্তারিত</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Thumbnail */}
        {news.thumbnail_url && (
          <div className="rounded-2xl overflow-hidden">
            <img src={news.thumbnail_url} alt={news.title} className="w-full max-h-[300px] object-cover" />
          </div>
        )}

        {/* Title */}
        <h1 className="text-xl font-bold text-foreground leading-snug">{news.title}</h1>

        {/* Date/Time */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(news.published_at)}</span>
        </div>

        {/* Divider */}
        <hr className="border-border" />

        {/* Body */}
        <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
          {news.body}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default NewsDetail;
