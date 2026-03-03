import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import SubmitFormDialog from "@/components/SubmitFormDialog";
import { Search, MapPin, Calendar, Phone, ChevronDown, ChevronUp, AlertCircle, HandHeart, User, Gift, Clock, Tag, Eye, Shield, Flame, MessageCircle, ExternalLink } from "lucide-react";
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

const ItemCardSkeleton = () => (
  <div className="bg-card rounded-2xl overflow-hidden border border-border">
    <div className="aspect-[16/9] skeleton-shimmer" />
    <div className="p-4 space-y-3">
      <div className="flex gap-2">
        <div className="w-10 h-10 rounded-full skeleton-shimmer" />
        <div className="flex-1 space-y-2">
          <div className="w-3/4 h-4 rounded skeleton-shimmer" />
          <div className="w-1/2 h-3 rounded skeleton-shimmer" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="h-8 rounded-lg skeleton-shimmer" />
        <div className="h-8 rounded-lg skeleton-shimmer" />
      </div>
      <div className="h-10 rounded-xl skeleton-shimmer" />
    </div>
  </div>
);

const LostFoundCard = ({ item }: { item: LostFoundItem }) => {
  const [expanded, setExpanded] = useState(false);
  const isLost = item.type === "lost";
  const isRecent = differenceInHours(new Date(), new Date(item.created_at)) < 24;

  return (
    <div className="bg-card rounded-[16px] overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Full-width image with badge overlay */}
      <div className="relative">
        {item.image_url ? (
          <img src={item.image_url} alt={item.item_name} className="w-full aspect-[16/9] object-cover" />
        ) : (
          <div className={`w-full aspect-[16/9] flex items-center justify-center ${isLost ? "bg-destructive/5" : "bg-primary/5"}`}>
            {isLost ? <AlertCircle className="w-16 h-16 text-destructive/15" /> : <HandHeart className="w-16 h-16 text-primary/15" />}
          </div>
        )}
        {/* Bottom gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Top-right status badge */}
        <span className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-[11px] font-bold text-white shadow-lg ${isLost ? "bg-destructive" : "bg-emerald-500"}`}>
          {isLost ? "🔴 হারিয়েছে" : "🟢 পাওয়া গেছে"}
        </span>

        {/* Top-left badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isRecent && (
            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-md flex items-center gap-1">
              <Flame className="w-3 h-3" /> সাম্প্রতিক
            </span>
          )}
          {item.is_high_priority && (
            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-red-600 text-white shadow-md">
              ⚡ জরুরি
            </span>
          )}
          {item.is_verified && (
            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-blue-500 text-white shadow-md flex items-center gap-1">
              <Shield className="w-3 h-3" /> যাচাইকৃত
            </span>
          )}
        </div>

        {/* Reward badge on image */}
        {item.reward && (
          <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-white flex items-center gap-1 shadow-lg">
            <Gift className="w-3 h-3" /> পুরষ্কার আছে
          </span>
        )}
      </div>

      {/* Content section */}
      <div className="p-4 space-y-3">
        {/* Primary info */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-foreground text-[15px] leading-snug flex-1">{item.item_name}</h3>
            {item.category && item.category !== "সাধারণ" && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
                {item.category}
              </span>
            )}
          </div>
          {item.description && (
            <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2">{item.description}</p>
          )}
        </div>

        {/* Icon-based compact info grid */}
        <div className="grid grid-cols-2 gap-2">
          {item.item_date && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/60 rounded-lg px-2.5 py-2">
              <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">{format(new Date(item.item_date), "d MMM yyyy", { locale: bn })}</span>
            </div>
          )}
          {item.item_time && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/60 rounded-lg px-2.5 py-2">
              <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">{item.item_time}</span>
            </div>
          )}
          {item.location && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/60 rounded-lg px-2.5 py-2">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">{item.location}</span>
            </div>
          )}
          {item.identification_marks && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/60 rounded-lg px-2.5 py-2">
              <Tag className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">{item.identification_marks}</span>
            </div>
          )}
        </div>

        {/* Person info section */}
        <div className="flex items-center gap-3 bg-muted/40 rounded-xl p-2.5">
          {item.person_image_url ? (
            <img src={item.person_image_url} alt={item.person_name || ""} className="w-9 h-9 rounded-full object-cover border-2 border-background shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground">{isLost ? "হারানো ব্যক্তির তথ্য" : "যিনি পেয়েছেন"}</p>
            <p className="text-xs font-semibold text-foreground truncate">{item.person_name || "বেনামী"}</p>
          </div>
          <p className="text-[10px] text-muted-foreground shrink-0">
            {format(new Date(item.created_at), "d MMM", { locale: bn })}
          </p>
        </div>

        {/* Expandable detail */}
        {(item.detail_description || item.reward) && (
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs font-semibold text-primary"
            >
              {expanded ? "সংক্ষেপে দেখুন" : "আরও দেখুন"}
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${expanded ? "max-h-96 mt-2" : "max-h-0"}`}>
              <div className="space-y-2 text-[13px] text-muted-foreground bg-muted/40 rounded-xl p-3">
                {item.detail_description && <p className="leading-relaxed">{item.detail_description}</p>}
                {item.reward && (
                  <div className="flex items-start gap-2 bg-amber-500/10 rounded-lg p-2.5">
                    <Gift className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-amber-800 dark:text-amber-300 text-xs font-medium">{item.reward}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex gap-2">
          {item.phone && (
            <a
              href={`tel:${item.phone}`}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 ${isLost ? "bg-destructive" : "bg-emerald-500"}`}
            >
              <Phone className="w-4 h-4" /> যোগাযোগ করুন
            </a>
          )}
          {item.map_link && (
            <a
              href={item.map_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border border-border text-foreground bg-muted/50 hover:bg-muted transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> লোকেশন
            </a>
          )}
        </div>
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
            <span className="bg-amber-500/10 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
              <Flame className="w-3 h-3" /> আজকের: {items.filter(i => differenceInHours(new Date(), new Date(i.created_at)) < 24).length}
            </span>
          )}
        </div>

        {/* Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
