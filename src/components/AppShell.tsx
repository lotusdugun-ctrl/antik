import { Link, useRouterState } from "@tanstack/react-router";
import {
  Box,
  BookOpen,
  Building2,
  Castle,
  Clock,
  Columns3,
  Compass,
  Gamepad2,
  Globe,
  GraduationCap,
  Home,
  Landmark,
  Layers,
  Menu,
  Map as MapIcon,
  Moon,
  Newspaper,
  Route as RouteIcon,
  Search,
  Sparkles,
  Sun,
  User,
  Users,
  X,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState, type ReactNode } from "react";
import { PageCredits } from "@/components/PageCredits";
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
    { to: "/haberler", key: "news_title", desc: "nav_news_d", icon: Newspaper },
    { to: "/ogretmen", key: "teacher_title", desc: "nav_teacher_d", icon: GraduationCap },
  ],
};

/** The privacy policy, the terms and the credits: in the footer and the menu, on every page. */
const LEGAL: { to: string; key: TKey }[] = [
  { to: "/gizlilik", key: "privacy_title" },
  { to: "/kosullar", key: "terms_title" },
  { to: "/gorseller", key: "nav_credits" },
];

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

/** A two-to-four way choice as one pill with a sliding highlight. */
function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; icon?: typeof Home; lang?: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid gap-1 rounded-xl bg-secondary p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const on = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={on}
            lang={option.lang}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
              on
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.icon && <option.icon className="h-3.5 w-3.5 shrink-0" />}
            <span className="truncate">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * The one menu: every page, the language and the theme, in a drawer from the
 * left. The header used to carry two drop-downs, two loose links, a language
 * picker, a theme button and a profile icon; now it carries the button that
 * opens this, the name, and the two things most visits are for.
 */
function MenuDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { t, lang, setLang } = useI18n();
  const { theme, toggle } = useTheme();
  const path = usePath();

  // Following a link closes the drawer.
  useEffect(() => {
    onOpenChange(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  const row = (item: NavItem) => {
    const active = isActive(path, item.to);
    return (
      <Link
        key={item.to}
        to={item.to}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
          active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary",
        )}
      >
        <span
          className={cn(
            "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
            active ? "bg-primary text-primary-foreground" : "bg-secondary text-primary",
          )}
        >
          <item.icon className="h-4 w-4" />
        </span>
        <span className="min-w-0 truncate">{t(item.key)}</span>
      </Link>
    );
  };
  const heading = (key: TKey) => (
    <h2 className="mb-1.5 px-2.5 font-sans text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      {t(key)}
    </h2>
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 bg-black/45 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none",
            LAYER,
          )}
        />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            "fixed inset-y-0 left-0 flex w-[min(22rem,88vw)] flex-col border-r border-border bg-background shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left data-[state=closed]:duration-200 data-[state=open]:duration-300 motion-reduce:animate-none",
            LAYER,
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <Dialog.Title className="flex min-w-0 items-center gap-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Landmark className="h-4 w-4" />
              </span>
              <span className="truncate font-display text-base font-semibold">{t("appName")}</span>
            </Dialog.Title>
            <Dialog.Close
              aria-label={t("nav_close")}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <nav
            aria-label={t("nav_menu")}
            className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-2.5 py-4"
          >
            <div className="space-y-0.5">
              {row({ to: "/", key: "nav_home", icon: Home })}
              {row({ to: "/rekonstruksiyonlar", key: "nav_reconstructions", icon: Box })}
              {row({ to: "/profil", key: "nav_profile", icon: User })}
            </div>
            <section>
              {heading(EXPLORE.key)}
              <div className="space-y-0.5">{EXPLORE.items.map(row)}</div>
            </section>
            <section>
              {heading("nav_group_tools")}
              <div className="space-y-0.5">{TOOLS.map(row)}</div>
            </section>
            <section>
              {heading(EXPERIENCE.key)}
              <div className="space-y-0.5">
                {EXPERIENCE.items.filter((item) => item.to !== "/rekonstruksiyonlar").map(row)}
              </div>
            </section>
          </nav>

          <div className="space-y-3 border-t border-border px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Globe className="h-3.5 w-3.5" /> {t("nav_language")}
              </p>
              <Segmented
                label={t("nav_language")}
                value={lang}
                onChange={(code) => setLang(code)}
                options={LANGS.map((code) => ({
                  value: code,
                  label: code.toUpperCase(),
                  lang: code,
                }))}
              />
              <p className="mt-1 px-1 text-[11px] text-muted-foreground">{LANG_NAME[lang]}</p>
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t("nav_theme")}
              </p>
              <Segmented
                label={t("nav_theme")}
                value={theme}
                onChange={(next) => {
                  if (next !== theme) toggle();
                }}
                options={[
                  { value: "light", label: t("theme_light_short"), icon: Sun },
                  { value: "dark", label: t("theme_dark_short"), icon: Moon },
                ]}
              />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 px-1 text-xs font-medium text-muted-foreground">
              {LEGAL.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="underline-offset-2 hover:text-foreground hover:underline"
                >
                  {t(item.key)}
                </Link>
              ))}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/**
 * Five tabs a thumb can hit: home, the map, the 3D models in the middle, the
 * profile, and the same menu the header opens — within reach of a thumb.
 */
