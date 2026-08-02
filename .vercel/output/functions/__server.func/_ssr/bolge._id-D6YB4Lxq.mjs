import { l as regions } from "./sites-qcnwZ4V_.mjs";
import { M as notFound, f as lazyRouteComponent, p as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bolge._id-D6YB4Lxq.js
var $$splitComponentImporter = () => import("./bolge._id-M2FtGaCG.mjs");
var Route = createFileRoute("/bolge/$id")({
	loader: ({ params }) => {
		const region = regions.find((r) => r.id === params.id);
		if (!region) throw notFound();
		return {
			name: region.name.tr,
			blurb: region.blurb.tr
		};
	},
	head: ({ loaderData }) => {
		if (!loaderData) return { meta: [{ title: "Bölge bulunamadı" }, {
			name: "robots",
			content: "noindex"
		}] };
		const title = `${loaderData.name} Bölgesi Antik Kentleri | Antik Türkiye`;
		return { meta: [
			{ title },
			{
				name: "description",
				content: loaderData.blurb
			},
			{
				property: "og:title",
				content: title
			},
			{
				property: "og:description",
				content: loaderData.blurb
			}
		] };
	},
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
