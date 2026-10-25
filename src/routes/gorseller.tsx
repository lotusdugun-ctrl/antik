import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Camera, ExternalLink } from "lucide-react";
import { parseLang, translate, useI18n, pick } from "@/lib/i18n";
import { voiceCreditsByLang } from "@/lib/audio-manifest";
import { creditsFor, photoCredits } from "@/lib/photo-credits";
import { CARVINGS } from "@/lib/reconstruction-parts";
import { SCANS } from "@/lib/scans";
import { structurePhotos } from "@/lib/structure-photos";
import { seoTags } from "@/lib/seo";
import { siteGallery } from "@/lib/site-details";
import { structureInfo } from "@/lib/structures";
import { coverImage, ownRenders, sites } from "@/lib/sites";

export const Route = createFileRoute("/gorseller")({
  head: ({ match }) => {
    const lang = parseLang(match.search.lang);
    return seoTags({
      lang,
      pathname: "/gorseller",
      title: translate("seo_credits_title", lang),
      description: translate("seo_credits_desc", lang),
    });
  },
  component: CreditsPage,
});

/**
 * Site-wide attribution.
 *
 * A city page credits the photos it shows, but a photo also appears on cards,
 * on the map and in the games, where a caption has nowhere to live. This page
 * is the address those uses point at, and it is linked from the footer so the
 * credit is reachable from anywhere a photo is.
 */
