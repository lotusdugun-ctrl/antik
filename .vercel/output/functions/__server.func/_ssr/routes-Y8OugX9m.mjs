import { n as __toESM } from "../_runtime.mjs";
import { d as sites, i as distanceKm, l as regions, o as getSite, r as coverImage, s as heroImage, u as siteOfTheDay } from "./sites-qcnwZ4V_.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as useI18n } from "./i18n-DFOAhYEi.mjs";
import { r as useProgress } from "./progress-DJjpoble.mjs";
import { g as useNavigate, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { E as Compass, R as ArrowRight, c as Sparkles, d as Route, g as MapPin, l as Search, p as Navigation } from "../_libs/lucide-react.mjs";
import { t as SiteCard } from "./SiteCard-Bt0I76Dx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Y8OugX9m.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SectionTitle({ title, action, to }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-4 flex items-end justify-between gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-xl font-semibold sm:text-2xl",
			children: title
		}), action && to && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to,
			className: "flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline",
			children: [action, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3.5 w-3.5" })]
		})]
	});
}
function Index() {
	const { t, L } = useI18n();
	const navigate = useNavigate();
	const { state } = useProgress();
	const [query, setQuery] = (0, import_react.useState)("");
	const [coords, setCoords] = (0, import_react.useState)(null);
	const [geoError, setGeoError] = (0, import_react.useState)(false);
	const [daily, setDaily] = (0, import_react.useState)(() => siteOfTheDay());
	(0, import_react.useEffect)(() => setDaily(siteOfTheDay()), []);
	const popular = (0, import_react.useMemo)(() => [...sites].sort((a, b) => b.popularity - a.popularity).slice(0, 8), []);
	const recent = state.recent.map(getSite).filter(Boolean).slice(0, 4);
	const nearby = (0, import_react.useMemo)(() => {
		if (!coords) return [];
		return [...sites].map((site) => ({
			site,
			d: distanceKm(coords.lat, coords.lng, site.lat, site.lng)
		})).sort((a, b) => a.d - b.d).slice(0, 4);
	}, [coords]);
	function locate() {
		if (!navigator.geolocation) return setGeoError(true);
		navigator.geolocation.getCurrentPosition((pos) => setCoords({
			lat: pos.coords.latitude,
			lng: pos.coords.longitude
		}), () => setGeoError(true), { timeout: 8e3 });
	}
	function submitSearch(e) {
		e.preventDefault();
		navigate({
			to: "/kentler",
			search: { q: query || void 0 }
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "relative",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative h-[68vh] min-h-[440px] w-full overflow-hidden",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: heroImage,
					alt: "Efes Antik Kenti Celsus Kütüphanesi",
					width: 1920,
					height: 1088,
					className: "h-full w-full object-cover"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 hero-scrim" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute inset-x-0 bottom-0 mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "fade-up mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5" }),
								sites.length,
								" ",
								t("cities"),
								" · 7 ",
								t("regions")
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "fade-up max-w-3xl font-display text-4xl font-semibold leading-[1.05] text-white sm:text-6xl",
							children: t("tagline")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: submitSearch,
							className: "fade-up mt-6 flex max-w-xl gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: query,
									onChange: (e) => setQuery(e.target.value),
									placeholder: t("search_placeholder"),
									"aria-label": t("search_placeholder"),
									className: "h-12 w-full rounded-full border border-border bg-card/95 pl-10 pr-4 text-sm text-foreground shadow-lg outline-none backdrop-blur placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								className: "h-12 shrink-0 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]",
								children: t("nav_explore")
							})]
						})
					]
				})
			]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl space-y-14 px-4 py-12 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { title: t("daily_pick") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/kent/$slug",
				params: { slug: daily.slug },
				className: "group grid overflow-hidden rounded-3xl surface-panel md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative aspect-[16/10] overflow-hidden md:aspect-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: coverImage(daily),
						alt: L(daily.name),
						loading: "lazy",
						width: 1200,
						height: 800,
						className: "h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col justify-center gap-3 p-6 sm:p-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Compass, { className: "h-3.5 w-3.5" }),
								" ",
								t("daily_pick")
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-3xl font-semibold",
							children: L(daily.name)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "flex items-center gap-1 text-sm text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3.5 w-3.5" }),
								" ",
								L(daily.province),
								" · ",
								L(daily.era)
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm leading-relaxed text-muted-foreground",
							children: L(daily.summary)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground",
							children: [
								t("detail_page"),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })
							]
						})
					]
				})]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative overflow-hidden rounded-3xl surface-panel p-6 sm:p-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary/10 blur-2xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, { className: "h-3.5 w-3.5" }),
								" ",
								t("route_title")
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-1 font-display text-2xl font-semibold sm:text-3xl",
							children: t("route_sub")
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/rota",
						className: "inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]",
						children: [
							t("route_build"),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })
						]
					})]
				})]
			}) }),
			recent.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { title: t("recent") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
				children: recent.map((site) => site ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteCard, { site }, site.slug) : null)
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { title: t("nearby") }), nearby.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-4 rounded-2xl surface-panel p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: geoError ? t("nearby_denied") : t("nearby_hint")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: locate,
					className: "inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, { className: "h-4 w-4" }), t("nearby_enable")]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
				children: nearby.map(({ site, d }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteCard, {
					site,
					distance: d
				}, site.slug))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
				title: t("quick_regions"),
				action: t("view_all"),
				to: "/bolgeler"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
				children: regions.map((region) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/bolge/$id",
					params: { id: region.id },
					className: "group relative aspect-[5/3] overflow-hidden rounded-2xl border border-border lift",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: region.image,
							alt: L(region.name),
							loading: "lazy",
							width: 1200,
							height: 800,
							className: "h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 hero-scrim" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute inset-x-0 bottom-0 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-lg font-semibold text-white",
								children: L(region.name)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-white/75",
								children: [
									sites.filter((s) => s.region === region.id).length,
									" ",
									t("cities")
								]
							})]
						})
					]
				}, region.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
				title: t("popular"),
				action: t("view_all"),
				to: "/kentler"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
				children: popular.map((site) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteCard, { site }, site.slug))
			})] })
		]
	})] });
}
//#endregion
export { Index as component };
