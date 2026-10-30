"""Baked GLBs from before antik_bake.py's keep_uvs: where a primitive has three texture
coordinate sets, the third is the lightmap; move it to the second slot (drop the stray
set). Primitives with two sets on parts without a lightmap (detail) lose the second."""
import json, struct, sys
src, dst = sys.argv[1], sys.argv[2]
b = open(src, 'rb').read(); n = struct.unpack('<I', b[12:16])[0]
j = json.loads(b[20:20 + n]); rest = b[20 + n:]
for nd in j['nodes']:
    if 'mesh' not in nd: continue
    part = (nd.get('name') or '').rsplit('-', 1)[-1]
    for p in j['meshes'][nd['mesh']]['primitives']:
        a = p['attributes']
        if 'TEXCOORD_2' in a:
            a['TEXCOORD_1'] = a.pop('TEXCOORD_2')
        elif part in ('detail', 'flora') and 'TEXCOORD_1' in a:
            del a['TEXCOORD_1']
js = json.dumps(j, separators=(',', ':')).encode()
while len(js) % 4: js += b' '
total = 12 + 8 + len(js) + len(rest)
open(dst, 'wb').write(struct.pack('<III', 0x46546C67, 2, total) + struct.pack('<II', len(js), 0x4E4F534A) + js + rest)
print(dst)
