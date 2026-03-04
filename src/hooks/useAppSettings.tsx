import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Theme = "dark" | "light" | "system";
type TimeFormat = "24h" | "12h";

interface AppSettingsContextType {
  theme: Theme;
  timeFormat: TimeFormat;
  language: string;
  setTheme: (theme: Theme) => void;
  setTimeFormat: (format: TimeFormat) => void;
  setLanguage: (lang: string) => void;
  saveSettings: (overrides?: { theme?: Theme; timeFormat?: TimeFormat; language?: string }) => Promise<void>;
  formatTime: (date: Date | string) => string;
  formatDateTime: (date: Date | string) => string;
  loading: boolean;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

function getSystemTheme(): "dark" | "light" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(theme === "system" ? getSystemTheme() : theme);
}

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>("dark");
  const [timeFormat, setTimeFormatState] = useState<TimeFormat>("24h");
  const [language, setLanguageState] = useState("pl");
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);

  // Load settings from DB when user logs in
  useEffect(() => {
    if (!user) {
      // Apply defaults from localStorage as fallback for non-logged-in state
      const lsTheme = (localStorage.getItem("app-theme") as Theme) || "dark";
      setThemeState(lsTheme);
      applyTheme(lsTheme);
      setLoading(false);
      return;
    }

    const loadSettings = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("user_app_settings" as any)
        .select("theme, time_format, language")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        const d = data as any;
        const t = (d.theme || "dark") as Theme;
        const tf = (d.time_format || "24h") as TimeFormat;
        const lang = d.language || "pl";
        setThemeState(t);
        setTimeFormatState(tf);
        setLanguageState(lang);
        applyTheme(t);
      } else {
        // No settings row yet — create one with defaults
        await supabase
          .from("user_app_settings" as any)
          .insert({ user_id: user.id, theme: "dark", time_format: "24h", language: "pl" } as any);
        applyTheme("dark");
      }
      setLoading(false);
      setLoaded(true);
    };

    loadSettings();
  }, [user]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("system");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    applyTheme(t);
    localStorage.setItem("app-theme", t);
  };

  const setTimeFormat = (f: TimeFormat) => {
    setTimeFormatState(f);
  };

  const setLanguage = (l: string) => {
    setLanguageState(l);
  };

  const saveSettings = useCallback(async (overrides?: { theme?: Theme; timeFormat?: TimeFormat; language?: string }) => {
    if (!user) return;
    const t = overrides?.theme ?? theme;
    const tf = overrides?.timeFormat ?? timeFormat;
    const l = overrides?.language ?? language;
    await supabase
      .from("user_app_settings" as any)
      .update({ theme: t, time_format: tf, language: l, updated_at: new Date().toISOString() } as any)
      .eq("user_id", user.id);
    localStorage.setItem("app-theme", t);
  }, [user, theme, timeFormat, language]);

  const formatTime = (date: Date | string): string => {
    const d = typeof date === "string" ? new Date(date) : date;
    if (timeFormat === "12h") {
      return d.toLocaleTimeString("pl-PL", { hour: "numeric", minute: "2-digit", hour12: true });
    }
    return d.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  const formatDateTime = (date: Date | string): string => {
    const d = typeof date === "string" ? new Date(date) : date;
    const dateStr = d.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });
    return `${dateStr} ${formatTime(d)}`;
  };

  return (
    <AppSettingsContext.Provider value={{ theme, timeFormat, language, setTheme, setTimeFormat, setLanguage, saveSettings, formatTime, formatDateTime, loading }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) throw new Error("useAppSettings must be used within AppSettingsProvider");
  return ctx;
}
