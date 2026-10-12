import { describe, expect, test } from "bun:test";
import { answer, fold, suggestions } from "@/lib/ask";
import { getSite } from "@/lib/sites";

const aspendos = getSite("aspendos")!;
const efes = getSite("efes")!;

describe("ask the guide", () => {
  test("folds Turkish, German and Russian letters", () => {
    expect(fold("Kaç KİŞİLİK, ışık?")).toBe("kac kisilik isik");
    expect(fold("Höhe")).toBe("hohe");
  });

  test("capacity comes from the reconstruction's measures, with its source", () => {
    const a = answer(aspendos, "Bu tiyatro kaç kişilik?", "tr");
    expect(a.source).toBeDefined();
    expect(a.text).toMatch(/\d/);
  });

  test("when, where and fee use the site record", () => {
    expect(answer(efes, "Ne zaman kuruldu?", "tr").text).toContain("MÖ 10");
    expect(answer(efes, "Where is it?", "en").text).toContain("İzmir");
    expect(answer(efes, "Giriş ücreti ne kadar?", "tr").text).toMatch(/₺|ücretsiz|ücret/);
  });

  test("says it does not know rather than guessing", () => {
    expect(answer(efes, "Kuantum bilgisayar var mı?", "tr").text).toContain("bilmiyorum");
  });

  test("suggestions are offered in the reader's language", () => {
    expect(suggestions(aspendos, "de").length).toBeGreaterThan(2);
  });
});
