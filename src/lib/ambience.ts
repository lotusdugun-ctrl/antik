/**
 * The sound of a place: recordings where there are honest ones to be had,
 * synthesis where there are not, arranged by src/lib/soundscapes.ts.
 *
 * A soundscape is a few looped beds (an audience talking, a fountain, the
 * sea), things that happen now and then (a dog, a hammer, a cow), and for
 * some places a director that tells a longer story — the play, its applause;
 * the race, its roar; the procession, its pipes. Everything runs through one
 * reverb shaped like the place (an open bowl of stone, a court, a room, a
 * bare summit), and one master that ducks under the narrator.
 *
 * Files are fetched and decoded only when a scene asks for them, and only
 * the clips that scene uses. Nothing is scheduled while it is off, and the
 * context is suspended once it has faded out, so a phone is not spending
 * battery rendering silence.
 */
import {
  clipUrl,
  DIRECTOR_CLIPS,
  hearing,
  isCall,
  isClip,
  isVoice,
  levelAt,
  nearestOn,
  STAGE_LINES,
  VOICE_MANIFEST,
  voiceUrl,
  voicesOf,
  type Bed,
  type Call,
  type Clip,
  type Happening,
  type Places,
  type Point,
  type Soundscape,
  type Space,
  type Spot,
  type TimeOfDay,
  type Voice,
} from "./soundscapes";
import { createSynth, type Note, type Placement } from "./ambience-synth";
import {
  bedPiece,
  createPicker,
  drumming,
  hourDensity,
  nextGap,
  seeded,
  vary,
} from "./sound-scheduler";

export type AmbienceScene = { scape: Soundscape; time: TimeOfDay };

/** An equal-power fade curve, so two crossfading copies never dip or bulge. */
function curve(from: number, to: number, steps = 32) {
  const out = new Float32Array(steps);
  for (let i = 0; i < steps; i += 1) {
    const x = i / (steps - 1);
    const up = Math.sin((x * Math.PI) / 2);
    out[i] = from > to ? from * Math.cos((x * Math.PI) / 2) + to * up : from + (to - from) * up;
  }
  return out;
}

/**
 * A reverb tail made rather than recorded: decaying noise that loses its top
 * as it dies (stone and air both swallow the highs first), after a handful of
 * early reflections — the stage building and the first rows of seats.
 */
const rand0 = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

function impulse(ctx: BaseAudioContext, space: Space) {
  const rate = ctx.sampleRate;
  const length = Math.max(1, Math.floor(rate * space.seconds));
  const buffer = ctx.createBuffer(2, length, rate);
  const predelay = Math.floor(rate * 0.012);
  for (let channel = 0; channel < 2; channel += 1) {
    const data = buffer.getChannelData(channel);
    let low = 0;
    for (let i = predelay; i < length; i += 1) {
      const t = (i - predelay) / rate;
      const decay = Math.exp((-6.9 * t) / space.seconds);
      // The low-pass closes as the tail goes on.
      const k = 0.85 - 0.75 * Math.min(1, t / space.seconds);
      low += k * (Math.random() * 2 - 1 - low);
      data[i] = low * decay * 0.6;
    }
    for (let n = 0; n < 7; n += 1) {
      const at = predelay + Math.floor(rate * rand0(0.008, 0.09));
      if (at < length) data[at]! += (Math.random() < 0.5 ? -1 : 1) * space.early * rand0(0.3, 0.8);
    }
  }
  return buffer;
}

function noiseBuffer(ctx: BaseAudioContext, seconds: number) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
  return buffer;
}

type Out = { gain: GainNode; stop: (at: number) => void };

/**
 * `offline` is for listening tests: an OfflineAudioContext (passed as an
 * AudioContext), no timers, and the caller calls advance() every 200 ms of
 * render time, to render a soundscape to a file faster than real time.
 */
