import { d as sites, i as distanceKm } from "./sites-qcnwZ4V_.mjs";
import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./createServerFn-CIHAFgYl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routing-B7uHtJ9i.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
async function fetchDrivingMatrix(points) {
	const url = `https://router.project-osrm.org/table/v1/driving/${points.map((p) => `${p.lng},${p.lat}`).join(";")}?annotations=distance,duration`;
	const res = await fetch(url, {
		headers: { accept: "application/json" },
		signal: AbortSignal.timeout(2e4)
	});
	if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`);
	const json = await res.json();
	if (json.code !== "Ok" || !json.distances || !json.durations) throw new Error("OSRM table failed");
	const n = json.distances.length;
	return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => ({
		km: Math.max(0, (json.distances[i]?.[j] ?? 0) / 1e3),
		min: Math.round((json.durations[i]?.[j] ?? 0) / 60)
	})));
}
function haversineMatrix(points) {
	const n = points.length;
	return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => {
		const a = points[i];
		const b = points[j];
		return {
			km: distanceKm(a.lat, a.lng, b.lat, b.lng),
			min: 0
		};
	}));
}
var buildRouteServerFn_createServerFn_handler = createServerRpc({
	id: "aed901e11765acbd512d19a9ec63110893c69fcbb36fc4988e28a89b38e349ce",
	name: "buildRouteServerFn",
	filename: "src/lib/routing.ts"
}, (opts) => buildRouteServerFn.__executeServer(opts));
var buildRouteServerFn = createServerFn({ method: "GET" }).validator((input) => input).handler(buildRouteServerFn_createServerFn_handler, async ({ data }) => {
	const { startSlug, days } = data;
	const start = sites.find((s) => s.slug === startSlug) ?? sites[0];
	const pool = [...sites.filter((s) => s.slug !== start.slug)];
	const points = [{
		lat: start.lat,
		lng: start.lng
	}, ...pool.map((s) => ({
		lat: s.lat,
		lng: s.lng
	}))];
	let matrix = null;
	try {
		matrix = await fetchDrivingMatrix(points);
	} catch {
		matrix = haversineMatrix(points);
	}
	const legKm = (i, j) => matrix?.[i]?.[j]?.km ?? 0;
	const maxSites = days * 3;
	const orderIdx = [0];
	const used = /* @__PURE__ */ new Set([0]);
	let current = 0;
	while (orderIdx.length < maxSites && used.size < points.length) {
		let best = -1;
		let bestKm = Infinity;
		for (let i = 0; i < points.length; i++) {
			if (used.has(i)) continue;
			const d = legKm(current, i);
			if (d > 0 && d < bestKm) {
				bestKm = d;
				best = i;
			}
		}
		if (best === -1) break;
		used.add(best);
		orderIdx.push(best);
		current = best;
	}
	const all = [start, ...pool];
	const slugs = orderIdx.map((i) => all[i].slug);
	const legs = [];
	for (let k = 1; k < orderIdx.length; k++) {
		const from = orderIdx[k - 1];
		const to = orderIdx[k];
		const cell = matrix?.[from]?.[to] ?? {
			km: legKm(from, to),
			min: 0
		};
		legs.push({
			km: Math.round(cell.km),
			min: cell.min > 0 ? cell.min : Math.max(1, Math.round(cell.km))
		});
	}
	return {
		usingDriving: matrix !== null,
		slugs,
		legs,
		totalKm: legs.reduce((a, l) => a + l.km, 0),
		totalMin: legs.reduce((a, l) => a + l.min, 0)
	};
});
//#endregion
export { buildRouteServerFn_createServerFn_handler };
