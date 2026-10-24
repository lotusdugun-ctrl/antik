import { describe, expect, test } from "bun:test";
import {
  asCut,
  extent,
  glyphOf,
  layout,
  measure,
  runs,
  TEXTS,
  type EpigraphicText,
  type Lettering,
} from "@/lib/epigraphy";
import {
  partsFor,
  stadiumLayout,
  theatreLayout,
  walkStartFor,
  type Part,
  type Vec3,
} from "@/lib/reconstruction-parts";
import { reconstructions, type Reconstruction } from "@/lib/reconstructions";
import { lifeFor } from "@/lib/scene-life";

/*
 * The writing on the stones: real texts, in the script of their time, drawn
 * letter by letter — and where a walk begins.
 */

const byId = (id: string) => reconstructions.find((item) => item.id === id)!;
// Building a scene's life is the slow part; each is built once.
const lives = new Map<string, ReturnType<typeof lifeFor>>();
const lifeOf = (item: Reconstruction) => {
  if (!lives.has(item.id)) lives.set(item.id, lifeFor(item));
  return lives.get(item.id)!;
};
const SLOW = 120_000;
type Plate = Extract<Part, { kind: "box" }> & { lettering: Lettering };
const platesOf = (item: Reconstruction, withLife = false): Plate[] =>
  [...partsFor(item.model), ...(withLife ? lifeOf(item).props : [])].filter(
    (part): part is Plate => part.kind === "box" && part.lettering !== undefined,
  );
const textOf = (plates: Plate[]) => plates.flatMap((plate) => plate.lettering.lines).join(" ");

describe("the texts", () => {
  test("every text cites an edition and a page to read it on", () => {
    for (const [id, text] of Object.entries(TEXTS) as [string, EpigraphicText][]) {
      expect(`${id}: ${text.ref.length > 3}`).toBe(`${id}: true`);
      expect(`${id}: ${/^https:\/\//.test(text.source)}`).toBe(`${id}: true`);
    }
  });

  test("every letter of every text can be drawn", () => {
    const missing: string[] = [];
    for (const [id, text] of Object.entries(TEXTS) as [string, EpigraphicText][]) {
      const lines = Array.isArray(text.text) ? text.text : [text.text];
      for (const line of lines)
        for (const char of asCut(line, text.script))
          if (char !== " " && !glyphOf(char)) missing.push(`${id}: ${char}`);
    }
    expect(missing).toEqual([]);
  });

  test("Greek is cut in Greek capitals, Latin in Latin ones", () => {
    for (const [id, text] of Object.entries(TEXTS) as [string, EpigraphicText][]) {
      const cut = (Array.isArray(text.text) ? text.text : [text.text])
        .map((line) => asCut(line, text.script))
        .join(" ");
      if (text.lang === "la") {
        expect(`${id}: ${/^[A-Z· ]+$/.test(cut)}`).toBe(`${id}: true`);
      } else {
        // No Latin letters in a Greek text; and the sigma of its period.
        expect(`${id}: ${/[A-Z]/.test(cut)}`).toBe(`${id}: false`);
        if (text.script === "greek-lunate") expect(cut.includes("Σ")).toBe(false);
        if (text.script === "greek") expect(cut.includes("Ϲ")).toBe(false);
      }
    }
  });

  test("abbreviations are cut as abbreviated, accents and brackets dropped", () => {
    expect(asCut("Τι(βέριον) Ἰούλ[ιον]", "greek-lunate")).toBe("ΤΙ ΙΟΥΛΙΟΝ");
    expect(asCut("Ἀρτέμιδι Ἐφεσίαι", "greek")).toBe("ΑΡΤΕΜΙΔΙ ΕΦΕΣΙΑΙ");
    expect(asCut("ἀγαθῇ τύχῃ", "greek-lunate")).toBe("ΑΓΑΘΗ ΤΥΧΗ");
  });

  test("a laid-out text fits the field it is given", () => {
    for (const [width, letter, rows] of [
      [1, 0.1, 2],
      [6, 0.3, 1],
      [2.5, 0.12, 8],
    ] as const) {
      const out = layout(TEXTS.celsusArchitrave, { width, letter, rows });
      const [w] = extent(out);
      expect(w).toBeLessThanOrEqual(width + 1e-9);
      expect(out.lines.length).toBeLessThanOrEqual(rows);
      expect(out.letter).toBeLessThanOrEqual(letter);
    }
  });

  test("a text divided along an architrave loses none of its words", () => {
    const parts = runs(TEXTS.celsusArchitrave.text, [3, 2, 4, 2, 3], "greek-lunate");
    expect(parts.length).toBe(5);
    expect(parts.filter(Boolean).join(" ")).toBe(
      asCut(TEXTS.celsusArchitrave.text as string, "greek-lunate"),
    );
    expect(measure(parts[2]!)).toBeGreaterThan(measure(parts[1]!));
  });
});

