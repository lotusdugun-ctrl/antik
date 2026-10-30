"""
Antik Türkiye: bake the light of a model into lightmaps with Blender (Cycles).

    blender -b -P antik_bake.py -- <building.glb> <landscape.glb> <out_dir> [preset] [size] [samples]

preset: day | golden (default golden). size: lightmap side in pixels (default 2048).
samples: Cycles samples per pixel (default 128; the GPU makes this fast).

What comes out, in <out_dir>:
  <name>-baked.glb       the model with a second UV set (TEXCOORD_1) for its lightmaps
  <name>-near-<preset>.png    light on the building and everything close to it
  <name>-ground-<preset>.png  light on the large ground around it
  <name>-bake.json       which mesh uses which lightmap, and the scale to decode it

The lightmaps hold the light that reaches each surface (sun, sky, shadows,
bounce, contact darkening) without the surface's own colour, stored as half
the light in sRGB PNG: the shader shows   colour = texture(uv0) x lightmap(uv1) x 2.
So the stone textures keep their full detail and the light costs one texture
read: no real-time lights or shadow maps for the buildings on the phone.
"""
import json
import math
import os
import sys

import bpy
import bmesh
from bpy_extras import bmesh_utils

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import antik_trees  # noqa: E402  (generated trees and bushes, next to this file)

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
building_path, landscape_path, out_dir = argv[0], argv[1], argv[2]
preset = argv[3] if len(argv) > 3 else "golden"
size = int(argv[4]) if len(argv) > 4 else 2048
samples = int(argv[5]) if len(argv) > 5 else 128
name = os.path.basename(building_path).replace("-building.glb", "")
os.makedirs(out_dir, exist_ok=True)

PRESETS = {
    # sun elevation and azimuth in degrees, sun colour and strength, sky colour and strength
    "day": dict(elev=55, azim=-140, sun=(1.0, 0.96, 0.9), sun_w=4.5, sky=(0.55, 0.68, 0.9), sky_w=1.0),
    "golden": dict(elev=16, azim=-140, sun=(1.0, 0.72, 0.45), sun_w=4.0, sky=(0.45, 0.55, 0.75), sky_w=1.0),
}
P = PRESETS[preset]

# Interior fill: rooms the low sun cannot reach (Blender coordinates, z up, metres).
# A soft area light under the top of the walls, pointing down, plus warm points spread
# through the room so the walls get light too. Tuned with probes (golden): Celsus hall
# floor 0.3 -> 0.7 (plaza 0.77), walls 0.07 -> 0.2; outside unchanged.
FILL = {
    "celsus-kutuphanesi": dict(
        area=dict(at=(0.0, -8.4, 8.2), size=(16.0, 12.0), w=130.0),
        points=[(-4.0, -5.0, 6.5), (4.0, -5.0, 6.5), (-4.0, -11.5, 6.5), (4.0, -11.5, 6.5)],
        point_w=250.0, color=(1.0, 0.86, 0.7)),
}

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene


def import_glb(path):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    return [o for o in bpy.data.objects if o not in before]


def world_size(obj):
    corners = [obj.matrix_world @ v.co for v in obj.data.vertices] if obj.data.vertices else []
    if not corners:
        return 0.0
    xs = [c.x for c in corners]; ys = [c.y for c in corners]
    return max(max(xs) - min(xs), max(ys) - min(ys))


def join(objs, label):
    objs = [o for o in objs if o.type == "MESH"]
    if not objs:
        return None
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.make_single_user(object=True, obdata=True)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    if len(objs) > 1:
        bpy.ops.object.join()
    o = bpy.context.view_layer.objects.active
    o.name = label
    return o


