"""
Build the recorded half of the 3D models' soundscapes: public/ambience/*.mp3.

    python scripts/build_ambience.py <sources-dir>

Nothing here runs in the app or the build; it is the record of where every
clip in public/ambience came from and what was done to it, so that the files
can be rebuilt (or replaced) by anyone with the same sources. The sources are
three public git repositories, checked out under <sources-dir>:

  0ad/            https://github.com/0ad/0ad  (binaries/data/mods/public/audio)
                  Wildfire Games, CC BY-SA 3.0 — attribution required, and the
                  derived clips stay CC BY-SA 3.0 (see public/ambience/CREDITS.txt)
  ESC-50/         https://github.com/karolpiczak/ESC-50  (audio/)
                  Only clips whose freesound.org original is CC0, as listed
                  clip by clip in that repository's LICENSE file.
  minetest_game/  https://github.com/minetest/minetest_game  (mods/env_sounds)
                  env_sounds_water.*.ogg: Yuval, freesound 197023, CC0.
  sonic-pi/       https://github.com/sonic-pi-net/sonic-pi  (etc/samples)
                  CC0 (freesound originals listed in etc/samples/README.md).

Every file is mono MP3 — the one compressed format every browser decodes —
at 32 kHz and 40-56 kbit/s, which is plenty for ambience heard under a voice.
Loops are not made seamless here: the player crossfades overlapping copies
at random offsets, which hides a seam better than any edit could and keeps a
20-second bed from being heard as 20 seconds long.
"""

import pathlib
import subprocess
import sys

import numpy as np

SRC = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "ambience"
RATE = 32000

AD = "0ad/binaries/data/mods/public/audio"
ESC = "ESC-50/audio"
MT = "minetest_game/mods/env_sounds/sounds"
SP = "sonic-pi/etc/samples"


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


def esc(clip: str) -> np.ndarray:
    return load(f"{ESC}/{clip}.wav")


# ---- Beds: long, looped by the player -------------------------------------

# Birdsong of a temperate morning (0 A.D.).
write("birds", load(f"{AD}/ambient/dayscape/day_temperate_12.ogg"), 48, -24)
# An agora: talk, footsteps, a cart, a cow — 0 A.D.'s market recordings.
write(
    "market",
    chain(
        [
            load(f"{AD}/ambient/building/amb_trade_10.ogg"),
            load(f"{AD}/ambient/building/amb_trade_12.ogg"),
            load(f"{AD}/ambient/building/amb_trade_13.ogg"),
        ],
        1.5,
    ),
    48,
)
# A seated audience waiting: the same talk, many times over and further off.
murmur_src = [
    load(f"{AD}/ambient/building/amb_trade_11.ogg"),
    load(f"{AD}/ambient/building/amb_trade_13.ogg"),
    load(f"{AD}/ambient/building/amb_trade_20.ogg"),
    load(f"{AD}/ambient/building/amb_trade_10.ogg"),
]
# Someone in amb_trade holds a note at 334 Hz for half a second; notched out.
write(
    "murmur",
    notch(layer(
        [
            (murmur_src[0], 0.0, 1.0),
            (murmur_src[1], 3.1, 0.8),
            (chain([murmur_src[2], murmur_src[2][int(2 * RATE) :]], 1.0), 6.4, 0.7),
            (murmur_src[3], 1.7, 0.6),
        ]
    )[: int(26 * RATE)], 334, 668),
    48,
)
# Running water: a fountain basin, a spout (Yuval, CC0).
write("fountain", chain([load(f"{MT}/env_sounds_water.{i}.ogg") for i in (1, 2, 3, 4)], 0.8), 40, -24)
# Surf on rocks (CC0, ESC-50).
write("sea", chain([esc(c) for c in ("4-182613-A-11", "4-182613-B-11", "5-208810-A-11", "5-208810-B-11")], 1.2), 40, -22)
# A fire of wood (CC0, ESC-50).
write("fire", chain([esc(c) for c in ("4-181563-A-12", "1-17808-A-12", "4-182369-A-12")], 0.8), 40, -24)
# Crickets after dark (CC0, ESC-50).
write("crickets", chain([esc(c) for c in ("4-195707-A-13", "1-59102-A-13", "3-162786-A-13", "3-146033-A-13")], 1.0), 40, -24)
# Hooves at the gallop: 0 A.D.'s cavalry strides, one after another.
write(
    "hooves",
    chain([load(f"{AD}/actor/mounted/movement/mstep11{i}.ogg", 0.15, 1.75) for i in range(6)], 0.05),
    48,
    -18,
)

# ---- Music: aulos and lyre -----------------------------------------------

# "Whistler" by Omri Lahav for 0 A.D.: its flute solo stands in for the
# aulos, its harp for the kithara. Neither instrument survives to be recorded.
whistler = f"{AD}/music/Whistler.ogg"
write("aulos", load(whistler, 7.0, 47.0), 56, -20)
write("lyre", load(whistler, 63.0, 93.0), 56, -20)

# ---- One-shots -------------------------------------------------------------

write("applause1", esc("3-138114-A-22"), 48)
write("applause2", esc("5-221568-A-22"), 48)
write("applause3", esc("5-221567-A-22"), 48)
write("cheer", esc("2-25292-A-22"), 48)
write("laugh1", esc("1-36164-B-26"), 40)
write("laugh2", esc("5-244526-A-26"), 40)
write("laugh3", esc("1-73123-A-26"), 40)
for i in (1, 2, 3):
    write(f"neigh{i}", load(f"{AD}/actor/fauna/animal/horse_attack{i}.ogg"), 40, -18)
write("moo1", load(f"{AD}/actor/fauna/animal/cattle_02.ogg"), 40, -18)
write("moo2", load(f"{AD}/actor/fauna/animal/cattle_06.ogg"), 40, -18)
write("moo3", esc("4-181955-A-3"), 40, -18)
write("sheep", esc("3-140199-C-8"), 40, -18)
write("dog1", esc("3-155312-A-0"), 40, -18)
write("dog2", esc("2-122104-A-0"), 40, -18)
write("rooster", esc("5-200334-A-1"), 40, -18)
write("crow", esc("4-173865-A-9"), 40, -18)
write("saw", esc("2-59321-A-49"), 40, -20)
write("footsteps", load(f"{AD}/actor/human/movement/Footsteps/Footstep_Rock_Walking.ogg"), 40, -20)
write("anvil", chain([load(f"{AD}/resource/mining/mine_metal_0{i}.ogg") for i in (1, 2)], 0.02), 40, -18)
write(
    "stone",
    chain(
        [load(f"{AD}/resource/mining/mine_stone_0{i}.ogg") for i in (1, 2, 3)]
        + [load(f"{AD}/resource/construction/con_stone_0{i}.ogg") for i in (1, 2)],
        0.02,
    ),
    40,
    -18,
)
write("drum", chain([load(f"{SP}/drum_tom_lo_soft.flac"), load(f"{SP}/drum_bass_soft.flac")], 0.02), 40, -16)
