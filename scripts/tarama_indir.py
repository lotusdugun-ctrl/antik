"""
Yapı taramalarını (fotogrametri) scans-raw/ klasörüne indirir; heykel_indir.py'nin
Sketchfab indiricisini kullanır (aynı lisans kapısı: yalnız CC BY / CC0, NC-ND-SA yok).

Celsus: "Library of Celsus - Crowdsourced photogrammetry", Miguel Bandera, CC BY
(200 kamuya açık fotoğraftan), ~1,1 milyon yüz, 1 doku. Yedek: iedu360.eu, CC BY.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import heykel_indir as H  # noqa: E402

YAPILAR = [
    ("celsus-cephe-tarama", "1cc6ad6af508422398f60f902cb70e88"),  # CC BY, Miguel Bandera
    ("celsus-iedu360", "75456d194b6b420f86cf2898fd909b41"),  # CC BY, iedu360.eu (yedek)
]

if __name__ == "__main__":
    H.OUT.mkdir(exist_ok=True)
    token = os.environ.get("SKETCHFAB_TOKEN", "").strip()
    if not token and H.TOKEN_FILE.exists():
        token = H.TOKEN_FILE.read_text(encoding="utf-8").strip()
    if not token:
        print("Sketchfab anahtari yok (scripts\\.sketchfab-token).")
        sys.exit(1)
    bad = 0
    for name, uid in YAPILAR:
        try:
            print(f"{name:24} {H.sketchfab(name, uid, token)}", flush=True)
        except Exception as error:  # noqa: BLE001
            bad += 1
            print(f"{name:24} HATA {error}", flush=True)
    sys.exit(1 if bad else 0)
