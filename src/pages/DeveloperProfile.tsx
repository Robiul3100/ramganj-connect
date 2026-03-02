import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Phone, MessageCircle, Facebook, Github, Linkedin, Twitter, Globe,
  ArrowLeft, Briefcase, Code2, FolderGit2, ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface DevProject {
  title: string;
  url?: string;
  description?: string;
}

interface DevExperience {
  title: string;
  company: string;
  year_from: string;
  year_to?: string;
  description?: string;
}

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

const socialIcons = [
  { key: "facebook_url", icon: Facebook, label: "Facebook", color: "text-blue-500" },
  { key: "github_url", icon: Github, label: "GitHub", color: "text-foreground" },
  { key: "linkedin_url", icon: Linkedin, label: "LinkedIn", color: "text-sky-600" },
  { key: "twitter_url", icon: Twitter, label: "Twitter", color: "text-sky-400" },
  { key: "website_url", icon: Globe, label: "Website", color: "text-primary" },
] as const;

/* ── Single Developer Card ── */
const DeveloperCard = ({ dev }: { dev: DevProfile }) => {
  const [expanded, setExpanded] = useState(false);
  const links = socialIcons.filter((s) => dev[s.key]);

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
      {/* Cover */}
      <div className="relative w-full h-32 sm:h-40 bg-gradient-to-br from-primary/20 to-primary/5">
        {dev.cover_url && (
          <img src={dev.cover_url} alt="" className="w-full h-full object-cover" />
        )}
      </div>

      {/* Avatar + Info */}
      <div className="px-4 -mt-12 flex flex-col items-center relative z-10">
        <div className="w-24 h-24 rounded-full border-4 border-card bg-muted overflow-hidden shadow-lg">
          {dev.avatar_url ? (
            <img src={dev.avatar_url} alt={dev.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">{dev.name.charAt(0)}</span>
            </div>
          )}
        </div>
        <h2 className="text-lg font-bold text-foreground mt-2">{dev.name}</h2>
        <p className="text-xs text-muted-foreground">{dev.designation}</p>
        {dev.bio && (
          <p className="text-xs text-center text-muted-foreground mt-1.5 max-w-xs leading-relaxed">{dev.bio}</p>
        )}
      </div>

      {/* Social links */}
      {links.length > 0 && (
        <div className="flex items-center justify-center gap-2.5 mt-3 px-4">
          {links.map((s) => (
            <a
              key={s.key}
              href={dev[s.key]!}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors"
              title={s.label}
            >
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </a>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="px-4 mt-3 flex gap-2.5">
        {dev.phone && (
          <a
            href={`tel:${dev.phone}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-sm hover:opacity-90 transition-opacity"
          >
            <Phone className="w-3.5 h-3.5" /> কল করুন
          </a>
        )}
        {dev.messenger_url && (
          <a
            href={dev.messenger_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-500 text-white font-semibold text-xs shadow-sm hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="w-3.5 h-3.5" /> মেসেজ
          </a>
        )}
      </div>

      {/* Skills */}
      {dev.skills.length > 0 && (
        <div className="px-4 mt-3">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Code2 className="w-3 h-3" /> স্কিলস
          </p>
          <div className="flex flex-wrap gap-1.5">
            {dev.skills.map((sk) => (
              <Badge key={sk} variant="secondary" className="text-[10px] font-medium px-2 py-0.5 rounded-lg">
                {sk}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Expand toggle for projects/experience */}
      {(dev.projects.length > 0 || dev.experience.length > 0) && (
        <div className="px-4 mt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full text-center text-xs font-medium text-primary py-1.5 hover:underline"
          >
            {expanded ? "সংক্ষিপ্ত করুন" : "আরও দেখুন"}
          </button>
        </div>
      )}

      {expanded && (
        <div className="px-4 pb-1 space-y-3 animate-in fade-in-0 slide-in-from-top-2 duration-200">
          {/* Projects */}
          {dev.projects.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <FolderGit2 className="w-3 h-3" /> প্রজেক্টস
              </p>
              <div className="space-y-1.5">
                {dev.projects.map((p, i) => (
                  <div key={i} className="rounded-lg bg-muted/40 p-2.5">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-foreground">{p.title}</p>
                      {p.url && (
                        <a href={p.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 text-primary" />
                        </a>
                      )}
                    </div>
                    {p.description && <p className="text-[10px] text-muted-foreground mt-0.5">{p.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {dev.experience.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Briefcase className="w-3 h-3" /> অভিজ্ঞতা
              </p>
              <div className="relative border-l-2 border-primary/20 ml-2 space-y-3 pl-4">
                {dev.experience.map((e, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-card" />
                    <p className="text-xs font-semibold text-foreground">{e.title}</p>
                    <p className="text-[10px] text-muted-foreground">{e.company} • {e.year_from}{e.year_to ? ` — ${e.year_to}` : " — বর্তমান"}</p>
                    {e.description && <p className="text-[10px] text-muted-foreground mt-0.5">{e.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="h-4" />
    </div>
  );
};

/* ── Page ── */
const DeveloperProfile = () => {
  const navigate = useNavigate();
  const [devs, setDevs] = useState<DevProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("developer_profile")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (data) setDevs(data as unknown as DevProfile[]);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background max-w-3xl mx-auto pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border/40 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <h1 className="text-base font-bold text-foreground">ডেভেলপার টিম</h1>
      </div>

      {loading ? (
        <div className="px-4 pt-4 space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="rounded-2xl border border-border/60 overflow-hidden">
              <Skeleton className="w-full h-32" />
              <div className="flex flex-col items-center -mt-10 pb-4">
                <Skeleton className="w-20 h-20 rounded-full" />
                <Skeleton className="w-32 h-4 mt-2" />
                <Skeleton className="w-24 h-3 mt-1" />
              </div>
            </div>
          ))}
        </div>
      ) : devs.length === 0 ? (
        <div className="flex items-center justify-center h-60">
          <p className="text-muted-foreground text-sm">কোনো ডেভেলপার প্রোফাইল পাওয়া যায়নি</p>
        </div>
      ) : (
        <div className="px-4 pt-4 space-y-5">
          {devs.map((d) => (
            <DeveloperCard key={d.id} dev={d} />
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default DeveloperProfile;
