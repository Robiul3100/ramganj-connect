import { useState, useEffect } from "react";
import { Phone, MapPin, Share2, MessageCircle, Star, BookOpen, GraduationCap, Calendar, DollarSign, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import SubmitFormDialog from "@/components/SubmitFormDialog";
import PageAdBanner from "@/components/PageAdBanner";
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

const colors = {
  gradient: "linear-gradient(135deg, hsl(170,50%,42%), hsl(180,55%,48%))",
  accent: "hsl(170,50%,42%)",
};

const TuitionMedia = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  
  const [filter, setFilter] = useState<"all" | "teach" | "need">("all");
  const [showTeachForm, setShowTeachForm] = useState(false);
  const [showNeedForm, setShowNeedForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: cat } = await supabase.from("service_categories").select("id").eq("slug", "tuition").single();
      if (!cat) { setLoading(false); return; }
      setCategoryId((cat as any).id);
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("category_id", (cat as any).id)
        .eq("status", "approved")
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });
      setServices((data as Service[]) || []);
      setLoading(false);
    };
    fetchData();

    const ch = supabase.channel("tuition_services").on("postgres_changes", { event: "*", schema: "public", table: "services" }, () => fetchData()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const filtered = services.filter(s => {
    const m = s.metadata || {};
    if (filter === "teach" && m.tuition_type !== "teach") return false;
    if (filter === "need" && m.tuition_type !== "need") return false;
    return true;
  });

  const handleShare = (s: Service) => {
    if (navigator.share) navigator.share({ title: s.title, text: `${s.title} - ${s.address || ""}`, url: window.location.href });
  };

  const handleSubmit = (type: "teach" | "need") => async (data: Record<string, string>) => {
    if (!categoryId) return;
    await supabase.from("services").insert({
      title: data.title,
      description: data.description || null,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      address: data.address || null,
      area: data.area || null,
      image_url: data.image_url || null,
      category_id: categoryId,
      metadata: {
        tuition_type: type,
        class_for: data.class_for || null,
        subject: data.subject || null,
        days_per_week: data.days_per_week || null,
        salary: data.salary || null,
        gender: data.gender || null,
      },
    });
  };

  const teachFields = [
    { name: "title", label: "টাইটেল লিখুন", required: true, placeholder: "যেমন: ইংরেজি ও গণিত শিক্ষক" },
    { name: "class_for", label: "কোন শ্রেণীর জন্য", placeholder: "যেমন: ১ম - ৫ম শ্রেণী" },
    { name: "subject", label: "কোন সাবজেক্টের", placeholder: "যেমন: ইংরেজি, গণিত" },
    { name: "days_per_week", label: "সপ্তাহে কত দিন পড়াবেন", placeholder: "যেমন: ৫ দিন" },
    { name: "salary", label: "বেতন কত নিবেন", placeholder: "যেমন: ৩০০০ টাকা" },
    { name: "area", label: "এলাকা", type: "select" as const, options: ["রামগঞ্জ সদর", "লক্ষ্মীপুর", "রায়পুর", "কমলনগর", "অন্যান্য"] },
    { name: "address", label: "ঠিকানা", placeholder: "বিস্তারিত ঠিকানা" },
    { name: "phone", label: "মোবাইল নাম্বার", type: "tel" as const, required: true },
    { name: "gender", label: "লিঙ্গ", type: "select" as const, options: ["পুরুষ", "মহিলা", "যেকোনো"] },
    { name: "image_url", label: "ছবির লিংক (URL)", placeholder: "https://example.com/photo.jpg" },
  ];

  const needFields = [
    { name: "title", label: "টাইটেল লিখুন", required: true, placeholder: "যেমন: ক্লাস ৫ এর জন্য শিক্ষক দরকার" },
    { name: "class_for", label: "কোন শ্রেণীর জন্য", placeholder: "যেমন: ৫ম শ্রেণী" },
    { name: "subject", label: "কোন সাবজেক্টের জন্য", placeholder: "যেমন: বিজ্ঞান, ইংরেজি" },
    { name: "days_per_week", label: "সপ্তাহে কত দিন পড়াবে", placeholder: "যেমন: ৪ দিন" },
    { name: "salary", label: "বেতন কত দিবেন", placeholder: "যেমন: ২৫০০ টাকা" },
    { name: "area", label: "এলাকা", type: "select" as const, options: ["রামগঞ্জ সদর", "লক্ষ্মীপুর", "রায়পুর", "কমলনগর", "অন্যান্য"] },
    { name: "address", label: "ঠিকানা", placeholder: "বিস্তারিত ঠিকানা" },
    { name: "phone", label: "মোবাইল নাম্বার", type: "tel" as const, required: true },
    { name: "gender", label: "লিঙ্গ (শিক্ষক)", type: "select" as const, options: ["পুরুষ", "মহিলা", "যেকোনো"] },
  ];

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto pb-20">
      <PageHeader title="টিউশন মিডিয়া" color={colors.gradient} />

      <div className="px-4 -mt-2 space-y-3">
        {/* Two action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowTeachForm(true)}
            className="py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
            style={{ background: "linear-gradient(135deg, hsl(170,50%,42%), hsl(160,55%,48%))" }}
          >
            <GraduationCap className="w-5 h-5" /> পড়াতে চাই
          </button>
          <button
            onClick={() => setShowNeedForm(true)}
            className="py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
            style={{ background: "linear-gradient(135deg, hsl(200,60%,45%), hsl(210,65%,50%))" }}
          >
            <BookOpen className="w-5 h-5" /> শিক্ষক চাই
          </button>
        </div>

        {/* Ad Banner */}
        <PageAdBanner pageSlug="tuition" />

        {/* Filter tabs */}
        <div className="flex gap-2">
          {([["all", "সব"], ["teach", "পড়াতে চায়"], ["need", "শিক্ষক চায়"]] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${filter === key ? "text-white shadow-md" : "bg-muted text-foreground"}`}
              style={filter === key ? { background: colors.gradient } : {}}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden border border-border">
                <div className="flex items-center gap-4 p-4">
                  <div className="w-16 h-16 rounded-full skeleton-shimmer shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-3/4 skeleton-shimmer rounded-lg" />
                    <div className="h-3 w-1/2 skeleton-shimmer rounded-lg" />
                    <div className="h-3 w-2/3 skeleton-shimmer rounded-lg" />
                  </div>
                </div>
                <div className="px-4 pb-3 space-y-2">
                  <div className="h-8 skeleton-shimmer rounded-xl" />
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-6 skeleton-shimmer rounded-lg" />
                    <div className="h-6 skeleton-shimmer rounded-lg" />
                    <div className="h-6 skeleton-shimmer rounded-lg" />
                  </div>
                </div>
                <div className="flex gap-2 p-4 pt-0">
                  <div className="flex-1 h-10 skeleton-shimmer rounded-xl" />
                  <div className="flex-1 h-10 skeleton-shimmer rounded-xl" />
                  <div className="w-10 h-10 skeleton-shimmer rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <GraduationCap className="w-16 h-16 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground font-medium">কোন টিউটর তথ্য পাওয়া যায়নি</p>
            <p className="text-xs text-muted-foreground mt-1">উপরের বাটন থেকে তথ্য জমা দিন</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 pb-6">
            {filtered.map((s) => {
              const m = s.metadata || {};
              const isTeach = m.tuition_type === "teach";
              const typeColor = isTeach ? "hsl(170,50%,42%)" : "hsl(200,60%,45%)";
              const typeLabel = isTeach ? "পড়াতে চাই" : "শিক্ষক চাই";
              const dateStr = new Date(s.created_at).toLocaleDateString("bn-BD");

              return (
                <div key={s.id} className={`glass-card rounded-2xl overflow-hidden border transition-shadow hover:shadow-lg ${s.is_featured ? "ring-2 ring-amber-400/30" : ""}`} style={{ borderColor: typeColor + "33" }}>
                  {/* Header with photo */}
                  <div className="p-4 pb-3">
                    <div className="flex items-start gap-3">
                      {s.image_url ? (
                        <img src={s.image_url} alt={s.title} className="w-16 h-16 rounded-full object-cover shrink-0 border-2" style={{ borderColor: typeColor }} />
                      ) : (
                        <div className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 text-xl font-bold border-2 bg-muted" style={{ color: typeColor, borderColor: typeColor }}>
                          {s.title.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white" style={{ background: typeColor }}>
                            {isTeach ? <GraduationCap className="w-3 h-3 inline mr-1" /> : <BookOpen className="w-3 h-3 inline mr-1" />}
                            {typeLabel}
                          </span>
                          {s.is_featured && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> ফিচার্ড
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-foreground text-base leading-tight">{s.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">তারিখ: {dateStr}</p>
                      </div>
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="px-4 pb-3">
                    <div className="rounded-xl p-3 space-y-2 bg-muted/50">
                      {s.description && (
                        <p className="text-sm text-foreground font-medium text-center mb-2">{s.description}</p>
                      )}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                        {m.class_for && (
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 shrink-0" style={{ color: typeColor }} />
                            <span className="text-foreground"><strong>শ্রেণী:</strong> {m.class_for}</span>
                          </div>
                        )}
                        {m.subject && (
                          <div className="flex items-center gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5 shrink-0" style={{ color: typeColor }} />
                            <span className="text-foreground"><strong>সাবজেক্ট:</strong> {m.subject}</span>
                          </div>
                        )}
                        {m.days_per_week && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: typeColor }} />
                            <span className="text-foreground"><strong>দিন:</strong> {m.days_per_week}</span>
                          </div>
                        )}
                        {m.salary && (
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5 shrink-0" style={{ color: typeColor }} />
                            <span className="text-foreground"><strong>বেতন:</strong> {m.salary}</span>
                          </div>
                        )}
                        {m.gender && (
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 shrink-0" style={{ color: typeColor }} />
                            <span className="text-foreground"><strong>লিঙ্গ:</strong> {m.gender}</span>
                          </div>
                        )}
                        {s.address && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: typeColor }} />
                            <span className="text-foreground truncate">{s.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 px-4 pb-4">
                    {s.phone && (
                      <a href={`tel:${s.phone}`} className="flex-1 py-2.5 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5" style={{ background: typeColor }}>
                        <Phone className="w-3.5 h-3.5" /> কল করুন
                      </a>
                    )}
                    {s.whatsapp && (
                      <a href={`https://wa.me/88${s.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5" style={{ background: "hsl(140,70%,45%)", color: "white" }}>
                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                      </a>
                    )}
                    <button onClick={() => handleShare(s)} className="px-3 py-2.5 rounded-xl border border-border text-xs font-medium flex items-center justify-center">
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* পড়াতে চাই form */}
      <SubmitFormDialog
        open={showTeachForm}
        onClose={() => setShowTeachForm(false)}
        title="পড়াতে চাই"
        subtitle="আপনার টিউটর তথ্য জমা দিন"
        headerColor={colors.gradient}
        fields={teachFields}
        onSubmit={handleSubmit("teach")}
      />

      {/* শিক্ষক চাই form */}
      <SubmitFormDialog
        open={showNeedForm}
        onClose={() => setShowNeedForm(false)}
        title="শিক্ষক চাই"
        subtitle="আপনার শিক্ষক প্রয়োজন জমা দিন"
        headerColor="linear-gradient(135deg, hsl(200,60%,45%), hsl(210,65%,50%))"
        fields={needFields}
        onSubmit={handleSubmit("need")}
      />

      <BottomNav />
    </div>
  );
};

export default TuitionMedia;
