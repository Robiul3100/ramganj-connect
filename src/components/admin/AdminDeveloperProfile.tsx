import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Save, Upload, User, Image as ImageIcon, Phone, MessageCircle,
  Facebook, Github, Linkedin, Twitter, Globe, FileText, Plus,
  Trash2, GripVertical, Code2, FolderGit2, Briefcase, ChevronDown, ChevronUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface DevProject { title: string; url?: string; description?: string; }
interface DevExperience { title: string; company: string; year_from: string; year_to?: string; description?: string; }

interface DevProfile {
  id: string;
  name: string;
  designation: string;
  avatar_url: string | null;
  cover_url: string | null;
  phone: string | null;
  messenger_url: string | null;
  facebook_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
  bio: string | null;
  skills: string[];
  projects: DevProject[];
  experience: DevExperience[];
  sort_order: number;
  is_active: boolean;
}

interface Props {
  logActivity: (action: string, tableName?: string, recordId?: string, details?: string) => void;
}

const emptyProfile = (): Omit<DevProfile, "id"> => ({
  name: "", designation: "", avatar_url: null, cover_url: null,
  phone: null, messenger_url: null, facebook_url: null, github_url: null,
  linkedin_url: null, twitter_url: null, website_url: null, bio: null,
  skills: [], projects: [], experience: [], sort_order: 0, is_active: true,
});

