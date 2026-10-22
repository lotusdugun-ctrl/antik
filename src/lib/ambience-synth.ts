/**
 * Sounds made in the browser, for the soundscapes of src/lib/soundscapes.ts:
 * birds, insects and frogs, animals, work, people's voices without words,
 * water, wind, bells and music. No recording is used — nothing here needs a
 * licence — and every call is made afresh each time from a handful of random
 * choices (how many notes, how high, how fast, which pattern), so the same
 * call is never heard twice.
 *
 * Each sound costs a few nodes, not one per note: a bird's song is one
 * oscillator whose pitch and loudness are drawn note by note with automation,
 * a run of footsteps one noise source with its envelope struck step by step.
 */
import { between, drumming, melody, type Mode, type Rng } from "./sound-scheduler";

export type Placement = {
  pan?: number | undefined;
  muffle?: number | undefined;
  wet?: number | undefined;
  /** The bus it goes into (a spot in the model), or the dry mix. */
  into?: AudioNode | undefined;
  /** A pitch (and tempo) factor for this play, about 1. */
  pitch?: number | undefined;
  /** A slow pan from `pan` to this over the sound: something passing. */
  panTo?: number | undefined;
};

/** Every synthesised sound the player can make. */
export const SYNTH_CALLS = [
  // Birds (and the night's insects and frogs).
  "owl",
  "dove",
  "gull",
  "lark",
  "blackbird",
  "sparrow",
  "finch",
  "cuckoo",
  "woodpecker",
  "hoopoe",
  "partridge",
  "swift",
  "beeeater",
  "frog",
  "cricket",
  // Animals.
  "goatbells",
  "donkey",
  // Work.
  "hammer",
  "chisel",
  "grind",
  "steps-stone",
  "steps-gravel",
  "steps-wood",
  // People, without words.
  "shout",
  "laugh",
  "chatter",
  // Water and wind.
  "rigging",
  "lapping",
  "brook",
  "gust",
  // Bells and music.
  "bell",
  "semantron",
  "chant",
  "aulos-phrase",
  "lyre-phrase",
  "drum-phrase",
] as const;

export type SynthCall = (typeof SYNTH_CALLS)[number];

/** A note: [start, length, pitch from, pitch peak, pitch to, loudness]. */
export type Note = readonly [number, number, number, number, number, number];

type Deps = {
  white: AudioBuffer;
  /** Where a sound goes: muffled, panned, into the room. Returns its input. */
  place: (o: Placement, at: number, end: number) => AudioNode;
  /** Starts a source (a buffer at `offset` seconds in), stops it, and tidies up after it. */
  keep: (
    source: AudioScheduledSourceNode,
    from: number,
    to: number,
    tail: AudioNode,
    offset?: number,
  ) => void;
  rng: Rng;
};

/** Vowel formants (Hz) for a voice with no words in it. */
const VOWELS: Record<string, [number, number, number]> = {
  a: [800, 1200, 2600],
  e: [500, 1800, 2600],
  i: [300, 2200, 3000],
  o: [480, 860, 2600],
  u: [340, 700, 2500],
  ae: [660, 1700, 2500],
};

