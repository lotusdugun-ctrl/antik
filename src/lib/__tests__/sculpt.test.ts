import { describe, expect, test } from "bun:test";
import { gateLion, horse, lionMask } from "@/lib/beasts";
import { sculptBounds, sculptDistance, sculptMesh, type Mass } from "@/lib/sculpt";

/** Every triangle's winding against the normals at its corners: +1 outward. */
function outward(mesh: ReturnType<typeof sculptMesh>) {
  const { positions: P, normals: N, indices: I } = mesh;
  let agree = 0;
  for (let f = 0; f < I.length; f += 3) {
    const [a, b, c] = [I[f]! * 3, I[f + 1]! * 3, I[f + 2]! * 3];
    const e1 = [P[b]! - P[a]!, P[b + 1]! - P[a + 1]!, P[b + 2]! - P[a + 2]!];
    const e2 = [P[c]! - P[a]!, P[c + 1]! - P[a + 1]!, P[c + 2]! - P[a + 2]!];
    const n = [
      e1[1]! * e2[2]! - e1[2]! * e2[1]!,
      e1[2]! * e2[0]! - e1[0]! * e2[2]!,
      e1[0]! * e2[1]! - e1[1]! * e2[0]!,
    ];
    if (n[0]! * N[a]! + n[1]! * N[a + 1]! + n[2]! * N[a + 2]! > 0) agree += 1;
  }
  return agree / (I.length / 3);
}

describe("sculpted form", () => {
  test("a ball comes out round, its faces and normals turned outward", () => {
    const ball: Mass[] = [{ egg: [0, 1, 0], r: [0.5, 0.5, 0.5] }];
    const mesh = sculptMesh(ball, 0.04);
    expect(mesh.indices.length).toBeGreaterThan(1000);
    for (let i = 0; i < mesh.positions.length; i += 3) {
      const r = Math.hypot(mesh.positions[i]!, mesh.positions[i + 1]! - 1, mesh.positions[i + 2]!);
      expect(Math.abs(r - 0.5)).toBeLessThan(0.01);
    }
    expect(outward(mesh)).toBe(1);
  });

  test("masses merge with a fillet, and a cut carves a hollow", () => {
    const rod: Mass = {
      rod: [
        [-1, 0, 0],
        [1, 0, 0],
      ],
      ra: 0.2,
      rb: 0.2,
    };
    const ball: Mass = { egg: [0, 0.35, 0], r: [0.2, 0.2, 0.2] };
    // Between the two, a fillet fills what a hard union would leave empty.
    const between: [number, number, number] = [0.18, 0.22, 0];
    expect(sculptDistance([rod, ball], between)).toBeGreaterThan(0);
    expect(sculptDistance([rod, { ...ball, k: 0.2 }], between)).toBeLessThan(0);
    const hollow: Mass = { egg: [0, 0.2, 0], r: [0.1, 0.1, 0.1], cut: true };
    expect(sculptDistance([rod], [0, 0.15, 0])).toBeLessThan(0);
    expect(sculptDistance([rod, hollow], [0, 0.15, 0])).toBeGreaterThan(0);
  });

  test("the statue beasts are closed, outward-facing and of a reasonable weight", () => {
    for (const [name, masses, cell, budget] of [
      ["horse", horse(1), 0.024, 40_000],
      ["gate lion", gateLion(2.1), 2.1 * 0.013, 45_000],
      ["spout", lionMask(0.45), 0.45 / 26, 6_000],
      ["sima spout", lionMask(0.5, true), 0.5 / 13, 1_500],
    ] as const) {
      const mesh = sculptMesh(masses, cell);
      const triangles = mesh.indices.length / 3;
      expect(`${name}:${triangles > 1000 && triangles < budget}`).toBe(`${name}:true`);
      // A few faces in the tightest creases (a lip, a nostril) may fold.
      expect(outward(mesh)).toBeGreaterThan(0.97);
    }
    // The horse stands on its hooves, at a horse's height.
    const { min, max } = sculptBounds(horse(0));
    expect(min[1]).toBeLessThan(0.02);
    expect(max[1]).toBeGreaterThan(2.0);
    expect(max[1]).toBeLessThan(2.4);
    expect(sculptDistance(horse(0), [0.145, 0.01, -0.71])).toBeLessThan(0);
    expect(sculptDistance(horse(0), [0.145, -0.02, -0.71])).toBeGreaterThan(0);
  }, 30_000);
});
