import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";
const KEY = "antik-tr-theme";

const ThemeCtx = createContext<{ theme: Theme; toggle: () => void } | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // Storage access throws outright when it is blocked (Safari with "Block
    // all cookies", some embedded browsers). This runs at the app root, so an
    // unguarded read took the whole app down; the system theme will do.
    let stored: Theme | null = null;
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw === "light" || raw === "dark") stored = raw;
    } catch {
      /* storage unavailable */
    }
    const initial =
      stored ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem(KEY, next);
      } catch {
        /* storage unavailable — the choice lasts for this visit only */
      }
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  }, []);

  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
