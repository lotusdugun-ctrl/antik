import { describe, expect, test } from "bun:test";
import { partsFor, type Part, type Vec3 } from "@/lib/reconstruction-parts";
import { reconstructions, type Reconstruction } from "@/lib/reconstructions";
import { lifeFor } from "@/lib/scene-life";

/*
 * The small things: lettering on the stone, tiles on the roofs, paint left on
 * the mouldings, and the furniture of the streets. Each has to be where it
 * is claimed — on a roof, on a face, on the ground — and none of it may cost
 * more than the building it decorates.
 */

const byId = (id: string) => reconstructions.find((item) => item.id === id)!;
const partsOf = (item: Reconstruction) => partsFor(item.model);

/** A half-round cover tile, as `tiledSlope` lays them. */
const isCoverTile = (part: Part): part is Extract<Part, { kind: "cylinder" }> =>
  part.kind === "cylinder" &&
  part.material === "terracotta" &&
  part.thetaLength === Math.PI &&
  part.segments === 5;

/** Turns a point into a part's own plan frame, undoing its `rotY`. */
const local = (at: Vec3, rotY: number, x: number, z: number): [number, number] => {
  const dx = x - at[0];
  const dz = z - at[2];
  return [dx * Math.cos(rotY) - dz * Math.sin(rotY), dx * Math.sin(rotY) + dz * Math.cos(rotY)];
};

/** The height of a roof surface — a gable prism or a pitched slab — over (x, z), if it is over it. */
function roofTop(part: Part, x: number, z: number): number | null {
  if (part.material !== "terracotta") return null;
  if (part.kind === "prism") {
    const [u, v] = local(part.at, part.rotY, x, z);
    const [w, h, d] = part.size;
    if (Math.abs(u) > w / 2 || Math.abs(v) > d / 2) return null;
    return part.at[1] + h * (1 - Math.abs(u) / (w / 2));
  }
  if (part.kind === "box" && part.rotX) {
    // The slab's top face: its centre, and the slope it was tipped to.
    const [u, v] = local(part.at, part.rotY, x, z);
    const [w, h, d] = part.size;
    const c = Math.cos(part.rotX);
    const s = Math.sin(part.rotX);
    // Local (y, z) of the top face's middle after the tip, and its run.
    const topY = h * c;
    const topZ = h * s;
    const run = (d / 2) * c;
    if (Math.abs(u) > w / 2 || Math.abs(v - topZ) > run) return null;
    // Along the slope, z advances by c and y by -s.
    return part.at[1] + topY + ((v - topZ) / c) * -s;
  }
  return null;
}

describe("roof tiles", () => {
  const roofed = reconstructions.filter(
    (item) =>
      (item.model.kind === "ionic-dipteros" && item.model.interior === "cella") ||
      item.model.kind === "peristyle-house" ||
      (item.model.kind === "roman-theatre" &&
        ["agora", "harbour-street"].includes(item.model.character?.annex ?? "")),
  );

  test("every pitched roof is laid in tiles, with antefixes at the eaves", () => {
    expect(roofed.map((item) => item.id).sort()).toEqual([
      "aizanoi-zeus-tapinagi",
      "artemis-tapinagi",
      "efes-buyuk-tiyatro",
      "efes-yamac-evler",
      "side-tiyatrosu",
    ]);
    for (const item of roofed) {
      const parts = partsOf(item);
      const tiles = parts.filter(isCoverTile);
      const antefixes = parts.filter(
        (part) => part.kind === "prism" && part.material === "terracotta" && part.size[2] < 0.05,
      );
      expect(`${item.id}: ${tiles.length > 60}`).toBe(`${item.id}: true`);
      expect(`${item.id}: ${antefixes.length >= tiles.length}`).toBe(`${item.id}: true`);
    }
  });

  test("the open court at Didyma takes no roof", () => {
    expect(partsOf(byId("didyma-apollon-tapinagi")).filter(isCoverTile)).toEqual([]);
  });

  /*
   * A cover tile follows its slope from the eave to the ridge. Laid level
   * instead — as the house's first eaves were — one end of it floats over
   * the roof by the whole fall of the slope.
   */
  test("cover tiles lie on their roof along their whole length", () => {
    const wrong: string[] = [];
    for (const item of roofed) {
      const parts = partsOf(item);
      const roofs = parts.filter(
        (part) => part.material === "terracotta" && (part.kind === "prism" || part.kind === "box"),
      );
      for (const tile of parts.filter(isCoverTile)) {
        // The tile's axis, tipped by rotX off the vertical and turned by rotY.
        const tilt = tile.rotX ?? 0;
        const turn = tile.rotY ?? 0;
        for (const t of [0.2, 0.5, 0.8]) {
          const along = tile.height * t;
          const lz = Math.sin(tilt) * along;
          const y = tile.at[1] + Math.cos(tilt) * along;
          const x = tile.at[0] + lz * Math.sin(turn);
          const z = tile.at[2] + lz * Math.cos(turn);
          const tops = roofs
            .map((roof) => roofTop(roof, x, z))
            .filter((top): top is number => top !== null);
          const gap = Math.min(...tops.map((top) => Math.abs(top - y)));
          if (!(gap < 0.06)) {
            wrong.push(`${item.id} tile at ${tile.at.map((v) => v.toFixed(1))} off by ${gap}`);
            break;
          }
        }
        if (wrong.length > 5) break;
      }
    }
    expect(wrong).toEqual([]);
  });
});

