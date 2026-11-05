import { createFileRoute, Link } from "@tanstack/react-router";
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
  Play,
  Route as RouteIcon,
} from "lucide-react";
import { Logo } from "@/components/Brand";
import { FreeModelCard, ModelArt, ModelCard } from "@/components/ModelCard";
import { Photo } from "@/components/Photo";
import { SiteCard } from "@/components/SiteCard";
import { collections, collectionSites } from "@/lib/collections";
import { parseLang, translate, useI18n, type TKey } from "@/lib/i18n";
import { isFreeModel, PassBenefits, priceFor } from "@/lib/pass";
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
import { cn } from "@/lib/utils";

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
      <h2 className="text-[40px] sm:text-[52px]">{title}</h2>
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

/** Where the brand is going. Only Türkiye is live; the rest show as coming. */
const COUNTRIES: { name: string; places: string; live?: boolean; lang?: string }[] = [
  { name: "Türkiye", places: "", live: true },
  { name: "Italia", places: "Roma · Pompeii · Paestum" },
  { name: "Ελλάδα", places: "Athína · Delfí · Olympía", lang: "el" },
  { name: "Egypt", places: "Giza · Luxor · Karnak" },
  { name: "Jordan", places: "Petra · Jerash" },
  { name: "Iran", places: "Persepolis · Pasargadae" },
  { name: "México", places: "Chichén Itzá · Teotihuacan" },
  { name: "Perú", places: "Machu Picchu · Cusco" },
];

