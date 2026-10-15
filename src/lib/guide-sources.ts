import type { Localized } from "@/lib/i18n";
import { siteGuide, type Guide, type StructureBlurb } from "@/lib/narration";
import { applyStories, type StoryText } from "@/lib/narration-stories";
import { reconstructionForStructure } from "@/lib/reconstructions";
import { getSiteDetail } from "@/lib/site-details";
import { factsFor } from "@/lib/site-facts";
import { structureInfoAt } from "@/lib/structure-names";
import { getSite } from "@/lib/sites";

export function structureBlurbFor(slug: string): StructureBlurb {
  return (name: Localized) => {
    const model = reconstructionForStructure(slug, name.tr);
    if (model) return model.blurb;
    return structureInfoAt(name.tr)?.blurb;
  };
}

/** `stories`: the guide's written chapters, when loaded (see narration-stories). */
export function guideForSite(slug: string, stories?: StoryText): Guide | undefined {
  const site = getSite(slug);
  if (!site) return undefined;
  return applyStories(
    siteGuide(site, getSiteDetail(slug), factsFor(slug), structureBlurbFor(slug)),
    stories,
  );
}
