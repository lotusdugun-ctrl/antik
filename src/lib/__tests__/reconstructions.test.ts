import { describe, expect, test } from "bun:test";
import {
  ANIMAL_SHAPES,
  boundsOf,
  CARVINGS,
  partsFor,
  SHAFT_DRUMS,
  type Part,
} from "@/lib/reconstruction-parts";
import {
  reconstructionForStructure,
  reconstructions,
  reconstructionsFor,
  type Measure,
  type Reconstruction,
} from "@/lib/reconstructions";
import { creditFor } from "@/lib/photo-credits";
import { siteDetails } from "@/lib/site-details";
import { sites } from "@/lib/sites";
import type { Localized } from "@/lib/i18n";

/**
 * A 3D reconstruction is a claim about a building nobody alive has seen whole,
 * rendered convincingly enough to be mistaken for a photograph of one. These
 * tests exist to keep the model tied to the measurements it says it is built
 * from — so that a dimension cannot be shown beside a shape that does not use
 * it, and a shape cannot quietly acquire a dimension nobody measured.
 */

const slugs = new Set(sites.map((s) => s.slug));
const filled = (v: Localized) => v.tr.trim().length > 0 && v.en.trim().length > 0;

/** Every number in a model spec, however deeply nested. */
function specNumbers(spec: object): number[] {
  return Object.values(spec).flatMap((value) => {
    if (typeof value === "number") return [value];
    if (value && typeof value === "object") return specNumbers(value as object);
    return [];
  });
}

/** Metres and counts shape the model; a headcount is context beside it. */
const isGeometric = (measure: Measure) => measure.unit === "m" || measure.unit === "count";

const built = new Map<string, Part[]>(
  reconstructions.map((item) => [item.id, partsFor(item.model)]),
);

const partsOf = (item: Reconstruction) => built.get(item.id)!;

describe("the reconstruction records", () => {
  test("ids are unique — they are the primary key and the URL", () => {
    expect(new Set(reconstructions.map((r) => r.id)).size).toBe(reconstructions.length);
  });

  test("every reconstruction belongs to a site that exists", () => {
    const orphans = reconstructions.filter((r) => !slugs.has(r.siteSlug));
    expect(orphans.map((r) => `${r.id} -> ${r.siteSlug}`)).toEqual([]);
  });

  /**
   * The city page reaches a reconstruction through the structure list, matching
   * on the Turkish name. A record naming a structure its city does not list is
   * unreachable from anywhere a visitor actually is.
   */
  test("every reconstruction names a structure its city lists", () => {
    const unlisted = reconstructions.filter((r) => {
      const structures = siteDetails[r.siteSlug]?.structures ?? [];
      return !structures.some((s) => s.tr === r.structure.tr && s.en === r.structure.en);
    });
    expect(unlisted.map((r) => `${r.siteSlug} | ${r.structure.tr}`)).toEqual([]);
  });

  test("the structure lookup finds every record from its city page", () => {
    for (const item of reconstructions) {
      expect(reconstructionForStructure(item.siteSlug, item.structure.tr)?.id).toBe(item.id);
    }
    expect(reconstructionForStructure("efes", "Kuretler Caddesi")).toBeUndefined();
    // Ephesus has four, which is the case the lookup has to keep apart.
    expect(reconstructionsFor("efes").map((r) => r.id)).toEqual([
      "celsus-kutuphanesi",
      "artemis-tapinagi",
      "efes-yamac-evler",
      "efes-buyuk-tiyatro",
    ]);
  });

  test("both languages are filled in on every displayed field", () => {
    const gaps: string[] = [];
    for (const item of reconstructions) {
      for (const [field, value] of Object.entries({
        title: item.title,
        blurb: item.blurb,
        period: item.period,
        structure: item.structure,
        uncertainty: item.uncertainty,
      })) {
        if (!filled(value)) gaps.push(`${item.id}.${field}`);
      }
      item.measures.forEach((measure, i) => {
        if (!filled(measure.label)) gaps.push(`${item.id}.measures[${i}]`);
      });
      item.sources.forEach((source, i) => {
        if (!filled(source.title)) gaps.push(`${item.id}.sources[${i}]`);
      });
    }
    expect(gaps).toEqual([]);
  });
});

