import { Link, useRouterState } from "@tanstack/react-router";
import {
  Box,
  BookOpen,
  Building2,
  Castle,
  Check,
  Clock,
  ChevronDown,
  Columns3,
  Compass,
  Gamepad2,
  Globe,
  Home,
  Landmark,
  Layers,
  LayoutGrid,
  Map as MapIcon,
  Moon,
  Route as RouteIcon,
  Search,
  Sparkles,
  Sun,
  User,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LANGS, useI18n, type Lang, type TKey } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

type NavItem = { to: string; key: TKey; desc?: TKey; icon: typeof Home };
type NavGroup = { key: TKey; icon: typeof Home; items: NavItem[] };

/*
 * The menu, in three tiers so it reads at a glance:
 *   - two groups that open (what there is to see; what there is to do),
 *   - the two tools used on their own (the map and the route planner),
 *   - the personal page, as an icon at the edge.
 * Every page that exists is reachable from here; before, the 3D models,
 * the stories and the full search were only reachable from the home page.
 */
const EXPLORE: NavGroup = {
  key: "nav_group_explore",
  icon: Compass,
  items: [
    { to: "/antik-kentler", key: "nav_ancient", desc: "nav_ancient_d", icon: Landmark },
    { to: "/tarihi-yerler", key: "nav_places", desc: "nav_places_d", icon: Castle },
    { to: "/muzeler", key: "nav_museums", desc: "nav_museums_d", icon: Building2 },
    { to: "/bolgeler", key: "nav_regions", desc: "nav_regions_d", icon: Columns3 },
    { to: "/koleksiyonlar", key: "nav_collections", desc: "nav_collections_d", icon: Layers },
    { to: "/medeniyetler", key: "nav_history", desc: "nav_history_d", icon: Users },
    { to: "/zaman-cizelgesi", key: "nav_timeline", desc: "nav_timeline_d", icon: Clock },
    { to: "/kentler", key: "nav_all_places", desc: "nav_all_places_d", icon: Search },
  ],
};

const EXPERIENCE: NavGroup = {
  key: "nav_group_experience",
  icon: Sparkles,
  items: [
    {
      to: "/rekonstruksiyonlar",
      key: "nav_reconstructions",
      desc: "nav_reconstructions_d",
      icon: Box,
    },
    { to: "/hikayeler", key: "nav_stories", desc: "nav_stories_d", icon: BookOpen },
    { to: "/oyunlar", key: "nav_games", desc: "nav_games_d", icon: Gamepad2 },
  ],
};

const TOOLS: NavItem[] = [
  { to: "/harita", key: "nav_map", desc: "nav_map_d", icon: MapIcon },
  { to: "/rota", key: "nav_route", desc: "nav_route_d", icon: RouteIcon },
];

/** Pages whose address lives under a list page, so the list stays highlighted. */
const CHILDREN: Record<string, string[]> = {
  "/antik-kentler": ["/kent/"],
  "/bolgeler": ["/bolge/"],
  "/koleksiyonlar": ["/koleksiyon/"],
  "/rekonstruksiyonlar": ["/rekonstruksiyon/"],
  "/hikayeler": ["/hikaye/"],
  "/medeniyetler": ["/medeniyet/", "/kisi/"],
};

function isActive(path: string, to: string) {
  if (to === "/") return path === "/";
  return (
    path === to || path.startsWith(`${to}/`) || (CHILDREN[to] ?? []).some((p) => path.startsWith(p))
  );
}

const LANG_NAME: Record<Lang, string> = {
  tr: "Türkçe",
  en: "English",
  de: "Deutsch",
  ru: "Русский",
};

// Above the sticky header (1000) and Leaflet's panes.
const LAYER = "z-[1100]";

function usePath() {
  return useRouterState({ select: (state) => state.location.pathname });
}

