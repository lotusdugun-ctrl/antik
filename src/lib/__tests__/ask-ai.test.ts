import { afterEach, describe, expect, test } from "bun:test";
import {
  answerWithGemini,
  buildContext,
  clientIp,
  createRateLimiter,
  DEFAULT_LIMITS,
  DEFAULT_MODEL,
  FALLBACK_MODELS,
  geminiBody,
  GEMINI_TIMEOUT_MS,
  isSameOrigin,
  MAX_CONTEXT,
  MAX_ENTRY_POINT,
  MAX_OUTPUT_TOKENS,
  MAX_TURNS,
  parseGeminiResponse,
  parseGroundingSources,
  parseSearchEntryPoint,
  sanitizeHistory,
  searchEnabled,
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
function mockFetch(respond: (call: number) => Response | Promise<Response>) {
  const calls: { url: string; init: RequestInit | undefined }[] = [];
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init });
    return respond(calls.length - 1);
  }) as typeof fetch;
  return calls;
}

/** The JSON body of a recorded call. */
const sent = (call: { init: RequestInit | undefined }) =>
  JSON.parse(String(call.init?.body)) as Record<string, unknown> & {
    tools?: unknown;
    systemInstruction: { parts: { text: string }[] };
  };

const geminiAnswer = (text: string, extra: Record<string, unknown> = {}) =>
  Response.json({ candidates: [{ content: { parts: [{ text }] }, ...extra }] });

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
    expect(body.generationConfig.maxOutputTokens).toBe(MAX_OUTPUT_TOKENS);
    expect(MAX_OUTPUT_TOKENS).toBeGreaterThanOrEqual(1024);
    expect("tools" in body).toBe(false);
    expect(geminiBody("sys", [], "c", true).tools).toEqual([{ google_search: {} }]);
  });

  test("the instruction invites general questions and search, without the old refusal", () => {
    const withSearch = systemInstruction(efes, "tr", "ctx", true);
    expect(withSearch).toContain("Google Search");
    expect(withSearch).toContain("3–8 sentences");
    expect(withSearch).not.toContain("steer back");
    expect(systemInstruction(efes, "tr", "ctx", false)).not.toContain("Google Search");
  });

  test("GEMINI_SEARCH is on unless turned off", () => {
    expect(searchEnabled({})).toBe(true);
    expect(searchEnabled({ GEMINI_SEARCH: "1" })).toBe(true);
    expect(searchEnabled({ GEMINI_SEARCH: "true" })).toBe(true);
    for (const off of ["0", "false", "OFF", " no "]) {
      expect(searchEnabled({ GEMINI_SEARCH: off })).toBe(false);
    }
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
    expect(r).toEqual({
      status: 200,
      body: { answer: "MÖ 10. yüzyılda.", source: "ai", sources: [], search: "used" },
    });
    expect(calls[0]!.url).toContain("/models/gemini-x:generateContent");
    expect(calls[0]!.url).not.toContain("test-key");
    expect(new Headers(calls[0]!.init?.headers).get("x-goog-api-key")).toBe("test-key");
  });

  test("an odd model name falls back to the default", async () => {
    const calls = mockFetch(() => Response.json({}));
    await answerWithGemini(request, { ...env, GEMINI_MODEL: "../../evil?x=" });
    expect(calls[0]!.url).toContain("/models/gemini-3.5-flash-lite:generateContent");
  });

  test("search on by default: tools sent, grounding sources returned", async () => {
    const calls = mockFetch(() =>
      geminiAnswer("Müze bugün 08.00–19.00 arası açık.", {
        groundingMetadata: {
          groundingChunks: [
            { web: { uri: "https://vertexaisearch.cloud.google.com/r/1", title: "muze.gov.tr" } },
            { web: { uri: "https://example.org/a", title: "Wikipedia" } },
          ],
        },
      }),
    );
    const r = await answerWithGemini(request, env);
    expect(calls).toHaveLength(1);
    expect(sent(calls[0]!).tools).toEqual([{ google_search: {} }]);
    expect(r.body).toEqual({
      answer: "Müze bugün 08.00–19.00 arası açık.",
      source: "ai",
      sources: [
        { title: "muze.gov.tr", url: "https://vertexaisearch.cloud.google.com/r/1" },
        { title: "Wikipedia", url: "https://example.org/a" },
      ],
      search: "used",
    });
  });

  test("Google's Search Suggestions pass through untouched, only when search was used", async () => {
    const html =
      '<style>.c{color:red}</style><div class="c"><a href="https://www.google.com/search?q=efes">efes</a></div>';
    const grounded = (extra: Record<string, unknown> = {}) =>
      geminiAnswer("Cevap.", {
        groundingMetadata: { searchEntryPoint: { renderedContent: html }, ...extra },
      });

    mockFetch(() => grounded());
    expect((await answerWithGemini(request, env)).body).toMatchObject({
      search: "used",
      searchEntryPoint: html,
    });

    mockFetch((i) => (i === 0 ? new Response("no tools", { status: 400 }) : grounded()));
    const fallback = (await answerWithGemini(request, env)).body;
    expect(fallback).toMatchObject({ search: "fallback" });
    expect("searchEntryPoint" in fallback).toBe(false);

    mockFetch(() => grounded());
    const off = (await answerWithGemini(request, { ...env, GEMINI_SEARCH: "off" })).body;
    expect("searchEntryPoint" in off).toBe(false);

    mockFetch(() => geminiAnswer("Cevap."));
    expect("searchEntryPoint" in (await answerWithGemini(request, env)).body).toBe(false);
  });

  test("an oversized or malformed entry point is dropped, not truncated", () => {
    const withHtml = (renderedContent: unknown) => ({
      candidates: [{ groundingMetadata: { searchEntryPoint: { renderedContent } } }],
    });
    const atCap = "x".repeat(MAX_ENTRY_POINT);
    expect(MAX_ENTRY_POINT).toBe(20_000);
    expect(parseSearchEntryPoint(withHtml(atCap))).toBe(atCap);
    expect(parseSearchEntryPoint(withHtml(`${atCap}x`))).toBeNull();
    expect(parseSearchEntryPoint(withHtml("   "))).toBeNull();
    expect(parseSearchEntryPoint(withHtml(42))).toBeNull();
    expect(parseSearchEntryPoint({})).toBeNull();
  });

  test("GEMINI_SEARCH=off sends no tools", async () => {
    const calls = mockFetch(() => geminiAnswer("Tamam."));
    const r = await answerWithGemini(request, { ...env, GEMINI_SEARCH: "off" });
    expect("tools" in sent(calls[0]!)).toBe(false);
    expect(sent(calls[0]!).systemInstruction.parts[0]!.text).not.toContain("Google Search");
    expect(r.body).toMatchObject({ answer: "Tamam.", search: "off", sources: [] });
  });

  test("a 400 with tools is retried once without them", async () => {
    const calls = mockFetch((i) =>
      i === 0
        ? new Response("Search grounding is not supported", { status: 400 })
        : geminiAnswer("Kayıttan cevap."),
    );
    const r = await answerWithGemini(request, env);
    expect(calls).toHaveLength(2);
    expect(sent(calls[0]!).tools).toBeDefined();
    expect("tools" in sent(calls[1]!)).toBe(false);
    expect(r).toEqual({
      status: 200,
      body: { answer: "Kayıttan cevap.", source: "ai", sources: [], search: "fallback" },
    });
  });

  test("only one retry, and none when search is off", async () => {
    let calls = mockFetch(() => new Response("bad", { status: 400 }));
    expect((await answerWithGemini(request, env)).body).toEqual({ error: "failed" });
    expect(calls).toHaveLength(2);

    calls = mockFetch(() => new Response("bad", { status: 400 }));
    await answerWithGemini(request, { ...env, GEMINI_SEARCH: "0" });
    expect(calls).toHaveLength(1);
  });

  test("an exhausted model hands over to the next one in the chain", async () => {
    const quota = () =>
      Response.json(
        {
          error: {
            status: "RESOURCE_EXHAUSTED",
            message: "Quota exceeded for key test-key",
            details: [
              { violations: [{ quotaId: "GenerateRequestsPerDayPerProjectPerModel-FreeTier" }] },
            ],
          },
        },
        { status: 429 },
      );
    const warn = console.warn;
    const logged: string[] = [];
    console.warn = (line: string) => void logged.push(line);
    try {
      const calls = mockFetch((i) => (i < 2 ? quota() : geminiAnswer("Yedek modelden.")));
      const r = await answerWithGemini(request, env);
      expect(r.status).toBe(200);
      expect(r.body).toMatchObject({ answer: "Yedek modelden." });
      // Search, then plain, on the first model; then the second model.
      expect(calls).toHaveLength(3);
      expect(calls[0]!.url).toContain(DEFAULT_MODEL);
      expect(calls[2]!.url).toContain(FALLBACK_MODELS[0]!);
      expect(logged.join(" ")).toContain("FreeTier");
      expect(logged.join(" ")).not.toContain("test-key");
    } finally {
      console.warn = warn;
    }
  });

  test("429 → busy; other failures → failed, never upstream text", async () => {
    mockFetch(() => new Response("quota for key test-key", { status: 429 }));
    expect(await answerWithGemini(request, env)).toEqual({ status: 503, body: { error: "busy" } });

    mockFetch(() => new Response("bad", { status: 500 }));
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

describe("ask-ai grounding sources", () => {
  const withChunks = (chunks: unknown[]) => ({
    candidates: [
      { content: { parts: [{ text: "x" }] }, groundingMetadata: { groundingChunks: chunks } },
    ],
  });

  test("https only, deduped by url and title, at most four", () => {
    const sources = parseGroundingSources(
      withChunks([
        { web: { uri: "http://insecure.example/a", title: "insecure" } },
        { web: { uri: "javascript:alert(1)", title: "evil" } },
        { web: { uri: "not a url", title: "broken" } },
        { web: { uri: "https://a.example/1", title: "A" } },
        { web: { uri: "https://a.example/1", title: "A again" } },
        { web: { uri: "https://a.example/2", title: "a" } },
        { web: { uri: "https://b.example/", title: "" } },
        { retrievedContext: { uri: "https://c.example/" } },
        { web: { uri: "https://c.example/", title: "C" } },
        { web: { uri: "https://d.example/", title: "D" } },
        { web: { uri: "https://e.example/", title: "E" } },
      ]),
    );
    expect(sources).toEqual([
      { title: "A", url: "https://a.example/1" },
      { title: "b.example", url: "https://b.example/" },
      { title: "C", url: "https://c.example/" },
      { title: "D", url: "https://d.example/" },
    ]);
  });

  test("no metadata → no sources", () => {
    expect(parseGroundingSources({ candidates: [{ content: { parts: [] } }] })).toEqual([]);
    expect(parseGroundingSources(null)).toEqual([]);
    expect(parseGroundingSources(withChunks("nope" as unknown as unknown[]))).toEqual([]);
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

  test("default limits are sized for shared addresses", () => {
    expect(DEFAULT_LIMITS).toEqual({ perMinute: 15, perDay: 150, globalPerMinute: 60 });
    expect(GEMINI_TIMEOUT_MS).toBe(25_000);
    const limiter = createRateLimiter();
    const t = 5_000_000;
    for (let i = 0; i < 15; i++) expect(limiter.check("ip", t + i)).toBe("ok");
    expect(limiter.check("ip", t + 20)).toBe("rate_limited");
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
