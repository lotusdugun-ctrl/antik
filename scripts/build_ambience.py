"""
Build the recorded half of the 3D models' soundscapes: public/ambience/*.mp3.

    python scripts/build_ambience.py <sources-dir> [clip ...]

Nothing here runs in the app or the build; it is the record of where every
clip in public/ambience came from and what was done to it, so that the files
can be rebuilt (or replaced) by anyone with the same sources. Name clips to
rebuild only those. Every source is public domain (CC0); everything else is
synthesised below, from nothing but numbers, and is ours to publish:

  ESC-50/         https://github.com/karolpiczak/ESC-50  (audio/, LICENSE)
                  Only clips whose freesound.org original is CC0, as listed
                  clip by clip in that repository's LICENSE file — checked
                  again by esc() below, which refuses any clip not marked
                  [CC0] there. (The dataset as a whole is CC BY-NC; each clip
                  keeps the licence of its freesound original.)
  minetest_game/  https://github.com/minetest/minetest_game  (mods/env_sounds)
                  env_sounds_water.*.ogg: Yuval, freesound 197023, CC0
                  (mods/env_sounds/license.txt).
  sonic-pi/       https://github.com/sonic-pi-net/sonic-pi  (etc/samples)
                  CC0 (freesound originals listed in etc/samples/README.md).

Synthesised here: the theatre crowd's murmur and the market's talk (babble:
many synthetic voices, each a pulse train through moving vowel formants —
no words, no recorded speech), the gallop, the horses' whinnies, the
smith's anvil, the masons' chisels, and the aulos and lyre music (melodies
written for this in the Dorian mode).

Until October 2026 several of these clips were cut from the game 0 A.D.
(CC BY-SA 3.0). ShareAlike was a condition the app's publisher did not want,
so every one of them was replaced: by CC0 recordings where ESC-50 had the
sound, and by synthesis where it did not.

Every file is mono MP3 at 32 kHz and 40-56 kbit/s, which is plenty for
ambience heard under a voice. Loops are not made seamless here: the player
crossfades overlapping copies at random offsets.
"""

import pathlib
import re
import subprocess
import sys

import numpy as np
from scipy import signal

SRC = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
ONLY = set(sys.argv[2:])
OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "ambience"
RATE = 32000

ESC = "ESC-50/audio"
MT = "minetest_game/mods/env_sounds/sounds"
SP = "sonic-pi/etc/samples"
RNG = np.random.default_rng(2026)

def load(rel: str, start: float = 0.0, end: float | None = None) -> np.ndarray:
    # A gentle high-pass on the way in: no rumble, no DC.
    args = ["ffmpeg", "-v", "error", "-i", str(SRC / rel), "-af", "highpass=f=45"]
    args += ["-ac", "1", "-ar", str(RATE)]
    raw = subprocess.run([*args, "-f", "f32le", "-"], capture_output=True, check=True).stdout
    wave = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
    a = int(start * RATE)
    b = len(wave) if end is None else int(end * RATE)
    return wave[a:b]


