import { Link } from "@tanstack/react-router";
import {
  Building2,
  Castle,
  Columns3,
  Gamepad2,
  Home,
  Landmark,
  Layers,
  Map as MapIcon,
  Moon,
  Route as RouteIcon,
  Sun,
  User,
} from "lucide-react";
import { useI18n, type TKey } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const navItems: { to: string; key: TKey; icon: typeof Home }[] = [
  { to: "/", key: "nav_home", icon: Home },
  { to: "/antik-kentler", key: "nav_ancient", icon: Landmark },
  { to: "/tarihi-yerler", key: "nav_places", icon: Castle },
  { to: "/muzeler", key: "nav_museums", icon: Building2 },
  { to: "/harita", key: "nav_map", icon: MapIcon },
  { to: "/bolgeler", key: "nav_regions", icon: Columns3 },
  { to: "/koleksiyonlar", key: "nav_collections", icon: Layers },
  { to: "/rota", key: "nav_route", icon: RouteIcon },
  { to: "/oyunlar", key: "nav_games", icon: Gamepad2 },
  { to: "/profil", key: "nav_profile", icon: User },
];

function LangSwitch() {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex items-center rounded-full border border-border bg-card p-0.5 text-xs font-semibold">
      {(["tr", "en"] as const).map((code) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          className={cn(
            "rounded-full px-2.5 py-1 uppercase transition-colors",
            lang === code
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-pressed={lang === code}
        >
          {code}
        </button>
      ))}
    </div>
  );
}

function ThemeButton() {
  const { theme, toggle } = useTheme();
  const { t } = useI18n();
  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? t("theme_light") : t("theme_dark")}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-[1000] border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Landmark className="h-4.5 w-4.5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-display text-base font-semibold leading-tight">
                {t("appName")}
              </span>
              <span className="hidden text-[11px] text-muted-foreground sm:block">
                {t("tagline")}
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <nav className="mr-1 hidden items-center gap-1 lg:flex">
              {navItems.slice(1).map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeProps={{ className: "bg-secondary text-foreground" }}
                  className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t(item.key)}
                </Link>
              ))}
            </nav>
            <LangSwitch />
            <ThemeButton />
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20 lg:pb-0">{children}</main>

      <footer className="border-t border-border px-6 py-10 pb-24 lg:pb-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <p className="font-display text-base text-foreground">{t("appName")}</p>
          <p className="hidden sm:block">{t("tagline")}</p>
          {/* Photographs appear on cards, pins and quiz screens with no room
              for a caption; this is the address their attribution lives at. */}
          <Link to="/gorseller" className="font-medium hover:text-foreground hover:underline">
            {t("nav_credits")}
          </Link>
        </div>
      </footer>

      {/* Mobile tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-[1000] border-t border-border bg-background/95 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-xl items-stretch justify-between px-2 py-1.5">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-primary" }}
              className="flex flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[10px] font-medium text-muted-foreground transition-colors"
            >
              <item.icon className="h-5 w-5" />
              <span className="truncate">{t(item.key)}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
