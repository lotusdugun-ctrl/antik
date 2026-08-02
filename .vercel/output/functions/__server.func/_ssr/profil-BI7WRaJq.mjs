import { l as regions, o as getSite, p as totalSites, r as coverImage } from "./sites-qcnwZ4V_.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as useI18n } from "./i18n-DFOAhYEi.mjs";
import { n as levelFromXp, r as useProgress } from "./progress-DJjpoble.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { I as BookOpen, L as Award, _ as Lock, a as Trash2, f as RotateCcw, g as MapPin, i as Trophy } from "../_libs/lucide-react.mjs";
import { t as SiteCard } from "./SiteCard-Bt0I76Dx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profil-BI7WRaJq.js
var import_jsx_runtime = require_jsx_runtime();
function ProfilePage() {
	const { t, L } = useI18n();
	const { state, badges, regionProgress, reset, visitEntries, removeVisit } = useProgress();
	const lvl = levelFromXp(state.xp);
	const visitedSites = state.visited.map(getSite).filter(Boolean);
	const favoriteSites = state.favorites.map(getSite).filter(Boolean);
	const entries = visitEntries();
	const percent = Math.round(state.visited.length / totalSites * 100);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl px-4 py-8 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "truncate font-display text-3xl font-semibold sm:text-4xl",
						children: t("nav_profile")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: t("profile_sub")
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: reset,
					className: "flex shrink-0 items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-destructive",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-3.5 w-3.5" }),
						" ",
						t("reset_progress")
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					{
						label: t("total_visited"),
						value: state.visited.length
					},
					{
						label: t("remaining"),
						value: totalSites - state.visited.length
					},
					{
						label: `%${percent} ${t("completion")}`,
						value: `${state.visited.length}/${totalSites}`
					},
					{
						label: `${t("level")} ${lvl.level}`,
						value: `${state.xp} XP`
					}
				].map((stat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl surface-panel p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-3xl font-semibold",
						children: stat.value
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground",
						children: stat.label
					})]
				}, stat.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 font-display text-xl font-semibold",
					children: t("progress")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-3 rounded-2xl surface-panel p-5",
					children: regionProgress().map((rp) => {
						const region = regions.find((r) => r.id === rp.region);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between text-sm font-medium",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: L(region.name) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted-foreground",
								children: [
									rp.visited,
									"/",
									rp.total,
									" · %",
									rp.percent
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-full rounded-full bg-primary transition-all",
								style: { width: `${rp.percent}%` }
							})
						})] }, rp.region);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "mb-3 flex items-center gap-2 font-display text-xl font-semibold",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "h-5 w-5 text-gold" }),
						" ",
						t("badges")
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
					children: badges().map((badge) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `flex items-start gap-3 rounded-2xl border p-4 ${badge.earned ? "border-gold bg-secondary" : "border-border opacity-60"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `grid h-10 w-10 shrink-0 place-items-center rounded-xl ${badge.earned ? "bg-gold text-gold-foreground" : "bg-muted text-muted-foreground"}`,
							children: badge.earned ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Award, { className: "h-5 w-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-4 w-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-semibold",
								children: L(badge.name)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: L(badge.description)
							})]
						})]
					}, badge.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "mb-3 flex items-center gap-2 font-display text-xl font-semibold",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "h-5 w-5 text-primary" }),
						" ",
						t("visit_log")
					]
				}), entries.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-2xl surface-panel p-8 text-center text-sm text-muted-foreground",
					children: t("visit_log_empty")
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-3",
					children: entries.map((entry) => {
						const site = getSite(entry.slug);
						if (!site) return null;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-4 rounded-2xl surface-panel p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/kent/$slug",
									params: { slug: site.slug },
									className: "shrink-0",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: entry.photo ?? coverImage(site),
										alt: L(site.name),
										width: 1200,
										height: 800,
										className: "h-20 w-28 rounded-xl object-cover"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/kent/$slug",
											params: { slug: site.slug },
											className: "block truncate font-display text-lg font-semibold hover:underline",
											children: L(site.name)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-0.5 flex items-center gap-1 text-xs text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3 w-3" }), entry.date ? new Date(entry.date).toLocaleDateString() : t("visit_no_date")]
										}),
										entry.note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground",
											children: entry.note
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => removeVisit(entry.slug),
									"aria-label": t("visit_delete"),
									className: "grid h-9 w-9 shrink-0 place-items-center self-center rounded-full border border-border text-muted-foreground transition-colors hover:text-destructive",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
								})
							]
						}, entry.slug);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 font-display text-xl font-semibold",
					children: t("total_visited")
				}), visitedSites.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-2xl surface-panel p-8 text-center text-sm text-muted-foreground",
					children: t("empty_visits")
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
					children: visitedSites.map((site) => site ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteCard, { site }, site.slug) : null)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 font-display text-xl font-semibold",
					children: t("favorites")
				}), favoriteSites.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-2xl surface-panel p-8 text-center text-sm text-muted-foreground",
					children: t("empty_favorites")
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
					children: favoriteSites.map((site) => site ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteCard, { site }, site.slug) : null)
				})]
			})
		]
	});
}
//#endregion
export { ProfilePage as component };
