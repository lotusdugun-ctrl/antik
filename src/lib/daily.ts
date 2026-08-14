import { buildQuestion, type Localize, type Question, type QuizMode, type Rng } from "@/lib/quiz";

/**
 * The daily challenge: the same five questions for everyone, everywhere.
 *
 * "Everyone" is the whole point — a result worth sharing has to be comparable,
 * so the questions cannot be drawn at random per visitor. They come instead
 * from a seeded generator keyed to the calendar day, which makes the set a
 * pure function of the date: no server, no storage, no coordination.
 *
 * The day is fixed in UTC rather than the visitor's local zone. A local day
 * would roll over at different moments around the world and briefly give two
 * players different puzzles while both believed it was the same date.
 */
export const DAILY_QUESTIONS = 5;

/** The rotation of rounds, so a day is never five of the same kind. */
const MODES: QuizMode[] = ["photo", "who", "map", "structure", "tf"];

/** Today's key, as YYYY-MM-DD in UTC. */
export function dayKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/**
 * mulberry32 — small, fast, and good enough that consecutive days do not
 * visibly rhyme. Any seeded generator would do; what matters is that it is
 * deterministic and lives here rather than in the caller.
 */
function seeded(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A stable 32-bit hash of the day key, used as the seed. */
function seedFor(day: string): number {
  let hash = 2166136261;
  for (let i = 0; i < day.length; i++) {
    hash ^= day.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * The five questions for a given day.
 *
 * `L` makes these language-dependent by design: a Turkish player is asked for
 * "Efes" and an English one for "Ephesus". The *subjects* stay identical
 * because the generator draws from the same seeded stream either way, so the
 * shared emoji result still compares like for like.
 */
export function dailyQuestions(L: Localize, day: string = dayKey()): Question[] {
  const rng = seeded(seedFor(day));
  const asked = new Set<string>();
  const questions: Question[] = [];

  for (let i = 0; i < DAILY_QUESTIONS; i++) {
    const question = buildQuestion(MODES[i % MODES.length]!, L, asked, rng);
    asked.add(question.slug);
    questions.push(question);
  }
  return questions;
}

/**
 * The shareable line: a date, a score and a row of squares.
 * No links and no answers — posting it must not spoil the day for the reader.
 */
export function shareText(options: {
  day: string;
  results: readonly boolean[];
  streak: number;
  title: string;
  streakLabel: string;
}): string {
  const squares = options.results.map((ok) => (ok ? "🟩" : "⬜")).join("");
  const score = options.results.filter(Boolean).length;
  const lines = [
    `${options.title} · ${options.day}`,
    `${score}/${options.results.length} ${squares}`,
  ];
  if (options.streak > 1) lines.push(`🔥 ${options.streak} ${options.streakLabel}`);
  return lines.join("\n");
}
