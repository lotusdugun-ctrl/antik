import { describe, expect, test } from "bun:test";
import { endingsOf, stories } from "@/lib/stories";
import { getSite } from "@/lib/sites";

describe("stories", () => {
  test("ids are unique and each belongs to a real site", () => {
    expect(new Set(stories.map((s) => s.id)).size).toBe(stories.length);
    for (const story of stories) expect(getSite(story.siteSlug)).toBeDefined();
  });

  for (const story of stories) {
    describe(story.id, () => {
      test("every choice leads to a scene that exists", () => {
        expect(story.scenes[story.start]).toBeDefined();
        for (const [id, scene] of Object.entries(story.scenes)) {
          for (const choice of scene.choices) {
            expect(`${id} → ${choice.to}: ${Boolean(story.scenes[choice.to])}`).toBe(
              `${id} → ${choice.to}: true`,
            );
          }
        }
      });

      test("a scene is an ending exactly when it has no choices", () => {
        for (const scene of Object.values(story.scenes)) {
          expect(Boolean(scene.ending)).toBe(scene.choices.length === 0);
        }
      });

      test("every scene is reachable and every path ends", () => {
        const seen = new Set<string>();
        const queue = [story.start];
        while (queue.length) {
          const id = queue.shift()!;
          if (seen.has(id)) continue;
          seen.add(id);
          queue.push(...story.scenes[id]!.choices.map((c) => c.to));
        }
        expect([...seen].sort()).toEqual(Object.keys(story.scenes).sort());
        expect(endingsOf(story).length).toBeGreaterThanOrEqual(2);
      });

      test("every text exists in both languages", () => {
        const texts = [
          story.title,
          story.role,
          story.period,
          story.blurb,
          ...Object.values(story.scenes).flatMap((s) => [
            s.text,
            ...(s.history ? [s.history] : []),
            ...s.choices.map((c) => c.label),
            ...(s.ending ? [s.ending.title] : []),
          ]),
        ];
        for (const text of texts) {
          expect(text.tr.trim().length).toBeGreaterThan(0);
          expect(text.en.trim().length).toBeGreaterThan(0);
        }
      });
    });
  }
});
