import type { Localized } from "@/lib/i18n";
import { siteGuide, type Guide, type StructureBlurb } from "@/lib/narration";
import { reconstructionForStructure } from "@/lib/reconstructions";
import { getSiteDetail, siteDetails } from "@/lib/site-details";
import { factsFor } from "@/lib/site-facts";
import { structureInfo } from "@/lib/structures";
import { getSite } from "@/lib/sites";

/**
 * How many sites list a structure under the same Turkish name.
 *
 * `structureInfo` is keyed by name alone, and some names are shared: Ephesus
 * and Miletus both have a "Büyük Tiyatro", and the curated blurb for that name
 * is about Ephesus — 24,000 seats, the harbour. Read aloud at Miletus it would
 * be a confident wrong fact. So a shared name's blurb is only used when it is
 * the reconstruction's own, which is written for one building.
 */
const nameCounts = (() => {
  const counts = new Map<string, number>();
  for (const detail of Object.values(siteDetails)) {
    for (const structure of detail.structures) {
      counts.set(structure.tr, (counts.get(structure.tr) ?? 0) + 1);
    }
  }
  return counts;
})();

export function structureBlurbFor(slug: string): StructureBlurb {
  return (name: Localized) => {
    const model = reconstructionForStructure(slug, name.tr);
    if (model) return model.blurb;
    if ((nameCounts.get(name.tr) ?? 0) > 1) return undefined;
    return structureInfo[name.tr]?.blurb;
  };
}

export function guideForSite(slug: string): Guide | undefined {
  const site = getSite(slug);
  if (!site) return undefined;
  return siteGuide(site, getSiteDetail(slug), factsFor(slug), structureBlurbFor(slug));
}
