import { useState, useEffect } from "react";
import { Search, Phone, MapPin, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import SubmitFormDialog from "@/components/SubmitFormDialog";

interface Institute {
  id: string;
  name: string;
  category: string;
  location: string | null;
  phone: string | null;
}

const Education = () => {
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await (supabase.from as any)("education_institutes").select("*").eq("is_approved", true).order("created_at", { ascending: false });
      if (data) setInstitutes(data);
    };
    fetch();
    const ch = supabase.channel("education_rt").on("postgres_changes", { event: "*", schema: "public", table: "education_institutes" }, () => fetch()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const filtered = institutes.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = async (data: Record<string, string>) => {
    await (supabase.from as any)("education_institutes").insert({
      name: data.name,
      category: data.category || "স্কুল",
      location: data.location || null,
      phone: data.phone || null,
    });
  };

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto pb-6">
      <PageHeader title="শিক্ষা" color="linear-gradient(135deg, hsl(150,50%,38%), hsl(160,55%,45%))" onAdd={() => setShowForm(true)} />
      
      <div className="px-4 -mt-2 space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input type="text" placeholder="শিক্ষা খুঁজুন..." className="search-input pl-12" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="space-y-3 pb-6">
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">কোন তথ্য নেই</p>}
          {filtered.map((inst) => (
            <div key={inst.id} className="glass-card p-4 flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "hsl(150, 50%, 92%)" }}>
                <GraduationCap className="w-6 h-6" style={{ color: "hsl(150, 50%, 38%)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground">{inst.name}</h3>
                {inst.location && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {inst.location}
                  </p>
                )}
                <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block" style={{ background: "hsl(150, 50%, 92%)", color: "hsl(150, 50%, 30%)" }}>
                  {inst.category}
                </span>
              </div>
              {inst.phone && (
                <a href={`tel:${inst.phone}`} className="w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: "hsl(150, 50%, 80%)" }}>
                  <Phone className="w-5 h-5" style={{ color: "hsl(150, 50%, 38%)" }} />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      <SubmitFormDialog
        open={showForm} onClose={() => setShowForm(false)}
        title="তথ্য যোগ করুন" subtitle="নিরাপত্তা যাচাই প্রয়োজন"
        headerColor="linear-gradient(135deg, hsl(150,50%,38%), hsl(160,55%,45%))"
        fields={[
          { name: "name", label: "প্রতিষ্ঠানের নাম", required: true },
          { name: "category", label: "ক্যাটাগরি", type: "select", options: ["কলেজ", "উচ্চ বিদ্যালয়", "বালিকা বিদ্যালয়", "মাদ্রাসা", "প্রাথমিক", "টেকনিক্যাল"] },
          { name: "location", label: "ঠিকানা" },
          { name: "phone", label: "ফোন নাম্বার", type: "tel" },
        ]}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Education;
