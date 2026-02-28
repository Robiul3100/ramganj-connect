import { useState, useEffect, useRef } from "react";
import { Search, X, Phone, MapPin, Building2, Stethoscope, Briefcase, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface SearchResult {
  id: string;
  title: string;
  type: "service" | "office" | "emergency" | "news";
  subtitle?: string;
  phone?: string;
  route?: string;
}

const SmartSearch = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }

    const timer = setTimeout(async () => {
      setLoading(true);
      const q = query.trim().toLowerCase();

      const [servicesRes, officesRes, emergencyRes, newsRes] = await Promise.all([
        supabase.from("services").select("id, title, phone, address").eq("status", "approved").ilike("title", `%${q}%`).limit(5),
        (supabase.from as any)("offices").select("id, name, phone, category").eq("is_active", true).ilike("name", `%${q}%`).limit(5),
        (supabase.from as any)("emergency_calls").select("id, name, phone").eq("is_active", true).ilike("name", `%${q}%`).limit(3),
        supabase.from("news").select("id, title").eq("is_active", true).ilike("title", `%${q}%`).limit(3),
      ]);

      const all: SearchResult[] = [
        ...(servicesRes.data || []).map((s: any) => ({ id: s.id, title: s.title, type: "service" as const, subtitle: s.address, phone: s.phone })),
        ...(officesRes.data || []).map((o: any) => ({ id: o.id, title: o.name, type: "office" as const, subtitle: o.category, phone: o.phone, route: "/offices" })),
        ...(emergencyRes.data || []).map((e: any) => ({ id: e.id, title: e.name, type: "emergency" as const, phone: e.phone })),
        ...(newsRes.data || []).map((n: any) => ({ id: n.id, title: n.title, type: "news" as const, route: `/news/${n.id}` })),
      ];
      setResults(all);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const typeIcons = {
    service: Briefcase,
    office: Building2,
    emergency: Phone,
    news: ArrowRight,
  };

  const typeLabels = {
    service: "সেবা",
    office: "অফিস",
    emergency: "জরুরি",
    news: "সংবাদ",
  };

  const handleSelect = (r: SearchResult) => {
    if (r.route) navigate(r.route);
    else if (r.phone) window.location.href = `tel:${r.phone}`;
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      {/* Search trigger */}
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 bg-card rounded-2xl px-4 py-3.5 text-muted-foreground transition-shadow hover:shadow-md"
        style={{ boxShadow: "var(--shadow-soft)" }}
      >
        <Search className="w-5 h-5" />
        <span className="text-sm">সেবা, অফিস বা নম্বর খুঁজুন...</span>
      </button>

      {/* Full screen search overlay */}
      {open && (
        <div className="fixed inset-0 z-[60] bg-background animate-fade-in">
          <div className="max-w-4xl mx-auto px-4 pt-3">
            {/* Search input */}
            <div className="flex items-center gap-3 bg-card rounded-2xl px-4 py-3" style={{ boxShadow: "var(--shadow-card)" }}>
              <Search className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="সেবা, অফিস, ডাক্তার বা নম্বর খুঁজুন..."
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              />
              <button onClick={() => { setOpen(false); setQuery(""); }}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Results */}
            <div className="mt-4 space-y-2 pb-20 overflow-y-auto" style={{ maxHeight: "calc(100vh - 80px)" }}>
              {loading && (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {!loading && query && results.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">কোনো ফলাফল পাওয়া যায়নি</p>
                </div>
              )}

              {results.map((r) => {
                const Icon = typeIcons[r.type];
                return (
                  <button
                    key={`${r.type}-${r.id}`}
                    onClick={() => handleSelect(r)}
                    className="w-full glass-card p-3.5 flex items-center gap-3 text-left hover:bg-secondary/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{r.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="px-1.5 py-0.5 rounded bg-secondary text-[10px] font-medium">{typeLabels[r.type]}</span>
                        {r.subtitle && <span className="truncate">{r.subtitle}</span>}
                      </div>
                    </div>
                    {r.phone && (
                      <a
                        href={`tel:${r.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0"
                      >
                        <Phone className="w-4 h-4 text-primary" />
                      </a>
                    )}
                  </button>
                );
              })}

              {!query && (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">টাইপ করুন খুঁজতে...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SmartSearch;
