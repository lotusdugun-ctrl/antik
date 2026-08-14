import { describe, expect, test } from "bun:test";
import { coverImage, regions, sitePhoto, sites, type Site } from "@/lib/sites";
import { galleryImages, siteDetails, siteGallery } from "@/lib/site-details";
import { creditFor, photoCredits } from "@/lib/photo-credits";
import { factsFor, siteFacts } from "@/lib/site-facts";
import { structureInfo } from "@/lib/structures";
import type { Localized } from "@/lib/i18n";

/**
 * The 100 sites are hand-written data, and the parts that fail do so silently:
 * a slug that drifts out of step with `siteDetails` costs a city its history
 * section, a mistyped coordinate drops a map pin in the Aegean, and nothing
 * throws in either case. These are the invariants that hold today, asserted so
 * that site 101 cannot break them unnoticed.
 */

const slugs = new Set(sites.map((s) => s.slug));
const filled = (v: Localized) => v.tr.trim().length > 0 && v.en.trim().length > 0;

/** Türkiye's bounding box, generous at every edge. */
const TR_BOUNDS = { minLat: 35.8, maxLat: 42.2, minLng: 25.6, maxLng: 44.9 };

describe("the site list", () => {
  test("slugs are unique — they are the primary key and the URL", () => {
    expect(slugs.size).toBe(sites.length);
  });

  test("every site sits inside Türkiye", () => {
    const stray = sites.filter(
      (s) =>
        s.lat < TR_BOUNDS.minLat ||
        s.lat > TR_BOUNDS.maxLat ||
        s.lng < TR_BOUNDS.minLng ||
        s.lng > TR_BOUNDS.maxLng,
    );
    expect(stray.map((s) => `${s.slug} (${s.lat}, ${s.lng})`)).toEqual([]);
  });

  test("no two sites share a coordinate, which would stack their map pins", () => {
    const seen = new Map<string, string[]>();
    for (const s of sites) {
      const key = `${s.lat},${s.lng}`;
      seen.set(key, [...(seen.get(key) ?? []), s.slug]);
    }
    const collisions = [...seen.values()].filter((owners) => owners.length > 1);
    expect(collisions).toEqual([]);
  });

  test("every site names a region that exists", () => {
    const known = new Set(regions.map((r) => r.id));
    expect(sites.filter((s) => !known.has(s.region)).map((s) => s.slug)).toEqual([]);
  });

  test("both languages are filled in on every displayed field", () => {
    // `hours` is deliberately absent on every site: opening times follow the
    // ministry's seasonal rule rather than being asserted per site.
    const fieldsOf = (s: Site): Localized[] => [s.name, s.province, s.era, s.summary];
    const gaps = sites.filter((s) => !fieldsOf(s).every(filled));
    expect(gaps.map((s) => s.slug)).toEqual([]);
  });

  test("popularity stays on its 1-10 scale and fees are not negative", () => {
    const odd = sites.filter((s) => s.popularity < 1 || s.popularity > 10 || s.fee < 0);
    expect(odd.map((s) => `${s.slug}: pop ${s.popularity}, fee ${s.fee}`)).toEqual([]);
  });

  test("every site credits at least one civilization", () => {
    expect(sites.filter((s) => s.civilizations.length === 0).map((s) => s.slug)).toEqual([]);
  });
});

describe("the detail records", () => {
  test("every site has one — a city page without history renders a hole", () => {
    expect(sites.filter((s) => !siteDetails[s.slug]).map((s) => s.slug)).toEqual([]);
  });

  test("no record is keyed to a site that does not exist", () => {
    const orphans = [
      ...Object.keys(siteDetails).filter((k) => !slugs.has(k)),
      ...Object.keys(siteGallery).filter((k) => !slugs.has(k)),
      ...Object.keys(sitePhoto).filter((k) => !slugs.has(k)),
    ];
    expect(orphans).toEqual([]);
  });

  test("history and fun fact are written in both languages", () => {
    const gaps = Object.entries(siteDetails).filter(
      ([, d]) => !filled(d.history) || !filled(d.funFact),
    );
    expect(gaps.map(([slug]) => slug)).toEqual([]);
  });

  test("every site has striking facts, written in both languages", () => {
    const gaps = sites.filter((s) => {
      const facts = factsFor(s.slug);
      return facts.length === 0 || !facts.every(filled);
    });
    expect(gaps.map((s) => s.slug)).toEqual([]);
  });

  test("no facts are keyed to a site that does not exist", () => {
    expect(Object.keys(siteFacts).filter((k) => !slugs.has(k))).toEqual([]);
  });

  test("every record lists structures, each one named in both languages", () => {
    const gaps = Object.entries(siteDetails).filter(
      ([, d]) => d.structures.length === 0 || !d.structures.every(filled),
    );
    expect(gaps.map(([slug]) => slug)).toEqual([]);
  });
});

describe("photography", () => {
  test("every site resolves to a cover image", () => {
    expect(sites.filter((s) => !coverImage(s)).map((s) => s.slug)).toEqual([]);
  });

  test("every site resolves to a gallery, so the strip is never empty", () => {
    expect(sites.filter((s) => galleryImages(s).length === 0).map((s) => s.slug)).toEqual([]);
  });

  test("remote photos are https — the page is, and mixed content is blocked", () => {
    const remote = [...Object.values(sitePhoto), ...Object.values(siteGallery).flat()].filter(
      (url): url is string => typeof url === "string" && url.startsWith("http"),
    );
    expect(remote.filter((url) => !url.startsWith("https://"))).toEqual([]);
  });

  test("no gallery repeats the same photo twice", () => {
    const dupes = Object.entries(siteGallery).filter(
      ([, urls]) => urls && new Set(urls).size !== urls.length,
    );
    expect(dupes.map(([slug]) => slug)).toEqual([]);
  });

  /**
   * Most of these photos are CC BY or CC BY-SA, so displaying one without
   * naming its author and licence breaches the licence. An uncredited photo
   * renders no caption and looks fine, so only a test catches it.
   */
  test("every Commons photo we display has an attribution on file", () => {
    const remote = [
      ...Object.values(sitePhoto),
      ...Object.values(siteGallery).flat(),
      ...Object.values(structureInfo).map((info) => info?.image),
    ].filter(
      (url): url is string => typeof url === "string" && url.includes("upload.wikimedia.org"),
    );

    const uncredited = remote.filter((url) => !creditFor(url));
    expect([...new Set(uncredited)]).toEqual([]);
  });

  test("each credit names both an author and a licence", () => {
    const blank = Object.entries(photoCredits).filter(
      ([, c]) => !c.author.trim() || !c.license.trim(),
    );
    expect(blank.map(([file]) => file)).toEqual([]);
  });
});
