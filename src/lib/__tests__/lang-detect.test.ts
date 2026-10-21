import { describe, expect, test } from "bun:test";
import { isBot, langFromCountry, langFromLocales, langFromTag } from "@/lib/lang-detect";

describe("first-visit language", () => {
  test("the device's language wins when the app has it", () => {
    expect(langFromLocales(["tr-TR"])).toBe("tr");
    expect(langFromLocales(["de-AT", "en"])).toBe("de");
    expect(langFromLocales(["fr-FR", "en-GB"])).toBe("en");
    expect(langFromLocales(["kk-KZ"])).toBe("ru");
    expect(langFromLocales(["fr-FR"])).toBeNull();
    expect(langFromTag("ru_RU")).toBe("ru");
  });

  test("otherwise the country decides, and a foreign phone in Türkiye gets English", () => {
    expect(langFromCountry("DE", true)).toBe("de");
    expect(langFromCountry("KZ", true)).toBe("ru");
    expect(langFromCountry("TR", true)).toBe("en");
    expect(langFromCountry("TR", false)).toBe("tr");
    expect(langFromCountry("FR", true)).toBe("en");
    expect(langFromCountry("", true)).toBe("en");
  });

  test("crawlers are left on the default language", () => {
    expect(isBot("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe(true);
    expect(isBot("Mozilla/5.0 (Linux; Android 14) Chrome/130 Mobile")).toBe(false);
  });
});
