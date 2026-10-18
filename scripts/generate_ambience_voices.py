"""
Record the voices heard in the 3D models' soundscapes: an actor on the stage,
the herald and the crowd at the races, hymns at the altars, vendors in the
agora. Recorded on the owner's computer with an open-source Piper voice for
Greek (el_GR), and only if that voice passes the licence gate in
piper_voices.py (its dataset licence must allow commercial redistribution).

    pip install "piper-tts>=1.3,<2" lameenc
    python scripts/generate_ambience_voices.py            (only missing clips)
    python scripts/generate_ambience_voices.py --force    (all of them again)

Writes public/ambience/voices/<key>.mp3 and public/ambience/voices/manifest.json
(with "engine": "piper"; the app plays no other). Any file there that this
voice did not make is deleted first. If no Greek voice passes the gate the
folder is emptied and the models play their soundscapes without voices, as
they always could. Run it from SESLENDIR.bat or ORTAM-SESLERI.bat.

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

The voice speaks Modern Greek, so it reads the ancient text with modern
pronunciation, and it is given the text in the modern single-accent
spelling (the polytonic breathings and accents confuse it).
"""

import argparse
import json
import pathlib
import sys
import unicodedata

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import piper_voices  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "ambience" / "voices"

# key: (length scale: >1 slower, <1 faster; text)
CLIPS: dict[str, tuple[float, str]] = {
    # --- Theatre: the stage -------------------------------------------------
    # Sophocles, Oedipus the King 1-3, 4-5, 6-8 (Oedipus to the suppliants).
    "actor-oedipus-1": (1.22, "Ὦ τέκνα, Κάδμου τοῦ πάλαι νέα τροφή, τίνας ποθ᾽ ἕδρας τάσδε μοι θοάζετε "
        "ἱκτηρίοις κλάδοισιν ἐξεστεμμένοι;"),
    "actor-oedipus-2": (1.22, "Πόλις δ᾽ ὁμοῦ μὲν θυμιαμάτων γέμει, ὁμοῦ δὲ παιάνων τε καὶ στεναγμάτων."),
    "actor-oedipus-3": (1.22, "Ἁγὼ δικαιῶν μὴ παρ᾽ ἀγγέλων, τέκνα, ἄλλων ἀκούειν αὐτὸς ὧδ᾽ ἐλήλυθα, "
        "ὁ πᾶσι κλεινὸς Οἰδίπους καλούμενος."),
    # Aristophanes, Frogs 1-2 (Xanthias) and 3-4 (Dionysus): the comedy opens
    # with a joke about the jokes the audience always laughs at.
    "actor-frogs-1": (1.04, "Εἴπω τι τῶν εἰωθότων, ὦ δέσποτα, ἐφ᾽ οἷς ἀεὶ γελῶσιν οἱ θεώμενοι;"),
    "actor-frogs-2": (1.09, "Νὴ τὸν Δί᾽, ὅ τι βούλει γε, πλὴν «πιέζομαι». Τοῦτο δὲ φύλαξαι· πάνυ γάρ ἐστ᾽ ἤδη χολή."),
    # Sophocles, Antigone 332-333: the chorus on man.
    "actor-antigone": (1.28, "Πολλὰ τὰ δεινὰ κοὐδὲν ἀνθρώπου δεινότερον πέλει."),
    # --- The crowd ------------------------------------------------------------
    "crowd-euge": (0.89, "Εὖγε! Εὖγε!"),
    "crowd-nika": (0.87, "Νίκα! Νίκα!"),
    "crowd-axios": (0.91, "Ἄξιος! Ἄξιος!"),
    "crowd-kalos": (0.89, "Καλῶς! Καλῶς γε!"),
    "crowd-iou": (0.87, "Ἰοὺ ἰού!"),
    # --- Hippodrome: the herald -----------------------------------------------
    # "Hear, ye people!" — Aristophanes, Peace 551, Birds 448.
    "herald-akouete": (1.14, "Ἀκούετε, λεῴ! Ἀκούετε!"),
    # Pindar, Olympian 1.1-2, for Hieron's victory with the racehorse.
    "herald-pindar": (1.19, "Ἄριστον μὲν ὕδωρ, ὁ δὲ χρυσὸς αἰθόμενον πῦρ ἅτε διαπρέπει νυκτὶ μεγάνορος ἔξοχα πλούτου."),
    # --- Sanctuaries: hymns ---------------------------------------------------
    # Homeric Hymn 27, to Artemis, 1-2.
    "hymn-artemis": (1.28, "Ἄρτεμιν ἀείδω χρυσηλάκατον, κελαδεινήν, παρθένον αἰδοίην, ἐλαφηβόλον, ἰοχέαιραν."),
    # Homeric Hymn 3, to Apollo, 1-2.
    "hymn-apollo": (1.28, "Μνήσομαι οὐδὲ λάθωμαι Ἀπόλλωνος ἑκάτοιο, ὅν τε θεοὶ κατὰ δῶμα Διὸς τρομέουσιν ἰόντα."),
    # Homeric Hymn 23, to Zeus, 1-2.
    "hymn-zeus": (1.28, "Ζῆνα θεῶν τὸν ἄριστον ἀείσομαι ἠδὲ μέγιστον, εὐρύοπα κρείοντα, τελεσφόρον."),
    # Cleanthes, Hymn to Zeus 1-2.
    "hymn-cleanthes": (1.28, "Κύδιστ᾽ ἀθανάτων, πολυώνυμε, παγκρατὲς αἰεί, Ζεῦ, φύσεως ἀρχηγέ, νόμου μέτα πάντα κυβερνῶν."),
    # --- Agora: vendors (written for this) ------------------------------------
    "vendor-oil": (1.0, "Ἔλαιον! Ἔλαιον καλόν!"),
    "vendor-bread": (1.0, "Ἄρτοι θερμοί! Ἄρτοι!"),
    "vendor-fish": (0.95, "Ἰχθύες! Ἰχθύες νεαροί!"),
    "vendor-figs": (0.95, "Σῦκα! Σῦκα γλυκέα!"),
    "vendor-wine": (1.05, "Οἶνος Χῖος! Οἶνος!"),
    # --- A house (written for this) -------------------------------------------
    "house-come": (1.06, "Ἐλθὲ δεῦρο, ὦ παιδίον."),
    "house-water": (1.06, "Φέρε τὸ ὕδωρ, ταχέως."),
    # --- Nemrut: Antiochos I's inscription (OGIS 383, opening) ----------------
    "nemrut-antiochos-1": (1.25, "Βασιλεὺς μέγας Ἀντίοχος, θεὸς δίκαιος ἐπιφανής, φιλορώμαιος καὶ φιλέλλην."),
    "nemrut-antiochos-2": (1.25, "Ὁ ἐκ βασιλέως Μιθραδάτου Καλλινίκου καὶ βασιλίσσης Λαοδίκης θεᾶς φιλαδέλφου."),
    # --- Halikarnassos: a widow's lament (Artemisia for Mausolus) -------------
    # Homer, Iliad 24.725-726: Andromache's lament over Hector.
    "lament-andromache": (1.39, "Ἆνερ, ἀπ᾽ αἰῶνος νέος ὤλεο, κὰδ δέ με χήρην λείπεις ἐν μεγάροισι."),
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



def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    chosen = piper_voices.choose(["el"])
    piper_voices.write_credits(chosen, ["el"])
    manifest_path = OUT / "manifest.json"
    old = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {}
    voice = chosen.get("el")
    same_voice = voice and old.get("engine") == "piper" and old.get("voice") == voice["id"]
    # Whatever another engine (or another voice) made goes.
    if OUT.exists():
        for f in OUT.glob("*.mp3"):
            if not same_voice or args.force or f.stem not in CLIPS:
                f.unlink()
    if not voice:
        manifest_path.unlink(missing_ok=True)
        if OUT.exists() and not any(OUT.iterdir()):
            OUT.rmdir()
        print("Yunanca icin lisansi uygun ses yok: modeller ortam sesini konusmasiz calar.")
        return
    OUT.mkdir(parents=True, exist_ok=True)
    model, config = piper_voices.download(voice)
    speaker = piper_voices.Speaker(model, config)
    failed = []
    for key, (scale, text) in CLIPS.items():
        target = OUT / f"{key}.mp3"
        if target.exists() and target.stat().st_size > 0:
            continue
        try:
            data = speaker.mp3(monotonic(text), length_scale=scale, kbps=40)
            if not data:
                raise RuntimeError("empty")
            target.write_bytes(data)
            print(f"  {key}")
        except Exception as error:
            failed.append(key)
            print(f"  {key}: {error}")
    manifest = {
        "version": 2,
        "engine": "piper",
        "voice": voice["id"],
        "license": voice["license"],
        "clips": {
            key: {"file": f"{key}.mp3", "text": CLIPS[key][1]}
            for key in CLIPS
            if (OUT / f"{key}.mp3").exists()
        },
    }
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{len(manifest['clips'])} ses kaydedildi ({voice['id']}, {voice['license']})."
          + (f" Eksik: {', '.join(failed)}" if failed else ""))
    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
