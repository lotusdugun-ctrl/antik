/**
 * The sound of a place, synthesised rather than recorded.
 *
 * Wind, cicadas at noon, crickets after dark, birds, and — in a theatre or a
 * stadium — the murmur of a crowd. All of it is filtered noise and a few
 * oscillators, made in the browser: no files to license, download or cache,
 * so it works offline the moment the page does. It is atmosphere, not
 * evidence, which is why it is off until someone turns it on.
 */
export type AmbienceScene = {
  time: "day" | "golden" | "night";
  /** A building made to hold a crowd. */
  crowd: boolean;
  /** Mountain summits and steppe: more wind, no cicadas in the trees. */
  exposed: boolean;
};

type Layer = { gain: GainNode; level: (scene: AmbienceScene) => number };

function noiseBuffer(ctx: AudioContext, seconds: number) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let channel = 0; channel < 2; channel += 1) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

export function createAmbience() {
  const AudioCtx =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  const ctx = new AudioCtx();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const white = noiseBuffer(ctx, 4);
  const loop = (buffer: AudioBuffer) => {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.loopStart = Math.random();
    source.start(0, Math.random() * buffer.duration);
    return source;
  };
  const lfo = (frequency: number, depth: number, target: AudioParam) => {
    const osc = ctx.createOscillator();
    osc.frequency.value = frequency;
    const amount = ctx.createGain();
    amount.gain.value = depth;
    osc.connect(amount).connect(target);
    osc.start();
    return osc;
  };

  /*
   * A slow, irregular modulator: noise smoothed down to a fraction of a hertz.
   * Sine LFOs were the first try, and a sine at a few hertz on a low band of
   * noise is exactly the sound of an idling engine — regular, mechanical, the
   * one thing wind and a crowd are not.
   */
  const drift = (smoothHz: number, depth: number, target: AudioParam) => {
    const smoother = ctx.createBiquadFilter();
    smoother.type = "lowpass";
    smoother.frequency.value = smoothHz;
    smoother.Q.value = 0.5;
    const amount = ctx.createGain();
    // Low-passed noise is quiet; this brings it back to roughly ±1 first.
    amount.gain.value = depth * (6 / Math.sqrt(smoothHz));
    loop(white).connect(smoother).connect(amount).connect(target);
  };

  const layers: Layer[] = [];
  const timers: number[] = [];
  const layer = (level: Layer["level"]) => {
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(master);
    layers.push({ gain, level });
    return gain;
  };

  /*
   * Wind: no sub-bass at all — rumble under 150 Hz is what made the first
   * version read as a car. Two bands of hiss, one airy and one through the
   * stones, each gusting on its own irregular schedule.
   */
  for (const [centre, q, level] of [
    [700, 0.6, 0.55],
    [2600, 0.9, 0.25],
  ] as const) {
    const out = layer((s) => (s.exposed ? 0.5 : 0.28) * level * 2);
    const high = ctx.createBiquadFilter();
    high.type = "highpass";
    high.frequency.value = 160;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = centre;
    band.Q.value = q;
    const gust = ctx.createGain();
    gust.gain.value = 0.45;
    loop(white).connect(high).connect(band).connect(gust).connect(out);
    drift(0.12, 0.35, gust.gain);
    drift(0.08, centre * 0.35, band.frequency);
  }

  /*
   * Cicadas: narrow bands of noise near 5-6 kHz, pulsed fast and swelling
   * slowly, two or three of them in different places. The Aegean noon sound.
   */
  for (let i = 0; i < 3; i += 1) {
    const out = layer((s) =>
      s.exposed ? 0 : s.time === "day" ? 0.05 : s.time === "golden" ? 0.025 : 0,
    );
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
    loop(white).connect(band).connect(pulse).connect(swell).connect(pan).connect(out);
    lfo(38 + i * 7, 0.5, pulse.gain);
    lfo(0.05 + i * 0.03, 0.55, swell.gain);
  }

  /* Crickets: short sine chirps in threes, after dark. */
  {
    const out = layer((s) => (s.time === "night" ? 0.05 : s.time === "golden" ? 0.012 : 0));
    const chirp = () => {
      const pan = ctx.createStereoPanner();
      pan.pan.value = Math.random() * 1.6 - 0.8;
      pan.connect(out);
      const base = ctx.currentTime + 0.05;
      const pitch = 4200 + Math.random() * 600;
      for (let n = 0; n < 3; n += 1) {
        const osc = ctx.createOscillator();
        osc.frequency.value = pitch;
        const env = ctx.createGain();
        const t = base + n * 0.07;
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(1, t + 0.008);
        env.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
        osc.connect(env).connect(pan);
        osc.start(t);
        osc.stop(t + 0.06);
      }
    };
    timers.push(window.setInterval(chirp, 620));
    timers.push(window.setInterval(() => Math.random() < 0.5 && chirp(), 410));
  }

  /* Birds: a falling, then rising, whistle now and then by day. */
  {
    const out = layer((s) => (s.time === "night" ? 0 : s.exposed ? 0.02 : 0.035));
    const call = () => {
      if (Math.random() < 0.4) return;
      const pan = ctx.createStereoPanner();
      pan.pan.value = Math.random() * 1.8 - 0.9;
      pan.connect(out);
      const notes = 2 + Math.floor(Math.random() * 4);
      let t = ctx.currentTime + 0.05;
      const top = 2400 + Math.random() * 1800;
      for (let n = 0; n < notes; n += 1) {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        const len = 0.06 + Math.random() * 0.1;
        osc.frequency.setValueAtTime(top, t);
        osc.frequency.exponentialRampToValueAtTime(top * (0.6 + Math.random() * 0.6), t + len);
        const env = ctx.createGain();
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(1, t + 0.01);
        env.gain.exponentialRampToValueAtTime(0.001, t + len);
        osc.connect(env).connect(pan);
        osc.start(t);
        osc.stop(t + len + 0.02);
        t += len + 0.04 + Math.random() * 0.08;
      }
    };
    timers.push(window.setInterval(call, 2300));
  }

  /*
   * A crowd: a dozen voices, each a band of noise in the speech range whose
   * loudness wanders on its own, so together they read as talk without any
   * one of them being a word.
   */
  {
    const out = layer((s) => (s.crowd ? (s.time === "night" ? 0.04 : 0.12) : 0));
    const high = ctx.createBiquadFilter();
    high.type = "highpass";
    high.frequency.value = 220;
    high.connect(out);
    for (let i = 0; i < 16; i += 1) {
      // Two formant-like bands per voice, in the range of speech vowels.
      const voice = ctx.createGain();
      voice.gain.value = 0.35;
      const pan = ctx.createStereoPanner();
      pan.pan.value = Math.random() * 1.8 - 0.9;
      const source = loop(white);
      for (const f of [450 + Math.random() * 450, 1300 + Math.random() * 1100]) {
        const band = ctx.createBiquadFilter();
        band.type = "bandpass";
        band.frequency.value = f;
        band.Q.value = 6 + Math.random() * 4;
        source.connect(band).connect(voice);
        drift(1.5 + Math.random() * 2, f * 0.18, band.frequency);
      }
      voice.connect(pan).connect(high);
      // Syllable-ish loudness that never repeats.
      drift(3 + Math.random() * 3, 0.32, voice.gain);
    }
  }

  let scene: AmbienceScene = { time: "day", crowd: false, exposed: false };
  let running = false;
  let ducked = false;
  const level = () => (ducked ? 0.35 : 0.9);
  const apply = (fade: number) => {
    const now = ctx.currentTime;
    for (const l of layers) {
      l.gain.gain.cancelScheduledValues(now);
      l.gain.gain.setTargetAtTime(l.level(scene), now, fade);
    }
  };

  return {
    setScene(next: AmbienceScene) {
      scene = next;
      apply(1.2);
    },
    async start() {
      await ctx.resume();
      running = true;
      apply(0.01);
      master.gain.setTargetAtTime(level(), ctx.currentTime, 0.8);
    },
    stop() {
      running = false;
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
    },
    /** Duck under a voice, so the guide is never fighting the cicadas. */
    duck(on: boolean) {
      ducked = on;
      if (running) master.gain.setTargetAtTime(level(), ctx.currentTime, 0.4);
    },
    dispose() {
      timers.forEach((id) => window.clearInterval(id));
      void ctx.close();
    },
  };
}

export type Ambience = NonNullable<ReturnType<typeof createAmbience>>;
