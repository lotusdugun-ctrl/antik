import { createFileRoute } from "@tanstack/react-router";
import { SiteMap } from "@/components/SiteMap";
import { useI18n } from "@/lib/i18n";
import { useProgress } from "@/lib/progress";
import { sites } from "@/lib/sites";

export const Route = createFileRoute("/harita")({
  head: () => ({
    meta: [
      { title: "Antik Kent Haritası — Türkiye | Antik Türkiye" },
      {
        name: "description",
        content:
          "Türkiye'deki tüm antik kentleri interaktif harita üzerinde gör; iğneye tıklayıp bilgi kartını aç ve ziyaretini kaydet.",
      },
      { property: "og:title", content: "Antik Kent Haritası — Türkiye" },
      {
        property: "og:description",
        content: "Türkiye'nin antik kentleri interaktif harita üzerinde işaretli.",
      },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const { t } = useI18n();
  const { state } = useProgress();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">{t("nav_map")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {sites.length} {t("cities")} · {state.visited.length} {t("visited_done").toLowerCase()}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-primary" /> {t("nav_explore")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-success" /> {t("visited_done")}
          </span>
        </div>
      </header>
      <SiteMap sites={sites} height="76vh" />
    </div>
  );
}
