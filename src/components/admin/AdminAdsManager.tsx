import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Save, Edit3, Trash2, Hash, Image as ImageIcon, Plus, Eye, EyeOff } from "lucide-react";
import SwipeUpEditor from "./SwipeUpEditor";

const PAGE_OPTIONS = [
  { value: "news", label: "খবর ও সংবাদ" },
  { value: "news-detail", label: "সংবাদ বিস্তারিত" },
  { value: "blood-bank", label: "ব্লাড ব্যাংক" },
  { value: "emergency", label: "জরুরি কল" },
  { value: "offices", label: "অফিস" },
  { value: "donation", label: "অনুদান" },
  { value: "tuition", label: "টিউশন মিডিয়া" },
  { value: "doctors", label: "ডাক্তার" },
  { value: "education", label: "শিক্ষা প্রতিষ্ঠান" },
  { value: "shops", label: "দোকান" },
  { value: "jobs", label: "চাকরি" },
  { value: "marketplace", label: "মার্কেটপ্লেস" },
  { value: "services", label: "সেবা গ্রিড" },
];

interface Props {
  logActivity: (action: string, tableName?: string, recordId?: string, details?: string) => Promise<void>;
}

const AdminAdsManager = ({ logActivity }: Props) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "", image_url: "", link_url: "", sort_order: 0, expire_at: "", target_pages: [] as string[] });
  const [editId, setEditId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data } = await (supabase.from as any)("advertisements").select("*").order("sort_order");
    setItems(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `ads/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) { toast({ title: "আপলোড ব্যর্থ", variant: "destructive" }); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
    setForm({ ...form, image_url: urlData.publicUrl });
    setUploading(false);
  };

  const save = async () => {
    if (!form.title.trim()) { toast({ title: "শিরোনাম দিন", variant: "destructive" }); return; }
    const expireVal = form.expire_at ? new Date(form.expire_at).toISOString() : null;
    if (editId) {
      await (supabase.from as any)("advertisements").update({ title: form.title, description: form.description || null, image_url: form.image_url || null, link_url: form.link_url || null, sort_order: form.sort_order, expire_at: expireVal, target_pages: form.target_pages }).eq("id", editId);
      await logActivity("edited", "advertisements", editId, form.title);
      toast({ title: "বিজ্ঞাপন আপডেট হয়েছে ✅" });
    } else {
      await (supabase.from as any)("advertisements").insert({ title: form.title, description: form.description || null, image_url: form.image_url || null, link_url: form.link_url || null, sort_order: form.sort_order, expire_at: expireVal, target_pages: form.target_pages });
      await logActivity("created", "advertisements", undefined, form.title);
      toast({ title: "বিজ্ঞাপন যোগ হয়েছে ✅" });
    }
    closeForm();
    fetchItems();
  };

  const closeForm = () => {
    setForm({ title: "", description: "", image_url: "", link_url: "", sort_order: 0, expire_at: "", target_pages: [] });
    setEditId(null);
    setShowForm(false);
  };

  const deleteItem = async (id: string, title: string) => {
    if (!confirm("এই বিজ্ঞাপন মুছে ফেলতে চান?")) return;
    await (supabase.from as any)("advertisements").delete().eq("id", id);
    await logActivity("deleted", "advertisements", id, title);
    toast({ title: "মুছে ফেলা হয়েছে" });
    setItems(items.filter(a => a.id !== id));
  };

  const toggleActive = async (id: string, current: boolean) => {
    await (supabase.from as any)("advertisements").update({ is_active: !current }).eq("id", id);
    setItems(items.map(a => a.id === id ? { ...a, is_active: !current } : a));
    toast({ title: !current ? "সক্রিয় করা হয়েছে" : "নিষ্ক্রিয় করা হয়েছে" });
  };

  const togglePage = (val: string) => {
    const pages = form.target_pages.includes(val) ? form.target_pages.filter(p => p !== val) : [...form.target_pages, val];
    setForm({ ...form, target_pages: pages });
  };

  return (
    <div className="space-y-4">
      <SwipeUpEditor
        open={showForm}
        onClose={closeForm}
        title={editId ? "বিজ্ঞাপন এডিট" : "নতুন বিজ্ঞাপন"}
        subtitle="বিজ্ঞাপন তৈরি বা সম্পাদনা করুন"
        icon={<ImageIcon className="w-4 h-4 text-white" />}
        headerGradient="from-yellow-500 to-orange-500"
      >
        <input className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50 transition-all" placeholder="বিজ্ঞাপনের শিরোনাম" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50 transition-all" placeholder="বিবরণ (ঐচ্ছিক)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50 transition-all" placeholder="লিংক URL (ঐচ্ছিক)" value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">ক্রম</label>
            <input type="number" className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50 transition-all" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">মেয়াদ শেষ</label>
            <input type="datetime-local" className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50 transition-all" value={form.expire_at} onChange={(e) => setForm({ ...form, expire_at: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">ছবি</label>
          <input className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50 transition-all" placeholder="ছবির লিংক (URL)" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          <div className="flex items-center gap-3 mt-2">
            <label className="inline-flex items-center gap-2 text-xs text-primary font-semibold cursor-pointer bg-primary/10 px-4 py-2.5 rounded-xl hover:bg-primary/15 transition-colors">
              <ImageIcon className="w-4 h-4" /> {uploading ? "আপলোড হচ্ছে..." : "ছবি আপলোড"}
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
            {form.image_url && <img src={form.image_url} alt="preview" className="w-20 h-14 rounded-xl object-cover border border-border" />}
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">কোন পেজে দেখাবে (খালি রাখলে সব পেজে)</label>
          <div className="flex flex-wrap gap-2">
            {PAGE_OPTIONS.map(page => (
              <button key={page.value} type="button" onClick={() => togglePage(page.value)}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-colors ${form.target_pages.includes(page.value) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                {page.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button onClick={save} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-sm">
            <Save className="w-4 h-4" /> {editId ? "আপডেট" : "যোগ করুন"}
          </button>
          <button onClick={closeForm} className="px-5 py-3 rounded-xl bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors">
            বাতিল
          </button>
        </div>
      </SwipeUpEditor>

      <button onClick={() => setShowForm(true)} className="w-full py-3.5 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 text-primary text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/10 transition-all">
        <Plus className="w-4 h-4" /> নতুন বিজ্ঞাপন যোগ করুন
      </button>

      <span className="text-xs text-muted-foreground flex items-center gap-1"><Hash className="w-3 h-3" /> {items.length}টি বিজ্ঞাপন</span>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-card border border-border/60 rounded-2xl p-4 animate-pulse"><div className="h-4 bg-muted rounded w-2/3 mb-2" /><div className="h-3 bg-muted rounded w-1/3" /></div>)}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">কোন বিজ্ঞাপন নেই</div>
      ) : items.map(item => (
        <div key={item.id} className="bg-card border border-border/60 rounded-2xl p-4 flex gap-3 hover:shadow-md transition-all duration-200">
          {item.image_url ? (
            <div className="w-24 h-16 rounded-xl bg-muted overflow-hidden shrink-0">
              <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <ImageIcon className="w-6 h-6 text-primary/40" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-sm line-clamp-1">{item.title}</h3>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap text-[10px] text-muted-foreground">
              <span>ক্রম: {item.sort_order}</span>
              <span>• 👆 {item.click_count ?? 0} ক্লিক</span>
              {item.expire_at && (
                <span className={new Date(item.expire_at) < new Date() ? "text-red-500 font-semibold" : ""}>
                  • ⏰ {new Date(item.expire_at) < new Date() ? "মেয়াদ শেষ" : new Date(item.expire_at).toLocaleDateString("bn-BD")}
                </span>
              )}
            </div>
            {item.target_pages?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {item.target_pages.map((p: string) => (
                  <span key={p} className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">{p}</span>
                ))}
              </div>
            )}
            <div className="flex gap-1.5 mt-2 flex-wrap">
              <button onClick={() => { setEditId(item.id); setForm({ title: item.title, description: item.description || "", image_url: item.image_url || "", link_url: item.link_url || "", sort_order: item.sort_order, expire_at: item.expire_at ? new Date(item.expire_at).toISOString().slice(0, 16) : "", target_pages: item.target_pages || [] }); setShowForm(true); }}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-500/15 transition-colors flex items-center gap-1">
                <Edit3 className="w-3 h-3" /> এডিট
              </button>
              <button onClick={() => toggleActive(item.id, item.is_active)}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1 ${item.is_active ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                {item.is_active ? <><Eye className="w-3 h-3" /> সক্রিয়</> : <><EyeOff className="w-3 h-3" /> নিষ্ক্রিয়</>}
              </button>
              <button onClick={() => deleteItem(item.id, item.title)}
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

export default AdminAdsManager;
