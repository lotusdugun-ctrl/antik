// Antik Türkiye: sample the living people (and animals) of a scene for the Unity app.
//
//   node export-life.mjs <id> <outDir>      (dev server on 127.0.0.1:5180)
//
// The web app animates each person as a little hierarchy of rigid pieces. Here the
// page's own animation is run on a fixed clock and recorded:
//   - each piece's shape, once, in its own space;
//   - each piece's place relative to its person, 20 times a second over one loop
//     of the walk (or 8 s, blended back into its start, for everything else);
//   - each person's place in the world, 4 times a second round their whole route.
// Unity plays it back on the GPU (one draw call for the whole cast).
//
// Output: <id>-life.json (layout) and <id>-life.bin (little-endian float32 data).
// Coordinates are converted to Unity's (x mirrored), triangles re-wound to match.
import { chromium } from "/opt/npm-tools/node_modules/playwright/index.mjs";
import fs from "node:fs";

const [id, outDir] = [process.argv[2], process.argv[3]];
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 320, height: 200 }, serviceWorkers: "block" });
await page.route(/fonts\.(googleapis|gstatic)|wikimedia|openstreetmap|openfreemap/, (r) => r.abort());
await page.goto(`http://127.0.0.1:5180/rekonstruksiyon/${id}`, { waitUntil: "domcontentloaded", timeout: 180000 });
await page.waitForFunction(() => window.__recon && window.__recon.lifeHandle && window.__recon.renderer.info.render.frame > 3, null, { timeout: 300000 });
await page.waitForTimeout(1500);

