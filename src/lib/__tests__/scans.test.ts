import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { partsFor, type Part } from "@/lib/reconstruction-parts";
import { reconstructions } from "@/lib/reconstructions";
import { lifeFor, STATUE_MATERIALS } from "@/lib/scene-life";
import { SCANS, scansFor, type ScanId } from "@/lib/scans";

const root = join(import.meta.dir, "..", "..", "..");

describe("scans", () => {
  test("every scan file is in public/ and credits its author and licence", () => {
    for (const [id, scan] of Object.entries(SCANS)) {
      expect(existsSync(join(root, "public", scan.url))).toBe(true);
      expect(scan.author.length).toBeGreaterThan(0);
      const free = scan.license === "Free archive";
      expect(scan.source).toStartWith(
        free ? "https://threedscans.com/" : "https://sketchfab.com/3d-models/",
      );
      expect(scan.licenseUrl).toStartWith(
        free ? "https://threedscans.com/" : "https://creativecommons.org/licenses/",
      );
      expect(scan.title.tr && scan.title.en && scan.note.tr && scan.note.en).toBeTruthy();
      expect(scan.url).toBe(`/scans/${id}.glb`);
    }
  });

  test("no scan carries a NonCommercial, NoDerivatives or unknown licence", () => {
    // The app is published commercially (Google Play); NC scans are not allowed.
    for (const [id, scan] of Object.entries(SCANS)) {
      expect(`${id}:${scan.license}`).toMatch(/:(CC BY 4\.0|Free archive)$/);
      expect(`${id}:${scan.licenseUrl}`).not.toMatch(/-nc|-nd|noncommercial/i);
      if (scan.license === "CC BY 4.0")
        expect(`${id}:${scan.licenseUrl}`).toBe(
          `${id}:https://creativecommons.org/licenses/by/4.0/`,
        );
    }
    // And no file is shipped that the list does not credit.
    const files = readdirSync(join(root, "public", "scans")).filter((f) => f.endsWith(".glb"));
    const listed = new Set(Object.values(SCANS).map((s) => s.url.replace("/scans/", "")));
    expect(files.filter((f) => !listed.has(f))).toEqual([]);
  });

  test("a scan set into a model is credited on that model's page", () => {
    for (const item of reconstructions) {
      const used = new Set<ScanId>();
      for (const part of [...partsFor(item.model), ...lifeFor(item).props])
        if (part.scan) used.add(part.scan.id);
      const shown = new Set(scansFor(item.id));
      for (const id of used)
        expect(`${item.id}:${id}:${shown.has(id)}`).toBe(`${item.id}:${id}:true`);
    }
  });

  test("the scans replace the parts they were meant to", () => {
    const count = (id: string, scan: ScanId) =>
      partsFor(reconstructions.find((r) => r.id === id)!.model).filter((p) => p.scan?.id === scan)
        .length;
    expect(count("celsus-kutuphanesi", "celsus-sophia")).toBe(1);
    expect(count("celsus-kutuphanesi", "celsus-arete")).toBe(1);
    // The four lost statues of the upper storey are four different stand-ins
    // (the two bronzes on the bases by the stair are not among them).
    const marble = (id: ScanId) =>
      partsFor(reconstructions.find((r) => r.id === "celsus-kutuphanesi")!.model).filter(
        (p) => p.scan?.id === id && p.material !== "bronze",
      ).length;
    for (const id of ["tiberius-velatus", "arringatore", "ephesus-portrait", "augustus"] as const)
      expect(marble(id)).toBe(1);
    expect(count("celsus-kutuphanesi", "muse-polyhymnia")).toBe(1);
    expect(count("celsus-kutuphanesi", "caryatid")).toBe(1);
    expect(count("aizanoi-zeus-tapinagi", "neptune")).toBe(1);
    expect(count("didyma-apollon-tapinagi", "didyma-medusa")).toBe(1);
    expect(count("artemis-tapinagi", "artemision-drum")).toBeGreaterThan(0);
    expect(
      count("halikarnas-mozolesi", "mausoleum-amazon-1") +
        count("halikarnas-mozolesi", "mausoleum-amazon-2"),
    ).toBeGreaterThan(20);
  });

  test("no statue is left as a procedural figure", () => {
    // People are figures too, but of `human` and not of stone or metal.
    const statue = (part: Part) =>
      part.kind === "figure" &&
      (part.identity !== undefined || STATUE_MATERIALS.includes(part.material)) &&
      part.material !== "human";
    for (const item of reconstructions) {
      const bare = [...partsFor(item.model), ...lifeFor(item).props]
        .filter((part) => statue(part) && !part.scan)
        .map((part) => (part.kind === "figure" ? (part.identity?.name ?? part.material) : ""));
      expect(`${item.id}: ${bare.join(", ")}`).toBe(`${item.id}: `);
    }
  }, 30_000);

  test("the scanned statues stand on what carries them", () => {
    // The Mausoleum's dynasts on its podium and in its chariot, the bronzes
    // on the Celsus bases, the benefactors in the theatres' wing niches.
    const tomb = partsFor(reconstructions.find((r) => r.id === "halikarnas-mozolesi")!.model);
    const dynasts = tomb.filter((p) => p.kind === "figure" && p.identity);
    expect(dynasts.length).toBe(22);
    expect(dynasts.every((p) => p.scan)).toBe(true);
    const celsus = partsFor(reconstructions.find((r) => r.id === "celsus-kutuphanesi")!.model);
    const bronzes = celsus.filter((p) => p.kind === "figure" && p.material === "bronze");
    expect(bronzes.map((p) => p.scan?.id).sort()).toEqual(["arringatore", "tiberius-velatus"]);
    // Feet on the top of the base: 2.68 m of plinth and a 0.26 m cap.
    for (const p of bronzes) expect(p.at[1]).toBeCloseTo(2.94, 2);
    for (const item of reconstructions.filter((r) => r.model.kind === "roman-theatre")) {
      const niche = partsFor(item.model).filter(
        (p) => p.kind === "figure" && p.identity?.name === "Benefactor",
      );
      expect(`${item.id}: ${niche.length}`).toBe(`${item.id}: 2`);
      expect(niche.every((p) => p.scan)).toBe(true);
    }
  }, 30_000);

  test("no stage front repeats one statue more than twice", () => {
    for (const item of reconstructions.filter((r) => r.model.kind === "roman-theatre")) {
      const tally: Record<string, number> = {};
      for (const part of lifeFor(item).props)
        if (part.scan) tally[part.scan.id] = (tally[part.scan.id] ?? 0) + 1;
      expect(Math.max(...Object.values(tally))).toBeLessThanOrEqual(2);
      expect(Object.keys(tally).length).toBeGreaterThanOrEqual(8);
    }
  });
});

