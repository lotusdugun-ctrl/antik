import { c as regionCoverImage, d as sites, l as regions } from "./sites-qcnwZ4V_.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as useI18n } from "./i18n-DFOAhYEi.mjs";
import { r as useProgress } from "./progress-DJjpoble.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bolgeler-DhaCnI1V.js
var import_jsx_runtime = require_jsx_runtime();
function RegionsPage() {
	const { t, L } = useI18n();
	const { regionProgress } = useProgress();
	const progress = regionProgress();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-4 py-8 sm:px-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "mb-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-semibold sm:text-4xl",
				children: t("regions_title")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: t("region_sub")
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
			children: regions.map((region) => {
				const p = progress.find((x) => x.region === region.id);
				const total = sites.filter((s) => s.region === region.id).length;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/bolge/$id",
					params: { id: region.id },
					className: "group overflow-hidden rounded-2xl surface-panel lift",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative aspect-[16/9] overflow-hidden",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: regionCoverImage(region.id),
								alt: L(region.name),
								loading: "lazy",
								width: 1200,
								height: 800,
								className: "h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 hero-scrim" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "absolute bottom-3 left-4 font-display text-xl font-semibold text-white",
								children: L(region.name)
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: L(region.blurb)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex items-center justify-between text-xs font-medium",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									total,
									" ",
									t("cities")
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-primary",
									children: [
										p?.visited ?? 0,
										"/",
										total,
										" · %",
										p?.percent ?? 0,
										" ",
										t("completion")
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-full rounded-full bg-primary transition-all",
									style: { width: `${p?.percent ?? 0}%` }
								})
							})
						]
					})]
				}, region.id);
			})
		})]
	});
}
//#endregion
export { RegionsPage as component };
