import { useState, useEffect, createContext, useContext, ReactNode } from "react";

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
    root.classList.remove("text-sm", "text-base", "text-lg");
    if (prefs.fontSize === "small") root.style.fontSize = "14px";
    else if (prefs.fontSize === "large") root.style.fontSize = "18px";
    else root.style.fontSize = "16px";
  }, [prefs]);

  const setPref = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <UserPreferencesContext.Provider value={{ prefs, setPref }}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = () => {
  const ctx = useContext(UserPreferencesContext);
  if (!ctx) throw new Error("useUserPreferences must be used within UserPreferencesProvider");
  return ctx;
};
