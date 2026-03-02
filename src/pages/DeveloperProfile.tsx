import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Phone, MessageCircle, Facebook, Github, Linkedin, Twitter, Globe, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
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

const DeveloperProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<DevProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("developer_profile")
        .select("*")
        .limit(1)
        .single();
      if (data) setProfile(data as DevProfile);
      setLoading(false);
    };
    fetch();
  }, []);

  const socialLinks = profile
    ? [
        { icon: Facebook, url: profile.facebook_url, label: "Facebook", color: "text-blue-500" },
        { icon: Github, url: profile.github_url, label: "GitHub", color: "text-foreground" },
        { icon: Linkedin, url: profile.linkedin_url, label: "LinkedIn", color: "text-sky-600" },
        { icon: Twitter, url: profile.twitter_url, label: "Twitter", color: "text-sky-400" },
        { icon: Globe, url: profile.website_url, label: "Website", color: "text-primary" },
      ].filter((s) => s.url)
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background max-w-2xl mx-auto pb-20">
        <Skeleton className="w-full h-48" />
        <div className="px-4 -mt-12 flex flex-col items-center">
          <Skeleton className="w-24 h-24 rounded-full" />
          <Skeleton className="w-40 h-5 mt-3" />
          <Skeleton className="w-28 h-4 mt-2" />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20">
        <p className="text-muted-foreground">প্রোফাইল পাওয়া যায়নি</p>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background max-w-2xl mx-auto pb-20">
      {/* Cover Photo */}
      <div className="relative w-full h-48 sm:h-56 bg-gradient-to-br from-primary/30 to-primary/10">
        {profile.cover_url && (
          <img
            src={profile.cover_url}
            alt="কভার ফটো"
            className="w-full h-full object-cover"
          />
        )}
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Avatar + Info */}
      <div className="px-4 -mt-14 flex flex-col items-center relative z-10">
        <div className="w-28 h-28 rounded-full border-4 border-background bg-muted overflow-hidden shadow-lg">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-primary/10 flex items-center justify-center">
              <span className="text-3xl font-bold text-primary">
                {profile.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <h1 className="text-xl font-bold text-foreground mt-3">{profile.name}</h1>
        <p className="text-sm text-muted-foreground">{profile.designation}</p>

        {profile.bio && (
          <p className="text-sm text-center text-muted-foreground mt-2 max-w-xs leading-relaxed">
            {profile.bio}
          </p>
        )}
      </div>

      {/* Social Links */}
      {socialLinks.length > 0 && (
        <div className="flex items-center justify-center gap-3 mt-5 px-4">
          {socialLinks.map((s) => (
            <a
              key={s.label}
              href={s.url!}
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors"
              title={s.label}
            >
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </a>
          ))}
        </div>
      )}

      {/* CTA Buttons */}
      <div className="px-4 mt-6 flex gap-3">
        {profile.phone && (
          <a
            href={`tel:${profile.phone}`}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:opacity-90 transition-opacity"
          >
            <Phone className="w-4.5 h-4.5" />
            কল করুন
          </a>
        )}
        {profile.messenger_url && (
          <a
            href={profile.messenger_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-blue-500 text-white font-semibold text-sm shadow-md hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="w-4.5 h-4.5" />
            মেসেজ করুন
          </a>
        )}
      </div>

      {/* Info Cards */}
      <div className="px-4 mt-6 space-y-3">
        <div className="glass-card p-4 rounded-2xl">
          <h3 className="text-sm font-bold text-foreground mb-1">সম্পর্কে</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {profile.bio || "এই অ্যাপটি তৈরি ও রক্ষণাবেক্ষণ করছেন " + profile.name + "।"}
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default DeveloperProfile;
