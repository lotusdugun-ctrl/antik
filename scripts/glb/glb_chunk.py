"""Cut the big meshes of a baked GLB into square tiles of the ground plan, so the engine
can leave out what the camera does not see (frustum culling) and pick a lighter level of
detail for what is far away. Nothing is moved, merged or simplified: every triangle keeps
its vertices, both UV sets and its colour, and lands in the tile its centre falls in.

    python3 glb_chunk.py in.glb out.glb [tile metres = 16] [parts = near,detail,flora]

Each cut node keeps its name ("<id>-near") and gets one child per tile ("<id>-near-t3"),
so Unity's AntikSetup still finds which lightmap a piece uses from its parent's name.
Input: an uncompressed GLB (float attributes), as antik_bake.py + glb_dedupe/jpeg write.
"""
import json, struct, sys
import numpy as np

src, dst = sys.argv[1], sys.argv[2]
tile = float(sys.argv[3]) if len(sys.argv) > 3 else 16.0
parts = (sys.argv[4] if len(sys.argv) > 4 else "near,detail,flora").split(",")
# a tile with fewer triangles than this goes into a tile four times as wide
min_tris = int(sys.argv[5]) if len(sys.argv) > 5 else 6000

b = open(src, "rb").read()
jl = struct.unpack("<I", b[12:16])[0]
j = json.loads(b[20:20 + jl])
bin0 = b[20 + jl + 8:]
acc, views = j["accessors"], j["bufferViews"]
NP = {5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
NC = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4}


def read(i):
    a = acc[i]
    v = views[a["bufferView"]]
    n, c = a["count"], NC[a["type"]]
    dt = np.dtype(NP[a["componentType"]])
    off = v.get("byteOffset", 0) + a.get("byteOffset", 0)
    stride = v.get("byteStride")
    if stride and stride != dt.itemsize * c:
        raw = np.frombuffer(bin0, np.uint8, count=stride * (n - 1) + dt.itemsize * c, offset=off)
        rows = np.lib.stride_tricks.as_strided(raw, (n, dt.itemsize * c), (stride, 1))
        return np.ascontiguousarray(rows).view(dt).reshape(n, c)
    return np.frombuffer(bin0, dt, count=n * c, offset=off).reshape(n, c)


out = bytearray()
new_views, new_acc = [], []


def put(arr, target=None):
    while len(out) % 4:
        out.append(0)
    arr = np.ascontiguousarray(arr)
    bv = {"buffer": 0, "byteOffset": len(out), "byteLength": arr.nbytes}
    if target:
        bv["target"] = target
    out.extend(arr.tobytes())
    new_views.append(bv)
    return len(new_views) - 1


def accessor(arr, template, target, minmax=False):
    view = put(arr, target)
    a = {"bufferView": view, "componentType": template["componentType"], "count": int(arr.shape[0]), "type": template["type"]}
    if template.get("normalized"):
        a["normalized"] = True
    if minmax:
        a["min"] = arr.min(axis=0).tolist()
        a["max"] = arr.max(axis=0).tolist()
    new_acc.append(a)
    return len(new_acc) - 1


# images (and anything else in a buffer view that is not geometry) are carried over as-is
image_view = {}
for im in j.get("images", []):
    if "bufferView" in im:
        v = views[im["bufferView"]]
        o = v.get("byteOffset", 0)
        im["bufferView"] = image_view.setdefault(im["bufferView"], put(np.frombuffer(bin0, np.uint8, v["byteLength"], o)))

# The web's skyline: flat-topped drums of earth ringed round the site ("the ridges on the
# skyline" in reconstruction-parts.ts setting()). Unity's sky draws its own hazy mountains,
# and seen from the app's higher camera the drums read as discs, so they are left out:
# primitives in the earth colour (#a9977a) lying wholly far out.
EARTH = np.array([0.397, 0.309, 0.195])


