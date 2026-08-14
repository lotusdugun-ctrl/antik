import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Camera, ExternalLink } from "lucide-react";
import { parseLang, translate, useI18n } from "@/lib/i18n";
import { creditsFor, photoCredits } from "@/lib/photo-credits";
import { seoTags } from "@/lib/seo";
import { siteGallery } from "@/lib/site-details";
import { structureInfo } from "@/lib/structures";
import { coverImage, sites } from "@/lib/sites";

export const Route = createFileRoute("/gorseller")({
  head: ({ match }) => {
    const lang = parseLang(match.search.lang);
    return seoTags({
      lang,
      pathname: "/gorseller",
      title: translate("seo_credits_title", lang),
      description: translate("seo_credits_desc", lang),
    });
  },
  component: CreditsPage,
});

/**
 * Site-wide attribution.
 *
 * A city page credits the photos it shows, but a photo also appears on cards,
 * on the map and in the games, where a caption has nowhere to live. This page
 * is the address those uses point at, and it is linked from the footer so the
 * credit is reachable from anywhere a photo is.
 */
function CreditsPage() {
  const { t, L, lang } = useI18n();

  const perSite = useMemo(
    () =>
      [...sites]
        .sort((a, b) => a.name[lang].localeCompare(b.name[lang], lang))
        .map((site) => ({
          slug: site.slug,
          name: site.name[lang],
          credits: creditsFor([coverImage(site), ...(siteGallery[site.slug] ?? [])]),
        }))
        .filter((entry) => entry.credits.length > 0),
    [lang],
  );

  // Structure photos live in their own map and are reused across cities, so
  // they would otherwise be credited under whichever city you happened to open.
  const structureOnly = useMemo(() => {
    const alreadyListed = new Set(perSite.flatMap((e) => e.credits.map((c) => c.file)));
    return creditsFor(
      Object.values(structureInfo)
        .map((info) => info?.image)
        .filter((url): url is string => typeof url === "string"),
    ).filter((credit) => !alreadyListed.has(credit.file));
  }, [perSite]);

  const total = Object.keys(photoCredits).length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <header>
        <h1 className="flex items-center gap-2.5 font-display text-3xl font-semibold sm:text-4xl">
          <Camera className="h-7 w-7 text-primary" /> {t("credits")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {t("credits_page_sub")}
        </p>
        <p className="mt-1 text-sm font-medium">
          {total} {t("credits_count")}
        </p>
      </header>

      <div className="mt-8 space-y-8">
        {perSite.map((entry) => (
          <section key={entry.slug}>
            <h2 className="font-display text-lg font-semibold">
              <Link to="/kent/$slug" params={{ slug: entry.slug }} className="hover:underline">
                {entry.name}
              </Link>
            </h2>
            <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
              {entry.credits.map((credit) => (
                <CreditRow key={credit.file} credit={credit} />
              ))}
            </ul>
          </section>
        ))}

        {structureOnly.length > 0 && (
          <section>
            <h2 className="font-display text-lg font-semibold">{t("structures")}</h2>
            <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
              {structureOnly.map((credit) => (
                <CreditRow key={credit.file} credit={credit} />
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

function CreditRow({ credit }: { credit: ReturnType<typeof creditsFor>[number] }) {
  return (
    <li>
      <a
        href={credit.source}
        target="_blank"
        rel="noreferrer"
        className="font-medium text-foreground hover:underline"
      >
        {credit.file.replace(/_/g, " ")}
        <ExternalLink className="ml-1 inline h-3 w-3 align-[-1px]" />
      </a>{" "}
      — {credit.author} ·{" "}
      {credit.licenseUrl ? (
        <a
          href={credit.licenseUrl}
          target="_blank"
          rel="noreferrer license"
          className="hover:underline"
        >
          {credit.license}
        </a>
      ) : (
        credit.license
      )}
    </li>
  );
}
