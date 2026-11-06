"""
Trier, HD, SAĞLAM DÖNEM (Augusta Treverorum; Porta Nigra, Amphitheater, Hamamlar).

Yapı kartı: docs/yapi-kartlari/trier.md. [K]: Porta Nigra kule yüksekliği ~30 m.
[T]: tahminler.

    blender -b --factory-startup --python scripts/blender/trier_hd.py -- ^
        --out hd-out/trier [--res 1920x1080] [--samples 256] [--gpu] [--pano]

Eksenler: Porta Nigra merkezi (0,0,0); şehir surları y < 0, forum/hamam y > 0.
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

PORTA_R = 30.0       # [K] Porta Nigra kule yüksekliği
AMP_R = 26.0         # [T] amfitasar
BAT_R = 16.0         # [K] imparator hamamı
BAS_R = 24.0         # [K] basilika

AM.MAT.update({
    "kirectasi": AM.marble("kirectasi", base=(0.78, 0.74, 0.66), vein=(0.7, 0.66, 0.6), rough=0.7, polish=False),
    "konglomera": AM.flat("konglomera", (0.62, 0.52, 0.42), 0.95),
    "mermer": AM.marble("mermer"),
    "ahsap": AM.flat("ahsap", (0.36, 0.22, 0.12), 0.6),
    "toprak": AM.flat("toprak", (0.42, 0.37, 0.28), 0.95),
    "kabartma": AM.relief("kabartma"),
})


def ring_solid(name, prof, a0=math.pi, a1=2 * math.pi, segs=160, mat="mermer"):
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
    prof = [(r_out - 2.2, 0.0), (r_out, 0.0), (r_out, stage_h), (r_out - 2.2, stage_h), (r_out - 2.2, 0.0)]
    ob = ring_solid(name + "_cavea", prof, a0=math.pi, a1=2 * math.pi, mat=mat)
    ob.location = (0.0, stage_y - r_out, 0.0)
    box(name + "_sahne", -8.0, 8.0, stage_y - 8.0, stage_y, 0.0, stage_h, "ahsap")
    return stage_h


def porta_nigra(cx, cy, cz, h):
    """Çift kuleli kapı: iki kule + ortak koloniyalı girek [K]."""
    for sx in (-1, 1):
        column(cx + sx * 8.0, cy, cz - 10.0, h - 10.0, 2.4, "korint")
    for k in range(8):
        column(cx + (1 if k % 2 else -1) * 9.0, cy, cz - 8.0, 12.0, 1.6, "korint")
    box("porta_zemin", cx - 12.0, cx + 12.0, cy - 10.0, cy + 10.0, -0.8, 0.0, "konglomera")


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
    box("forum", -20.0, 20.0, -30.0, 30.0, -0.4, 0.0, "toprak")
    porta_nigra(0.0, 0.0, 0.0, PORTA_R)
    theater("amfitasar", AMP_R, -18.0, 7.0, "mermer")
    box("hamam", 8.0, 26.0, 12.0, 22.0, -0.5, 5.0, "mermer")
    box("basilika", -16.0, 8.0, -20.0, -6.0, -0.4, 0.0, "toprak")


build()
hill()

AM.apply_dokular(args.dokular, "trier")


def run():
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
        ((0.0, -60.0, 20.0), (0.0, 5.0, 9.0), 24),
        ((60.0, -40.0, 25.0), (0.0, 0.0, 5.0), 22),
        ((0.0, 60.0, 15.0), (0.0, 0.0, 5.0), 20),
    ]
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(os.path.abspath(args.out), "trier-hd.blend"))
    if not args.no_render:
        pick = [int(v) for v in args.views.split(",")] if args.views else range(len(VIEWS))
        for n in pick:
            pos, tgt, lens = VIEWS[n]
            co.location = Vector(pos)
            co.rotation_euler = (Vector(tgt) - Vector(pos)).to_track_quat("-Z", "Y").to_euler()
            cam.lens = lens
            scene.view_settings.exposure = args.exposure
            r.filepath = os.path.join(os.path.abspath(args.out), f"trier-hd-{n}.png")
            bpy.ops.render.render(write_still=True)
            print("VIEW", n, flush=True)
    if args.pano:
        PANOS = [("porta", (0.0, -12.0, 8.0), 90.0), ("amfi", (30.0, -18.0, 8.0), -90.0), ("forum", (0.0, 18.0, 6.0), 90.0)]
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
            r.filepath = os.path.join(os.path.abspath(args.out), f"trier-360-{key}.jpg")
            bpy.ops.render.render(write_still=True)
            print("PANO", key, flush=True)
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
            r.filepath = os.path.join(os.path.abspath(args.out), f"trier-kiyas-{key}.jpg")
            bpy.ops.render.render(write_still=True)
            print("KIYAS", key, flush=True)
    print("BITTI", flush=True)


KIYAS = [("porta", (20.0, -10.0, 10.0), (0.0, -12.0, 8.0), 18)]


run()
