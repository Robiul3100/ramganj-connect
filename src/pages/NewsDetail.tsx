import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Newspaper, Eye, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import PageAdBanner from "@/components/PageAdBanner";

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
        .select("id, title, body, thumbnail_url, published_at, view_count")
        .eq("id", id)
        .eq("is_active", true)
        .single();
      setNews(data);
      setLoading(false);

      if (data) {
        await supabase.rpc("increment_news_view", { news_id: id });
      }
    };
    fetchNews();
  }, [id]);

  const handleShare = () => {
    if (news && navigator.share) {
      navigator.share({ title: news.title, url: window.location.href });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background max-w-4xl mx-auto pb-20">
        {/* Header skeleton */}
        <div className="relative overflow-hidden" style={{ background: newsColors.gradient }}>
          <div className="flex items-center justify-between px-4 py-5 pb-12">
            <div className="w-10 h-10 rounded-full bg-white/20" />
            <div className="h-5 w-32 rounded bg-white/20" />
            <div className="w-10" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-background rounded-t-3xl" />
        </div>
        <div className="px-4 -mt-2 space-y-4">
          <div className="w-full aspect-video rounded-2xl skeleton-shimmer" />
          <div className="h-6 w-11/12 rounded-md skeleton-shimmer" />
          <div className="h-6 w-3/4 rounded-md skeleton-shimmer" />
          <div className="flex gap-3">
            <div className="h-4 w-28 rounded skeleton-shimmer" />
            <div className="h-4 w-20 rounded skeleton-shimmer" />
          </div>
          <div className="h-px bg-border" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 rounded skeleton-shimmer" style={{ width: `${85 - i * 8}%` }} />
            ))}
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-background max-w-4xl mx-auto pb-20">
        <div className="relative overflow-hidden" style={{ background: newsColors.gradient }}>
          <div className="flex items-center justify-between px-4 py-5 pb-12">
            <button onClick={() => navigate("/news")} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">সংবাদ</h1>
            <div className="w-10" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-background rounded-t-3xl" />
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Newspaper className="w-7 h-7 text-muted-foreground/40" />
          </div>
          <h3 className="font-bold text-foreground text-base">সংবাদটি পাওয়া যায়নি</h3>
          <p className="text-sm text-muted-foreground mt-1">এই সংবাদটি মুছে ফেলা হয়েছে অথবা নিষ্ক্রিয় করা হয়েছে।</p>
          <Link to="/news" className="mt-4 px-5 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: newsColors.accent }}>
            সব সংবাদ দেখুন
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  const pubDate = new Date(news.published_at);

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto pb-20">
      {/* Gradient Header */}
      <div className="relative overflow-hidden" style={{ background: newsColors.gradient }}>
        <div className="flex items-center justify-between px-4 py-5 pb-12">
          <button onClick={() => navigate("/news")} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">সংবাদ বিস্তারিত</h1>
          <button onClick={handleShare} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Share2 className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-background rounded-t-3xl" />
      </div>

      <div className="px-4 -mt-2 space-y-4">
        {/* Ad Banner */}
        <PageAdBanner pageSlug="news-detail" />

        {/* Thumbnail */}
        {news.thumbnail_url && (
          <div className="rounded-2xl overflow-hidden border border-border/30 shadow-sm">
            <img src={news.thumbnail_url} alt={news.title} className="w-full max-h-[300px] object-cover" />
          </div>
        )}

        {/* Title Card */}
        <div className="rounded-2xl bg-card border p-4 space-y-3" style={{ borderColor: newsColors.accent + "25" }}>
          <div className="h-1 w-12 rounded-full" style={{ background: newsColors.accent }} />
          <h1 className="text-xl font-bold text-foreground leading-snug">{news.title}</h1>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" style={{ color: newsColors.accent }} />
              <span>{pubDate.toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" style={{ color: newsColors.accent }} />
              <span>{pubDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}</span>
            </div>
            <span className="text-muted-foreground/40">•</span>
            <span>{pubDate.toLocaleDateString("bn-BD", { weekday: "long" })}</span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <div className="flex items-center gap-1 bg-muted/60 px-2.5 py-1 rounded-full">
              <Eye className="w-3.5 h-3.5" style={{ color: newsColors.accent }} />
              <span className="text-xs font-bold text-foreground">{news.view_count + 1}</span>
              <span className="text-[10px] text-muted-foreground">ভিউ</span>
            </div>
          </div>
        </div>

        {/* Body Card */}
        <div className="rounded-2xl bg-card border border-border/50 p-4">
          <div className="news-html-content text-sm text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: news.body }} />
        </div>

        {/* Back to news */}
        <div className="flex justify-center pb-4">
          <Link
            to="/news"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: newsColors.gradient }}
          >
            ← সব সংবাদ দেখুন
          </Link>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default NewsDetail;
