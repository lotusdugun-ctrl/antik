import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Box,
  Building2,
  Castle,
  Landmark,
  Map as MapIcon,
  Layers,
  MapPin,
  Navigation,
  Route as RouteIcon,
  Ruler,
  Search,
  Sparkles,
} from "lucide-react";
import { Photo } from "@/components/Photo";
import { SiteCard } from "@/components/SiteCard";
import { collections, collectionSites } from "@/lib/collections";
import { parseLang, translate, useI18n, type TKey } from "@/lib/i18n";
import { useProgress } from "@/lib/progress";
import { reconstructions } from "@/lib/reconstructions";
import { seoTags } from "@/lib/seo";
import {
  ancientCities,
  distanceKm,
  getSite,
  heroImage,
  historicPlaces,
  museums,
  regionCoverImage,
  regions,
  sites,
  totalSites,
  coverImage,
} from "@/lib/sites";

export const Route = createFileRoute("/")({
  head: ({ match }) => {
    const lang = parseLang(match.search.lang);
    return seoTags({
      lang,
      pathname: "/",
      title: translate("seo_home_title", lang),
      description: translate("seo_home_desc", lang),
    });
  },
  component: Index,
});

function SectionTitle({ title, action, to }: { title: string; action?: string; to?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2 className="font-display text-xl font-semibold sm:text-2xl">{title}</h2>
      {action && to && (
        <Link
          to={to}
          className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {action}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function Index() {
  const { t, L } = useI18n();
  const navigate = useNavigate();
  const { state } = useProgress();
  const [query, setQuery] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState(false);

  // All three arrive sorted by popularity from the data layer.
  const topCities = ancientCities.slice(0, 8);
  const SHORTCUTS: { to: string; key: TKey; desc: TKey; icon: typeof Landmark; count?: string }[] =
    [
      {
        to: "/antik-kentler",
        key: "nav_ancient",
        desc: "nav_ancient_d",
        icon: Landmark,
        count: `${ancientCities.length} ${t("heritage_sites")}`,
      },
      {
        to: "/tarihi-yerler",
        key: "nav_places",
        desc: "nav_places_d",
        icon: Castle,
        count: `${historicPlaces.length} ${t("heritage_sites")}`,
      },
      {
        to: "/muzeler",
        key: "nav_museums",
        desc: "nav_museums_d",
        icon: Building2,
        count: `${museums.length} ${t("heritage_sites")}`,
      },
      { to: "/harita", key: "nav_map", desc: "nav_map_d", icon: MapIcon },
      {
        to: "/rekonstruksiyonlar",
        key: "nav_reconstructions",
        desc: "nav_reconstructions_d",
        icon: Box,
      },
      { to: "/hikayeler", key: "nav_stories", desc: "nav_stories_d", icon: BookOpen },
    ];
  const recent = state.recent.map(getSite).filter(Boolean).slice(0, 4);
  const nearby = useMemo(() => {
    if (!coords) return [];
    return [...sites]
      .map((site) => ({ site, d: distanceKm(coords.lat, coords.lng, site.lat, site.lng) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 4);
  }, [coords]);

  function locate() {
    if (!navigator.geolocation) return setGeoError(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setGeoError(true),
      { timeout: 8000 },
    );
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate({ to: "/kentler", search: { q: query || undefined } });
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative">
        <div className="relative h-[68vh] min-h-[440px] w-full overflow-hidden">
          <Photo
            src={heroImage}
            alt="Efes Antik Kenti Celsus Kütüphanesi"
            sizes="100vw"
            fallbackWidth={1280}
            width={1920}
            height={1088}
            loading="eager"
            fetchPriority="high"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 hero-scrim" />
          <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6">
            <p className="fade-up mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/85">
              <Sparkles className="h-3.5 w-3.5" />
              {totalSites} {t("heritage_sites")} · {regions.length} {t("regions")}
            </p>
            <h1 className="fade-up max-w-3xl font-display text-4xl font-semibold leading-[1.05] text-white sm:text-6xl">
              {t("tagline")}
            </h1>
            <form onSubmit={submitSearch} className="fade-up mt-6 flex max-w-xl gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("search_placeholder")}
                  aria-label={t("search_placeholder")}
                  className="h-12 w-full rounded-full border border-border bg-card/95 pl-10 pr-4 text-sm text-foreground shadow-lg outline-none backdrop-blur placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
              </div>
              <button
                type="submit"
                className="h-12 shrink-0 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
              >
                {t("search_action")}
              </button>
            </form>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6">
        {/* Shortcuts: the six places most visits start from, one tap each,
            so the sections below can stay few. */}
        <nav aria-label={t("nav_group_explore")}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {SHORTCUTS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-start gap-3 rounded-2xl surface-panel p-3.5 lift sm:p-4"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-tight">{t(item.key)}</span>
                  <span className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted-foreground">
                    {item.count ?? t(item.desc)}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Recently viewed */}
        {recent.length > 0 && (
          <section>
            <SectionTitle title={t("recent")} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recent.map((site) => (site ? <SiteCard key={site.slug} site={site} /> : null))}
            </div>
          </section>
        )}

        {/* Popular ancient cities */}
        <section>
          <SectionTitle title={t("popular")} action={t("view_all")} to="/antik-kentler" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {topCities.map((site) => (
              <SiteCard key={site.slug} site={site} />
            ))}
          </div>
        </section>

        {/* Nearby */}
        <section>
          <SectionTitle title={t("nearby")} />
          {nearby.length === 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl surface-panel p-6">
              <p className="text-sm text-muted-foreground">
                {geoError ? t("nearby_denied") : t("nearby_hint")}
              </p>
              <button
                onClick={locate}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
              >
                <Navigation className="h-4 w-4" />
                {t("nearby_enable")}
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {nearby.map(({ site, d }) => (
                <SiteCard key={site.slug} site={site} distance={d} />
              ))}
            </div>
          )}
        </section>

        {/* 3D reconstructions. They have no photograph to lead with — the point
            of them is the buildings no photograph could show — so the card
            leads with the measurements instead. */}
        <section>
          <SectionTitle title={t("recon_title")} action={t("view_all")} to="/rekonstruksiyonlar" />
          <p className="-mt-2 mb-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {t("recon_sub")}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {reconstructions.slice(0, 4).map((item) => {
              const site = getSite(item.siteSlug);
              return (
                <Link
                  key={item.id}
                  to="/rekonstruksiyon/$id"
                  params={{ id: item.id }}
                  className="flex flex-col rounded-2xl surface-panel p-4 lift"
                >
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
                    <Box className="h-3 w-3" /> {t("recon_badge")}
                  </span>
                  <h3 className="mt-2 font-display text-base font-semibold">{L(item.title)}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {site ? L(site.name) : item.siteSlug} · {L(item.period)}
                  </p>
                  <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <Ruler className="h-3.5 w-3.5" />
                    {item.measures.length} {t("recon_measure_count")}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Route builder */}
        <section>
          <div className="relative overflow-hidden rounded-3xl surface-panel p-6 sm:p-8">
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary/10 blur-2xl" />
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                  <RouteIcon className="h-3.5 w-3.5" /> {t("route_title")}
                </p>
                <h3 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">
                  {t("route_sub")}
                </h3>
              </div>
              <Link
                to="/rota"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
              >
                {t("route_build")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Regions */}
        <section>
          <SectionTitle title={t("quick_regions")} action={t("view_all")} to="/bolgeler" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {regions.map((region) => (
              <Link
                key={region.id}
                to="/bolge/$id"
                params={{ id: region.id }}
                className="group relative aspect-[5/3] overflow-hidden rounded-2xl border border-border lift"
              >
                <Photo
                  src={regionCoverImage(region.id)}
                  alt={L(region.name)}
                  sizes="(min-width: 1280px) 300px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  fallbackWidth={330}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 hero-scrim" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="font-display text-lg font-semibold text-white">
                    {L(region.name)}
                  </h3>
                  <p className="text-xs text-white/90">
                    {sites.filter((s) => s.region === region.id).length} {t("heritage_sites")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Collections */}
        <section>
          <SectionTitle title={t("collections_title")} action={t("view_all")} to="/koleksiyonlar" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collections.slice(0, 3).map((collection) => {
              const first = collectionSites(collection)[0];
              return (
                <Link
                  key={collection.id}
                  to="/koleksiyon/$id"
                  params={{ id: collection.id }}
                  className="group relative aspect-[5/3] overflow-hidden rounded-2xl border border-border lift"
                >
                  {first && (
                    <Photo
                      src={coverImage(first)}
                      alt={L(collection.title)}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      fallbackWidth={500}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 hero-scrim" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <h3 className="font-display text-lg font-semibold text-white">
                      {L(collection.title)}
                    </h3>
                    <p className="flex items-center gap-1 text-xs text-white/90">
                      <Layers className="h-3 w-3" />
                      {collectionSites(collection).length} {t("collection_sites")}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
