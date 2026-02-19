import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Moon, Megaphone, RefreshCw, ToggleLeft, ToggleRight } from "lucide-react";

interface Setting {
  key: string;
  value: string;
}

const SiteSettingsPanel = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await (supabase.from as any)("site_settings").select("key, value");
    if (data) {
      const map: Record<string, string> = {};
      (data as Setting[]).forEach((s) => { map[s.key] = s.value; });
      setSettings(map);
    }
    setLoading(false);
  };

  useEffect(() => { fetchSettings(); }, []);

  const toggleSetting = async (key: string, currentValue: string) => {
    const newValue = currentValue === "true" ? "false" : "true";
    setSaving(key);
    const { error } = await (supabase.from as any)("site_settings")
      .upsert({ key, value: newValue }, { onConflict: "key" });
    if (error) {
      toast({ title: "ব্যর্থ হয়েছে", variant: "destructive" });
    } else {
      setSettings((prev) => ({ ...prev, [key]: newValue }));
      toast({ title: newValue === "true" ? "✅ চালু করা হয়েছে" : "⏸ বন্ধ করা হয়েছে" });
    }
    setSaving(null);
  };

  const configs = [
    {
      key: "announcement_bar_enabled",
      label: "নোটিশ বার (Marquee)",
      description: "হিরো সেকশনের নিচে স্ক্রলিং নোটিশ বার দেখানো হবে",
      icon: <Megaphone className="w-5 h-5" />,
      color: "from-orange-500/10 to-amber-500/10",
      iconColor: "text-orange-500",
    },
    {
      key: "ramadan_widget_enabled",
      label: "রমজান উইজেট",
      description: "হিরো স্লাইডারের নিচে রমজানের সেহরি-ইফতার টাইমার দেখানো হবে",
      icon: <Moon className="w-5 h-5" />,
      color: "from-green-500/10 to-emerald-500/10",
      iconColor: "text-green-600",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mb-2" />
            <div className="h-3 bg-muted rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-foreground">সাইট সেটিং</h2>
        <button
          onClick={fetchSettings}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> রিফ্রেশ
        </button>
      </div>

      {configs.map((config) => {
        const isEnabled = settings[config.key] === "true";
        const isSaving = saving === config.key;

        return (
          <div
            key={config.key}
            className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 hover:shadow-sm transition-all"
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center shrink-0 ${config.iconColor}`}>
              {config.icon}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-foreground">{config.label}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{config.description}</p>
              <span className={`inline-block mt-1.5 text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                isEnabled
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground"
              }`}>
                {isEnabled ? "✅ চালু" : "⏸ বন্ধ"}
              </span>
            </div>

            <button
              onClick={() => toggleSetting(config.key, settings[config.key] || "false")}
              disabled={isSaving}
              className="shrink-0 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              aria-label={isEnabled ? "বন্ধ করুন" : "চালু করুন"}
            >
              {isEnabled ? (
                <ToggleRight className="w-9 h-9 text-primary" />
              ) : (
                <ToggleLeft className="w-9 h-9 text-muted-foreground" />
              )}
            </button>
          </div>
        );
      })}

      <div className="bg-muted/30 border border-border rounded-2xl p-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          💡 <strong>টিপস:</strong> এই সেটিংস রিয়েলটাইমে কার্যকর হয় — পেজ রিলোড ছাড়াই।
          রমজান মাস শেষ হলে রমজান উইজেট বন্ধ করে রাখুন।
        </p>
      </div>
    </div>
  );
};

export default SiteSettingsPanel;