describe("the inscriptions on the models", () => {
  const scriptsOf = (id: string, withLife = false) =>
    new Set(platesOf(byId(id), withLife).map((plate) => plate.lettering.script));

  test("each site writes in its own script and language", () => {
    // The library's bases are bilingual; its dedication Greek, with the lunate sigma.
    expect([...scriptsOf("celsus-kutuphanesi")].sort()).toEqual(["greek-lunate", "latin"]);
    expect([...scriptsOf("aspendos-tiyatrosu")].sort()).toEqual(["greek-lunate", "latin"]);
    // Hellenistic stones: the four-barred sigma.
    expect([...scriptsOf("pergamon-zeus-sunagi")]).toEqual(["greek"]);
    expect([...scriptsOf("nemrut-dogu-terasi")]).toEqual(["greek"]);
    expect([...scriptsOf("didyma-apollon-tapinagi")]).toEqual(["greek"]);
    expect([...scriptsOf("artemis-tapinagi")]).toEqual(["greek"]);
    for (const id of ["aizanoi-zeus-tapinagi", "hierapolis-tiyatrosu", "milet-buyuk-tiyatro"])
      expect([...scriptsOf(id)]).toEqual(["greek-lunate"]);
  });

  test("the known texts are where they belong", () => {
    const celsus = textOf(platesOf(byId("celsus-kutuphanesi")));
    for (const words of ["ϹΟΦΙΑ", "ΑΡΕΤΗ", "ΕΝΝΟΙΑ", "ΕΠΙϹΤΗΜΗ", "ΒΙΒΛΙΟΘΗΚΗΝ", "AQVILA"])
      expect(celsus).toContain(words);
    expect(textOf(platesOf(byId("pergamon-zeus-sunagi")))).toContain("ΠΟΡΦΥΡΙΩΝ");
    expect(textOf(platesOf(byId("pergamon-zeus-sunagi")))).toContain("ΗΡΑΚΛΗΣ");
    expect(textOf(platesOf(byId("nemrut-dogu-terasi")))).toContain("ΒΑΣΙΛΕΥΣ ΜΕΓΑΣ ΑΝΤΙΟΧΟΣ");
    expect(textOf(platesOf(byId("milet-buyuk-tiyatro")))).toContain("ΕΙΟΥΔΕΩΝ");
    expect(textOf(platesOf(byId("aspendos-tiyatrosu")))).toContain("CVRTIVS");
    expect(textOf(platesOf(byId("aphrodisias-stadyumu")))).toContain("ΒΕΝΕΤΩΝ");
  });

  test("every surviving name of the Pergamon frieze is on the altar, once", () => {
    const cut = platesOf(byId("pergamon-zeus-sunagi")).map((plate) => plate.lettering.lines[0]);
    for (const id of ["pergamonGods", "pergamonGiants"] as const) {
      for (const name of TEXTS[id].text) {
        expect(`${name}: ${cut.filter((c) => c === asCut(name, "greek")).length}`).toBe(
          `${name}: 1`,
        );
      }
    }
  });

  test(
    "where nothing was written, nothing is",
    () => {
      // Göbeklitepe is eleven thousand years older than writing.
      expect(platesOf(byId("gobeklitepe-d-yapisi"), true)).toEqual([]);
      // No text from the Mausoleum's own walls survives.
      expect(platesOf(byId("halikarnas-mozolesi"))).toEqual([]);
    },
    SLOW,
  );

  test("no long inscription is cut more than twice on a building", () => {
    for (const item of reconstructions) {
      const seen = new Map<string, number>();
      for (const plate of platesOf(item)) {
        const key = plate.lettering.lines.join("/");
        seen.set(key, (seen.get(key) ?? 0) + 1);
      }
      for (const [key, count] of seen) {
        // Seat labels may recur; a long text only on a pair of matching bases.
        if (key.length > 40)
          expect(`${item.id} ${key.slice(0, 30)}: ${count <= 2}`).toBe(
            `${item.id} ${key.slice(0, 30)}: true`,
          );
      }
    }
  });

  test(
    "letters are cut at the sizes such stones carry",
    () => {
      const sizes = (id: string, withLife = false) =>
        platesOf(byId(id), withLife).map((plate) => plate.lettering.letter);
      // A virtue's name on her base: 5-12 cm.
      for (const letter of platesOf(byId("celsus-kutuphanesi"))
        .filter(
          (plate) => plate.lettering.lines.length === 2 && plate.lettering.lines[1] === "ΚΕΛϹΟΥ",
        )
        .map((plate) => plate.lettering.letter)) {
        expect(letter).toBeGreaterThanOrEqual(0.05);
        expect(letter).toBeLessThanOrEqual(0.12);
      }
      // Statue bases in the squares: legible, not shouting.
      for (const item of reconstructions)
        for (const plate of lifeOf(item).props.filter(
          (part): part is Plate => part.kind === "box" && part.lettering !== undefined,
        )) {
          expect(plate.lettering.letter).toBeGreaterThanOrEqual(0.03);
          expect(plate.lettering.letter).toBeLessThanOrEqual(0.12);
        }
      // Architraves and gates: larger, to be read from the ground.
      for (const id of ["artemis-tapinagi", "didyma-apollon-tapinagi", "aizanoi-zeus-tapinagi"])
        expect(Math.max(...sizes(id))).toBeGreaterThanOrEqual(0.12);
      expect(Math.max(...sizes("perge-stadyumu"))).toBeGreaterThanOrEqual(0.2);
      // Nothing anywhere smaller than a fingernail.
      for (const item of reconstructions)
        for (const letter of sizes(item.id, true)) expect(letter).toBeGreaterThanOrEqual(0.03);
    },
    SLOW,
  );

  test(
    "a plate is no bigger than its text and faces out of its stone",
    () => {
      for (const item of reconstructions) {
        for (const plate of platesOf(item, true)) {
          const [w, h] = extent(plate.lettering);
          expect(Math.abs(plate.size[0] - w)).toBeLessThan(1e-6);
          expect(Math.abs(plate.size[1] - h)).toBeLessThan(1e-6);
          expect(plate.size[2]).toBeLessThan(0.02);
        }
      }
    },
    SLOW,
  );
});

