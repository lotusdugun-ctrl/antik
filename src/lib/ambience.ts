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

function noiseBuffer(ctx: AudioContext, seconds: number, brown: boolean) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let channel = 0; channel < 2; channel += 1) {
    const data = buffer.getChannelData(channel);
    let last = 0;
    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1;
      if (brown) {
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
      } else {
        data[i] = white;
      }
    }
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

  const white = noiseBuffer(ctx, 4, false);
  const brown = noiseBuffer(ctx, 6, true);
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

  const layers: Layer[] = [];
  const timers: number[] = [];
  const layer = (level: Layer["level"]) => {
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(master);
    layers.push({ gain, level });
    return gain;
  };

  /* Wind: brown noise through a low-pass whose cutoff and level both breathe. */
  {
    const out = layer((s) => (s.exposed ? 0.55 : 0.32));
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 420;
    filter.Q.value = 0.7;
    const swell = ctx.createGain();
    swell.gain.value = 0.7;
    loop(brown).connect(filter).connect(swell).connect(out);
    lfo(0.07, 220, filter.frequency);
    lfo(0.11, 0.3, swell.gain);
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
    const out = layer((s) => (s.crowd ? (s.time === "night" ? 0.05 : 0.16) : 0));
    for (let i = 0; i < 12; i += 1) {
      const band = ctx.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.value = 280 + Math.random() * 1400;
      band.Q.value = 3 + Math.random() * 3;
      const voice = ctx.createGain();
      voice.gain.value = 0.5;
      const pan = ctx.createStereoPanner();
      pan.pan.value = Math.random() * 1.6 - 0.8;
      loop(white).connect(band).connect(voice).connect(pan).connect(out);
      lfo(2.5 + Math.random() * 4, 0.5, voice.gain);
      lfo(0.1 + Math.random() * 0.3, 260, band.frequency);
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
