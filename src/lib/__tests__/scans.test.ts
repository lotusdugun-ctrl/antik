import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { partsFor } from "@/lib/reconstruction-parts";
import { reconstructions } from "@/lib/reconstructions";
import { SCANS, scansFor, type ScanId } from "@/lib/scans";

const root = join(import.meta.dir, "..", "..", "..");

describe("scans", () => {
  test("every scan file is in public/ and credits its author and licence", () => {
    for (const [id, scan] of Object.entries(SCANS)) {
      expect(existsSync(join(root, "public", scan.url))).toBe(true);
      expect(scan.author.length).toBeGreaterThan(0);
      expect(scan.source).toStartWith("https://sketchfab.com/3d-models/");
      expect(scan.licenseUrl).toStartWith("https://creativecommons.org/licenses/");
      expect(scan.title.tr && scan.title.en && scan.note.tr && scan.note.en).toBeTruthy();
      expect(scan.url).toBe(`/scans/${id}.glb`);
    }
  });

  test("a scan set into a model is credited on that model's page", () => {
    for (const item of reconstructions) {
      const used = new Set<ScanId>();
      for (const part of partsFor(item.model)) if (part.scan) used.add(part.scan.id);
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
    expect(count("didyma-apollon-tapinagi", "didyma-medusa")).toBe(1);
    expect(count("pergamon-zeus-sunagi", "pergamon-athena")).toBe(1);
    expect(count("artemis-tapinagi", "artemision-drum")).toBeGreaterThan(0);
    expect(
      count("halikarnas-mozolesi", "mausoleum-amazon-1") +
        count("halikarnas-mozolesi", "mausoleum-amazon-2"),
    ).toBeGreaterThan(20);
  });
});
