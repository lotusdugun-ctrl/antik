import { describe, expect, test } from "bun:test";
import {
  ancientCities,
  coverImage,
  historicPlaces,
  museums,
  regions,
  sitePhoto,
  sites,
  type Site,
} from "@/lib/sites";
import { galleryImages, siteDetails, siteGallery } from "@/lib/site-details";
import { imageAt, srcSetFor } from "@/lib/images";
import { creditFor, photoCredits } from "@/lib/photo-credits";
import { factsFor, siteFacts } from "@/lib/site-facts";
import { structurePhotos } from "@/lib/structure-photos";
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
    // An absent fee means unknown and is fine; a negative one is data damage.
    const odd = sites.filter(
      (s) => s.popularity < 1 || s.popularity > 10 || (s.fee !== undefined && s.fee < 0),
    );
    expect(odd.map((s) => `${s.slug}: pop ${s.popularity}, fee ${s.fee}`)).toEqual([]);
  });

  test("every site credits at least one civilization", () => {
    expect(sites.filter((s) => s.civilizations.length === 0).map((s) => s.slug)).toEqual([]);
  });
});

/**
 * The three browse tabs are built from three type sets. A heritage type added
 * to `HeritageType` but to none of the sets would drop every site of that type
 * out of all three tabs — reachable only from the unscoped list, which looks
 * exactly like nothing being wrong.
 */
describe("the browse scopes", () => {
  test("no site appears in two tabs at once", () => {
    const seen = new Map<string, string[]>();
    const put = (tab: string, list: Site[]) => {
      for (const site of list) seen.set(site.slug, [...(seen.get(site.slug) ?? []), tab]);
    };
    put("antik", ancientCities);
    put("tarihi", historicPlaces);
    put("muze", museums);
    const overlaps = [...seen.entries()].filter(([, tabs]) => tabs.length > 1);
    expect(overlaps.map(([slug, tabs]) => `${slug}: ${tabs.join(" + ")}`)).toEqual([]);
  });

  test("every site lands in exactly one tab", () => {
    const covered = new Set(
      [...ancientCities, ...historicPlaces, ...museums].map((site) => site.slug),
    );
    const orphans = sites.filter((site) => !covered.has(site.slug));
    expect(orphans.map((s) => `${s.slug} (${s.heritageType})`)).toEqual([]);
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

  /**
   * The failure this catches was live: galleries were padded to four
   * thumbnails with `heroEphesus`, so Heraclea Pontica on the Black Sea showed
   * the Library of Celsus among its own photographs. Nothing on screen marked
   * it as belonging elsewhere, and no test noticed.
   */
  test("no site shows a photograph that belongs to another site", () => {
    const owner = new Map<string, string>();
    for (const [slug, url] of Object.entries(sitePhoto)) {
      if (url) owner.set(url, slug);
    }
    for (const [slug, urls] of Object.entries(siteGallery)) {
      for (const url of urls ?? []) if (!owner.has(url)) owner.set(url, slug);
    }

    const stolen: string[] = [];
    for (const site of sites) {
      for (const url of [coverImage(site), ...galleryImages(site)]) {
        const belongsTo = owner.get(url);
        if (belongsTo && belongsTo !== site.slug) stolen.push(`${site.slug} <- ${belongsTo}`);
      }
    }
    expect([...new Set(stolen)]).toEqual([]);
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
      ...Object.values(structurePhotos),
    ].filter(
      (url): url is string => typeof url === "string" && url.includes("upload.wikimedia.org"),
    );

    const uncredited = remote.filter((url) => !creditFor(url));
    expect([...new Set(uncredited)]).toEqual([]);
  });

  test("no structure photo is keyed to a site or structure that does not exist", () => {
    const known = new Set(
      sites.flatMap((site) =>
        (siteDetails[site.slug]?.structures ?? []).map((s) => `${site.slug}|${s.tr}`),
      ),
    );
    expect(Object.keys(structurePhotos).filter((key) => !known.has(key))).toEqual([]);
  });

  /**
   * `imageAt` and `srcSetFor` read the width ceiling out of the URL itself. A
   * URL that does not match the thumb shape is returned untouched, which does
   * not break the page — it just silently drops that photo out of responsive
   * sizing and ships the largest file to a phone.
   */
  test("every remote photo URL is a thumb URL the resizer can read", () => {
    const remote = [
      ...Object.values(sitePhoto),
      ...Object.values(siteGallery).flat(),
      ...Object.values(structureInfo).map((info) => info?.image),
    ].filter((url): url is string => typeof url === "string" && url.startsWith("http"));

    // A parseable thumb URL always yields more than one rung, because the
    // ladder's smallest width is below every ceiling in the data.
    const unreadable = remote.filter((url) => !srcSetFor(url));
    expect([...new Set(unreadable)]).toEqual([]);
  });

  test("asking for a card-sized photo actually returns a smaller one", () => {
    const remote = [...Object.values(sitePhoto), ...Object.values(siteGallery).flat()].filter(
      (url): url is string => typeof url === "string" && url.startsWith("http"),
    );

    // 250 is the smallest rung, so every photo in the data — all of which are
    // pinned well above it — must resize down rather than come back unchanged.
    const stuck = remote.filter((url) => imageAt(url, 250).includes("/250px-") === false);
    expect([...new Set(stuck)]).toEqual([]);
  });

  test("each credit names both an author and a licence", () => {
    const blank = Object.entries(photoCredits).filter(
      ([, c]) => !c.author.trim() || !c.license.trim(),
    );
    expect(blank.map(([file]) => file)).toEqual([]);
  });
});
