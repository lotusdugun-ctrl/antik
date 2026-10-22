/**
 * Carved form as a signed distance field, and the mesh cut from it.
 *
 * A lofted tube is a fair limb but a poor animal: where the neck meets the
 * shoulder, or a haunch the flank, two tubes simply pass through each other
 * and the seam shows. A sculptor's body is one surface. So an animal statue
 * is described here as a set of masses — tapering rods (bone and muscle
 * along a line) and ellipsoids (a cheek, a haunch, a lock of mane) — merged
 * with a smooth minimum, so every mass flows into the next with a fillet as
 * wide as the blend asks, and hollows (a mouth, a nostril, the groove
 * between two toes) cut away with a smooth maximum. The surface is then
 * extracted with surface nets and each vertex pulled onto the true surface,
 * with its normal from the field's gradient, so the stone shades as one
 * continuous carved skin.
 *
 * Pure geometry, no three.js: the renderer wraps the arrays it returns.
 */
import type { Vec3 } from "./reconstruction-parts";

/**
 * One mass of a sculpture, in the statue's own frame.
 *
 * `rod`: from `a` (radius `ra`) to `b` (radius `rb`), rounded at both ends.
 * `egg`: an ellipsoid at `c`, radii `r` along its own x, y and z; with `dir`
 * its z axis lies along that direction (its y stays as near up as it can).
 * `k` is how wide the fillet is that joins it to what is already there; `cut`
 * carves it away instead.
 */
export type Mass =
  | { rod: [Vec3, Vec3]; ra: number; rb: number; k?: number; cut?: boolean }
  | { egg: Vec3; r: Vec3; dir?: Vec3; k?: number; cut?: boolean };

export type SculptMesh = {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
};

type Prim = {
  kind: 0 | 1;
  cut: boolean;
  k: number;
  // rod
  ax: number;
  ay: number;
  az: number;
  bax: number;
  bay: number;
  baz: number;
  r1: number;
  r2: number;
  l2: number;
  rr: number;
  a2: number;
  il2: number;
  // egg: centre, axes and radii
  m: number[];
  rx: number;
  ry: number;
  rz: number;
  // bounds
  lo: Vec3;
  hi: Vec3;
};

function prepare(mass: Mass): Prim {
  const p: Prim = {
    kind: 0,
    cut: !!mass.cut,
    k: mass.k ?? 0,
    ax: 0,
    ay: 0,
    az: 0,
    bax: 0,
    bay: 0,
    baz: 0,
    r1: 0,
    r2: 0,
    l2: 0,
    rr: 0,
    a2: 0,
    il2: 0,
    m: [],
    rx: 0,
    ry: 0,
    rz: 0,
    lo: [0, 0, 0],
    hi: [0, 0, 0],
  };
  if ("rod" in mass) {
    const [a, b] = mass.rod;
    p.ax = a[0];
    p.ay = a[1];
    p.az = a[2];
    p.bax = b[0] - a[0];
    p.bay = b[1] - a[1];
    p.baz = b[2] - a[2];
    p.r1 = mass.ra;
    p.r2 = mass.rb;
    p.l2 = p.bax * p.bax + p.bay * p.bay + p.baz * p.baz;
    p.rr = p.r1 - p.r2;
    p.a2 = p.l2 - p.rr * p.rr;
    p.il2 = p.l2 > 0 ? 1 / p.l2 : 0;
    // One sphere swallowing the other: just the bigger sphere.
    if (p.a2 <= 1e-12) {
      const big = p.r1 >= p.r2;
      if (!big) {
        p.ax = b[0];
        p.ay = b[1];
        p.az = b[2];
      }
      p.r1 = Math.max(mass.ra, mass.rb);
      p.l2 = 0;
    }
    const r = Math.max(mass.ra, mass.rb);
    for (let i = 0; i < 3; i += 1) {
      p.lo[i] = Math.min(a[i]!, b[i]!) - r;
      p.hi[i] = Math.max(a[i]!, b[i]!) + r;
    }
  } else {
    p.kind = 1;
    const c = mass.egg;
    p.rx = mass.r[0];
    p.ry = mass.r[1];
    p.rz = mass.r[2];
    let x: Vec3 = [1, 0, 0];
    let y: Vec3 = [0, 1, 0];
    let z: Vec3 = [0, 0, 1];
    if (mass.dir) {
      const d = mass.dir;
      const n = Math.hypot(d[0], d[1], d[2]) || 1;
      z = [d[0] / n, d[1] / n, d[2] / n];
      const ref: Vec3 = Math.abs(z[1]) < 0.95 ? [0, 1, 0] : [1, 0, 0];
      // x = ref × z, y = z × x
      x = [
        ref[1] * z[2] - ref[2] * z[1],
        ref[2] * z[0] - ref[0] * z[2],
        ref[0] * z[1] - ref[1] * z[0],
      ];
      const nx = Math.hypot(x[0], x[1], x[2]) || 1;
      x = [x[0] / nx, x[1] / nx, x[2] / nx];
      y = [z[1] * x[2] - z[2] * x[1], z[2] * x[0] - z[0] * x[2], z[0] * x[1] - z[1] * x[0]];
    }
    p.m = [c[0], c[1], c[2], ...x, ...y, ...z];
    const r = Math.max(p.rx, p.ry, p.rz);
    for (let i = 0; i < 3; i += 1) {
      p.lo[i] = c[i]! - r;
      p.hi[i] = c[i]! + r;
    }
  }
  return p;
}

