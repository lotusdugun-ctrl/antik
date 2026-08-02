import { n as __toESM } from "../_runtime.mjs";
import { d as sites, r as coverImage } from "./sites-qcnwZ4V_.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as useI18n } from "./i18n-DFOAhYEi.mjs";
import { n as levelFromXp, r as useProgress } from "./progress-DJjpoble.mjs";
import { c as Sparkles, f as RotateCcw, k as Check, t as X, w as Gamepad2 } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/oyunlar-7vy7m9Aq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var modes = [
	{
		id: "photo",
		title: "game_photo",
		desc: "game_photo_d"
	},
	{
		id: "who",
		title: "game_who",
		desc: "game_who_d"
	},
	{
		id: "tf",
		title: "game_tf",
		desc: "game_tf_d"
	},
	{
		id: "map",
		title: "game_map",
		desc: "game_map_d"
	},
	{
		id: "structure",
		title: "game_structure",
		desc: "game_structure_d"
	}
];
function shuffle(arr) {
	return [...arr].sort(() => Math.random() - .5);
}
function buildQuestion(mode, L) {
	const pool = shuffle(sites);
	const site = pool[0];
	const others = pool.slice(1, 4);
	if (mode === "who") {
		const target = shuffle(sites.filter((s) => s.figures.length > 0))[0] ?? site;
		const distractors = shuffle(sites.filter((s) => s.slug !== target.slug)).slice(0, 3);
		return {
			prompt: `${target.figures[0]} — ?`,
			options: shuffle([target, ...distractors].map((s) => L(s.name))),
			answer: L(target.name)
		};
	}
	if (mode === "tf") {
		const isTrue = Math.random() > .5;
		const wrong = others[0];
		return {
			prompt: `${L(site.name)} · ${isTrue ? L(site.province) : L(wrong.province)}`,
			options: ["✓", "✗"],
			answer: isTrue ? "✓" : "✗"
		};
	}
	if (mode === "map") return {
		prompt: L(site.name),
		options: shuffle([site, ...others].map((s) => L(s.province))),
		answer: L(site.province)
	};
	if (mode === "structure") {
		const structure = site.structures[0];
		return {
			prompt: L(structure),
			options: shuffle([site, ...others].map((s) => L(s.name))),
			answer: L(site.name)
		};
	}
	return {
		prompt: L(site.province),
		image: coverImage(site),
		options: shuffle([site, ...others].map((s) => L(s.name))),
		answer: L(site.name)
	};
}
function GamesPage() {
	const { t, L } = useI18n();
	const { state, addGameResult } = useProgress();
	const [mode, setMode] = (0, import_react.useState)(null);
	const [question, setQuestion] = (0, import_react.useState)(null);
	const [picked, setPicked] = (0, import_react.useState)(null);
	const [round, setRound] = (0, import_react.useState)(1);
	const [score, setScore] = (0, import_react.useState)(0);
	const lvl = (0, import_react.useMemo)(() => levelFromXp(state.xp), [state.xp]);
	function start(next) {
		setMode(next);
		setRound(1);
		setScore(0);
		setPicked(null);
		setQuestion(buildQuestion(next, L));
	}
	function pick(option) {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl px-4 py-8 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-semibold sm:text-4xl",
					children: t("games_title")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: t("games_sub")
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-8 flex flex-wrap items-center gap-4 rounded-2xl surface-panel p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary font-display text-xl font-bold text-primary-foreground",
					children: lvl.level
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-[200px] flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between text-xs font-semibold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							t("level"),
							" ",
							lvl.level
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted-foreground",
							children: [
								state.xp,
								" XP · ",
								lvl.toNext,
								" ",
								t("xp_to_next")
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 h-2 overflow-hidden rounded-full bg-secondary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full rounded-full bg-gold",
							style: { width: `${lvl.progress}%` }
						})
					})]
				})]
			}),
			!mode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
				children: modes.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => start(m.id),
					className: "rounded-2xl surface-panel p-5 text-left lift",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gamepad2, { className: "h-6 w-6 text-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-3 font-display text-lg font-semibold",
							children: t(m.title)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: t(m.desc)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-4 inline-block rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground",
							children: t("play")
						})
					]
				}, m.id))
			}) : question && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl surface-panel p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between text-xs font-semibold text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							t("question"),
							" ",
							round
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							t("score"),
							": ",
							score
						] })]
					}),
					question.image && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: question.image,
						alt: "",
						loading: "lazy",
						width: 1200,
						height: 800,
						className: "mt-4 h-56 w-full rounded-xl object-cover"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 font-display text-2xl font-semibold",
						children: question.prompt
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5 grid gap-2 sm:grid-cols-2",
						children: question.options.map((option) => {
							const isAnswer = option === question.answer;
							const chosen = picked === option;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => pick(option),
								disabled: Boolean(picked),
								className: `flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${picked ? isAnswer ? "border-success bg-success/15 text-foreground" : chosen ? "border-destructive bg-destructive/10" : "border-border opacity-60" : "border-border bg-card hover:border-primary"}`,
								children: [
									option,
									picked && isAnswer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4 text-success" }),
									picked && chosen && !isAnswer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4 text-destructive" })
								]
							}, option);
						})
					}),
					picked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 flex items-center gap-2 text-sm font-semibold",
						children: picked === question.answer ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4 text-gold" }),
							" ",
							t("correct"),
							" +",
							10,
							" ",
							t("earned_xp")
						] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4 text-destructive" }),
							" ",
							t("wrong"),
							" — ",
							question.answer
						] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: nextQuestion,
							disabled: !picked,
							className: "rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40",
							children: t("next_question")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setMode(null),
							className: "flex items-center gap-1.5 rounded-full border border-border px-5 py-2.5 text-sm font-semibold",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-4 w-4" }),
								" ",
								t("finish")
							]
						})]
					})
				]
			})
		]
	});
}
//#endregion
export { GamesPage as component };
