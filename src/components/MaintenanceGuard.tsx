import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Wrench, Phone } from "lucide-react";

const MaintenanceGuard = ({ children }: { children: React.ReactNode }) => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const { data } = await (supabase.from as any)("site_settings")
        .select("key, value")
        .in("key", ["maintenance_mode", "maintenance_message"]);
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((s: any) => { map[s.key] = s.value; });
        setIsMaintenanceMode(map["maintenance_mode"] === "true");
        setMessage(map["maintenance_message"] || "সাইটটি রক্ষণাবেক্ষণের জন্য বন্ধ রয়েছে।");
      }
      setLoading(false);
    };
    check();

    // Listen for realtime changes
    const ch = supabase.channel("maintenance_check")
      .on("postgres_changes", { event: "*", schema: "public", table: "site_settings" }, () => {
        check();
      }).subscribe();

    return () => { supabase.removeChannel(ch); };
  }, []);

  if (loading) return null;

  // Allow admin routes even during maintenance
  if (isMaintenanceMode && !window.location.pathname.startsWith("/admin")) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-amber-500/10 flex items-center justify-center">
            <Wrench className="w-12 h-12 text-amber-500 animate-icon-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              রক্ষণাবেক্ষণ চলছে
            </h1>
            <p className="text-muted-foreground leading-relaxed">{message}</p>
          </div>
          <div className="glass-card p-4 space-y-2">
            <p className="text-sm font-semibold text-foreground">জরুরি প্রয়োজনে:</p>
            <a href="tel:999" className="flex items-center justify-center gap-2 text-sm text-primary font-semibold">
              <Phone className="w-4 h-4" /> ৯৯৯ (জরুরি সেবা)
            </a>
          </div>
          <p className="text-xs text-muted-foreground/60">রামগঞ্জ স্মার্ট সিটি সার্ভিস প্ল্যাটফর্ম</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default MaintenanceGuard;
