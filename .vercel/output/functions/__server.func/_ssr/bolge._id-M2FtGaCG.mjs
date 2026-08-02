import { n as __toESM } from "../_runtime.mjs";
import { f as sitesByRegion, l as regions } from "./sites-qcnwZ4V_.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as useI18n } from "./i18n-DFOAhYEi.mjs";
import { r as useProgress } from "./progress-DJjpoble.mjs";
import { h as Map, y as LayoutGrid } from "../_libs/lucide-react.mjs";
import { t as Route } from "./bolge._id-D6YB4Lxq.mjs";
import { t as SiteCard } from "./SiteCard-Bt0I76Dx.mjs";
import { t as SiteMap } from "./SiteMap-CMZrod5j.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bolge._id-M2FtGaCG.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RegionDetail() {
	const { id } = Route.useParams();
	const { t, L } = useI18n();
	const { regionProgress } = useProgress();
	const [view, setView] = (0, import_react.useState)("list");
	const region = regions.find((r) => r.id === id);
	const list = sitesByRegion(id);
	const p = regionProgress().find((x) => x.region === id);
	const center = [list.reduce((sum, s) => sum + s.lat, 0) / (list.length || 1), list.reduce((sum, s) => sum + s.lng, 0) / (list.length || 1)];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-4 py-8 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-3xl font-semibold sm:text-4xl",
						children: L(region.name)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: L(region.blurb)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 items-center rounded-full border border-border bg-card p-0.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setView("list"),
						className: `flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, { className: "h-3.5 w-3.5" }),
							" ",
							t("list_view")
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setView("map"),
						className: `flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${view === "map" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map, { className: "h-3.5 w-3.5" }),
							" ",
							t("map_view")
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 rounded-2xl surface-panel p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between text-sm font-medium",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("progress") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-primary",
						children: [
							p?.visited ?? 0,
							"/",
							list.length,
							" · %",
							p?.percent ?? 0,
							" ",
							t("completion")
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-full rounded-full bg-primary transition-all",
						style: { width: `${p?.percent ?? 0}%` }
					})
				})]
			}),
			view === "map" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteMap, {
				sites: list,
				center,
				zoom: 7,
				height: "70vh"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
				children: list.map((site) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteCard, { site }, site.slug))
			})
		]
	});
}
//#endregion
export { RegionDetail as component };
