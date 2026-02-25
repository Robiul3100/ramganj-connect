import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye, LayoutGrid, List, Megaphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import { SvgIcons, borderColorMap } from "@/components/ServiceGrid";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string | null;
  view_count?: number;
}

interface Ad {
  id: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  link_url?: string | null;
}

const DynamicAdCard = ({ ad }: { ad?: Ad }) => {
  if (!ad) return null;
  const handleAdClick = () => {
    supabase.rpc("increment_ad_click", { ad_id: ad.id });
  };
  const content = (
    <div className="rounded-xl overflow-hidden relative group" onClick={handleAdClick}>
      {ad.image_url ? (
        <img src={ad.image_url} alt={ad.title} className="w-full aspect-[6/1] object-cover" />
      ) : (
        <div className="w-full aspect-[6/1] bg-primary/5 flex items-center justify-center gap-2">
          <Megaphone className="w-5 h-5 text-primary" />
          <p className="text-sm font-bold text-primary">{ad.title}</p>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none ad-shine" />
    </div>
  );
  return ad.link_url ? <a href={ad.link_url} target="_blank" rel="noopener noreferrer">{content}</a> : content;
};

const GridSkeleton = () => (
  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
    {Array.from({ length: 18 }).map((_, i) => (
      <div key={i} className="bg-card rounded-2xl flex flex-col items-center gap-1.5 py-4 px-1.5" style={{ border: "0.8px solid hsl(220,15%,88%)" }}>
        <div className="w-12 h-12 rounded-xl skeleton-shimmer" />
        <div className="w-16 h-3 rounded-md skeleton-shimmer" />
        <div className="w-10 h-2 rounded skeleton-shimmer" />
      </div>
    ))}
  </div>
);

const CardSkeleton = () => (
  <div className="flex flex-col gap-2.5">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="bg-card rounded-2xl flex items-center gap-3.5 p-3.5" style={{ border: "0.8px solid hsl(220,15%,88%)" }}>
        <div className="w-11 h-11 rounded-xl skeleton-shimmer shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="w-3/4 h-3.5 rounded-md skeleton-shimmer" />
          <div className="w-1/2 h-2.5 rounded skeleton-shimmer" />
        </div>
        <div className="w-12 h-5 rounded-full skeleton-shimmer shrink-0" />
      </div>
    ))}
  </div>
);

const Services = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "card">("grid");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [catRes, adRes] = await Promise.all([
        supabase.from("service_categories").select("*").eq("is_active", true).order("sort_order"),
        (supabase.from as any)("advertisements").select("*").eq("is_active", true).order("sort_order"),
      ]);
      setCategories((catRes.data as Category[]) || []);
      const now = new Date().toISOString();
      setAds(((adRes.data as Ad[]) || []).filter((a: any) => !a.expire_at || a.expire_at > now));
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleNavigate = async (cat: Category) => {
    await supabase.rpc("increment_category_view", { cat_id: cat.id });
    setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, view_count: (c.view_count ?? 0) + 1 } : c));
    navigate(`/service/${cat.slug}`);
  };

  const handleViewModeChange = (mode: "grid" | "card") => {
    setViewMode(mode);
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto pb-20">
      <PageHeader title="সকল সেবাসমূহ" />
      <div className="px-4 -mt-2 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input type="text" placeholder="সেবা খুঁজুন..." className="search-input pl-12" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{loading ? "লোড হচ্ছে..." : `${filtered.length} টি ক্যাটাগরি`}</p>
          <div className="flex items-center gap-1 bg-muted rounded-full p-0.5">
            <button
              onClick={() => handleViewModeChange("grid")}
              className={`p-1.5 rounded-full transition-all ${viewMode === "grid" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleViewModeChange("card")}
              className={`p-1.5 rounded-full transition-all ${viewMode === "card" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {loading ? (
          viewMode === "grid" ? <GridSkeleton /> : <CardSkeleton />
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {filtered.map((cat) => {
              const iconData = SvgIcons[cat.icon] || SvgIcons["Tag"];
              const bColor = borderColorMap[cat.icon] || "hsl(210,60%,72%)";
              return (
                <button key={cat.id} onClick={() => handleNavigate(cat)}
                  className="relative bg-card rounded-2xl flex flex-col items-center gap-1.5 py-4 px-1.5 transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95"
                  style={{ border: `0.8px solid ${bColor}` }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm" style={{ background: iconData.bg }}>
                    {iconData.svg}
                  </div>
                  <span className="text-[11px] font-semibold text-foreground text-center leading-tight line-clamp-2">{cat.name}</span>
                  <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                    <Eye className="w-2.5 h-2.5" /> {cat.view_count ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map((cat, index) => {
              const iconData = SvgIcons[cat.icon] || SvgIcons["Tag"];
              const bColor = borderColorMap[cat.icon] || "hsl(210,60%,72%)";
              return (
                <div key={cat.id}>
                  <button onClick={() => handleNavigate(cat)}
                    className="bg-card rounded-2xl flex items-center gap-3.5 p-3.5 w-full text-left transition-all duration-200 hover:shadow-md hover:scale-[1.01] active:scale-[0.98]"
                    style={{ border: `0.8px solid ${bColor}` }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: iconData.bg }}>
                      {iconData.svg}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-foreground leading-tight">{cat.name}</h3>
                      {cat.description && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{cat.description}</p>
                      )}
                    </div>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0 bg-muted/60 px-2 py-0.5 rounded-full">
                      <Eye className="w-3 h-3" /> {cat.view_count ?? 0}
                    </span>
                  </button>
                  {(index + 1) % 5 === 0 && ads.length > 0 && <div className="mt-2.5"><DynamicAdCard ad={ads[Math.floor((index + 1) / 5 - 1) % ads.length]} /></div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Services;
