import { n as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/SiteMap-CMZrod5j.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SiteMapInner = (0, import_react.lazy)(() => import("./SiteMapInner-DJXoI4Ym.mjs"));
function MapSkeleton({ height }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "animate-pulse rounded-2xl border border-border bg-muted",
		style: { height },
		"aria-hidden": true
	});
}
function SiteMap({ height = "70vh", ...props }) {
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setMounted(true), []);
	if (!mounted) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapSkeleton, { height });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapSkeleton, { height }),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteMapInner, {
			height,
			...props
		})
	});
}
//#endregion
export { SiteMap as t };
