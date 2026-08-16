import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Award,
  Building2,
  CalendarClock,
  Check,
  Clock,
  Heart,
  Lightbulb,
  MapPin,
  Navigation,
  Maximize2,
  Route as RouteIcon,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Lightbox } from "@/components/Lightbox";
import { Photo } from "@/components/Photo";
import { PhotoCredits } from "@/components/PhotoCredits";
import { SiteMap } from "@/components/SiteMap";
import { VisitEditor } from "@/components/VisitEditor";
import { VisitingInfo } from "@/components/VisitingInfo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { parseLang, translate, useI18n } from "@/lib/i18n";
import { imageAt } from "@/lib/images";
import { useProgress, XP_PER_VISIT } from "@/lib/progress";
import { creditLine } from "@/lib/photo-credits";
import { breadcrumbTags, seoTags, siteTags } from "@/lib/seo";
import { galleryImages, getSiteDetail } from "@/lib/site-details";
import { factsFor } from "@/lib/site-facts";
import { structurePhotoFor } from "@/lib/structure-photos";
import { structureInfo } from "@/lib/structures";
import { coverImage, getSite, heritageTypeName, regions } from "@/lib/sites";

export const Route = createFileRoute("/kent/$slug")({
  loader: ({ params }) => {
    const site = getSite(params.slug);
    if (!site) throw notFound();
    return {
      slug: site.slug,
      name: site.name,
      summary: site.summary,
      image: coverImage(site),
    };
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
    const name = loaderData.name[lang];
    const image = imageAt(loaderData.image, 1280);
    const site = getSite(loaderData.slug);
    const region = site && regions.find((r) => r.id === site.region);
    // The type belongs in the title: "Titus Tüneli Antik Kenti" was what a
    // hardcoded suffix produced for a tunnel, and for a museum.
    const typeName = site ? heritageTypeName(site.heritageType)[lang] : "";
    const tags = seoTags({
      lang,
      pathname: `/kent/${loaderData.slug}`,
      title: typeName
        ? `${name} — ${typeName} | ${translate("seo_place_suffix", lang)}`
        : `${name} | ${translate("seo_place_suffix", lang)}`,
      description: loaderData.summary[lang],
      // Social cards want a large image, not the 330px card thumbnail.
      image,
      imageAlt: name,
    });

    // Structured data: without it a search engine has to infer from prose that
    // this page is about one place, at one coordinate, in one province.
    const scripts =
      site && region
        ? [
            ...siteTags(site, {
              lang,
              description: loaderData.summary[lang],
              image,
              regionName: region.name[lang],
            }),
            ...breadcrumbTags(
              [
                { name: translate("appName", lang), pathname: "/" },
                { name: translate("nav_explore", lang), pathname: "/kentler" },
                { name, pathname: `/kent/${site.slug}` },
              ],
              lang,
            ),
          ]
        : [];

    return { ...tags, scripts };
  },
  component: SiteDetail,
});

