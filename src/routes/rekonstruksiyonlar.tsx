import { createFileRoute, Link } from "@tanstack/react-router";
import { Box, MapPin, Ruler } from "lucide-react";
import { parseLang, translate, useI18n } from "@/lib/i18n";
import { reconstructions } from "@/lib/reconstructions";
import { breadcrumbTags, itemListTags, seoTags } from "@/lib/seo";
import { getSite } from "@/lib/sites";

export const Route = createFileRoute("/rekonstruksiyonlar")({
  head: ({ match }) => {
    const lang = parseLang(match.search.lang);
    const title = translate("seo_reconstructions_title", lang);
    const description = translate("seo_reconstructions_desc", lang);
    return {
      ...seoTags({ lang, pathname: "/rekonstruksiyonlar", title, description }),
      scripts: [
        ...itemListTags(
          reconstructions.map((item) => ({
            name: item.title[lang],
            pathname: `/rekonstruksiyon/${item.id}`,
          })),
          { lang, name: translate("recon_title", lang), description },
        ),
        ...breadcrumbTags(
          [
            { name: translate("appName", lang), pathname: "/" },
            { name: translate("recon_title", lang), pathname: "/rekonstruksiyonlar" },
          ],
          lang,
        ),
      ],
    };
  },
  component: ReconstructionsPage,
});

function ReconstructionsPage() {
  const { t, L } = useI18n();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header>
        <h1 className="flex items-center gap-2.5 font-display text-3xl font-semibold sm:text-4xl">
          <Box className="h-7 w-7 text-primary" /> {t("recon_title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {t("recon_sub")}
        </p>
      </header>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {reconstructions.map((item) => {
          const site = getSite(item.siteSlug);
          return (
            <Link
              key={item.id}
              to="/rekonstruksiyon/$id"
              params={{ id: item.id }}
              className="group flex flex-col rounded-2xl surface-panel p-5 lift"
            >
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-foreground">
                <Box className="h-3 w-3" /> {t("recon_badge")}
              </span>
              <h2 className="mt-3 font-display text-xl font-semibold group-hover:text-primary">
                {L(item.title)}
              </h2>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {site ? L(site.name) : item.siteSlug} · {L(item.period)}
              </p>
              <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                {L(item.blurb)}
              </p>
              <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Ruler className="h-3.5 w-3.5" />
                {item.measures.length} {t("recon_measure_count")}
              </p>
              <span className="sr-only">{t("recon_open")}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
