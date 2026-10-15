"""
Record the audio guide with Google Cloud Text-to-Speech "Chirp 3: HD" voices
and point the app at the files. Python 3 standard library only: nothing to
pip install.

    python scripts/generate_audio_chirp.py --dry-run     # what would it cost?
    python scripts/generate_audio_chirp.py --sample      # listen to voices
    python scripts/generate_audio_chirp.py               # record

Reads scripts/audio-script.json (written by export-audio-script.ts). Chapters
marked "app" go to public/audio/ inside this project; chapters marked "remote"
go to a sibling checkout of the audio repository (../antik-audio/audio/),
which GitHub Pages serves. Both are listed in src/lib/audio-manifest.json with
{url, hash, v, voice: "chirp3"}. Only chapters that are missing, whose text
changed, or that were not yet recorded with Chirp are synthesised, so
re-running is cheap and an interrupted run continues where it stopped.

API key: --key, or the GOOGLE_TTS_API_KEY environment variable, or the file
scripts/.tts-key (keep it out of git).

Free tier guard: every character sent is counted per calendar month in
scripts/.tts-usage.json, and the run stops before the month's total would pass
--budget (default 950,000 of the 1,000,000 free characters). Turkish is
recorded first, then English, German, Russian.

Pronunciations: scripts/pronunciations.json, {"tr": [{"phrase", "ipa"}], ...}.
Only the phrases that occur in a request's text are sent with it.

Options:  --voice Algieba (same Chirp voice for every language)
          --voice-tr tr-TR-Chirp3-HD-Sulafat  --voice-en en-GB-Chirp3-HD-Sulafat
          --voice-de de-DE-Chirp3-HD-Sulafat  --voice-ru ru-RU-Chirp3-HD-Sulafat
          --rate 0.95   --force   --only site:efes   --lang tr
          --remote-dir ../antik-audio   --base-url https://<user>.github.io/antik-audio
          --app-only   --jobs 4   --budget 950000   --dry-run   --sample
"""
import argparse
import base64
import datetime
import json
import os
import pathlib
import random
import re
import sys
import threading
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor

ROOT = pathlib.Path(__file__).resolve().parent.parent
SCRIPTS = ROOT / "scripts"
SCRIPT = SCRIPTS / "audio-script.json"
MANIFEST = ROOT / "src" / "lib" / "audio-manifest.json"
AUDIO = ROOT / "public" / "audio"
LEXICON = SCRIPTS / "pronunciations.json"
KEY_FILE = SCRIPTS / ".tts-key"
USAGE_FILE = SCRIPTS / ".tts-usage.json"
SAMPLES = SCRIPTS / "voice-samples"
BASE_URL = "https://lotusdugun-ctrl.github.io/antik-audio"
ENDPOINT = "https://texttospeech.googleapis.com/v1/text:synthesize"
# Same meaning as in generate_audio_edge.py: bumped when the spoken form
# changes without the page text changing.
SPEECH_VERSION = 2
VOICE_TAG = "chirp3"
LANG_ORDER = ["tr", "en", "de", "ru"]
LOCALES = {"tr": "tr-TR", "en": "en-GB", "de": "de-DE", "ru": "ru-RU"}
DEFAULT_VOICE = "Sulafat"  # warm, calm female storyteller
# One request may carry ~5000 bytes; stay well below, leaving room for the
# pronunciations that travel with it.
MAX_REQUEST_BYTES = 4000

SAMPLE_TEXT = (
    "Afrodisias sesli rehberine hoş geldiniz. [pause short] "
    "Aşk tanrıçası Afrodit'e adanan bu kent, milattan önce birinci yüzyılda "
    "beyaz mermeriyle ve heykeltıraşlarıyla bütün Roma dünyasında ünlendi. "
    "[pause] Şimdi gözlerinizi Tetrapylon'a çevirin: dört sıra sütunuyla, "
    "yüzyıllardır burada, sizi bekliyor."
)
SAMPLE_VOICES = [
    "Sulafat", "Aoede", "Achernar", "Vindemiatrix",  # female
    "Charon", "Algieba", "Orus", "Enceladus",  # male
]
SAMPLE_LINES = {
    "en": "Welcome to Ephesus, one of the best preserved Roman cities of the ancient world.",
    "de": "Willkommen in Ephesos, einer der am besten erhaltenen römischen Städte der Antike.",
    "ru": "Добро пожаловать в Эфес, один из лучше всего сохранившихся римских городов.",
}

