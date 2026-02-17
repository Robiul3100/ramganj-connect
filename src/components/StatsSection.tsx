import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const StatsSection = () => {
  const [stats, setStats] = useState({ categories: 0, services: 0 });

  useEffect(() => {
    const fetch = async () => {
      const [cats, svcs] = await Promise.all([
        supabase.from("service_categories").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("services").select("*", { count: "exact", head: true }).eq("status", "approved"),
      ]);
      setStats({ categories: cats.count || 0, services: svcs.count || 0 });
    };
    fetch();
  }, []);

  return (
    <div className="px-4">
      <div className="gradient-stats rounded-3xl p-6 flex items-center justify-around text-primary-foreground">
        <div className="text-center">
          <p className="text-4xl font-bold">{stats.categories}</p>
          <p className="text-sm opacity-90">ক্যাটাগরি</p>
        </div>
        <div className="w-px h-12 bg-primary-foreground/30" />
        <div className="text-center">
          <p className="text-4xl font-bold">{stats.services}</p>
          <p className="text-sm opacity-90">সেবা তালিকা</p>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
