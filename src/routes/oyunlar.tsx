import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookOpen, Check, ChevronRight, Gamepad2, RotateCcw, Sparkles, X } from "lucide-react";
import { Photo } from "@/components/Photo";
import { parseLang, translate, useI18n, type TKey } from "@/lib/i18n";
import { levelFromXp, useProgress, XP_PER_CORRECT } from "@/lib/progress";
import { buildQuestion, type Question, type QuizMode } from "@/lib/quiz";
import { seoTags } from "@/lib/seo";

export const Route = createFileRoute("/oyunlar")({
  head: ({ match }) => {
    const lang = parseLang(match.search.lang);
    return seoTags({
      lang,
      pathname: "/oyunlar",
      title: translate("seo_games_title", lang),
      description: translate("seo_games_desc", lang),
    });
  },
  component: GamesPage,
});

type Mode = QuizMode;

const modes: { id: Mode; title: TKey; desc: TKey }[] = [
  { id: "photo", title: "game_photo", desc: "game_photo_d" },
  { id: "who", title: "game_who", desc: "game_who_d" },
  { id: "tf", title: "game_tf", desc: "game_tf_d" },
  { id: "map", title: "game_map", desc: "game_map_d" },
  { id: "structure", title: "game_structure", desc: "game_structure_d" },
];

/** How many recent subjects to keep off the board before they can return. */
const NO_REPEAT_WINDOW = 12;

function GamesPage() {
  const { t, L } = useI18n();
  const { state, addGameResult } = useProgress();
  const [mode, setMode] = useState<Mode | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [asked, setAsked] = useState<string[]>([]);

  const lvl = useMemo(() => levelFromXp(state.xp), [state.xp]);

  function ask(next: Mode, history: string[]) {
    const q = buildQuestion(next, L, new Set(history));
    setQuestion(q);
    setAsked([q.slug, ...history].slice(0, NO_REPEAT_WINDOW));
  }

  function start(next: Mode) {
    setMode(next);
    setRound(1);
    setScore(0);
    setPicked(null);
    setAsked([]);
    ask(next, []);
  }

  function pick(option: string) {
    if (picked || !question) return;
    setPicked(option);
    const correct = option === question.answer;
    if (correct) setScore((s) => s + 1);
    addGameResult(correct);
  }

  function nextQuestion() {
    if (!mode) return;
    setRound((r) => r + 1);
    setPicked(null);
    ask(mode, asked);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">{t("games_title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("games_sub")}</p>
      </header>

      <Link
        to="/hikayeler"
        className="mb-6 flex items-center gap-4 rounded-2xl border-l-4 border-gold bg-secondary p-5 transition-colors hover:bg-secondary/80"
      >
        <BookOpen className="h-8 w-8 shrink-0 text-gold" />
        <span className="flex-1">
          <span className="block font-display text-lg font-semibold">{t("stories_title")}</span>
          <span className="mt-0.5 block text-sm text-secondary-foreground">
            {t("stories_intro")}
          </span>
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 text-primary" />
      </Link>

      <div className="mb-8 flex flex-wrap items-center gap-4 rounded-2xl surface-panel p-5">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary font-display text-xl font-bold text-primary-foreground">
          {lvl.level}
        </div>
        <div className="min-w-[200px] flex-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span>
              {t("level")} {lvl.level}
            </span>
            <span className="text-muted-foreground">
              {state.xp} XP · {lvl.toNext} {t("xp_to_next")}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-gold" style={{ width: `${lvl.progress}%` }} />
          </div>
        </div>
      </div>

      {!mode ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => start(m.id)}
              className="rounded-2xl surface-panel p-5 text-left lift"
            >
              <Gamepad2 className="h-6 w-6 text-primary" />
              <h2 className="mt-3 font-display text-lg font-semibold">{t(m.title)}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t(m.desc)}</p>
              <span className="mt-4 inline-block rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">
                {t("play")}
              </span>
            </button>
          ))}
        </div>
      ) : (
        question && (
          <div className="rounded-2xl surface-panel p-6">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>
                {t("question")} {round}
              </span>
              <span>
                {t("score")}: {score}
              </span>
            </div>

            {question.image && (
              <Photo
                src={question.image}
                alt=""
                sizes="(min-width: 1024px) 1024px, 100vw"
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
              <p className="mt-4 flex items-center gap-2 text-sm font-semibold">
                {picked === question.answer ? (
                  <>
                    <Sparkles className="h-4 w-4 text-gold" /> {t("correct")} +{XP_PER_CORRECT}{" "}
                    {t("earned_xp")}
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 text-destructive" /> {t("wrong")} — {question.answer}
                  </>
                )}
              </p>
            )}

            <div className="mt-6 flex gap-2">
              <button
                onClick={nextQuestion}
                disabled={!picked}
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40"
              >
                {t("next_question")}
              </button>
              <button
                onClick={() => setMode(null)}
                className="flex items-center gap-1.5 rounded-full border border-border px-5 py-2.5 text-sm font-semibold"
              >
                <RotateCcw className="h-4 w-4" /> {t("finish")}
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
