import { describe, expect, test } from "bun:test";
import { assessDevice, framesTooSlow, isHeavy } from "@/lib/device-tier";
import { angleDelta, orientationToLook, smoothAngle } from "@/lib/gyro";
import { reconstructionGuide } from "@/lib/narration";
import {
  linesFor,
  personLine,
  spectatorLine,
  storyRole,
  STORY_ERAS,
  type StoryRole,
} from "@/lib/person-stories";
import { generateQuests, questHit, questTitle, questTotals, badgeId } from "@/lib/quests";
import { boundsOf, partsFor } from "@/lib/reconstruction-parts";
import { reconstructions } from "@/lib/reconstructions";
import { chooseScaleRefs, layoutScaleRefs, REF_SIZE } from "@/lib/scale-refs";
import { lifeFor, STATUE_MATERIALS } from "@/lib/scene-life";
import { todayPhotoFor } from "@/lib/today-photo";
import { creditFor } from "@/lib/photo-credits";
import { orderByPath, pathLength, planTour, dwellSeconds, type Vec3 } from "@/lib/tour";
import { defaultWeather, nearestLight, timeOfDay } from "@/lib/weather";

const lives = reconstructions.map((item) => ({ item, life: lifeFor(item) }));

describe("guided tour", () => {
  test("path order starts at the first point and visits each once", () => {
    const points: Vec3[] = [
      [0, 0, 0],
      [10, 0, 0],
      [1, 0, 0],
      [9, 0, 0],
      [2, 0, 0],
    ];
    const order = orderByPath(points, 0);
    expect(order[0]).toBe(0);
    expect([...order].sort()).toEqual([0, 1, 2, 3, 4]);
    expect(pathLength(points, order)).toBeLessThanOrEqual(10 + 1e-9);
    expect(pathLength(points, order)).toBeLessThan(pathLength(points, [0, 1, 2, 3, 4]));
  });

  test("every model's tour has one shot per chapter, opens wide and covers every hotspot", () => {
    for (const item of reconstructions) {
      for (const reorder of [true, false]) {
        const guide = reconstructionGuide(item);
        const plan = planTour(guide, item.hotspots, reorder);
        expect(plan.stops.length).toBe(plan.guide.chapters.length);
        expect(plan.guide.chapters.length).toBe(guide.chapters.length);
        expect(plan.stops[0]!.kind).toBe("view");
        const spots = plan.stops.flatMap((s) => (s.kind === "spot" ? [s.hotspot] : []));
        expect([...spots].sort((a, b) => a - b)).toEqual(item.hotspots.map((_, i) => i));
        // The chapter a stop belongs to is the chapter about that hotspot.
        plan.stops.forEach((stop, i) => {
          if (stop.kind === "spot") expect(plan.guide.chapters[i]!.hotspot).toBe(stop.hotspot);
        });
        if (!reorder) expect(plan.guide.chapters).toEqual(guide.chapters);
      }
    }
  });

  test("a silent stop is held long enough to look", () => {
    expect(dwellSeconds("")).toBeGreaterThanOrEqual(6);
    expect(dwellSeconds("x".repeat(700))).toBeGreaterThan(40);
  });
});

