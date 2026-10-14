import { Link } from "@tanstack/react-router";
import { Loader2, Share2, Stamp as StampIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { track } from "@/lib/analytics";
import { useI18n } from "@/lib/i18n";
import { checkStamp, drawPassportCard } from "@/lib/passport";
import { levelFromXp, useProgress } from "@/lib/progress";
import { getSite, type Site } from "@/lib/sites";

/** The "get a stamp" button on a city page. */
export function StampButton({ site }: { site: Site }) {
  const { t, lang } = useI18n();
  const { getStamp, addStamp } = useProgress();
  const [checking, setChecking] = useState(false);
  const stamp = getStamp(site.slug);

  if (stamp) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-gold bg-secondary px-5 py-2.5 text-sm font-semibold">
        <StampIcon className="h-4 w-4 text-gold" />
        {t("passport_stamped")} · {new Date(stamp.at).toLocaleDateString(lang)}
      </span>
    );
  }

  function request() {
    if (!("geolocation" in navigator)) {
      toast.error(t("passport_no_location"));
      return;
    }
    setChecking(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setChecking(false);
        const result = checkStamp(site, position.coords);
        if (result.ok) {
          addStamp(site.slug, result.distance);
          track("Passport stamp", { site: site.slug });
          toast.success(t("passport_stamp_ok"));
        } else {
          const km = (result.distance / 1000).toLocaleString(lang, {
            maximumFractionDigits: result.distance < 10_000 ? 1 : 0,
          });
          toast.message(t("passport_too_far").replace("{km}", km));
        }
      },
      () => {
        setChecking(false);
        toast.error(t("passport_no_location"));
      },
      { enableHighAccuracy: true, timeout: 20_000, maximumAge: 60_000 },
    );
  }

  return (
    <button
      onClick={request}
      disabled={checking}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold transition-colors hover:border-primary disabled:opacity-60"
    >
      {checking ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <StampIcon className="h-4 w-4 text-primary" />
      )}
      {checking ? t("passport_checking") : t("passport_stamp")}
    </button>
  );
}

const INKS = ["text-primary", "text-[#2f5d62]", "text-[#7a4e9a]", "text-[#3f6b2f]"];

/** The passport on the profile page: the stamps, and a card to share. */
export function PassportPanel() {
  const { t, L, lang } = useI18n();
  const { state, stampList, badges } = useProgress();
  const stamps = stampList();
  const [sharing, setSharing] = useState(false);

  async function share() {
    setSharing(true);
    try {
      await document.fonts?.ready;
      const canvas = drawPassportCard({
        appName: t("appName"),
        title: t("passport_title"),
        stamps: stamps.flatMap((stamp) => {
          const site = getSite(stamp.slug);
          return site
            ? [{ name: L(site.name), date: new Date(stamp.at).toLocaleDateString(lang) }]
            : [];
        }),
        stampCount: stamps.length,
        stampsLabel: t("passport_stamps"),
        visited: state.visited.length,
        visitedLabel: t("passport_card_visited"),
        badges: badges().filter((b) => b.earned).length,
        badgesLabel: t("passport_card_badges"),
        level: `${t("level")} ${levelFromXp(state.xp).level} · ${state.xp} XP`,
        url: window.location.host,
      });
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("canvas");
      const file = new File([blob], "antik-pasaport.png", { type: "image/png" });
      track("Passport shared");
      const download = () => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name;
        link.click();
        // Revoking straight after `click()` can cancel the download.
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      };
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: t("passport_title") });
        } catch (error) {
          // Safari wants the share sheet opened straight from the tap; after
          // the awaits above it may refuse with NotAllowedError. The card is
          // ready, so hand it over as a download instead of reporting failure.
          if (error instanceof DOMException && error.name === "NotAllowedError") download();
          else throw error;
        }
      } else {
        download();
      }
    } catch (error) {
      // Closing the share sheet is not an error worth reporting.
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        toast.error(t("offline_failed"));
      }
    } finally {
      setSharing(false);
    }
  }

  return (
    <section className="mt-8">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
          <StampIcon className="h-5 w-5 text-primary" /> {t("passport_title")}
          <span className="text-sm font-medium text-muted-foreground">
            · {stamps.length} {t("passport_stamps")}
          </span>
        </h2>
        <button
          onClick={share}
          disabled={sharing}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {sharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
          {t("passport_share")}
        </button>
      </div>
      <div className="rounded-2xl surface-panel p-5">
        <p className="text-sm text-muted-foreground">{t("passport_sub")}</p>
        {stamps.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            {t("passport_empty")}
          </p>
        ) : (
          <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {stamps.map((stamp, i) => {
              const site = getSite(stamp.slug);
              if (!site) return null;
              return (
                <li key={stamp.slug}>
                  <Link
                    to="/kent/$slug"
                    params={{ slug: site.slug }}
                    className={`mx-auto grid aspect-square max-w-[9rem] place-items-center rounded-full border-4 border-current p-3 text-center ${INKS[i % INKS.length]}`}
                    style={{ transform: `rotate(${((i * 37) % 17) - 8}deg)` }}
                  >
                    <span>
                      <span className="block font-display text-sm font-bold leading-tight">
                        {L(site.name)}
                      </span>
                      <span className="mt-1 block text-[10px] font-semibold opacity-80">
                        {new Date(stamp.at).toLocaleDateString(lang)}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