const AdminDeveloperProfile = ({ logActivity }: Props) => {
  const [profiles, setProfiles] = useState<DevProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState<Record<string, string>>({});

  useEffect(() => { fetchProfiles(); }, []);

  const fetchProfiles = async () => {
    const { data } = await supabase.from("developer_profile").select("*").order("sort_order");
    if (data) setProfiles(data as unknown as DevProfile[]);
    setLoading(false);
  };

  const handleChange = (id: string, field: keyof DevProfile, value: any) => {
    setProfiles((prev) => prev.map((p) => p.id === id ? { ...p, [field]: value } : p));
  };

  const uploadImage = async (file: File, id: string, field: "avatar_url" | "cover_url") => {
    const ext = file.name.split(".").pop();
    const path = `developer/${id}-${field}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file, { upsert: true });
    if (error) { toast({ title: "আপলোড ব্যর্থ", description: error.message, variant: "destructive" }); return; }
    const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
    handleChange(id, field, urlData.publicUrl);
    toast({ title: "আপলোড সফল" });
  };

  const handleSave = async (profile: DevProfile) => {
    setSaving(profile.id);
    const { id, ...rest } = profile;
    const { error } = await supabase.from("developer_profile")
      .update({ ...rest, updated_at: new Date().toISOString() } as any)
      .eq("id", id);
    if (error) toast({ title: "সেভ ব্যর্থ", description: error.message, variant: "destructive" });
    else { toast({ title: "প্রোফাইল আপডেট হয়েছে" }); logActivity("ডেভেলপার প্রোফাইল আপডেট", "developer_profile", id); }
    setSaving(null);
  };

  const addNewProfile = async () => {
    const newP = emptyProfile();
    newP.name = "নতুন ডেভেলপার";
    newP.designation = "ডেভেলপার";
    newP.sort_order = profiles.length;
    const { data, error } = await supabase.from("developer_profile").insert(newP as any).select().single();
    if (error) { toast({ title: "যোগ ব্যর্থ", description: error.message, variant: "destructive" }); return; }
    if (data) { setProfiles([...profiles, data as unknown as DevProfile]); setExpanded((data as any).id); }
    toast({ title: "নতুন প্রোফাইল যোগ হয়েছে" });
    logActivity("নতুন ডেভেলপার যোগ", "developer_profile", (data as any)?.id);
  };

  const deleteProfile = async (id: string) => {
    const { error } = await supabase.from("developer_profile").delete().eq("id", id);
    if (error) { toast({ title: "মুছে ফেলা ব্যর্থ", description: error.message, variant: "destructive" }); return; }
    setProfiles(profiles.filter((p) => p.id !== id));
    toast({ title: "প্রোফাইল মুছে ফেলা হয়েছে" });
    logActivity("ডেভেলপার মুছে ফেলা", "developer_profile", id);
  };

  // Skills helpers
  const addSkill = (id: string) => {
    const s = (newSkill[id] || "").trim();
    if (!s) return;
    const p = profiles.find((p) => p.id === id);
    if (!p) return;
    handleChange(id, "skills", [...p.skills, s]);
    setNewSkill({ ...newSkill, [id]: "" });
  };
  const removeSkill = (id: string, idx: number) => {
    const p = profiles.find((p) => p.id === id);
    if (!p) return;
    handleChange(id, "skills", p.skills.filter((_, i) => i !== idx));
  };

  // Projects helpers
  const addProject = (id: string) => {
    const p = profiles.find((p) => p.id === id);
    if (!p) return;
    handleChange(id, "projects", [...p.projects, { title: "", url: "", description: "" }]);
  };
  const updateProject = (id: string, idx: number, field: keyof DevProject, val: string) => {
    const p = profiles.find((p) => p.id === id);
    if (!p) return;
    const updated = [...p.projects];
    updated[idx] = { ...updated[idx], [field]: val };
    handleChange(id, "projects", updated);
  };
  const removeProject = (id: string, idx: number) => {
    const p = profiles.find((p) => p.id === id);
    if (!p) return;
    handleChange(id, "projects", p.projects.filter((_, i) => i !== idx));
  };

  // Experience helpers
  const addExperience = (id: string) => {
    const p = profiles.find((p) => p.id === id);
    if (!p) return;
    handleChange(id, "experience", [...p.experience, { title: "", company: "", year_from: "", year_to: "", description: "" }]);
  };
  const updateExperience = (id: string, idx: number, field: keyof DevExperience, val: string) => {
    const p = profiles.find((p) => p.id === id);
    if (!p) return;
    const updated = [...p.experience];
    updated[idx] = { ...updated[idx], [field]: val };
    handleChange(id, "experience", updated);
  };
  const removeExperience = (id: string, idx: number) => {
    const p = profiles.find((p) => p.id === id);
    if (!p) return;
    handleChange(id, "experience", p.experience.filter((_, i) => i !== idx));
  };

  const fields: { key: keyof DevProfile; label: string; icon: typeof User; placeholder: string }[] = [
    { key: "name", label: "নাম", icon: User, placeholder: "ডেভেলপারের নাম" },
    { key: "designation", label: "পদবি", icon: FileText, placeholder: "পদবি / টাইটেল" },
    { key: "phone", label: "ফোন", icon: Phone, placeholder: "+880..." },
    { key: "messenger_url", label: "মেসেঞ্জার", icon: MessageCircle, placeholder: "https://m.me/..." },
    { key: "facebook_url", label: "ফেসবুক", icon: Facebook, placeholder: "https://facebook.com/..." },
    { key: "github_url", label: "গিটহাব", icon: Github, placeholder: "https://github.com/..." },
    { key: "linkedin_url", label: "লিংকডইন", icon: Linkedin, placeholder: "https://linkedin.com/in/..." },
    { key: "twitter_url", label: "টুইটার", icon: Twitter, placeholder: "https://twitter.com/..." },
    { key: "website_url", label: "ওয়েবসাইট", icon: Globe, placeholder: "https://..." },
  ];

  if (loading) return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">ডেভেলপার প্রোফাইল ম্যানেজ</h2>
        <Button size="sm" onClick={addNewProfile} className="gap-1.5">
          <Plus className="w-4 h-4" /> নতুন যোগ করুন
        </Button>
      </div>

      {profiles.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">কোনো প্রোফাইল নেই। নতুন যোগ করুন।</p>
      )}

      {profiles.map((profile) => {
        const isOpen = expanded === profile.id;
        return (
          <div key={profile.id} className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            {/* Collapsed header */}
            <button
              onClick={() => setExpanded(isOpen ? null : profile.id)}
              className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0" />
              <div className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{profile.name.charAt(0) || "?"}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{profile.name || "নাম নেই"}</p>
                <p className="text-[10px] text-muted-foreground">{profile.designation}</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={profile.is_active}
                  onCheckedChange={(v) => handleChange(profile.id, "is_active", v)}
                  onClick={(e) => e.stopPropagation()}
                />
                {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 space-y-4 border-t border-border/30 pt-4">
                {/* Images */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5" /> কভার</p>
                    <div className="relative w-full h-24 rounded-xl bg-muted overflow-hidden border border-border">
                      {profile.cover_url && <img src={profile.cover_url} alt="" className="w-full h-full object-cover" />}
                      <label className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors cursor-pointer">
                        <Upload className="w-5 h-5 text-white" />
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], profile.id, "cover_url")} />
                      </label>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><User className="w-3.5 h-3.5" /> প্রোফাইল পিক</p>
                    <div className="relative w-20 h-20 rounded-full bg-muted overflow-hidden border-2 border-border mx-auto">
                      {profile.avatar_url && <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />}
                      <label className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 cursor-pointer rounded-full">
                        <Upload className="w-4 h-4 text-white" />
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], profile.id, "avatar_url")} />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Text fields */}
                <div className="space-y-2">
                  {fields.map((f) => (
                    <div key={f.key} className="space-y-0.5">
                      <label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                        <f.icon className="w-3 h-3" /> {f.label}
                      </label>
                      <Input
                        value={(profile[f.key] as string) || ""}
                        onChange={(e) => handleChange(profile.id, f.key, e.target.value)}
                        placeholder={f.placeholder}
                        className="h-9 text-xs"
                      />
                    </div>
                  ))}
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                      <FileText className="w-3 h-3" /> বায়ো
                    </label>
                    <Textarea value={profile.bio || ""} onChange={(e) => handleChange(profile.id, "bio", e.target.value)} placeholder="ছোট বায়ো..." rows={2} className="text-xs" />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-medium text-muted-foreground">সর্ট অর্ডার</label>
                    <Input type="number" value={profile.sort_order} onChange={(e) => handleChange(profile.id, "sort_order", parseInt(e.target.value) || 0)} className="h-9 text-xs w-24" />
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Code2 className="w-3.5 h-3.5" /> স্কিলস</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map((sk, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px] gap-1 pr-1">
                        {sk}
                        <button onClick={() => removeSkill(profile.id, i)} className="hover:text-destructive"><Trash2 className="w-2.5 h-2.5" /></button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <Input
                      value={newSkill[profile.id] || ""}
                      onChange={(e) => setNewSkill({ ...newSkill, [profile.id]: e.target.value })}
                      placeholder="নতুন স্কিল..."
                      className="h-8 text-xs flex-1"
                      onKeyDown={(e) => e.key === "Enter" && addSkill(profile.id)}
                    />
                    <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => addSkill(profile.id)}>
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Projects */}
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><FolderGit2 className="w-3.5 h-3.5" /> প্রজেক্টস</p>
                  {profile.projects.map((proj, i) => (
                    <div key={i} className="rounded-lg bg-muted/30 p-2.5 space-y-1.5 relative">
                      <button onClick={() => removeProject(profile.id, i)} className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                      <Input value={proj.title} onChange={(e) => updateProject(profile.id, i, "title", e.target.value)} placeholder="প্রজেক্টের নাম" className="h-8 text-xs" />
                      <Input value={proj.url || ""} onChange={(e) => updateProject(profile.id, i, "url", e.target.value)} placeholder="URL" className="h-8 text-xs" />
                      <Input value={proj.description || ""} onChange={(e) => updateProject(profile.id, i, "description", e.target.value)} placeholder="বর্ণনা" className="h-8 text-xs" />
                    </div>
                  ))}
                  <Button size="sm" variant="outline" className="w-full gap-1 text-xs" onClick={() => addProject(profile.id)}>
                    <Plus className="w-3.5 h-3.5" /> প্রজেক্ট যোগ করুন
                  </Button>
                </div>

                {/* Experience */}
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> অভিজ্ঞতা</p>
                  {profile.experience.map((exp, i) => (
                    <div key={i} className="rounded-lg bg-muted/30 p-2.5 space-y-1.5 relative">
                      <button onClick={() => removeExperience(profile.id, i)} className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                      <Input value={exp.title} onChange={(e) => updateExperience(profile.id, i, "title", e.target.value)} placeholder="পদবি" className="h-8 text-xs" />
                      <Input value={exp.company} onChange={(e) => updateExperience(profile.id, i, "company", e.target.value)} placeholder="প্রতিষ্ঠান" className="h-8 text-xs" />
                      <div className="grid grid-cols-2 gap-1.5">
                        <Input value={exp.year_from} onChange={(e) => updateExperience(profile.id, i, "year_from", e.target.value)} placeholder="শুরু (২০২০)" className="h-8 text-xs" />
                        <Input value={exp.year_to || ""} onChange={(e) => updateExperience(profile.id, i, "year_to", e.target.value)} placeholder="শেষ (খালি=বর্তমান)" className="h-8 text-xs" />
                      </div>
                      <Input value={exp.description || ""} onChange={(e) => updateExperience(profile.id, i, "description", e.target.value)} placeholder="বর্ণনা" className="h-8 text-xs" />
                    </div>
                  ))}
                  <Button size="sm" variant="outline" className="w-full gap-1 text-xs" onClick={() => addExperience(profile.id)}>
                    <Plus className="w-3.5 h-3.5" /> অভিজ্ঞতা যোগ করুন
                  </Button>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button onClick={() => handleSave(profile)} disabled={saving === profile.id} className="flex-1 gap-1.5">
                    <Save className="w-4 h-4" /> {saving === profile.id ? "সেভ হচ্ছে..." : "সেভ করুন"}
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => deleteProfile(profile.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AdminDeveloperProfile;
