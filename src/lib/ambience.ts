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

export type AmbienceScene = { scape: Soundscape; time: TimeOfDay };

const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
const pick = <T>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)]!;

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
      const at = predelay + Math.floor(rate * rand(0.008, 0.09));
      if (at < length) data[at]! += (Math.random() < 0.5 ? -1 : 1) * space.early * rand(0.3, 0.8);
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
export function createAmbience(options: { offline?: AudioContext } = {}) {
  if (typeof window === "undefined") return null;
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
  dry.connect(master);
  const reverbIn = ctx.createGain();
  let reverb: ConvolverNode | null = null;
  const reverbOut = ctx.createGain();
  reverbOut.connect(master);

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

  type BedPlayer = {
    bed: Bed;
    out: GainNode;
    /** A multiplier the director turns: a hushed audience, a roaring one. */
    mod: GainNode;
    next: number;
    playing: Out[];
  };
  let beds: BedPlayer[] = [];

  const makeBed = (bed: Bed): BedPlayer => {
    const out = ctx.createGain();
    out.gain.value = 0;
    const mod = ctx.createGain();
    out.connect(mod).connect(from(bed.at));
    if (bed.wet) {
      const send = ctx.createGain();
      send.gain.value = bed.wet;
      mod.connect(send).connect(reverbIn);
    }
    want(clipUrl(bed.clip));
    return { bed, out, mod, next: 0, playing: [] };
  };

  /** Keeps every bed going: overlapping copies at random offsets, crossfaded. */
  const feedBeds = (now: number) => {
    for (const player of beds) {
      if (player.next > now + 3) continue;
      // A bed silent at this hour (the market at night) costs nothing.
      if (scene && levelAt(player.bed.level, scene.time) === 0) continue;
      const buffer = ready.get(clipUrl(player.bed.clip));
      if (!buffer) continue;
      const at = Math.max(player.next, now + 0.05);
      const span = buffer.duration;
      const offset = span > 14 ? rand(0, span - 10) : 0;
      const length = span - offset;
      const fade = Math.min(2.5, length / 4);
      const piece = play(buffer, {
        at,
        level: 1,
        offset,
        // A placed bed is panned by where it is; only a little wander is its own.
        pan: player.bed.at ? rand(-0.1, 0.1) : (player.bed.pan ?? 0) + rand(-0.25, 0.25),
        muffle: player.bed.muffle,
        into: player.out,
        fadeIn: 0.001,
        fadeOut: 0.001,
      });
      // Equal-power fades over the linear ramps play() set.
      piece.gain.gain.cancelScheduledValues(at);
      piece.gain.gain.setValueCurveAtTime(curve(0, 1), at, fade);
      piece.gain.gain.setValueCurveAtTime(curve(1, 0), at + length - fade, fade);
      player.playing = [...player.playing.filter((p) => p !== piece), piece].slice(-3);
      player.next = at + length - fade;
    }
  };

  const bedOf = (clip: Clip) => beds.find((b) => b.bed.clip === clip);

  /* ---- Happenings --------------------------------------------------------- */

  type HappeningPlayer = { h: Happening; next: number };
  let happenings: HappeningPlayer[] = [];

  const fire = (h: Happening, level: number) => {
    const choices = h.sounds.filter((s) => isCall(s) || bufferOf(s));
    if (choices.length === 0) return;
    const sound = pick(choices);
    const spread = h.spread ?? 0.6;
    if (isCall(sound)) {
      call(sound, ctx.currentTime + 0.05, level, {
        pan: rand(-spread, spread),
        muffle: h.muffle,
        wet: h.wet,
      });
      return;
    }
    const buffer = bufferOf(sound)!;
    const max = h.max;
    play(buffer, {
      level,
      pan: h.at ? rand(-0.15, 0.15) : rand(-spread, spread),
      into: from(h.at),
      rate: h.rate ? rand(h.rate[0], h.rate[1]) : 1,
      muffle: h.muffle,
      wet: h.wet,
      offset: max && buffer.duration > max * 1.5 ? rand(0, buffer.duration - max) : 0,
      duration: max,
      fadeIn: max ? 0.3 : 0.01,
      fadeOut: max ? 0.8 : 0.05,
    });
  };

  /* ---- Synthesis: wind, cicadas, sparks, wheels, a roar ------------------ */

  const loopNoise = () => {
    const source = ctx.createBufferSource();
    source.buffer = white;
    source.loop = true;
    source.start(0, Math.random() * white.duration);
    return source;
  };
  /*
   * A slow, irregular modulator: noise smoothed down to a fraction of a hertz.
   * Sine LFOs were the first try, and a sine at a few hertz on a band of noise
   * is the sound of an idling engine — the one thing wind is not.
   */
  const drift = (smoothHz: number, depth: number, target: AudioParam) => {
    const smoother = ctx.createBiquadFilter();
    smoother.type = "lowpass";
    smoother.frequency.value = smoothHz;
    smoother.Q.value = 0.5;
    const amount = ctx.createGain();
    amount.gain.value = depth * (6 / Math.sqrt(smoothHz));
    loopNoise().connect(smoother).connect(amount).connect(target);
  };

  // Wind: two bands of hiss, one airy and one through the stones, each gusting
  // on its own schedule. No sub-bass: rumble is what makes wind read as a car.
  const wind = ctx.createGain();
  wind.gain.value = 0;
  wind.connect(dry);
  for (const [centre, q, level] of [
    [700, 0.6, 0.55],
    [2600, 0.9, 0.25],
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
    loopNoise().connect(high).connect(band).connect(gust).connect(wind);
    drift(0.12, 0.35 * level, gust.gain);
    drift(0.08, centre * 0.35, band.frequency);
  }

  // Cicadas: narrow bands near 5-6 kHz, pulsed fast, swelling slowly.
  const cicadas = ctx.createGain();
  cicadas.gain.value = 0;
  cicadas.connect(dry);
  for (let i = 0; i < 3; i += 1) {
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 4800 + i * 650;
    band.Q.value = 9;
    const pulse = ctx.createGain();
    pulse.gain.value = 0.5;
    const swell = ctx.createGain();
    swell.gain.value = 0.6;
    const pan = ctx.createStereoPanner();
    pan.pan.value = -0.7 + i * 0.7;
    loopNoise().connect(band).connect(pulse).connect(swell).connect(pan).connect(cicadas);
    for (const [hz, depth, target] of [
      [38 + i * 7, 0.5, pulse.gain],
      [0.05 + i * 0.03, 0.55, swell.gain],
    ] as const) {
      const osc = ctx.createOscillator();
      osc.frequency.value = hz;
      const amount = ctx.createGain();
      amount.gain.value = depth;
      osc.connect(amount).connect(target);
      osc.start();
    }
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
    source.start(at, Math.random() * 3, len + 0.02);
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
      s.start(at, Math.random() * 3);
      s.stop(at + span + 0.2);
      live.add(s);
      s.onended = () => {
        live.delete(s);
        s.disconnect();
      };
    }
    return peak;
  };

  /* ---- Calls: birds and a trumpet, made from tones ----------------------- */

  /** A harmonic recipe: amplitudes of the partials, from the fundamental up. */
  const waves = new Map<string, PeriodicWave>();
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

  type Placement = {
    pan?: number | undefined;
    muffle?: number | undefined;
    wet?: number | undefined;
  };
  /** Where a synthesised sound goes: muffled with distance, panned, into the room. */
  const place = (o: Placement) => {
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
    panner.pan.value = Math.max(-1, Math.min(1, o.pan ?? 0));
    node = node.connect(panner);
    node.connect(dry);
    if (o.wet) {
      const send = ctx.createGain();
      send.gain.value = o.wet;
      node.connect(send).connect(reverbIn);
    }
    return input;
  };
  const keep = (source: AudioScheduledSourceNode, from: number, to: number, tail: AudioNode) => {
    source.start(from);
    source.stop(to);
    live.add(source);
    source.onended = () => {
      live.delete(source);
      source.disconnect();
      tail.disconnect();
    };
  };

  /**
   * One oscillator for a whole call, its pitch and loudness drawn note by note
   * with automation — a lark's minute-long song costs two nodes, not two hundred.
   * Each note: [start, length, pitch from, pitch peak, pitch to, loudness].
   */
  type Note = readonly [number, number, number, number, number, number];
  const sing = (
    notes: readonly Note[],
    at: number,
    level: number,
    timbre: PeriodicWave | "sine",
    o: Placement & { attack?: number; release?: number; vibrato?: number; band?: number },
  ) => {
    if (notes.length === 0) return at;
    const osc = ctx.createOscillator();
    if (timbre === "sine") osc.type = "sine";
    else osc.setPeriodicWave(timbre);
    const env = ctx.createGain();
    env.gain.value = 0;
    let node: AudioNode = osc;
    if (o.band) {
      const band = ctx.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.value = o.band;
      band.Q.value = 0.9;
      node = node.connect(band);
    }
    node.connect(env).connect(place(o));
    const attack = o.attack ?? 0.02;
    const release = o.release ?? 0.05;
    let end = at;
    for (const [start, length, from, peak, to, loud] of notes) {
      const t = at + start;
      osc.frequency.setValueAtTime(from, t);
      osc.frequency.linearRampToValueAtTime(peak, t + length * 0.3);
      osc.frequency.linearRampToValueAtTime(to, t + length);
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(level * loud, t + Math.min(attack, length / 3));
      env.gain.setValueAtTime(level * loud, t + length - Math.min(release, length / 2));
      env.gain.linearRampToValueAtTime(0, t + length);
      end = Math.max(end, t + length);
    }
    if (o.vibrato) {
      const lfo = ctx.createOscillator();
      lfo.frequency.value = rand(5, 6.5);
      const depth = ctx.createGain();
      depth.gain.value = o.vibrato;
      lfo.connect(depth).connect(osc.frequency);
      keep(lfo, at, end + 0.1, depth);
    }
    keep(osc, at, end + 0.1, env);
    return end;
  };

  const call = (kind: Call, at: number, level: number, o: Placement) => {
    switch (kind) {
      case "owl": {
        // Otus scops: one soft, pure "tyu" near 1.2 kHz, every two and a half
        // seconds, a few times over.
        const f = rand(1120, 1260);
        const notes: Note[] = [];
        const n = Math.floor(rand(3, 7));
        for (let i = 0; i < n; i += 1)
          notes.push([i * rand(2.3, 2.7), rand(0.16, 0.2), f * 0.95, f * 1.02, f * 0.97, 1]);
        sing(notes, at, level * 0.5, wave("owl", [1, 0.08, 0.03]), {
          ...o,
          attack: 0.04,
          release: 0.09,
        });
        return;
      }
      case "dove": {
        // Streptopelia decaocto: "coo-COOO-coo", breathy and low, twice or thrice.
        const f = rand(470, 540);
        const notes: Note[] = [];
        const n = Math.floor(rand(2, 5));
        for (let i = 0; i < n; i += 1) {
          const t = i * rand(1.7, 2);
          notes.push([t, 0.26, f, f * 1.02, f * 0.94, 0.7]);
          notes.push([t + 0.4, 0.55, f * 1.06, f * 1.1, f * 0.98, 1]);
          notes.push([t + 1.08, 0.34, f * 0.94, f * 0.96, f * 0.86, 0.75]);
        }
        sing(notes, at, level * 0.55, wave("dove", [1, 0.22, 0.07, 0.02]), {
          ...o,
          attack: 0.06,
          release: 0.12,
          muffle: Math.min(o.muffle ?? 1600, 1600),
        });
        return;
      }
      case "gull": {
        // Larus: the long call — a rising "kyow", then a run of shorter ones.
        const f = rand(780, 900);
        const notes: Note[] = [[0, 0.45, f * 0.8, f * 1.5, f * 1.1, 1]];
        const n = Math.floor(rand(3, 8));
        let t = 0.6;
        for (let i = 0; i < n; i += 1) {
          const len = rand(0.18, 0.26);
          notes.push([t, len, f, f * 1.45, f * 0.95, rand(0.6, 0.9) * (1 - i * 0.06)]);
          t += len + rand(0.12, 0.2);
        }
        sing(
          notes,
          at,
          level * 0.32,
          wave("gull", [1, 0.9, 0.75, 0.6, 0.45, 0.35, 0.25, 0.18, 0.12, 0.08]),
          { ...o, attack: 0.03, release: 0.06, band: 1900 },
        );
        return;
      }
      case "lark": {
        // Alauda: a high, fast, endless warble from far overhead.
        const notes: Note[] = [];
        const span = rand(6, 12);
        for (let t = 0; t < span;) {
          const len = rand(0.04, 0.13);
          const f = rand(2600, 5200);
          notes.push([t, len, f, f + rand(-900, 900), f + rand(-700, 700), rand(0.35, 1)]);
          t += len + rand(0.01, 0.05) + (Math.random() < 0.06 ? rand(0.2, 0.5) : 0);
        }
        sing(notes, at, level * 0.22, "sine", { ...o, attack: 0.008, release: 0.015 });
        return;
      }
      default:
    }
  };

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
      .connect(place({ pan: 0.3, wet: 0.35 }));
    keep(source, at, at + beats[beats.length - 1]! + 0.4, env);
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
        if (lines.length > 0 && Math.random() < 0.65) {
          // An actor's voice from the stage, carried by the bowl.
          const comedy = Math.random() < 0.5 && lines.some((l) => l.startsWith("actor-frogs"));
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
        } else {
          // A choral song: the aulos (or the kithara) from the stage.
          const clip: Clip = Math.random() < 0.6 ? "aulos" : "lyre";
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
        const strong = Math.random();
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
        const runners = Math.random() < 0.35;
        race = {
          laps: runners ? 2 : Math.floor(rand(2, 4)),
          direction: Math.random() < 0.5 ? 1 : -1,
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
        if (Math.random() < 0.6) applause(peak + 0.3, 0.4, rand(3.5, 5));
        if (!race.runners && Math.random() < 0.4) {
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
    if (aulos) {
      const source = play(aulos, {
        at,
        level: 1,
        offset: rand(0, Math.max(0, aulos.duration - span)),
        duration: span,
        pan,
        wet: 0.45,
        muffleCurve: closeness.map((v) => 700 + 6500 * v),
        fadeIn: 0.01,
        fadeOut: 0.01,
        into,
      });
      source.gain.gain.cancelScheduledValues(at);
      source.gain.gain.setValueCurveAtTime(
        closeness.map((v) => 0.42 * v),
        at,
        span,
      );
    }
    const drum = ready.get(clipUrl("drum"));
    if (drum) {
      for (let t = 2; t < span - 2; t += rand(1.55, 1.85)) {
        const near = Math.sin((t / span) * Math.PI) ** 1.5;
        play(drum, {
          at: at + t,
          level: 0.38 * near * (Math.round(t) % 2 === 0 ? 1 : 0.7),
          pan,
          rate: rand(0.9, 1.0),
          muffle: 900 + 5000 * near,
          wet: 0.4,
          into,
        });
      }
    }
    say(scene?.scape.voices ?? [], at + span * 0.45, 0.32, { pan, wet: 0.5, muffle: 4500, into });
    if (Math.random() < 0.6) {
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
    const beat = night ? 0.62 : 0.5;
    // Heavy, light, rest, heavy, rest, rest — a pattern, never quite metronomic.
    const pattern = [1, 0.5, 0, 0.9, 0, 0, 0.8, 0.45];
    let t = 0;
    const span = rand(14, 22);
    const shakes: number[] = [];
    const gourd = scene?.scape.character === "neolithic";
    if (drum) {
      for (let i = 0; t < span; i += 1, t += beat * rand(0.96, 1.04)) {
        // At Göbeklitepe a rattle answers the drum on the off-beats.
        if (gourd && t > 2 && t < span - 2) shakes.push(t + beat * 0.5, t + beat * 0.75);
        const accent = pattern[i % pattern.length]!;
        if (!accent) continue;
        const swell = Math.min(1, t / 4, (span - t) / 4);
        play(drum, {
          at: at + t,
          level: 0.45 * accent * Math.max(0.1, swell) * (night ? 0.8 : 1),
          rate: rand(0.78, 0.84),
          pan: places.altar ? 0 : -0.25,
          wet: 0.55,
          muffle: 2600,
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
    for (const player of happenings) {
      if (now < player.next) continue;
      const level = levelAt(player.h.level, scene.time);
      if (level > 0) fire(player.h, level);
      player.next = now + rand(player.h.every[0], player.h.every[1]);
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
      for (const piece of player.playing) piece.stop(now + 2);
    }
    beds = scape.beds.map(makeBed);
    happenings = scape.happenings.map((h) => ({
      h,
      // The first of each comes sooner than the rest, so a short visit hears it.
      next: now + rand(h.every[0] * 0.2, h.every[0]),
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
        for (const player of beds) player.next = 0;
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
