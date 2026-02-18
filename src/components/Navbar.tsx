import { Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import ramganjCityLogo from "@/assets/ramganj-city-logo.png";

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { theme, triggerThemeTransition } = useTheme();

  const isDark = theme === "dark";

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    triggerThemeTransition(x, y, isDark ? "light" : "dark");
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
    </header>
  );
};

export default Navbar;
