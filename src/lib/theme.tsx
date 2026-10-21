import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";
/** What the visitor chose: a theme, or "whatever the device is set to". */
export type ThemePref = Theme | "system";
const KEY = "antik-tr-theme";

const ThemeCtx = createContext<{
  /** The theme on screen. */
  theme: Theme;
  /** The choice behind it. */
  pref: ThemePref;
  setPref: (pref: ThemePref) => void;
  toggle: () => void;
} | null>(null);

const systemTheme = (): Theme =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

function apply(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [pref, setPrefState] = useState<ThemePref>("system");
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
    setPrefState(stored ?? "system");
  }, []);

  // Follow the device while the choice is "system", including a change of
  // setting (or the evening switch) while the page is open.
  useEffect(() => {
    if (pref !== "system") {
      setTheme(pref);
      apply(pref);
      return;
    }
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      const next = systemTheme();
      setTheme(next);
      apply(next);
    };
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [pref]);

  const setPref = useCallback((next: ThemePref) => {
    try {
      if (next === "system") window.localStorage.removeItem(KEY);
      else window.localStorage.setItem(KEY, next);
    } catch {
      /* storage unavailable — the choice lasts for this visit only */
    }
    setPrefState(next);
  }, []);

  const toggle = useCallback(() => setPref(theme === "dark" ? "light" : "dark"), [setPref, theme]);

  return <ThemeCtx.Provider value={{ theme, pref, setPref, toggle }}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
