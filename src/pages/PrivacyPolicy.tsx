import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("site_settings").select("value").eq("key", "privacy_policy_content").single();
      setContent(data?.value || "");
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto pb-20">
      <PageHeader title="প্রাইভেসি পলিসি" color="var(--gradient-primary)" />
      <div className="px-4 py-4 space-y-4">
        {loading ? (
          <div className="glass-card p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-4 rounded skeleton-shimmer" />)}
          </div>
        ) : (
          <div className="glass-card p-4 text-sm text-muted-foreground leading-relaxed news-html-content" dangerouslySetInnerHTML={{ __html: content }} />
        )}
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default PrivacyPolicy;
