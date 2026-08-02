import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, Gamepad2, RotateCcw, Sparkles, X } from "lucide-react";
import { useI18n, type TKey } from "@/lib/i18n";
import { levelFromXp, useProgress, XP_PER_CORRECT } from "@/lib/progress";
import { coverImage, sites, type Site } from "@/lib/sites";

export const Route = createFileRoute("/oyunlar")({
  head: () => ({
    meta: [
      { title: "Mini Oyunlar — Antik Kentleri Öğren | Antik Türkiye" },
      {
        name: "description",
        content:
          "Fotoğrafı tahmin et, kim bu, doğru/yanlış, haritada bul ve yapıyı tanı oyunlarıyla antik kentleri öğren, XP kazan.",
      },
      { property: "og:title", content: "Mini Oyunlar — Antik Kentleri Öğren" },
      {
        property: "og:description",
        content: "Eğitici mini oyunlarla Türkiye'nin antik kentlerini öğren ve seviye atla.",
      },
    ],
  }),
  component: GamesPage,
});

type Mode = "photo" | "who" | "tf" | "map" | "structure";

const modes: { id: Mode; title: TKey; desc: TKey }[] = [
  { id: "photo", title: "game_photo", desc: "game_photo_d" },
  { id: "who", title: "game_who", desc: "game_who_d" },
  { id: "tf", title: "game_tf", desc: "game_tf_d" },
  { id: "map", title: "game_map", desc: "game_map_d" },
  { id: "structure", title: "game_structure", desc: "game_structure_d" },
];

function shuffle<T>(arr: T[]) {
  return [...arr].sort(() => Math.random() - 0.5);
}

type Question = {
  prompt: string;
  image?: string;
  options: string[];
  answer: string;
};

function buildQuestion(mode: Mode, L: (v: { tr: string; en: string }) => string): Question {
  const pool = shuffle(sites);
  const site = pool[0] as Site;
  const others = pool.slice(1, 4) as Site[];

  if (mode === "who") {
    const withFigures = shuffle(sites.filter((s) => s.figures.length > 0));
    const target = (withFigures[0] ?? site) as Site;
    const distractors = shuffle(sites.filter((s) => s.slug !== target.slug)).slice(0, 3);
    return {
      prompt: `${target.figures[0]} — ?`,
      options: shuffle([target, ...distractors].map((s) => L(s.name))),
      answer: L(target.name),
    };
  }
  if (mode === "tf") {
    const isTrue = Math.random() > 0.5;
    const wrong = others[0] as Site;
    return {
      prompt: `${L(site.name)} · ${isTrue ? L(site.province) : L(wrong.province)}`,
      options: ["✓", "✗"],
      answer: isTrue ? "✓" : "✗",
    };
  }
  if (mode === "map") {
    return {
      prompt: L(site.name),
      options: shuffle([site, ...others].map((s) => L(s.province))),
      answer: L(site.province),
    };
  }
  if (mode === "structure") {
    const structure = site.structures[0]!;
    return {
      prompt: L(structure),
      options: shuffle([site, ...others].map((s) => L(s.name))),
      answer: L(site.name),
    };
  }
  return {
    prompt: L(site.province),
    image: coverImage(site),
    options: shuffle([site, ...others].map((s) => L(s.name))),
    answer: L(site.name),
  };
}

function GamesPage() {
  const { t, L } = useI18n();
  const { state, addGameResult } = useProgress();
  const [mode, setMode] = useState<Mode | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);

  const lvl = useMemo(() => levelFromXp(state.xp), [state.xp]);

  function start(next: Mode) {
    setMode(next);
    setRound(1);
    setScore(0);
    setPicked(null);
    setQuestion(buildQuestion(next, L));
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
    setQuestion(buildQuestion(mode, L));
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">{t("games_title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("games_sub")}</p>
      </header>

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
              <img
                src={question.image}
                alt=""
                loading="lazy"
                width={1200}
                height={800}
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
