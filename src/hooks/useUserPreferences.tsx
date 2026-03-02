import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from "react";

export interface UserPreferences {
  fontSize: "small" | "medium" | "large";
  showFeaturedCards: boolean;
  showNewsCards: boolean;
  notificationsEnabled: boolean;
  layout: "compact" | "comfortable";
  autoThemeColor: boolean;
}

const defaultPrefs: UserPreferences = {
  fontSize: "medium",
  showFeaturedCards: true,
  showNewsCards: true,
  notificationsEnabled: true,
  layout: "comfortable",
  autoThemeColor: false,
};

interface UserPreferencesContextType {
  prefs: UserPreferences;
  setPref: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  requestNotificationPermission: () => Promise<boolean>;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | null>(null);

const STORAGE_KEY = "user-preferences";

export const UserPreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [prefs, setPrefs] = useState<UserPreferences>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...defaultPrefs, ...JSON.parse(stored) } : defaultPrefs;
    } catch {
      return defaultPrefs;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    
    // Apply font size to root
    const root = document.documentElement;
    if (prefs.fontSize === "small") root.style.fontSize = "14px";
    else if (prefs.fontSize === "large") root.style.fontSize = "18px";
    else root.style.fontSize = "16px";
  }, [prefs]);

  // Auto theme color: switch based on time of day
  useEffect(() => {
    if (!prefs.autoThemeColor) return;

    const applyAutoTheme = () => {
      const hour = new Date().getHours();
      // 6 AM - 6 PM = light, otherwise dark
      const shouldBeDark = hour < 6 || hour >= 18;
      const root = document.documentElement;
      const currentIsDark = root.classList.contains("dark");
      if (shouldBeDark && !currentIsDark) {
        root.classList.add("dark");
        localStorage.setItem("ramganj-theme", "dark");
      } else if (!shouldBeDark && currentIsDark) {
        root.classList.remove("dark");
        localStorage.setItem("ramganj-theme", "light");
      }
    };

    applyAutoTheme();
    const interval = setInterval(applyAutoTheme, 60000); // check every minute
    return () => clearInterval(interval);
  }, [prefs.autoThemeColor]);

  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;
    const result = await Notification.requestPermission();
    return result === "granted";
  }, []);

  const setPref = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <UserPreferencesContext.Provider value={{ prefs, setPref, requestNotificationPermission }}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = () => {
  const ctx = useContext(UserPreferencesContext);
  if (!ctx) throw new Error("useUserPreferences must be used within UserPreferencesProvider");
  return ctx;
};
