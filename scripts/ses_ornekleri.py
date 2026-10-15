"""
Kartsız, ücretsiz ses seçenekleri için örnekler: Microsoft'un Edge sesleri.

    python scripts/ses_ornekleri.py

Onaylanan yeni Efes anlatımının (giriş + tarihçe) aynı paragrafını birkaç
sesle okutur ve scripts/ses-ornekleri/ klasörüne MP3 olarak yazar. Türkçe
sesler (Emel, Ahmet) ile Microsoft'un daha yeni "çok dilli" sesleri
karşılaştırılır; çok dilli sesler metnin dilini kendileri tanır.
"""
import asyncio
import json
import pathlib
import sys

try:
    import edge_tts
except ImportError:
    sys.exit("edge-tts kurulu degil. Calistirin:  pip install edge-tts")

ROOT = pathlib.Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "scripts" / "audio-script.json"
OUT = ROOT / "scripts" / "ses-ornekleri"

VOICES = [
    ("1-emel-turkce-kadin", "tr-TR-EmelNeural"),
    ("2-ahmet-turkce-erkek", "tr-TR-AhmetNeural"),
    ("3-ava-cok-dilli-kadin", "en-US-AvaMultilingualNeural"),
    ("4-andrew-cok-dilli-erkek", "en-US-AndrewMultilingualNeural"),
    ("5-emma-cok-dilli-kadin", "en-US-EmmaMultilingualNeural"),
    ("6-brian-cok-dilli-erkek", "en-US-BrianMultilingualNeural"),
    ("7-seraphina-cok-dilli-kadin", "de-DE-SeraphinaMultilingualNeural"),
    ("8-florian-cok-dilli-erkek", "de-DE-FlorianMultilingualNeural"),
]


async def render(name: str, voice: str, text: str) -> None:
    path = OUT / f"{name}.mp3"
    try:
        await edge_tts.Communicate(text, voice, rate="-5%").save(str(path))
        print(f"  hazir: {path.name}")
    except Exception as error:  # a voice Microsoft has retired, or no network
        print(f"  ATLANDI {name} ({voice}): {error}")


async def main() -> None:
    # The spoken form ("MÖ" read out in full), exactly as a recording gets it.
    items = json.loads(SCRIPT.read_text(encoding="utf-8"))["items"]
    speech = {
        i["chapter"]: i["speech"]
        for i in items
        if i["key"] == "site:efes" and i["lang"] == "tr"
    }
    # A name the old voice misread, so the samples test it too.
    text = f"{speech['intro']} {speech['history']} Afrodisias, Hierapolis ve Göbeklitepe de bu yolculuğun durakları."
    OUT.mkdir(parents=True, exist_ok=True)
    print(f"{len(VOICES)} ses ornegi hazirlaniyor...")
    for name, voice in VOICES:
        await render(name, voice, text)
    print(f"\nBitti. Dinlemek icin bu klasoru acin: {OUT}")


asyncio.run(main())
