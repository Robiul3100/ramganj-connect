import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Save, Upload, User, Image as ImageIcon, Phone, MessageCircle, Facebook, Github, Linkedin, Twitter, Globe, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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
}

interface Props {
  logActivity: (action: string, tableName?: string, recordId?: string, details?: string) => void;
}

const AdminDeveloperProfile = ({ logActivity }: Props) => {
  const [profile, setProfile] = useState<DevProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data } = await supabase.from("developer_profile").select("*").limit(1).single();
    if (data) setProfile(data as DevProfile);
    setLoading(false);
  };

  const handleChange = (field: keyof DevProfile, value: string) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  const uploadImage = async (file: File, field: "avatar_url" | "cover_url") => {
    const ext = file.name.split(".").pop();
    const path = `developer/${field}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file, { upsert: true });
    if (error) {
      toast({ title: "আপলোড ব্যর্থ", description: error.message, variant: "destructive" });
      return;
    }
    const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
    handleChange(field, urlData.publicUrl);
    toast({ title: "আপলোড সফল" });
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { id, ...rest } = profile;
    const { error } = await supabase.from("developer_profile").update({ ...rest, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) {
      toast({ title: "সেভ ব্যর্থ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "ডেভেলপার প্রোফাইল আপডেট হয়েছে" });
      logActivity("ডেভেলপার প্রোফাইল আপডেট", "developer_profile", id);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!profile) return <p className="text-muted-foreground">প্রোফাইল পাওয়া যায়নি</p>;

  const fields: { key: keyof DevProfile; label: string; icon: typeof User; placeholder: string }[] = [
    { key: "name", label: "নাম", icon: User, placeholder: "ডেভেলপারের নাম" },
    { key: "designation", label: "পদবি", icon: FileText, placeholder: "পদবি / টাইটেল" },
    { key: "phone", label: "ফোন নম্বর", icon: Phone, placeholder: "+880..." },
    { key: "messenger_url", label: "মেসেঞ্জার লিংক", icon: MessageCircle, placeholder: "https://m.me/username" },
    { key: "facebook_url", label: "ফেসবুক লিংক", icon: Facebook, placeholder: "https://facebook.com/..." },
    { key: "github_url", label: "গিটহাব লিংক", icon: Github, placeholder: "https://github.com/..." },
    { key: "linkedin_url", label: "লিংকডইন লিংক", icon: Linkedin, placeholder: "https://linkedin.com/in/..." },
    { key: "twitter_url", label: "টুইটার লিংক", icon: Twitter, placeholder: "https://twitter.com/..." },
    { key: "website_url", label: "ওয়েবসাইট", icon: Globe, placeholder: "https://..." },
  ];

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-foreground">ডেভেলপার প্রোফাইল ম্যানেজ</h2>

      {/* Image uploads */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Cover */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground flex items-center gap-1.5"><ImageIcon className="w-4 h-4" /> কভার ফটো</p>
          <div className="relative w-full h-32 rounded-xl bg-muted overflow-hidden border border-border">
            {profile.cover_url && <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover" />}
            <label className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors cursor-pointer">
              <Upload className="w-6 h-6 text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], "cover_url")} />
            </label>
          </div>
          {profile.cover_url && <Input value={profile.cover_url} onChange={(e) => handleChange("cover_url", e.target.value)} placeholder="কভার URL" className="text-xs" />}
        </div>

        {/* Avatar */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground flex items-center gap-1.5"><User className="w-4 h-4" /> প্রোফাইল পিক</p>
          <div className="relative w-24 h-24 rounded-full bg-muted overflow-hidden border-2 border-border mx-auto">
            {profile.avatar_url && <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />}
            <label className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors cursor-pointer rounded-full">
              <Upload className="w-5 h-5 text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], "avatar_url")} />
            </label>
          </div>
          {profile.avatar_url && <Input value={profile.avatar_url} onChange={(e) => handleChange("avatar_url", e.target.value)} placeholder="Avatar URL" className="text-xs" />}
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-3">
        {fields.map((f) => (
          <div key={f.key} className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <f.icon className="w-3.5 h-3.5" /> {f.label}
            </label>
            <Input
              value={(profile[f.key] as string) || ""}
              onChange={(e) => handleChange(f.key, e.target.value)}
              placeholder={f.placeholder}
            />
          </div>
        ))}

        {/* Bio */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> বায়ো / সম্পর্কে
          </label>
          <Textarea
            value={profile.bio || ""}
            onChange={(e) => handleChange("bio", e.target.value)}
            placeholder="ছোট বায়ো লিখুন..."
            rows={3}
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
        <Save className="w-4 h-4" />
        {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
      </Button>
    </div>
  );
};

export default AdminDeveloperProfile;
