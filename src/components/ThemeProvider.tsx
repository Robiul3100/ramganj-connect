import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  triggerThemeTransition: (x: number, y: number, nextTheme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: "system",
  setTheme: () => null,
  triggerThemeTransition: () => null,
});

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  // Ripple overlay state
  const [ripple, setRipple] = useState<{
    x: number;
    y: number;
    active: boolean;
    targetTheme: Theme;
  } | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    if (theme === "system") {
      const sys = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(sys);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    localStorage.setItem(storageKey, t);
    setThemeState(t);
  }, [storageKey]);

  const triggerThemeTransition = useCallback((x: number, y: number, nextTheme: Theme) => {
    if (navigator.vibrate) navigator.vibrate(30);

    setRipple({ x, y, active: true, targetTheme: nextTheme });

    // Switch theme at ~60% of animation
    const switchTimer = setTimeout(() => {
      localStorage.setItem(storageKey, nextTheme);
      setThemeState(nextTheme);
    }, 380);

    // Remove overlay after animation completes
    const removeTimer = setTimeout(() => {
      setRipple(null);
    }, 700);

    return () => {
      clearTimeout(switchTimer);
      clearTimeout(removeTimer);
    };
  }, [storageKey]);

  const value = {
    theme,
    setTheme,
    triggerThemeTransition,
  };

  // Determine overlay color based on target theme
  const overlayBg = ripple?.targetTheme === "dark"
    ? "hsl(220, 25%, 8%)"
    : "hsl(220, 20%, 95%)";

  // Calculate max radius to cover entire viewport
  const maxRadius = ripple
    ? Math.ceil(
        Math.sqrt(
          Math.pow(Math.max(ripple.x, window.innerWidth - ripple.x), 2) +
          Math.pow(Math.max(ripple.y, window.innerHeight - ripple.y), 2)
        )
      ) + 50
    : 0;

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}

      {/* Full-screen waterdrop transition overlay */}
      {ripple && (
        <div
          ref={overlayRef}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: ripple.x,
              top: ripple.y,
              width: 0,
              height: 0,
              borderRadius: "50%",
              background: overlayBg,
              transform: "translate(-50%, -50%)",
              animation: `theme-ripple-expand 0.65s cubic-bezier(0.22, 0.61, 0.36, 1) forwards`,
              "--ripple-max": `${maxRadius * 2}px`,
            } as React.CSSProperties}
          />
        </div>
      )}

      <style>{`
        @keyframes theme-ripple-expand {
          0%   { width: 0px; height: 0px; opacity: 1; }
          85%  { opacity: 1; }
          100% { width: var(--ripple-max); height: var(--ripple-max); opacity: 0; }
        }
      `}</style>
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