describe("inscriptions", () => {
  test("the inscribed buildings carry their lettering", () => {
    for (const id of [
      "celsus-kutuphanesi",
      "artemis-tapinagi",
      "didyma-apollon-tapinagi",
      "aizanoi-zeus-tapinagi",
      "pergamon-zeus-sunagi",
      "aspendos-tiyatrosu",
      "hierapolis-tiyatrosu",
      "milet-buyuk-tiyatro",
      "efes-buyuk-tiyatro",
      "side-tiyatrosu",
      "halikarnas-mozolesi",
      "perge-stadyumu",
      "aphrodisias-stadyumu",
      "nemrut-dogu-terasi",
    ]) {
      const letters = partsOf(byId(id)).filter((part) => part.material.startsWith("lettering"));
      expect(`${id}: ${letters.length > 60}`).toBe(`${id}: true`);
    }
    // Göbeklitepe was cut eleven thousand years before anyone wrote.
    const gobekli = partsOf(byId("gobeklitepe-d-yapisi"));
    expect(gobekli.filter((part) => part.material.startsWith("lettering"))).toEqual([]);
  });

  /*
   * Lettering is cut into a face, so just behind every stroke there is
   * stone. A stroke with air behind it is a letter floating in front of a
   * wall — or one buried in the wrong face of a block.
   */
  test("every letter is cut into a face of stone, and shows", () => {
    const inside = (part: Part, q: Vec3) => {
      if (part.material.startsWith("lettering")) return false;
      if (part.kind === "carving") {
        // A wall cut as an outline: its thickness, and the outline's reach.
        const [u, v] = local(part.at, part.rotY, q[0], q[2]);
        const sink = part.sink ?? 0.4;
        const reach = Math.max(...part.outline.map(([x]) => Math.abs(x)));
        const top = Math.max(...part.outline.map(([, y]) => y));
        return (
          v >= -part.depth * sink - 1e-6 &&
          v <= part.depth * (1 - sink) + 1e-6 &&
          Math.abs(u) <= reach &&
          q[1] >= part.at[1] &&
          q[1] <= part.at[1] + top
        );
      }
      if (part.kind !== "box" || part.rotX) return false;
      const [u, v] = local(part.at, part.rotY, q[0], q[2]);
      return (
        Math.abs(u) <= part.size[0] / 2 + 1e-6 &&
        Math.abs(v) <= part.size[2] / 2 + 1e-6 &&
        q[1] >= part.at[1] - 1e-6 &&
        q[1] <= part.at[1] + part.size[1] + 1e-6
      );
    };
    const wrong: string[] = [];
    for (const item of reconstructions) {
      const parts = [...partsOf(item), ...lifeFor(item).props];
      const solids = parts.filter(
        (part) =>
          (part.kind === "box" || part.kind === "carving") &&
          !part.material.startsWith("lettering"),
      );
      for (const letter of parts) {
        if (!letter.material.startsWith("lettering") || letter.kind !== "box") continue;
        // Behind the stroke: back along its face's normal, past its own depth.
        const back = letter.size[2] / 2 + 0.035;
        const q: Vec3 = [
          letter.at[0] - Math.sin(letter.rotY) * back,
          letter.at[1] + letter.size[1] / 2,
          letter.at[2] - Math.cos(letter.rotY) * back,
        ];
        if (!solids.some((part) => inside(part, q))) {
          wrong.push(`${item.id} letter at ${letter.at.map((v) => v.toFixed(2))} on air`);
          if (wrong.length > 5) break;
        }
        // And just in front of its face, open air: a letter in the stone is unseen.
        const front = letter.size[2] / 2 + 0.003;
        const p: Vec3 = [
          letter.at[0] + Math.sin(letter.rotY) * front,
          letter.at[1] + letter.size[1] / 2,
          letter.at[2] + Math.cos(letter.rotY) * front,
        ];
        if (solids.some((part) => part.kind === "box" && !part.weather && inside(part, p))) {
          wrong.push(`${item.id} letter at ${letter.at.map((v) => v.toFixed(2))} buried`);
          if (wrong.length > 5) break;
        }
      }
    }
    expect(wrong).toEqual([]);
  });
});

