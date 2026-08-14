import { describe, expect, test } from "bun:test";
import { collections, collectionSites, getCollection } from "@/lib/collections";
import { sites } from "@/lib/sites";

const slugs = new Set(sites.map((s) => s.slug));

/**
 * A collection referring to a slug that no longer exists silently loses a stop
 * from an itinerary — the page still renders, just shorter. These assert that
 * cannot happen quietly.
 */
describe("collections", () => {
  test("ids are unique — they are the URL", () => {
    expect(new Set(collections.map((c) => c.id)).size).toBe(collections.length);
  });

  test("every hand-picked slug names a site that exists", () => {
    const missing = collections.flatMap((c) =>
      (c.slugs ?? []).filter((slug) => !slugs.has(slug)).map((slug) => `${c.id}: ${slug}`),
    );
    expect(missing).toEqual([]);
  });

  test("no collection lists the same site twice", () => {
    const dupes = collections.filter((c) => {
      const list = collectionSites(c).map((s) => s.slug);
      return new Set(list).size !== list.length;
    });
    expect(dupes.map((c) => c.id)).toEqual([]);
  });

  test("every collection resolves to at least two sites", () => {
    const thin = collections.filter((c) => collectionSites(c).length < 2);
    expect(thin.map((c) => c.id)).toEqual([]);
  });

  test("both languages are written for every title and blurb", () => {
    const gaps = collections.filter(
      (c) => !c.title.tr || !c.title.en || !c.blurb.tr || !c.blurb.en,
    );
    expect(gaps.map((c) => c.id)).toEqual([]);
  });

  test("hand-picked collections keep the order they were written in", () => {
    const lycia = getCollection("likya-hafta-sonu")!;
    expect(collectionSites(lycia).map((s) => s.slug)).toEqual([...lycia.slugs!]);
  });

  test("the derived collections match the data they are derived from", () => {
    expect(collectionSites(getCollection("ucretsiz")!).every((s) => s.fee === 0)).toBe(true);
    expect(collectionSites(getCollection("unesco")!).every((s) => s.unesco === "listed")).toBe(
      true,
    );
  });

  test("an unknown id resolves to nothing rather than an empty collection", () => {
    expect(getCollection("bilinmeyen")).toBeUndefined();
  });
});