function Index() {
  const { t, L, lang } = useI18n();
  const { state } = useProgress();
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
  const freeModels = reconstructions.filter((item) => isFreeModel(item.id));
  const moreModels = reconstructions.filter((item) => !isFreeModel(item.id)).slice(0, 8);
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

  return (
    <div>
      {/* Hero: a render, the promise, and the free way in. */}
      <section className="relative isolate overflow-hidden">
        <div className="relative min-h-[560px] w-full sm:min-h-[680px] lg:h-[78vh] lg:max-h-[820px]">
          <Photo
            src={heroImage}
            alt="Celsus Kütüphanesi, Efes — Antik Türkiye 3D rekonstrüksiyonu"
            sizes="100vw"
            fallbackWidth={1280}
            width={1920}
            height={1088}
            loading="eager"
            fetchPriority="high"
            className="drift absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 hero-scrim" />
          <div className="absolute inset-x-0 bottom-0 mx-auto grid w-full max-w-7xl gap-6 px-4 pb-10 sm:px-6 sm:pb-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="fade-up">
              <h1 className="max-w-4xl text-[64px] leading-[0.84] sm:text-[112px] lg:text-[150px]">
                {t("home_hero_title")}
              </h1>
              <p className="prose-read mt-5 max-w-xl text-foreground/85 sm:text-[20px]">
                {t("home_hero_sub").replace("{n}", String(reconstructions.length))}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/rekonstruksiyon/$id"
                  params={{ id: "aspendos-tiyatrosu" }}
                  className="inline-flex h-[52px] items-center gap-2.5 rounded-md bg-ivory px-6 text-[16px] font-extrabold text-obsidian transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Play className="h-4 w-4 fill-current" /> {t("home_start_free")}
                </Link>
                <Link
                  to="/rekonstruksiyonlar"
                  className="inline-flex h-[52px] items-center gap-2 rounded-md bg-ivory/10 px-6 text-[16px] font-bold text-foreground shadow-[inset_0_0_0_1px_rgb(242_240_235/0.25)] transition-colors hover:bg-ivory/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {t("home_all_3d")} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <p className="hidden items-center gap-2.5 text-sm font-semibold text-foreground/80 lg:flex">
              <Box className="h-4 w-4" /> {L(reconstructions[0]!.title)}
            </p>
          </div>
        </div>
      </section>

      {/* Every country the brand is heading to, always moving. */}
      <div aria-hidden className="overflow-hidden border-y border-border">
        <div className="marquee flex w-max">
          {[0, 1].map((round) => (
            <div key={round} className="flex">
              {COUNTRIES.map((c) => (
                <span
                  key={`${round}-${c.name}`}
                  lang={c.lang ?? "en"}
                  className="type-display flex items-center gap-7 whitespace-nowrap px-7 py-4 text-[32px] sm:text-[44px]"
                >
                  Antik {c.name}
                  <span
                    className={cn("h-2.5 w-2.5 rounded-full", c.live ? "bg-primary" : "bg-border")}
                  />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Countries: Türkiye is open, the rest are coming. */}
      <section aria-labelledby="home-countries" className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 id="home-countries" className="text-[48px] sm:text-[64px]">
            {t("home_countries")}
          </h2>
          <Link
            to="/harita"
            className="flex shrink-0 items-center gap-1.5 text-[15px] font-bold text-foreground hover:text-primary"
          >
            {t("home_see_map")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          <Link
            to="/rekonstruksiyonlar"
            className="group relative col-span-2 flex min-h-[300px] flex-col justify-end overflow-hidden rounded-lg bg-card p-5 sm:min-h-[380px] lg:row-span-2 lg:min-h-0"
          >
            <ModelArt
              id="nemrut-dogu-terasi"
              siteSlug="nemrut"
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/95" />
            <span className="absolute left-4 top-4 inline-flex h-7 items-center rounded bg-primary px-2.5 text-[13px] font-extrabold text-primary-foreground">
              {reconstructions.length} 3D
            </span>
            <div className="relative">
              <h3 className="type-display text-[64px] sm:text-[88px]">Türkiye</h3>
              <p className="mt-2 text-sm text-foreground/80">
                {t("home_country_meta")
                  .replace("{a}", String(totalSites))
                  .replace("{b}", String(reconstructions.length))}
              </p>
            </div>
          </Link>
          {COUNTRIES.filter((c) => !c.live).map((c) => (
            <div
              key={c.name}
              className="flex min-h-[120px] flex-col justify-between rounded-lg bg-card p-4 shadow-[inset_0_0_0_1px_var(--border)] sm:min-h-[132px] sm:p-5"
            >
              <span className="text-[13px] font-bold text-muted-foreground">{t("home_soon")}</span>
              <div>
                <h3
                  lang={c.lang}
                  className="type-display text-[34px] text-foreground/90 sm:text-[40px]"
                >
                  {c.name}
                </h3>
                <p className="mt-1 text-[13.5px] text-muted-foreground">{c.places}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The two free buildings: the way in. */}
      <section aria-labelledby="home-free" className="mx-auto max-w-7xl px-4 pt-16 sm:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <h2 id="home-free" className="text-[48px] sm:text-[64px]">
            {t("home_free_title")}
          </h2>
          <p className="max-w-md text-[15px] text-muted-foreground">{t("home_free_sub")}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {freeModels.map((item) => (
            <FreeModelCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* More in 3D. */}
      <section aria-labelledby="home-3d" className="mx-auto max-w-7xl px-4 pt-16 sm:px-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 id="home-3d" className="text-[48px] sm:text-[64px]">
            {t("home_more_3d")}
          </h2>
          <Link
            to="/rekonstruksiyonlar"
            className="flex shrink-0 items-center gap-1.5 text-[15px] font-bold text-foreground hover:text-primary"
          >
            {t("home_all_3d")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {moreModels.map((item) => (
            <ModelCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Antik Pass. */}
      <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6">
        <div className="grid overflow-hidden rounded-xl bg-primary text-primary-foreground lg:grid-cols-[1.15fr_1fr]">
          <div className="relative min-h-[240px]">
            <ModelArt
              id="aspendos-tiyatrosu"
              siteSlug="aspendos"
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-between gap-7 p-6 sm:p-10">
            <div>
              <Logo
                edition={t("nav_pass")}
                className="text-[28px]"
                editionClassName="text-primary-foreground/70"
              />
              <h2 className="mt-5 text-[56px] sm:text-[80px]">{t("pass_title")}</h2>
            </div>
            <PassBenefits count={reconstructions.length} />
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-[28px] font-extrabold tabular-nums">
                {priceFor("year", lang)}
                <span className="ml-1.5 text-base font-semibold opacity-75">
                  {t("pass_per_year")}
                </span>
              </p>
              <Link
                to="/pass"
                className="inline-flex h-[52px] items-center rounded-md bg-obsidian px-6 text-[16px] font-extrabold text-ivory transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                {t("pass_cta_open")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-14 px-4 py-16 sm:px-6">
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
                className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
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

        {/* Route builder */}
        <section>
          <div className="relative overflow-hidden rounded-3xl surface-panel p-6 sm:p-8">
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary/10 blur-2xl" />
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                  <RouteIcon className="h-3.5 w-3.5" /> {t("route_title")}
                </p>
                <h3 className="mt-1 font-display text-[40px] sm:text-[52px]">{t("route_sub")}</h3>
              </div>
              <Link
                to="/rota"
                className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
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
                  <h3 className="font-display text-[26px] text-white">{L(region.name)}</h3>
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
                    <h3 className="font-display text-[26px] text-white">{L(collection.title)}</h3>
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
