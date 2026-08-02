import { n as __toESM } from "../_runtime.mjs";
import { r as coverImage } from "./sites-qcnwZ4V_.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as useI18n } from "./i18n-DFOAhYEi.mjs";
import { r as useProgress } from "./progress-DJjpoble.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as require_leaflet_src } from "../_libs/leaflet.mjs";
import { a as MapContainer, i as Marker, n as Popup, o as useMap, r as Polyline, t as TileLayer } from "../_libs/react-leaflet.mjs";
import { T as ExternalLink, k as Check } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/SiteMapInner-DJXoI4Ym.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_leaflet_src = /* @__PURE__ */ __toESM(require_leaflet_src());
function pinIcon(visited) {
	return import_leaflet_src.default.divIcon({
		className: "",
		html: `<span style="
      display:grid;place-items:center;width:26px;height:26px;border-radius:50% 50% 50% 8px;
      transform:rotate(-45deg);
      background:${visited ? "oklch(0.56 0.1 155)" : "oklch(0.52 0.13 45)"};
      border:2px solid rgba(255,255,255,0.9);
      box-shadow:0 4px 10px rgba(0,0,0,0.3);
    "><span style="width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,0.95)"></span></span>`,
		iconSize: [26, 26],
		iconAnchor: [13, 26],
		popupAnchor: [0, -24]
	});
}
function Recenter({ center, zoom }) {
	const map = useMap();
	(0, import_react.useEffect)(() => {
		map.flyTo(center, zoom, { duration: .8 });
	}, [
		center[0],
		center[1],
		zoom
	]);
	return null;
}
function SiteMapInner({ sites, center = [39.2, 33.5], zoom = 6, height = "70vh", path }) {
	const { t, L: tr } = useI18n();
	const { isVisited, toggleVisited } = useProgress();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-hidden rounded-2xl border border-border",
		style: { height },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MapContainer, {
			center,
			zoom,
			scrollWheelZoom: true,
			style: {
				height: "100%",
				width: "100%"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TileLayer, {
					attribution: "© <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a>",
					url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Recenter, {
					center,
					zoom
				}),
				path && path.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Polyline, {
					positions: path,
					pathOptions: {
						color: "oklch(0.52 0.13 45)",
						weight: 4,
						opacity: .85
					}
				}),
				sites.map((site) => {
					const visited = isVisited(site.slug);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Marker, {
						position: [site.lat, site.lng],
						icon: pinIcon(visited),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Popup, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "overflow-hidden rounded-[var(--radius)]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: coverImage(site),
								alt: tr(site.name),
								loading: "lazy",
								width: 1200,
								height: 800,
								className: "h-28 w-full object-cover"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2 p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
										className: "font-display text-base font-semibold leading-tight",
										children: tr(site.name)
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground",
										children: [
											tr(site.province),
											" · ",
											site.civilizations[0]
										]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "line-clamp-3 text-xs leading-relaxed text-muted-foreground",
										children: tr(site.summary)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-2 pt-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: () => toggleVisited(site.slug),
											className: visited ? "flex flex-1 items-center justify-center gap-1 rounded-lg bg-success px-2 py-1.5 text-xs font-semibold text-success-foreground" : "flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary px-2 py-1.5 text-xs font-semibold text-primary-foreground",
											children: [visited && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3 w-3" }), visited ? t("visited_done") : t("visited")]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: "/kent/$slug",
											params: { slug: site.slug },
											className: "flex flex-1 items-center justify-center gap-1 rounded-lg border border-border px-2 py-1.5 text-xs font-semibold text-foreground",
											children: [t("detail_page"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3 w-3" })]
										})]
									})
								]
							})]
						}) })
					}, site.slug);
				})
			]
		})
	});
}
//#endregion
export { SiteMapInner as default };
