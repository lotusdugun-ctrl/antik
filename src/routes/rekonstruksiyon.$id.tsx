import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Box, ExternalLink, MapPin, Ruler, TriangleAlert } from "lucide-react";
import { PhotoCredits } from "@/components/PhotoCredits";
import { ScanGallery } from "@/components/ScanGallery";
import { Reconstruction3D } from "@/components/Reconstruction3D";
import { parseLang, translate, useI18n, pick, type Lang } from "@/lib/i18n";
import { partsFor } from "@/lib/reconstruction-parts";
import {
  getReconstruction,
  sourceFor,
  type Measure,
  type Reconstruction,
} from "@/lib/reconstructions";
import { breadcrumbTags, seoTags } from "@/lib/seo";
import { scansFor } from "@/lib/scans";
import { getSite } from "@/lib/sites";
import { structurePhotoFor } from "@/lib/structure-photos";

export const Route = createFileRoute("/rekonstruksiyon/$id")({
  loader: ({ params }) => {
    const item = getReconstruction(params.id);
    if (!item) throw notFound();
    return { id: item.id, title: item.title, blurb: item.blurb };
  },
  head: ({ match, loaderData }) => {
    const lang = parseLang(match.search.lang);
    if (!loaderData) {
      return seoTags({
        lang,
        pathname: match.pathname,
        title: translate("seo_not_found", lang),
        description: "",
        noIndex: true,
      });
    }
    const title = pick(loaderData.title, lang);
    return {
      ...seoTags({
        lang,
        pathname: `/rekonstruksiyon/${loaderData.id}`,
        title: `${title} — ${translate("recon_title", lang)} | ${translate("appName", lang)}`,
        description: pick(loaderData.blurb, lang),
      }),
      scripts: breadcrumbTags(
        [
          { name: translate("appName", lang), pathname: "/" },
          { name: translate("recon_title", lang), pathname: "/rekonstruksiyonlar" },
          { name: title, pathname: `/rekonstruksiyon/${loaderData.id}` },
        ],
        lang,
      ),
    };
  },
  component: ReconstructionPage,
});

/**
 * Metres with a Turkish decimal comma, counts as they are.
 *
 * Written out by hand rather than with `toLocaleString`, which needs an ICU
 * build to agree with itself: the server rendered "14.23" and the browser
 * "14,23", and React threw the whole page away and re-rendered it on the
 * mismatch.
 */
function measureValue(measure: Measure, lang: Lang) {
  const [whole, fraction] = Math.abs(measure.value)
    .toFixed(2)
    .replace(/\.?0+$/, "")
    .split(".");
  const comma = lang !== "en";
  const grouped = (whole ?? "0").replace(
    /\B(?=(\d{3})+(?!\d))/g,
    comma ? (lang === "ru" ? "\u00a0" : ".") : ",",
  );
  const number = fraction ? `${grouped}${comma ? "," : "."}${fraction}` : grouped;
  return measure.unit === "m" ? `${number} m` : number;
}

/** The carving photographs a model wraps onto its stone, without repeats. */
function carvingUrls(item: Reconstruction): string[] {
  const urls = partsFor(item.model)
    .map((part) => part.carving?.url)
    .filter((url): url is string => Boolean(url));
  return [...new Set(urls)];
}

function ReconstructionPage() {
  const { id } = Route.useParams();
  const { t, L, lang } = useI18n();
  const item = getReconstruction(id)!;
  const site = getSite(item.siteSlug);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link
        to="/rekonstruksiyonlar"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> {t("recon_back")}
      </Link>

      <header className="mt-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-foreground">
          <Box className="h-3 w-3" /> {t("recon_badge")}
        </span>
        <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">{L(item.title)}</h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          {site && (
            <Link
              to="/kent/$slug"
              params={{ slug: site.slug }}
              className="inline-flex items-center gap-1.5 font-medium hover:text-foreground"
            >
              <MapPin className="h-4 w-4 text-primary" /> {L(site.name)}
            </Link>
          )}
          <span>{L(item.period)}</span>
        </p>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
          {L(item.blurb)}
        </p>
      </header>

      <div className="mt-6">
        <Reconstruction3D item={item} />
      </div>

      {/* The carvings on the model are other people's photographs, and nearly
          all of them are CC BY-SA: the credit is a licence term, not a note. */}
      <PhotoCredits
        urls={[...carvingUrls(item), structurePhotoFor(item.siteSlug, item.structure.tr)].filter(
          (url): url is string => Boolean(url),
        )}
        className="mt-6"
      />

      <ScanGallery ids={scansFor(item.id)} />

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold">
            <Ruler className="h-5 w-5 text-primary" /> {t("recon_measures")}
          </h2>
          <ul className="divide-y divide-border overflow-hidden rounded-2xl surface-panel">
            {item.measures.map((measure) => {
              const source = sourceFor(item, measure.source);
              return (
                <li
                  key={measure.label.tr}
                  className="flex items-baseline justify-between gap-4 px-4 py-3"
                >
                  <span className="text-sm leading-snug">
                    {L(measure.label)}
                    {source && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-1.5 inline-flex items-center text-muted-foreground hover:text-primary"
                        aria-label={L(source.title)}
                        title={L(source.title)}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </span>
                  <span className="shrink-0 font-display text-lg font-semibold tabular-nums">
                    {measureValue(measure, lang)}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <aside className="space-y-4">
          {/* The honest half of a reconstruction, and not in small print. */}
          <section className="rounded-2xl border-l-4 border-gold bg-secondary p-5">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <TriangleAlert className="h-5 w-5 text-gold" /> {t("recon_uncertainty")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-secondary-foreground">
              {L(item.uncertainty)}
            </p>
          </section>

          <section className="rounded-2xl surface-panel p-5">
            <h2 className="font-display text-lg font-semibold">{t("recon_sources")}</h2>
            <ul className="mt-2 space-y-2">
              {item.sources.map((source) => (
                <li key={source.key}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-start gap-1.5 text-sm text-muted-foreground hover:text-primary"
                  >
                    <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {L(source.title)}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