/*
 * A scan is drawn once for every part that uses it, so a statue repeated down
 * a stage front costs its triangles each time. Phones stutter well before
 * two million, so each file has a budget and each model a total.
 */
type Gltf = {
  accessors: { count: number; min?: number[]; max?: number[] }[];
  meshes: { primitives: { indices?: number; attributes: Record<string, number> }[] }[];
};

function readGlb(id: ScanId): Gltf {
  const file = readFileSync(join(root, "public", SCANS[id].url));
  // 12-byte header, then the JSON chunk: its length, its type, its bytes.
  expect(file.toString("latin1", 0, 4)).toBe("glTF");
  const length = file.readUInt32LE(12);
  return JSON.parse(file.toString("utf8", 20, 20 + length)) as Gltf;
}

function trianglesOf(gltf: Gltf): number {
  let triangles = 0;
  for (const mesh of gltf.meshes)
    for (const primitive of mesh.primitives) {
      const accessor = primitive.indices ?? primitive.attributes["POSITION"]!;
      triangles += gltf.accessors[accessor]!.count / 3;
    }
  return triangles;
}

/** Pieces seen close up, once in their model, may keep more of their surface. */
const HERO_BUDGET: Partial<Record<ScanId, number>> = {
  "didyma-medusa": 60_000,
  "nemrut-head": 55_000,
  caryatid: 45_000,
  "ephesus-portrait": 45_000,
  "herm-thucydides-herodotus": 35_000,
  "herm-epicurus-metrodorus": 35_000,
  "herm-socrates-seneca": 35_000,
  "herm-plato": 35_000,
  centaur: 35_000,
  glykon: 35_000,
  eagle: 35_000,
  "lion-delos": 35_000,
};
const SCAN_BUDGET = 25_000;
const MODEL_BUDGET = 1_200_000;

describe("scan budgets", () => {
  test("every scan file stays within its triangle budget", () => {
    for (const id of Object.keys(SCANS) as ScanId[]) {
      const triangles = trianglesOf(readGlb(id));
      const budget = HERO_BUDGET[id] ?? SCAN_BUDGET;
      expect(`${id}:${triangles <= budget}`).toBe(`${id}:true`);
    }
  });

  test("no scan's surface is flattened to a line by re-quantising", () => {
    for (const id of Object.keys(SCANS) as ScanId[]) {
      const gltf = readGlb(id);
      for (const mesh of gltf.meshes)
        for (const primitive of mesh.primitives) {
          const { min, max } = gltf.accessors[primitive.attributes["POSITION"]!]!;
          const flat = [0, 1, 2].filter((axis) => min![axis] === max![axis]);
          expect(`${id}:${flat.length}`).toBe(`${id}:0`);
        }
    }
  });

  test("the scans of one model stay within the model's triangle budget", () => {
    const triangles = new Map<ScanId, number>();
    for (const item of reconstructions) {
      let total = 0;
      for (const part of [...partsFor(item.model), ...lifeFor(item).props]) {
        const id = part.scan?.id;
        if (!id) continue;
        if (!triangles.has(id)) triangles.set(id, trianglesOf(readGlb(id)));
        total += triangles.get(id)!;
      }
      expect(`${item.id}:${total <= MODEL_BUDGET}`).toBe(`${item.id}:true`);
    }
  });
});
