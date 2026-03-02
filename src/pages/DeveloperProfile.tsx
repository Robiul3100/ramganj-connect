import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Phone, MessageCircle,
  ArrowLeft, Briefcase, Code2, FolderGit2, ExternalLink, Globe,
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

/* Brand SVG Icons */
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
);
const GithubIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
);
const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
);
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);
const GlobeIcon = () => (
  <Globe className="w-4 h-4 text-primary" />
);

const socialIcons = [
  { key: "facebook_url", icon: FacebookIcon, label: "Facebook" },
  { key: "github_url", icon: GithubIcon, label: "GitHub" },
  { key: "linkedin_url", icon: LinkedinIcon, label: "LinkedIn" },
  { key: "twitter_url", icon: TwitterIcon, label: "Twitter" },
  { key: "website_url", icon: GlobeIcon, label: "Website" },
] as const;

/* ── Single Developer Card ── */
const DeveloperCard = ({ dev }: { dev: DevProfile }) => {
  const [expanded, setExpanded] = useState(false);
  const links = socialIcons.filter((s) => dev[s.key]);

  return (
    <div className="rounded-2xl dev-card-animated-border overflow-hidden shadow-sm">
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
              <s.icon />
            </a>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="px-4 mt-3 flex gap-2.5">
        {dev.phone && (
          <a
            href={`tel:${dev.phone}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold text-xs shadow-sm hover:opacity-90 transition-opacity text-white"
            style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}
          >
            <Phone className="w-3.5 h-3.5" /> কল করুন
          </a>
        )}
        {dev.messenger_url && (
          <a
            href={dev.messenger_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold text-xs shadow-sm hover:opacity-90 transition-opacity text-white"
            style={{ background: 'linear-gradient(135deg, #0078FF, #FF56A9)' }}
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
