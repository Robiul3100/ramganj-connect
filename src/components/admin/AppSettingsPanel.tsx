import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Save, RefreshCw, Globe, Type, FileText, Image as ImageIcon,
  Smartphone, Upload, Loader2, ExternalLink
} from "lucide-react";

interface AppSettings {
  app_title: string;
  app_description: string;
  og_image: string;
  pwa_icon: string;
  app_short_name: string;
  app_theme_color: string;
}

const DEFAULT: AppSettings = {
  app_title: "রামগঞ্জ সিটি",
  app_description: "আধুনিকতার ছোঁয়ায় রামগঞ্জ",
  og_image: "",
  pwa_icon: "",
  app_short_name: "রামগঞ্জ সিটি",
  app_theme_color: "#2680EB",
};

const SETTING_KEYS = Object.keys(DEFAULT) as (keyof AppSettings)[];

const AppSettingsPanel = () => {
  const [form, setForm] = useState<AppSettings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const { data } = await (supabase.from as any)("site_settings")
      .select("key, value")
      .in("key", SETTING_KEYS);
    if (data) {
      const map: Record<string, string> = {};
      (data as { key: string; value: string }[]).forEach((s) => {
        map[s.key] = s.value;
      });
      setForm((prev) => ({
        ...prev,
        ...Object.fromEntries(SETTING_KEYS.map((k) => [k, map[k] || prev[k]])),
      }));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    const upserts = SETTING_KEYS.map((key) => ({
      key,
      value: form[key],
    }));

    const { error } = await (supabase.from as any)("site_settings").upsert(upserts, {
      onConflict: "key",
    });

    if (error) {
      toast({ title: "সেভ ব্যর্থ হয়েছে", variant: "destructive" });
    } else {
      toast({ title: "✅ অ্যাপ সেটিংস সেভ হয়েছে!" });
    }
    setSaving(false);
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "og_image" | "pwa_icon"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(field);
    const ext = file.name.split(".").pop();
    const fileName = `${field}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("media")
      .upload(fileName, file, { upsert: true });

    if (error) {
      toast({ title: "আপলোড ব্যর্থ", variant: "destructive" });
      setUploading(null);
      return;
    }

    const { data: urlData } = supabase.storage.from("media").getPublicUrl(fileName);
    setForm((prev) => ({ ...prev, [field]: urlData.publicUrl }));
    toast({ title: "✅ আপলোড সফল!" });
    setUploading(null);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mb-2" />
            <div className="h-3 bg-muted rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  const fields: {
    key: keyof AppSettings;
    label: string;
    description: string;
    icon: React.ReactNode;
    type: "text" | "textarea" | "color" | "image";
    placeholder?: string;
  }[] = [
    {
      key: "app_title",
      label: "অ্যাপ টাইটেল",
      description: "ব্রাউজার ট্যাব ও SEO টাইটেল",
      icon: <Type className="w-5 h-5" />,
      type: "text",
      placeholder: "রামগঞ্জ সিটি",
    },
    {
      key: "app_short_name",
      label: "শর্ট নেম (PWA)",
      description: "মোবাইলে হোম স্ক্রিনে এই নাম দেখাবে",
      icon: <Smartphone className="w-5 h-5" />,
      type: "text",
      placeholder: "রামগঞ্জ সিটি",
    },
    {
      key: "app_description",
      label: "SEO ডেসক্রিপশন",
      description: "সার্চ ইঞ্জিন ও সোশ্যাল মিডিয়া শেয়ারে দেখাবে",
      icon: <FileText className="w-5 h-5" />,
      type: "textarea",
      placeholder: "আধুনিকতার ছোঁয়ায় রামগঞ্জ",
    },
    {
      key: "app_theme_color",
      label: "থিম কালার",
      description: "মোবাইল ব্রাউজার ও PWA এর স্ট্যাটাস বার রঙ",
      icon: <Globe className="w-5 h-5" />,
      type: "color",
    },
    {
      key: "og_image",
      label: "Open Graph ইমেজ",
      description: "ফেসবুক, টুইটার ইত্যাদিতে শেয়ার করলে এই ছবি দেখাবে",
      icon: <ImageIcon className="w-5 h-5" />,
      type: "image",
    },
    {
      key: "pwa_icon",
      label: "PWA আইকন",
      description: "মোবাইলে অ্যাপ ইনস্টল করলে এই আইকন দেখাবে (512x512 PNG)",
      icon: <Smartphone className="w-5 h-5" />,
      type: "image",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" /> অ্যাপ ও SEO সেটিংস
        </h2>
        <button
          onClick={fetchSettings}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> রিফ্রেশ
        </button>
      </div>

      {fields.map((f) => (
        <div
          key={f.key}
          className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5 space-y-3"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              {f.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-foreground">{f.label}</h3>
              <p className="text-[10px] text-muted-foreground">{f.description}</p>
            </div>
          </div>

          {f.type === "text" && (
            <input
              type="text"
              className="w-full bg-muted/50 rounded-xl px-4 py-2.5 text-sm border border-border outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
              value={form[f.key]}
              onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
            />
          )}

          {f.type === "textarea" && (
            <textarea
              className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none min-h-[70px] focus:border-primary/40 focus:ring-2 focus:ring-primary/10 resize-none transition-all"
              value={form[f.key]}
              onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
            />
          )}

          {f.type === "color" && (
            <div className="flex items-center gap-3">
              <input
                type="color"
                className="w-12 h-10 rounded-lg border border-border cursor-pointer"
                value={form[f.key]}
                onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
              />
              <input
                type="text"
                className="flex-1 bg-muted/50 rounded-xl px-4 py-2.5 text-sm border border-border outline-none font-mono"
                value={form[f.key]}
                onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
              />
            </div>
          )}

          {f.type === "image" && (
            <div className="space-y-2">
              {form[f.key] && (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-border bg-muted">
                  <img
                    src={form[f.key]}
                    alt={f.label}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <label className="flex items-center gap-2 cursor-pointer text-xs text-primary hover:underline">
                {uploading === f.key ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {uploading === f.key ? "আপলোড হচ্ছে..." : "ছবি আপলোড করুন"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, f.key as "og_image" | "pwa_icon")}
                  disabled={uploading === f.key}
                />
              </label>
              {form[f.key] && (
                <input
                  type="text"
                  className="w-full bg-muted/50 rounded-xl px-4 py-2 text-xs border border-border outline-none font-mono text-muted-foreground"
                  value={form[f.key]}
                  onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  placeholder="URL"
                />
              )}
            </div>
          )}
        </div>
      ))}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        {saving ? "সেভ হচ্ছে..." : "সব সেটিংস সেভ করুন"}
      </button>

      <div className="bg-muted/30 border border-border/50 rounded-2xl p-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          💡 <strong>টিপস:</strong> সেটিংস সেভ করার পরে ব্রাউজার রিফ্রেশ করলে নতুন টাইটেল ও SEO ইনফো দেখা যাবে।
          PWA আইকন পরিবর্তনের জন্য অ্যাপ রি-ইনস্টল করতে হতে পারে।
        </p>
      </div>
    </div>
  );
};

export default AppSettingsPanel;
