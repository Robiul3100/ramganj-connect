import { useState, useEffect } from "react";
import { Search, Phone, MapPin, Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import SubmitFormDialog from "@/components/SubmitFormDialog";

interface Shop {
  id: string;
  name: string;
  category: string;
  location: string | null;
  phone: string | null;
}

const Shops = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await (supabase.from as any)("shops").select("*").eq("is_approved", true).order("created_at", { ascending: false });
      if (data) setShops(data);
    };
    fetch();
    const ch = supabase.channel("shops_rt").on("postgres_changes", { event: "*", schema: "public", table: "shops" }, () => fetch()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const filtered = shops.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = async (data: Record<string, string>) => {
    await (supabase.from as any)("shops").insert({
      name: data.name,
      category: data.category || "সাধারণ",
      location: data.location || null,
      phone: data.phone || null,
    });
  };

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto">
      <PageHeader title="দোকান" color="linear-gradient(135deg, hsl(330,55%,50%), hsl(340,60%,55%))" onAdd={() => setShowForm(true)} />
      
      <div className="px-4 -mt-2 space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input type="text" placeholder="দোকান খুঁজুন..." className="search-input pl-12" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="space-y-3 pb-6">
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">কোন তথ্য নেই</p>}
          {filtered.map((shop) => (
            <div key={shop.id} className="glass-card p-4 flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "hsl(330, 55%, 92%)" }}>
                <Store className="w-6 h-6" style={{ color: "hsl(330, 55%, 50%)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground">{shop.name}</h3>
                {shop.location && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {shop.location}
                  </p>
                )}
                <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block" style={{ background: "hsl(330, 55%, 92%)", color: "hsl(330, 55%, 40%)" }}>
                  {shop.category}
                </span>
              </div>
              {shop.phone && (
                <a href={`tel:${shop.phone}`} className="w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: "hsl(330, 55%, 85%)" }}>
                  <Phone className="w-5 h-5" style={{ color: "hsl(330, 55%, 50%)" }} />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      <SubmitFormDialog
        open={showForm} onClose={() => setShowForm(false)}
        title="তথ্য যোগ করুন" subtitle="নিরাপত্তা যাচাই প্রয়োজন"
        headerColor="linear-gradient(135deg, hsl(330,55%,50%), hsl(340,60%,55%))"
        fields={[
          { name: "name", label: "দোকানের নাম", required: true },
          { name: "category", label: "ক্যাটাগরি", type: "select", options: ["সুপার শপ", "কাপড়ের দোকান", "ইলেকট্রনিক্স", "দর্জি", "ফার্নিচার", "বইয়ের দোকান", "মুদি দোকান", "সাধারণ"] },
          { name: "location", label: "ঠিকানা" },
          { name: "phone", label: "ফোন নাম্বার", type: "tel" },
        ]}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Shops;
