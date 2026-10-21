import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { boundsOf, partsFor } from "@/lib/reconstruction-parts";
import { reconstructions } from "@/lib/reconstructions";
import { lifeFor } from "@/lib/scene-life";
import { spotsFor } from "@/lib/sound-spots";
import {
  CALLS,
  callsOf,
  CLIPS,
  clipsOf,
  FAR_GAIN,
  hearing,
  levelAt,
  NEAR_GAIN,
  nearestOn,
  soundscapeFor,
  spotsOf,
  VOICES,
  voicesOf,
  type Point,
  type Soundscape,
  type TimeOfDay,
} from "@/lib/soundscapes";

const PUBLIC = join(import.meta.dir, "..", "..", "..", "public", "ambience");
const TIMES: TimeOfDay[] = ["day", "golden", "night"];

/** What every kind of place must have, at the least. */
const EXPECTED: Record<string, { character: Soundscape["character"]; must: string[] }> = {
  "roman-theatre": {
    character: "theatre",
    must: ["murmur", "applause1", "aulos", "lyre", "laugh1"],
  },
  stadium: { character: "stadium", must: ["murmur", "hooves", "neigh1", "cheer", "applause1"] },
  "ionic-dipteros": { character: "sanctuary", must: ["birds", "fire", "aulos", "drum", "moo1"] },
  "great-altar": { character: "sanctuary", must: ["birds", "fire", "aulos", "drum", "moo1"] },
  "roman-facade": { character: "agora", must: ["market", "fountain", "footsteps", "dog1"] },
  "peristyle-house": { character: "house", must: ["fountain", "market", "footsteps", "lyre"] },
  mausoleum: { character: "harbour", must: ["sea", "market", "saw"] },
  "tumulus-sanctuary": { character: "mountain", must: ["fire", "crow", "drum"] },
  "neolithic-enclosure": { character: "neolithic", must: ["fire", "stone", "crow"] },
  "hittite-gate": { character: "citadel", must: ["fire", "footsteps", "moo1", "sheep"] },
  "troy-citadel": { character: "citadel", must: ["fire", "footsteps", "neigh1", "sheep"] },
  "neolithic-town": { character: "neolithic", must: ["fire", "stone", "crow", "sheep"] },
  "medieval-cathedral": { character: "church", must: ["murmur", "footsteps", "dog1"] },
  nymphaeum: { character: "agora", must: ["fountain", "market", "footsteps", "dog1"] },
  "terrace-villa": { character: "house", must: ["fountain", "market", "footsteps", "lyre"] },
  "cliff-monastery": { character: "mountain", must: ["birds", "fountain", "crow", "sheep"] },
  lighthouse: { character: "harbour", must: ["sea", "market", "saw", "fire"] },
};

