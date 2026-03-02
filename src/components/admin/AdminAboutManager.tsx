import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Save, Edit3, Trash2, Image as ImageIcon, Plus, Info, History } from "lucide-react";
import SwipeUpEditor from "./SwipeUpEditor";

interface Props {
  logActivity: (action: string, tableName?: string, recordId?: string, details?: string) => Promise<void>;
}

const AdminAboutManager = ({ logActivity }: Props) => {
  const [aboutForm, setAboutForm] = useState({ article_title: "", article_body: "", meta_description: "" });
  const [aboutLoaded, setAboutLoaded] = useState(false);
  const [aboutSaving, setAboutSaving] = useState(false);
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [galleryForm, setGalleryForm] = useState({ image_url: "", caption: "", sort_order: 0 });
  const [galleryEditId, setGalleryEditId] = useState<string | null>(null);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [timelineForm, setTimelineForm] = useState({ title: "", year: "", description: "", sort_order: "0" });
  const [timelineEditId, setTimelineEditId] = useState<string | null>(null);
  const [showTimelineForm, setShowTimelineForm] = useState(false);

  useEffect(() => {
    const fetchAbout = async () => {
      const { data } = await (supabase.from as any)("about_content").select("*").limit(1).single();
      if (data) {
        setAboutForm({ article_title: data.article_title || "", article_body: data.article_body || "", meta_description: data.meta_description || "" });
        setAboutLoaded(true);
      }
    };
    fetchAbout();
    const fetchGallery = async () => {
      const { data } = await (supabase.from as any)("about_gallery").select("*").order("sort_order");
      setGalleryItems(data || []);
    };
    fetchGallery();
    const fetchTimeline = async () => {
      const { data } = await (supabase.from as any)("timeline_events").select("*").order("sort_order");
      setTimelineData(data || []);
    };
    fetchTimeline();
  }, []);

  const saveAboutContent = async () => {
    setAboutSaving(true);
    const { data: existing } = await (supabase.from as any)("about_content").select("id").limit(1).single();
    if (existing) {
      await (supabase.from as any)("about_content").update(aboutForm).eq("id", existing.id);
    } else {
      await (supabase.from as any)("about_content").insert(aboutForm);
    }
    await logActivity("edited", "about_content", undefined, aboutForm.article_title);
    toast({ title: "সেভ হয়েছে ✅" });
    setAboutSaving(false);
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setGalleryUploading(true);
    const ext = file.name.split(".").pop();
    const path = `gallery/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) { toast({ title: "আপলোড ব্যর্থ", variant: "destructive" }); setGalleryUploading(false); return; }
    const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
    setGalleryForm({ ...galleryForm, image_url: urlData.publicUrl });
    setGalleryUploading(false);
  };

  const saveGalleryItem = async () => {
    if (!galleryForm.image_url.trim()) { toast({ title: "ছবি দিন", variant: "destructive" }); return; }
    if (galleryEditId) {
      await (supabase.from as any)("about_gallery").update(galleryForm).eq("id", galleryEditId);
      toast({ title: "আপডেট হয়েছে ✅" });
    } else {
      await (supabase.from as any)("about_gallery").insert(galleryForm);
      toast({ title: "যোগ হয়েছে ✅" });
    }
    closeGalleryForm();
    const { data } = await (supabase.from as any)("about_gallery").select("*").order("sort_order");
    setGalleryItems(data || []);
  };

  const closeGalleryForm = () => {
    setGalleryForm({ image_url: "", caption: "", sort_order: 0 });
    setGalleryEditId(null);
    setShowGalleryForm(false);
  };

  const toggleGalleryActive = async (id: string, current: boolean) => {
    await (supabase.from as any)("about_gallery").update({ is_active: !current }).eq("id", id);
    setGalleryItems(galleryItems.map(g => g.id === id ? { ...g, is_active: !current } : g));
  };

  const deleteGalleryItem = async (id: string) => {
    if (!confirm("মুছে ফেলতে চান?")) return;
    await (supabase.from as any)("about_gallery").delete().eq("id", id);
    setGalleryItems(galleryItems.filter(g => g.id !== id));
    toast({ title: "মুছে ফেলা হয়েছে" });
  };

  const saveTimeline = async () => {
    if (!timelineForm.title.trim() || !timelineForm.year) { toast({ title: "শিরোনাম ও সাল দিন", variant: "destructive" }); return; }
    const insertData = { title: timelineForm.title, year: parseInt(timelineForm.year) || 0, description: timelineForm.description || null, sort_order: parseInt(timelineForm.sort_order) || 0 };
    if (timelineEditId) {
      await (supabase.from as any)("timeline_events").update(insertData).eq("id", timelineEditId);
      toast({ title: "আপডেট হয়েছে ✅" });
    } else {
      await (supabase.from as any)("timeline_events").insert(insertData);
      toast({ title: "যোগ হয়েছে ✅" });
    }
    closeTimelineForm();
    const { data } = await (supabase.from as any)("timeline_events").select("*").order("sort_order");
    setTimelineData(data || []);
  };

  const closeTimelineForm = () => {
    setTimelineForm({ title: "", year: "", description: "", sort_order: "0" });
    setTimelineEditId(null);
    setShowTimelineForm(false);
  };

  const deleteTimeline = async (id: string) => {
    if (!confirm("মুছে ফেলতে চান?")) return;
    await (supabase.from as any)("timeline_events").delete().eq("id", id);
    setTimelineData(timelineData.filter(t => t.id !== id));
    toast({ title: "মুছে ফেলা হয়েছে" });
  };

  return (
    <div className="space-y-6">
      {/* About Content */}
      <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-sm">
            <Info className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">রামগঞ্জ সম্পর্কে আর্টিকেল</h2>
            <p className="text-[10px] text-muted-foreground">About পেজের মূল কন্টেন্ট</p>
          </div>
        </div>
        <input className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50 transition-all" placeholder="আর্টিকেল শিরোনাম" value={aboutForm.article_title} onChange={(e) => setAboutForm({ ...aboutForm, article_title: e.target.value })} />
        <input className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50 transition-all" placeholder="মেটা বিবরণ (SEO)" value={aboutForm.meta_description} onChange={(e) => setAboutForm({ ...aboutForm, meta_description: e.target.value })} />
        <textarea className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none min-h-[200px] focus:border-primary/50 font-mono transition-all resize-y" placeholder="আর্টিকেল বডি..." value={aboutForm.article_body} onChange={(e) => setAboutForm({ ...aboutForm, article_body: e.target.value })} />
        <button onClick={saveAboutContent} disabled={aboutSaving} className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
          <Save className="w-4 h-4" /> {aboutSaving ? "সেভ হচ্ছে..." : "আর্টিকেল সেভ করুন"}
        </button>
      </div>

      {/* Gallery with SwipeUpEditor */}
      <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-sm">
            <ImageIcon className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-sm font-bold text-foreground">গ্যালারি ({galleryItems.length}টি)</h2>
        </div>

        <SwipeUpEditor
          open={showGalleryForm}
          onClose={closeGalleryForm}
          title={galleryEditId ? "গ্যালারি এডিট" : "নতুন গ্যালারি ছবি"}
          subtitle="গ্যালারিতে ছবি যোগ বা সম্পাদনা করুন"
          icon={<ImageIcon className="w-4 h-4 text-white" />}
          headerGradient="from-pink-500 to-rose-500"
        >
          <input className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50 transition-all" placeholder="ছবির লিংক (URL)" value={galleryForm.image_url} onChange={(e) => setGalleryForm({ ...galleryForm, image_url: e.target.value })} />
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-xs text-primary font-semibold cursor-pointer bg-primary/10 px-4 py-2.5 rounded-xl hover:bg-primary/15 transition-colors">
              <ImageIcon className="w-4 h-4" /> {galleryUploading ? "আপলোড হচ্ছে..." : "ছবি আপলোড"}
              <input type="file" accept="image/*" className="hidden" onChange={handleGalleryUpload} disabled={galleryUploading} />
            </label>
            {galleryForm.image_url && <img src={galleryForm.image_url} alt="" className="w-16 h-12 rounded-xl object-cover border border-border" />}
          </div>
          <input className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50 transition-all" placeholder="ক্যাপশন (ঐচ্ছিক)" value={galleryForm.caption} onChange={(e) => setGalleryForm({ ...galleryForm, caption: e.target.value })} />
          <div className="flex gap-2 pt-2">
            <button onClick={saveGalleryItem} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              <Save className="w-4 h-4" /> {galleryEditId ? "আপডেট" : "যোগ করুন"}
            </button>
            <button onClick={closeGalleryForm} className="px-5 py-3 rounded-xl bg-muted text-muted-foreground text-sm font-medium">
              বাতিল
            </button>
          </div>
        </SwipeUpEditor>

        <button onClick={() => setShowGalleryForm(true)} className="w-full py-3 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 text-primary text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/10 transition-colors">
          <Plus className="w-4 h-4" /> নতুন ছবি যোগ করুন
        </button>

        {galleryItems.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {galleryItems.map(item => (
              <div key={item.id} className="bg-muted/20 rounded-xl overflow-hidden border border-border/40">
                <div className="aspect-[16/10] relative">
                  <img src={item.image_url} alt={item.caption || ""} className="w-full h-full object-cover" />
                  <button onClick={() => toggleGalleryActive(item.id, item.is_active)} className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-lg flex items-center justify-center ${item.is_active ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>
                    {item.is_active ? "✅" : "⏸"}
                  </button>
                </div>
                <div className="p-2.5 flex items-center justify-between">
                  {item.caption && <p className="text-[11px] text-foreground font-medium line-clamp-1">{item.caption}</p>}
                  <div className="flex gap-1">
                    <button onClick={() => { setGalleryEditId(item.id); setGalleryForm({ image_url: item.image_url, caption: item.caption || "", sort_order: item.sort_order }); setShowGalleryForm(true); }}
                      className="text-[10px] px-2 py-1 rounded bg-blue-500/10 text-blue-600 font-semibold">এডিট</button>
                    <button onClick={() => deleteGalleryItem(item.id)}
                      className="text-[10px] px-2 py-1 rounded bg-red-500/10 text-red-600 font-semibold">মুছুন</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timeline with SwipeUpEditor */}
      <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-sm">
            <History className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-sm font-bold text-foreground">টাইমলাইন ({timelineData.length}টি)</h2>
        </div>

        <SwipeUpEditor
          open={showTimelineForm}
          onClose={closeTimelineForm}
          title={timelineEditId ? "টাইমলাইন এডিট" : "নতুন টাইমলাইন ইভেন্ট"}
          subtitle="ইতিহাসের ঘটনা যোগ করুন"
          icon={<History className="w-4 h-4 text-white" />}
          headerGradient="from-violet-500 to-indigo-500"
        >
          <input className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50 transition-all" placeholder="শিরোনাম" value={timelineForm.title} onChange={(e) => setTimelineForm({ ...timelineForm, title: e.target.value })} />
          <input type="number" className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none focus:border-primary/50 transition-all" placeholder="সাল (যেমন: 1920)" value={timelineForm.year} onChange={(e) => setTimelineForm({ ...timelineForm, year: e.target.value })} />
          <textarea className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm border border-border/60 outline-none min-h-[80px] focus:border-primary/50 transition-all resize-none" placeholder="বিবরণ" value={timelineForm.description} onChange={(e) => setTimelineForm({ ...timelineForm, description: e.target.value })} />
          <div className="flex gap-2 pt-2">
            <button onClick={saveTimeline} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              <Save className="w-4 h-4" /> {timelineEditId ? "আপডেট" : "যোগ করুন"}
            </button>
            <button onClick={closeTimelineForm} className="px-5 py-3 rounded-xl bg-muted text-muted-foreground text-sm font-medium">
              বাতিল
            </button>
          </div>
        </SwipeUpEditor>

        <button onClick={() => setShowTimelineForm(true)} className="w-full py-3 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 text-primary text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/10 transition-colors">
          <Plus className="w-4 h-4" /> নতুন টাইমলাইন ইভেন্ট
        </button>

        {timelineData.map(item => (
          <div key={item.id} className="bg-muted/20 rounded-xl p-3.5 border border-border/40">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground">{item.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">📅 {item.year}</p>
                {item.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setTimelineEditId(item.id); setTimelineForm({ title: item.title, year: item.year?.toString() || "", description: item.description || "", sort_order: item.sort_order?.toString() || "0" }); setShowTimelineForm(true); }}
                  className="text-[10px] px-2 py-1 rounded bg-blue-500/10 text-blue-600 font-semibold">এডিট</button>
                <button onClick={() => deleteTimeline(item.id)}
                  className="text-[10px] px-2 py-1 rounded bg-red-500/10 text-red-600 font-semibold">মুছুন</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminAboutManager;
