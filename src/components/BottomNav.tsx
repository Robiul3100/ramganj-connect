import { useState } from "react";
import { Home, LayoutGrid, Heart, Bell, Menu } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import BottomMenuSheet from "@/components/BottomMenuSheet";

const navItems = [
  { icon: Home, label: "হোম", route: "/", type: "route" as const },
  { icon: LayoutGrid, label: "সেবা", route: "/services", type: "route" as const },
  { icon: Heart, label: "অনুদান", route: "/donation", type: "route" as const },
  { icon: Bell, label: "নোটিশ", route: "/notifications", type: "route" as const },
  { icon: Menu, label: "মেন্যু", route: "", type: "menu" as const },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  if (location.pathname.startsWith("/admin")) return null;

  const vibrate = () => navigator.vibrate?.(25);

  const handleClick = (item: typeof navItems[0]) => {
    vibrate();
    if (item.type === "menu") {
      setMenuOpen(true);
    } else {
      navigate(item.route);
    }
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
        <div
          className="bg-card/85 backdrop-blur-2xl shadow-[0_-2px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-2px_20px_rgba(0,0,0,0.2)]"
          style={{ borderTopLeftRadius: 18, borderTopRightRadius: 18, borderTop: "1.5px solid hsl(var(--border) / 0.4)" }}
        >
          <div className="max-w-4xl mx-auto flex items-end justify-around px-1 pt-1.5 pb-2">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = item.type === "route"
                ? (item.route === "/" ? location.pathname === "/" : location.pathname.startsWith(item.route))
                : menuOpen;
              const isCenter = idx === 2;

              if (isCenter) {
                return (
                  <button
                    key={item.label}
                    onClick={() => handleClick(item)}
                    className="relative flex flex-col items-center -mt-5 group"
                    aria-label={item.label}
                  >
                    <div
                      className={`absolute inset-0 rounded-full blur-lg transition-opacity duration-300 ${
                        isActive ? "opacity-40" : "opacity-0 group-hover:opacity-20"
                      }`}
                      style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.6))" }}
                    />
                    <div
                      className={`relative w-[52px] h-[52px] rounded-full flex items-center justify-center shadow-lg transition-all duration-300 bg-primary ${
                        isActive ? "scale-110 shadow-primary/30" : "scale-100 group-hover:scale-105"
                      }`}
                    >
                      <Icon className="w-[22px] h-[22px] text-primary-foreground" strokeWidth={2.2} />
                    </div>
                    <span className={`text-[10px] mt-1 leading-tight font-bold transition-colors duration-200 ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}>
                      {item.label}
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={item.label}
                  onClick={() => handleClick(item)}
                  className="relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl transition-all duration-200 min-w-[50px] group"
                  aria-label={item.label}
                >
                  {/* Active dot */}
                  <span
                    className={`absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary transition-all duration-300 ${
                      isActive ? "opacity-100 scale-100" : "opacity-0 scale-0"
                    }`}
                  />

                  <div className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 ${
                    isActive ? "bg-primary/10 dark:bg-primary/15" : "group-hover:bg-muted/60"
                  }`}>
                    <Icon
                      className={`w-[20px] h-[20px] transition-all duration-200 ${
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      }`}
                      strokeWidth={isActive ? 2.4 : 1.8}
                    />
                  </div>

                  <span className={`text-[10px] leading-tight transition-all duration-200 ${
                    isActive ? "font-bold text-primary" : "font-medium text-muted-foreground"
                  }`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <BottomMenuSheet open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  );
};

export default BottomNav;