function distance(p: Prim, x: number, y: number, z: number): number {
  if (p.kind === 0) {
    const px = x - p.ax;
    const py = y - p.ay;
    const pz = z - p.az;
    if (p.l2 === 0) return Math.sqrt(px * px + py * py + pz * pz) - p.r1;
    // Inigo Quilez's exact round cone between two points.
    const yy = px * p.bax + py * p.bay + pz * p.baz;
    const zz = yy - p.l2;
    const qx = px * p.l2 - p.bax * yy;
    const qy = py * p.l2 - p.bay * yy;
    const qz = pz * p.l2 - p.baz * yy;
    const x2 = qx * qx + qy * qy + qz * qz;
    const y2 = yy * yy * p.l2;
    const z2 = zz * zz * p.l2;
    const k = (p.rr < 0 ? -1 : 1) * p.rr * p.rr * x2;
    if ((zz < 0 ? -1 : 1) * p.a2 * z2 > k) return Math.sqrt(x2 + z2) * p.il2 - p.r2;
    if ((yy < 0 ? -1 : 1) * p.a2 * y2 < k) return Math.sqrt(x2 + y2) * p.il2 - p.r1;
    return (Math.sqrt(x2 * p.a2 * p.il2) + yy * p.rr) * p.il2 - p.r1;
  }
  const m = p.m;
  const dx = x - m[0]!;
  const dy = y - m[1]!;
  const dz = z - m[2]!;
  const lx = (dx * m[3]! + dy * m[4]! + dz * m[5]!) / p.rx;
  const ly = (dx * m[6]! + dy * m[7]! + dz * m[8]!) / p.ry;
  const lz = (dx * m[9]! + dy * m[10]! + dz * m[11]!) / p.rz;
  const k0 = Math.sqrt(lx * lx + ly * ly + lz * lz);
  const k1 = Math.sqrt(
    (lx * lx) / (p.rx * p.rx) + (ly * ly) / (p.ry * p.ry) + (lz * lz) / (p.rz * p.rz),
  );
  if (k1 < 1e-9) return -Math.min(p.rx, p.ry, p.rz);
  return (k0 * (k0 - 1)) / k1;
}

