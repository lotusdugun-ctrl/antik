/**
 * Reports on the AI guide's answers ("Bildir"), as Google Play's policy on
 * AI-generated content requires: a user must be able to flag an offensive or
 * wrong answer from inside the app.
 *
 * A report goes to POST /api/rapor, which writes one structured line to the
 * server log (no database, no third-party service). Only what is needed to
 * review the answer is kept: the reason, an optional note, the site, the
 * language and short excerpts of the question and the answer — no IP
 * address, no identifier.
 */
export const REPORT_REASONS = ["offensive", "wrong", "other"] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const MAX_REPORT_NOTE = 500;
export const MAX_REPORT_QUESTION = 500;
export const MAX_REPORT_ANSWER = 1500;

export type ReportRequest = {
  reason: ReportReason;
  note: string;
  question: string;
  answer: string;
  lang: "tr" | "en" | "de" | "ru";
  slug?: string | undefined;
};

const clip = (value: unknown, max: number) =>
  typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";

export function validateReportBody(
  body: unknown,
): { ok: true; value: ReportRequest } | { ok: false } {
  if (!body || typeof body !== "object") return { ok: false };
  const b = body as Record<string, unknown>;
  if (!REPORT_REASONS.includes(b["reason"] as ReportReason)) return { ok: false };
  const lang = ["tr", "en", "de", "ru"].includes(b["lang"] as string)
    ? (b["lang"] as ReportRequest["lang"])
    : null;
  if (!lang) return { ok: false };
  const answer = clip(b["answer"], MAX_REPORT_ANSWER);
  const question = clip(b["question"], MAX_REPORT_QUESTION);
  if (!answer || !question) return { ok: false };
  const slug =
    typeof b["slug"] === "string" && /^[a-z0-9-]{1,60}$/.test(b["slug"]) ? b["slug"] : undefined;
  return {
    ok: true,
    value: {
      reason: b["reason"] as ReportReason,
      note: clip(b["note"], MAX_REPORT_NOTE),
      question,
      answer,
      lang,
      slug,
    },
  };
}

/** The one log line a report becomes: JSON, prefixed so it is easy to grep. */
export function reportLogLine(report: ReportRequest, now = new Date()): string {
  return `[ai-report] ${JSON.stringify({
    at: now.toISOString(),
    reason: report.reason,
    note: report.note,
    site: report.slug ?? null,
    lang: report.lang,
    question: report.question.slice(0, 300),
    answer: report.answer.slice(0, 600),
  })}`;
}
