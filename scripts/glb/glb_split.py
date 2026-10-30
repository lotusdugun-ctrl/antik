"""Split a (tiled, uncompressed) GLB into several files, each small enough to carry and
to import without any extra decoder: the whole tiles of one file's nodes go to one file,
filled up to a size limit. Every file keeps the parent nodes' names ("<id>-near"), so
Unity's AntikSetup still knows which lightmap each tile uses.

    python3 glb_split.py in.glb out_prefix [limit MB = 30]
    -> out_prefix.glb, out_prefix-2.glb, out_prefix-3.glb, ...

Images, textures and materials are copied into every file (gltfpack drops the unused ones).
"""
import json, struct, sys

src, prefix = sys.argv[1], sys.argv[2]
limit = float(sys.argv[3]) * 1e6 if len(sys.argv) > 3 else 30e6

b = open(src, "rb").read()
jl = struct.unpack("<I", b[12:16])[0]
j = json.loads(b[20:20 + jl])
bin0 = b[20 + jl + 8:]
views, acc, nodes, meshes = j["bufferViews"], j["accessors"], j["nodes"], j["meshes"]


def mesh_views(mi):
    out = set()
    for p in meshes[mi]["primitives"]:
        for a in list(p["attributes"].values()) + ([p["indices"]] if "indices" in p else []):
            out.add(acc[a]["bufferView"])
    return out


image_views = {im["bufferView"] for im in j.get("images", []) if "bufferView" in im}
image_bytes = sum(views[v]["byteLength"] for v in image_views)

# the pieces to share out: each child tile of a parent node, or a whole node with a mesh
roots = j["scenes"][j.get("scene", 0)]["nodes"]
pieces = []  # (root index, node index or None for the root's own mesh, bytes)
for r in roots:
    node = nodes[r]
    if "mesh" in node:
        pieces.append((r, r, sum(views[v]["byteLength"] for v in mesh_views(node["mesh"]))))
    for c in node.get("children", []):
        if "mesh" in nodes[c]:
            pieces.append((r, c, sum(views[v]["byteLength"] for v in mesh_views(nodes[c]["mesh"]))))

budget = limit - image_bytes
buckets, cur, size = [], [], 0
for piece in pieces:
    if cur and size + piece[2] > budget:
        buckets.append(cur)
        cur, size = [], 0
    cur.append(piece)
    size += piece[2]
if cur:
    buckets.append(cur)


def write(bucket, path):
    out = bytearray()
    view_map, acc_map, mesh_map = {}, {}, {}
    new_views, new_acc, new_meshes, new_nodes = [], [], [], []

    def copy_view(v):
        if v not in view_map:
            while len(out) % 4:
                out.append(0)
            bv = dict(views[v])
            o = bv.get("byteOffset", 0)
            data = bin0[o:o + bv["byteLength"]]
            bv["byteOffset"] = len(out)
            bv["buffer"] = 0
            out.extend(data)
            new_views.append(bv)
            view_map[v] = len(new_views) - 1
        return view_map[v]

    def copy_acc(a):
        if a not in acc_map:
            na = dict(acc[a])
            na["bufferView"] = copy_view(acc[a]["bufferView"])
            new_acc.append(na)
            acc_map[a] = len(new_acc) - 1
        return acc_map[a]

    def copy_mesh(mi):
        if mi not in mesh_map:
            m = dict(meshes[mi])
            prims = []
            for p in m["primitives"]:
                q = dict(p)
                q["attributes"] = {k: copy_acc(v) for k, v in p["attributes"].items()}
                if "indices" in p:
                    q["indices"] = copy_acc(p["indices"])
                prims.append(q)
            m["primitives"] = prims
            new_meshes.append(m)
            mesh_map[mi] = len(new_meshes) - 1
        return mesh_map[mi]

    images = []
    for im in j.get("images", []):
        im2 = dict(im)
        if "bufferView" in im:
            im2["bufferView"] = copy_view(im["bufferView"])
        images.append(im2)

    root_new = {}
    scene_nodes = []
    for r, n, _ in bucket:
        if r not in root_new:
            rn = {k: v for k, v in nodes[r].items() if k not in ("mesh", "children")}
            new_nodes.append(rn)
            root_new[r] = len(new_nodes) - 1
            scene_nodes.append(root_new[r])
        rn = new_nodes[root_new[r]]
        if n == r:
            rn["mesh"] = copy_mesh(nodes[r]["mesh"])
        else:
            cn = {k: v for k, v in nodes[n].items() if k not in ("mesh", "children")}
            cn["mesh"] = copy_mesh(nodes[n]["mesh"])
            new_nodes.append(cn)
            rn.setdefault("children", []).append(len(new_nodes) - 1)

    k = dict(j)
    k.update(nodes=new_nodes, meshes=new_meshes, accessors=new_acc, bufferViews=new_views,
             images=images, scenes=[{"nodes": scene_nodes}], scene=0, buffers=[{"byteLength": len(out)}])
    if not images:
        k.pop("images")
    while len(out) % 4:
        out.append(0)
    js = json.dumps(k, separators=(",", ":")).encode()
    js += b" " * ((4 - len(js) % 4) % 4)
    glb = struct.pack("<III", 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(out))
    glb += struct.pack("<II", len(js), 0x4E4F534A) + js + struct.pack("<II", len(out), 0x004E4942) + bytes(out)
    open(path, "wb").write(glb)
    return len(glb)


for i, bucket in enumerate(buckets):
    path = f"{prefix}.glb" if i == 0 else f"{prefix}-{i + 1}.glb"
    print(path, round(write(bucket, path) / 1e6, 1), "MB", len(bucket), "pieces")
