import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Plus, Trash2, Save, Edit3, Eye, EyeOff, Search,
  RefreshCw, Video, Star, StarOff, Play, Image as ImageIcon, Upload
} from "lucide-react";
import SwipeUpEditor from "./SwipeUpEditor";

interface VideoItem {
  id: string;
  title: string;
  youtube_url: string;
  youtube_id: string;
  thumbnail_url: string | null;
  description: string | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  view_count: number;
  created_at: string;
}

const extractYoutubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
};

const getYoutubeThumbnail = (ytId: string) => `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;

const AdminVideoManager = ({ logActivity }: { logActivity: (action: string, tableName?: string, recordId?: string, details?: string) => Promise<void> }) => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const emptyForm = { title: "", youtube_url: "", description: "", thumbnail_url: "", sort_order: 0 };
  const [form, setForm] = useState(emptyForm);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const fetchVideos = async () => {
    setLoading(true);
    const { data, error } = await (supabase.from as any)("videos").select("*").order("sort_order").order("created_at", { ascending: false });
    if (error) toast({ title: "লোড ব্যর্থ", variant: "destructive" });
    else setVideos(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchVideos(); }, []);

  const openAdd = () => {
    setEditingVideo(null);
    setForm(emptyForm);
    setPreviewId(null);
    setShowForm(true);
  };

  const openEdit = (v: VideoItem) => {
    setEditingVideo(v);
    setForm({
      title: v.title,
      youtube_url: v.youtube_url,
      description: v.description || "",
      thumbnail_url: v.thumbnail_url || "",
      sort_order: v.sort_order,
    });
    setPreviewId(v.youtube_id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingVideo(null);
    setForm(emptyForm);
    setPreviewId(null);
  };

  const handleUrlChange = (url: string) => {
    setForm(p => ({ ...p, youtube_url: url }));
    const ytId = extractYoutubeId(url);
    setPreviewId(ytId);
  };

  const handleUploadThumb = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `video-thumbnails/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) {
      toast({ title: "আপলোড ব্যর্থ", variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
    setForm(p => ({ ...p, thumbnail_url: urlData.publicUrl }));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.youtube_url.trim()) {
      toast({ title: "টাইটেল ও YouTube URL দিতে হবে", variant: "destructive" });
      return;
    }
    const ytId = extractYoutubeId(form.youtube_url);
    if (!ytId) {
      toast({ title: "সঠিক YouTube URL দিন", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title,
      youtube_url: form.youtube_url,
      youtube_id: ytId,
      description: form.description || null,
      thumbnail_url: form.thumbnail_url || null,
      sort_order: form.sort_order,
    };

    if (editingVideo) {
      const { error } = await (supabase.from as any)("videos").update(payload).eq("id", editingVideo.id);
      if (error) toast({ title: "আপডেট ব্যর্থ", variant: "destructive" });
      else { toast({ title: "✅ আপডেট হয়েছে" }); logActivity("edited", "videos", editingVideo.id, form.title); }
    } else {
      const { error } = await (supabase.from as any)("videos").insert({ ...payload, is_active: true });
      if (error) toast({ title: "এড ব্যর্থ", variant: "destructive" });
      else { toast({ title: "✅ ভিডিও এড হয়েছে" }); logActivity("created", "videos", undefined, form.title); }
    }
    setSaving(false);
    closeForm();
    fetchVideos();
  };

  const deleteVideo = async (id: string, title: string) => {
    if (!confirm(`"${title}" মুছে ফেলতে চান?`)) return;
    const { error } = await (supabase.from as any)("videos").delete().eq("id", id);
    if (error) toast({ title: "মুছতে পারা যায়নি", variant: "destructive" });
    else { toast({ title: "🗑️ মুছে ফেলা হয়েছে" }); logActivity("deleted", "videos", id, title); fetchVideos(); }
  };

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await (supabase.from as any)("videos").update({ is_active: !current }).eq("id", id);
    if (!error) {
      setVideos(prev => prev.map(v => v.id === id ? { ...v, is_active: !current } : v));
      toast({ title: !current ? "✅ সক্রিয়" : "⏸ নিষ্ক্রিয়" });
    }
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    const { error } = await (supabase.from as any)("videos").update({ is_featured: !current }).eq("id", id);
    if (!error) {
      setVideos(prev => prev.map(v => v.id === id ? { ...v, is_featured: !current } : v));
      toast({ title: !current ? "⭐ ফিচার্ড" : "ফিচার্ড সরানো হয়েছে" });
    }
  };

  const filtered = videos.filter(v =>
    v.title.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = videos.filter(v => v.is_active).length;

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-card border border-border/60 rounded-2xl p-4 animate-pulse">
            <div className="w-full aspect-video rounded-xl bg-muted mb-3" />
            <div className="h-4 bg-muted rounded w-2/3 mb-2" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-card border border-border/60 rounded-2xl p-3.5 text-center">
          <p className="text-lg font-extrabold text-foreground">{videos.length}</p>
          <p className="text-[10px] text-muted-foreground font-medium">মোট ভিডিও</p>
        </div>
        <div className="bg-card border border-border/60 rounded-2xl p-3.5 text-center">
          <p className="text-lg font-extrabold text-emerald-500">{activeCount}</p>
          <p className="text-[10px] text-muted-foreground font-medium">সক্রিয়</p>
        </div>
        <div className="bg-card border border-border/60 rounded-2xl p-3.5 text-center">
          <p className="text-lg font-extrabold text-amber-500">{videos.filter(v => v.is_featured).length}</p>
          <p className="text-[10px] text-muted-foreground font-medium">ফিচার্ড</p>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="ভিডিও খুঁজুন..." className="w-full bg-card rounded-2xl pl-10 pr-4 py-3 text-sm outline-none border border-border/60 focus:border-primary/50 transition-all" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={fetchVideos} className="w-10 h-10 rounded-xl bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors shrink-0">
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
        <button onClick={openAdd} className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity shrink-0">
          <Plus className="w-4 h-4" /> যোগ
        </button>
      </div>

      {/* Video List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Video className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">কোন ভিডিও পাওয়া যায়নি</p>
          </div>
        ) : filtered.map(v => (
          <div key={v.id} className={`bg-card border rounded-2xl overflow-hidden transition-all hover:shadow-md ${v.is_active ? "border-border/60" : "border-border/30 opacity-60"}`}>
            {/* Thumbnail */}
            <div className="relative aspect-video bg-muted">
              <img
                src={v.thumbnail_url || getYoutubeThumbnail(v.youtube_id)}
                alt={v.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-red-600/90 flex items-center justify-center">
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                </div>
              </div>
              {v.is_featured && (
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 fill-white" /> ফিচার্ড
                </div>
              )}
              {!v.is_active && (
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-destructive/90 text-white text-[10px] font-bold">নিষ্ক্রিয়</div>
              )}
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] flex items-center gap-1">
                <Eye className="w-2.5 h-2.5" /> {v.view_count}
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <h3 className="font-bold text-sm text-foreground line-clamp-2">{v.title}</h3>
              {v.description && <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">{v.description}</p>}
              <p className="text-[10px] text-muted-foreground mt-1">{new Date(v.created_at).toLocaleDateString("bn-BD")}</p>

              {/* Actions */}
              <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-border/40">
                <button onClick={() => toggleActive(v.id, v.is_active)} className={`h-8 px-2.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors ${v.is_active ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15" : "bg-muted/60 text-muted-foreground hover:bg-muted"}`}>
                  {v.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {v.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                </button>
                <button onClick={() => toggleFeatured(v.id, v.is_featured)} className={`h-8 px-2.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors ${v.is_featured ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/15" : "bg-muted/60 text-muted-foreground hover:bg-muted"}`}>
                  {v.is_featured ? <Star className="w-3 h-3 fill-amber-500" /> : <StarOff className="w-3 h-3" />}
                </button>
                <button onClick={() => openEdit(v)} className="h-8 px-2.5 rounded-lg bg-primary/10 text-primary text-[11px] font-semibold flex items-center gap-1 hover:bg-primary/15 transition-colors">
                  <Edit3 className="w-3 h-3" /> এডিট
                </button>
                <button onClick={() => deleteVideo(v.id, v.title)} className="h-8 px-2.5 rounded-lg bg-destructive/10 text-destructive text-[11px] font-semibold flex items-center gap-1 hover:bg-destructive/15 transition-colors ml-auto">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form */}
      <SwipeUpEditor
        open={showForm}
        onClose={closeForm}
        title={editingVideo ? "ভিডিও এডিট করুন" : "নতুন ভিডিও যোগ করুন"}
        subtitle={editingVideo?.title}
        icon={editingVideo ? <Edit3 className="w-4 h-4 text-white" /> : <Plus className="w-4 h-4 text-white" />}
        headerGradient={editingVideo ? "from-blue-500 to-indigo-500" : "from-red-600 to-rose-600"}
      >
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">ভিডিও টাইটেল *</label>
          <input
            className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
            value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            placeholder="ভিডিওর শিরোনাম"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">YouTube URL *</label>
          <input
            className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
            value={form.youtube_url}
            onChange={e => handleUrlChange(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
          {previewId && (
            <div className="mt-2 rounded-xl overflow-hidden border border-border/40">
              <img src={getYoutubeThumbnail(previewId)} alt="Preview" className="w-full aspect-video object-cover" />
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">বিবরণ</label>
          <textarea
            className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all resize-none min-h-[80px]"
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            placeholder="ভিডিওর সংক্ষিপ্ত বিবরণ"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
            <ImageIcon className="w-3 h-3" /> কাস্টম থাম্বনেইল (ঐচ্ছিক)
          </label>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-xs text-primary font-semibold cursor-pointer bg-primary/10 px-4 py-2.5 rounded-xl hover:bg-primary/15 transition-colors">
              <Upload className="w-4 h-4" /> {uploading ? "আপলোড হচ্ছে..." : "আপলোড"}
              <input type="file" accept="image/*" className="hidden" onChange={handleUploadThumb} disabled={uploading} />
            </label>
            <span className="text-[10px] text-muted-foreground">অথবা URL দিন</span>
          </div>
          <input
            className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all mt-2"
            value={form.thumbnail_url}
            onChange={e => setForm(p => ({ ...p, thumbnail_url: e.target.value }))}
            placeholder="https://example.com/thumb.jpg"
          />
          {form.thumbnail_url && (
            <div className="mt-2 rounded-xl overflow-hidden border border-border/40">
              <img src={form.thumbnail_url} alt="Custom Thumb" className="w-full aspect-video object-cover" />
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">ক্রম (Sort Order)</label>
          <input
            type="number"
            className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
            value={form.sort_order}
            onChange={e => setForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? "সেভ হচ্ছে..." : editingVideo ? "আপডেট করুন" : "ভিডিও এড করুন"}
        </button>
      </SwipeUpEditor>
    </div>
  );
};

export default AdminVideoManager;
