import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import SwipeUpEditor from "./SwipeUpEditor";
import { Search, Plus, Trash2, Edit, Eye, EyeOff, AlertCircle, HandHeart, Upload, Gift } from "lucide-react";

interface LostFoundItem {
  id: string;
  type: string;
  item_name: string;
  description: string | null;
  location: string | null;
  phone: string | null;
  item_date: string | null;
  is_approved: boolean;
  created_at: string;
  image_url: string | null;
  person_name: string | null;
  person_image_url: string | null;
  reward: string | null;
  detail_description: string | null;
}

interface Props {
  logActivity: (action: string, tableName?: string, recordId?: string, details?: string) => Promise<void>;
}

const emptyForm = {
  type: "lost",
  item_name: "",
  description: "",
  location: "",
  phone: "",
  item_date: "",
  image_url: "",
  person_name: "",
  person_image_url: "",
  reward: "",
  detail_description: "",
};

const AdminLostFoundManager = ({ logActivity }: Props) => {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("lost_found").select("*").order("created_at", { ascending: false });
    setItems((data as any[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "image_url" | "person_image_url") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `lost-found/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) { toast({ title: "আপলোড ব্যর্থ", variant: "destructive" }); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
    setForm(prev => ({ ...prev, [field]: urlData.publicUrl }));
    setUploading(false);
  };

  const save = async () => {
    if (!form.item_name) { toast({ title: "পণ্যের নাম দিন", variant: "destructive" }); return; }
    const payload: any = {
      type: form.type,
      item_name: form.item_name,
      description: form.description || null,
      location: form.location || null,
      phone: form.phone || null,
      item_date: form.item_date || null,
      image_url: form.image_url || null,
      person_name: form.person_name || null,
      person_image_url: form.person_image_url || null,
      reward: form.reward || null,
      detail_description: form.detail_description || null,
    };

    if (editId) {
      await supabase.from("lost_found").update(payload).eq("id", editId);
      await logActivity("edited", "lost_found", editId, form.item_name);
    } else {
      payload.is_approved = true;
      await supabase.from("lost_found").insert(payload);
      await logActivity("created", "lost_found", undefined, form.item_name);
    }
    toast({ title: editId ? "আপডেট হয়েছে" : "যোগ করা হয়েছে" });
    closeForm();
    fetchItems();
  };

  const closeForm = () => { setShowForm(false); setEditId(null); setForm(emptyForm); };

  const openEdit = (item: LostFoundItem) => {
    setEditId(item.id);
    setForm({
      type: item.type,
      item_name: item.item_name,
      description: item.description || "",
      location: item.location || "",
      phone: item.phone || "",
      item_date: item.item_date || "",
      image_url: item.image_url || "",
      person_name: item.person_name || "",
      person_image_url: item.person_image_url || "",
      reward: item.reward || "",
      detail_description: item.detail_description || "",
    });
    setShowForm(true);
  };

  const toggleApproval = async (id: string, current: boolean) => {
    await supabase.from("lost_found").update({ is_approved: !current } as any).eq("id", id);
    await logActivity(current ? "unapproved" : "approved", "lost_found", id);
    toast({ title: current ? "অননুমোদিত" : "অনুমোদিত" });
    fetchItems();
  };

  const deleteItem = async (id: string, name: string) => {
    if (!confirm(`"${name}" মুছে ফেলবেন?`)) return;
    await supabase.from("lost_found").delete().eq("id", id);
    await logActivity("deleted", "lost_found", id, name);
    toast({ title: "মুছে ফেলা হয়েছে" });
    fetchItems();
  };

  const filtered = items.filter(i => i.item_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <SwipeUpEditor
        open={showForm}
        onClose={closeForm}
        title={editId ? "এডিট করুন" : "নতুন যোগ করুন"}
        subtitle="হারানো/পাওয়া পণ্যের তথ্য"
        headerGradient="from-orange-500 to-red-500"
      >
        <div className="space-y-4 p-4">
          {/* Type */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">ধরন</label>
            <div className="flex gap-2">
              <button onClick={() => setForm(p => ({ ...p, type: "lost" }))} className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${form.type === "lost" ? "border-destructive bg-destructive/10 text-destructive" : "border-border text-muted-foreground"}`}>
                <AlertCircle className="w-5 h-5 mx-auto mb-1" /> হারিয়েছি
              </button>
              <button onClick={() => setForm(p => ({ ...p, type: "found" }))} className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${form.type === "found" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
                <HandHeart className="w-5 h-5 mx-auto mb-1" /> পেয়েছি
              </button>
            </div>
          </div>

          {/* Item name */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">পণ্যের নাম *</label>
            <input className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none" value={form.item_name} onChange={e => setForm(p => ({ ...p, item_name: e.target.value }))} placeholder="যেমন: মানিব্যাগ" />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">সংক্ষিপ্ত বিবরণ</label>
            <textarea className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none min-h-[60px]" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="রঙ, সাইজ..." />
          </div>

          {/* Location + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">স্থান</label>
              <input className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="কোথায়?" />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">তারিখ</label>
              <input type="date" className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none" value={form.item_date} onChange={e => setForm(p => ({ ...p, item_date: e.target.value }))} />
            </div>
          </div>

          {/* Phone + Person Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">ফোন</label>
              <input className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="017..." />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">ব্যক্তির নাম</label>
              <input className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none" value={form.person_name} onChange={e => setForm(p => ({ ...p, person_name: e.target.value }))} />
            </div>
          </div>

          {/* Item Image Upload */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">পণ্যের ছবি</label>
            <div className="flex gap-3 items-center">
              <input className="flex-1 bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none" value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} placeholder="URL বা আপলোড করুন" />
              <label className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center cursor-pointer shrink-0">
                <Upload className="w-4 h-4 text-primary" />
                <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e, "image_url")} />
              </label>
            </div>
            {form.image_url && <img src={form.image_url} alt="" className="w-full h-32 object-cover rounded-xl mt-2" />}
          </div>

          {/* Person Image Upload */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">ব্যক্তির ছবি</label>
            <div className="flex gap-3 items-center">
              <input className="flex-1 bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none" value={form.person_image_url} onChange={e => setForm(p => ({ ...p, person_image_url: e.target.value }))} placeholder="URL বা আপলোড করুন" />
              <label className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center cursor-pointer shrink-0">
                <Upload className="w-4 h-4 text-primary" />
                <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e, "person_image_url")} />
              </label>
            </div>
            {form.person_image_url && <img src={form.person_image_url} alt="" className="w-16 h-16 object-cover rounded-full mt-2" />}
          </div>

          {/* Reward */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block flex items-center gap-1"><Gift className="w-4 h-4 text-amber-500" /> পুরষ্কার ঘোষণা</label>
            <input className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none" value={form.reward} onChange={e => setForm(p => ({ ...p, reward: e.target.value }))} placeholder="ফেরত দিলে পুরষ্কার..." />
          </div>

          {/* Detail Description */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">বিস্তারিত বিবরণ</label>
            <textarea className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none min-h-[80px]" value={form.detail_description} onChange={e => setForm(p => ({ ...p, detail_description: e.target.value }))} placeholder="বিস্তারিত তথ্য..." />
          </div>

          <button onClick={save} disabled={uploading} className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm disabled:opacity-50">
            {uploading ? "আপলোড হচ্ছে..." : editId ? "আপডেট করুন" : "যোগ করুন"}
          </button>
        </div>
      </SwipeUpEditor>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">হারানো ও পাওয়া</h2>
        <button onClick={() => setShowForm(true)} className="w-9 h-9 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input className="w-full bg-muted/50 rounded-xl pl-10 pr-4 py-2.5 text-sm border border-border outline-none" value={search} onChange={e => setSearch(e.target.value)} placeholder="খুঁজুন..." />
      </div>

      {/* Stats */}
      <div className="flex gap-2 text-xs">
        <span className="bg-muted px-3 py-1 rounded-full">মোট: {items.length}</span>
        <span className="bg-destructive/10 text-destructive px-3 py-1 rounded-full">অপেক্ষমান: {items.filter(i => !i.is_approved).length}</span>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl skeleton-shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-10 text-sm">কোনো তথ্য নেই</p>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item) => (
            <div key={item.id} className={`bg-card rounded-xl border p-3 flex items-start gap-3 ${!item.is_approved ? "border-amber-400/50 bg-amber-50/30 dark:bg-amber-950/10" : "border-border"}`}>
              {item.image_url ? (
                <img src={item.image_url} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
              ) : (
                <div className={`w-14 h-14 rounded-lg flex items-center justify-center shrink-0 ${item.type === "lost" ? "bg-destructive/10" : "bg-primary/10"}`}>
                  {item.type === "lost" ? <AlertCircle className="w-6 h-6 text-destructive" /> : <HandHeart className="w-6 h-6 text-primary" />}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.type === "lost" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                    {item.type === "lost" ? "হারানো" : "পাওয়া"}
                  </span>
                  {!item.is_approved && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">অপেক্ষমান</span>}
                </div>
                <h4 className="text-sm font-bold text-foreground mt-0.5 truncate">{item.item_name}</h4>
                <p className="text-[11px] text-muted-foreground truncate">{item.location || "অজানা স্থান"} • {item.person_name || "অজানা"}</p>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button onClick={() => openEdit(item)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"><Edit className="w-3.5 h-3.5" /></button>
                <button onClick={() => toggleApproval(item.id, item.is_approved)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  {item.is_approved ? <Eye className="w-3.5 h-3.5 text-primary" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
                <button onClick={() => deleteItem(item.id, item.item_name)} className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminLostFoundManager;
