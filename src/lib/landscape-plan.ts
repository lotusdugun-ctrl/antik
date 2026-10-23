import type { Part } from "./reconstruction-parts";
import { sculptBounds } from "./sculpt";

/**
 * Where the country round a building rises and what grows in it — worked out
 * without any 3D library, so the tests can check it: no tree standing in the
 * Euphrates or in the sea off Patara, none inside a wall, a road or a cliff,
 * and the ground kept under the water's surface wherever there is water.
 * `src/components/scene/landscape.ts` turns the plan into meshes.
 *
 * `biome` is the one thing chosen per site, because getting it wrong would be
 * a claim: olive and cypress belong on the Aegean coast, not on the Harran
 * plain round Göbeklitepe or on Nemrut's bare summit; Sagalassos stands at
 * 1,500 m among black pine and juniper, and Sümela in the spruce and beech
 * forest of a Pontic gorge.
 */
export type Biome = "mediterranean" | "steppe" | "mountain" | "alpine" | "pontic";

/** Which biome each model stands in; the rest are on the Mediterranean coast. */
const BIOME_OF: Partial<Record<string, Biome>> = {
  "gobeklitepe-d-yapisi": "steppe",
  "aizanoi-zeus-tapinagi": "steppe",
  "nemrut-dogu-terasi": "mountain",
  "hattusa-aslanli-kapi": "steppe",
  "catalhoyuk-dogu-hoyugu": "steppe",
  "ani-katedrali": "steppe",
  // A forested Pontic gorge: spruce and beech; its weather is morning mist (see weather.ts).
  "sumela-manastiri": "pontic",
  // The city stands at 1,500 m in the Taurus: black pine, juniper, bare limestone.
  "sagalassos-antoninler-cesmesi": "alpine",
};

export const biomeFor = (id: string): Biome => BIOME_OF[id] ?? "mediterranean";

export type TreeKind = "cypress" | "crown" | "conifer";

export type PlannedTree = {
  kind: TreeKind;
  x: number;
  y: number;
  z: number;
  /** Height and crown width, in metres. */
  h: number;
  w: number;
  rot: number;
  /** A shade for this one tree, 0..1 (lighter or darker than the rest). */
  shade: number;
};

export type PlannedRock = {
  x: number;
  y: number;
  z: number;
  s: number;
  sy: number;
  sz: number;
  rx: number;
  ry: number;
  rz: number;
};

/** A footprint on the ground, turned by `rot` about the vertical. */
export type Footprint = { x: number; z: number; hx: number; hz: number; rot: number };
export type WaterBody = Footprint & { top: number };

export type BiomeLook = {
  relief: number;
  palette: [number, number, number];
  /** Trees per 900 m² of country, before clustering and thinning. */
  trees: number;
  /** The share of the trees that are spindles (cypress) or cones (conifers). */
  cypress: number;
  conifer: number;
  /** How much the trees thin out towards the horizon, 0..1. */
  thinning: number;
  crownColour: number;
  coniferColour: number;
  rocks: number;
  rockColour: number;
  rockScale: number;
};

export const BIOMES: Record<Biome, BiomeLook> = {
  mediterranean: {
    relief: 0.42,
    palette: [0x9b8e5c, 0x7a7d46, 0xa38866],
    trees: 1,
    cypress: 0.3,
    conifer: 0,
    thinning: 0.75,
    crownColour: 0x6d7a4f,
    coniferColour: 0x3e5230,
    rocks: 90,
    rockColour: 0x9c9284,
    rockScale: 1,
  },
  steppe: {
    relief: 0.18,
    palette: [0xb59f6e, 0xa69060, 0xc0aa7c],
    trees: 0.25,
    cypress: 0,
    conifer: 0,
    thinning: 0.75,
    crownColour: 0x6f7442,
    coniferColour: 0x445238,
    rocks: 90,
    rockColour: 0x9c9284,
    rockScale: 1,
  },
  // Nemrut's summit: bare rock and scree.
  mountain: {
    relief: 0.75,
    palette: [0x8f8478, 0x7c7266, 0xa49a8c],
    trees: 0,
    cypress: 0,
    conifer: 0,
    thinning: 0.75,
    crownColour: 0x6d7a4f,
    coniferColour: 0x3e5230,
    rocks: 260,
    rockColour: 0x8a8076,
    rockScale: 1.8,
  },
  // The Taurus at 1,500 m: grey limestone, thin grass, black pine and juniper.
  alpine: {
    relief: 0.65,
    palette: [0x9a9272, 0x86825f, 0xaaa290],
    trees: 0.45,
    cypress: 0,
    conifer: 0.7,
    thinning: 0.6,
    crownColour: 0x5c6a44,
    coniferColour: 0x34442c,
    rocks: 200,
    rockColour: 0xb2ab9e,
    rockScale: 1.4,
  },
  // A Pontic gorge: oriental spruce and fir on the slopes, beech lower down.
  pontic: {
    relief: 0.85,
    palette: [0x5f6e3f, 0x4c5c34, 0x6c7448],
    trees: 3.2,
    cypress: 0,
    conifer: 0.65,
    thinning: 0.3,
    crownColour: 0x5a7a38,
    coniferColour: 0x2c3f27,
    rocks: 110,
    rockColour: 0x8c877c,
    rockScale: 1.2,
  },
};

