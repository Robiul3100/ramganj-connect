import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Save, X, Image as ImageIcon, Plus } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface AddServiceFormProps {
  categories: Category[];
  preselectedCategoryId?: string;
  onClose: () => void;
  onSaved: () => void;
  logActivity?: (action: string, tableName?: string, recordId?: string, details?: string) => Promise<void>;
}

const AddServiceForm = ({ categories, preselectedCategoryId, onClose, onSaved, logActivity }: AddServiceFormProps) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    phone: "",
    whatsapp: "",
    address: "",
    area: "",
    category_id: preselectedCategoryId || "",
    image_url: "",
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `services/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) { toast({ title: "আপলোড ব্যর্থ", variant: "destructive" }); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
    setForm({ ...form, image_url: urlData.publicUrl });
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast({ title: "শিরোনাম দিন", variant: "destructive" }); return; }
    if (!form.category_id) { toast({ title: "ক্যাটাগরি নির্বাচন করুন", variant: "destructive" }); return; }
    setSaving(true);
    const { error } = await supabase.from("services").insert({
      title: form.title,
      description: form.description || null,
      phone: form.phone || null,
      whatsapp: form.whatsapp || null,
      address: form.address || null,
      area: form.area || null,
      category_id: form.category_id,
      image_url: form.image_url || null,
      status: "approved",
      is_featured: false,
    });
    if (error) {
      toast({ title: "সেভ ব্যর্থ হয়েছে", variant: "destructive" });
      setSaving(false);
      return;
    }
    if (logActivity) await logActivity("created", "services", undefined, form.title);
    toast({ title: "সেবা সফলভাবে যোগ হয়েছে ✅" });
    setSaving(false);
    onSaved();
    onClose();
  };

  const selectedCat = categories.find(c => c.id === form.category_id);

  return (
    <div className="bg-card border-2 border-primary/20 rounded-2xl p-5 space-y-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Plus className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">
              নতুন সেবা যোগ করুন
            </h2>
            {selectedCat && (
              <p className="text-[10px] text-primary font-semibold">{selectedCat.name}</p>
            )}
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <input
        className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
        placeholder="সেবার নাম / শিরোনাম *"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />

      <select
        className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40 transition-all"
        value={form.category_id}
        onChange={(e) => setForm({ ...form, category_id: e.target.value })}
      >
        <option value="">ক্যাটাগরি নির্বাচন করুন *</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <textarea
        className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none min-h-[80px] focus:border-primary/40 focus:ring-2 focus:ring-primary/10 resize-none transition-all"
        placeholder="বিবরণ (ঐচ্ছিক)"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <div className="grid grid-cols-2 gap-2">
        <input
          className="bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40 transition-all"
          placeholder="📞 ফোন"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          className="bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40 transition-all"
          placeholder="💬 WhatsApp"
          value={form.whatsapp}
          onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
        />
      </div>

      <input
        className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40 transition-all"
        placeholder="📍 ঠিকানা"
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
      />

      <input
        className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40 transition-all"
        placeholder="এলাকা (ঐচ্ছিক)"
        value={form.area}
        onChange={(e) => setForm({ ...form, area: e.target.value })}
      />

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

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        <Save className="w-4 h-4" /> {saving ? "সেভ হচ্ছে..." : "সেবা যোগ করুন"}
      </button>
    </div>
  );
};

export default AddServiceForm;
