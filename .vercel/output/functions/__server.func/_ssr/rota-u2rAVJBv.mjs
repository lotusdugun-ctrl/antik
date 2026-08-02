import { f as lazyRouteComponent, p as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rota-u2rAVJBv.js
var $$splitComponentImporter = () => import("./rota-DxEKFVtI.mjs");
var Route = createFileRoute("/rota")({
	validateSearch: (search) => ({ start: typeof search["start"] === "string" ? search["start"] : void 0 }),
	head: () => ({ meta: [
		{ title: "Rota Oluşturucu — Antik Kent Güzergâhı | Antik Türkiye" },
		{
			name: "description",
			content: "Başlangıç kentini seç, gezi süreni belirle; gerçek araç mesafeleriyle en yakın antik kentlerden güzergâhını oluştur."
		},
		{
			property: "og:title",
			content: "Rota Oluşturucu"
		},
		{
			property: "og:description",
			content: "Gerçek araç mesafeleri ve süreleriyle gün gün gezi rotası oluştur."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
