import { describe, expect, test } from "bun:test";
import { boundsOf, IDENTITIES, partsFor, type Part } from "@/lib/reconstruction-parts";
import { reconstructions } from "@/lib/reconstructions";
import { lifeFor } from "@/lib/scene-life";

/**
 * The life of a scene is illustration, not measurement — but it still has to
 * sit in the building it illustrates: nobody under the floor, nothing that
 * moves the camera, nothing that pretends to be part of the measured model.
 */

const lives = reconstructions.map((item) => ({ item, life: lifeFor(item) }));

describe("the life of each scene", () => {
  test("every reconstruction has people and at least one fire", () => {
    for (const { item, life } of lives) {
      expect(`${item.id}: ${life.people.length > 5}`).toBe(`${item.id}: true`);
      expect(`${item.id}: ${life.flames.length > 0}`).toBe(`${item.id}: true`);
    }
  });

  test("the same scene comes out the same every time", () => {
    for (const item of reconstructions) {
      expect(JSON.stringify(lifeFor(item))).toBe(JSON.stringify(lifeFor(item)));
    }
  });

  test("every prop is decor, so it never moves the camera's frame", () => {
    for (const { item, life } of lives) {
      const loose = life.props.filter((part) => !part.decor);
      expect(`${item.id}: ${loose.length}`).toBe(`${item.id}: 0`);
      // And adding them to the building leaves its bounds exactly as they were.
      const parts = partsFor(item.model);
      expect(boundsOf([...parts, ...life.props])).toEqual(boundsOf(parts));
    }
  });

  /**
   * Scale is the whole argument of a reconstruction. The people of the
   * scene are what give it now — a 19.7 m column next to a crowd of
   * ordinary people cannot be read as an ordinary column.
   */
  test("people are people-sized, and stand on or above the ground", () => {
    for (const { item, life } of lives) {
      for (const person of life.people) {
        expect(person.height).toBeGreaterThan(1);
        expect(person.height).toBeLessThan(1.9);
        expect(person.at[1]).toBeGreaterThanOrEqual(0);
        for (const point of person.route ?? []) expect(point[1]).toBeGreaterThanOrEqual(0);
      }
      expect(life.props.every((part) => part.at[1] >= -0.01)).toBe(true);
      void item;
    }
  });

  test("nobody wanders off: every person stays within reach of the building", () => {
    for (const { item, life } of lives) {
      const { min, max } = boundsOf(partsFor(item.model));
      const margin = 45;
      for (const person of life.people) {
        for (const p of [person.at, ...(person.route ?? [])]) {
          expect(p[0]).toBeGreaterThan(min[0] - margin);
          expect(p[0]).toBeLessThan(max[0] + margin);
          expect(p[2]).toBeGreaterThan(min[2] - margin);
          expect(p[2]).toBeLessThan(max[2] + margin);
        }
      }
    }
  });

  test("a crowd stays within what a phone can draw", () => {
    for (const { life } of lives) expect(life.crowd.length).toBeLessThan(3200);
    const theatres = lives.filter(({ item }) => item.model.kind === "roman-theatre");
    for (const { life } of theatres) expect(life.crowd.length).toBeGreaterThan(500);
  });

  test("a scene asks for only a handful of real lights", () => {
    for (const { item, life } of lives) {
      const lit = life.flames.filter((f) => f.light).length;
      expect(`${item.id}: ${lit > 0 && lit <= 8}`).toBe(`${item.id}: true`);
    }
  });

  test("the Göbeklitepe people wear hides, and Nemrut's priests Persian dress", () => {
    const gobekli = lives.find(({ item }) => item.id === "gobeklitepe-d-yapisi")!.life;
    expect(gobekli.people.every((p) => p.look.garment === "hide")).toBe(true);
    const nemrut = lives.find(({ item }) => item.id === "nemrut-dogu-terasi")!.life;
    expect(nemrut.people.filter((p) => p.look.garment === "persian").length).toBeGreaterThan(8);
  });
});