describe("soundscapes", () => {
  test("all twenty-four models have one", () => {
    expect(reconstructions.length).toBe(24);
  });

  for (const item of reconstructions) {
    test(`${item.id} sounds like a ${item.model.kind}`, () => {
      const scape = soundscapeFor(item);
      const expected = EXPECTED[item.model.kind];
      expect(expected).toBeDefined();
      expect(scape.character).toBe(expected!.character);
      const clips = clipsOf(scape);
      for (const clip of expected!.must) expect(clips).toContain(clip as keyof typeof CLIPS);
      // Something to hear at every hour, and the night is not the day.
      for (const time of TIMES) {
        const loud = scape.beds.filter((bed) => levelAt(bed.level, time) > 0);
        expect(loud.length + (scape.synth.wind > 0 ? 1 : 0)).toBeGreaterThan(1);
      }
      expect(
        levelAt(scape.beds.find((b) => b.clip === "crickets")!.level, "night"),
      ).toBeGreaterThan(0);
      expect(levelAt(scape.beds.find((b) => b.clip === "crickets")!.level, "day")).toBe(0);
    });
  }

  test("temples get the hymn of their own god", () => {
    const byId = (id: string) => soundscapeFor(reconstructions.find((r) => r.id === id)!);
    expect(byId("artemis-tapinagi").voices).toEqual(["hymn-artemis"]);
    expect(byId("didyma-apollon-tapinagi").voices).toEqual(["hymn-apollo"]);
    expect(byId("aizanoi-zeus-tapinagi").voices).toContain("hymn-zeus");
    expect(byId("pergamon-zeus-sunagi").voices).toContain("hymn-cleanthes");
    // The unfinished temple still has its masons.
    expect(clipsOf(byId("didyma-apollon-tapinagi"))).toContain("stone");
  });

  test("Göbeklitepe has no Greek, and nothing but a drum and a rattle for music", () => {
    const scape = soundscapeFor(reconstructions.find((r) => r.id === "gobeklitepe-d-yapisi")!);
    expect(voicesOf(scape)).toEqual([]);
    expect(scape.director).toBe("rite");
    const clips = clipsOf(scape);
    for (const instrument of ["aulos", "lyre", "applause1", "market"] as const)
      expect(clips).not.toContain(instrument);
    expect(callsOf(scape)).toContain("lark");
  });

  test("the night is its own soundscape everywhere", () => {
    for (const item of reconstructions) {
      const scape = soundscapeFor(item);
      // Something that only the night has: an owl, or the crickets at their loudest.
      const owl = scape.happenings.some(
        (h) => h.sounds.includes("owl") && levelAt(h.level, "night") > 0,
      );
      expect(owl).toBe(true);
      expect(
        scape.happenings.every((h) => !h.sounds.includes("owl") || levelAt(h.level, "day") === 0),
      ).toBe(true);
      const changed = scape.beds.filter(
        (bed) => levelAt(bed.level, "night") !== levelAt(bed.level, "day"),
      );
      expect(changed.length).toBeGreaterThan(1);
      // Crowds and markets fall quiet after dark.
      for (const bed of scape.beds)
        if (bed.clip === "murmur" || bed.clip === "market")
          expect(levelAt(bed.level, "night")).toBeLessThan(levelAt(bed.level, "day"));
    }
  });

  test("the Mausoleum has its harbour and its mourners", () => {
    const scape = soundscapeFor(reconstructions.find((r) => r.id === "halikarnas-mozolesi")!);
    expect(callsOf(scape)).toContain("gull");
    expect(voicesOf(scape)).toContain("lament-andromache");
    expect(clipsOf(scape)).toContain("sea");
  });

  test("every synthesised call is heard somewhere", () => {
    const used = new Set(reconstructions.flatMap((item) => callsOf(soundscapeFor(item))));
    expect([...used].sort()).toEqual([...CALLS].sort());
  });

  test("every recording a scene asks for is in public/ambience", () => {
    const used = new Set(reconstructions.flatMap((item) => clipsOf(soundscapeFor(item))));
    for (const clip of used) expect(existsSync(join(PUBLIC, `${clip}.mp3`))).toBe(true);
    // And nothing is shipped that no scene plays.
    const files = readdirSync(PUBLIC).filter((f) => f.endsWith(".mp3"));
    for (const file of files) expect(used.has(file.replace(/\.mp3$/, "") as never)).toBe(true);
    expect(Object.keys(CLIPS).sort()).toEqual([...used].sort());
  });

  test("voices are optional and all named in the recording script", () => {
    const script = readFileSync(
      join(import.meta.dir, "..", "..", "..", "scripts", "generate_ambience_voices.py"),
      "utf-8",
    );
    for (const voice of VOICES) expect(script).toContain(`"${voice}"`);
    expect(VOICES.length).toBeLessThanOrEqual(40);
    for (const item of reconstructions) {
      for (const voice of voicesOf(soundscapeFor(item))) expect(VOICES).toContain(voice);
    }
    // The app must work before the owner has recorded them: if a manifest is
    // there, every file it lists is there too.
    const manifest = join(PUBLIC, "voices", "manifest.json");
    if (existsSync(manifest)) {
      const { clips } = JSON.parse(readFileSync(manifest, "utf-8")) as {
        clips: Record<string, { file: string }>;
      };
      for (const entry of Object.values(clips))
        expect(existsSync(join(PUBLIC, "voices", entry.file))).toBe(true);
    }
  });

  test("the recordings stay small", () => {
    const files = readdirSync(PUBLIC).filter((f) => f.endsWith(".mp3"));
    const total = files.reduce((sum, f) => sum + statSync(join(PUBLIC, f)).size, 0);
    expect(total).toBeLessThan(8 * 1024 * 1024);
    for (const file of files) expect(statSync(join(PUBLIC, file)).size).toBeLessThan(600 * 1024);
    // The heaviest scene a phone has to fetch.
    for (const item of reconstructions) {
      const bytes = clipsOf(soundscapeFor(item)).reduce(
        (sum, clip) => sum + statSync(join(PUBLIC, `${clip}.mp3`)).size,
        0,
      );
      expect(bytes).toBeLessThan(2 * 1024 * 1024);
    }
  });

  test("the credits name every recording", () => {
    const credits = readFileSync(join(PUBLIC, "CREDITS.txt"), "utf-8");
    for (const clip of Object.keys(CLIPS)) {
      const named = new RegExp(`\\b${clip.replace(/\d$/, "")}`).test(credits);
      expect(named).toBe(true);
    }
  });
});

