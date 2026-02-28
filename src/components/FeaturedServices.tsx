import { useState, useEffect } from "react";
import { Star, Phone, MessageCircle, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FeaturedService {
  id: string;
  title: string;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  description: string | null;
  service_categories: { name: string } | null;
}

const FeaturedServices = () => {
  const [services, setServices] = useState<FeaturedService[]>([]);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: setting } = await (supabase.from as any)("site_settings")
        .select("value").eq("key", "featured_services_enabled").single();
      if (setting?.value === "false") { setEnabled(false); return; }
      setEnabled(true);
      const { data } = await supabase
        .from("services")
        .select("id, title, phone, whatsapp, address, description, service_categories(name)")
        .eq("status", "approved")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(10);
      setServices((data as FeaturedService[]) || []);
    };
    fetch();

    const ch = supabase.channel("featured_rt").on("postgres_changes", { event: "*", schema: "public", table: "services" }, () => fetch()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  if (!enabled || services.length === 0) return null;

  const items = [...services, ...services];

  return (
    <section className="px-4">
      <div className="flex items-center gap-2 mb-3">
        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
        <h2 className="text-lg font-bold text-foreground">ফিচার্ড সেবা</h2>
      </div>

      <div className="overflow-hidden -mx-4 px-4">
        <div className="flex gap-3 marquee-right" style={{ width: "max-content" }}>
          {items.map((s, i) => (
            <div
              key={`${s.id}-${i}`}
              className="glass-card overflow-hidden w-[200px] shrink-0 border-t-3 border-t-amber-400 flex flex-col group transition-all duration-200 hover:scale-[1.03] hover:shadow-lg"
            >
              <div className="p-2.5 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-1.5 mb-1">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground text-[11px] leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200">{s.title}</h3>
                    <span className="text-[9px] text-muted-foreground">{s.service_categories?.name || ""}</span>
                  </div>
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0 mt-0.5" />
                </div>
                {s.address && (
                  <p className="text-[9px] text-muted-foreground flex items-center gap-1 mb-1">
                    <MapPin className="w-2.5 h-2.5 shrink-0" /> <span className="line-clamp-1">{s.address}</span>
                  </p>
                )}
                {s.description && <p className="text-[9px] text-muted-foreground mb-1.5 line-clamp-2">{s.description}</p>}
                <div className="flex gap-1.5 mt-auto">
                  {s.phone && (
                    <a href={`tel:${s.phone}`} className="flex-1 py-1.5 rounded-lg bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform">
                      <Phone className="w-2.5 h-2.5" /> কল
                    </a>
                  )}
                  {s.whatsapp && (
                    <a href={`https://wa.me/88${s.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex-1 py-1.5 rounded-lg text-[9px] font-bold flex items-center justify-center gap-1 bg-[hsl(140,70%,45%)] text-white active:scale-95 transition-transform">
                      <MessageCircle className="w-2.5 h-2.5" /> WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedServices;