def lift_coplanar(obj, gap=0.004):
    """Faces lying on top of another face in the same plane (a pilaster's front on the
    wall behind it, a plaque on a wall, doubled pieces) z-fight on screen, and in the
    bake each one's light rays start inside the other: they come out black. Lift the
    smaller of each such pair off the surface by a few millimetres."""
    import bmesh
    from mathutils import Vector
    me = obj.data
    bm = bmesh.new(); bm.from_mesh(me); bm.faces.ensure_lookup_table()
    groups = {}
    info = []
    for f in bm.faces:
        n = f.normal
        if n.length < 0.5:
            info.append(None); continue
        c = f.calc_center_median()
        key = (round(n.x * 40), round(n.y * 40), round(n.z * 40), round(n.dot(c) / 0.003))
        groups.setdefault(key, []).append(f.index)
        info.append((n.copy(), f.calc_area()))
    lift = set()
    pairs = 0
    for key, idx in groups.items():
        if len(idx) < 2:
            continue
        n = info[idx[0]][0]
        a = n.orthogonal().normalized(); b = n.cross(a)
        polys = []
        for i in idx:
            pts = [(v.co.dot(a), v.co.dot(b)) for v in bm.faces[i].verts]
            xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
            polys.append((min(xs), max(xs), min(ys), max(ys), pts, i))
        polys.sort()
        for j, P in enumerate(polys):
            for Q in polys[j + 1:]:
                if Q[0] > P[1] - 0.002:
                    break
                if Q[2] > P[3] - 0.002 or P[2] > Q[3] - 0.002:
                    continue
                if overlap(P[4], Q[4], 0.002):
                    pairs += 1
                    i, k = P[5], Q[5]
                    ai, ak = info[i][1], info[k][1]
                    lift.add(i if (ai < ak or (ai == ak and i > k)) else k)
    if lift:
        faces = [bm.faces[i] for i in lift]
        res = bmesh.ops.split(bm, geom=faces)
        faces = [g for g in res["geom"] if isinstance(g, bmesh.types.BMFace)]
        push = {}
        for f in faces:
            for v in f.verts:
                push.setdefault(v, Vector()); push[v] += f.normal
        for v, d in push.items():
            if d.length > 1e-6:
                v.co += d.normalized() * gap
        bm.to_mesh(me)
    bm.free()
    print(f"[antik] {obj.name}: {pairs} overlapping coplanar pairs, {len(lift)} faces lifted")


def overlap(P, Q, eps):
    """Two convex polygons (2D) overlap by more than eps (separating axis test)."""
    for poly in (P, Q):
        m = len(poly)
        for k in range(m):
            x0, y0 = poly[k]; x1, y1 = poly[(k + 1) % m]
            ax, ay = y0 - y1, x1 - x0
            L = (ax * ax + ay * ay) ** 0.5
            if L < 1e-9:
                continue
            ax /= L; ay /= L
            p = [x * ax + y * ay for x, y in P]; q = [x * ax + y * ay for x, y in Q]
            if min(max(p), max(q)) - max(min(p), min(q)) < eps:
                return False
    return True


building = [o for o in import_glb(building_path) if o.type == "MESH"]
landscape = [o for o in import_glb(landscape_path) if o.type == "MESH"] if os.path.exists(landscape_path) else []

# Realise instanced trees and rocks so they cast shadows (they are not baked themselves).
bpy.ops.object.select_all(action="DESELECT")
for o in landscape:
    o.select_set(True)
if landscape:
    bpy.context.view_layer.objects.active = landscape[0]
    try:
        bpy.ops.object.duplicates_make_real()
    except RuntimeError:
        pass

# The building file carries the large paving and terrain around it: give that its own,
# coarser lightmap so the building keeps its texel density. Split by faces: whatever
# lies inside the footprint of the tall geometry (plus a margin) is "near".
# Pieces without a vertex colour would get black ones when joined to pieces that
# have them: give them plain white first (white = "no tint").
for o in building:
    if not len(o.data.color_attributes):
        col = o.data.color_attributes.new("Color", "BYTE_COLOR", "CORNER")
        col.data.foreach_set("color", [1.0] * (4 * len(o.data.loops)))
