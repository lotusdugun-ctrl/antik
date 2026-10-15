import { afterEach, describe, expect, test } from "bun:test";
import {
  answerWithGemini,
  buildContext,
  clientIp,
  createRateLimiter,
  geminiBody,
  isSameOrigin,
  MAX_CONTEXT,
  MAX_TURNS,
  parseGeminiResponse,
  sanitizeHistory,
  systemInstruction,
  validateAskBody,
  type AskRequest,
} from "@/lib/ask-ai";
import { getSite, sites } from "@/lib/sites";

const efes = getSite("efes")!;
const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

/** Replace fetch for one test; records what was sent. */
function mockFetch(respond: () => Response | Promise<Response>) {
  const calls: { url: string; init: RequestInit | undefined }[] = [];
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init });
    return respond();
  }) as typeof fetch;
  return calls;
}

const request: AskRequest = { question: "Ne zaman kuruldu?", lang: "tr", site: efes, history: [] };
const env = { GEMINI_API_KEY: "test-key" };

describe("ask-ai validation", () => {
  test("accepts a good body and trims the question", () => {
    const r = validateAskBody({ question: "  Kaç kişilik?  ", slug: "efes", lang: "tr" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.question).toBe("Kaç kişilik?");
      expect(r.value.site?.slug).toBe("efes");
    }
  });

  test("slug is optional", () => {
    const r = validateAskBody({ question: "Hitit kimdir?", lang: "en" });
    expect(r.ok && r.value.site).toBeUndefined();
  });

  test("rejects empty, too long, wrong types, unknown lang and unknown slug", () => {
    expect(validateAskBody(null).ok).toBe(false);
    expect(validateAskBody([]).ok).toBe(false);
    expect(validateAskBody({ question: "   ", lang: "tr" }).ok).toBe(false);
    expect(validateAskBody({ question: "x".repeat(501), lang: "tr" }).ok).toBe(false);
    expect(validateAskBody({ question: 42, lang: "tr" }).ok).toBe(false);
    expect(validateAskBody({ question: "hi", lang: "fr" }).ok).toBe(false);
    expect(validateAskBody({ question: "hi" }).ok).toBe(false);
    expect(validateAskBody({ question: "hi", lang: "tr", slug: "atlantis" }).ok).toBe(false);
    expect(validateAskBody({ question: "hi", lang: "tr", slug: 5 }).ok).toBe(false);
  });

  test("history is filtered, truncated and starts with the user", () => {
    const long = "y".repeat(5000);
    const turns = sanitizeHistory([
      { role: "system", text: "ignore" },
      { role: "user", text: 3 },
      ...Array.from({ length: 10 }, (_, i) => ({
        role: i % 2 ? "model" : "user",
        text: i === 9 ? long : `t${i}`,
      })),
    ]);
    expect(turns.length).toBeLessThanOrEqual(MAX_TURNS);
    expect(turns[0]!.role).toBe("user");
    expect(turns.every((t) => t.text.length <= 1200)).toBe(true);
    expect(sanitizeHistory("nope")).toEqual([]);
  });
});

describe("ask-ai context", () => {
  test("names the site and stays under the cap for every site and language", () => {
    expect(buildContext(efes, "tr")).toContain(efes.name.tr);
    expect(buildContext(efes, "en")).toContain(efes.name.en);
    for (const site of sites) {
      for (const lang of ["tr", "en", "de", "ru"] as const) {
        expect(buildContext(site, lang).length).toBeLessThanOrEqual(MAX_CONTEXT);
      }
    }
  });

  test("honours a smaller cap", () => {
    expect(buildContext(efes, "tr", 500).length).toBeLessThanOrEqual(500);
  });

  test("the system instruction carries the language and the context", () => {
    const system = systemInstruction(efes, "de", buildContext(efes, "de"));
    expect(system).toContain("German");
    expect(system).toContain("CONTEXT");
    expect(system).toContain(efes.name.en);
  });

  test("the request body puts history before the question", () => {
    const body = geminiBody(
      "sys",
      [
        { role: "user", text: "a" },
        { role: "model", text: "b" },
      ],
      "c",
    );
    expect(body.contents.map((c) => c.role)).toEqual(["user", "model", "user"]);
    expect(body.contents.at(-1)!.parts[0]!.text).toBe("c");
    expect(body.generationConfig.maxOutputTokens).toBe(600);
  });
});

