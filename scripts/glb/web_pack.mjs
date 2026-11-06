// Pişmiş bir yeri (antik_bake.py çıktısı) web uygulamasına hazırlar: public/baked/<id>/
//   node scripts/glb/web_pack.mjs <bake_out_dir> <id>
// Aynı dokuları tekle → dokular JPEG → gltfpack meshopt sıkıştırma (-cc; uygulama MeshoptDecoder ile açar)
// → ışık haritaları JPEG (kalite 90) → bake.json (dosya listesi ve JPEG adlarıyla).
// Windows'ta PISIR-WEB.bat çalıştırır; araçlar scripts/glb/node_modules içinde.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const app = path.resolve(here, "..", "..");
const [src, id] = process.argv.slice(2);
const dst = path.join(app, "public", "baked", id);
fs.mkdirSync(dst, { recursive: true });
const tmp = fs.mkdtempSync(path.join(src, ".pack-"));
// The tools' own entry scripts, run with this node (bun on Windows makes no .cmd shims in .bin).
const CLI = {
  "gltf-transform": path.join(here, "node_modules", "@gltf-transform", "cli", "bin", "cli.js"),
  gltfpack: path.join(here, "node_modules", "gltfpack", "cli.js"),
};
const run = (name, args) =>
  execFileSync(process.execPath, [CLI[name], ...args], { stdio: "inherit" });

const baked = path.join(src, `${id}-baked.glb`);
run("gltf-transform", ["dedup", baked, path.join(tmp, "d.glb")]);
run("gltf-transform", [
  "jpeg",
  path.join(tmp, "d.glb"),
  path.join(tmp, "j.glb"),
  "--quality",
  "85",
]);
for (const f of fs.readdirSync(dst))
  if (/\.(glb|jpg|png|json)$/.test(f) && !f.endsWith("-skirt.glb")) fs.rmSync(path.join(dst, f));
run("gltfpack", [
  "-i",
  path.join(tmp, "j.glb"),
  "-o",
  path.join(dst, `${id}-baked.glb`),
  "-kn",
  "-km",
  "-ke",
  "-kv",
  "-vp",
  "16",
  "-vtf",
  "-vpf",
  "-cc",
]);

const meta = JSON.parse(fs.readFileSync(path.join(src, `${id}-bake.json`), "utf8"));
for (const [part, png] of Object.entries(meta.maps)) {
  if (!png) continue;
  const jpg = png.replace(/\.png$/, ".jpg");
  await sharp(path.join(src, png)).jpeg({ quality: 90 }).toFile(path.join(dst, jpg));
  meta.maps[part] = jpg;
}
meta.files = [`${id}-baked.glb`];
fs.writeFileSync(path.join(dst, `${id}-bake.json`), JSON.stringify(meta, null, 1));
const skirt = path.join(src, `${id}-skirt.glb`);
const fallbackSkirt = path.join(
  app,
  "unity",
  "AntikViewer",
  "Assets",
  "Antik",
  "Baked",
  `${id}-skirt.glb`,
);
if (fs.existsSync(skirt)) {
  fs.copyFileSync(skirt, path.join(dst, `${id}-skirt.glb`));
} else if (fs.existsSync(fallbackSkirt) && !fs.existsSync(path.join(dst, `${id}-skirt.glb`))) {
  fs.copyFileSync(fallbackSkirt, path.join(dst, `${id}-skirt.glb`));
}
fs.rmSync(tmp, { recursive: true, force: true });
const size = fs.readdirSync(dst).reduce((n, f) => n + fs.statSync(path.join(dst, f)).size, 0);
console.log(`[web_pack] ${id}: ${(size / 1e6).toFixed(1)} MB -> ${dst}`);
