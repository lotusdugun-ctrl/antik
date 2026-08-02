import { n as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as useI18n, t as LanguageProvider } from "./i18n-DFOAhYEi.mjs";
import { t as ProgressProvider } from "./progress-DJjpoble.mjs";
import { _ as useRouter, c as HeadContent, d as Outlet, f as lazyRouteComponent, h as Link, m as createRootRouteWithContext, p as createFileRoute, s as Scripts, u as createRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { D as Columns3, S as House, b as Landmark, d as Route, h as Map, m as Moon, r as User, s as Sun, w as Gamepad2 } from "../_libs/lucide-react.mjs";
import { t as Route$7 } from "./bolge._id-D6YB4Lxq.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as Route$8 } from "./kent._slug-tqJIvhMM.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { t as Route$9 } from "./kentler-DD71hRNt.mjs";
import { t as Route$10 } from "./rota-u2rAVJBv.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { n as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-Zz6HLn08.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-6doV6xHH.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message,
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
var KEY = "antik-tr-theme";
var ThemeCtx = (0, import_react.createContext)(null);
function ThemeProvider({ children }) {
	const [theme, setTheme] = (0, import_react.useState)("light");
	(0, import_react.useEffect)(() => {
		const initial = window.localStorage.getItem(KEY) ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
		setTheme(initial);
		document.documentElement.classList.toggle("dark", initial === "dark");
	}, []);
	const toggle = (0, import_react.useCallback)(() => {
		setTheme((prev) => {
			const next = prev === "dark" ? "light" : "dark";
			window.localStorage.setItem(KEY, next);
			document.documentElement.classList.toggle("dark", next === "dark");
			return next;
		});
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeCtx.Provider, {
		value: {
			theme,
			toggle
		},
		children
	});
}
function useTheme() {
	const ctx = (0, import_react.useContext)(ThemeCtx);
	if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
	return ctx;
}
var navItems = [
	{
		to: "/",
		key: "nav_home",
		icon: House
	},
	{
		to: "/kentler",
		key: "nav_explore",
		icon: Landmark
	},
	{
		to: "/harita",
		key: "nav_map",
		icon: Map
	},
	{
		to: "/bolgeler",
		key: "nav_regions",
		icon: Columns3
	},
	{
		to: "/rota",
		key: "nav_route",
		icon: Route,
		desktopOnly: true
	},
	{
		to: "/oyunlar",
		key: "nav_games",
		icon: Gamepad2
	},
	{
		to: "/profil",
		key: "nav_profile",
		icon: User
	}
];
function LangSwitch() {
	const { lang, setLang } = useI18n();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex items-center rounded-full border border-border bg-card p-0.5 text-xs font-semibold",
		children: ["tr", "en"].map((code) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			onClick: () => setLang(code),
			className: cn("rounded-full px-2.5 py-1 uppercase transition-colors", lang === code ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"),
			"aria-pressed": lang === code,
			children: code
		}, code))
	});
}
function ThemeButton() {
	const { theme, toggle } = useTheme();
	const { t } = useI18n();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		onClick: toggle,
		"aria-label": theme === "dark" ? t("theme_light") : t("theme_dark"),
		className: "grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground",
		children: theme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "h-4 w-4" })
	});
}
function AppShell({ children }) {
	const { t } = useI18n();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-[1000] border-b border-border/70 bg-background/85 backdrop-blur-xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "flex min-w-0 items-center gap-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "h-4.5 w-4.5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate font-display text-base font-semibold leading-tight",
								children: t("appName")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden text-[11px] text-muted-foreground sm:block",
								children: t("tagline")
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
								className: "mr-1 hidden items-center gap-1 lg:flex",
								children: navItems.slice(1).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: item.to,
									activeProps: { className: "bg-secondary text-foreground" },
									className: "rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
									children: t(item.key)
								}, item.to))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LangSwitch, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeButton, {})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex-1 pb-20 lg:pb-0",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "hidden border-t border-border px-6 py-10 lg:block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-base text-foreground",
						children: t("appName")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("tagline") })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-[1000] border-t border-border bg-background/95 backdrop-blur-xl lg:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto flex max-w-xl items-stretch justify-between px-2 py-1.5",
					children: navItems.filter((i) => !i.desktopOnly).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: item.to,
						activeOptions: { exact: item.to === "/" },
						activeProps: { className: "text-primary" },
						className: "flex flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[10px] font-medium text-muted-foreground transition-colors",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "h-5 w-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate",
							children: t(item.key)
						})]
					}, item.to))
				})
			})
		]
	});
}
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$6 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Antik Türkiye — Türkiye Antik Kent Rehberi" },
			{
				name: "description",
				content: "Türkiye'nin antik kentlerini harita üzerinde keşfet, tarihçelerini öğren, ziyaretlerini kaydet."
			},
			{
				name: "author",
				content: "Antik Türkiye"
			},
			{
				property: "og:title",
				content: "Antik Türkiye — Türkiye Antik Kent Rehberi"
			},
			{
				property: "og:description",
				content: "Türkiye'nin antik kentleri için interaktif harita, rehber ve ziyaret günlüğü."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "theme-color",
				content: "#f7f4ee"
			},
			{
				name: "application-name",
				content: "Antik Türkiye"
			},
			{
				name: "apple-mobile-web-app-capable",
				content: "yes"
			},
			{
				name: "apple-mobile-web-app-status-bar-style",
				content: "default"
			},
			{
				name: "apple-mobile-web-app-title",
				content: "Antik Türkiye"
			},
			{
				name: "mobile-web-app-capable",
				content: "yes"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/icons/apple-touch-icon.png"
			},
			{
				rel: "icon",
				href: "/icons/favicon-32.png",
				type: "image/png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700&display=swap"
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "tr",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function PwaRegistration() {
	const { t } = useI18n();
	(0, import_react.useEffect)(() => {
		if (!("serviceWorker" in navigator)) return;
		window.location.hostname;
		navigator.serviceWorker.register("/sw.js").then((reg) => {
			if (!navigator.serviceWorker.controller) return;
			reg.addEventListener("updatefound", () => toast.success(t("pwa_offline_ready")));
		});
	}, []);
	return null;
}
function RootComponent() {
	const { queryClient } = Route$6.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LanguageProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ProgressProvider, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PwaRegistration, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
				position: "top-center",
				richColors: true
			})
		] }) }) })
	});
}
var $$splitComponentImporter$4 = () => import("./routes-Y8OugX9m.mjs");
var Route$5 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "Antik Türkiye — Türkiye'nin Antik Kent Rehberi" },
		{
			name: "description",
			content: "Türkiye'deki antik kentleri harita üzerinde keşfet, tarihçelerini oku, ziyaretlerini kaydet ve mini oyunlarla öğren."
		},
		{
			property: "og:title",
			content: "Antik Türkiye — Türkiye'nin Antik Kent Rehberi"
		},
		{
			property: "og:description",
			content: "Efes'ten Göbeklitepe'ye: interaktif harita, detaylı rehber ve ziyaret günlüğü."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./bolgeler-DhaCnI1V.mjs");
var Route$4 = createFileRoute("/bolgeler")({
	head: () => ({ meta: [
		{ title: "Bölgeler — Türkiye Antik Kentleri | Antik Türkiye" },
		{
			name: "description",
			content: "Ege'den Doğu Anadolu'ya yedi bölgedeki antik kentleri keşfet, bölge bazlı ilerlemeni ve tamamlanma yüzdeni gör."
		},
		{
			property: "og:title",
			content: "Bölgeler — Türkiye Antik Kentleri"
		},
		{
			property: "og:description",
			content: "Yedi bölgedeki antik kentler ve bölge bazlı ziyaret ilerlemesi."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./harita-C4B10KC0.mjs");
var Route$3 = createFileRoute("/harita")({
	head: () => ({ meta: [
		{ title: "Antik Kent Haritası — Türkiye | Antik Türkiye" },
		{
			name: "description",
			content: "Türkiye'deki tüm antik kentleri interaktif harita üzerinde gör; iğneye tıklayıp bilgi kartını aç ve ziyaretini kaydet."
		},
		{
			property: "og:title",
			content: "Antik Kent Haritası — Türkiye"
		},
		{
			property: "og:description",
			content: "Türkiye'nin antik kentleri interaktif harita üzerinde işaretli."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./oyunlar-7vy7m9Aq.mjs");
var Route$2 = createFileRoute("/oyunlar")({
	head: () => ({ meta: [
		{ title: "Mini Oyunlar — Antik Kentleri Öğren | Antik Türkiye" },
		{
			name: "description",
			content: "Fotoğrafı tahmin et, kim bu, doğru/yanlış, haritada bul ve yapıyı tanı oyunlarıyla antik kentleri öğren, XP kazan."
		},
		{
			property: "og:title",
			content: "Mini Oyunlar — Antik Kentleri Öğren"
		},
		{
			property: "og:description",
			content: "Eğitici mini oyunlarla Türkiye'nin antik kentlerini öğren ve seviye atla."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./profil-BI7WRaJq.mjs");
var Route$1 = createFileRoute("/profil")({
	head: () => ({ meta: [
		{ title: "Profilim — İlerleme, Rozetler ve Favoriler | Antik Türkiye" },
		{
			name: "description",
			content: "Gezdiğin antik kentler, favorilerin, bölge bazlı ilerlemen, XP seviyen ve kazandığın başarı rozetleri."
		},
		{
			property: "og:title",
			content: "Profilim — İlerleme ve Rozetler"
		},
		{
			property: "og:description",
			content: "Antik kent ziyaretlerini, istatistiklerini ve rozetlerini takip et."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var rootRouteChildren = {
	IndexRoute: Route$5.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$6
	}),
	BolgelerRoute: Route$4.update({
		id: "/bolgeler",
		path: "/bolgeler",
		getParentRoute: () => Route$6
	}),
	HaritaRoute: Route$3.update({
		id: "/harita",
		path: "/harita",
		getParentRoute: () => Route$6
	}),
	KentlerRoute: Route$9.update({
		id: "/kentler",
		path: "/kentler",
		getParentRoute: () => Route$6
	}),
	OyunlarRoute: Route$2.update({
		id: "/oyunlar",
		path: "/oyunlar",
		getParentRoute: () => Route$6
	}),
	ProfilRoute: Route$1.update({
		id: "/profil",
		path: "/profil",
		getParentRoute: () => Route$6
	}),
	RotaRoute: Route$10.update({
		id: "/rota",
		path: "/rota",
		getParentRoute: () => Route$6
	}),
	BolgeIdRoute: Route$7.update({
		id: "/bolge/$id",
		path: "/bolge/$id",
		getParentRoute: () => Route$6
	}),
	KentSlugRoute: Route$8.update({
		id: "/kent/$slug",
		path: "/kent/$slug",
		getParentRoute: () => Route$6
	})
};
var routeTree = Route$6._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
