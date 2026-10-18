"""
Piper voices for the audio guide, and the licence gate every one must pass.

Shared by generate_audio_piper.py (the guide), generate_ambience_voices.py
(the Greek in the 3D models) and piper_ornekleri.py (listening samples).
Runs on the owner's computer, which can reach Hugging Face.

    pip install "piper-tts>=1.3,<2" lameenc

Why a gate: Piper itself is free software, but each voice is a model trained
on someone's recordings, and what may be done with the voice's output depends
on that dataset's licence. Each voice in rhasspy/piper-voices has a
MODEL_CARD naming its dataset and licence. A voice is used only when that
licence is on ALLOW (public domain / CC0 / CC BY / MIT / Apache), and, if the
card says the voice was fine-tuned from another voice, only when that voice
passes too. Everything else is refused: non-commercial (NC), no-derivatives
(ND), ShareAlike (SA), "research only", a licence page we cannot read, or no
licence at all. Better a language falls back to the phone's own voice than
the app ships a recording it may not distribute.

    python scripts/piper_voices.py --self-test   (checks the classifier, offline)
    python scripts/piper_voices.py --table       (the decision for every candidate)
"""

from __future__ import annotations

import json
import pathlib
import re
import sys
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
CACHE = ROOT / "scripts" / ".piper-voices"
CREDITS = ROOT / "src" / "lib" / "voice-credits.json"
VOICES_MD = "https://raw.githubusercontent.com/rhasspy/piper/master/VOICES.md"
HF = "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0"

# Which Piper locales serve each app language, and the voices to try first
# (in this order); every other voice of the locale is tried after them.
LANGS: dict[str, dict] = {
    "tr": {"locales": ["tr_TR"], "prefer": ["fahrettin", "fettah", "dfki"]},
    "en": {"locales": ["en_US", "en_GB"], "prefer": ["ljspeech", "libritts_r", "libritts"]},
    "de": {"locales": ["de_DE"], "prefer": ["thorsten", "thorsten_emotional"]},
    "ru": {"locales": ["ru_RU"], "prefer": ["irina", "denis", "dmitri", "ruslan"]},
    "el": {"locales": ["el_GR"], "prefer": ["rapunzelina"]},
}
QUALITY = {"high": 3, "medium": 2, "low": 1, "x_low": 0}

# The allow-list: (pattern, licence name, licence URL). Checked only after the
# deny-list below found nothing.
ALLOW = [
    (r"cc0|publicdomain/zero|public[ -]?domain|publicdomain/mark", "Public domain (CC0)",
     "https://creativecommons.org/publicdomain/zero/1.0/"),
    (r"cc[ -]?by[ -]?4\.0|licenses/by/4\.0|attribution 4\.0", "CC BY 4.0",
     "https://creativecommons.org/licenses/by/4.0/"),
    (r"cc[ -]?by[ -]?3\.0|licenses/by/3\.0|attribution 3\.0", "CC BY 3.0",
     "https://creativecommons.org/licenses/by/3.0/"),
    (r"\bmit\b|opensource\.org/licenses/mit", "MIT", "https://opensource.org/licenses/MIT"),
    (r"apache", "Apache-2.0", "https://www.apache.org/licenses/LICENSE-2.0"),
]
DENY = [
    (r"\bnc\b|by-nc|non-?commercial|noncommercial", "NonCommercial"),
    (r"\bnd\b|by-nd|no-?deriv", "NoDerivatives"),
    (r"\bsa\b|by-sa|share-?alike|\bgpl|copyleft", "ShareAlike/copyleft"),
    (r"unknown|unclear|not specified|research|academic|personal use|proprietary|"
     r"all rights reserved|permission|contact|blizzard", "not an open licence"),
]


def classify(licence: str) -> tuple[bool, str, str]:
    """(accepted, licence name or reason, licence URL)."""
    text = " ".join(licence.lower().split())
    if not text:
        return False, "no licence stated", ""
    for pattern, why in DENY:
        if re.search(pattern, text):
            return False, f"refused: {why} ({licence.strip()[:60]})", ""
    for pattern, name, url in ALLOW:
        if re.search(pattern, text):
            return True, name, url
    return False, f"refused: not on the allow-list ({licence.strip()[:60]})", ""


# ---------------------------------------------------------------------------

def fetch(url: str, binary: bool = False, timeout: int = 60):
    request = urllib.request.Request(url, headers={"User-Agent": "antik-turkiye-voices/1.0"})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        data = response.read()
    return data if binary else data.decode("utf-8", "replace")


