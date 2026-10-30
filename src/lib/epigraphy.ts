/**
 * The words cut into the stone of the reconstructions, and the letters they
 * are cut in.
 *
 * Every text here was really on the building — or, where nothing of the
 * building's own lettering survives, is a formula of exactly the kind such a
 * building carried, and says so (`attested: false`). No one's name is put on
 * a stone that did not carry it. Each entry names its edition and a page
 * where the text can be read; the restorations editors have made in gaps are
 * cut here as letters like the rest, because the model shows the stone new.
 *
 * The letters are drawn from strokes, not from a font: the capitals of a
 * Greek or Latin inscription are a few straight cuts and arcs of even width,
 * and drawing them the same way on every machine means a statue base reads
 * the same on a phone as in a test. This module is pure data and arithmetic
 * — the renderer turns it into a texture (`components/scene/lettering.ts`).
 */

export type Script =
  /** Greek capitals with the four-barred sigma, as cut in the Hellenistic period. */
  | "greek"
  /** Greek capitals with the lunate sigma (Ϲ), as most Roman imperial stones have them. */
  | "greek-lunate"
  | "latin";

/**
 * How the letters were made: chiselled, painted on plaster, or scratched into
 * it — or chiselled and then filled with red paint, as Roman inscriptions
 * meant to be read from a distance were (rubrication: minium or red ochre in
 * the grooves; traces survive on many stones). `gilded` is the grandest of
 * all: letters cast in bronze, gilded and pinned into sockets cut for them —
 * which is why on such stones only the sockets and the pin holes survive.
 */
export type Finish = "cut" | "rubricated" | "painted" | "scratched" | "gilded";

export type EpigraphicText = {
  /**
   * The text in capitals. A string is wrapped to the space it is given; an
   * array keeps the stone's own line breaks.
   */
  text: string | string[];
  script: Script;
  /** `grc` ancient Greek, `la` Latin. */
  lang: "grc" | "la";
  finish?: Finish;
  /** The edition, as epigraphers cite it. */
  ref: string;
  /** Where to read it. */
  source: string;
  /** False for a formula typical of the building and period, not this building's own text. */
  attested: boolean;
  note?: string;
};

/** What a lettered part carries: the lines as laid out, and the letter height they fit at. */
export type Lettering = {
  lines: string[];
  /** Cap height, metres. */
  letter: number;
  script: Script;
  lang: "grc" | "la";
  finish: Finish;
  ref: string;
  source: string;
  attested: boolean;
};

/* ------------------------------------------------------------------ *
 * The letters
 * ------------------------------------------------------------------ */

/** A straight cut from (x1, y1) to (x2, y2), in cap heights, y up from the baseline. */
type Line = ["l", number, number, number, number];
/** An arc of an ellipse about (cx, cy), from angle a0 to a1 (radians, anticlockwise if a1 > a0). */
type Arc = ["a", number, number, number, number, number, number];
/** A dot: the interpunct between words. */
type Dot = ["d", number, number];
export type Stroke = Line | Arc | Dot;
export type Glyph = { width: number; strokes: Stroke[] };

const D = Math.PI / 180;
const l = (x1: number, y1: number, x2: number, y2: number): Line => ["l", x1, y1, x2, y2];
const a = (cx: number, cy: number, rx: number, ry: number, from: number, to: number): Arc => [
  "a",
  cx,
  cy,
  rx,
  ry,
  from * D,
  to * D,
];

const ROUND = (w: number): Stroke[] => [a(w / 2, 0.5, w / 2, 0.5, 0, 360)];

/*
 * The capitals, after the even-stroked lettering of Hellenistic and Roman
 * stones: round letters full height, Μ with splayed legs, Σ with four bars,
 * Ω open at the foot. Latin letters share the Greek shapes where they are
 * the same letter.
 */
