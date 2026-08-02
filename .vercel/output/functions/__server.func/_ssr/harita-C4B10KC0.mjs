import { d as sites } from "./sites-qcnwZ4V_.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as useI18n } from "./i18n-DFOAhYEi.mjs";
import { r as useProgress } from "./progress-DJjpoble.mjs";
import { t as SiteMap } from "./SiteMap-CMZrod5j.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/harita-C4B10KC0.js
var import_jsx_runtime = require_jsx_runtime();
function MapPage() {
	const { t } = useI18n();
	const { state } = useProgress();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-4 py-8 sm:px-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-semibold sm:text-4xl",
					children: t("nav_map")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: [
						sites.length,
						" ",
						t("cities"),
						" · ",
						state.visited.length,
						" ",
						t("visited_done").toLowerCase()
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 items-center gap-3 text-xs text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-3 w-3 rounded-full bg-primary" }),
						" ",
						t("nav_explore")
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-3 w-3 rounded-full bg-success" }),
						" ",
						t("visited_done")
					]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteMap, {
			sites,
			height: "76vh"
		})]
	});
}
//#endregion
export { MapPage as component };
