import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Megaphone, Phone, Stethoscope, Building2, ChevronRight,
  Clock, AlertTriangle, MapPin, Users
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/* ── Notice Board Widget ── */
export const NoticeWidget = () => {
  const [announcements, setAnnouncements] = useState<{ id: string; text: string; created_at: string }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await (supabase.from as any)("announcements")
        .select("id, text, created_at")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(3);
      if (data) setAnnouncements(data);
    };
    fetch();
  }, []);

  return (
    <WidgetCard
      title="নোটিশ বোর্ড"
      icon={<Megaphone className="w-4 h-4" />}
      gradient="from-primary to-primary/80"
      onSeeAll={() => navigate("/notifications")}
    >
      {announcements.length === 0 && <EmptyWidget text="কোনো নোটিশ নেই" />}
      {announcements.map((a) => (
        <div key={a.id} className="flex gap-2.5 items-start py-2 border-b border-border/50 last:border-0">
          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-foreground font-medium line-clamp-2 leading-relaxed">{a.text}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {new Date(a.created_at).toLocaleDateString("bn-BD", { day: "numeric", month: "short" })}
            </p>
          </div>
        </div>
      ))}
    </WidgetCard>
  );
};

/* ── Emergency Widget ── */
export const EmergencyWidget = () => {
  const [calls, setCalls] = useState<{ id: string; name: string; phone: string }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await (supabase.from as any)("emergency_calls")
        .select("id, name, phone")
        .eq("is_active", true)
        .order("sort_order")
        .limit(4);
      if (data) setCalls(data);
    };
    fetch();
  }, []);

  return (
    <WidgetCard
      title="জরুরি সেবা"
      icon={<AlertTriangle className="w-4 h-4" />}
      gradient="from-destructive to-destructive/80"
      onSeeAll={() => navigate("/emergency-calls")}
    >
      <div className="grid grid-cols-2 gap-2">
        {calls.map((c) => (
          <a
            key={c.id}
            href={`tel:${c.phone}`}
            className="flex items-center gap-2 bg-destructive/5 hover:bg-destructive/10 rounded-xl px-3 py-2.5 transition-colors group"
          >
            <Phone className="w-3.5 h-3.5 text-destructive shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-foreground truncate">{c.name}</p>
              <p className="text-[10px] text-muted-foreground">{c.phone}</p>
            </div>
          </a>
        ))}
      </div>
    </WidgetCard>
  );
};

/* ── Doctors Widget ── */
export const DoctorsWidget = () => {
  const [doctors, setDoctors] = useState<{ id: string; title: string; phone: string | null; metadata: any }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("services")
        .select("id, title, phone, metadata, service_categories!inner(slug)")
        .eq("status", "approved")
        .eq("service_categories.slug", "doctors")
        .limit(4);
      if (data) setDoctors(data as any);
    };
    fetch();
  }, []);

  return (
    <WidgetCard
      title="ডাক্তার তালিকা"
      icon={<Stethoscope className="w-4 h-4" />}
      gradient="from-blue-500 to-indigo-500"
      onSeeAll={() => navigate("/service/doctors")}
    >
      {doctors.length === 0 && <EmptyWidget text="কোনো ডাক্তার নেই" />}
      {doctors.map((d) => (
        <div key={d.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
          <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
            <Stethoscope className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{d.title}</p>
            <p className="text-[10px] text-muted-foreground">{(d.metadata as any)?.specialty || "সাধারণ"}</p>
          </div>
          {d.phone && (
            <a href={`tel:${d.phone}`} className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Phone className="w-3.5 h-3.5 text-primary" />
            </a>
          )}
        </div>
      ))}
    </WidgetCard>
  );
};

/* ── Offices Widget ── */
export const OfficesWidget = () => {
  const [offices, setOffices] = useState<{ id: string; name: string; phone: string | null; category: string }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await (supabase.from as any)("offices")
        .select("id, name, phone, category")
        .eq("is_active", true)
        .order("sort_order")
        .limit(4);
      if (data) setOffices(data);
    };
    fetch();
  }, []);

  return (
    <WidgetCard
      title="গুরুত্বপূর্ণ অফিস"
      icon={<Building2 className="w-4 h-4" />}
      gradient="from-emerald-500 to-teal-500"
      onSeeAll={() => navigate("/offices")}
    >
      {offices.length === 0 && <EmptyWidget text="কোনো অফিস যোগ হয়নি" />}
      {offices.map((o) => (
        <div key={o.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
          <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{o.name}</p>
            <p className="text-[10px] text-muted-foreground">{o.category}</p>
          </div>
          {o.phone && (
            <a href={`tel:${o.phone}`} className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Phone className="w-3.5 h-3.5 text-primary" />
            </a>
          )}
        </div>
      ))}
    </WidgetCard>
  );
};

/* ── Quick Stats Widget ── */
export const QuickStatsWidget = () => {
  const [stats, setStats] = useState({ categories: 0, services: 0, offices: 0 });

  useEffect(() => {
    const fetch = async () => {
      const [cats, svcs, offs] = await Promise.all([
        supabase.from("service_categories").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("services").select("*", { count: "exact", head: true }).eq("status", "approved"),
        (supabase.from as any)("offices").select("*", { count: "exact", head: true }).eq("is_active", true),
      ]);
      setStats({
        categories: cats.count || 0,
        services: svcs.count || 0,
        offices: offs.count || 0,
      });
    };
    fetch();
  }, []);

  const items = [
    { label: "ক্যাটাগরি", value: stats.categories, icon: Users },
    { label: "সেবা তালিকা", value: stats.services, icon: Stethoscope },
    { label: "অফিস", value: stats.offices, icon: Building2 },
  ];

  return (
    <div className="px-4">
      <div className="gradient-stats rounded-2xl p-4 grid grid-cols-3 gap-3 text-primary-foreground">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="text-center">
              <Icon className="w-5 h-5 mx-auto mb-1 opacity-80" />
              <p className="text-2xl font-bold">{item.value}</p>
              <p className="text-[10px] opacity-80">{item.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── Shared Components ── */
const WidgetCard = ({
  title, icon, gradient, onSeeAll, children
}: {
  title: string;
  icon: React.ReactNode;
  gradient: string;
  onSeeAll: () => void;
  children: React.ReactNode;
}) => (
  <div className="glass-card overflow-hidden">
    <div className={`flex items-center justify-between px-4 py-2.5 bg-gradient-to-r ${gradient}`}>
      <div className="flex items-center gap-2 text-white">
        {icon}
        <h3 className="text-sm font-bold">{title}</h3>
      </div>
      <button onClick={onSeeAll} className="flex items-center gap-0.5 text-white/90 text-[11px] font-medium hover:text-white transition-colors">
        সব দেখুন <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
    <div className="px-4 py-3">{children}</div>
  </div>
);

const EmptyWidget = ({ text }: { text: string }) => (
  <p className="text-center text-xs text-muted-foreground py-4">{text}</p>
);