print_lock = threading.Lock()


def say(*parts) -> None:
    with print_lock:
        print(*parts, flush=True)


def text_hash(text: str) -> str:
    """FNV-1a over UTF-16 code units, identical to textHash() in audio-manifest.ts."""
    h = 0x811C9DC5
    units = text.encode("utf-16-le")
    for i in range(0, len(units), 2):
        h ^= units[i] | (units[i + 1] << 8)
        h = (h * 0x01000193) & 0xFFFFFFFF
    return f"{h:08x}"


def write_json(path: pathlib.Path, data, indent=1, sort_keys=True) -> None:
    """Atomically, so a crash mid-write never leaves half a file."""
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_text(
        json.dumps(data, ensure_ascii=False, indent=indent, sort_keys=sort_keys) + "\n",
        encoding="utf-8",
    )
    os.replace(tmp, path)


# --------------------------------------------------------------------------
# Text -> markup -> requests
# --------------------------------------------------------------------------

# Not after "1." (a Turkish ordinal) or a lone initial.
SENTENCE_END = re.compile(r"(?<=[^\d\s.][^\d\s][.!?…])\s+")


def to_markup(speech: str, chapter: str) -> str:
    """The chapter's spoken text with a few pauses: between paragraphs, and
    after the opening sentence of an intro. Nothing else is changed."""
    speech = speech.replace("[", "(").replace("]", ")")  # brackets are markup
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", speech) if p.strip()]
    paragraphs = [re.sub(r"\s+", " ", p) for p in paragraphs]
    if chapter == "intro" and paragraphs:
        first = SENTENCE_END.split(paragraphs[0], maxsplit=1)
        if len(first) == 2 and first[1]:
            paragraphs[0] = f"{first[0]} [pause short] {first[1]}"
    return " [pause] ".join(paragraphs)


def split_markup(markup: str, limit: int = MAX_REQUEST_BYTES) -> list:
    """Pieces under `limit` UTF-8 bytes, cut at sentence ends (or, for a
    monstrous sentence, at commas and then spaces)."""
    if len(markup.encode("utf-8")) <= limit:
        return [markup]
    pieces, current = [], ""

    def units(text, pattern):
        return [u for u in re.split(pattern, text) if u]

    def add(unit):
        nonlocal current
        candidate = f"{current} {unit}".strip()
        if len(candidate.encode("utf-8")) <= limit:
            current = candidate
            return
        if current:
            pieces.append(current)
            current = ""
        if len(unit.encode("utf-8")) <= limit:
            current = unit
        elif re.search(r",\s", unit):
            for sub in units(unit, r"(?<=,)\s+"):
                add(sub)
        else:
            for word in unit.split(" "):
                add(word)

    for sentence in units(markup, SENTENCE_END):
        add(sentence)
    if current:
        pieces.append(current)
    # A piece never starts with a dangling pause tag of the previous one.
    return [p.strip() for p in pieces if p.strip()]


def load_lexicon(path: pathlib.Path) -> dict:
    if not path.exists():
        return {}
    data = json.loads(path.read_text(encoding="utf-8"))
    lexicon = {}
    for lang, entries in data.items():
        if lang.startswith("_") or not isinstance(entries, list):
            continue
        cleaned = [e for e in entries if e.get("phrase") and e.get("ipa")]
        # Longest first, so "Göbekli Tepe" wins over "Göbekli".
        lexicon[lang] = sorted(cleaned, key=lambda e: -len(e["phrase"]))
    return lexicon


