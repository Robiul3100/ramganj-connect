import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
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
}

const Services = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCats = async () => {
      const { data } = await supabase.from("service_categories").select("*").eq("is_active", true).order("sort_order");
      setCategories((data as Category[]) || []);
    };
    fetchCats();
  }, []);

  const filtered = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto pb-20">
      <PageHeader title="সকল সেবাসমূহ" />
      <div className="px-4 -mt-2 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input type="text" placeholder="সেবা খুঁজুন..." className="search-input pl-12" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <p className="text-xs text-muted-foreground">{filtered.length} টি ক্যাটাগরি</p>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filtered.map((cat) => {
            const Icon = iconMap[cat.icon] || Tag;
            const colors = colorMap[cat.icon] || { color: "hsl(210,85%,55%)", bg: "hsl(210,85%,93%)" };
            return (
              <button key={cat.id} onClick={() => navigate(`/service/${cat.slug}`)}
                className="glass-card-hover flex flex-col items-center gap-2 py-5 px-2">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: colors.bg, color: colors.color }}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-foreground text-center leading-tight">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Services;