const result = await page.evaluate(() => {
  const { lifeHandle, life, scene } = window.__recon;
  window.requestAnimationFrame = () => 0; // stop the page's own loop: we drive the clock
  const THREE_Object3D = Object.getPrototypeOf(Object.getPrototypeOf(lifeHandle.group));
  const group = lifeHandle.group;
  const FPS = 20, ROOT_HZ = 4, LOOP = 8, BLEND = 1.5;

  // Nobody pauses on their walk (a pause would break the loop).
  for (const p of life.people) if (p.pause) p.pause = 0;

  // Always the detailed figure: the "camera" stands wherever the person being updated is.
  let here = null;
  const roots = group.children.filter((c) => !c.isMesh);
  for (const r of roots) {
    r.getWorldPosition = function (v) { THREE_Object3D.getWorldPosition.call(this, v); here = v; return v; };
  }
  const cam = { position: { get x() { return here ? here.x : 0; }, get y() { return here ? here.y : 0; }, get z() { return here ? here.z : 0; } } };
  const step = (t) => { lifeHandle.update(t, 1 / FPS, 0, cam); group.updateMatrixWorld(true); };

  // Route loop length of each actor, matched in build order: people, then animals, chariots.
  const loopLen = (route, speed) => {
    if (!route || route.length < 2 || !speed) return 0;
    let total = 0;
    for (let i = 0; i < route.length; i++) {
      const a = route[i], b = route[(i + 1) % route.length];
      total += Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    }
    return total / speed;
  };
  const specs = [
    ...life.people.map((p) => ({ kind: "person", period: loopLen(p.route, p.speed ?? 1.1), p })),
    ...(life.animals || []).map((a) => ({ kind: "animal", period: loopLen(a.route, a.speed), p: a })),
    ...(life.chariots || []).map((c) => ({ kind: "chariot", period: loopLen(c.route, c.speed), p: c })),
  ];

  step(0);
  const shown = (o, root) => { for (let x = o; x && x !== root; x = x.parent) if (!x.visible) return false; return true; };
  const actors = [];
  const withMeshes = roots.filter((r) => { let n = 0; r.traverse((o) => { if (o.isMesh && !o.isInstancedMesh) n++; }); return n > 0; });
  // Match each figure to its entry in the scene data by where it stands at t = 0
  // (on its route, or at its spot): build order is not reliable enough.
  const segDist = (q, a, b) => {
    const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], aq = [q[0] - a[0], q[1] - a[1], q[2] - a[2]];
    const L = ab[0] * ab[0] + ab[1] * ab[1] + ab[2] * ab[2];
    const t = L > 0 ? Math.max(0, Math.min(1, (aq[0] * ab[0] + aq[1] * ab[1] + aq[2] * ab[2]) / L)) : 0;
    return Math.hypot(aq[0] - ab[0] * t, aq[1] - ab[1] * t, aq[2] - ab[2] * t);
  };
  const specDist = (q, sp) => {
    const r = sp.p.route;
    if (r && r.length > 1 && sp.period > 0) { let d = Infinity; for (let i = 0; i < r.length; i++) d = Math.min(d, segDist(q, r[i], r[(i + 1) % r.length])); return d; }
    const at = sp.p.at; return at ? Math.hypot(q[0] - at[0], q[1] - at[1], q[2] - at[2]) : Infinity;
  };
  const pairs = [];
  withMeshes.forEach((root, i) => { const q = root.position.toArray(); specs.forEach((sp, j) => pairs.push([specDist(q, sp), i, j])); });
  pairs.sort((x, y) => x[0] - y[0]);
  const specOf = new Map(), usedSpec = new Set();
  for (const [d, i, j] of pairs) { if (d > 0.5 || specOf.has(i) || usedSpec.has(j)) continue; specOf.set(i, specs[j]); usedSpec.add(j); }
  // Things two people carry between them (a pole with an amphora, a ball) are
  // moved by the page every frame: they ride along as pieces of the first person.
  const looseMeshes = group.children.filter((c) => c.isMesh && !c.isInstancedMesh);
  const looseGroups = withMeshes.filter((r, i) => !specOf.has(i));
  const carried = new Map(); // person index -> objects
  for (const l of life.links || []) {
    const things = [];
    if (l.kind === "ball") things.push(looseMeshes.shift());
    else { things.push(looseMeshes.shift()); things.push(looseGroups.shift()); }
    if (!carried.has(l.a)) carried.set(l.a, []);
    carried.get(l.a).push(...things.filter(Boolean));
  }
  const carriedSet = new Set([...carried.values()].flat());
  withMeshes.forEach((root, i) => {
    if (carriedSet.has(root)) return;
    const spec = specOf.get(i) || { kind: "other", period: 0, p: {} };
    const parts = [];
    root.traverse((o) => {
      if (!o.isMesh || o.isInstancedMesh || !shown(o, root)) return;
      const m = Array.isArray(o.material) ? o.material[0] : o.material;
      if (!m || m.isSpriteMaterial || m.isShaderMaterial || m.transparent) return;
      parts.push(o);
    });
    const k = spec.kind === "person" ? life.people.indexOf(spec.p) : -1;
    for (const t of carried.get(k) || []) t.traverse((o) => {
      if (!o.isMesh || o.isInstancedMesh || !o.visible) return;
      const m = Array.isArray(o.material) ? o.material[0] : o.material;
      if (!m || m.isSpriteMaterial || m.isShaderMaterial || m.transparent) return;
      parts.push(o);
    });
    // a walker loops its gait over a whole number of strides; the rest over LOOP seconds
    let window = LOOP, blend = BLEND;
    const p = spec.p;
    if (spec.kind === "person" && spec.period > 0 && (p.action === "walk" || p.action === "run" || !p.action)) {
      const strideLen = (p.action === "run" ? 1.6 : 0.75) * (p.look && p.look.old ? 0.72 : 1);
      const cycle = (2 * strideLen * p.height) / (p.speed ?? 1.1);
      window = Math.max(cycle, Math.round(6 / cycle) * cycle);
      blend = 0;
    }
    actors.push({ root, parts, kind: spec.kind, period: spec.period, window, blend, scale: root.scale.x });
  });

  // ---- shapes ----
  const pos = [], nrm = [], col = [], partId = [], idx = [];
  const partsMeta = [];
  let vbase = 0, pglobal = 0;
  const c3 = { r: 1, g: 1, b: 1 };
  for (let ai = 0; ai < actors.length; ai++) {
    const a = actors[ai];
    a.partBase = pglobal;
    for (const o of a.parts) {
      const g = o.geometry;
      const P = g.attributes.position, N = g.attributes.normal, C = g.attributes.color;
      const m = Array.isArray(o.material) ? o.material[0] : o.material;
      const mc = m.color || c3;
      for (let v = 0; v < P.count; v++) {
        pos.push(-P.getX(v), P.getY(v), P.getZ(v));
        if (N) nrm.push(-N.getX(v), N.getY(v), N.getZ(v)); else nrm.push(0, 1, 0);
        const cr = C && m.vertexColors ? C.getX(v) : 1, cg = C && m.vertexColors ? C.getY(v) : 1, cb = C && m.vertexColors ? C.getZ(v) : 1;
        col.push(cr * mc.r, cg * mc.g, cb * mc.b);
        partId.push(pglobal, ai);
      }
      if (g.index) {
        const I = g.index.array;
        for (let k = 0; k < I.length; k += 3) idx.push(vbase + I[k], vbase + I[k + 2], vbase + I[k + 1]);
      } else {
        for (let k = 0; k < P.count; k += 3) idx.push(vbase + k, vbase + k + 2, vbase + k + 1);
      }
      vbase += P.count;
      pglobal++;
    }
    a.partCount = a.parts.length;
  }

  // ---- motion ----
  const inv = new lifeHandle.group.matrixWorld.constructor();
  const rel = new lifeHandle.group.matrixWorld.constructor();
  const maxWindow = Math.max(...actors.map((a) => a.window));
  const maxPeriod = Math.max(maxWindow, ...actors.map((a) => a.period));
  const T = Math.ceil(maxPeriod * FPS) + 1;
  for (const a of actors) { a.frames = Math.max(1, Math.round(a.window * FPS)); a.anim = []; a.rootFrames = a.period > 0 ? Math.max(2, Math.round(a.period * ROOT_HZ)) : 1; a.track = []; }
  // mirror a three.js matrix into Unity's space and keep the top 3 rows (12 numbers)
  const rows = (e) => {
    // M' = S M S, S = diag(-1,1,1,1); column-major e[col*4+row]
    const m = (r, c) => e[c * 4 + r] * (r === 0 ? -1 : 1) * (c === 0 ? -1 : 1);
    return [m(0, 0), m(0, 1), m(0, 2), m(0, 3), m(1, 0), m(1, 1), m(1, 2), m(1, 3), m(2, 0), m(2, 1), m(2, 2), m(2, 3)];
  };
  for (let s = 0; s < T; s++) {
    const t = s / FPS;
    step(t);
    for (const a of actors) {
      if (s < a.frames) {
        inv.copy(a.root.matrixWorld).invert();
        for (const o of a.parts) { rel.multiplyMatrices(inv, o.matrixWorld); a.anim.push(...rows(rel.elements)); }
      }
      const rf = a.rootFrames;
      if (rf === 1) { if (s === 0) a.track.push(...rows(a.root.matrixWorld.elements)); }
      else { const due = Math.round((a.track.length / 12) * FPS / ROOT_HZ); if (a.track.length / 12 < rf && s === due) a.track.push(...rows(a.root.matrixWorld.elements)); }
    }
  }
  // blend the end of a non-looping clip back into its start
  for (const a of actors) {
    const nb = Math.round(a.blend * FPS);
    if (nb <= 0 || a.frames <= nb * 2) continue;
    const P = a.partCount * 12;
    for (let k = 0; k < nb; k++) {
      const f = a.frames - nb + k, w = (k + 1) / (nb + 1);
      for (let j = 0; j < P; j++) a.anim[f * P + j] = a.anim[f * P + j] * (1 - w) + a.anim[k * P + j] * w;
    }
  }

  // ---- seated crowds (instanced) ----
  const crowds = [];
  group.traverse((o) => {
    if (!o.isInstancedMesh) return;
    const g = o.geometry, P = g.attributes.position, N = g.attributes.normal;
    const m = Array.isArray(o.material) ? o.material[0] : o.material;
    const v = [], n = [], ix = [];
    for (let i = 0; i < P.count; i++) { v.push(-P.getX(i), P.getY(i), P.getZ(i)); n.push(N ? -N.getX(i) : 0, N ? N.getY(i) : 1, N ? N.getZ(i) : 0); }
    const I = g.index ? Array.from(g.index.array) : [...Array(P.count).keys()];
    for (let k = 0; k < I.length; k += 3) ix.push(I[k], I[k + 2], I[k + 1]);
    const mats = [], cols = [];
    const M = new lifeHandle.group.matrixWorld.constructor(), W = new lifeHandle.group.matrixWorld.constructor();
    o.updateWorldMatrix(true, false);
    for (let i = 0; i < o.count; i++) {
      o.getMatrixAt(i, M); W.multiplyMatrices(o.matrixWorld, M); mats.push(...rows(W.elements));
      if (o.instanceColor) { const a = o.instanceColor.array; cols.push(a[i * 3], a[i * 3 + 1], a[i * 3 + 2]); }
      else cols.push(m.color.r, m.color.g, m.color.b);
    }
    crowds.push({ v, n, ix, mats, cols, count: o.count });
  });

  return {
    meta: {
      fps: FPS, rootHz: ROOT_HZ,
      actors: actors.map((a) => ({ kind: a.kind, parts: a.partCount, partBase: a.partBase, frames: a.frames, window: a.window, rootFrames: a.rootFrames, period: a.period })),
      vertices: pos.length / 3, indices: idx.length, crowds: crowds.map((c) => ({ vertices: c.v.length / 3, indices: c.ix.length, count: c.count })),
    },
    pos, nrm, col, partId, idx,
    anim: actors.map((a) => a.anim), track: actors.map((a) => a.track), crowds,
  };
});

