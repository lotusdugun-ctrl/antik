/**
 * Weather and the passing of the day, for the 3D view.
 *
 * The weather is light and cheap on purpose — a few drifting clouds, a
 * morning mist lying in a valley, dust blown off a bare summit — and which
 * one a model gets follows where it stands: Nemrut's summit is bare rock and
 * wind, the Black Sea valleys wake up in mist, the coast has clouds going
 * over. The day is the three lights the viewer already has (day, golden,
 * night) eased into one another round a slow loop.
 */

export type Weather = "clear" | "clouds" | "mist" | "dust";
export type Light = "day" | "golden" | "night";

/** Where a model stands, as far as the weather cares. */
export type Setting = {
  id: string;
  siteSlug: string;
  biome: string;
  kind: string;
};

const MISTY =
  /sumela|trabzon|trapezous|pontic|pontus|karadeniz|amasra|amastris|zigana|rize|artvin|giresun|ordu|samsun|amisos|sinop|sinope/i;

/** The weather a model opens with, when the visitor turns weather on. */
export function defaultWeather(setting: Setting): Weather {
  if (
    setting.biome === "forest" ||
    setting.biome === "pontic" ||
    MISTY.test(`${setting.id} ${setting.siteSlug}`)
  )
    return "mist";
  if (setting.biome === "mountain") return "dust";
  if (setting.biome === "steppe") return setting.kind === "neolithic-enclosure" ? "dust" : "clouds";
  return "clouds";
}

/** Seconds for the day to go round once, day to night and back. */
export const DAY_LOOP_SECONDS = 180;

/**
 * Which two lights the scene is between at a point of the loop (0..1), and
 * how far from the first to the second: a long day, a golden evening, a long
 * night, a golden dawn, and day again.
 */
export function timeOfDay(phase: number): { from: Light; to: Light; f: number } {
  const p = ((phase % 1) + 1) % 1;
  const ease = (t: number) => t * t * (3 - 2 * t);
  const span = (a: number, b: number) => ease((p - a) / (b - a));
  if (p < 0.3) return { from: "day", to: "day", f: 0 };
  if (p < 0.42) return { from: "day", to: "golden", f: span(0.3, 0.42) };
  if (p < 0.55) return { from: "golden", to: "night", f: span(0.42, 0.55) };
  if (p < 0.78) return { from: "night", to: "night", f: 0 };
  if (p < 0.88) return { from: "night", to: "golden", f: span(0.78, 0.88) };
  return { from: "golden", to: "day", f: span(0.88, 1) };
}

/** Where on the loop a light sits, so the loop starts from the light already chosen. */
export function phaseOf(light: Light): number {
  return light === "day" ? 0 : light === "golden" ? 0.42 : 0.62;
}

/** The light the loop is nearest to, for the light switch to show. */
export function nearestLight(phase: number): Light {
  const { from, to, f } = timeOfDay(phase);
  return f < 0.5 ? from : to;
}
