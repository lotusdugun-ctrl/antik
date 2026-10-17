"""
Record the voices heard in the 3D models' soundscapes: an actor on the stage,
the herald and the crowd at the races, hymns at the altars, vendors in the
agora. Microsoft's Greek neural voices (the ones Edge's "Read aloud" uses).

    pip install edge-tts
    python scripts/generate_ambience_voices.py            (only missing clips)
    python scripts/generate_ambience_voices.py --force    (all of them again)

Writes public/ambience/voices/<key>.mp3 and public/ambience/voices/manifest.json.
The app reads the manifest when a model opens; until these files exist it
simply plays its soundscapes without voices. Run it from ORTAM-SESLERI.bat.

The words are real ones wherever they can be. The stage lines are the
openings of Sophocles' Oedipus the King and Aristophanes' Frogs and a line
of Sophocles' Antigone; the hymns are the Homeric Hymns and Cleanthes' Hymn
to Zeus; the herald's call is the formula Aristophanes gives heralds; the
ode after a race is the start of Pindar's first Olympian, written for a
victory with horses; at Nemrut the voice reads the opening of Antiochos I's
own inscription on the terrace (OGIS 383); at the Mausoleum a woman mourns
with Andromache's lament for Hector (Iliad 24.725-726). All of these texts are in the
public domain. The vendors' cries and the household calls are simple
Ancient Greek written for this, since nobody wrote those down.

The neural voices speak Modern Greek, so they read the ancient text with
modern pronunciation, and they are given the text in the modern single-accent
spelling (the polytonic breathings and accents confuse them). In the
theatre every part is a man's voice: on the ancient stage every actor,
whatever the role, was a man.
"""

import argparse
import asyncio
import json
import pathlib
import sys
import unicodedata

try:
    import edge_tts
except ImportError:
    sys.exit("edge-tts is not installed. Run:  pip install edge-tts")

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "ambience" / "voices"
MAN = "el-GR-NestorasNeural"
WOMAN = "el-GR-AthinaNeural"

