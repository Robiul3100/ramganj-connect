import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BottomMenuSheet from "@/components/BottomMenuSheet";

/* ── Custom 3D-style multicolor SVG icons ── */
const HomeIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="home-roof" x1="2" y1="4" x2="22" y2="14" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3b82f6" />
        <stop offset="1" stopColor="#06b6d4" />
      </linearGradient>
      <linearGradient id="home-wall" x1="5" y1="11" x2="19" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#60a5fa" />
        <stop offset="1" stopColor="#38bdf8" />
      </linearGradient>
    </defs>
    {/* Wall */}
    <path d="M5 12v8a1 1 0 001 1h12a1 1 0 001-1v-8" fill="url(#home-wall)" opacity={active ? 1 : 0.7} />
    {/* Door */}
    <rect x="10" y="15" width="4" height="6" rx="0.5" fill="#1e3a5f" opacity="0.7" />
    {/* Roof */}
    <path d="M3 12l9-8 9 8" stroke="url(#home-roof)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    {/* Chimney */}
    <rect x="16" y="5" width="2.5" height="5" rx="0.5" fill="#f59e0b" opacity="0.6" />
    {/* Window */}
    <rect x="7" y="13" width="2.5" height="2.5" rx="0.5" fill="#fef3c7" opacity="0.9" />
  </svg>
);

const ServicesIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="svc-1" x1="2" y1="2" x2="11" y2="11" gradientUnits="userSpaceOnUse">
        <stop stopColor="#8b5cf6" />
        <stop offset="1" stopColor="#a78bfa" />
      </linearGradient>
      <linearGradient id="svc-2" x1="13" y1="2" x2="22" y2="11" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f472b6" />
        <stop offset="1" stopColor="#fb7185" />
      </linearGradient>
      <linearGradient id="svc-3" x1="2" y1="13" x2="11" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#34d399" />
        <stop offset="1" stopColor="#6ee7b7" />
      </linearGradient>
      <linearGradient id="svc-4" x1="13" y1="13" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fbbf24" />
        <stop offset="1" stopColor="#fcd34d" />
      </linearGradient>
    </defs>
    <rect x="3" y="3" width="7.5" height="7.5" rx="2" fill="url(#svc-1)" opacity={active ? 1 : 0.7} />
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" fill="url(#svc-2)" opacity={active ? 1 : 0.7} />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" fill="url(#svc-3)" opacity={active ? 1 : 0.7} />
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" fill="url(#svc-4)" opacity={active ? 1 : 0.7} />
  </svg>
);

const DonationIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="heart-g" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f43f5e" />
        <stop offset="0.5" stopColor="#ec4899" />
        <stop offset="1" stopColor="#f97316" />
      </linearGradient>
      <radialGradient id="heart-shine" cx="10" cy="8" r="8" gradientUnits="userSpaceOnUse">
        <stop stopColor="white" stopOpacity="0.5" />
        <stop offset="1" stopColor="white" stopOpacity="0" />
      </radialGradient>
    </defs>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z"
      fill="url(#heart-g)" opacity={active ? 1 : 0.75} />
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z"
      fill="url(#heart-shine)" />
  </svg>
);

const BellIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="bell-body" x1="5" y1="3" x2="19" y2="19" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f59e0b" />
        <stop offset="1" stopColor="#f97316" />
      </linearGradient>
      <radialGradient id="bell-shine" cx="10" cy="8" r="7" gradientUnits="userSpaceOnUse">
        <stop stopColor="white" stopOpacity="0.45" />
        <stop offset="1" stopColor="white" stopOpacity="0" />
      </radialGradient>
    </defs>
    {/* Bell body */}
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9z" fill="url(#bell-body)" opacity={active ? 1 : 0.7} />
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9z" fill="url(#bell-shine)" />
    {/* Clapper */}
    <circle cx="12" cy="20" r="1.8" fill="#dc2626" />
    {/* Ring highlight */}
    <path d="M13.73 21a2 2 0 01-3.46 0" stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const MenuIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="menu-1" x1="4" y1="6" x2="20" y2="6" gradientUnits="userSpaceOnUse">
        <stop stopColor="#10b981" />
        <stop offset="1" stopColor="#34d399" />
      </linearGradient>
      <linearGradient id="menu-2" x1="4" y1="12" x2="20" y2="12" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3b82f6" />
        <stop offset="1" stopColor="#60a5fa" />
      </linearGradient>
      <linearGradient id="menu-3" x1="4" y1="18" x2="20" y2="18" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f59e0b" />
        <stop offset="1" stopColor="#fbbf24" />
      </linearGradient>
    </defs>
    <rect x="4" y="4.5" width="16" height="3" rx="1.5" fill="url(#menu-1)" opacity={active ? 1 : 0.7} />
    <rect x="4" y="10.5" width="16" height="3" rx="1.5" fill="url(#menu-2)" opacity={active ? 1 : 0.7} />
    <rect x="4" y="16.5" width="16" height="3" rx="1.5" fill="url(#menu-3)" opacity={active ? 1 : 0.7} />
  </svg>
);

/* ── Quiz Icon (multicolor 3D) ── */
const QuizIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="quiz-bg" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
        <stop stopColor="#a855f7" />
        <stop offset="0.5" stopColor="#ec4899" />
        <stop offset="1" stopColor="#f97316" />
      </linearGradient>
      <radialGradient id="quiz-shine" cx="9" cy="7" r="7" gradientUnits="userSpaceOnUse">
        <stop stopColor="white" stopOpacity="0.5" />
        <stop offset="1" stopColor="white" stopOpacity="0" />
      </radialGradient>
    </defs>
    {/* Brain/lightbulb shape */}
    <path d="M12 3a6 6 0 00-4 10.5V16a2 2 0 002 2h4a2 2 0 002-2v-2.5A6 6 0 0012 3z"
      fill="url(#quiz-bg)" opacity={active ? 1 : 0.78} />
    <path d="M12 3a6 6 0 00-4 10.5V16a2 2 0 002 2h4a2 2 0 002-2v-2.5A6 6 0 0012 3z"
      fill="url(#quiz-shine)" />
    {/* Question mark */}
    <text x="12" y="13" textAnchor="middle" fontSize="8" fontWeight="900" fill="white" opacity="0.95">?</text>
    {/* Base */}
    <rect x="9.5" y="19" width="5" height="1.5" rx="0.75" fill="#64748b" opacity="0.7" />
    <rect x="10.5" y="20.8" width="3" height="1" rx="0.5" fill="#475569" opacity="0.6" />
  </svg>
);

/* ── Nav config ── */
const navItems = [
  { SvgIcon: HomeIcon, label: "হোম", route: "/", type: "route" as const, glow: "rgba(59,130,246,0.45)" },
  { SvgIcon: ServicesIcon, label: "সেবা", route: "/services", type: "route" as const, glow: "rgba(139,92,246,0.45)" },
  { SvgIcon: QuizIcon, label: "কুইজ", route: "/quiz", type: "route" as const, glow: "rgba(168,85,247,0.5)" },
  { SvgIcon: BellIcon, label: "নোটিশ", route: "/notifications", type: "route" as const, glow: "rgba(245,158,11,0.45)" },
  { SvgIcon: MenuIcon, label: "মেন্যু", route: "", type: "menu" as const, glow: "rgba(16,185,129,0.45)" },
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
                    {/* Glow */}
                    <div
                      className={`absolute w-14 h-14 rounded-full blur-xl transition-opacity duration-300 ${
                        isActive ? "opacity-60" : "opacity-0 group-hover:opacity-30"
                      }`}
                      style={{ background: item.glow }}
                    />
                    <div
                      className={`relative w-[52px] h-[52px] rounded-full flex items-center justify-center shadow-lg bg-card border-2 border-border/30 transition-all duration-300 ease-out ${
                        isTapped ? "scale-90" : isActive ? "scale-110" : "scale-100 group-hover:scale-105"
                      }`}
                      style={isActive ? { boxShadow: `0 6px 24px ${item.glow}` } : undefined}
                    >
                      <item.SvgIcon active={isActive} />
                    </div>
                    <span className={`text-[10px] mt-1 leading-tight font-bold transition-all duration-300 ${
                      isActive ? "text-foreground" : "text-muted-foreground"
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
                  {/* Active indicator */}
                  <span
                    className={`absolute -top-0.5 left-1/2 -translate-x-1/2 h-[3px] rounded-full transition-all duration-300 ease-out ${
                      isActive ? "opacity-100 w-5" : "opacity-0 w-0"
                    }`}
                    style={{ background: item.glow }}
                  />

                  <div className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300 ease-out ${
                    isTapped ? "scale-[0.8]" : "scale-100"
                  }`}>
                    <item.SvgIcon active={isActive} />
                  </div>

                  <span className={`text-[10px] leading-tight transition-all duration-300 ${
                    isActive ? "font-bold text-foreground" : "font-medium text-muted-foreground"
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
