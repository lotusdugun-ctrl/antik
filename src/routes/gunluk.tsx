import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarDays, Check, Flame, Share2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Photo } from "@/components/Photo";
import { DAILY_QUESTIONS, dailyQuestions, dayKey, shareText } from "@/lib/daily";
import { parseLang, translate, useI18n } from "@/lib/i18n";
import { useProgress, XP_PER_CORRECT } from "@/lib/progress";
import { seoTags } from "@/lib/seo";

export const Route = createFileRoute("/gunluk")({
  head: ({ match }) => {
    const lang = parseLang(match.search.lang);
    return seoTags({
      lang,
      pathname: "/gunluk",
      title: translate("seo_daily_title", lang),
      description: translate("seo_daily_desc", lang),
    });
  },
  component: DailyPage,
});

function DailyPage() {
  const { t, L } = useI18n();
  const { state, ready, recordDaily } = useProgress();

  // The date is read once per mount rather than per render, so a round that
  // happens to straddle midnight UTC finishes on the day it started.
  const [day] = useState(() => dayKey());
  const questions = useMemo(() => dailyQuestions(L, day), [L, day]);

  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [results, setResults] = useState<boolean[]>([]);

  const alreadyPlayed = ready && state.dailyDay === day;
  const finished = results.length === DAILY_QUESTIONS;
  const question = questions[index];

  function pick(option: string) {
    if (picked || !question) return;
    setPicked(option);
    const correct = option === question.answer;
    const next = [...results, correct];
    setResults(next);
    // Scored in one go at the end: recording each answer separately would let
    // a refresh mid-round bank the right answers and retry the wrong ones.
    if (next.length === DAILY_QUESTIONS) {
      recordDaily(day, next.filter(Boolean).length);
    }
  }

  function advance() {
    setPicked(null);
    setIndex((i) => i + 1);
  }

  async function share() {
    const text = shareText({
      day,
      results,
      streak: state.dailyStreak,
      title: t("daily_title"),
      streakLabel: t("daily_streak"),
    });
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("daily_copied"));
    } catch {
      // Clipboard access can be refused; the text is on screen either way.
      toast.message(text);
    }
  }

  const score = results.filter(Boolean).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2.5 font-display text-3xl font-semibold sm:text-4xl">
          <CalendarDays className="h-7 w-7 text-primary" /> {t("daily_title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("daily_sub")}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full bg-secondary px-3 py-1 font-semibold text-secondary-foreground">
            {day}
          </span>
          {state.dailyStreak > 1 && (
            <span className="flex items-center gap-1.5 font-semibold text-gold">
              <Flame className="h-4 w-4" /> {state.dailyStreak} {t("daily_streak")}
            </span>
          )}
        </div>
      </header>

      {alreadyPlayed && !finished ? (
        <div className="rounded-2xl surface-panel p-6 text-center">
          <p className="font-display text-xl font-semibold">
            {state.dailyCorrect} / {DAILY_QUESTIONS}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{t("daily_done_today")}</p>
        </div>
      ) : finished ? (
        <div className="rounded-2xl surface-panel p-6 text-center">
          <p className="font-display text-3xl font-semibold">
            {score} / {DAILY_QUESTIONS}
          </p>
          <p className="mt-3 text-2xl tracking-widest" aria-label={`${score}/${DAILY_QUESTIONS}`}>
            {results.map((ok) => (ok ? "🟩" : "⬜")).join("")}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            +{score * XP_PER_CORRECT} XP · {t("daily_done_today")}
          </p>
          <button
            onClick={share}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <Share2 className="h-4 w-4" /> {t("daily_share")}
          </button>
        </div>
      ) : (
        question && (
          <div className="rounded-2xl surface-panel p-6">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>
                {t("question")} {index + 1} {t("daily_question_of")}
              </span>
              <span className="tracking-widest">
                {results.map((ok) => (ok ? "🟩" : "⬜")).join("")}
              </span>
            </div>

            {question.image && (
              <Photo
                src={question.image}
                alt=""
                sizes="(min-width: 768px) 768px, 100vw"
                fallbackWidth={960}
                className="mt-4 h-56 w-full rounded-xl object-cover"
              />
            )}
            <p className="mt-4 font-display text-2xl font-semibold">{question.prompt}</p>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {question.options.map((option) => {
                const isAnswer = option === question.answer;
                const chosen = picked === option;
                return (
                  <button
                    key={option}
                    onClick={() => pick(option)}
                    disabled={Boolean(picked)}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                      picked
                        ? isAnswer
                          ? "border-success bg-success/15 text-foreground"
                          : chosen
                            ? "border-destructive bg-destructive/10"
                            : "border-border opacity-60"
                        : "border-border bg-card hover:border-primary"
                    }`}
                  >
                    {option}
                    {picked && isAnswer && <Check className="h-4 w-4 text-success" />}
                    {picked && chosen && !isAnswer && <X className="h-4 w-4 text-destructive" />}
                  </button>
                );
              })}
            </div>

            {picked && (
              <>
                <p className="mt-4 flex items-center gap-2 text-sm font-semibold">
                  {picked === question.answer ? (
                    <>
                      <Sparkles className="h-4 w-4 text-gold" /> {t("correct")}
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 text-destructive" /> {t("wrong")} — {question.answer}
                    </>
                  )}
                </p>
                {index + 1 < DAILY_QUESTIONS && (
                  <button
                    onClick={advance}
                    className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                  >
                    {t("next_question")}
                  </button>
                )}
              </>
            )}
          </div>
        )
      )}
    </div>
  );
}
