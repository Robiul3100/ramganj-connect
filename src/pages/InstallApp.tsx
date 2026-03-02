import { useState, useEffect } from "react";
import { Download, Smartphone, Apple, Monitor, ChevronDown, QrCode, CheckCircle2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import DrawerMenu from "@/components/DrawerMenu";
import BottomNav from "@/components/BottomNav";
import logoImg from "@/assets/ramganj-logo.png";

/* ── Phone Install Demo Animation ── */
const PhoneInstallDemo = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const sequence = [1500, 1200, 1000, 1200, 1800, 1500];
    let timeout: ReturnType<typeof setTimeout>;
    const next = (s: number) => {
      timeout = setTimeout(() => {
        setStep((s + 1) % 6);
        next(s + 1 < 6 ? s + 1 : 0);
      }, sequence[s % 6]);
    };
    next(step);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="flex flex-col items-center mb-6">
      {/* Phone frame */}
      <div
        className="relative rounded-[2rem] border-[3px] border-foreground/20 bg-card overflow-hidden shadow-xl"
        style={{ width: 180, height: 320 }}
      >
        {/* Status bar */}
        <div className="h-6 bg-foreground/5 flex items-center justify-between px-3">
          <span className="text-[8px] text-muted-foreground font-mono">9:41</span>
          <div className="flex gap-1">
            <div className="w-2.5 h-1.5 rounded-sm bg-muted-foreground/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
          </div>
        </div>

        {/* Screen content */}
        <div className="relative h-[calc(100%-24px)] flex flex-col items-center justify-center p-3">
          {/* Browser bar - step 0,1 */}
          <div
            className="absolute top-0 left-0 right-0 h-8 bg-muted/80 flex items-center gap-1.5 px-2 transition-all duration-500"
            style={{ opacity: step <= 2 ? 1 : 0, transform: step > 2 ? "translateY(-100%)" : "translateY(0)" }}
          >
            <div className="w-3 h-3 rounded-full bg-primary/30" />
            <div className="flex-1 h-4 rounded-full bg-background/80 flex items-center px-1.5">
              <span className="text-[6px] text-muted-foreground truncate">ramganjcity.com</span>
            </div>
            {/* 3-dot menu appears at step 1 */}
            <div
              className="flex flex-col gap-[2px] transition-all duration-300"
              style={{ opacity: step >= 1 ? 1 : 0.3, transform: step === 1 ? "scale(1.4)" : "scale(1)" }}
            >
              <span className="block w-[3px] h-[3px] rounded-full bg-foreground/70" />
              <span className="block w-[3px] h-[3px] rounded-full bg-foreground/70" />
              <span className="block w-[3px] h-[3px] rounded-full bg-foreground/70" />
            </div>
          </div>

          {/* Menu dropdown - step 1 */}
          <div
            className="absolute top-8 right-1 z-10 bg-card border border-border rounded-lg shadow-lg w-28 py-1 transition-all duration-300 origin-top-right"
            style={{
              opacity: step === 1 ? 1 : 0,
              transform: step === 1 ? "scale(1)" : "scale(0.8)",
              pointerEvents: "none",
            }}
          >
            <div className="px-2 py-1 text-[7px] text-muted-foreground">New tab</div>
            <div className="px-2 py-1 text-[7px] text-muted-foreground">Bookmarks</div>
            <div className="px-2 py-1 text-[7px] font-bold text-primary bg-primary/10 rounded flex items-center gap-1">
              <Download className="w-2 h-2" /> Install app
            </div>
            <div className="px-2 py-1 text-[7px] text-muted-foreground">Settings</div>
          </div>

          {/* Install dialog - step 2 */}
          <div
            className="absolute inset-x-3 z-20 bg-card border border-border rounded-2xl shadow-2xl p-3 flex flex-col items-center gap-2 transition-all duration-400"
            style={{
              opacity: step === 2 ? 1 : 0,
              transform: step === 2 ? "scale(1) translateY(0)" : "scale(0.9) translateY(10px)",
              pointerEvents: "none",
              top: "30%",
            }}
          >
            <img src={logoImg} alt="" className="w-8 h-8 rounded-lg" />
            <p className="text-[8px] font-bold text-foreground">Install Ramganj City?</p>
            <div className="flex gap-2 w-full">
              <div className="flex-1 text-center text-[7px] py-1 rounded-md bg-muted text-muted-foreground">Cancel</div>
              <div className="flex-1 text-center text-[7px] py-1 rounded-md bg-primary text-primary-foreground font-bold animate-pulse">Install</div>
            </div>
          </div>

          {/* Installing progress - step 3 */}
          <div
            className="flex flex-col items-center gap-2 transition-all duration-500"
            style={{ opacity: step === 3 ? 1 : 0, transform: step === 3 ? "scale(1)" : "scale(0.8)" }}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
              <Download className="w-5 h-5 text-primary-foreground" />
            </div>
            <p className="text-[8px] font-bold text-foreground">Installing...</p>
            <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ animation: "install-progress 1s ease-out forwards" }} />
            </div>
          </div>

          {/* Home screen with icon - step 4,5 */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-background to-muted/50 flex flex-col transition-all duration-500 pt-8"
            style={{
              opacity: step >= 4 ? 1 : 0,
              transform: step >= 4 ? "translateY(0)" : "translateY(20px)",
              pointerEvents: "none",
            }}
          >
            {/* App grid */}
            <div className="grid grid-cols-4 gap-2 px-3 pt-4">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <div className="w-8 h-8 rounded-xl bg-muted" />
                  <span className="text-[5px] text-muted-foreground">App</span>
                </div>
              ))}
              {/* Our app icon - highlighted */}
              <div className="flex flex-col items-center gap-0.5">
                <div
                  className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-md"
                  style={{ animation: step === 4 ? "icon-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both" : undefined }}
                >
                  <img src={logoImg} alt="" className="w-6 h-6 rounded-md" />
                </div>
                <span className="text-[5px] font-bold text-primary">রামগঞ্জ</span>
              </div>
            </div>

            {/* Success checkmark - step 5 */}
            <div
              className="flex flex-col items-center mt-auto mb-8 transition-all duration-400"
              style={{ opacity: step === 5 ? 1 : 0, transform: step === 5 ? "scale(1)" : "scale(0)" }}
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">ইনস্টল সম্পন্ন!</p>
            </div>
          </div>
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-foreground/20" />
      </div>

      {/* Step indicator dots */}
      <div className="flex gap-1.5 mt-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{
              background: i === step ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)",
              transform: i === step ? "scale(1.4)" : "scale(1)",
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes install-progress {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes icon-pop {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

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

        {/* Hero */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg mb-4">
            <Download className="w-9 h-9 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">রামগঞ্জ সিটি অ্যাপ ইনস্টল করুন</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            বিনামূল্যে ইনস্টল করুন — কোনো অ্যাপ স্টোর লাগবে না!
          </p>
        </div>

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

        {/* Phone Install Demo Animation */}
        <PhoneInstallDemo />

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
