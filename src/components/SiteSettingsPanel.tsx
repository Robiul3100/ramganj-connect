import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Megaphone, RefreshCw, ToggleLeft, ToggleRight, Wrench, Save, Shield } from "lucide-react";

interface Setting {
  key: string;
  value: string;
}

const SiteSettingsPanel = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [maintenanceMsg, setMaintenanceMsg] = useState("");
  const [savingMsg, setSavingMsg] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await (supabase.from as any)("site_settings").select("key, value");
    if (data) {
      const map: Record<string, string> = {};
      (data as Setting[]).forEach((s) => { map[s.key] = s.value; });
      setSettings(map);
      setMaintenanceMsg(map["maintenance_message"] || "");
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

  const saveMaintenanceMsg = async () => {
    setSavingMsg(true);
    const { error } = await (supabase.from as any)("site_settings")
      .upsert({ key: "maintenance_message", value: maintenanceMsg }, { onConflict: "key" });
    if (error) {
      toast({ title: "ব্যর্থ হয়েছে", variant: "destructive" });
    } else {
      setSettings((prev) => ({ ...prev, maintenance_message: maintenanceMsg }));
      toast({ title: "ম্যাসেজ সেভ হয়েছে ✅" });
    }
    setSavingMsg(false);
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
      key: "maintenance_mode",
      label: "মেইনটেন্যান্স মোড",
      description: "চালু করলে সাইট ভিজিটরদের জন্য বন্ধ থাকবে, শুধু অ্যাডমিন প্যানেল চলবে",
      icon: <Wrench className="w-5 h-5" />,
      color: "from-red-500/10 to-rose-500/10",
      iconColor: "text-red-500",
    },
  ];

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" /> সাইট সেটিং
        </h2>
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
            className={`bg-card/80 backdrop-blur-sm border rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-all ${
              config.key === "maintenance_mode" && isEnabled ? "border-red-500/40 shadow-red-500/5" : "border-border/50"
            }`}
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center shrink-0 ${config.iconColor}`}>
              {config.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-foreground">{config.label}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{config.description}</p>
              <span className={`inline-block mt-1.5 text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                isEnabled
                  ? config.key === "maintenance_mode" 
                    ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground"
              }`}>
                {isEnabled ? (config.key === "maintenance_mode" ? "🔴 সাইট বন্ধ" : "✅ চালু") : "⏸ বন্ধ"}
              </span>
            </div>
            <button
              onClick={() => toggleSetting(config.key, settings[config.key] || "false")}
              disabled={isSaving}
              className="shrink-0 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isEnabled ? (
                <ToggleRight className={`w-9 h-9 ${config.key === "maintenance_mode" ? "text-red-500" : "text-primary"}`} />
              ) : (
                <ToggleLeft className="w-9 h-9 text-muted-foreground" />
              )}
            </button>
          </div>
        );
      })}

      {/* Maintenance Message Editor */}
      <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Wrench className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground">মেইনটেন্যান্স ম্যাসেজ</h3>
            <p className="text-[10px] text-muted-foreground">সাইট বন্ধ থাকলে ভিজিটরদের এই ম্যাসেজ দেখানো হবে</p>
          </div>
        </div>
        <textarea
          className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none min-h-[80px] focus:border-primary/40 focus:ring-2 focus:ring-primary/10 resize-none transition-all"
          value={maintenanceMsg}
          onChange={(e) => setMaintenanceMsg(e.target.value)}
          placeholder="মেইনটেন্যান্স ম্যাসেজ লিখুন..."
        />
        <button
          onClick={saveMaintenanceMsg}
          disabled={savingMsg}
          className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {savingMsg ? "সেভ হচ্ছে..." : "ম্যাসেজ সেভ করুন"}
        </button>
      </div>

      <div className="bg-muted/30 border border-border/50 rounded-2xl p-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          💡 <strong>টিপস:</strong> মেইনটেন্যান্স মোড চালু করলে অ্যাডমিন প্যানেল ছাড়া পুরো সাইট বন্ধ হয়ে যাবে।
          সেটিংস রিয়েলটাইমে কার্যকর হয়।
        </p>
      </div>
    </div>
  );
};

export default SiteSettingsPanel;
