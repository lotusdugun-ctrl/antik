import { n as __toESM } from "../_runtime.mjs";
import { d as sites, l as regions, n as allProvinces, t as allCivilizations } from "./sites-qcnwZ4V_.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as useI18n } from "./i18n-DFOAhYEi.mjs";
import { g as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { h as Map, l as Search, t as X, y as LayoutGrid } from "../_libs/lucide-react.mjs";
import { t as SiteCard } from "./SiteCard-Bt0I76Dx.mjs";
import { t as SiteMap } from "./SiteMap-CMZrod5j.mjs";
import { t as Route } from "./kentler-DD71hRNt.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/kentler-DEjTnNmx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ExplorePage() {
	const { t, L, lang } = useI18n();
	const search = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });
	const setParam = (patch) => navigate({ search: (prev) => ({
		...prev,
		...patch
	}) });
	const filtered = (0, import_react.useMemo)(() => {
		const q = search.q?.toLocaleLowerCase(lang === "tr" ? "tr" : "en") ?? "";
		return sites.filter((site) => {
			if (search.region && site.region !== search.region) return false;
			if (search.province && site.province.tr !== search.province) return false;
			if (search.civ && !site.civilizations.includes(search.civ)) return false;
			if (search.unesco && site.unesco !== "listed") return false;
			if (search.free && site.fee !== 0) return false;
			if (!q) return true;
			return [
				site.name.tr,
				site.name.en,
				site.province.tr,
				site.province.en,
				...site.civilizations,
				...site.figures
			].join(" ").toLocaleLowerCase(lang === "tr" ? "tr" : "en").includes(q);
		});
	}, [search, lang]);
	const hasFilters = Boolean(search.q || search.region || search.province || search.civ || search.unesco || search.free);
	const isMap = search["view"] === "map";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-4 py-8 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-semibold sm:text-4xl",
					children: t("nav_explore")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: t("region_sub")
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: search.q ?? "",
						onChange: (e) => setParam({ q: e.target.value || void 0 }),
						placeholder: t("search_placeholder"),
						"aria-label": t("search_placeholder"),
						className: "h-11 w-full rounded-full border border-border bg-card pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 items-center rounded-full border border-border bg-card p-0.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setParam({ view: void 0 }),
						className: `flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${!isMap ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, { className: "h-3.5 w-3.5" }),
							" ",
							t("list_view")
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setParam({ view: "map" }),
						className: `flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${isMap ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map, { className: "h-3.5 w-3.5" }),
							" ",
							t("map_view")
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: search.region ?? "",
						onChange: (e) => setParam({ region: e.target.value || void 0 }),
						className: "h-9 rounded-full border border-border bg-card px-3 text-xs font-medium outline-none focus:ring-2 focus:ring-ring",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: "",
							children: [
								t("region"),
								": ",
								t("all")
							]
						}), regions.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: r.id,
							children: L(r.name)
						}, r.id))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: search.province ?? "",
						onChange: (e) => setParam({ province: e.target.value || void 0 }),
						className: "h-9 rounded-full border border-border bg-card px-3 text-xs font-medium outline-none focus:ring-2 focus:ring-ring",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: "",
							children: [
								t("province"),
								": ",
								t("all")
							]
						}), allProvinces().map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: p,
							children: p
						}, p))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: search.civ ?? "",
						onChange: (e) => setParam({ civ: e.target.value || void 0 }),
						className: "h-9 rounded-full border border-border bg-card px-3 text-xs font-medium outline-none focus:ring-2 focus:ring-ring",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: "",
							children: [
								t("civilization"),
								": ",
								t("all")
							]
						}), allCivilizations().map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: c,
							children: c
						}, c))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setParam({ unesco: search.unesco ? void 0 : true }),
						className: `h-9 rounded-full border px-3 text-xs font-semibold ${search.unesco ? "border-gold bg-gold text-gold-foreground" : "border-border bg-card text-muted-foreground"}`,
						children: "UNESCO"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setParam({ free: search.free ? void 0 : true }),
						className: `h-9 rounded-full border px-3 text-xs font-semibold ${search.free ? "border-accent bg-accent text-accent-foreground" : "border-border bg-card text-muted-foreground"}`,
						children: t("free")
					}),
					hasFilters && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => navigate({ search: {} }),
						className: "flex h-9 items-center gap-1 rounded-full px-3 text-xs font-semibold text-destructive",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" }),
							" ",
							t("clear_filters")
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "ml-auto text-xs text-muted-foreground",
						children: [
							filtered.length,
							" ",
							t("results")
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: isMap ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteMap, {
					sites: filtered,
					height: "72vh"
				}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-2xl surface-panel p-10 text-center text-sm text-muted-foreground",
					children: t("no_results")
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
					children: filtered.map((site) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteCard, { site }, site.slug))
				})
			})
		]
	});
}
//#endregion
export { ExplorePage as component };
