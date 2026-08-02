import { o as getSite, r as coverImage } from "./sites-qcnwZ4V_.mjs";
import { M as notFound, f as lazyRouteComponent, p as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/kent._slug-tqJIvhMM.js
var $$splitComponentImporter = () => import("./kent._slug-BEMhI0Rl.mjs");
var Route = createFileRoute("/kent/$slug")({
	loader: ({ params }) => {
		const site = getSite(params.slug);
		if (!site) throw notFound();
		return {
			slug: site.slug,
			title: site.name.tr,
			description: site.summary.tr,
			image: coverImage(site)
		};
	},
	head: ({ loaderData }) => {
		if (!loaderData) return { meta: [{ title: "Antik kent bulunamadı" }, {
			name: "robots",
			content: "noindex"
		}] };
		const title = `${loaderData.title} Antik Kenti — Tarihçe, Ziyaret Bilgileri`;
		return { meta: [
			{ title },
			{
				name: "description",
				content: loaderData.description
			},
			{
				property: "og:title",
				content: title
			},
			{
				property: "og:description",
				content: loaderData.description
			},
			{
				property: "og:image",
				content: loaderData.image
			},
			{
				property: "og:image:alt",
				content: loaderData.title
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:image",
				content: loaderData.image
			}
		] };
	},
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
