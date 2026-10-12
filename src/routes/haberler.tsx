import { createFileRoute } from "@tanstack/react-router";
import { NewsList } from "@/components/NewsList";
import { parseLang, translate, useI18n } from "@/lib/i18n";
import { seoTags } from "@/lib/seo";

export const Route = createFileRoute("/haberler")({
  head: ({ match }) => {
    const lang = parseLang(match.search.lang);
    return seoTags({
      lang,
      pathname: "/haberler",
      title: `${translate("news_title", lang)} | ${translate("appName", lang)}`,
      description: translate("news_sub", lang),
    });
  },
  component: NewsPage,
});

function NewsPage() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">{t("news_title")}</h1>
      <p className="mt-2 mb-6 text-sm text-muted-foreground">{t("news_sub")}</p>
      <NewsList limit={20} always />
    </div>
  );
}