/** The field at a point, over the masses given, in order. */
function field(prims: Prim[], x: number, y: number, z: number): number {
  let d = 1e9;
  for (const p of prims) {
    // No nearer than its box: a mass that far off cannot change the field.
    const bx = Math.max(p.lo[0] - x, 0, x - p.hi[0]);
    const by = Math.max(p.lo[1] - y, 0, y - p.hi[1]);
    const bz = Math.max(p.lo[2] - z, 0, z - p.hi[2]);
    const reach = p.cut ? p.k - d : d + p.k;
    if (bx * bx + by * by + bz * bz >= reach * reach && (bx > 0 || by > 0 || bz > 0) && reach >= 0)
      continue;
    if (p.cut && reach < 0) continue;
    const e = distance(p, x, y, z);
    if (p.cut) {
      // Smooth maximum of d and -e.
      if (p.k > 0) {
        const h = Math.max(p.k - Math.abs(d + e), 0) / p.k;
        d = Math.max(d, -e) + h * h * p.k * 0.25;
      } else d = Math.max(d, -e);
    } else if (p.k > 0) {
      const h = Math.max(p.k - Math.abs(d - e), 0) / p.k;
      d = Math.min(d, e) - h * h * p.k * 0.25;
    } else d = Math.min(d, e);
  }
  return d;
}

/** The field at a point, for a test or a placement check. */
export function sculptDistance(masses: Mass[], at: Vec3): number {
  return field(masses.map(prepare), at[0], at[1], at[2]);
}

/** The box the masses fill, cuts left out. */
export function sculptBounds(masses: Mass[]): { min: Vec3; max: Vec3 } {
  const min: Vec3 = [Infinity, Infinity, Infinity];
  const max: Vec3 = [-Infinity, -Infinity, -Infinity];
  for (const mass of masses) {
    if (mass.cut) continue;
    const p = prepare(mass);
    for (let i = 0; i < 3; i += 1) {
      min[i] = Math.min(min[i]!, p.lo[i]!);
      max[i] = Math.max(max[i]!, p.hi[i]!);
    }
  }
  return { min, max };
}

const BLOCK = 4;

/**
 * The surface of the masses, sampled every `cell` metres.
 *
 * The grid is walked in blocks of four cells: the field is taken once at the
 * middle of each block, a block well clear of the surface is filled with its
 * sign alone, and the rest are sampled with only the masses near enough to
 * matter there — which is what lets a horse of two hundred masses be cut at
 * centimetre steps in a fraction of a second.
 *
 * With `back`, the faces lying wholly behind that `z` are left out: the flat
 * back of a mask or a protome, set against the stone it is carved from.
 */
