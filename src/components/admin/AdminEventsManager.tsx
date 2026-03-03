import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import SwipeUpEditor from "./SwipeUpEditor";
import {
  CalendarHeart, Plus, Edit3, Trash2, Search, Eye, EyeOff,
  MapPin, Clock, Users as UsersIcon, Link2, Image as ImageIcon,
  RefreshCw, Save, X, CheckCircle, Hash
} from "lucide-react";

interface EventItem {
  id: string;
  title: string;
  tagline: string | null;
  category: string;
  status: string;
  description: string | null;
  full_description: string | null;
  event_date: string | null;
  event_time: string | null;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  map_link: string | null;
  image_url: string | null;
  organizer_name: string | null;
  organizer_image_url: string | null;
  organizer_location: string | null;
  is_verified: boolean | null;
  is_free: boolean | null;
  price: string | null;
  capacity: string | null;
  registration_open: boolean | null;
  registration_link: string | null;
  phone: string | null;
  is_approved: boolean;
  created_at: string;
}

interface Props {
  logActivity: (action: string, tableName?: string, recordId?: string, details?: string) => Promise<void>;
}

const CATEGORIES = ["সেমিনার", "সাংস্কৃতিক", "ক্রীড়া", "ধর্মীয়", "কর্মশালা", "প্রতিযোগিতা", "সামাজিক", "অন্যান্য"];
const STATUS_OPTIONS = ["upcoming", "ongoing", "completed"];

const emptyForm = {
  title: "", tagline: "", category: "সামাজিক", status: "upcoming",
  description: "", full_description: "", event_date: "", event_time: "",
  start_date: "", end_date: "", location: "", map_link: "",
  image_url: "", organizer_name: "", organizer_image_url: "",
  organizer_location: "", is_verified: false, is_free: true,
  price: "", capacity: "", registration_open: false,
  registration_link: "", phone: "",
};

