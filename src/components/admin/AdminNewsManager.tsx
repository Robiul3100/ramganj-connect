import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Newspaper, Save, Edit3, Trash2, CalendarDays, Hash, Image as ImageIcon, Plus, Eye, EyeOff } from "lucide-react";

interface AdminNewsManagerProps {
  logActivity: (action: string, tableName?: string, recordId?: string, details?: string) => Promise<void>;
}

const AdminNewsManager = ({ logActivity }: AdminNewsManagerProps) => {
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsForm, setNewsForm] = useState({ title: "", body: "", thumbnail_url: "", published_at: "" });
  const [newsEditId, setNewsEditId] = useState<string | null>(null);
  const [newsUploading, setNewsUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("news").select("*").order("published_at", { ascending: false });
    setNewsItems(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewsUploading(true);
    const ext = file.name.split(".").pop();
    const path = `news/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) { toast({ title: "আপলোড ব্যর্থ", variant: "destructive" }); setNewsUploading(false); return; }
    const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
    setNewsForm({ ...newsForm, thumbnail_url: urlData.publicUrl });
    setNewsUploading(false);
  };

  const saveNews = async () => {
    if (!newsForm.title.trim()) { toast({ title: "শিরোনাম দিন", variant: "destructive" }); return; }
    const publishedAt = newsForm.published_at ? new Date(newsForm.published_at).toISOString() : new Date().toISOString();
    if (newsEditId) {
      await supabase.from("news").update({ title: newsForm.title, body: newsForm.body, thumbnail_url: newsForm.thumbnail_url || null, published_at: publishedAt }).eq("id", newsEditId);
      await logActivity("edited", "news", newsEditId, newsForm.title);
      toast({ title: "নিউজ আপডেট হয়েছে ✅" });
    } else {
      await supabase.from("news").insert({ title: newsForm.title, body: newsForm.body, thumbnail_url: newsForm.thumbnail_url || null, published_at: publishedAt });
      await logActivity("created", "news", undefined, newsForm.title);
      toast({ title: "নিউজ প্রকাশিত হয়েছে ✅" });
    }
    setNewsForm({ title: "", body: "", thumbnail_url: "", published_at: "" });
    setNewsEditId(null);
    setShowForm(false);
    fetchNews();
  };

  const deleteNews = async (id: string, title: string) => {
    if (!confirm("মুছে ফেলতে চান?")) return;
    await supabase.from("news").delete().eq("id", id);
    await logActivity("deleted", "news", id, title);
    toast({ title: "মুছে ফেলা হয়েছে" });
    setNewsItems(newsItems.filter(n => n.id !== id));
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("news").update({ is_active: !current }).eq("id", id);
    setNewsItems(newsItems.map(n => n.id === id ? { ...n, is_active: !current } : n));
    toast({ title: !current ? "সক্রিয় করা হয়েছে" : "নিষ্ক্রিয় করা হয়েছে" });
  };

  return (
    <div className="space-y-4">
      {/* Add/Edit Form */}
      {showForm || newsEditId ? (
        <div className="bg-card border-2 border-primary/20 rounded-2xl p-5 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm">
                <Newspaper className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-sm font-bold text-foreground">{newsEditId ? "নিউজ এডিট" : "নতুন নিউজ"}</h2>
            </div>
          </div>
          <input className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all" placeholder="নিউজ শিরোনাম" value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} />
          <textarea className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none min-h-[180px] focus:border-primary/50 focus:ring-2 focus:ring-primary/10 font-mono transition-all resize-none" placeholder="বিস্তারিত নিউজ (HTML সাপোর্টেড)..." value={newsForm.body} onChange={(e) => setNewsForm({ ...newsForm, body: e.target.value })} />
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">প্রকাশের তারিখ</label>
            <input type="datetime-local" className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50 transition-all" value={newsForm.published_at} onChange={(e) => setNewsForm({ ...newsForm, published_at: e.target.value })} />
          </div>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-xs text-primary font-semibold cursor-pointer bg-primary/10 px-4 py-2.5 rounded-xl hover:bg-primary/15 transition-colors">
              <ImageIcon className="w-4 h-4" /> {newsUploading ? "আপলোড হচ্ছে..." : "থাম্বনেইল"}
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={newsUploading} />
            </label>
            {newsForm.thumbnail_url && <img src={newsForm.thumbnail_url} alt="thumb" className="w-14 h-14 rounded-xl object-cover border border-border" />}
          </div>
          <div className="flex gap-2">
            <button onClick={saveNews} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-sm">
              <Save className="w-4 h-4" /> {newsEditId ? "আপডেট" : "প্রকাশ করুন"}
            </button>
            <button onClick={() => { setNewsEditId(null); setShowForm(false); setNewsForm({ title: "", body: "", thumbnail_url: "", published_at: "" }); }} className="px-5 py-3 rounded-xl bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors">
              বাতিল
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="w-full py-3.5 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 text-primary text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/10 transition-all">
          <Plus className="w-4 h-4" /> নতুন নিউজ যোগ করুন
        </button>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground flex items-center gap-1"><Hash className="w-3 h-3" /> {newsItems.length}টি নিউজ</span>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-card border border-border/60 rounded-2xl p-4 animate-pulse"><div className="h-4 bg-muted rounded w-2/3 mb-2" /><div className="h-3 bg-muted rounded w-1/3" /></div>)}</div>
      ) : newsItems.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">কোন নিউজ নেই</div>
      ) : newsItems.map(item => (
        <div key={item.id} className="bg-card border border-border/60 rounded-2xl p-4 flex gap-3 hover:shadow-md transition-all duration-200">
          <div className="w-20 h-14 rounded-xl bg-muted overflow-hidden shrink-0">
            {item.thumbnail_url ? (
              <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><Newspaper className="w-5 h-5 text-muted-foreground/30" /></div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-sm line-clamp-1">{item.title}</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              {new Date(item.published_at).toLocaleDateString("bn-BD")}
              <span className="mx-1">•</span>
              <Eye className="w-3 h-3" /> {item.view_count || 0}
            </p>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              <button onClick={() => { setNewsEditId(item.id); setNewsForm({ title: item.title, body: item.body || "", thumbnail_url: item.thumbnail_url || "", published_at: item.published_at ? new Date(item.published_at).toISOString().slice(0, 16) : "" }); setShowForm(true); }}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-500/15 transition-colors flex items-center gap-1">
                <Edit3 className="w-3 h-3" /> এডিট
              </button>
              <button onClick={() => toggleActive(item.id, item.is_active)}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1 ${item.is_active ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                {item.is_active ? <><Eye className="w-3 h-3" /> সক্রিয়</> : <><EyeOff className="w-3 h-3" /> নিষ্ক্রিয়</>}
              </button>
              <button onClick={() => deleteNews(item.id, item.title)}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 font-semibold hover:bg-red-500/15 transition-colors flex items-center gap-1">
                <Trash2 className="w-3 h-3" /> মুছুন
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminNewsManager;