def catalogue() -> list[dict]:
    """Every voice VOICES.md lists: locale, name, quality, model and config URLs."""
    out = []
    for match in re.finditer(
        r"\[\[model\]\((https://huggingface\.co/rhasspy/piper-voices/resolve/v1\.0\.0/"
        r"([a-z]+)/([a-z]{2}_[A-Z]{2})/([^/]+)/([^/]+)/[^)?]+\.onnx)[^)]*\)\]",
        fetch(VOICES_MD),
    ):
        model, family, locale, name, quality = match.groups()
        out.append({
            "id": f"{locale}-{name}-{quality}",
            "family": family, "locale": locale, "name": name, "quality": quality,
            "model": model, "config": model + ".json",
            "card": f"{HF}/{family}/{locale}/{name}/{quality}/MODEL_CARD",
        })
    return out


def parse_card(card: str) -> dict:
    """The dataset name/URL, its licence line, and any voice it was fine-tuned from."""
    dataset = ""
    licence = ""
    section = ""
    for raw in card.splitlines():
        line = raw.strip()
        if line.startswith("#"):
            section = line.lstrip("#").strip().lower()
            continue
        m = re.match(r"[*-]\s*(url|name|license|licence)\s*:\s*(.+)", line, re.I)
        if m and "dataset" in section:
            key, value = m.group(1).lower(), m.group(2).strip()
            if key.startswith("licen"):
                licence = (licence + " " + value).strip()
            elif not dataset or key == "name":
                dataset = value
    if not licence:  # some cards put it outside a "Dataset" heading
        m = re.search(r"licen[cs]e\s*:\s*(.+)", card, re.I)
        licence = m.group(1).strip() if m else ""
    tuned = re.search(r"fine-?tun\w*\s+(?:from|on)\s+(.+)", card, re.I)
    return {"dataset": dataset, "licence": licence, "parent": tuned.group(1).strip() if tuned else ""}


def judge(voice: dict, voices: list[dict], cards: dict, depth: int = 0) -> tuple[bool, str, dict]:
    """Decide one voice. Returns (accepted, reason, parsed card)."""
    if voice["id"] not in cards:
        try:
            cards[voice["id"]] = parse_card(fetch(voice["card"]))
        except Exception as error:  # no card, no voice
            cards[voice["id"]] = {"error": f"model card unreadable: {error}"}
    card = cards[voice["id"]]
    if "error" in card:
        return False, card["error"], card
    ok, reason, url = classify(card["licence"])
    card["licenseName"], card["licenseUrl"] = (reason, url) if ok else ("", "")
    if not ok:
        return False, reason, card
    if card["parent"]:
        if depth > 2:
            return False, "refused: fine-tuning chain too deep to verify", card
        parent_text = card["parent"].lower()
        parents = [
            v for v in voices
            if v["id"] != voice["id"] and re.search(rf"\b{re.escape(v['name'].lower())}\b", parent_text)
        ]
        if not parents:
            return False, f"refused: fine-tuned from an unidentified voice ({card['parent'][:50]})", card
        parents.sort(key=lambda v: (v["locale"] != voice["locale"], -QUALITY.get(v["quality"], 0)))
        p_ok, p_reason, _ = judge(parents[0], voices, cards, depth + 1)
        if not p_ok:
            return False, f"refused: fine-tuned from {parents[0]['id']}, which is {p_reason}", card
    return True, card["licenseName"], card


def candidates(lang: str, voices: list[dict]) -> list[dict]:
    spec = LANGS[lang]
    pool = [v for v in voices if v["locale"] in spec["locales"]]

    def rank(v: dict):
        name_rank = spec["prefer"].index(v["name"]) if v["name"] in spec["prefer"] else 99
        return (name_rank, spec["locales"].index(v["locale"]), -QUALITY.get(v["quality"], 0), v["name"])

    return sorted(pool, key=rank)


def choose(langs: list[str], forced: dict[str, str] | None = None, show: bool = True) -> dict[str, dict]:
    """The best acceptable voice per language, with a printed table of every decision."""
    forced = forced or {}
    voices = catalogue()
    cards: dict = {}
    chosen: dict[str, dict] = {}
    rows = []
    for lang in langs:
        for voice in candidates(lang, voices):
            ok, reason, card = judge(voice, voices, cards)
            pick = ok and lang not in chosen and (not forced.get(lang) or forced[lang] in voice["id"])
            if pick:
                chosen[lang] = {**voice, "dataset": card.get("dataset", ""),
                                "license": card["licenseName"], "licenseUrl": card["licenseUrl"]}
            rows.append((lang, voice["id"], "SECILDI" if pick else ("uygun" if ok else "RED"), reason))
    if show:
        print("\nLisans kontrolu (Piper ses modelleri):")
        print(f"{'dil':4} {'ses':42} {'karar':8} gerekce")
        for lang, vid, verdict, reason in rows:
            print(f"{lang:4} {vid:42} {verdict:8} {reason}")
        for lang in langs:
            if lang not in chosen:
                print(f"!! {lang}: lisansi uygun ses yok -> uygulama bu dilde cihazin kendi sesini kullanir.")
        print()
    return chosen


