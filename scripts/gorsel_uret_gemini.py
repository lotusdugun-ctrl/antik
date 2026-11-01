"""
Make concept images and textures for a site with Gemini's image model
("Nano Banana"), on this computer. Run it from GORSEL-URET.bat.

The prompts are in scripts/ai-gorsel/<site>.json; the images go to
gorseller-ai/<site>/ (not committed): concept pictures of the outside and the
inside, to agree on how the place should look before it is finished in
Blender, and seamless textures for the Blender pass.

Every prompt is also written to gorseller-ai/<site>/istemler.txt, so that if
the image model is not free on the API, the same pictures can be made by hand
at aistudio.google.com (free there).

    python scripts/gorsel_uret_gemini.py --site goreme [--only ic-nef] [--model ...]
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import pathlib
import sys
import time
import urllib.error
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
PROMPTS = ROOT / "scripts" / "ai-gorsel"
OUT = ROOT / "gorseller-ai"
KEY_FILE = ROOT / "scripts" / ".gemini-key"
API = "https://generativelanguage.googleapis.com/v1beta"
# Preferred first; any other model whose name says "image" is tried after.
PREFERRED = ["gemini-2.5-flash-image", "gemini-3-pro-image-preview"]


class NotFree(Exception):
    pass


def api_key() -> str:
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not key and KEY_FILE.exists():
        key = KEY_FILE.read_text(encoding="utf-8").strip()
    if not key:
        sys.exit("GEMINI_API_KEY bulunamadi (scripts/.gemini-key).")
    return key


def call(key: str, url: str, body: dict | None = None) -> dict:
    request = urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8") if body is not None else None,
        method="POST" if body is not None else "GET",
        headers={"Content-Type": "application/json", "x-goog-api-key": key},
    )
    with urllib.request.urlopen(request, timeout=300) as response:
        return json.loads(response.read().decode("utf-8"))


def image_models(key: str) -> list[str]:
    found = []
    try:
        data = call(key, f"{API}/models?pageSize=200")
        for m in data.get("models", []):
            name = m.get("name", "").removeprefix("models/")
            if "image" in name and "generateContent" in m.get("supportedGenerationMethods", []):
                found.append(name)
    except Exception as error:  # the list is a help, not a must
        print(f"  model listesi alinamadi: {error}", flush=True)
    ordered = [m for m in PREFERRED if m in found or not found]
    return ordered + [m for m in found if m not in ordered]


def generate(key: str, model: str, prompt: str, aspect: str) -> bytes:
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseModalities": ["TEXT", "IMAGE"],
            "imageConfig": {"aspectRatio": aspect},
        },
    }
    for attempt in range(5):
        try:
            data = call(key, f"{API}/models/{model}:generateContent", body)
            for part in data["candidates"][0]["content"]["parts"]:
                inline = part.get("inlineData") or part.get("inline_data")
                if inline and inline.get("data"):
                    return base64.b64decode(inline["data"])
            raise ValueError("cevapta gorsel yok")
        except urllib.error.HTTPError as error:
            detail = error.read().decode("utf-8", "replace")
            if error.code == 429 and "limit: 0" in detail:
                raise NotFree(detail[:300])
            if error.code == 429 and ("PerDay" in detail or "per day" in detail.lower()):
                raise NotFree("gunluk kota doldu")
            if error.code in (429, 500, 502, 503, 504):
                time.sleep(min(90, 6 * 2**attempt))
                continue
            if error.code == 400 and "imageConfig" in detail:
                body["generationConfig"].pop("imageConfig", None)  # older model: no aspect option
                continue
            raise RuntimeError(f"HTTP {error.code}: {detail[:300]}")
        except (TimeoutError, OSError, urllib.error.URLError, KeyError, IndexError, ValueError):
            time.sleep(5 * 2**attempt)
    raise RuntimeError("gorsel alinamadi")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--site", default="goreme")
    parser.add_argument("--only")
    parser.add_argument("--model")
    args = parser.parse_args()
    spec = json.loads((PROMPTS / f"{args.site}.json").read_text(encoding="utf-8"))
    out = OUT / args.site
    out.mkdir(parents=True, exist_ok=True)
    with open(out / "istemler.txt", "w", encoding="utf-8") as f:
        for item in spec["images"]:
            f.write(f"=== {item['name']}  (oran {item['aspect']})\n{item['prompt']}\n\n")
    key = api_key()
    models = [args.model] if args.model else image_models(key)
    print("Denenecek modeller: " + ", ".join(models), flush=True)
    images = [i for i in spec["images"] if not args.only or i["name"] == args.only]
    made = 0
    for item in images:
        target = out / f"{item['name']}.png"
        if target.exists():
            print(f"{item['name']}: var", flush=True)
            continue
        for model in list(models):
            try:
                data = generate(key, model, item["prompt"], item["aspect"])
            except NotFree as why:
                print(f"  {model}: ucretsiz kullanilamiyor ({why})", flush=True)
                models.remove(model)
                continue
            except RuntimeError as error:
                print(f"  {model}: {error}", flush=True)
                continue
            target.write_bytes(data)
            made += 1
            print(f"{item['name']}: tamam ({model}, {len(data) // 1024} KB)", flush=True)
            break
        if not models:
            print("\nGORSEL MODELI UCRETSIZ API'DE KULLANILAMIYOR (ya da bugunluk kota doldu).\n"
                  "Istemler gorseller-ai\\" + args.site + "\\istemler.txt dosyasinda; "
                  "aistudio.google.com'da elle de uretebilirsiniz.", flush=True)
            sys.exit(3)
    print(f"\n{made} yeni gorsel: {out}")


if __name__ == "__main__":
    main()