export function sculptMesh(masses: Mass[], cell: number, back?: number): SculptMesh {
  const prims = masses.map(prepare);
  const { min, max } = sculptBounds(masses);
  const pad = cell * 2;
  const o: Vec3 = [min[0] - pad, min[1] - pad, min[2] - pad];
  const n = [0, 1, 2].map((i) => Math.ceil((max[i]! - min[i]! + 2 * pad) / cell) + 1) as Vec3;
  const [nx, ny, nz] = n;
  const bx = Math.ceil((nx - 1) / BLOCK);
  const by = Math.ceil((ny - 1) / BLOCK);
  const bz = Math.ceil((nz - 1) / BLOCK);
  const values = new Float32Array(nx * ny * nz);
  const index = (i: number, j: number, k: number) => i + nx * (j + ny * k);
  const half = (BLOCK * cell * Math.sqrt(3)) / 2;
  const near: (Prim[] | null)[] = new Array(bx * by * bz).fill(null);

  for (let K = 0; K < bz; K += 1)
    for (let J = 0; J < by; J += 1)
      for (let I = 0; I < bx; I += 1) {
        const cx = o[0] + (I + 0.5) * BLOCK * cell;
        const cy = o[1] + (J + 0.5) * BLOCK * cell;
        const cz = o[2] + (K + 0.5) * BLOCK * cell;
        const D = field(prims, cx, cy, cz);
        // The points this block owns: its corner and on up to the next block's.
        const i1 = I === bx - 1 ? nx - 1 : (I + 1) * BLOCK - 1;
        const j1 = J === by - 1 ? ny - 1 : (J + 1) * BLOCK - 1;
        const k1 = K === bz - 1 ? nz - 1 : (K + 1) * BLOCK - 1;
        if (Math.abs(D) > half * 2 + cell * 2) {
          const v = D > 0 ? 1e3 : -1e3;
          for (let k = K * BLOCK; k <= k1; k += 1)
            for (let j = J * BLOCK; j <= j1; j += 1)
              for (let i = I * BLOCK; i <= i1; i += 1) values[index(i, j, k)] = v;
          continue;
        }
        /*
         * A mass whose surface stays more than a cell and its fillet away
         * from every point of the block can neither make a point of it
         * inside nor move the surface through it: it is left out here.
         */
        const list = prims.filter((p) => distance(p, cx, cy, cz) - half < cell + 1.25 * p.k);
        near[I + bx * (J + by * K)] = list;
        for (let k = K * BLOCK; k <= k1; k += 1)
          for (let j = J * BLOCK; j <= j1; j += 1)
            for (let i = I * BLOCK; i <= i1; i += 1) {
              const v = field(list, o[0] + i * cell, o[1] + j * cell, o[2] + k * cell);
              values[index(i, j, k)] = v === 0 ? 1e-7 : v;
            }
      }

  // The blocks the surface can pass through: only their cells are looked at.
  const blocks: number[] = [];
  for (let b = 0; b < near.length; b += 1) if (near[b]) blocks.push(b);

  // One vertex in every cell the surface passes through.
  const vertexOf = new Map<number, number>();
  const cellIndex = (i: number, j: number, k: number) => i + (nx - 1) * (j + (ny - 1) * k);
  const positions: number[] = [];
  const normals: number[] = [];
  // The eight corners as offsets into `values`, and the twelve edges.
  const cornerX = [0, 1, 0, 1, 0, 1, 0, 1];
  const cornerY = [0, 0, 1, 1, 0, 0, 1, 1];
  const cornerZ = [0, 0, 0, 0, 1, 1, 1, 1];
  const offset = cornerX.map((_, c) => cornerX[c]! + nx * (cornerY[c]! + ny * cornerZ[c]!));
  const edgeA = [0, 2, 4, 6, 0, 1, 4, 5, 0, 1, 2, 3];
  const edgeB = [1, 3, 5, 7, 2, 3, 6, 7, 4, 5, 6, 7];
  const v8 = new Float64Array(8);
  const eps = cell * 0.35;
  for (const b of blocks) {
    const list = near[b]!;
    const I = b % bx;
    const J = Math.floor(b / bx) % by;
    const K = Math.floor(b / (bx * by));
    const i1 = Math.min(nx - 1, (I + 1) * BLOCK);
    const j1 = Math.min(ny - 1, (J + 1) * BLOCK);
    const k1 = Math.min(nz - 1, (K + 1) * BLOCK);
    for (let k = K * BLOCK; k < k1; k += 1)
      for (let j = J * BLOCK; j < j1; j += 1)
        for (let i = I * BLOCK; i < i1; i += 1) {
          const base = index(i, j, k);
          let inside = 0;
          for (let c = 0; c < 8; c += 1) {
            const v = values[base + offset[c]!]!;
            v8[c] = v;
            if (v < 0) inside += 1;
          }
          if (inside === 0 || inside === 8) continue;
          let sx = 0;
          let sy = 0;
          let sz = 0;
          let count = 0;
          for (let e = 0; e < 12; e += 1) {
            const p = edgeA[e]!;
            const q = edgeB[e]!;
            const a = v8[p]!;
            const bb = v8[q]!;
            if (a < 0 === bb < 0) continue;
            const t = a / (a - bb);
            sx += cornerX[p]! + (cornerX[q]! - cornerX[p]!) * t;
            sy += cornerY[p]! + (cornerY[q]! - cornerY[p]!) * t;
            sz += cornerZ[p]! + (cornerZ[q]! - cornerZ[p]!) * t;
            count += 1;
          }
          let x = o[0] + (i + sx / count) * cell;
          let y = o[1] + (j + sy / count) * cell;
          let z = o[2] + (k + sz / count) * cell;
          // Onto the surface along the gradient, and the normal from it.
          let gx = 0;
          let gy = 0;
          let gz = 1;
          const gradient = () => {
            // Four samples on a tetrahedron round the point.
            const a = field(list, x + eps, y - eps, z - eps);
            const bb = field(list, x - eps, y - eps, z + eps);
            const c = field(list, x - eps, y + eps, z - eps);
            const d = field(list, x + eps, y + eps, z + eps);
            gx = a - bb - c + d;
            gy = -a - bb + c + d;
            gz = -a + bb - c + d;
            const g = Math.hypot(gx, gy, gz) || 1;
            gx /= g;
            gy /= g;
            gz /= g;
          };
          const d0 = field(list, x, y, z);
          gradient();
          // Never further than the cell, so a vertex stays in its own place.
          const move = Math.max(-cell * 0.7, Math.min(cell * 0.7, d0));
          x -= gx * move;
          y -= gy * move;
          z -= gz * move;
          gradient();
          vertexOf.set(cellIndex(i, j, k), positions.length / 3);
          positions.push(x, y, z);
          normals.push(gx, gy, gz);
        }
  }

  // A quad across every grid edge the surface crosses, joining the four
  // cells round it.
  const indices: number[] = [];
  const at = (i: number, j: number, k: number) => vertexOf.get(cellIndex(i, j, k)) ?? -1;
  const quad = (a: number, b: number, c: number, d: number, flip: boolean) => {
    if (a < 0 || b < 0 || c < 0 || d < 0) return;
    if (flip) indices.push(a, b, c, a, c, d);
    else indices.push(a, c, b, a, d, c);
  };
  for (const b of blocks) {
    const I = b % bx;
    const J = Math.floor(b / bx) % by;
    const K = Math.floor(b / (bx * by));
    const i1 = Math.min(nx - 1, (I + 1) * BLOCK);
    const j1 = Math.min(ny - 1, (J + 1) * BLOCK);
    const k1 = Math.min(nz - 1, (K + 1) * BLOCK);
    for (let k = K * BLOCK; k < k1; k += 1)
      for (let j = J * BLOCK; j < j1; j += 1)
        for (let i = I * BLOCK; i < i1; i += 1) {
          const v0 = values[index(i, j, k)]! < 0;
          if (j > 0 && k > 0 && v0 !== values[index(i + 1, j, k)]! < 0)
            quad(at(i, j - 1, k - 1), at(i, j, k - 1), at(i, j, k), at(i, j - 1, k), v0);
          if (i > 0 && k > 0 && v0 !== values[index(i, j + 1, k)]! < 0)
            quad(at(i - 1, j, k - 1), at(i - 1, j, k), at(i, j, k), at(i, j, k - 1), v0);
          if (i > 0 && j > 0 && v0 !== values[index(i, j, k + 1)]! < 0)
            quad(at(i - 1, j - 1, k), at(i, j - 1, k), at(i, j, k), at(i - 1, j, k), v0);
        }
  }
  // The side set against a wall is never seen: its faces are not kept.
  const kept =
    back === undefined
      ? indices
      : indices.filter((_, f, all) => {
          const t = f - (f % 3);
          return (
            positions[all[t]! * 3 + 2]! >= back ||
            positions[all[t + 1]! * 3 + 2]! >= back ||
            positions[all[t + 2]! * 3 + 2]! >= back
          );
        });
  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    indices: new Uint32Array(kept),
  };
}

const cache = new Map<string, SculptMesh>();

/** The same masses cut once: a team of horses, a pair of lions. */
export function sculptMeshCached(masses: Mass[], cell: number, back?: number): SculptMesh {
  const key = `${cell}|${back}|${JSON.stringify(masses)}`;
  let mesh = cache.get(key);
  if (!mesh) {
    mesh = sculptMesh(masses, cell, back);
    cache.set(key, mesh);
  }
  return mesh;
}
