import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import { Search, MapPin, Calendar, Phone, Clock, User, Eye, ExternalLink, BadgeCheck, X, Users, Tag, Ticket, CalendarClock, Flame, ChevronDown } from "lucide-react";
import { format, differenceInHours, isPast, isFuture, isWithinInterval } from "date-fns";
import { bn } from "date-fns/locale";

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  tagline: string | null;
  category: string;
  status: string;
  event_date: string | null;
  start_date: string | null;
  end_date: string | null;
  event_time: string | null;
  location: string | null;
  map_link: string | null;
  image_url: string | null;
  organizer_name: string | null;
  organizer_image_url: string | null;
  organizer_location: string | null;
  is_verified: boolean;
  is_free: boolean;
  price: string | null;
  capacity: string | null;
  registration_open: boolean;
  registration_link: string | null;
  full_description: string | null;
  phone: string | null;
  icon_name: string | null;
  is_approved: boolean;
  created_at: string;
}

const themeColors = {
  accent: "hsl(270,60%,55%)",
  bg: "hsl(270,60%,94%)",
  gradient: "linear-gradient(135deg, hsl(270,60%,55%), hsl(290,55%,60%))",
};

const statusConfig: Record<string, { label: string; gradient: string; icon: typeof CalendarClock }> = {
  upcoming: { label: "আসন্ন", gradient: "linear-gradient(135deg, hsl(210,80%,50%), hsl(220,75%,55%))", icon: CalendarClock },
  ongoing: { label: "চলমান", gradient: "linear-gradient(135deg, hsl(150,60%,42%), hsl(160,55%,48%))", icon: Flame },
  completed: { label: "সম্পন্ন", gradient: "linear-gradient(135deg, hsl(0,0%,45%), hsl(0,0%,55%))", icon: BadgeCheck },
};

const categoryLabels: Record<string, string> = {
  "সেমিনার": "সেমিনার", "সাংস্কৃতিক": "সাংস্কৃতিক", "খেলাধুলা": "খেলাধুলা",
  "ধর্মীয়": "ধর্মীয়", "ওয়ার্কশপ": "ওয়ার্কশপ", "প্রতিযোগিতা": "প্রতিযোগিতা",
  "সামাজিক": "সামাজিক",
};

// Auto-detect status from dates
const getAutoStatus = (item: EventItem): string => {
  const now = new Date();
  if (item.start_date && item.end_date) {
    const start = new Date(item.start_date);
    const end = new Date(item.end_date);
    if (isFuture(start)) return "upcoming";
    if (isPast(end)) return "completed";
    if (isWithinInterval(now, { start, end })) return "ongoing";
  }
  if (item.start_date || item.event_date) {
    const d = new Date(item.start_date || item.event_date!);
    if (isFuture(d)) return "upcoming";
    if (isPast(d)) return "completed";
  }
  return item.status || "upcoming";
};

