import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { parseLang, translate, useI18n } from "@/lib/i18n";
import { privacyPolicy } from "@/lib/legal";
import { seoTags } from "@/lib/seo";

export const Route = createFileRoute("/gizlilik")({
  head: ({ match }) => {
    const lang = parseLang(match.search.lang);
    return seoTags({
      lang,
      pathname: "/gizlilik",
      title: `${privacyPolicy[lang].title} | ${translate("appName", lang)}`,
      description: privacyPolicy[lang].intro,
    });
  },
  component: PrivacyPage,
});

function PrivacyPage() {
  const { lang } = useI18n();
  return <LegalPage doc={privacyPolicy[lang]} />;
}
