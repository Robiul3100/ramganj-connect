import { useState, useEffect, useMemo } from "react";
import { Phone, MapPin, Shield, ShieldCheck, Clock, Globe, Users, ChevronDown, ChevronUp, Search, AlertTriangle, ExternalLink, BadgeCheck, Siren, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import PageAdBanner from "@/components/PageAdBanner";
import BottomNav from "@/components/BottomNav";

interface PoliceItem {
  id: string;
  type: string;
  name: string;
  rank: string | null;
  assigned_station: string | null;
  station_image_url: string | null;
  profile_image_url: string | null;
  thana: string | null;
  district: string | null;
  division: string | null;
  service_area: string | null;
  location: string | null;
  phone: string | null;
  emergency_phone: string | null;
  duty_time: string | null;
  website_url: string | null;
  map_link: string | null;
  officer_count: string | null;
  service_types: string[];
  badges: string[];
  description: string | null;
  full_description: string | null;
  is_verified: boolean | null;
  sort_order: number;
}

const badgeConfig: Record<string, { icon: typeof Shield; color: string }> = {
  "২৪ ঘন্টা সেবা": { icon: Clock, color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  "Emergency Support": { icon: Siren, color: "bg-red-500/10 text-red-600 dark:text-red-400" },
  "Women & Child Help Desk": { icon: Users, color: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  "Cyber Unit": { icon: Globe, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
};

const CardSkeleton = () => (
  <div className="bg-card rounded-[16px] border border-border/60 overflow-hidden animate-pulse">
    <div className="h-40 bg-muted" />
    <div className="p-4 space-y-3">
      <div className="h-5 bg-muted rounded w-3/4" />
      <div className="h-4 bg-muted rounded w-1/2" />
      <div className="h-4 bg-muted rounded w-2/3" />
      <div className="flex gap-2 mt-3">
        <div className="h-9 bg-muted rounded-xl flex-1" />
        <div className="h-9 bg-muted rounded-xl flex-1" />
      </div>
    </div>
  </div>
);

const PoliceCard = ({ item }: { item: PoliceItem }) => {
  const [expanded, setExpanded] = useState(false);
  const isStation = item.type === "station";

  return (
    <div className="bg-card rounded-[16px] border border-border/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Top Section */}
      {isStation ? (
        // Station: Full-width image
        <div className="relative aspect-video overflow-hidden">
          {item.station_image_url ? (
            <img src={item.station_image_url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[hsl(220,50%,25%)] to-[hsl(220,60%,40%)] flex items-center justify-center">
              <Shield className="w-12 h-12 text-white/30" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
          {item.is_verified && (
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm">
              <BadgeCheck className="w-3 h-3" /> সরকারি যাচাইকৃত
            </div>
          )}
        </div>
      ) : (
        // Officer: Profile image with rank badge
        <div className="pt-5 pb-2 flex flex-col items-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden border-[3px] border-[hsl(220,50%,45%)] shadow-lg">
              {item.profile_image_url ? (
                <img src={item.profile_image_url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[hsl(220,50%,25%)] to-[hsl(220,60%,40%)] flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white/50" />
                </div>
              )}
            </div>
            {item.rank && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[hsl(220,50%,30%)] text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-sm">
                {item.rank}
              </span>
            )}
            {item.is_verified && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                <BadgeCheck className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Primary Info */}
      <div className="px-4 pt-3 pb-2">
        <h3 className="text-base font-bold text-foreground leading-tight">{item.name}</h3>
        {!isStation && item.assigned_station && (
          <p className="text-xs text-muted-foreground mt-0.5">{item.assigned_station}</p>
        )}
        {isStation && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
            {item.thana && <span>থানা: {item.thana}</span>}
            {item.district && <span>জেলা: {item.district}</span>}
            {item.division && <span>বিভাগ: {item.division}</span>}
          </div>
        )}
      </div>

      {/* Quick Info Grid */}
      <div className="px-4 pb-2">
        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          {item.location && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="w-3 h-3 shrink-0 text-[hsl(220,50%,45%)]" />
              <span className="truncate">{item.location}</span>
            </div>
          )}
          {item.phone && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Phone className="w-3 h-3 shrink-0 text-[hsl(220,50%,45%)]" />
              <span className="truncate">{item.phone}</span>
            </div>
          )}
          {item.emergency_phone && (
            <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-semibold">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              <span className="truncate">{item.emergency_phone}</span>
            </div>
          )}
          {item.duty_time && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-3 h-3 shrink-0 text-[hsl(220,50%,45%)]" />
              <span className="truncate">{item.duty_time}</span>
            </div>
          )}
          {isStation && item.officer_count && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="w-3 h-3 shrink-0 text-[hsl(220,50%,45%)]" />
              <span className="truncate">{item.officer_count} জন কর্মকর্তা</span>
            </div>
          )}
          {item.website_url && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Globe className="w-3 h-3 shrink-0 text-[hsl(220,50%,45%)]" />
              <a href={item.website_url} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">ওয়েবসাইট</a>
            </div>
          )}
        </div>
      </div>

      {/* Badges */}
      {item.badges && item.badges.length > 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {item.badges.map((badge) => {
            const cfg = badgeConfig[badge] || { icon: Shield, color: "bg-muted text-muted-foreground" };
            const Icon = cfg.icon;
            return (
              <span key={badge} className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
                <Icon className="w-2.5 h-2.5" /> {badge}
              </span>
            );
          })}
        </div>
      )}

      {/* Service Types */}
      {isStation && item.service_types && item.service_types.length > 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1">
          {item.service_types.map((st) => (
            <span key={st} className="text-[10px] bg-[hsl(220,50%,95%)] dark:bg-[hsl(220,40%,20%)] text-[hsl(220,50%,40%)] dark:text-[hsl(220,50%,70%)] px-2 py-0.5 rounded-full font-medium">
              {st}
            </span>
          ))}
        </div>
      )}

      {/* Description */}
      {item.description && (
        <div className="px-4 pb-2">
          <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
        </div>
      )}

      {/* Expandable Details */}
      {item.full_description && (
        <div className="px-4 pb-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs font-semibold text-[hsl(220,50%,45%)] hover:text-[hsl(220,50%,35%)] transition-colors"
          >
            {expanded ? "সংক্ষেপ করুন" : "বিস্তারিত দেখুন"}
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{ maxHeight: expanded ? "500px" : "0px", opacity: expanded ? 1 : 0 }}
          >
            <p className="text-xs text-muted-foreground mt-2 whitespace-pre-line">{item.full_description}</p>
          </div>
        </div>
      )}

      {/* CTA Buttons */}
      <div className="px-4 pb-4 pt-1 flex flex-col sm:flex-row gap-2">
        {(item.emergency_phone || item.phone) && (
          <a
            href={`tel:${item.emergency_phone || item.phone}`}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.97] ${
              item.emergency_phone
                ? "bg-red-600 hover:bg-red-700 text-white shadow-sm"
                : "bg-[hsl(220,50%,30%)] hover:bg-[hsl(220,50%,25%)] text-white"
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            {item.emergency_phone ? "জরুরি কল করুন" : "কল করুন"}
          </a>
        )}
        {item.map_link && (
          <a
            href={item.map_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-foreground transition-all active:scale-[0.97]"
          >
            <MapPin className="w-3.5 h-3.5" /> লোকেশন দেখুন
          </a>
        )}
      </div>
    </div>
  );
};

const PolicePage = () => {
  const [items, setItems] = useState<PoliceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "station" | "officer">("all");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterService, setFilterService] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("police_stations")
      .select("*")
      .eq("is_approved", true)
      .order("sort_order")
      .order("created_at", { ascending: false });
    setItems((data as PoliceItem[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const ch = supabase
      .channel("police_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "police_stations" }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const districts = useMemo(() => {
    const set = new Set(items.map(i => i.district).filter(Boolean));
    return Array.from(set) as string[];
  }, [items]);

  const serviceTypesList = useMemo(() => {
    const set = new Set(items.flatMap(i => i.service_types || []));
    return Array.from(set);
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter(item => {
      if (filterType !== "all" && item.type !== filterType) return false;
      if (filterDistrict && item.district !== filterDistrict) return false;
      if (filterService && !(item.service_types || []).includes(filterService)) return false;
      if (search) {
        const q = search.toLowerCase();
        const match = item.name.toLowerCase().includes(q) ||
          (item.thana || "").toLowerCase().includes(q) ||
          (item.location || "").toLowerCase().includes(q) ||
          (item.rank || "").toLowerCase().includes(q) ||
          (item.assigned_station || "").toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [items, filterType, filterDistrict, filterService, search]);

  const stationCount = items.filter(i => i.type === "station").length;
  const officerCount = items.filter(i => i.type === "officer").length;

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto pb-20">
      <PageHeader
        title="পুলিশ সেবা"
        color="linear-gradient(135deg, hsl(220,50%,25%), hsl(220,60%,40%))"
      />

      <div className="px-4 -mt-2 space-y-3">
        <PageAdBanner pageSlug="police" />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-card rounded-xl border border-border/60 p-3 text-center">
            <p className="text-lg font-bold text-foreground">{items.length}</p>
            <p className="text-[10px] text-muted-foreground">মোট</p>
          </div>
          <div className="bg-card rounded-xl border border-border/60 p-3 text-center">
            <p className="text-lg font-bold text-[hsl(220,50%,45%)]">{stationCount}</p>
            <p className="text-[10px] text-muted-foreground">থানা</p>
          </div>
          <div className="bg-card rounded-xl border border-border/60 p-3 text-center">
            <p className="text-lg font-bold text-[hsl(220,50%,45%)]">{officerCount}</p>
            <p className="text-[10px] text-muted-foreground">কর্মকর্তা</p>
          </div>
        </div>

        {/* Search + Filter Toggle */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="থানা, কর্মকর্তা বা এলাকা খুঁজুন..."
              className="w-full bg-card rounded-xl pl-9 pr-4 py-2.5 text-sm border border-border/60 outline-none focus:border-[hsl(220,50%,45%)]/50 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`w-10 h-10 rounded-xl border border-border/60 flex items-center justify-center transition-colors ${showFilters ? "bg-[hsl(220,50%,30%)] text-white" : "bg-card text-muted-foreground"}`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-card rounded-xl border border-border/60 p-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Type Filter */}
            <div className="flex gap-1.5">
              {([["all", "সব"], ["station", "থানা"], ["officer", "কর্মকর্তা"]] as const).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setFilterType(val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    filterType === val ? "bg-[hsl(220,50%,30%)] text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {/* District Filter */}
            {districts.length > 0 && (
              <select
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-xs"
              >
                <option value="">সব জেলা</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            )}
            {/* Service Type Filter */}
            {serviceTypesList.length > 0 && (
              <select
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
                className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-xs"
              >
                <option value="">সব সেবা ধরন</option>
                {serviceTypesList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
          </div>
        )}

        {/* Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">কোন তথ্য পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map(item => <PoliceCard key={item.id} item={item} />)}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default PolicePage;
