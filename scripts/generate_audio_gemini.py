"""
Record the audio guide with Google's Gemini speech model, on this computer,
and point the app at the files. Run it from SESLENDIR-GEMINI.bat.

    pip install lameenc
    python scripts/generate_audio_gemini.py --samples        # a few voices to choose from
    python scripts/generate_audio_gemini.py --lang tr --voice Sulafat

Why Gemini: the device voice (Turkish had no recording at all) and the
open-source Piper voice (English) read every chapter alike. Gemini is told,
chapter by chapter, how to say it — a welcome, a story, something to point
at, a confession of what is not known — in plain words, and reads like a
guide rather than a newsreader. Its output may be published under the Gemini
API terms; the credit goes to src/lib/voice-credits.json with engine "gemini".

The key is read from the environment (GEMINI_API_KEY) or from
scripts/.gemini-key (one line, never committed). Nothing here runs in the app.

Reads scripts/audio-script.json; the text given to the voice is its "speech"
field. Files are named after the text's hash (<chapter>.<hash>.mp3), so a
chapter recorded again reaches visitors whose phones cached the old one.
Re-running is cheap: only chapters that are missing or whose text changed are
recorded again. Every file is trimmed, levelled to about -18 LUFS and checked
for length against its text (too short or too long is recorded again).

Options:  --lang tr  --voice Sulafat  --model gemini-2.5-flash-preview-tts
          --only site:efes  --app-only  --jobs 4  --limit 20  --force
          --remote-dir ../antik-audio  --base-url https://<user>.github.io/antik-audio
"""

from __future__ import annotations

import argparse
import array
import base64
import concurrent.futures
import json
import math
import os
import pathlib
import random
import sys
import threading
import time
import urllib.error
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "scripts" / "audio-script.json"
MANIFEST = ROOT / "src" / "lib" / "audio-manifest.json"
CREDITS = ROOT / "src" / "lib" / "voice-credits.json"
KEY_FILE = ROOT / "scripts" / ".gemini-key"
SAMPLES = ROOT / "scripts" / "ses-ornekleri"
BASE_URL = "https://lotusdugun-ctrl.github.io/antik-audio"
SPEECH_VERSION = 4
RATE = 24000
MODELS = ["gemini-2.5-flash-preview-tts", "gemini-2.5-flash-tts", "gemini-2.5-pro-preview-tts"]
SAMPLE_VOICES = ["Sulafat", "Achird", "Gacrux", "Charon", "Kore", "Algieba"]

# How each kind of chapter should sound. The voice is told this before the text.
STYLE = {
    "tr": {
        "base": (
            "Sen deneyimli, sevilen bir arkeoloji rehberisin ve bir grubu gezdiriyorsun. "
            "Sıcak, samimi ve canlı bir sesle, acele etmeden, doğal Türkçe vurgularla anlat. "
            "Soru cümlelerinden sonra kısa bir an bekle, üç noktada nefes al, sayıları net söyle. "
            "Coşkulu ama abartısız ol; asla robot gibi tekdüze okuma."
        ),
        "intro": "Grubu karşılıyorsun: güler yüzlü, davetkâr, merak uyandırarak başla.",
        "history": "Bir hikâye anlatıyorsun: biraz daha yavaş, olayların döndüğü yerde hafif bir gerilimle.",
        "structure": "Gösterdiğin şeyin önünde duruyorsun: şimdiki zamanda, işaret eder gibi, heyecanla.",
        "spot": "Gösterdiğin ayrıntının önünde duruyorsun: şimdiki zamanda, işaret eder gibi, merakla.",
        "highlights": "Kaçırılmaması gerekenleri sayıyorsun: canlı, tempolu, keyifli.",
        "facts": "İlginç bir bilgi paylaşıyorsun: oyunbaz bir merakla, gülümseyerek.",
        "uncertainty": "Bilinmeyenleri dürüstçe itiraf ediyorsun: sakin, içten, daha alçak bir enerjiyle.",
        "outro": "Gezi bitiyor: sıcak, yavaş, biraz hüzünlü ve teşekkür eder gibi.",
    },
    "en": {
        "base": (
            "You are an experienced, much-loved archaeology guide leading a small group. "
            "Speak warmly and vividly, unhurried, with natural emphasis. Pause briefly after "
            "questions, breathe at ellipses, say numbers clearly. Enthusiastic but never over the "
            "top; never a flat, newsreader read."
        ),
        "intro": "You are welcoming the group: friendly, inviting, a smile in your voice.",
        "history": "You are telling a story: a little slower, with a touch of suspense at the turns.",
        "structure": "You are standing in front of what you describe: present tense, pointing it out, excited.",
        "spot": "You are pointing at a detail: present tense, curious, drawing the listener in.",
        "highlights": "You are listing what not to miss: lively, upbeat, enjoying it.",
        "facts": "You are sharing a surprising fact: playful curiosity, smiling.",
        "uncertainty": "You are honestly admitting what is not known: calm, candid, lower energy.",
        "outro": "The tour is ending: warm, slow, a little wistful, thankful.",
    },
}