def write_credits(chosen: dict[str, dict], langs: list[str]) -> None:
    """Record (or clear) the credit for each language in src/lib/voice-credits.json."""
    credits = json.loads(CREDITS.read_text(encoding="utf-8")) if CREDITS.exists() else {}
    for lang in langs:
        if lang in chosen:
            v = chosen[lang]
            credits[lang] = {"voice": v["id"], "dataset": v["dataset"] or v["name"],
                             "license": v["license"], "licenseUrl": v["licenseUrl"],
                             "card": v["card"]}
        else:
            credits.pop(lang, None)
    CREDITS.write_text(json.dumps(credits, ensure_ascii=False, indent=1, sort_keys=True) + "\n",
                       encoding="utf-8")


def download(voice: dict) -> tuple[pathlib.Path, pathlib.Path]:
    CACHE.mkdir(parents=True, exist_ok=True)
    model = CACHE / f"{voice['id']}.onnx"
    config = CACHE / f"{voice['id']}.onnx.json"
    for url, path in ((voice["config"], config), (voice["model"], model)):
        if not path.exists() or path.stat().st_size == 0:
            print(f"  indiriliyor: {path.name}", flush=True)
            part = path.with_suffix(path.suffix + ".part")
            part.write_bytes(fetch(url, binary=True, timeout=600))
            part.replace(path)
    return model, config


class Speaker:
    """One loaded Piper voice that turns text into MP3 bytes."""

    def __init__(self, model: pathlib.Path, config: pathlib.Path):
        from piper import PiperVoice  # imported here so --self-test needs nothing installed

        self.voice = PiperVoice.load(str(model), config_path=str(config))
        self.rate = int(self.voice.config.sample_rate)

    def mp3(self, text: str, length_scale: float = 1.0, kbps: int = 48) -> bytes:
        import lameenc
        import numpy as np
        from piper import SynthesisConfig

        gap = np.zeros(int(self.rate * 0.28), dtype=np.int16)  # a breath between sentences
        parts = []
        for chunk in self.voice.synthesize(text, syn_config=SynthesisConfig(length_scale=length_scale)):
            parts += [chunk.audio_int16_array, gap]
        if not parts:
            return b""
        pcm = np.concatenate(parts).astype(np.int16)
        encoder = lameenc.Encoder()
        encoder.set_bit_rate(kbps)
        encoder.set_in_sample_rate(self.rate)
        encoder.set_channels(1)
        encoder.set_quality(2)
        return bytes(encoder.encode(pcm.tobytes()) + encoder.flush())


def self_test() -> None:
    cases = {
        "CC0": True, "Public Domain": True, "CC BY 4.0": True, "CC-BY-4.0": True,
        "https://creativecommons.org/licenses/by/4.0/": True, "MIT": True, "Apache 2.0": True,
        "CC BY-NC-SA 4.0": False, "CC BY-SA 4.0": False, "CC-BY-NC 4.0": False,
        "Non-commercial use only": False, "unknown": False, "": False, "GPL-3.0": False,
        "https://www.cstr.ed.ac.uk/projects/blizzard/2011/lessac_blizzard2011/license.html": False,
        "https://example.org/some-licence": False, "For research purposes": False,
    }
    for text, expected in cases.items():
        got = classify(text)[0]
        assert got == expected, (text, got)
    card = ("# Model card\n\n## Dataset\n\n* URL: https://www.thorsten-voice.de\n* License: CC0\n\n"
            "## Training\n\nFinetuned from the lessac medium checkpoint.\n")
    parsed = parse_card(card)
    assert parsed["licence"] == "CC0" and "lessac" in parsed["parent"], parsed
    print(f"self-test ok ({len(cases)} licences, 1 card)")


if __name__ == "__main__":
    if "--self-test" in sys.argv:
        self_test()
    elif "--table" in sys.argv:
        choose(list(LANGS))
    else:
        print(__doc__)