# key: (voice, rate, pitch, volume, text)
CLIPS: dict[str, tuple[str, str, str, str, str]] = {
    # --- Theatre: the stage -------------------------------------------------
    # Sophocles, Oedipus the King 1-3, 4-5, 6-8 (Oedipus to the suppliants).
    "actor-oedipus-1": (MAN, "-18%", "-6Hz", "+0%",
        "Ὦ τέκνα, Κάδμου τοῦ πάλαι νέα τροφή, τίνας ποθ᾽ ἕδρας τάσδε μοι θοάζετε "
        "ἱκτηρίοις κλάδοισιν ἐξεστεμμένοι;"),
    "actor-oedipus-2": (MAN, "-18%", "-6Hz", "+0%",
        "Πόλις δ᾽ ὁμοῦ μὲν θυμιαμάτων γέμει, ὁμοῦ δὲ παιάνων τε καὶ στεναγμάτων."),
    "actor-oedipus-3": (MAN, "-18%", "-6Hz", "+0%",
        "Ἁγὼ δικαιῶν μὴ παρ᾽ ἀγγέλων, τέκνα, ἄλλων ἀκούειν αὐτὸς ὧδ᾽ ἐλήλυθα, "
        "ὁ πᾶσι κλεινὸς Οἰδίπους καλούμενος."),
    # Aristophanes, Frogs 1-2 (Xanthias) and 3-4 (Dionysus): the comedy opens
    # with a joke about the jokes the audience always laughs at.
    "actor-frogs-1": (MAN, "-4%", "+6Hz", "+0%",
        "Εἴπω τι τῶν εἰωθότων, ὦ δέσποτα, ἐφ᾽ οἷς ἀεὶ γελῶσιν οἱ θεώμενοι;"),
    "actor-frogs-2": (MAN, "-8%", "-2Hz", "+0%",
        "Νὴ τὸν Δί᾽, ὅ τι βούλει γε, πλὴν «πιέζομαι». Τοῦτο δὲ φύλαξαι· πάνυ γάρ ἐστ᾽ ἤδη χολή."),
    # Sophocles, Antigone 332-333: the chorus on man.
    "actor-antigone": (MAN, "-22%", "-10Hz", "+0%",
        "Πολλὰ τὰ δεινὰ κοὐδὲν ἀνθρώπου δεινότερον πέλει."),
    # --- The crowd ------------------------------------------------------------
    "crowd-euge": (MAN, "+12%", "+8Hz", "+20%", "Εὖγε! Εὖγε!"),
    "crowd-nika": (MAN, "+15%", "+4Hz", "+20%", "Νίκα! Νίκα!"),
    "crowd-axios": (MAN, "+10%", "-4Hz", "+20%", "Ἄξιος! Ἄξιος!"),
    "crowd-kalos": (WOMAN, "+12%", "+6Hz", "+20%", "Καλῶς! Καλῶς γε!"),
    "crowd-iou": (WOMAN, "+15%", "+10Hz", "+20%", "Ἰοὺ ἰού!"),
    # --- Hippodrome: the herald -----------------------------------------------
    # "Hear, ye people!" — Aristophanes, Peace 551, Birds 448.
    "herald-akouete": (MAN, "-12%", "-4Hz", "+30%", "Ἀκούετε, λεῴ! Ἀκούετε!"),
    # Pindar, Olympian 1.1-2, for Hieron's victory with the racehorse.
    "herald-pindar": (MAN, "-16%", "-6Hz", "+20%",
        "Ἄριστον μὲν ὕδωρ, ὁ δὲ χρυσὸς αἰθόμενον πῦρ ἅτε διαπρέπει νυκτὶ μεγάνορος ἔξοχα πλούτου."),
    # --- Sanctuaries: hymns ---------------------------------------------------
    # Homeric Hymn 27, to Artemis, 1-2.
    "hymn-artemis": (WOMAN, "-22%", "-4Hz", "+0%",
        "Ἄρτεμιν ἀείδω χρυσηλάκατον, κελαδεινήν, παρθένον αἰδοίην, ἐλαφηβόλον, ἰοχέαιραν."),
    # Homeric Hymn 3, to Apollo, 1-2.
    "hymn-apollo": (MAN, "-22%", "-8Hz", "+0%",
        "Μνήσομαι οὐδὲ λάθωμαι Ἀπόλλωνος ἑκάτοιο, ὅν τε θεοὶ κατὰ δῶμα Διὸς τρομέουσιν ἰόντα."),
    # Homeric Hymn 23, to Zeus, 1-2.
    "hymn-zeus": (MAN, "-22%", "-8Hz", "+0%",
        "Ζῆνα θεῶν τὸν ἄριστον ἀείσομαι ἠδὲ μέγιστον, εὐρύοπα κρείοντα, τελεσφόρον."),
    # Cleanthes, Hymn to Zeus 1-2.
    "hymn-cleanthes": (MAN, "-22%", "-10Hz", "+0%",
        "Κύδιστ᾽ ἀθανάτων, πολυώνυμε, παγκρατὲς αἰεί, Ζεῦ, φύσεως ἀρχηγέ, νόμου μέτα πάντα κυβερνῶν."),
    # --- Agora: vendors (written for this) ------------------------------------
    "vendor-oil": (MAN, "+0%", "+0Hz", "+10%", "Ἔλαιον! Ἔλαιον καλόν!"),
    "vendor-bread": (WOMAN, "+0%", "+0Hz", "+10%", "Ἄρτοι θερμοί! Ἄρτοι!"),
    "vendor-fish": (MAN, "+5%", "-4Hz", "+10%", "Ἰχθύες! Ἰχθύες νεαροί!"),
    "vendor-figs": (WOMAN, "+5%", "+4Hz", "+10%", "Σῦκα! Σῦκα γλυκέα!"),
    "vendor-wine": (MAN, "-5%", "-8Hz", "+10%", "Οἶνος Χῖος! Οἶνος!"),
    # --- A house (written for this) -------------------------------------------
    "house-come": (WOMAN, "-6%", "+0Hz", "+0%", "Ἐλθὲ δεῦρο, ὦ παιδίον."),
    "house-water": (WOMAN, "-6%", "+0Hz", "+0%", "Φέρε τὸ ὕδωρ, ταχέως."),
    # --- Nemrut: Antiochos I's inscription (OGIS 383, opening) ----------------
    "nemrut-antiochos-1": (MAN, "-20%", "-10Hz", "+0%",
        "Βασιλεὺς μέγας Ἀντίοχος, θεὸς δίκαιος ἐπιφανής, φιλορώμαιος καὶ φιλέλλην."),
    "nemrut-antiochos-2": (MAN, "-20%", "-10Hz", "+0%",
        "Ὁ ἐκ βασιλέως Μιθραδάτου Καλλινίκου καὶ βασιλίσσης Λαοδίκης θεᾶς φιλαδέλφου."),
    # --- Halikarnassos: a widow's lament (Artemisia for Mausolus) -------------
    # Homer, Iliad 24.725-726: Andromache's lament over Hector.
    "lament-andromache": (WOMAN, "-28%", "-8Hz", "+0%",
        "Ἆνερ, ἀπ᾽ αἰῶνος νέος ὤλεο, κὰδ δέ με χήρην λείπεις ἐν μεγάροισι."),
}


def monotonic(text: str) -> str:
    """Polytonic to the modern single accent, which the voices read correctly."""
    out = []
    for ch in unicodedata.normalize("NFD", text):
        code = ord(ch)
        if code in (0x0313, 0x0314, 0x0345):  # breathings, iota subscript
            continue
        if code in (0x0300, 0x0342):  # grave, circumflex -> acute
            out.append("́")
            continue
        out.append(ch)
    return unicodedata.normalize("NFC", "".join(out)).replace("᾽", "'").replace("ʼ", "'")


async def record(key: str, spec: tuple[str, str, str, str, str], force: bool) -> bool:
    voice, rate, pitch, volume, text = spec
    target = OUT / f"{key}.mp3"
    if target.exists() and not force:
        return True
    for attempt in range(3):
        try:
            speech = edge_tts.Communicate(monotonic(text), voice, rate=rate, pitch=pitch, volume=volume)
            await speech.save(str(target))
            print(f"  {key}")
            return True
        except Exception as error:  # network hiccups: try again
            print(f"  {key}: {error} (deneme {attempt + 1})")
            await asyncio.sleep(2 + attempt * 3)
    return False


async def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    ok = {}
    for key, spec in CLIPS.items():
        ok[key] = await record(key, spec, args.force)
    manifest = {
        "version": 1,
        "clips": {
            key: {"file": f"{key}.mp3", "text": CLIPS[key][4]}
            for key, done in ok.items()
            if done and (OUT / f"{key}.mp3").exists()
        },
    }
    (OUT / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=1) + "\n", encoding="utf-8"
    )
    missing = [key for key, done in ok.items() if not done]
    print(f"{len(manifest['clips'])} ses kaydedildi." + (f" Eksik: {', '.join(missing)}" if missing else ""))
    if missing:
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
