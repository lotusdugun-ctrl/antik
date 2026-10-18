import { createFileRoute } from "@tanstack/react-router";
import { clientIp, createRateLimiter, isSameOrigin } from "@/lib/ask-ai";
import { reportLogLine, validateReportBody } from "@/lib/report";

// Per instance, like /api/sor's: enough to stop a flood, not a security boundary.
const limiter = createRateLimiter({ perMinute: 5, perDay: 40, globalPerMinute: 60 });

const reply = (body: Record<string, unknown>, status: number) =>
  Response.json(body, { status, headers: { "cache-control": "no-store" } });

/**
 * POST /api/rapor — a visitor flags an AI guide answer as offensive, wrong or
 * otherwise a problem. Body: { reason, note?, question, answer, lang, slug? }.
 * The report is written to the server log as one `[ai-report] {…}` line, to be
 * reviewed there; nothing is sent anywhere else and no IP address is kept.
 * 200 { ok: true }; 400 bad input; 403 another site; 429 too many reports.
 */
export const Route = createFileRoute("/api/rapor")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isSameOrigin(request)) return reply({ error: "forbidden" }, 403);
        const raw = await request.text();
        if (raw.length > 10_000) return reply({ error: "bad_request" }, 400);
        let body: unknown;
        try {
          body = JSON.parse(raw);
        } catch {
          return reply({ error: "bad_request" }, 400);
        }
        const parsed = validateReportBody(body);
        if (!parsed.ok) return reply({ error: "bad_request" }, 400);
        if (limiter.check(clientIp(request)) !== "ok") return reply({ error: "rate_limited" }, 429);
        console.warn(reportLogLine(parsed.value));
        return reply({ ok: true }, 200);
      },
    },
  },
});
