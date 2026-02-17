import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Stethoscope, Building2, Pill, GraduationCap, Store, Tag, Briefcase, MapPin,
  Calendar, Globe, Ambulance, Shield, Flame, Bus, Zap, Scale, Landmark, Users,
  Umbrella, Package, Sprout, Home, BookOpenCheck, UtensilsCrossed, Wrench, PenTool, Heart,
  Newspaper, Activity, Car, Building, TrendingUp, BedDouble, Coffee, Video, TreePine
} from "lucide-react";

const iconMap: Record<string, any> = {
  Stethoscope, Building2, Pill, GraduationCap, Store, Tag, Briefcase, MapPin,
  Calendar, Globe, Ambulance, Shield, Flame, Bus, Zap, Scale, Landmark, Users,
  Umbrella, Package, Sprout, Home, BookOpenCheck, UtensilsCrossed, Wrench, PenTool, Heart,
  Newspaper, Activity, Car, Building, TrendingUp, BedDouble, Coffee, Video, TreePine,
};

const colorMap: Record<string, { iconColor: string; iconBg: string }> = {
  Stethoscope: { iconColor: "hsl(185,60%,42%)", iconBg: "hsl(185,60%,92%)" },
  Building2: { iconColor: "hsl(150,60%,40%)", iconBg: "hsl(150,60%,92%)" },
  Pill: { iconColor: "hsl(160,50%,45%)", iconBg: "hsl(160,50%,92%)" },
  GraduationCap: { iconColor: "hsl(120,45%,40%)", iconBg: "hsl(120,45%,92%)" },
  Store: { iconColor: "hsl(330,55%,55%)", iconBg: "hsl(330,55%,92%)" },
  Tag: { iconColor: "hsl(160,50%,40%)", iconBg: "hsl(160,50%,92%)" },
  Briefcase: { iconColor: "hsl(250,40%,50%)", iconBg: "hsl(250,40%,92%)" },
  MapPin: { iconColor: "hsl(0,60%,50%)", iconBg: "hsl(0,60%,92%)" },
  Calendar: { iconColor: "hsl(270,60%,55%)", iconBg: "hsl(270,60%,92%)" },
  Globe: { iconColor: "hsl(195,70%,50%)", iconBg: "hsl(195,70%,92%)" },
  Ambulance: { iconColor: "hsl(150,55%,45%)", iconBg: "hsl(150,55%,92%)" },
  Shield: { iconColor: "hsl(265,50%,55%)", iconBg: "hsl(265,50%,92%)" },
  Flame: { iconColor: "hsl(15,80%,50%)", iconBg: "hsl(15,80%,92%)" },
  Bus: { iconColor: "hsl(220,20%,40%)", iconBg: "hsl(220,20%,92%)" },
  Zap: { iconColor: "hsl(50,80%,45%)", iconBg: "hsl(50,80%,92%)" },
  Scale: { iconColor: "hsl(220,30%,45%)", iconBg: "hsl(220,30%,92%)" },
  Landmark: { iconColor: "hsl(170,55%,40%)", iconBg: "hsl(170,55%,92%)" },
  Users: { iconColor: "hsl(210,50%,50%)", iconBg: "hsl(210,50%,92%)" },
  Umbrella: { iconColor: "hsl(200,60%,50%)", iconBg: "hsl(200,60%,92%)" },
  Package: { iconColor: "hsl(30,60%,50%)", iconBg: "hsl(30,60%,92%)" },
  Sprout: { iconColor: "hsl(100,50%,42%)", iconBg: "hsl(100,50%,92%)" },
  Home: { iconColor: "hsl(25,80%,50%)", iconBg: "hsl(25,80%,92%)" },
  BookOpenCheck: { iconColor: "hsl(170,50%,42%)", iconBg: "hsl(170,50%,92%)" },
  UtensilsCrossed: { iconColor: "hsl(30,75%,50%)", iconBg: "hsl(30,75%,92%)" },
  Wrench: { iconColor: "hsl(220,30%,45%)", iconBg: "hsl(220,30%,92%)" },
  PenTool: { iconColor: "hsl(250,40%,50%)", iconBg: "hsl(250,40%,92%)" },
  Heart: { iconColor: "hsl(340,70%,55%)", iconBg: "hsl(340,70%,92%)" },
  Newspaper: { iconColor: "hsl(0,75%,50%)", iconBg: "hsl(0,75%,92%)" },
  Activity: { iconColor: "hsl(190,60%,45%)", iconBg: "hsl(190,60%,92%)" },
  Car: { iconColor: "hsl(160,55%,40%)", iconBg: "hsl(160,55%,92%)" },
  Building: { iconColor: "hsl(210,40%,50%)", iconBg: "hsl(210,40%,92%)" },
  TrendingUp: { iconColor: "hsl(140,50%,42%)", iconBg: "hsl(140,50%,92%)" },
  BedDouble: { iconColor: "hsl(35,70%,50%)", iconBg: "hsl(35,70%,92%)" },
  Coffee: { iconColor: "hsl(15,70%,50%)", iconBg: "hsl(15,70%,92%)" },
  Video: { iconColor: "hsl(240,50%,55%)", iconBg: "hsl(240,50%,92%)" },
  TreePine: { iconColor: "hsl(130,50%,40%)", iconBg: "hsl(130,50%,92%)" },
};

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

const newsItem = { id: "news-static", name: "খবর ও সংবাদ", slug: "news", icon: "Newspaper", sort_order: -1 };

const ServiceGrid = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("service_categories").select("*").eq("is_active", true).order("sort_order");
      setCategories((data as Category[]) || []);
    };
    fetch();
  }, []);

  const allItems = [newsItem as Category, ...categories];

  const staticRoutes: Record<string, string> = {
    news: "/news",
  };

  return (
    <section className="px-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">সেবাসমূহ</h2>
        <span className="text-sm font-semibold text-primary">{allItems.length} টি</span>
      </div>
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {allItems.map((cat) => {
          const Icon = iconMap[cat.icon] || Tag;
          const colors = colorMap[cat.icon] || { iconColor: "hsl(210,85%,55%)", iconBg: "hsl(210,85%,93%)" };
          const route = staticRoutes[cat.slug] || `/service/${cat.slug}`;

          return (
            <button
              key={cat.id}
              onClick={() => navigate(route)}
              className="glass-card-hover flex flex-col items-center gap-2 py-4 px-1 h-full transition-transform duration-200 hover:scale-105 active:scale-95"
            >
              <div className="service-icon-wrapper transition-transform duration-200 group-hover:scale-110" style={{ backgroundColor: colors.iconBg, color: colors.iconColor }}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-foreground text-center leading-tight">
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default ServiceGrid;