describe("paint", () => {
  test("the marble buildings keep traces of their paint", () => {
    for (const id of [
      "artemis-tapinagi",
      "didyma-apollon-tapinagi",
      "aizanoi-zeus-tapinagi",
      "pergamon-zeus-sunagi",
      "aspendos-tiyatrosu",
      "halikarnas-mozolesi",
    ]) {
      const faded = partsOf(byId(id)).filter(
        (part) => part.material === "fadedRed" || part.material === "fadedBlue",
      );
      expect(`${id}: ${faded.length > 12}`).toBe(`${id}: true`);
    }
  });

  test("paint is a skin on the stone, not a block of colour", () => {
    for (const item of reconstructions) {
      for (const part of partsOf(item)) {
        if (part.material !== "fadedRed" && part.material !== "fadedBlue") continue;
        if (part.kind !== "box") continue;
        expect(Math.min(...part.size)).toBeLessThan(0.05);
      }
    }
  });
});

describe("the cost of detail", () => {
  /** Triangles the renderer makes of a part, near enough to budget with. */
  const triangles = (part: Part) =>
    part.kind === "box"
      ? // A stroke of lettering is drawn as its face alone (see the renderer).
        part.material.startsWith("lettering")
        ? 2
        : 12
      : part.kind === "prism"
        ? 8
        : part.kind === "cylinder"
          ? 4 * part.segments
          : 0;
  const isDetail = (part: Part) =>
    part.material.startsWith("lettering") ||
    part.material === "fadedRed" ||
    part.material === "fadedBlue" ||
    (part.material === "terracotta" && (isCoverTile(part) || part.kind === "prism"));

  test("lettering, tiles and paint add at most a quarter to any building", () => {
    for (const item of reconstructions) {
      const parts = partsOf(item);
      const detail = parts.filter(isDetail).reduce((sum, part) => sum + triangles(part), 0);
      // Everything else, priced the same way; reliefs, figures and lofts are
      // left out, which makes the share look larger than it is, not smaller.
      const rest = parts
        .filter((part) => !isDetail(part))
        .reduce((sum, part) => sum + triangles(part), 0);
      expect(`${item.id}: ${detail <= rest * 0.25}`).toBe(`${item.id}: true`);
    }
  });
});

/*
 * The furniture of the streets: stalls, fountains, statues on their bases,
 * carts, benches. It stands on open ground — not in a wall, not on a rock,
 * not where somebody walks.
 */
type Point = [number, number, number];

function along(route: Point[]): Point[] {
  const loop = route.length > 2 ? [...route, route[0]!] : route;
  const out: Point[] = [];
  for (let i = 0; i < loop.length; i += 1) {
    const a = loop[i]!;
    out.push(a);
    const b = loop[i + 1];
    if (!b) continue;
    const n = Math.ceil(Math.hypot(b[0] - a[0], b[2] - a[2]) / 0.25);
    for (let k = 1; k < n; k += 1) {
      const t = k / n;
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]);
    }
  }
  return out;
}

