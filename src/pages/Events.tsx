import { useState, useEffect } from "react";
import { Search, Calendar, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import SubmitFormDialog from "@/components/SubmitFormDialog";

interface Event {
  id: string;
  title: string;
  category: string;
  location: string | null;
  description: string | null;
  event_date: string | null;
}

const categoryIcons: Record<string, string> = {
  "ক্রীড়া": "⚽",
  "সামাজিক": "🎉",
  "শিক্ষা": "📚",
  "ধর্মীয়": "🕌",
};

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await (supabase.from as any)("events").select("*").eq("is_approved", true).order("event_date", { ascending: false });
      if (data) setEvents(data);
    };
    fetch();
    const ch = supabase.channel("events_rt").on("postgres_changes", { event: "*", schema: "public", table: "events" }, () => fetch()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const filtered = events.filter(e => e.title.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = async (data: Record<string, string>) => {
    await (supabase.from as any)("events").insert({
      title: data.title,
      category: data.category || "সামাজিক",
      location: data.location || null,
      description: data.description || null,
      event_date: data.event_date || null,
    });
  };

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto">
      <PageHeader title="ইভেন্ট" color="linear-gradient(135deg, hsl(270,60%,55%), hsl(290,70%,60%))" onAdd={() => setShowForm(true)} />
      
      <div className="px-4 -mt-2 space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input type="text" placeholder="ইভেন্ট খুঁজুন..." className="search-input pl-12" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="space-y-4 pb-6">
          {filtered.map((event) => (
            <div key={event.id} className="glass-card p-4 border-l-4" style={{ borderColor: "hsl(270, 60%, 55%)" }}>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-xl shrink-0">
                  {categoryIcons[event.category] || "📅"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ background: "hsl(270, 60%, 55%)" }}>{event.category}</span>
                    {event.event_date && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(event.event_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-foreground mt-1">{event.title}</h3>
                  {event.location && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {event.location}
                    </p>
                  )}
                </div>
              </div>
              {event.description && (
                <div className="mt-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3">
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <SubmitFormDialog
        open={showForm} onClose={() => setShowForm(false)}
        title="তথ্য যোগ করুন" subtitle="নিরাপত্তা যাচাই প্রয়োজন"
        headerColor="linear-gradient(135deg, hsl(270,60%,55%), hsl(290,70%,60%))"
        fields={[
          { name: "title", label: "ইভেন্ট নাম", required: true },
          { name: "category", label: "ক্যাটাগরি", type: "select", options: ["ক্রীড়া", "সামাজিক", "শিক্ষা", "ধর্মীয়"] },
          { name: "location", label: "স্থান" },
          { name: "event_date", label: "তারিখ", type: "date" },
          { name: "description", label: "বিবরণ", type: "textarea" },
        ]}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Events;
