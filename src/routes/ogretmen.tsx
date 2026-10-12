import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap, Plus, Printer, RefreshCw, X } from "lucide-react";
import { useMemo, useState } from "react";
import { collections, collectionSites } from "@/lib/collections";
import { civilizations } from "@/lib/civilizations";
import { sitesOf } from "@/lib/history";
import { parseLang, translate, useI18n } from "@/lib/i18n";
import { seoTags } from "@/lib/seo";
import { getSite, regions, sites, sitesByRegion, type RegionId, type Site } from "@/lib/sites";
import { readingFor, tripOrder, worksheetQuestions } from "@/lib/worksheet";

const MAX_SITES = 10;

export const Route = createFileRoute("/ogretmen")({
  head: ({ match }) => {
    const lang = parseLang(match.search.lang);
    return seoTags({
      lang,
      pathname: "/ogretmen",
      title: `${translate("teacher_title", lang)} | ${translate("appName", lang)}`,
      description: translate("teacher_sub", lang),
    });
  },
  component: TeacherPage,
});

/** A ready-made set: `kind:id`, e.g. "region:ege", "collection:unesco". */
function setSites(key: string): Site[] {
  const [kind, id] = key.split(":");
  if (kind === "region") return sitesByRegion(id as RegionId);
  if (kind === "collection") {
    const c = collections.find((x) => x.id === id);
    return c ? collectionSites(c) : [];
  }
  if (kind === "civ") {
    const c = civilizations.find((x) => x.id === id);
    return c ? sitesOf(c) : [];
  }
  return [];
}

const LETTERS = ["A", "B", "C", "D"];

