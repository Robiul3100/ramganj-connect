import { useState, useEffect } from "react";
import { Phone, Search, MapPin, Calendar, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import SubmitFormDialog from "@/components/SubmitFormDialog";

interface BloodDonor {
  id: string;
  name: string;
  blood_group: string;
  phone: string;
  address: string | null;
  last_donation_date: string | null;
  is_available: boolean;
}

const BloodBank = () => {
  const [donors, setDonors] = useState<BloodDonor[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await (supabase.from as any)("blood_donors").select("*").eq("is_approved", true).order("created_at", { ascending: false });
      if (data) setDonors(data);
    };
    fetch();
    const ch = supabase.channel("blood_rt").on("postgres_changes", { event: "*", schema: "public", table: "blood_donors" }, () => fetch()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const filtered = donors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.blood_group.toLowerCase().includes(search.toLowerCase()) ||
    (d.address || "").toLowerCase().includes(search.toLowerCase())
  );

  const getDaysUntilAvailable = (lastDate: string | null) => {
    if (!lastDate) return null;
    const last = new Date(lastDate);
    const availDate = new Date(last);
    availDate.setMonth(availDate.getMonth() + 3);
    const diff = Math.ceil((availDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : null;
  };

  const handleSubmit = async (data: Record<string, string>) => {
    await (supabase.from as any)("blood_donors").insert({
      name: data.name,
      blood_group: data.blood_group,
      phone: data.phone,
      address: data.address || null,
    });
  };

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto">
      <PageHeader title="ব্লাড ব্যাংক ও ডোনার" color="linear-gradient(135deg, hsl(0,70%,50%), hsl(0,80%,60%))" onAdd={() => setShowForm(true)} />
      
      <div className="px-4 -mt-2 space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input type="text" placeholder="রক্তের গ্রুপ বা এলাকা খুঁজুন..." className="search-input pl-12" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="space-y-3 pb-6">
          {filtered.map((donor) => {
            const daysLeft = getDaysUntilAvailable(donor.last_donation_date);
            return (
              <div key={donor.id} className="glass-card p-4 flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-destructive flex flex-col items-center justify-center text-white shrink-0">
                  <span className="text-lg font-bold leading-none">{donor.blood_group}</span>
                  <span className="text-[10px] opacity-80">গ্রুপ</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-foreground">{donor.name}</h3>
                    {donor.is_available && !daysLeft ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> রক্ত দিতে পারবে
                      </span>
                    ) : daysLeft ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {daysLeft} দিন বাকি
                      </span>
                    ) : null}
                  </div>
                  {donor.address && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {donor.address}
                    </p>
                  )}
                  {donor.last_donation_date && (
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> শেষ দান: {new Date(donor.last_donation_date).toLocaleDateString("bn-BD")}
                    </p>
                  )}
                </div>
                <a href={`tel:${donor.phone}`} className="w-12 h-12 rounded-full border-2 border-destructive/20 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-destructive" />
                </a>
              </div>
            );
          })}
        </div>
      </div>

      <SubmitFormDialog
        open={showForm}
        onClose={() => setShowForm(false)}
        title="তথ্য যোগ করুন"
        subtitle="নিরাপত্তা যাচাই প্রয়োজন"
        headerColor="linear-gradient(135deg, hsl(0,70%,50%), hsl(0,80%,60%))"
        fields={[
          { name: "name", label: "নাম", required: true, placeholder: "আপনার নাম" },
          { name: "blood_group", label: "রক্তের গ্রুপ", type: "select", options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
          { name: "phone", label: "ফোন নাম্বার", type: "tel", placeholder: "01XXXXXXXXX" },
          { name: "address", label: "ঠিকানা", placeholder: "আপনার এলাকা" },
        ]}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default BloodBank;