describe("the claims a visitor could check", () => {
  test("every measurement names a source that the record carries", () => {
    const dangling = reconstructions.flatMap((item) =>
      item.measures
        .filter((measure) => !item.sources.some((source) => source.key === measure.source))
        .map((measure) => `${item.id}: ${measure.label.tr} -> ${measure.source}`),
    );
    expect(dangling).toEqual([]);
  });

  /**
   * The carvings are photographs of other people's work, wrapped onto the
   * models. Nearly all of them are CC BY-SA: showing one without naming the
   * photographer breaches the licence, and an uncredited texture looks exactly
   * like a credited one on screen.
   */
  test("every carving photograph has an attribution on file", () => {
    const uncredited = Object.entries(CARVINGS)
      .filter(([, carving]) => !creditFor(carving.url))
      .map(([name]) => name);
    expect(uncredited).toEqual([]);
  });

  test("every carving is a Commons thumbnail at a width Commons serves", () => {
    const bad = Object.entries(CARVINGS)
      .filter(([, carving]) => !/\/thumb\/.*\/(250|330|500|960|1280)px-/.test(carving.url))
      .map(([name]) => name);
    expect(bad).toEqual([]);
  });

  test("no carving sits in the library unused by any model", () => {
    const used = new Set(
      reconstructions.flatMap((item) =>
        partsOf(item)
          .map((part) => part.carving?.url)
          .filter((url): url is string => Boolean(url)),
      ),
    );
    const orphans = Object.entries(CARVINGS)
      .filter(([, carving]) => !used.has(carving.url))
      .map(([name]) => name);
    expect(orphans).toEqual([]);
  });

  test("every source is a link a reader can open", () => {
    const bad = reconstructions.flatMap((item) =>
      item.sources.filter((s) => !s.url.startsWith("https://")).map((s) => `${item.id}: ${s.url}`),
    );
    expect(bad).toEqual([]);
  });

  test("no source sits in a record unused, claiming to have been read", () => {
    const unused = reconstructions.flatMap((item) =>
      item.sources
        .filter((source) => !item.measures.some((measure) => measure.source === source.key))
        .map((source) => `${item.id}: ${source.key}`),
    );
    expect(unused).toEqual([]);
  });

  /**
   * The one that matters. A measurement panel beside a 3D model reads as a
   * description of the thing on screen; if the model were built from other
   * numbers, the panel would be decoration dressed as evidence.
   */
  test("every cited dimension is a number the model is actually built from", () => {
    const stray = reconstructions.flatMap((item) => {
      const numbers = new Set(specNumbers(item.model));
      return item.measures
        .filter(isGeometric)
        .filter((measure) => !numbers.has(measure.value))
        .map((measure) => `${item.id}: ${measure.value} (${measure.label.tr})`);
    });
    expect(stray).toEqual([]);
  });

  test("every reconstruction says which parts of it are inference", () => {
    const silent = reconstructions.filter((item) => item.uncertainty.tr.length < 80);
    expect(silent.map((item) => item.id)).toEqual([]);
  });

  test("no dimension is zero or negative, which would collapse a model", () => {
    const bad = reconstructions.flatMap((item) =>
      specNumbers(item.model)
        .filter((n) => n <= 0)
        .map((n) => `${item.id}: ${n}`),
    );
    expect(bad).toEqual([]);
  });
});