export function createSynth(ctx: BaseAudioContext, deps: Deps) {
  const { white, place, keep, rng } = deps;
  const r = (lo: number, hi: number) => between(rng, lo, hi);
  const int = (lo: number, hi: number) => Math.floor(r(lo, hi + 1));
  const chance = (p: number) => rng() < p;

  const waves = new Map<string, PeriodicWave>();
  /** A harmonic recipe: amplitudes of the partials, from the fundamental up. */
  const wave = (name: string, partials: readonly number[]) => {
    let w = waves.get(name);
    if (!w) {
      const real = new Float32Array(partials.length + 1);
      const imag = new Float32Array([0, ...partials]);
      w = ctx.createPeriodicWave(real, imag);
      waves.set(name, w);
    }
    return w;
  };

  /**
   * One oscillator for a whole call, its pitch and loudness drawn note by
   * note with automation — a lark's minute-long song costs two nodes.
   */
  const sing = (
    notes: readonly Note[],
    at: number,
    level: number,
    timbre: PeriodicWave | OscillatorType,
    o: Placement & { attack?: number; release?: number; vibrato?: number; band?: number },
  ) => {
    if (notes.length === 0) return at;
    const p = o.pitch ?? 1;
    const osc = ctx.createOscillator();
    if (typeof timbre === "string") osc.type = timbre as OscillatorType;
    else osc.setPeriodicWave(timbre);
    const env = ctx.createGain();
    env.gain.value = 0;
    let node: AudioNode = osc;
    if (o.band) {
      const band = ctx.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.value = o.band * p;
      band.Q.value = 0.9;
      node = node.connect(band);
    }
    const attack = o.attack ?? 0.02;
    const release = o.release ?? 0.05;
    let end = at;
    for (const [start, length, from, peak, to, loud] of notes) {
      const t = at + start / p;
      const len = length / p;
      osc.frequency.setValueAtTime(from * p, t);
      osc.frequency.linearRampToValueAtTime(peak * p, t + len * 0.3);
      osc.frequency.linearRampToValueAtTime(to * p, t + len);
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(level * loud, t + Math.min(attack, len / 3));
      env.gain.setValueAtTime(level * loud, t + len - Math.min(release, len / 2));
      env.gain.linearRampToValueAtTime(0, t + len);
      end = Math.max(end, t + len);
    }
    node.connect(env).connect(place(o, at, end));
    if (o.vibrato) {
      const lfo = ctx.createOscillator();
      lfo.frequency.value = r(5, 6.5);
      const depth = ctx.createGain();
      depth.gain.value = o.vibrato;
      lfo.connect(depth).connect(osc.frequency);
      keep(lfo, at, end + 0.1, depth);
    }
    keep(osc, at, end + 0.1, env);
    return end;
  };

  /**
   * Strikes on one noise source: a run of footsteps, a woodpecker's drumming,
   * a chisel's taps. Each hit: [time, loudness, decay seconds].
   */
  const strikes = (
    hits: readonly (readonly [number, number, number])[],
    at: number,
    level: number,
    filter: { type: BiquadFilterType; f: number; q: number; sweep?: number },
    o: Placement,
  ) => {
    if (hits.length === 0) return at;
    const p = o.pitch ?? 1;
    const source = ctx.createBufferSource();
    source.buffer = white;
    source.loop = true;
    const band = ctx.createBiquadFilter();
    band.type = filter.type;
    band.frequency.value = filter.f * p;
    band.Q.value = filter.q;
    const env = ctx.createGain();
    env.gain.value = 0;
    let end = at;
    for (const [t0, loud, decay] of hits) {
      const t = at + t0;
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(level * loud, t + 0.003);
      env.gain.setTargetAtTime(0, t + 0.004, decay / 3);
      if (filter.sweep)
        band.frequency.setValueAtTime(filter.f * p * (1 + (rng() - 0.5) * filter.sweep), t);
      end = Math.max(end, t + decay + 0.05);
    }
    source
      .connect(band)
      .connect(env)
      .connect(place(o, at, end));
    keep(source, at, end + 0.05, env, rng() * 3.5);
    return end;
  };

  /**
   * Struck tones on one oscillator: thumps, knocks, the hollow note of a
   * wooden board. Each hit: [time, frequency, loudness, decay, drop].
   */
  const knocks = (
    hits: readonly (readonly [number, number, number, number, number])[],
    at: number,
    level: number,
    timbre: PeriodicWave | OscillatorType,
    o: Placement,
  ) => {
    if (hits.length === 0) return at;
    const p = o.pitch ?? 1;
    const osc = ctx.createOscillator();
    if (typeof timbre === "string") osc.type = timbre as OscillatorType;
    else osc.setPeriodicWave(timbre);
    const env = ctx.createGain();
    env.gain.value = 0;
    let end = at;
    for (const [t0, f, loud, decay, drop] of hits) {
      const t = at + t0;
      osc.frequency.setValueAtTime(f * p, t);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, f * p * drop), t + decay);
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(level * loud, t + 0.004);
      env.gain.setTargetAtTime(0, t + 0.005, decay / 3);
      end = Math.max(end, t + decay + 0.05);
    }
    osc.connect(env).connect(place(o, at, end));
    keep(osc, at, end + 0.05, env);
    return end;
  };

  /**
   * A bell, or a set of strokes on one: each partial an oscillator held for
   * the whole toll, struck again at every stroke, the high partials dying
   * first. `ratios` are the partials over the strike note, with their level
   * and how long each rings (as a share of `ring`).
   */
  const bell = (
    strokes: readonly (readonly [number, number])[],
    f: number,
    ring: number,
    ratios: readonly (readonly [number, number, number])[],
    at: number,
    level: number,
    o: Placement,
  ) => {
    if (strokes.length === 0) return at;
    const last = strokes[strokes.length - 1]![0];
    const end = at + last + ring;
    const input = place(o, at, end);
    for (const [ratio, amp, life] of ratios) {
      const osc = ctx.createOscillator();
      osc.frequency.value = f * ratio * (1 + (rng() - 0.5) * 0.004);
      const env = ctx.createGain();
      env.gain.value = 0;
      for (const [t0, loud] of strokes) {
        const t = at + t0;
        env.gain.setTargetAtTime(level * amp * loud, t, 0.002);
        env.gain.setTargetAtTime(0, t + 0.01, (ring * life) / 4);
      }
      osc.connect(env).connect(input);
      keep(osc, at, end, env);
    }
    return end;
  };

  /**
   * A voice with no words: a buzz through three vowel formants, the vowel
   * and the pitch moving syllable by syllable, a breath of air on top.
   * Syllables: [start, length, vowel, pitch from, pitch to, loudness].
   */
  const voice = (
    syllables: readonly (readonly [number, number, string, number, number, number])[],
    at: number,
    level: number,
    o: Placement & { breath?: number },
  ) => {
    if (syllables.length === 0) return at;
    const p = o.pitch ?? 1;
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    const env = ctx.createGain();
    env.gain.value = 0;
    const mix = ctx.createGain();
    mix.gain.value = 1;
    const formants = [0, 1, 2].map((k) => {
      const band = ctx.createBiquadFilter();
      band.type = "bandpass";
      band.Q.value = [6, 9, 12][k]!;
      const amp = ctx.createGain();
      amp.gain.value = [1, 0.55, 0.22][k]!;
      osc.connect(band).connect(amp).connect(mix);
      return band;
    });
    let end = at;
    for (const [start, length, vowel, f0, f1, loud] of syllables) {
      const t = at + start;
      const shape = VOWELS[vowel] ?? VOWELS["a"]!;
      formants.forEach((band, k) => {
        band.frequency.setTargetAtTime(shape[k]! * (0.95 + rng() * 0.1), t, 0.02);
      });
      osc.frequency.setValueAtTime(f0 * p, t);
      osc.frequency.linearRampToValueAtTime(f1 * p, t + length);
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(level * loud, t + Math.min(0.04, length / 3));
      env.gain.setValueAtTime(level * loud * 0.85, t + length * 0.7);
      env.gain.linearRampToValueAtTime(0, t + length);
      end = Math.max(end, t + length);
    }
    mix.connect(env).connect(place(o, at, end));
    keep(osc, at, end + 0.05, env);
    if (o.breath) {
      // The air in it: a little noise through the same envelope's shape.
      strikes(
        syllables.map(([s, l, , , , loud]) => [s, loud * o.breath!, l * 0.6] as const),
        at,
        level * 0.5,
        { type: "bandpass", f: 1800, q: 0.7 },
        o,
      );
    }
    return end;
  };

  /* ---- Plucked strings: Karplus-Strong, worked out once per pitch ---- */

  const plucks = new Map<number, AudioBuffer>();
  const pluck = (f: number) => {
    const key = Math.round(f);
    let buffer = plucks.get(key);
    if (!buffer) {
      const rate = ctx.sampleRate;
      const length = Math.floor(rate * 1.8);
      buffer = ctx.createBuffer(1, length, rate);
      const data = buffer.getChannelData(0);
      const period = Math.max(2, Math.round(rate / key));
      const line = new Float32Array(period);
      for (let i = 0; i < period; i += 1) line[i] = Math.random() * 2 - 1;
      let prev = 0;
      for (let i = 0; i < length; i += 1) {
        const k = i % period;
        const next = line[(k + 1) % period]!;
        const out = line[k]!;
        // The averaging that makes a string: highs die first.
        line[k] = 0.996 * 0.5 * (out + next);
        data[i] = out * 0.5 + prev * 0.5;
        prev = out;
      }
      plucks.set(key, buffer);
    }
    return buffer;
  };

  /* ---- The calls ------------------------------------------------------ */

  const call = (kind: SynthCall, at: number, level: number, o: Placement): number => {
    switch (kind) {
      case "owl": {
        // Otus scops: one soft, pure "tyu" near 1.2 kHz, every two and a half seconds.
        const f = r(1120, 1260);
        const notes: Note[] = [];
        const gap = r(2.3, 2.8);
        for (let i = 0, n = int(3, 7); i < n; i += 1)
          notes.push([i * gap * r(0.97, 1.03), r(0.16, 0.2), f * 0.95, f * 1.02, f * 0.97, 1]);
        return sing(notes, at, level * 0.5, wave("owl", [1, 0.08, 0.03]), {
          ...o,
          attack: 0.04,
          release: 0.09,
        });
      }
      case "dove": {
        // Streptopelia: "coo-COOO-coo", breathy and low, twice or thrice.
        const f = r(470, 540);
        const notes: Note[] = [];
        for (let i = 0, n = int(2, 4); i < n; i += 1) {
          const t = i * r(1.7, 2);
          notes.push([t, 0.26, f, f * 1.02, f * 0.94, 0.7]);
          notes.push([t + 0.4, 0.55, f * 1.06, f * 1.1, f * 0.98, 1]);
          notes.push([t + 1.08, 0.34, f * 0.94, f * 0.96, f * 0.86, 0.75]);
        }
        return sing(notes, at, level * 0.55, wave("dove", [1, 0.22, 0.07, 0.02]), {
          ...o,
          attack: 0.06,
          release: 0.12,
          muffle: Math.min(o.muffle ?? 1600, 1600),
        });
      }
      case "gull": {
        // Larus: the long call — a rising "kyow", then a run of shorter ones.
        const f = r(760, 920);
        const notes: Note[] = chance(0.6) ? [[0, 0.45, f * 0.8, f * 1.5, f * 1.1, 1]] : [];
        let t = notes.length ? 0.6 : 0;
        for (let i = 0, n = int(2, 8); i < n; i += 1) {
          const len = r(0.16, 0.28);
          notes.push([t, len, f, f * r(1.35, 1.55), f * 0.95, r(0.6, 0.9) * (1 - i * 0.06)]);
          t += len + r(0.1, 0.24);
        }
        return sing(
          notes,
          at,
          level * 0.32,
          wave("gull", [1, 0.9, 0.75, 0.6, 0.45, 0.35, 0.25, 0.18, 0.12, 0.08]),
          { ...o, attack: 0.03, release: 0.06, band: r(1700, 2100) },
        );
      }
      case "lark": {
        // Alauda: a high, fast, endless warble from far overhead.
        const notes: Note[] = [];
        const span = r(5, 12);
        for (let t = 0; t < span;) {
          const len = r(0.04, 0.13);
          const f = r(2600, 5200);
          notes.push([t, len, f, f + r(-900, 900), f + r(-700, 700), r(0.35, 1)]);
          t += len + r(0.01, 0.05) + (chance(0.06) ? r(0.2, 0.5) : 0);
        }
        return sing(notes, at, level * 0.22, "sine", { ...o, attack: 0.008, release: 0.015 });
      }
      case "blackbird": {
        // Turdus merula: a few low fluted phrases, then a quiet twitter.
        const notes: Note[] = [];
        let t = 0;
        for (let i = 0, n = int(3, 8); i < n; i += 1) {
          const len = r(0.09, 0.26);
          const f = r(1300, 2700);
          notes.push([t, len, f * r(0.9, 1), f * r(1, 1.15), f * r(0.8, 1.05), r(0.6, 1)]);
          t += len + r(0.02, 0.09);
        }
        for (let i = 0, n = int(0, 6); i < n; i += 1) {
          const len = r(0.03, 0.06);
          const f = r(3500, 6200);
          notes.push([t, len, f, f * 1.1, f * 0.9, r(0.25, 0.45)]);
          t += len + r(0.01, 0.03);
        }
        return sing(notes, at, level * 0.3, wave("blackbird", [1, 0.12, 0.04]), {
          ...o,
          attack: 0.015,
          release: 0.03,
        });
      }
      case "sparrow": {
        const notes: Note[] = [];
        let t = 0;
        for (let i = 0, n = int(2, 8); i < n; i += 1) {
          const len = r(0.05, 0.11);
          const f = r(2900, 4300);
          notes.push([t, len, f, f + r(300, 800), f - r(600, 1400), r(0.6, 1)]);
          t += len + r(0.08, 0.36);
        }
        return sing(notes, at, level * 0.24, wave("sparrow", [1, 0.3, 0.12]), {
          ...o,
          attack: 0.006,
          release: 0.02,
        });
      }
      case "finch": {
        // Fringilla: a descending trill and a flourish at the end.
        const notes: Note[] = [];
        let t = 0;
        let f = r(4600, 5600);
        const step = r(0.06, 0.09);
        for (let i = 0, n = int(6, 13); i < n; i += 1) {
          notes.push([t, step * 0.7, f, f * 1.05, f * 0.85, 0.8]);
          t += step;
          f *= r(0.93, 0.97);
        }
        for (let i = 0, n = int(1, 3); i < n; i += 1) {
          notes.push([t, 0.12, f * 1.3, f * 1.6, f * 0.9, 1]);
          t += 0.14;
        }
        return sing(notes, at, level * 0.22, "sine", { ...o, attack: 0.005, release: 0.02 });
      }
      case "cuckoo": {
        const f = r(620, 720);
        const third = r(0.79, 0.85);
        const notes: Note[] = [];
        const gap = r(0.75, 0.95);
        for (let i = 0, n = int(2, 7); i < n; i += 1) {
          notes.push([i * gap, 0.2, f, f * 1.01, f * 0.98, 1]);
          notes.push([i * gap + 0.28, 0.32, f * third, f * third, f * third * 0.97, 0.85]);
        }
        return sing(notes, at, level * 0.4, wave("owl", [1, 0.08, 0.03]), {
          ...o,
          attack: 0.03,
          release: 0.08,
        });
      }
      case "woodpecker": {
        const hits: [number, number, number][] = [];
        const rate = r(16, 23);
        let t = 0;
        for (let i = 0, n = int(10, 24); i < n; i += 1) {
          hits.push([t, 1 - (i / n) * 0.5, 0.025]);
          t += (1 / rate) * (1 + i * r(0, 0.012));
        }
        return strikes(hits, at, level * 0.6, { type: "bandpass", f: r(900, 1500), q: 5 }, o);
      }
      case "hoopoe": {
        const f = r(370, 430);
        const notes: Note[] = [];
        const group = int(2, 3);
        let t = 0;
        for (let i = 0, n = int(2, 5); i < n; i += 1) {
          for (let k = 0; k < group; k += 1) notes.push([t + k * 0.22, 0.12, f, f, f * 0.96, 1]);
          t += r(1.3, 2.1);
        }
        return sing(notes, at, level * 0.4, wave("owl", [1, 0.08, 0.03]), {
          ...o,
          attack: 0.02,
          release: 0.05,
        });
      }
      case "partridge": {
        // Alectoris chukar: "chuk chuk chuk", gathering into "chukar, chukar".
        const notes: Note[] = [];
        let t = 0;
        let gap = r(0.28, 0.4);
        for (let i = 0, n = int(4, 10); i < n; i += 1) {
          const f = r(900, 1150);
          notes.push([t, 0.07, f, f * 1.05, f * 0.8, r(0.6, 0.9)]);
          t += gap;
          gap *= r(0.88, 0.95);
        }
        for (let i = 0, n = int(1, 4); i < n; i += 1) {
          notes.push([t, 0.09, 1150, 1250, 1000, 1], [t + 0.12, 0.14, 950, 1000, 820, 0.9]);
          t += r(0.32, 0.42);
        }
        return sing(
          notes,
          at,
          level * 0.28,
          wave("partridge", [1, 0.8, 0.6, 0.5, 0.35, 0.25, 0.15]),
          { ...o, attack: 0.006, release: 0.02, band: 1300 },
        );
      }
      case "swift": {
        // A screaming party of swifts going over: a few fast trills.
        const notes: Note[] = [];
        let t = 0;
        for (let k = 0, bursts = int(1, 3); k < bursts; k += 1) {
          const len = r(0.4, 1.1);
          const f = r(5200, 7200);
          for (let s = 0; s < len; s += 0.03) notes.push([t + s, 0.022, f, f * 1.04, f * 0.95, 1]);
          t += len + r(0.3, 1.2);
        }
        return sing(notes, at, level * 0.12, "sine", {
          ...o,
          attack: 0.003,
          release: 0.005,
          panTo: (o.pan ?? 0) * -1,
        });
      }
      case "beeeater": {
        const notes: Note[] = [];
        let t = 0;
        for (let i = 0, n = int(2, 7); i < n; i += 1) {
          const f = r(2200, 2800);
          notes.push([t, r(0.14, 0.24), f * 0.9, f * 1.05, f, 1]);
          t += r(0.45, 1.3);
        }
        return sing(notes, at, level * 0.2, wave("beeeater", [1, 0.25, 0.08]), {
          ...o,
          attack: 0.01,
          release: 0.04,
          vibrato: 160,
        });
      }
      case "frog": {
        // Pelophylax ridibundus: "brekekekek", a few rattling bursts.
        const notes: Note[] = [];
        let t = 0;
        for (let g = 0, groups = int(1, 4); g < groups; g += 1) {
          const f = r(800, 1250);
          const rate = r(10, 16);
          for (let i = 0, n = int(4, 11); i < n; i += 1)
            notes.push([t + i / rate, 0.04, f, f * 1.08, f * 0.9, r(0.7, 1)]);
          t += r(1, 2.4);
        }
        return sing(notes, at, level * 0.22, wave("frog", [1, 0.9, 0.7, 0.5, 0.4, 0.3, 0.2]), {
          ...o,
          attack: 0.004,
          release: 0.01,
          band: 1400,
        });
      }
      case "cricket": {
        const notes: Note[] = [];
        const f = r(4100, 4900);
        const pulses = int(2, 5);
        const rate = r(22, 32);
        const every = r(0.3, 0.85);
        for (let c = 0, n = int(4, 14); c < n; c += 1)
          for (let i = 0; i < pulses; i += 1)
            notes.push([c * every * r(0.95, 1.05) + i / rate, 0.018, f, f, f, r(0.7, 1)]);
        return sing(notes, at, level * 0.1, "sine", { ...o, attack: 0.002, release: 0.004 });
      }
      case "goatbells": {
        // A few goats moving on the slope: two or three small bells, unevenly.
        let end = at;
        for (let b = 0, bells = int(1, 3); b < bells; b += 1) {
          const strokes: [number, number][] = [];
          let t = r(0, 0.6);
          for (let i = 0, n = int(3, 9); i < n; i += 1) {
            strokes.push([t, r(0.4, 1)]);
            t += r(0.12, 0.8);
          }
          end = Math.max(
            end,
            bell(
              strokes,
              r(1300, 2300),
              r(0.35, 0.8),
              [
                [1, 1, 1],
                [2.08, 0.45, 0.6],
                [3.4, 0.3, 0.4],
                [4.9, 0.15, 0.3],
              ],
              at,
              level * 0.12,
              o,
            ),
          );
        }
        return end;
      }
      case "donkey": {
        // A bray: a high "hee" on the in-breath, a low "haw" out, over and over.
        const syl: [number, number, string, number, number, number][] = [];
        let t = 0;
        const hi = r(380, 520);
        const lo = r(140, 190);
        for (let i = 0, n = int(3, 6); i < n; i += 1) {
          const decay = 1 - i * 0.08;
          syl.push([t, r(0.3, 0.42), "i", hi * 1.05, hi * 0.9, 0.8 * decay]);
          t += r(0.36, 0.48);
          syl.push([t, r(0.38, 0.55), "a", lo * 1.1, lo * 0.85, 1 * decay]);
          t += r(0.45, 0.62);
        }
        return voice(syl, at, level * 0.3, { ...o, breath: 0.6 });
      }
      case "hammer": {
        // A smith or a mason: blows in uneven groups, a ring on metal.
        const metal = chance(0.5);
        const hits: [number, number, number][] = [];
        let t = 0;
        const beat = r(0.42, 0.85);
        for (let i = 0, n = int(3, 10); i < n; i += 1) {
          hits.push([t, r(0.6, 1), metal ? 0.3 : 0.06]);
          if (chance(0.2)) hits.push([t + beat * 0.32, r(0.3, 0.5), metal ? 0.2 : 0.05]);
          t += beat * r(0.92, 1.1) + (chance(0.12) ? r(0.6, 1.5) : 0);
        }
        if (metal) {
          const f = r(900, 1500);
          bell(
            hits.map(([s, l]) => [s, l] as const),
            f,
            0.35,
            [
              [1, 1, 1],
              [2.76, 0.6, 0.6],
              [5.4, 0.3, 0.3],
            ],
            at,
            level * 0.1,
            o,
          );
        }
        return strikes(
          hits,
          at,
          level * 0.5,
          { type: "bandpass", f: metal ? 3200 : r(1800, 2600), q: 1.4, sweep: 0.3 },
          o,
        );
      }
      case "chisel": {
        const hits: [number, number, number][] = [];
        let t = 0;
        const beat = r(0.11, 0.2);
        for (let i = 0, n = int(6, 20); i < n; i += 1) {
          hits.push([t, r(0.5, 1), 0.03]);
          t += beat * r(0.85, 1.15) + (chance(0.1) ? r(0.4, 1) : 0);
        }
        return strikes(
          hits,
          at,
          level * 0.45,
          { type: "bandpass", f: r(3000, 4800), q: 2.2, sweep: 0.25 },
          o,
        );
      }
      case "grind": {
        // A saddle quern: the rubbing stone pushed and drawn back.
        const hits: [number, number, number][] = [];
        let t = 0;
        const stroke = r(0.85, 1.3);
        for (let i = 0, n = int(4, 10); i < n; i += 1) {
          hits.push([t, r(0.6, 1), stroke * 0.55]);
          hits.push([t + stroke / 2, r(0.4, 0.7), stroke * 0.45]);
          t += stroke * r(0.95, 1.05);
        }
        return strikes(hits, at, level * 0.35, { type: "bandpass", f: r(500, 900), q: 0.8 }, o);
      }
      case "steps-stone":
      case "steps-gravel":
      case "steps-wood": {
        // Someone walking past: steps that come and go, from one side to the other.
        const n = int(5, 14);
        const pace = r(0.48, 0.64);
        const hits: [number, number, number][] = [];
        for (let i = 0; i < n; i += 1) {
          const arc = Math.sin(((i + 0.5) / n) * Math.PI);
          hits.push([i * pace * r(0.95, 1.05), (0.35 + 0.65 * arc) * (i % 2 ? 0.85 : 1), 0.06]);
        }
        const passing = { ...o, panTo: -(o.pan ?? r(-0.6, 0.6)) };
        if (kind === "steps-wood") {
          knocks(
            hits.map(([t, l]) => [t, r(170, 220), l, 0.12, 0.7] as const),
            at,
            level * 0.35,
            "sine",
            passing,
          );
          return strikes(hits, at, level * 0.2, { type: "bandpass", f: 2000, q: 1 }, passing);
        }
        if (kind === "steps-stone") {
          knocks(
            hits.map(([t, l]) => [t, r(80, 110), l, 0.07, 0.6] as const),
            at,
            level * 0.25,
            "sine",
            passing,
          );
          return strikes(
            hits.map(([t, l]) => [t, l, 0.035] as const),
            at,
            level * 0.35,
            { type: "bandpass", f: r(2200, 3200), q: 1.2, sweep: 0.3 },
            passing,
          );
        }
        return strikes(
          hits.map(([t, l]) => [t, l, r(0.1, 0.16)] as const),
          at,
          level * 0.4,
          { type: "bandpass", f: r(1500, 2200), q: 0.6, sweep: 0.4 },
          passing,
        );
      }
      case "shout": {
        // Somebody calling across: "ey!", "hoo-oo!", no words.
        const f0 = chance(0.35) ? r(250, 330) : r(130, 210);
        const vowels = ["e", "o", "a", "ae", "u"];
        const syl: [number, number, string, number, number, number][] = [];
        let t = 0;
        for (let i = 0, n = int(1, 3); i < n; i += 1) {
          const len = r(0.25, 0.7);
          const v = vowels[int(0, vowels.length - 1)]!;
          syl.push([t, len, v, f0 * r(1, 1.2), f0 * r(0.75, 1.05), 1 - i * 0.15]);
          t += len + r(0.08, 0.25);
        }
        return voice(syl, at, level * 0.22, { ...o, breath: 0.25 });
      }
      case "laugh": {
        const f0 = chance(0.4) ? r(230, 300) : r(130, 180);
        const syl: [number, number, string, number, number, number][] = [];
        let t = 0;
        const n = int(4, 10);
        for (let i = 0; i < n; i += 1) {
          const f = f0 * (1 - (i / n) * r(0.15, 0.35));
          syl.push([
            t,
            r(0.09, 0.15),
            chance(0.7) ? "a" : "e",
            f * 1.08,
            f * 0.92,
            1 - (i / n) * 0.5,
          ]);
          t += r(0.15, 0.24);
        }
        return voice(syl, at, level * 0.2, { ...o, breath: 0.9 });
      }
      case "chatter": {
        // Two people talking, too far off to make out: syllables back and forth.
        const voices = [r(110, 160), r(190, 270)];
        const vowels = ["a", "e", "i", "o", "u", "ae"];
        let t = 0;
        let end = at;
        for (let turn = 0, turns = int(2, 5); turn < turns; turn += 1) {
          const f0 = voices[turn % 2]!;
          const syl: [number, number, string, number, number, number][] = [];
          for (let i = 0, n = int(3, 9); i < n; i += 1) {
            const len = r(0.1, 0.22);
            const f = f0 * r(0.85, 1.2);
            syl.push([t, len, vowels[int(0, 5)]!, f, f * r(0.85, 1.05), r(0.5, 1)]);
            t += len + r(0.02, 0.08);
          }
          end = Math.max(
            end,
            voice(syl, at, level * 0.14, {
              ...o,
              pan: (o.pan ?? 0) + (turn % 2 ? 0.15 : -0.15),
              breath: 0.3,
            }),
          );
          t += r(0.3, 0.9);
        }
        return end;
      }
      case "rigging": {
        // A ship's timbers and ropes working against each other: creaks.
        const notes: Note[] = [];
        let t = 0;
        for (let i = 0, n = int(1, 3); i < n; i += 1) {
          const len = r(0.4, 1.4);
          const f = r(35, 90);
          notes.push([t, len, f, f * r(1.2, 1.8), f * r(0.7, 1.1), r(0.6, 1)]);
          t += len + r(0.3, 1.5);
        }
        return sing(notes, at, level * 0.35, "sawtooth", {
          ...o,
          attack: 0.15,
          release: 0.2,
          band: r(700, 1400),
        });
      }
      case "lapping": {
        const hits: [number, number, number][] = [];
        let t = 0;
        for (let i = 0, n = int(2, 6); i < n; i += 1) {
          hits.push([t, r(0.5, 1), r(0.25, 0.6)]);
          t += r(0.5, 1.4);
        }
        knocks(
          hits
            .filter(() => chance(0.5))
            .map(([s, l]) => [s + 0.05, r(300, 700), l, 0.06, 0.5] as const),
          at,
          level * 0.08,
          "sine",
          o,
        );
        return strikes(hits, at, level * 0.4, { type: "lowpass", f: r(500, 1100), q: 0.5 }, o);
      }
      case "brook": {
        // Water over stones below: a burst of gurgles and plips.
        const notes: Note[] = [];
        let t = 0;
        const span = r(2.5, 6);
        while (t < span) {
          const f = r(500, 1600);
          notes.push([t, r(0.02, 0.06), f, f * r(1.2, 1.6), f * r(1.4, 2), r(0.4, 1)]);
          t += r(0.04, 0.3);
        }
        return sing(notes, at, level * 0.12, "sine", { ...o, attack: 0.004, release: 0.01 });
      }
      case "gust": {
        // One gust, of one of a few kinds: a rush, a moan, a whistle in the stones.
        const family = int(0, 2);
        const len = r(2.5, 8);
        const source = ctx.createBufferSource();
        source.buffer = white;
        source.loop = true;
        source.playbackRate.value = r(0.8, 1.2);
        const band = ctx.createBiquadFilter();
        band.type = "bandpass";
        const f = family === 0 ? r(500, 1100) : family === 1 ? r(180, 380) : r(1400, 2600);
        band.Q.value = family === 2 ? r(6, 14) : r(0.6, 1.4);
        band.frequency.setValueAtTime(f * 0.8, at);
        band.frequency.linearRampToValueAtTime(f * r(1.1, 1.5), at + len * r(0.35, 0.6));
        band.frequency.linearRampToValueAtTime(f * r(0.7, 0.95), at + len);
        const env = ctx.createGain();
        const peak = level * (family === 2 ? 0.25 : 0.5);
        env.gain.setValueAtTime(0, at);
        env.gain.linearRampToValueAtTime(peak * r(0.4, 0.7), at + len * 0.25);
        env.gain.linearRampToValueAtTime(peak, at + len * r(0.4, 0.6));
        env.gain.linearRampToValueAtTime(0, at + len);
        source
          .connect(band)
          .connect(env)
          .connect(place({ ...o, panTo: -(o.pan ?? 0) }, at, at + len));
        keep(source, at, at + len + 0.05, env, rng() * 3.5);
        return at + len;
      }
      case "bell": {
        // A church bell tolled: a few strokes, never quite evenly; sometimes two bells.
        const strokes: [number, number][] = [];
        let t = 0;
        const beat = r(2.2, 3.4);
        for (let i = 0, n = int(3, 9); i < n; i += 1) {
          strokes.push([t, r(0.8, 1)]);
          t += beat * r(0.95, 1.06);
        }
        const partials = [
          [0.5, 0.5, 1],
          [1, 1, 0.8],
          [1.19, 0.6, 0.6],
          [1.5, 0.35, 0.5],
          [2, 0.45, 0.4],
          [2.51, 0.2, 0.3],
          [3, 0.15, 0.25],
        ] as const;
        const f = r(230, 340);
        const end = bell(strokes, f, r(4, 7), partials, at, level * 0.14, o);
        if (chance(0.35))
          bell(
            strokes.map(([s, l]) => [s + beat * 0.5, l * 0.7] as const),
            f * r(1.3, 1.55),
            r(3, 5),
            partials,
            at,
            level * 0.1,
            o,
          );
        return end;
      }
      case "semantron": {
        // The monks' wooden board, struck to call to prayer: slow, faster,
        // a run, and slow again — the rhythm different every time.
        const hits: [number, number, number, number, number][] = [];
        let t = 0;
        let gap = r(0.7, 1);
        const n = int(14, 30);
        for (let i = 0; i < n; i += 1) {
          const f = chance(0.5) ? r(380, 420) : r(470, 520);
          hits.push([t, f, r(0.6, 1), 0.09, 0.92]);
          if (chance(0.15)) hits.push([t + gap * 0.3, f, 0.5, 0.08, 0.92]);
          t += gap;
          gap = i < n * 0.7 ? Math.max(0.13, gap * r(0.82, 0.93)) : gap * r(1.1, 1.3);
        }
        knocks(hits, at, level * 0.4, wave("wood", [1, 0, 0.35, 0, 0.12]), o);
        return strikes(
          hits.map(([s, , l]) => [s, l, 0.02] as const),
          at,
          level * 0.15,
          { type: "bandpass", f: 2500, q: 1 },
          o,
        );
      }
      case "chant": {
        // Monks singing, far off through the rock: a held drone (the ison)
        // under a line made new each time in a chant mode.
        const seconds = r(8, 18);
        const tonic = r(105, 135);
        const line = melody(rng, {
          mode: "echos",
          tonic: tonic * 2,
          seconds,
          beat: r(0.5, 0.75),
          range: 5,
        });
        const syl = line.map(
          (n) => [n.t, n.len, chance(0.6) ? "a" : "o", n.f, n.f * 0.99, n.accent] as const,
        );
        voice([[0, seconds + 1, "o", tonic, tonic, 0.55]], at, level * 0.18, { ...o });
        if (chance(0.5))
          voice([[0.2, seconds + 0.6, "u", tonic * 1.5, tonic * 1.5, 0.35]], at, level * 0.14, o);
        return voice(syl, at, level * 0.2, { ...o, breath: 0.15 });
      }
      case "aulos-phrase": {
        // The aulos: a reed melody over a drone pipe, a tune made new each time.
        const mode = (["dorian", "phrygian", "mixolydian", "lydian"] as Mode[])[int(0, 3)]!;
        const tonic = r(210, 300);
        const seconds = r(8, 18);
        const line = melody(rng, { mode, tonic, seconds });
        const reed = wave("aulos", [1, 0.75, 0.62, 0.45, 0.38, 0.25, 0.18, 0.12, 0.08]);
        const notes = line.map((n) => [n.t, n.len, n.f * 0.985, n.f, n.f, n.accent] as const);
        const end = sing(notes, at, level * 0.16, reed, {
          ...o,
          attack: 0.04,
          release: 0.06,
          vibrato: 3,
          band: 1800,
        });
        const drone = chance(0.6) ? tonic / 2 : (tonic * 1.5) / 2;
        sing([[0, end - at, drone, drone, drone, 1]], at, level * 0.07, reed, {
          ...o,
          attack: 0.4,
          release: 0.8,
          band: 900,
        });
        return end;
      }
      case "lyre-phrase": {
        const mode = (["dorian", "hypodorian", "lydian"] as Mode[])[int(0, 2)]!;
        const line = melody(rng, {
          mode,
          tonic: r(190, 270),
          seconds: r(7, 15),
          beat: r(0.3, 0.45),
        });
        let end = at;
        const input = place(o, at, at + (line[line.length - 1]?.t ?? 0) + 2);
        for (const n of line) {
          const strum = chance(0.15) ? [1, 1.5] : [1];
          for (const k of strum) {
            const source = ctx.createBufferSource();
            source.buffer = pluck(n.f * k);
            const g = ctx.createGain();
            g.gain.value = level * 0.35 * n.accent * (k === 1 ? 1 : 0.6);
            source.connect(g).connect(input);
            const t = at + n.t + (k === 1 ? 0 : 0.03);
            keep(source, t, t + 1.8, g);
            end = Math.max(end, t + 1.8);
          }
        }
        return end;
      }
      case "drum-phrase": {
        const beats = drumming(rng, r(6, 14));
        const dum = beats.filter((b) => b.tone === "dum");
        const tek = beats.filter((b) => b.tone === "tek");
        knocks(
          dum.map((b) => [b.t, r(95, 125), b.accent, 0.35, 0.55] as const),
          at,
          level * 0.6,
          "sine",
          o,
        );
        knocks(
          tek.map((b) => [b.t, r(330, 420), b.accent, 0.05, 0.8] as const),
          at,
          level * 0.25,
          "triangle",
          o,
        );
        return strikes(
          beats.map(
            (b) =>
              [
                b.t,
                b.accent * (b.tone === "tek" ? 1 : 0.4),
                b.tone === "tek" ? 0.04 : 0.08,
              ] as const,
          ),
          at,
          level * 0.2,
          { type: "bandpass", f: 2200, q: 0.9 },
          o,
        );
      }
      default:
        return at;
    }
  };

  return { call, sing, wave, strikes, knocks };
}

export type Synth = ReturnType<typeof createSynth>;