def text_hash(text: str) -> str:
    """FNV-1a over UTF-16 code units, identical to textHash() in audio-manifest.ts."""
    h = 0x811C9DC5
    units = text.encode("utf-16-le")
    for i in range(0, len(units), 2):
        h ^= units[i] | (units[i + 1] << 8)
        h = (h * 0x01000193) & 0xFFFFFFFF
    return f"{h:08x}"


def api_key() -> str:
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not key and KEY_FILE.exists():
        key = KEY_FILE.read_text(encoding="utf-8").strip()
    if not key:
        sys.exit("GEMINI_API_KEY bulunamadi (ortam degiskeni ya da scripts/.gemini-key).")
    return key


def style_for(lang: str, chapter: str) -> str:
    table = STYLE.get(lang, STYLE["en"])
    kind = chapter.split("-")[0]
    return table["base"] + " " + table.get(kind, "")


class Quota(Exception):
    pass


class DailyQuota(Exception):
    """The free tier's requests for today are used up: stop, and go on tomorrow."""


def synthesize(key: str, model: str, voice: str, prompt: str) -> bytes:
    """One request; returns 16-bit mono PCM at 24 kHz."""
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}},
        },
    }
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    request = urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json", "x-goog-api-key": key},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=300) as response:
            data = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", "replace")[:300]
        if error.code == 429 and ("PerDay" in detail or "per day" in detail.lower()):
            raise DailyQuota(detail) from error
        if error.code in (429, 500, 502, 503, 504):
            raise Quota(f"{error.code} {detail}") from error
        raise RuntimeError(f"HTTP {error.code}: {detail}") from error
    for candidate in data.get("candidates", []):
        for part in candidate.get("content", {}).get("parts", []):
            inline = part.get("inlineData") or part.get("inline_data")
            if inline and inline.get("data"):
                return base64.b64decode(inline["data"])
    raise RuntimeError(f"no audio in the answer: {json.dumps(data)[:300]}")


def level(pcm: bytes) -> array.array:
    """Trim the silence at both ends and level the speech to about -18 LUFS."""
    samples = array.array("h")
    samples.frombytes(pcm[: len(pcm) // 2 * 2])
    if sys.byteorder == "big":
        samples.byteswap()
    gate = 300
    start = next((i for i, s in enumerate(samples) if abs(s) > gate), 0)
    end = len(samples) - next((i for i, s in enumerate(reversed(samples)) if abs(s) > gate), 0)
    pad = int(RATE * 0.15)
    samples = samples[max(0, start - pad) : min(len(samples), end + pad)]
    if not samples:
        return samples
    # RMS over the voiced blocks only, so pauses do not pull the level down.
    block = RATE // 20
    powers = []
    for i in range(0, len(samples), block):
        chunk = samples[i : i + block]
        p = sum(s * s for s in chunk) / max(1, len(chunk))
        if p > gate * gate:
            powers.append(p)
    rms = math.sqrt(sum(powers) / len(powers)) if powers else 1.0
    gain = (32768 * 10 ** (-19 / 20)) / max(rms, 1.0)
    peak = max(abs(s) for s in samples) or 1
    gain = min(gain, (32768 * 10 ** (-1.5 / 20)) / peak)
    return array.array("h", (max(-32768, min(32767, int(s * gain))) for s in samples))


def mp3(samples: array.array) -> bytes:
    import lameenc

    encoder = lameenc.Encoder()
    encoder.set_bit_rate(64)
    encoder.set_in_sample_rate(RATE)
    encoder.set_channels(1)
    encoder.set_quality(2)
    data = samples.tobytes() if sys.byteorder == "little" else _swapped(samples)
    return bytes(encoder.encode(data) + encoder.flush())


def _swapped(samples: array.array) -> bytes:
    copy = array.array("h", samples)
    copy.byteswap()
    return copy.tobytes()


def record(key: str, model: str, voice: str, lang: str, chapter: str, speech: str) -> bytes:
    """Record one chapter, retrying on quota errors and on a suspicious length."""
    prompt = style_for(lang, chapter) + "\n\n" + speech
    last = ""
    for attempt in range(6):
        try:
            samples = level(synthesize(key, model, voice, prompt))
        except Quota as error:
            last = str(error)
            time.sleep(min(90, 4 * 2**attempt) + random.random() * 3)
            continue
        seconds = len(samples) / RATE
        per_char = seconds / max(1, len(speech))
        if 0.035 <= per_char <= 0.13:
            return mp3(samples)
        last = f"length {seconds:.1f}s for {len(speech)} chars"
    raise RuntimeError(last or "failed")


def save(manifest: dict) -> None:
    MANIFEST.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=1, sort_keys=True) + "\n", encoding="utf-8"
    )