// Countdown
const getCountdown = (dateStr: string) => {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days} দিন ${hours} ঘণ্টা বাকি`;
  if (hours > 0) return `${hours} ঘণ্টা বাকি`;
  return "শীঘ্রই শুরু হবে";
};

// ──── Skeleton ────
const CardSkeleton = () => (
  <div className="rounded-[16px] overflow-hidden border border-border/60">
    <div className="w-full aspect-video skeleton-shimmer" />
    <div className="p-4 space-y-3">
      <div className="h-5 w-3/4 rounded skeleton-shimmer" />
      <div className="h-3 w-1/2 rounded skeleton-shimmer" />
      <div className="h-3 w-full rounded skeleton-shimmer" />
      <div className="grid grid-cols-2 gap-2">
        <div className="h-12 rounded-xl skeleton-shimmer" />
        <div className="h-12 rounded-xl skeleton-shimmer" />
      </div>
    </div>
    <div className="px-4 pb-4 grid grid-cols-2 gap-2">
      <div className="h-10 rounded-xl skeleton-shimmer" />
      <div className="h-10 rounded-xl skeleton-shimmer" />
    </div>
  </div>
);

// ──── Event Card ────
const EventCard = ({ item }: { item: EventItem }) => {
  const [expanded, setExpanded] = useState(false);
  const autoStatus = getAutoStatus(item);
  const sc = statusConfig[autoStatus] || statusConfig.upcoming;
  const isRecent = differenceInHours(new Date(), new Date(item.created_at)) < 24;
  const countdown = (autoStatus === "upcoming" && (item.start_date || item.event_date))
    ? getCountdown(item.start_date || item.event_date!)
    : null;

  return (
    <div className="relative rounded-[16px] bg-card overflow-hidden border border-border/50 transition-all duration-300 hover:shadow-xl group">
      {/* A) Full-width 16:9 Image */}
      <div className="relative w-full aspect-video overflow-hidden bg-muted">
        {item.image_url ? (
          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: themeColors.bg }}>
            <Calendar className="w-16 h-16 opacity-30" style={{ color: themeColors.accent }} />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card to-transparent" />

        {/* Status badge top-right */}
        <div className="absolute top-3 right-0 flex items-center gap-1 px-3 py-1.5 rounded-l-full shadow-lg z-10" style={{ background: sc.gradient }}>
          <sc.icon className="w-3.5 h-3.5 text-white" />
          <span className="text-[10px] font-extrabold text-white tracking-wide uppercase">{sc.label}</span>
        </div>

        {/* Category + recent badges top-left */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          {item.category && item.category !== "সামাজিক" && (
            <span className="px-2.5 py-1 rounded-full text-[9px] font-bold shadow-md text-white" style={{ background: themeColors.gradient }}>
              {categoryLabels[item.category] || item.category}
            </span>
          )}
          {isRecent && (
            <span className="px-2.5 py-1 rounded-full text-[9px] font-bold shadow-md flex items-center gap-1" style={{ background: "linear-gradient(135deg, hsl(45,90%,50%), hsl(35,85%,55%))", color: "white" }}>
              <Flame className="w-3 h-3" /> নতুন
            </span>
          )}
        </div>

        {/* Countdown badge */}
        {countdown && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-md z-10" style={{ background: "linear-gradient(135deg, hsl(210,80%,50%), hsl(220,75%,55%))", color: "white" }}>
            <Clock className="w-3 h-3" />
            <span className="text-[9px] font-bold">{countdown}</span>
          </div>
        )}

        {/* Free / Paid badge */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-md z-10" style={{ background: item.is_free ? "linear-gradient(135deg, hsl(150,60%,42%), hsl(160,55%,48%))" : "linear-gradient(135deg, hsl(45,90%,50%), hsl(35,85%,55%))", color: "white" }}>
          <Ticket className="w-3 h-3" />
          <span className="text-[9px] font-bold">{item.is_free ? "ফ্রি" : item.price || "পেইড"}</span>
        </div>
      </div>

      {/* B) Primary Info */}
      <div className="p-4 sm:p-5">
        <h3 className="font-extrabold text-foreground text-[16px] sm:text-[18px] leading-snug line-clamp-2">{item.title}</h3>
        {item.tagline && (
          <p className="text-[11px] text-muted-foreground mt-0.5 italic line-clamp-1">{item.tagline}</p>
        )}
        {item.is_verified && (
          <div className="flex items-center gap-1 mt-1">
            <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20" />
            <span className="text-[10px] font-bold text-blue-600">যাচাইকৃত</span>
          </div>
        )}
        {item.description && (
          <p className="text-[12px] text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{item.description}</p>
        )}

        {/* C) Key Details Grid */}
        <div className="grid grid-cols-2 gap-2 mt-3.5">
          {(item.start_date || item.event_date) && (
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 bg-muted/50 border border-border/30">
              <Calendar className="w-4 h-4 shrink-0" style={{ color: themeColors.accent }} />
              <div className="min-w-0">
                <p className="text-[9px] text-muted-foreground leading-none">তারিখ</p>
                <p className="text-[11px] font-bold text-foreground leading-tight mt-0.5 truncate">
                  {format(new Date(item.start_date || item.event_date!), "d MMM yyyy", { locale: bn })}
                  {item.end_date && ` - ${format(new Date(item.end_date), "d MMM", { locale: bn })}`}
                </p>
              </div>
            </div>
          )}
          {item.event_time && (
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 bg-muted/50 border border-border/30">
              <Clock className="w-4 h-4 shrink-0" style={{ color: themeColors.accent }} />
              <div className="min-w-0">
                <p className="text-[9px] text-muted-foreground leading-none">সময়</p>
                <p className="text-[11px] font-bold text-foreground leading-tight mt-0.5 truncate">{item.event_time}</p>
              </div>
            </div>
          )}
          {item.location && (
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 bg-muted/50 border border-border/30">
              <MapPin className="w-4 h-4 shrink-0" style={{ color: themeColors.accent }} />
              <div className="min-w-0">
                <p className="text-[9px] text-muted-foreground leading-none">স্থান</p>
                <p className="text-[11px] font-bold text-foreground leading-tight mt-0.5 truncate">{item.location}</p>
              </div>
            </div>
          )}
          {item.capacity && (
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 bg-muted/50 border border-border/30">
              <Users className="w-4 h-4 shrink-0" style={{ color: themeColors.accent }} />
              <div className="min-w-0">
                <p className="text-[9px] text-muted-foreground leading-none">ধারণক্ষমতা</p>
                <p className="text-[11px] font-bold text-foreground leading-tight mt-0.5 truncate">{item.capacity}</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Info Chips */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {item.registration_open && autoStatus !== "completed" && (
            <span className="px-2.5 py-1 rounded-full text-[9px] font-bold flex items-center gap-1" style={{ background: "hsl(150,60%,42%,0.1)", color: "hsl(150,60%,35%)" }}>
              🟢 রেজিস্ট্রেশন চলছে
            </span>
          )}
          {!item.is_free && item.price && (
            <span className="px-2.5 py-1 rounded-full text-[9px] font-bold" style={{ background: "hsl(45,90%,50%,0.1)", color: "hsl(45,80%,30%)" }}>
              🎟 {item.price}
            </span>
          )}
          {item.category && (
            <span className="px-2.5 py-1 rounded-full text-[9px] font-bold" style={{ background: themeColors.bg, color: themeColors.accent }}>
              📌 {item.category}
            </span>
          )}
        </div>

        {/* D) Organizer Section */}
        {item.organizer_name && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/30">
            {item.organizer_image_url ? (
              <img src={item.organizer_image_url} alt={item.organizer_name} className="w-9 h-9 rounded-full object-cover shrink-0 shadow-sm" style={{ border: `2.5px solid ${themeColors.accent}30` }} />
            ) : (
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm" style={{ background: themeColors.bg }}>
                <User className="w-4 h-4" style={{ color: themeColors.accent }} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[9px] text-muted-foreground leading-none">আয়োজক</p>
              <p className="text-[12px] font-bold text-foreground leading-tight mt-0.5 truncate">{item.organizer_name}</p>
              {item.organizer_location && (
                <p className="text-[10px] text-muted-foreground truncate">{item.organizer_location}</p>
              )}
            </div>
            {item.is_verified && <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500/20 shrink-0" />}
          </div>
        )}

        {/* Expandable details */}
        {expanded && (item.full_description) && (
          <div className="mt-3 pt-3 border-t border-border/30 animate-in fade-in slide-in-from-top-2 duration-200 space-y-2">
            {item.full_description && (
              <p className="text-[12px] text-muted-foreground leading-relaxed whitespace-pre-line">{item.full_description}</p>
            )}
          </div>
        )}
      </div>

      {/* CTA Buttons */}
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 grid grid-cols-3 gap-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="py-2.5 rounded-xl text-[11px] sm:text-[12px] font-bold flex items-center justify-center gap-1.5 bg-muted/70 text-foreground border border-border/40 hover:bg-muted transition-colors"
        >
          <Eye className="w-3.5 h-3.5" /> {expanded ? "সংক্ষেপ" : "বিস্তারিত"}
        </button>

        {autoStatus !== "completed" && item.registration_link ? (
          <a
            href={item.registration_link}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 rounded-xl text-[11px] sm:text-[12px] font-bold flex items-center justify-center gap-1.5 text-white active:scale-[0.97] transition-transform"
            style={{ background: themeColors.gradient }}
          >
            <Ticket className="w-3.5 h-3.5" /> যোগ দিন
          </a>
        ) : item.phone ? (
          <a
            href={`tel:${item.phone}`}
            className="py-2.5 rounded-xl text-[11px] sm:text-[12px] font-bold flex items-center justify-center gap-1.5 text-white active:scale-[0.97] transition-transform"
            style={{ background: themeColors.gradient }}
          >
            <Phone className="w-3.5 h-3.5" /> যোগাযোগ
          </a>
        ) : (
          <div className="py-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 bg-muted/40 text-muted-foreground cursor-not-allowed">
            <Phone className="w-3.5 h-3.5" /> যোগাযোগ
          </div>
        )}

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

// ──── Main Events Page ────
const EventsPage = () => {
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "upcoming" | "ongoing" | "completed">("all");

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("is_approved", true)
      .order("created_at", { ascending: false });
    setItems((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
    const channel = supabase
      .channel("events_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, fetchItems)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = useMemo(() => items.filter((item) => {
    const autoStatus = getAutoStatus(item);
    if (filter !== "all" && autoStatus !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!item.title.toLowerCase().includes(q) && !(item.description || "").toLowerCase().includes(q) && !(item.location || "").toLowerCase().includes(q) && !(item.organizer_name || "").toLowerCase().includes(q)) return false;
    }
    return true;
  }), [items, filter, search]);

  const statusCounts = useMemo(() => {
    const counts = { all: items.length, upcoming: 0, ongoing: 0, completed: 0 };
    items.forEach(i => { const s = getAutoStatus(i); if (s in counts) counts[s as keyof typeof counts]++; });
    return counts;
  }, [items]);

  const filterTabs = [
    { key: "all" as const, label: "সব", count: statusCounts.all },
    { key: "upcoming" as const, label: "আসন্ন", count: statusCounts.upcoming },
    { key: "ongoing" as const, label: "চলমান", count: statusCounts.ongoing },
    { key: "completed" as const, label: "সম্পন্ন", count: statusCounts.completed },
  ];

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto pb-20">
      <PageHeader title="ইভেন্ট সমূহ" color={themeColors.gradient} />

      <div className="px-4 -mt-2 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="ইভেন্ট খুঁজুন..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-card border border-border/60 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                filter === tab.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 text-xs">
          <span className="bg-muted px-3 py-1.5 rounded-full text-muted-foreground font-medium">
            মোট: {items.length}
          </span>
          {statusCounts.upcoming > 0 && (
            <span className="px-3 py-1.5 rounded-full font-medium flex items-center gap-1" style={{ background: "hsl(210,80%,50%,0.1)", color: "hsl(210,70%,40%)" }}>
              <CalendarClock className="w-3 h-3" /> আসন্ন: {statusCounts.upcoming}
            </span>
          )}
        </div>

        {/* Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground">কোনো ইভেন্ট নেই</h3>
            <p className="text-sm text-muted-foreground mt-1">বর্তমানে কোনো ইভেন্ট পাওয়া যায়নি।</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground font-semibold">{filtered.length}টি ইভেন্ট পাওয়া গেছে</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-6">
              {filtered.map((item) => (
                <EventCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default EventsPage;
