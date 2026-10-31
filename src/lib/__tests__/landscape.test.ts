import { describe, expect, test } from "bun:test";
import {
  biomeFor,
  distanceTo,
  footprintOf,
  obstaclesOf,
  planLandscape,
  waterOf,
} from "@/lib/landscape-plan";
import { boundsOf, partsFor, walkStartFor } from "@/lib/reconstruction-parts";
import { reconstructions } from "@/lib/reconstructions";
import { lifeFor } from "@/lib/scene-life";

/** The landscape as the viewer plans it for a model (see Reconstruction3DInner). */
function planFor(item: (typeof reconstructions)[number]) {
  const parts = partsFor(item.model);
  const all = [...parts, ...lifeFor(item).props];
  const { min, max } = boundsOf(parts);
  const span = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]);
  const plan = planLandscape({
    centre: { x: (min[0] + max[0]) / 2, z: (min[2] + max[2]) / 2 },
    span,
    groundY: min[1] - 0.06,
    footprint: Math.hypot((max[0] - min[0]) / 2, (max[2] - min[2]) / 2),
    biome: biomeFor(item.id),
    parts: all,
  });
  return { parts, all, plan };
}

const plans = reconstructions.map((item) => ({ item, ...planFor(item) }));

describe("the country round each model", () => {
  test("no tree, bush or rock stands in water", () => {
    for (const { item, plan } of plans) {
      const water = waterOf(plans.find((p) => p.item === item)!.all);
      for (const t of [...plan.trees, ...plan.rocks, ...plan.shrubs]) {
        for (const w of water) {
          const d = distanceTo(w, t.x, t.z);
          expect(`${item.id} ${t.x.toFixed(1)},${t.z.toFixed(1)}: ${d > 1}`).toBe(
            `${item.id} ${t.x.toFixed(1)},${t.z.toFixed(1)}: true`,
          );
        }
      }
    }
  }, 60000);

  test("no tree, bush or rock stands inside a wall, a road, a cliff or the model's own trees", () => {
    for (const { item, plan, all } of plans) {
      const solid = obstaclesOf(all);
      for (const t of [...plan.trees, ...plan.rocks, ...plan.shrubs]) {
        const inside = solid.find((f) => distanceTo(f, t.x, t.z) < 0.3);
        expect(`${item.id} ${t.x.toFixed(1)},${t.z.toFixed(1)}: ${inside === undefined}`).toBe(
          `${item.id} ${t.x.toFixed(1)},${t.z.toFixed(1)}: true`,
        );
      }
    }
  }, 60000);

  test("the ground lies under the surface of every river and sea", () => {
    for (const { item, plan } of plans) {
      for (const w of plan.water.filter((b) => b.hx * b.hz >= 40)) {
        // A grid of points well inside the water.
        for (let i = -4; i <= 4; i += 1)
          for (let j = -4; j <= 4; j += 1) {
            const u = (i / 4.5) * w.hx;
            const v = (j / 4.5) * w.hz;
            const c = Math.cos(w.rot);
            const s = Math.sin(w.rot);
            const x = w.x + u * c + v * s;
            const z = w.z - u * s + v * c;
            // (a band up to 29 m inside a large water's edge is shore: landscape-plan.ts)
            const band = Math.min(w.hx, w.hz) > 30 ? 30 : 1;
            if (distanceTo(w, x, z) > -band) continue;
            expect(`${item.id}: ${plan.heightAt(x, z) < w.top}`).toBe(`${item.id}: true`);
          }
      }
    }
  });

  test("no scenery floats on the water", () => {
    for (const { item, parts } of plans) {
      const water = waterOf(parts).filter((w) => w.hx * w.hz >= 40);
      for (const part of parts) {
        if (!part.decor || part.material === "water") continue;
        const wet = water.some((w) => distanceTo(w, part.at[0], part.at[2]) < -0.5);
        expect(`${item.id} ${part.material} ${part.at.join(",")}: ${wet}`).toBe(
          `${item.id} ${part.material} ${part.at.join(",")}: false`,
        );
      }
    }
  });

  test("each site has the trees of its own country", () => {
    const of = (id: string) => plans.find((p) => p.item.id === id)!.plan;
    // Sümela: a forest of spruce and beech, far denser than anywhere else.
    const sumela = of("sumela-manastiri");
    expect(biomeFor("sumela-manastiri")).toBe("pontic");
    expect(sumela.trees.filter((t) => t.kind === "conifer").length).toBeGreaterThan(200);
    expect(sumela.trees.filter((t) => t.kind === "crown").length).toBeGreaterThan(80);
    // Sagalassos at 1,500 m: pines and juniper, no cypress or olive groves.
    expect(biomeFor("sagalassos-antoninler-cesmesi")).toBe("alpine");
    const sagalassos = of("sagalassos-antoninler-cesmesi");
    expect(sagalassos.trees.some((t) => t.kind === "conifer")).toBe(true);
    expect(sagalassos.trees.some((t) => t.kind === "cypress")).toBe(false);
    // Nemrut's summit is bare.
    expect(of("nemrut-dogu-terasi").trees.length).toBe(0);
    // The coast still has its cypresses and olives.
    expect(of("celsus-kutuphanesi").trees.some((t) => t.kind === "cypress")).toBe(true);
    // Zeugma and Patara still have trees, just not in the water.
    expect(of("zeugma-villa").trees.length).toBeGreaterThan(30);
    expect(of("patara-deniz-feneri").trees.length).toBeGreaterThan(30);
  });
});

describe("where a walk begins", () => {
  test("nobody starts a walk inside a tree, a prop, a wall or a person", () => {
    for (const item of reconstructions) {
      const life = lifeFor(item);
      const start = walkStartFor(item.model);
      const [x, z] = start.at;
      // Anything up to a step high is stood on, not walked into.
      const body = [start.floor + 0.45, start.floor + 1.8] as const;
      for (const part of [...partsFor(item.model), ...life.props]) {
        // Seat rows and banks are floors to stand on; their footprint is no square.
        if (part.kind === "figure" || part.kind === "ring" || part.kind === "bank") continue;
        if (part.material === "grass") continue;
        const f = footprintOf(part);
        if (!f || distanceTo(f, x, z) > 0.2) continue;
        const bottom = part.at[1];
        // Something under the feet (a floor, a step) or over the head is fine.
        if (f.top <= body[0] || bottom >= body[1]) continue;
        expect(`${item.id}: in ${part.material} ${part.kind} at ${part.at.join(",")}`).toBe(
          `${item.id}: clear`,
        );
      }
      for (const person of life.people) {
        const d = Math.hypot(person.at[0] - x, person.at[2] - z);
        const level = Math.abs(person.at[1] - start.floor) < 1.5;
        expect(`${item.id}: person ${d.toFixed(2)} m away: ${!level || d > 0.7}`).toBe(
          `${item.id}: person ${d.toFixed(2)} m away: true`,
        );
      }
    }
  }, 60000);
});
