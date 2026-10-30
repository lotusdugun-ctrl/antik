import { chromium } from "/opt/npm-tools/node_modules/playwright/index.mjs";
import fs from "node:fs";
const [id, outDir] = [process.argv[2], process.argv[3]];
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 640, height: 400 }, serviceWorkers: "block" });
await page.route(/fonts\.(googleapis|gstatic)|wikimedia|openstreetmap|openfreemap/, (r) => r.abort());
page.on("pageerror", (e) => console.log("PAGEERR", e.message.slice(0, 200)));
page.on("console", (m) => { if (m.text().startsWith("props")) console.log(m.text()); });
await page.goto(`http://127.0.0.1:5180/rekonstruksiyon/${id}`, { waitUntil: "domcontentloaded", timeout: 180000 });
await page.waitForFunction(() => window.__recon && window.__recon.renderer.info.render.frame > 3, null, { timeout: 300000 });
// let the statue scans stream in
// (the scene's own "scans" group; the batch inside "life" has the same name)
await page.waitForFunction(() => { const s = window.__recon.scene.children.find((c) => c.name === "scans"); return !s || s.children.length > 0; }, null, { timeout: 120000 }).catch(() => console.log("no scans"));
await page.waitForTimeout(4000);
const parts = await page.evaluate(async () => {
  const { GLTFExporter } = await import("/node_modules/three/examples/jsm/exporters/GLTFExporter.js");
  const { scene } = window.__recon; const o_Mesh = scene.children.find((x) => x.isMesh).constructor;
  const exportable = (o) => {
    const m = o.material; const mats = Array.isArray(m) ? m : [m];
    return mats.every((x) => x && !x.isShaderMaterial && !x.isSpriteMaterial && !x.isPointsMaterial && x.depthWrite !== false);
  };
  const groups = { building: [], landscape: [], people: [] };
  // The web's little sky dressing: soft white cloud puffs and dark bird specks hanging
  // high over the site. The Unity sky draws its own moving clouds; left in, these cast
  // round shadows in the baked light and hang frozen.
  const skyDressing = (o) => {
    const m = Array.isArray(o.material) ? o.material[0] : o.material;
    o.geometry.computeBoundingBox();
    const minY = o.geometry.boundingBox.min.clone().applyMatrix4(o.matrixWorld).y;
    const n = o.geometry.attributes.position.count;
    const cloud = m && m.transparent && m.opacity < 0.95 && m.color && m.color.r > 0.9 && m.color.g > 0.9 && m.color.b > 0.9;
    const bird = n <= 12 && minY > 20;
    return (cloud && minY > 15) || bird;
  };
  let dropped = 0;
  for (const c of scene.children) {
    if (c.name === "life") {
      const shown = (o) => { for (let p = o; p && p !== c; p = p.parent) if (!p.visible) return false; return true; };
      // The people (they walk in Unity: export-life.mjs) ...
      const actors = window.__recon.lifeHandle ? window.__recon.lifeHandle.group : c;
      actors.traverse((o) => { if (o.isMesh && !o.isBatchedMesh && shown(o) && exportable(o)) groups.people.push(o); });
      // ... and what stands still among them (tables, shelves, stalls, lamps, the statues
      // and herms, whose own meshes stay in the scene beside the batch that draws them):
      // part of the building, so it is baked with it.
      if (actors !== c)
        for (const k of c.children) {
          if (k === actors) continue;
          k.traverse((o) => { if (o.isMesh && !o.isBatchedMesh && !o.isInstancedMesh && shown(o) && exportable(o)) groups.building.push(o); });
        }
      console.log("props", c.children.filter((k) => k !== actors).length, "life scans", c.children.filter((k) => k.name.startsWith("scan:")).length);
      if (false) {
        }
    } else if (c.name === "landscape") {
      c.traverse((o) => { if (o.isMesh && exportable(o)) groups.landscape.push(o); });
    } else if (c.name === "weather" || c.isLight || c.isPoints) {
      continue;
    } else {
      c.traverse((o) => { if (o.isMesh && o.visible && exportable(o)) { if (skyDressing(o)) dropped++; else groups.building.push(o); } });
    }
  }
  console.log("props sky dressing dropped", dropped);
  // The water keeps a name, so Unity can give it a moving surface (AntikFx.cs).
  for (const o of groups.building) {
    for (const m of Array.isArray(o.material) ? o.material : [o.material])
      if (m && m.color && m.color.getHex() === 0x3f7088) m.name = "antik-water";
  }
  // Fire for Unity (it draws its own, with particles and flickering lights): every flame
  // of the scene's life, in world space, x mirrored into Unity's frame.
  {
    const lifeGroup = scene.children.find((c) => c.name === "life");
    const flames = (window.__recon.life && window.__recon.life.flames) || [];
    const V = window.__recon.camera.position.constructor;
    window.__fx = { flames: flames.map((f) => {
      const v = new V(f.at[0], f.at[1], f.at[2]);
      if (lifeGroup) { lifeGroup.updateWorldMatrix(true, false); v.applyMatrix4(lifeGroup.matrixWorld); }
      return { p: [-v.x, v.y, v.z], size: f.size, light: !!f.light, smoke: !!f.smoke };
    }) };
  }
  const out = {};
  const exporter = new GLTFExporter();
  const { mergeGeometries } = await import("/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js");
  // The crowd is thousands of small pieces: bake each into world space and merge per material.
  {
    const buckets = new Map();
    for (const o of groups.people) {
      if (o.isInstancedMesh || Array.isArray(o.material)) continue;
      o.updateWorldMatrix(true, false);
      const g = o.geometry.clone().applyMatrix4(o.matrixWorld);
      for (const k of Object.keys(g.attributes)) if (!["position", "normal", "uv", "color"].includes(k)) g.deleteAttribute(k);
      const key = o.material.uuid + "|" + Object.keys(g.attributes).sort().join(",") + "|" + (g.index ? 1 : 0);
      if (!buckets.has(key)) buckets.set(key, { mat: o.material, geos: [] });
      buckets.get(key).geos.push(g);
    }
    const merged = [];
    for (const { mat, geos } of buckets.values()) {
      const g = mergeGeometries(geos, false);
      if (g) { const m = new o_Mesh(g, mat); merged.push(m); }
    }
    groups.people = [...groups.people.filter((o) => o.isInstancedMesh || Array.isArray(o.material)), ...merged];
  }
  for (const [name, list] of Object.entries(groups)) {
    const plain = list.filter((o) => !o.isBatchedMesh);
    const stats = { meshes: plain.length, batchedSkipped: list.length - plain.length, tris: 0 };
    for (const o of plain) { const g = o.geometry; stats.tris += (g.index ? g.index.count : g.attributes.position.count) / 3 * (o.isInstancedMesh ? o.count : 1); }
    if (!plain.length) { out[name] = { stats }; continue; }
    // export world-space copies so parent transforms are baked
    const roots = plain.map((o) => { const c = o.clone(false); o.updateWorldMatrix(true, false); c.matrixAutoUpdate = false; c.matrix.copy(o.matrixWorld); c.matrixWorld.copy(o.matrixWorld); c.matrix.decompose(c.position, c.quaternion, c.scale); c.matrixAutoUpdate = true; return c; });
    const buf = await new Promise((res, rej) => exporter.parse(roots, res, rej, { binary: true, onlyVisible: false, maxTextureSize: 2048 }));
    const bytes = new Uint8Array(buf); let s = ""; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    out[name] = { stats, b64: btoa(s) };
  }
  return out;
});
for (const [name, r] of Object.entries(parts)) {
  console.log(id, name, JSON.stringify(r.stats));
  if (r.b64) { const p = `${outDir}/${id}-${name}.glb`; fs.writeFileSync(p, Buffer.from(r.b64, "base64")); console.log("  ->", p, (fs.statSync(p).size / 1e6).toFixed(2), "MB"); }
}
const fx = await page.evaluate(() => window.__fx || { flames: [] });
fs.writeFileSync(`${outDir}/${id}-fx.json`, JSON.stringify(fx));
console.log(id, "fx flames", fx.flames.length);
await browser.close();
