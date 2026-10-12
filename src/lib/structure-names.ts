import { siteDetails } from "@/lib/site-details";
import { structureInfo } from "@/lib/structures";

/**
 * `structureInfo` is keyed by a structure's name alone, and a few names are
 * shared: Ephesus and Miletus both have a "Büyük Tiyatro", and the curated
 * entry for that name — 24,000 seats, the harbour street, the photograph —
 * is Ephesus'. Shown on the Miletus page it was a confident wrong fact. So a
 * name's curated entry applies only where the name belongs to one site.
 */
const counts = (() => {
  const map = new Map<string, number>();
  for (const detail of Object.values(siteDetails)) {
    for (const structure of detail.structures) {
      map.set(structure.tr, (map.get(structure.tr) ?? 0) + 1);
    }
  }
  return map;
})();

export function isSharedStructureName(name: string): boolean {
  return (counts.get(name) ?? 0) > 1;
}

/** The curated entry for a structure at a site, if it is really about that site's. */
export function structureInfoAt(name: string) {
  return isSharedStructureName(name) ? undefined : structureInfo[name];
}