describe("where a walk begins", () => {
  /** Whether (x, y, z) is inside a solid block of the building. */
  const inside = (parts: Part[], [x, y, z]: Vec3) =>
    parts.some((part) => {
      if (part.decor || part.kind !== "box" || part.rotX || part.material === "shadow")
        return false;
      const dx = x - part.at[0];
      const dz = z - part.at[2];
      const u = dx * Math.cos(part.rotY) - dz * Math.sin(part.rotY);
      const v = dx * Math.sin(part.rotY) + dz * Math.cos(part.rotY);
      return (
        Math.abs(u) < part.size[0] / 2 &&
        Math.abs(v) < part.size[2] / 2 &&
        y > part.at[1] &&
        y < part.at[1] + part.size[1]
      );
    });

  test("every model starts its walk standing in the open, facing what it came to see", () => {
    for (const item of reconstructions) {
      const start = walkStartFor(item.model);
      const parts = partsFor(item.model);
      const [x, z] = start.at;
      for (const y of [0.3, 1, 1.7])
        expect(`${item.id} ${y}: ${inside(parts, [x, start.floor + y, z])}`).toBe(
          `${item.id} ${y}: false`,
        );
      // Looking at something, not at the feet.
      expect(Math.hypot(start.look[0] - x, start.look[2] - z)).toBeGreaterThan(5);
    }
  });

  test("in a theatre, a few rows up on the axis, the stage in front", () => {
    for (const item of reconstructions) {
      if (item.model.kind !== "roman-theatre") continue;
      const L = theatreLayout(item.model);
      const start = walkStartFor(item.model);
      const [x, z] = start.at;
      const r = Math.hypot(x, z);
      // On a seat of the lower rows, not on the outside of the theatre.
      expect(r).toBeGreaterThan(L.orchestraRadius);
      expect(r).toBeLessThan(L.orchestraRadius + 6);
      // And its floor is the top of a seat row at that radius.
      const seat = partsFor(item.model).find(
        (part) =>
          part.kind === "ring" &&
          part.inner <= r &&
          part.outer >= r &&
          Math.abs(part.at[1] + part.height - start.floor) < 1e-6,
      );
      expect(`${item.id}: ${seat !== undefined}`).toBe(`${item.id}: true`);
      expect(start.look[2]).toBeLessThan(0);
    }
  });

  test("in a stadium, on the track", () => {
    for (const item of reconstructions) {
      if (item.model.kind !== "stadium") continue;
      const L = stadiumLayout(item.model);
      const [x, z] = walkStartFor(item.model).at;
      expect(Math.abs(x)).toBeLessThan(L.arenaHalf);
      expect(z).toBeGreaterThan(L.trackMin);
      expect(z).toBeLessThan(L.trackMax);
    }
  });

  test("at a temple, in the forecourt before the steps", () => {
    for (const item of reconstructions) {
      if (item.model.kind !== "ionic-dipteros") continue;
      const [x, z] = walkStartFor(item.model).at;
      expect(x).toBe(0);
      expect(z).toBeLessThan(-item.model.crepidomaLength / 2);
      expect(z).toBeGreaterThan(-item.model.crepidomaLength / 2 - 12);
    }
  });
});

