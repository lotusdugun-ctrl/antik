import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { useMemo, useState } from "react";
import { SiteCard } from "@/components/SiteCard";
import { SiteMap } from "@/components/SiteMap";
import { civilizations } from "@/lib/civilizations";
import {
  civilizationsAt,
  formatYear,
  posToYear,
  sitesAt,
  TIMELINE_END,
  TIMELINE_START,
  TIMELINE_TICKS,
  yearToPos,
} from "@/lib/history";
import { parseLang, translate, useI18n } from "@/lib/i18n";
import { seoTags } from "@/lib/seo";

const DEFAULT_YEAR = -500;
const SLIDER_STEPS = 1000;
const SHOWN = 12;

export const Route = createFileRoute("/zaman-cizelgesi")({
  // The chosen year lives in the address, so "Anatolia in 500 BCE" can be shared.
  validateSearch: (search: Record<string, unknown>): { yil?: number | undefined } => {
    const raw = Number(search["yil"]);
    return Number.isFinite(raw) && raw >= TIMELINE_START && raw <= TIMELINE_END
      ? { yil: Math.round(raw) }
      : {};
  },
  head: ({ match }) => {
    const lang = parseLang(match.search.lang);
    return seoTags({
      lang,
      pathname: "/zaman-cizelgesi",
      title: translate("seo_timeline_title", lang),
      description: translate("timeline_sub", lang),
    });
  },
  component: TimelinePage,
});

/*
 * Lanes: civilizations that overlap in time go on separate rows, so the bars
 * never cover each other. Greedy, oldest first — good enough for thirty bars.
 */
function lanes() {
  const ends: number[] = [];
  return civilizations.map((civ) => {
    let lane = ends.findIndex((end) => end < civ.start);
    if (lane === -1) lane = ends.length;
    ends[lane] = civ.end;
    return { civ, lane };
  });
}

const PALETTE = ["#a4472c", "#2f5d62", "#7a4e9a", "#3f6b2f", "#b07a1a", "#4a5f9c"];

function TimelinePage() {
  const { t, L, lang } = useI18n();
  const navigate = useNavigate({ from: "/zaman-cizelgesi" });
  const search = Route.useSearch();
  const [year, setYear] = useState(search.yil ?? DEFAULT_YEAR);
  const [showAll, setShowAll] = useState(false);

  const rows = useMemo(lanes, []);
  const laneCount = Math.max(...rows.map((r) => r.lane)) + 1;
  const active = civilizationsAt(year);
  const list = useMemo(() => sitesAt(year), [year]);
  const pos = yearToPos(year);

  function commit(next: number) {
    setYear(next);
    setShowAll(false);
    navigate({ search: (prev) => ({ ...prev, yil: next }), replace: true });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6 max-w-3xl">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">{t("nav_timeline")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("timeline_sub")}</p>
      </header>

      <section className="rounded-2xl surface-panel p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t("timeline_year")}
          </span>
          <span className="font-display text-3xl font-semibold text-primary" aria-live="polite">
            {formatYear(year, lang)}
          </span>
        </div>

        {/* Bars, scrollable sideways on a phone so the names stay legible. */}
        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <div className="relative min-w-[720px]">
            <div className="relative" style={{ height: laneCount * 30 }}>
              {rows.map(({ civ, lane }, i) => {
                const left = yearToPos(civ.start) * 100;
                const width = Math.max(0.8, (yearToPos(civ.end) - yearToPos(civ.start)) * 100);
                const on = civ.start <= year && year <= civ.end;
                return (
                  <Link
                    key={civ.id}
                    to="/medeniyet/$id"
                    params={{ id: civ.id }}
                    title={`${L(civ.name)} · ${L(civ.periodLabel)}`}
                    className="absolute flex h-6 items-center overflow-hidden rounded-md px-1.5 text-[11px] font-semibold text-white transition-opacity"
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      top: lane * 30,
                      background: PALETTE[i % PALETTE.length],
                      opacity: on ? 1 : 0.35,
                    }}
                  >
                    <span className="truncate">{L(civ.name)}</span>
                  </Link>
                );
              })}
              <div
                className="pointer-events-none absolute inset-y-0 w-0.5 bg-foreground"
                style={{ left: `${pos * 100}%` }}
              />
            </div>
            <div className="relative mt-2 h-4 text-[10px] text-muted-foreground">
              {TIMELINE_TICKS.map((tick) => (
                <span
                  key={tick}
                  className={`absolute whitespace-nowrap ${
                    tick === TIMELINE_END ? "-translate-x-full" : "-translate-x-1/2"
                  }`}
                  style={{ left: `${yearToPos(tick) * 100}%` }}
                >
                  {formatYear(tick, lang)}
                </span>
              ))}
            </div>
          </div>
        </div>

        <input
          type="range"
          min={0}
          max={SLIDER_STEPS}
          value={Math.round(pos * SLIDER_STEPS)}
          onChange={(e) => commit(posToYear(Number(e.target.value) / SLIDER_STEPS))}
          aria-label={t("timeline_year")}
          aria-valuetext={formatYear(year, lang)}
          className="mt-4 w-full accent-primary"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[-7000, -1300, -500, 150, 1200, 1550].map((preset) => (
            <button
              key={preset}
              onClick={() => commit(preset)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                preset === year
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {formatYear(preset, lang)}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("timeline_active")}
        </h2>
        {active.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("timeline_none")}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {active.map((civ) => (
              <Link
                key={civ.id}
                to="/medeniyet/$id"
                params={{ id: civ.id }}
                className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-semibold hover:border-primary"
              >
                {L(civ.name)}
              </Link>
            ))}
          </div>
        )}
      </section>

      {list.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-display text-xl font-semibold">
            {t("timeline_sites")} · {list.length}
          </h2>
          <SiteMap sites={list} height="380px" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {(showAll ? list : list.slice(0, SHOWN)).map((site) => (
              <SiteCard key={site.slug} site={site} />
            ))}
          </div>
          {!showAll && list.length > SHOWN && (
            <div className="mt-5 text-center">
              <button
                onClick={() => setShowAll(true)}
                className="rounded-full border border-border bg-card px-5 py-2 text-sm font-semibold hover:border-primary"
              >
                {t("timeline_more")} ({list.length})
              </button>
            </div>
          )}
        </section>
      )}

      <p className="mt-8 flex max-w-3xl items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {t("timeline_note")}
      </p>
    </div>
  );
}
