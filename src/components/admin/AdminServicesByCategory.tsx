import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft, Plus, Search, Edit3, Save, Trash2, CheckCircle, XCircle,
  Star, StarOff, Phone, Hash, Eye, Image as ImageIcon,
  Stethoscope, Building2, Pill, GraduationCap, Store, ShoppingBag,
  Briefcase, SearchX, CalendarHeart, Plane, Ambulance, ShieldAlert,
  Flame, Bus, Lightbulb, Scale, Landmark, UsersRound, MapPin,
  Package, Tractor, Home, BookOpen, UtensilsCrossed, Wrench,
  ScrollText, HeartHandshake, Microscope, Car, Building, Rocket,
  Hotel, Coffee, Video, Flower2, Globe, RefreshCw,
  type LucideIcon
} from "lucide-react";
import SwipeUpEditor from "./SwipeUpEditor";

const slugIconMap: Record<string, { icon: LucideIcon; gradient: string }> = {
  "doctors": { icon: Stethoscope, gradient: "from-blue-500 to-indigo-500" },
  "hospitals": { icon: Building2, gradient: "from-sky-500 to-blue-500" },
  "pharmacy": { icon: Pill, gradient: "from-emerald-500 to-green-500" },
  "education": { icon: GraduationCap, gradient: "from-violet-500 to-purple-500" },
  "shops": { icon: Store, gradient: "from-amber-500 to-orange-500" },
  "marketplace": { icon: ShoppingBag, gradient: "from-pink-500 to-rose-500" },
  "jobs": { icon: Briefcase, gradient: "from-cyan-500 to-teal-500" },
  "lost-found": { icon: SearchX, gradient: "from-orange-500 to-red-500" },
  "events": { icon: CalendarHeart, gradient: "from-fuchsia-500 to-pink-500" },
  "expatriate": { icon: Plane, gradient: "from-indigo-500 to-blue-500" },
  "ambulance": { icon: Ambulance, gradient: "from-red-500 to-rose-500" },
  "police": { icon: ShieldAlert, gradient: "from-slate-600 to-blue-600" },
  "fire": { icon: Flame, gradient: "from-orange-600 to-red-600" },
  "transport": { icon: Bus, gradient: "from-teal-500 to-cyan-500" },
  "electricity": { icon: Lightbulb, gradient: "from-yellow-500 to-amber-500" },
  "legal": { icon: Scale, gradient: "from-gray-500 to-slate-600" },
  "bank": { icon: Landmark, gradient: "from-emerald-600 to-teal-600" },
  "organizations": { icon: UsersRound, gradient: "from-purple-500 to-indigo-500" },
  "tourism": { icon: MapPin, gradient: "from-green-500 to-emerald-500" },
  "courier": { icon: Package, gradient: "from-amber-600 to-orange-500" },
  "agriculture": { icon: Tractor, gradient: "from-lime-600 to-green-600" },
  "rent": { icon: Home, gradient: "from-blue-600 to-indigo-600" },
  "tuition": { icon: BookOpen, gradient: "from-violet-600 to-purple-600" },
  "food": { icon: UtensilsCrossed, gradient: "from-red-500 to-orange-500" },
  "repair": { icon: Wrench, gradient: "from-zinc-500 to-slate-600" },
  "deed-writer": { icon: ScrollText, gradient: "from-amber-700 to-yellow-600" },
  "marriage": { icon: HeartHandshake, gradient: "from-rose-500 to-pink-500" },
  "diagnostic": { icon: Microscope, gradient: "from-cyan-600 to-blue-600" },
  "car-rental": { icon: Car, gradient: "from-blue-500 to-sky-500" },
  "municipal": { icon: Building, gradient: "from-slate-500 to-zinc-600" },
  "entrepreneur": { icon: Rocket, gradient: "from-orange-500 to-amber-500" },
  "hotel": { icon: Hotel, gradient: "from-indigo-500 to-violet-500" },
  "restaurant": { icon: Coffee, gradient: "from-amber-600 to-yellow-600" },
  "video": { icon: Video, gradient: "from-red-600 to-rose-600" },
  "nursery": { icon: Flower2, gradient: "from-green-500 to-lime-500" },
};

