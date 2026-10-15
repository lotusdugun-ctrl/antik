import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Box,
  Building2,
  CalendarClock,
  Check,
  Clock,
  Heart,
  ImageOff,
  Lightbulb,
  MapPin,
  Navigation,
  Maximize2,
  Route as RouteIcon,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { AudioGuide } from "@/components/AudioGuide";
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
import { parseLang, translate, useI18n, pick, type Lang, type Localized } from "@/lib/i18n";
import { imageAt } from "@/lib/images";
import { useProgress, XP_PER_VISIT } from "@/lib/progress";
import { creditLine } from "@/lib/photo-credits";
import { breadcrumbTags, seoTags, siteTags } from "@/lib/seo";
import { AskGuide } from "@/components/AskGuide";
import { NewsList } from "@/components/NewsList";
import { StampButton } from "@/components/Passport";
import { civilizationFor } from "@/lib/history-index";
import { personFor } from "@/lib/history-index";
import { guideForSite } from "@/lib/guide-sources";
import { galleryImages, getSiteDetail } from "@/lib/site-details";
import { factsFor } from "@/lib/site-facts";
import { structurePhotoFor } from "@/lib/structure-photos";
import { reconstructionForStructure } from "@/lib/reconstructions";
import { storiesFor } from "@/lib/stories";
import { structureInfoAt } from "@/lib/structure-names";
import { coverImage, getSite, hasOwnPhoto, heritageTypeName, regions } from "@/lib/sites";

