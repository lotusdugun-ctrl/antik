"""The country beyond the edge of a site's terrain, for Unity: a ring of land from just
inside the terrain's square out to the horizon, so a site no longer stands on a floating
slab with the haze under its edges.

    python3 glb_skirt.py <final dir> <id>  ->  <final dir>/<id>-skirt.glb

Inside the square the ring runs a little under the terrain (hidden by it); outside it
continues from the height and colour of the terrain's edge, and rises slowly into low
hills with distance (none where the edge is under water: the sea stays flat). Its colour
is the terrain's own (vertex colour x baked light), so it needs no lightmap: Unity draws
it with Antik/BakedLit, light scale 1, the ground detail on.
"""
import glob
import io
import json
import math
import re
import struct
import sys

import numpy as np
from PIL import Image

final, sid = sys.argv[1], sys.argv[2]
NP = {5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
NC = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4}


def load_terrain():
    P, C, U = [], [], []
    for f in sorted(glob.glob(f"{final}/{sid}-baked*.glb")):
        b = open(f, "rb").read()
        jl = struct.unpack("<I", b[12:16])[0]
        j = json.loads(b[20:20 + jl])
        bin0 = b[20 + jl + 8:]

        def read(i):
            a = j["accessors"][i]
            v = j["bufferViews"][a["bufferView"]]
            n, c = a["count"], NC[a["type"]]
            dt = np.dtype(NP[a["componentType"]])
            off = v.get("byteOffset", 0) + a.get("byteOffset", 0)
            st = v.get("byteStride")
            if st and st != dt.itemsize * c:
                raw = np.frombuffer(bin0, np.uint8, count=st * (n - 1) + dt.itemsize * c, offset=off)
                arr = np.lib.stride_tricks.as_strided(raw, (n, dt.itemsize * c), (st, 1)).copy().view(dt).reshape(n, c)
            else:
                arr = np.frombuffer(bin0, dt, count=n * c, offset=off).reshape(n, c)
            arr = arr.astype(np.float64)
            if a.get("normalized"):
                arr /= float(np.iinfo(dt).max)
            return arr

        parent = {}
        for i, n in enumerate(j["nodes"]):
            for c in n.get("children", []):
                parent[c] = i
        for i, n in enumerate(j["nodes"]):
            if "mesh" not in n:
                continue
            p = i
            while p in parent and not j["nodes"][p]["name"].startswith(sid + "-"):
                p = parent[p]
            if re.sub(r"-t\d+$", "", j["nodes"][p]["name"].replace(sid + "-", "")) != "terrain":
                continue
            M = np.eye(4)
            q = i
            while True:
                nd = j["nodes"][q]
                T = np.eye(4)
                if "scale" in nd:
                    T = np.diag(list(nd["scale"]) + [1]) @ T
                if "translation" in nd:
                    T2 = np.eye(4)
                    T2[:3, 3] = nd["translation"]
                    T = T2 @ T
                M = T @ M
                if q in parent:
                    q = parent[q]
                else:
                    break
            for pr in j["meshes"][n["mesh"]]["primitives"]:
                at = pr["attributes"]
                pos = read(at["POSITION"])
                P.append((np.c_[pos, np.ones(len(pos))] @ M.T)[:, :3])
                col = read(at["COLOR_0"])[:, :3] if "COLOR_0" in at else np.ones((len(pos), 3))
                mat = j["materials"][pr["material"]] if "material" in pr else {}
                base = np.array(mat.get("pbrMetallicRoughness", {}).get("baseColorFactor", [1, 1, 1, 1])[:3])
                C.append(col * base)
                U.append(read(at["TEXCOORD_1"]) if "TEXCOORD_1" in at else np.zeros((len(pos), 2)))
    return np.concatenate(P), np.concatenate(C), np.concatenate(U)


P, C, U = load_terrain()
bake = json.load(open(f"{final}/{sid}-bake.json"))
lmfile = bake["maps"].get(f"{sid}-terrain")
if lmfile:
    lm = np.asarray(Image.open(f"{final}/{lmfile}").convert("RGB")).astype(np.float64) / 255.0
    lm = np.where(lm <= 0.04045, lm / 12.92, ((lm + 0.055) / 1.055) ** 2.4)  # sRGB, as Unity reads it
    h, w = lm.shape[:2]
    # uv1 in glTF convention (v down from the top of the image)
    px = np.clip((U[:, 0] * w).astype(int), 0, w - 1)
    py = np.clip((U[:, 1] * h).astype(int), 0, h - 1)
    light = lm[py, px] * 2.0
else:
    light = np.ones_like(C) * 0.8
# the texture of the terrain is near white (0.885): fold it in
LIT = C * light * 0.885

