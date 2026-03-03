import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, Plus, Edit3, Trash2, Save, X, Shield, CheckCircle, XCircle, Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import SwipeUpEditor from "./SwipeUpEditor";

interface PoliceRecord {
  id: string;
  type: string;
  name: string;
  rank: string | null;
  assigned_station: string | null;
  station_image_url: string | null;
  profile_image_url: string | null;
  thana: string | null;
  district: string | null;
  division: string | null;
  service_area: string | null;
  location: string | null;
  phone: string | null;
  emergency_phone: string | null;
  duty_time: string | null;
  website_url: string | null;
  map_link: string | null;
  officer_count: string | null;
  service_types: string[];
  badges: string[];
  description: string | null;
  full_description: string | null;
  is_approved: boolean;
  is_active: boolean;
  is_verified: boolean | null;
  sort_order: number;
}

const emptyForm = {
  type: "station",
  name: "",
  rank: "",
  assigned_station: "",
  station_image_url: "",
  profile_image_url: "",
  thana: "",
  district: "",
  division: "",
  service_area: "",
  location: "",
  phone: "",
  emergency_phone: "",
  duty_time: "",
  website_url: "",
  map_link: "",
  officer_count: "",
  service_types: [] as string[],
  badges: [] as string[],
  description: "",
  full_description: "",
  is_approved: true,
  is_active: true,
  is_verified: false,
  sort_order: 0,
};

const badgeOptions = ["২৪ ঘন্টা সেবা", "Emergency Support", "Women & Child Help Desk", "Cyber Unit"];
const serviceTypeOptions = ["General", "Traffic", "Women & Child Desk", "Detective", "Highway", "Cyber Crime", "Immigration"];
const rankOptions = ["SP", "ASP", "OC", "Inspector", "SI", "ASI", "Constable"];

interface Props {
  logActivity: (action: string, table?: string, id?: string, details?: string) => Promise<void>;
}