describe("the statues", () => {
  const statues = (id: string) =>
    partsFor(reconstructions.find((r) => r.id === id)!.model).filter(
      (part): part is Extract<Part, { kind: "figure" }> =>
        part.kind === "figure" && part.material !== "human",
    );

  test("each temple's cella holds its own god", () => {
    const names = (id: string) => statues(id).map((s) => s.identity?.name);
    expect(names("artemis-tapinagi")).toContain(IDENTITIES.artemisEphesia.name);
    expect(names("aizanoi-zeus-tapinagi")).toContain(IDENTITIES.zeus.name);
  });

  test("the figures between the Mausoleum's columns are not all alike", () => {
    const figures = statues("halikarnas-mozolesi");
    const kinds = new Set(figures.map((f) => JSON.stringify(f.identity)));
    expect(kinds.size).toBeGreaterThanOrEqual(6);
    const colours = new Set(figures.map((f) => JSON.stringify(f.paint)));
    expect(colours.size).toBeGreaterThanOrEqual(6);
  });

  test("the marble statues of Celsus carry their paint", () => {
    expect(statues("celsus-kutuphanesi").every((s) => s.material === "bronze" || s.paint)).toBe(
      true,
    );
  });
});

/*
 * Where people walk. A route is a loop, so a walk drawn as a line of points
 * comes back from its last point to its first in a straight line — which is
 * how a seller came to fly across a cavea and a mourner to walk through the
 * Mausoleum's podium. Every route is followed in half-metre steps, closing
 * segment included, and at every step the walker's shins and chest must be
 * clear of the building's stone, and their feet on something.
 */
type Point = [number, number, number];
const TAU = Math.PI * 2;
/** Paint, openings and the ground are not solid; nor is the scale figure. */
const NOT_SOLID = new Set([
  "shadow",
  "paintRed",
  "paintBlue",
  "paintGold",
  "fadedRed",
  "fadedBlue",
  "lettering",
  "letteringDark",
  "human",
  "water",
  "ground",
]);

/** Turns a point into a part's own frame, undoing its `rotY`. */
function local(part: { at: Point; rotY: number }, q: Point): [number, number] {
  const dx = q[0] - part.at[0];
  const dz = q[2] - part.at[2];
  return [
    dx * Math.cos(part.rotY) - dz * Math.sin(part.rotY),
    dx * Math.sin(part.rotY) + dz * Math.cos(part.rotY),
  ];
}

function inRing(part: Extract<Part, { kind: "ring" }>, q: Point, pad: number) {
  const dx = q[0] - part.at[0];
  const dz = q[2] - part.at[2];
  const r = Math.hypot(dx, dz);
  if (r < part.inner - pad || r > part.outer + pad) return false;
  const turn = (((Math.atan2(dz, dx) - part.thetaStart) % TAU) + TAU) % TAU;
  // `pad` widens the sector by that many metres at each end (narrows it if negative).
  const slack = pad / Math.max(r, 1);
  return turn <= part.thetaLength + slack || turn >= TAU - slack;
}

/** Whether a point is inside a part's solid, a few centimetres in from its faces. */
function within(part: Part, q: Point): boolean {
  if (part.decor || NOT_SOLID.has(part.material)) return false;
  const m = 0.05;
  if (part.kind === "box") {
    const [u, v] = local(part, q);
    return (
      Math.abs(u) < part.size[0] / 2 - m &&
      Math.abs(v) < part.size[2] / 2 - m &&
      q[1] > part.at[1] + m &&
      q[1] < part.at[1] + part.size[1] - m
    );
  }
  if (part.kind === "cylinder" && !part.rotX && (part.thetaLength ?? TAU) >= TAU - 1e-6) {
    const r = Math.min(part.radiusBottom, part.radiusTop) - m;
    return (
      Math.hypot(q[0] - part.at[0], q[2] - part.at[2]) < r &&
      q[1] > part.at[1] + m &&
      q[1] < part.at[1] + part.height - m
    );
  }
  if (part.kind === "ring") {
    return inRing(part, q, -m) && q[1] > part.at[1] + m && q[1] < part.at[1] + part.height - m;
  }
  return false;
}