describe("the geometry", () => {
  test("every model builds parts, and every part has a size", () => {
    for (const item of reconstructions) {
      const parts = partsOf(item);
      expect(parts.length).toBeGreaterThan(20);
      const degenerate = parts.filter((part) => {
        if (part.kind === "box" || part.kind === "prism") return part.size.some((v) => v <= 0);
        if (part.kind === "relief") return part.size.some((v) => v <= 0);
        if (part.kind === "cylinder") return part.height <= 0 || part.radiusBottom <= 0;
        if (part.kind === "ring") return part.height <= 0 || part.outer <= part.inner;
        if (part.kind === "carving") return part.outline.length < 3 || part.depth <= 0;
        if (part.kind === "loft")
          return part.sections.length < 2 || part.sections.some((s) => s.rx <= 0 || s.ry <= 0);
        return part.height <= 0;
      });
      expect(degenerate.map((p) => `${item.id}: ${p.kind}`)).toEqual([]);
    }
  });

  test("nothing is built below the ground it stands on", () => {
    for (const item of reconstructions) {
      const { min } = boundsOf(partsOf(item));
      expect(min[1]).toBeGreaterThanOrEqual(-1);
    }
  });

  test("the façade rises to the height its measurement claims", () => {
    const celsus = reconstructions.find((r) => r.id === "celsus-kutuphanesi")!;
    const spec = celsus.model;
    if (spec.kind !== "roman-facade") throw new Error("expected a façade");
    const { max, min } = boundsOf(partsOf(celsus));
    const stepsHeight = spec.steps * 0.18;
    // Façade height is measured from the platform the steps climb to.
    expect(max[1] - stepsHeight).toBeGreaterThanOrEqual(spec.facadeHeight);
    expect(max[1] - stepsHeight).toBeLessThan(spec.facadeHeight + 3);
    // And it is 21 m wide, which is what makes it read as a building front.
    expect(max[0] - min[0]).toBeGreaterThanOrEqual(spec.facadeWidth);
  });

  /**
   * The theatre's row count is derived rather than measured, so the derivation
   * has to close: podium, 40 rows at 0.75 m, the walkway between the two banks
   * and the gallery on the rim must add up to the cited 96 m diameter exactly.
   */
  test("the seating bank ends where the cited diameter says it does", () => {
    const aspendos = reconstructions.find((r) => r.id === "aspendos-tiyatrosu")!;
    const spec = aspendos.model;
    if (spec.kind !== "roman-theatre") throw new Error("expected a theatre");
    const rows = spec.lowerRows + spec.upperRows;
    const topOfRows = spec.orchestraDiameter / 2 + 0.7 + rows * spec.seatTread + 1.8;
    const outer = spec.caveaDiameter / 2;
    expect(topOfRows).toBeLessThan(outer);
    // What is left over is the vaulted gallery, and it has to be walkable.
    expect(outer - topOfRows).toBeGreaterThan(2.5);
    expect(rows).toBe(40);
  });

  /**
   * Column counts are the one number these temples are actually remembered by
   * — Pliny counted 127 at Ephesus — so the model has to stand up exactly that
   * many, not "a colonnade".
   */
  test("every temple raises exactly the number of columns its plan calls for", () => {
    for (const item of reconstructions) {
      const spec = item.model;
      if (spec.kind !== "ionic-dipteros") continue;
      /*
       * Every shaft is built from `SHAFT_DRUMS` fluted drums, the way the
       * masons stacked them, so the drums divide back into columns. Height is
       * what separates the temple's own colonnade from the small columns of
       * the naiskos standing in Didyma's court.
       */
      const drumHeight = (spec.columnHeight / SHAFT_DRUMS) * 0.8;
      const drums = partsOf(item).filter(
        (part) => part.kind === "cylinder" && part.flutes !== undefined && part.height > drumHeight,
      );
      expect(`${item.id}: ${drums.length / SHAFT_DRUMS}`).toBe(`${item.id}: ${spec.totalColumns}`);
    }
  });

  test("the peristyle alone accounts for most of the temple's columns", () => {
    const didyma = reconstructions.find((r) => r.id === "didyma-apollon-tapinagi")!;
    const spec = didyma.model;
    if (spec.kind !== "ionic-dipteros") throw new Error("expected a temple");
    const outer = 2 * spec.outerColumnsShort + 2 * spec.outerColumnsLong - 4;
    const inner = 2 * (spec.outerColumnsShort - 2) + 2 * (spec.outerColumnsLong - 2) - 4;
    expect(outer + inner + spec.pronaosRows * spec.pronaosPerRow).toBe(spec.totalColumns);
  });

  test("the altar's frieze is long enough to wrap the building it is on", () => {
    const altar = reconstructions.find((r) => r.id === "pergamon-zeus-sunagi")!;
    const spec = altar.model;
    if (spec.kind !== "great-altar") throw new Error("expected an altar");
    // 113 m of carving around a 35.64 x 33.4 m base: it goes round, and then
    // some, which is what the stair wings and the returns account for.
    const perimeter = 2 * (spec.baseWidth + spec.baseDepth);
    expect(spec.friezeLength).toBeGreaterThan(perimeter * 0.75);
    expect(spec.stairWidth).toBeLessThan(spec.baseWidth);
    expect(spec.courtSide).toBeLessThan(spec.baseWidth);
  });

  test("the stadium's seating fits between its track and its outer wall", () => {
    const stadium = reconstructions.find((r) => r.id === "aphrodisias-stadyumu")!;
    const spec = stadium.model;
    if (spec.kind !== "stadium") throw new Error("expected a stadium");
    const bank = (spec.overallWidth - spec.arenaWidth) / 2;
    const tread = bank / spec.rows;
    // Roman stadium seating runs 0.4-0.8 m per row; outside that the derived
    // arena width is wrong, not the seating.
    expect(tread).toBeGreaterThan(0.4);
    expect(tread).toBeLessThan(0.8);
    expect(spec.arenaWidth).toBeLessThan(spec.overallWidth);
    expect(spec.overallLength).toBeGreaterThan(spec.overallWidth * 2);
  });

  test("the enclosure sets its pillars inside the wall, facing the centre", () => {
    const gobekli = reconstructions.find((r) => r.id === "gobeklitepe-d-yapisi")!;
    const spec = gobekli.model;
    if (spec.kind !== "neolithic-enclosure") throw new Error("expected an enclosure");
    const radius = spec.enclosureDiameter / 2;
    const uprights = partsOf(gobekli).filter(
      (part) =>
        part.kind === "box" &&
        part.size[1] > 1.5 &&
        Math.hypot(part.at[0], part.at[2]) > radius / 2,
    );
    expect(uprights.length).toBe(spec.ringPillars);
    for (const pillar of uprights) {
      expect(Math.hypot(pillar.at[0], pillar.at[2])).toBeLessThan(radius);
    }
    // The two at the centre are the tall ones, and they stand on their sockets.
    // Thickness is what rules out the relief plates on their faces.
    const central = partsOf(gobekli).filter(
      (part) =>
        part.kind === "box" &&
        Math.hypot(part.at[0], part.at[2]) < radius / 2 &&
        part.size[1] > 3 &&
        part.size[0] > 0.5,
    );
    expect(central.length).toBe(2);
    for (const pillar of central) {
      expect(pillar.at[1]).toBeCloseTo(0.45 - spec.pedestalSocket, 5);
    }
  });
});