const AdminEventsManager = ({ logActivity }: Props) => {
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("events").select("*").order("created_at", { ascending: false });
    setItems((data as EventItem[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "image_url" | "organizer_image_url") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `events/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) { toast({ title: "আপলোড ব্যর্থ", variant: "destructive" }); setUploading(false); return; }
    const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
    setForm({ ...form, [field]: pub.publicUrl });
    setUploading(false);
  };

  const save = async () => {
    if (!form.title.trim()) { toast({ title: "শিরোনাম দিন", variant: "destructive" }); return; }
    const payload: any = {
      title: form.title, tagline: form.tagline || null, category: form.category,
      status: form.status, description: form.description || null,
      full_description: form.full_description || null,
      event_date: form.event_date || null, event_time: form.event_time || null,
      start_date: form.start_date || null, end_date: form.end_date || null,
      location: form.location || null, map_link: form.map_link || null,
      image_url: form.image_url || null, organizer_name: form.organizer_name || null,
      organizer_image_url: form.organizer_image_url || null,
      organizer_location: form.organizer_location || null,
      is_verified: form.is_verified, is_free: form.is_free,
      price: form.price || null, capacity: form.capacity || null,
      registration_open: form.registration_open,
      registration_link: form.registration_link || null,
      phone: form.phone || null,
    };

    if (editId) {
      const { error } = await supabase.from("events").update(payload).eq("id", editId);
      if (error) { toast({ title: "আপডেট ব্যর্থ", variant: "destructive" }); return; }
      await logActivity("edited", "events", editId, form.title);
      toast({ title: "✅ ইভেন্ট আপডেট হয়েছে" });
    } else {
      payload.is_approved = true;
      const { error } = await supabase.from("events").insert(payload);
      if (error) { toast({ title: "যোগ করা ব্যর্থ", variant: "destructive" }); return; }
      await logActivity("created", "events", undefined, form.title);
      toast({ title: "✅ নতুন ইভেন্ট যোগ হয়েছে" });
    }
    closeForm();
    fetchItems();
  };

  const openEdit = (item: EventItem) => {
    setForm({
      title: item.title, tagline: item.tagline || "", category: item.category,
      status: item.status, description: item.description || "",
      full_description: item.full_description || "",
      event_date: item.event_date || "", event_time: item.event_time || "",
      start_date: item.start_date ? item.start_date.slice(0, 16) : "",
      end_date: item.end_date ? item.end_date.slice(0, 16) : "",
      location: item.location || "", map_link: item.map_link || "",
      image_url: item.image_url || "", organizer_name: item.organizer_name || "",
      organizer_image_url: item.organizer_image_url || "",
      organizer_location: item.organizer_location || "",
      is_verified: item.is_verified || false, is_free: item.is_free ?? true,
      price: item.price || "", capacity: item.capacity || "",
      registration_open: item.registration_open || false,
      registration_link: item.registration_link || "", phone: item.phone || "",
    });
    setEditId(item.id);
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setForm(emptyForm); setEditId(null); };

  const toggleApproval = async (id: string, current: boolean) => {
    await supabase.from("events").update({ is_approved: !current }).eq("id", id);
    toast({ title: !current ? "✅ অনুমোদিত" : "⏸ অননুমোদিত" });
    fetchItems();
  };

  const deleteItem = async (id: string, title: string) => {
    if (!confirm(`"${title}" মুছে ফেলবেন?`)) return;
    await supabase.from("events").delete().eq("id", id);
    await logActivity("deleted", "events", id, title);
    toast({ title: "🗑️ মুছে ফেলা হয়েছে" });
    fetchItems();
  };

  const filtered = items.filter(i =>
    i.title.toLowerCase().includes(search.toLowerCase()) ||
    (i.category || "").toLowerCase().includes(search.toLowerCase()) ||
    (i.organizer_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const statusLabel = (s: string) => s === "upcoming" ? "আসন্ন" : s === "ongoing" ? "চলমান" : "সম্পন্ন";
  const statusColor = (s: string) => s === "upcoming" ? "bg-blue-500/10 text-blue-600" : s === "ongoing" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground";

  return (
    <div className="space-y-4">
      <SwipeUpEditor
        open={showForm}
        onClose={closeForm}
        title={editId ? "ইভেন্ট এডিট করুন" : "নতুন ইভেন্ট যোগ করুন"}
        subtitle="ইভেন্ট ম্যানেজমেন্ট"
        icon={<CalendarHeart className="w-4 h-4 text-white" />}
        headerGradient="from-fuchsia-500 to-pink-500"
      >
        <div className="space-y-3">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">ইভেন্টের নাম *</label>
            <input className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="ইভেন্টের শিরোনাম" />
          </div>
          {/* Tagline */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">ট্যাগলাইন</label>
            <input className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50" value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })} placeholder="সংক্ষিপ্ত ট্যাগলাইন" />
          </div>
          {/* Category & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">ক্যাটাগরি</label>
              <select className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">স্ট্যাটাস</label>
              <select className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
              </select>
            </div>
          </div>
          {/* Short Description */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">সংক্ষিপ্ত বিবরণ</label>
            <textarea className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50 min-h-[60px]" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="সংক্ষিপ্ত বিবরণ" />
          </div>
          {/* Full Description */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">বিস্তারিত বিবরণ</label>
            <textarea className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50 min-h-[100px]" value={form.full_description} onChange={e => setForm({ ...form, full_description: e.target.value })} placeholder="বিস্তারিত তথ্য, শর্তাবলী ইত্যাদি" />
          </div>
          {/* Start & End Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">শুরুর তারিখ ও সময়</label>
              <input type="datetime-local" className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">শেষের তারিখ ও সময়</label>
              <input type="datetime-local" className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
            </div>
          </div>
          {/* Event Time */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">ইভেন্টের সময়</label>
            <input className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50" value={form.event_time} onChange={e => setForm({ ...form, event_time: e.target.value })} placeholder="যেমন: সকাল ১০টা - দুপুর ২টা" />
          </div>
          {/* Location & Map */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">লোকেশন</label>
            <input className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="ইভেন্টের স্থান" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">গুগল ম্যাপ লিংক</label>
            <input className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50" value={form.map_link} onChange={e => setForm({ ...form, map_link: e.target.value })} placeholder="https://maps.google.com/..." />
          </div>
          {/* Event Image */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">ইভেন্ট কভার ছবি</label>
            <input className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="ছবির URL" />
            <label className="mt-2 flex items-center gap-2 text-xs text-primary cursor-pointer">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{uploading ? "আপলোড হচ্ছে..." : "ছবি আপলোড করুন"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e, "image_url")} disabled={uploading} />
            </label>
            {form.image_url && <img src={form.image_url} alt="" className="mt-2 w-full h-32 object-cover rounded-xl" />}
          </div>

          {/* Organizer Section */}
          <div className="pt-2 border-t border-border/40">
            <p className="text-xs font-bold text-foreground mb-3">আয়োজক তথ্য</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">আয়োজকের নাম</label>
                <input className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50" value={form.organizer_name} onChange={e => setForm({ ...form, organizer_name: e.target.value })} placeholder="আয়োজক সংস্থা / ব্যক্তি" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">আয়োজকের ঠিকানা</label>
                <input className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50" value={form.organizer_location} onChange={e => setForm({ ...form, organizer_location: e.target.value })} placeholder="আয়োজকের অবস্থান" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">আয়োজকের ছবি / লোগো</label>
                <input className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50" value={form.organizer_image_url} onChange={e => setForm({ ...form, organizer_image_url: e.target.value })} placeholder="লোগো URL" />
                <label className="mt-2 flex items-center gap-2 text-xs text-primary cursor-pointer">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>{uploading ? "আপলোড হচ্ছে..." : "ছবি আপলোড করুন"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e, "organizer_image_url")} disabled={uploading} />
                </label>
                {form.organizer_image_url && <img src={form.organizer_image_url} alt="" className="mt-2 w-12 h-12 object-cover rounded-full" />}
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={form.is_verified} onChange={e => setForm({ ...form, is_verified: e.target.checked })} className="rounded" />
                  <span className="text-muted-foreground font-semibold">ভেরিফাইড আয়োজক</span>
                </label>
              </div>
            </div>
          </div>

          {/* Pricing & Capacity */}
          <div className="pt-2 border-t border-border/40">
            <p className="text-xs font-bold text-foreground mb-3">টিকেট ও ক্যাপাসিটি</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={form.is_free} onChange={e => setForm({ ...form, is_free: e.target.checked })} className="rounded" />
                  <span className="text-muted-foreground font-semibold">ফ্রি ইভেন্ট</span>
                </label>
              </div>
              {!form.is_free && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">টিকেট মূল্য</label>
                  <input className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="যেমন: ২০০ টাকা" />
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">ক্যাপাসিটি</label>
                <input className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} placeholder="যেমন: ৫০০ জন" />
              </div>
            </div>
          </div>

          {/* Registration */}
          <div className="pt-2 border-t border-border/40">
            <p className="text-xs font-bold text-foreground mb-3">রেজিস্ট্রেশন</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={form.registration_open} onChange={e => setForm({ ...form, registration_open: e.target.checked })} className="rounded" />
                  <span className="text-muted-foreground font-semibold">রেজিস্ট্রেশন চালু</span>
                </label>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">রেজিস্ট্রেশন লিংক</label>
                <input className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50" value={form.registration_link} onChange={e => setForm({ ...form, registration_link: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">যোগাযোগ নম্বর</label>
                <input className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="ফোন নম্বর" />
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="flex gap-2 pt-3">
            <button onClick={save} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              <Save className="w-4 h-4" /> {editId ? "আপডেট করুন" : "যোগ করুন"}
            </button>
            <button onClick={closeForm} className="px-5 py-3 rounded-xl bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors">
              বাতিল
            </button>
          </div>
        </div>
      </SwipeUpEditor>

      {/* Add Button */}
      <button onClick={() => setShowForm(true)} className="w-full py-3.5 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 text-primary text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/10 transition-all">
        <Plus className="w-4 h-4" /> নতুন ইভেন্ট যোগ করুন
      </button>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="ইভেন্ট খুঁজুন..."
          className="w-full bg-card rounded-2xl pl-10 pr-4 py-3 text-sm outline-none border border-border/60 focus:border-primary/50 transition-all"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground flex items-center gap-1"><Hash className="w-3 h-3" /> মোট: {items.length}টি</span>
        <button onClick={fetchItems} className="ml-auto text-xs text-primary flex items-center gap-1 hover:underline"><RefreshCw className="w-3 h-3" /> রিফ্রেশ</button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-28 bg-muted/40 rounded-2xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">কোনো ইভেন্ট পাওয়া যায়নি</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <div key={item.id} className="bg-card border border-border/60 rounded-2xl overflow-hidden">
              {/* Image preview */}
              {item.image_url && (
                <img src={item.image_url} alt={item.title} className="w-full h-28 object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-foreground">{item.title}</h3>
                    {item.tagline && <p className="text-xs text-muted-foreground mt-0.5 italic">{item.tagline}</p>}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColor(item.status)}`}>
                        {statusLabel(item.status)}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">{item.category}</span>
                      {item.is_free ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold">ফ্রি</span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-semibold">{item.price || "পেইড"}</span>
                      )}
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${item.is_approved ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}>
                    {item.is_approved ? "✅" : "⏸"}
                  </span>
                </div>
                {/* Meta */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] text-muted-foreground">
                  {item.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</span>}
                  {item.event_time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.event_time}</span>}
                  {item.organizer_name && <span className="flex items-center gap-1"><UsersIcon className="w-3 h-3" />{item.organizer_name}</span>}
                  {item.capacity && <span className="flex items-center gap-1"><UsersIcon className="w-3 h-3" />{item.capacity}</span>}
                </div>
                {/* Actions */}
                <div className="flex gap-1.5 mt-3 pt-3 border-t border-border/40 flex-wrap">
                  <button onClick={() => openEdit(item)} className="text-[11px] px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 font-semibold flex items-center gap-1 hover:bg-blue-500/20 transition-colors">
                    <Edit3 className="w-3 h-3" /> এডিট
                  </button>
                  <button onClick={() => toggleApproval(item.id, item.is_approved)} className="text-[11px] px-3 py-1.5 rounded-lg bg-muted text-muted-foreground font-semibold flex items-center gap-1 hover:bg-muted/80 transition-colors">
                    {item.is_approved ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {item.is_approved ? "অননুমোদন" : "অনুমোদন"}
                  </button>
                  <button onClick={() => deleteItem(item.id, item.title)} className="text-[11px] px-3 py-1.5 rounded-lg bg-red-500/10 text-red-600 font-semibold flex items-center gap-1 hover:bg-red-500/20 transition-colors">
                    <Trash2 className="w-3 h-3" /> মুছুন
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminEventsManager;