/** Whether a point is inside a prop's solid, a couple of centimetres in. */
function inProp(part: Part, q: Point): boolean {
  const m = 0.02;
  if (part.kind === "box" && !part.rotX) {
    const [u, v] = local(part.at, part.rotY, q[0], q[2]);
    return (
      Math.abs(u) < part.size[0] / 2 - m &&
      Math.abs(v) < part.size[2] / 2 - m &&
      q[1] > part.at[1] + m &&
      q[1] < part.at[1] + part.size[1] - m
    );
  }
  if (part.kind === "cylinder" && !part.rotX) {
    return (
      Math.hypot(q[0] - part.at[0], q[2] - part.at[2]) <
        Math.max(part.radiusBottom, part.radiusTop) - m &&
      q[1] > part.at[1] + m &&
      q[1] < part.at[1] + part.height - m
    );
  }
  return false;
}

describe("street furniture", () => {
  const lives = reconstructions.map((item) => ({ item, life: lifeFor(item) }));

  test("the market squares and forecourts are furnished", () => {
    const count = (id: string, material: string) =>
      lives.find(({ item }) => item.id === id)!.life.props.filter((p) => p.material === material)
        .length;
    // Fountains and basins hold water; stalls stand under striped linen.
    for (const id of [
      "celsus-kutuphanesi",
      "artemis-tapinagi",
      "pergamon-zeus-sunagi",
      "efes-yamac-evler",
      "perge-stadyumu",
      "aphrodisias-stadyumu",
      "side-tiyatrosu",
    ]) {
      expect(`${id}: ${count(id, "water") > 0}`).toBe(`${id}: true`);
    }
    for (const id of ["celsus-kutuphanesi", "side-tiyatrosu", "aphrodisias-stadyumu"]) {
      expect(`${id}: ${count(id, "linen") >= 6}`).toBe(`${id}: true`);
    }
  });

  test("nobody walks through the furniture", () => {
    const wrong: string[] = [];
    for (const { item, life } of lives) {
      const routes: [string, Point[]][] = [
        ...life.people
          .filter((p) => p.route)
          .map((p, i): [string, Point[]] => [`walker ${i}`, p.route!]),
        ...life.animals
          .filter((a) => a.route)
          .map((a, i): [string, Point[]] => [`animal ${i}`, a.route!]),
        ...life.chariots.map((c, i): [string, Point[]] => [`chariot ${i}`, c.route]),
      ];
      for (const [who, route] of routes) {
        for (const q of along(route)) {
          // Shins and chest: a low step a walker steps onto is not in the way.
          const hit = life.props.find((part) =>
            [0.45, 1.0].some((h) => inProp(part, [q[0], q[1] + h, q[2]])),
          );
          if (hit) {
            wrong.push(
              `${item.id} ${who} through ${hit.material} at ${hit.at.map((v) => v.toFixed(1))}`,
            );
            break;
          }
        }
      }
    }
    expect(wrong).toEqual([]);
  });

  /*
   * What stands on the ground stands on open ground: not inside the
   * building's stone, nor on the rocks scattered round it.
   */
  test("furniture on the ground stands clear of the building and its rocks", () => {
    const wrong: string[] = [];
    for (const { item, life } of lives) {
      const solids = partsOf(item).filter(
        (part) =>
          (part.kind === "box" || (part.kind === "cylinder" && !part.rotX)) &&
          !["grass", "shadow", "human", "ground", "water", "lettering"].includes(part.material) &&
          !(part.kind === "box" && part.rotX),
      );
      for (const prop of life.props) {
        if (prop.material !== "water" && prop.material !== "linen") continue;
        // Under a fountain's water and a stall's awning: is that ground open?
        for (const h of [0.3]) {
          const q: Point = [prop.at[0], h, prop.at[2]];
          const hit = solids.find((part) => inProp(part, q));
          if (prop.at[1] < 1.5 && hit) {
            wrong.push(
              `${item.id} ${prop.material} at ${prop.at.map((v) => v.toFixed(1))} in ${hit.material}`,
            );
          }
        }
      }
    }
    expect(wrong).toEqual([]);
  });
});
