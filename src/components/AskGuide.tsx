import {
  Clock,
  ExternalLink,
  Flag,
  MessageCircleQuestion,
  Mic,
  Send,
  Volume2,
  WifiOff,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { claimSpeech } from "@/hooks/use-audio-guide";
import { track } from "@/lib/analytics";
import { answer, suggestions, type Answer } from "@/lib/ask";
// Types only: the module itself is server-side and stays out of the bundle.
import type { AskResponse, AskSource, Turn } from "@/lib/ask-ai";
import { useI18n, type Lang } from "@/lib/i18n";
import { REPORT_REASONS, MAX_REPORT_NOTE, type ReportReason } from "@/lib/report";
import { spokenText } from "@/lib/narration";
import type { Site } from "@/lib/sites";
import { useTheme } from "@/lib/theme";

const BCP47: Record<Lang, string> = { tr: "tr-TR", en: "en-GB", de: "de-DE", ru: "ru-RU" };

type Recognition = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: { 0: { transcript: string } }[] }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

function recognitionClass(): (new () => Recognition) | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as {
    SpeechRecognition?: new () => Recognition;
    webkitSpeechRecognition?: new () => Recognition;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

/** One question in the panel; `a` is undefined while the guide is thinking. */
type Item = {
  id: number;
  q: string;
  a?: Answer;
  /** Answered by the local matcher because the AI could not be reached. */
  offline?: boolean;
  /** Answered by the AI, so it may be sent back as conversation history. */
  ai?: boolean;
  /** Web pages Google Search grounded the AI answer in. */
  sources?: AskSource[];
  /** Google's Search Suggestions HTML, shown as Google rendered it. */
  searchEntryPoint?: string | undefined;
  /**
   * Why the AI did not answer, when it is worth telling: this visitor asked
   * too fast, or the guide (the server or Gemini's quota) is busy. Either
   * way it will work again shortly, which an "Offline answer" badge alone
   * does not say.
   */
  notice?: "limited" | "busy" | undefined;
};

/** Longer than the server's own 25 s Gemini deadline, so that one decides first. */
const CLIENT_TIMEOUT_MS = 30_000;
/** Previous questions kept as conversation for the model (each is two turns). */
const HISTORY_PAIRS = 3;

/**
 * "Ask the guide" on a city page: type or say a question, get an answer from
 * the AI guide (`/api/sor`, Gemini grounded in the app's own record of the
 * site). Whenever that fails — offline, no key on the server, quota, a slow
 * answer — the local matcher in `ask.ts` answers at once instead and the
 * answer says so, so the box never just spins or goes blank.
 *
 * Speech recognition is the browser's; where it sends audio is the browser's
 * business, so the microphone is only offered where the browser has it and
 * only listens when pressed.
 */
export function AskGuide({ site }: { site: Site }) {
  const { t, lang } = useI18n();
  const { theme } = useTheme();
  const [question, setQuestion] = useState("");
  // Newest first, as the panel shows them.
  const [items, setItems] = useState<Item[]>([]);
  // The latest list for `ask`: a voice question is asked from the closure the
  // microphone was started in, whose `items` would miss newer answers.
  const itemsRef = useRef<Item[]>(items);
  itemsRef.current = items;
  const [listening, setListening] = useState(false);
  const [canListen, setCanListen] = useState(false);
  const recognition = useRef<Recognition | null>(null);
  const inflight = useRef<AbortController | null>(null);
  const nextId = useRef(0);
  const chips = useMemo(() => suggestions(site, lang), [site, lang]);
  // The answer whose "report" form is open, if any.
  const [reporting, setReporting] = useState<number | null>(null);

  useEffect(() => setCanListen(Boolean(recognitionClass())), []);
  useEffect(() => {
    setItems([]);
    // A question about the last city must not land in this one's panel.
    inflight.current?.abort();
  }, [site.slug]);
  useEffect(() => () => inflight.current?.abort(), []);

  function settle(id: number, patch: Omit<Item, "id" | "q">) {
    setItems((list) => list.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  async function ask(q: string) {
    const text = q.trim();
    if (!text) return;
    // A new question replaces the one still being answered; that one gets
    // its offline answer below rather than spinning forever.
    inflight.current?.abort();
    const controller = new AbortController();
    inflight.current = controller;
    const timer = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

    const id = nextId.current++;
    // History from AI answers only: an offline "I don't know" is not
    // something the model should take as its own earlier words.
    const history = itemsRef.current
      .filter((item) => item.ai && item.a)
      .slice(0, HISTORY_PAIRS)
      .reverse()
      .flatMap((item) => [
        { role: "user" as const, text: item.q },
        { role: "model" as const, text: item.a!.text },
      ]) satisfies Turn[];
    setItems((list) => [{ id, q: text }, ...list].slice(0, 5));
    setQuestion("");

    const offline = (notice?: Item["notice"]) => {
      const a = answer(site, text, lang);
      // With a notice, a local "I don't know" adds nothing: the notice is the answer.
      settle(id, notice && a.unknown ? { a: { text: "" }, notice } : { a, offline: true, notice });
      track("Guide question", {
        site: site.slug,
        answered: notice ?? (a.unknown ? "no" : a.source ? "yes" : "maybe"),
      });
    };

    try {
      const res = await fetch("/api/sor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: text, slug: site.slug, lang, history }),
        signal: controller.signal,
      });
      const data = (await res.json().catch(() => null)) as AskResponse | null;
      if (res.ok && data && "answer" in data && data.answer) {
        settle(id, {
          a: { text: data.answer, source: t("ask_ai_source") },
          ai: true,
          sources: Array.isArray(data.sources)
            ? data.sources.filter((s) => /^https:\/\//.test(s.url)).slice(0, 4)
            : [],
          searchEntryPoint:
            typeof data.searchEntryPoint === "string" && data.searchEntryPoint.length <= 20_000
              ? data.searchEntryPoint
              : undefined,
        });
        track("Guide question", { site: site.slug, answered: "ai" });
      } else {
        const code = data && "error" in data ? data.error : undefined;
        offline(code === "rate_limited" ? "limited" : code === "busy" ? "busy" : undefined);
      }
    } catch {
      offline();
    } finally {
      clearTimeout(timer);
      if (inflight.current === controller) inflight.current = null;
    }
  }

  function listen() {
    const Rec = recognitionClass();
    if (!Rec) return;
    if (listening) {
      recognition.current?.stop();
      return;
    }
    const rec = new Rec();
    rec.lang = BCP47[lang];
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const said = e.results[0]?.[0]?.transcript ?? "";
      setQuestion(said);
      void ask(said);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognition.current = rec;
    setListening(true);
    rec.start();
  }

  function speak(text: string) {
    if (!("speechSynthesis" in window)) return;
    // Tell the audio guide first: the cancel below silences it too, and it
    // should show "paused", not "playing" over nothing.
    claimSpeech("ask");
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(spokenText(text, lang));
    u.lang = BCP47[lang];
    window.speechSynthesis.speak(u);
  }

  return (
    <section className="rounded-2xl surface-panel p-5">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
        <MessageCircleQuestion className="h-5 w-5 text-primary" /> {t("ask_title")}
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">{t("ask_sub_web")}</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void ask(question);
        }}
        className="mt-3 flex gap-2"
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={500}
          placeholder={t("ask_placeholder")}
          aria-label={t("ask_placeholder")}
          className="h-10 min-w-0 flex-1 rounded-full border border-border bg-card px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        {canListen && (
          <button
            type="button"
            onClick={listen}
            aria-label={t("ask_listen")}
            aria-pressed={listening}
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border ${
              listening
                ? "animate-pulse border-destructive bg-destructive text-white"
                : "border-border bg-card"
            }`}
          >
            <Mic className="h-4 w-4" />
          </button>
        )}
        <button
          type="submit"
          aria-label={t("ask_send")}
          disabled={!question.trim()}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {chips.map((chip) => (
          <button
            key={chip}
            onClick={() => void ask(chip)}
            className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium hover:border-primary"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Always mounted, so screen readers announce answers as they arrive. */}
      <ul className="mt-4 space-y-3 empty:mt-0" aria-live="polite">
        {items.map((item) => (
          <li
            key={item.id}
            aria-busy={!item.a}
            className="rounded-xl border border-border bg-card p-3 text-sm"
          >
            <p className="font-semibold">{item.q}</p>
            {item.a ? (
              <>
                {item.notice && (
                  <p className="mt-1.5 flex items-start gap-1.5 rounded-lg bg-secondary px-2.5 py-1.5 text-xs">
                    <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span>
                      {t(item.notice === "limited" ? "ask_notice_limited" : "ask_notice_busy")}{" "}
                      <button
                        onClick={() => void ask(item.q)}
                        className="font-semibold text-primary underline-offset-2 hover:underline"
                      >
                        {t("ask_retry")}
                      </button>
                    </span>
                  </p>
                )}
                {item.a.text && (
                  <p className="mt-1 whitespace-pre-line leading-relaxed">{item.a.text}</p>
                )}
                {item.sources && item.sources.length > 0 && (
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                    <span>{t("ask_sources")}:</span>
                    {item.sources.map((s) => (
                      <a
                        key={s.url}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex max-w-[14rem] items-center gap-0.5 rounded-full border border-border px-2 py-0.5 hover:border-primary hover:text-foreground"
                      >
                        <span className="truncate">{s.title}</span>
                        <ExternalLink className="h-2.5 w-2.5 shrink-0" aria-hidden />
                      </a>
                    ))}
                  </p>
                )}
                {item.searchEntryPoint && (
                  <SearchSuggestions html={item.searchEntryPoint} dark={theme === "dark"} />
                )}
                {item.a.text && (
                  <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                    <span className="flex flex-wrap items-center gap-1.5">
                      {item.offline && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5">
                          <WifiOff className="h-3 w-3" aria-hidden /> {t("ask_offline")}
                        </span>
                      )}
                      {item.a.source && <span>{item.a.source}</span>}
                    </span>
                    <span className="flex shrink-0 items-center gap-0.5">
                      {item.ai && (
                        <button
                          onClick={() => setReporting(reporting === item.id ? null : item.id)}
                          aria-label={t("report_open")}
                          aria-expanded={reporting === item.id}
                          title={t("report_open")}
                          className="grid h-7 w-7 place-items-center rounded-full hover:bg-secondary"
                        >
                          <Flag className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => speak(item.a!.text)}
                        aria-label={t("ask_speak")}
                        className="grid h-7 w-7 place-items-center rounded-full hover:bg-secondary"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  </div>
                )}
                {item.ai && item.a.text && reporting === item.id && (
                  <ReportForm
                    question={item.q}
                    answer={item.a.text}
                    slug={site.slug}
                    onClose={() => setReporting(null)}
                  />
                )}
              </>
            ) : (
              <p className="mt-1 flex items-center gap-2 text-muted-foreground">
                <span className="flex gap-1" aria-hidden>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
                </span>
                {t("ask_thinking")}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Google's "Search Suggestions" for a grounded answer — required by the
 * Gemini grounding terms — shown exactly as Google rendered it, but walled
 * off: a sandboxed srcdoc iframe with no scripts and no same-origin access,
 * so the HTML cannot touch the page, its cookies or its storage. Popups are
 * allowed (and escape the sandbox) so its links can open Google in a new
 * tab, which the injected <base target="_blank"> makes them do.
 *
 * Without scripts the frame cannot report its height, so it has a fixed one
 * that fits Google's single row of chips; a long row scrolls sideways inside
 * Google's own carousel. `color-scheme` on the frame sets what
 * prefers-color-scheme reports inside it, so Google's dark styles follow
 * the app's theme rather than only the system's.
 */
function SearchSuggestions({ html, dark }: { html: string; dark: boolean }) {
  const { t } = useI18n();
  const doc = `<!doctype html><html><head><meta charset="utf-8"><meta name="color-scheme" content="light dark"><base target="_blank"><style>html,body{margin:0;padding:0;background:transparent;overflow:hidden}</style></head><body>${html}</body></html>`;
  return (
    <iframe
      title={t("ask_search_suggestions")}
      srcDoc={doc}
      sandbox="allow-popups allow-popups-to-escape-sandbox"
      loading="lazy"
      className="mt-2 block h-[72px] w-full overflow-hidden border-0 bg-transparent"
      style={{ colorScheme: dark ? "dark" : "light" }}
    />
  );
}

/**
 * "Report this answer": Google Play requires that AI-generated content can be
 * flagged from inside the app. The report (reason, optional note and excerpts
 * of the question and answer) goes to /api/rapor, which only writes it to the
 * server log for review.
 */
function ReportForm({
  question,
  answer,
  slug,
  onClose,
}: {
  question: string;
  answer: string;
  slug: string;
  onClose: () => void;
}) {
  const { t, lang } = useI18n();
  const [reason, setReason] = useState<ReportReason>("offensive");
  const [note, setNote] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function send() {
    setState("sending");
    try {
      const res = await fetch("/api/rapor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reason, note, question, answer, lang, slug }),
      });
      setState(res.ok ? "sent" : "error");
      if (res.ok) track("AI answer reported", { site: slug, reason });
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <p role="status" className="mt-2 rounded-lg bg-secondary px-3 py-2 text-xs">
        {t("report_thanks")}{" "}
        <button onClick={onClose} className="font-semibold text-primary hover:underline">
          {t("report_close")}
        </button>
      </p>
    );
  }

  return (
    <form
      className="mt-2 space-y-2 rounded-lg border border-border bg-background p-3 text-xs"
      onSubmit={(e) => {
        e.preventDefault();
        void send();
      }}
    >
      <fieldset>
        <legend className="mb-1 font-semibold">{t("report_title")}</legend>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {REPORT_REASONS.map((r) => (
            <label key={r} className="inline-flex items-center gap-1.5">
              <input
                type="radio"
                name="report-reason"
                value={r}
                checked={reason === r}
                onChange={() => setReason(r)}
              />
              {t(`report_reason_${r}`)}
            </label>
          ))}
        </div>
      </fieldset>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={MAX_REPORT_NOTE}
        rows={2}
        placeholder={t("report_note")}
        aria-label={t("report_note")}
        className="w-full rounded-md border border-border bg-card px-2 py-1.5 outline-none focus:ring-2 focus:ring-ring"
      />
      {state === "error" && <p className="text-destructive">{t("report_error")}</p>}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-3 py-1 hover:bg-secondary"
        >
          {t("report_cancel")}
        </button>
        <button
          type="submit"
          disabled={state === "sending"}
          className="rounded-full bg-primary px-3 py-1 font-semibold text-primary-foreground disabled:opacity-50"
        >
          {t("report_send")}
        </button>
      </div>
      <p className="text-[10px] text-muted-foreground">{t("report_privacy")}</p>
    </form>
  );
}