def phrases_in(text: str, entries: list) -> list:
    """The lexicon entries whose phrase occurs in the text as a whole word
    (a Turkish suffix after an apostrophe is fine: Afrodisias'ın)."""
    found, rest = [], text
    for e in entries:
        pattern = re.compile(r"(?<!\w)" + re.escape(e["phrase"]) + r"(?!\w)")
        if pattern.search(rest):
            found.append(e)
            rest = pattern.sub(" ", rest)
    return found


def build_request(markup: str, lang: str, voice: str, rate: float, entries: list) -> dict:
    body = {
        "input": {"markup": markup},
        "voice": {"languageCode": LOCALES[lang], "name": voice},
        "audioConfig": {"audioEncoding": "MP3", "speakingRate": rate},
    }
    if entries:
        body["input"]["customPronunciations"] = {
            "pronunciations": [
                {"phrase": e["phrase"], "phoneticEncoding": "PHONETIC_ENCODING_IPA", "pronunciation": e["ipa"]}
                for e in entries
            ]
        }
    return body


def billed_chars(body: dict) -> int:
    """Characters counted against the quota: the markup (pause tags included)
    and, to be safe, the pronunciation phrases sent with it."""
    n = len(body["input"]["markup"])
    for p in body["input"].get("customPronunciations", {}).get("pronunciations", []):
        n += len(p["phrase"]) + len(p["pronunciation"])
    return n


def full_voice(name: str, lang: str) -> str:
    return name if "-" in name else f"{LOCALES[lang]}-Chirp3-HD-{name}"


# --------------------------------------------------------------------------
# Usage ledger (free tier guard)
# --------------------------------------------------------------------------

def billing_month() -> str:
    # Google's billing month follows Pacific time; UTC-8 is the safe side.
    now = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=8)
    return now.strftime("%Y-%m")


class Budget:
    def __init__(self, path: pathlib.Path, limit: int):
        self.path, self.limit = path, limit
        self.lock = threading.Lock()
        self.month = billing_month()
        self.data = json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}
        self.used = int(self.data.get(self.month, 0))
        self.reserved = 0

    def remaining(self) -> int:
        return self.limit - self.used - self.reserved

    def reserve(self, n: int) -> bool:
        with self.lock:
            if self.used + self.reserved + n > self.limit:
                return False
            self.reserved += n
            return True

    def settle(self, n: int, sent: bool) -> None:
        with self.lock:
            self.reserved -= n
            if sent:
                self.used += n
                self.data[self.month] = self.used
                write_json(self.path, self.data)


# --------------------------------------------------------------------------
# The API
# --------------------------------------------------------------------------

class Fatal(Exception):
    """Retrying will not help (bad key, API not enabled, billing off)."""


class PronunciationRejected(Exception):
    pass


def synthesize(endpoint: str, key: str, body: dict) -> bytes:
    data = json.dumps(body, ensure_ascii=False).encode("utf-8")
    delay = 2.0
    for attempt in range(7):
        request = urllib.request.Request(
            endpoint,
            data=data,
            method="POST",
            headers={"Content-Type": "application/json; charset=utf-8", "X-Goog-Api-Key": key},
        )
        try:
            with urllib.request.urlopen(request, timeout=120) as response:
                payload = json.loads(response.read().decode("utf-8"))
            audio = base64.b64decode(payload.get("audioContent", ""))
            if not audio:
                raise ValueError("empty audioContent")
            return audio
        except urllib.error.HTTPError as error:
            detail = error.read().decode("utf-8", "replace")[:600]
            if error.code in (429, 500, 502, 503, 504):
                problem = f"HTTP {error.code}"
            elif error.code == 400 and "ronunciation" in detail:
                raise PronunciationRejected(detail)
            elif error.code in (401, 403):
                raise Fatal(
                    f"HTTP {error.code}: anahtar gecersiz, API etkin degil ya da faturalandirma kapali.\n{detail}"
                )
            else:
                raise Fatal(f"HTTP {error.code}: {detail}")
        except (urllib.error.URLError, TimeoutError, ConnectionError, ValueError, OSError) as error:
            problem = f"{type(error).__name__}: {error}"
        if attempt == 6:
            raise RuntimeError(problem)
        wait = delay + random.uniform(0, delay / 2)
        say(f"    ({problem}; {wait:.0f} sn sonra yeniden deneniyor)")
        time.sleep(wait)
        delay = min(delay * 2, 60)
    raise RuntimeError("unreachable")


