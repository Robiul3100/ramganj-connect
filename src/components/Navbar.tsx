import { Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useState, useRef, useEffect } from "react";
import ramganjCityLogo from "@/assets/ramganj-city-logo.png";

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { theme, setTheme } = useTheme();
  const [ripple, setRipple] = useState<{ x: number; y: number; key: number } | null>(null);
  const rippleKey = useRef(0);

  // Treat system as light if needed — only light/dark
  const isDark = theme === "dark";

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Vibration (if supported)
    if (navigator.vibrate) navigator.vibrate(30);

    rippleKey.current += 1;
    setRipple({ x, y, key: rippleKey.current });

    // Delay theme switch slightly so ripple starts first
    setTimeout(() => {
      setTheme(isDark ? "light" : "dark");
    }, 80);

    setTimeout(() => setRipple(null), 600);
  };

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-2xl" style={{ borderBottomLeftRadius: 15, borderBottomRightRadius: 15, borderBottom: "2px solid hsl(var(--border) / 0.5)", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
      <div className="flex items-center justify-between px-4 py-3 max-w-4xl mx-auto">
        {/* Menu button */}
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

        {/* Apple-style Dark/Light pill toggle */}
        <button
          onClick={handleToggle}
          aria-label={isDark ? "Switch to Light mode" : "Switch to Dark mode"}
          className="relative overflow-hidden"
          style={{
            width: 64,
            height: 34,
            borderRadius: 34,
            background: isDark
              ? "hsl(220, 25%, 18%)"
              : "hsl(220, 15%, 88%)",
            border: "1.5px solid",
            borderColor: isDark ? "hsl(220, 20%, 28%)" : "hsl(220, 15%, 78%)",
            transition: "background 0.35s cubic-bezier(0.4,0,0.2,1), border-color 0.35s cubic-bezier(0.4,0,0.2,1)",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          {/* Waterdrop ripple */}
          {ripple && (
            <span
              key={ripple.key}
              style={{
                position: "absolute",
                left: ripple.x,
                top: ripple.y,
                width: 0,
                height: 0,
                borderRadius: "50%",
                background: isDark
                  ? "rgba(255,255,255,0.18)"
                  : "rgba(30,60,120,0.13)",
                transform: "translate(-50%, -50%)",
                animation: "waterdrop-ripple 0.55s cubic-bezier(0.25,0.46,0.45,0.94) forwards",
                pointerEvents: "none",
              }}
            />
          )}

          {/* Icons — sun left, moon right */}
          <span
            style={{
              position: "absolute",
              left: 8,
              top: "50%",
              transform: "translateY(-50%)",
              opacity: isDark ? 0.35 : 0.85,
              transition: "opacity 0.3s",
              display: "flex",
            }}
          >
            <Sun style={{ width: 13, height: 13, color: "hsl(40,90%,50%)" }} />
          </span>
          <span
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              opacity: isDark ? 0.85 : 0.35,
              transition: "opacity 0.3s",
              display: "flex",
            }}
          >
            <Moon style={{ width: 13, height: 13, color: "hsl(220,70%,70%)" }} />
          </span>

          {/* Sliding thumb */}
          <span
            style={{
              position: "absolute",
              top: 3,
              left: isDark ? 32 : 3,
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: isDark
                ? "hsl(220, 25%, 10%)"
                : "hsl(0, 0%, 100%)",
              boxShadow: isDark
                ? "0 2px 8px rgba(0,0,0,0.5)"
                : "0 2px 8px rgba(0,0,0,0.18)",
              transition: "left 0.32s cubic-bezier(0.34,1.56,0.64,1), background 0.32s, box-shadow 0.32s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isDark
              ? <Moon style={{ width: 13, height: 13, color: "hsl(220,70%,75%)" }} />
              : <Sun style={{ width: 13, height: 13, color: "hsl(40,90%,50%)" }} />
            }
          </span>
        </button>
      </div>

      <style>{`
        @keyframes waterdrop-ripple {
          0%   { width: 0; height: 0; opacity: 1; }
          100% { width: 120px; height: 120px; opacity: 0; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
