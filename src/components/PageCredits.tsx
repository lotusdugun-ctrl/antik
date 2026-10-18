import { Camera } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { creditsFor } from "@/lib/photo-credits";
import { useShownPhotos } from "@/lib/shown-photos";

/**
 * "Photo credits on this page": author and licence of every photograph the
 * page is showing (cards, map pins, quiz pictures), behind one disclosure in
 * the footer — so a credit is always on the page where the photo appears,
 * one tap away, even where a card has no room for a caption.
 */
export function PageCredits() {
  const { t } = useI18n();
  const credits = creditsFor(useShownPhotos());
  if (credits.length === 0) return null;
  return (
    <details className="mx-auto mt-8 max-w-7xl text-xs text-muted-foreground">
      <summary className="inline-flex cursor-pointer items-center gap-1.5 font-medium text-foreground hover:underline">
        <Camera className="h-3.5 w-3.5" aria-hidden /> {t("credits_on_page")} ({credits.length})
      </summary>
      <ul className="mt-2 space-y-1">
        {credits.map((credit) => (
          <li key={credit.file}>
            <a href={credit.source} target="_blank" rel="noreferrer" className="hover:underline">
              {credit.file.replace(/_/g, " ")}
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
        ))}
      </ul>
      <p className="mt-2">
        <Link to="/gorseller" className="underline">
          {t("nav_credits")}
        </Link>
      </p>
    </details>
  );
}
