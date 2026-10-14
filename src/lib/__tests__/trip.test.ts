import { describe, expect, test } from "bun:test";
import { guideForSite } from "@/lib/guide-sources";
import { offlineUrls } from "@/lib/offline";
import { checkStamp, distanceMetres, STAMP_RADIUS_M } from "@/lib/passport";
import { routeGuide } from "@/lib/route-guide";
import { decodeTransfer, encodeTransfer, mergeStates } from "@/lib/transfer";
import { getSite, sitesByRegion } from "@/lib/sites";

const efes = getSite("efes")!;
const milet = getSite("milet")!;

describe("passport", () => {
  test("distance is in metres and symmetric", () => {
    const d = distanceMetres(efes.lat, efes.lng, milet.lat, milet.lng);
    expect(d).toBeGreaterThan(40_000);
    expect(d).toBeLessThan(80_000);
    expect(distanceMetres(milet.lat, milet.lng, efes.lat, efes.lng)).toBeCloseTo(d, 3);
  });

  test("a stamp needs you to be at the site", () => {
    expect(checkStamp(efes, { latitude: efes.lat, longitude: efes.lng, accuracy: 20 }).ok).toBe(
      true,
    );
    // ~1.5 km north: still inside the ruin field.
    expect(
      checkStamp(efes, { latitude: efes.lat + 0.0135, longitude: efes.lng, accuracy: 30 }).ok,
    ).toBe(true);
    expect(checkStamp(efes, { latitude: milet.lat, longitude: milet.lng, accuracy: 30 }).ok).toBe(
      false,
    );
  });

  test("a vague position does not stretch the radius without limit", () => {
    const fiveKm = { latitude: efes.lat + 0.045, longitude: efes.lng };
    expect(checkStamp(efes, { ...fiveKm, accuracy: 10_000 }).ok).toBe(false);
    expect(STAMP_RADIUS_M).toBeLessThanOrEqual(2500);
  });
});

describe("route guide", () => {
  const stops = [efes, milet];
  const legs = [{ km: 70, min: 60 }];

  test("plays each stop's guide in order, announcing the next stop", () => {
    const guide = routeGuide(stops, legs);
    const own = guideForSite("efes")!;
    expect(guide.chapters[0]!.id).toBe("efes~stop");
    expect(guide.chapters.length).toBe(
      2 + own.chapters.length + guideForSite("milet")!.chapters.length,
    );
    const next = guide.chapters.find((c) => c.id === "milet~stop")!;
    expect(next.text.tr).toContain("70 kilometre");
    expect(next.text.en).toContain("60 minutes");
  });

  test("borrowed chapters keep their original recordings", () => {
    const guide = routeGuide(stops, legs);
    const borrowed = guide.chapters.filter((c) => !c.id.endsWith("~stop"));
    for (const chapter of borrowed) {
      expect(chapter.source?.key).toMatch(/^site:(efes|milet)$/);
      expect(chapter.id.endsWith(chapter.source!.id)).toBe(true);
    }
    expect(new Set(guide.chapters.map((c) => c.id)).size).toBe(guide.chapters.length);
  });

  test("highlights keep only the opening chapters of each stop", () => {
    const short = routeGuide(stops, legs, { highlights: true });
    expect(short.chapters.length).toBeLessThan(routeGuide(stops, legs).chapters.length);
    expect(short.key).not.toBe(routeGuide(stops, legs).key);
    expect(short.langs).toContain("tr");
    expect(short.langs).toContain("en");
  });
});

describe("offline packs", () => {
  test("a region pack has every page, absolute and without duplicates", () => {
    const list = sitesByRegion(efes.region);
    const urls = offlineUrls(list, "de", "https://antik.test");
    for (const site of list) expect(urls).toContain(`https://antik.test/kent/${site.slug}?lang=de`);
    expect(new Set(urls).size).toBe(urls.length);
    for (const url of urls) expect(url).toStartWith("http");
  });

  test("a city with a reconstruction brings its 3D page and scans", () => {
    const urls = offlineUrls([efes], "tr", "https://antik.test");
    expect(urls).toContain("https://antik.test/rekonstruksiyon/celsus-kutuphanesi");
    expect(urls).toContain("https://antik.test/scans/celsus-sophia.glb");
  });
});

describe("device transfer", () => {
  const base = {
    visited: ["efes"],
    favorites: ["milet"],
    recent: ["efes"],
    xp: 75,
    gamesPlayed: 2,
    correctAnswers: 1,
    visits: {
      efes: {
        slug: "efes",
        date: "2026-10-12",
        note: "harika",
        photo: "data:image/jpeg;base64,AAAA",
      },
    },
    stamps: { efes: { slug: "efes", at: "2026-10-12T09:00:00Z", distance: 12 } },
  };

  test("round-trips without the photos", async () => {
    const code = await encodeTransfer(base);
    expect(code).toMatch(/^1\.[A-Za-z0-9_-]+$/);
    const back = await decodeTransfer(code);
    if (!back) throw new Error("decode failed");
    expect(back.visited).toEqual(["efes"]);
    expect(back.visits["efes"]?.note).toBe("harika");
    expect(back.visits["efes"]?.photo).toBeUndefined();
    expect(back.stamps["efes"]?.distance).toBe(12);
    expect(await decodeTransfer("1.not-valid")).toBeNull();
  });

  test("merging loses nothing and does not double-count", () => {
    const other = { ...base, visited: ["milet", "efes"], xp: 120, visits: {}, stamps: {} };
    const merged = mergeStates(base, other);
    expect(merged.visited.sort()).toEqual(["efes", "milet"]);
    // Two visits (100) and the efes stamp (25), plus the other device's 20
    // XP of quizzes; the old `Math.max` gave 120 and lost the stamp's worth.
    expect(merged.xp).toBe(145);
    expect(merged.visits["efes"]?.photo).toBe(base.visits.efes.photo);
    expect(merged.stamps["efes"]).toBeDefined();
  });
});
