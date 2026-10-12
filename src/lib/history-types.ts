import type { Localized } from "@/lib/i18n";

/**
 * Years are astronomical-ish integers: negative is BCE, positive CE
 * (-546 = 546 BCE). There is no year 0 in the calendar, but nothing here is
 * precise enough for that to matter, and it keeps the timeline arithmetic
 * plain. Prehistoric dates are rounded, and say so in `periodLabel`.
 */
export type Source = { title: string; url: string };

export type Civilization = {
  /** URL slug, ASCII: "hitit", "urartu". */
  id: string;
  name: Localized;
  /**
   * The values of `Site.civilizations` this entry stands for, exactly as they
   * appear in the data (Turkish): ["Hitit"], ["Selçuklu"].
   */
  matches: string[];
  /** Span shown on the timeline. */
  start: number;
  end: number;
  /** The span as people write it: "MÖ 1650 – MÖ 1180 dolayları". */
  periodLabel: Localized;
  /** Where the centre of power was, if there was one. */
  capital?: Localized;
  /** Two or three sentences. */
  summary: Localized;
  /** Three or four short facts, one sentence each. */
  highlights: Localized[];
  sources: Source[];
};

export type Person = {
  /** URL slug, ASCII: "buyuk-iskender". */
  id: string;
  name: Localized;
  /** The values of `Site.figures` this person appears as, exactly. */
  matches: string[];
  /** Birth and death, or the best-known span of activity. */
  start: number;
  end: number;
  lifeLabel: Localized;
  /** One line: "Makedon kralı", "Milet'li filozof". */
  role: Localized;
  /** Three or four sentences. */
  bio: Localized;
  /** Civilization ids from `civilizations.ts` this person belongs to. */
  civilizations: string[];
  sources: Source[];
};