export function createAmbience(options: { offline?: AudioContext; seed?: number } = {}) {
  if (typeof window === "undefined") return null;
  // Seeded for a listening test that must come out the same twice.
  const rng = options.seed === undefined ? Math.random : seeded(options.seed);
  const rand = (lo: number, hi: number) => lo + rng() * (hi - lo);
  const pick = <T>(list: readonly T[]): T => list[Math.floor(rng() * list.length)]!;
  const manual = Boolean(options.offline);
  let ctx: AudioContext;
  if (options.offline) ctx = options.offline;
  else {
    const AudioCtx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    try {
      ctx = new AudioCtx({ latencyHint: "playback" });
    } catch {
      return null;
    }
  }

  /* ---- The master chain ------------------------------------------------ */

  const master = ctx.createGain();
  master.gain.value = 0;
  // A gentle safety: applause on top of a roar on top of a gallop must not clip.
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -12;
  limiter.knee.value = 8;
  limiter.ratio.value = 6;
  limiter.attack.value = 0.01;
  limiter.release.value = 0.3;
  master.connect(limiter).connect(ctx.destination);
  const dry = ctx.createGain();
  /*
   * A slow leveller before the master: it listens to the mix and eases it,
   * within six decibels either way, towards one loudness, so a quiet house
   * and a roaring stadium sit at about the same level under the narrator.
   * It is before the master, so ducking under a voice is not undone by it.
   */
  const leveller = ctx.createGain();
  leveller.connect(master);
  const meter = ctx.createAnalyser();
  meter.fftSize = 2048;
  leveller.connect(meter);
  const meterData = new Float32Array(meter.fftSize);
  let loudness = 0;
  /** The mean square the leveller aims at: -29 dBFS RMS, about -21 LUFS for these mixes. */
  const AIM = 10 ** (-29 / 10);
  const level_ = () => {
    meter.getFloatTimeDomainData(meterData);
    let sum = 0;
    for (let i = 0; i < meterData.length; i += 1) sum += meterData[i]! * meterData[i]!;
    const ms = sum / meterData.length;
    const gain = leveller.gain.value || 1;
    // What the mix would measure without the leveller, smoothed over seconds.
    const raw = ms / (gain * gain);
    // Over about forty seconds: a level, not a compressor — the roar at
    // the finish of a race must still be louder than the wait before it.
    loudness = loudness === 0 ? raw : loudness * 0.995 + raw * 0.005;
    if (loudness < 1e-7) return;
    const want = Math.max(0.5, Math.min(2, Math.sqrt(AIM / loudness)));
    leveller.gain.setTargetAtTime(want, ctx.currentTime, 8);
  };
  dry.connect(leveller);
  const reverbIn = ctx.createGain();
  let reverb: ConvolverNode | null = null;
  const reverbOut = ctx.createGain();
  reverbOut.connect(leveller);

  const white = noiseBuffer(ctx, 4);

  /*
   * ---- Places: the sounds that come from somewhere in the model ----------
   *
   * Everything from one spot (the stage, the altar, the stalls) goes through
   * one gain and one stereo pan, turned as the camera moves: a few nodes a
   * scene, and arithmetic ten times a second. Until the model says where a
   * spot is, or the camera where it is, a spot's bus is left at unity and the
   * scene sounds as it always did. The reverb is fed before the bus, so a
   * far stage is quieter but its echo off the bowl is not — which is how a
   * distant sound is heard.
   */
  type Bus = { gain: GainNode; pan: StereoPannerNode };
  const buses = new Map<Spot, Bus>();
  let places: Places = {};
  let listener: { at: Point; forward: readonly [number, number] } | null = null;
  const aim = (spot: Spot, bus: Bus, seconds: number) => {
    const where = places[spot];
    let gain = 1;
    let pan = 0;
    if (where && listener) {
      ({ gain, pan } = hearing(
        listener.at,
        listener.forward,
        nearestOn(where, listener.at),
        where.ref,
      ));
    }
    bus.gain.gain.setTargetAtTime(gain, ctx.currentTime, seconds);
    bus.pan.pan.setTargetAtTime(pan, ctx.currentTime, seconds);
  };
  /** Where a sound from `spot` goes in: its bus, or straight out if it is from nowhere. */
  const from = (spot: Spot | undefined): AudioNode => {
    if (!spot) return dry;
    let bus = buses.get(spot);
    if (!bus) {
      const gain = ctx.createGain();
      const pan = ctx.createStereoPanner();
      gain.connect(pan).connect(dry);
      bus = { gain, pan };
      buses.set(spot, bus);
      aim(spot, bus, 0.01);
    }
    return bus.gain;
  };

  /* ---- Files: fetched and decoded on first use, once ------------------- */

  const buffers = new Map<string, Promise<AudioBuffer | null>>();
  const load = (url: string) => {
    let pending = buffers.get(url);
    if (!pending) {
      pending = fetch(url)
        .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject(new Error(String(res.status)))))
        .then(
          (data) =>
            new Promise<AudioBuffer>((resolve, reject) => {
              // The callback form as well: older Safari has no promise here.
              const result = ctx.decodeAudioData(data, resolve, reject) as
                Promise<AudioBuffer> | undefined;
              result?.then(resolve, reject);
            }),
        )
        .catch(() => null);
      buffers.set(url, pending);
    }
    return pending;
  };
  const ready = new Map<string, AudioBuffer>();
  const want = (url: string) => {
    void load(url).then((buffer) => buffer && ready.set(url, buffer));
  };

  /* The spoken clips exist only once the owner has recorded them. */
  let voices: Map<Voice, string> | null = null;
  let voicesAsked = false;
  const askVoices = () => {
    if (voicesAsked) return;
    voicesAsked = true;
    fetch(VOICE_MANIFEST)
      .then((res) => (res.ok ? res.json() : null))
      .then((manifest: { engine?: string; clips?: Record<string, { file?: string }> } | null) => {
        const found = new Map<Voice, string>();
        // Only voices recorded with Piper under a licence that allows
        // redistribution (scripts/generate_ambience_voices.py) are played.
        const clips = manifest?.engine === "piper" ? manifest.clips : undefined;
        for (const [key, entry] of Object.entries(clips ?? {})) {
          if (isVoice(key) && typeof entry?.file === "string") found.set(key, voiceUrl(entry.file));
        }
        voices = found;
        // Fetch the ones this scene uses up front, so a line is never late.
        if (scene) for (const v of voicesOf(scene.scape)) if (found.has(v)) want(found.get(v)!);
      })
      .catch(() => {
        voices = new Map();
      });
  };
  const urlOf = (sound: Clip | Voice): string | null =>
    isVoice(sound) ? (voices?.get(sound) ?? null) : clipUrl(sound);
  const bufferOf = (sound: Clip | Voice | Call) => {
    if (isCall(sound)) return null;
    const url = urlOf(sound);
    return url ? (ready.get(url) ?? null) : null;
  };

  /* ---- Playing one thing ------------------------------------------------ */

  type PlayOptions = {
    at?: number | undefined;
    level: number;
    pan?: number | undefined;
    rate?: number | undefined;
    muffle?: number | undefined;
    wet?: number | undefined;
    offset?: number | undefined;
    duration?: number | undefined;
    fadeIn?: number | undefined;
    fadeOut?: number | undefined;
    into?: AudioNode | undefined;
    /** The low-pass moving over the clip's length: something approaching, then leaving. */
    muffleCurve?: Float32Array | undefined;
  };
  const live = new Set<AudioScheduledSourceNode>();
  const play = (buffer: AudioBuffer, o: PlayOptions): Out & { end: number } => {
    const at = Math.max(o.at ?? ctx.currentTime + 0.05, ctx.currentTime + 0.01);
    const rate = o.rate ?? 1;
    const offset = Math.min(o.offset ?? 0, Math.max(0, buffer.duration - 0.1));
    const duration = Math.min(o.duration ?? Infinity, buffer.duration - offset);
    const real = duration / rate;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = rate;
    let node: AudioNode = source;
    if (o.muffle || o.muffleCurve) {
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = o.muffle ?? 20000;
      filter.Q.value = 0.5;
      if (o.muffleCurve) filter.frequency.setValueCurveAtTime(o.muffleCurve, at, real);
      node = node.connect(filter);
    }
    const gain = ctx.createGain();
    const fadeIn = Math.min(o.fadeIn ?? 0.01, real / 3);
    const fadeOut = Math.min(o.fadeOut ?? 0.05, real / 3);
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(o.level, at + fadeIn);
    gain.gain.setValueAtTime(o.level, at + real - fadeOut);
    gain.gain.linearRampToValueAtTime(0, at + real);
    node = node.connect(gain);
    if (o.pan) {
      const panner = ctx.createStereoPanner();
      panner.pan.value = Math.max(-1, Math.min(1, o.pan));
      node = node.connect(panner);
    }
    node.connect(o.into ?? dry);
    if (o.wet) {
      const send = ctx.createGain();
      send.gain.value = o.wet;
      node.connect(send).connect(reverbIn);
    }
    source.start(at, offset, duration);
    live.add(source);
    source.onended = () => {
      live.delete(source);
      source.disconnect();
    };
    return {
      gain,
      end: at + real,
      stop: (when: number) => {
        try {
          source.stop(when);
        } catch {
          /* already stopped */
        }
      },
    };
  };

  /* ---- Beds -------------------------------------------------------------- */

  /*
   * A bed is never the recording going round. It is two layers of pieces,
   * each piece a stretch of the recording chosen somewhere other than the
   * last, for a length of its own, a hair faster or slower, crossfaded into
   * the next — and the whole bed drifting slowly in loudness and brightness,
   * as a crowd or the sea does. Two layers at independent offsets make a
   * mix of the recording with itself that does not come round again.
   */
  type Layer = { next: number; last: number | undefined; playing: Out[]; level: number };
  type BedPlayer = {
    bed: Bed;
    out: GainNode;
    /** A multiplier the director turns: a hushed audience, a roaring one. */
    mod: GainNode;
    layers: Layer[];
  };
  let beds: BedPlayer[] = [];

  const makeBed = (bed: Bed): BedPlayer => {
    const out = ctx.createGain();
    out.gain.value = 0;
    // Its brightness, wandering round the bed's own muffle.
    const tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = bed.muffle ?? 14000;
    tone.Q.value = 0.5;
    drift(0.05, (bed.muffle ?? 14000) * 0.25, tone.frequency);
    // Its loudness, wandering by a couple of decibels either way.
    const wander = ctx.createGain();
    wander.gain.value = 1;
    drift(0.04, 0.22, wander.gain);
    const mod = ctx.createGain();
    out.connect(tone).connect(wander).connect(mod).connect(from(bed.at));
    if (bed.wet) {
      const send = ctx.createGain();
      send.gain.value = bed.wet;
      mod.connect(send).connect(reverbIn);
    }
    want(clipUrl(bed.clip));
    const layer = (level: number): Layer => ({ next: 0, last: undefined, playing: [], level });
    return { bed, out, mod, layers: [layer(0.82), layer(0.5)] };
  };

  /** Keeps every bed going: piece after piece, two layers, crossfaded. */
  const feedBeds = (now: number) => {
    for (const player of beds) {
      // A bed silent at this hour (the market at night) costs nothing.
      if (scene && levelAt(player.bed.level, scene.time) === 0) continue;
      const buffer = ready.get(clipUrl(player.bed.clip));
      if (!buffer) continue;
      player.layers.forEach((layer, n) => {
        if (layer.next > now + 3) return;
        // The second layer comes in later, so the two never fade together.
        const at = Math.max(layer.next, now + 0.05 + (layer.next === 0 ? n * rand(2, 5) : 0));
        const piece = bedPiece(buffer.duration, rng, layer.last);
        layer.last = piece.offset;
        const real = piece.length / piece.rate;
        const fade = Math.min(piece.fade, real / 3);
        const out = play(buffer, {
          at,
          level: layer.level,
          offset: piece.offset,
          duration: piece.length,
          rate: piece.rate,
          // A placed bed is panned by where it is; only a little wander is its own.
          pan: player.bed.at
            ? rand(-0.12, 0.12)
            : (player.bed.pan ?? 0) + rand(-0.35, 0.35) * (n === 0 ? 0.7 : 1),
          into: player.out,
          fadeIn: 0.001,
          fadeOut: 0.001,
        });
        // Equal-power fades over the linear ramps play() set.
        out.gain.gain.cancelScheduledValues(at);
        out.gain.gain.setValueCurveAtTime(curve(0, layer.level), at, fade);
        out.gain.gain.setValueCurveAtTime(curve(layer.level, 0), at + real - fade, fade);
        layer.playing = [...layer.playing.filter((p) => p !== out), out].slice(-3);
        layer.next = at + real - fade;
      });
    }
  };

  const bedOf = (clip: Clip) => beds.find((b) => b.bed.clip === clip);

  /* ---- Happenings --------------------------------------------------------- */

  type HappeningPlayer = {
    h: Happening;
    next: number;
    pick: ReturnType<typeof createPicker<Clip | Voice | Call>>;
    loudest: number;
  };
  let happenings: HappeningPlayer[] = [];
  /** Answers waiting their turn: a dog barking back from across the valley. */
  let answers: { at: number; player: HappeningPlayer; pan: number }[] = [];
  /** How many sounds may play at once: past this, happenings wait. */
  const MAX_VOICES = 56;
  /** What has been played, by name, for the listening tests. */
  const played = new Map<string, number>();

  const fire = (player: HappeningPlayer, level: number, panAt?: number) => {
    const { h } = player;
    const sound = player.pick((s) => isCall(s) || bufferOf(s) !== null);
    if (!sound) return;
    played.set(sound, (played.get(sound) ?? 0) + 1);
    const v = vary(rng, { rate: h.rate, spread: h.spread ?? 0.6, muffle: h.muffle, wet: h.wet });
    const pan = panAt ?? (h.at ? v.pan * 0.25 : v.pan);
    if (isCall(sound)) {
      synth.call(sound, ctx.currentTime + 0.05, level * v.gain, {
        pan,
        muffle: v.cutoff,
        wet: v.wet,
        into: from(h.at),
        pitch: h.rate ? v.rate : 1 + (v.rate - 1) * 0.6,
      });
      return;
    }
    const buffer = bufferOf(sound)!;
    const max = h.max;
    const long = buffer.duration > (max ?? buffer.duration) * 1.5;
    play(buffer, {
      level: level * v.gain,
      pan,
      into: from(h.at),
      rate: v.rate,
      muffle: v.cutoff,
      wet: v.wet,
      offset: max && long ? rand(0, buffer.duration - max) : 0,
      duration: max,
      fadeIn: max ? 0.3 : 0.01,
      fadeOut: max ? 0.8 : 0.05,
    });
  };

  /* ---- Synthesis: wind, cicadas, sparks, wheels, a roar ------------------ */

  /** Long noise for loops: two lengths, so no two loops come round together. */
  const longNoise = [noiseBuffer(ctx, 11.3), noiseBuffer(ctx, 13.7)];
  /*
   * Noise for the wind and the cicadas, fed piece by piece like a bed: a
   * stretch from somewhere in a long buffer, a little faster or slower,
   * crossfaded into the next. A looped buffer, however long, comes round —
   * and filtered noise that comes round is a gust on the dot.
   */
  const feeds: { into: AudioNode; next: number }[] = [];
  const noiseFeed = () => {
    const into = ctx.createGain();
    feeds.push({ into, next: 0 });
    return into;
  };
  const feedNoise = (now: number) => {
    for (const feed of feeds) {
      if (feed.next > now + 2) continue;
      const at = Math.max(feed.next, now + 0.05);
      const buffer = pick(longNoise);
      const length = rand(5, 9);
      const fade = 1.5;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.playbackRate.value = rand(0.9, 1.1);
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.gain.setValueCurveAtTime(curve(0, 1), at, fade);
      gain.gain.setValueCurveAtTime(curve(1, 0), at + length - fade, fade);
      source.connect(gain).connect(feed.into);
      source.start(at, rng() * buffer.duration);
      source.stop(at + length + 0.05);
      live.add(source);
      source.onended = () => {
        live.delete(source);
        source.disconnect();
        gain.disconnect();
      };
      feed.next = at + length - fade;
    }
  };
  /*
   * A slow, irregular modulator: a random curve drawn through a point every
   * second or so, two minutes long, played at a speed of its own. A sine LFO
   * at a few hertz is the sound of an idling engine; noise looped every few
   * seconds is a gust that comes back on the dot. This is neither.
   */
  const wanderRate = 3000;
  const wanderCurve = (() => {
    const seconds = 120;
    const buffer = ctx.createBuffer(1, wanderRate * seconds, wanderRate);
    const data = buffer.getChannelData(0);
    const knots = (every: number) => {
      const n = Math.ceil(seconds / every) + 2;
      return Array.from({ length: n }, () => rng() * 2 - 1);
    };
    const coarse = knots(1.4);
    const fine = knots(0.37);
    const at = (k: number[], every: number, t: number) => {
      const x = t / every;
      const i = Math.floor(x);
      const f = (1 - Math.cos((x - i) * Math.PI)) / 2;
      // Wrap round, so the loop has no seam.
      const a = k[i % (k.length - 2)]!;
      const b = k[(i + 1) % (k.length - 2)]!;
      return a + (b - a) * f;
    };
    let peak = 0;
    for (let i = 0; i < data.length; i += 1) {
      const t = i / wanderRate;
      data[i] = at(coarse, 1.4, t) * 0.75 + at(fine, 0.37, t) * 0.25;
      peak = Math.max(peak, Math.abs(data[i]!));
    }
    for (let i = 0; i < data.length; i += 1) data[i]! /= peak || 1;
    return buffer;
  })();
  /** Moves `target` by up to ±depth, at about `speed` (1 = a change every second or so). */
  const drift = (speed: number, depth: number, target: AudioParam) => {
    const source = ctx.createBufferSource();
    source.buffer = wanderCurve;
    source.loop = true;
    source.playbackRate.value = speed * rand(0.7, 1.3) * 8;
    const amount = ctx.createGain();
    amount.gain.value = depth;
    source.connect(amount).connect(target);
    source.start(0, rng() * wanderCurve.duration);
  };

  // Wind: two bands of hiss, one airy and one through the stones, each gusting
  // on its own schedule. No sub-bass: rumble is what makes wind read as a car.
  const wind = ctx.createGain();
  wind.gain.value = 0;
  wind.connect(dry);
  for (const [centre, q, level] of [
    [rand(600, 800), 0.6, 0.55],
    [rand(2200, 3000), 0.9, 0.25],
  ] as const) {
    const high = ctx.createBiquadFilter();
    high.type = "highpass";
    high.frequency.value = 160;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = centre;
    band.Q.value = q;
    const gust = ctx.createGain();
    gust.gain.value = 0.45 * level;
    const pan = ctx.createStereoPanner();
    noiseFeed().connect(high).connect(band).connect(gust).connect(pan).connect(wind);
    drift(0.1, 0.38 * level, gust.gain);
    drift(0.07, centre * 0.35, band.frequency);
    drift(0.05, 0.5, pan.pan);
  }

  // Cicadas: narrow bands near 5-6 kHz, pulsed fast, swelling slowly — each
  // its own pulse rate, wandering, and its own swell, so the chorus never
  // locks into one beat.
  const cicadas = ctx.createGain();
  cicadas.gain.value = 0;
  cicadas.connect(dry);
  for (let i = 0; i < 3; i += 1) {
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = rand(4600, 6200);
    band.Q.value = 9;
    const pulse = ctx.createGain();
    pulse.gain.value = 0.5;
    const swell = ctx.createGain();
    swell.gain.value = 0.55;
    const pan = ctx.createStereoPanner();
    pan.pan.value = -0.7 + i * 0.7 + rand(-0.15, 0.15);
    noiseFeed().connect(band).connect(pulse).connect(swell).connect(pan).connect(cicadas);
    const osc = ctx.createOscillator();
    osc.frequency.value = rand(34, 52);
    drift(0.05, 5, osc.frequency);
    const amount = ctx.createGain();
    amount.gain.value = 0.5;
    osc.connect(amount).connect(pulse.gain);
    osc.start();
    drift(0.03, 0.5, swell.gain);
  }

  /** A spark or a split log over the recorded fire: a click of filtered noise. */
  const spark = (level: number, into: AudioNode) => {
    const at = ctx.currentTime + 0.05;
    const len = rand(0.004, 0.03);
    const source = ctx.createBufferSource();
    source.buffer = white;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = rand(1500, 6000);
    band.Q.value = rand(0.8, 3);
    const env = ctx.createGain();
    env.gain.setValueAtTime(level * rand(0.4, 1), at);
    env.gain.exponentialRampToValueAtTime(0.0001, at + len);
    const pan = ctx.createStereoPanner();
    pan.pan.value = rand(-0.3, 0.3);
    source.connect(band).connect(env).connect(pan).connect(into);
    source.start(at, rng() * 3, len + 0.02);
    source.onended = () => source.disconnect();
  };

  /*
   * A chariot passing: the gallop recording, twice for a team, a rumble of
   * wheels on sand, all swept across and pitched down as it goes by (the
   * Doppler shift), opening up as it nears and closing as it leaves.
   */
  const passBy = (at: number, direction: 1 | -1, level: number, runners = false) => {
    const span = 8;
    const peak = at + span * rand(0.45, 0.55);
    // A footrace is the same pass with feet for hooves and no wheels: the
    // footstep recording sped up to a sprint, a field of runners strung out.
    const hooves = ready.get(clipUrl(runners ? "footsteps" : "hooves"));
    // Loudness as the distance shrinks and grows again: an inverse square,
    // softened, starting and ending at silence.
    const shape = (t: number) => 1 / (1 + ((t - (peak - at)) / 1.5) ** 2);
    const floor = Math.max(shape(0), shape(span));
    const envelope = new Float32Array(64);
    for (let i = 0; i < 64; i += 1)
      envelope[i] = Math.max(0, (shape((i / 63) * span) - floor) / (1 - floor));
    const route = (into: AudioNode, pan: StereoPannerNode) => {
      pan.pan.setValueAtTime(-0.95 * direction, at);
      pan.pan.linearRampToValueAtTime(0.95 * direction, at + span);
      into.connect(pan).connect(from("track"));
      const send = ctx.createGain();
      send.gain.value = 0.35;
      pan.connect(send).connect(reverbIn);
    };
    const sweep = (filter: BiquadFilterNode) => {
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(700, at);
      filter.frequency.exponentialRampToValueAtTime(7000, peak);
      filter.frequency.exponentialRampToValueAtTime(900, at + span);
    };
    if (hooves) {
      // A team of four: the same gallop, three times, a stride apart.
      const copies = runners
        ? [0, 0.21, 0.37, 0.6, 0.84].map((d) => [d, rand(1.75, 2.05)] as const)
        : ([
            [0, 1],
            [0.13, 1.04],
            [0.29, 0.97],
          ] as const);
      for (const [delay, detune] of copies) {
        const source = ctx.createBufferSource();
        source.buffer = hooves;
        source.loop = true;
        // Coming, the hoofbeats are higher and faster; going, lower and slower.
        source.playbackRate.setValueAtTime(1.06 * detune, at);
        source.playbackRate.setValueAtTime(1.06 * detune, peak - 0.6);
        source.playbackRate.linearRampToValueAtTime(0.94 * detune, peak + 0.6);
        const filter = ctx.createBiquadFilter();
        sweep(filter);
        const gain = ctx.createGain();
        gain.gain.value = 0;
        gain.gain.setValueCurveAtTime(
          envelope.map((v) => v * level * (runners ? 0.7 : 1)),
          at,
          span,
        );
        source.connect(filter).connect(gain);
        route(gain, ctx.createStereoPanner());
        source.start(at + delay, rand(0, hooves.duration));
        source.stop(at + span + 0.2);
        live.add(source);
        source.onended = () => {
          live.delete(source);
          source.disconnect();
        };
      }
    }
    if (runners) return peak;
    // The wheels: a crunch of sand and grit under iron tyres, rattling
    // irregularly — kept mid-band and quiet, since a low steady rumble is
    // what makes anything sound like an engine.
    const noise = ctx.createBufferSource();
    noise.buffer = white;
    noise.loop = true;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 900;
    band.Q.value = 0.7;
    const rattle = ctx.createGain();
    rattle.gain.value = 0.6;
    const shaker = ctx.createBufferSource();
    shaker.buffer = white;
    shaker.loop = true;
    const shakerFilter = ctx.createBiquadFilter();
    shakerFilter.type = "lowpass";
    shakerFilter.frequency.value = 22;
    const shakerAmount = ctx.createGain();
    shakerAmount.gain.value = 1.6;
    shaker.connect(shakerFilter).connect(shakerAmount).connect(rattle.gain);
    const filter = ctx.createBiquadFilter();
    sweep(filter);
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.setValueCurveAtTime(
      envelope.map((v) => v * level * 0.16),
      at,
      span,
    );
    noise.connect(band).connect(rattle).connect(filter).connect(gain);
    route(gain, ctx.createStereoPanner());
    for (const s of [noise, shaker]) {
      s.start(at, rng() * 3);
      s.stop(at + span + 0.2);
      live.add(s);
      s.onended = () => {
        live.delete(s);
        s.disconnect();
      };
    }
    return peak;
  };

  /* ---- Calls: everything made from tones and noise (ambience-synth.ts) ---- */

  /** Where a synthesised sound goes: muffled with distance, panned, into the room. */
  const place = (o: Placement, at: number, end: number) => {
    const input = ctx.createGain();
    let node: AudioNode = input;
    if (o.muffle) {
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = o.muffle;
      filter.Q.value = 0.5;
      node = node.connect(filter);
    }
    const panner = ctx.createStereoPanner();
    const pan = Math.max(-1, Math.min(1, o.pan ?? 0));
    panner.pan.value = pan;
    if (o.panTo !== undefined && end > at) {
      panner.pan.setValueAtTime(pan, at);
      panner.pan.linearRampToValueAtTime(Math.max(-1, Math.min(1, o.panTo)), end);
    }
    node = node.connect(panner);
    node.connect(o.into ?? dry);
    if (o.wet) {
      const send = ctx.createGain();
      send.gain.value = o.wet;
      node.connect(send).connect(reverbIn);
    }
    return input;
  };
  const keep = (
    source: AudioScheduledSourceNode,
    start: number,
    to: number,
    tail: AudioNode,
    offset?: number,
  ) => {
    if (offset !== undefined && "buffer" in source)
      (source as AudioBufferSourceNode).start(start, offset);
    else source.start(start);
    source.stop(to);
    live.add(source);
    source.onended = () => {
      live.delete(source);
      source.disconnect();
      tail.disconnect();
    };
  };
  const synth = createSynth(ctx, { white, place, keep, rng });
  const { sing, wave } = synth;

  const call = (kind: Call, at: number, level: number, o: Placement) =>
    synth.call(kind, at, level, o);

  /**
   * The salpinx, the straight bronze trumpet that started the races: a few
   * notes of the natural series, blared, scooping up to pitch as the lips find it.
   * Two players, a hair apart.
   */
  const salpinx = (at: number, level: number, pan: number) => {
    const base = rand(112, 124);
    const notes: Note[] = [];
    let t = 0;
    for (const [h, len] of [
      [2, 0.28],
      [2, 0.28],
      [3, 0.7],
      [4, 0.35],
      [3, 1.3],
    ] as const) {
      const f = base * h;
      notes.push([t, len, f * 0.94, f, f * 0.995, h === 4 ? 1 : 0.85]);
      t += len + 0.07;
    }
    const brass = wave(
      "salpinx",
      [1, 0.85, 0.75, 0.62, 0.5, 0.4, 0.31, 0.24, 0.18, 0.13, 0.09, 0.06, 0.04],
    );
    for (const detune of [1, 1.004]) {
      sing(
        notes.map(([s, l, a, b, c, v]) => [s, l, a * detune, b * detune, c * detune, v] as const),
        at,
        level * 0.18,
        brass,
        { pan, muffle: 4200, wet: 0.5, attack: 0.05, release: 0.12, vibrato: 2 },
      );
    }
    return at + t;
  };

  /** A gourd rattle: seeds thrown against the shell, beat by beat. */
  const rattle = (at: number, beats: readonly number[], level: number) => {
    if (beats.length === 0) return;
    const source = ctx.createBufferSource();
    source.buffer = white;
    source.loop = true;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 4200;
    band.Q.value = 1.2;
    const env = ctx.createGain();
    env.gain.value = 0;
    for (const b of beats) {
      const t = at + b;
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(level, t + 0.012);
      env.gain.setTargetAtTime(level * 0.25, t + 0.015, 0.02);
      env.gain.setTargetAtTime(0, t + 0.07, 0.025);
    }
    source
      .connect(band)
      .connect(env)
      .connect(place({ pan: rand(-0.4, 0.4), wet: 0.35 }, at, at + beats[beats.length - 1]! + 0.4));
    keep(source, at, at + beats[beats.length - 1]! + 0.4, env, rng() * 3);
  };

  /* ---- Crowd reactions --------------------------------------------------- */

  /** Applause: three real recordings, staggered and spread, swelling and dying. */
  const applause = (at: number, level: number, length = rand(6, 9)) => {
    const clips: Clip[] = ["applause1", "applause2", "applause3"];
    const starts = [0, rand(0.3, 0.8), rand(1.5, 2.6), rand(3.6, 4.4)];
    starts.forEach((offset, i) => {
      const buffer = ready.get(clipUrl(clips[i % 3]!));
      if (!buffer || offset > length - 1.5) return;
      play(buffer, {
        at: at + offset,
        level: level * (i === 0 ? 0.8 : 1),
        pan: [-0.6, 0.55, -0.05, 0.3][i],
        rate: rand(0.96, 1.04),
        duration: Math.min(buffer.duration, length - offset),
        fadeIn: i === 0 ? 0.25 : 0.9,
        fadeOut: 1.4,
        wet: 0.45,
        muffle: 9000,
      });
    });
  };
  /** A whole audience laughing: a few laughs on top of one another. */
  const laughter = (at: number, level: number) => {
    (["laugh1", "laugh2", "laugh3"] as const).forEach((clip, i) => {
      const buffer = ready.get(clipUrl(clip));
      if (!buffer) return;
      play(buffer, {
        at: at + i * rand(0.12, 0.35),
        level: level * rand(0.7, 1),
        pan: [-0.5, 0.45, 0][i],
        rate: rand(0.94, 1.08),
        duration: rand(2.2, 3.4),
        fadeIn: 0.05,
        fadeOut: 1,
        wet: 0.5,
        muffle: 5000,
      });
    });
  };
  const cheer = (at: number, level: number, pan = 0) => {
    const buffer = ready.get(clipUrl("cheer"));
    if (buffer)
      play(buffer, {
        at,
        level,
        pan,
        rate: rand(0.95, 1.03),
        wet: 0.45,
        fadeIn: 0.15,
        fadeOut: 1.2,
      });
  };
  const say = (
    choices: readonly Voice[],
    at: number,
    level: number,
    o: Partial<PlayOptions> = {},
  ) => {
    const ok = choices.filter((v) => bufferOf(v));
    if (ok.length === 0) return null;
    const buffer = bufferOf(pick(ok))!;
    return play(buffer, { at, level, wet: 0.4, muffle: 7000, fadeOut: 0.2, ...o });
  };
  /** Turn the audience bed up or down: a hush before the play, a roar at the finish. */
  const crowd = (value: number, at: number, seconds: number) => {
    const player = bedOf("murmur");
    if (!player) return;
    player.mod.gain.cancelScheduledValues(at);
    player.mod.gain.setTargetAtTime(value, at, seconds / 3);
  };

  /* ---- Directors --------------------------------------------------------- */

  type Phase = { name: string; until: number };
  let phase: Phase = { name: "idle", until: 0 };
  let race = { laps: 0, direction: 1 as 1 | -1, runners: false };

  const lively = () => scene?.time !== "night";

  const theatre = (now: number) => {
    if (!lively()) {
      if (phase.name !== "idle") crowd(1, now, 3);
      phase = { name: "idle", until: now + 5 };
      return;
    }
    if (now < phase.until) return;
    switch (phase.name) {
      case "idle":
      case "react":
        crowd(1, now, 3);
        phase = { name: "chatter", until: now + rand(14, 30) };
        return;
      case "chatter":
        // The audience settles.
        crowd(0.2, now, 4);
        phase = { name: "hush", until: now + 4 };
        return;
      case "hush": {
        let end = now + 1;
        const lines = STAGE_LINES.filter((v) => bufferOf(v));
        const stage = { pan: rand(-0.1, 0.1), wet: 0.55, muffle: 6500, into: from("stage") };
        let comic = false;
        if (lines.length > 0 && rng() < 0.65) {
          // An actor's voice from the stage, carried by the bowl.
          const comedy = rng() < 0.5 && lines.some((l) => l.startsWith("actor-frogs"));
          const order = comedy
            ? lines.filter((l) => l.startsWith("actor-frogs"))
            : lines.filter((l) => !l.startsWith("actor-frogs")).slice(0, 3);
          let at = now + 0.3;
          for (const line of order) {
            const out = say([line], at, 0.7, stage);
            if (out) at = out.end + rand(0.8, 1.8);
          }
          end = at;
          comic = comedy;
        } else if (rng() < 0.7) {
          // A choral song: a tune on the aulos or the kithara, made now — a
          // run of phrases, never the same one twice.
          const instrument = rng() < 0.6 ? "aulos-phrase" : "lyre-phrase";
          let at = now + 0.2;
          for (let n = 0, phrases = 1 + Math.floor(rng() * 2); n < phrases; n += 1)
            at =
              call(instrument, at, 0.75, {
                pan: stage.pan,
                wet: stage.wet,
                muffle: stage.muffle,
                into: stage.into,
              }) + rand(0.6, 1.6);
          end = at;
        } else {
          // Or the recorded song, from somewhere in it.
          const clip: Clip = rng() < 0.6 ? "aulos" : "lyre";
          const buffer = ready.get(clipUrl(clip));
          if (buffer) {
            const length = Math.min(buffer.duration - 2, rand(16, 26));
            play(buffer, {
              at: now + 0.2,
              level: 0.75,
              offset: rand(0, Math.max(0, buffer.duration - length)),
              duration: length,
              fadeIn: 1.5,
              fadeOut: 2.5,
              ...stage,
            });
            end = now + 0.2 + length;
          }
        }
        phase = { name: comic ? "laugh" : "applause", until: end };
        return;
      }
      case "laugh":
        laughter(now + 0.1, 0.55);
        crowd(0.7, now, 1);
        phase = { name: "applause", until: now + rand(2.5, 4) };
        return;
      case "applause": {
        const strong = rng();
        applause(now + 0.1, 0.55 + strong * 0.3);
        if (strong > 0.5) cheer(now + rand(0.5, 1.5), 0.35, rand(-0.4, 0.4));
        if (strong > 0.6)
          say(["crowd-euge", "crowd-axios", "crowd-kalos"], now + rand(1, 3), 0.3, {
            pan: rand(-0.7, 0.7),
            muffle: 4000,
          });
        crowd(1.25, now + 3, 3);
        phase = { name: "react", until: now + 9 };
        return;
      }
      default:
        phase = { name: "idle", until: now };
    }
  };

  const races = (now: number) => {
    if (!lively()) {
      phase = { name: "idle", until: now + 5 };
      return;
    }
    if (now < phase.until) return;
    switch (phase.name) {
      case "idle":
      case "finish":
        crowd(1, now, 4);
        phase = {
          name: "waiting",
          until: now + (phase.name === "idle" ? rand(6, 12) : rand(22, 40)),
        };
        return;
      case "waiting": {
        // The herald calls the start, the trumpet sounds, and the stands lean forward.
        const herald = say(["herald-akouete"], now + 0.1, 0.55, {
          pan: rand(-0.3, 0.3),
          wet: 0.5,
          into: from("track"),
        });
        const blown = salpinx((herald?.end ?? now) + 0.4, 1, rand(-0.5, 0.5));
        crowd(1.25, blown, 3);
        const runners = rng() < 0.35;
        race = {
          laps: runners ? 2 : Math.floor(rand(2, 4)),
          direction: rng() < 0.5 ? 1 : -1,
          runners,
        };
        phase = { name: "lap", until: blown + 0.8 };
        return;
      }
      case "lap": {
        const peak = passBy(now + 0.1, race.direction, 0.75, race.runners);
        // The stands rise as the chariots come by: a cheer, a burst of
        // clapping, the talk louder for a moment.
        crowd(1.3, peak - 1.5, 1.5);
        crowd(1.05, peak + 2.5, 3);
        cheer(peak - 0.5, 0.55, 0.4 * race.direction);
        if (rng() < 0.6) applause(peak + 0.3, 0.4, rand(3.5, 5));
        if (!race.runners && rng() < 0.4) {
          const n = ready.get(clipUrl(pick(["neigh1", "neigh2", "neigh3"] as const)));
          if (n)
            play(n, {
              at: peak - 0.3,
              level: 0.35,
              pan: 0.2 * race.direction,
              rate: rand(0.95, 1.05),
              wet: 0.3,
              into: from("track"),
            });
        }
        race.laps -= 1;
        // Round the far turn and back the other way.
        race.direction = race.direction === 1 ? -1 : 1;
        phase = {
          name: race.laps > 0 ? "lap" : "won",
          until: now + (race.runners ? rand(9, 11) : rand(11, 16)),
        };
        return;
      }
      case "won":
        applause(now, 0.7, rand(8, 11));
        cheer(now + 0.3, 0.6, -0.3);
        cheer(now + 1.6, 0.45, 0.4);
        say(["crowd-nika", "crowd-euge", "crowd-iou"], now + rand(0.8, 2), 0.4, {
          pan: rand(-0.6, 0.6),
          muffle: 4000,
        });
        crowd(1.6, now, 1);
        // The victor's ode, as the poets wrote them for the winning team.
        say(["herald-pindar"], now + 9, 0.45, {
          pan: rand(-0.2, 0.2),
          wet: 0.5,
          into: from("track"),
        });
        phase = { name: "finish", until: now + 14 };
        return;
      default:
        phase = { name: "idle", until: now };
    }
  };

  /** Pipes and a drum coming up the sacred way, then going on past. */
  const procession = (now: number) => {
    if (now < phase.until) return;
    if (phase.name !== "idle" || !lively()) {
      phase = { name: "idle", until: now + (lively() ? rand(35, 80) : 10) };
      return;
    }
    const span = rand(28, 40);
    // Distance: far, near, far again — quieter and duller at both ends.
    const closeness = new Float32Array(48);
    for (let i = 0; i < 48; i += 1) closeness[i] = Math.sin((i / 47) * Math.PI) ** 1.5;
    const aulos = ready.get(clipUrl("aulos"));
    const at = now + 0.2;
    // Coming up to the altar: heard from there once its place is known.
    const into = from("altar");
    const pan = places.altar ? rand(-0.15, 0.15) : rand(-0.5, 0.5);
    // Everything in the procession comes nearer and goes away together.
    const approach = ctx.createGain();
    approach.gain.value = 0;
    approach.gain.setValueCurveAtTime(closeness, at, span);
    const dull = ctx.createBiquadFilter();
    dull.type = "lowpass";
    dull.frequency.setValueCurveAtTime(
      closeness.map((v) => 700 + 6500 * v),
      at,
      span,
    );
    approach.connect(dull).connect(into);
    if (rng() < 0.6) {
      // The pipers playing tunes made as they walk: phrase after phrase.
      for (let t = at; t < at + span - 6;)
        t = call("aulos-phrase", t, 0.9, { pan, wet: 0.45, into: approach }) + rand(0.4, 1.4);
    } else if (aulos) {
      play(aulos, {
        at,
        level: 0.42,
        offset: rand(0, Math.max(0, aulos.duration - span)),
        duration: span,
        pan,
        wet: 0.45,
        fadeIn: 0.01,
        fadeOut: 0.01,
        into: approach,
      });
    }
    const drum = ready.get(clipUrl("drum"));
    if (drum && rng() < 0.55) {
      // A walking beat, its pattern changing as it goes.
      for (const beat of drumming(rng, span - 4, rand(0.38, 0.5))) {
        play(drum, {
          at: at + 2 + beat.t,
          level: 0.38 * beat.accent * (beat.tone === "dum" ? 1 : 0.6),
          pan,
          rate: beat.tone === "dum" ? rand(0.88, 1.0) : rand(1.2, 1.4),
          wet: 0.4,
          into: approach,
        });
      }
    } else {
      for (let t = at + 2; t < at + span - 8;)
        t = call("drum-phrase", t, 0.7, { pan, wet: 0.4, into: approach }) + rand(0.5, 2);
    }
    say(scene?.scape.voices ?? [], at + span * 0.45, 0.32, { pan, wet: 0.5, muffle: 4500, into });
    if (rng() < 0.6) {
      const moo = ready.get(clipUrl(pick(["moo1", "moo2", "moo3"] as const)));
      if (moo)
        play(moo, {
          at: at + span * rand(0.3, 0.6),
          level: 0.35,
          pan,
          wet: 0.35,
          duration: 3,
          fadeOut: 0.6,
          into,
        });
    }
    phase = { name: "passing", until: now + span };
  };

  /** A drum on the summit, slow and heavy, and the king's words read out. */
  const rite = (now: number) => {
    if (now < phase.until) return;
    if (phase.name !== "idle") {
      phase = { name: "idle", until: now + rand(45, 110) };
      return;
    }
    const drum = ready.get(clipUrl("drum"));
    const night = scene?.time === "night";
    const at = now + 0.2;
    // A pattern chosen and varied bar by bar, slower at night.
    const step = (night ? 0.31 : 0.25) * rand(0.9, 1.1);
    const span = rand(14, 22);
    const shakes: number[] = [];
    const gourd = scene?.scape.character === "neolithic";
    if (drum) {
      for (const beat of drumming(rng, span, step)) {
        // At Göbeklitepe a rattle answers the drum on the light strokes.
        if (gourd && beat.tone === "tek" && beat.t > 2 && beat.t < span - 2) shakes.push(beat.t);
        const heavy = beat.tone === "dum";
        play(drum, {
          at: at + beat.t,
          level: (heavy ? 0.45 : 0.22) * beat.accent * (night ? 0.8 : 1),
          rate: heavy ? rand(0.76, 0.84) : rand(1.15, 1.35),
          pan: places.altar ? 0 : -0.25,
          wet: 0.55,
          muffle: heavy ? 2600 : 4200,
          into: from("altar"),
        });
      }
    }
    rattle(at, shakes, 0.12);
    say(scene?.scape.voices ?? [], at + span + 1, 0.35, {
      pan: places.altar ? 0 : 0.15,
      wet: 0.35,
      muffle: 5500,
      into: from("altar"),
    });
    phase = { name: "rite", until: at + span + 8 };
  };

  /* ---- The scene, and the clock that runs it ------------------------------ */

  let scene: AmbienceScene | null = null;
  let running = false;
  let ducked = false;
  let timer: number | undefined;
  let suspendTimer: number | undefined;
  let nextSpark = 0;

  const applyLevels = (seconds: number) => {
    if (!scene) return;
    const { scape, time } = scene;
    const now = ctx.currentTime;
    for (const player of beds) {
      player.out.gain.cancelScheduledValues(now);
      player.out.gain.setTargetAtTime(levelAt(player.bed.level, time), now, seconds);
    }
    wind.gain.setTargetAtTime(scape.synth.wind * (time === "night" ? 0.8 : 1), now, seconds);
    cicadas.gain.setTargetAtTime(
      scape.synth.cicadas ? (time === "day" ? 0.05 : time === "golden" ? 0.022 : 0) : 0,
      now,
      seconds,
    );
    reverbOut.gain.setTargetAtTime(scape.space.wet * 2.2, now, seconds);
  };

  const tick = () => {
    if (!running || !scene || (!manual && ctx.state !== "running")) return;
    const now = ctx.currentTime;
    feedBeds(now);
    feedNoise(now);
    level_();
    for (const player of happenings) {
      if (now < player.next) continue;
      const level = levelAt(player.h.level, scene.time);
      if (level > 0) {
        // Too much at once already: wait a moment rather than pile on.
        if (live.size >= MAX_VOICES) {
          player.next = now + rand(1, 3);
          continue;
        }
        fire(player, level);
        if (player.h.answer && rng() < player.h.answer)
          answers.push({ at: now + rand(1.2, 5), player, pan: rand(-1, 1) });
      }
      // Random gaps with a floor, thinner at the quiet hours and in an
      // empty place, busier in a crowded one.
      const busy = (scene.scape.density ?? 1) * hourDensity(level, player.loudest);
      player.next = now + nextGap(player.h.every, rng, busy || 1);
    }
    if (answers.length) {
      const due = answers.filter((a) => a.at <= now);
      answers = answers.filter((a) => a.at > now);
      for (const a of due) {
        const level = levelAt(a.player.h.level, scene.time);
        if (level > 0) fire(a.player, level * rand(0.5, 0.85), a.pan);
      }
    }
    const fireBed = scene.scape.beds.find((b) => b.clip === "fire");
    if (scene.scape.synth.crackle && fireBed && now >= nextSpark) {
      const level = levelAt(fireBed.level, scene.time);
      if (level > 0) spark(0.25 * level, from(fireBed.at));
      nextSpark = now + rand(0.08, 0.9) / Math.max(0.2, level * 2);
    }
    switch (scene.scape.director) {
      case "theatre":
        theatre(now);
        break;
      case "races":
        races(now);
        break;
      case "procession":
        procession(now);
        break;
      case "rite":
        rite(now);
        break;
      default:
    }
  };

  const build = (scape: Soundscape) => {
    const now = ctx.currentTime;
    // The old scene's beds fade out and go.
    for (const player of beds) {
      player.out.gain.cancelScheduledValues(now);
      player.out.gain.setTargetAtTime(0, now, 0.4);
      for (const layer of player.layers) for (const piece of layer.playing) piece.stop(now + 2);
    }
    beds = scape.beds.map(makeBed);
    answers = [];
    happenings = scape.happenings.map((h) => ({
      h,
      // The first of each comes sooner than the rest, so a short visit hears it.
      next: now + rand(h.every[0] * 0.2, h.every[0]),
      pick: createPicker(h.sounds, rng),
      loudest: Math.max(...(["day", "golden", "night"] as const).map((t) => levelAt(h.level, t))),
    }));
    for (const h of scape.happenings) for (const s of h.sounds) if (isClip(s)) want(clipUrl(s));
    for (const clip of DIRECTOR_CLIPS[scape.director ?? "none"]) want(clipUrl(clip));
    if (voices) for (const v of voicesOf(scape)) if (voices.has(v)) want(voices.get(v)!);
    if (reverb) reverb.disconnect();
    reverb = ctx.createConvolver();
    reverb.buffer = impulse(ctx, scape.space);
    reverbIn.connect(reverb).connect(reverbOut);
    phase = { name: "idle", until: now + 2 };
  };

  const level = () => (ducked ? 0.3 : 0.9);
  const onVisibility = () => {
    if (!running || manual) return;
    if (document.hidden) void ctx.suspend();
    else void ctx.resume();
  };
  document.addEventListener("visibilitychange", onVisibility);

  return {
    setScene(next: AmbienceScene) {
      const changed = scene?.scape !== next.scape;
      scene = next;
      if (changed) build(next.scape);
      applyLevels(changed ? 0.05 : 1.5);
    },
    async start() {
      window.clearTimeout(suspendTimer);
      running = true;
      askVoices();
      if (!manual) {
        try {
          await ctx.resume();
        } catch {
          /* resumed later, by the next gesture */
        }
      }
      // Turned off again while the context was waking up.
      if (!running) return;
      applyLevels(0.01);
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(level(), ctx.currentTime, 0.8);
      window.clearInterval(timer);
      if (!manual) timer = window.setInterval(tick, 200);
      tick();
    },
    /** Where the model's spots are (see src/lib/sound-spots.ts). */
    setPlaces(next: Places) {
      places = next;
      for (const [spot, bus] of buses) aim(spot, bus, 0.3);
    },
    /**
     * Where the camera is and which way it looks (x, z), to place the spots
     * by. Cheap enough to call ten times a second.
     */
    setListener(at: Point, forward: readonly [number, number]) {
      listener = { at, forward };
      for (const [spot, bus] of buses) aim(spot, bus, 0.12);
    },
    /** What has been played so far, by name, and how much is sounding now: for tests. */
    stats() {
      return {
        played: Object.fromEntries(played),
        live: live.size,
        leveller: leveller.gain.value,
        loudness: 10 * Math.log10(loudness || 1e-12),
      };
    },
    /** Offline only: run the clock once. */
    advance() {
      tick();
    },
    stop() {
      running = false;
      window.clearInterval(timer);
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
      // Silence still costs battery: suspend once the fade is done, unless it
      // was turned back on in the meantime.
      window.clearTimeout(suspendTimer);
      suspendTimer = window.setTimeout(() => {
        if (running) return;
        for (const source of live) {
          try {
            source.stop();
          } catch {
            /* already stopped */
          }
        }
        for (const player of beds) for (const layer of player.layers) layer.next = 0;
        for (const feed of feeds) feed.next = 0;
        void ctx.suspend();
      }, 1500);
    },
    /** Duck under a voice, so the guide is never fighting the crowd. */
    duck(on: boolean) {
      ducked = on;
      if (running) master.gain.setTargetAtTime(level(), ctx.currentTime, 0.4);
    },
    /** Whether the browser has let it make a sound yet. */
    get state() {
      return ctx.state;
    },
    dispose() {
      running = false;
      window.clearInterval(timer);
      window.clearTimeout(suspendTimer);
      document.removeEventListener("visibilitychange", onVisibility);
      void ctx.close().catch(() => {});
    },
  };
}

export type Ambience = NonNullable<ReturnType<typeof createAmbience>>;