def read_key(args) -> str:
    key = args.key or os.environ.get("GOOGLE_TTS_API_KEY", "")
    if not key and KEY_FILE.exists():
        key = KEY_FILE.read_text(encoding="utf-8-sig").strip()
    if not key:
        sys.exit(
            "API anahtari yok. scripts/.tts-key dosyasina yapistirin, ya da "
            "GOOGLE_TTS_API_KEY ortam degiskenini / --key secenegini kullanin."
        )
    return key


# --------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------

def main() -> None:
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass

    hidden = argparse.SUPPRESS
    p = argparse.ArgumentParser(description="Chirp 3 HD audio guide recorder")
    p.add_argument("--voice", help=f"one Chirp voice for every language, e.g. {DEFAULT_VOICE}, Algieba, Charon")
    p.add_argument("--voice-tr")
    p.add_argument("--voice-en")
    p.add_argument("--voice-de")
    p.add_argument("--voice-ru")
    p.add_argument("--remote-dir", default=str(ROOT.parent / "antik-audio"))
    p.add_argument("--base-url", default=BASE_URL)
    p.add_argument("--lang", help="only this language")
    p.add_argument("--app-only", action="store_true")
    p.add_argument("--rate", type=float, default=0.95, help="speaking rate 0.25-2.0")
    p.add_argument("--force", action="store_true", help="re-record even up-to-date Chirp chapters")
    p.add_argument("--jobs", type=int, default=4, help="chapters recorded at once")
    p.add_argument("--only", help="a single guide key, e.g. site:efes")
    p.add_argument("--key", help="API key (else GOOGLE_TTS_API_KEY or scripts/.tts-key)")
    p.add_argument("--budget", type=int, default=950_000, help="max characters per month")
    p.add_argument("--dry-run", action="store_true", help="estimate only, no API calls")
    p.add_argument("--sample", action="store_true", help="render voice samples to scripts/voice-samples/")
    p.add_argument("--no-lexicon", action="store_true", help="ignore pronunciations.json")
    # For testing against a fake server and scratch copies.
    p.add_argument("--endpoint", default=ENDPOINT, help=hidden)
    p.add_argument("--script", default=str(SCRIPT), help=hidden)
    p.add_argument("--manifest", default=str(MANIFEST), help=hidden)
    p.add_argument("--audio-dir", default=str(AUDIO), help=hidden)
    p.add_argument("--usage-file", default=str(USAGE_FILE), help=hidden)
    p.add_argument("--lexicon", default=str(LEXICON), help=hidden)
    p.add_argument("--samples-dir", default=str(SAMPLES), help=hidden)
    p.add_argument("--max-request-bytes", type=int, default=MAX_REQUEST_BYTES, help=hidden)
    args = p.parse_args()

    if not 0.25 <= args.rate <= 2.0:
        sys.exit("--rate 0.25 ile 2.0 arasinda olmali.")
    voices = {
        lang: full_voice(getattr(args, f"voice_{lang}") or args.voice or DEFAULT_VOICE, lang)
        for lang in LANG_ORDER
    }
    lexicon = {} if args.no_lexicon else load_lexicon(pathlib.Path(args.lexicon))
    budget = Budget(pathlib.Path(args.usage_file), args.budget)

    if args.sample:
        run_samples(args, voices, lexicon, budget)
        return

    script = json.loads(pathlib.Path(args.script).read_text(encoding="utf-8"))
    manifest_path = pathlib.Path(args.manifest)
    manifest = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {}
    audio_root = pathlib.Path(args.audio_dir)
    remote_audio = pathlib.Path(args.remote_dir) / "audio"
    base_url = args.base_url.rstrip("/")

    items = [
        i
        for i in script["items"]
        if (not args.only or i["key"] == args.only)
        and (not args.lang or i["lang"] == args.lang)
        and (not args.app_only or i.get("target", "app") == "app")
    ]
    order = {lang: n for n, lang in enumerate(LANG_ORDER)}
    items.sort(key=lambda i: order.get(i["lang"], 99))  # stable: tr, en, de, ru

    # Work out what needs recording, and what each chapter's requests are.
    jobs = []
    for item in items:
        if text_hash(item["text"]) != item["hash"]:
            sys.exit("Hash mismatch between the exporter and this script; refusing to continue.")
        remote = item.get("target", "app") == "remote"
        relative = f"audio/{item['folder']}/{item['lang']}/{item['chapter']}.mp3"
        target = (remote_audio.parent if remote else audio_root.parent) / relative
        url = f"{base_url}/{relative}" if remote else f"/{relative}"
        entry = manifest.get(item["key"], {}).get(item["lang"], {}).get(item["chapter"])
        if (
            not args.force
            and target.exists()
            and target.stat().st_size > 0
            and entry
            and entry.get("voice") == VOICE_TAG
            and entry.get("hash") == item["hash"]
            and entry.get("url") == url
            and entry.get("v") == SPEECH_VERSION
        ):
            continue
        markup = to_markup(item.get("speech") or item["text"], item["chapter"])
        bodies = []
        for piece in split_markup(markup, args.max_request_bytes):
            entries = phrases_in(piece, lexicon.get(item["lang"], []))
            bodies.append(build_request(piece, item["lang"], voices[item["lang"]], args.rate, entries))
        jobs.append({"item": item, "target": target, "url": url, "bodies": bodies,
                     "chars": sum(billed_chars(b) for b in bodies)})

    # Estimate.
    per_lang = {}
    for job in jobs:
        s = per_lang.setdefault(job["item"]["lang"], [0, 0, 0])
        s[0] += 1
        s[1] += job["chars"]
        s[2] += len(job["bodies"])
    total = sum(s[1] for s in per_lang.values())
    say(f"{len(items)} bolum kontrol edildi; {len(jobs)} bolum kaydedilecek.")
    say("Sesler: " + ", ".join(voices[lang] for lang in LANG_ORDER))
    for lang in LANG_ORDER:
        if lang in per_lang:
            n, chars, reqs = per_lang[lang]
            say(f"  {lang}: {n:5d} bolum, {chars:9,d} karakter, {reqs} istek")
    say(f"  toplam: {total:,d} karakter")
    left = args.budget - budget.used
    say(f"Bu ay ({budget.month}) kullanilan: {budget.used:,d}; sinir {args.budget:,d}; kalan {max(left, 0):,d}.")
    if total > left:
        say(f"UYARI: hepsi bu ay sigmaz; sinira gelince durulur (kalan {total - max(left, 0):,d} karakter "
            "gelecek ay calistirildiginda kaydedilir).")
    else:
        say("Hepsi ucretsiz kotanin icinde kalir.")
    if args.dry_run or not jobs:
        return

    key = read_key(args)
    counts = {"done": 0, "failed": 0, "budget": 0}
    lock = threading.Lock()
    stop = threading.Event()
    state = {"dirty": 0, "saved_at": time.monotonic(), "fatal": None}

    def save_manifest(force=False):
        # Called with `lock` held.
        if state["dirty"] and (force or state["dirty"] >= 10 or time.monotonic() - state["saved_at"] > 10):
            write_json(manifest_path, manifest)
            state["dirty"] = 0
            state["saved_at"] = time.monotonic()

    def record(n, job):
        if stop.is_set():
            return
        item = job["item"]
        label = f"[{n}/{len(jobs)}] {item['key']} {item['lang']} {item['chapter']}"
        if not budget.reserve(job["chars"]):
            counts["budget"] += 1
            if not stop.is_set():
                say(f"{label}  AYLIK SINIR: {args.budget:,d} karaktere ulasildi, duruluyor.")
            stop.set()
            return
        audio = bytearray()
        try:
            for body in job["bodies"]:
                n_chars = billed_chars(body)
                try:
                    chunk = synthesize(args.endpoint, key, body)
                except PronunciationRejected as error:
                    say(f"{label}  okunus sozlugu reddedildi, sozluksuz deneniyor: {error}")
                    body = dict(body, input={"markup": body["input"]["markup"]})
                    chunk = synthesize(args.endpoint, key, body)
                budget.settle(n_chars, True)
                job["chars"] -= n_chars
                audio += chunk
        except Fatal as error:
            budget.settle(job["chars"], False)
            state["fatal"] = str(error)
            stop.set()
            counts["failed"] += 1
            return
        except Exception as error:
            budget.settle(job["chars"], False)
            say(f"{label}  BASARISIZ: {error}")
            counts["failed"] += 1
            return
        target = job["target"]
        target.parent.mkdir(parents=True, exist_ok=True)
        tmp = target.with_name(target.name + ".part")
        tmp.write_bytes(bytes(audio))
        os.replace(tmp, target)
        with lock:
            manifest.setdefault(item["key"], {}).setdefault(item["lang"], {})[item["chapter"]] = {
                "url": job["url"],
                "hash": item["hash"],
                "v": SPEECH_VERSION,
                "voice": VOICE_TAG,
            }
            counts["done"] += 1
            state["dirty"] += 1
            save_manifest()
        say(f"{label}  ok")

    try:
        with ThreadPoolExecutor(max_workers=max(1, args.jobs)) as pool:
            futures = [pool.submit(record, n, job) for n, job in enumerate(jobs, 1)]
            try:
                for f in futures:
                    while not f.done():
                        time.sleep(0.2)  # lets Ctrl+C through on Windows
            except KeyboardInterrupt:
                # Before the pool's exit waits: queued chapters must not start.
                stop.set()
                say("\nDurduruldu; suren bolumler bitiyor, yapilanlar kaydediliyor...")
    finally:
        with lock:
            save_manifest(force=True)
    if state["fatal"]:
        say(f"\nHATA: {state['fatal']}")
    skipped = len(jobs) - counts["done"] - counts["failed"]
    if stop.is_set() and not state["fatal"]:
        say("Yeniden calistirinca kaldigi yerden devam eder.")
    say(f"\nKaydedilen {counts['done']}, basarisiz {counts['failed']}, bekleyen {skipped}.")
    say(f"Bu ay kullanilan: {budget.used:,d} / {args.budget:,d} karakter.")
    if state["fatal"] or counts["failed"]:
        sys.exit(1)


