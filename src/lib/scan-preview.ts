import type { Part } from "@/lib/reconstruction-parts";

/**
 * Preview: the real front of a building, as a photogrammetry scan, in place of
 * the modelled one. Shown only with `?tarama=1` in the address, so it can be
 * judged on the live site before it becomes the default.
 *
 * The scan (`public/scans/<id>.glb`, prepared by scripts in docs) is in metres,
 * its base at y = 0 and its front looking along +z; turned half round it looks
 * down -z like the modelled front, and `at` puts its bottom step where the
 * model's first step is (z = -3.96).
 */
const FRONTS: Record<string, { scan: "celsus-cephe"; at: [number, number, number]; height: number; halfWidth: number; depth: number }> = {
  "celsus-kutuphanesi": { scan: "celsus-cephe", at: [0, -0.15, 0.5], height: 18.7, halfWidth: 11.2, depth: 0.75 },
};

export function previewOn(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has("tarama");
}

export function withFrontScan(id: string, parts: Part[]): Part[] {
  const front = FRONTS[id];
  if (!front || !previewOn()) return parts;
  const kept = parts.filter((part) => {
    if (!("at" in part)) return true;
    const [x, y, z] = part.at;
    // Everything of the modelled front — steps, columns, statues, paint — gives way to the scan.
    return !(z < front.depth && Math.abs(x) < front.halfWidth && y < front.height + 1);
  });
  kept.push({
    kind: "figure",
    material: "marble",
    at: front.at,
    height: front.height,
    rotY: Math.PI,
    scan: { id: front.scan },
  });
  return kept;
}
