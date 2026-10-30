"""Re-encode opaque PNG images in a GLB as JPEG (quality 90) to save space."""
import json, struct, sys, io
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
b = open(src, 'rb').read(); jl = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + jl]); bin0 = b[20 + jl + 8:]
views = j['bufferViews']
def data(v): bv = views[v]; o = bv.get('byteOffset', 0); return bin0[o:o + bv['byteLength']]
newimg = {}
for i, im in enumerate(j.get('images', [])):
    d = data(im['bufferView']); pic = Image.open(io.BytesIO(d))
    if im.get('mimeType') == 'image/png' and (pic.mode in ('RGB', 'L') or (pic.mode == 'RGBA' and pic.getchannel('A').getextrema()[0] == 255)):
        buf = io.BytesIO(); pic.convert('RGB').save(buf, 'JPEG', quality=90); newimg[i] = buf.getvalue(); im['mimeType'] = 'image/jpeg'
out = bytearray(); nv = []; vmap = {}
imgviews = {im['bufferView']: i for i, im in enumerate(j.get('images', []))}
for i, bv in enumerate(views):
    while len(out) % 4: out.append(0)
    d = newimg.get(imgviews.get(i, -1)) or data(i)
    nb = dict(bv); nb['byteOffset'] = len(out); nb['byteLength'] = len(d); nb.pop('byteStride', None) if i in imgviews else None
    if 'byteStride' in bv and i not in imgviews: nb['byteStride'] = bv['byteStride']
    out += d; nv.append(nb)
while len(out) % 4: out.append(0)
j['bufferViews'] = nv; j['buffers'] = [{'byteLength': len(out)}]
js = json.dumps(j, separators=(',', ':')).encode()
while len(js) % 4: js += b' '
total = 28 + len(js) + len(out)
open(dst, 'wb').write(struct.pack('<III', 0x46546C67, 2, total) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(out), 0x004E4942) + out)
print(dst, 'jpeg', len(newimg), 'of', len(j.get('images', [])), 'MB', round(total / 1e6, 1))