def run_samples(args, voices, lexicon, budget) -> None:
    out = pathlib.Path(args.samples_dir)
    plan = [(f"tr-{name}.mp3", "tr", full_voice(name, "tr"), SAMPLE_TEXT) for name in SAMPLE_VOICES]
    for lang in ("en", "de", "ru"):
        plan.append((f"{lang}-{voices[lang].rsplit('-', 1)[-1]}.mp3", lang, voices[lang], SAMPLE_LINES[lang]))
    bodies = [(f, build_request(t, lang, v, args.rate, phrases_in(t, lexicon.get(lang, [])))) for f, lang, v, t in plan]
    total = sum(billed_chars(b) for _, b in bodies)
    say(f"{len(bodies)} ornek, {total:,d} karakter. Klasor: {out}")
    if args.dry_run:
        return
    key = read_key(args)
    out.mkdir(parents=True, exist_ok=True)
    for name, body in bodies:
        n = billed_chars(body)
        if not budget.reserve(n):
            sys.exit("Aylik karakter siniri doldu.")
        try:
            audio = synthesize(args.endpoint, key, body)
        except PronunciationRejected:
            audio = synthesize(args.endpoint, key, dict(body, input={"markup": body["input"]["markup"]}))
        except Fatal as error:
            budget.settle(n, False)
            sys.exit(f"HATA: {error}")
        except Exception as error:
            budget.settle(n, False)
            say(f"{name}: BASARISIZ ({error})")
            continue
        budget.settle(n, True)
        (out / name).write_bytes(audio)
        say(f"{name}  ok")
    say("Ornekleri dinleyin ve begendiginiz sesin adini secin (or. Sulafat, Algieba).")


if __name__ == "__main__":
    main()
