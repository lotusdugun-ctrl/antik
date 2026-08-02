import { n as __toESM } from "../_runtime.mjs";
import { d as sites, p as totalSites } from "./sites-qcnwZ4V_.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/progress-DJjpoble.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KEY = "antik-tr-progress";
var empty = {
	visited: [],
	favorites: [],
	recent: [],
	xp: 0,
	gamesPlayed: 0,
	correctAnswers: 0,
	visits: {}
};
function levelFromXp(xp) {
	const level = Math.floor(Math.sqrt(xp / 100)) + 1;
	const currentFloor = (level - 1) ** 2 * 100;
	const nextFloor = level ** 2 * 100;
	return {
		level,
		currentFloor,
		nextFloor,
		progress: Math.min(100, Math.round((xp - currentFloor) / (nextFloor - currentFloor) * 100)),
		toNext: Math.max(0, nextFloor - xp)
	};
}
var ProgressCtx = (0, import_react.createContext)(null);
function ProgressProvider({ children }) {
	const [state, setState] = (0, import_react.useState)(empty);
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		try {
			const raw = window.localStorage.getItem(KEY);
			if (raw) setState({
				...empty,
				...JSON.parse(raw)
			});
		} catch {}
		setReady(true);
	}, []);
	const persist = (0, import_react.useCallback)((next) => {
		setState(next);
		try {
			window.localStorage.setItem(KEY, JSON.stringify(next));
		} catch {}
	}, []);
	const value = (0, import_react.useMemo)(() => {
		const isVisited = (slug) => state.visited.includes(slug);
		const isFavorite = (slug) => state.favorites.includes(slug);
		return {
			state,
			ready,
			isVisited,
			isFavorite,
			toggleVisited: (slug) => {
				const on = !isVisited(slug);
				const visits = { ...state.visits };
				if (on) visits[slug] = visits[slug] ?? {
					slug,
					date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
				};
				else delete visits[slug];
				persist({
					...state,
					visited: on ? [...state.visited, slug] : state.visited.filter((x) => x !== slug),
					xp: Math.max(0, state.xp + (on ? 50 : -50)),
					visits
				});
				return on;
			},
			toggleFavorite: (slug) => persist({
				...state,
				favorites: isFavorite(slug) ? state.favorites.filter((x) => x !== slug) : [...state.favorites, slug]
			}),
			pushRecent: (slug) => {
				if (state.recent[0] === slug) return;
				persist({
					...state,
					recent: [slug, ...state.recent.filter((x) => x !== slug)].slice(0, 8)
				});
			},
			addGameResult: (correct) => persist({
				...state,
				gamesPlayed: state.gamesPlayed + 1,
				correctAnswers: state.correctAnswers + (correct ? 1 : 0),
				xp: state.xp + (correct ? 10 : 0)
			}),
			getVisit: (slug) => state.visits[slug],
			saveVisit: (slug, entry) => {
				const prev = state.visits[slug] ?? {
					slug,
					date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
				};
				persist({
					...state,
					visits: {
						...state.visits,
						[slug]: {
							...prev,
							...entry,
							slug
						}
					}
				});
			},
			removeVisit: (slug) => {
				const visits = { ...state.visits };
				delete visits[slug];
				persist({
					...state,
					visits
				});
			},
			visitEntries: () => Object.values(state.visits).filter((v) => v.slug).sort((a, b) => (b.date || "").localeCompare(a.date || "")),
			reset: () => persist(empty),
			regionProgress: () => {
				const map = /* @__PURE__ */ new Map();
				for (const site of sites) {
					const entry = map.get(site.region) ?? {
						visited: 0,
						total: 0
					};
					entry.total += 1;
					if (isVisited(site.slug)) entry.visited += 1;
					map.set(site.region, entry);
				}
				return Array.from(map.entries()).map(([region, v]) => ({
					region,
					visited: v.visited,
					total: v.total,
					percent: Math.round(v.visited / v.total * 100)
				}));
			},
			badges: () => {
				const v = state.visited.length;
				const unescoVisited = sites.filter((x) => x.unesco === "listed" && state.visited.includes(x.slug)).length;
				const regionsCovered = new Set(sites.filter((x) => state.visited.includes(x.slug)).map((x) => x.region)).size;
				return [
					{
						id: "first-step",
						icon: "footprints",
						name: {
							tr: "İlk Adım",
							en: "First Step"
						},
						description: {
							tr: "İlk antik kentini ziyaret et",
							en: "Visit your first ancient city"
						},
						earned: v >= 1
					},
					{
						id: "explorer",
						icon: "compass",
						name: {
							tr: "Kâşif",
							en: "Explorer"
						},
						description: {
							tr: "5 antik kent ziyaret et",
							en: "Visit 5 ancient cities"
						},
						earned: v >= 5
					},
					{
						id: "archaeologist",
						icon: "shovel",
						name: {
							tr: "Arkeolog",
							en: "Archaeologist"
						},
						description: {
							tr: "15 antik kent ziyaret et",
							en: "Visit 15 ancient cities"
						},
						earned: v >= 15
					},
					{
						id: "unesco",
						icon: "landmark",
						name: {
							tr: "Miras Avcısı",
							en: "Heritage Hunter"
						},
						description: {
							tr: "3 UNESCO Dünya Mirası alanı gez",
							en: "Visit 3 UNESCO World Heritage sites"
						},
						earned: unescoVisited >= 3
					},
					{
						id: "regions",
						icon: "map",
						name: {
							tr: "Yedi Bölge",
							en: "Seven Regions"
						},
						description: {
							tr: "4 farklı bölgede kent gez",
							en: "Visit cities in 4 regions"
						},
						earned: regionsCovered >= 4
					},
					{
						id: "scholar",
						icon: "graduation-cap",
						name: {
							tr: "Bilge",
							en: "Scholar"
						},
						description: {
							tr: "Oyunlarda 25 doğru cevap",
							en: "Answer 25 quiz questions correctly"
						},
						earned: state.correctAnswers >= 25
					},
					{
						id: "completionist",
						icon: "trophy",
						name: {
							tr: "Tamamlayıcı",
							en: "Completionist"
						},
						description: {
							tr: "Tüm antik kentleri gez",
							en: "Visit every ancient city"
						},
						earned: v >= totalSites
					}
				];
			}
		};
	}, [
		state,
		ready,
		persist
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressCtx.Provider, {
		value,
		children
	});
}
function useProgress() {
	const ctx = (0, import_react.useContext)(ProgressCtx);
	if (!ctx) throw new Error("useProgress must be used inside ProgressProvider");
	return ctx;
}
//#endregion
export { levelFromXp as n, useProgress as r, ProgressProvider as t };
