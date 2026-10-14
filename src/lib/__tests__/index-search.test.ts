import { describe, expect, test } from "bun:test";
import { foldForSearch } from "@/lib/index-search";
import { sites } from "@/lib/sites";

describe("foldForSearch", () => {
  test("dotted, dotless and plain i all meet", () => {
    for (const typed of ["istanbul", "Istanbul", "İstanbul", "ıstanbul", "ISTANBUL"]) {
      expect(foldForSearch(typed)).toBe("istanbul");
    }
  });

  test("Turkish letters can be typed without a Turkish keyboard", () => {
    expect(foldForSearch("Nevşehir")).toBe("nevsehir");
    expect(foldForSearch("Göreme")).toBe("goreme");
    expect(foldForSearch("Çatalhöyük")).toBe("catalhoyuk");
    expect(foldForSearch("İvriz Kaya Anıtı")).toBe("ivriz kaya aniti");
  });

  test("an English reader searching 'istanbul' finds the Istanbul sites", () => {
    const hits = sites.filter((site) =>
      foldForSearch(`${site.province.en} ${site.name.en}`).includes("istanbul"),
    );
    expect(hits.length).toBeGreaterThan(0);
  });
});
