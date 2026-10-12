/**
 * Privacy-friendly usage counts, off unless configured.
 *
 * Set `VITE_ANALYTICS_DOMAIN` (the site's domain as registered with
 * Plausible, or a self-hosted Plausible/Umami-compatible endpoint via
 * `VITE_ANALYTICS_SRC`) in the hosting environment and page views start
 * being counted — cookieless, no personal data, so no consent banner. Left
 * unset, nothing is loaded and `track()` does nothing.
 */
const domain = import.meta.env["VITE_ANALYTICS_DOMAIN"] as string | undefined;
const src =
  (import.meta.env["VITE_ANALYTICS_SRC"] as string | undefined) ??
  "https://plausible.io/js/script.tagged-events.js";

export function analyticsScripts() {
  if (!domain) return [];
  return [{ src, defer: true, "data-domain": domain }];
}

type Plausible = (event: string, options?: { props?: Record<string, string | number> }) => void;

/**
 * Count one event: "Guide played", "AR started", "Story ended", ...
 * Props are labels like a site slug or a language — never anything about
 * the person.
 */
export function track(event: string, props?: Record<string, string | number>) {
  if (typeof window === "undefined") return;
  const plausible = (window as unknown as { plausible?: Plausible }).plausible;
  plausible?.(event, props ? { props } : undefined);
}
