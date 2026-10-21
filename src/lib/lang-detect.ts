import type { Lang } from "@/lib/i18n";

/**
 * Picking the first language for a visitor who has not chosen one.
 *
 * The device's own language says best what someone reads; the country the
 * request comes from (Vercel's `x-vercel-ip-country`) is the fallback for a
 * phone set to a language the app does not have — a Kazakh phone reads
 * Russian, an Austrian one German. A visitor's own choice, once made, always
 * wins, and a shared `?lang=` link is never overridden.
 */

/** Where a visitor's explicit choice is kept. */
export const LANG_CHOICE_KEY = "antik.lang";

/** The app's language for one BCP-47 tag, or null when it has none of its own. */
export function langFromTag(tag: string): Lang | null {
  const primary = tag.trim().toLowerCase().split(/[-_]/)[0] ?? "";
  if (primary === "tr" || primary === "az") return "tr";
  if (primary === "de") return "de";
  // Russian, and the languages of countries where Russian is widely read.
  if (primary === "ru" || primary === "be" || primary === "kk" || primary === "ky") return "ru";
  if (primary === "en") return "en";
  return null;
}

/** The first of the device's languages the app speaks. */
export function langFromLocales(tags: readonly string[]): Lang | null {
  for (const tag of tags) {
    const lang = langFromTag(tag);
    if (lang) return lang;
  }
  return null;
}

const BY_COUNTRY: Record<string, Lang> = {
  TR: "tr",
  AZ: "tr",
  DE: "de",
  AT: "de",
  CH: "de",
  LI: "de",
  LU: "de",
  RU: "ru",
  BY: "ru",
  KZ: "ru",
  KG: "ru",
};

/**
 * The language for a country code. A phone in a language the app lacks, in
 * Türkiye, is most likely a visitor's: English serves them better than
 * Turkish, so Türkiye only counts when the device gave no language at all.
 */
export function langFromCountry(country: string | null | undefined, hadLocales: boolean): Lang {
  const lang = BY_COUNTRY[(country ?? "").toUpperCase()];
  if (!lang) return "en";
  if (lang === "tr" && hadLocales) return "en";
  return lang;
}

/** Search engines get the default language and its canonical URL, never a redirect. */
export function isBot(userAgent: string): boolean {
  return /bot|crawl|spider|slurp|preview|lighthouse/i.test(userAgent);
}

/** Read a stored choice; storage can throw in private modes. */
export function storedLang(): Lang | null {
  try {
    const value = window.localStorage.getItem(LANG_CHOICE_KEY);
    return value === "tr" || value === "en" || value === "de" || value === "ru" ? value : null;
  } catch {
    return null;
  }
}

export function storeLang(lang: Lang) {
  try {
    window.localStorage.setItem(LANG_CHOICE_KEY, lang);
  } catch {
    // Not kept; detection simply runs again next time.
  }
}
