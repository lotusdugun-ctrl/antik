import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  retainSearchParams,
  useNavigate,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useCallback, useEffect, type ReactNode } from "react";
import { toast } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppShell } from "@/components/AppShell";
import {
  DEFAULT_LANG,
  LanguageProvider,
  parseLang,
  translate,
  useI18n,
  type Lang,
} from "@/lib/i18n";
import { websiteTags } from "@/lib/seo";
import { ProgressProvider } from "@/lib/progress";
import { ThemeProvider } from "@/lib/theme";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  /**
   * Language is a search param so that it lives in the URL. Turkish is the
   * default and stays absent, which keeps every existing Turkish address
   * unchanged; only English adds `?lang=en`.
   */
  validateSearch: (
    search: Record<string, unknown>,
  ): { lang?: Exclude<Lang, typeof DEFAULT_LANG> | undefined } => {
    const lang = parseLang(search["lang"]);
    return lang === DEFAULT_LANG ? {} : { lang };
  },
  // Without this, following any <Link> would silently drop the language.
  search: { middlewares: [retainSearchParams(["lang"])] },
  head: ({ match }) => {
    const lang = parseLang((match.search as { lang?: string }).lang);
    return {
      // Site-level identity, emitted once. Per-page structured data (the site
      // itself, breadcrumbs, list pages) is added by the route that owns it.
      scripts: websiteTags({
        lang,
        name: translate("appName", lang),
        description: translate("seo_home_desc", lang),
      }),
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "author", content: "Antik Türkiye" },
        { name: "theme-color", content: "#f7f4ee" },
        { name: "application-name", content: "Antik Türkiye" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "default" },
        { name: "apple-mobile-web-app-title", content: "Antik Türkiye" },
        { name: "mobile-web-app-capable", content: "yes" },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "manifest", href: "/manifest.webmanifest" },
        { rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png" },
        { rel: "icon", href: "/icons/favicon-32.png", type: "image/png" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700&display=swap",
        },
        { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  // Read straight from router state rather than a hook bound to a match: the
  // shell renders outside the route components, but it still needs the
  // language so the server emits the correct <html lang>.
  const lang = useRouterState({
    select: (state) => parseLang((state.location.search as { lang?: string }).lang),
  });

  return (
    <html lang={lang}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function PwaRegistration() {
  const { t } = useI18n();
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const host = window.location.hostname;
    const isDevLocal = host === "localhost" || host === "127.0.0.1";
    if (!import.meta.env.PROD && !isDevLocal) return;
    navigator.serviceWorker.register("/sw.js").then((reg) => {
      if (!navigator.serviceWorker.controller) return;
      reg.addEventListener("updatefound", () => toast.success(t("pwa_offline_ready")));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const navigate = useNavigate();
  const lang = parseLang(Route.useSearch().lang);

  // Switching language is a navigation, not a state change, so the address bar
  // agrees with what is on screen and the page can be shared or bookmarked.
  const setLang = useCallback(
    (next: Lang) =>
      navigate({
        to: ".",
        search: (prev: Record<string, unknown>) => {
          const rest = { ...prev };
          delete rest["lang"];
          // Turkish is the default, so it is expressed by the absence of the
          // param rather than `?lang=tr`.
          return next === DEFAULT_LANG ? rest : { ...rest, lang: next };
        },
        replace: true,
      }),
    [navigate],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider lang={lang} setLang={setLang}>
          <ProgressProvider>
            <AppShell>
              {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
              <Outlet />
            </AppShell>
            <PwaRegistration />
            <Toaster position="top-center" richColors />
          </ProgressProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
