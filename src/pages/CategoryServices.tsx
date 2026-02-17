import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Search, Phone, MapPin, Share2, MessageCircle, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import SubmitFormDialog from "@/components/SubmitFormDialog";
import BottomNav from "@/components/BottomNav";

interface Service {
  id: string;
  title: string;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  area: string | null;
  image_url: string | null;
  is_featured: boolean;
  metadata: Record<string, any>;
  created_at: string;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

const categoryColors: Record<string, { gradient: string; accent: string; bg: string }> = {
  doctors: { gradient: "linear-gradient(135deg, hsl(185,60%,42%), hsl(195,65%,50%))", accent: "hsl(185,60%,42%)", bg: "hsl(185,60%,92%)" },
  hospitals: { gradient: "linear-gradient(135deg, hsl(150,60%,40%), hsl(160,55%,48%))", accent: "hsl(150,60%,40%)", bg: "hsl(150,60%,92%)" },
  pharmacy: { gradient: "linear-gradient(135deg, hsl(160,50%,45%), hsl(170,55%,50%))", accent: "hsl(160,50%,45%)", bg: "hsl(160,50%,92%)" },
  education: { gradient: "linear-gradient(135deg, hsl(120,45%,40%), hsl(140,50%,48%))", accent: "hsl(120,45%,40%)", bg: "hsl(120,45%,92%)" },
  shops: { gradient: "linear-gradient(135deg, hsl(330,55%,55%), hsl(340,60%,60%))", accent: "hsl(330,55%,55%)", bg: "hsl(330,55%,92%)" },
  marketplace: { gradient: "linear-gradient(135deg, hsl(160,50%,40%), hsl(180,60%,45%))", accent: "hsl(160,50%,40%)", bg: "hsl(160,50%,92%)" },
  jobs: { gradient: "linear-gradient(135deg, hsl(250,40%,50%), hsl(260,45%,55%))", accent: "hsl(250,40%,50%)", bg: "hsl(250,40%,92%)" },
  "lost-found": { gradient: "linear-gradient(135deg, hsl(0,60%,50%), hsl(15,65%,55%))", accent: "hsl(0,60%,50%)", bg: "hsl(0,60%,92%)" },
  events: { gradient: "linear-gradient(135deg, hsl(270,60%,55%), hsl(280,65%,60%))", accent: "hsl(270,60%,55%)", bg: "hsl(270,60%,92%)" },
  expatriate: { gradient: "linear-gradient(135deg, hsl(195,70%,50%), hsl(205,75%,55%))", accent: "hsl(195,70%,50%)", bg: "hsl(195,70%,92%)" },
  ambulance: { gradient: "linear-gradient(135deg, hsl(150,55%,45%), hsl(160,60%,50%))", accent: "hsl(150,55%,45%)", bg: "hsl(150,55%,92%)" },
  police: { gradient: "linear-gradient(135deg, hsl(265,50%,55%), hsl(275,55%,60%))", accent: "hsl(265,50%,55%)", bg: "hsl(265,50%,92%)" },
  fire: { gradient: "linear-gradient(135deg, hsl(15,80%,50%), hsl(25,85%,55%))", accent: "hsl(15,80%,50%)", bg: "hsl(15,80%,92%)" },
  transport: { gradient: "linear-gradient(135deg, hsl(220,20%,40%), hsl(230,25%,48%))", accent: "hsl(220,20%,40%)", bg: "hsl(220,20%,92%)" },
  electricity: { gradient: "linear-gradient(135deg, hsl(50,80%,45%), hsl(60,85%,50%))", accent: "hsl(50,80%,45%)", bg: "hsl(50,80%,92%)" },
  legal: { gradient: "linear-gradient(135deg, hsl(220,30%,45%), hsl(230,35%,50%))", accent: "hsl(220,30%,45%)", bg: "hsl(220,30%,92%)" },
  bank: { gradient: "linear-gradient(135deg, hsl(170,55%,40%), hsl(180,60%,48%))", accent: "hsl(170,55%,40%)", bg: "hsl(170,55%,92%)" },
  organizations: { gradient: "linear-gradient(135deg, hsl(210,50%,50%), hsl(220,55%,55%))", accent: "hsl(210,50%,50%)", bg: "hsl(210,50%,92%)" },
  tourism: { gradient: "linear-gradient(135deg, hsl(200,60%,50%), hsl(210,65%,55%))", accent: "hsl(200,60%,50%)", bg: "hsl(200,60%,92%)" },
  courier: { gradient: "linear-gradient(135deg, hsl(30,60%,50%), hsl(40,65%,55%))", accent: "hsl(30,60%,50%)", bg: "hsl(30,60%,92%)" },
  agriculture: { gradient: "linear-gradient(135deg, hsl(100,50%,42%), hsl(110,55%,48%))", accent: "hsl(100,50%,42%)", bg: "hsl(100,50%,92%)" },
  rent: { gradient: "linear-gradient(135deg, hsl(25,80%,50%), hsl(35,85%,55%))", accent: "hsl(25,80%,50%)", bg: "hsl(25,80%,92%)" },
  tuition: { gradient: "linear-gradient(135deg, hsl(170,50%,42%), hsl(180,55%,48%))", accent: "hsl(170,50%,42%)", bg: "hsl(170,50%,92%)" },
  food: { gradient: "linear-gradient(135deg, hsl(30,75%,50%), hsl(40,80%,55%))", accent: "hsl(30,75%,50%)", bg: "hsl(30,75%,92%)" },
  repair: { gradient: "linear-gradient(135deg, hsl(220,30%,45%), hsl(230,35%,50%))", accent: "hsl(220,30%,45%)", bg: "hsl(220,30%,92%)" },
  "deed-writer": { gradient: "linear-gradient(135deg, hsl(250,40%,50%), hsl(260,45%,55%))", accent: "hsl(250,40%,50%)", bg: "hsl(250,40%,92%)" },
  marriage: { gradient: "linear-gradient(135deg, hsl(340,70%,55%), hsl(350,75%,60%))", accent: "hsl(340,70%,55%)", bg: "hsl(340,70%,92%)" },
  diagnostic: { gradient: "linear-gradient(135deg, hsl(190,60%,45%), hsl(200,65%,50%))", accent: "hsl(190,60%,45%)", bg: "hsl(190,60%,92%)" },
  "car-rental": { gradient: "linear-gradient(135deg, hsl(160,55%,40%), hsl(170,60%,48%))", accent: "hsl(160,55%,40%)", bg: "hsl(160,55%,92%)" },
  municipal: { gradient: "linear-gradient(135deg, hsl(210,40%,50%), hsl(220,45%,55%))", accent: "hsl(210,40%,50%)", bg: "hsl(210,40%,92%)" },
  entrepreneur: { gradient: "linear-gradient(135deg, hsl(140,50%,42%), hsl(150,55%,48%))", accent: "hsl(140,50%,42%)", bg: "hsl(140,50%,92%)" },
  hotel: { gradient: "linear-gradient(135deg, hsl(35,70%,50%), hsl(45,75%,55%))", accent: "hsl(35,70%,50%)", bg: "hsl(35,70%,92%)" },
  restaurant: { gradient: "linear-gradient(135deg, hsl(15,70%,50%), hsl(25,75%,55%))", accent: "hsl(15,70%,50%)", bg: "hsl(15,70%,92%)" },
  video: { gradient: "linear-gradient(135deg, hsl(240,50%,55%), hsl(250,55%,60%))", accent: "hsl(240,50%,55%)", bg: "hsl(240,50%,92%)" },
  nursery: { gradient: "linear-gradient(135deg, hsl(130,50%,40%), hsl(140,55%,48%))", accent: "hsl(130,50%,40%)", bg: "hsl(130,50%,92%)" },
};

const defaultColor = { gradient: "var(--gradient-primary)", accent: "hsl(210,85%,55%)", bg: "hsl(210,85%,93%)" };

const CategoryServices = () => {
  const { slug } = useParams<{ slug: string }>();
  const [services, setServices] = useState<Service[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const colors = (slug && categoryColors[slug]) || defaultColor;

  useEffect(() => {
    if (!slug) return;

    const fetchCategory = async () => {
      const { data } = await supabase.from("service_categories").select("*").eq("slug", slug).single();
      if (data) setCategory(data as Category);
    };

    const fetchServices = async () => {
      setLoading(true);
      const { data: cat } = await supabase.from("service_categories").select("id").eq("slug", slug).single();
      if (!cat) { setLoading(false); return; }
      const { data } = await supabase.from("services").select("*").eq("category_id", (cat as any).id).eq("status", "approved").order("is_featured", { ascending: false }).order("created_at", { ascending: false });
      setServices((data as Service[]) || []);
      setLoading(false);
    };

    fetchCategory();
    fetchServices();

    const ch = supabase.channel(`services_${slug}`).on("postgres_changes", { event: "*", schema: "public", table: "services" }, () => fetchServices()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [slug]);

  const filtered = services.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    (s.description || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.address || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleShare = (service: Service) => {
    if (navigator.share) {
      navigator.share({ title: service.title, text: `${service.title} - ${service.address || ""}`, url: window.location.href });
    }
  };

  const handleSubmit = async (data: Record<string, string>) => {
    if (!category) return;
    await supabase.from("services").insert({
      title: data.title,
      description: data.description || null,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      address: data.address || null,
      area: data.area || null,
      image_url: data.image_url || null,
      category_id: category.id,
      metadata: {},
    });
  };

  const getMetaDisplay = (s: Service) => {
    const m = s.metadata || {};
    const parts: string[] = [];
    if (m.specialty) parts.push(m.specialty);
    if (m.shop_category) parts.push(m.shop_category);
    if (m.edu_category) parts.push(m.edu_category);
    if (m.price) parts.push(`💰 ${m.price}`);
    if (m.company) parts.push(`🏢 ${m.company}`);
    if (m.salary_range) parts.push(`💵 ${m.salary_range}`);
    if (m.country) parts.push(`🌍 ${m.country}`);
    if (m.type) parts.push(m.type === "lost" ? "🔴 হারিয়েছে" : "🟢 পাওয়া গেছে");
    if (m.event_date) parts.push(`📅 ${new Date(m.event_date).toLocaleDateString("bn-BD")}`);
    if (m.deadline) parts.push(`⏰ ${new Date(m.deadline).toLocaleDateString("bn-BD")}`);
    if (m.rent_amount) parts.push(`🏠 ${m.rent_amount}`);
    if (m.item_category) parts.push(m.item_category);
    if (m.event_category) parts.push(m.event_category);
    if (m.job_category) parts.push(m.job_category);
    if (m.expat_category) parts.push(m.expat_category);
    return parts;
  };

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto pb-20">
      <PageHeader title={category?.name || "সেবাসমূহ"} color={colors.gradient} onAdd={() => setShowForm(true)} />

      <div className="px-4 -mt-2 space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input type="text" placeholder="নাম, ঠিকানা দিয়ে খুঁজুন..." className="search-input pl-12" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="glass-card p-4 border-l-4 border-border">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-2xl skeleton-shimmer shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 skeleton-shimmer" />
                    <div className="h-3 w-1/2 skeleton-shimmer" />
                    <div className="flex gap-1.5 mt-1.5">
                      <div className="h-5 w-16 rounded-full skeleton-shimmer" />
                      <div className="h-5 w-20 rounded-full skeleton-shimmer" />
                    </div>
                  </div>
                </div>
                <div className="h-3 w-full skeleton-shimmer mt-3" />
                <div className="flex gap-2 mt-3">
                  <div className="flex-1 h-9 rounded-xl skeleton-shimmer" />
                  <div className="flex-1 h-9 rounded-xl skeleton-shimmer" />
                  <div className="w-10 h-9 rounded-xl skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">কোন তথ্য পাওয়া যায়নি</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-6">
            {filtered.map((s) => {
              const metaParts = getMetaDisplay(s);
              return (
                <div key={s.id} className={`glass-card p-4 border-l-4 transition-shadow hover:shadow-lg ${s.is_featured ? "ring-2 ring-amber-400/30" : ""}`} style={{ borderColor: colors.accent }}>
                  {s.is_featured && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-bold text-amber-600">ফিচার্ড</span>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    {s.image_url ? (
                      <img src={s.image_url} alt={s.title} className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-border" />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-lg font-bold" style={{ background: colors.bg, color: colors.accent }}>
                        {s.title.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground text-sm">{s.title}</h3>
                      {s.address && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 shrink-0" /> {s.address}
                        </p>
                      )}
                      {metaParts.length > 0 && (
                        <div className="flex gap-1.5 mt-1.5 flex-wrap">
                          {metaParts.map((p, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-muted text-foreground">{p}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {s.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{s.description}</p>
                  )}

                  <div className="flex gap-2 mt-3">
                    {s.phone && (
                      <a href={`tel:${s.phone}`} className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" /> কল
                      </a>
                    )}
                    {s.whatsapp && (
                      <a href={`https://wa.me/88${s.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5" style={{ background: "hsl(140,70%,45%)", color: "white" }}>
                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                      </a>
                    )}
                    <button onClick={() => handleShare(s)} className="px-3 py-2 rounded-xl border border-border text-xs font-medium flex items-center justify-center gap-1">
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <SubmitFormDialog
        open={showForm} onClose={() => setShowForm(false)}
        title="তথ্য যোগ করুন" subtitle={category?.name || ""}
        headerColor={colors.gradient}
        fields={[
          { name: "title", label: "শিরোনাম / নাম", required: true },
          { name: "description", label: "বিবরণ", type: "textarea" },
          { name: "phone", label: "ফোন নাম্বার", type: "tel" },
          { name: "whatsapp", label: "WhatsApp নাম্বার", type: "tel" },
          { name: "address", label: "ঠিকানা" },
          { name: "area", label: "এলাকা" },
          { name: "image_url", label: "ছবির লিংক (URL)", placeholder: "https://example.com/image.jpg" },
        ]}
        onSubmit={handleSubmit}
      />
      <BottomNav />
    </div>
  );
};

export default CategoryServices;
