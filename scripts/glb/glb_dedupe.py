"""Drop duplicate images (same bytes) from a GLB, turn WebP images into PNG (Unity's glTFast
reads no WebP) and repack its binary chunk."""
import json, struct, sys, hashlib
src, dst = sys.argv[1], sys.argv[2]
b = open(src, 'rb').read()
jl = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + jl])
bin0 = b[20 + jl + 8:]
views = j['bufferViews']
def data(v): bv = views[v]; o = bv.get('byteOffset', 0); return bin0[o:o + bv['byteLength']]
import io
from PIL import Image
extra = {}  # image index -> new bytes
for i, im in enumerate(j.get('images', [])):
    if im.get('mimeType') == 'image/webp':
        pic = Image.open(io.BytesIO(data(im['bufferView'])))
        buf = io.BytesIO(); pic.save(buf, 'PNG', optimize=True); extra[i] = buf.getvalue(); im['mimeType'] = 'image/png'
for t in j.get('textures', []):
    e = t.get('extensions', {}).pop('EXT_texture_webp', None)
    if e is not None: t['source'] = e['source']
    if 'extensions' in t and not t['extensions']: del t['extensions']
if 'extensionsUsed' in j: j['extensionsUsed'] = [x for x in j['extensionsUsed'] if x != 'EXT_texture_webp']
if 'extensionsRequired' in j: j['extensionsRequired'] = [x for x in j['extensionsRequired'] if x != 'EXT_texture_webp']
orig_views = [im['bufferView'] for im in j.get('images', [])]
def imgdata(i): return extra.get(i) or data(orig_views[i])
seen, remap = {}, {}
for i, im in enumerate(j.get('images', [])):
    h = hashlib.sha1(imgdata(i)).hexdigest()
    remap[i] = seen.setdefault(h, i)
keep = sorted(set(remap.values())); newidx = {old: k for k, old in enumerate(keep)}
j['images'] = [j['images'][i] for i in keep]
for t in j.get('textures', []):
    if 'source' in t: t['source'] = newidx[remap[t['source']]]
    for e in t.get('extensions', {}).values():
        if 'source' in e: e['source'] = newidx[remap[e['source']]]
# textures with identical (source, sampler) -> one
tk, tremap, textures = {}, {}, []
for i, t in enumerate(j.get('textures', [])):
    key = json.dumps(t, sort_keys=True)
    if key not in tk: tk[key] = len(textures); textures.append(t)
    tremap[i] = tk[key]
j['textures'] = textures
def fix(o):
    if isinstance(o, dict):
        for k, v in o.items():
            if k == 'index' and isinstance(v, int) and 'texCoord' in o or (k == 'index' and isinstance(v, int) and set(o) <= {'index', 'texCoord', 'scale', 'strength', 'extensions'}):
                o[k] = tremap[v]
            else: fix(v)
    elif isinstance(o, list):
        for v in o: fix(v)
fix(j.get('materials', []))
# rebuild buffer with only used views
used = set()
for a in j['accessors']:
    if 'bufferView' in a: used.add(a['bufferView'])

out = bytearray(); vmap = {}; nv = []
for i, bv in enumerate(views):
    if i not in used: continue
    while len(out) % 4: out.append(0)
    d = data(i); nb = dict(bv); nb['byteOffset'] = len(out); out += d
    vmap[i] = len(nv); nv.append(nb)
while len(out) % 4: out.append(0)
j['bufferViews'] = nv
for a in j['accessors']:
    if 'bufferView' in a: a['bufferView'] = vmap[a['bufferView']]
for k, old in enumerate(keep):
    while len(out) % 4: out.append(0)
    d = imgdata(old); nv.append({'buffer': 0, 'byteOffset': len(out), 'byteLength': len(d)}); out += d
    j['images'][k]['bufferView'] = len(nv) - 1
while len(out) % 4: out.append(0)
j['buffers'] = [{'byteLength': len(out)}]
js = json.dumps(j, separators=(',', ':')).encode()
while len(js) % 4: js += b' '
total = 12 + 8 + len(js) + 8 + len(out)
open(dst, 'wb').write(struct.pack('<III', 0x46546C67, 2, total) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(out), 0x004E4942) + out)
print(dst, 'images', len(remap), '->', len(keep), 'textures', len(tremap), '->', len(textures), 'MB', round(total / 1e6, 1))
