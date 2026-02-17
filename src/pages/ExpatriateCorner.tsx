import { useState, useEffect } from "react";
import { Search, Globe, MapPin, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import SubmitFormDialog from "@/components/SubmitFormDialog";

interface Forum {
  id: string;
  name: string;
  country: string;
  location: string | null;
  description: string | null;
  phone: string | null;
  category: string;
}

const ExpatriateCorner = () => {
  const [forums, setForums] = useState<Forum[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await (supabase.from as any)("expatriate_forums").select("*").eq("is_approved", true).order("created_at", { ascending: false });
      if (data) setForums(data);
    };
    fetch();
    const ch = supabase.channel("expat_rt").on("postgres_changes", { event: "*", schema: "public", table: "expatriate_forums" }, () => fetch()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const filtered = forums.filter(f => f.name.toLowerCase().includes(search.toLowerCase()) || f.country.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = async (data: Record<string, string>) => {
    await (supabase.from as any)("expatriate_forums").insert({
      name: data.name,
      country: data.country,
      location: data.location || null,
      description: data.description || null,
      phone: data.phone || null,
      category: data.category || "কমিউনিটি",
    });
  };

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto pb-6">
      <PageHeader title="প্রবাসী কর্নার" color="linear-gradient(135deg, hsl(195,70%,50%), hsl(210,75%,55%))" onAdd={() => setShowForm(true)} />
      
      <div className="px-4 -mt-2 space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input type="text" placeholder="প্রবাসী কর্নার খুঁজুন..." className="search-input pl-12" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="space-y-4 pb-6">
          {filtered.map((forum) => (
            <div key={forum.id} className="glass-card p-5">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Globe className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground">{forum.name}</h3>
                  {forum.location && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {forum.location}
                    </p>
                  )}
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-foreground">{forum.category}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                      🌍 {forum.country}
                    </span>
                  </div>
                </div>
              </div>
              {forum.description && (
                <div className="mt-3 bg-muted/50 rounded-xl p-3">
                  <p className="text-sm text-muted-foreground">{forum.description}</p>
                </div>
              )}
              {forum.phone && (
                <a href={`tel:${forum.phone}`} className="mt-3 w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" /> যোগাযোগ করুন
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      <SubmitFormDialog
        open={showForm} onClose={() => setShowForm(false)}
        title="তথ্য যোগ করুন" subtitle="নিরাপত্তা যাচাই প্রয়োজন"
        headerColor="linear-gradient(135deg, hsl(195,70%,50%), hsl(210,75%,55%))"
        fields={[
          { name: "name", label: "নাম", required: true },
          { name: "country", label: "দেশ", required: true },
          { name: "location", label: "ঠিকানা" },
          { name: "phone", label: "ফোন নাম্বার", type: "tel" },
          { name: "category", label: "ক্যাটাগরি", type: "select", options: ["কমিউনিটি", "ব্যবসা", "সহায়তা"] },
          { name: "description", label: "বিবরণ", type: "textarea" },
        ]}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default ExpatriateCorner;
