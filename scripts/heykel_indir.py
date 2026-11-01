"""
Download new, freely licensed statue scans to scans-raw/ (not committed), so
they can be prepared for the app (decimated, centred, turned to GLB) and
credited. Run it from HEYKEL-INDIR.bat.

Only scans whose ORIGINALS stand in museums outside Italy, the Vatican,
Greece and Turkey are taken: those countries require permission to reproduce
the works in their state collections commercially, whatever the scan's own
licence says.

- SMK (Statens Museum for Kunst, Royal Cast Collection, Copenhagen): public
  domain (Public Domain Mark 1.0), direct STL files from api.smk.dk.
- Musée Saint-Raymond, Toulouse: CC0 1.0, on Sketchfab.
- British Museum / Fitzwilliam scans by Daniel Pett, Thomas Flynn: CC BY 4.0,
  on Sketchfab.

Sketchfab only hands out downloads to a signed-in account: the script asks
once for a Sketchfab API token (sketchfab.com > Settings > Password & API)
and keeps it in scripts/.sketchfab-token (never committed).
"""

from __future__ import annotations

import json
import os
import pathlib
import sys
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "scans-raw"
TOKEN_FILE = ROOT / "scripts" / ".sketchfab-token"

# id, SMK object number — original's museum in the comment.
SMK = [
    ("herakles-lansdowne", "KAS224"),  # Getty Villa, Malibu
    ("apollo-lykeios", "KAS1026"),  # Louvre
    ("athena-dresden", "KAS518"),  # Albertinum, Dresden
    ("aphrodite-urania", "KAS863"),  # Staatliche Museen, Berlin
    ("demeter-knidos", "KAS128"),  # British Museum (from Knidos)
    ("antoninus-toga", "KAS596"),  # British Museum (from Kyrene)
    ("severus-toga", "KAS683"),  # British Museum
    ("venus-milo", "KAS434"),  # Louvre
    ("borghese-warrior", "KAS499"),  # Louvre
    ("alexander-rondanini", "KAS538"),  # Glyptothek, Munich
    ("pergamon-athena-group", "KAS19/8"),  # Pergamonmuseum, Berlin
    ("pergamon-dionysos", "KAS19/3"),  # Pergamonmuseum, Berlin
]

# id, Sketchfab uid — licence and original's museum in the comment.
SKETCHFAB = [
    ("athena-fitzwilliam", "95a8422dc20348539503dc7b68d72aa7"),  # CC BY, Fitzwilliam
    ("apollo-sauroktonos", "deafe99bfce248e5b44e7c65702353ff"),  # CC BY, Fitzwilliam
    ("nereid-xanthos", "60b6a535d320404b8e9e68916592cfa0"),  # CC BY, British Museum
    ("nereid-frieze", "f0fb2f20ca364b8d94c003d60dcaa559"),  # CC BY, British Museum
    ("lion-knidos", "6519f5e1d79047c48c7447ef06276e0d"),  # CC BY, British Museum
    ("lion-attic", "2ce964f3f7214c718e6f554dec5f991d"),  # CC BY, Metropolitan Museum
    ("augustus-oak", "6ccc01ad1cda47f3b2511ef6fbf07e0b"),  # CC0, Saint-Raymond
    ("trajan-bust", "e7e240f95b4348e0af42289a67b23633"),  # CC0, Saint-Raymond
    ("marcus-aurelius-bust", "a7e0a77f81f74c80b15ba64164e14c03"),  # CC0, Saint-Raymond
    ("severus-bust", "b6509b567aad4e99b6c555ff7302a852"),  # CC0, Saint-Raymond
]


def get(url: str, headers: dict | None = None, timeout: int = 120) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": "antik-scans/1.0", **(headers or {})})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return response.read()


def download(url: str, target: pathlib.Path, headers: dict | None = None) -> None:
    request = urllib.request.Request(url, headers={"User-Agent": "antik-scans/1.0", **(headers or {})})
    part = target.with_suffix(target.suffix + ".part")
    with urllib.request.urlopen(request, timeout=1800) as response, open(part, "wb") as out:
        while True:
            chunk = response.read(1 << 20)
            if not chunk:
                break
            out.write(chunk)
    part.replace(target)


