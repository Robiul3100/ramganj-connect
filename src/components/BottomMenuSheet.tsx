import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
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
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface BottomMenuSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BottomMenuSheet = ({ open, onOpenChange }: BottomMenuSheetProps) => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
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
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5 px-1">
            <Palette className="w-3.5 h-3.5" /> থিম
          </p>
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