/** Deterministic, so a page reload grows the same trees in the same places. */
export function seededRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smooth value noise on a lattice; cheap and good enough for hills. */
export function noise2(seed: number) {
  const hash = (x: number, y: number) => {
    let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const fade = (t: number) => t * t * (3 - 2 * t);
  const at = (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = fade(x - xi);
    const yf = fade(y - yi);
    const a = hash(xi, yi);
    const b = hash(xi + 1, yi);
    const c = hash(xi, yi + 1);
    const d = hash(xi + 1, yi + 1);
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
  };
  return (x: number, y: number) =>
    at(x, y) * 0.55 + at(x * 2.1, y * 2.1) * 0.28 + at(x * 4.3, y * 4.3) * 0.17;
}

export const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** The footprint of one part on the ground, or null for something with none. */
export function footprintOf(part: Part): (Footprint & { top: number }) | null {
  const [x, y, z] = part.at;
  switch (part.kind) {
    case "box":
    case "prism": {
      if (part.kind === "box" && part.rotX) {
        // A tipped slab (a ladder, a roof): its corners, turned as the renderer turns them.
        const [, h, d] = part.size;
        const c = Math.cos(part.rotX);
        const sn = Math.sin(part.rotX);
        const zs: number[] = [];
        const ys: number[] = [];
        for (const v of [0, h])
          for (const t of [-d / 2, d / 2]) {
            zs.push(v * sn + t * c);
            ys.push(v * c - t * sn);
          }
        const z0 = Math.min(...zs);
        const z1 = Math.max(...zs);
        const mid = (z0 + z1) / 2;
        return {
          x: x + mid * Math.sin(part.rotY),
          z: z + mid * Math.cos(part.rotY),
          hx: part.size[0] / 2,
          hz: (z1 - z0) / 2,
          rot: part.rotY,
          top: y + Math.max(...ys),
        };
      }

      return {
        x,
        z,
        hx: part.size[0] / 2,
        hz: part.size[2] / 2,
        rot: part.rotY,
        top: y + part.size[1],
      };
    }
    case "cylinder": {
      const r = Math.max(part.radiusBottom, part.radiusTop);
      if (part.rotX) return { x, z, hx: r, hz: part.height, rot: part.rotY ?? 0, top: y + r };
      return { x, z, hx: r, hz: r, rot: 0, top: y + part.height };
    }
    case "ring":
      return { x, z, hx: part.outer, hz: part.outer, rot: 0, top: y + part.height };
    case "bank":
      return {
        x,
        z,
        hx: part.inner + part.reach,
        hz: part.inner + part.reach,
        rot: 0,
        top: y + part.height,
      };
    case "relief":
      return { x, z, hx: part.size[0] / 2, hz: 0.3, rot: part.rotY, top: y + part.size[1] };
    case "loft": {
      let r = 0;
      for (const s of part.sections)
        r = Math.max(r, Math.hypot(s.c[0], s.c[2]) + Math.max(s.rx, s.ry));
      return { x, z, hx: r, hz: r, rot: 0, top: y + r };
    }
    case "sculpt": {
      const b = sculptBounds(part.masses);
      const r = Math.max(...b.min.map(Math.abs), ...b.max.map(Math.abs));
      return { x, z, hx: r, hz: r, rot: 0, top: y + b.max[1] };
    }
    default:
      return null;
  }
}

/** Signed distance from (px, pz) to a footprint's edge: negative inside. */
export function distanceTo(f: Footprint, px: number, pz: number) {
  const c = Math.cos(f.rot);
  const s = Math.sin(f.rot);
  const dx = px - f.x;
  const dz = pz - f.z;
  // Into the footprint's own frame (the inverse of the turn the renderer applies).
  const u = Math.abs(dx * c - dz * s) - f.hx;
  const v = Math.abs(dx * s + dz * c) - f.hz;
  const out = Math.hypot(Math.max(u, 0), Math.max(v, 0));
  return out > 0 ? out : Math.max(u, v);
}

/** The bodies of water a model has: rivers, the sea, pools and basins. */
export function waterOf(parts: readonly Part[]): WaterBody[] {
  const out: WaterBody[] = [];
  for (const part of parts) {
    if (part.material !== "water") continue;
    const f = footprintOf(part);
    if (f) out.push(f);
  }
  return out;
}

/**
 * What nothing may grow inside: every part of the model and of its scenery
 * that stands on the ground — walls, roads, banks, the model's own trees,
 * cliffs, the ridges on the skyline — except grass and loose stone too small
 * to matter. Water is kept clear separately, with a wider margin.
 */
export function obstaclesOf(parts: readonly Part[]): Footprint[] {
  const out: Footprint[] = [];
  for (const part of parts) {
    if (part.material === "grass" || part.material === "water") continue;
    if (part.kind === "figure" || part.kind === "carving") continue;
    const f = footprintOf(part);
    if (!f) continue;
    if (part.decor && f.hx < 0.45 && f.hz < 0.45) continue;
    out.push(f);
  }
  return out;
}

/**
 * A coarse occupancy grid over the country: one bit a cell, set wherever a
 * footprint (grown by its margin) covers the cell's middle. Asking it is four
 * array reads, however many thousand parts a model has.
 */
export function keepOutGrid(
  centre: { x: number; z: number },
  reach: number,
  items: { f: Footprint; margin: number }[],
) {
  const n = 384;
  const cell = (reach * 2) / n;
  const x0 = centre.x - reach;
  const z0 = centre.z - reach;
  const grid = new Uint8Array(n * n);
  for (const { f, margin } of items) {
    const r = Math.hypot(f.hx, f.hz) + margin;
    const i0 = Math.max(0, Math.floor((f.x - r - x0) / cell));
    const i1 = Math.min(n - 1, Math.ceil((f.x + r - x0) / cell));
    const j0 = Math.max(0, Math.floor((f.z - r - z0) / cell));
    const j1 = Math.min(n - 1, Math.ceil((f.z + r - z0) / cell));
    if (i0 > i1 || j0 > j1) continue;
    // Half a cell more, so a point anywhere in a cell is covered.
    const grow = margin + cell * 0.71;
    for (let j = j0; j <= j1; j += 1)
      for (let i = i0; i <= i1; i += 1) {
        if (grid[j * n + i]) continue;
        if (distanceTo(f, x0 + (i + 0.5) * cell, z0 + (j + 0.5) * cell) <= grow)
          grid[j * n + i] = 1;
      }
  }
  return (x: number, z: number) => {
    const i = Math.floor((x - x0) / cell);
    const j = Math.floor((z - z0) / cell);
    if (i < 0 || j < 0 || i >= n || j >= n) return false;
    return grid[j * n + i] === 1;
  };
}

/**
 * The foot of a face of living rock (a part with a `rock` face, see
 * `models/rockface.ts`) that stands on the ground: the line of the face on
 * the plan and which way it looks, and how high the scree is banked against it.
 */
export type Scree = {
  x: number;
  z: number;
  /** The face's direction along the plan, and out of it (unit vectors). */
  along: [number, number];
  out: [number, number];
  half: number;
  height: number;
};

/** How far out from a face its scree runs, per metre of its height: a slope of about 30°. */
const SCREE_RUN = 1.7;

export function screesOf(parts: readonly Part[], groundY: number): Scree[] {
  const out: Scree[] = [];
  for (const part of parts) {
    if (part.kind !== "box" || !part.rock || part.rotX) continue;
    if (part.at[1] > groundY + 1.5) continue;
    const [w, h, d] = part.size;
    const c = Math.cos(part.rotY);
    const s = Math.sin(part.rotY);
    // The front of a rock block is its -z face, turned by rotY.
    out.push({
      x: part.at[0] - (d / 2) * s,
      z: part.at[2] - (d / 2) * c,
      along: [c, -s],
      out: [-s, -c],
      half: w / 2,
      height: Math.min(18, h * 0.45),
    });
  }
  return out;
}

/** How high the scree stands at (x, z) above the ground, the highest of any face's. */
export function screeAt(screes: readonly Scree[], x: number, z: number) {
  let best = 0;
  for (const f of screes) {
    const dx = x - f.x;
    const dz = z - f.z;
    const v = dx * f.out[0] + dz * f.out[1];
    const reach = f.height * SCREE_RUN;
    if (v > reach) continue;
    const u = Math.abs(dx * f.along[0] + dz * f.along[1]) - f.half;
    if (u > 8) continue;
    // Behind the face it is under the rock; out from it, falling away.
    const h = f.height * (1 - smooth(0, reach, v)) * (1 - smooth(0, 8, u));
    if (h > best) best = h;
  }
  return best;
}

export type LandscapeOptions = {
  centre: { x: number; z: number };
  span: number;
  /** The level the building stands on. */
  groundY: number;
  /** Half the footprint's diagonal: nothing grows or rises inside it. */
  footprint: number;
  biome: Biome;
  /** Everything in the model, its scenery and its life: what to keep clear of. */
  parts?: readonly Part[];
};

/** How far below a water surface the bed under it lies at the shore, and at most. */
const SHORE_SLOPE = 0.12;
const BED_DEPTH = 2.5;

export function planLandscape(options: LandscapeOptions) {
  const { centre, span, groundY, footprint, biome } = options;
  const look = BIOMES[biome];
  const random = seededRandom(Math.round(span * 1000));
  const hills = noise2(7);
  const tint = noise2(19);
  const parts = options.parts ?? [];
  const water = waterOf(parts);
  const clear = footprint * 1.25;
  /*
   * Where a cliff stands on the ground the ground is banked up against its
   * foot: the broken rock that has fallen from it over the centuries, with
   * the forest growing on it (Sümela's gorge; nothing else has rock faces).
   */
  const screes = screesOf(parts, groundY);

  const natural = (x: number, z: number) => {
    const dx = x - centre.x;
    const dz = z - centre.z;
    const d = Math.hypot(dx, dz);
    const rise = smooth(clear, clear + span * 1.1, d);
    const far = smooth(span * 2.2, span * 5, d);
    const n = hills(dx / (span * 1.3), dz / (span * 1.3));
    const h = groundY - 0.12 + rise * (n * span * look.relief * 0.55 + far * span * look.relief);
    return screes.length ? Math.max(h, groundY - 0.12 + screeAt(screes, x, z)) : h;
  };

  /*
   * The ground under water. Inside a river or the sea the land is drawn down
   * below the surface (shelving from the edge), so no hill shows through the
   * water as an island; outside it, away from the site itself, low ground is
   * lifted to just over the surface, so the side of the water's box never
   * shows as a blue wall standing on the plain.
   */
  const heightAt = (x: number, z: number) => {
    let h = natural(x, z);
    if (water.length === 0) return h;
    const fromSite = Math.hypot(x - centre.x, z - centre.z);
    const away = smooth(clear * 0.9, clear * 1.3, fromSite);
    for (const w of water) {
      // Basins and fountains in the building are the building's business.
      if (w.hx * w.hz < 40) continue;
      const d = distanceTo(w, x, z);
      if (d < 0) {
        const bed = w.top + Math.max(-BED_DEPTH, SHORE_SLOPE * d) - 0.05;
        h = Math.min(h, bed);
      } else if (d < 45) {
        // Next to the site only where the ground there would be under water:
        // the beach behind Patara's mole, not the river path below Zeugma.
        const lift = h < w.top ? 1 : away;
        if (lift === 0) continue;
        const bank = w.top + Math.min(SHORE_SLOPE * d, 1.2) + 0.05;
        const weight = (1 - smooth(18, 45, d)) * lift;
        if (bank > h) h += (bank - h) * weight;
      }
    }
    return h;
  };

  const reach = span * 3.6;
  const blocked = keepOutGrid(centre, reach, [
    ...water.map((f) => ({ f, margin: 2.5 })),
    ...obstaclesOf(parts).map((f) => ({ f, margin: 1.2 })),
  ]);
  /** Whether something of radius `r` can stand at (x, z). */
  const free = (x: number, z: number, r: number) =>
    !blocked(x, z) &&
    !blocked(x + r, z) &&
    !blocked(x - r, z) &&
    !blocked(x, z + r) &&
    !blocked(x, z - r) &&
    water.every((w) => heightAt(x, z) > w.top - 0.05 || distanceTo(w, x, z) > r + 2.5);

  /* ---- the trees ---- */

  const trees: PlannedTree[] = [];
  if (look.trees > 0) {
    // In a Pontic gorge the forest runs right up to the foot of the rock;
    // the keep-out grid alone holds it off the rock and the buildings.
    const inner = clear * (biome === "pontic" ? 0.3 : 1.05);
    const outer = span * 2.8;
    const area = Math.PI * (outer * outer - inner * inner);
    const cap = biome === "pontic" ? 1000 : 700;
    const count = Math.min(cap, Math.round((area / 900) * look.trees));
    const place = (radius: number) => {
      // Trees cluster: accept a spot more readily where the noise is high.
      for (let tries = 0; tries < 12; tries += 1) {
        const a = random() * Math.PI * 2;
        const r = Math.sqrt(inner * inner + random() * (outer * outer - inner * inner));
        const x = centre.x + Math.cos(a) * r;
        const z = centre.z + Math.sin(a) * r;
        // Thinning with distance keeps the far hills from reading as a wall
        // of trees floating in the haze.
        const thin = (r - inner) / (outer - inner);
        if (
          random() > thin * look.thinning &&
          tint(x / (span * 0.4) + 3, z / (span * 0.4)) > 0.38 + random() * 0.3 &&
          free(x, z, radius)
        ) {
          return { x, y: heightAt(x, z), z };
        }
      }
      return null;
    };
    const spindles = Math.round(count * look.cypress);
    const cones = Math.round(count * look.conifer);
    for (let i = 0; i < count; i += 1) {
      const kind: TreeKind = i < spindles ? "cypress" : i < spindles + cones ? "conifer" : "crown";
      let h: number;
      let w: number;
      if (kind === "cypress") {
        h = 10 + random() * 6;
        w = h * (0.13 + random() * 0.05);
      } else if (kind === "conifer") {
        // Pontic spruce runs tall and narrow; Taurus black pine is lower, broader.
        h = biome === "pontic" ? 16 + random() * 14 : 7 + random() * 7;
        w = h * (biome === "pontic" ? 0.2 + random() * 0.06 : 0.32 + random() * 0.1);
      } else {
        h =
          biome === "steppe"
            ? 3 + random() * 3
            : biome === "pontic"
              ? 10 + random() * 8
              : biome === "alpine"
                ? 2.5 + random() * 2.5
                : 4 + random() * 3;
        w = h * (0.55 + random() * 0.25);
      }
      const rot = random() * Math.PI * 2;
      const shade = random();
      const at = place(Math.max(0.6, w * 0.3));
      if (!at) continue;
      trees.push({ kind, x: at.x, y: at.y, z: at.z, h, w, rot, shade });
    }
    // The forest on the scree, thick along the foot of the rock.
    for (const f of screes) {
      const reach = f.height * SCREE_RUN;
      for (let u = -f.half; u < f.half; u += 3.2) {
        const v = 1.5 + random() * reach * 0.85;
        const along = u + random() * 3.2;
        const x = f.x + f.along[0] * along + f.out[0] * v;
        const z = f.z + f.along[1] * along + f.out[1] * v;
        const kind: TreeKind = random() < look.conifer ? "conifer" : "crown";
        const h = kind === "conifer" ? 14 + random() * 14 : 9 + random() * 8;
        const w = h * (kind === "conifer" ? 0.2 + random() * 0.06 : 0.55 + random() * 0.25);
        const rot = random() * Math.PI * 2;
        const shade = random();
        if (!free(x, z, Math.max(0.6, w * 0.3))) continue;
        trees.push({ kind, x, y: heightAt(x, z), z, h, w, rot, shade });
      }
    }
  }

  /* ---- scattered rock, the one thing every biome has ---- */

  const rocks: PlannedRock[] = [];
  for (let i = 0; i < look.rocks; i += 1) {
    const a = random() * Math.PI * 2;
    const r = clear * 1.3 + random() * span * 2.5;
    const x = centre.x + Math.cos(a) * r;
    const z = centre.z + Math.sin(a) * r;
    const s = (0.3 + random() * 0.8) * look.rockScale;
    const sy = s * (0.65 + random() * 0.35);
    const sz = s * (0.75 + random() * 0.4);
    const [rx, ry, rz] = [random() * 3, random() * 3, random() * 3];
    if (!free(x, z, s)) continue;
    rocks.push({ x, y: heightAt(x, z) - s * 0.3, z, s, sy, sz, rx, ry, rz });
  }

  return { look, heightAt, trees, rocks, water, tint, blocked };
}
