import type { ProgressState } from "@/lib/progress";

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
    const state = JSON.parse(new TextDecoder().decode(json)) as Partial<ProgressState>;
    if (!Array.isArray(state.visited)) return null;
    return {
      visited: state.visited,
      favorites: state.favorites ?? [],
      recent: state.recent ?? [],
      xp: state.xp ?? 0,
      gamesPlayed: state.gamesPlayed ?? 0,
      correctAnswers: state.correctAnswers ?? 0,
      visits: state.visits ?? {},
      stamps: state.stamps ?? {},
    };
  } catch {
    return null;
  }
}

const union = (a: string[], b: string[]) => [...new Set([...a, ...b])];

/**
 * Two devices' records combined, losing nothing either had: lists are
 * unioned, a visit or stamp present on both keeps this device's (and its
 * photo), and the counters take the larger value rather than adding — adding
 * would double-count everything the two devices already share.
 */
export function mergeStates(here: ProgressState, incoming: ProgressState): ProgressState {
  const visits = { ...incoming.visits };
  for (const [slug, visit] of Object.entries(here.visits)) {
    const other = visits[slug];
    visits[slug] = { ...other, ...visit, note: visit.note ?? other?.note };
  }
  return {
    visited: union(here.visited, incoming.visited),
    favorites: union(here.favorites, incoming.favorites),
    recent: union(here.recent, incoming.recent).slice(0, 8),
    xp: Math.max(here.xp, incoming.xp),
    gamesPlayed: Math.max(here.gamesPlayed, incoming.gamesPlayed),
    correctAnswers: Math.max(here.correctAnswers, incoming.correctAnswers),
    visits,
    stamps: { ...incoming.stamps, ...here.stamps },
  };
}

export function transferLink(origin: string, code: string, lang: string): string {
  const query = lang === "tr" ? "" : `?lang=${lang}`;
  return `${origin}/profil${query}#${TRANSFER_KEY}=${code}`;
}