function LangSwitch() {
  const { lang, setLang, t } = useI18n();
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        aria-label={t("nav_language")}
        className="flex h-9 items-center gap-1 rounded-full border border-border bg-card px-3 text-xs font-semibold uppercase text-muted-foreground transition-colors hover:text-foreground"
      >
        <Globe className="h-4 w-4" /> {lang}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn(LAYER, "min-w-[10rem] rounded-xl p-1")}>
        {LANGS.map((code) => (
          <DropdownMenuItem
            key={code}
            onSelect={() => setLang(code)}
            className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm"
          >
            {LANG_NAME[code]}
            {lang === code && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
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

function ProfileButton() {
  const { t } = useI18n();
  const active = isActive(usePath(), "/profil");
  return (
    <Link
      to="/profil"
      aria-label={t("nav_profile")}
      title={t("nav_profile")}
      className={cn(
        "hidden h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors lg:grid",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      <User className="h-4 w-4" />
    </Link>
  );
}

/** A group in the desktop bar: a button that opens its pages with a line on each. */
function GroupMenu({ group }: { group: NavGroup }) {
  const { t } = useI18n();
  const path = usePath();
  const active = group.items.some((item) => isActive(path, item.to));
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors outline-none data-[state=open]:bg-secondary data-[state=open]:text-foreground",
          active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        {t(group.key)} <ChevronDown className="h-3.5 w-3.5 opacity-70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className={cn(LAYER, "w-80 rounded-2xl p-1.5")}>
        {group.items.map((item) => (
          <DropdownMenuItem key={item.to} asChild className="cursor-pointer rounded-xl p-0">
            <Link
              to={item.to}
              className={cn(
                "flex items-start gap-3 px-3 py-2.5",
                isActive(path, item.to) && "bg-secondary",
              )}
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                <item.icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-foreground">{t(item.key)}</span>
                {item.desc && (
                  <span className="block text-xs text-muted-foreground">{t(item.desc)}</span>
                )}
              </span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DesktopNav() {
  const { t } = useI18n();
  const path = usePath();
  return (
    <nav className="mr-1 hidden items-center gap-1 lg:flex">
      <GroupMenu group={EXPLORE} />
      {TOOLS.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={cn(
            "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
            isActive(path, item.to)
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t(item.key)}
        </Link>
      ))}
      <GroupMenu group={EXPERIENCE} />
    </nav>
  );
}

/** The phone's "Menu" tab: every section, grouped, in a sheet from the bottom. */
function MenuSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const path = usePath();

  // Close on navigation and on Escape; keep the page behind from scrolling.
  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const section = (group: NavGroup) => (
    <section key={group.key}>
      <h2 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {t(group.key)}
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {group.items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex items-center gap-2.5 rounded-xl border p-3 text-sm font-semibold",
              isActive(path, item.to)
                ? "border-primary bg-secondary text-foreground"
                : "border-border bg-card",
            )}
          >
            <item.icon className="h-4 w-4 shrink-0 text-primary" />
            <span className="min-w-0 truncate">{t(item.key)}</span>
          </Link>
        ))}
      </div>
    </section>
  );

  return (
    <div
      className={cn("fixed inset-0 lg:hidden", LAYER)}
      role="dialog"
      aria-modal="true"
      aria-label={t("nav_menu")}
    >
      <button
        aria-label={t("nav_close")}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      />
      <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-border bg-background px-4 pb-24 pt-3 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <span className="mx-auto h-1 w-10 rounded-full bg-border" />
        </div>
        <div className="mb-4 flex items-center justify-between">
          <p className="font-display text-lg font-semibold">{t("nav_menu")}</p>
          <button
            onClick={onClose}
            aria-label={t("nav_close")}
            className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-5">
          {section(EXPLORE)}
          {section(EXPERIENCE)}
          <Link
            to="/gorseller"
            className="block px-1 text-xs font-medium text-muted-foreground underline-offset-2 hover:underline"
          >
            {t("nav_credits")}
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Five tabs a thumb can hit: home, map, route, profile — and everything else. */
function MobileTabs({ onMenu, menuOpen }: { onMenu: () => void; menuOpen: boolean }) {
  const { t } = useI18n();
  const path = usePath();
  const tabs: NavItem[] = [
    { to: "/", key: "nav_home", icon: Home },
    { to: "/harita", key: "nav_map", icon: MapIcon },
    { to: "/rota", key: "nav_route", icon: RouteIcon },
    { to: "/profil", key: "nav_profile", icon: User },
  ];
  const inMenu = [...EXPLORE.items, ...EXPERIENCE.items].some((item) => isActive(path, item.to));
  const tab =
    "flex flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[11px] font-medium transition-colors";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[1000] border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-xl items-stretch justify-between px-2 py-1.5">
        {tabs.slice(0, 2).map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              tab,
              isActive(path, item.to) && !menuOpen ? "text-primary" : "text-muted-foreground",
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="truncate">{t(item.key)}</span>
          </Link>
        ))}
        <button
          onClick={onMenu}
          aria-expanded={menuOpen}
          className={cn(tab, menuOpen || inMenu ? "text-primary" : "text-muted-foreground")}
        >
          <LayoutGrid className="h-5 w-5" />
          <span className="truncate">{t("nav_group_explore")}</span>
        </button>
        {tabs.slice(2).map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              tab,
              isActive(path, item.to) && !menuOpen ? "text-primary" : "text-muted-foreground",
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="truncate">{t(item.key)}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-[1000] border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Landmark className="h-4.5 w-4.5" />
            </span>
            <span className="block truncate font-display text-base font-semibold leading-tight">
              {t("appName")}
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <DesktopNav />
            <LangSwitch />
            <ThemeButton />
            <ProfileButton />
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20 lg:pb-0">{children}</main>

      <footer className="border-t border-border px-6 py-10 pb-24 lg:pb-10">
        <div className="mx-auto grid max-w-7xl gap-8 text-sm sm:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
          <div>
            <p className="font-display text-base text-foreground">{t("appName")}</p>
            <p className="mt-1 text-muted-foreground">{t("tagline")}</p>
          </div>
          {[
            EXPLORE,
            EXPERIENCE,
            { key: "nav_group_tools" as TKey, icon: RouteIcon, items: TOOLS },
          ].map((group) => (
            <div key={group.key} className="hidden sm:block">
              <p className="mb-2 font-semibold text-foreground">{t(group.key)}</p>
              <ul className="space-y-1.5 text-muted-foreground">
                {group.items.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="hover:text-foreground hover:underline">
                      {t(item.key)}
                    </Link>
                  </li>
                ))}
                {group.key === "nav_group_tools" && (
                  // Photographs appear on cards, pins and quiz screens with
                  // no room for a caption; this is where their credits live.
                  <li>
                    <Link to="/gorseller" className="hover:text-foreground hover:underline">
                      {t("nav_credits")}
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          ))}
          <Link
            to="/gorseller"
            className="font-medium text-muted-foreground hover:text-foreground hover:underline sm:hidden"
          >
            {t("nav_credits")}
          </Link>
        </div>
      </footer>

      <MenuSheet open={menuOpen} onClose={closeMenu} />
      <MobileTabs onMenu={() => setMenuOpen((v) => !v)} menuOpen={menuOpen} />
    </div>
  );
}
