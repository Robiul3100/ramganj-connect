import { useState, useEffect } from "react";
import { Download, Smartphone, Apple, Monitor, ChevronDown, QrCode, CheckCircle2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import DrawerMenu from "@/components/DrawerMenu";
import BottomNav from "@/components/BottomNav";

const InstallPage = () => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>("android");
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  const currentUrl = typeof window !== "undefined" ? window.location.origin : "https://ramganj-city.lovable.app";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}&bgcolor=ffffff&color=2680EB`;

  const toggle = (id: string) => setOpenSection(openSection === id ? null : id);

  const steps = {
    android: [
      "Chrome ব্রাউজারে অ্যাপটি ওপেন করুন",
      "উপরে ডানদিকে তিনটি ডট (⋮) মেনুতে ট্যাপ করুন",
      '"Add to Home screen" বা "Install app" এ ট্যাপ করুন',
      '"Install" বাটনে ক্লিক করুন',
      "হোম স্ক্রিনে অ্যাপ আইকন দেখা যাবে!",
    ],
    ios: [
      "Safari ব্রাউজারে অ্যাপটি ওপেন করুন",
      "নিচের শেয়ার বাটনে (⬆️) ট্যাপ করুন",
      "স্ক্রল করে \"Add to Home Screen\" খুঁজুন",
      '"Add" বাটনে ট্যাপ করুন',
      "হোম স্ক্রিনে অ্যাপ আইকন দেখা যাবে!",
    ],
    desktop: [
      "Chrome বা Edge ব্রাউজারে অ্যাপটি ওপেন করুন",
      "অ্যাড্রেস বারের ডানদিকে ইনস্টল আইকন (⊕) দেখুন",
      '"Install" বাটনে ক্লিক করুন',
      "ডেস্কটপে শর্টকাট তৈরি হবে!",
    ],
  };

  const sections = [
    { id: "android", label: "অ্যান্ড্রয়েড", icon: Smartphone, color: "from-emerald-500 to-green-500", steps: steps.android },
    { id: "ios", label: "আইফোন / আইপ্যাড", icon: Apple, color: "from-gray-600 to-gray-800", steps: steps.ios },
    { id: "desktop", label: "ডেস্কটপ", icon: Monitor, color: "from-blue-500 to-indigo-500", steps: steps.desktop },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <Navbar onMenuClick={() => setDrawerOpen(true)} />
      <DrawerMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="max-w-lg mx-auto px-4 pt-4">
        {/* Back button */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> পেছনে যান
        </button>

        {/* Phone Install Animation */}
        <div className="flex justify-center mb-6">
          <div className="relative w-44 h-72">
            {/* Phone frame */}
            <div className="absolute inset-0 rounded-[2rem] border-[3px] border-foreground/20 bg-card shadow-xl overflow-hidden">
              {/* Status bar */}
              <div className="h-6 bg-foreground/5 flex items-center justify-center">
                <div className="w-16 h-1.5 rounded-full bg-foreground/15" />
              </div>
              {/* Screen content */}
              <div className="p-3 flex flex-col items-center pt-6">
                {/* App icon dropping in */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg"
                  style={{ animation: "app-icon-drop 2s ease-out infinite" }}>
                  <Download className="w-6 h-6 text-primary-foreground" />
                </div>
                {/* App name */}
                <div className="mt-2 w-16 h-1.5 rounded bg-foreground/15"
                  style={{ animation: "app-label-in 2s ease-out 0.4s infinite", opacity: 0 }} />
                {/* Progress bar */}
                <div className="mt-5 w-full h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                  <div className="h-full rounded-full bg-primary"
                    style={{ animation: "install-progress 2s ease-in-out infinite" }} />
                </div>
                {/* Installing text */}
                <div className="mt-2 w-20 h-1 rounded bg-foreground/10"
                  style={{ animation: "app-label-in 2s ease-out 0.6s infinite", opacity: 0 }} />
                {/* Checkmark */}
                <div className="mt-4" style={{ animation: "check-pop 2s ease-out 1.6s infinite", opacity: 0 }}>
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
              </div>
            </div>
            {/* Home indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-foreground/15" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-foreground">রামগঞ্জ সিটি অ্যাপ ইনস্টল করুন</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            বিনামূল্যে ইনস্টল করুন — কোনো অ্যাপ স্টোর লাগবে না!
          </p>
        </div>

        <style>{`
          @keyframes app-icon-drop {
            0% { transform: translateY(-30px) scale(0.5); opacity: 0; }
            20% { transform: translateY(0) scale(1); opacity: 1; }
            80% { transform: translateY(0) scale(1); opacity: 1; }
            100% { transform: translateY(0) scale(1); opacity: 1; }
          }
          @keyframes app-label-in {
            0%, 15% { opacity: 0; transform: translateY(4px); }
            25% { opacity: 1; transform: translateY(0); }
            80% { opacity: 1; }
            100% { opacity: 1; }
          }
          @keyframes install-progress {
            0%, 15% { width: 0%; }
            70% { width: 100%; }
            100% { width: 100%; }
          }
          @keyframes check-pop {
            0%, 75% { opacity: 0; transform: scale(0.3); }
            85% { opacity: 1; transform: scale(1.15); }
            90% { transform: scale(1); }
            100% { opacity: 1; transform: scale(1); }
          }
        `}</style>

        {/* Already installed */}
        {isStandalone && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 mb-5 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">অ্যাপ ইনস্টল করা আছে!</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-500">আপনি ইতিমধ্যে অ্যাপটি ব্যবহার করছেন।</p>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          {[
            { emoji: "⚡", label: "দ্রুত লোড" },
            { emoji: "📴", label: "অফলাইনে চলে" },
            { emoji: "🔔", label: "নোটিফিকেশন" },
          ].map((f) => (
            <div key={f.label} className="bg-card border border-border/50 rounded-xl p-3 text-center">
              <span className="text-2xl">{f.emoji}</span>
              <p className="text-[10px] font-medium text-foreground mt-1">{f.label}</p>
            </div>
          ))}
        </div>

        {/* Installation Steps */}
        <div className="space-y-3 mb-6">
          {sections.map((s) => {
            const Icon = s.icon;
            const isOpen = openSection === s.id;
            return (
              <div key={s.id} className="bg-card border border-border/50 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggle(s.id)}
                  className="w-full flex items-center gap-3 p-4 text-left"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="flex-1 font-bold text-sm text-foreground">{s.label}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 space-y-2.5 animate-in slide-in-from-top-2 duration-200">
                    {s.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                        </div>
                        <p className="text-xs text-foreground leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* QR Code */}
        <div className="bg-card border border-border/50 rounded-2xl p-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <QrCode className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-sm text-foreground">QR কোড স্ক্যান করুন</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            মোবাইলে ক্যামেরা দিয়ে স্ক্যান করলে সরাসরি অ্যাপ ওপেন হবে
          </p>
          <div className="inline-block p-3 bg-white rounded-2xl shadow-sm">
            <img
              src={qrUrl}
              alt="QR Code"
              className="w-40 h-40"
              loading="lazy"
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-3 font-mono break-all">{currentUrl}</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default InstallPage;