function MobileTabs({ onMenu, menuOpen }: { onMenu: () => void; menuOpen: boolean }) {
  const { t } = useI18n();
  const path = usePath();
  const tab =
    "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[11px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring";
  const link = (item: NavItem) => (
    <Link
      key={item.to}
      to={item.to}
      className={cn(
        tab,
        isActive(path, item.to) && !menuOpen ? "text-primary" : "text-muted-foreground",
      )}
    >
      <span className="grid h-6 place-items-center">
        <item.icon className="h-5 w-5" />
      </span>
      <span className="max-w-full truncate">{t(item.key)}</span>
    </Link>
  );
  const in3d = isActive(path, "/rekonstruksiyonlar");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[1000] print:hidden border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-xl items-stretch justify-between px-2 py-1.5">
        {link({ to: "/", key: "nav_home", icon: Home })}
        {link({ to: "/harita", key: "nav_map", icon: MapIcon })}
        <Link to="/rekonstruksiyonlar" className={cn(tab, "text-primary")}>
          <span
            className={cn(
              "grid h-6 w-11 place-items-center rounded-full transition-colors",
              in3d && !menuOpen ? "bg-primary text-primary-foreground" : "bg-primary/12",
            )}
          >
            <Box className="h-4.5 w-4.5" />
          </span>
          <span className="max-w-full truncate font-semibold">{t("recon_badge")}</span>
        </Link>
        {link({ to: "/profil", key: "nav_profile", icon: User })}
        <button
          type="button"
          onClick={onMenu}
          aria-expanded={menuOpen}
          aria-haspopup="dialog"
          className={cn(tab, menuOpen ? "text-primary" : "text-muted-foreground")}
        >
          <span className="grid h-6 place-items-center">
            <Menu className="h-5 w-5" />
          </span>
          <span className="max-w-full truncate">{t("nav_menu")}</span>
        </button>
      </div>
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const path = usePath();
  const [menuOpen, setMenuOpen] = useState(false);
  const iconButton =
    "grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-[1000] print:hidden border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-1.5 px-2 sm:h-16 sm:gap-2 sm:px-4">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={t("nav_menu_open")}
            aria-expanded={menuOpen}
            aria-haspopup="dialog"
            data-menu-trigger
            className={iconButton}
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2 rounded-lg pr-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Landmark className="h-4 w-4" />
            </span>
            <span className="truncate font-display text-[17px] font-semibold leading-tight">
              {t("appName")}
            </span>
          </Link>

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            <Link
              to="/kentler"
              aria-label={t("search_action")}
              title={t("search_action")}
              className={iconButton}
            >
              <Search className="h-5 w-5" />
            </Link>
            <Link
              to="/rekonstruksiyonlar"
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                isActive(path, "/rekonstruksiyonlar")
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground",
              )}
            >
              <Box className="h-4 w-4" />
              <span className="hidden sm:inline">{t("nav_reconstructions")}</span>
              <span className="sm:hidden">{t("recon_badge")}</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20 print:pb-0 lg:pb-0">{children}</main>

      <footer className="border-t border-border px-6 py-10 pb-24 print:hidden lg:pb-10">
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
        </div>
        <nav
          aria-label={t("nav_legal")}
          className="mx-auto mt-8 flex max-w-7xl flex-wrap gap-x-5 gap-y-2 border-t border-border pt-5 text-xs text-muted-foreground"
        >
          {LEGAL.map((item) => (
            <Link key={item.to} to={item.to} className="hover:text-foreground hover:underline">
              {t(item.key)}
            </Link>
          ))}
          <span>© Iova LTD</span>
        </nav>
        <PageCredits />
      </footer>

      <MenuDrawer open={menuOpen} onOpenChange={setMenuOpen} />
      <MobileTabs onMenu={() => setMenuOpen(true)} menuOpen={menuOpen} />
    </div>
  );
}