const SHAPES: Record<string, Glyph> = {
  A: { width: 0.78, strokes: [l(0, 0, 0.39, 1), l(0.39, 1, 0.78, 0), l(0.17, 0.38, 0.61, 0.38)] },
  B: {
    width: 0.6,
    strokes: [
      l(0, 0, 0, 1),
      l(0, 1, 0.34, 1),
      a(0.34, 0.76, 0.24, 0.24, 90, -90),
      l(0.34, 0.52, 0, 0.52),
      l(0, 0.52, 0.36, 0.52),
      a(0.36, 0.26, 0.26, 0.26, 90, -90),
      l(0.36, 0, 0, 0),
    ],
  },
  C: { width: 0.74, strokes: [a(0.42, 0.5, 0.42, 0.5, 42, 318)] },
  D: {
    width: 0.74,
    strokes: [l(0, 0, 0, 1), l(0, 1, 0.3, 1), a(0.3, 0.5, 0.44, 0.5, 90, -90), l(0.3, 0, 0, 0)],
  },
  E: {
    width: 0.54,
    strokes: [l(0, 0, 0, 1), l(0, 1, 0.54, 1), l(0, 0.5, 0.44, 0.5), l(0, 0, 0.54, 0)],
  },
  F: { width: 0.52, strokes: [l(0, 0, 0, 1), l(0, 1, 0.52, 1), l(0, 0.52, 0.42, 0.52)] },
  G: {
    width: 0.76,
    strokes: [
      a(0.42, 0.5, 0.42, 0.5, 42, 325),
      l(0.76, 0.23, 0.76, 0.44),
      l(0.5, 0.44, 0.76, 0.44),
    ],
  },
  H: { width: 0.66, strokes: [l(0, 0, 0, 1), l(0.66, 0, 0.66, 1), l(0, 0.5, 0.66, 0.5)] },
  I: { width: 0, strokes: [l(0, 0, 0, 1)] },
  K: { width: 0.62, strokes: [l(0, 0, 0, 1), l(0.62, 1, 0.04, 0.48), l(0.18, 0.6, 0.64, 0)] },
  L: { width: 0.52, strokes: [l(0, 1, 0, 0), l(0, 0, 0.52, 0)] },
  M: {
    width: 0.9,
    strokes: [l(0, 0, 0.06, 1), l(0.06, 1, 0.45, 0.02), l(0.45, 0.02, 0.84, 1), l(0.84, 1, 0.9, 0)],
  },
  N: { width: 0.68, strokes: [l(0, 0, 0, 1), l(0, 1, 0.68, 0), l(0.68, 0, 0.68, 1)] },
  O: { width: 0.8, strokes: ROUND(0.8) },
  P: {
    width: 0.56,
    strokes: [
      l(0, 0, 0, 1),
      l(0, 1, 0.3, 1),
      a(0.3, 0.75, 0.26, 0.25, 90, -90),
      l(0.3, 0.5, 0, 0.5),
    ],
  },
  Q: { width: 0.82, strokes: [...ROUND(0.8), l(0.48, 0.1, 0.9, -0.14)] },
  R: {
    width: 0.62,
    strokes: [
      l(0, 0, 0, 1),
      l(0, 1, 0.3, 1),
      a(0.3, 0.75, 0.26, 0.25, 90, -90),
      l(0.3, 0.5, 0, 0.5),
      l(0.28, 0.5, 0.62, 0),
    ],
  },
  S: {
    width: 0.56,
    strokes: [a(0.29, 0.75, 0.27, 0.25, 25, 270), a(0.29, 0.25, 0.28, 0.25, 90, -155)],
  },
  T: { width: 0.7, strokes: [l(0, 1, 0.7, 1), l(0.35, 1, 0.35, 0)] },
  V: { width: 0.74, strokes: [l(0, 1, 0.37, 0), l(0.37, 0, 0.74, 1)] },
  X: { width: 0.7, strokes: [l(0, 0, 0.7, 1), l(0, 1, 0.7, 0)] },
  Y: {
    width: 0.72,
    strokes: [l(0, 1, 0.36, 0.48), l(0.72, 1, 0.36, 0.48), l(0.36, 0.48, 0.36, 0)],
  },
  Z: { width: 0.62, strokes: [l(0, 1, 0.62, 1), l(0.62, 1, 0, 0), l(0, 0, 0.62, 0)] },
  // Greek letters with no Latin twin.
  Γ: { width: 0.52, strokes: [l(0, 0, 0, 1), l(0, 1, 0.52, 1)] },
  Δ: { width: 0.78, strokes: [l(0, 0, 0.39, 1), l(0.39, 1, 0.78, 0), l(0, 0, 0.78, 0)] },
  Θ: { width: 0.8, strokes: [...ROUND(0.8), l(0.24, 0.5, 0.56, 0.5)] },
  Λ: { width: 0.76, strokes: [l(0, 0, 0.38, 1), l(0.38, 1, 0.76, 0)] },
  Ξ: { width: 0.62, strokes: [l(0, 1, 0.62, 1), l(0.1, 0.5, 0.52, 0.5), l(0, 0, 0.62, 0)] },
  Π: { width: 0.66, strokes: [l(0, 0, 0, 1), l(-0.04, 1, 0.7, 1), l(0.66, 1, 0.66, 0)] },
  Σ: {
    width: 0.62,
    strokes: [l(0.62, 0.96, 0, 1), l(0, 1, 0.34, 0.5), l(0.34, 0.5, 0, 0), l(0, 0, 0.62, 0.04)],
  },
  Ϲ: { width: 0.66, strokes: [a(0.4, 0.5, 0.4, 0.5, 48, 312)] },
  Φ: { width: 0.84, strokes: [l(0.42, 0, 0.42, 1), a(0.42, 0.55, 0.42, 0.29, 0, 360)] },
  Ψ: { width: 0.8, strokes: [l(0.4, 0, 0.4, 1), a(0.4, 0.72, 0.4, 0.34, 180, 360)] },
  Ω: {
    width: 0.86,
    strokes: [
      a(0.43, 0.56, 0.4, 0.44, -58, 238),
      l(0.22, 0.19, 0.2, 0),
      l(0.64, 0.19, 0.66, 0),
      l(0, 0, 0.26, 0),
      l(0.6, 0, 0.86, 0),
    ],
  },
  // Stigma, the numeral six.
  Ϛ: { width: 0.62, strokes: [a(0.36, 0.5, 0.36, 0.5, 70, 300), l(0.48, 0.97, 0.66, 0.8)] },
  // The interpunct of Latin lettering, and the leaf a Greek stone ends with.
  "·": { width: 0.12, strokes: [["d", 0.06, 0.45]] },
};

/** Greek capitals that look like Latin ones are drawn with the Latin shape. */
const GREEK_ALIASES: Record<string, string> = {
  Α: "A",
  Β: "B",
  Ε: "E",
  Ζ: "Z",
  Η: "H",
  Ι: "I",
  Κ: "K",
  Μ: "M",
  Ν: "N",
  Ο: "O",
  Ρ: "P",
  Τ: "T",
  Υ: "Y",
  Χ: "X",
};

/** The glyph for a character, or undefined when there is none (a space has none). */
export function glyphOf(char: string): Glyph | undefined {
  return SHAPES[GREEK_ALIASES[char] ?? char];
}

