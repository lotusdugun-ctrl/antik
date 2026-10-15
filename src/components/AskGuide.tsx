import { MessageCircleQuestion, Mic, Send, Volume2, WifiOff } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { claimSpeech } from "@/hooks/use-audio-guide";
import { track } from "@/lib/analytics";
import { answer, suggestions, type Answer } from "@/lib/ask";
// Types only: the module itself is server-side and stays out of the bundle.
import type { AskResponse, Turn } from "@/lib/ask-ai";
import { useI18n, type Lang } from "@/lib/i18n";
import { spokenText } from "@/lib/narration";
import type { Site } from "@/lib/sites";

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
};

/** Longer than the server's own 15 s Gemini timeout, so that one decides first. */
const CLIENT_TIMEOUT_MS = 20_000;
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
  const [question, setQuestion] = useState("");
  // Newest first, as the panel shows them.
  const [items, setItems] = useState<Item[]>([]);
  const [listening, setListening] = useState(false);
  const [canListen, setCanListen] = useState(false);
  const recognition = useRef<Recognition | null>(null);
  const inflight = useRef<AbortController | null>(null);
  const nextId = useRef(0);
  const chips = useMemo(() => suggestions(site, lang), [site, lang]);

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
    const history = items
      .filter((item) => item.ai && item.a)
      .slice(0, HISTORY_PAIRS)
      .reverse()
      .flatMap((item) => [
        { role: "user" as const, text: item.q },
        { role: "model" as const, text: item.a!.text },
      ]) satisfies Turn[];
    setItems((list) => [{ id, q: text }, ...list].slice(0, 5));
    setQuestion("");

    const offline = () => {
      const a = answer(site, text, lang);
      settle(id, { a, offline: true });
      track("Guide question", { site: site.slug, answered: a.source ? "yes" : "maybe" });
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
        settle(id, { a: { text: data.answer, source: t("ask_ai_source") }, ai: true });
        track("Guide question", { site: site.slug, answered: "ai" });
      } else {
        offline();
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
      <p className="mt-1 text-xs text-muted-foreground">{t("ask_sub_ai")}</p>

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
                <p className="mt-1 whitespace-pre-line leading-relaxed">{item.a.text}</p>
                <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                  <span className="flex flex-wrap items-center gap-1.5">
                    {item.offline && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5">
                        <WifiOff className="h-3 w-3" aria-hidden /> {t("ask_offline")}
                      </span>
                    )}
                    {item.a.source && <span>{item.a.source}</span>}
                  </span>
                  <button
                    onClick={() => speak(item.a!.text)}
                    aria-label={t("ask_speak")}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full hover:bg-secondary"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </button>
                </div>
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
