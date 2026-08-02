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
  Route as RouteIcon,
  Ticket,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { SiteMap } from "@/components/SiteMap";
import { VisitEditor } from "@/components/VisitEditor";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { useProgress, XP_PER_VISIT } from "@/lib/progress";
import { structureImage, structureInfo } from "@/lib/structures";
import { coverImage, galleryImages, getSite, regions } from "@/lib/sites";

export const Route = createFileRoute("/kent/$slug")({
  loader: ({ params }) => {
    const site = getSite(params.slug);
    if (!site) throw notFound();
    return {
      slug: site.slug,
      title: site.name.tr,
      description: site.summary.tr,
      image: coverImage(site),
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Antik kent bulunamadı" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.title} Antik Kenti — Tarihçe, Ziyaret Bilgileri`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.description },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.description },
        { property: "og:image", content: loaderData.image },
        { property: "og:image:alt", content: loaderData.title },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: loaderData.image },
      ],
    };
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
  const [activeImage, setActiveImage] = useState(0);
  const [openStructure, setOpenStructure] = useState<string | null>(null);
  const gallery = galleryImages(site);
  const region = regions.find((r) => r.id === site.region)!;

  useEffect(() => {
    pushRecent(slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const visited = isVisited(slug);
  const selectedStructure = openStructure ? structureInfo[openStructure] : undefined;

  function onVisit() {
    const on = toggleVisited(slug);
    toast[on ? "success" : "message"](on ? `${L(site.name)} · +${XP_PER_VISIT} XP` : L(site.name), {
      description: on ? t("visited_done") : t("visited"),
    });
  }

  return (
    <article>
      <div className="relative h-[52vh] min-h-[340px] w-full overflow-hidden">
        <img
          src={gallery[activeImage] ?? coverImage(site)}
          alt={L(site.name)}
          width={1920}
          height={1088}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 hero-scrim" />
        <div className="absolute inset-x-0 top-0 mx-auto max-w-6xl px-4 pt-4 sm:px-6">
          <Link
            to="/kentler"
            className="inline-flex items-center gap-1.5 rounded-full bg-card/85 px-3 py-1.5 text-xs font-semibold backdrop-blur"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> {t("back")}
          </Link>
        </div>
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-4 pb-6 sm:px-6">
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
          <p className="mt-1 flex items-center gap-1.5 text-sm text-white/80">
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
                onClick={() => setActiveImage(i)}
                className={`h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition-opacity ${
                  activeImage === i ? "border-primary" : "border-transparent opacity-70"
                }`}
              >
                <img
                  src={img}
                  alt={`${L(site.name)} ${i + 1}`}
                  loading="lazy"
                  width={1200}
                  height={800}
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
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                {L(site.history)}
              </p>
            </section>

            <section>
              <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold">
                <Building2 className="h-5 w-5 text-primary" /> {t("structures")}
              </h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {site.structures.map((structure) => (
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

            <section className="rounded-2xl border-l-4 border-gold bg-secondary p-5">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                <Lightbulb className="h-5 w-5 text-gold" /> {t("did_you_know")}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-secondary-foreground">
                {L(site.funFact)}
              </p>
            </section>

            <section>
              <h2 className="mb-3 font-display text-xl font-semibold">{t("location")}</h2>
              <SiteMap sites={[site]} center={[site.lat, site.lng]} zoom={12} height="360px" />
            </section>
          </div>

          <aside className="space-y-3">
            <Fact icon={CalendarClock} label={t("era")} value={L(site.era)} />
            <Fact icon={Users} label={t("civilizations")} value={site.civilizations.join(", ")} />
            <Fact icon={Clock} label={t("hours")} value={L(site.hours)} />
            <Fact
              icon={Ticket}
              label={t("entry_fee")}
              value={site.fee === 0 ? t("free") : `${site.fee} ₺`}
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
              <Fact icon={Users} label={t("figures")} value={site.figures.join(", ")} />
            )}
          </aside>
        </div>
      </div>

      <Dialog open={openStructure !== null} onOpenChange={(o) => !o && setOpenStructure(null)}>
        <DialogContent>
          {openStructure && (
            <>
              <div className="overflow-hidden rounded-xl">
                <img
                  src={structureImage(openStructure, coverImage(site))}
                  alt={openStructure}
                  width={1200}
                  height={800}
                  className="h-52 w-full object-cover"
                />
              </div>
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
    </article>
  );
}