/** The height of a part's top where a point stands over it, if it does. */
function topUnder(part: Part, q: Point): number | null {
  const pad = 0.05;
  if (part.kind === "box") {
    const [u, v] = local(part, q);
    const over = Math.abs(u) <= part.size[0] / 2 + pad && Math.abs(v) <= part.size[2] / 2 + pad;
    return over ? part.at[1] + part.size[1] : null;
  }
  if (part.kind === "cylinder" && !part.rotX) {
    const reach = Math.max(part.radiusTop, part.radiusBottom) + pad;
    return Math.hypot(q[0] - part.at[0], q[2] - part.at[2]) <= reach
      ? part.at[1] + part.height
      : null;
  }
  if (part.kind === "ring") return inRing(part, q, pad) ? part.at[1] + part.height : null;
  return null;
}

/** Every half metre along a route, the closing segment back to the start included. */
function along(route: Point[]): Point[] {
  const loop = route.length > 2 ? [...route, route[0]!] : route;
  const out: Point[] = [];
  for (let i = 0; i < loop.length; i += 1) {
    const a = loop[i]!;
    out.push(a);
    const b = loop[i + 1];
    if (!b) continue;
    const n = Math.ceil(Math.hypot(b[0] - a[0], b[2] - a[2]) / 0.5);
    for (let k = 1; k < n; k += 1) {
      const t = k / n;
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]);
    }
  }
  return out;
}

/** The parts whose footprint is near each 4 m square of the plan, to test only those. */
function gridOf(parts: Part[]) {
  const CELL = 4;
  const cells = new Map<string, Part[]>();
  for (const part of parts) {
    let reach = 0;
    if (part.kind === "box") reach = Math.hypot(part.size[0], part.size[2]) / 2;
    else if (part.kind === "cylinder")
      reach = Math.max(part.radiusBottom, part.radiusTop, part.height);
    else if (part.kind === "ring") reach = part.outer;
    else continue;
    const [x, , z] = part.at;
    for (let gx = Math.floor((x - reach) / CELL); gx <= Math.floor((x + reach) / CELL); gx += 1)
      for (let gz = Math.floor((z - reach) / CELL); gz <= Math.floor((z + reach) / CELL); gz += 1) {
        const key = `${gx},${gz}`;
        cells.set(key, [...(cells.get(key) ?? []), part]);
      }
  }
  return (q: Point) => cells.get(`${Math.floor(q[0] / CELL)},${Math.floor(q[2] / CELL)}`) ?? [];
}

describe("where people go", () => {
  test("nobody walks through stone, and nobody stands on air", () => {
    const wrong: string[] = [];
    for (const { item, life } of lives) {
      const near = gridOf(partsFor(item.model));
      const nearSupport = gridOf(life.props);
      const routes: [string, Point[]][] = [
        ...life.people.map((p, i): [string, Point[]] => [
          `person ${i}`,
          [p.at, ...(p.route ?? [])],
        ]),
        ...life.animals.map((a, i): [string, Point[]] => [
          `animal ${i}`,
          [a.at, ...(a.route ?? [])],
        ]),
        ...life.chariots.map((c, i): [string, Point[]] => [`chariot ${i}`, c.route]),
      ];
      for (const [who, route] of routes) {
        for (const q of along(route)) {
          const solid = [0.3, 1].some((h) =>
            near(q).some((part) => within(part, [q[0], q[1] + h, q[2]])),
          );
          const floating =
            q[1] > 0.06 &&
            ![...near(q), ...nearSupport(q)].some((part) => {
              const top = topUnder(part, q);
              return top !== null && top > q[1] - 0.3 && top < q[1] + 0.15;
            });
          if (solid || floating) {
            wrong.push(
              `${item.id} ${who} ${solid ? "in stone" : "on air"} at ${q.map((v) => v.toFixed(1))}`,
            );
            break;
          }
        }
      }
    }
    expect(wrong).toEqual([]);
  }, 30_000);
});

describe("how women are dressed", () => {
  test("most women go bareheaded, their hair dressed in more than one way", () => {
    let women = 0;
    let veiled = 0;
    const styles = new Set<string>();
    for (const item of reconstructions) {
      for (const person of lifeFor(item).people) {
        if (!person.look.female) continue;
        women += 1;
        if (person.look.headwear === "veil") veiled += 1;
        if (person.look.hairStyle) styles.add(person.look.hairStyle);
      }
    }
    expect(women).toBeGreaterThan(50);
    expect(veiled / women).toBeLessThan(0.2);
    expect(styles.size).toBeGreaterThanOrEqual(3);
  });
});