export const Route = createFileRoute("/kent/$slug")({
  loaderDeps: ({ search }) => ({ lang: parseLang(search.lang) }),
  loader: async ({ params, deps }) => {
    const site = getSite(params.slug);
    if (!site) throw notFound();
    // The guide's summary needs the narration, the site texts and the
    // recording manifest — several hundred KB that every other page would
    // otherwise download as part of the entry bundle, because whatever
    // `head()` touches stays there. Loaded here, it ships with this route.
    const [{ guideMeta }, { loadStories }] = await Promise.all([
      import("@/lib/guide-meta"),
      import("@/lib/narration-stories-load"),
    ]);
    const stories = await loadStories(`site:${site.slug}`);
    return {
      slug: site.slug,
      name: site.name,
      summary: site.summary,
      image: coverImage(site),
      guide: guideMeta(site.slug, deps.lang, stories),
      stories,
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
    const name = pick(loaderData.name, lang);
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
      description: pick(loaderData.summary, lang),
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
              description: pick(loaderData.summary, lang),
              image,
              regionName: pick(region.name, lang),
              guide: loaderData.guide,
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

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-xl surface-panel p-4">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </p>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

/**
 * A list of names where the ones with a page of their own are links. The
 * data stores the Turkish name; a linked entry shows the name in the reader's
 * language, an unlinked one stays as written.
 */
function LinkedNames({
  values,
  find,
  to,
}: {
  values: string[];
  find: (value: string) => { id: string; name: Localized } | undefined;
  to: "/medeniyet/$id" | "/kisi/$id";
}) {
  const { L } = useI18n();
  const seen = new Set<string>();
  const items = values.flatMap((value) => {
    const entry = find(value);
    const key = entry?.id ?? value;
    if (seen.has(key)) return [];
    seen.add(key);
    return [{ value, entry }];
  });
  return (
    <span className="flex flex-wrap gap-x-1 gap-y-1">
      {items.map(({ value, entry }, i) => (
        <span key={entry?.id ?? value}>
          {entry ? (
            <Link
              to={to}
              params={{ id: entry.id }}
              className="text-primary underline-offset-2 hover:underline"
            >
              {L(entry.name)}
            </Link>
          ) : (
            value
          )}
          {i < items.length - 1 && ","}
        </span>
      ))}
    </span>
  );
}

function SiteDetail() {
  const { slug } = Route.useParams();
  const { t, L } = useI18n();
  const { ready, isVisited, isFavorite, toggleVisited, toggleFavorite, pushRecent } = useProgress();
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
  const ownPhoto = hasOwnPhoto(site);
  const region = regions.find((r) => r.id === site.region)!;
  const facts = factsFor(slug);
  const { stories } = Route.useLoaderData();
  const guide = useMemo(() => guideForSite(slug, stories), [slug, stories]);
  // Everything this page can put on screen, so the credit block below covers
  // the structure dialog's photo too and not just what is currently visible.
  const shownPhotos = [
    ...gallery,
    coverImage(site),
    ...(detail?.structures ?? []).map((s) => structurePhotoFor(slug, s.tr)),
  ].filter((url): url is string => typeof url === "string");

  // Waits for the stored progress, so "recently viewed" is added to it rather
  // than written over it.
  useEffect(() => {
    if (ready) pushRecent(slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, ready]);

  const visited = isVisited(slug);
  const selectedStructure = openStructure ? structureInfoAt(openStructure) : undefined;
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
        {/* Directly under the banner, because that is the image it is about. */}
        {!ownPhoto && (
          <p className="mb-6 flex items-start gap-2 rounded-xl surface-panel p-3 text-xs leading-relaxed text-muted-foreground">
            <ImageOff className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {t("photo_placeholder")}{" "}
              {/* Commons holds no free photograph of these few places yet;
                  the way to fix that is for someone who has been there to add
                  one, under a licence the app can show. */}
              <a
                href="https://commons.wikimedia.org/wiki/Special:UploadWizard"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-primary hover:underline"
              >
                {t("photo_contribute")}
              </a>
            </span>
          </p>
        )}

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
          <StampButton site={site} />
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

        {guide && (
          <div className="mt-6">
            <AudioGuide guide={guide} arrival={{ lat: site.lat, lng: site.lng }} />
          </div>
        )}

        <div className="mt-4">
          <AskGuide site={site} />
        </div>

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
                  {detail.structures.map((structure) => {
                    const model = reconstructionForStructure(slug, structure.tr);
                    return (
                      <li key={structure.tr} className="flex items-stretch gap-2">
                        <button
                          onClick={() => setOpenStructure(structure.tr)}
                          className="flex-1 rounded-xl surface-panel px-4 py-3 text-left text-sm font-medium transition-colors hover:border hover:border-primary"
                        >
                          {L(structure)}
                        </button>
                        {/* Only the handful of structures with a measured model
                            carry this, so the badge means something. */}
                        {model && (
                          <Link
                            to="/rekonstruksiyon/$id"
                            params={{ id: model.id }}
                            aria-label={`${L(structure)} — ${t("recon_open")}`}
                            title={t("recon_open")}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-bold uppercase tracking-wide text-primary-foreground transition-transform hover:scale-[1.03]"
                          >
                            <Box className="h-3.5 w-3.5" /> {t("recon_badge")}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {storiesFor(slug).map((story) => (
              <Link
                key={story.id}
                to="/hikaye/$id"
                params={{ id: story.id }}
                className="flex items-center gap-4 rounded-2xl surface-panel p-5 transition-colors hover:border hover:border-primary"
              >
                <BookOpen className="h-7 w-7 shrink-0 text-primary" />
                <span className="flex-1">
                  <span className="block text-xs font-bold uppercase tracking-wide text-primary">
                    {t("stories_title")}
                  </span>
                  <span className="block font-display text-lg font-semibold">{L(story.title)}</span>
                  <span className="block text-sm text-muted-foreground">{L(story.role)}</span>
                </span>
              </Link>
            ))}

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

          <div className="space-y-3">
            <VisitingInfo site={site} />
            <Fact icon={CalendarClock} label={t("era")} value={L(site.era)} />
            <Fact
              icon={Users}
              label={t("civilizations")}
              value={
                <LinkedNames
                  values={site.civilizations}
                  find={civilizationFor}
                  to="/medeniyet/$id"
                />
              }
            />
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
              <Fact
                icon={Users}
                label={t("figures")}
                value={<LinkedNames values={site.figures} find={personFor} to="/kisi/$id" />}
              />
            )}
          </div>
        </div>

        <div className="mt-10">
          <NewsList site={site.slug} />
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
        note={ownPhoto ? undefined : t("photo_placeholder")}
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