def earth(p):
    mat = j["materials"][p["material"]] if "material" in p else {}
    c = mat.get("pbrMetallicRoughness", {}).get("baseColorFactor")
    return bool(c) and np.abs(np.array(c[:3]) - EARTH).max() <= 0.02


def is_ridge(p, attrs):
    if not earth(p):
        return False
    pos = attrs["POSITION"]
    return bool(np.hypot(pos[:, 0], pos[:, 2]).min() > 60)


def drop_drums(p, attrs, idx):
    """An earth primitive can hold the drums together with earth that belongs (a theatre's
    bank): split it into its connected pieces and leave out the drums, the pieces that lie
    away from the middle and sink below the ground (they are set 6 m deep)."""
    if not earth(p):
        return idx, 0
    tri = idx.reshape(-1, 3)
    n = attrs["POSITION"].shape[0]
    parent = np.arange(n)

    def find(a):
        while parent[a] != a:
            parent[a] = parent[parent[a]]
            a = parent[a]
        return a
    # weld by position first (pieces may not share indices at seams)
    pos = attrs["POSITION"]
    key = np.round(pos * 100).astype(np.int64)
    _, first = np.unique(key, axis=0, return_inverse=True)
    first = first.reshape(-1)
    rep = {}
    for v, k in enumerate(first):
        if k in rep:
            ra, rb = find(v), find(rep[k])
            if ra != rb:
                parent[ra] = rb
        else:
            rep[k] = v
    for a, b, c in tri:
        ra, rb, rc = find(a), find(b), find(c)
        if ra != rb:
            parent[ra] = rb
        rc = find(c)
        rb = find(b)
        if rc != rb:
            parent[rc] = rb
    roots = np.array([find(v) for v in range(n)])
    comp = roots[tri[:, 0]]
    keep = np.ones(len(tri), bool)
    dropped = 0
    for c in np.unique(comp):
        sel = comp == c
        vs = np.unique(tri[sel])
        P = pos[vs]
        if np.hypot(P[:, 0], P[:, 2]).min() > 20 and P[:, 1].min() < -1.0:
            keep[sel] = False
            dropped += 1
    return tri[keep].reshape(-1), dropped


dropped_ridges = 0
new_meshes, new_nodes = [], []
node_map = {}
total_tiles = 0
for ni, node in enumerate(j["nodes"]):
    nn = {k: v for k, v in node.items() if k not in ("mesh", "children")}
    node_map[ni] = len(new_nodes)
    new_nodes.append(nn)
