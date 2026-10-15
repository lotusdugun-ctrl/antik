import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { applyStories } from "@/lib/narration-stories";
import type { Guide } from "@/lib/narration";

describe("narration stories", () => {
  test("every written chapter keeps the facts of the one it replaces", () => {
    // The checker compares numbers, names, coverage and length; see its header.
    const run = Bun.spawnSync(["bun", join(import.meta.dir, "../../../scripts/check-stories.ts")], {
      cwd: join(import.meta.dir, "../../.."),
    });
    const output = run.stdout.toString() + run.stderr.toString();
    expect(output).toContain(" 0 with problems");
    expect(run.exitCode).toBe(0);
  }, 60_000);

  test("a story replaces only the languages the guide speaks", () => {
    const guide: Guide = {
      key: "site:x",
      title: { tr: "X", en: "X" },
      langs: ["tr", "en"],
      chapters: [
        { id: "intro", title: { tr: "a", en: "a" }, text: { tr: "eski", en: "old" } },
        { id: "outro", title: { tr: "b", en: "b" }, text: { tr: "son", en: "end" } },
      ],
    };
    const out = applyStories(guide, { tr: { intro: "yeni" }, de: { intro: "neu" } });
    expect(out.chapters[0]!.text).toEqual({ tr: "yeni", en: "old" });
    expect(out.chapters[1]).toBe(guide.chapters[1]!);
    expect(applyStories(guide, undefined)).toBe(guide);
  });
});
