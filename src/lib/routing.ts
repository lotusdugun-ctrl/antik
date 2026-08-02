import { createServerFn } from "@tanstack/react-start";
import { distanceKm, sites } from "@/lib/sites";

type Cell = { km: number; min: number };

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
    const pool = [...sites.filter((s) => s.slug !== start.slug)];
    const points = [
      { lat: start.lat, lng: start.lng },
      ...pool.map((s) => ({ lat: s.lat, lng: s.lng })),
    ];

    let matrix: Cell[][] | null = null;
    try {
      matrix = await fetchDrivingMatrix(points);
    } catch {
      matrix = haversineMatrix(points);
    }

    const legKm = (i: number, j: number) => matrix?.[i]?.[j]?.km ?? 0;

    const PER_DAY = 3;
    const maxSites = days * PER_DAY;
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

    const all = [start, ...pool];
    const slugs = orderIdx.map((i) => all[i]!.slug);
    const legs: Cell[] = [];
    for (let k = 1; k < orderIdx.length; k++) {
      const from = orderIdx[k - 1]!;
      const to = orderIdx[k]!;
      const cell = matrix?.[from]?.[to] ?? { km: legKm(from, to), min: 0 };
      legs.push({
        km: Math.round(cell.km),
        min: cell.min > 0 ? cell.min : Math.max(1, Math.round(cell.km)),
      });
    }

    return {
      usingDriving: matrix !== null,
      slugs,
      legs,
      totalKm: legs.reduce((a, l) => a + l.km, 0),
      totalMin: legs.reduce((a, l) => a + l.min, 0),
    };
  });
