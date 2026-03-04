import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "dark" | "light" | "system";
type TimeFormat = "24h" | "12h";

interface AppSettingsContextType {
  theme: Theme;
  timeFormat: TimeFormat;
  setTheme: (theme: Theme) => void;
  setTimeFormat: (format: TimeFormat) => void;
  formatTime: (date: Date | string) => string;
  formatDateTime: (date: Date | string) => string;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

function getSystemTheme(): "dark" | "light" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  if (theme === "system") {
    root.classList.add(getSystemTheme());
  } else {
    root.classList.add(theme);
  }
}

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem("app-theme") as Theme) || "dark";
  });
  const [timeFormat, setTimeFormatState] = useState<TimeFormat>(() => {
    return (localStorage.getItem("app-time-format") as TimeFormat) || "24h";
  });

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("app-theme", t);
    applyTheme(t);
  };

  const setTimeFormat = (f: TimeFormat) => {
    setTimeFormatState(f);
    localStorage.setItem("app-time-format", f);
  };

  // Apply theme on mount and when system preference changes
  useEffect(() => {
    applyTheme(theme);

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("system");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme]);

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
    <AppSettingsContext.Provider value={{ theme, timeFormat, setTheme, setTimeFormat, formatTime, formatDateTime }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) throw new Error("useAppSettings must be used within AppSettingsProvider");
  return ctx;
}
