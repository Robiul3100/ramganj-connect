import { useState, useEffect } from "react";
import { Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import PageAdBanner from "@/components/PageAdBanner";

interface EmergencyCall {
  id: string;
  name: string;
  description: string | null;
  phone: string;
}

const EmergencyCallSkeleton = () => (
  <div className="glass-card p-4 flex items-center gap-4">
    <div className="w-14 h-14 rounded-2xl skeleton-shimmer shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-3/4 rounded-md skeleton-shimmer" />
      <div className="h-3 w-1/2 rounded skeleton-shimmer" />
    </div>
    <div className="w-12 h-12 rounded-full skeleton-shimmer shrink-0" />
  </div>
);

const EmergencyCalls = () => {
  const [calls, setCalls] = useState<EmergencyCall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalls = async () => {
      setLoading(true);
      const { data } = await (supabase.from as any)("emergency_calls")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (data) setCalls(data);
      setLoading(false);
    };
    fetchCalls();

    const channel = supabase
      .channel("emergency_calls_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "emergency_calls" }, () => fetchCalls())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = calls;

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto">
      <PageHeader title="জরুরি কল" color="linear-gradient(135deg, hsl(0,70%,50%), hsl(0,80%,60%))" />
      
      <div className="px-4 -mt-2 space-y-4">
        {/* Ad Banner */}
        <PageAdBanner pageSlug="emergency" />

        <div className="space-y-3 pb-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <EmergencyCallSkeleton key={i} />)
          ) : (
            filtered.map((call) => (
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencyCalls;
