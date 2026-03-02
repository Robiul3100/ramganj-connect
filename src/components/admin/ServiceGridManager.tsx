import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Plus, Trash2, Save, Edit3, X, GripVertical, Eye, EyeOff,
  RefreshCw, Palette, Code, ChevronDown, ChevronUp, Layers
} from "lucide-react";

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
}

const ServiceGridManager = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ServiceCategory>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", slug: "", icon: "Tag", description: "", svg_icon: "", accent_color: "hsl(220,60%,72%)", sort_order: 0 });
  const [expandedSvg, setExpandedSvg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("service_categories").select("*").order("sort_order");
    if (error) {
      toast({ title: "লোড ব্যর্থ", variant: "destructive" });
    } else {
      setCategories((data as any[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const startEdit = (cat: ServiceCategory) => {
    setEditingId(cat.id);
    setEditForm({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      description: cat.description || "",
      svg_icon: cat.svg_icon || "",
      accent_color: cat.accent_color || "",
      sort_order: cat.sort_order,
      is_active: cat.is_active,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    const { error } = await (supabase.from as any)("service_categories")
      .update({
        name: editForm.name,
        slug: editForm.slug,
        icon: editForm.icon,
        description: editForm.description || null,
        svg_icon: editForm.svg_icon || null,
        accent_color: editForm.accent_color || null,
        sort_order: editForm.sort_order,
        is_active: editForm.is_active,
      })
      .eq("id", editingId);
    if (error) {
      toast({ title: "সেভ ব্যর্থ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✅ আপডেট হয়েছে" });
      setEditingId(null);
      fetchCategories();
    }
    setSaving(false);
  };

  const addCategory = async () => {
    if (!newForm.name || !newForm.slug) {
      toast({ title: "নাম ও স্লাগ দিতে হবে", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await (supabase.from as any)("service_categories")
      .insert({
        name: newForm.name,
        slug: newForm.slug,
        icon: newForm.icon || "Tag",
        description: newForm.description || null,
        svg_icon: newForm.svg_icon || null,
        accent_color: newForm.accent_color || null,
        sort_order: newForm.sort_order,
        is_active: true,
      });
    if (error) {
      toast({ title: "এড ব্যর্থ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✅ নতুন সার্ভিস এড হয়েছে" });
      setShowAddForm(false);
      setNewForm({ name: "", slug: "", icon: "Tag", description: "", svg_icon: "", accent_color: "hsl(220,60%,72%)", sort_order: 0 });
      fetchCategories();
    }
    setSaving(false);
  };

  const deleteCategory = async (id: string, name: string) => {
    if (!confirm(`"${name}" সার্ভিস ক্যাটাগরি মুছে ফেলতে চান?`)) return;
    const { error } = await (supabase.from as any)("service_categories").delete().eq("id", id);
    if (error) {
      toast({ title: "মুছতে পারা যায়নি", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "🗑️ মুছে ফেলা হয়েছে" });
      fetchCategories();
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await (supabase.from as any)("service_categories")
      .update({ is_active: !current }).eq("id", id);
    if (!error) {
      setCategories(prev => prev.map(c => c.id === id ? { ...c, is_active: !current } : c));
      toast({ title: !current ? "✅ সক্রিয়" : "⏸ নিষ্ক্রিয়" });
    }
  };

  const SvgPreview = ({ svgCode, color }: { svgCode: string; color?: string }) => {
    if (!svgCode) return <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground"><Code className="w-4 h-4" /></div>;
    return (
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden"
        style={{ background: color ? `linear-gradient(135deg, ${color}22, ${color}11)` : "hsl(var(--muted))", border: `1px solid ${color || "hsl(var(--border))"}` }}
        dangerouslySetInnerHTML={{ __html: svgCode.replace(/<svg/g, '<svg width="28" height="28" style="display:block"') }}
      />
    );
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-card/80 border border-border/50 rounded-2xl p-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mb-2" />
            <div className="h-3 bg-muted rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" /> সার্ভিস গ্রিড ম্যানেজমেন্ট
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={fetchCategories} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> রিফ্রেশ
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" /> নতুন সার্ভিস
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">মোট {categories.length} টি সার্ভিস ক্যাটাগরি</p>

      {/* Add New Form */}
      {showAddForm && (
        <div className="bg-card/80 backdrop-blur-sm border border-primary/30 rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" /> নতুন সার্ভিস ক্যাটাগরি
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">সার্ভিসের নাম *</label>
              <input
                className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                value={newForm.name}
                onChange={e => setNewForm(p => ({ ...p, name: e.target.value }))}
                placeholder="যেমনঃ ডাক্তার"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">স্লাগ (URL) *</label>
              <input
                className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                value={newForm.slug}
                onChange={e => setNewForm(p => ({ ...p, slug: e.target.value }))}
                placeholder="যেমনঃ doctors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Lucide আইকন নাম</label>
              <input
                className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                value={newForm.icon}
                onChange={e => setNewForm(p => ({ ...p, icon: e.target.value }))}
                placeholder="Tag"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1.5">
                <Palette className="w-3 h-3" /> অ্যাক্সেন্ট কালার (HSL)
              </label>
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-muted/50 rounded-xl px-3 py-2.5 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                  value={newForm.accent_color}
                  onChange={e => setNewForm(p => ({ ...p, accent_color: e.target.value }))}
                  placeholder="hsl(195,80%,70%)"
                />
                {newForm.accent_color && (
                  <div className="w-10 h-10 rounded-lg border border-border shrink-0" style={{ background: newForm.accent_color }} />
                )}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">বিবরণ</label>
              <input
                className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                value={newForm.description}
                onChange={e => setNewForm(p => ({ ...p, description: e.target.value }))}
                placeholder="সংক্ষিপ্ত বিবরণ"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">ক্রম (Sort Order)</label>
              <input
                type="number"
                className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                value={newForm.sort_order}
                onChange={e => setNewForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
              <Code className="w-3 h-3" /> কাস্টম SVG আইকন কোড
            </label>
            <textarea
              className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-xs border border-border outline-none min-h-[100px] focus:border-primary/40 focus:ring-2 focus:ring-primary/10 resize-none transition-all font-mono"
              value={newForm.svg_icon}
              onChange={e => setNewForm(p => ({ ...p, svg_icon: e.target.value }))}
              placeholder='<svg viewBox="0 0 48 48" fill="none">...</svg>'
            />
            {newForm.svg_icon && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">প্রিভিউ:</span>
                <SvgPreview svgCode={newForm.svg_icon} color={newForm.accent_color} />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={addCategory} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? "সেভ হচ্ছে..." : "সার্ভিস এড করুন"}
            </button>
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Category List */}
      <div className="space-y-2.5">
        {categories.map(cat => {
          const isEditing = editingId === cat.id;
          const isSvgExpanded = expandedSvg === cat.id;

          if (isEditing) {
            return (
              <div key={cat.id} className="bg-card/80 backdrop-blur-sm border border-primary/30 rounded-2xl p-5 space-y-3">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-primary" /> এডিট: {cat.name}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">সার্ভিসের নাম</label>
                    <input
                      className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                      value={editForm.name || ""}
                      onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">স্লাগ (URL)</label>
                    <input
                      className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                      value={editForm.slug || ""}
                      onChange={e => setEditForm(p => ({ ...p, slug: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Lucide আইকন নাম</label>
                    <input
                      className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                      value={editForm.icon || ""}
                      onChange={e => setEditForm(p => ({ ...p, icon: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1.5">
                      <Palette className="w-3 h-3" /> অ্যাক্সেন্ট কালার
                    </label>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 bg-muted/50 rounded-xl px-3 py-2.5 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                        value={editForm.accent_color || ""}
                        onChange={e => setEditForm(p => ({ ...p, accent_color: e.target.value }))}
                        placeholder="hsl(195,80%,70%)"
                      />
                      {editForm.accent_color && (
                        <div className="w-10 h-10 rounded-lg border border-border shrink-0" style={{ background: editForm.accent_color }} />
                      )}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">বিবরণ</label>
                    <input
                      className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                      value={editForm.description || ""}
                      onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">ক্রম</label>
                    <input
                      type="number"
                      className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                      value={editForm.sort_order ?? 0}
                      onChange={e => setEditForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.is_active ?? true}
                        onChange={e => setEditForm(p => ({ ...p, is_active: e.target.checked }))}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm text-foreground font-medium">সক্রিয়</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                    <Code className="w-3 h-3" /> কাস্টম SVG আইকন কোড
                  </label>
                  <textarea
                    className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-xs border border-border outline-none min-h-[120px] focus:border-primary/40 focus:ring-2 focus:ring-primary/10 resize-none transition-all font-mono"
                    value={editForm.svg_icon || ""}
                    onChange={e => setEditForm(p => ({ ...p, svg_icon: e.target.value }))}
                    placeholder='<svg viewBox="0 0 48 48" fill="none">...</svg>'
                  />
                  {editForm.svg_icon && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">প্রিভিউ:</span>
                      <SvgPreview svgCode={editForm.svg_icon} color={editForm.accent_color || undefined} />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={saveEdit} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
                    <Save className="w-4 h-4" /> {saving ? "সেভ হচ্ছে..." : "আপডেট করুন"}
                  </button>
                  <button onClick={cancelEdit} className="px-4 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={cat.id}
              className={`bg-card/80 backdrop-blur-sm border rounded-2xl p-4 flex items-start gap-3 transition-all hover:shadow-md ${
                cat.is_active ? "border-border/50" : "border-border/30 opacity-60"
              }`}
            >
              <SvgPreview svgCode={cat.svg_icon || ""} color={cat.accent_color || undefined} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-foreground">{cat.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono">/{cat.slug}</span>
                  {!cat.is_active && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-bold">নিষ্ক্রিয়</span>
                  )}
                </div>
                {cat.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{cat.description}</p>}
                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {cat.view_count}</span>
                  <span>ক্রম: {cat.sort_order}</span>
                  {cat.accent_color && (
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full border border-border" style={{ background: cat.accent_color }} />
                      {cat.accent_color}
                    </span>
                  )}
                  {cat.svg_icon && (
                    <button onClick={() => setExpandedSvg(isSvgExpanded ? null : cat.id)} className="flex items-center gap-0.5 hover:text-foreground transition-colors">
                      <Code className="w-3 h-3" /> SVG {isSvgExpanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                    </button>
                  )}
                </div>
                {isSvgExpanded && cat.svg_icon && (
                  <pre className="mt-2 p-2 bg-muted/50 rounded-lg text-[10px] font-mono text-muted-foreground overflow-x-auto max-h-32 overflow-y-auto border border-border/50">
                    {cat.svg_icon}
                  </pre>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => toggleActive(cat.id, cat.is_active)} className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors" title={cat.is_active ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}>
                  {cat.is_active ? <Eye className="w-3.5 h-3.5 text-emerald-500" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
                <button onClick={() => startEdit(cat)} className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors" title="এডিট">
                  <Edit3 className="w-3.5 h-3.5 text-primary" />
                </button>
                <button onClick={() => deleteCategory(cat.id, cat.name)} className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center hover:bg-destructive/10 transition-colors" title="মুছুন">
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tips */}
      <div className="bg-muted/30 border border-border/50 rounded-2xl p-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          💡 <strong>টিপস:</strong> SVG কোড পেষ্ট করে কাস্টম আইকন সেট করুন। অ্যাক্সেন্ট কালার HSL ফরম্যাটে দিন (যেমনঃ <code className="bg-muted px-1 rounded">hsl(195,80%,70%)</code>)।
          SVG কোড না দিলে ডিফল্ট আইকন ব্যবহৃত হবে।
        </p>
      </div>
    </div>
  );
};

export default ServiceGridManager;