x0, x1 = P[:, 0].min(), P[:, 0].max()
z0, z1 = P[:, 2].min(), P[:, 2].max()
# a height and colour grid over the square (cell ~ the terrain's own spacing)
N = 160
gx = np.clip(((P[:, 0] - x0) / (x1 - x0) * (N - 1)).round().astype(int), 0, N - 1)
gz = np.clip(((P[:, 2] - z0) / (z1 - z0) * (N - 1)).round().astype(int), 0, N - 1)
H = np.full((N, N), np.nan)
CS = np.zeros((N, N, 3))
CN = np.zeros((N, N))
np.fmax.at(H, (gz, gx), P[:, 1])
np.add.at(CS, (gz, gx), LIT)
np.add.at(CN, (gz, gx), 1)
# fill holes from neighbours
for _ in range(8):
    m = np.isnan(H)
    if not m.any():
        break
    Hp = np.pad(H, 1, constant_values=np.nan)
    nb = np.stack([Hp[:-2, 1:-1], Hp[2:, 1:-1], Hp[1:-1, :-2], Hp[1:-1, 2:]])
    H[m] = np.nanmean(nb, 0)[m]
H = np.nan_to_num(H, nan=np.nanmedian(H))
COL = np.where(CN[..., None] > 0, CS / np.maximum(CN, 1)[..., None], np.nan)
landcells = (H > 0.3) & (CN > 0)
far_col = np.median(COL[landcells], 0) if landcells.sum() > 20 else np.nanmedian(COL.reshape(-1, 3), 0)
COL = np.where(np.isnan(COL), far_col, COL)


def sample(x, z):
    fx = np.clip((x - x0) / (x1 - x0) * (N - 1), 0, N - 1)
    fz = np.clip((z - z0) / (z1 - z0) * (N - 1), 0, N - 1)
    ix, iz = np.floor(fx).astype(int), np.floor(fz).astype(int)
    ix1, iz1 = np.minimum(ix + 1, N - 1), np.minimum(iz + 1, N - 1)
    tx, tz = fx - ix, fz - iz
    def bil(A):
        a = A[iz, ix] * (1 - tx)[..., None] if A.ndim == 3 else A[iz, ix] * (1 - tx)
        b = A[iz, ix1] * tx[..., None] if A.ndim == 3 else A[iz, ix1] * tx
        c = A[iz1, ix] * (1 - tx)[..., None] if A.ndim == 3 else A[iz1, ix] * (1 - tx)
        d = A[iz1, ix1] * tx[..., None] if A.ndim == 3 else A[iz1, ix1] * tx
        if A.ndim == 3:
            return (a + b) * (1 - tz)[..., None] + (c + d) * tz[..., None]
        return (a + b) * (1 - tz) + (c + d) * tz
    return bil(H), bil(COL)


def vnoise(x, z, seed):
    """smooth value noise, a few octaves"""
    total = np.zeros_like(x)
    amp, freq = 1.0, 1 / 420.0
    for o in range(4):
        X, Z = x * freq + seed * 17.1, z * freq + seed * 31.7
        xi, zi = np.floor(X), np.floor(Z)
        xf, zf = X - xi, Z - zi
        def h(a, b):
            v = np.sin(a * 127.1 + b * 311.7 + seed) * 43758.5453
            return v - np.floor(v)
        u, w = xf * xf * (3 - 2 * xf), zf * zf * (3 - 2 * zf)
        n = (h(xi, zi) * (1 - u) + h(xi + 1, zi) * u) * (1 - w) + (h(xi, zi + 1) * (1 - u) + h(xi + 1, zi + 1) * u) * w
        total += (n - 0.5) * 2 * amp
        amp *= 0.5
        freq *= 2.1
    return total


cx, cz = (x0 + x1) / 2, (z0 + z1) / 2
half = min(x1 - x0, z1 - z0) / 2
r_in = half * 0.8
R_OUT = 4200.0
SEG = 128
radii = list(np.linspace(r_in, half * 1.45, 18))
r = radii[-1]
while r < R_OUT:
    r *= 1.14
    radii.append(min(r, R_OUT))
