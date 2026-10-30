// Antik Türkiye: only the fire of a scene, for Unity (see export-glb.mjs, which writes the same).
//   node export-fx.mjs <id> <outDir>
import { chromium } from "/opt/npm-tools/node_modules/playwright/index.mjs";
import fs from "node:fs";
const [id, outDir] = [process.argv[2], process.argv[3]];
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 320, height: 200 }, serviceWorkers: "block" });
await page.route(/fonts\.(googleapis|gstatic)|wikimedia|openstreetmap|openfreemap/, (r) => r.abort());
await page.goto(`http://127.0.0.1:5180/rekonstruksiyon/${id}`, { waitUntil: "domcontentloaded", timeout: 180000 });
await page.waitForFunction(() => window.__recon && window.__recon.renderer.info.render.frame > 3, null, { timeout: 300000 });
const fx = await page.evaluate(() => {
  const { scene, life, camera } = window.__recon;
  const lifeGroup = scene.children.find((c) => c.name === "life");
  const V = camera.position.constructor;
  return { flames: ((life && life.flames) || []).map((f) => {
    const v = new V(f.at[0], f.at[1], f.at[2]);
    if (lifeGroup) { lifeGroup.updateWorldMatrix(true, false); v.applyMatrix4(lifeGroup.matrixWorld); }
    return { p: [-v.x, v.y, v.z], size: f.size, light: !!f.light, smoke: !!f.smoke };
  }) };
});
fs.writeFileSync(`${outDir}/${id}-fx.json`, JSON.stringify(fx));
console.log(id, "fx flames", fx.flames.length);
await browser.close();
