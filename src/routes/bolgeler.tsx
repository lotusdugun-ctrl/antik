import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { useProgress } from "@/lib/progress";
import { regions, regionCoverImage, sites } from "@/lib/sites";

export const Route = createFileRoute("/bolgeler")({
  head: () => ({
    meta: [
      { title: "Bölgeler — Türkiye Antik Kentleri | Antik Türkiye" },
      {
        name: "description",
        content:
          "Ege'den Doğu Anadolu'ya yedi bölgedeki antik kentleri keşfet, bölge bazlı ilerlemeni ve tamamlanma yüzdeni gör.",
      },
      { property: "og:title", content: "Bölgeler — Türkiye Antik Kentleri" },
      {
        property: "og:description",
        content: "Yedi bölgedeki antik kentler ve bölge bazlı ziyaret ilerlemesi.",
      },
    ],
  }),
  component: RegionsPage,
});

function RegionsPage() {
  const { t, L } = useI18n();
  const { regionProgress } = useProgress();
  const progress = regionProgress();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">{t("regions_title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("region_sub")}</p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {regions.map((region) => {
          const p = progress.find((x) => x.region === region.id);
          const total = sites.filter((s) => s.region === region.id).length;
          return (
            <Link
              key={region.id}
              to="/bolge/$id"
              params={{ id: region.id }}
              className="group overflow-hidden rounded-2xl surface-panel lift"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={regionCoverImage(region.id)}
                  alt={L(region.name)}
                  loading="lazy"
                  width={1200}
                  height={800}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 hero-scrim" />
                <h2 className="absolute bottom-3 left-4 font-display text-xl font-semibold text-white">
                  {L(region.name)}
                </h2>
              </div>
              <div className="p-4">
                <p className="text-sm text-muted-foreground">{L(region.blurb)}</p>
                <div className="mt-4 flex items-center justify-between text-xs font-medium">
                  <span>
                    {total} {t("cities")}
                  </span>
                  <span className="text-primary">
                    {p?.visited ?? 0}/{total} · %{p?.percent ?? 0} {t("completion")}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${p?.percent ?? 0}%` }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
