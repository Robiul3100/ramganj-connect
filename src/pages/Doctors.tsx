import { useState, useEffect } from "react";
import { Search, Phone, MapPin, Stethoscope } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import SubmitFormDialog from "@/components/SubmitFormDialog";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string | null;
  phone: string | null;
}

const Doctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await (supabase.from as any)("doctors").select("*").eq("is_approved", true).order("created_at", { ascending: false });
      if (data) setDoctors(data);
    };
    fetch();
    const ch = supabase.channel("doctors_rt").on("postgres_changes", { event: "*", schema: "public", table: "doctors" }, () => fetch()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const filtered = doctors.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = async (data: Record<string, string>) => {
    await (supabase.from as any)("doctors").insert({
      name: data.name,
      specialty: data.specialty || "সাধারণ",
      location: data.location || null,
      phone: data.phone || null,
    });
  };

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto pb-6">
      <PageHeader title="ডক্টর তালিকা" color="linear-gradient(135deg, hsl(185,60%,42%), hsl(195,65%,50%))" onAdd={() => setShowForm(true)} />
      
      <div className="px-4 -mt-2 space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input type="text" placeholder="ডক্টর তালিকা খুঁজুন..." className="search-input pl-12" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="space-y-3 pb-6">
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">কোন তথ্য নেই</p>}
          {filtered.map((doc) => (
            <div key={doc.id} className="glass-card p-4 flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "hsl(185, 60%, 92%)" }}>
                <Stethoscope className="w-6 h-6" style={{ color: "hsl(185, 60%, 42%)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground">{doc.name}</h3>
                {doc.location && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {doc.location}
                  </p>
                )}
                <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block" style={{ background: "hsl(185, 60%, 92%)", color: "hsl(185, 60%, 35%)" }}>
                  {doc.specialty}
                </span>
              </div>
              {doc.phone && (
                <a href={`tel:${doc.phone}`} className="w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: "hsl(185, 60%, 80%)" }}>
                  <Phone className="w-5 h-5" style={{ color: "hsl(185, 60%, 42%)" }} />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      <SubmitFormDialog
        open={showForm} onClose={() => setShowForm(false)}
        title="তথ্য যোগ করুন" subtitle="নিরাপত্তা যাচাই প্রয়োজন"
        headerColor="linear-gradient(135deg, hsl(185,60%,42%), hsl(195,65%,50%))"
        fields={[
          { name: "name", label: "ডাক্তারের নাম", required: true },
          { name: "specialty", label: "বিশেষত্ব", type: "select", options: ["মেডিসিন বিশেষজ্ঞ", "গাইনি বিশেষজ্ঞ", "শিশু বিশেষজ্ঞ", "চক্ষু বিশেষজ্ঞ", "সার্জারি বিশেষজ্ঞ", "হৃদরোগ বিশেষজ্ঞ", "হাড় বিশেষজ্ঞ", "দন্ত বিশেষজ্ঞ", "সাধারণ"] },
          { name: "location", label: "ঠিকানা" },
          { name: "phone", label: "ফোন নাম্বার", type: "tel" },
        ]}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Doctors;
