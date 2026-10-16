import { describe, expect, test } from "bun:test";
import { answer, fold, intentsOf, suggestions } from "@/lib/ask";
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

  test("cue words match at the start of a word, not inside one", () => {
    // "wer" (German "who") is inside "tower"; "век" (century) inside "человек".
    expect(intentsOf("How tall is the tower?")).not.toContain("who");
    expect(intentsOf("Сколько человек вмещал театр?")).not.toContain("when");
    expect(intentsOf("Wer hat das gebaut?")).toContain("who");
    expect(intentsOf("В каком веке построен?")).toContain("when");
  });

  test("says it does not know rather than guessing", () => {
    expect(answer(efes, "Kuantum bilgisayar var mı?", "tr").text).toContain("bilmiyorum");
  });

  test("suggestions are offered in the reader's language", () => {
    expect(suggestions(aspendos, "de").length).toBeGreaterThan(2);
  });

  test("how many lived in a city is not how many its theatre seated", () => {
    expect(intentsOf("Efes'te kaç kişi yaşıyordu?")).not.toContain("capacity");
    for (const [q, lang] of [
      ["Efes'te kaç kişi yaşıyordu?", "tr"],
      ["Efes'in nüfusu ne kadardı?", "tr"],
      ["How many people lived in Ephesus?", "en"],
    ] as const) {
      const a = answer(efes, q, lang);
      expect(a.text).toMatch(/200/);
      expect(a.text).not.toMatch(/21[.,]500|24[.,]000/);
    }
    expect(answer(efes, "Tiyatro kaç kişilikti?", "tr").text).toMatch(/21\.500/);
  });
});
