import { describe, expect, test } from "bun:test";
import { boundsOf, CARVINGS, partsFor, SHAFT_DRUMS, type Part } from "@/lib/reconstruction-parts";
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
    // Ephesus has three, which is the case the lookup has to keep apart.
    expect(reconstructionsFor("efes").map((r) => r.id)).toEqual([
      "celsus-kutuphanesi",
      "artemis-tapinagi",
      "efes-yamac-evler",
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

  /**
   * Scale is the whole argument of a reconstruction, so each model carries a
   * 1.75 m person. If the figure went missing, 19.7 m columns would read as
   * ordinary ones.
   */
  test("every model puts a person in it for scale", () => {
    for (const item of reconstructions) {
      const figures = partsOf(item).filter(
        (part) => part.kind === "figure" && part.material === "human",
      );
      expect(figures.length).toBeGreaterThan(0);
      expect(figures.every((f) => f.kind === "figure" && f.height > 1.5 && f.height < 2)).toBe(
        true,
      );
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