describe("sounds heard from where they are", () => {
  // Looking down -z, as the camera does by default: +x is to the right.
  const AHEAD: [number, number] = [0, -1];

  test("a placed sound plays at its own level at its own distance", () => {
    expect(hearing([0, 0, 0], AHEAD, [0, 0, -20], 20).gain).toBeCloseTo(1, 6);
  });

  test("it is louder nearer and quieter further, never lost and never deafening", () => {
    const at = (d: number) => hearing([0, 0, 0], AHEAD, [0, 0, -d], 10).gain;
    expect(at(5)).toBeGreaterThan(at(10));
    expect(at(10)).toBeGreaterThan(at(20));
    // Twice as far, half the pressure: the inverse-distance law.
    expect(at(20) / at(40)).toBeCloseTo(2, 6);
    expect(at(0.01)).toBe(NEAR_GAIN);
    expect(at(100000)).toBe(FAR_GAIN);
  });

  test("it is panned to the side it is on, whichever way the listener turns", () => {
    expect(hearing([0, 0, 0], AHEAD, [10, 0, 0], 10).pan).toBeGreaterThan(0.8);
    expect(hearing([0, 0, 0], AHEAD, [-10, 0, 0], 10).pan).toBeLessThan(-0.8);
    expect(Math.abs(hearing([0, 0, 0], AHEAD, [0, 0, -10], 10).pan)).toBeLessThan(1e-9);
    // Turned to face +x, the same source is now straight ahead...
    expect(Math.abs(hearing([0, 0, 0], [1, 0], [10, 0, 0], 10).pan)).toBeLessThan(1e-9);
    // ...and one at -z is on the left.
    expect(hearing([0, 0, 0], [1, 0], [0, 0, -10], 10).pan).toBeLessThan(-0.8);
    // Behind and to the right is still right; the length of `forward` does not matter.
    expect(hearing([0, 0, 0], [0, -7], [5, 0, 5], 10).pan).toBeCloseTo(
      hearing([0, 0, 0], AHEAD, [5, 0, 5], 10).pan,
      9,
    );
  });

  test("overhead, or looking straight down, it sits in the middle", () => {
    expect(hearing([0, 0, 0], AHEAD, [0, 30, 0], 10).pan).toBe(0);
    expect(hearing([0, 0, 0], [0, 0], [10, 0, 0], 10).pan).toBe(0);
    // Close by, the pan eases towards the middle rather than snapping.
    const close = hearing([0, 0, 0], AHEAD, [1, 0, 0], 10).pan;
    const far = hearing([0, 0, 0], AHEAD, [10, 0, 0], 10).pan;
    expect(close).toBeGreaterThan(0);
    expect(close).toBeLessThan(far);
  });

  test("a line is heard from its nearest stretch, a set of points from the nearest", () => {
    const track = {
      points: [
        [0, 0, -50],
        [0, 0, 50],
      ] as Point[],
      line: true,
      ref: 10,
    };
    expect(nearestOn(track, [20, 0, 10])).toEqual([0, 0, 10]);
    expect(nearestOn(track, [20, 0, 90])).toEqual([0, 0, 50]);
    const stalls = {
      points: [
        [5, 0, 0],
        [-30, 0, 0],
      ] as Point[],
      ref: 10,
    };
    expect(nearestOn(stalls, [-20, 0, 0])).toEqual([-30, 0, 0]);
  });

  test("every placed sound of every model is somewhere in that model", () => {
    for (const item of reconstructions) {
      const scape = soundscapeFor(item);
      const places = spotsFor(item, lifeFor(item));
      const { min, max } = boundsOf(partsFor(item.model));
      // The ground the scene is laid out on, as the scene furnishes it: the
      // building and the forecourt its stalls and altar stand in.
      const cx = (min[0] + max[0]) / 2;
      const cz = (min[2] + max[2]) / 2;
      const reach = Math.hypot((max[0] - min[0]) / 2, (max[2] - min[2]) / 2) * 1.25;
      for (const spot of spotsOf(scape)) {
        const place = places[spot];
        expect(`${item.id} ${spot}: ${place !== undefined}`).toBe(`${item.id} ${spot}: true`);
        for (const [x, y, z] of place!.points) {
          const inside =
            Math.hypot(x - cx, z - cz) <= reach && y >= min[1] && y <= max[1] && place!.ref > 0;
          expect(`${item.id} ${spot} ${x},${y},${z}: ${inside}`).toBe(
            `${item.id} ${spot} ${x},${y},${z}: true`,
          );
        }
      }
      // The stage of a theatre is over its stage, inside the building itself.
      if (places.stage) {
        const [x, y, z] = places.stage.points[0]!;
        expect(x >= min[0] && x <= max[0] && y <= max[1] && z >= min[2] && z <= max[2]).toBe(true);
      }
    }
  }, 60000);

  test("each kind of place puts its sounds where they are made", () => {
    const at = (kind: string) =>
      spotsOf(soundscapeFor(reconstructions.find((r) => r.model.kind === kind)!)).sort();
    expect(at("roman-theatre")).toEqual(["stage"]);
    expect(at("stadium")).toEqual(["track"]);
    expect(at("ionic-dipteros")).toEqual(["altar"]);
    expect(at("roman-facade")).toEqual(["fountain", "stalls"]);
    // The Mausoleum's harbour is all round it: nothing placed, as before.
    expect(at("mausoleum")).toEqual([]);
  });
});
