import { useState, useEffect } from "react";
import { Phone, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";

interface EmergencyCall {
  id: string;
  name: string;
  description: string | null;
  phone: string;
}

const EmergencyCalls = () => {
  const [calls, setCalls] = useState<EmergencyCall[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCalls = async () => {
      const { data } = await (supabase.from as any)("emergency_calls")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (data) setCalls(data);
    };
    fetchCalls();

    const channel = supabase
      .channel("emergency_calls_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "emergency_calls" }, () => fetchCalls())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = calls.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto">
      <PageHeader title="জরুরি কল" color="linear-gradient(135deg, hsl(0,70%,50%), hsl(0,80%,60%))" />
      
      <div className="px-4 -mt-2 space-y-4">
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="সেবার নাম বা নম্বর খুঁজুন..."
            className="search-input pl-12"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="space-y-3 pb-6">
          {filtered.map((call) => (
            <div key={call.id} className="glass-card p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground">{call.name}</h3>
                {call.description && <p className="text-sm text-muted-foreground">{call.description}</p>}
              </div>
              <a href={`tel:${call.phone}`} className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-destructive" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmergencyCalls;
