import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye, LayoutGrid, List, Megaphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import {
  Stethoscope, Building2, Pill, GraduationCap, Store, Tag, Briefcase, MapPin,
  Calendar, Globe, Ambulance, Shield, Flame, Bus, Zap, Scale, Landmark, Users,
  Umbrella, Package, Sprout, Home, BookOpenCheck, UtensilsCrossed, Wrench, PenTool, Heart,
  Activity, Car, Building, TrendingUp, BedDouble, Coffee, Video, TreePine
} from "lucide-react";

const iconMap: Record<string, any> = {
  Stethoscope, Building2, Pill, GraduationCap, Store, Tag, Briefcase, MapPin,
  Calendar, Globe, Ambulance, Shield, Flame, Bus, Zap, Scale, Landmark, Users,
  Umbrella, Package, Sprout, Home, BookOpenCheck, UtensilsCrossed, Wrench, PenTool, Heart,
  Activity, Car, Building, TrendingUp, BedDouble, Coffee, Video, TreePine,
};

const colorMap: Record<string, { color: string; bg: string }> = {
  Stethoscope: { color: "hsl(185,60%,42%)", bg: "hsl(185,60%,92%)" },
  Building2: { color: "hsl(150,60%,40%)", bg: "hsl(150,60%,92%)" },
  Pill: { color: "hsl(160,50%,45%)", bg: "hsl(160,50%,92%)" },
  GraduationCap: { color: "hsl(120,45%,40%)", bg: "hsl(120,45%,92%)" },
  Store: { color: "hsl(330,55%,55%)", bg: "hsl(330,55%,92%)" },
  Tag: { color: "hsl(160,50%,40%)", bg: "hsl(160,50%,92%)" },
  Briefcase: { color: "hsl(250,40%,50%)", bg: "hsl(250,40%,92%)" },
  MapPin: { color: "hsl(0,60%,50%)", bg: "hsl(0,60%,92%)" },
  Calendar: { color: "hsl(270,60%,55%)", bg: "hsl(270,60%,92%)" },
  Globe: { color: "hsl(195,70%,50%)", bg: "hsl(195,70%,92%)" },
  Ambulance: { color: "hsl(150,55%,45%)", bg: "hsl(150,55%,92%)" },
  Shield: { color: "hsl(265,50%,55%)", bg: "hsl(265,50%,92%)" },
  Flame: { color: "hsl(15,80%,50%)", bg: "hsl(15,80%,92%)" },
  Bus: { color: "hsl(220,20%,40%)", bg: "hsl(220,20%,92%)" },
  Zap: { color: "hsl(50,80%,45%)", bg: "hsl(50,80%,92%)" },
  Scale: { color: "hsl(220,30%,45%)", bg: "hsl(220,30%,92%)" },
  Landmark: { color: "hsl(170,55%,40%)", bg: "hsl(170,55%,92%)" },
  Users: { color: "hsl(210,50%,50%)", bg: "hsl(210,50%,92%)" },
  Umbrella: { color: "hsl(200,60%,50%)", bg: "hsl(200,60%,92%)" },
  Package: { color: "hsl(30,60%,50%)", bg: "hsl(30,60%,92%)" },
  Sprout: { color: "hsl(100,50%,42%)", bg: "hsl(100,50%,92%)" },
  Home: { color: "hsl(25,80%,50%)", bg: "hsl(25,80%,92%)" },
  BookOpenCheck: { color: "hsl(170,50%,42%)", bg: "hsl(170,50%,92%)" },
  UtensilsCrossed: { color: "hsl(30,75%,50%)", bg: "hsl(30,75%,92%)" },
  Wrench: { color: "hsl(220,30%,45%)", bg: "hsl(220,30%,92%)" },
  PenTool: { color: "hsl(250,40%,50%)", bg: "hsl(250,40%,92%)" },
  Heart: { color: "hsl(340,70%,55%)", bg: "hsl(340,70%,92%)" },
  Activity: { color: "hsl(190,60%,45%)", bg: "hsl(190,60%,92%)" },
  Car: { color: "hsl(160,55%,40%)", bg: "hsl(160,55%,92%)" },
  Building: { color: "hsl(210,40%,50%)", bg: "hsl(210,40%,92%)" },
  TrendingUp: { color: "hsl(140,50%,42%)", bg: "hsl(140,50%,92%)" },
  BedDouble: { color: "hsl(35,70%,50%)", bg: "hsl(35,70%,92%)" },
  Coffee: { color: "hsl(15,70%,50%)", bg: "hsl(15,70%,92%)" },
  Video: { color: "hsl(240,50%,55%)", bg: "hsl(240,50%,92%)" },
  TreePine: { color: "hsl(130,50%,40%)", bg: "hsl(130,50%,92%)" },
};

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

const Services = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "card">("grid");

  useEffect(() => {
    const fetchData = async () => {
      const [catRes, adRes] = await Promise.all([
        supabase.from("service_categories").select("*").eq("is_active", true).order("sort_order"),
        (supabase.from as any)("advertisements").select("*").eq("is_active", true).order("sort_order"),
      ]);
      setCategories((catRes.data as Category[]) || []);
      setAds((adRes.data as Ad[]) || []);
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
          <p className="text-xs text-muted-foreground">{filtered.length} টি ক্যাটাগরি</p>
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

        {viewMode === "grid" ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {filtered.map((cat) => {
              const Icon = iconMap[cat.icon] || Tag;
              const colors = colorMap[cat.icon] || { color: "hsl(210,85%,55%)", bg: "hsl(210,85%,93%)" };
              return (
                <button key={cat.id} onClick={() => handleNavigate(cat)}
                  className="relative bg-card rounded-2xl border border-border/60 flex flex-col items-center gap-1.5 py-4 px-1.5 transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 hover:border-primary/30">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: colors.bg, color: colors.color }}>
                    <Icon className="w-6 h-6" />
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
              const Icon = iconMap[cat.icon] || Tag;
              const colors = colorMap[cat.icon] || { color: "hsl(210,85%,55%)", bg: "hsl(210,85%,93%)" };
              return (
                <div key={cat.id}>
                  <button onClick={() => handleNavigate(cat)}
                    className="bg-card rounded-2xl border border-border/60 flex items-center gap-3.5 p-3.5 w-full text-left transition-all duration-200 hover:shadow-md hover:scale-[1.01] active:scale-[0.98] hover:border-primary/30">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: colors.bg, color: colors.color }}>
                      <Icon className="w-5 h-5" />
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
