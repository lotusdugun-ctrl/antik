import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FreeModelCard, ModelCard } from "@/components/ModelCard";
import { Logo } from "@/components/Brand";
import { parseLang, translate, useI18n } from "@/lib/i18n";
import { FREE_MODELS, PassBenefits, PlanPicker, useBuyPass, type Plan } from "@/lib/pass";
import { reconstructions } from "@/lib/reconstructions";
import { breadcrumbTags, seoTags } from "@/lib/seo";

export const Route = createFileRoute("/pass")({
  head: ({ match }) => {
    const lang = parseLang(match.search.lang);
    return {
      ...seoTags({
        lang,
        pathname: "/pass",
        title: translate("seo_pass_title", lang),
        description: translate("seo_pass_desc", lang),
      }),
      scripts: breadcrumbTags(
        [
          { name: translate("appName", lang), pathname: "/" },
          { name: translate("pass_name", lang), pathname: "/pass" },
        ],
        lang,
      ),
    };
  },
  component: PassPage,
});

function PassPage() {
  const { t } = useI18n();
  const [plan, setPlan] = useState<Plan>("year");
  const buy = useBuyPass();
  const free = reconstructions.filter((item) => FREE_MODELS.includes(item.id));
  const locked = reconstructions.filter((item) => !FREE_MODELS.includes(item.id)).slice(0, 8);

  return (
    <div>
      <section className="relative overflow-hidden">
        <img
          src="/posters/pergamon-zeus-sunagi.jpg"
          alt=""
          className="drift absolute inset-0 h-full w-full object-cover opacity-70"
          onError={(event) => (event.currentTarget.style.display = "none")}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-14 pt-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-end lg:pt-28">
          <div>
            <Logo edition={t("nav_pass")} className="text-[30px]" editionClassName="text-primary" />
            <h1 className="mt-6 text-[64px] sm:text-[104px] lg:text-[128px]">{t("pass_title")}</h1>
            <p className="prose-read mt-6 max-w-xl text-foreground/85">{t("pass_page_body")}</p>
            <PassBenefits count={reconstructions.length} className="mt-6 [&_svg]:text-primary" />
          </div>
          <div className="rounded-xl bg-background/80 p-4 shadow-[inset_0_0_0_1px_var(--border)] backdrop-blur sm:p-5">
            <PlanPicker value={plan} onChange={setPlan} />
            <button
              type="button"
              onClick={() => buy(plan)}
              className="mt-4 h-14 w-full rounded-lg bg-primary text-[16px] font-extrabold text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {t("pass_cta_open")}
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">{t("pass_restore")}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-[48px] sm:text-[64px]">{t("home_free_title")}</h2>
          <p className="max-w-md text-[15px] text-muted-foreground">{t("home_free_sub")}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {free.map((item) => (
            <FreeModelCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="mb-5 text-[48px] sm:text-[64px]">{t("pass_page_kicker")}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {locked.map((item) => (
            <ModelCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
