import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Ad {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  target_pages: string[];
}

const PageAdBanner = ({ pageSlug }: { pageSlug: string }) => {
  const [ad, setAd] = useState<Ad | null>(null);

  useEffect(() => {
    const fetchAd = async () => {
      const { data } = await supabase
        .from("advertisements")
        .select("id, title, description, image_url, link_url, target_pages")
        .eq("is_active", true)
        .or(`expire_at.is.null,expire_at.gt.${new Date().toISOString()}`);

      if (!data || data.length === 0) return;

      // Filter ads that target this page (empty target_pages = show everywhere)
      const eligible = (data as unknown as Ad[]).filter(
        (a) => !a.target_pages || a.target_pages.length === 0 || a.target_pages.includes(pageSlug)
      );

      if (eligible.length === 0) return;

      // Pick a random ad
      const randomAd = eligible[Math.floor(Math.random() * eligible.length)];
      setAd(randomAd);
    };

    fetchAd();
  }, [pageSlug]);

  if (!ad || !ad.image_url) return null;

  const handleClick = async () => {
    await supabase.rpc("increment_ad_click", { ad_id: ad.id });
  };

  const content = (
    <div className="rounded-2xl overflow-hidden border border-border/40 shadow-sm relative group">
      <img
        src={ad.image_url}
        alt={ad.title}
        className="w-full aspect-[6/1] object-cover"
        loading="lazy"
      />
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      <div className="absolute bottom-1.5 right-2">
        <span className="text-[9px] font-medium bg-card/80 backdrop-blur-sm text-muted-foreground px-1.5 py-0.5 rounded">
          বিজ্ঞাপন
        </span>
      </div>
    </div>
  );

  if (ad.link_url) {
    return (
      <a
        href={ad.link_url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="block"
      >
        {content}
      </a>
    );
  }

  return <div onClick={handleClick}>{content}</div>;
};

export default PageAdBanner;