for ni, node in enumerate(j["nodes"]):
    nn = new_nodes[node_map[ni]]
    if "children" in node:
        nn["children"] = [node_map[c] for c in node["children"]]
    if "mesh" not in node:
        continue
    mesh = j["meshes"][node["mesh"]]
    name = node.get("name", "")
    cut = any(name.endswith("-" + p) for p in parts) and not any(k in node for k in ("matrix", "rotation", "scale", "translation"))
    prims = []
    for p in mesh["primitives"]:
        attrs = {k: read(v) for k, v in p["attributes"].items()}
        idx = read(p["indices"]).reshape(-1) if "indices" in p else np.arange(attrs["POSITION"].shape[0])
        if is_ridge(p, attrs):
            dropped_ridges += 1
            continue
        idx, nd = drop_drums(p, attrs, idx.astype(np.int64))
        dropped_ridges += nd
        if idx.size == 0:
            continue
        prims.append((p, attrs, idx.astype(np.int64)))
    if not prims:
        continue
    if not cut:
        newp = []
        for p, attrs, idx in prims:
            q = {k: v for k, v in p.items() if k not in ("attributes", "indices")}
            q["attributes"] = {k: accessor(v, acc[p["attributes"][k]], 34962, k == "POSITION") for k, v in attrs.items()}
            it = idx.astype(np.uint32 if idx.max() > 65535 else np.uint16)
            q["indices"] = accessor(it.reshape(-1, 1), {"componentType": 5125 if it.dtype == np.uint32 else 5123, "type": "SCALAR"}, 34963)
            newp.append(q)
        new_meshes.append({"name": mesh.get("name", ""), "primitives": newp})
        nn["mesh"] = len(new_meshes) - 1
        continue
    # which tile each triangle's centre falls in
    # Fine tiles where the triangles are dense (the building), and tiles four times as
    # wide where they are sparse (trees scattered over the country), so the far country
    # does not turn into hundreds of tiny pieces, each one more draw call.
    keyof = lambda c, size, tag: (np.floor(c[:, 0] / size).astype(np.int64) * 100003 + np.floor(c[:, 2] / size).astype(np.int64)) * 4 + tag
    cents = []
    for p, attrs, idx in prims:
        cents.append(attrs["POSITION"][idx.reshape(-1, 3)].mean(axis=1))
    fine_all = np.concatenate([keyof(c, tile, 0) for c in cents])
    uk, counts = np.unique(fine_all, return_counts=True)
    dense = set(uk[counts >= min_tris].tolist())
    tiles = {}
    for pi, c in enumerate(cents):
        fine = keyof(c, tile, 0)
        coarse = keyof(c, tile * 4, 1)
        key = np.where(np.isin(fine, list(dense)), fine, coarse)
        for k in np.unique(key):
            tiles.setdefault(int(k), []).append((pi, np.nonzero(key == k)[0]))
    children = []
    # the trees' wood goes into a mesh of its own in each tile, so Unity can leave it
    # out when the tile is small on screen (the leaves hide it from afar: AntikSetup LOD)
    def is_bark(pi):
        p = prims[pi][0]
        return name.endswith("-flora") and "material" in p and j["materials"][p["material"]].get("name", "").startswith("antik-bark")
    split = []
    for k, members in sorted(tiles.items()):
        bark = [m for m in members if is_bark(m[0])]
        rest = [m for m in members if not is_bark(m[0])]
        if bark and rest:
            split += [(k, rest), (k, bark)]
        else:
            split.append((k, members))
    tile_no = {}
    for k, members in split:
        t = tile_no.setdefault(k, len(tile_no))
        newp = []
        for pi, tris in members:
            p, attrs, idx = prims[pi]
            sel = idx.reshape(-1, 3)[tris].reshape(-1)
            used, remap = np.unique(sel, return_inverse=True)
            q = {k2: v for k2, v in p.items() if k2 not in ("attributes", "indices")}
            q["attributes"] = {a: accessor(v[used], acc[p["attributes"][a]], 34962, a == "POSITION") for a, v in attrs.items()}
            it = remap.astype(np.uint32 if used.shape[0] > 65535 else np.uint16)
            q["indices"] = accessor(it.reshape(-1, 1), {"componentType": 5125 if it.dtype == np.uint32 else 5123, "type": "SCALAR"}, 34963)
            newp.append(q)
        new_meshes.append({"name": f"{name}-t{t}", "primitives": newp})
        new_nodes.append({"name": f"{name}-t{t}", "mesh": len(new_meshes) - 1})
        children.append(len(new_nodes) - 1)
    nn["children"] = nn.get("children", []) + children
    total_tiles += len(children)

j["nodes"], j["meshes"], j["accessors"], j["bufferViews"] = new_nodes, new_meshes, new_acc, new_views
j["buffers"] = [{"byteLength": len(out)}]
while len(out) % 4:
    out.append(0)
js = json.dumps(j, separators=(",", ":")).encode()
js += b" " * ((4 - len(js) % 4) % 4)
glb = struct.pack("<III", 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(out))
glb += struct.pack("<II", len(js), 0x4E4F534A) + js + struct.pack("<II", len(out), 0x004E4942) + bytes(out)
open(dst, "wb").write(glb)
print(dst, "ridges dropped", dropped_ridges, "tiles", total_tiles, "MB", round(len(glb) / 1e6, 1))
