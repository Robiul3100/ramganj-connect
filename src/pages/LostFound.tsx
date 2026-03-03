import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import SubmitFormDialog from "@/components/SubmitFormDialog";
import { Search, MapPin, Calendar, Phone, ChevronDown, ChevronUp, AlertCircle, HandHeart, User, Gift, Clock, Tag, Eye, Shield, Flame, ExternalLink, Star, BadgeCheck } from "lucide-react";
import { format, differenceInHours } from "date-fns";
import { bn } from "date-fns/locale";

interface LostFoundItem {
  id: string;
  type: string;
  item_name: string;
  description: string | null;
  location: string | null;
  phone: string | null;
  item_date: string | null;
  is_approved: boolean;
  created_at: string;
  image_url: string | null;
  person_name: string | null;
  person_image_url: string | null;
  reward: string | null;
  detail_description: string | null;
  category: string | null;
  item_time: string | null;
  identification_marks: string | null;
  map_link: string | null;
  is_high_priority: boolean;
  is_verified: boolean;
  expire_at: string | null;
}

const lostColor = { accent: "hsl(0,65%,50%)", bg: "hsl(0,65%,94%)", gradient: "linear-gradient(135deg, hsl(0,65%,50%), hsl(15,70%,55%))" };
const foundColor = { accent: "hsl(150,60%,40%)", bg: "hsl(150,60%,94%)", gradient: "linear-gradient(135deg, hsl(150,60%,40%), hsl(160,55%,48%))" };

const ItemCardSkeleton = () => (
  <div className="rounded-2xl bg-card overflow-hidden border border-border/40" style={{ borderLeft: "3px solid hsl(0,0%,80%)", borderRight: "3px solid hsl(0,0%,80%)" }}>
    <div className="p-4 space-y-3">
      <div className="flex gap-4">
        <div className="w-20 h-20 rounded-full skeleton-shimmer shrink-0" />
        <div className="flex-1 space-y-2 py-1">
          <div className="w-3/4 h-5 rounded skeleton-shimmer" />
          <div className="w-1/2 h-3 rounded skeleton-shimmer" />
          <div className="w-2/3 h-3 rounded skeleton-shimmer" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="h-12 rounded-xl skeleton-shimmer" />
        <div className="h-12 rounded-xl skeleton-shimmer" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="h-10 rounded-xl skeleton-shimmer" />
        <div className="h-10 rounded-xl skeleton-shimmer" />
        <div className="h-10 rounded-xl skeleton-shimmer" />
      </div>
    </div>
  </div>
);

