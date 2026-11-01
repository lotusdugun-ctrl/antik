"""
Rewrite the audio guide's chapters to be spoken: warmer, more varied, like a
guide talking to a group — with Gemini, on this computer. Run it from
HIKAYELERI-YENILE.bat. Nothing is published directly: the new texts go to
scripts/rewrite-out/<lang>/<file>.json, the .bat pushes them to the branch
"hikaye-yeniden", and they are checked (scripts/check-stories.ts: every
number kept, no new number or name, sensible length) before they replace
src/lib/narration-stories.

Each chapter is also checked here before it is kept; a chapter that fails
(lost or new numbers, too short or too long, markdown) is asked for again,
and after three tries the old text stays.

    python scripts/rewrite_stories_gemini.py --lang tr [--only site-efes] [--limit 5]
"""

from __future__ import annotations

import argparse
import concurrent.futures
import hashlib
import json
import os
import pathlib
import re
import sys
import time
import random
import urllib.error
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
STORIES = ROOT / "src" / "lib" / "narration-stories"
OUT = ROOT / "scripts" / "rewrite-out2"
KEY_FILE = ROOT / "scripts" / ".gemini-key"
MODELS = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-2.5-flash"]

RULES = {
    "tr": """Sen, bir sesli rehber için metin yazan usta bir anlatıcısın. Aşağıdaki JSON, bir antik
kentin ya da yapının sesli rehber bölümlerini içeriyor. Her bölümü, KULAĞA hitap edecek şekilde,
sıcak, samimi ve canlı bir rehber ağzından yeniden yaz. Kurallar:
- Bilgileri KORU: her sayı aynı rakamlarla kalmalı; yeni sayı, yeni tarih, yeni özel isim EKLEME.
  Metinde olmayan bir bilgiyi uydurma. Var olan özel isimleri değiştirme.
- Uzunluk, orijinalin 0,9 ile 1,4 katı arasında olsun.
- Dilbilgisi kusursuz, doğal, akıcı İstanbul Türkçesi yaz; bir Türk rehberin gerçekten söyleyeceği
  cümleler kur. Devrik ya da çeviri kokan cümle kurma ("Takvimler işaret ediyor MS 4. yüzyılı",
  "kat sayısı tam iki" gibi zorlama yapılardan kaçın). Sayıları cümlenin doğal yerinde söyle.
- Dinleyiciye ara sıra doğrudan seslen ("bakın", "hayal edin"), ama abartma. Her bölümde EN FAZLA bir
  soru sor; "… mı dersiniz?", "… mı yapıldı?" gibi soru-cevap kalıbını her bölümde tekrarlama.
  Kısa nefes araları için üç nokta (…) kullanabilirsin, ama bölüm başına en fazla iki kez.
- Kalıp açılışlardan KAÇIN: "Biliyor muydunuz?", "Gezinirken", "Bu gezimizin sonuna geldik",
  "Şimdi … önündesiniz" gibi her dosyada tekrar eden açılışları kullanma; her bölümü farklı başlat.
- "uncertainty" bölümünü içten bir itiraf gibi, sakin ve anlaşılır yaz; hesapları sade cümlelere dök.
- "outro" bölümünü bu yere özgü, kısa ve sıcak bir vedayla yaz.
- Markdown, madde işareti, yıldız, başlık KULLANMA. Düz metin.
- Aynı JSON anahtarlarıyla, yalnızca JSON döndür.""",
    "en": """You are a master storyteller writing an audio guide. The JSON below holds the audio-guide
chapters of an ancient site or building. Rewrite every chapter FOR THE EAR, in the voice of a warm,
lively guide talking to a small group. Rules:
- KEEP the facts: every number stays, in digits; add NO new number, date or proper name; invent
  nothing that is not in the text; do not change existing names.
- Length between 0.9x and 1.4x the original.
- Write natural, idiomatic English a real guide would say; say numbers where they fall naturally.
- Address the listener now and then ("look up", "imagine"), but don't overdo it. At most ONE question
  per chapter; don't repeat a question-and-answer pattern in every chapter. An ellipsis (…) for a
  short breath at most twice per chapter.
- AVOID stock openers: "Did you know?", "As you wander", "This brings our tour", "Next stop: the …"
  — start every chapter differently.
- Write "uncertainty" as a candid, calm confession; turn arithmetic into plain sentences.
- Write "outro" as a short, warm farewell specific to this place.
- NO markdown, bullets, asterisks or headings. Plain text.
- Return only JSON with the same keys.""",
}


def api_key() -> str:
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not key and KEY_FILE.exists():
        key = KEY_FILE.read_text(encoding="utf-8").strip()
    if not key:
        sys.exit("GEMINI_API_KEY bulunamadi (ortam degiskeni ya da scripts/.gemini-key).")
    return key


def numbers(text: str) -> list[str]:
    out = []
    for n in re.findall(r"\d[\d.,]*\d|\d", text):
        plain = re.sub(r"[.,](?=\d{3}\b)", "", n)
        out += [p for p in re.split(r"[.,]", plain) if p]
    return out


