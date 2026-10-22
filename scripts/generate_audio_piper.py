"""
Record the audio guide with open-source Piper voices, on this computer, and
point the app at the files. Run it from SESLENDIR.bat.

    pip install "piper-tts>=1.3,<2" lameenc
    python scripts/generate_audio_piper.py

1. For each language (tr, en, de, ru) the licence gate in piper_voices.py
   picks a voice whose model card states a licence that allows commercial
   redistribution, and prints why every candidate was accepted or refused.
   A language with no acceptable voice gets no recordings at all: the app
   then reads it with the device's own voice.
2. Every recording not made by Piper with today's voice for its language is
   deleted — from public/audio, from the audio repository (../antik-audio)
   and from the manifest. That is how the old Microsoft Edge recordings go.
3. Missing chapters are recorded (chapters marked "app" into public/audio,
   "remote" into ../antik-audio/audio, as before) and listed in
   src/lib/audio-manifest.json with engine "piper" and the voice id; the app
   plays nothing else. The voices and their licences go to
   src/lib/voice-credits.json, which the credits page shows.

Reads scripts/audio-script.json (written by export-audio-script.ts); the text
given to the voice is its "speech" field: plain text with abbreviations,
units and year ranges written out — no markup. Re-running is cheap: only
chapters that are missing or whose text changed are recorded again.

Options:  --lang de   --only site:efes   --force   --jobs 4   --app-only
          --voice-de thorsten   (prefer this voice, if it passes the gate)
          --remote-dir ../antik-audio   --base-url https://<user>.github.io/antik-audio
          --length-scale 1.08 (a little slower reads more like a guide)
"""

from __future__ import annotations

import argparse
import json
import multiprocessing
import os
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import piper_voices  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "scripts" / "audio-script.json"
MANIFEST = ROOT / "src" / "lib" / "audio-manifest.json"
AUDIO = ROOT / "public" / "audio"
BASE_URL = "https://lotusdugun-ctrl.github.io/antik-audio"
LANGS = ["tr", "en", "de", "ru"]
SPEECH_VERSION = 3


def text_hash(text: str) -> str:
    """FNV-1a over UTF-16 code units, identical to textHash() in audio-manifest.ts."""
    h = 0x811C9DC5
    units = text.encode("utf-16-le")
    for i in range(0, len(units), 2):
        h ^= units[i] | (units[i + 1] << 8)
        h = (h * 0x01000193) & 0xFFFFFFFF
    return f"{h:08x}"


def save(manifest: dict) -> None:
    MANIFEST.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=1, sort_keys=True) + "\n", encoding="utf-8"
    )


# --- one worker process per CPU core, each with the voice loaded once ---------
_speaker = None


def _init(model: str, config: str) -> None:
    global _speaker
    _speaker = piper_voices.Speaker(pathlib.Path(model), pathlib.Path(config))


def _record(job: tuple[str, str, float]) -> tuple[str, bool, str]:
    target, speech, scale = job
    try:
        data = _speaker.mp3(speech, length_scale=scale)
        if not data:
            return target, False, "empty"
        path = pathlib.Path(target)
        path.parent.mkdir(parents=True, exist_ok=True)
        part = path.with_suffix(".part")
        part.write_bytes(data)
        part.replace(path)
        return target, True, ""
    except Exception as error:  # one bad chapter must not stop the run
        return target, False, f"{type(error).__name__}: {error}"


