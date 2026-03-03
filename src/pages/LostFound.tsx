import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import SubmitFormDialog from "@/components/SubmitFormDialog";
import { Search, Flame } from "lucide-react";
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
  <div className="rounded-2xl bg-muted/50 h-32 animate-pulse" />
);


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

        {/* Cards - placeholder for new design */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <ItemCardSkeleton key={i} />)}
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
            {/* New card design will go here */}
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