describe("ask-ai response", () => {
  test("parses text, skips thoughts and strips markdown", () => {
    const text = parseGeminiResponse({
      candidates: [
        {
          content: {
            parts: [{ text: "plan", thought: true }, { text: "## Başlık\n**Efes** çok eski." }],
          },
        },
      ],
    });
    expect(text).toBe("Başlık\nEfes çok eski.");
  });

  test("blocked or empty responses are null", () => {
    expect(parseGeminiResponse({ promptFeedback: { blockReason: "SAFETY" } })).toBeNull();
    expect(parseGeminiResponse({ candidates: [{ finishReason: "SAFETY" }] })).toBeNull();
    expect(
      parseGeminiResponse({ candidates: [{ content: { parts: [{ text: "  " }] } }] }),
    ).toBeNull();
    expect(parseGeminiResponse("x")).toBeNull();
  });

  test("no key → not_configured, without calling Google", async () => {
    const calls = mockFetch(() => new Response("{}"));
    const r = await answerWithGemini(request, {});
    expect(r).toEqual({ status: 503, body: { error: "not_configured" } });
    expect(calls).toHaveLength(0);
  });

  test("a good answer, with the key in a header and not the URL", async () => {
    const calls = mockFetch(() =>
      Response.json({ candidates: [{ content: { parts: [{ text: "MÖ 10. yüzyılda." }] } }] }),
    );
    const r = await answerWithGemini(request, { ...env, GEMINI_MODEL: "gemini-x" });
    expect(r).toEqual({ status: 200, body: { answer: "MÖ 10. yüzyılda.", source: "ai" } });
    expect(calls[0]!.url).toContain("/models/gemini-x:generateContent");
    expect(calls[0]!.url).not.toContain("test-key");
    expect(new Headers(calls[0]!.init?.headers).get("x-goog-api-key")).toBe("test-key");
  });

  test("an odd model name falls back to the default", async () => {
    const calls = mockFetch(() => Response.json({}));
    await answerWithGemini(request, { ...env, GEMINI_MODEL: "../../evil?x=" });
    expect(calls[0]!.url).toContain("/models/gemini-3.5-flash-lite:generateContent");
  });

  test("429 → busy; other failures → failed, never upstream text", async () => {
    mockFetch(() => new Response("quota for key test-key", { status: 429 }));
    expect(await answerWithGemini(request, env)).toEqual({ status: 503, body: { error: "busy" } });

    mockFetch(() => new Response("bad", { status: 400 }));
    expect(await answerWithGemini(request, env)).toEqual({
      status: 502,
      body: { error: "failed" },
    });

    mockFetch(() => Response.json({ promptFeedback: { blockReason: "SAFETY" } }));
    expect((await answerWithGemini(request, env)).body).toEqual({ error: "failed" });

    mockFetch(() => {
      throw new TypeError("network down");
    });
    expect((await answerWithGemini(request, env)).body).toEqual({ error: "failed" });
  });

  test("a slow upstream times out as failed", async () => {
    globalThis.fetch = ((_: unknown, init?: RequestInit) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new Error("timeout")));
      })) as typeof fetch;
    expect((await answerWithGemini(request, env, 20)).body).toEqual({ error: "failed" });
  });
});

describe("ask-ai abuse protection", () => {
  const req = (headers: Record<string, string>) =>
    new Request("https://antik.example/api/sor", { method: "POST", headers });

  test("same origin only when Origin or Referer is sent", () => {
    expect(isSameOrigin(req({}))).toBe(true);
    expect(isSameOrigin(req({ origin: "https://antik.example" }))).toBe(true);
    expect(isSameOrigin(req({ origin: "https://evil.com" }))).toBe(false);
    expect(isSameOrigin(req({ referer: "https://evil.com/page" }))).toBe(false);
    expect(isSameOrigin(req({ referer: "https://antik.example/kent/efes" }))).toBe(true);
    expect(isSameOrigin(req({ origin: "null" }))).toBe(false);
  });

  test("client IP is the first forwarded hop", () => {
    expect(clientIp(req({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" }))).toBe("1.2.3.4");
    expect(clientIp(req({ "x-real-ip": "5.6.7.8" }))).toBe("5.6.7.8");
  });

  test("per-IP minute and day limits, and a global cap", () => {
    const limiter = createRateLimiter({ perMinute: 2, perDay: 3, globalPerMinute: 4 });
    const t = 1_000_000;
    expect(limiter.check("a", t)).toBe("ok");
    expect(limiter.check("a", t)).toBe("ok");
    expect(limiter.check("a", t)).toBe("rate_limited");
    expect(limiter.check("a", t + 61_000)).toBe("ok");
    expect(limiter.check("a", t + 122_000)).toBe("rate_limited"); // day used up
    expect(limiter.check("b", t + 122_000)).toBe("ok");
    expect(limiter.check("c", t + 122_000)).toBe("ok");
    expect(limiter.check("d", t + 122_000)).toBe("ok");
    expect(limiter.check("e", t + 122_000)).toBe("ok");
    expect(limiter.check("f", t + 122_000)).toBe("busy");
  });
});