describe("the carved silhouettes", () => {
  /** Whether two closed segments cross, touching endpoints excepted. */
  const crosses = (
    a: [number, number],
    b: [number, number],
    c: [number, number],
    d: [number, number],
  ) => {
    const orient = (p: [number, number], q: [number, number], r: [number, number]) =>
      Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]));
    return orient(a, b, c) * orient(a, b, d) < 0 && orient(c, d, a) * orient(c, d, b) < 0;
  };

  /**
   * An outline that folds back over its own edge does not extrude — the
   * triangulator gives up quietly and the animal is simply missing from the
   * pillar. Every traced silhouette has to be a simple polygon, so a slipped
   * point in a hand-drawn list fails here rather than on the stone.
   */
  test("every animal outline runs once round itself without crossing", () => {
    for (const [name, shape] of Object.entries(ANIMAL_SHAPES)) {
      const points = shape.outline;
      expect(points.length).toBeGreaterThanOrEqual(8);
      const crossings: string[] = [];
      for (let i = 0; i < points.length; i += 1) {
        const a = points[i]!;
        const b = points[(i + 1) % points.length]!;
        for (let j = i + 2; j < points.length; j += 1) {
          if (i === 0 && j === points.length - 1) continue;
          const c = points[j]!;
          const d = points[(j + 1) % points.length]!;
          if (crosses(a, b, c, d)) crossings.push(`${name}: edge ${i} x edge ${j}`);
        }
      }
      expect(crossings).toEqual([]);
      // Feet on the ground, and about a unit long, so the scale means metres.
      expect(Math.min(...points.map((p) => p[1]))).toBeGreaterThanOrEqual(-0.01);
      const width = Math.max(...points.map((p) => p[0])) - Math.min(...points.map((p) => p[0]));
      expect(width).toBeGreaterThan(0.4);
      expect(width).toBeLessThanOrEqual(1.1);
      if (shape.eye) {
        // The drilled eye has to sit inside the head, or it drills the air.
        const [ex, ey, er] = shape.eye;
        let inside = false;
        for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
          const [xi, yi] = points[i]!;
          const [xj, yj] = points[j]!;
          if (yi > ey !== yj > ey && ex < ((xj - xi) * (ey - yi)) / (yj - yi) + xi) {
            inside = !inside;
          }
        }
        expect(`${name} eye inside: ${inside}`).toBe(`${name} eye inside: true`);
        expect(er).toBeLessThan(0.05);
      }
    }
  });

  test("every Göbeklitepe pillar carries at least one carving on its inner face", () => {
    const gobekli = reconstructions.find((r) => r.id === "gobeklitepe-d-yapisi")!;
    const spec = gobekli.model;
    if (spec.kind !== "neolithic-enclosure") throw new Error("expected an enclosure");
    const radius = spec.enclosureDiameter / 2;
    const carvings = partsOf(gobekli).filter(
      (part): part is Extract<Part, { kind: "carving" }> =>
        part.kind === "carving" && Math.hypot(part.at[0], part.at[2]) > radius / 2,
    );
    // Each carving is turned to face the centre: its normal points inwards.
    for (const carving of carvings) {
      const normal = [Math.sin(carving.rotY), Math.cos(carving.rotY)];
      const outward = [carving.at[0], carving.at[2]];
      expect(normal[0]! * outward[0]! + normal[1]! * outward[1]!).toBeLessThan(0);
    }
    // Twelve pillars, and every one of them with something cut into it.
    const pillars = new Set(
      carvings.map((c) => Math.round((Math.atan2(c.at[2], c.at[0]) / (Math.PI * 2)) * 12)),
    );
    expect(pillars.size).toBe(spec.ringPillars);
  });

  test("the horsemen ride a lofted horse, not a stack of drums", () => {
    const celsus = reconstructions.find((r) => r.id === "celsus-kutuphanesi")!;
    const riders = partsOf(celsus).filter(
      (part) => part.kind === "figure" && part.pose === "riding",
    );
    expect(riders.length).toBe(2);
    const skins = partsOf(celsus).filter(
      (part) => part.kind === "loft" && part.material === "bronze",
    );
    // Body, muscles, neck, head and its features, legs and tail: two dozen
    // skins a horse, nothing like a stack of drums.
    expect(skins.length).toBeGreaterThanOrEqual(40);
    // The rider sits on the horse's back, above every hoof.
    for (const rider of riders) {
      expect(rider.at[1]).toBeGreaterThan(2.94 + 1.2);
    }
  });
});