/** The gap between letters and the width of a word space, in cap heights. */
export const TRACKING = 0.2;
export const SPACE = 0.55;
/** How wide a cut is, in cap heights. */
export const STROKE = 0.115;
/** Baseline to baseline, in cap heights. */
export const LEADING = 1.55;

/** How long a line is, in cap heights, edge of the first cut to edge of the last. */
export function measure(line: string): number {
  let width = 0;
  let previous = false;
  for (const char of line) {
    if (char === " ") {
      width += SPACE;
      previous = false;
      continue;
    }
    const glyph = glyphOf(char);
    if (!glyph) continue;
    if (previous) width += TRACKING;
    width += glyph.width + STROKE;
    previous = true;
  }
  return width;
}

/**
 * The text as it would be cut: capitals without accents or breathings, the
 * editors' brackets dropped, and in a Roman Greek text the lunate sigma.
 */
export function asCut(text: string, script: Script): string {
  let out = text
    .normalize("NFD")
    // Expansions of abbreviations, Τι(βέριος), were never on the stone.
    .replace(/\([^)]*\)/g, "")
    .replace(/[\u0300-\u036f\u0345]/g, "")
    .replace(/[[\]{}\u27e6\u27e7\u301a\u301b<>|?!.,;:'\u2019\u02b9-]/g, "")
    .replace(/\u03c2/g, "\u03c3")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();
  // The Greek high stop is not a letter; Latin keeps its interpuncts.
  if (script !== "latin") out = out.replace(/[\u00b7\u0387]/g, "");
  if (script === "greek-lunate") out = out.replace(/\u03a3/g, "\u03f9");
  if (script === "greek") out = out.replace(/\u03f9/g, "\u03a3");
  return out;
}

/** Breaks a text into lines no longer than `width` cap heights, at word ends. */
export function wrap(text: string, width: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(next) > width) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * Lays a text out in a field: its own lines, or wrapped to fill the width,
 * and the letter height that fits it — never taller than `letter`, and no
 * more than `rows` lines (or `height` metres) tall.
 */
export function layout(
  source: EpigraphicText,
  field: { width: number; letter: number; rows?: number; height?: number },
): Lettering {
  const finish = source.finish ?? "cut";
  const base = {
    script: source.script,
    lang: source.lang,
    finish,
    ref: source.ref,
    source: source.source,
    attested: source.attested,
  };
  if (Array.isArray(source.text)) {
    const lines = source.text.map((line) => asCut(line, source.script));
    const widest = Math.max(...lines.map(measure));
    let letter = Math.min(field.letter, field.width / widest);
    if (field.height !== undefined)
      letter = Math.min(letter, field.height / (1 + (lines.length - 1) * LEADING));
    return { lines, letter, ...base };
  }
  const text = asCut(source.text, source.script);
  const rows = field.rows ?? 1;
  // Wrapped at the full letter height; if that runs over the rows, shrink until it fits.
  let letter = field.letter;
  let lines = wrap(text, field.width / letter);
  const tooTall = () =>
    field.height !== undefined && letter * (1 + (lines.length - 1) * LEADING) > field.height;
  for (let i = 0; i < 60 && (lines.length > rows || tooTall()); i += 1) {
    letter *= 0.96;
    lines = wrap(text, field.width / letter);
  }
  const widest = Math.max(...lines.map(measure));
  letter = Math.min(letter, field.width / widest);
  if (field.height !== undefined)
    letter = Math.min(letter, field.height / (1 + (lines.length - 1) * LEADING));
  return { lines, letter, ...base };
}

/**
 * The same text without the stone's line breaks, to be wrapped afresh to a
 * different field: a word broken across two lines is joined again.
 */
export function flowing(source: EpigraphicText): EpigraphicText {
  if (!Array.isArray(source.text)) return source;
  return { ...source, text: source.text.join("\n").replace(/-\n/g, "").replace(/\n/g, " ") };
}

/** How wide and tall a laid-out text stands, in metres. */
export function extent(lettering: Lettering): [number, number] {
  const widest = Math.max(...lettering.lines.map(measure));
  return [
    widest * lettering.letter,
    lettering.letter * (1 + (lettering.lines.length - 1) * LEADING),
  ];
}

/**
 * Splits a text into runs at word ends, one for each stretch of stone it is
 * carried across, each as long as its stretch is wide: one dedication along
 * an architrave broken by projecting columns.
 */
export function runs(text: string | string[], widths: number[], script: Script): string[] {
  const words = asCut(Array.isArray(text) ? text.join(" ") : text, script).split(" ");
  const total = measure(words.join(" "));
  const sum = widths.reduce((acc, w) => acc + w, 0);
  const out: string[] = [];
  let current: string[] = [];
  let done = 0;
  let share = (widths[0]! / sum) * total;
  for (const word of words) {
    const length = measure(word) + SPACE;
    // Close this run if the word would take it further past its share than short of it.
    if (current.length && out.length < widths.length - 1 && done + length / 2 > share) {
      out.push(current.join(" "));
      current = [];
      share += (widths[out.length]! / sum) * total;
    }
    current.push(word);
    done += length;
  }
  out.push(current.join(" "));
  while (out.length < widths.length) out.push("");
  return out;
}

/* ------------------------------------------------------------------ *
 * The texts
 * ------------------------------------------------------------------ */

const PHI = (id: number) => `https://epigraphy.packhum.org/text/${id}`;

/**
 * The inscriptions, by where they go. Majuscule as cut; the references are
 * the corpus numbers, the sources the pages they were read from.
 */
export const TEXTS = {
  /* -------- Ephesus: the Library of Celsus (c. AD 110-135) -------- */
  /**
   * The building inscription on the architrave: Ti. Julius Aquila, consul,
   * built the library for his father Celsus, proconsul of Asia; his heirs
   * finished it, Ti. Claudius Aristion overseeing. IEph 5101.
   */
  celsusArchitrave: {
    text: "Τι(βέριον) Ἰούλιον Κέλσον Πολεμαιανὸν ὕπατον ἀνθύπατον Ἀσίας Τι(βέριος) Ἰούλιος Ἀκύλας ὕπατος ὁ υἱὸς κατεσεύασεν τὴν βιβλιοθήκην τὸ ἔργον ἀπαρτισάντων τῶν Ἀκύλα κληρονόμων ἐπιμεληθέντος Τι(βερίου) Κλ(αυδίου) Ἀριστίωνος γʹ ἀσιάρχου",
    script: "greek-lunate",
    lang: "grc",
    ref: "IEph 5101 (FiE V 1 no. 1)",
    source: PHI(248043),
    attested: true,
    note: "Abbreviations cut as on the stone (ΤΙ, ΚΛ); ΚΑΤΕΣΕΥΑΣΕΝ as the edition prints it.",
  },
  /** The four virtues' bases: Sophia, Arete, Ennoia and Episteme "of Celsus". */
  celsusSophia: {
    text: ["Σοφία", "Κέλσου"],
    script: "greek-lunate",
    lang: "grc",
    ref: "IEph 5108",
    source: PHI(248951),
    attested: true,
  },
  celsusArete: {
    text: ["Ἀρετὴ", "Κέλσου"],
    script: "greek-lunate",
    lang: "grc",
    ref: "IEph 5109 (Ephesos 1230)",
    source: PHI(248952),
    attested: true,
  },
  celsusEnnoia: {
    text: ["Ἔννοια", "Κέλσου"],
    script: "greek-lunate",
    lang: "grc",
    ref: "by analogy with IEph 5108-5110",
    source: PHI(248951),
    attested: false,
    note: "The Ennoia base's text is not in the corpus; it is cut on the pattern of its three companions.",
  },
  celsusEpisteme: {
    text: ["Ἐπιστήμη", "Κέλσου"],
    script: "greek-lunate",
    lang: "grc",
    ref: "IEph 5110 (Ephesos 1231)",
    source: PHI(248953),
    attested: true,
  },
  /** A statue base of Celsus set up by his daughter Julia Quintilia Isaurica. */
  celsusByDaughter: {
    text: [
      "Τι(βέριον) Ἰούλιον",
      "Κέλσον",
      "Πολεμαιανόν",
      "ὕπατον ἀνθύ-",
      "πατον Ἀσίας",
      "Ἰουλία Κυϊντι-",
      "λία Ἰσαύρικα",
      "τὸν ἴδιον",
      "πατέρα",
    ],
    script: "greek-lunate",
    lang: "grc",
    ref: "IEph 5104",
    source: PHI(248948),
    attested: true,
  },
  /** And one set up by his grandson Ti. Claudius Julianus, c. AD 143. */
  celsusByGrandson: {
    text: [
      "Τι(βέριον) Ἰούλιον",
      "Κέλσον Πολε-",
      "μαιανόν ὕπατον",
      "ἀνθύπατον Ἀσίας",
      "Τι(βέριος) Κλαύδιος Ἰουλι-",
      "ανός χειλίαρχος",
      "πλατύσημος λεγε-",
      "ῶνος δ Σκυθικῆς",
      "δήμαρχος Ῥωμαί-",
      "ων ταμίας Ἀχαίας",
      "πρεσβευτὴς Ἀχαί-",
      "ας στρατηγὸς Ῥω-",
      "μαίων τὸν ἑαυτοῦ",
      "πάππον",
    ],
    script: "greek-lunate",
    lang: "grc",
    ref: "IEph 5106",
    source: PHI(248950),
    attested: true,
  },
  /** The Greek face of the equestrian statue base at the stair: Celsus' career, set up by Aquila. */
  celsusRiderGreek: {
    text: [
      "Τι(βέριον) Ἰούλιον Τι(βερίου) υἱὸν Κορνηλία",
      "Κέλσον Πολεμαιανὸν",
      "ὕπατον ἀνθύπατον Ἀσίας",
      "χειλίαρχον λεγιῶνος γ Κυρηναϊκῆς",
      "καὶ ἀγορανόμον καταλεγέντα ὑπὸ θεοῦ Οὐεσπασιανοῦ",
      "στρατηγὸν δήμου Ῥωμαίων πρεσβευτὴν θεοῦ Οὐεσπασιανοῦ καὶ θεοῦ",
      "Τίτου ἐπαρχειῶν Καππαδοκίας Γαλατίας Πόντου Πισιδίας Παφλαγονίας",
      "Ἀρμενίας πρεσβευτὴν θεοῦ Τίτου καὶ Αὐτοκράτορος Σεβαστοῦ λεγιῶνος δ",
      "Σκυθικῆς ἀνθύπατον Πόντου καὶ Βειθυνίας ἔπαρχον αἰραρίου στρατιωτικοῦ",
      "πρεσβευτὴν Αὐτοκράτορος Καίσαρος Σεβαστοῦ ἐπαρχείας Κιλικίας γενόμενον δὲ καὶ",
      "ἐπὶ ἔργων δημοσίων τῶν ἐν Ῥώμῃ Τι(βέριος) Ἰούλιος Ἀκύλας Πολεμαιανὸς ὕπατος",
      "τὸν ἑαυτοῦ πατέρα ἀπαρτισάντων τῶν κληρονόμων Ἀκύλα",
    ],
    script: "greek-lunate",
    lang: "grc",
    ref: "IEph 5102",
    source: PHI(248946),
    attested: true,
  },
  /** The Latin face: the same dedication, shortened as it is usually quoted. */
  celsusRiderLatin: {
    text: [
      "TI·IVLIO·TI·F",
      "CELSO·POLEMAEANO",
      "COS·PROCOS·ASIAE",
      "TI·IVLIVS·AQVILA",
      "COS·FECIT",
    ],
    script: "latin",
    lang: "la",
    ref: "ILS 8971 (AE 1904, 99), as quoted at Livius.org",
    source:
      "https://www.livius.org/pictures/turkey/selcuk-ephesus/ephesus-library-of-celsus/ephesus-library-of-celsus-latin-inscription/",
    attested: true,
    note: "The stone gives Celsus' full career in Latin; only the opening and the dedicator are cut here.",
  },

  /* -------- Ephesus: the statue bases lining Curetes Street -------- */
  /**
   * The street was lined with honorific statues on inscribed bases, set up
   * by the council and the people to benefactors and officials. Which base
   * stood where is not recorded for every one, so the bases here carry the
   * formula they share rather than any one man's career.
   */
  ephesusHonorificCouncil: {
    text: ["Ἡ βουλὴ καὶ ὁ δῆμος", "ἐτείμησεν"],
    script: "greek-lunate",
    lang: "grc",
    ref: "formula of Ephesian honorific bases of the Roman period",
    source: PHI(248946),
    attested: false,
    note: "The common formula; no single base is copied. The source is the library's own honorific base, for the lettering of the period.",
  },
  ephesusHonorificPeople: {
    text: ["Ὁ δῆμος", "τὸν εὐεργέτην"],
    script: "greek-lunate",
    lang: "grc",
    ref: "formula of Ephesian honorific bases of the Roman period",
    source: PHI(248946),
    attested: false,
    note: "The common formula; no single base is copied.",
  },

  /* -------- Ephesus: the Gate of Mazaeus and Mithridates (4/3 BC) -------- */
  /**
   * The gate's three dedications, one over each opening, in letters of gilded
   * bronze of which only the sockets survive. Over the left opening, Latin:
   * to Augustus and Livia; over the right, Latin: to Agrippa and Julia — both
   * set up by Mazaeus and Mithridates, freedmen of the two, to their patrons.
   */
  gateAugustus: {
    text: [
      "IMP·CAESARI·DIVI·F·AVGVSTO·PONTIFICI·MAXIMO",
      "COS·XII·TRIBVNIC·POTEST·XX·ET·LIVIAE·CAESARIS·AVGVSTI",
      "MAZAEVS·ET·MITHRIDATES·PATRONIS",
    ],
    script: "latin",
    lang: "la",
    finish: "gilded",
    ref: "IEph 3006; EDCS-05300041",
    source: "https://www.turkisharchaeonews.net/object/gate-mazaeus-and-mithridates-ephesus",
    attested: true,
    note: "LIVIAE CAESARIS AVGVSTI as on the stone. Line breaks and letter heights are the model's.",
  },
  gateAgrippa: {
    text: [
      "M·AGRIPPAE·L·F·COS·TERT·IMB·TRIBVNIC·POTEST·VI",
      "ET·IVLIAE·CAESARIS·AVGVSTI·F",
      "MAZAEVS·ET·MITHRIDATES·PATRONIS",
    ],
    script: "latin",
    lang: "la",
    finish: "gilded",
    ref: "IEph 3006; EDCS-05300041",
    source: "https://www.turkisharchaeonews.net/object/gate-mazaeus-and-mithridates-ephesus",
    attested: true,
    note: "IMB (for IMP) as cut on the stone.",
  },
  /** Over the middle opening, the Greek: to their patrons, and to the people. */
  gateGreek: {
    text: ["ΜΑΖΑΙΟΣ ΚΑΙ ΜΙΘΡΙΔΑΤΗΣ", "ΤΟΙΣ ΠΑΤΡΩΣΙ ΚΑΙ ΤΩΙ ΔΗΜΩΙ"],
    script: "greek",
    lang: "grc",
    finish: "gilded",
    ref: "IEph 3006",
    source: "https://www.turkisharchaeonews.net/object/gate-mazaeus-and-mithridates-ephesus",
    attested: true,
    note: "Restored where the stone is broken (Μαζ[αῖ]ος, τ[οῖς] πά[τ]ρωσι).",
  },

  /* -------- Ephesus: the Temple of Artemis (4th century BC) -------- */
  /**
   * Nothing of the late classical temple's own lettering survives (Croesus'
   * dedication is on the columns of the archaic temple it replaced). The
   * dedication to the goddess is the formula Ephesian dedications open with.
   */
  artemisDedication: {
    text: "Ἀρτέμιδι Ἐφεσίαι",
    script: "greek",
    lang: "grc",
    ref: "formula, e.g. IEph 266, 272",
    source: PHI(247974),
    attested: false,
  },

  /* -------- Didyma: the Temple of Apollo (from c. 300 BC) -------- */
  didymaDedication: {
    text: "Ἀπόλλωνι Διδυμεῖ",
    script: "greek",
    lang: "grc",
    ref: "formula, e.g. Didyma 156, 157",
    source: PHI(247147),
    attested: false,
    note: "The dedication formula of the sanctuary's offerings; the temple's own architrave is uninscribed in the record.",
  },

  /* -------- Aizanoi: the Temple of Zeus (AD 92-95) -------- */
  aizanoiDedication: {
    text: "Διὶ Αἰζανῶν καὶ Αὐτοκράτορι",
    script: "greek-lunate",
    lang: "grc",
    ref: "formula of MAMA IX 10",
    source: PHI(270354),
    attested: false,
    note: "The temple's own dedication was in bronze letters now known only from their dowel holes.",
  },
  /**
   * A proconsul's letter to the city, of the kind cut on the temple's walls
   * in the dossier about the sanctuary's land. Its exact place on the
   * building is not recorded here.
   */
  aizanoiLetter: {
    text: [
      "Ποστουμεῖνος ἀνθύπατος Αἰζανειτῶν ἄρ-",
      "χουσι βουλῇ δήμῳ χαίρειν κατὰ μὲν",
      "τὴν πρώτην ἀρχήν μου τῆς ἀνθυπατείας ἀκόλου-",
      "θόν τε ταῖς ἐντολαῖς ἡγησάμενος καὶ ἀνανκαῖον τῇ πό-",
      "λι ποιήσασθαι τὴν παρ’ ὑμεῖν ἐπιδημίαν ἧκον ἑτοί-",
      "μως ἰδὼν δὲ πόλιν εὐγενῆ τε καὶ ἀρχαίαν ἅμα δὲ",
      "νεωστί τε τοῖς κατασκευαζομένοις οὐδενὸς δευτέραν",
      "τῶν ἀκμάζειν δοκουσῶν",
    ],
    script: "greek-lunate",
    lang: "grc",
    ref: "MAMA IX List 179, P24 (IGR IV 572)",
    source: PHI(272640),
    attested: true,
    note: "A real letter to Aizanoi; that it stood on this wall is the model's placing.",
  },

  /* -------- Pergamon: the Great Altar (c. 170-159 BC) -------- */
  /** The gods, named on the cornice above their heads (IvP I 87-105). */
  pergamonGods: {
    text: [
      "Ἀμφιτρίτη",
      "Νηρεύς",
      "Ἄρης",
      "Ἀστερίη",
      "Ἀφροδίτη",
      "Γῆ",
      "Διώνη",
      "Ἐνυώ",
      "Ἥβη",
      "Ἥρα",
      "Ἡρακλῆς",
      "Θέμις",
      "Κλωθώ",
      "Λητώ",
      "Ποσειδῶν",
      "Τρίτων",
      "Ὠκεανός",
    ],
    script: "greek",
    lang: "grc",
    ref: "IvP I 87-105",
    source: PHI(301711),
    attested: true,
    note: "Each name is one inscription; IvP I 87 Amphitrite, 87a Nereus, 88 Ares, 89 Asterie, 90 Aphrodite, 91 Ge, 92 Dione, 93 Enyo, 95 Hebe, 96 Hera, 97 Herakles, 99 Themis, 100 Klotho, 101 Leto, 103 Poseidon, 104 Triton, 105 Okeanos.",
  },
  /** The giants, named on the moulding under their feet (IvP I 116-126+). */
  pergamonGiants: {
    text: ["Ὄβριμος", "Ὀλύκτωρ", "Οὐδαῖος", "Ὀχθαῖος", "Σθέναρος", "Στύφελος", "Πορφυρίων"],
    script: "greek",
    lang: "grc",
    ref: "IvP I 116-121, 126+ (SEG 44.996)",
    source: PHI(301740),
    attested: true,
  },
  /** The one sculptor's signature found on the cornice, on the south risalit. */
  pergamonSignature: {
    text: ["Θεόρρητος"],
    script: "greek",
    lang: "grc",
    ref: "signature on the cornice of the south risalit",
    source: "https://en.wikipedia.org/wiki/Pergamon_Altar",
    attested: true,
  },

  /* -------- Nemrut: Antiochos I's law, on the backs of the thrones (before 31 BC) -------- */
  nemrutNomos: {
    text: [
      "βασιλεὺς μέγας Ἀντίοχος θεὸς",
      "Δίκαιος Ἐπιφανὴς Φιλορώμαιος καὶ",
      "Φιλέλλην ὁ ἐκ βασιλέως Μιθραδά-",
      "του Καλλινίκου καὶ βασιλίσσης Λαο-",
      "δίκης θεᾶς Φιλαδέλφου τῆς ἐκ βασι-",
      "λέως Ἀντιόχου Ἐπιφανοῦς Φιλο-",
      "μήτορος Καλλινίκου ἐπὶ καθω-",
      "σιωμένων βάσεων ἀσύλοις",
      "γράμμασιν ἔργα χάριτος ἰδίας εἰς",
      "χρόνον ἀνέγραψεν αἰώνιον",
      "ἐγὼ πάντων ἀγαθῶν οὐ μόνον κτῆ-",
      "σιν βεβαιοτάτην ἀλλὰ καὶ ἀπόλαυ-",
      "σιν ἡδίστην ἀνθρώποις ἐνόμισα τὴν",
      "εὐσέβειαν τὴν αὐτήν τε κρίσιν καὶ",
      "δυνάμεως εὐτυχοῦς καὶ χρήσε-",
      "ως μακαριστῆς αἰτίαν ἔσχον παρ’ ὅ-",
      "λον τε τὸν βίον ὤφθην ἅπασι βασιλείας",
      "ἐμῆς καὶ φύλακα πιστοτάτην καὶ",
      "τέρψιν ἀμίμητον ἡγούμενος τὴν ὁσιότη-",
      "τα δι’ ἃ καὶ κινδύνους μεγάλους παραδό-",
      "ξως διέφυγον καὶ πράξεων δυσελπίστων",
      "εὐμηχάνως ἐπεκράτησα καὶ βίου πολυ-",
      "ετοῦς μακαριστῶς ἐπληρώθην",
      "ἐγὼ πατρώιαν ἀρχὴν παραλαβὼν",
      "βασιλείαν μὲν ἐμοῖς ὑπήκοον θρό-",
      "νοις κοινὴν θεῶν ἁπάντων εὐσεβείαι",
      "γνώμης ἐμῆς δίαιταν ἀπέδειξα μορ-",
      "φῆς μὲν εἰκόνας παντοίαι τέχνηι κα-",
      "θ’ ἃ παλαιὸς λόγος Περσῶν τε καὶ",
      "Ἑλλήνων ἐμοῦ γένους εὐτυχεσ-",
    ],
    script: "greek",
    lang: "grc",
    ref: "IGLSyr 1, 1 (OGIS 383), lines 1-30",
    source: PHI(242074),
    attested: true,
  },

  /* -------- Miletus: the theatre -------- */
  /** The seat of "the Jews, who are also God-fearers". */
  miletusJews: {
    text: ["τόπος Εἰουδέων", "τῶν καὶ Θεοσεβίον"],
    script: "greek-lunate",
    lang: "grc",
    ref: "Milet VI,2 940 III f (Miletos 436)",
    source: PHI(351674),
    attested: true,
  },
  /** The goldsmiths' seats (aurarii), one of them of the Blues. */
  miletusGoldsmiths: {
    text: ["τόπος αὐραρίων Βενέτων"],
    script: "greek-lunate",
    lang: "grc",
    ref: "Milet VI,2 940 I a",
    source: PHI(351669),
    attested: true,
  },
  miletusGoldsmiths2: {
    text: ["τόπος φιλαγούστον αὐραρίον"],
    script: "greek-lunate",
    lang: "grc",
    ref: "Milet VI,2 940 I d",
    source: PHI(351672),
    attested: true,
  },
  /** The honorific pillar in the east parodos, for the Asiarch M. Antonius Apollodoros. */
  miletusApollodoros: {
    text: [
      "ἀγαθῆι τύχηι",
      "Μ(ᾶρκον) Ἀντώνιον Ἀπολλόδωρον",
      "τὸν ἀσιάρχην",
      "καὶ ἴδιον ἐν πᾶσιν εὐεργέτην",
      "ἡ πατρίς",
    ],
    script: "greek-lunate",
    lang: "grc",
    ref: "Milet VI,2 936",
    source: PHI(351665),
    attested: true,
  },

  /* -------- Aspendos: the theatre (AD 161-180) -------- */
  /** The bilingual dedication of the theatre by the Curtii, cut twice at the theatre. */
  aspendosLatin: {
    text: [
      "DIS·PATRIIS·ET·DOMVI·AVGVSTORVM",
      "EX·TESTAMENTO·A·CVRTII·CRISPINI·A·CVRTIVS·CRISPINVS·ARRVNTIANVS",
      "ET·A·CVRTIVS·AVSPICATVS·TITINNIANVS·FECERVNT",
    ],
    script: "latin",
    lang: "la",
    ref: "CIG 4342d4 (IGR III 803; LBW 1379)",
    source: PHI(276313),
    attested: true,
  },
  aspendosGreek: {
    text: [
      "θεοῖς πατρίοις καὶ τῷ οἴκῳ τῶν Σεβαστῶν",
      "ἐκ διαθήκης Α Κουρτίου Κρεισπείνου Α Κούρτιος Κρεισπεῖνος Ἀρρουντιανὸς",
      "καὶ Α Κούρτιος Αὐσπικᾶτος Τιτιννιανὸς ἐποίησαν",
    ],
    script: "greek-lunate",
    lang: "grc",
    ref: "CIG 4342d4 (IGR III 803; LBW 1379)",
    source: PHI(276313),
    attested: true,
  },

  /* -------- Hierapolis: the theatre (rebuilt under the Severans) -------- */
  /** The theatre's dedication to Apollo Archegetes and the emperors; the builder's name is lost. */
  hierapolisDedication: {
    text: [
      "Ἀπόλλωνι Ἀρχηγέτῃ καὶ τοῖς θεοῖς αὐτοκράτορσι",
      "τὸ θέατρον κατεσκεύασεν",
      "Αἰλιανοῦ καὶ Δημητρίου σὺν παντὶ τῷ κόσμῳ",
    ],
    script: "greek-lunate",
    lang: "grc",
    ref: "Alt. v. Hierapolis 4 (CIG 3905), lines 1, 3-4",
    source: PHI(271618),
    attested: true,
    note: "Lines 1, 3 and 4 only; the builder's name in line 2 is lost and is not supplied.",
  },

  /* -------- Ephesus: the Great Theatre -------- */
  /**
   * The opening of C. Vibius Salutaris' foundation of AD 104, the long text
   * cut on the theatre's south parodos wall: he gives to the council and
   * the people, for Artemis.
   */
  ephesusSalutaris: {
    text: [
      "Γάϊος Οὐείβιος Γ(αΐου) υἱός Οὐωφεντείνα Σαλουτάριος διάτα-",
      "ξιν εἰσφέρει τῇ Ἐφεσίων βουλῇ φιλοσεβάστῳ καὶ τῷ νεοκόρῳ",
      "Ἐφεσίων δήμῳ φιλοσεβάστῳ περὶ ὧν καθιέρωκεν ἐπὶ",
      "ταῖς ὑπογεγραμμέναις οἰκονομίαις τῇ μεγίστῃ θεᾷ Ἐφεσίᾳ Ἀρ-",
      "τέμιδι καὶ τῷ νεοκόρῳ Ἐφεσίων δήμῳ φιλοσεβάστῳ",
    ],
    script: "greek-lunate",
    lang: "grc",
    ref: "IEph 27 B, lines 139-143",
    source: PHI(247919),
    attested: true,
    note: "Much of these lines is restored by the editors from the rest of the dossier.",
  },
  ephesusStage: {
    text: "Ἀρτέμιδι Ἐφεσίᾳ καὶ Αὐτοκράτορι Καίσαρι Σεβαστῷ",
    script: "greek-lunate",
    lang: "grc",
    ref: "formula of Ephesian building dedications, e.g. IEph 261",
    source: PHI(247969),
    attested: false,
  },

  /* -------- Side and Perge: the formulas of the place -------- */
  sideStage: {
    text: "θεοῖς πατρίοις καὶ τῷ οἴκῳ τῶν Σεβαστῶν",
    script: "greek-lunate",
    lang: "grc",
    ref: "formula, as at Aspendos (CIG 4342d4)",
    source: PHI(276313),
    attested: false,
    note: "No dedication of Side's stage building is preserved; this is the Pamphylian formula of its neighbour.",
  },
  pergeGate: {
    text: "Ἀρτέμιδι Περγαίᾳ ἀσύλῳ",
    script: "greek-lunate",
    lang: "grc",
    ref: "formula, e.g. IK Perge 141, 245",
    source: PHI(313879),
    attested: false,
  },

  /* -------- Aphrodisias: the stadium seats -------- */
  aphrodisiasBlues: {
    text: ["Βενέτων"],
    script: "greek-lunate",
    lang: "grc",
    ref: "Roueché, PPAphr 45.3 K",
    source: PHI(264955),
    attested: true,
  },
  aphrodisiasGreens: {
    text: ["Πρασίνων"],
    script: "greek-lunate",
    lang: "grc",
    ref: "Roueché, PPAphr 45.4 A",
    source: PHI(264960),
    attested: true,
  },
  aphrodisiasPlace: {
    text: ["τόπος"],
    script: "greek-lunate",
    lang: "grc",
    ref: "Roueché, PPAphr 45.3 P",
    source: PHI(264956),
    attested: true,
  },
  aphrodisiasPlaceTribe: {
    text: ["τόπος φυλῆς"],
    script: "greek-lunate",
    lang: "grc",
    ref: "Roueché, PPAphr 45.2 T (one reading)",
    source: PHI(264952),
    attested: true,
  },
  aphrodisiasAlpha: {
    text: ["Α"],
    script: "greek-lunate",
    lang: "grc",
    ref: "Roueché, PPAphr 45.1 Y",
    source: PHI(264950),
    attested: true,
  },

  /* -------- Ephesus: the Terrace Houses -------- */
  /** A painted good-luck wish over a doorway, in the formula Ephesian texts open with. */
  houseGoodLuck: {
    text: ["ἀγαθῇ τύχῃ"],
    script: "greek-lunate",
    lang: "grc",
    finish: "painted",
    ref: "formula, e.g. IEph 3010",
    source:
      "https://www.livius.org/pictures/turkey/selcuk-ephesus/ephesus-library-of-celsus/ephesus-library-of-celsus-greek-inscription/",
    attested: false,
  },
  /** And "good luck!" scratched into the plaster, as the same stone ends. */
  houseGraffito: {
    text: ["εὐτυχῶς"],
    script: "greek-lunate",
    lang: "grc",
    finish: "scratched",
    ref: "formula, e.g. IEph 3010",
    source:
      "https://www.livius.org/pictures/turkey/selcuk-ephesus/ephesus-library-of-celsus/ephesus-library-of-celsus-greek-inscription/",
    attested: false,
  },

  /* -------- Honorific statues in the squares -------- */
  /** A real Ephesian statue base: Alexandros of Eumeneia for his friend C. Julius Kleon (AD 54/59). */
  ephesusHonorific: {
    text: [
      "Γάϊον Ἰούλιον",
      "Ἐπιγόνου υἱὸν",
      "Φαβία Κλέωνα",
      "τὸν ἀρχιερέα",
      "τῆς Ἀσίας",
      "χειλίαρχον λεγιῶνος",
      "Ϛ σιδηρᾶς",
      "Ἀλέξανδρος Μενάνδρου",
      "Εὐμενεὺς ὁ καὶ Ἐφέσιος",
      "τὸν ἑαυτοῦ φίλον",
    ],
    script: "greek-lunate",
    lang: "grc",
    ref: "IEph 688 (Ephesos 1232)",
    source: PHI(248954),
    attested: true,
  },
  /** The bare honorific formula — the council and the people honoured — with the name left worn. */
  honorificFormula: {
    text: ["ἡ βουλὴ καὶ ὁ δῆμος", "ἐτίμησεν"],
    script: "greek-lunate",
    lang: "grc",
    ref: "formula, e.g. Iasos 292",
    source: PHI(259150),
    attested: false,
  },
} satisfies Record<string, EpigraphicText>;

export type TextId = keyof typeof TEXTS;

/** One text's single line, for texts that are lists of separate short inscriptions. */
export function single(id: TextId, index: number): EpigraphicText {
  const source: EpigraphicText = TEXTS[id];
  const lines = Array.isArray(source.text) ? source.text : [source.text];
  return { ...source, text: [lines[index % lines.length]!] };
}