radii = np.array(radii)
th = np.linspace(0, 2 * math.pi, SEG, endpoint=False)
TH, RR = np.meshgrid(th, radii)
X = cx + np.cos(TH) * RR
Z = cz + np.sin(TH) * RR
# the nearest point of the square, and how far beyond it this one lies
Xc, Zc = np.clip(X, x0 + 1, x1 - 1), np.clip(Z, z0 + 1, z1 - 1)
beyond = np.hypot(X - Xc, Z - Zc)
hy, col = sample(Xc, Zc)
inside = beyond < 1e-6
Y = np.where(inside, hy - 0.8, hy)
# hills out in the country: none over the sea, rising over the first kilometre
land = np.clip((hy - 0.3) / 2.0, 0, 1)
rise = np.clip(beyond / 900.0, 0, 1) ** 1.6
seed = sum(map(ord, sid)) % 97
hills = (vnoise(X, Z, seed) * 0.5 + 0.55) * 70.0
Y = Y + land * rise * np.maximum(hills, 0) - (1 - land) * 0.0
# just beyond the edge, ease from the terrain's own slope into the country
Y = np.where(inside, Y, Y - np.clip(0.6 - beyond / 3.0, 0, 0.6))
# colour: the edge's colour, drifting into the country's average, darker and greener on hills
mix = np.clip(beyond / 1200.0, 0, 1)[..., None]
col = col * (1 - mix) + far_col * mix
shade = 1.0 - 0.12 * np.clip(rise * land, 0, 1)
col = col * shade[..., None]

R, S = len(radii), SEG
pos = np.stack([X, Y, Z], -1).reshape(-1, 3).astype(np.float32)
cols = np.c_[col.reshape(-1, 3), np.ones(R * S)].astype(np.float32)
idx = []
for i in range(R - 1):
    for k in range(S):
        a, b = i * S + k, i * S + (k + 1) % S
        c, d = a + S, b + S
        idx += [a, c, b, b, c, d]
idx = np.array(idx, dtype=np.uint32)
t0 = idx.reshape(-1, 3)
fy = np.cross(pos[t0[:, 1]] - pos[t0[:, 0]], pos[t0[:, 2]] - pos[t0[:, 0]])[:, 1]
if (fy < 0).sum() > len(fy) / 2:  # wind the triangles so they face up
    idx = t0[:, [0, 2, 1]].reshape(-1).astype(np.uint32)
# normals from the faces
nrm = np.zeros_like(pos, dtype=np.float64)
tri = idx.reshape(-1, 3)
fn = np.cross(pos[tri[:, 1]] - pos[tri[:, 0]], pos[tri[:, 2]] - pos[tri[:, 0]])
for k in range(3):
    np.add.at(nrm, tri[:, k], fn)
nrm /= np.maximum(np.linalg.norm(nrm, axis=1, keepdims=True), 1e-9)
nrm[nrm[:, 1] < 0] *= -1
nrm = nrm.astype(np.float32)

blob = bytearray()
views, accs = [], []


def add(arr, target, typ, ctype, minmax=False):
    while len(blob) % 4:
        blob.append(0)
    views.append({"buffer": 0, "byteOffset": len(blob), "byteLength": arr.nbytes, "target": target})
    blob.extend(arr.tobytes())
    a = {"bufferView": len(views) - 1, "componentType": ctype, "count": int(arr.shape[0]), "type": typ}
    if minmax:
        a["min"], a["max"] = arr.min(0).tolist(), arr.max(0).tolist()
    accs.append(a)
    return len(accs) - 1


ap = add(pos, 34962, "VEC3", 5126, True)
an = add(nrm, 34962, "VEC3", 5126)
ac = add(cols, 34962, "VEC4", 5126)
ai = add(idx.reshape(-1, 1), 34963, "SCALAR", 5125)
gltf = {
    "asset": {"version": "2.0", "generator": "antik glb_skirt.py"},
    "scene": 0,
    "scenes": [{"nodes": [0]}],
    "nodes": [{"name": f"{sid}-skirt", "mesh": 0}],
    "meshes": [{"name": f"{sid}-skirt", "primitives": [{"attributes": {"POSITION": ap, "NORMAL": an, "COLOR_0": ac}, "indices": ai, "material": 0}]}],
    "materials": [{"name": "antik-skirt", "pbrMetallicRoughness": {"baseColorFactor": [1, 1, 1, 1], "metallicFactor": 0, "roughnessFactor": 1}}],
    "accessors": accs,
    "bufferViews": views,
    "buffers": [{"byteLength": len(blob)}],
}
while len(blob) % 4:
    blob.append(0)
js = json.dumps(gltf, separators=(",", ":")).encode()
js += b" " * ((4 - len(js) % 4) % 4)
out = struct.pack("<III", 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(blob))
out += struct.pack("<II", len(js), 0x4E4F534A) + js + struct.pack("<II", len(blob), 0x004E4942) + bytes(blob)
open(f"{final}/{sid}-skirt.glb", "wb").write(out)
print(sid, "skirt", len(pos), "verts", len(tri), "tris", round(len(out) / 1e6, 2), "MB", "edge", round(float(np.median(hy[~inside])), 1), "col", far_col.round(3).tolist())