const AdminPoliceManager = ({ logActivity }: Props) => {
  const [records, setRecords] = useState<PoliceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("police_stations").select("*").order("sort_order").order("created_at", { ascending: false });
    setRecords((data as PoliceRecord[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const openAdd = () => {
    setForm({ ...emptyForm });
    setEditId(null);
    setEditorOpen(true);
  };

  const openEdit = (r: PoliceRecord) => {
    setForm({
      type: r.type,
      name: r.name,
      rank: r.rank || "",
      assigned_station: r.assigned_station || "",
      station_image_url: r.station_image_url || "",
      profile_image_url: r.profile_image_url || "",
      thana: r.thana || "",
      district: r.district || "",
      division: r.division || "",
      service_area: r.service_area || "",
      location: r.location || "",
      phone: r.phone || "",
      emergency_phone: r.emergency_phone || "",
      duty_time: r.duty_time || "",
      website_url: r.website_url || "",
      map_link: r.map_link || "",
      officer_count: r.officer_count || "",
      service_types: r.service_types || [],
      badges: r.badges || [],
      description: r.description || "",
      full_description: r.full_description || "",
      is_approved: r.is_approved,
      is_active: r.is_active,
      is_verified: r.is_verified || false,
      sort_order: r.sort_order,
    });
    setEditId(r.id);
    setEditorOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "নাম আবশ্যক", variant: "destructive" });
      return;
    }
    const payload = {
      type: form.type,
      name: form.name.trim(),
      rank: form.rank || null,
      assigned_station: form.assigned_station || null,
      station_image_url: form.station_image_url || null,
      profile_image_url: form.profile_image_url || null,
      thana: form.thana || null,
      district: form.district || null,
      division: form.division || null,
      service_area: form.service_area || null,
      location: form.location || null,
      phone: form.phone || null,
      emergency_phone: form.emergency_phone || null,
      duty_time: form.duty_time || null,
      website_url: form.website_url || null,
      map_link: form.map_link || null,
      officer_count: form.officer_count || null,
      service_types: form.service_types,
      badges: form.badges,
      description: form.description || null,
      full_description: form.full_description || null,
      is_approved: form.is_approved,
      is_active: form.is_active,
      is_verified: form.is_verified,
      sort_order: form.sort_order,
    };

    if (editId) {
      const { error } = await supabase.from("police_stations").update(payload).eq("id", editId);
      if (error) { toast({ title: "আপডেট ব্যর্থ", variant: "destructive" }); return; }
      await logActivity("police_update", "police_stations", editId, form.name);
      toast({ title: "✅ আপডেট সফল" });
    } else {
      const { error } = await supabase.from("police_stations").insert(payload);
      if (error) { toast({ title: "যোগ করা ব্যর্থ", variant: "destructive" }); return; }
      await logActivity("police_create", "police_stations", undefined, form.name);
      toast({ title: "✅ সফলভাবে যোগ হয়েছে" });
    }
    setEditorOpen(false);
    fetchRecords();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" মুছে ফেলতে চান?`)) return;
    await supabase.from("police_stations").delete().eq("id", id);
    await logActivity("police_delete", "police_stations", id, name);
    toast({ title: "🗑 মুছে ফেলা হয়েছে" });
    fetchRecords();
  };

  const toggleApproval = async (r: PoliceRecord) => {
    await supabase.from("police_stations").update({ is_approved: !r.is_approved }).eq("id", r.id);
    fetchRecords();
  };

  const filtered = records.filter(r => {
    if (filterType !== "all" && r.type !== filterType) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.name.toLowerCase().includes(q) || (r.thana || "").toLowerCase().includes(q) || (r.location || "").toLowerCase().includes(q);
    }
    return true;
  });

  const toggleArrayItem = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];

  const InputField = ({ label, value, onChange, type = "text", placeholder = "" }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) => (
    <div>
      <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/50" />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">পুলিশ ম্যানেজমেন্ট</h2>
          <p className="text-xs text-muted-foreground">{records.length}টি রেকর্ড</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-1.5 bg-[hsl(220,50%,30%)] text-white px-3 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity">
          <Plus className="w-3.5 h-3.5" /> যোগ করুন
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="খুঁজুন..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-card rounded-xl pl-9 pr-4 py-2.5 text-sm border border-border/60 outline-none focus:border-primary/50" />
        </div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="bg-card border border-border/60 rounded-xl px-3 py-2 text-xs">
          <option value="all">সব</option>
          <option value="station">থানা</option>
          <option value="officer">কর্মকর্তা</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">কোন রেকর্ড নেই</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => (
            <div key={r.id} className="bg-card rounded-xl border border-border/60 p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[hsl(220,50%,90%)] dark:bg-[hsl(220,40%,20%)] flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-[hsl(220,50%,45%)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{r.name}</p>
                <p className="text-[10px] text-muted-foreground">{r.type === "station" ? "থানা" : r.rank || "কর্মকর্তা"} • {r.is_approved ? "✅" : "🕐"}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => toggleApproval(r)} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${r.is_approved ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                  {r.is_approved ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                </button>
                <button onClick={() => openEdit(r)} className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(r.id, r.name)} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-600 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      <SwipeUpEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editId ? "পুলিশ এডিট করুন" : "নতুন পুলিশ যোগ করুন"}
        subtitle="থানা বা কর্মকর্তার তথ্য"
        icon={<Shield className="w-4 h-4 text-white" />}
        headerGradient="from-[hsl(220,50%,30%)] to-[hsl(220,60%,45%)]"
      >
        <div className="space-y-3">
          {/* Type */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">ধরন</label>
            <div className="flex gap-2">
              {([["station", "থানা"], ["officer", "কর্মকর্তা"]] as const).map(([val, label]) => (
                <button key={val} onClick={() => setForm({ ...form, type: val })} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${form.type === val ? "bg-[hsl(220,50%,30%)] text-white" : "bg-muted text-muted-foreground"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <InputField label="নাম *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />

          {form.type === "officer" && (
            <>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">পদবী</label>
                <select value={form.rank} onChange={(e) => setForm({ ...form, rank: e.target.value })} className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-sm">
                  <option value="">নির্বাচন করুন</option>
                  {rankOptions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <InputField label="নিয়োজিত থানা" value={form.assigned_station} onChange={(v) => setForm({ ...form, assigned_station: v })} />
              <InputField label="প্রোফাইল ইমেজ URL" value={form.profile_image_url} onChange={(v) => setForm({ ...form, profile_image_url: v })} placeholder="https://..." />
            </>
          )}

          {form.type === "station" && (
            <>
              <InputField label="স্টেশন ইমেজ URL" value={form.station_image_url} onChange={(v) => setForm({ ...form, station_image_url: v })} placeholder="https://..." />
              <InputField label="থানা" value={form.thana} onChange={(v) => setForm({ ...form, thana: v })} />
              <InputField label="জেলা" value={form.district} onChange={(v) => setForm({ ...form, district: v })} />
              <InputField label="বিভাগ" value={form.division} onChange={(v) => setForm({ ...form, division: v })} />
              <InputField label="মোট কর্মকর্তা" value={form.officer_count} onChange={(v) => setForm({ ...form, officer_count: v })} />
            </>
          )}

          <InputField label="সেবা এলাকা" value={form.service_area} onChange={(v) => setForm({ ...form, service_area: v })} />
          <InputField label="ঠিকানা / লোকেশন" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
          <InputField label="ফোন" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <InputField label="জরুরি ফোন" value={form.emergency_phone} onChange={(v) => setForm({ ...form, emergency_phone: v })} />
          <InputField label="ডিউটি সময়" value={form.duty_time} onChange={(v) => setForm({ ...form, duty_time: v })} />
          <InputField label="ওয়েবসাইট URL" value={form.website_url} onChange={(v) => setForm({ ...form, website_url: v })} />
          <InputField label="ম্যাপ লিংক" value={form.map_link} onChange={(v) => setForm({ ...form, map_link: v })} />

          {/* Service Types */}
          {form.type === "station" && (
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">সেবা ধরন</label>
              <div className="flex flex-wrap gap-1.5">
                {serviceTypeOptions.map(st => (
                  <button key={st} onClick={() => setForm({ ...form, service_types: toggleArrayItem(form.service_types, st) })} className={`text-[10px] px-2.5 py-1 rounded-full font-semibold transition-colors ${form.service_types.includes(st) ? "bg-[hsl(220,50%,30%)] text-white" : "bg-muted text-muted-foreground"}`}>
                    {st}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Badges */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">ব্যাজ</label>
            <div className="flex flex-wrap gap-1.5">
              {badgeOptions.map(b => (
                <button key={b} onClick={() => setForm({ ...form, badges: toggleArrayItem(form.badges, b) })} className={`text-[10px] px-2.5 py-1 rounded-full font-semibold transition-colors ${form.badges.includes(b) ? "bg-[hsl(220,50%,30%)] text-white" : "bg-muted text-muted-foreground"}`}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">সংক্ষিপ্ত বিবরণ</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/50 resize-none" />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">বিস্তারিত বিবরণ</label>
            <textarea value={form.full_description} onChange={(e) => setForm({ ...form, full_description: e.target.value })} rows={3} className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/50 resize-none" />
          </div>

          <InputField label="ক্রম (Sort Order)" value={String(form.sort_order)} onChange={(v) => setForm({ ...form, sort_order: parseInt(v) || 0 })} type="number" />

          {/* Toggles */}
          <div className="flex flex-wrap gap-3">
            {([
              ["is_approved", "অনুমোদিত"],
              ["is_active", "সক্রিয়"],
              ["is_verified", "যাচাইকৃত"],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={form[key] as boolean} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} className="rounded" />
                {label}
              </label>
            ))}
          </div>

          {/* Save Button */}
          <button onClick={handleSave} className="w-full py-3 rounded-xl bg-[hsl(220,50%,30%)] text-white font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> {editId ? "আপডেট করুন" : "যোগ করুন"}
          </button>
        </div>
      </SwipeUpEditor>
    </div>
  );
};

export default AdminPoliceManager;
