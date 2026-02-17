import { useState, useEffect } from "react";
import { Briefcase, Search, Phone, Eye, MapPin, Calendar, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import SubmitFormDialog from "@/components/SubmitFormDialog";

interface Job {
  id: string;
  title: string;
  company: string;
  category: string;
  salary_range: string | null;
  phone: string | null;
  description: string | null;
  deadline: string | null;
}

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await (supabase.from as any)("jobs").select("*").eq("is_approved", true).order("created_at", { ascending: false });
      if (data) setJobs(data);
    };
    fetch();
    const ch = supabase.channel("jobs_rt").on("postgres_changes", { event: "*", schema: "public", table: "jobs" }, () => fetch()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const filtered = jobs.filter(j => j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = async (data: Record<string, string>) => {
    await (supabase.from as any)("jobs").insert({
      title: data.title,
      company: data.company,
      category: data.category || "বেসরকারি",
      salary_range: data.salary_range || null,
      phone: data.phone || null,
      description: data.description || null,
      deadline: data.deadline || null,
    });
  };

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto">
      <PageHeader title="চাকরি" color="linear-gradient(135deg, hsl(210,85%,50%), hsl(230,70%,55%))" onAdd={() => setShowForm(true)} />
      
      <div className="px-4 -mt-2 space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input type="text" placeholder="চাকরি খুঁজুন..." className="search-input pl-12" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="space-y-4 pb-6">
          {filtered.map((job) => (
            <div key={job.id} className="glass-card p-4 border-l-4 border-primary">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">{job.company}</p>
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-foreground">{job.category}</span>
                    {job.salary_range && (
                      <span className="text-xs text-primary font-semibold flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> {job.salary_range}
                      </span>
                    )}
                    {job.deadline && (
                      <span className="text-xs text-destructive flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(job.deadline).toLocaleDateString("bn-BD")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {job.description && (
                <div className="mt-3 bg-primary/5 rounded-xl p-3">
                  <p className="text-sm text-muted-foreground">◆ {job.description}</p>
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <button className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium flex items-center justify-center gap-1.5">
                  <Eye className="w-4 h-4" /> বিস্তারিত
                </button>
                {job.phone && (
                  <a href={`tel:${job.phone}`} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-1.5">
                    <Phone className="w-4 h-4" /> কল করুন
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <SubmitFormDialog
        open={showForm} onClose={() => setShowForm(false)}
        title="তথ্য যোগ করুন" subtitle="নিরাপত্তা যাচাই প্রয়োজন"
        headerColor="linear-gradient(135deg, hsl(210,85%,50%), hsl(230,70%,55%))"
        fields={[
          { name: "title", label: "পদের নাম", required: true },
          { name: "company", label: "প্রতিষ্ঠান", required: true },
          { name: "category", label: "ক্যাটাগরি", type: "select", options: ["সরকারি", "বেসরকারি"] },
          { name: "salary_range", label: "বেতন", placeholder: "যেমন: ১০,০০০-১৫,০০০" },
          { name: "phone", label: "ফোন নাম্বার", type: "tel" },
          { name: "description", label: "বিবরণ", type: "textarea" },
          { name: "deadline", label: "শেষ তারিখ", type: "date" },
        ]}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Jobs;