function Fact({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="rounded-xl surface-panel p-4">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function SiteDetail() {
  const { slug } = Route.useParams();
  const { t, L } = useI18n();
  const { isVisited, isFavorite, toggleVisited, toggleFavorite, pushRecent } = useProgress();
  const site = getSite(slug)!;
  const detail = getSiteDetail(slug);
  const [activeImage, setActiveImage] = useState(0);
  const [openStructure, setOpenStructure] = useState<string | null>(null);
  /**
   * Which gallery photo the lightbox is showing; `null` closes it. The
   * structure dialog's photo is not one of the gallery images, so it opens
   * its own lightbox rather than an index into this one.
   */
  const [zoomed, setZoomed] = useState<number | null>(null);
  const [zoomedStructure, setZoomedStructure] = useState(false);
  const gallery = galleryImages(site);
  const region = regions.find((r) => r.id === site.region)!;
  const facts = factsFor(slug);
  // Everything this page can put on screen, so the credit block below covers
  // the structure dialog's photo too and not just what is currently visible.
  const shownPhotos = [
    ...gallery,
    coverImage(site),
    ...(detail?.structures ?? []).map((s) => structurePhotoFor(slug, s.tr)),
  ].filter((url): url is string => typeof url === "string");

  useEffect(() => {
    pushRecent(slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const visited = isVisited(slug);
  const selectedStructure = openStructure ? structureInfo[openStructure] : undefined;
  const structurePhoto = openStructure ? structurePhotoFor(slug, openStructure) : undefined;
  const structureCredit = structurePhoto ? creditLine(structurePhoto) : undefined;

  function onVisit() {
    const on = toggleVisited(slug);
    toast[on ? "success" : "message"](on ? `${L(site.name)} · +${XP_PER_VISIT} XP` : L(site.name), {
      description: on ? t("visited_done") : t("visited"),
    });
  }

  return (
    <article>
      <div className="relative h-[52vh] min-h-[340px] w-full overflow-hidden">
        {/* The banner crops to fill the band, so the photo itself is the
            control that gives the whole frame back. Everything layered over it
            is pointer-transparent except the controls, or the band would stop
            being clickable where the scrim and the captions cover it. */}
        <button
          type="button"
          onClick={() => setZoomed(activeImage)}
          aria-label={t("photo_expand")}
          className="absolute inset-0 h-full w-full cursor-zoom-in"
        >
          <Photo
            src={gallery[activeImage] ?? coverImage(site)}
            alt={L(site.name)}
            sizes="100vw"
            fallbackWidth={1280}
            width={1920}
            height={1088}
            loading="eager"
            fetchPriority="high"
            className="h-full w-full object-cover"
          />
        </button>
        <div className="pointer-events-none absolute inset-0 hero-scrim" />
        <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto flex max-w-6xl items-start justify-between px-4 pt-4 sm:px-6">
          <Link
            to="/kentler"
            className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-card/85 px-3 py-1.5 text-xs font-semibold backdrop-blur"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> {t("back")}
          </Link>
          <button
            type="button"
            onClick={() => setZoomed(activeImage)}
            className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-card/85 px-3 py-1.5 text-xs font-semibold backdrop-blur transition-colors hover:bg-card"
          >
            <Maximize2 className="h-3.5 w-3.5" /> {t("photo_expand")}
          </button>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-4 pb-6 sm:px-6">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {site.unesco !== "none" && (
              <span className="rounded-full bg-gold px-2.5 py-0.5 text-[11px] font-bold text-gold-foreground">
                {site.unesco === "listed" ? t("unesco_listed") : t("unesco_tentative")}
              </span>
            )}
            <span className="rounded-full bg-card/85 px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur">
              {L(region.name)}
            </span>
          </div>
          <h1 className="font-display text-4xl font-semibold text-white sm:text-5xl">
            {L(site.name)}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-white/90">
            <MapPin className="h-4 w-4" /> {L(site.province)} · {L(site.era)}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onVisit}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.02] ${
              visited ? "bg-success text-success-foreground" : "bg-primary text-primary-foreground"
            }`}
          >
            <Check className="h-4 w-4" />
            {visited ? t("visited_done") : t("visited")}
          </button>
          <button
            onClick={() => toggleFavorite(slug)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold"
          >
            <Heart
              className={`h-4 w-4 ${isFavorite(slug) ? "fill-destructive text-destructive" : ""}`}
            />
            {isFavorite(slug) ? t("favorited") : t("favorite")}
          </button>
          <Link
            to="/rota"
            search={{ start: slug }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold"
          >
            <RouteIcon className="h-4 w-4" /> {t("nav_route")}
          </Link>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${site.lat},${site.lng}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold"
          >
            <Navigation className="h-4 w-4" /> {t("directions")}
          </a>
        </div>

        {visited && (
          <div className="mt-4">
            <VisitEditor slug={slug} siteName={L(site.name)} />
          </div>
        )}

        {/* Gallery */}
        <section className="mt-8">
          <h2 className="mb-3 font-display text-xl font-semibold">{t("gallery")}</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {gallery.map((img, i) => (
              <button
                key={img + i}
                // Selecting it and opening it are the same gesture on purpose:
                // a thumbnail click used to swap the cropped banner and there
                // was no way left to see the photo whole.
                onClick={() => {
                  setActiveImage(i);
                  setZoomed(i);
                }}
                aria-label={`${L(site.name)} ${i + 1} — ${t("photo_expand")}`}
                className={`h-20 w-28 shrink-0 cursor-zoom-in overflow-hidden rounded-xl border-2 transition-opacity ${
                  activeImage === i ? "border-primary" : "border-transparent opacity-70"
                }`}
              >
                <Photo
                  src={img}
                  alt={`${L(site.name)} ${i + 1}`}
                  sizes="112px"
                  fallbackWidth={250}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-8">
            <section>
              <h2 className="mb-2 font-display text-xl font-semibold">{t("history")}</h2>
              <p className="text-[15px] leading-relaxed text-muted-foreground">{L(site.summary)}</p>
              {detail && (
                <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                  {L(detail.history)}
                </p>
              )}
            </section>

            {detail && detail.structures.length > 0 && (
              <section>
                <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold">
                  <Building2 className="h-5 w-5 text-primary" /> {t("structures")}
                </h2>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {detail.structures.map((structure) => (
                    <li key={structure.tr}>
                      <button
                        onClick={() => setOpenStructure(structure.tr)}
                        className="w-full rounded-xl surface-panel px-4 py-3 text-left text-sm font-medium transition-colors hover:border hover:border-primary"
                      >
                        {L(structure)}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {detail && (
              <section className="rounded-2xl border-l-4 border-gold bg-secondary p-5">
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                  <Lightbulb className="h-5 w-5 text-gold" /> {t("did_you_know")}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-secondary-foreground">
                  {L(detail.funFact)}
                </p>
              </section>
            )}

            {facts.length > 0 && (
              <section>
                <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold">
                  <Sparkles className="h-5 w-5 text-gold" /> {t("facts")}
                </h2>
                <ul className="space-y-3">
                  {facts.map((fact) => (
                    <li
                      key={fact.tr}
                      className="rounded-xl surface-panel p-4 text-[15px] leading-relaxed"
                    >
                      {L(fact)}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section>
              <h2 className="mb-3 font-display text-xl font-semibold">{t("location")}</h2>
              <SiteMap sites={[site]} center={[site.lat, site.lng]} zoom={12} height="360px" />
            </section>
          </div>

          <aside className="space-y-3">
            <VisitingInfo site={site} />
            <Fact icon={CalendarClock} label={t("era")} value={L(site.era)} />
            <Fact icon={Users} label={t("civilizations")} value={site.civilizations.join(", ")} />
            <Fact
              icon={Award}
              label={t("unesco")}
              value={
                site.unesco === "listed"
                  ? t("unesco_listed")
                  : site.unesco === "tentative"
                    ? t("unesco_tentative")
                    : "—"
              }
            />
            {site.figures.length > 0 && (
              <Fact icon={Users} label={t("figures")} value={site.figures.join(", ")} />
            )}
          </aside>
        </div>

        <PhotoCredits urls={shownPhotos} className="mt-10 border-t border-border pt-6" />
      </div>

      <Lightbox
        images={gallery}
        index={zoomed}
        onIndexChange={(next) => {
          setZoomed(next);
          // Paging in the lightbox leaves the banner on whatever you stopped at,
          // so closing it does not throw the selection away.
          setActiveImage(next);
        }}
        onClose={() => setZoomed(null)}
        alt={L(site.name)}
      />

      <Dialog
        open={openStructure !== null}
        onOpenChange={(o) => {
          if (!o) {
            setOpenStructure(null);
            setZoomedStructure(false);
          }
        }}
      >
        <DialogContent>
          {openStructure && (
            <>
              <figure>
                <button
                  type="button"
                  onClick={() => setZoomedStructure(true)}
                  aria-label={t("photo_expand")}
                  className="group relative block w-full cursor-zoom-in overflow-hidden rounded-xl"
                >
                  <Photo
                    src={structurePhoto ?? coverImage(site)}
                    alt={openStructure}
                    sizes="(min-width: 640px) 512px, 100vw"
                    fallbackWidth={500}
                    className="h-52 w-full object-cover"
                  />
                  <span className="absolute right-2 top-2 rounded-full bg-card/85 p-1.5 backdrop-blur transition-colors group-hover:bg-card">
                    <Maximize2 className="h-3.5 w-3.5" />
                  </span>
                </button>
                <figcaption className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                  {/* Say so when this is the city and not the structure: the
                      photo is otherwise indistinguishable from a real one. */}
                  {structurePhoto ? structureCredit : t("structure_general_view")}
                </figcaption>
              </figure>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">{openStructure}</DialogTitle>
                <DialogDescription>
                  {selectedStructure?.blurb
                    ? L(selectedStructure.blurb)
                    : t("structure_generic").replace("{site}", L(site.name))}
                </DialogDescription>
              </DialogHeader>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* The structure photo is not one of the gallery images, so it opens as a
          list of one rather than as an index into the gallery. */}
      <Lightbox
        images={[structurePhoto ?? coverImage(site)]}
        index={zoomedStructure && openStructure ? 0 : null}
        onIndexChange={() => {}}
        onClose={() => setZoomedStructure(false)}
        alt={openStructure ?? L(site.name)}
      />
    </article>
  );
}
