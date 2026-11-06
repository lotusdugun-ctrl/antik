"""
Pompeii, HD, SAĞLAM DÖNEM (MS 79; buluşma kurgusu).

Yapı kartı: docs/yapi-kartlari/pompeii.md. [K]: forum ölçüleri, tiyatronun kapasitesi,
amfitasarın boyutları. [T]: ölçüler tahmin; kartta düzeltilecek.

    blender -b --factory-startup --python scripts/blender/pompeii_hd.py -- ^
        --out hd-out/pompeii [--res 1920x1080] [--samples 256] [--gpu] [--pano]

Eksenler: forum merkez (0, 0, 0); cardo yönü +x, decumanus -x; y sanayi, z yukarı.
Tiyatronun sahne binası y > 0 tarafındadır; cavea y < 0 tarafında.
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
ap.add_argument("--dokular", default="", help="Poly Haven dokuları klasörü (gorseller-ai\\dokular)")
ap.add_argument("--res", default="1600x900")
ap.add_argument("--samples", type=int, default=64)
ap.add_argument("--gpu", action="store_true")
ap.add_argument("--no-render", action="store_true")
ap.add_argument("--views", default="")
ap.add_argument("--exposure", type=float, default=-2.0)
ap.add_argument("--pano", action="store_true")
ap.add_argument("--pano-res", default="4096x2048")
ap.add_argument("--pano-samples", type=int, default=0)
args = ap.parse_args(argv)
os.makedirs(args.out, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import antik_mimari as AM  # noqa: E402

scene = bpy.context.scene
box, lathe, column, pedestal, entablature, pediment = (
    AM.box, AM.lathe, AM.column, AM.pedestal, AM.entablature, AM.pediment,
)

# ------------------------------------------------------------------ ölçüler
FORUM_X, FORUM_Y = 62.0, 91.0          # [T] forum çaprazı (62 x 91 m tahmin)
BAS_X, BAS_W, BAS_D = -20.0, 34.0, 14.0  # [K] basilika
CAP_X, CAP_Y = 12.0, 26.0             # [K] Capitolium tahsis
TH_R, TH_H = 34.0, 7.5                # [T] büyük tiyatro cavea yarıçapı, sahne yüksekliği
SM_R, SM_H = 12.0, 4.5                # [T] küçük tiyatro
AM_R, AM_H = 28.0, 6.5                # [T] amfitasar cavea yarıçapı, sahne yüksekliği
STAGE_H = 6.0                          # sahne binası yüksekliği

# ------------------------------------------------------------------ malzemeler
AM.MAT.update({
    "kirectasi": AM.marble("kirectasi", base=(0.78, 0.74, 0.66), vein=(0.7, 0.66, 0.6), rough=0.7, polish=False),
    "konglomera": AM.flat("konglomera", (0.62, 0.52, 0.42), 0.95),
    "mermer": AM.marble("mermer"),
    "ahsap": AM.flat("ahsap", (0.36, 0.22, 0.12), 0.6),
    "toprak": AM.flat("toprak", (0.42, 0.37, 0.28), 0.95),
    "kabartma": AM.relief("kabartma"),
})


# ------------------------------------------------------------------ yardımcılar
def ring_solid(name, prof, a0=math.pi, a1=2 * math.pi, segs=160, mat="mermer"):
    """Kapalı kesit prof = [(r, z), ...] ile katı halka/solidi; a0..a1 açısı (yarım daire için pi..2pi)."""
    bm = bmesh.new()
    rings = []
    for k in range(segs + 1):
        a = a0 + (a1 - a0) * k / segs
        rings.append([bm.verts.new((r * math.cos(a), r * math.sin(a), z)) for r, z in prof])
    n = len(prof)
    for A, B in zip(rings, rings[1:]):
        for i in range(n):
            bm.faces.new((A[i], A[(i + 1) % n], B[(i + 1) % n], B[i]))
    bm.faces.new(rings[0])
    bm.faces.new(rings[-1][::-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return AM.from_bm(name, bm, mat, smooth=False)


def theater(name, r_out, stage_y, stage_h, mat="mermer"):
    """Yarım daire cavea (a0=pi, a1=2pi -> y<=0) + orkestra + sahne binası."""
    prof = [(r_out - 2.2, 0.0), (r_out, 0.0), (r_out, stage_h), (r_out - 2.2, stage_h), (r_out - 2.2, 0.0)]
    ob = ring_solid(name + "_cavea", prof, a0=math.pi, a1=2 * math.pi, mat=mat)
    ob.location = (0.0, stage_y - r_out, 0.0)
    box(name + "_sahne", -8.0, 8.0, stage_y - 8.0, stage_y, 0.0, stage_h, "ahsap")
    return stage_h


def amphitheater(name, r_out, stage_y, stage_h, mat="mermer"):
    prof = [(r_out - 2.0, 0.0), (r_out, 0.0), (r_out, stage_h), (r_out - 2.0, stage_h), (r_out - 2.0, 0.0)]
    ob = ring_solid(name + "_cavea", prof, a0=0, a1=2 * math.pi, mat=mat)
    ob.location = (0.0, stage_y - r_out, 0.0)
    box(name + "_sahne", -8.0, 8.0, stage_y - 8.0, stage_y, 0.0, stage_h, "ahsap")
    bm = bmesh.new()
    bm.faces.new([bm.verts.new((x, y, -0.8)) for x, y in ((-2, -2), (2, -2), (2, 2), (-2, 2))])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    AM.from_bm(name + "_arena", bm, "toprak")
    return stage_h


def basilica(bx, bw, bd):
    for sx in (-1, 1):
        column(bx + sx * (bw / 2 - 2.0), 0.0, 0.0, 11.5, 1.6, "korint")
    box("basilika_naos", bx - bw / 2 + 4.0, bx + bw / 2 - 4.0, -bd / 2, bd / 2, 0.0, 8.5, "mermer")
    entablature(bx - bw / 2 + 4.0, bx + bw / 2 - 4.0, -bd / 2, bd / 2, 8.5, 1.6, dentils=True)


def capitolium(cx, cy, cz, s):
    box("capitolium_podium", cx - s - 3.0, cx + s + 3.0, cy - s, cy + s, cz - 1.2, cz, "konglomera")
    for k in range(6):
        sx = -1 if k % 2 == 0 else 1
        column(cx + sx * (s - 2.5), cy, cz, 10.0, 1.5, "korint")
    entablature(cx - (s - 2.5) - 0.6, cx + (s - 2.5) + 0.6, cy - s, cy + s, cz + 10.0, 1.4, dentils=True)
    pediment(cx, 2 * (s - 2.5) + 1.2, cy - s, cy + s, cz + 11.4, "taksim")


def temple_apollo(cx, cy, cz, s, h):
    box("apollo_podium", cx - s - 3.0, cx + s + 3.0, cy - s - 3.0, cy + s + 3.0, cz - 0.8, cz, "konglomera")
    cols = 8
    for k in range(cols):
        a = 2 * math.pi * k / cols
        column(cx + (s - 2.5) * math.cos(a), cy + (s - 2.5) * math.sin(a), cz, h, 1.6, "korint")
    entablature(cx - (s - 2.5), cx + (s - 2.5), cy - (s - 2.5) - 0.0, cy + (s - 2.5), cz + h, 1.4, dentils=True)
    pediment(cx, 2 * (s - 2.5) + 1.2, cy - (s - 2.5), cy + (s - 2.5), cz + h + 1.4, "taksim")


def city_wall():
    for k in range(6):
        x = -90.0 + k * 36.0
        box("duvar", x, x + 24.0, -30.0, -4.0, -1.0, 8.0, "konglomera")
        column(x + 24.0, -17.0, -1.0, 11.0, 2.4, "korint")
        column(x, -17.0, -1.0, 11.0, 2.4, "korint")


def hill():
    n = 120
    u = np.linspace(-1, 1, n)
    xs = 900 * np.sinh(3 * u) / np.sinh(3)
    X, Y = np.meshgrid(xs, xs)
    R = np.hypot(X, Y)
    Z = -0.5 + (R > 300) * 30 * (1 / (1 + np.exp(-(R - 700) / 120)))
    me = bpy.data.meshes.new("arazi")
    me.from_pydata(np.stack([X.ravel(), Y.ravel(), Z.ravel()], 1).tolist(), [], [[j * n + i, j * n + i + 1, (j + 1) * n + i + 1, (j + 1) * n + i] for j in range(n - 1) for i in range(n - 1)])
    for p in me.polygons:
        p.use_smooth = True
    ob = bpy.data.objects.new("arazi", me)
    me.materials.append(AM.MAT["toprak"])
    AM.link(ob)


def build():
    box("forum_zemin", -FORUM_X / 2, FORUM_X / 2, -FORUM_Y / 2, FORUM_Y / 2, -0.4, 0.0, "toprak")
    basilica(BAS_X, BAS_W, BAS_D)
    capitolium(0.0, 0.0, 0.0, 12.0)
    temple_apollo(0.0, 0.0, 0.0, 9.0, 7.5)
    theater("tiyatro_buyuk", TH_R, -20.0, TH_H, "mermer")
    amphitheater("amfitasar", AM_R, -30.0, AM_H, "mermer")
    for i, (ex, ey, exw, eyd) in enumerate(((-30.0, -20.0, 12.0, 10.0), (26.0, -24.0, 11.0, 9.0))):
        box("ev", ex - exw / 2, ex + exw / 2, ey - eyd / 2, ey + eyd / 2, -0.5, 2.2, "ahsap")
        for sx in (-1, 1):
            column(ex + sx * ((exw / 2) - 2.0), ey, 0.0, 3.0, 1.5, "korint")
        box("ev_peristyle_zemin", ex - exw / 2 + 2, ex + exw / 2 - 2, ey - eyd / 2 + 2, ey + eyd / 2 - 2, -0.4, 0.0, "toprak")
    city_wall()


build()
hill()

AM.apply_dokular(args.dokular, "pompeii")

# sky, sun
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
SUN_ELEV = 34
sky.sun_elevation = math.radians(SUN_ELEV)
sky.sun_rotation = math.radians(200)
w.node_tree.links.new(sky.outputs[0], bg.inputs[0])
bg.inputs[1].default_value = 0.25
sun = bpy.data.lights.new("gunes", "SUN")
sun.energy = 4.0
sun.color = (1.0, 0.88, 0.74)
sun.angle = math.radians(0.6)
so = AM.link(bpy.data.objects.new("gunes", sun))
so.rotation_euler = (math.radians(90 - SUN_ELEV), 0, math.radians(200 + 90))

r = scene.render
r.engine = "CYCLES"
r.resolution_x, r.resolution_y = [int(v) for v in args.res.split("x")]
scene.cycles.samples = args.samples
scene.cycles.use_denoising = True
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
    ((0.0, -60.0, 20.0), (0.0, 5.0, 9.0), 24),   # forum merkezinden
    ((60.0, -40.0, 25.0), (0.0, 0.0, 5.0), 22),  # amfitasara yandan
    ((0.0, 60.0, 15.0), (0.0, 0.0, 5.0), 20),   # basilika/kapitoliyum yandan
]
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(os.path.abspath(args.out), "pompeii-hd.blend"))
if not args.no_render:
    pick = [int(v) for v in args.views.split(",")] if args.views else range(len(VIEWS))
    for n in pick:
        pos, tgt, lens = VIEWS[n]
        co.location = Vector(pos)
        co.rotation_euler = (Vector(tgt) - Vector(pos)).to_track_quat("-Z", "Y").to_euler()
        cam.lens = lens
        scene.view_settings.exposure = args.exposure
        r.filepath = os.path.join(os.path.abspath(args.out), f"pompeii-hd-{n}.png")
        bpy.ops.render.render(write_still=True)
        print("VIEW", n, flush=True)
if args.pano:
    PANOS = [("forum", (0.0, -20.0, 2.0), 90.0), ("tiyatro", (0.0, -55.0, 12.0), 90.0), ("amfi", (40.0, -30.0, 12.0), -90.0)]
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
    for key, pos, yaw in PANOS:
        co.location = pos
        co.rotation_euler = (math.pi / 2, 0, math.radians(yaw) - math.pi / 2)
        r.filepath = os.path.join(os.path.abspath(args.out), f"pompeii-360-{key}.jpg")
        bpy.ops.render.render(write_still=True)
        print("PANO", key, flush=True)

# ------------------------------------------------------------------
# kiyas gorunumlari
KIYAS = [("sahne", (0.0, -42.0, 19.0), (0.0, 6.0, 8.0), 20)]
if not args.no_render:
    cam.type = "PERSP"
    r.resolution_x, r.resolution_y = 1920, 1280
    r.image_settings.file_format = "JPEG"
    r.image_settings.quality = 88
    for key, pos, tgt, lens in KIYAS:
        co.location = Vector(pos)
        co.rotation_euler = (Vector(tgt) - Vector(pos)).to_track_quat("-Z", "Y").to_euler()
        cam.lens = lens
        scene.view_settings.exposure = args.exposure
        r.filepath = os.path.join(os.path.abspath(args.out), f"pompeii-kiyas-{key}.jpg")
        bpy.ops.render.render(write_still=True)
        print("KIYAS", key, flush=True)
print("BITTI", flush=True)

