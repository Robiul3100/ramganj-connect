import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Plus, Trash2, Save, Edit3, X, Eye, EyeOff,
  RefreshCw, Palette, Code, Layers, Search,
  Image as ImageIcon, Upload, GripVertical
} from "lucide-react";
import SwipeUpEditor from "./SwipeUpEditor";

interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  description: string | null;
  view_count: number;
  svg_icon: string | null;
  accent_color: string | null;
  icon_url: string | null;
}

const ServiceGridManager = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCat, setEditingCat] = useState<ServiceCategory | null>(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [iconTab, setIconTab] = useState<"svg" | "png">("svg");

  const emptyForm = { name: "", slug: "", icon: "Tag", description: "", svg_icon: "", accent_color: "hsl(220,60%,72%)", sort_order: 0, icon_url: "" };
  const [form, setForm] = useState(emptyForm);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("service_categories").select("*").order("sort_order");
    if (error) toast({ title: "লোড ব্যর্থ", variant: "destructive" });
    else setCategories((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const openAdd = () => {
    setEditingCat(null);
    setForm(emptyForm);
    setIconTab("svg");
    setShowForm(true);
  };

  const openEdit = (cat: ServiceCategory) => {
    setEditingCat(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      description: cat.description || "",
      svg_icon: cat.svg_icon || "",
      accent_color: cat.accent_color || "",
      sort_order: cat.sort_order,
      icon_url: cat.icon_url || "",
    });
    setIconTab(cat.icon_url ? "png" : "svg");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCat(null);
    setForm(emptyForm);
  };

  const handleUploadIcon = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `service-icons/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) {
      toast({ title: "আপলোড ব্যর্থ", variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
    setForm(p => ({ ...p, icon_url: urlData.publicUrl }));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast({ title: "নাম ও স্লাগ দিতে হবে", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      slug: form.slug,
      icon: form.icon || "Tag",
      description: form.description || null,
      svg_icon: iconTab === "svg" ? (form.svg_icon || null) : null,
      accent_color: form.accent_color || null,
      sort_order: form.sort_order,
      icon_url: iconTab === "png" ? (form.icon_url || null) : null,
    };

    if (editingCat) {
      const { error } = await (supabase.from as any)("service_categories")
        .update({ ...payload, is_active: editingCat.is_active })
        .eq("id", editingCat.id);
      if (error) toast({ title: "আপডেট ব্যর্থ", variant: "destructive" });
      else toast({ title: "✅ আপডেট হয়েছে" });
    } else {
      const { error } = await (supabase.from as any)("service_categories")
        .insert({ ...payload, is_active: true });
      if (error) toast({ title: "এড ব্যর্থ", variant: "destructive" });
      else toast({ title: "✅ নতুন সার্ভিস এড হয়েছে" });
    }
    setSaving(false);
    closeForm();
    fetchCategories();
  };

  const deleteCategory = async (id: string, name: string) => {
    if (!confirm(`"${name}" মুছে ফেলতে চান?`)) return;
    const { error } = await (supabase.from as any)("service_categories").delete().eq("id", id);
    if (error) toast({ title: "মুছতে পারা যায়নি", variant: "destructive" });
    else { toast({ title: "🗑️ মুছে ফেলা হয়েছে" }); fetchCategories(); }
  };

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await (supabase.from as any)("service_categories")
      .update({ is_active: !current }).eq("id", id);
    if (!error) {
      setCategories(prev => prev.map(c => c.id === id ? { ...c, is_active: !current } : c));
      toast({ title: !current ? "✅ সক্রিয়" : "⏸ নিষ্ক্রিয়" });
    }
  };

  const IconPreview = ({ cat }: { cat: ServiceCategory }) => {
    const color = cat.accent_color || "hsl(220,60%,72%)";
    if (cat.icon_url) {
      return (
        <div className="w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden border border-border/60"
          style={{ background: `linear-gradient(135deg, ${color}15, ${color}08)` }}>
          <img src={cat.icon_url} alt="" className="w-7 h-7 object-contain" />
        </div>
      );
    }
    if (cat.svg_icon) {
      return (
        <div className="w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden border border-border/60"
          style={{ background: `linear-gradient(135deg, ${color}15, ${color}08)` }}
          dangerouslySetInnerHTML={{ __html: cat.svg_icon.replace(/<svg/g, '<svg width="28" height="28" style="display:block"') }}
        />
      );
    }
    return (
      <div className="w-11 h-11 rounded-xl bg-muted/60 flex items-center justify-center border border-border/60">
        <Code className="w-4 h-4 text-muted-foreground" />
      </div>
    );
  };

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = categories.filter(c => c.is_active).length;

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="bg-card border border-border/60 rounded-2xl p-4 animate-pulse flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-muted shrink-0" />
            <div className="flex-1"><div className="h-4 bg-muted rounded w-1/3 mb-2" /><div className="h-3 bg-muted rounded w-2/3" /></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-card border border-border/60 rounded-2xl p-3.5 text-center">
          <p className="text-lg font-extrabold text-foreground">{categories.length}</p>
          <p className="text-[10px] text-muted-foreground font-medium">মোট সার্ভিস</p>
        </div>
        <div className="bg-card border border-border/60 rounded-2xl p-3.5 text-center">
          <p className="text-lg font-extrabold text-emerald-500">{activeCount}</p>
          <p className="text-[10px] text-muted-foreground font-medium">সক্রিয়</p>
        </div>
        <div className="bg-card border border-border/60 rounded-2xl p-3.5 text-center">
          <p className="text-lg font-extrabold text-amber-500">{categories.length - activeCount}</p>
          <p className="text-[10px] text-muted-foreground font-medium">নিষ্ক্রিয়</p>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="সার্ভিস খুঁজুন..."
            className="w-full bg-card rounded-2xl pl-10 pr-4 py-3 text-sm outline-none border border-border/60 focus:border-primary/50 transition-all"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button onClick={fetchCategories} className="w-10 h-10 rounded-xl bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors shrink-0">
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
        <button onClick={openAdd} className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity shrink-0">
          <Plus className="w-4 h-4" /> যোগ
        </button>
      </div>

      {/* Category List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Layers className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">কোন সার্ভিস পাওয়া যায়নি</p>
          </div>
        ) : filtered.map(cat => (
          <div
            key={cat.id}
            className={`bg-card border rounded-2xl overflow-hidden transition-all hover:shadow-md ${
              cat.is_active ? "border-border/60" : "border-border/30 opacity-60"
            }`}
          >
            <div className="p-3.5 flex items-center gap-3">
              <IconPreview cat={cat} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-foreground truncate">{cat.name}</h3>
                  {!cat.is_active && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive font-bold shrink-0">নিষ্ক্রিয়</span>
                  )}
                </div>
                <div className="flex items-center gap-2.5 mt-1 text-[10px] text-muted-foreground">
                  <span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded">/{cat.slug}</span>
                  <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" /> {cat.view_count}</span>
                  <span className="flex items-center gap-0.5"><GripVertical className="w-2.5 h-2.5" /> {cat.sort_order}</span>
                  {cat.accent_color && (
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full border border-border/60" style={{ background: cat.accent_color }} />
                    </span>
                  )}
                  {cat.icon_url && <span className="text-primary font-semibold">PNG</span>}
                  {cat.svg_icon && !cat.icon_url && <span className="text-primary font-semibold">SVG</span>}
                </div>
                {cat.description && <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{cat.description}</p>}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => toggleActive(cat.id, cat.is_active)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    cat.is_active ? "bg-emerald-500/10 hover:bg-emerald-500/15" : "bg-muted/60 hover:bg-muted"
                  }`}
                  title={cat.is_active ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
                >
                  {cat.is_active ? <Eye className="w-3.5 h-3.5 text-emerald-500" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
                <button onClick={() => openEdit(cat)} className="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary/15 flex items-center justify-center transition-colors" title="এডিট">
                  <Edit3 className="w-3.5 h-3.5 text-primary" />
                </button>
                <button onClick={() => deleteCategory(cat.id, cat.name)} className="w-8 h-8 rounded-lg bg-destructive/10 hover:bg-destructive/15 flex items-center justify-center transition-colors" title="মুছুন">
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
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
        title={editingCat ? "সার্ভিস এডিট করুন" : "নতুন সার্ভিস যোগ করুন"}
        subtitle={editingCat?.name}
        icon={editingCat ? <Edit3 className="w-4 h-4 text-white" /> : <Plus className="w-4 h-4 text-white" />}
        headerGradient={editingCat ? "from-blue-500 to-indigo-500" : "from-primary to-primary/80"}
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">সার্ভিসের নাম *</label>
            <input
              className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="যেমনঃ ডাক্তার"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">স্লাগ (URL) *</label>
            <input
              className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
              value={form.slug}
              onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
              placeholder="doctors"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">বিবরণ</label>
          <input
            className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            placeholder="সংক্ষিপ্ত বিবরণ"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Lucide আইকন নাম</label>
            <input
              className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
              value={form.icon}
              onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}
              placeholder="Tag"
            />
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
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
            <Palette className="w-3 h-3" /> অ্যাক্সেন্ট কালার (HSL)
          </label>
          <div className="flex gap-2">
            <input
              className="flex-1 bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
              value={form.accent_color}
              onChange={e => setForm(p => ({ ...p, accent_color: e.target.value }))}
              placeholder="hsl(195,80%,70%)"
            />
            {form.accent_color && (
              <div className="w-12 h-12 rounded-xl border border-border shrink-0" style={{ background: form.accent_color }} />
            )}
          </div>
        </div>

        {/* Icon Type Tabs */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">আইকন টাইপ</label>
          <div className="flex gap-1 bg-muted/50 rounded-xl p-1 mb-3">
            <button
              onClick={() => setIconTab("svg")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                iconTab === "svg" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Code className="w-3.5 h-3.5" /> SVG কোড
            </button>
            <button
              onClick={() => setIconTab("png")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                iconTab === "png" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" /> PNG আইকন
            </button>
          </div>

          {iconTab === "svg" ? (
            <div>
              <textarea
                className="w-full bg-muted/50 rounded-xl px-4 py-3 text-xs border border-border outline-none min-h-[100px] focus:border-primary/40 focus:ring-2 focus:ring-primary/10 resize-none transition-all font-mono"
                value={form.svg_icon}
                onChange={e => setForm(p => ({ ...p, svg_icon: e.target.value }))}
                placeholder='<svg viewBox="0 0 48 48" fill="none">...</svg>'
              />
              {form.svg_icon && (
                <div className="mt-2 flex items-center gap-2 bg-muted/30 rounded-xl p-2.5 border border-border/40">
                  <span className="text-[10px] text-muted-foreground font-medium">প্রিভিউ:</span>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden border border-border/60"
                    style={{ background: form.accent_color ? `linear-gradient(135deg, ${form.accent_color}15, ${form.accent_color}08)` : "hsl(var(--muted))" }}
                    dangerouslySetInnerHTML={{ __html: form.svg_icon.replace(/<svg/g, '<svg width="28" height="28" style="display:block"') }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 text-xs text-primary font-semibold cursor-pointer bg-primary/10 px-4 py-2.5 rounded-xl hover:bg-primary/15 transition-colors">
                  <Upload className="w-4 h-4" /> {uploading ? "আপলোড হচ্ছে..." : "আইকন আপলোড"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleUploadIcon} disabled={uploading} />
                </label>
                <span className="text-[10px] text-muted-foreground">অথবা URL দিন</span>
              </div>
              <input
                className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all mt-2"
                value={form.icon_url}
                onChange={e => setForm(p => ({ ...p, icon_url: e.target.value }))}
                placeholder="https://example.com/icon.png"
              />
              {form.icon_url && (
                <div className="mt-2 flex items-center gap-2 bg-muted/30 rounded-xl p-2.5 border border-border/40">
                  <span className="text-[10px] text-muted-foreground font-medium">প্রিভিউ:</span>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden border border-border/60"
                    style={{ background: form.accent_color ? `linear-gradient(135deg, ${form.accent_color}15, ${form.accent_color}08)` : "hsl(var(--muted))" }}
                  >
                    <img src={form.icon_url} alt="" className="w-7 h-7 object-contain" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? "সেভ হচ্ছে..." : editingCat ? "আপডেট করুন" : "সার্ভিস এড করুন"}
        </button>
      </SwipeUpEditor>
    </div>
  );
};

export default ServiceGridManager;
