import { r as coverImage } from "./sites-qcnwZ4V_.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as useI18n } from "./i18n-DFOAhYEi.mjs";
import { r as useProgress } from "./progress-DJjpoble.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as Heart, c as Sparkles, g as MapPin, k as Check } from "../_libs/lucide-react.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/SiteCard-Bt0I76Dx.js
var import_jsx_runtime = require_jsx_runtime();
function SiteCard({ site, distance, className }) {
	const { t, L } = useI18n();
	const { isVisited, isFavorite, toggleFavorite } = useProgress();
	const visited = isVisited(site.slug);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: cn("group relative overflow-hidden rounded-2xl surface-panel lift", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/kent/$slug",
			params: { slug: site.slug },
			className: "block",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative aspect-[4/3] overflow-hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: coverImage(site),
						alt: L(site.name),
						loading: "lazy",
						width: 1200,
						height: 800,
						className: "h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 hero-scrim" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute left-3 top-3 flex flex-wrap gap-1.5",
						children: [site.unesco === "listed" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold-foreground",
							children: t("unesco")
						}), site.fee === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-foreground",
							children: t("free")
						})]
					}),
					visited && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-success text-success-foreground shadow-md",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute inset-x-0 bottom-0 p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-lg font-semibold leading-tight text-white",
							children: L(site.name)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-0.5 flex items-center gap-1 text-xs text-white/80",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3 w-3" }),
								L(site.province),
								typeof distance === "number" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"· ",
									distance,
									" km"
								] })
							]
						})]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "line-clamp-2 text-sm text-muted-foreground",
					children: L(site.summary)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 flex items-center gap-1.5 text-xs font-medium text-primary",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5" }), site.civilizations.slice(0, 3).join(" · ")]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			onClick: () => toggleFavorite(site.slug),
			"aria-label": isFavorite(site.slug) ? t("favorited") : t("favorite"),
			className: "absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full border border-border bg-card/90 backdrop-blur transition-transform hover:scale-110",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("h-4 w-4", isFavorite(site.slug) ? "fill-destructive text-destructive" : "text-muted-foreground") })
		})]
	});
}
//#endregion
export { SiteCard as t };
