import { Clock, ExternalLink, Info, Ticket } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { MINISTRY_HOURS, OFFICIAL_INFO_URL, type Site } from "@/lib/sites";

/**
 * What we can honestly tell a visitor about getting in.
 *
 * The app has no verified per-site opening times or current tariff, so this
 * panel states the ministry's seasonal rule *as a rule*, marks the fee as
 * indicative, and sends the visitor to the official page for the numbers that
 * actually matter on the day. The previous version printed a confident
 * per-site "08:30 – 19:00" that was generated from whether the site charged
 * admission — identical across all hundred sites, and unverifiable.
 */
export function VisitingInfo({ site }: { site: Site }) {
  const { t, L } = useI18n();
  const free = site.fee === 0;

  return (
    <section className="rounded-2xl surface-panel p-5">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
        <Info className="h-5 w-5 text-primary" /> {t("visiting")}
      </h2>

      <div className="mt-4 space-y-4 text-sm">
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {site.hours ? t("hours") : t("hours_rule")}
          </p>
          {site.hours ? (
            <p className="mt-1 font-medium">{L(site.hours)}</p>
          ) : (
            <>
              <p className="mt-1 font-medium">{L(MINISTRY_HOURS.summer)}</p>
              <p className="font-medium">{L(MINISTRY_HOURS.winter)}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {t("hours_rule_note")}
              </p>
            </>
          )}
        </div>

        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Ticket className="h-3.5 w-3.5" /> {t("entry_fee")}
          </p>
          <p className="mt-1 font-medium">
            {free ? (
              t("free")
            ) : (
              <>
                {site.fee} ₺{" "}
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground">
                  {t("fee_indicative")}
                </span>
              </>
            )}
          </p>
          {!free && (
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {t("fee_indicative_note")} {t("museum_card")}
            </p>
          )}
        </div>

        <a
          href={OFFICIAL_INFO_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          {t("official_check")} <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </section>
  );
}
