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

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("services")
        .select("id, title, phone, whatsapp, address, description, service_categories(name)")
        .eq("status", "approved")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(6);
      setServices((data as FeaturedService[]) || []);
    };
    fetch();

    const ch = supabase.channel("featured_rt").on("postgres_changes", { event: "*", schema: "public", table: "services" }, () => fetch()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  if (services.length === 0) return null;

  return (
    <section className="px-4">
      <div className="flex items-center gap-2 mb-3">
        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
        <h2 className="text-lg font-bold text-foreground">ফিচার্ড সেবা</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
        {services.map((s) => (
          <div key={s.id} className="glass-card p-4 min-w-[260px] max-w-[280px] snap-start border-t-4 border-t-amber-400 flex flex-col">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground text-sm">{s.title}</h3>
                <span className="text-xs text-muted-foreground">{s.service_categories?.name || ""}</span>
              </div>
              <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
            </div>
            {s.address && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                <MapPin className="w-3 h-3" /> {s.address}
              </p>
            )}
            {s.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{s.description}</p>}
            <div className="flex gap-2 mt-auto">
              {s.phone && (
                <a href={`tel:${s.phone}`} className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> কল
                </a>
              )}
              {s.whatsapp && (
                <a href={`https://wa.me/88${s.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1" style={{ background: "hsl(140,70%,45%)", color: "white" }}>
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedServices;
