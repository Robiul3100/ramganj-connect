import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  User,
  Moon,
  Sun,
  Monitor,
  Shield,
  Phone,
  Heart,
  Info,
  Newspaper,
  Building2,
  MessageSquare,
  LogOut,
  ChevronRight,
  Palette,
  Type,
  LayoutGrid,
  Bell,
  BellOff,
  Star,
  Rows3,
  Columns3,
  Sparkles,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { usePushNotifications } from "@/hooks/usePushNotifications";

interface BottomMenuSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BottomMenuSheet = ({ open, onOpenChange }: BottomMenuSheetProps) => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { prefs, setPref, requestNotificationPermission } = useUserPreferences();
  const { subscribe, unsubscribe } = usePushNotifications();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, [open]);

  const vibrate = () => navigator.vibrate?.(20);

  const go = (route: string) => {
    vibrate();
    navigate(route);
    onOpenChange(false);
  };

  const handleLogout = async () => {
    vibrate();
    await supabase.auth.signOut();
    setUser(null);
    onOpenChange(false);
    navigate("/");
  };

  const themeOptions = [
    { value: "light" as const, icon: Sun, label: "লাইট" },
    { value: "dark" as const, icon: Moon, label: "ডার্ক" },
    { value: "system" as const, icon: Monitor, label: "সিস্টেম" },
  ];

  const fontSizeOptions = [
    { value: "small" as const, label: "ছোট", size: "text-xs" },
    { value: "medium" as const, label: "মাঝারি", size: "text-sm" },
    { value: "large" as const, label: "বড়", size: "text-base" },
  ];

  const menuSections = [
    {
      title: "অ্যাকাউন্ট",
      items: [
        { icon: User, label: "প্রোফাইল", action: () => go("/profile") },
        { icon: Shield, label: "অ্যাডমিন প্যানেল", action: () => go("/admin-login") },
      ],
    },
    {
      title: "সেবা ও তথ্য",
      items: [
        { icon: Phone, label: "জরুরি কল", action: () => go("/emergency-calls") },
        { icon: Heart, label: "ব্লাড ব্যাংক", action: () => go("/blood-bank") },
        { icon: Building2, label: "অফিস তথ্য", action: () => go("/offices") },
        { icon: Newspaper, label: "সংবাদ", action: () => go("/news") },
      ],
    },
    {
      title: "অন্যান্য",
      items: [
        { icon: Info, label: "রামগঞ্জ সম্পর্কে", action: () => go("/about-ramganj") },
        { icon: MessageSquare, label: "যোগাযোগ", action: () => go("/contact") },
      ],
    },
  ];

  const SectionLabel = ({ icon: Icon, label }: { icon: React.ElementType; label: string }) => (
    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5 px-1">
      <Icon className="w-3.5 h-3.5" /> {label}
    </p>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto px-0 pb-8">
        <SheetHeader className="px-5 pb-3">
          <SheetTitle className="text-base font-bold text-foreground">মেন্যু ও সেটিংস</SheetTitle>
        </SheetHeader>

        {/* User card */}
        <div className="mx-4 mb-4 rounded-2xl bg-muted/50 dark:bg-muted/30 p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-foreground truncate">
              {user?.email || "অতিথি ব্যবহারকারী"}
            </p>
            <p className="text-xs text-muted-foreground">
              {user ? "লগইন হয়েছে" : "লগইন করুন"}
            </p>
          </div>
        </div>

        {/* Theme picker */}
        <div className="mx-4 mb-4">
          <SectionLabel icon={Palette} label="থিম" />
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map((t) => {
              const active = theme === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => { vibrate(); setTheme(t.value); }}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all text-xs font-semibold ${
                    active
                      ? "border-primary bg-primary/10 text-primary dark:bg-primary/15"
                      : "border-border/50 bg-card/60 text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  <t.icon className="w-5 h-5" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Font size */}
        <div className="mx-4 mb-4">
          <SectionLabel icon={Type} label="ফন্ট সাইজ" />
          <div className="grid grid-cols-3 gap-2">
            {fontSizeOptions.map((f) => {
              const active = prefs.fontSize === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => { vibrate(); setPref("fontSize", f.value); }}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition-all font-semibold ${f.size} ${
                    active
                      ? "border-primary bg-primary/10 text-primary dark:bg-primary/15"
                      : "border-border/50 bg-card/60 text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  <Type className="w-4 h-4" />
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Layout */}
        <div className="mx-4 mb-4">
          <SectionLabel icon={LayoutGrid} label="লেআউট" />
          <div className="grid grid-cols-2 gap-2">
            {([
              { value: "comfortable" as const, icon: Rows3, label: "আরামদায়ক" },
              { value: "compact" as const, icon: Columns3, label: "কম্প্যাক্ট" },
            ]).map((l) => {
              const active = prefs.layout === l.value;
              return (
                <button
                  key={l.value}
                  onClick={() => { vibrate(); setPref("layout", l.value); }}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all text-xs font-semibold ${
                    active
                      ? "border-primary bg-primary/10 text-primary dark:bg-primary/15"
                      : "border-border/50 bg-card/60 text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  <l.icon className="w-4 h-4" />
                  {l.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Toggle settings */}
        <div className="mx-4 mb-4 space-y-1">
          <SectionLabel icon={Sparkles} label="কাস্টমাইজেশন" />
          <div className="rounded-2xl border border-border/50 overflow-hidden divide-y divide-border/30">
            {/* Auto theme color */}
            <div className="flex items-center justify-between px-4 py-3 bg-card/60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Palette className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">অটো থিম কালার</p>
                  <p className="text-[10px] text-muted-foreground">সময় অনুযায়ী থিম বদলাবে</p>
                </div>
              </div>
              <Switch
                checked={prefs.autoThemeColor}
                onCheckedChange={(v) => { vibrate(); setPref("autoThemeColor", v); }}
              />
            </div>

            {/* Featured cards */}
            <div className="flex items-center justify-between px-4 py-3 bg-card/60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Star className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">ফিচার্ড কার্ড</p>
                  <p className="text-[10px] text-muted-foreground">হোমপেজে ফিচার্ড সেবা দেখান</p>
                </div>
              </div>
              <Switch
                checked={prefs.showFeaturedCards}
                onCheckedChange={(v) => { vibrate(); setPref("showFeaturedCards", v); }}
              />
            </div>

            {/* News cards */}
            <div className="flex items-center justify-between px-4 py-3 bg-card/60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Newspaper className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">নিউজ কার্ড</p>
                  <p className="text-[10px] text-muted-foreground">হোমপেজে সংবাদ সেকশন দেখান</p>
                </div>
              </div>
              <Switch
                checked={prefs.showNewsCards}
                onCheckedChange={(v) => { vibrate(); setPref("showNewsCards", v); }}
              />
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between px-4 py-3 bg-card/60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  {prefs.notificationsEnabled ? (
                    <Bell className="w-4 h-4 text-blue-500" />
                  ) : (
                    <BellOff className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">নোটিফিকেশন</p>
                  <p className="text-[10px] text-muted-foreground">পুশ নোটিফিকেশন চালু/বন্ধ</p>
                </div>
              </div>
              <Switch
                checked={prefs.notificationsEnabled}
                onCheckedChange={async (v) => {
                  vibrate();
                  if (v) {
                    const granted = await requestNotificationPermission();
                    if (!granted) return;
                    subscribe();
                  } else {
                    unsubscribe();
                  }
                  setPref("notificationsEnabled", v);
                }}
              />
            </div>
          </div>
        </div>

        {/* Menu sections */}
        {menuSections.map((section) => (
          <div key={section.title} className="mb-3">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-5">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-muted/50 active:bg-muted/70 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/8 dark:bg-primary/12 flex items-center justify-center shrink-0">
                    <item.icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <span className="flex-1 text-left text-sm font-medium text-foreground">{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Logout */}
        {user && (
          <div className="mx-4 mt-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-destructive/10 text-destructive font-semibold text-sm hover:bg-destructive/15 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              লগআউট করুন
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default BottomMenuSheet;
