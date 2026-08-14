import { Camera } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { creditsFor } from "@/lib/photo-credits";

/**
 * The attribution block for every photo shown on a page.
 *
 * Nearly all of these images are CC BY or CC BY-SA, which means naming the
 * author and the licence is a condition of using them at all. Crediting each
 * thumbnail in place would drown the layout, so a page lists its photographs
 * once, together, and links each back to its Commons description page — the
 * form Commons itself recommends for a page that shows many images.
 */
export function PhotoCredits({ urls, className }: { urls: readonly string[]; className?: string }) {
  const { t } = useI18n();
  const credits = creditsFor(urls);
  if (credits.length === 0) return null;

  return (
    <section className={className}>
      <h2 className="flex items-center gap-2 font-display text-base font-semibold">
        <Camera className="h-4 w-4 text-muted-foreground" /> {t("credits")}
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t("credits_sub")}</p>
      <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
        {credits.map((credit) => (
          <li key={credit.file}>
            <a
              href={credit.source}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground hover:underline"
            >
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
    </section>
  );
}
