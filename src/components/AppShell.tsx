import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  Box,
  Building2,
  Castle,
  Gamepad2,
  GraduationCap,
  History,
  House,
  Images,
  Landmark,
  Layers,
  Map as MapIcon,
  MapPinned,
  Menu,
  Monitor,
  Moon,
  Newspaper,
  Route as RouteIcon,
  Search,
  Sun,
  User,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
  type TouchEvent,
} from "react";
import { PageCredits } from "@/components/PageCredits";
import { LANGS, useI18n, type Lang, type TKey } from "@/lib/i18n";
import { useTheme, type ThemePref } from "@/lib/theme";
import { cn } from "@/lib/utils";

type NavItem = { to: string; key: TKey; desc?: TKey; icon: LucideIcon };
type NavGroup = { key: TKey; items: NavItem[] };

/*
 * The menu: every page there is, each exactly once, in four groups read top
 * to bottom — what there is to see, what there is to learn, what helps plan
 * a visit, and the rest. The browse-and-search page (/kentler) is the search
 * field at the top of the menu rather than a row of its own; the privacy
 * policy and the terms sit in the menu's footer.
 */
const MENU: NavGroup[] = [
  {
    key: "nav_group_explore",
    items: [
      { to: "/", key: "nav_home", desc: "nav_home_d", icon: House },
      {
        to: "/rekonstruksiyonlar",
        key: "nav_reconstructions",
        desc: "nav_reconstructions_d",
        icon: Box,
      },
      { to: "/harita", key: "nav_map", desc: "nav_map_d", icon: MapIcon },
      { to: "/antik-kentler", key: "nav_ancient", desc: "nav_ancient_d", icon: Landmark },
      { to: "/tarihi-yerler", key: "nav_places", desc: "nav_places_d", icon: Castle },
      { to: "/muzeler", key: "nav_museums", desc: "nav_museums_d", icon: Building2 },
    ],
  },
  {
    key: "nav_group_learn",
    items: [
      { to: "/hikayeler", key: "nav_stories", desc: "nav_stories_d", icon: BookOpen },
      { to: "/zaman-cizelgesi", key: "nav_timeline", desc: "nav_timeline_d", icon: History },
      { to: "/medeniyetler", key: "nav_history", desc: "nav_history_d", icon: Users },
      { to: "/bolgeler", key: "nav_regions", desc: "nav_regions_d", icon: MapPinned },
      { to: "/koleksiyonlar", key: "nav_collections", desc: "nav_collections_d", icon: Layers },
    ],
  },
  {
    key: "nav_group_plan",
    items: [
      { to: "/rota", key: "nav_route", desc: "nav_route_d", icon: RouteIcon },
      { to: "/profil", key: "nav_profile", desc: "nav_profile_d", icon: User },
    ],
  },
  {
    key: "nav_group_more",
    items: [
      { to: "/oyunlar", key: "nav_games", desc: "nav_games_d", icon: Gamepad2 },
      { to: "/ogretmen", key: "teacher_title", desc: "nav_teacher_d", icon: GraduationCap },
      { to: "/haberler", key: "news_title", desc: "nav_news_d", icon: Newspaper },
      { to: "/gorseller", key: "nav_credits", desc: "nav_credits_d", icon: Images },
    ],
  },
];

/** The browse-and-search page, opened by the search field and the header's search button. */
const SEARCH_PAGE = "/kentler";

const LEGAL: { to: string; key: TKey }[] = [
  { to: "/gizlilik", key: "privacy_title" },
  { to: "/kosullar", key: "terms_title" },
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
const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function usePath() {
  return useRouterState({ select: (state) => state.location.pathname });
}

/** The app's mark: a temple front on the brand colour. */
function Mark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-[10px] bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.18)]",
        className,
      )}
    >
      <Landmark className="h-[55%] w-[55%]" strokeWidth={2} />
    </span>
  );
}

/** A two-to-four way choice as one pill. */
function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; icon?: LucideIcon; lang?: string; title?: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid gap-0.5 rounded-xl bg-secondary p-0.5"
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
            title={option.title}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-[10px] px-1.5 text-[13px] font-semibold transition-[color,background-color,box-shadow] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
              on
                ? "bg-card text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.08),0_0_0_0.5px_rgb(0_0_0/0.04)] dark:bg-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.icon && <option.icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />}
            <span className="truncate">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Swipe the panel back towards the edge to close it. Only a mostly
 * sideways drag counts, so scrolling the list is never mistaken for one.
 */
