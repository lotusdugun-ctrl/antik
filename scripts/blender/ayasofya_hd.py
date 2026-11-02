"""
Ayasofya, HD, SAĞLAM DÖNEM: 24 Aralık 562'de yeniden kutsanan Justinianus yapısı.

Yapı kartı: docs/yapi-kartlari/ayasofya.md. [K]: 82 x 73 m; pandantifler üzerinde nervürlü kubbe,
çap ~32,7–33,5 m, iç yükseklik 55,6 m; doğu ve batıda yarım kubbeler; dışı beyaz mermer kaplı;
içi çok renkli mermer kaplama ve altın mozaik. Payandalar, minareler ve Osmanlı eklemeleri YOK.
Kemer ve ayak ölçüleri, eksedra ve galeri oranları [T]; ölçekli plan (Mainstone 1988) gerekli.

    blender -b --factory-startup --python scripts/blender/ayasofya_hd.py -- --out hd-out\\ayasofya [--gpu] [--pano]

Eksenler: kubbenin merkezi (0, 0), x doğuya (apsis +x), y kuzeye, z yukarı.
"""
import argparse
import math
import os
import sys

import bpy  # noqa: I001
import bmesh
import numpy as np
from mathutils import Matrix, Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument("--out", required=True)
ap.add_argument("--dokular", default="")
ap.add_argument("--res", default="1600x900")
ap.add_argument("--samples", type=int, default=64)
ap.add_argument("--gpu", action="store_true")
ap.add_argument("--no-render", action="store_true")
ap.add_argument("--views", default="")
ap.add_argument("--exposure", type=float, default=-1.8)
ap.add_argument("--pano", action="store_true")
ap.add_argument("--pano-res", default="4096x2048")
ap.add_argument("--pano-samples", type=int, default=0)
args = ap.parse_args(argv)
os.makedirs(args.out, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import antik_mimari as AM  # noqa: E402

scene = bpy.context.scene
box, lathe, column = AM.box, AM.lathe, AM.column

# ------------------------------------------------------------------ ölçüler
R = 15.8              # [K] kubbe çapı ~31,6–33 m (iç); yarıçap
H_SPRING = 24.0       # [T] büyük kemerlerin ve pandantiflerin başladığı yükseklik
H_DOME0 = H_SPRING + R  # pandantiflerin üstü, kubbe eteği (~39,8)
H_TOP = 55.6          # [K] iç yükseklik (562)
WALL = 2.2            # [T] dış duvar
AISLE = 15.0          # [T] yan nef genişliği
GAL = 12.5            # [T] galeri döşemesi
N_WIN = 40            # [F] kubbe eteğinde 40 pencere

AM.MAT.update({
    "mermer": AM.marble("mermer"),
    "dis": AM.marble("dis", base=(0.82, 0.8, 0.76), vein=(0.72, 0.71, 0.7), rough=0.45, polish=False),
    "yesil": AM.marble("yesil", base=(0.12, 0.22, 0.16), vein=(0.55, 0.62, 0.55), rough=0.25),
    "porfir": AM.marble("porfir", base=(0.32, 0.1, 0.12), vein=(0.5, 0.35, 0.36), rough=0.25),
    "kursun": AM.flat("kursun", (0.42, 0.43, 0.44), 0.6, 0.15),
    "toprak": AM.flat("toprak", (0.4, 0.36, 0.3), 0.95),
})


def gold_mosaic():
    """Altın mozaik: küçük, hafif eğik camlar (voronoi hücreleri); figürsüz [T: 6. yy]."""
    m, nt, b = AM._mat("altin")
    N, L = nt.nodes.new, nt.links.new
    co = N("ShaderNodeTexCoord")
    vo = N("ShaderNodeTexVoronoi")
    vo.inputs["Scale"].default_value = 90
    L(co.outputs["Object"], vo.inputs["Vector"])
    ramp = N("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (0.62, 0.42, 0.12, 1)
    ramp.color_ramp.elements[1].color = (0.95, 0.74, 0.32, 1)
    L(vo.outputs["Color"], ramp.inputs["Fac"])
    L(ramp.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Metallic"].default_value = 0.9
    b.inputs["Roughness"].default_value = 0.28
    bump = N("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.35
    bump.inputs["Distance"].default_value = 0.005
    L(vo.outputs["Distance"], bump.inputs["Height"])
    L(bump.outputs["Normal"], b.inputs["Normal"])
    return m


AM.MAT["altin"] = gold_mosaic()


def mk_sphere(name, c, r, mat="mermer", sz=1.0, segs=96):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=segs, v_segments=segs // 2, radius=r)
    for v in bm.verts:
        v.co = Vector((v.co.x + c[0], v.co.y + c[1], v.co.z * sz + c[2]))
    return AM.from_bm(name, bm, mat, smooth=True)


def mk_cyl(name, c, r, z0, z1, mat="mermer", segs=96):
    bm = bmesh.new()
    res = bmesh.ops.create_cone(bm, cap_ends=True, segments=segs, radius1=r, radius2=r, depth=z1 - z0)
    bmesh.ops.translate(bm, vec=(c[0], c[1], (z0 + z1) / 2), verts=res["verts"])
    return AM.from_bm(name, bm, mat, smooth=True)


def bool_op(target, other, op):
    mod = target.modifiers.new("b", "BOOLEAN")
    mod.operation = op
    mod.object = other
    mod.solver = "EXACT"
    mod.use_hole_tolerant = True
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(target.evaluated_get(dg))
    target.modifiers.clear()
    old = target.data
    target.data = me
    bpy.data.meshes.remove(old)
    bpy.data.objects.remove(other)
    return target


def arch_box(name, x0, x1, y0, y1, z0, z1, along="x"):
    """Kemerli açıklık kesicisi: dikdörtgen + yarım silindir tepe. along: açıklığın genişliği
    hangi eksen boyunca ("x": duvar y'ye dik; "y": duvar x'e dik)."""
    b = box(name, x0, x1, y0, y1, z0, z1)
    bm = bmesh.new()
    if along == "x":
        res = bmesh.ops.create_cone(bm, cap_ends=True, segments=32, radius1=(x1 - x0) / 2, radius2=(x1 - x0) / 2, depth=y1 - y0)
        bmesh.ops.rotate(bm, verts=res["verts"], cent=(0, 0, 0), matrix=Matrix.Rotation(math.pi / 2, 4, "X"))
    else:
        res = bmesh.ops.create_cone(bm, cap_ends=True, segments=32, radius1=(y1 - y0) / 2, radius2=(y1 - y0) / 2, depth=x1 - x0)
        bmesh.ops.rotate(bm, verts=res["verts"], cent=(0, 0, 0), matrix=Matrix.Rotation(math.pi / 2, 4, "Y"))
    bmesh.ops.translate(bm, vec=((x0 + x1) / 2, (y0 + y1) / 2, z1), verts=res["verts"])
    return bool_op(b, AM.from_bm(name + "_k", bm, "mermer"), "UNION")


# ------------------------------------------------------------------ kütle ve iç boşluklar

def build():
    L_HALF = 41.0
    W_HALF = 36.5
    # dış kütle [K: 82 x 73 m]: yan nefler + galeriler bloğu, kubbe kulesi, yarım kubbe omuzları
    body = box("kutle", -L_HALF + 6.0, L_HALF - 4.0, -W_HALF, W_HALF, 0, GAL + 12.0, "dis")
    for o in (box("kule", -R - 4, R + 4, -R - 4, R + 4, 0, H_DOME0 + 0.8, "dis"),
              box("omuz", -2 * R - 3, 2 * R + 3, -R - 2, R + 2, 0, H_SPRING + 1.0, "dis"),
              box("narteks", -L_HALF, -L_HALF + 6.5, -W_HALF + 3, W_HALF - 3, 0, 14.0, "dis"),
              mk_cyl("apsis_dis", (2 * R + 1.5, 0), 7.0, 0, 18.5, "dis", 48)):
        bool_op(body, o, "UNION")
    # kubbe kabuğu dışı ve yarım kubbeler dışı
    for o in (mk_sphere("kubbe_dis", (0, 0, H_DOME0), R + 1.2, "kursun", sz=(H_TOP + 1.2 - H_DOME0) / (R + 1.2)),
              mk_sphere("yarim_dis_d", (R, 0, H_SPRING), R + 1.0, "kursun", sz=0.95),
              mk_sphere("yarim_dis_b", (-R, 0, H_SPRING), R + 1.0, "kursun", sz=0.95)):
        o2 = box("alt", -60, 60, -60, 60, -60, H_SPRING if "yarim" in o.name else H_DOME0)
        bool_op(o, o2, "DIFFERENCE")
        bool_op(body, o, "UNION")
    print("  kutle tamam", flush=True)
    cuts = []
    # orta mekân: kare + pandantifler (küre ile kesişim) [K: pandantifler]
    pend = mk_sphere("pandantif", (0, 0, H_SPRING), R * math.sqrt(2))
    sq = box("kare", -R, R, -R, R, 0, H_DOME0)
    bool_op(sq, pend, "INTERSECT")
    cuts.append(sq)
    cuts.append(box("kare_alt", -R, R, -R, R, 0, H_SPRING))
    cuts.append(mk_sphere("kubbe", (0, 0, H_DOME0), R, sz=(H_TOP - H_DOME0) / R))
    # doğu ve batı yarım kubbeler ve altları [K]
    for sx in (-1, 1):
        cuts.append(mk_cyl("yarim_alt", (sx * R, 0), R, 0, H_SPRING))
        cuts.append(mk_sphere("yarim_kubbe", (sx * R, 0, H_SPRING), R, sz=0.92))
        # eksedralar: her yarım kubbenin iki köşesinde [K]
        for sy in (-1, 1):
            c = (sx * (R + 6.2), sy * 8.6)
            cuts.append(mk_cyl("eksedra", c, 5.6, 0, 15.0, segs=48))
            cuts.append(mk_sphere("eksedra_k", (c[0], c[1], 15.0), 5.6, segs=48))
    # apsis [K]
    cuts.append(mk_cyl("apsis", (2 * R + 1.5, 0), 5.6, 0, 16.0, segs=48))
    cuts.append(mk_sphere("apsis_k", (2 * R + 1.5, 0, 16.0), 5.6, segs=48))
    # yan nefler ve galeriler [K]; ana mekâna kemerli açıklıklar [T]
    for sy in (-1, 1):
        y0, y1 = sorted((sy * (R + 2.0), sy * (R + 2.0 + AISLE)))
        cuts.append(box("yan_nef", -2 * R + 2, 2 * R - 2, y0, y1, 0, GAL - 0.6))
        cuts.append(box("galeri", -2 * R + 2, 2 * R - 2, y0, y1, GAL + 0.5, GAL + 10.0))
        ya, yb = sorted((sy * (R - 0.1), sy * (R + 2.1)))
        cuts.append(arch_box("zemin_kemer", -11.0, 11.0, ya, yb, 0.0, 7.2, "x"))
        cuts.append(arch_box("galeri_kemer", -11.0, 11.0, ya, yb, GAL + 0.5, GAL + 7.0, "x"))
        # timpan duvarı pencereleri: iki sıra [F]
        for i, x in enumerate(np.linspace(-10, 10, 7)):
            cuts.append(arch_box("timpan_p", x - 1.0, x + 1.0, ya - 0.2, yb + 0.3, H_SPRING + 2.0, H_SPRING + 5.5, "x"))
        for x in np.linspace(-8, 8, 5):
            cuts.append(arch_box("timpan_p2", x - 1.0, x + 1.0, ya - 0.2, yb + 0.3, H_SPRING + 8.0, H_SPRING + 10.5, "x"))
        # dış duvar pencereleri
        yo0, yo1 = sorted((sy * (W_HALF - WALL - 0.2), sy * (W_HALF + 0.2)))
        for x in np.linspace(-26, 26, 9):
            cuts.append(arch_box("dis_p", x - 1.1, x + 1.1, yo0, yo1, 3.5, 8.0, "x"))
            cuts.append(arch_box("dis_p2", x - 1.1, x + 1.1, yo0, yo1, GAL + 3.0, GAL + 7.5, "x"))
    # narteksler ve imparator kapısı [K/T]
    cuts.append(box("ic_narteks", -L_HALF + 1.2, -2 * R + 1.0, -W_HALF + 4.5, W_HALF - 4.5, 0, 11.0))
    cuts.append(arch_box("imparator_kapi", -2 * R - 3.5, -2 * R + 3.0, -3.0, 3.0, 0, 6.5, "y"))
    for y in (-14.0, -8.0, 8.0, 14.0):
        cuts.append(arch_box("kapi", -2 * R - 3.5, -2 * R + 3.0, y - 1.6, y + 1.6, 0, 5.0, "y"))
    cuts.append(arch_box("dis_kapi", -L_HALF - 0.5, -L_HALF + 1.5, -3.0, 3.0, 0, 6.0, "y"))
    # kubbe eteğinde 40 pencere [F]
    for i in range(N_WIN):
        a = 2 * math.pi * (i + 0.5) / N_WIN
        bm = bmesh.new()
        bmesh.ops.create_cube(bm, size=1.0)
        for v in bm.verts:
            v.co = Vector((v.co.x * 4.0 + R + 0.5, v.co.y * 1.15, v.co.z * 2.6 + H_DOME0 + 1.6))
        bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=Matrix.Rotation(a, 4, "Z"))
        cuts.append(AM.from_bm("kubbe_pencere", bm, "mermer"))
    # yarım kubbelerin eteğinde beşer pencere
    for sx in (-1, 1):
        for i in range(5):
            a = (i - 2) * 0.32 + (0 if sx > 0 else math.pi)
            bm = bmesh.new()
            bmesh.ops.create_cube(bm, size=1.0)
            for v in bm.verts:
                v.co = Vector((v.co.x * 4.0 + R + 0.5, v.co.y * 1.1, v.co.z * 2.2 + H_SPRING + 1.4))
            bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=Matrix.Rotation(a, 4, "Z"))
            bmesh.ops.translate(bm, vec=(sx * R, 0, 0), verts=bm.verts)
            cuts.append(AM.from_bm("yarim_pencere", bm, "mermer"))
    print("  kesim", len(cuts), flush=True)
    AM.apply_cuts(body, cuts)
    # iç yüzeyler: aşağıda mermer kaplama, galeri üstü ve tonozlar altın mozaik [K]
    body.data.materials.append(AM.MAT["altin"])
    body.data.materials.append(AM.MAT["mermer"])
    ai, mi = len(body.data.materials) - 2, len(body.data.materials) - 1
    for p in body.data.polygons:
        c = p.center
        inside = abs(c.x) < 2 * R + 8 and abs(c.y) < W_HALF - WALL + 0.1 and c.x > -2 * R - 3.6
        if not inside or p.normal.z > 0.9:
            continue
        p.material_index = ai if c.z > GAL + 10.5 else mi
    # zemin: Prokonnesos mermeri döşeme [K: mermer], döşeme ve galeri tabanı
    box("doseme", -L_HALF, L_HALF, -W_HALF, W_HALF, -0.3, 0.0, "mermer")
    for sy in (-1, 1):
        y0, y1 = sorted((sy * (R + 2.0), sy * (R + 2.0 + AISLE)))
        box("galeri_doseme", -2 * R + 2, 2 * R - 2, y0, y1, GAL - 0.6, GAL + 0.5, "mermer")
        # zemin ve galeri sütunları: yeşil mermer [K], Korint başlık [T: aslında sepet başlık]
        yc = sy * (R + 1.0)
        for x in (-8.25, -2.75, 2.75, 8.25):
            column(x, yc, 0.0, 7.0, 1.05, "korint")
        for x in np.linspace(-9.0, 9.0, 6):
            column(x, yc, GAL + 0.5, 5.6, 0.75, "korint")
    for o in bpy.data.objects:  # sütun gövdeleri yeşil mermer [K: yeşil ve beyaz mermer]
        if o.name.split(".")[0] == "govde":
            o.data.materials[0] = AM.MAT["yesil"]
    # ambon ve templon yerine sade bir döşeme farkı; porfir daire (omphalion) [T]
    box("omfalion", -1.4, 1.4, -1.4, 1.4, 0.0, 0.02, "porfir")


def ground():
    n = 120
    u = np.linspace(-1, 1, n)
    xs = 800 * np.sinh(3 * u) / np.sinh(3)
    X, Y = np.meshgrid(xs, xs)
    Z = -0.35 + 0 * X
    me = bpy.data.meshes.new("arazi")
    verts = np.stack([X.ravel(), Y.ravel(), Z.ravel()], 1)
    faces = [(j * n + i, j * n + i + 1, (j + 1) * n + i + 1, (j + 1) * n + i) for j in range(n - 1) for i in range(n - 1)]
    me.from_pydata(verts.tolist(), [], faces)
    ob = bpy.data.objects.new("arazi", me)
    me.materials.append(AM.MAT["toprak"])
    AM.link(ob)


build()
ground()
AM.apply_dokular(args.dokular, "celsus")

# ------------------------------------------------------------------ ışık, kamera
w = bpy.data.worlds.new("gok")
scene.world = w
w.use_nodes = True
bg = w.node_tree.nodes["Background"]
sky = w.node_tree.nodes.new("ShaderNodeTexSky")
for kind in ("MULTIPLE_SCATTERING", "NISHITA", "SINGLE_SCATTERING"):
    try:
        sky.sky_type = kind
        break
    except TypeError:
        continue
SUN_ELEV = 42
sky.sun_elevation = math.radians(SUN_ELEV)
sky.sun_rotation = math.radians(160)
w.node_tree.links.new(sky.outputs[0], bg.inputs[0])
bg.inputs[1].default_value = 0.3
sun = bpy.data.lights.new("gunes", "SUN")
sun.energy = 4.5
sun.color = (1.0, 0.9, 0.78)
sun.angle = math.radians(0.6)
so = AM.link(bpy.data.objects.new("gunes", sun))
so.rotation_euler = (math.radians(90 - SUN_ELEV), 0, math.radians(160 + 90))

r = scene.render
r.engine = "CYCLES"
r.resolution_x, r.resolution_y = [int(v) for v in args.res.split("x")]
scene.cycles.samples = args.samples
scene.cycles.use_denoising = True
scene.cycles.max_bounces = 8
scene.view_settings.view_transform = "AgX"
try:
    scene.view_settings.look = "AgX - Medium High Contrast"
except TypeError:
    pass
if args.gpu:
    prefs = bpy.context.preferences.addons["cycles"].preferences
    for kind in ("HIP", "OPTIX", "CUDA", "ONEAPI", "METAL"):
        try:
            prefs.compute_device_type = kind
            prefs.get_devices()
            if any(d.type == kind for d in prefs.devices):
                for d in prefs.devices:
                    d.use = d.type == kind
                scene.cycles.device = "GPU"
                break
        except TypeError:
            continue

cam = bpy.data.cameras.new("kamera")
cam.clip_end = 3000
co = AM.link(bpy.data.objects.new("kamera", cam))
scene.camera = co
VIEWS = [
    ((-60.0, -95.0, 20.0), (0.0, 0.0, 25.0), 26, 0.0),       # dışarıdan, güneybatı
    ((-2 * R + 2.0, 0.0, 1.7), (2 * R, 0.0, 22.0), 14, 1.6),   # imparator kapısından apsise
    ((0.0, 0.0, 1.7), (0.0, 0.1, H_TOP), 12, 1.6),            # kubbeye, tam altından
    ((0.0, R + 8.0, GAL + 2.2), (0.0, -R, 30.0), 14, 1.6),    # kuzey galerisinden
]
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(os.path.abspath(args.out), "ayasofya-hd.blend"))
if not args.no_render:
    pick = [int(v) for v in args.views.split(",")] if args.views else range(len(VIEWS))
    for n in pick:
        pos, tgt, lens, ev = VIEWS[n]
        co.location = Vector(pos)
        co.rotation_euler = (Vector(tgt) - Vector(pos)).to_track_quat("-Z", "Y").to_euler()
        cam.lens = lens
        scene.view_settings.exposure = args.exposure + ev * 2.0
        r.filepath = os.path.join(os.path.abspath(args.out), f"ayasofya-hd-{n}.png")
        bpy.ops.render.render(write_still=True)
        print("VIEW", n, flush=True)
if args.pano:
    PANOS = [("orta", (0.0, 0.0, 1.7), 0.0, 1.6), ("galeri", (0.0, R + 8.0, GAL + 2.2), -90.0, 1.6)]
    cam.type = "PANO"
    try:
        cam.panorama_type = "EQUIRECTANGULAR"
    except (AttributeError, TypeError):
        cam.cycles.panorama_type = "EQUIRECTANGULAR"
    r.resolution_x, r.resolution_y = [int(v) for v in args.pano_res.split("x")]
    if args.pano_samples:
        scene.cycles.samples = args.pano_samples
    r.image_settings.file_format = "JPEG"
    r.image_settings.quality = 86
    for key, pos, yaw, ev in PANOS:
        co.location = pos
        co.rotation_euler = (math.pi / 2, 0, math.radians(yaw) - math.pi / 2)
        scene.view_settings.exposure = args.exposure + ev * 2.0
        r.filepath = os.path.join(os.path.abspath(args.out), f"ayasofya-360-{key}.jpg")
        bpy.ops.render.render(write_still=True)
        print("PANO", key, flush=True)
print("BITTI", flush=True)