def strings(value, out: list[str]) -> list[str]:
    if isinstance(value, str):
        out.append(value)
    elif isinstance(value, dict):
        for v in value.values():
            strings(v, out)
    elif isinstance(value, list):
        for v in value:
            strings(v, out)
    return out


def whole_stl(path: pathlib.Path) -> bool:
    """A binary STL is 84 bytes of header and count, then 50 bytes a triangle."""
    if not path.exists():
        return False
    size = path.stat().st_size
    with open(path, "rb") as f:
        head = f.read(84)
    if len(head) < 84:
        return False
    count = int.from_bytes(head[80:84], "little")
    return size == 84 + 50 * count or head.startswith(b"solid") and size > 1000


def smk(name: str, number: str) -> str:
    target = OUT / f"{name}.stl"
    if whole_stl(target):
        return "var"
    query = urllib.parse.quote(number, safe="")
    data = json.loads(get(f"https://api.smk.dk/api/v1/art/?object_number={query}&lang=en"))
    items = data.get("items") or []
    if not items:
        return "kayit bulunamadi"
    item = items[0]
    if not item.get("public_domain"):
        return "kamu mali degil, atlandi"
    urls = [s for s in strings(item, []) if s.lower().split("?")[0].endswith(".stl")]
    if not urls:
        return "STL yok"
    small = [u for u in urls if "small" in u.lower()]
    # The connection sometimes drops halfway: check the file, and try again.
    for _ in range(4):
        download((small or urls)[0], target)
        if whole_stl(target):
            break
    else:
        return "eksik indi, sonra yeniden deneyin"
    (OUT / f"{name}.json").write_text(json.dumps(item, ensure_ascii=False, indent=1), encoding="utf-8")
    return f"{target.stat().st_size // (1 << 20)} MB"


def sketchfab(name: str, uid: str, token: str) -> str:
    for ext in (".glb", ".zip"):
        if (OUT / f"{name}{ext}").exists():
            return "var"
    info = json.loads(get(f"https://api.sketchfab.com/v3/models/{uid}"))
    licence = (info.get("license") or {}).get("label", "")
    if not any(ok in licence for ok in ("CC Attribution", "CC0", "Public Domain")) or any(
        bad in licence for bad in ("NonCommercial", "NoDerivs", "ShareAlike")
    ):
        return f"lisans uygun degil ({licence}), atlandi"
    (OUT / f"{name}.json").write_text(json.dumps(info, ensure_ascii=False, indent=1), encoding="utf-8")
    links = json.loads(get(f"https://api.sketchfab.com/v3/models/{uid}/download",
                           {"Authorization": f"Token {token}"}))
    if "glb" in links:
        download(links["glb"]["url"], OUT / f"{name}.glb")
        return f"{(OUT / f'{name}.glb').stat().st_size // (1 << 20)} MB glb"
    if "gltf" in links:
        download(links["gltf"]["url"], OUT / f"{name}.zip")
        return f"{(OUT / f'{name}.zip').stat().st_size // (1 << 20)} MB gltf"
    return "indirme baglantisi yok"


def main() -> None:
    OUT.mkdir(exist_ok=True)
    token = os.environ.get("SKETCHFAB_TOKEN", "").strip()
    if not token and TOKEN_FILE.exists():
        token = TOKEN_FILE.read_text(encoding="utf-8").strip()
    failed = 0
    for name, number in SMK:
        try:
            print(f"SMK {number:9} {name:24} {smk(name, number)}", flush=True)
        except Exception as error:
            failed += 1
            print(f"SMK {number:9} {name:24} HATA {error}", flush=True)
    if not token:
        print("\nSketchfab anahtari yok: Sketchfab modelleri atlandi.")
    else:
        for name, uid in SKETCHFAB:
            try:
                print(f"Sketchfab {name:24} {sketchfab(name, uid, token)}", flush=True)
            except Exception as error:
                failed += 1
                print(f"Sketchfab {name:24} HATA {error}", flush=True)
    print(f"\nDosyalar: {OUT}")
    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
