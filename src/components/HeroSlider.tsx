import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SliderItem {
  id: string;
  title: string;
  image_url: string;
}

const HeroSlider = () => {
  const [slides, setSlides] = useState<SliderItem[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await (supabase.from as any)("slider_items")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (data && data.length > 0) setSlides(data);
    };
    fetch();

    const ch = supabase.channel("slider_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "slider_items" }, () => fetch())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const next = useCallback(() => {
    if (slides.length > 0) setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="px-4">
      <div className="relative rounded-3xl overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="aspect-[16/10] relative">
          {slides.map((slide, i) => (
            <img
              key={slide.id}
              src={slide.image_url}
              alt={slide.title}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                i === current ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? "w-6 bg-white" : "w-2 bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;