function TeacherPage() {
  const { t, L, lang } = useI18n();
  const [chosen, setChosen] = useState<string[]>(["efes", "milet", "priene"]);
  const [perSite, setPerSite] = useState(2);
  const [withKey, setWithKey] = useState(true);
  const [withTrip, setWithTrip] = useState(true);
  const [withReading, setWithReading] = useState(true);
  const [seed, setSeed] = useState(1);
  const [title, setTitle] = useState("");
  const [adding, setAdding] = useState("");

  const list = chosen.map(getSite).filter((s): s is Site => s !== undefined);
  const questions = useMemo(
    () => worksheetQuestions(list, perSite, lang, seed),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chosen.join(","), perSite, lang, seed],
  );
  const trip = useMemo(() => tripOrder(list), [chosen.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps
  const totalKm = trip.reduce((sum, stop) => sum + stop.km, 0);

  function applySet(key: string) {
    if (!key) return;
    // The most visited first, so a big region still yields a sensible sheet.
    const picked = [...setSites(key)]
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, MAX_SITES);
    setChosen(picked.map((s) => s.slug));
  }

  function add(name: string) {
    const site = sites.find(
      (s) => L(s.name).toLocaleLowerCase(lang) === name.toLocaleLowerCase(lang),
    );
    if (site && !chosen.includes(site.slug) && chosen.length < MAX_SITES) {
      setChosen([...chosen, site.slug]);
      setAdding("");
    }
  }

  const sheetTitle = title.trim() || t("teacher_default_title");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 print:max-w-none print:p-0">
      {/* ——— Controls (not printed) ——— */}
      <div className="print:hidden">
        <h1 className="flex items-center gap-2 font-display text-3xl font-semibold sm:text-4xl">
          <GraduationCap className="h-8 w-8 text-primary" /> {t("teacher_title")}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{t("teacher_sub")}</p>

        <div className="mt-6 grid gap-4 rounded-2xl surface-panel p-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("teacher_set")}
            </span>
            <select
              defaultValue=""
              onChange={(e) => applySet(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm"
            >
              <option value="">{t("teacher_set_pick")}</option>
              <optgroup label={t("nav_regions")}>
                {regions.map((r) => (
                  <option key={r.id} value={`region:${r.id}`}>
                    {L(r.name)}
                  </option>
                ))}
              </optgroup>
              <optgroup label={t("collections_title")}>
                {collections.map((c) => (
                  <option key={c.id} value={`collection:${c.id}`}>
                    {L(c.title)}
                  </option>
                ))}
              </optgroup>
              <optgroup label={t("nav_history")}>
                {civilizations.map((c) => (
                  <option key={c.id} value={`civ:${c.id}`}>
                    {L(c.name)}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("teacher_add")} ({chosen.length}/{MAX_SITES})
            </span>
            <div className="flex gap-2">
              <input
                list="teacher-sites"
                value={adding}
                onChange={(e) => setAdding(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && add(adding)}
                className="h-10 min-w-0 flex-1 rounded-xl border border-border bg-card px-3 text-sm"
              />
              <datalist id="teacher-sites">
                {sites.map((s) => (
                  <option key={s.slug} value={L(s.name)} />
                ))}
              </datalist>
              <button
                onClick={() => add(adding)}
                aria-label={t("teacher_add")}
                className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </label>

          <div className="md:col-span-2 flex flex-wrap gap-2">
            {list.map((site) => (
              <span
                key={site.slug}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-card py-1 pl-3 pr-1 text-sm"
              >
                {L(site.name)}
                <button
                  onClick={() => setChosen(chosen.filter((s) => s !== site.slug))}
                  aria-label={`${t("visit_delete")}: ${L(site.name)}`}
                  className="grid h-6 w-6 place-items-center rounded-full hover:bg-secondary"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>

          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("teacher_sheet_title")}
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("teacher_default_title")}
              className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm"
            />
          </label>

          <div className="flex flex-wrap items-center gap-4 text-sm md:col-span-2">
            <label className="flex items-center gap-2">
              {t("teacher_per_site")}
              <select
                value={perSite}
                onChange={(e) => setPerSite(Number(e.target.value))}
                className="h-9 rounded-lg border border-border bg-card px-2"
              >
                {[0, 1, 2, 3].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
            {(
              [
                [withReading, setWithReading, "teacher_reading"],
                [withTrip, setWithTrip, "teacher_trip"],
                [withKey, setWithKey, "teacher_key"],
              ] as const
            ).map(([value, set, key]) => (
              <label key={key} className="flex items-center gap-2">
                <input type="checkbox" checked={value} onChange={(e) => set(e.target.checked)} />
                {t(key)}
              </label>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 md:col-span-2">
            <button
              onClick={() => window.print()}
              disabled={list.length === 0}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              <Printer className="h-4 w-4" /> {t("teacher_print")}
            </button>
            <button
              onClick={() => setSeed((s) => s + 1)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold"
            >
              <RefreshCw className="h-4 w-4" /> {t("teacher_new_questions")}
            </button>
          </div>
        </div>

        <h2 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("teacher_preview")}
        </h2>
      </div>

      {/* ——— The sheet ——— */}
      <article className="worksheet rounded-2xl border border-border bg-white p-8 text-[#1f1a15] shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <header className="border-b-2 border-[#1f1a15] pb-3">
          <h1 className="font-display text-2xl font-semibold">{sheetTitle}</h1>
          <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
            <span>{t("teacher_name")}: ____________________</span>
            <span>{t("teacher_class")}: __________</span>
            <span>{t("teacher_date")}: __________</span>
          </div>
        </header>

        {withReading && (
          <section className="mt-5 space-y-4">
            {list.map((site) => {
              const reading = readingFor(site, lang);
              return (
                <div key={site.slug} className="break-inside-avoid">
                  <h2 className="font-display text-lg font-semibold">
                    {L(site.name)}{" "}
                    <span className="text-sm font-normal text-[#5b5047]">
                      · {L(site.province)} · {L(site.era)}
                    </span>
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed">{reading.history}</p>
                  {reading.fact && (
                    <p className="mt-1 text-sm italic leading-relaxed text-[#5b5047]">
                      {t("did_you_know")} {reading.fact}
                    </p>
                  )}
                </div>
              );
            })}
          </section>
        )}

        {withTrip && trip.length > 1 && (
          <section className="mt-6 break-inside-avoid">
            <h2 className="font-display text-lg font-semibold">{t("teacher_trip")}</h2>
            <ol className="mt-2 list-decimal space-y-0.5 pl-5 text-sm">
              {trip.map((stop, i) => (
                <li key={stop.site.slug}>
                  {L(stop.site.name)} ({L(stop.site.province)})
                  {i > 0 && ` — ~${stop.km} ${t("route_km")}`}
                </li>
              ))}
            </ol>
            <p className="mt-1 text-xs text-[#5b5047]">
              {t("teacher_trip_total")}: ~{totalKm} {t("route_km")} · {t("teacher_trip_note")}
            </p>
          </section>
        )}

        {questions.length > 0 && (
          <section className="mt-6">
            <h2 className="font-display text-lg font-semibold">{t("teacher_questions")}</h2>
            <ol className="mt-2 space-y-3 text-sm">
              {questions.map((q, i) => (
                <li key={`${q.site}-${i}`} className="break-inside-avoid">
                  <p className="font-medium">
                    {i + 1}. {q.prompt}
                  </p>
                  <div className="mt-1 grid grid-cols-2 gap-x-6 gap-y-0.5 pl-4">
                    {q.options.map((option, j) => (
                      <span key={option}>
                        {LETTERS[j]}) {option}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-5 break-inside-avoid">
              <p className="font-medium text-sm">{t("teacher_open")}</p>
              <div className="mt-2 space-y-5">
                {[0, 1, 2].map((n) => (
                  <div key={n} className="border-b border-dashed border-[#8a7f75]" />
                ))}
              </div>
            </div>
          </section>
        )}

        {withKey && questions.length > 0 && (
          <section className="mt-8 border-t border-dashed border-[#8a7f75] pt-4 print:break-before-page">
            <h2 className="font-display text-base font-semibold">{t("teacher_key")}</h2>
            <p className="mt-1 text-sm">
              {questions.map((q, i) => `${i + 1}-${LETTERS[q.answer]}`).join("   ")}
            </p>
          </section>
        )}

        <footer className="mt-8 text-[10px] text-[#8a7f75]">
          {t("appName")} · {t("teacher_footer")}
        </footer>
      </article>
    </div>
  );
}