// Category-specific metadata field configs
const categoryMetaFields: Record<string, { name: string; label: string; type?: string; options?: string[] }[]> = {
  "doctors": [
    { name: "meta_specialty", label: "বিশেষত্ব" },
    { name: "meta_degrees", label: "ডিগ্রি (কমা দিয়ে)" },
    { name: "meta_hospital_name", label: "হাসপাতাল / চেম্বার" },
    { name: "meta_registration_no", label: "রেজিস্ট্রেশন নং" },
    { name: "meta_experience", label: "অভিজ্ঞতা" },
    { name: "meta_chamber_time", label: "চেম্বার সময়" },
    { name: "meta_consultation_fee", label: "ভিজিট ফি" },
  ],
  "shops": [
    { name: "meta_shop_category", label: "দোকানের ধরন" },
    { name: "meta_owner_name", label: "মালিকের নাম" },
  ],
  "education": [
    { name: "meta_edu_category", label: "প্রতিষ্ঠানের ধরন", type: "select", options: ["স্কুল", "কলেজ", "মাদ্রাসা", "বিশ্ববিদ্যালয়", "কোচিং"] },
    { name: "meta_established_year", label: "প্রতিষ্ঠার সাল" },
    { name: "meta_principal_name", label: "প্রধান শিক্ষক / অধ্যক্ষ" },
  ],
  "jobs": [
    { name: "meta_company", label: "কোম্পানি / প্রতিষ্ঠান" },
    { name: "meta_job_category", label: "চাকরির ধরন", type: "select", options: ["সরকারি", "বেসরকারি", "পার্ট-টাইম", "ফ্রিল্যান্স"] },
    { name: "meta_salary_range", label: "বেতন সীমা" },
    { name: "meta_deadline", label: "আবেদনের শেষ তারিখ" },
  ],
};

interface Props {
  logActivity: (action: string, tableName?: string, recordId?: string, details?: string) => Promise<void>;
}