describe("the six models added in September 2026", () => {
  /** The Aspendos derivation, applied to every theatre: rows fit the diameter. */
  test("every theatre's rows fit inside its cited diameter with a gallery to spare", () => {
    for (const item of reconstructions) {
      const spec = item.model;
      if (spec.kind !== "roman-theatre") continue;
      const rows = spec.lowerRows + (spec.middleRows ?? 0) + spec.upperRows;
      const walkways = spec.middleRows ? 2 : 1;
      const topOfRows = spec.orchestraDiameter / 2 + 0.7 + rows * spec.seatTread + walkways * 1.8;
      const outer = spec.caveaDiameter / 2;
      expect(`${item.id}: ${topOfRows < outer}`).toBe(`${item.id}: true`);
      expect(outer - topOfRows).toBeGreaterThan(2.5);
    }
  });

  test("the mausoleum stands as tall as its measurement, on all its columns", () => {
    const tomb = reconstructions.find((r) => r.id === "halikarnas-mozolesi")!;
    const spec = tomb.model;
    if (spec.kind !== "mausoleum") throw new Error("expected a mausoleum");
    const { max } = boundsOf(partsOf(tomb));
    expect(Math.abs(max[1] - spec.totalHeight)).toBeLessThan(3);
    const drumHeight = (spec.columnHeight / SHAFT_DRUMS) * 0.8;
    const drums = partsOf(tomb).filter(
      (part) => part.kind === "cylinder" && part.flutes !== undefined && part.height > drumHeight,
    );
    expect(drums.length / SHAFT_DRUMS).toBe(spec.columns);
    // Four horses on the summit, each ten lofts, and twenty lions on the ledge.
    const lofts = partsOf(tomb).filter((part) => part.kind === "loft");
    expect(lofts.length).toBeGreaterThanOrEqual(40 + spec.lions * 10);
    expect(spec.columnsShort * 2 + spec.columnsLong * 2 - 4).toBe(spec.columns);
  });

  test("the terrace seats every colossus on its throne, facing the court", () => {
    const nemrut = reconstructions.find((r) => r.id === "nemrut-dogu-terasi")!;
    const spec = nemrut.model;
    if (spec.kind !== "tumulus-sanctuary") throw new Error("expected a sanctuary");
    const enthroned = partsOf(nemrut).filter(
      (part): part is Extract<Part, { kind: "figure" }> =>
        part.kind === "figure" && part.pose === "seated",
    );
    expect(enthroned.length).toBe(spec.colossi);
    for (const figure of enthroned) {
      // Seated height plus the throne is the cited statue height.
      expect(figure.height * 0.52 + spec.throneHeight).toBeCloseTo(spec.statueHeight, 5);
      // Every one faces +x, out over the court.
      expect(Math.sin(figure.rotY)).toBeCloseTo(1, 5);
    }
    // The mound is scenery, so the camera frames the terrace and not 152 m of gravel.
    const { max, min } = boundsOf(partsOf(nemrut));
    expect(max[0] - min[0]).toBeLessThan(spec.tumulusDiameter);
    expect(max[1]).toBeLessThan(spec.tumulusHeight);
  });

  test("the open-ended stadium closes only its north end", () => {
    const perge = reconstructions.find((r) => r.id === "perge-stadyumu")!;
    const spec = perge.model;
    if (spec.kind !== "stadium") throw new Error("expected a stadium");
    expect(spec.openEnd).toBe(true);
    const endRings = partsOf(perge).filter(
      (part) => part.kind === "ring" && Math.abs(part.at[2]) > spec.overallLength / 4,
    );
    expect(endRings.length).toBeGreaterThan(0);
    expect(endRings.every((part) => part.at[2] > 0)).toBe(true);
    const tread = (spec.overallWidth - spec.arenaWidth) / 2 / spec.rows;
    expect(tread).toBeCloseTo(0.63, 2);
  });

  test("the pseudodipteros raises one ring of columns, not two", () => {
    const aizanoi = reconstructions.find((r) => r.id === "aizanoi-zeus-tapinagi")!;
    const spec = aizanoi.model;
    if (spec.kind !== "ionic-dipteros") throw new Error("expected a temple");
    expect(spec.rings).toBe(1);
    expect(2 * spec.outerColumnsShort + 2 * spec.outerColumnsLong - 4).toBe(spec.totalColumns);
  });
});