whole = join(building, f"{name}-all")
lift_coplanar(whole)
zs = sorted(v.co.z for v in whole.data.vertices)
ground_z = zs[len(zs) // 2]
tall = [v.co for v in whole.data.vertices if v.co.z > ground_z + 2.5]
if tall:
    pad = 15.0
    x0, x1 = min(c.x for c in tall) - pad, max(c.x for c in tall) + pad
    y0, y1 = min(c.y for c in tall) - pad, max(c.y for c in tall) + pad
else:
    x0 = y0 = -40.0; x1 = y1 = 40.0
bpy.ops.object.select_all(action="DESELECT")
whole.select_set(True)
bpy.context.view_layer.objects.active = whole
bpy.ops.object.mode_set(mode="EDIT")
bm = bmesh.from_edit_mesh(whole.data)
inside = 0
for f in bm.faces:
    c = f.calc_center_median()
    f.select = x0 <= c.x <= x1 and y0 <= c.y <= y1
    inside += f.select
bmesh.update_edit_mesh(whole.data)
near_obj, ground_obj = whole, None
if 0 < inside < len(bm.faces):
    bpy.ops.mesh.separate(type="SELECTED")
    bpy.ops.object.mode_set(mode="OBJECT")
    parts = [o for o in bpy.context.selected_objects if o.type == "MESH"]
    near_obj = next(o for o in parts if o != whole)
    ground_obj = whole
else:
    bpy.ops.object.mode_set(mode="OBJECT")
near_obj.name = f"{name}-near"
if ground_obj:
    ground_obj.name = f"{name}-ground"
print("[antik] near faces", len(near_obj.data.polygons), "ground faces", len(ground_obj.data.polygons) if ground_obj else 0)

meta = {"model": name, "preset": preset, "scale": 2.0, "maps": {}}
targets = [o for o in (near_obj, ground_obj) if o]
sides = {near_obj: size}
if ground_obj:
    sides[ground_obj] = max(512, size // 2)


def dense_parts(bm, texel_area):
    """Faces of connected pieces whose triangles are mostly smaller than a texel or so
    (scans: tens of thousands of tiny triangles)."""
    bm.faces.ensure_lookup_table()
    seen = bytearray(len(bm.faces))
    out = set()
    for f0 in bm.faces:
        if seen[f0.index]:
            continue
        seen[f0.index] = 1
        stack = [f0]; part = []
        while stack:
            f = stack.pop(); part.append(f)
            for e in f.edges:
                for g in e.link_faces:
                    if not seen[g.index]:
                        seen[g.index] = 1; stack.append(g)
        if len(part) < 400:
            continue
        areas = sorted(f.calc_area() for f in part)
        total = sum(areas) or 1.0
        big = sum(a for a in areas if a > 4.0 * texel_area)
        # mostly tiny triangles, and no large flat surface (a wall) that needs the atlas
        if areas[len(areas) // 2] < 2.0 * texel_area and big < 0.2 * total:
            out.update(f.index for f in part)
    return out


def select_only(o):
    if bpy.context.object and bpy.context.object.mode != "OBJECT":
        bpy.ops.object.mode_set(mode="OBJECT")
    bpy.ops.object.select_all(action="DESELECT")
    o.select_set(True)
    bpy.context.view_layer.objects.active = o


# Lightmap UVs. Small pieces (carving, statues, ornaments: tens of thousands of
# tiny UV islands) would each need their own padded patch in the atlas and starve
# the walls of texels, so they get their light per vertex instead (baked into the
# vertex colour); only surfaces large enough to hold a few texels go in the atlas.
detail_parts = []
scene.tool_settings.use_uv_select_sync = True
for o in targets:
    side = sides[o]
    uv = o.data.uv_layers.new(name="lightmap")
    o.data.uv_layers.active = uv
    select_only(o)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    # The web exporter writes every triangle with its own corners; weld them so
    # walls and terrain unwrap as whole pieces instead of loose triangles.
    # (Normals and texture coordinates live on the corners and are kept.)
    bpy.ops.mesh.remove_doubles(threshold=0.0005, use_sharp_edge_from_normals=True)
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.0, area_weight=0.0,
                             correct_aspect=True, scale_to_bounds=False)
    bm = bmesh.from_edit_mesh(o.data)
    lay = bm.loops.layers.uv["lightmap"]
    islands = bmesh_utils.bmesh_linked_uv_islands(bm, lay)
    total = sum(f.calc_area() for f in bm.faces)
    # an island smaller than about 4 x 4 texels at this atlas' density is "detail"
    texel_area = total / (0.6 * side * side)
    small = set()
    for faces in islands:
        if sum(f.calc_area() for f in faces) < 16.0 * texel_area:
            small.update(f.index for f in faces)
    # Scanned statues and other dense pieces go to the vertex light whole: split by
    # island size, some of their triangles would land in the atlas and the rest in
    # the vertex colour, and the two never agree (bright and dark shards on a statue).
    dense = dense_parts(bm, texel_area)
    small |= dense
    print(f"[antik] {o.name}: {len(dense)} faces in dense pieces (scans) lit per vertex")
    for f in bm.faces:
        f.select = f.index in small
    bmesh.update_edit_mesh(o.data)
    print(f"[antik] {o.name}: {len(islands)} islands, {len(small)} of {len(bm.faces)} faces lit per vertex")
    if 0 < len(small) < len(bm.faces):
        before = set(bpy.data.objects)
        bpy.ops.mesh.separate(type="SELECTED")
        detail_parts += [x for x in bpy.data.objects if x not in before]
    elif len(small) == len(bm.faces):
        bpy.ops.object.mode_set(mode="OBJECT")
        detail_parts.append(o)
        continue
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.select_all(action="SELECT")
    bpy.ops.uv.average_islands_scale()
    pad = 4.0 / side
    try:
        bpy.ops.uv.pack_islands(margin_method="FRACTION", margin=pad, rotate=True, shape_method="CONCAVE")
    except TypeError:
        bpy.ops.uv.pack_islands(margin=pad, rotate=True)
    bpy.ops.object.mode_set(mode="OBJECT")

targets = [o for o in targets if o not in detail_parts]

# The terrain is a regular height grid: a top-down projection is a perfect lightmap
# layout (every texel used), and it catches the shadows of the building and trees.
terrain = max(landscape, key=lambda o: len(o.data.vertices)) if landscape else None
if terrain is not None and len(terrain.data.vertices) > 1000:
    terrain = join([terrain], f"{name}-terrain")
    me = terrain.data
    xs = [v.co.x for v in me.vertices]; ys = [v.co.y for v in me.vertices]
    x0t, y0t = min(xs), min(ys)
    span = max(max(xs) - x0t, max(ys) - y0t) or 1.0
    uv = me.uv_layers.new(name="lightmap")
    for loop in me.loops:
        co = me.vertices[loop.vertex_index].co
        uv.data[loop.index].uv = (0.004 + 0.992 * (co.x - x0t) / span, 0.004 + 0.992 * (co.y - y0t) / span)
    targets.append(terrain)
    sides[terrain] = max(512, size // 2)
    meta["terrain"] = terrain.name


def instance_colours(path):
    """EXT_mesh_gpu_instancing _COLOR_0 (tree and rock tints): Blender's importer
    drops it, so read it from the file. Returns [(blender position, rgb)]."""
    import struct
    with open(path, "rb") as f:
        data = f.read()
    jlen = struct.unpack_from("<I", data, 12)[0]
    doc = json.loads(data[20:20 + jlen])
    off = 20 + jlen
    blen = struct.unpack_from("<I", data, off)[0]
    binc = data[off + 8:off + 8 + blen]
    comps = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4}
    fmt = {5126: ("f", 4, 1.0), 5121: ("B", 1, 255.0), 5123: ("H", 2, 65535.0)}

    def read(i):
        a = doc["accessors"][i]
        bv = doc["bufferViews"][a["bufferView"]]
        c, (ch, sz, norm) = comps[a["type"]], fmt[a["componentType"]]
        stride = bv.get("byteStride", c * sz)
        base = bv.get("byteOffset", 0) + a.get("byteOffset", 0)
        out = []
        for k in range(a["count"]):
            vals = struct.unpack_from("<" + ch * c, binc, base + k * stride)
            out.append([v / norm for v in vals] if a["componentType"] != 5126 else list(vals))
        return out

    res = []
    for node in doc.get("nodes", []):
        ext = node.get("extensions", {}).get("EXT_mesh_gpu_instancing")
        if not ext or "_COLOR_0" not in ext["attributes"]:
            continue
        pos = read(ext["attributes"]["TRANSLATION"])
        col = read(ext["attributes"]["_COLOR_0"])
        for p, c in zip(pos, col):
            res.append(((p[0], -p[2], p[1]), c[:3]))
    return res


def flora_sways(o):
    """Rocks stay still: their material is a plain greyish brown (trees, bushes and
    trunks are vertex-coloured white materials or a saturated bark brown)."""
    for slot in o.material_slots:
        m = slot.material
        if not (m and m.node_tree):
            continue
        b = next((x for x in m.node_tree.nodes if x.type == "BSDF_PRINCIPLED"), None)
        if b is None or b.inputs["Base Color"].is_linked:
            continue
        c = b.inputs["Base Color"].default_value[:3]
        if max(c) - min(c) < 0.12 and 0.2 < max(c) < 0.9:
            return 0.0
    return 1.0


# Trees, bushes and rocks: tint them with their instance colour and bake their
# light per vertex too, so the phone draws them as one static mesh, unlit.
flora_obj = None
flora = [o for o in landscape if o.name in bpy.data.objects and o != terrain and o.type == "MESH"]
plants = []
if flora:
    tints = instance_colours(landscape_path) if os.path.exists(landscape_path) else []
    # the web's lumpy trees and bushes -> generated ones (rocks stay)
    if "--web-trees" not in sys.argv:
        flora, plants = antik_trees.replace_flora(flora, name, tints, out_dir)
        meta["plants"] = len(plants)
    for o in flora:
        bpy.ops.object.select_all(action="DESELECT")
        o.select_set(True)
        bpy.context.view_layer.objects.active = o
        bpy.ops.object.make_single_user(object=True, obdata=True)
        me = o.data
        n = len(me.loops)
        if len(me.color_attributes):
            ca = me.color_attributes[me.color_attributes.render_color_index]
            vals = [1.0] * (4 * (n if ca.domain == "CORNER" else len(me.vertices)))
            ca.data.foreach_get("color", vals)
            if ca.domain != "CORNER":
                vi = [0] * n; me.loops.foreach_get("vertex_index", vi)
                vals = [x for v in vi for x in vals[4 * v:4 * v + 4]]
            me.color_attributes.remove(ca)
        else:
            vals = [1.0] * (4 * n)
        tint = (1.0, 1.0, 1.0)
        if tints:
            w = o.matrix_world.translation
            best = min(tints, key=lambda t: (t[0][0] - w.x) ** 2 + (t[0][1] - w.y) ** 2 + (t[0][2] - w.z) ** 2)
            if (best[0][0] - w.x) ** 2 + (best[0][1] - w.y) ** 2 + (best[0][2] - w.z) ** 2 < 0.01:
                tint = best[1]
        for i in range(n):
            for k in range(3):
                vals[4 * i + k] *= tint[k]
        col = me.color_attributes.new("Color", "BYTE_COLOR", "CORNER")
        col.data.foreach_set("color", vals)
        me.color_attributes.active_color = col
        me.color_attributes.render_color_index = me.color_attributes.find("Color")
        # Wind: the height of each corner above the foot of its piece (0 for rocks), in the
        # second texture-coordinate set ("wind": height, flutter), as on the generated
        # plants, whose first set holds their leaf and bark textures: Antik/BakedLit
        # (_WindUV = 1) sways by it.
        sway = flora_sways(o)
        mw = o.matrix_world
        zs_w = [(mw @ v.co).z for v in me.vertices]
        foot = min(zs_w) if zs_w else 0.0
        while len(me.uv_layers):
            me.uv_layers.remove(me.uv_layers[0])
        me.uv_layers.new(name="UVMap")
        wl = me.uv_layers.new(name="wind")
        vi = [0] * n; me.loops.foreach_get("vertex_index", vi)
        wl.data.foreach_set("uv", [x for v in vi for x in ((zs_w[v] - foot) * sway, 0.0)])
    # a generated plant first: the joined mesh keeps its layer order (UVMap, wind)
    flora_obj = join(plants + flora, f"{name}-flora")
    print(f"[antik] flora: {len(flora)} pieces + {len(plants)} plants, {len(tints)} tints")

detail_obj = None
if detail_parts:
    bpy.ops.object.select_all(action="DESELECT")
    for o in detail_parts:
        o.select_set(True)
    bpy.context.view_layer.objects.active = detail_parts[0]
    if len(detail_parts) > 1:
        bpy.ops.object.join()
    detail_obj = bpy.context.view_layer.objects.active
    detail_obj.name = f"{name}-detail"
    if "lightmap" in detail_obj.data.uv_layers:
        detail_obj.data.uv_layers.remove(detail_obj.data.uv_layers["lightmap"])

# Light: a sun and a sky colour.
sun_data = bpy.data.lights.new("sun", "SUN")
sun_data.color = P["sun"]
sun_data.energy = P["sun_w"]
sun_data.angle = math.radians(1.2)
sun = bpy.data.objects.new("sun", sun_data)
scene.collection.objects.link(sun)
elev, azim = math.radians(P["elev"]), math.radians(P["azim"])
sun.rotation_euler = (math.pi / 2 - elev, 0.0, azim)

world = bpy.data.worlds.new("sky")
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes["Background"]
bg.inputs[0].default_value = (*P["sky"], 1.0)
bg.inputs[1].default_value = P["sky_w"]

fill = FILL.get(name)
if fill:
    k = 1.0 if preset == "golden" else 0.5  # the high sun lights rooms on its own
    a = fill.get("area")
    if a:
        ld = bpy.data.lights.new("fill-area", "AREA")
        ld.shape = "RECTANGLE"; ld.size, ld.size_y = a["size"]
        ld.energy = a["w"] * k; ld.color = fill["color"]
        lo = bpy.data.objects.new("fill-area", ld)
        scene.collection.objects.link(lo)
        lo.location = a["at"]  # an area light points down (-z) by default
    for i, p in enumerate(fill.get("points", [])):
        ld = bpy.data.lights.new(f"fill-{i}", "POINT")
        ld.energy = fill["point_w"] * k; ld.shadow_soft_size = 1.5; ld.color = fill["color"]
        lo = bpy.data.objects.new(f"fill-{i}", ld)
        scene.collection.objects.link(lo)
        lo.location = p
    meta["fill"] = True
    print("[antik] interior fill:", name)

scene.render.engine = "CYCLES"
cy = scene.cycles
cy.samples = samples
cy.max_bounces = 3
cy.diffuse_bounces = 2
cy.glossy_bounces = 0
cy.transmission_bounces = 0
cy.use_denoising = False
try:
    prefs = bpy.context.preferences.addons["cycles"].preferences
    for kind in ("OPTIX", "CUDA", "HIP", "ONEAPI", "METAL"):
        try:
            prefs.compute_device_type = kind
            prefs.get_devices()
            if any(d.type == kind for d in prefs.devices):
                for d in prefs.devices:
                    d.use = True
                cy.device = "GPU"
                print("[antik] GPU:", kind)
                break
        except TypeError:
            continue
except Exception as e:  # no GPU: CPU works, slower
    print("[antik] CPU bake:", e)

scene.render.bake.use_pass_direct = True
scene.render.bake.use_pass_indirect = True
scene.render.bake.use_pass_color = False


def denoise(img):
    """OpenImageDenoise through the compositor, in a scene of its own (Blender 5 API)."""
    w, h = img.size
    tmp = os.path.join(out_dir, f".{img.name}-dn.exr")
    try:
        ds = bpy.data.scenes.new("antik-denoise")
        tree = bpy.data.node_groups.new("antik-denoise", "CompositorNodeTree")
        ds.compositing_node_group = tree
        tree.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
        src = tree.nodes.new("CompositorNodeImage"); src.image = img
        dn = tree.nodes.new("CompositorNodeDenoise")
        out = tree.nodes.new("NodeGroupOutput")
        tree.links.new(src.outputs[0], dn.inputs[0])
        tree.links.new(dn.outputs[0], out.inputs[0])
        ds.render.engine = "CYCLES"
        ds.render.use_compositing = True
        ds.render.resolution_x, ds.render.resolution_y = w, h
        ds.render.resolution_percentage = 100
        ds.render.filepath = tmp
        ds.render.image_settings.file_format = "OPEN_EXR"
        bpy.ops.render.render(write_still=True, scene=ds.name)
        res = bpy.data.images.load(tmp)
        bpy.data.scenes.remove(ds)
        bpy.data.node_groups.remove(tree)
        if tuple(res.size) == (w, h):
            return res
    except Exception as e:
        print("[antik] denoise skipped:", e)
    return img


def bake(obj, label, side):
    img = bpy.data.images.new(f"{name}-{label}-{preset}", side, side, alpha=False, float_buffer=True)
    obj.data.uv_layers.active = obj.data.uv_layers["lightmap"]
    for slot in obj.material_slots:
        mat = slot.material
        if mat is None:
            continue
        mat.use_nodes = True
        nodes = mat.node_tree.nodes
        node = nodes.new("ShaderNodeTexImage")
        node.image = img
        node.name = "antik_lightmap_target"
        nodes.active = node
    select_only(obj)
    bpy.ops.object.bake(type="DIFFUSE", pass_filter={"DIRECT", "INDIRECT"}, target="IMAGE_TEXTURES",
                        margin=4, margin_type="EXTEND", use_clear=True)
    den = denoise(img)
    # store half the light, sRGB, so 0..2 x the albedo fits 8 bits
    px = list(den.pixels)
    for i in range(0, len(px), 4):
        for k in range(3):
            px[i + k] = min(1.0, max(0.0, px[i + k] * 0.5))
        px[i + 3] = 1.0
    out = bpy.data.images.new(f"{img.name}-out", side, side, alpha=False)
    out.pixels = px
    out.filepath_raw = os.path.join(out_dir, f"{name}-{label}-{preset}.png")
    out.file_format = "PNG"
    out.save()
    for slot in obj.material_slots:
        if slot.material and "antik_lightmap_target" in slot.material.node_tree.nodes:
            slot.material.node_tree.nodes.remove(slot.material.node_tree.nodes["antik_lightmap_target"])
    obj.data.uv_layers.active = obj.data.uv_layers[0]
    meta["maps"][obj.name] = os.path.basename(out.filepath_raw)
    tmp = os.path.join(out_dir, f".{img.name}-dn.exr")
    if os.path.exists(tmp):
        os.remove(tmp)


def bake_vertex(obj, passes=4):
    """Light per corner into the vertex colour: colour = original colour x half the light.
    Corners of one vertex on a smooth surface are then averaged, so those triangles keep
    sharing the vertex; at sharp edges (stone blocks) each side keeps its own light."""
    me = obj.data
    nl = len(me.loops)
    vi = [0] * nl
    me.loops.foreach_get("vertex_index", vi)
    base = [1.0] * (4 * nl)
    name0 = "Color"
    if len(me.color_attributes):
        orig = me.color_attributes[me.color_attributes.render_color_index]
        name0 = orig.name
        if orig.domain == "CORNER":
            orig.data.foreach_get("color", base)
        else:
            pv = [1.0] * (4 * len(me.vertices))
            orig.data.foreach_get("color", pv)
            for li, v in enumerate(vi):
                base[4 * li:4 * li + 4] = pv[4 * v:4 * v + 4]
    # (the original colour stays during the bake: the materials read it, and a
    # missing one would make them black, which bakes as no light at all)
    light = me.color_attributes.new("antik_light", "FLOAT_COLOR", "CORNER")
    me.color_attributes.active_color = light
    select_only(obj)
    bpy.ops.object.bake(type="DIFFUSE", pass_filter={"DIRECT", "INDIRECT"}, target="VERTEX_COLORS", use_clear=True)
    lv = [0.0] * (4 * nl)
    light.data.foreach_get("color", lv)
    me.color_attributes.remove(me.color_attributes["antik_light"])
    if me.color_attributes.get(name0) is not None:
        me.color_attributes.remove(me.color_attributes[name0])
    # face normal of each corner
    pn = [0.0] * (3 * len(me.polygons))
    me.polygons.foreach_get("normal", pn)
    ls = [0] * len(me.polygons); lt = [0] * len(me.polygons)
    me.polygons.foreach_get("loop_start", ls); me.polygons.foreach_get("loop_total", lt)
    cn = [0] * nl
    for f in range(len(ls)):
        for li in range(ls[f], ls[f] + lt[f]):
            cn[li] = f
    by_vertex = {}
    for li, v in enumerate(vi):
        by_vertex.setdefault(v, []).append(li)
    out = [0.0] * (4 * nl)
    cos_limit = math.cos(math.radians(35))
    gid = [0] * nl
    ng = 0
    for loops in by_vertex.values():
        groups = []  # [(normal, [loops])]
        for li in loops:
            f = cn[li]; n = (pn[3 * f], pn[3 * f + 1], pn[3 * f + 2])
            for g in groups:
                gn = g[0]
                if n[0] * gn[0] + n[1] * gn[1] + n[2] * gn[2] > cos_limit:
                    g[1].append(li); break
            else:
                groups.append((n, [li]))
        for _, g in groups:
            for li in g:
                gid[li] = ng
            ng += 1
    # Each corner's light is a noisy estimate (no denoiser for vertex colours): smooth
    # it over the surface. Corners at one vertex with similar normals share their
    # light; each face then blends toward its own mean, which carries the light on to
    # the neighbouring faces at the next sharing. Sharp edges (no sharing) stay crisp.
    import numpy as np
    G = np.asarray(gid); F = np.asarray(cn); B = np.asarray(base).reshape(-1, 4)
    L = np.asarray(lv, dtype=np.float64).reshape(-1, 4)[:, :3].copy()
    gc = np.maximum(np.bincount(G, minlength=ng), 1)
    fc = np.maximum(np.bincount(F, minlength=len(ls)), 1)
    def share(L):
        return np.stack([np.bincount(G, weights=L[:, k], minlength=ng) / gc for k in range(3)], 1)[G]
    L = share(L)
    for _ in range(passes):
        fm = np.stack([np.bincount(F, weights=L[:, k], minlength=len(ls)) / fc for k in range(3)], 1)[F]
        L = share(0.5 * L + 0.5 * fm)
    O = np.empty((nl, 4))
    O[:, :3] = B[:, :3] * np.minimum(1.0, L * 0.5)
    O[:, 3] = B[:, 3]
    out = O.ravel().tolist()
    col = me.color_attributes.new(name0, "BYTE_COLOR", "CORNER")
    col.data.foreach_set("color", out)
    me.color_attributes.active_color = col
    me.color_attributes.render_color_index = me.color_attributes.find(name0)
    meta["maps"][obj.name] = None


for o in targets:
    bake(o, o.name.replace(f"{name}-", ""), sides[o])
if detail_obj:
    bake_vertex(detail_obj)
if flora_obj:
    antik_trees.bake_mode(True)
    bake_vertex(flora_obj, passes=1)
    antik_trees.bake_mode(False)

# The phone shader only reads the colour texture (the light is in the lightmaps):
# drop normal, roughness and occlusion maps so they are not shipped.
for mat in bpy.data.materials:
    if not mat.node_tree:
        continue
    for node in list(mat.node_tree.nodes):
        if node.type == "GROUP" and node.node_tree and "gltf" in node.node_tree.name.lower():
            mat.node_tree.nodes.remove(node)  # glTF occlusion settings
            continue
        if node.type == "BSDF_PRINCIPLED":
            for inp in node.inputs:
                if inp.name != "Base Color" and inp.name != "Alpha":
                    for link in list(inp.links):
                        mat.node_tree.links.remove(link)

# Texture coordinates: the colour's own set first, then the lightmap, nothing else.
# (Scans bring an extra set of their own; left in, the lightmap would land in the
# third slot and the phone shader, which reads the second, would sample nonsense.)
def keep_uvs(o, lightmap):
    me = o.data
    if not len(me.uv_layers):
        return
    # (Blender 5 lists internal '.uv_select_*' layers too: they are not texture coordinates)
    names = [l.name for l in me.uv_layers if not l.name.startswith(".")]
    first = next((n for n in names if n != "lightmap"), None)
    for n in names:
        if n != first and not (lightmap and n == "lightmap"):
            me.uv_layers.remove(me.uv_layers[n])


for o in targets:
    keep_uvs(o, True)
if detail_obj:
    keep_uvs(detail_obj, False)

# Export the baked meshes only (the landscape stays as it was).
bpy.ops.object.select_all(action="DESELECT")
for o in targets + [o for o in (detail_obj, flora_obj) if o]:
    o.select_set(True)
glb_out = os.path.join(out_dir, f"{name}-baked.glb")
opts = dict(filepath=glb_out, use_selection=True, export_format="GLB", export_texcoords=True,
            export_normals=False, export_apply=True)
try:
    bpy.ops.export_scene.gltf(**opts, export_vertex_color="ACTIVE")
except TypeError:
    bpy.ops.export_scene.gltf(**opts, export_colors=True)


def patch_materials(path):
    """Leaf cards: cut out by the texture's alpha and seen from both sides."""
    import struct
    with open(path, "rb") as f:
        data = f.read()
    jlen = struct.unpack_from("<I", data, 12)[0]
    doc = json.loads(data[20:20 + jlen])
    rest = data[20 + jlen:]
    hit = 0
    for m in doc.get("materials", []):
        if m.get("name", "").startswith("antik-foliage"):
            m["alphaMode"] = "MASK"; m["alphaCutoff"] = 0.4; m["doubleSided"] = True; hit += 1
        elif m.get("name", "").startswith("antik-bark"):
            m.pop("alphaMode", None); m["doubleSided"] = False
    if not hit:
        return
    js = json.dumps(doc, separators=(",", ":")).encode()
    while len(js) % 4:
        js += b" "
    with open(path, "wb") as f:
        f.write(struct.pack("<III", 0x46546C67, 2, 12 + 8 + len(js) + len(rest)))
        f.write(struct.pack("<II", len(js), 0x4E4F534A) + js + rest)


patch_materials(glb_out)
import shutil
shutil.rmtree(os.path.join(out_dir, "_plants"), ignore_errors=True)
with open(os.path.join(out_dir, f"{name}-bake.json"), "w") as f:
    json.dump(meta, f, indent=1)
print("[antik] done:", glb_out, meta)
