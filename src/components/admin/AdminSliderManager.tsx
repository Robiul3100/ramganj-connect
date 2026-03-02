import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { SlidersHorizontal, Save, Edit3, Trash2, Hash, Image as ImageIcon, Plus, Eye, EyeOff } from "lucide-react";

interface Props {
  logActivity: (action: string, tableName?: string, recordId?: string, details?: string) => Promise<void>;
}

const AdminSliderManager = ({ logActivity }: Props) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", image_url: "", sort_order: 0 });
  const [editId, setEditId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data } = await (supabase.from as any)("slider_items").select("*").order("sort_order");
    setItems(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `slider/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("slider-images").upload(path, file);
    if (error) { toast({ title: "আপলোড ব্যর্থ", variant: "destructive" }); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("slider-images").getPublicUrl(path);
    setForm({ ...form, image_url: urlData.publicUrl });
    setUploading(false);
  };

  const save = async () => {
    if (!form.title.trim() || !form.image_url.trim()) { toast({ title: "শিরোনাম ও ছবি দিন", variant: "destructive" }); return; }
    if (editId) {
      await (supabase.from as any)("slider_items").update({ title: form.title, image_url: form.image_url, sort_order: form.sort_order }).eq("id", editId);
      await logActivity("edited", "slider_items", editId, form.title);
      toast({ title: "স্লাইডার আপডেট হয়েছে ✅" });
    } else {
      await (supabase.from as any)("slider_items").insert({ title: form.title, image_url: form.image_url, sort_order: form.sort_order });
      await logActivity("created", "slider_items", undefined, form.title);
      toast({ title: "নতুন স্লাইড যোগ হয়েছে ✅" });
    }
    setForm({ title: "", image_url: "", sort_order: 0 });
    setEditId(null);
    setShowForm(false);
    fetchItems();
  };

  const deleteItem = async (id: string, title: string) => {
    if (!confirm("এই স্লাইড মুছে ফেলতে চান?")) return;
    await (supabase.from as any)("slider_items").delete().eq("id", id);
    await logActivity("deleted", "slider_items", id, title);
    toast({ title: "মুছে ফেলা হয়েছে" });
    setItems(items.filter(s => s.id !== id));
  };

  const toggleActive = async (id: string, current: boolean) => {
    await (supabase.from as any)("slider_items").update({ is_active: !current }).eq("id", id);
    setItems(items.map(s => s.id === id ? { ...s, is_active: !current } : s));
    toast({ title: !current ? "সক্রিয় করা হয়েছে" : "নিষ্ক্রিয় করা হয়েছে" });
  };

  return (
    <div className="space-y-4">
      {showForm || editId ? (
        <div className="bg-card border-2 border-primary/20 rounded-2xl p-5 space-y-4 shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center shadow-sm">
              <SlidersHorizontal className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-sm font-bold text-foreground">{editId ? "স্লাইড এডিট" : "নতুন স্লাইড"}</h2>
          </div>
          <input className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50 transition-all" placeholder="স্লাইড শিরোনাম" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input type="number" className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50 transition-all" placeholder="ক্রম" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
          <div>
            <input className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50 transition-all" placeholder="ছবির লিংক (URL)" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
            <div className="flex items-center gap-3 mt-2">
              <label className="inline-flex items-center gap-2 text-xs text-primary font-semibold cursor-pointer bg-primary/10 px-4 py-2.5 rounded-xl hover:bg-primary/15 transition-colors">
                <ImageIcon className="w-4 h-4" /> {uploading ? "আপলোড হচ্ছে..." : "ছবি আপলোড"}
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
              </label>
              {form.image_url && <img src={form.image_url} alt="preview" className="w-20 h-12 rounded-xl object-cover border border-border" />}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-sm">
              <Save className="w-4 h-4" /> {editId ? "আপডেট" : "যোগ করুন"}
            </button>
            <button onClick={() => { setEditId(null); setShowForm(false); setForm({ title: "", image_url: "", sort_order: 0 }); }} className="px-5 py-3 rounded-xl bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors">
              বাতিল
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="w-full py-3.5 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 text-primary text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/10 transition-all">
          <Plus className="w-4 h-4" /> নতুন স্লাইড যোগ করুন
        </button>
      )}

      <span className="text-xs text-muted-foreground flex items-center gap-1"><Hash className="w-3 h-3" /> {items.length}টি স্লাইড</span>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-card border border-border/60 rounded-2xl p-4 animate-pulse"><div className="h-4 bg-muted rounded w-2/3 mb-2" /><div className="h-3 bg-muted rounded w-1/3" /></div>)}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">কোন স্লাইড নেই</div>
      ) : items.map(item => (
        <div key={item.id} className="bg-card border border-border/60 rounded-2xl p-4 flex gap-3 hover:shadow-md transition-all duration-200">
          <div className="w-24 h-16 rounded-xl bg-muted overflow-hidden shrink-0">
            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-sm line-clamp-1">{item.title}</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">ক্রম: {item.sort_order}</p>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              <button onClick={() => { setEditId(item.id); setForm({ title: item.title, image_url: item.image_url, sort_order: item.sort_order }); setShowForm(true); }}
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

export default AdminSliderManager;