def acceptable(old: str, new: str) -> str | None:
    if not isinstance(new, str) or not new.strip():
        return "empty"
    if re.search(r"[*#_`]|\n\s*[-•]", new):
        return "markdown"
    if set(numbers(old)) != set(numbers(new)):
        return f"numbers {sorted(set(numbers(old)) ^ set(numbers(new)))}"
    ratio = len(new) / max(1, len(old))
    if (ratio < 0.85 and len(old) > 80) or (ratio > 1.55 and len(new) - len(old) > 300):
        return f"length {ratio:.2f}"
    return None


def ask(key: str, model: str, prompt: str) -> dict:
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json", "temperature": 0.9},
    }
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    for attempt in range(6):
        request = urllib.request.Request(
            url, data=json.dumps(body).encode("utf-8"), method="POST",
            headers={"Content-Type": "application/json", "x-goog-api-key": key},
        )
        try:
            with urllib.request.urlopen(request, timeout=600) as response:
                data = json.loads(response.read().decode("utf-8"))
            text = "".join(p.get("text", "") for p in data["candidates"][0]["content"]["parts"])
            # Some answers come wrapped in a code fence, or with words round the JSON.
            start, end = text.find("{"), text.rfind("}")
            return json.loads(text[start : end + 1] if start >= 0 else text)
        except urllib.error.HTTPError as error:
            detail = error.read().decode("utf-8", "replace")
            if error.code == 429 and ("PerDay" in detail or "per day" in detail.lower()):
                print("\nGUNLUK UCRETSIZ KOTA DOLDU. Yarin (Turkiye saatiyle ogleden sonra) yeniden "
                      "calistirin; kaldigi yerden devam eder.", flush=True)
                os._exit(3)
            if error.code in (429, 500, 502, 503, 504):
                time.sleep(min(90, 4 * 2**attempt) + random.random() * 3)
                continue
            raise RuntimeError(f"HTTP {error.code}: {detail[:300]}")
        except (TimeoutError, OSError, urllib.error.URLError):
            # A slow answer or a dropped connection: wait, and ask again.
            time.sleep(min(60, 5 * 2**attempt))
        except (KeyError, IndexError, ValueError):
            time.sleep(3)
    raise RuntimeError("no usable answer")


def pick_model(key: str, wanted: str | None) -> str:
    for model in [wanted] if wanted else MODELS:
        try:
            ask(key, model, 'Return {"ok": true} as JSON.')
            return model
        except RuntimeError as error:
            print(f"  {model}: {error}", flush=True)
    sys.exit("Hicbir Gemini metin modeli calismadi.")


def rewrite(key: str, model: str, lang: str, path: pathlib.Path) -> tuple[str, int, int]:
    story = json.loads(path.read_text(encoding="utf-8"))
    out_path = OUT / lang / path.name
    done = json.loads(out_path.read_text(encoding="utf-8")) if out_path.exists() else {}
    # A chapter still as it was (an earlier run could not rewrite it) is tried again.
    done = {k: v for k, v in done.items() if k in story and v != story[k]}
    todo = {k: v for k, v in story.items() if k not in done}
    kept = 0
    for _ in range(3):
        if not todo:
            break
        prompt = RULES[lang] + "\n\n" + json.dumps(todo, ensure_ascii=False, indent=1)
        try:
            answer = ask(key, model, prompt)
        except RuntimeError as error:
            print(f"  {path.name}: {error}", flush=True)
            break
        for k in list(todo):
            problem = acceptable(story[k], answer.get(k, ""))
            if problem is None:
                done[k] = answer[k].strip()
                del todo[k]
    for k in todo:  # three tries failed: the old text stays
        done[k] = story[k]
        kept += 1
    ordered = {k: done[k] for k in story}
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(ordered, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return path.name, len(story) - kept, kept


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--lang", choices=["tr", "en"], default="tr")
    parser.add_argument("--only")
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--model")
    parser.add_argument("--jobs", type=int, default=3)
    args = parser.parse_args()
    key = api_key()
    model = pick_model(key, args.model)
    print(f"Model: {model}", flush=True)
    files = sorted((STORIES / args.lang).glob("*.json"))
    if args.only:
        files = [f for f in files if f.stem == args.only]
    if args.limit:
        files = files[: args.limit]
    total_new = total_kept = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.jobs) as pool:
        futures = [pool.submit(rewrite, key, model, args.lang, f) for f in files]
        for n, future in enumerate(concurrent.futures.as_completed(futures), 1):
            try:
                name, new, kept = future.result()
            except Exception as error:
                print(f"[{n}/{len(files)}] HATA {error}", flush=True)
                continue
            total_new += new
            total_kept += kept
            print(f"[{args.lang} {n}/{len(files)}] {name}: {new} yeni, {kept} eski kaldi", flush=True)
    print(f"\n{args.lang}: {total_new} bolum yeniden yazildi, {total_kept} eski kaldi.")


if __name__ == "__main__":
    main()
