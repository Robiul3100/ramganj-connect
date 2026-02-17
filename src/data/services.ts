import {
  Info, Phone, Building2, Droplets, Shield, Ambulance, Stethoscope, Pill,
  Zap, Flame, Bus, GraduationCap, Umbrella, Briefcase, Scale, Store,
  Lightbulb, Users, ShoppingCart, ShieldCheck, Headphones, Landmark, FileText,
  Image, BookOpen, MapPin, Package,
  MonitorSmartphone, Home, Sprout, Truck, BookOpenCheck, UtensilsCrossed, Wrench, PenTool, Heart,
  AlertTriangle, Calendar, Globe
} from "lucide-react";

export interface Service {
  id: string;
  name: string;
  icon: any;
  iconColor: string;
  iconBg: string;
  status: "active" | "coming_soon";
  order: number;
  route?: string;
}

export const services: Service[] = [
  { id: "1", name: "রামগঞ্জ সম্পর্কে", icon: Info, iconColor: "hsl(210, 85%, 55%)", iconBg: "hsl(210, 85%, 93%)", status: "active", order: 1, route: "/about-ramganj" },
  { id: "2", name: "জরুরি কল", icon: Phone, iconColor: "hsl(0, 70%, 55%)", iconBg: "hsl(0, 70%, 93%)", status: "active", order: 2, route: "/emergency-calls" },
  { id: "3", name: "হাসপাতাল", icon: Building2, iconColor: "hsl(150, 60%, 40%)", iconBg: "hsl(150, 60%, 92%)", status: "active", order: 3 },
  { id: "4", name: "রক্ত", icon: Droplets, iconColor: "hsl(0, 80%, 55%)", iconBg: "hsl(0, 80%, 93%)", status: "active", order: 4, route: "/blood-bank" },
  { id: "5", name: "পুলিশ", icon: Shield, iconColor: "hsl(265, 50%, 55%)", iconBg: "hsl(265, 50%, 93%)", status: "active", order: 5 },
  { id: "6", name: "অ্যাম্বুলেন্স", icon: Ambulance, iconColor: "hsl(150, 55%, 45%)", iconBg: "hsl(150, 55%, 92%)", status: "active", order: 6 },
  { id: "7", name: "ডাক্তার তালিকা", icon: Stethoscope, iconColor: "hsl(185, 60%, 42%)", iconBg: "hsl(185, 60%, 92%)", status: "active", order: 7 },
  { id: "8", name: "ফার্মেসি", icon: Pill, iconColor: "hsl(160, 50%, 45%)", iconBg: "hsl(160, 50%, 92%)", status: "active", order: 8 },
  { id: "9", name: "বিদ্যুৎ অফিস", icon: Zap, iconColor: "hsl(50, 80%, 45%)", iconBg: "hsl(50, 80%, 92%)", status: "active", order: 9 },
  { id: "10", name: "ফায়ার সার্ভিস", icon: Flame, iconColor: "hsl(15, 80%, 50%)", iconBg: "hsl(15, 40%, 90%)", status: "active", order: 10 },
  { id: "11", name: "যাতায়াত", icon: Bus, iconColor: "hsl(220, 20%, 40%)", iconBg: "hsl(220, 20%, 92%)", status: "active", order: 11 },
  { id: "12", name: "শিক্ষা", icon: GraduationCap, iconColor: "hsl(120, 45%, 40%)", iconBg: "hsl(120, 45%, 92%)", status: "active", order: 12 },
  { id: "13", name: "পর্যটন", icon: Umbrella, iconColor: "hsl(200, 60%, 50%)", iconBg: "hsl(200, 60%, 92%)", status: "active", order: 13 },
  { id: "14", name: "চাকরি", icon: Briefcase, iconColor: "hsl(250, 40%, 50%)", iconBg: "hsl(250, 40%, 92%)", status: "active", order: 14, route: "/jobs" },
  { id: "15", name: "আইনি সহায়তা", icon: Scale, iconColor: "hsl(220, 30%, 45%)", iconBg: "hsl(220, 30%, 92%)", status: "active", order: 15 },
  { id: "16", name: "দোকান", icon: Store, iconColor: "hsl(330, 55%, 55%)", iconBg: "hsl(330, 55%, 92%)", status: "active", order: 16 },
  { id: "17", name: "উদ্যোক্তা", icon: Lightbulb, iconColor: "hsl(40, 80%, 50%)", iconBg: "hsl(40, 80%, 92%)", status: "active", order: 17 },
  { id: "18", name: "সংগঠন", icon: Users, iconColor: "hsl(210, 50%, 50%)", iconBg: "hsl(210, 50%, 92%)", status: "active", order: 18 },
  { id: "19", name: "ইভেন্ট", icon: Calendar, iconColor: "hsl(270, 60%, 55%)", iconBg: "hsl(270, 60%, 92%)", status: "active", order: 19, route: "/events" },
  { id: "20", name: "অভিযোগ বক্স", icon: AlertTriangle, iconColor: "hsl(0, 60%, 50%)", iconBg: "hsl(0, 60%, 92%)", status: "active", order: 20, route: "/complaints" },
  { id: "21", name: "প্রবাসী কর্নার", icon: Globe, iconColor: "hsl(195, 70%, 50%)", iconBg: "hsl(195, 70%, 92%)", status: "active", order: 21, route: "/expatriate-corner" },
  { id: "22", name: "অনুদান", icon: Heart, iconColor: "hsl(340, 70%, 55%)", iconBg: "hsl(340, 70%, 92%)", status: "active", order: 22, route: "/donation" },
  { id: "23", name: "ব্যাংক", icon: Landmark, iconColor: "hsl(170, 55%, 40%)", iconBg: "hsl(170, 55%, 92%)", status: "active", order: 23 },
  { id: "24", name: "গ্যালারি", icon: Image, iconColor: "hsl(200, 55%, 48%)", iconBg: "hsl(200, 55%, 92%)", status: "active", order: 24 },
  { id: "25", name: "ব্লগ", icon: BookOpen, iconColor: "hsl(25, 75%, 50%)", iconBg: "hsl(25, 75%, 92%)", status: "active", order: 25 },
  { id: "26", name: "হারানো বিজ্ঞপ্তি", icon: MapPin, iconColor: "hsl(0, 60%, 50%)", iconBg: "hsl(0, 60%, 92%)", status: "active", order: 26, route: "/lost-found" },
  { id: "27", name: "কুরিয়ার ও পার্সেল", icon: Package, iconColor: "hsl(30, 60%, 50%)", iconBg: "hsl(30, 60%, 92%)", status: "active", order: 27 },
  { id: "28", name: "কৃষি ও খামার", icon: Sprout, iconColor: "hsl(100, 50%, 42%)", iconBg: "hsl(100, 50%, 92%)", status: "active", order: 28 },
  { id: "29", name: "সাপোর্ট", icon: Headphones, iconColor: "hsl(220, 40%, 45%)", iconBg: "hsl(220, 40%, 92%)", status: "active", order: 29 },
  // Coming Soon
  { id: "c1", name: "ডেভেলপার তথ্য", icon: MonitorSmartphone, iconColor: "hsl(220, 50%, 50%)", iconBg: "hsl(220, 20%, 92%)", status: "coming_soon", order: 1 },
  { id: "c2", name: "বাসা ভাড়া", icon: Home, iconColor: "hsl(25, 80%, 50%)", iconBg: "hsl(25, 80%, 92%)", status: "coming_soon", order: 2 },
  { id: "c3", name: "টিউশন মিডিয়া", icon: BookOpenCheck, iconColor: "hsl(170, 50%, 42%)", iconBg: "hsl(170, 50%, 92%)", status: "coming_soon", order: 3 },
  { id: "c4", name: "খাবার ডেলিভারি", icon: UtensilsCrossed, iconColor: "hsl(30, 75%, 50%)", iconBg: "hsl(30, 75%, 92%)", status: "coming_soon", order: 4 },
  { id: "c5", name: "মেরামতি সেবা", icon: Wrench, iconColor: "hsl(220, 30%, 45%)", iconBg: "hsl(220, 30%, 92%)", status: "coming_soon", order: 5 },
  { id: "c6", name: "দলিল লেখক", icon: PenTool, iconColor: "hsl(250, 40%, 50%)", iconBg: "hsl(250, 40%, 92%)", status: "coming_soon", order: 6 },
  { id: "c7", name: "বিবাহ মিডিয়া", icon: Heart, iconColor: "hsl(340, 70%, 55%)", iconBg: "hsl(340, 70%, 92%)", status: "coming_soon", order: 7 },
];

export const activeServices = services.filter(s => s.status === "active");
export const comingSoonServices = services.filter(s => s.status === "coming_soon");
