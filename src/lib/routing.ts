import { createServerFn } from "@tanstack/react-start";
import { distanceKm, sites } from "@/lib/sites";

type Cell = { km: number; min: number };

const PER_DAY = 3;

/**
 * How many candidate sites go into the driving matrix. A trip is at most
 * `days * PER_DAY` stops, but the nearest-neighbour walk needs alternatives to
 * choose from at every step, so we hand it a few times that many. Keeping the
 * number small matters: OSRM bills a table request as width x height, and the
 * public demo server is a shared courtesy service, not infrastructure we own.
 */
const CANDIDATE_MULTIPLIER = 3;
const MIN_CANDIDATES = 12;

async function fetchDrivingMatrix(points: { lat: number; lng: number }[]) {
  const coords = points.map((p) => `${p.lng},${p.lat}`).join(";");
  const url = `https://router.project-osrm.org/table/v1/driving/${coords}?annotations=distance,duration`;
  const res = await fetch(url, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`);
  const json = (await res.json()) as {
    code?: string;
    distances?: number[][];
    durations?: number[][];
  };
  if (json.code !== "Ok" || !json.distances || !json.durations)
    throw new Error("OSRM table failed");
  const n = json.distances.length;
  const cells: Cell[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => ({
      km: Math.max(0, (json.distances![i]?.[j] ?? 0) / 1000),
      min: Math.round((json.durations![i]?.[j] ?? 0) / 60),
    })),
  );
  return cells;
}

/**
 * Straight-line stand-in for when OSRM is unreachable. The kilometres are
 * honest; the durations are left at 0 so the caller can tell this apart from
 * real driving data instead of presenting a guess as a measurement.
 */
function haversineMatrix(points: { lat: number; lng: number }[]) {
  const n = points.length;
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => {
      const a = points[i]!;
      const b = points[j]!;
      return { km: distanceKm(a.lat, a.lng, b.lat, b.lng), min: 0 };
    }),
  );
}

export const buildRouteServerFn = createServerFn({ method: "GET" })
  .validator((input: { startSlug: string; days: number }) => input)
  .handler(async ({ data }) => {
    const { startSlug, days } = data;
    const start = sites.find((s) => s.slug === startSlug) ?? (sites[0] as (typeof sites)[number]);
    const maxSites = Math.max(1, days) * PER_DAY;

    /*
     * Shortlist by straight-line distance before asking OSRM anything. The
     * itinerary never leaves the start's neighbourhood — a nearest-neighbour
     * walk of nine stops cannot reach a site on the far side of the country —
     * so routing all 100 sites meant requesting a 100x100 table (10,000 pairs,
     * measured at ~8.5s against the demo server) to use nine of its rows.
     */
    const candidates = [...sites]
      .filter((s) => s.slug !== start.slug)
      .map((site) => ({ site, crow: distanceKm(start.lat, start.lng, site.lat, site.lng) }))
      .sort((a, b) => a.crow - b.crow)
      .slice(0, Math.max(MIN_CANDIDATES, maxSites * CANDIDATE_MULTIPLIER))
      .map((c) => c.site);

    const pool = [start, ...candidates];
    const points = pool.map((s) => ({ lat: s.lat, lng: s.lng }));

    let matrix: Cell[][];
    let usingDriving: boolean;
    try {
      matrix = await fetchDrivingMatrix(points);
      usingDriving = true;
    } catch {
      matrix = haversineMatrix(points);
      usingDriving = false;
    }

    const legKm = (i: number, j: number) => matrix[i]?.[j]?.km ?? 0;

    const orderIdx = [0];
    const used = new Set([0]);
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

    const slugs = orderIdx.map((i) => pool[i]!.slug);
    const legs: Cell[] = [];
    for (let k = 1; k < orderIdx.length; k++) {
      const from = orderIdx[k - 1]!;
      const to = orderIdx[k]!;
      const cell = matrix[from]?.[to] ?? { km: legKm(from, to), min: 0 };
      legs.push({
        km: Math.round(cell.km),
        // No OSRM means no duration to report. 60 km/h is a plain guess, and
        // `usingDriving: false` is what tells the UI to label it as one.
        min: cell.min > 0 ? cell.min : Math.max(1, Math.round(cell.km)),
      });
    }

    return {
      usingDriving,
      slugs,
      legs,
      totalKm: legs.reduce((a, l) => a + l.km, 0),
      totalMin: legs.reduce((a, l) => a + l.min, 0),
    };
  });
