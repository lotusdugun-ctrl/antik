import { createFileRoute } from "@tanstack/react-router";
import { FreeModelCard, ModelCard } from "@/components/ModelCard";
import { parseLang, translate, useI18n, pick } from "@/lib/i18n";
import { isFreeModel } from "@/lib/pass";
import { reconstructions } from "@/lib/reconstructions";
import { breadcrumbTags, itemListTags, seoTags } from "@/lib/seo";

export const Route = createFileRoute("/rekonstruksiyonlar")({
  loaderDeps: ({ search }) => ({ lang: parseLang(search.lang) }),
  loader: async ({ deps }) => {
    // Imported here rather than at the top: whatever `head()` and a
    // synchronous loader touch stays in the entry bundle every page downloads.
    const { reconstructions } = await import("@/lib/reconstructions");
    return {
      items: reconstructions.map((item) => ({
        name: pick(item.title, deps.lang),
        pathname: `/rekonstruksiyon/${item.id}`,
      })),
    };
  },
  head: ({ match, loaderData }) => {
    const lang = parseLang(match.search.lang);
    const title = translate("seo_reconstructions_title", lang);
    const description = translate("seo_reconstructions_desc", lang);
    return {
      ...seoTags({ lang, pathname: "/rekonstruksiyonlar", title, description }),
      scripts: [
        ...itemListTags(loaderData?.items ?? [], {
          lang,
          name: translate("recon_title", lang),
          description,
        }),
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
  const { t } = useI18n();
  const free = reconstructions.filter((item) => isFreeModel(item.id));
  const rest = reconstructions.filter((item) => !isFreeModel(item.id));

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
      <header className="grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
        <div>
          <p className="text-[15px] font-bold text-primary">
            {t("recon_count_line").replace("{n}", String(reconstructions.length))}
          </p>
          <h1 className="mt-3 text-[64px] sm:text-[104px]">{t("recon_title")}</h1>
        </div>
        <p className="prose-read max-w-xl text-muted-foreground">{t("recon_sub")}</p>
      </header>

      <div className="mt-10 grid gap-3 md:grid-cols-2">
        {free.map((item) => (
          <FreeModelCard key={item.id} item={item} />
        ))}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {rest.map((item) => (
          <ModelCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