def main() -> None:
    parser = argparse.ArgumentParser()
    for lang in LANGS:
        parser.add_argument(f"--voice-{lang}", help="preferred Piper voice name (must pass the gate)")
    parser.add_argument("--remote-dir", default=str(ROOT.parent / "antik-audio"))
    parser.add_argument("--base-url", default=BASE_URL)
    parser.add_argument("--lang", choices=LANGS, help="only this language")
    parser.add_argument("--only", help="a single guide key, e.g. site:efes")
    parser.add_argument("--app-only", action="store_true")
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--length-scale", type=float, default=1.08)
    parser.add_argument("--jobs", type=int, default=max(1, (os.cpu_count() or 2) - 1))
    args = parser.parse_args()

    # Without Piper every pool worker fails in its initializer and the pool
    # spawns replacements for ever; stop here with a clear message instead.
    try:
        import piper  # noqa: F401
        import lameenc  # noqa: F401
    except ImportError as error:
        sys.exit(
            f"Piper yuklu degil ({error}). Python 3.10-3.13 ile calistirin: "
            "py -3.12 -m pip install \"piper-tts>=1.3,<2\" lameenc"
        )

    langs = [args.lang] if args.lang else LANGS
    forced = {lang: getattr(args, f"voice_{lang}") for lang in langs if getattr(args, f"voice_{lang}")}
    chosen = piper_voices.choose(langs, forced)
    piper_voices.write_credits(chosen, langs)

    script = json.loads(SCRIPT.read_text(encoding="utf-8"))
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8")) if MANIFEST.exists() else {}
    remote_root = pathlib.Path(args.remote_dir)
    base_url = args.base_url.rstrip("/")

    # 2. Drop every entry that is not Piper with today's voice for its language.
    dropped = 0
    for key in list(manifest):
        for lang in list(manifest[key]):
            for chapter in list(manifest[key][lang]):
                entry = manifest[key][lang][chapter]
                voice = chosen.get(lang, {}).get("id")
                if lang not in langs:
                    if entry.get("engine") == "piper":
                        continue
                if entry.get("engine") != "piper" or entry.get("voice") != voice:
                    del manifest[key][lang][chapter]
                    dropped += 1
            if not manifest[key][lang]:
                del manifest[key][lang]
        if not manifest[key]:
            del manifest[key]

    # ... and every file on disk that the manifest no longer lists.
    kept_local = set()
    kept_remote = set()
    for key, by_lang in manifest.items():
        for lang, chapters in by_lang.items():
            for entry in chapters.values():
                url = entry["url"]
                if url.startswith(base_url + "/"):
                    kept_remote.add((remote_root / url[len(base_url) + 1:]).resolve())
                else:
                    kept_local.add((ROOT / "public" / url.lstrip("/")).resolve())
    deleted = 0
    for folder, kept in ((AUDIO, kept_local), (remote_root / "audio", kept_remote)):
        if not folder.exists():
            continue
        for mp3 in folder.rglob("*.mp3"):
            if mp3.resolve() not in kept:
                mp3.unlink()
                deleted += 1
        for d in sorted((p for p in folder.rglob("*") if p.is_dir()), key=lambda p: -len(p.parts)):
            if not any(d.iterdir()):
                d.rmdir()
    save(manifest)
    print(f"Eski/uygunsuz kayitlar: {dropped} liste kaydi ve {deleted} dosya silindi.", flush=True)

    # 3. Record what is missing, one language (one voice) at a time.
    total = {"done": 0, "skipped": 0, "failed": 0}
    for lang in langs:
        if lang not in chosen:
            continue
        voice = chosen[lang]
        items = [
            i for i in script["items"]
            if i["lang"] == lang
            and (not args.only or i["key"] == args.only)
            and (not args.app_only or i.get("target", "app") == "app")
        ]
        jobs, meta = [], {}
        for item in items:
            if text_hash(item["text"]) != item["hash"]:
                sys.exit("Hash mismatch between the exporter and this script; refusing to continue.")
            remote = item.get("target", "app") == "remote"
            relative = f"audio/{item['folder']}/{lang}/{item['chapter']}.mp3"
            target = (remote_root if remote else ROOT / "public") / relative
            url = f"{base_url}/{relative}" if remote else f"/{relative}"
            entry = manifest.get(item["key"], {}).get(lang, {}).get(item["chapter"])
            if (not args.force and target.exists() and target.stat().st_size > 0 and entry
                    and entry["hash"] == item["hash"] and entry["url"] == url
                    and entry.get("v") == SPEECH_VERSION):
                total["skipped"] += 1
                continue
            jobs.append((str(target), item.get("speech") or item["text"], args.length_scale))
            meta[str(target)] = (item, url)
        print(f"{lang}: {voice['id']} ({voice['license']}) - {len(jobs)} bolum kaydedilecek.", flush=True)
        if not jobs:
            continue
        model, config = piper_voices.download(voice)
        with multiprocessing.Pool(args.jobs, initializer=_init, initargs=(str(model), str(config))) as pool:
            for n, (target, ok, error) in enumerate(pool.imap_unordered(_record, jobs), 1):
                item, url = meta[target]
                label = f"[{lang} {n}/{len(jobs)}] {item['key']} {item['chapter']}"
                if not ok:
                    total["failed"] += 1
                    print(f"{label}  HATA {error}", flush=True)
                    continue
                manifest.setdefault(item["key"], {}).setdefault(lang, {})[item["chapter"]] = {
                    "url": url, "hash": item["hash"], "v": SPEECH_VERSION,
                    "engine": "piper", "voice": voice["id"],
                }
                total["done"] += 1
                if total["done"] % 50 == 0:
                    save(manifest)
                print(f"{label}  ok", flush=True)
        save(manifest)

    print(f"\nKaydedilen {total['done']}, degismeyen {total['skipped']}, hatali {total['failed']}.")
    if total["failed"]:
        sys.exit(1)


if __name__ == "__main__":
    multiprocessing.freeze_support()
    main()
