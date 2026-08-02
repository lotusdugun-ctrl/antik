import { f as lazyRouteComponent, p as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/kentler-DD71hRNt.js
var $$splitComponentImporter = () => import("./kentler-DEjTnNmx.mjs");
var Route = createFileRoute("/kentler")({
	validateSearch: (search) => ({
		q: typeof search["q"] === "string" && search["q"] ? search["q"] : void 0,
		region: typeof search["region"] === "string" ? search["region"] : void 0,
		province: typeof search["province"] === "string" ? search["province"] : void 0,
		civ: typeof search["civ"] === "string" ? search["civ"] : void 0,
		unesco: search["unesco"] === true || search["unesco"] === "true" ? true : void 0,
		free: search["free"] === true || search["free"] === "true" ? true : void 0,
		view: search["view"] === "map" ? "map" : void 0
	}),
	head: () => ({ meta: [
		{ title: "Antik Kentler — Filtrele ve Keşfet | Antik Türkiye" },
		{
			name: "description",
			content: "Bölge, il, uygarlık ve UNESCO durumuna göre Türkiye'deki antik kentleri filtrele; liste veya harita görünümünde keşfet."
		},
		{
			property: "og:title",
			content: "Antik Kentler — Filtrele ve Keşfet"
		},
		{
			property: "og:description",
			content: "Türkiye'nin antik kentlerini bölge, il, uygarlık ve UNESCO filtreleriyle bul."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
