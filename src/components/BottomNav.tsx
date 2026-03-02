import { useState } from "react";
import { Home, LayoutGrid, Heart, Bell, Menu } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import BottomMenuSheet from "@/components/BottomMenuSheet";

const navItems = [
  { icon: Home, label: "হোম", route: "/", type: "route" as const, gradient: "from-blue-500 to-cyan-400", glow: "rgba(59,130,246,0.5)" },
  { icon: LayoutGrid, label: "সেবা", route: "/services", type: "route" as const, gradient: "from-violet-500 to-purple-400", glow: "rgba(139,92,246,0.5)" },
  { icon: Heart, label: "অনুদান", route: "/donation", type: "route" as const, gradient: "from-rose-500 to-pink-400", glow: "rgba(244,63,94,0.5)" },
  { icon: Bell, label: "নোটিশ", route: "/notifications", type: "route" as const, gradient: "from-amber-500 to-orange-400", glow: "rgba(245,158,11,0.5)" },
  { icon: Menu, label: "মেন্যু", route: "", type: "menu" as const, gradient: "from-emerald-500 to-teal-400", glow: "rgba(16,185,129,0.5)" },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [tappedIdx, setTappedIdx] = useState<number | null>(null);

  if (location.pathname.startsWith("/admin")) return null;

  const vibrate = () => navigator.vibrate?.(25);

  const handleClick = (item: typeof navItems[0], idx: number) => {
    vibrate();
    setTappedIdx(idx);
    setTimeout(() => setTappedIdx(null), 350);
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
              const isTapped = tappedIdx === idx;

              if (isCenter) {
                return (
                  <button
                    key={item.label}
                    onClick={() => handleClick(item, idx)}
                    className="relative flex flex-col items-center -mt-5 group"
                    aria-label={item.label}
                  >
                    <div
                      className={`absolute inset-0 rounded-full blur-lg transition-opacity duration-300 ${
                        isActive ? "opacity-50" : "opacity-0 group-hover:opacity-25"
                      }`}
                      style={{ background: `linear-gradient(135deg, ${item.glow}, transparent)` }}
                    />
                    <div
                      className={`relative w-[52px] h-[52px] rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br ${item.gradient} transition-all duration-300 ease-out ${
                        isTapped ? "scale-90" : isActive ? "scale-110" : "scale-100 group-hover:scale-105"
                      }`}
                      style={isActive ? { boxShadow: `0 6px 20px ${item.glow}` } : undefined}
                    >
                      <Icon className={`w-[22px] h-[22px] text-white transition-transform duration-300 ${
                        isTapped ? "scale-75 rotate-[-8deg]" : "scale-100 rotate-0"
                      }`} strokeWidth={2.2} />
                    </div>
                    <span className={`text-[10px] mt-1 leading-tight font-bold transition-all duration-300 bg-gradient-to-r ${item.gradient} bg-clip-text ${
                      isActive ? "text-transparent" : "text-muted-foreground"
                    }`}>
                      {item.label}
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={item.label}
                  onClick={() => handleClick(item, idx)}
                  className="relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl transition-all duration-200 min-w-[50px] group"
                  aria-label={item.label}
                >
                  {/* Active indicator line */}
                  <span
                    className={`absolute -top-0.5 left-1/2 -translate-x-1/2 h-[3px] rounded-full bg-gradient-to-r ${item.gradient} transition-all duration-300 ease-out ${
                      isActive ? "opacity-100 w-5" : "opacity-0 w-0"
                    }`}
                  />

                  <div className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300 ease-out ${
                    isTapped ? "scale-[0.8]" : "scale-100"
                  }`}>
                    {/* Active background glow */}
                    {isActive && (
                      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${item.gradient} opacity-15 dark:opacity-20`} />
                    )}
                    <Icon
                      className={`w-[20px] h-[20px] transition-all duration-300 ease-out ${
                        isTapped ? "scale-75" : "scale-100"
                      } ${
                        isActive ? "text-transparent" : "text-muted-foreground group-hover:text-foreground"
                      }`}
                      strokeWidth={isActive ? 2.4 : 1.8}
                      style={isActive ? {
                        stroke: "url(#icon-gradient-" + idx + ")",
                      } : undefined}
                    />
                    {/* SVG gradient definition for active icon */}
                    {isActive && (
                      <svg width="0" height="0" className="absolute">
                        <defs>
                          <linearGradient id={`icon-gradient-${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            {idx === 0 && <><stop offset="0%" stopColor="#3b82f6"/><stop offset="100%" stopColor="#22d3ee"/></>}
                            {idx === 1 && <><stop offset="0%" stopColor="#8b5cf6"/><stop offset="100%" stopColor="#c084fc"/></>}
                            {idx === 3 && <><stop offset="0%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#fb923c"/></>}
                            {idx === 4 && <><stop offset="0%" stopColor="#10b981"/><stop offset="100%" stopColor="#2dd4bf"/></>}
                          </linearGradient>
                        </defs>
                      </svg>
                    )}
                  </div>

                  <span className={`text-[10px] leading-tight transition-all duration-300 ${
                    isActive ? "font-bold bg-gradient-to-r bg-clip-text text-transparent " + item.gradient : "font-medium text-muted-foreground"
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
