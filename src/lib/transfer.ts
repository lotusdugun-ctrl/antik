import type { ProgressState, Stamp, VisitEntry } from "@/lib/progress";

/**
 * Moving progress to another device without an account or a server.
 *
 * The whole record — minus the visit photos, which would make the link
 * megabytes long — is compressed into the fragment of a link (`#aktar=…`).
 * A fragment is never sent to any server, so the link carries the data from
 * one device to the other and nowhere else. The person sends it to themselves
 * however they like, or scans its QR code.
 */
export const TRANSFER_KEY = "aktar";
const VERSION = "1";

/*
 * The XP rules live here rather than in `progress.tsx` because merging has to
 * recompute XP from them, and this module must stay free of React so the
 * tests can import it; `progress.tsx` re-exports them for the UI.
 */
export const XP_PER_VISIT = 50;
export const XP_PER_CORRECT = 10;
/** On top of the visit itself: being there is worth more than ticking a box. */
export const XP_PER_STAMP = 25;

/** Every field of `T`, typed as unknown until it has been checked. */
type Unchecked<T> = { [K in keyof T]?: unknown };
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const finite = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : 0;
const strings = (value: unknown) =>
  Array.isArray(value) ? value.filter((x): x is string => typeof x === "string") : [];

/**
 * A progress record rebuilt field by field from untrusted JSON — the stored
 * record, a backup file or a transfer link. Spreading the parsed object over
 * the defaults used to let one wrong field (a `visits` array, an `xp` string)
 * through to code that assumes the type, which then threw on every render.
 * A wrong-typed field falls back to its default, and an entry missing a field
 * gets a safe value rather than being dropped, so no saved note or photo is lost.
 */
export function sanitizeState(raw: unknown): ProgressState {
  const input: Unchecked<ProgressState> = isRecord(raw) ? raw : {};
  const visits: Record<string, VisitEntry> = {};
  if (isRecord(input.visits)) {
    for (const [key, entry] of Object.entries(input.visits)) {
      if (!isRecord(entry)) continue;
      const value: Unchecked<VisitEntry> = entry;
      // Lenient on purpose: older records could lack `slug` or `date`, and
      // dropping such an entry would delete the note and photo it carries.
      visits[key] = {
        slug: typeof value.slug === "string" ? value.slug : key,
        date: typeof value.date === "string" ? value.date : "",
        ...(typeof value.note === "string" ? { note: value.note } : {}),
        ...(typeof value.photo === "string" ? { photo: value.photo } : {}),
      };
    }
  }
  const stamps: Record<string, Stamp> = {};
  if (isRecord(input.stamps)) {
    for (const [key, entry] of Object.entries(input.stamps)) {
      if (!isRecord(entry)) continue;
      const value: Unchecked<Stamp> = entry;
      stamps[key] = {
        slug: typeof value.slug === "string" ? value.slug : key,
        at: typeof value.at === "string" ? value.at : "",
        distance:
          typeof value.distance === "number" && Number.isFinite(value.distance)
            ? value.distance
            : 0,
      };
    }
  }
  return {
    visited: strings(input.visited),
    favorites: strings(input.favorites),
    recent: strings(input.recent),
    xp: finite(input.xp),
    gamesPlayed: finite(input.gamesPlayed),
    correctAnswers: finite(input.correctAnswers),
    visits,
    stamps,
  };
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text: string): Uint8Array {
  const b64 = text.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream) {
  const out = new Blob([bytes as BlobPart]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

/** What travels: everything but the photos. */
export function portable(state: ProgressState): ProgressState {
  const visits = Object.fromEntries(
    Object.entries(state.visits).map(([slug, visit]) => {
      const { photo: _photo, ...rest } = visit;
      return [slug, rest];
    }),
  );
  return { ...state, visits };
}

export async function encodeTransfer(state: ProgressState): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(portable(state)));
  const packed = await pipe(json, new CompressionStream("deflate-raw"));
  return `${VERSION}.${toBase64Url(packed)}`;
}

export async function decodeTransfer(code: string): Promise<ProgressState | null> {
  try {
    const [version, body] = code.split(".");
    if (version !== VERSION || !body) return null;
    const json = await pipe(fromBase64Url(body), new DecompressionStream("deflate-raw"));
    const state = JSON.parse(new TextDecoder().decode(json)) as { visited?: unknown };
    if (!Array.isArray(state?.visited)) return null;
    return sanitizeState(state);
  } catch {
    return null;
  }
}

const union = (a: string[], b: string[]) => [...new Set([...a, ...b])];

/** The XP a record earns from its visits and stamps alone. */
function derivedXp(state: Pick<ProgressState, "visited" | "stamps">) {
  return (
    new Set(state.visited).size * XP_PER_VISIT + Object.keys(state.stamps).length * XP_PER_STAMP
  );
}

/**
 * Two devices' records combined, losing nothing either had: lists are
 * unioned, a visit or stamp present on both keeps this device's (and its
 * photo), and the counters take the larger value rather than adding — adding
 * would double-count everything the two devices already share.
 *
 * XP is the exception: taking the larger total undercounts as soon as each
 * device has visits the other lacks. It is rebuilt instead — what the merged
 * visits and stamps are worth, plus the larger of the two devices' remainders
 * (the quiz XP, which cannot be told apart per question, so like the quiz
 * counters it takes the larger rather than the sum).
 */
export function mergeStates(here: ProgressState, incoming: ProgressState): ProgressState {
  const visits = { ...incoming.visits };
  for (const [slug, visit] of Object.entries(here.visits)) {
    const other = visits[slug];
    visits[slug] = { ...other, ...visit, note: visit.note ?? other?.note };
  }
  const visited = union(here.visited, incoming.visited);
  const stamps = { ...incoming.stamps, ...here.stamps };
  const remainder = Math.max(0, here.xp - derivedXp(here), incoming.xp - derivedXp(incoming));
  return {
    visited,
    favorites: union(here.favorites, incoming.favorites),
    recent: union(here.recent, incoming.recent).slice(0, 8),
    xp: derivedXp({ visited, stamps }) + remainder,
    gamesPlayed: Math.max(here.gamesPlayed, incoming.gamesPlayed),
    correctAnswers: Math.max(here.correctAnswers, incoming.correctAnswers),
    visits,
    stamps,
  };
}

export function transferLink(origin: string, code: string, lang: string): string {
  const query = lang === "tr" ? "" : `?lang=${lang}`;
  return `${origin}/profil${query}#${TRANSFER_KEY}=${code}`;
}
