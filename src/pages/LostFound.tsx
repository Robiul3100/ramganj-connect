import { useState, useEffect } from "react";
import { Search, MapPin, Phone, Calendar, AlertCircle, HandHeart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import SubmitFormDialog from "@/components/SubmitFormDialog";

interface LostFoundItem {
  id: string;
  type: string;
  item_name: string;
  description: string | null;
  location: string | null;
  phone: string | null;
  item_date: string;
}

const LostFound = () => {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [activeType, setActiveType] = useState<"lost" | "found">("lost");

  useEffect(() => {
    const fetchItems = async () => {
      const { data } = await (supabase.from as any)("lost_found")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false });
      if (data) setItems(data);
    };
    fetchItems();

    const ch = supabase
      .channel("lost_found_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "lost_found" }, () => fetchItems())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const filtered = items.filter(
    (i) =>
      i.type === activeType &&
      (i.item_name.toLowerCase().includes(search.toLowerCase()) ||
        (i.location && i.location.toLowerCase().includes(search.toLowerCase())))
  );

  const handleSubmit = async (data: Record<string, string>) => {
    await (supabase.from as any)("lost_found").insert({
      type: data.type || "lost",
      item_name: data.item_name,
      description: data.description || null,
      location: data.location || null,
      phone: data.phone || null,
      item_date: data.item_date || null,
    });
  };

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto pb-20">
      <PageHeader
        title="হারানো বিজ্ঞপ্তি"
        color="linear-gradient(135deg, hsl(220,60%,40%), hsl(240,50%,50%))"
        onAdd={() => setShowForm(true)}
      />

      <div className="px-4 -mt-2 space-y-3">
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

        {/* Type Toggle */}
        <div className="flex gap-3">
          <button
            onClick={() => setActiveType("lost")}
            className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm transition-colors ${
              activeType === "lost"
                ? "bg-destructive/10 text-destructive border-2 border-destructive"
                : "glass-card text-muted-foreground border-2 border-transparent"
            }`}
          >
            <AlertCircle className="w-5 h-5" />
            হারিয়েছি
          </button>
          <button
            onClick={() => setActiveType("found")}
            className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm transition-colors ${
              activeType === "found"
                ? "bg-primary/10 text-primary border-2 border-primary"
                : "glass-card text-muted-foreground border-2 border-transparent"
            }`}
          >
            <HandHeart className="w-5 h-5" />
            পেয়েছি
          </button>
        </div>

        {/* Items List */}
        <div className="space-y-4 pb-6">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-bold text-foreground text-lg">কোনো বিজ্ঞপ্তি নেই</h3>
              <p className="text-sm text-muted-foreground mt-1">
                বর্তমানে কোনো হারানো বা প্রাপ্তির বিজ্ঞপ্তি নেই।
              </p>
            </div>
          )}

          {filtered.map((item) => (
            <div
              key={item.id}
              className={`glass-card p-4 border-l-4 ${
                item.type === "lost" ? "border-destructive" : "border-primary"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                    item.type === "lost" ? "bg-destructive/10" : "bg-primary/10"
                  }`}
                >
                  {item.type === "lost" ? (
                    <AlertCircle className="w-6 h-6 text-destructive" />
                  ) : (
                    <HandHeart className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full text-white ${
                        item.type === "lost" ? "bg-destructive" : "bg-primary"
                      }`}
                    >
                      {item.type === "lost" ? "হারিয়েছি" : "পেয়েছি"}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />{" "}
                      {new Date(item.item_date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground mt-1">{item.item_name}</h3>
                  {item.location && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {item.location}
                    </p>
                  )}
                </div>
              </div>
              {item.description && (
                <div className={`mt-3 rounded-xl p-3 ${item.type === "lost" ? "bg-destructive/5" : "bg-primary/5"}`}>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              )}
              {item.phone && (
                <a
                  href={`tel:${item.phone}`}
                  className="mt-3 w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" /> যোগাযোগ করুন
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      <SubmitFormDialog
        open={showForm}
        onClose={() => setShowForm(false)}
        title="রিপোর্ট করুন"
        subtitle="হারানো বা পাওয়ার তথ্য দিন"
        headerColor="linear-gradient(135deg, hsl(220,60%,40%), hsl(240,50%,50%))"
        fields={[
          {
            name: "type",
            label: "ধরন",
            type: "select",
            options: ["lost", "found"],
            required: true,
          },
          { name: "item_name", label: "কি হারিয়েছেন/পেয়েছেন?", required: true, placeholder: "যেমন: মানিব্যাগ, এনআইডি" },
          { name: "description", label: "বিবরণ", type: "textarea", placeholder: "রঙ, সাইজ বা বিশেষ চিহ্ন..." },
          { name: "location", label: "স্থান", placeholder: "কোথায়?" },
          { name: "item_date", label: "তারিখ", type: "date" },
          { name: "phone", label: "যোগাযোগ নম্বর", type: "tel", placeholder: "017..." },
        ]}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default LostFound;
