import { useState, useEffect, useRef } from "react";
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetch = async () => {
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

  // Auto-scroll RIGHT (starts from right, scrolls left to reveal)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || services.length <= 1) return;

    // Start scrolled to the end
    el.scrollLeft = el.scrollWidth - el.clientWidth;

    const interval = setInterval(() => {
      if (el.scrollLeft <= 2) {
        el.scrollTo({ left: el.scrollWidth - el.clientWidth, behavior: "smooth" });
      } else {
        el.scrollBy({ left: -220, behavior: "smooth" });
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [services]);

  if (services.length === 0) return null;

  return (
    <section className="px-4">
      <div className="flex items-center gap-2 mb-3">
        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
        <h2 className="text-lg font-bold text-foreground">ফিচার্ড সেবা</h2>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {services.map((s) => (
          <div key={s.id} className="glass-card overflow-hidden min-w-[220px] max-w-[220px] snap-start shrink-0 border-t-4 border-t-amber-400 flex flex-col">
            {/* Content area matching news card height */}
            <div className="p-3 flex flex-col flex-1">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground text-xs leading-snug line-clamp-2">{s.title}</h3>
                  <span className="text-[10px] text-muted-foreground">{s.service_categories?.name || ""}</span>
                </div>
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0 mt-0.5" />
              </div>
              {s.address && (
                <p className="text-[10px] text-muted-foreground flex items-center gap-1 mb-1.5">
                  <MapPin className="w-2.5 h-2.5 shrink-0" /> <span className="line-clamp-1">{s.address}</span>
                </p>
              )}
              {s.description && <p className="text-[10px] text-muted-foreground mb-2 line-clamp-2">{s.description}</p>}
              <div className="flex gap-2 mt-auto">
                {s.phone && (
                  <a href={`tel:${s.phone}`} className="flex-1 py-1.5 rounded-xl bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center gap-1">
                    <Phone className="w-3 h-3" /> কল
                  </a>
                )}
                {s.whatsapp && (
                  <a href={`https://wa.me/88${s.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex-1 py-1.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1" style={{ background: "hsl(140,70%,45%)", color: "white" }}>
                    <MessageCircle className="w-3 h-3" /> WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedServices;
