import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { parseLang, translate, useI18n } from "@/lib/i18n";
import { termsOfUse } from "@/lib/legal";
import { seoTags } from "@/lib/seo";

export const Route = createFileRoute("/kosullar")({
  head: ({ match }) => {
    const lang = parseLang(match.search.lang);
    return seoTags({
      lang,
      pathname: "/kosullar",
      title: `${termsOfUse[lang].title} | ${translate("appName", lang)}`,
      description: termsOfUse[lang].intro,
    });
  },
  component: TermsPage,
});

function TermsPage() {
  const { lang } = useI18n();
  return <LegalPage doc={termsOfUse[lang]} />;
}
