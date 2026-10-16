import { createFileRoute } from "@tanstack/react-router";
import {
  answerWithGemini,
  clientIp,
  createRateLimiter,
  isSameOrigin,
  readEnv,
  validateAskBody,
  type AskResponse,
} from "@/lib/ask-ai";
import { loadContentTranslations } from "@/lib/i18n";

// Module scope, so it lives as long as the serverless instance does — which
// is what makes it per-instance and best-effort (see `createRateLimiter`).
const limiter = createRateLimiter();

const reply = (body: AskResponse, status: number) =>
  Response.json(body, { status, headers: { "cache-control": "no-store" } });

/**
 * POST /api/sor — "Ask the guide" answered by Gemini, grounded in the app's
 * own record of the site and (unless GEMINI_SEARCH is off) Google Search.
 * Body: { question, lang, slug?, history? }. 200 answers
 * { answer, source: "ai", sources: {title, url}[], search: "used"|"off"|"fallback",
 * searchEntryPoint?: Google's Search Suggestions HTML (only when search was used) }.
 *
 * Every non-200 is a cue for the client to answer from `ask.ts` instead, so
 * the codes only need to be honest, not detailed: 400 bad input, 403 another
 * site, 429 this visitor is asking too fast, 503 not configured or quota,
 * 502 anything else. The client tells the visitor about 429 and "busy" (it
 * will work again shortly) rather than only showing the offline answer. The key and Google's own error text never leave here.
 */
export const Route = createFileRoute("/api/sor")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isSameOrigin(request)) return reply({ error: "forbidden" }, 403);

        // Refuse oversized bodies before parsing them: a question is 500
        // characters and the history a few short turns.
        const raw = await request.text();
        if (raw.length > 20_000) return reply({ error: "bad_request" }, 400);
        let body: unknown;
        try {
          body = JSON.parse(raw);
        } catch {
          return reply({ error: "bad_request" }, 400);
        }
        const parsed = validateAskBody(body);
        if (!parsed.ok) return reply({ error: "bad_request" }, 400);

        const env = readEnv();
        // Without a key nothing is spent, so nothing is counted either.
        if (!env.GEMINI_API_KEY?.trim()) return reply({ error: "not_configured" }, 503);

        const verdict = limiter.check(clientIp(request));
        if (verdict === "rate_limited") return reply({ error: "rate_limited" }, 429);
        if (verdict === "busy") return reply({ error: "busy" }, 503);

        // German and Russian content lives in translation memories loaded on
        // demand; the page's root route awaits them, an API route has to too.
        if (parsed.value.lang === "de" || parsed.value.lang === "ru") {
          await loadContentTranslations();
        }

        const { status, body: answer } = await answerWithGemini(parsed.value, env);
        return reply(answer, status);
      },
    },
  },
});
