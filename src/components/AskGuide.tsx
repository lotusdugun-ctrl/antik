import { MessageCircleQuestion, Mic, Send, Volume2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { answer, suggestions, type Answer } from "@/lib/ask";
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

/**
 * "Ask the guide" on a city page: type or say a question, get an answer from
 * the app's own data (see `ask.ts`). Speech recognition is the browser's;
 * where it sends audio is the browser's business, so the microphone is only
 * offered where the browser has it and only listens when pressed.
 */
export function AskGuide({ site }: { site: Site }) {
  const { t, lang } = useI18n();
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<{ q: string; a: Answer }[]>([]);
  const [listening, setListening] = useState(false);
  const [canListen, setCanListen] = useState(false);
  const recognition = useRef<Recognition | null>(null);
  const chips = useMemo(() => suggestions(site, lang), [site, lang]);

  useEffect(() => setCanListen(Boolean(recognitionClass())), []);
  useEffect(() => setHistory([]), [site.slug]);

  function ask(q: string) {
    const text = q.trim();
    if (!text) return;
    const a = answer(site, text, lang);
    setHistory((h) => [{ q: text, a }, ...h].slice(0, 5));
    setQuestion("");
    track("Guide question", { site: site.slug, answered: a.source ? "yes" : "maybe" });
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
      ask(said);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognition.current = rec;
    setListening(true);
    rec.start();
  }

  function speak(text: string) {
    if (!("speechSynthesis" in window)) return;
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
      <p className="mt-1 text-xs text-muted-foreground">{t("ask_sub")}</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
        className="mt-3 flex gap-2"
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
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
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {chips.map((chip) => (
          <button
            key={chip}
            onClick={() => ask(chip)}
            className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium hover:border-primary"
          >
            {chip}
          </button>
        ))}
      </div>

      {history.length > 0 && (
        <ul className="mt-4 space-y-3" aria-live="polite">
          {history.map((item, i) => (
            <li
              key={`${item.q}-${i}`}
              className="rounded-xl border border-border bg-card p-3 text-sm"
            >
              <p className="font-semibold">{item.q}</p>
              <p className="mt-1 leading-relaxed">{item.a.text}</p>
              <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                <span>{item.a.source}</span>
                <button
                  onClick={() => speak(item.a.text)}
                  aria-label={t("ask_speak")}
                  className="grid h-7 w-7 place-items-center rounded-full hover:bg-secondary"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
