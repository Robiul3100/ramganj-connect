import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import SubmitFormDialog from "@/components/SubmitFormDialog";
import { Search, MapPin, Calendar, Phone, ChevronDown, ChevronUp, AlertCircle, HandHeart, User, Gift, Clock } from "lucide-react";
import { format } from "date-fns";
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
}

const ItemCardSkeleton = () => (
  <div className="bg-card rounded-2xl overflow-hidden border border-border">
    <div className="aspect-[16/9] skeleton-shimmer" />
    <div className="p-4 space-y-3">
      <div className="w-3/4 h-4 rounded skeleton-shimmer" />
      <div className="w-1/2 h-3 rounded skeleton-shimmer" />
      <div className="w-full h-3 rounded skeleton-shimmer" />
    </div>
  </div>
);

const LostFoundCard = ({ item }: { item: LostFoundItem }) => {
  const [expanded, setExpanded] = useState(false);
  const isLost = item.type === "lost";

  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow">
      {/* Type Badge + Image */}
      <div className="relative">
        {item.image_url ? (
          <img src={item.image_url} alt={item.item_name} className="w-full aspect-[16/9] object-cover" />
        ) : (
          <div className={`w-full aspect-[16/9] flex items-center justify-center ${isLost ? "bg-destructive/5" : "bg-primary/5"}`}>
            {isLost ? <AlertCircle className="w-12 h-12 text-destructive/30" /> : <HandHeart className="w-12 h-12 text-primary/30" />}
          </div>
        )}
        <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white ${isLost ? "bg-destructive" : "bg-primary"}`}>
          {isLost ? "হারিয়েছি" : "পেয়েছি"}
        </span>
        {item.reward && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-white flex items-center gap-1">
            <Gift className="w-3 h-3" /> পুরষ্কার
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-bold text-foreground text-base leading-tight">{item.item_name}</h3>

        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
        )}

        {/* Info Row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          {item.location && (
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {item.location}</span>
          )}
          {item.item_date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(item.item_date), "d MMM yyyy", { locale: bn })}
            </span>
          )}
        </div>

        {/* Person Info */}
        {item.person_name && (
          <div className="flex items-center gap-2.5 pt-1 border-t border-border">
            {item.person_image_url ? (
              <img src={item.person_image_url} alt={item.person_name} className="w-8 h-8 rounded-full object-cover border border-border" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
            <span className="text-sm font-medium text-foreground">{item.person_name}</span>
          </div>
        )}

        {/* Expandable Detail */}
        {(item.detail_description || item.reward) && (
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs font-semibold text-primary"
            >
              {expanded ? "সংক্ষেপে দেখুন" : "বিস্তারিত দেখুন"}
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {expanded && (
              <div className="mt-2 space-y-2 text-sm text-muted-foreground bg-muted/30 rounded-xl p-3">
                {item.detail_description && <p>{item.detail_description}</p>}
                {item.reward && (
                  <div className="flex items-start gap-2 bg-amber-500/10 rounded-lg p-2.5">
                    <Gift className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-amber-800 dark:text-amber-300 text-xs font-medium">{item.reward}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        {item.phone && (
          <a
            href={`tel:${item.phone}`}
            className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 ${isLost ? "bg-destructive" : "bg-primary"}`}
          >
            <Phone className="w-4 h-4" /> যোগাযোগ করুন
          </a>
        )}

        {/* Time ago */}
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {format(new Date(item.created_at), "d MMM yyyy, h:mm a", { locale: bn })}
        </p>
      </div>
    </div>
  );
};

const submitFields = [
  { name: "type", label: "ধরন", type: "select" as const, options: ["হারিয়েছি", "পেয়েছি"], required: true },
  { name: "item_name", label: "কি হারিয়েছেন/পেয়েছেন?", placeholder: "যেমন: মানিব্যাগ, এনআইডি", required: true },
  { name: "description", label: "বিবরণ", type: "textarea" as const, placeholder: "রঙ, সাইজ বা বিশেষ চিহ্ন..." },
  { name: "location", label: "স্থান", placeholder: "কোথায়?" },
  { name: "item_date", label: "তারিখ", type: "date" as const },
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

  const filtered = items.filter((item) => {
    if (filter === "lost" && item.type !== "lost") return false;
    if (filter === "found" && item.type !== "found") return false;
    if (search && !item.item_name.toLowerCase().includes(search.toLowerCase()) && !(item.description || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleSubmit = async (data: Record<string, string>) => {
    const typeValue = data.type === "পেয়েছি" ? "found" : "lost";
    await supabase.from("lost_found").insert({
      type: typeValue,
      item_name: data.item_name,
      description: data.description || null,
      location: data.location || null,
      item_date: data.item_date || null,
      phone: data.phone,
      person_name: data.person_name || null,
      reward: data.reward || null,
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
