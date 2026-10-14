import { pick } from "@/lib/i18n";
import { describe, expect, test } from "bun:test";
import { recordedAudio } from "@/lib/audio-manifest";
import { guideForSite, structureBlurbFor } from "@/lib/guide-sources";
import { reconstructionGuide, speakableChunks, spokenText } from "@/lib/narration";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { reconstructions } from "@/lib/reconstructions";
import { sites } from "@/lib/sites";

describe("site audio guides", () => {
  test("every site has a guide whose every chapter speaks in both languages", () => {
    for (const site of sites) {
      const guide = guideForSite(site.slug);
      expect(guide).toBeDefined();
      expect(guide!.chapters.length).toBeGreaterThanOrEqual(2);
      const ids = new Set<string>();
      for (const chapter of guide!.chapters) {
        expect(ids.has(chapter.id)).toBe(false);
        ids.add(chapter.id);
        for (const lang of ["tr", "en"] as const) {
          const text = pick(chapter.text, lang);
          expect(text.length).toBeGreaterThan(10);
          expect(text).not.toContain("undefined");
          expect(text).not.toContain("..");
          expect(pick(chapter.title, lang).length).toBeGreaterThan(0);
        }
      }
    }
  });

  test("a structure name shared between sites never borrows another site's blurb", () => {
    // Ephesus' Great Theatre blurb (24,000 seats) must not be read at Miletus.
    const blurb = structureBlurbFor("milet")({ tr: "Büyük Tiyatro", en: "Great Theatre" });
    expect(blurb?.tr ?? "").not.toContain("24.000");
  });

  test("Ephesus' guide walks through its named structures", () => {
    const guide = guideForSite("efes")!;
    const titles = guide.chapters.map((c) => c.title.tr);
    expect(titles).toContain("Celsus Kütüphanesi");
    expect(titles[0]).toBe("Hoş geldiniz");
    expect(titles.at(-1)).toBe("Kapanış");
  });
});

describe("reconstruction tours", () => {
  test("one chapter per hotspot, each pointing at its own hotspot", () => {
    for (const item of reconstructions) {
      const guide = reconstructionGuide(item);
      const spots = guide.chapters.filter((c) => c.hotspot !== undefined);
      expect(spots.length).toBe(item.hotspots.length);
      spots.forEach((chapter, index) => expect(chapter.hotspot).toBe(index));
      expect(guide.chapters.at(-1)!.text.en).toContain(item.uncertainty.en.slice(0, 20));
    }
  });
});

describe("speakable chunks", () => {
  test("keep every word, in order, and stay short", () => {
    const text =
      "Birinci cümle. İkinci cümle biraz daha uzun, virgüllü; ve noktalı virgüllü! Üçüncü mü? " +
      "Çok uzun bir cümle, ".repeat(30) +
      "son.";
    const chunks = speakableChunks(text, 120);
    expect(chunks.join(" ").replace(/\s+/g, " ")).toBe(text.replace(/\s+/g, " ").trim());
    for (const chunk of chunks) expect(chunk.length).toBeLessThanOrEqual(120);
  });

  test("every real guide chunks into utterances a speech engine will finish", () => {
    for (const site of sites) {
      for (const chapter of guideForSite(site.slug)!.chapters) {
        for (const chunk of speakableChunks(chapter.text.tr)) {
          // A clause with no punctuation at all can run over; none of ours do.
          expect(chunk.length).toBeLessThanOrEqual(260);
        }
      }
    }
  });
});

describe("recorded audio manifest", () => {
  test("only names guides and chapters that exist", () => {
    for (const [key, byLang] of Object.entries(recordedAudio)) {
      const guide = key.startsWith("site:")
        ? guideForSite(key.slice(5))
        : (() => {
            const item = reconstructions.find((r) => `recon:${r.id}` === key);
            return item && reconstructionGuide(item);
          })();
      expect(guide).toBeDefined();
      const ids = new Set(guide!.chapters.map((c) => c.id));
      for (const chapters of Object.values(byLang)) {
        for (const id of Object.keys(chapters ?? {})) expect(ids.has(id)).toBe(true);
      }
    }
  });
});

describe("what the voice says", () => {
  test("abbreviations, ranges and regnal numbers are written out", () => {
    const tr = spokenText("Dönemi: MÖ 250-225. MS 2. yüzyılda II. Antiokhos, 113 m — BM", "tr");
    expect(tr).toContain("milattan önce 250 ile 225");
    expect(tr).toContain("milattan sonra 2. yüzyılda");
    expect(tr).toContain("İkinci Antiokhos");
    expect(tr).toContain("113 metre");
    expect(tr).toContain("Birleşmiş Milletler");
    expect(tr).not.toMatch(/\bM[ÖS]\b/);
    expect(spokenText("c. 8400–8100 BC", "en")).toBe("around 8400 to 8100 BC");
    expect(spokenText("300 v. Chr.", "de")).toBe("300 vor Christus");
    expect(spokenText("155 г. н. э.", "ru")).toBe("155 год нашей эры");
  });

  test("nothing in the recorded script still says MÖ or MS", () => {
    const script = JSON.parse(
      readFileSync(join(import.meta.dir, "../../../scripts/audio-script.json"), "utf8"),
    );
    const left = script.items.filter(
      (i: { lang: string; speech: string }) => i.lang === "tr" && /\bM[ÖS]\b/.test(i.speech),
    );
    expect(left.length).toBe(0);
  });
});