describe("talking people", () => {
  test("every person in every scene has a line in all four languages", () => {
    for (const { item, life } of lives) {
      life.people.forEach((person, index) => {
        const said = personLine(life.era, person, index);
        for (const lang of ["tr", "en", "de", "ru"] as const) {
          expect(`${item.id}#${index} ${lang}: ${(said.text[lang] ?? "").length > 10}`).toBe(
            `${item.id}#${index} ${lang}: true`,
          );
        }
      });
    }
  });

  test("each era in use has its own lines, and common roles have at least six", () => {
    const counts = new Map<string, number>();
    for (const { life } of lives) {
      expect(STORY_ERAS).toContain(life.era);
      for (const person of life.people) {
        const key = `${life.era}|${storyRole(person)}`;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
    for (const [key, n] of counts) {
      const [era, role] = key.split("|") as [string, StoryRole];
      const lines = linesFor(era, role);
      expect(`${key}: ${lines.length >= 3}`).toBe(`${key}: true`);
      if (n >= 3)
        expect(`${key} (${n} people): ${lines.length >= 6}`).toBe(`${key} (${n} people): true`);
    }
  });

  test("every era with lines has at least six for ordinary people", () => {
    for (const era of STORY_ERAS) expect(linesFor(era, "citizen").length).toBeGreaterThanOrEqual(6);
  });

  test("the same person says the same thing, and the next thing on the next tap", () => {
    const { life } = lives[0]!;
    const a = personLine(life.era, life.people[0]!, 0, 0);
    const b = personLine(life.era, life.people[0]!, 0, 0);
    const c = personLine(life.era, life.people[0]!, 0, 1);
    expect(a.text).toEqual(b.text);
    if (a.of > 1) expect(c.text).not.toEqual(a.text);
    expect(spectatorLine("roman", 12).role).toBe("spectator");
  });

  test("roles are read off dress and gear", () => {
    const actor = lives.find(({ item }) => item.model.kind === "roman-theatre")!.life.people;
    expect(actor.some((p) => storyRole(p) === "actor")).toBe(true);
    const nemrut = lives.find(({ item }) => item.id === "nemrut-dogu-terasi");
    if (nemrut) expect(nemrut.life.people.some((p) => storyRole(p) === "priest")).toBe(true);
  });
});

describe("discovery quests", () => {
  test("every model gets two to six quests with stable unique ids", () => {
    for (const { item, life } of lives) {
      const parts = partsFor(item.model);
      const bounds = boundsOf(parts);
      const all = [...parts, ...life.props];
      const quests = generateQuests({
        modelId: item.id,
        hotspots: item.hotspots,
        statues: all.flatMap((p) =>
          p.kind === "figure" && p.identity && STATUE_MATERIALS.includes(p.material)
            ? [{ name: p.identity.name, at: p.at, height: p.height }]
            : [],
        ),
        plates: all.flatMap((p) =>
          p.kind === "box" && (p as { lettering?: unknown }).lettering
            ? [{ at: p.at, width: p.size[0], height: p.size[1] }]
            : [],
        ),
        groundY: bounds.min[1],
        span: Math.max(...bounds.max.map((v, i) => v - bounds.min[i]!)),
      });
      expect(`${item.id}: ${quests.length >= 2 && quests.length <= 6}`).toBe(`${item.id}: true`);
      expect(new Set(quests.map((q) => q.id)).size).toBe(quests.length);
      for (const quest of quests) {
        expect(quest.id.startsWith(`${item.id}:`)).toBe(true);
        for (const lang of ["tr", "en", "de", "ru"] as const)
          expect(questTitle(quest, lang).length).toBeGreaterThan(4);
      }
      if (item.id === "celsus-kutuphanesi")
        expect(quests.some((q) => q.kind === "statue" && q.subject?.en === "Sophia")).toBe(true);
    }
  });

  test("a quest is done by standing there or looking at it", () => {
    const reach = {
      id: "m:a",
      kind: "reach" as const,
      at: [0, 0, 0] as Vec3,
      radius: 4,
      range: 30,
    };
    expect(questHit(reach, [1, 1.6, 1], [0, 0, -1])).toBe(true);
    expect(questHit(reach, [10, 1.6, 0], [0, 0, -1])).toBe(false);
    const aim = { id: "m:b", kind: "aim" as const, at: [0, 5, -20] as Vec3, radius: 2, range: 30 };
    const towards: Vec3 = [0, 3.4 / 20.06, -20 / 20.06];
    expect(questHit(aim, [0, 1.6, 0], towards)).toBe(true);
    expect(questHit(aim, [0, 1.6, 0], [1, 0, 0])).toBe(false);
    expect(questHit(aim, [0, 1.6, 40], [0, 0, -1])).toBe(false);
  });

  test("totals count quests and badges apart", () => {
    expect(questTotals({ m: ["m:a", "m:b", badgeId("m")], n: ["n:a"] })).toEqual({
      quests: 3,
      badges: 1,
    });
  });
});

describe("scale comparison", () => {
  test("big sites get a football pitch, small ones a person first", () => {
    expect(chooseScaleRefs({ width: 140, depth: 90, height: 27 })[0]).toBe("pitch");
    expect(chooseScaleRefs({ width: 26, depth: 26, height: 19 })[0]).toBe("person");
    expect(chooseScaleRefs({ width: 60, depth: 40, height: 29 })).toContain("block");
  });

  test("references stand clear of the model and of each other", () => {
    const refs = chooseScaleRefs({ width: 30, depth: 30, height: 20 });
    const placed = layoutScaleRefs(refs, [0, 0], [15, 15], [1, 0]);
    for (const p of placed) expect(p.x).toBeGreaterThan(15);
    for (let i = 1; i < placed.length; i += 1) {
      const a = placed[i - 1]!;
      const b = placed[i]!;
      const gap = Math.hypot(a.x - b.x, a.z - b.z);
      expect(gap).toBeGreaterThanOrEqual((REF_SIZE[a.ref].w + REF_SIZE[b.ref].w) / 2);
    }
  });
});

describe("low-end devices", () => {
  test("hints", () => {
    expect(assessDevice({ memory: 2, cores: 8, touch: true })).toBe("low");
    expect(assessDevice({ memory: 4, cores: 4, touch: true })).toBe("low");
    expect(assessDevice({ memory: 8, cores: 8, touch: true })).toBe("mid");
    expect(assessDevice({ memory: 8, cores: 12, touch: false })).toBe("high");
    expect(assessDevice({ touch: false, gpu: "Google SwiftShader" })).toBe("low");
    expect(assessDevice({ touch: true, gpu: "Adreno (TM) 506", memory: 8, cores: 8 })).toBe("low");
    expect(assessDevice({ touch: true, gpu: "Adreno (TM) 740", memory: 8, cores: 8 })).toBe("mid");
    expect(assessDevice({ touch: true })).toBe("mid");
  });

  test("measured frames", () => {
    expect(framesTooSlow(Array(30).fill(16))).toBe(false);
    expect(framesTooSlow(Array(30).fill(60))).toBe(true);
    expect(framesTooSlow(Array(30).fill(40))).toBe(false);
    expect(framesTooSlow(Array(30).fill(40), true)).toBe(true);
    expect(framesTooSlow(Array(5).fill(200))).toBe(false);
    expect(isHeavy(2_000_000)).toBe(true);
    expect(isHeavy(200_000)).toBe(false);
  });
});

describe("gyroscope look", () => {
  test("a phone held upright looks level, and turning it turns the view", () => {
    const upright = orientationToLook(0, 90, 0, 0);
    expect(Math.abs(upright.pitch)).toBeLessThan(1e-6);
    const turned = orientationToLook(30, 90, 0, 0);
    expect(Math.abs(angleDelta(upright.yaw, turned.yaw) - Math.PI / 6)).toBeLessThan(1e-6);
    const tilted = orientationToLook(0, 120, 0, 0);
    expect(tilted.pitch).toBeGreaterThan(0.4);
  });

  test("smoothing goes the short way round", () => {
    expect(angleDelta(3, -3)).toBeCloseTo(2 * Math.PI - 6, 6);
    expect(smoothAngle(0, 1, 0.5)).toBeCloseTo(0.5, 6);
  });
});

describe("weather and time", () => {
  test("defaults follow the setting", () => {
    expect(defaultWeather({ id: "nemrut", siteSlug: "nemrut", biome: "mountain", kind: "x" })).toBe(
      "dust",
    );
    expect(
      defaultWeather({ id: "sumela-manastiri", siteSlug: "sumela", biome: "mountain", kind: "x" }),
    ).toBe("mist");
    expect(
      defaultWeather({ id: "celsus", siteSlug: "efes", biome: "mediterranean", kind: "x" }),
    ).toBe("clouds");
  });

  test("the day goes round through every light", () => {
    const seen = new Set<string>();
    for (let p = 0; p < 1; p += 0.01) seen.add(nearestLight(p));
    expect([...seen].sort()).toEqual(["day", "golden", "night"]);
    for (let p = 0; p < 1; p += 0.05) {
      const { f } = timeOfDay(p);
      expect(f).toBeGreaterThanOrEqual(0);
      expect(f).toBeLessThanOrEqual(1);
    }
  });
});

describe("then and now", () => {
  test("a compare photo is always one the app credits", () => {
    for (const item of reconstructions) {
      const photo = todayPhotoFor(item);
      if (photo) expect(`${item.id}: ${Boolean(creditFor(photo))}`).toBe(`${item.id}: true`);
    }
    const gobekli = reconstructions.find((r) => r.id === "gobeklitepe-d-yapisi");
    if (gobekli) expect(todayPhotoFor(gobekli)).toBeDefined();
  });
});
