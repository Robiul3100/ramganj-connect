import { useState, useEffect } from "react";
import { Search, Phone, Eye, MapPin, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import SubmitFormDialog from "@/components/SubmitFormDialog";

interface MarketItem {
  id: string;
  title: string;
  description: string | null;
  price: string | null;
  location: string | null;
  phone: string | null;
  category: string;
  tags: string[] | null;
}

const Marketplace = () => {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await (supabase.from as any)("marketplace").select("*").eq("is_approved", true).order("created_at", { ascending: false });
      if (data) setItems(data);
    };
    fetch();
    const ch = supabase.channel("marketplace_rt").on("postgres_changes", { event: "*", schema: "public", table: "marketplace" }, () => fetch()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const filtered = items.filter(i => i.title.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = async (data: Record<string, string>) => {
    await (supabase.from as any)("marketplace").insert({
      title: data.title,
      category: data.category || "সাধারণ",
      price: data.price || null,
      location: data.location || null,
      phone: data.phone || null,
      description: data.description || null,
    });
  };

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto pb-6">
      <PageHeader title="মার্কেটপ্লেস" color="linear-gradient(135deg, hsl(160,50%,40%), hsl(180,60%,45%))" onAdd={() => setShowForm(true)} />
      
      <div className="px-4 -mt-2 space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input type="text" placeholder="মার্কেটপ্লেস খুঁজুন..." className="search-input pl-12" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="space-y-4 pb-6">
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">কোন তথ্য নেই</p>}
          {filtered.map((item) => (
            <div key={item.id} className="glass-card p-4 border-l-4" style={{ borderColor: "hsl(160, 50%, 40%)" }}>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "hsl(160, 50%, 92%)" }}>
                  <Tag className="w-5 h-5" style={{ color: "hsl(160, 50%, 40%)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-foreground">{item.title}</h3>
                    {item.price && <span className="text-sm font-bold text-primary shrink-0">{item.price}</span>}
                  </div>
                  {item.location && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {item.location}
                    </p>
                  )}
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-foreground">{item.category}</span>
                  </div>
                </div>
              </div>
              {item.description && (
                <div className="mt-3 bg-muted/50 rounded-xl p-3">
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <button className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium flex items-center justify-center gap-1.5">
                  <Eye className="w-4 h-4" /> বিস্তারিত
                </button>
                {item.phone && (
                  <a href={`tel:${item.phone}`} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-1.5">
                    <Phone className="w-4 h-4" /> যোগাযোগ
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <SubmitFormDialog
        open={showForm} onClose={() => setShowForm(false)}
        title="তথ্য যোগ করুন" subtitle="নিরাপত্তা যাচাই প্রয়োজন"
        headerColor="linear-gradient(135deg, hsl(160,50%,40%), hsl(180,60%,45%))"
        fields={[
          { name: "title", label: "শিরোনাম", required: true },
          { name: "category", label: "ক্যাটাগরি", type: "select", options: ["ভাড়া বাসা", "জমি বিক্রি", "গাড়ি/বাইক", "ইলেকট্রনিক্স", "সাধারণ"] },
          { name: "price", label: "মূল্য", placeholder: "যেমন: ৫,০০০ টাকা/মাস" },
          { name: "location", label: "ঠিকানা" },
          { name: "phone", label: "ফোন নাম্বার", type: "tel" },
          { name: "description", label: "বিবরণ", type: "textarea" },
        ]}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Marketplace;
