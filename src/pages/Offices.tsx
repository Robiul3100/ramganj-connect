import { useState, useEffect } from "react";
import { Building2, Phone, MapPin, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import PageAdBanner from "@/components/PageAdBanner";
import BottomNav from "@/components/BottomNav";

interface Office {
  id: string;
  name: string;
  designation: string | null;
  phone: string | null;
  address: string | null;
  category: string;
  description: string | null;
  visiting_hours: string | null;
}

const categoryColors: Record<string, string> = {
  "সরকারি": "from-blue-500 to-indigo-500",
  "আধা-সরকারি": "from-emerald-500 to-teal-500",
  "স্বায়ত্তশাসিত": "from-amber-500 to-orange-500",
  "বেসরকারি": "from-violet-500 to-purple-500",
};

const OfficeSkeleton = () => (
  <div className="glass-card overflow-hidden">
    <div className="h-1.5 skeleton-shimmer" />
    <div className="p-4">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl skeleton-shimmer shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded-md skeleton-shimmer" />
          <div className="h-3 w-1/2 rounded skeleton-shimmer" />
          <div className="h-5 w-16 rounded-full skeleton-shimmer" />
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-3 w-2/3 rounded skeleton-shimmer" />
        <div className="h-3 w-1/2 rounded skeleton-shimmer" />
      </div>
      <div className="h-10 w-full rounded-xl skeleton-shimmer mt-3" />
    </div>
  </div>
);

const Offices = () => {
  const [offices, setOffices] = useState<Office[]>([]);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await (supabase.from as any)("offices")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (data) setOffices(data);
      setLoading(false);
    };
    fetch();

    const ch = supabase
      .channel("offices_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "offices" }, () => fetch())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const categories = [...new Set(offices.map((o) => o.category))];

  const filtered = offices.filter((o) => {
    const matchCat = !selectedCat || o.category === selectedCat;
    return matchCat;
  });

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto pb-20">
      <PageHeader title="অফিস ডিরেক্টরি" color="linear-gradient(135deg, hsl(160,70%,45%), hsl(180,80%,40%))" />

      <div className="px-4 -mt-2 space-y-4">
        {/* Ad Banner */}
        <PageAdBanner pageSlug="offices" />

        {!loading && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button onClick={() => setSelectedCat(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${!selectedCat ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
              সব
            </button>
            {categories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCat(cat === selectedCat ? null : cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${cat === selectedCat ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-3 pb-6">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <OfficeSkeleton key={i} />)
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">কোনো অফিস পাওয়া যায়নি</p>
            </div>
          ) : (
            filtered.map((office) => {
              const gradient = categoryColors[office.category] || "from-gray-500 to-slate-500";
              return (
                <div key={office.id} className="glass-card overflow-hidden">
                  <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}>
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground text-sm">{office.name}</h3>
                        {office.designation && <p className="text-xs text-muted-foreground">{office.designation}</p>}
                        <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{office.category}</span>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1.5">
                      {office.address && <p className="flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="w-3.5 h-3.5 shrink-0" /> {office.address}</p>}
                      {office.visiting_hours && <p className="flex items-center gap-2 text-xs text-muted-foreground"><Clock className="w-3.5 h-3.5 shrink-0" /> {office.visiting_hours}</p>}
                      {office.description && <p className="text-xs text-muted-foreground mt-1">{office.description}</p>}
                    </div>
                    {office.phone && (
                      <a href={`tel:${office.phone}`} className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors">
                        <Phone className="w-4 h-4" /> কল করুন — {office.phone}
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Offices;
