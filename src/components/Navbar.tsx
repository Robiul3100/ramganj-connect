import { Menu, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useState, useRef, useEffect } from "react";
import ramganjCityLogo from "@/assets/ramganj-city-logo.png";

interface NavbarProps {
  onMenuClick: () => void;
}

const themeOptions = [
  { value: "light" as const, icon: Sun, label: "লাইট" },
  { value: "dark" as const, icon: Moon, label: "ডার্ক" },
  { value: "system" as const, icon: Monitor, label: "সিস্টেম" },
];

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const CurrentIcon = themeOptions.find((o) => o.value === theme)?.icon || Sun;

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between px-4 py-3 max-w-4xl mx-auto">
        <button
          onClick={onMenuClick}
          className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-sm"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Logo centered */}
        <div className="flex-1 flex justify-center">
          <img
            src={ramganjCityLogo}
            alt="রামগঞ্জ সিটি"
            className="h-10 w-auto object-contain"
          />
        </div>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(!open)}
            className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <CurrentIcon className="w-5 h-5 text-primary" />
          </button>
          {open && (
            <div className="absolute right-0 top-12 bg-card rounded-2xl shadow-lg border border-border p-1.5 min-w-[140px] animate-fade-in z-50">
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                const active = theme === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => { setTheme(opt.value); setOpen(false); }}
                    className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm transition-colors ${
                      active ? "bg-primary/10 text-primary font-semibold" : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