describe("the cost of the new detail", () => {
  /** Triangles the renderer makes of a part, near enough to budget with (as in detail.test). */
  const triangles = (part: Part) =>
    part.kind === "box"
      ? part.material.startsWith("lettering")
        ? 2
        : 12
      : part.kind === "prism"
        ? 8
        : part.kind === "cylinder"
          ? 4 * part.segments
          : 0;
  /*
   * Each building priced the same way before its inscriptions were written
   * out and its bare walls dressed. Real lettering is two triangles a text
   * where the old letter-shaped cuts were two a stroke, so most buildings
   * got cheaper; none may grow by more than 15%.
   */
  const BEFORE: Record<string, number> = {
    "celsus-kutuphanesi": 45936,
    "aspendos-tiyatrosu": 102914,
    "didyma-apollon-tapinagi": 369380,
    "gobeklitepe-d-yapisi": 20832,
    "artemis-tapinagi": 398744,
    "pergamon-zeus-sunagi": 149074,
    "aphrodisias-stadyumu": 107006,
    "hierapolis-tiyatrosu": 139306,
    "milet-buyuk-tiyatro": 79964,
    "efes-yamac-evler": 31760,
    "efes-buyuk-tiyatro": 237372,
    "side-tiyatrosu": 257494,
    "perge-stadyumu": 29306,
    "aizanoi-zeus-tapinagi": 139266,
    "halikarnas-mozolesi": 133818,
    "nemrut-dogu-terasi": 12518,
    "hattusa-aslanli-kapi": 18756,
    "troya-vi-surlari": 32808,
    "catalhoyuk-dogu-hoyugu": 23720,
    "ani-katedrali": 65964,
    "sagalassos-antoninler-cesmesi": 45944,
    "zeugma-villa": 64980,
    "sumela-manastiri": 30340,
    "patara-deniz-feneri": 12360,
  };
  /*
   * Allowed more, with the reason. Hattusa's glacis is now faced with its
   * courses of slabs, several hundred boxes on a model whose bulk is
   * carvings (which this count prices at nothing): +40% here is about +6%
   * of what the renderer draws.
   */
  const ALLOW: Record<string, number> = { "hattusa-aslanli-kapi": 1.42 };
  test("no building grows by more than 15%", () => {
    for (const item of reconstructions) {
      const now = partsFor(item.model).reduce((sum, part) => sum + triangles(part), 0);
      const allow = ALLOW[item.id] ?? 1.15;
      expect(`${item.id}: ${now <= BEFORE[item.id]! * allow}`).toBe(`${item.id}: true`);
    }
  });
});