function CreditsPage() {
  const { t, L, lang } = useI18n();

  const perSite = useMemo(
    () =>
      [...sites]
        .sort((a, b) => pick(a.name, lang).localeCompare(pick(b.name, lang), lang))
        .map((site) => ({
          slug: site.slug,
          name: pick(site.name, lang),
          credits: creditsFor([coverImage(site), ...(siteGallery[site.slug] ?? [])]),
        }))
        .filter((entry) => entry.credits.length > 0),
    [lang],
  );

  // Structure photos live in their own map and are reused across cities, so
  // they would otherwise be credited under whichever city you happened to open.
  const structureOnly = useMemo(() => {
    const alreadyListed = new Set(perSite.flatMap((e) => e.credits.map((c) => c.file)));
    return creditsFor(
      [
        ...Object.values(structureInfo).map((info) => info?.image),
        ...Object.values(structurePhotos),
      ].filter((url): url is string => typeof url === "string"),
    ).filter((credit) => !alreadyListed.has(credit.file));
  }, [perSite]);

  // Photographs laid on the 3D models as carved relief.
  const textures = useMemo(() => creditsFor(Object.values(CARVINGS).map((c) => c.url)), []);
  const scans = useMemo(() => {
    const seen = new Set<string>();
    return Object.values(SCANS).filter((scan) => {
      if (seen.has(scan.source)) return false;
      seen.add(scan.source);
      return true;
    });
  }, []);
  const voices = Object.entries(voiceCreditsByLang);

  const total = Object.keys(photoCredits).length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <header>
        <h1 className="flex items-center gap-2.5 font-display text-3xl font-semibold sm:text-4xl">
          <Camera className="h-7 w-7 text-primary" /> {t("credits")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {t("credits_page_sub")}
        </p>
        <p className="mt-1 text-sm font-medium">
          {total} {t("credits_count")}
        </p>
      </header>

      <div className="mt-8 space-y-8">
        {/* Not photographs, and not from Commons: the bundled images are our
            own renders, and saying so is the whole of their credit. */}
        <section>
          <h2 className="font-display text-lg font-semibold">{t("credits_renders")}</h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground">
            {t("credits_renders_sub")}
          </p>
          <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
            {ownRenders.map((render) => (
              <li key={render.src}>
                <a
                  href={render.src}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-foreground hover:underline"
                >
                  {L(render.title)}
                </a>{" "}
                — {t("credits_own_render")}
              </li>
            ))}
          </ul>
        </section>

        {perSite.map((entry) => (
          <section key={entry.slug}>
            <h2 className="font-display text-lg font-semibold">
              <Link to="/kent/$slug" params={{ slug: entry.slug }} className="hover:underline">
                {entry.name}
              </Link>
            </h2>
            <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
              {entry.credits.map((credit) => (
                <CreditRow key={credit.file} credit={credit} />
              ))}
            </ul>
          </section>
        ))}

        {structureOnly.length > 0 && (
          <section>
            <h2 className="font-display text-lg font-semibold">{t("structures")}</h2>
            <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
              {structureOnly.map((credit) => (
                <CreditRow key={credit.file} credit={credit} />
              ))}
            </ul>
          </section>
        )}

        {textures.length > 0 && (
          <section>
            <h2 className="font-display text-lg font-semibold">{t("credits_textures")}</h2>
            <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
              {textures.map((credit) => (
                <CreditRow key={credit.file} credit={credit} />
              ))}
            </ul>
          </section>
        )}

        <section>
          <h2 className="font-display text-lg font-semibold">{t("credits_scans")}</h2>
          <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
            {scans.map((scan) => (
              <li key={scan.source}>
                <a
                  href={scan.source}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-foreground hover:underline"
                >
                  {L(scan.title)}
                </a>{" "}
                — {scan.author} ·{" "}
                <a
                  href={scan.licenseUrl}
                  target="_blank"
                  rel="noreferrer license"
                  className="hover:underline"
                >
                  {scan.license === "Free archive" ? t("credits_free_archive") : scan.license}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold">{t("credits_sound")}</h2>
          <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
            {voices.length === 0 && <li>{t("credits_voices_device")}</li>}
            {voices.map(([lang, voice]) =>
              voice ? (
                <li key={lang}>
                  <span className="font-medium text-foreground">
                    {lang.toUpperCase()} — Piper: {voice.voice}
                  </span>{" "}
                  — {voice.dataset} ·{" "}
                  {voice.licenseUrl ? (
                    <a
                      href={voice.licenseUrl}
                      target="_blank"
                      rel="noreferrer license"
                      className="hover:underline"
                    >
                      {voice.license}
                    </a>
                  ) : (
                    voice.license
                  )}{" "}
                  ·{" "}
                  <a href={voice.card} target="_blank" rel="noreferrer" className="hover:underline">
                    {t("credits_model_card")}
                  </a>
                </li>
              ) : null,
            )}
            {voices.length > 0 && <li>{t("credits_voices_other")}</li>}
            <li>
              {t("ambience_credit")}{" "}
              <a
                href="/ambience/CREDITS.txt"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                {t("ambience_credit_all")}
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold">{t("credits_other")}</h2>
          <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
            <li>
              {t("credits_map")}{" "}
              <a
                href="https://openfreemap.org"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                OpenFreeMap
              </a>{" "}
              <a
                href="https://www.openmaptiles.org/"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                © OpenMapTiles
              </a>{" "}
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                © OpenStreetMap
              </a>
            </li>
            <li>{t("credits_fonts")}</li>
            <li>
              <a
                href="/third-party-notices.txt"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                {t("credits_software")}
              </a>
            </li>
            <li>{t("recon_face_credit")}</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function CreditRow({ credit }: { credit: ReturnType<typeof creditsFor>[number] }) {
  return (
    <li>
      <a
        href={credit.source}
        target="_blank"
        rel="noreferrer"
        className="font-medium text-foreground hover:underline"
      >
        {credit.file.replace(/_/g, " ")}
        <ExternalLink className="ml-1 inline h-3 w-3 align-[-1px]" />
      </a>{" "}
      — {credit.author} ·{" "}
      {credit.licenseUrl ? (
        <a
          href={credit.licenseUrl}
          target="_blank"
          rel="noreferrer license"
          className="hover:underline"
        >
          {credit.license}
        </a>
      ) : (
        credit.license
      )}
    </li>
  );
}
