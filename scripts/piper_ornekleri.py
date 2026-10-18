"""
Listening samples: every Piper voice that passes the licence gate, reading the
same short passage, written to scripts/ses-ornekleri/. Run from SES-ORNEKLERI.bat.
Pick a favourite, then record with it:  SESLENDIR.bat  (or, by hand,
python scripts/generate_audio_piper.py --voice-tr fahrettin).

    pip install "piper-tts>=1.3,<2" lameenc
    python scripts/piper_ornekleri.py
"""

import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import piper_voices  # noqa: E402

OUT = pathlib.Path(__file__).resolve().parent / "ses-ornekleri"
TEXT = {
    "tr": "Efes'e hoş geldiniz. Celsus Kütüphanesi, milattan sonra 117 yılında Romalı vali "
          "Tiberius Julius Celsus Polemaeanus için yaptırıldı.",
    "en": "Welcome to Ephesus. The Library of Celsus was built around AD 117 for the Roman "
          "governor Tiberius Julius Celsus Polemaeanus.",
    "de": "Willkommen in Ephesos. Die Celsus-Bibliothek wurde um 117 nach Christus für den "
          "römischen Statthalter Tiberius Julius Celsus Polemaeanus errichtet.",
    "ru": "Добро пожаловать в Эфес. Библиотека Цельса была построена около 117 года нашей эры "
          "в честь римского наместника Тиберия Юлия Цельса Полемеана.",
    "el": "Πολλὰ τὰ δεινὰ κοὐδὲν ἀνθρώπου δεινότερον πέλει.",
}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    voices = piper_voices.catalogue()
    cards: dict = {}
    made = 0
    for lang in TEXT:
        for voice in piper_voices.candidates(lang, voices):
            ok, reason, _ = piper_voices.judge(voice, voices, cards)
            print(f"{lang:3} {voice['id']:42} {'uygun' if ok else 'RED':6} {reason}", flush=True)
            if not ok:
                continue
            model, config = piper_voices.download(voice)
            speaker = piper_voices.Speaker(model, config)
            (OUT / f"{voice['id']}.mp3").write_bytes(speaker.mp3(TEXT[lang], length_scale=1.08))
            made += 1
    print(f"\n{made} ornek kaydedildi: {OUT}")
    print("Lisansi uygun olmayan diller uygulamada cihazin kendi sesiyle okunur.")


if __name__ == "__main__":
    main()
