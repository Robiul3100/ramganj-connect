import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";

interface AboutContent {
  article_title: string;
  article_body: string;
  meta_description: string | null;
}

interface GalleryItem {
  id: string;
  image_url: string;
  caption: string | null;
}

interface TimelineEvent {
  id: string;
  year: number;
  title: string;
  description: string | null;
}

const AboutRamganj = () => {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchAll = async () => {
      const [contentRes, galleryRes, timelineRes] = await Promise.all([
        (supabase.from as any)("about_content").select("*").limit(1).single(),
        (supabase.from as any)("about_gallery").select("*").eq("is_active", true).order("sort_order"),
        (supabase.from as any)("timeline_events").select("*").order("sort_order"),
      ]);
      if (contentRes.data) setContent(contentRes.data);
      if (galleryRes.data) setGallery(galleryRes.data);
      if (timelineRes.data) setTimeline(timelineRes.data);
    };
    fetchAll();
  }, []);

  const nextSlide = useCallback(() => {
    if (gallery.length > 0) setCurrentSlide((p) => (p + 1) % gallery.length);
  }, [gallery.length]);

  useEffect(() => {
    if (gallery.length <= 1) return;
    const t = setInterval(nextSlide, 4000);
    return () => clearInterval(t);
  }, [nextSlide, gallery.length]);

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto">
      {content?.meta_description && (
        <meta name="description" content={content.meta_description} />
      )}
      
      <PageHeader title="রামগঞ্জ সম্পর্কে" color="linear-gradient(135deg, hsl(210,85%,50%), hsl(195,75%,50%))" />

      <div className="px-4 -mt-2 space-y-6 pb-8">
        {/* Image Slider */}
        {gallery.length > 0 && (
          <div className="relative rounded-2xl overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="aspect-[16/10] relative">
              {gallery.map((img, i) => (
                <img
                  key={img.id}
                  src={img.image_url}
                  alt={img.caption || "রামগঞ্জ"}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === currentSlide ? "opacity-100" : "opacity-0"}`}
                />
              ))}
            </div>
            {gallery[currentSlide]?.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <p className="text-white text-sm font-medium">{gallery[currentSlide].caption}</p>
              </div>
            )}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {gallery.map((_, i) => (
                <button key={i} onClick={() => setCurrentSlide(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${i === currentSlide ? "w-6 bg-white" : "w-2 bg-white/50"}`} />
              ))}
            </div>
          </div>
        )}

        {/* Article */}
        {content && (
          <article className="glass-card p-5">
            <h1 className="text-xl font-bold text-foreground mb-3">{content.article_title}</h1>
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{content.article_body}</div>
          </article>
        )}

        {/* Timeline */}
        {timeline.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-foreground mb-4">📜 ঐতিহাসিক টাইমলাইন</h2>
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-primary/20" />
              <div className="space-y-6">
                {timeline.map((event, i) => (
                  <div key={event.id} className="relative flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold z-10 shrink-0">
                      {event.year}
                    </div>
                    <div className="glass-card p-4 flex-1">
                      <h3 className="font-bold text-foreground text-sm">{event.title}</h3>
                      {event.description && <p className="text-xs text-muted-foreground mt-1">{event.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AboutRamganj;