const AdminServicesByCategory = ({ logActivity }: Props) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [catSearch, setCatSearch] = useState("");

  // Add/Edit form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase.from("service_categories").select("*").eq("is_active", true).order("sort_order");
    setCategories(data || []);
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const fetchServices = useCallback(async (catId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("services")
      .select("*, service_categories(name, slug)")
      .eq("category_id", catId)
      .order("created_at", { ascending: false });
    setServices(data || []);
    setLoading(false);
  }, []);

  const openCategory = (cat: any) => {
    setSelectedCategory(cat);
    setSearchTerm("");
    fetchServices(cat.id);
  };

  const goBack = () => {
    setSelectedCategory(null);
    setServices([]);
    setSearchTerm("");
    setShowForm(false);
    setEditingId(null);
  };

  // Form helpers
  const resetForm = () => {
    setForm({ title: "", description: "", phone: "", whatsapp: "", address: "", area: "", image_url: "" });
    setEditingId(null);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (item: any) => {
    const meta = item.metadata || {};
    const f: Record<string, string> = {
      title: item.title || "",
      description: item.description || "",
      phone: item.phone || "",
      whatsapp: item.whatsapp || "",
      address: item.address || "",
      area: item.area || "",
      image_url: item.image_url || "",
    };
    // Load meta fields
    const slug = selectedCategory?.slug;
    if (slug && categoryMetaFields[slug]) {
      categoryMetaFields[slug].forEach(mf => {
        const key = mf.name.replace("meta_", "");
        if (key === "degrees") {
          f[mf.name] = (meta.degrees || []).join(", ");
        } else {
          f[mf.name] = meta[key] || "";
        }
      });
    }
    setForm(f);
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `services/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) { toast({ title: "আপলোড ব্যর্থ", variant: "destructive" }); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
    setForm(prev => ({ ...prev, image_url: urlData.publicUrl }));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title?.trim()) { toast({ title: "শিরোনাম দিন", variant: "destructive" }); return; }
    setSaving(true);

    // Build metadata
    const metadata: Record<string, any> = {};
    const slug = selectedCategory?.slug;
    if (slug && categoryMetaFields[slug]) {
      categoryMetaFields[slug].forEach(mf => {
        const key = mf.name.replace("meta_", "");
        if (form[mf.name]) {
          if (key === "degrees") {
            metadata.degrees = form[mf.name].split(",").map((d: string) => d.trim()).filter(Boolean);
          } else {
            metadata[key] = form[mf.name];
          }
        }
      });
    }

    const payload = {
      title: form.title,
      description: form.description || null,
      phone: form.phone || null,
      whatsapp: form.whatsapp || null,
      address: form.address || null,
      area: form.area || null,
      image_url: form.image_url || null,
      category_id: selectedCategory.id,
      metadata,
      status: "approved" as const,
      is_featured: false,
    };

    if (editingId) {
      const { error } = await supabase.from("services").update(payload).eq("id", editingId);
      if (error) { toast({ title: "আপডেট ব্যর্থ", variant: "destructive" }); setSaving(false); return; }
      await logActivity("edited", "services", editingId, form.title);
      toast({ title: "আপডেট হয়েছে ✅" });
    } else {
      const { error } = await supabase.from("services").insert(payload);
      if (error) { toast({ title: "সেভ ব্যর্থ", variant: "destructive" }); setSaving(false); return; }
      await logActivity("created", "services", undefined, form.title);
      toast({ title: "সেবা যোগ হয়েছে ✅" });
    }

    setSaving(false);
    setShowForm(false);
    resetForm();
    fetchServices(selectedCategory.id);
  };

  const updateStatus = async (id: string, status: string, title: string) => {
    await supabase.from("services").update({ status }).eq("id", id);
    await logActivity(status, "services", id, title);
    toast({ title: status === "approved" ? "অনুমোদিত ✅" : "প্রত্যাখ্যাত ❌" });
    fetchServices(selectedCategory.id);
  };

  const toggleFeatured = async (id: string, current: boolean, title: string) => {
    await supabase.from("services").update({ is_featured: !current }).eq("id", id);
    await logActivity(!current ? "featured" : "unfeatured", "services", id, title);
    toast({ title: !current ? "ফিচার্ড ✨" : "আনফিচার্ড" });
    fetchServices(selectedCategory.id);
  };

  const deleteService = async (id: string, title: string) => {
    if (!confirm("মুছে ফেলতে চান?")) return;
    await supabase.from("services").delete().eq("id", id);
    await logActivity("deleted", "services", id, title);
    toast({ title: "মুছে ফেলা হয়েছে" });
    fetchServices(selectedCategory.id);
  };

  const filteredServices = services.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.phone || "").includes(searchTerm) ||
    (s.address || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(catSearch.toLowerCase()) ||
    c.slug.toLowerCase().includes(catSearch.toLowerCase())
  );

  // Count services per category
  const [catCounts, setCatCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    const fetchCounts = async () => {
      const { data } = await supabase.from("services").select("category_id");
      if (data) {
        const counts: Record<string, number> = {};
        data.forEach((s: any) => { if (s.category_id) counts[s.category_id] = (counts[s.category_id] || 0) + 1; });
        setCatCounts(counts);
      }
    };
    fetchCounts();
  }, []);

  // ========= CATEGORY GRID =========
  if (!selectedCategory) {
    return (
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="ক্যাটাগরি খুঁজুন..."
            className="w-full bg-card rounded-2xl pl-10 pr-4 py-3.5 text-sm outline-none border border-border/60 focus:border-primary/50 transition-all"
            value={catSearch}
            onChange={(e) => setCatSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <Hash className="w-3 h-3" /> মোট {filteredCategories.length}টি ক্যাটাগরি
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {filteredCategories.map(cat => {
            const iconData = slugIconMap[cat.slug];
            const Icon = iconData?.icon || Globe;
            const gradient = iconData?.gradient || "from-primary to-primary/80";
            const count = catCounts[cat.id] || 0;

            return (
              <button
                key={cat.id}
                onClick={() => openCategory(cat)}
                className="bg-card border border-border/60 rounded-2xl p-4 text-left hover:shadow-md hover:border-primary/30 transition-all group relative overflow-hidden"
              >
                {/* Background decoration */}
                <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${gradient} opacity-[0.07] group-hover:opacity-[0.12] transition-opacity`} />

                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform`}>
                  <Icon className="w-4.5 h-4.5 text-white" />
                </div>
                <p className="text-[13px] font-bold text-foreground leading-tight">{cat.name}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {cat.view_count || 0} ভিউ
                  </span>
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                    {count}টি সেবা
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ========= CATEGORY SERVICE LIST =========
  const iconData = slugIconMap[selectedCategory.slug];
  const CatIcon = iconData?.icon || Globe;
  const catGradient = iconData?.gradient || "from-primary to-primary/80";
  const metaFields = categoryMetaFields[selectedCategory.slug] || [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={goBack}
          className="w-9 h-9 rounded-xl bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${catGradient} flex items-center justify-center shadow-sm shrink-0`}>
          <CatIcon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-foreground truncate">{selectedCategory.name}</h2>
          <p className="text-[10px] text-muted-foreground">{filteredServices.length}টি সেবা</p>
        </div>
        <button
          onClick={() => fetchServices(selectedCategory.id)}
          className="w-8 h-8 rounded-lg bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Add Button */}
      <button
        onClick={openAddForm}
        className="w-full py-3.5 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 text-primary text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/10 transition-all"
      >
        <Plus className="w-4 h-4" /> নতুন {selectedCategory.name} যোগ করুন
      </button>

      {/* Search */}
      {services.length > 3 && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={`${selectedCategory.name} খুঁজুন...`}
            className="w-full bg-card rounded-2xl pl-10 pr-4 py-3 text-sm outline-none border border-border/60 focus:border-primary/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {/* SwipeUp Editor Form */}
      <SwipeUpEditor
        open={showForm}
        onClose={() => { setShowForm(false); resetForm(); }}
        title={editingId ? "সেবা এডিট করুন" : `নতুন ${selectedCategory.name} যোগ করুন`}
        subtitle={selectedCategory.name}
        icon={editingId ? <Edit3 className="w-4 h-4 text-white" /> : <Plus className="w-4 h-4 text-white" />}
        headerGradient={catGradient}
      >
        {/* Common fields */}
        <input
          className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50 transition-all"
          placeholder="নাম / শিরোনাম *"
          value={form.title || ""}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <textarea
          className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 min-h-[70px] outline-none resize-none focus:border-primary/50 transition-all"
          placeholder="বিবরণ (ঐচ্ছিক)"
          value={form.description || ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            className="bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50 transition-all"
            placeholder="📞 ফোন"
            value={form.phone || ""}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            className="bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50 transition-all"
            placeholder="💬 WhatsApp"
            value={form.whatsapp || ""}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
          />
        </div>
        <input
          className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50 transition-all"
          placeholder="📍 ঠিকানা"
          value={form.address || ""}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
        <input
          className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50 transition-all"
          placeholder="এলাকা (ঐচ্ছিক)"
          value={form.area || ""}
          onChange={(e) => setForm({ ...form, area: e.target.value })}
        />

        {/* Category-specific meta fields */}
        {metaFields.length > 0 && (
          <div className="pt-2 border-t border-border/40">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-3">
              {selectedCategory.name} বিশেষ তথ্য
            </p>
            {metaFields.map(mf => (
              <div key={mf.name} className="mb-3">
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">{mf.label}</label>
                {mf.type === "select" && mf.options ? (
                  <select
                    className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50 transition-all"
                    value={form[mf.name] || ""}
                    onChange={(e) => setForm({ ...form, [mf.name]: e.target.value })}
                  >
                    <option value="">নির্বাচন করুন</option>
                    {mf.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50 transition-all"
                    placeholder={mf.label}
                    value={form[mf.name] || ""}
                    onChange={(e) => setForm({ ...form, [mf.name]: e.target.value })}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Image */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">ছবি (ঐচ্ছিক)</label>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-xs text-primary font-semibold cursor-pointer bg-primary/10 px-4 py-2.5 rounded-xl hover:bg-primary/15 transition-colors">
              <ImageIcon className="w-4 h-4" /> {uploading ? "আপলোড হচ্ছে..." : "ছবি আপলোড"}
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
            {form.image_url && <img src={form.image_url} alt="" className="w-12 h-12 rounded-xl object-cover border border-border" />}
          </div>
        </div>

        {/* Save */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? "সেভ হচ্ছে..." : editingId ? "আপডেট করুন" : "যোগ করুন"}
          </button>
        </div>
      </SwipeUpEditor>

      {/* Service List */}
      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="bg-card border border-border/60 rounded-2xl p-4 animate-pulse"><div className="h-4 bg-muted rounded w-2/3 mb-2" /><div className="h-3 bg-muted rounded w-1/3" /></div>)}</div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-12">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${catGradient} flex items-center justify-center mx-auto mb-3 opacity-30`}>
            <CatIcon className="w-6 h-6 text-white" />
          </div>
          <p className="text-muted-foreground text-sm">কোন সেবা নেই</p>
          <p className="text-xs text-muted-foreground mt-1">উপরের বাটনে ক্লিক করে নতুন যোগ করুন</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredServices.map((item: any) => {
            const statusCfg: Record<string, string> = {
              approved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
              rejected: "bg-red-500/10 text-red-600 dark:text-red-400",
            };
            return (
              <div key={item.id} className="bg-card border border-border/60 rounded-2xl overflow-hidden hover:shadow-md transition-all">
                <div className="p-4">
                  <div className="flex gap-3">
                    {item.image_url && (
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-muted border border-border/40">
                        <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-bold text-foreground text-sm truncate">{item.title}</h3>
                            {item.is_featured && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                          </div>
                          {item.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>}
                        </div>
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold shrink-0 ${statusCfg[item.status] || statusCfg.pending}`}>
                          {item.status === "approved" ? "✅" : item.status === "rejected" ? "❌" : "🕐"}
                        </span>
                      </div>
                      {item.phone && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Phone className="w-3 h-3" /> {item.phone}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1.5 mt-3 pt-3 border-t border-border/40 flex-wrap">
                    {item.status !== "approved" && (
                      <button onClick={() => updateStatus(item.id, "approved", item.title)} className="text-xs px-2.5 py-1.5 rounded-lg font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15 transition-colors flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> অনুমোদন
                      </button>
                    )}
                    {item.status !== "rejected" && (
                      <button onClick={() => updateStatus(item.id, "rejected", item.title)} className="text-xs px-2.5 py-1.5 rounded-lg font-semibold bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/15 transition-colors flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> প্রত্যাখ্যান
                      </button>
                    )}
                    <button onClick={() => toggleFeatured(item.id, item.is_featured, item.title)} className="text-xs px-2.5 py-1.5 rounded-lg font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/15 transition-colors flex items-center gap-1">
                      {item.is_featured ? <StarOff className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
                      {item.is_featured ? "আনফিচার" : "ফিচার"}
                    </button>
                    <button onClick={() => openEditForm(item)} className="text-xs px-2.5 py-1.5 rounded-lg font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/15 transition-colors flex items-center gap-1">
                      <Edit3 className="w-3.5 h-3.5" /> এডিট
                    </button>
                    <button onClick={() => deleteService(item.id, item.title)} className="text-xs px-2.5 py-1.5 rounded-lg font-semibold bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/15 transition-colors flex items-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" /> মুছুন
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminServicesByCategory;