// ---- write ----
const f32 = [];
const push = (arr) => { f32.push(...arr); };
const meta = result.meta;
const layout = {};
const add = (name, arr) => { layout[name] = [f32.length, arr.length]; for (let i = 0; i < arr.length; i += 100000) f32.push(...arr.slice(i, i + 100000)); };
add("pos", result.pos); add("nrm", result.nrm); add("col", result.col); add("part", result.partId); add("idx", result.idx);
result.anim.forEach((a, i) => add(`anim${i}`, a));
result.track.forEach((a, i) => add(`track${i}`, a));
result.crowds.forEach((c, i) => { add(`cv${i}`, c.v); add(`cn${i}`, c.n); add(`ci${i}`, c.ix); add(`cm${i}`, c.mats); add(`cc${i}`, c.cols); });
meta.layout = layout;
fs.writeFileSync(`${outDir}/${id}-life.json`, JSON.stringify(meta));
fs.writeFileSync(`${outDir}/${id}-life.bin`, Buffer.from(new Float32Array(f32).buffer));
// ---- the same, packed for Unity (Assets/Antik/Life/<id>-life.bytes, read by AntikCrowdImport.cs) ----
{
  const chunks = [];
  const i32 = (arr) => chunks.push(Buffer.from(new Int32Array(arr).buffer));
  const f32a = (arr) => { for (let i = 0; i < arr.length; i += 1 << 20) chunks.push(Buffer.from(new Float32Array(arr.slice(i, i + (1 << 20))).buffer)); };
  const kinds = { person: 0, animal: 1, chariot: 2, other: 3 };
  i32([0x4b495441 /* "ATIK" */, 1, meta.fps, meta.rootHz, meta.actors.length, meta.vertices, meta.indices, result.crowds.length]);
  for (const a of meta.actors) i32([kinds[a.kind] ?? 3, a.parts, a.partBase, a.frames, a.rootFrames]);
  f32a(result.pos); f32a(result.nrm); f32a(result.col); f32a(result.partId); i32(result.idx);
  result.anim.forEach((a) => f32a(a));
  result.track.forEach((a) => f32a(a));
  for (const c of result.crowds) { i32([c.v.length / 3, c.ix.length, c.count]); f32a(c.v); f32a(c.n); i32(c.ix); f32a(c.mats); f32a(c.cols); }
  fs.writeFileSync(`${outDir}/${id}-life.bytes`, Buffer.concat(chunks));
}
const animFloats = result.anim.reduce((s, a) => s + a.length, 0);
console.log(id, "actors", meta.actors.length, "vertices", meta.vertices, "anim floats", animFloats, "crowds", JSON.stringify(meta.crowds), "bin MB", (f32.length * 4 / 1e6).toFixed(1));
await browser.close();