def fade(wave: np.ndarray, seconds: float = 0.02) -> np.ndarray:
    n = min(len(wave) // 2, int(seconds * RATE))
    if n > 0:
        ramp = np.linspace(0.0, 1.0, n)
        wave = wave.copy()
        wave[:n] *= ramp
        wave[-n:] *= ramp[::-1]
    return wave


def chain(parts: list[np.ndarray], overlap: float = 1.0) -> np.ndarray:
    """Join clips with equal-power crossfades."""
    n = int(overlap * RATE)
    out = parts[0]
    for part in parts[1:]:
        k = min(n, len(out) // 2, len(part) // 2)
        t = np.linspace(0.0, np.pi / 2, k)
        mixed = out[-k:] * np.cos(t) + part[:k] * np.sin(t)
        out = np.concatenate([out[:-k], mixed, part[k:]])
    return out


def layer(parts: list[tuple[np.ndarray, float, float]]) -> np.ndarray:
    """Mix (clip, offset seconds, gain) into one, as a crowd is many people."""
    length = max(int(o * RATE) + len(p) for p, o, _ in parts)
    out = np.zeros(length)
    for part, offset, gain in parts:
        a = int(offset * RATE)
        out[a : a + len(part)] += part * gain
    return out


def normalise(wave: np.ndarray, rms_db: float, peak_db: float = -1.0) -> np.ndarray:
    """To a loudness (RMS over the louder half of the clip), never past a peak."""
    frames = wave[: len(wave) // 1024 * 1024].reshape(-1, 1024)
    levels = np.sqrt((frames**2).mean(axis=1))
    loud = np.sort(levels)[len(levels) // 2 :]
    rms = float(np.sqrt((loud**2).mean())) + 1e-9
    gain = 10 ** (rms_db / 20) / rms
    peak = float(np.abs(wave).max()) * gain
    limit = 10 ** (peak_db / 20)
    if peak > limit:
        gain *= limit / peak
    return wave * gain


def write(name: str, wave: np.ndarray, kbps: int = 48, rms_db: float = -20.0) -> None:
    wave = normalise(fade(wave), rms_db)
    OUT.mkdir(parents=True, exist_ok=True)
    pcm = wave.astype(np.float32).tobytes()
    subprocess.run(
        [
            "ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(RATE), "-ac", "1", "-i", "-",
            "-c:a", "libmp3lame", "-b:a", f"{kbps}k", "-map_metadata", "-1",
            str(OUT / f"{name}.mp3"),
        ],
        input=pcm,
        check=True,
    )
    size = (OUT / f"{name}.mp3").stat().st_size
    print(f"{name:16s} {len(wave) / RATE:6.1f}s {size / 1024:7.1f} KB")


def notch(wave: np.ndarray, *hz: float) -> np.ndarray:
    """Take out a held tone: heard again and again as a loop repeats, it gives the loop away."""
    filters = ",".join(f"bandreject=f={f}:width_type=q:w=6" for f in hz)
    out = subprocess.run(
        ["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(RATE), "-ac", "1", "-i", "-",
         "-af", filters, "-f", "f32le", "-"],
        input=wave.astype(np.float32).tobytes(), capture_output=True, check=True,
    ).stdout
    return np.frombuffer(out, dtype=np.float32).copy()


_ESC_LICENCES: dict[str, str] | None = None


def esc(clip: str, start: float = 0.0, end: float | None = None) -> np.ndarray:
    """An ESC-50 clip, only if its freesound original is CC0."""
    global _ESC_LICENCES
    if _ESC_LICENCES is None:
        text = (SRC / "ESC-50" / "LICENSE").read_text(encoding="utf-8")
        _ESC_LICENCES = dict(re.findall(r"- \[(\S+?)\.ogg\]:.*\[([^\]]+)\]\s*$", text, re.M))
    base = clip.rsplit("-", 1)[0]
    if _ESC_LICENCES.get(base) != "CC0":
        raise SystemExit(f"ESC-50 {clip} is {_ESC_LICENCES.get(base)!r}, not CC0: refused")
    return load(f"{ESC}/{clip}.wav", start, end)


def wanted(name: str) -> bool:
    return not ONLY or name in ONLY


def trim(wave: np.ndarray, floor_db: float = -30.0, pad: float = 0.08) -> np.ndarray:
    """Cut the quiet ends off a one-shot."""
    frame = 320
    n = len(wave) // frame
    levels = 20 * np.log10(np.sqrt((wave[: n * frame].reshape(n, frame) ** 2).mean(1)) + 1e-9)
    loud = np.where(levels > levels.max() + floor_db)[0]
    a = max(0, loud[0] * frame - int(pad * RATE))
    b = min(len(wave), (loud[-1] + 1) * frame + int(pad * RATE))
    return wave[a:b]


# ---- Synthesis --------------------------------------------------------------

def t_axis(seconds: float) -> np.ndarray:
    return np.arange(int(seconds * RATE)) / RATE


def resonator(x: np.ndarray, f: float, q: float) -> np.ndarray:
    b, a = signal.iirpeak(min(f, RATE / 2 - 100), q, fs=RATE)
    return signal.lfilter(b, a, x)


def band(x: np.ndarray, lo: float, hi: float, order: int = 2) -> np.ndarray:
    sos = signal.butter(order, [lo, min(hi, RATE / 2 - 100)], "bandpass", fs=RATE, output="sos")
    return signal.sosfilt(sos, x)


def lowpass(x: np.ndarray, f: float, order: int = 2) -> np.ndarray:
    return signal.sosfilt(signal.butter(order, f, "lowpass", fs=RATE, output="sos"), x)


def room(x: np.ndarray, seconds: float = 0.7, wet: float = 0.25) -> np.ndarray:
    """A plain reverb: convolution with decaying noise."""
    n = int(seconds * RATE)
    tail = RNG.standard_normal(n) * np.exp(-np.arange(n) / (n / 6.0))
    tail = lowpass(tail, 4000) / np.sqrt((tail**2).sum())
    return x + wet * signal.fftconvolve(x, tail)[: len(x)]


# Vowel formants (F1, F2) of an adult voice, roughly.
VOWELS = [(730, 1090), (530, 1840), (270, 2290), (570, 840), (300, 870), (440, 1020), (660, 1720)]


def talker(seconds: float, f0: float) -> np.ndarray:
    """One synthetic voice chattering: syllables of buzz through moving vowel formants."""
    n = int(seconds * RATE)
    out = np.zeros(n)
    pos = int(RNG.uniform(0, 1.5) * RATE)
    while pos < n:
        words = RNG.integers(3, 12)  # a phrase
        for _ in range(words):
            dur = RNG.uniform(0.09, 0.28)
            m = int(dur * RATE)
            if pos + m >= n:
                break
            tt = np.arange(m) / RATE
            pitch = f0 * (1 + 0.08 * np.sin(2 * np.pi * RNG.uniform(1, 3) * tt + RNG.uniform(0, 6)))
            phase = 2 * np.pi * np.cumsum(pitch) / RATE
            buzz = sum(np.sin(k * phase) / k for k in range(1, 18))  # a glottal-ish sawtooth
            buzz += 0.25 * RNG.standard_normal(m)  # breath, and consonant noise
            f1, f2 = VOWELS[RNG.integers(len(VOWELS))]
            voiced = resonator(buzz, f1, 4) + 0.6 * resonator(buzz, f2, 6)
            env = np.sin(np.pi * np.linspace(0, 1, m)) ** 0.7
            if RNG.random() < 0.35:  # a consonant: a little hiss at the onset
                k = min(m, int(0.03 * RATE))
                voiced[:k] += band(RNG.standard_normal(k), 2500, 7000) * 0.6
            out[pos : pos + m] += voiced * env * RNG.uniform(0.6, 1.0)
            pos += m + int(RNG.uniform(0.0, 0.05) * RATE)
        pos += int(RNG.uniform(0.3, 2.2) * RATE)  # a pause between phrases
    return out / (np.abs(out).max() + 1e-9)


def babble(seconds: float, voices: int, distance_hz: float) -> np.ndarray:
    """Many talkers at once, further off the lower `distance_hz` (a low-pass)."""
    out = np.zeros(int(seconds * RATE))
    for _ in range(voices):
        f0 = RNG.uniform(95, 140) if RNG.random() < 0.6 else RNG.uniform(180, 250)
        out += talker(seconds, f0) * RNG.uniform(0.3, 1.0)
    return room(lowpass(out, distance_hz), 0.9, 0.35)


def hoof(strength: float) -> np.ndarray:
    """One hoof striking packed earth: a dull thud and a dry crack."""
    tt = t_axis(0.12)
    thud = np.sin(2 * np.pi * RNG.uniform(70, 110) * tt) * np.exp(-tt / 0.03)
    crack = band(RNG.standard_normal(len(tt)), 700, 2600) * np.exp(-tt / 0.012)
    dirt = band(RNG.standard_normal(len(tt)), 2000, 6000) * np.exp(-tt / 0.04) * 0.15
    return strength * (thud + 0.5 * crack + dirt)


def gallop(seconds: float, horses: int = 4) -> np.ndarray:
    out = np.zeros(int(seconds * RATE) + RATE)
    for h in range(horses):
        stride = RNG.uniform(0.42, 0.47)  # about 2.2 strides a second
        t = RNG.uniform(0, stride)
        while t < seconds:
            # Three beats and the moment of suspension: the gallop's rhythm.
            for k, gap in enumerate((0.0, 0.085, 0.165)):
                a = int((t + gap + RNG.normal(0, 0.006)) * RATE)
                hit = hoof(RNG.uniform(0.6, 1.0) * (1.0 if k == 1 else 0.8) / (1 + 0.3 * h))
                out[a : a + len(hit)] += hit[: len(out) - a]
            t += stride * RNG.uniform(0.97, 1.03)
    return room(out[: int(seconds * RATE)], 0.4, 0.15)


def whinny(seconds: float, top: float) -> np.ndarray:
    """A horse's neigh: a high voice that rises, then falls in quick pulses, and a snort."""
    tt = t_axis(seconds)
    u = tt / seconds
    contour = top * (0.75 + 0.25 * np.sin(np.pi * np.minimum(u * 2.2, 1))) * (1 - 0.45 * u**1.5)
    trill = 1 + 0.06 * np.sin(2 * np.pi * RNG.uniform(14, 18) * tt)  # the whinny's flutter
    phase = 2 * np.pi * np.cumsum(contour * trill) / RATE
    tone = sum(np.sin(k * phase) * (0.7**k) for k in range(1, 9))
    tone += 0.3 * band(RNG.standard_normal(len(tt)), 1500, 6000)
    voice = resonator(tone, 1100, 3) + 0.7 * resonator(tone, 2600, 4)
    amp = np.sin(np.pi * np.minimum(u * 1.1, 1)) * (0.65 + 0.35 * np.sin(2 * np.pi * 9 * tt) ** 2)
    out = voice * amp
    snort_len = int(0.22 * RATE)
    snort = band(RNG.standard_normal(snort_len), 200, 1800) * np.exp(-np.arange(snort_len) / (0.06 * RATE))
    return np.concatenate([out, snort * 0.8 * np.abs(out).max() / (np.abs(snort).max() + 1e-9)])


def strike_metal(seconds: float, strength: float) -> np.ndarray:
    """Hammer on an anvil: an inharmonic ring and the contact's click."""
    tt = t_axis(seconds)
    ring = sum(
        np.sin(2 * np.pi * f * tt + RNG.uniform(0, 6)) * np.exp(-tt / d) * g
        for f, d, g in ((1180, 0.9, 1.0), (2790, 0.55, 0.7), (4410, 0.35, 0.5), (6120, 0.2, 0.35), (8030, 0.12, 0.2))
    )
    click = band(RNG.standard_normal(len(tt)), 2000, 9000) * np.exp(-tt / 0.004)
    return strength * (ring * 0.6 + click)


def chisel(strength: float) -> np.ndarray:
    """A chisel driven into marble: a bright tick and the stone's short ring."""
    tt = t_axis(0.25)
    tick = band(RNG.standard_normal(len(tt)), 2500, 9000) * np.exp(-tt / 0.006)
    ring = resonator(RNG.standard_normal(len(tt)), RNG.uniform(1100, 1700), 12) * np.exp(-tt / 0.05)
    return strength * (tick + 0.35 * ring)


DORIAN = [0, 2, 3, 5, 7, 9, 10, 12, 14, 15]


def melody(notes: int, low: int = 0, high: int = 9) -> list[tuple[int, float]]:
    """A modal line, stepwise mostly, in phrases that come home to the final."""
    out, i = [], 4
    for n in range(notes):
        if n % 8 == 7:
            i = 0 if RNG.random() < 0.6 else 4  # cadence on the final or the fifth
            out.append((DORIAN[i], 1.5))
            continue
        i = int(np.clip(i + RNG.choice([-2, -1, -1, 1, 1, 2, 0]), low, high))
        out.append((DORIAN[i], RNG.choice([0.5, 0.5, 0.75, 1.0])))
    return out


def aulos(seconds: float) -> np.ndarray:
    """The aulos: two reed pipes, one playing the tune, one holding the final."""
    base = 293.66  # D
    out = np.zeros(int(seconds * RATE) + RATE)
    t, beat = 0.6, 0.42
    for step, length in melody(200):
        if t > seconds - 1:
            break
        dur = length * beat
        tt = t_axis(dur + 0.05)
        f = base * 2 ** (step / 12)
        vib = 1 + 0.006 * np.sin(2 * np.pi * 5.2 * tt) * np.minimum(tt / 0.25, 1)
        phase = 2 * np.pi * np.cumsum(f * vib) / RATE
        reed = sum(np.sin(k * phase) * (1 / k if k % 2 else 0.45 / k) for k in range(1, 14))
        reed += 0.05 * RNG.standard_normal(len(tt))
        env = np.minimum(tt / 0.03, 1) * np.minimum((dur + 0.05 - tt) / 0.04, 1)
        a = int(t * RATE)
        out[a : a + len(tt)] += reed * env
        t += dur
    tt = t_axis(len(out) / RATE)
    drone_phase = 2 * np.pi * base / 2 * tt * (1 + 0.002 * np.sin(2 * np.pi * 0.3 * tt))
    drone = sum(np.sin(k * drone_phase) * (1 / k if k % 2 else 0.4 / k) for k in range(1, 12))
    out += 0.35 * drone * np.minimum(tt / 0.5, 1)
    voiced = resonator(out, 1150, 1.5) + 0.5 * resonator(out, 2700, 2) + 0.4 * out
    return room(lowpass(voiced, 7000)[: int(seconds * RATE)], 1.1, 0.3)


def pluck(f: float, seconds: float, bright: float = 0.5) -> np.ndarray:
    """A plucked gut string (Karplus-Strong)."""
    n = int(seconds * RATE)
    period = int(RATE / f)
    buf = RNG.uniform(-1, 1, period)
    buf = lowpass(buf, 1500 + 4000 * bright, 1)
    out = np.empty(n)
    for i in range(n):
        out[i] = buf[i % period]
        buf[i % period] = 0.996 * 0.5 * (buf[i % period] + buf[(i + 1) % period])
    return out * np.exp(-np.arange(n) / (RATE * 1.4))


def lyre(seconds: float) -> np.ndarray:
    """The kithara: seven strings in the Dorian mode, plucked in phrases."""
    base = 146.83  # D below middle C
    strings = [base * 2 ** (s / 12) for s in DORIAN[:7]]
    out = np.zeros(int(seconds * RATE) + 3 * RATE)
    t = 0.4
    for step, length in melody(160, 0, 6):
        if t > seconds - 1:
            break
        f = strings[DORIAN.index(step)] * 2
        note = pluck(f, 2.4, RNG.uniform(0.3, 0.7)) * RNG.uniform(0.7, 1.0)
        a = int(t * RATE)
        out[a : a + len(note)] += note
        if RNG.random() < 0.3:  # now and then the octave below, the other hand
            low = pluck(f / 2, 2.4, 0.3) * 0.5
            out[a : a + len(low)] += low
        t += length * 0.55
    body = resonator(out, 240, 1.2) * 0.5 + out
    return room(body[: int(seconds * RATE)], 1.0, 0.3)


def scatter(bed: np.ndarray, events: list[tuple[np.ndarray, float]], count: int) -> np.ndarray:
    """Drop `count` of the given (clip, gain) events at random times over a bed."""
    out = bed.copy()
    for _ in range(count):
        clip, gain = events[RNG.integers(len(events))]
        a = int(RNG.uniform(0, max(1, len(out) - len(clip))))
        out[a : a + len(clip)] += clip[: len(out) - a] * gain * RNG.uniform(0.6, 1.0)
    return out


def rms(x: np.ndarray) -> float:
    return float(np.sqrt((x**2).mean())) + 1e-9



# ---- Beds: long, looped by the player -------------------------------------

# Birdsong of a spring morning: six CC0 ESC-50 recordings, one after another.
if wanted("birds"):
    write("birds", chain([esc(c) for c in (
        "4-223125-A-14", "4-187769-A-14", "4-182795-A-14",
        "4-223127-A-14", "3-181132-A-14", "4-187769-B-14")], 1.0), 48, -24)

# A seated audience waiting: some forty voices, wordless, from across the cavea.
if wanted("murmur"):
    write("murmur", babble(25, 40, 3200), 48)

# An agora: closer talk, and the market's own noises over it (all CC0).
if wanted("market"):
    talk = babble(60, 16, 5200)
    events = [
        (trim(esc("5-263775-B-26")), 0.5), (trim(esc("4-181599-A-26")), 0.35),  # laughter
        (trim(esc("2-87795-A-24")), 0.3), (trim(esc("1-63679-A-24")), 0.3),  # a cough
        (trim(esc("4-197103-A-6")), 0.35), (trim(esc("3-187549-A-6")), 0.3),  # hens
        (esc("3-94343-A-25"), 0.4),  # footsteps
        (trim(esc("4-182839-A-17")), 0.3),  # water poured
        (trim(esc("1-81001-A-30")), 0.35),  # a knock on a wooden stall
        (trim(esc("2-104877-A-3")), 0.25),  # a cow
    ]
    events = [(clip / rms(clip) * rms(talk), gain) for clip, gain in events]
    write("market", scatter(talk, events, 26), 48)

# Running water: a fountain basin, a spout (Yuval, CC0).
if wanted("fountain"):
    write("fountain", chain([load(f"{MT}/env_sounds_water.{i}.ogg") for i in (1, 2, 3, 4)], 0.8), 40, -24)
# Surf on rocks (CC0, ESC-50).
if wanted("sea"):
    write("sea", chain([esc(c) for c in ("4-182613-A-11", "4-182613-B-11", "5-208810-A-11", "5-208810-B-11")], 1.2), 40, -22)
# A fire of wood (CC0, ESC-50).
if wanted("fire"):
    write("fire", chain([esc(c) for c in ("4-181563-A-12", "1-17808-A-12", "4-182369-A-12")], 0.8), 40, -24)
# Crickets after dark (CC0, ESC-50).
if wanted("crickets"):
    write("crickets", chain([esc(c) for c in ("4-195707-A-13", "1-59102-A-13", "3-162786-A-13", "3-146033-A-13")], 1.0), 40, -24)
# Hooves at the gallop: a team of four, synthesised.
if wanted("hooves"):
    write("hooves", gallop(9.0), 48, -18)

# ---- Music: aulos and lyre (synthesised; melodies written for this) -------

if wanted("aulos"):
    write("aulos", aulos(40.0), 56, -20)
if wanted("lyre"):
    write("lyre", lyre(30.0), 56, -20)

# ---- One-shots -------------------------------------------------------------

for name, clip, kbps in (
    ("applause1", "3-138114-A-22", 48), ("applause2", "5-221568-A-22", 48),
    ("applause3", "5-221567-A-22", 48), ("cheer", "2-25292-A-22", 48),
    ("laugh1", "1-36164-B-26", 40), ("laugh2", "5-244526-A-26", 40), ("laugh3", "1-73123-A-26", 40),
):
    if wanted(name):
        write(name, esc(clip), kbps)
for i, (seconds, top) in enumerate(((1.3, 880), (1.2, 960), (1.0, 820)), 1):
    if wanted(f"neigh{i}"):
        write(f"neigh{i}", whinny(seconds, top), 40, -18)
if wanted("moo1"):
    write("moo1", trim(esc("1-202111-A-3")), 40, -18)
if wanted("moo2"):
    write("moo2", trim(esc("3-163727-A-3")), 40, -18)
for name, clip in (("moo3", "4-181955-A-3"), ("sheep", "3-140199-C-8"), ("dog1", "3-155312-A-0"),
                   ("dog2", "2-122104-A-0"), ("rooster", "5-200334-A-1"), ("crow", "4-173865-A-9")):
    if wanted(name):
        write(name, esc(clip), 40, -18)
if wanted("saw"):
    write("saw", esc("2-59321-A-49"), 40, -20)
if wanted("footsteps"):
    write("footsteps", esc("3-94342-A-25"), 40, -20)
if wanted("anvil"):
    anvil = np.zeros(int(1.9 * RATE))
    for at, strength in ((0.02, 1.0), (0.95, 0.7)):
        hit = strike_metal(0.9, strength)
        a = int(at * RATE)
        anvil[a : a + len(hit)] += hit[: len(anvil) - a]
    write("anvil", room(anvil, 0.5, 0.2), 40, -18)
if wanted("stone"):
    stone = np.zeros(int(3.4 * RATE))
    t = 0.05
    while t < 3.2:
        hit = chisel(RNG.uniform(0.6, 1.0))
        a = int(t * RATE)
        stone[a : a + len(hit)] += hit[: len(stone) - a]
        t += RNG.uniform(0.28, 0.5)
    write("stone", room(stone, 0.4, 0.2), 40, -18)
if wanted("drum"):
    write("drum", chain([load(f"{SP}/drum_tom_lo_soft.flac"), load(f"{SP}/drum_bass_soft.flac")], 0.02), 40, -16)
