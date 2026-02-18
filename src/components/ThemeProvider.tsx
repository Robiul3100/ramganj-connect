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

    setRipple({ x, y, targetTheme: nextTheme });

    // Switch theme when ripple fully covers screen
    const switchTimer = setTimeout(() => {
      localStorage.setItem(storageKey, nextTheme);
      setThemeState(nextTheme);
    }, 500);

    // Remove overlay after theme has switched
    const removeTimer = setTimeout(() => {
      setRipple(null);
    }, 620);

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

  // Calculate max radius to fully cover viewport from click point
  const maxRadius = ripple
    ? Math.ceil(
        Math.sqrt(
          Math.pow(Math.max(ripple.x, window.innerWidth - ripple.x), 2) +
          Math.pow(Math.max(ripple.y, window.innerHeight - ripple.y), 2)
        )
      ) + 20
    : 0;

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}

      {/* Waterdrop clip-path ripple overlay */}
      {ripple && (
        <div
          ref={overlayRef}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            pointerEvents: "none",
            background: overlayBg,
            "--ripple-x": `${ripple.x}px`,
            "--ripple-y": `${ripple.y}px`,
            "--ripple-max": `${maxRadius}px`,
            clipPath: `circle(0px at ${ripple.x}px ${ripple.y}px)`,
            animation: "theme-ripple-clip 0.55s cubic-bezier(0.4, 0, 0.2, 1) forwards",
          } as React.CSSProperties}
        />
      )}

      <style>{`
        @keyframes theme-ripple-clip {
          from { clip-path: circle(0px at var(--ripple-x) var(--ripple-y)); }
          to   { clip-path: circle(var(--ripple-max) at var(--ripple-x) var(--ripple-y)); }
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