def write_credit(lang: str, model: str, voice: str) -> None:
    credits = json.loads(CREDITS.read_text(encoding="utf-8")) if CREDITS.exists() else {}
    credits[lang] = {
        "engine": "gemini",
        "voice": f"{model}/{voice}",
        "dataset": "Google Gemini",
        "license": "Gemini API Terms of Service",
        "licenseUrl": "https://ai.google.dev/gemini-api/terms",
        "card": "https://ai.google.dev/gemini-api/docs/speech-generation",
    }
    CREDITS.write_text(json.dumps(credits, ensure_ascii=False, indent=1, sort_keys=True) + "\n",
                       encoding="utf-8")


def pick_model(key: str, wanted: str | None) -> str:
    """The first speech model this key can use: a short test sentence."""
    for model in [wanted] if wanted else MODELS:
        try:
            synthesize(key, model, "Kore", "Say: test.")
            return model
        except DailyQuota:
            print("Gunluk ucretsiz kota dolu; yarin yeniden calistirin.", flush=True)
            sys.exit(3)
        except Quota:
            return model
        except RuntimeError as error:
            print(f"  {model}: {error}", flush=True)
    sys.exit("Hicbir Gemini ses modeli calismadi (yukaridaki hatalara bakin).")


def samples(key: str, model: str) -> None:
    script = json.loads(SCRIPT.read_text(encoding="utf-8"))
    SAMPLES.mkdir(parents=True, exist_ok=True)
    picks = {}
    for item in script["items"]:
        if item["key"] == "site:efes" and item["chapter"] in ("intro", "history"):
            picks.setdefault(item["lang"], []).append(item)
    for lang in ("tr", "en"):
        text = " ".join((i.get("speech") or i["text"]) for i in picks.get(lang, [])[:1])
        for voice in SAMPLE_VOICES:
            out = SAMPLES / f"gemini-{lang}-{voice}.mp3"
            try:
                out.write_bytes(record(key, model, voice, lang, "intro", text))
                print(f"  {out.name} ok", flush=True)
            except Exception as error:
                print(f"  {out.name} HATA {error}", flush=True)
    print(f"\nOrnekler: {SAMPLES}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--lang", choices=["tr", "en", "de", "ru"], default="tr")
    parser.add_argument("--voice", default="Sulafat")
    parser.add_argument("--model")
    parser.add_argument("--samples", action="store_true")
    parser.add_argument("--only")
    parser.add_argument("--app-only", action="store_true")
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--jobs", type=int, default=2)
    parser.add_argument("--remote-dir", default=str(ROOT.parent / "antik-audio"))
    parser.add_argument("--base-url", default=BASE_URL)
    args = parser.parse_args()
    try:
        import lameenc  # noqa: F401
    except ImportError:
        sys.exit("lameenc yuklu degil: python -m pip install lameenc")

    key = api_key()
    model = pick_model(key, args.model)
    print(f"Model: {model}", flush=True)
    if args.samples:
        samples(key, model)
        return

    lang = args.lang
    script = json.loads(SCRIPT.read_text(encoding="utf-8"))
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8")) if MANIFEST.exists() else {}
    remote_root = pathlib.Path(args.remote_dir)
    base_url = args.base_url.rstrip("/")
    voice_id = f"{model}/{args.voice}"

    todo = []
    skipped = 0
    for item in script["items"]:
        if item["lang"] != lang or (args.only and item["key"] != args.only):
            continue
        if args.app_only and item.get("target", "app") != "app":
            continue
        if text_hash(item["text"]) != item["hash"]:
            sys.exit("Hash mismatch between the exporter and this script; refusing to continue.")
        remote = item.get("target", "app") == "remote"
        relative = f"audio/{item['folder']}/{lang}/{item['chapter']}.{item['hash']}.mp3"
        target = (remote_root if remote else ROOT / "public") / relative
        url = f"{base_url}/{relative}" if remote else f"/{relative}"
        entry = manifest.get(item["key"], {}).get(lang, {}).get(item["chapter"])
        if (not args.force and target.exists() and target.stat().st_size > 0 and entry
                and entry.get("engine") == "gemini" and entry.get("voice") == voice_id
                and entry["hash"] == item["hash"] and entry["url"] == url):
            skipped += 1
            continue
        todo.append((item, target, url))
    # The guides the app carries itself (the most visited sites, the 3D
    # models) first: on a free key, with a daily quota, they are done first.
    todo.sort(key=lambda job: (job[0].get("target", "app") != "app", job[0]["key"]))
    if args.limit:
        todo = todo[: args.limit]
    print(f"{lang}: {voice_id} - {len(todo)} bolum kaydedilecek, {skipped} hazir.", flush=True)

    lock = threading.Lock()
    done = failed = 0
    stop = threading.Event()

    def work(job):
        item, target, url = job
        if stop.is_set():
            raise DailyQuota("stopped")
        data = record(key, model, args.voice, lang, item["chapter"], item.get("speech") or item["text"])
        target.parent.mkdir(parents=True, exist_ok=True)
        part = target.with_suffix(".part")
        part.write_bytes(data)
        part.replace(target)
        # The chapter's older recordings (Piper's, or an earlier text's) go.
        for old in target.parent.glob(f"{item['chapter']}.*mp3"):
            if old != target and old.name.split(".")[0] == item["chapter"]:
                old.unlink(missing_ok=True)
        return item, url

    with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, args.jobs)) as pool:
        futures = {pool.submit(work, job): job for job in todo}
        for n, future in enumerate(concurrent.futures.as_completed(futures), 1):
            item = futures[future][0]
            label = f"[{lang} {n}/{len(todo)}] {item['key']} {item['chapter']}"
            try:
                item, url = future.result()
            except DailyQuota:
                if not stop.is_set():
                    print("\nGunluk ucretsiz kota doldu. Kaydedilenler saklandi; yarin yeniden "
                          "calistirin, kaldigi yerden devam eder.", flush=True)
                stop.set()
                continue
            except Exception as error:
                failed += 1
                print(f"{label}  HATA {error}", flush=True)
                continue
            with lock:
                manifest.setdefault(item["key"], {}).setdefault(lang, {})[item["chapter"]] = {
                    "url": url, "hash": item["hash"], "v": SPEECH_VERSION,
                    "engine": "gemini", "voice": voice_id,
                }
                done += 1
                if done % 25 == 0:
                    save(manifest)
            print(f"{label}  ok", flush=True)

    save(manifest)
    finished = not stop.is_set() and not failed and not args.limit and not args.only
    if finished:
        # Everything is recorded: the language now plays Gemini's voice, and
        # entries by another engine or voice go.
        for guide in manifest.values():
            chapters = guide.get(lang, {})
            for chapter in list(chapters):
                if chapters[chapter].get("voice") != voice_id:
                    del chapters[chapter]
        save(manifest)
        write_credit(lang, model, args.voice)
    elif lang not in json.loads(CREDITS.read_text(encoding="utf-8")) if CREDITS.exists() else True:
        # A language with no recordings before (Turkish) plays what is done so far.
        write_credit(lang, model, args.voice)
    print(f"\nKaydedilen {done}, degismeyen {skipped}, hatali {failed}.")
    if stop.is_set():
        sys.exit(3)
    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
