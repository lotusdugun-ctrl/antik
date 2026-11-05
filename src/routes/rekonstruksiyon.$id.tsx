import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Lock,
  MapPin,
  Play,
  Ruler,
  TriangleAlert,
} from "lucide-react";
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
import { breadcrumbTags, modelTags, seoTags } from "@/lib/seo";
import { isFreeModel, MODEL_COUNT, PassBenefits, PAYWALL, usePass } from "@/lib/pass";
import { posterFor } from "@/lib/posters";
import { AccessChip, ModelArt } from "@/components/ModelCard";
import { scansFor } from "@/lib/scans";
import { getSite } from "@/lib/sites";
import { structurePhotoFor } from "@/lib/structure-photos";

export const Route = createFileRoute("/rekonstruksiyon/$id")({
  loader: async ({ params }) => {
    // Imported here rather than at the top: whatever `head()` and a
    // synchronous loader touch stays in the entry bundle every page downloads.
    const [{ getReconstruction }, { loadStories }] = await Promise.all([
      import("@/lib/reconstructions"),
      import("@/lib/narration-stories-load"),
    ]);
    const item = getReconstruction(params.id);
    if (!item) throw notFound();
    const stories = await loadStories(`recon:${item.id}`);
    return { id: item.id, title: item.title, blurb: item.blurb, stories };
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
      scripts: [
        ...breadcrumbTags(
          [
            { name: translate("appName", lang), pathname: "/" },
            { name: translate("recon_title", lang), pathname: "/rekonstruksiyonlar" },
            { name: title, pathname: `/rekonstruksiyon/${loaderData.id}` },
          ],
          lang,
        ),
        ...modelTags({
          name: title,
          description: pick(loaderData.blurb, lang),
          pathname: `/rekonstruksiyon/${loaderData.id}`,
          image: posterFor(loaderData.id),
          free: !PAYWALL || isFreeModel(loaderData.id),
          lang,
        }),
      ],
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
  const { stories } = Route.useLoaderData();
  const site = getSite(item.siteSlug);
  const { locked, openPaywall } = usePass();

  const isLocked = locked(item.id);
  const facts = item.measures.slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-muted-foreground">
        <Link
          to="/rekonstruksiyonlar"
          className="inline-flex items-center gap-1.5 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> {t("recon_back")}
        </Link>
        {site && (
          <Link
            to="/kent/$slug"
            params={{ slug: site.slug }}
            className="inline-flex items-center gap-1.5 hover:text-foreground"
          >
            <MapPin className="h-4 w-4 text-primary" /> {L(site.name)}
          </Link>
        )}
        <span>{L(item.period)}</span>
        <AccessChip id={item.id} />
      </div>

      <header className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:items-end">
        <h1 className="text-[56px] sm:text-[88px] lg:text-[112px]">{L(item.title)}</h1>
        <p className="prose-read text-foreground/80">{L(item.blurb)}</p>
      </header>

      {facts.length > 0 && (
        <dl className="mt-8 grid grid-cols-2 border-t border-border sm:grid-cols-4">
          {facts.map((measure) => (
            <div key={measure.label.tr} className="flex flex-col pr-4 pt-4">
              <dt className="order-2 mt-1 text-[13.5px] text-muted-foreground">
                {L(measure.label)}
              </dt>
              <dd className="type-display order-1 text-[44px] normal-case tabular-nums sm:text-[54px]">
                {measureValue(measure, lang)}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-8">
        {isLocked ? (
          <LockedPreview id={item.id} siteSlug={item.siteSlug} onOpen={openPaywall} />
        ) : (
          <Reconstruction3D key={item.id} item={item} stories={stories} />
        )}
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
          <h2 className="mb-4 flex items-center gap-2 text-[36px]">
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
                  <span className="type-display shrink-0 text-[26px] normal-case tabular-nums">
                    {measureValue(measure, lang)}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <aside className="space-y-4">
          {/* The honest half of a reconstruction, and not in small print. */}
          <section className="rounded-lg bg-secondary p-5 shadow-[inset_3px_0_0_var(--primary)]">
            <h2 className="flex items-center gap-2 text-[28px]">
              <TriangleAlert className="h-5 w-5 text-primary" /> {t("recon_uncertainty")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-secondary-foreground">
              {L(item.uncertainty)}
            </p>
            {item.model.kind !== "neolithic-enclosure" && (
              <p className="mt-2 text-sm leading-relaxed text-secondary-foreground">
                {t("recon_detail_note")}
              </p>
            )}
          </section>

          <section className="rounded-2xl surface-panel p-5">
            <h2 className="text-[28px]">{t("recon_sources")}</h2>
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

/**
 * A Pass building for a visitor without the Pass: the render, what opens with
 * the Pass, and the free building as the other way in.
 */
function LockedPreview({
  id,
  siteSlug,
  onOpen,
}: {
  id: string;
  siteSlug: string;
  onOpen: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="grid overflow-hidden rounded-lg bg-card lg:grid-cols-[minmax(0,1fr)_26rem]">
      <div className="relative min-h-[300px] sm:min-h-[460px]">
        <ModelArt
          id={id}
          siteSlug={siteSlug}
          sizes="(min-width: 1024px) 66vw, 100vw"
          eager
          className="drift absolute inset-0 h-full w-full object-cover"
        />
        <span className="absolute left-4 top-4 inline-flex h-8 items-center gap-1.5 rounded bg-primary px-3 text-sm font-extrabold text-primary-foreground">
          <Lock className="h-4 w-4" /> {t("pass_chip")}
        </span>
      </div>
      <div className="flex flex-col gap-6 p-6 sm:p-8">
        <h2 className="text-[44px] sm:text-[52px]">{t("pass_locked_title")}</h2>
        <p className="text-[15px] text-muted-foreground">{t("pass_locked_body")}</p>
        <PassBenefits count={MODEL_COUNT} className="[&_svg]:text-primary" />
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex h-14 items-center justify-center gap-2 rounded-lg bg-primary text-[16px] font-extrabold text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          <Play className="h-4 w-4 fill-current" /> {t("pass_cta_open")}
        </button>
        <Link
          to="/rekonstruksiyon/$id"
          params={{ id: "aspendos-tiyatrosu" }}
          className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-5 text-[15px] font-bold hover:text-primary"
        >
          {t("pass_try_free")}: Aspendos <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