const LostFoundCard = ({ item }: { item: LostFoundItem }) => {
  const [showDetail, setShowDetail] = useState(false);
  const isLost = item.type === "lost";
  const colors = isLost ? lostColor : foundColor;
  const isRecent = differenceInHours(new Date(), new Date(item.created_at)) < 24;

  return (
    <div
      className="relative rounded-2xl bg-card overflow-hidden border-y border-border/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 group"
      style={{ borderLeft: `3px solid ${colors.accent}`, borderRight: `3px solid ${colors.accent}` }}
    >
      {/* Top-right status badge */}
      <div className="absolute top-3 right-0 flex items-center gap-1 px-3 py-1 rounded-l-full shadow-md z-10"
        style={{ background: colors.gradient }}>
        {isLost ? <AlertCircle className="w-3 h-3 text-white" /> : <HandHeart className="w-3 h-3 text-white" />}
        <span className="text-[9px] font-extrabold text-white tracking-wide uppercase">
          {isLost ? "হারিয়েছে" : "পাওয়া গেছে"}
        </span>
      </div>

      {/* Top-left urgency/recent badges */}
      {(isRecent || item.is_high_priority) && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          {item.is_high_priority && (
            <span className="px-2 py-1 rounded-full text-[9px] font-bold shadow-sm flex items-center gap-1"
              style={{ background: "linear-gradient(135deg, hsl(0,80%,50%), hsl(15,85%,55%))", color: "white" }}>
              <Flame className="w-3 h-3" /> জরুরি
            </span>
          )}
          {isRecent && !item.is_high_priority && (
            <span className="px-2 py-1 rounded-full text-[9px] font-bold shadow-sm flex items-center gap-1"
              style={{ background: "linear-gradient(135deg, hsl(45,90%,50%), hsl(35,85%,55%))", color: "white" }}>
              <Flame className="w-3 h-3" /> সাম্প্রতিক
            </span>
          )}
        </div>
      )}

      {/* Main content area */}
      <div className="p-4 sm:p-5">
        {/* Profile row: Image + Primary Info */}
        <div className="flex gap-4 mt-1">
          {/* Full-width item image in circle like doctor avatar */}
          <div className="relative shrink-0">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.item_name}
                className="w-20 h-20 sm:w-[88px] sm:h-[88px] rounded-full object-cover shadow-md"
                style={{ border: `3px solid ${colors.accent}30` }}
              />
            ) : (
              <div
                className="w-20 h-20 sm:w-[88px] sm:h-[88px] rounded-full flex items-center justify-center shadow-md"
                style={{ background: colors.bg, color: colors.accent, border: `3px solid ${colors.accent}30` }}
              >
                {isLost ? <AlertCircle className="w-8 h-8 sm:w-9 sm:h-9" /> : <HandHeart className="w-8 h-8 sm:w-9 sm:h-9" />}
              </div>
            )}
            {/* Reward indicator dot */}
            {item.reward && (
              <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
                style={{ background: "hsl(45,90%,50%)", border: "2.5px solid var(--card)" }}>
                <Gift className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>

          {/* Name & primary info block */}
          <div className="flex-1 min-w-0 py-0.5">
            <h3 className="font-extrabold text-foreground text-[16px] sm:text-[18px] leading-snug line-clamp-2">{item.item_name}</h3>
            {item.category && item.category !== "সাধারণ" && (
              <p className="text-[12px] sm:text-[13px] font-semibold mt-0.5" style={{ color: colors.accent }}>{item.category}</p>
            )}
            {/* Verified badge */}
            {item.is_verified && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500/20" />
                <span className="text-[10px] font-bold text-blue-600">যাচাইকৃত তথ্য</span>
              </div>
            )}
            {/* Short description */}
            {item.description && (
              <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
            )}
          </div>
        </div>

        {/* Info grid - 2x2 (icon-based compact layout) */}
        <div className="grid grid-cols-2 gap-2 mt-3.5">
          {item.item_date && (
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 bg-muted/50 border border-border/30">
              <Calendar className="w-4 h-4 shrink-0" style={{ color: colors.accent }} />
              <div className="min-w-0">
                <p className="text-[9px] text-muted-foreground leading-none">তারিখ</p>
                <p className="text-[11px] font-bold text-foreground leading-tight mt-0.5 truncate">
                  {format(new Date(item.item_date), "d MMM yyyy", { locale: bn })}
                </p>
              </div>
            </div>
          )}
          {item.item_time && (
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 bg-muted/50 border border-border/30">
              <Clock className="w-4 h-4 shrink-0" style={{ color: colors.accent }} />
              <div className="min-w-0">
                <p className="text-[9px] text-muted-foreground leading-none">সময়</p>
                <p className="text-[11px] font-bold text-foreground leading-tight mt-0.5 truncate">{item.item_time}</p>
              </div>
            </div>
          )}
          {item.location && (
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 bg-muted/50 border border-border/30">
              <MapPin className="w-4 h-4 shrink-0" style={{ color: colors.accent }} />
              <div className="min-w-0">
                <p className="text-[9px] text-muted-foreground leading-none">স্থান</p>
                <p className="text-[11px] font-bold text-foreground leading-tight mt-0.5 truncate">{item.location}</p>
              </div>
            </div>
          )}
          {item.identification_marks && (
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 bg-muted/50 border border-border/30">
              <Tag className="w-4 h-4 shrink-0" style={{ color: colors.accent }} />
              <div className="min-w-0">
                <p className="text-[9px] text-muted-foreground leading-none">চিহ্ন</p>
                <p className="text-[11px] font-bold text-foreground leading-tight mt-0.5 truncate">{item.identification_marks}</p>
              </div>
            </div>
          )}
        </div>

        {/* Person Info Section - like doctor's location row */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/30">
          {item.person_image_url ? (
            <img src={item.person_image_url} alt={item.person_name || ""} className="w-8 h-8 rounded-full object-cover shrink-0"
              style={{ border: `2px solid ${colors.accent}30` }} />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: colors.bg }}>
              <User className="w-4 h-4" style={{ color: colors.accent }} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[9px] text-muted-foreground leading-none">{isLost ? "হারানো ব্যক্তির তথ্য" : "যিনি পেয়েছেন"}</p>
            <p className="text-[11px] font-bold text-foreground leading-tight mt-0.5 truncate">{item.person_name || "বেনামী"}</p>
          </div>
          <p className="text-[10px] text-muted-foreground shrink-0">
            {format(new Date(item.created_at), "d MMM", { locale: bn })}
          </p>
        </div>

        {/* Expandable detail section */}
        {showDetail && (item.detail_description || item.reward) && (
          <div className="mt-3 pt-3 border-t border-border/30 animate-in fade-in slide-in-from-top-2 duration-200 space-y-2">
            {item.detail_description && (
              <p className="text-[12px] text-muted-foreground leading-relaxed">{item.detail_description}</p>
            )}
            {item.reward && (
              <div className="flex items-start gap-2 rounded-xl p-2.5" style={{ background: "hsl(45,90%,50%,0.1)" }}>
                <Gift className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "hsl(45,90%,40%)" }} />
                <div>
                  <p className="text-[10px] font-bold" style={{ color: "hsl(45,90%,35%)" }}>পুরষ্কার ঘোষণা</p>
                  <p className="text-[12px] font-medium mt-0.5" style={{ color: "hsl(45,70%,30%)" }}>{item.reward}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CTA Buttons - 3 column grid like doctor card */}
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 grid grid-cols-3 gap-2">
        {/* বিস্তারিত / Detail toggle */}
        <button
          onClick={() => setShowDetail(!showDetail)}
          className="py-2.5 rounded-xl text-[11px] sm:text-[12px] font-bold flex items-center justify-center gap-1.5 bg-muted/70 text-foreground border border-border/40 hover:bg-muted transition-colors"
        >
          <Eye className="w-3.5 h-3.5" /> {showDetail ? "সংক্ষেপ" : "বিস্তারিত"}
        </button>

        {/* যোগাযোগ / Call */}
        {item.phone ? (
          <a
            href={`tel:${item.phone}`}
            className="py-2.5 rounded-xl text-[11px] sm:text-[12px] font-bold flex items-center justify-center gap-1.5 text-white active:scale-[0.97] transition-transform"
            style={{ background: colors.gradient }}
          >
            <Phone className="w-3.5 h-3.5" /> যোগাযোগ
          </a>
        ) : (
          <div className="py-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 bg-muted/40 text-muted-foreground cursor-not-allowed">
            <Phone className="w-3.5 h-3.5" /> যোগাযোগ
          </div>
        )}

        {/* লোকেশন / Map */}
        {item.map_link ? (
          <a
            href={item.map_link}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 rounded-xl text-[11px] sm:text-[12px] font-bold flex items-center justify-center gap-1.5 text-white active:scale-[0.97] transition-transform"
            style={{ background: "linear-gradient(135deg, hsl(210,70%,50%), hsl(220,65%,55%))" }}
          >
            <ExternalLink className="w-3.5 h-3.5" /> লোকেশন
          </a>
        ) : (
          <div className="py-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 bg-muted/40 text-muted-foreground cursor-not-allowed">
            <MapPin className="w-3.5 h-3.5" /> লোকেশন
          </div>
        )}
      </div>
    </div>
  );
};

const submitFields = [
  { name: "type", label: "ধরন", type: "select" as const, options: ["হারিয়েছি", "পেয়েছি"], required: true },
  { name: "item_name", label: "কি হারিয়েছেন/পেয়েছেন?", placeholder: "যেমন: মানিব্যাগ, এনআইডি", required: true },
  { name: "category", label: "ক্যাটাগরি", type: "select" as const, options: ["মোবাইল", "ডকুমেন্ট", "ব্যাগ", "গহনা", "পোষা প্রাণী", "অন্যান্য"] },
  { name: "description", label: "সংক্ষিপ্ত বিবরণ", type: "textarea" as const, placeholder: "রঙ, সাইজ বা বিশেষ চিহ্ন..." },
  { name: "location", label: "স্থান", placeholder: "কোথায়?" },
  { name: "item_date", label: "তারিখ", type: "date" as const },
  { name: "item_time", label: "সম্ভাব্য সময়", placeholder: "যেমন: সকাল ১০টা" },
  { name: "identification_marks", label: "চিহ্নিতকরণ বৈশিষ্ট্য", placeholder: "রঙ, মডেল, বিশেষ চিহ্ন..." },
  { name: "person_name", label: "আপনার নাম", placeholder: "আপনার পুরো নাম" },
  { name: "phone", label: "যোগাযোগ নম্বর", type: "tel" as const, placeholder: "017...", required: true },
  { name: "reward", label: "পুরষ্কার ঘোষণা (ঐচ্ছিক)", placeholder: "ফেরত দিলে পুরষ্কার পাবেন..." },
];

const LostFound = () => {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "lost" | "found">("all");
  const [showForm, setShowForm] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("lost_found")
      .select("*")
      .eq("is_approved", true)
      .order("created_at", { ascending: false });
    setItems((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
    const channel = supabase
      .channel("lost_found_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "lost_found" }, fetchItems)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = useMemo(() => items.filter((item) => {
    if (filter === "lost" && item.type !== "lost") return false;
    if (filter === "found" && item.type !== "found") return false;
    if (search) {
      const q = search.toLowerCase();
      if (!item.item_name.toLowerCase().includes(q) && !(item.description || "").toLowerCase().includes(q) && !(item.location || "").toLowerCase().includes(q)) return false;
    }
    return true;
  }), [items, filter, search]);

  const handleSubmit = async (data: Record<string, string>) => {
    const typeValue = data.type === "পেয়েছি" ? "found" : "lost";
    await supabase.from("lost_found").insert({
      type: typeValue,
      item_name: data.item_name,
      description: data.description || null,
      location: data.location || null,
      item_date: data.item_date || null,
      item_time: data.item_time || null,
      phone: data.phone,
      person_name: data.person_name || null,
      reward: data.reward || null,
      category: data.category || null,
      identification_marks: data.identification_marks || null,
    } as any);
  };

  const filterTabs = [
    { key: "all" as const, label: "সব", count: items.length },
    { key: "lost" as const, label: "হারানো", count: items.filter(i => i.type === "lost").length },
    { key: "found" as const, label: "পাওয়া", count: items.filter(i => i.type === "found").length },
  ];

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto pb-20">
      <PageHeader title="হারানো বিজ্ঞপ্তি" onAdd={() => setShowForm(true)} />

      <div className="px-4 -mt-2 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="কি হারিয়েছেন বা পেয়েছেন খুঁজুন..."
            className="search-input pl-12"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === tab.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-2 text-xs">
          <span className="bg-muted px-3 py-1.5 rounded-full text-muted-foreground font-medium">
            মোট: {items.length}
          </span>
          {items.filter(i => differenceInHours(new Date(), new Date(i.created_at)) < 24).length > 0 && (
            <span className="px-3 py-1.5 rounded-full font-medium flex items-center gap-1"
              style={{ background: "hsl(45,90%,50%,0.1)", color: "hsl(45,80%,35%)" }}>
              <Flame className="w-3 h-3" /> আজকের: {items.filter(i => differenceInHours(new Date(), new Date(i.created_at)) < 24).length}
            </span>
          )}
        </div>

        {/* Cards */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => <ItemCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground">কোনো বিজ্ঞপ্তি নেই</h3>
            <p className="text-sm text-muted-foreground mt-1">বর্তমানে কোনো হারানো বা প্রাপ্তির বিজ্ঞপ্তি নেই।</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => (
              <LostFoundCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      <SubmitFormDialog
        open={showForm}
        onClose={() => setShowForm(false)}
        title="রিপোর্ট করুন"
        subtitle="হারানো বা পাওয়ার তথ্য দিন"
        fields={submitFields}
        onSubmit={handleSubmit}
        headerColor="linear-gradient(135deg, hsl(0,60%,50%), hsl(15,65%,55%))"
      />
      <BottomNav />
    </div>
  );
};

export default LostFound;
