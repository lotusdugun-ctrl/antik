"""
Record the audio guide with Microsoft's neural voices (the ones Edge's
"Read aloud" uses), and point the app at the files.

    pip install edge-tts
    python scripts/generate_audio_edge.py

Reads scripts/audio-script.json (written by export-audio-script.ts), writes
public/audio/<guide>/<lang>/<chapter>.mp3 and src/lib/audio-manifest.json.
Only chapters that are missing, or whose text changed since they were
recorded, are synthesised again, so re-running is cheap.

Options:  --voice-tr tr-TR-AhmetNeural   --voice-en en-GB-RyanNeural
          --rate -6%   --force   --only site:efes
"""
import argparse
import asyncio
import json
import pathlib
import sys

try:
    import edge_tts
except ImportError:
    sys.exit("edge-tts is not installed. Run:  pip install edge-tts")

ROOT = pathlib.Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "scripts" / "audio-script.json"
MANIFEST = ROOT / "src" / "lib" / "audio-manifest.json"
AUDIO = ROOT / "public" / "audio"


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
        json.dumps(manifest, ensure_ascii=False, indent=1, sort_keys=True) + "\n",
        encoding="utf-8",
    )


async def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--voice-tr", default="tr-TR-EmelNeural")
    parser.add_argument("--voice-en", default="en-GB-SoniaNeural")
    parser.add_argument("--rate", default="-6%", help="a little slower reads more like a guide")
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--only", help="a single guide key, e.g. site:efes")
    args = parser.parse_args()

    script = json.loads(SCRIPT.read_text(encoding="utf-8"))
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8")) if MANIFEST.exists() else {}
    voices = {"tr": args.voice_tr, "en": args.voice_en}

    items = [i for i in script["items"] if not args.only or i["key"] == args.only]
    done = skipped = failed = 0
    for n, item in enumerate(items, 1):
        if text_hash(item["text"]) != item["hash"]:
            sys.exit("Hash mismatch between the exporter and this script; refusing to continue.")
        target = AUDIO / item["folder"] / item["lang"] / f"{item['chapter']}.mp3"
        entry = manifest.get(item["key"], {}).get(item["lang"], {}).get(item["chapter"])
        if not args.force and target.exists() and entry and entry["hash"] == item["hash"]:
            skipped += 1
            continue
        target.parent.mkdir(parents=True, exist_ok=True)
        label = f"[{n}/{len(items)}] {item['key']} {item['lang']} {item['chapter']}"
        ok = False
        for attempt in range(3):
            try:
                communicate = edge_tts.Communicate(item["text"], voices[item["lang"]], rate=args.rate)
                await communicate.save(str(target))
                ok = True
                break
            except Exception as error:  # network hiccups: try again, then move on
                if attempt == 2:
                    print(f"{label}  FAILED: {error}")
                await asyncio.sleep(2 * (attempt + 1))
        if not ok:
            failed += 1
            continue
        manifest.setdefault(item["key"], {}).setdefault(item["lang"], {})[item["chapter"]] = {
            "url": f"/audio/{item['folder']}/{item['lang']}/{item['chapter']}.mp3",
            "hash": item["hash"],
        }
        done += 1
        print(f"{label}  ok")
        save(manifest)  # as we go, so an interrupted run keeps what it made

    save(manifest)
    print(f"\nRecorded {done}, unchanged {skipped}, failed {failed}.")


asyncio.run(main())
