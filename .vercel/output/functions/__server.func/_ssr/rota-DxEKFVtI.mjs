import { n as __toESM } from "../_runtime.mjs";
import { d as sites, o as getSite } from "./sites-qcnwZ4V_.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as useI18n } from "./i18n-DFOAhYEi.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as Car, N as CalendarDays, O as Clock, R as ArrowRight, d as Route, g as MapPin } from "../_libs/lucide-react.mjs";
import { t as SiteMap } from "./SiteMap-CMZrod5j.mjs";
import { t as getServerFnById } from "../__23tanstack-start-server-fn-resolver-C70fYAoq.mjs";
import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./createServerFn-CIHAFgYl.mjs";
import { t as Route$1 } from "./rota-u2rAVJBv.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rota-DxEKFVtI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var buildRouteServerFn = createServerFn({ method: "GET" }).validator((input) => input).handler(createSsrRpc("aed901e11765acbd512d19a9ec63110893c69fcbb36fc4988e28a89b38e349ce"));
function RouteBuilderPage() {
	const { t, L } = useI18n();
	const search = Route$1.useSearch();
	const [startSlug, setStartSlug] = (0, import_react.useState)(sites.some((s) => s.slug === search.start) ? search.start : sites[0].slug);
	const [days, setDays] = (0, import_react.useState)(1);
	const { data, isLoading, isFetching, isError } = useQuery({
		queryKey: [
			"route",
			startSlug,
			days
		],
		queryFn: () => buildRouteServerFn({ data: {
			startSlug,
			days
		} }),
		staleTime: 600 * 1e3
	});
	const ordered = (0, import_react.useMemo)(() => data ? data.slugs.map(getSite).filter((s) => Boolean(s)) : [], [data]);
	const center = ordered.length > 0 ? [ordered.reduce((sum, s) => sum + s.lat, 0) / ordered.length, ordered.reduce((sum, s) => sum + s.lng, 0) / ordered.length] : [39.2, 33.5];
	const daysArr = (0, import_react.useMemo)(() => {
		if (ordered.length === 0) return [];
		const PER_DAY = 3;
		const arr = [];
		for (let i = 0; i < ordered.length; i += PER_DAY) arr.push(ordered.slice(i, i + PER_DAY));
		return arr;
	}, [ordered]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-4 py-8 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "flex items-center gap-2 font-display text-3xl font-semibold sm:text-4xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, { className: "h-8 w-8 text-primary" }),
						" ",
						t("route_title")
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: t("route_sub")
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 grid gap-3 rounded-2xl surface-panel p-4 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] sm:items-end",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
							children: t("route_start")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: startSlug,
							onChange: (e) => setStartSlug(e.target.value),
							className: "h-10 w-full rounded-xl border border-border bg-card px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-ring",
							children: sites.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: s.slug,
								children: [
									L(s.name),
									" — ",
									L(s.province)
								]
							}, s.slug))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
							children: t("route_days")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center rounded-xl border border-border bg-card p-0.5",
							children: [
								1,
								2,
								3
							].map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setDays(d),
								className: `flex items-center gap-1 rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${days === d ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "h-3.5 w-3.5" }),
									" ",
									d
								]
							}, d))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-end gap-3 sm:flex-col sm:gap-1 sm:text-right",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
							children: t("route_total")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-xl font-semibold text-primary",
							children: isLoading ? "…" : `${data?.totalKm ?? 0} ${t("route_km")}`
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-end gap-3 sm:flex-col sm:gap-1 sm:text-right",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
							children: t("route_est_time")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-xl font-semibold text-primary",
							children: isLoading ? "…" : `${data?.totalMin ?? 0} ${t("route_min")}`
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mb-5 flex items-center gap-1.5 text-xs text-muted-foreground",
				children: [data?.usingDriving && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Car, { className: "h-3.5 w-3.5" }), t("route_auto_note")]
			}),
			isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-56 animate-pulse rounded-2xl surface-panel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-[50vh] animate-pulse rounded-2xl surface-panel" })]
			}),
			isError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-2xl surface-panel p-10 text-center text-sm text-muted-foreground",
				children: t("no_results")
			}),
			!isLoading && !isError && ordered.length > 0 && data && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-4",
					children: daysArr.map((day, di) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-2xl surface-panel p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "mb-3 flex items-center gap-2 font-display text-lg font-semibold",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground",
									children: di + 1
								}),
								t("route_day"),
								" ",
								di + 1
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "space-y-2",
							children: day.map((site, si) => {
								const globalIdx = di * 3 + si;
								const isLast = globalIdx === ordered.length - 1;
								const leg = data.legs[globalIdx];
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/kent/$slug",
									params: { slug: site.slug },
									className: "group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground",
											children: globalIdx + 1
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "min-w-0 flex-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "block truncate font-semibold",
												children: L(site.name)
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "flex items-center gap-1 text-xs text-muted-foreground",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3 w-3" }),
													" ",
													L(site.province)
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" })
									]
								}), !isLast && leg && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "ml-11 mt-1 flex items-center gap-2 text-[11px] text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										globalIdx === 0 ? t("route_from_start") : t("route_to_next"),
										":",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-semibold text-primary",
											children: [
												leg.km,
												" ",
												t("route_km")
											]
										})
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3 w-3" }),
											" ~",
											leg.min,
											" ",
											t("route_min")
										]
									})]
								})] }, site.slug);
							})
						})]
					}, di))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "lg:sticky lg:top-20 lg:self-start",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteMap, {
						sites: ordered,
						center,
						zoom: 6,
						height: "62vh",
						path: ordered.map((s) => [s.lat, s.lng])
					})
				})]
			})
		]
	});
}
//#endregion
export { RouteBuilderPage as component };