function useSwipeToClose(close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number; dx: number; horizontal: boolean | null } | null>(
    null,
  );
  const set = (dx: number, animate: boolean) => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = animate ? "transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1)" : "none";
    el.style.transform = dx ? `translateX(${dx}px)` : "";
  };
  return {
    ref,
    onTouchStart: (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      start.current = { x: touch.clientX, y: touch.clientY, dx: 0, horizontal: null };
    },
    onTouchMove: (event: TouchEvent) => {
      const s = start.current;
      const touch = event.touches[0];
      if (!s || !touch) return;
      const dx = touch.clientX - s.x;
      const dy = touch.clientY - s.y;
      if (s.horizontal === null && Math.hypot(dx, dy) > 8) {
        s.horizontal = Math.abs(dx) > Math.abs(dy) * 1.4 && dx < 0;
      }
      if (!s.horizontal) return;
      s.dx = Math.min(0, dx);
      set(s.dx, false);
    },
    onTouchEnd: () => {
      const s = start.current;
      start.current = null;
      if (!s?.horizontal) return;
      if (s.dx < -72) {
        set(0, false);
        close();
      } else set(0, true);
    },
  };
}

/**
 * The one menu: a search field, every page in four groups, the language and
 * the theme. A panel from the left on a phone; on a large screen the same
 * panel widens into two columns with a line about each page.
 */
function MenuDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { t, lang, setLang } = useI18n();
  const { pref, setPref } = useTheme();
  const path = usePath();
  const navigate = useNavigate();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [query, setQuery] = useState("");
  const swipe = useSwipeToClose(() => onOpenChange(false));

  // Following a link closes the drawer.
  useEffect(() => {
    onOpenChange(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const q = query.trim();
    setQuery("");
    onOpenChange(false);
    void navigate({ to: SEARCH_PAGE, search: q ? { q } : {} });
  };

  const row = (item: NavItem) => {
    const active = isActive(path, item.to);
    return (
      <li key={item.to}>
        <Link
          to={item.to}
          aria-current={active ? "page" : undefined}
          // The path effect closes the panel on navigation; this covers a tap
          // on the page already open, which navigates nowhere.
          onClick={() => onOpenChange(false)}
          className={cn(
            "group relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 transition-colors duration-150 motion-reduce:transition-none lg:gap-3.5 lg:py-2",
            FOCUS,
            active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary/80",
          )}
        >
          <span
            className={cn(
              "grid shrink-0 place-items-center lg:h-9 lg:w-9 lg:rounded-[10px] lg:border",
              active
                ? "text-primary lg:border-primary/20 lg:bg-card"
                : "text-muted-foreground group-hover:text-foreground lg:border-border lg:bg-card",
            )}
          >
            <item.icon className="h-5 w-5 lg:h-[18px] lg:w-[18px]" strokeWidth={1.75} />
          </span>
          <span className="min-w-0 flex-1">
            <span
              className={cn(
                "block truncate text-[15px] leading-5",
                active ? "font-semibold" : "font-medium",
              )}
            >
              {t(item.key)}
            </span>
            {item.desc && (
              <span className="mt-0.5 hidden truncate text-xs leading-4 text-muted-foreground lg:block">
                {t(item.desc)}
              </span>
            )}
          </span>
          {active && (
            <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary lg:hidden" />
          )}
        </Link>
      </li>
    );
  };

  const group = (g: NavGroup, order: string) => (
    <section key={g.key} aria-labelledby={`menu-${g.key}`} className={order}>
      <h2
        id={`menu-${g.key}`}
        className="px-3 pb-1.5 font-sans text-[11px] font-bold uppercase tracking-[0.09em] text-muted-foreground"
      >
        {t(g.key)}
      </h2>
      <ul className="space-y-0.5">{g.items.map(row)}</ul>
    </section>
  );

  const [explore, learn, plan, more] = MENU as [NavGroup, NavGroup, NavGroup, NavGroup];
  const year = new Date().getFullYear();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 bg-[oklch(0.2_0.02_55/0.38)] backdrop-blur-[6px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:duration-300 motion-reduce:animate-none motion-reduce:backdrop-blur-none dark:bg-black/55",
            LAYER,
          )}
        />
        <Dialog.Content
          ref={swipe.ref}
          aria-describedby={undefined}
          onOpenAutoFocus={(event) => {
            // Not the search field: on a phone that would throw up the keyboard.
            event.preventDefault();
            closeRef.current?.focus({ preventScroll: true });
          }}
          onTouchStart={swipe.onTouchStart}
          onTouchMove={swipe.onTouchMove}
          onTouchEnd={swipe.onTouchEnd}
          onTouchCancel={swipe.onTouchEnd}
          className={cn(
            "fixed inset-y-0 left-0 flex w-[min(23rem,calc(100vw-2.75rem))] flex-col overflow-hidden rounded-r-[28px] border-r border-border/70 bg-background pl-[env(safe-area-inset-left)] shadow-[0_24px_64px_-12px_rgb(0_0_0/0.35)] outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left data-[state=closed]:duration-200 data-[state=open]:duration-300 data-[state=open]:ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:animate-none lg:w-[min(50rem,calc(100vw-6rem))]",
            LAYER,
          )}
        >
          {/* Brand, close, search: fixed at the top while the list scrolls. */}
          <div className="space-y-3 px-4 pb-3 pt-[max(0.875rem,env(safe-area-inset-top))] lg:px-6 lg:pt-5">
            <div className="flex items-center justify-between gap-3">
              <Dialog.Title className="flex min-w-0 items-center gap-2.5">
                <Mark className="h-9 w-9" />
                <span className="min-w-0">
                  <span className="block truncate font-display text-[17px] font-semibold leading-5">
                    {t("appName")}
                  </span>
                  <span className="block truncate font-sans text-xs font-normal leading-4 text-muted-foreground">
                    {t("nav_menu")}
                  </span>
                </span>
              </Dialog.Title>
              <Dialog.Close
                ref={closeRef}
                aria-label={t("nav_close")}
                className={cn(
                  "grid h-11 w-11 shrink-0 place-items-center rounded-full bg-secondary text-foreground transition-colors hover:bg-secondary/70",
                  FOCUS,
                )}
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </Dialog.Close>
            </div>
            <form role="search" onSubmit={submit} className="relative">
              <Search
                aria-hidden
                className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground"
                strokeWidth={2}
              />
              <input
                type="search"
                enterKeyHint="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label={t("search_action")}
                placeholder={t("nav_all_places")}
                className={cn(
                  "h-12 w-full rounded-2xl border border-transparent bg-secondary pl-11 pr-4 text-[15px] text-foreground transition-colors placeholder:text-muted-foreground hover:border-border focus:border-ring focus:bg-card focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 [&::-webkit-search-cancel-button]:hidden",
                  isActive(path, SEARCH_PAGE) && "border-primary/30",
                )}
              />
            </form>
          </div>

          <div
            data-menu-scroll
            className="flex-1 overflow-y-auto overscroll-contain border-t border-border/70"
          >
            <nav
              aria-label={t("nav_menu")}
              className="grid gap-6 px-2 pb-6 pt-4 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-7 lg:px-4 lg:pt-5"
            >
              {/* Two columns on a large screen (explore + plan, learn + more);
                  one list in reading order on a phone. */}
              <div className="contents lg:block lg:space-y-7">
                {group(explore, "order-1")}
                {group(plan, "order-3")}
              </div>
              <div className="contents lg:block lg:space-y-7">
                {group(learn, "order-2")}
                {group(more, "order-4")}
              </div>
            </nav>

            {/* Settings, then the quiet small print. */}
            <div className="px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] lg:px-6">
              <section
                aria-labelledby="menu-settings"
                className="rounded-2xl border border-border/80 bg-card p-3.5 lg:p-4"
              >
                <h2
                  id="menu-settings"
                  className="mb-3 font-sans text-[11px] font-bold uppercase tracking-[0.09em] text-muted-foreground"
                >
                  {t("nav_settings")}
                </h2>
                <div className="grid gap-3.5 lg:grid-cols-2 lg:gap-5">
                  <div>
                    <div className="mb-1.5 flex items-baseline justify-between gap-2 px-0.5 text-[13px]">
                      <span className="font-semibold text-foreground">{t("nav_language")}</span>
                      <span className="truncate text-muted-foreground" lang={lang}>
                        {LANG_NAME[lang]}
                      </span>
                    </div>
                    <Segmented
                      label={t("nav_language")}
                      value={lang}
                      onChange={(code) => setLang(code)}
                      options={LANGS.map((code) => ({
                        value: code,
                        label: code.toUpperCase(),
                        lang: code,
                        title: LANG_NAME[code],
                      }))}
                    />
                  </div>
                  <div>
                    <div className="mb-1.5 px-0.5 text-[13px] font-semibold text-foreground">
                      {t("nav_theme")}
                    </div>
                    <Segmented<ThemePref>
                      label={t("nav_theme")}
                      value={pref}
                      onChange={setPref}
                      options={[
                        { value: "light", label: t("theme_light_short"), icon: Sun },
                        { value: "dark", label: t("theme_dark_short"), icon: Moon },
                        { value: "system", label: t("theme_system_short"), icon: Monitor },
                      ]}
                    />
                  </div>
                </div>
              </section>
              <footer className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-1 text-xs text-muted-foreground">
                <span className="flex flex-wrap items-center gap-x-2">
                  {LEGAL.map((item, i) => (
                    <span key={item.to} className="flex items-center gap-2">
                      {i > 0 && <span aria-hidden>·</span>}
                      <Link
                        to={item.to}
                        onClick={() => onOpenChange(false)}
                        className="rounded underline-offset-2 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {t(item.key)}
                      </Link>
                    </span>
                  ))}
                </span>
                <span>© {year} Iova LTD</span>
              </footer>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/**
 * Five tabs a thumb can hit: home, the map, the 3D models in the middle, the
 * profile, and the same menu the header opens. They step aside while a 3D
 * model is walked through or shown full screen (`data-immersive` on <html>).
 */
function MobileTabs({ onMenu, menuOpen }: { onMenu: () => void; menuOpen: boolean }) {
  const { t } = useI18n();
  const path = usePath();
  const tab = cn(
    "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-0.5 pb-1 pt-1.5 text-[11px] leading-none",
    FOCUS,
  );
  const pill =
    "grid h-8 w-14 place-items-center rounded-full transition-colors duration-200 motion-reduce:transition-none";
  const item = (to: string, key: TKey, Icon: LucideIcon) => {
    const on = isActive(path, to) && !menuOpen;
    return (
      <Link
        key={to}
        to={to}
        aria-current={on ? "page" : undefined}
        className={cn(tab, on ? "font-bold text-primary" : "font-medium text-muted-foreground")}
      >
        <span className={cn(pill, on && "bg-primary/12")}>
          <Icon className="h-[22px] w-[22px]" strokeWidth={on ? 2.1 : 1.75} />
        </span>
        <span className="max-w-full truncate">{t(key)}</span>
      </Link>
    );
  };
  const in3d = isActive(path, "/rekonstruksiyonlar") && !menuOpen;

  return (
    <nav
      aria-label={t("nav_menu")}
      data-tabbar
      className="fixed inset-x-0 bottom-0 z-[1000] border-t border-border/70 bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl backdrop-saturate-150 transition-transform duration-300 motion-reduce:transition-none print:hidden lg:hidden [html[data-immersive]_&]:translate-y-full"
    >
      <div className="mx-auto flex max-w-xl items-stretch justify-between px-1.5 pb-1 pt-0.5">
        {item("/", "nav_home", House)}
        {item("/harita", "nav_map", MapIcon)}
        <Link
          to="/rekonstruksiyonlar"
          aria-current={in3d ? "page" : undefined}
          aria-label={t("nav_reconstructions")}
          className={cn(tab, "font-bold text-primary")}
        >
          <span
            className={cn(
              pill,
              "bg-primary text-primary-foreground shadow-[0_4px_12px_-4px_var(--primary)]",
              in3d && "ring-2 ring-primary/30 ring-offset-2 ring-offset-background",
            )}
          >
            <Box className="h-5 w-5" strokeWidth={2} />
          </span>
          <span className="max-w-full truncate">{t("recon_badge")}</span>
        </Link>
        {item("/profil", "nav_profile", User)}
        <button
          type="button"
          onClick={onMenu}
          aria-expanded={menuOpen}
          aria-haspopup="dialog"
          className={cn(
            tab,
            menuOpen ? "font-bold text-primary" : "font-medium text-muted-foreground",
          )}
        >
          <span className={cn(pill, menuOpen && "bg-primary/12")}>
            <Menu className="h-[22px] w-[22px]" strokeWidth={menuOpen ? 2.1 : 1.75} />
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
  const in3d = isActive(path, "/rekonstruksiyonlar");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-[1000] border-b border-border/60 bg-background/85 pt-[env(safe-area-inset-top)] backdrop-blur-xl backdrop-saturate-150 print:hidden">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-1.5 px-3 sm:h-16 sm:gap-3 sm:px-5">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            aria-haspopup="dialog"
            data-menu-trigger
            className={cn(
              "inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-border bg-card pl-3 pr-3.5 text-sm font-semibold text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.06)] transition-[background-color,transform,border-color] duration-150 hover:border-foreground/20 hover:bg-secondary active:scale-[0.96] motion-reduce:transition-none motion-reduce:active:scale-100 aria-expanded:bg-secondary",
              FOCUS,
            )}
          >
            <Menu className="h-5 w-5" strokeWidth={2} />
            <span>{t("nav_menu")}</span>
          </button>
          <Link
            to="/"
            aria-label={t("appName")}
            className={cn("ml-0.5 flex min-w-0 items-center gap-2 rounded-lg", FOCUS)}
          >
            {/* On a narrow phone the name alone is the logo, so it never truncates. */}
            <Mark className="hidden h-8 w-8 min-[400px]:grid" />
            <span className="truncate font-display text-base font-semibold leading-tight tracking-[-0.01em] sm:text-lg">
              {t("appName")}
            </span>
          </Link>

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            <Link
              to={SEARCH_PAGE}
              aria-label={t("search_action")}
              title={t("search_action")}
              className={cn(
                "grid h-11 w-10 place-items-center rounded-full text-foreground/80 sm:w-11 transition-colors hover:bg-secondary hover:text-foreground",
                FOCUS,
              )}
            >
              <Search className="h-5 w-5" strokeWidth={2} />
            </Link>
            <Link
              to="/rekonstruksiyonlar"
              aria-label={t("nav_reconstructions")}
              className={cn(
                "inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-colors sm:px-3.5",
                FOCUS,
                in3d
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground",
              )}
            >
              <Box className="h-4 w-4" strokeWidth={2} />
              <span className="hidden sm:inline">{t("nav_reconstructions")}</span>
              <span className="sm:hidden">{t("recon_badge")}</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20 print:pb-0 lg:pb-0">{children}</main>

      <footer className="border-t border-border px-6 py-10 pb-24 print:hidden lg:pb-10">
        <div className="mx-auto grid max-w-7xl gap-8 text-sm sm:grid-cols-2 lg:grid-cols-[minmax(0,1.3fr)_repeat(4,minmax(0,1fr))]">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <Mark className="h-8 w-8" />
              <span className="font-display text-base font-semibold text-foreground">
                {t("appName")}
              </span>
            </Link>
            <p className="mt-2 max-w-xs text-muted-foreground">{t("tagline")}</p>
          </div>
          {MENU.map((group) => (
            <div key={group.key} className="hidden sm:block">
              <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.09em] text-muted-foreground">
                {t(group.key)}
              </p>
              <ul className="space-y-1.5">
                {group.items.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="text-foreground/80 hover:text-foreground hover:underline"
                    >
                      {t(item.key)}
                    </Link>
                  </li>
                ))}
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
          <Link to="/gorseller" className="hover:text-foreground hover:underline">
            {t("nav_credits")}
          </Link>
          <span>© Iova LTD</span>
        </nav>
        <PageCredits />
      </footer>

      <MenuDrawer open={menuOpen} onOpenChange={setMenuOpen} />
      <MobileTabs onMenu={() => setMenuOpen(true)} menuOpen={menuOpen} />
    </div>
  );
}
