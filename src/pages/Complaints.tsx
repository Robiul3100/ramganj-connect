import { useState, useEffect } from "react";
import { Search, AlertTriangle, MapPin, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import SubmitFormDialog from "@/components/SubmitFormDialog";

interface Complaint {
  id: string;
  title: string;
  category: string;
  location: string | null;
  description: string | null;
  complaint_date: string;
}

const Complaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await (supabase.from as any)("complaints").select("*").eq("is_approved", true).order("complaint_date", { ascending: false });
      if (data) setComplaints(data);
    };
    fetch();
    const ch = supabase.channel("complaints_rt").on("postgres_changes", { event: "*", schema: "public", table: "complaints" }, () => fetch()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const filtered = complaints.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = async (data: Record<string, string>) => {
    await (supabase.from as any)("complaints").insert({
      title: data.title,
      category: data.category || "সাধারণ",
      location: data.location || null,
      description: data.description || null,
    });
  };

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto">
      <PageHeader title="অভিযোগ বক্স" color="linear-gradient(135deg, hsl(0,70%,50%), hsl(15,80%,55%))" onAdd={() => setShowForm(true)} />
      
      <div className="px-4 -mt-2 space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input type="text" placeholder="অভিযোগ বক্স খুঁজুন..." className="search-input pl-12" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="space-y-4 pb-6">
          {filtered.map((c) => (
            <div key={c.id} className="glass-card p-4 border-l-4 border-destructive">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-orange-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-destructive text-white">{c.category}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(c.complaint_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground mt-1">{c.title}</h3>
                  {c.location && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {c.location}
                    </p>
                  )}
                </div>
              </div>
              {c.description && (
                <div className="mt-3 bg-destructive/5 rounded-xl p-3">
                  <p className="text-sm text-muted-foreground">{c.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <SubmitFormDialog
        open={showForm} onClose={() => setShowForm(false)}
        title="তথ্য যোগ করুন" subtitle="নিরাপত্তা যাচাই প্রয়োজন"
        headerColor="linear-gradient(135deg, hsl(0,70%,50%), hsl(15,80%,55%))"
        fields={[
          { name: "title", label: "শিরোনাম", required: true },
          { name: "category", label: "ক্যাটাগরি", type: "select", options: ["রাস্তা সমস্যা", "ড্রেন সমস্যা", "বিদ্যুৎ সমস্যা", "পানি সমস্যা", "সাধারণ"] },
          { name: "location", label: "ঠিকানা" },
          { name: "description", label: "বিবরণ", type: "textarea" },
        ]}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Complaints;
