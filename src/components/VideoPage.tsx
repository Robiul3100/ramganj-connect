import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "./PageHeader";
import BottomNav from "./BottomNav";
import { Play, Eye, Star, Search, X, ArrowLeft } from "lucide-react";

interface VideoItem {
  id: string;
  title: string;
  youtube_url: string;
  youtube_id: string;
  thumbnail_url: string | null;
  description: string | null;
  is_featured: boolean;
  view_count: number;
  created_at: string;
}

const getThumb = (ytId: string, custom?: string | null) =>
  custom || `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;

const VideoPage = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await (supabase.from as any)("videos")
        .select("*")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("sort_order")
        .order("created_at", { ascending: false });
      setVideos(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const handlePlay = async (video: VideoItem) => {
    setPlayingId(video.id);
    // Increment view count
    await (supabase.from as any)("videos")
      .update({ view_count: video.view_count + 1 })
      .eq("id", video.id);
    setVideos(prev => prev.map(v => v.id === video.id ? { ...v, view_count: v.view_count + 1 } : v));
  };

  const filtered = videos.filter(v =>
    v.title.toLowerCase().includes(search.toLowerCase()) ||
    (v.description || "").toLowerCase().includes(search.toLowerCase())
  );

  const featured = filtered.filter(v => v.is_featured);
  const regular = filtered.filter(v => !v.is_featured);

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto pb-20">
      <PageHeader title="ভিডিও গ্যালারি" color="from-red-600 to-rose-600" />

      <div className="px-4 space-y-4 mt-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="ভিডিও খুঁজুন..."
            className="w-full bg-card rounded-2xl pl-10 pr-10 py-3 text-sm outline-none border border-border/60 focus:border-primary/50 transition-all"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card border border-border/60 rounded-2xl overflow-hidden animate-pulse">
                <div className="w-full aspect-video bg-muted" />
                <div className="p-3.5">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Play className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">কোন ভিডিও পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Featured Videos */}
            {featured.length > 0 && (
              <div className="space-y-3">
                {featured.map(v => (
                  <VideoCard key={v.id} video={v} playing={playingId === v.id} onPlay={() => handlePlay(v)} />
                ))}
              </div>
            )}

            {/* Regular Videos */}
            {regular.map(v => (
              <VideoCard key={v.id} video={v} playing={playingId === v.id} onPlay={() => handlePlay(v)} />
            ))}
          </div>
        )}

        <p className="text-center text-[10px] text-muted-foreground pt-2">
          মোট {filtered.length}টি ভিডিও
        </p>
      </div>

      <BottomNav />
    </div>
  );
};

const VideoCard = ({ video, playing, onPlay }: { video: VideoItem; playing: boolean; onPlay: () => void }) => {
  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 1) return "আজ";
    if (days < 7) return `${days} দিন আগে`;
    if (days < 30) return `${Math.floor(days / 7)} সপ্তাহ আগে`;
    return `${Math.floor(days / 30)} মাস আগে`;
  };

  return (
    <div className="bg-card border border-border/60 rounded-2xl overflow-hidden hover:shadow-md transition-all">
      {/* Video / Thumbnail */}
      <div className="relative aspect-video bg-muted">
        {playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${video.youtube_id}?autoplay=1&rel=0`}
            title={video.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button onClick={onPlay} className="w-full h-full relative group">
            <img
              src={getThumb(video.youtube_id, video.thumbnail_url)}
              alt={video.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-red-600 shadow-lg shadow-red-600/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 text-white fill-white ml-0.5" />
              </div>
            </div>
            {video.is_featured && (
              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-amber-500/90 text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-sm">
                <Star className="w-2.5 h-2.5 fill-white" /> ফিচার্ড
              </div>
            )}
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5">
        <h3 className="font-bold text-sm text-foreground leading-snug line-clamp-2">{video.title}</h3>
        {video.description && (
          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{video.description}</p>
        )}
        <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {video.view_count} ভিউ</span>
          <span>{timeAgo(video.created_at)}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
