import { describe, expect, test } from "bun:test";
import { reportLogLine, validateReportBody } from "@/lib/report";

describe("AI answer reports", () => {
  const good = {
    reason: "offensive",
    note: "  rude\nwords ",
    question: "Efes ne zaman kuruldu?",
    answer: "x".repeat(5000),
    lang: "tr",
    slug: "efes",
  };

  test("accepts a valid report and trims what it keeps", () => {
    const parsed = validateReportBody(good);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.note).toBe("rude words");
    expect(parsed.value.answer.length).toBe(1500);
    const line = reportLogLine(parsed.value, new Date("2026-10-18T00:00:00Z"));
    expect(line).toStartWith("[ai-report] {");
    const logged = JSON.parse(line.slice("[ai-report] ".length));
    expect(logged).toMatchObject({ reason: "offensive", site: "efes", lang: "tr" });
    expect(logged.answer.length).toBe(600);
    expect(line).not.toContain('"ip"');
  });

  test("refuses unknown reasons, languages, empty answers and odd slugs", () => {
    expect(validateReportBody({ ...good, reason: "spam" }).ok).toBe(false);
    expect(validateReportBody({ ...good, lang: "fr" }).ok).toBe(false);
    expect(validateReportBody({ ...good, answer: "  " }).ok).toBe(false);
    expect(validateReportBody(null).ok).toBe(false);
    const odd = validateReportBody({ ...good, slug: "../etc" });
    expect(odd.ok && odd.value.slug).toBeUndefined();
  });
});
