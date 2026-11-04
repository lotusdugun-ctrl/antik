#!/usr/bin/env bash
# Pişmiş bir yeri (antik_bake.py çıktısı) web uygulamasına hazırlar: public/baked/<id>/
#   bash scripts/glb/web_pack.sh <bake_out_dir> <id> [skirt.glb]
# Adımlar: aynı resimleri tekle (glb_dedupe) → JPEG (glb_jpeg) → gltfpack meshopt sıkıştırma
# (-cc; uygulama MeshoptDecoder ile açar) → ışık haritaları JPEG (kalite 90) → bake.json güncel.
set -euo pipefail
src="$1"; id="$2"; skirt="${3:-}"
here="$(cd "$(dirname "$0")" && pwd)"
app="$(cd "$here/../.." && pwd)"
dst="$app/public/baked/$id"
tmp="$(mktemp -d)"
mkdir -p "$dst"
# Büyük yerler Unity için birden çok dosyaya bölünmüştü (<id>-baked.glb, -baked-2.glb, ...): web'de tek dosya
# olur (dokular bir kez iner). Sıra: birleştir (gltf-transform merge) → aynı dokuları tekle → JPEG → gltfpack.
parts=()
for f in "$src/$id-baked.glb" "$src/$id"-baked-[0-9]*.glb; do
  [ -f "$f" ] || continue
  [ "$(stat -c %s "$f")" -gt 1000 ] || continue   # boş yer tutucular (silinemeyen eski karolar)
  parts+=("$f")
done
if [ "${#parts[@]}" -gt 1 ]; then
  gltf-transform merge "${parts[@]}" "$tmp/m.glb" --merge-scenes >/dev/null
  gltf-transform dedup "$tmp/m.glb" "$tmp/m2.glb" >/dev/null
else
  cp "${parts[0]}" "$tmp/m2.glb"
fi
python3 "$here/glb_dedupe.py" "$tmp/m2.glb" "$tmp/d.glb"
python3 "$here/glb_jpeg.py" "$tmp/d.glb" "$tmp/j.glb"
gltfpack -i "$tmp/j.glb" -o "$dst/$id-baked.glb" -kn -km -ke -kv -vp 16 -vtf -vpf -cc
files=("$id-baked.glb")
python3 - "$src" "$id" "$dst" "${files[@]}" <<'EOF'
import json, os, sys
from PIL import Image
src, id_, dst = sys.argv[1:4]
files = sys.argv[4:]
meta = json.load(open(os.path.join(src, f"{id_}-bake.json")))
maps = {}
for part, png in meta["maps"].items():
    if not png:
        maps[part] = None
        continue
    jpg = png[:-4] + ".jpg"
    Image.open(os.path.join(src, png)).convert("RGB").save(os.path.join(dst, jpg), quality=90)
    maps[part] = jpg
meta["maps"] = maps
meta["files"] = files
json.dump(meta, open(os.path.join(dst, f"{id_}-bake.json"), "w"), indent=1)
EOF
[ -z "$skirt" ] && [ -f "$src/$id-skirt.glb" ] && skirt="$src/$id-skirt.glb"
if [ -n "$skirt" ]; then cp "$skirt" "$dst/$id-skirt.glb"; chmod 644 "$dst/$id-skirt.glb"; fi
rm -r "$tmp"
du -sh "$dst"
