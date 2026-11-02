"""
Celsus Kütüphanesi (Efes), HD, SAĞLAM DÖNEM (yaklaşık MS 135).

Yapı kartı: docs/yapi-kartlari/celsus-kutuphanesi.md. Ölçüler: Forschungen in Ephesos V.1
(cephe 21 m, >16 m; vestibül 2,4 m; salon 16,7 x 10,9 m; kürsü 0,94 m; nişler 2,55 x ~1,1 x 0,57 m).
Kat oranları ve sütun aralıkları [T] (kartta).

    blender -b --factory-startup --python scripts/blender/celsus_hd.py -- ^
        --out hd-out\\celsus [--res 1920x1080] [--samples 256] [--gpu] [--pano]

Eksenler: x cephe boyunca (0 = orta), y < 0 önü (doğu), y > 0 salon (batı), z yukarı; z = 0 meydan.
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
ap.add_argument("--exposure", type=float, default=-2.2)
ap.add_argument("--pano", action="store_true")
ap.add_argument("--pano-res", default="4096x2048")
ap.add_argument("--pano-samples", type=int, default=0)
args = ap.parse_args(argv)
os.makedirs(args.out, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

# ------------------------------------------------------------------ ölçüler
FW = 21.0                    # [K] cephe genişliği
STEP_N, STEP_H, STEP_D = 9, 0.18, 0.36   # [K] 9 basamak; basamak ölçüsü [T]
Z0 = STEP_N * STEP_H         # stilobat
VEST = 2.4                   # [K] vestibül derinliği
LOW = dict(ped=1.1, col=5.6, ent=1.0, d=0.66)    # [T] alt düzen (kompozit)
UP = dict(ped=0.75, col=4.1, ent=0.8, d=0.5)     # [T] üst düzen (Korint)
LOW_PAIRS = [-8.6, -3.0, 3.0, 8.6]               # [T] çift eksenleri
UP_PAIRS = [-5.8, 0.0, 5.8]                      # [K] üst çiftler kapıların üstünde
PAIR = 1.6                                       # [T] çift içi sütun aralığı
HALL_W, HALL_D = 16.7, 10.9                      # [K] salon
WALL_T = 1.1                                     # [T] dış duvar + geçit (çift duvar) kalınlığı
PODIUM = 0.94                                    # [K]
Z_LOW_TOP = Z0 + LOW["ped"] + LOW["col"] + LOW["ent"]
Z_UP_TOP = Z_LOW_TOP + UP["ped"] + UP["col"] + UP["ent"]


# ------------------------------------------------------------------ malzemeler

def _mat(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    return m, nt, nt.nodes["Principled BSDF"]


def marble(name, base=(0.80, 0.79, 0.76), vein=(0.66, 0.67, 0.69), rough=0.3, polish=True):
    """Beyaz mermer: yumuşak gri damarlar, hafif sıcak ton, cilalı yüzey."""
    m, nt, b = _mat(name)
    N, L = nt.nodes.new, nt.links.new
    co = N("ShaderNodeTexCoord")
    mp = N("ShaderNodeMapping")
    mp.inputs["Rotation"].default_value = (0.4, 0.9, 0.2)
    L(co.outputs["Object"], mp.inputs["Vector"])
    wv = N("ShaderNodeTexWave")
    wv.inputs["Scale"].default_value = 0.35
    wv.inputs["Distortion"].default_value = 18
    wv.inputs["Detail"].default_value = 6
    wv.inputs["Detail Roughness"].default_value = 0.7
    L(mp.outputs[0], wv.inputs["Vector"])
    vr = N("ShaderNodeMapRange")
    vr.inputs["From Min"].default_value = 0.93
    vr.inputs["From Max"].default_value = 0.995
    vr.inputs["To Max"].default_value = 0.6
    L(wv.outputs["Fac"], vr.inputs["Value"])
    nz = N("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 1.2
    nz.inputs["Detail"].default_value = 5
    L(co.outputs["Object"], nz.inputs["Vector"])
    tint = N("ShaderNodeMix")
    tint.data_type = "RGBA"
    L(nz.outputs["Fac"], tint.inputs[0])
    tint.inputs[6].default_value = (*base, 1)
    tint.inputs[7].default_value = (base[0] * 0.97, base[1] * 0.94, base[2] * 0.88, 1)
    mx = N("ShaderNodeMix")
    mx.data_type = "RGBA"
    L(vr.outputs[0], mx.inputs[0])
    L(tint.outputs[2], mx.inputs[6])
    mx.inputs[7].default_value = (*vein, 1)
    L(mx.outputs[2], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = rough
    try:
        b.inputs["Subsurface Weight"].default_value = 0.08
        b.inputs["Subsurface Radius"].default_value = (0.6, 0.5, 0.4)
    except KeyError:
        pass
    bm_ = N("ShaderNodeBump")
    bm_.inputs["Strength"].default_value = 0.04 if polish else 0.2
    fine = N("ShaderNodeTexNoise")
    fine.inputs["Scale"].default_value = 40
    L(co.outputs["Object"], fine.inputs["Vector"])
    L(fine.outputs["Fac"], bm_.inputs["Height"])
    L(bm_.outputs["Normal"], b.inputs["Normal"])
    return m


def flat(name, color, rough=0.6, metal=0.0):
    m, nt, b = _mat(name)
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    return m


def paving(name):
    """Mermer döşeme: büyük levhalar, ince derzler."""
    m = marble(name, base=(0.78, 0.77, 0.74), rough=0.5, polish=False)
    nt = m.node_tree
    N, L = nt.nodes.new, nt.links.new
    b = nt.nodes["Principled BSDF"]
    src = b.inputs["Base Color"].links[0].from_socket
    br = N("ShaderNodeTexBrick")
    br.inputs["Scale"].default_value = 0.42
    br.inputs["Mortar Size"].default_value = 0.004
    br.inputs["Brick Width"].default_value = 1.0
    br.inputs["Row Height"].default_value = 0.6
    br.inputs["Color1"].default_value = (1, 1, 1, 1)
    br.inputs["Color2"].default_value = (0.92, 0.92, 0.9, 1)
    br.inputs["Mortar"].default_value = (0.35, 0.34, 0.32, 1)
    co = N("ShaderNodeTexCoord")
    L(co.outputs["Object"], br.inputs["Vector"])
    mul = N("ShaderNodeMix")
    mul.data_type = "RGBA"
    mul.blend_type = "MULTIPLY"
    mul.inputs[0].default_value = 1.0
    L(src, mul.inputs[6])
    L(br.outputs["Color"], mul.inputs[7])
    L(mul.outputs[2], b.inputs["Base Color"])
    return m


def relief(name):
    """Kabartmalı friz [K: akantus, rulo, fasces]: yüzeyde iç içe kıvrımlar (spiral rulolar)
    kabartı olarak; motiflerin tek tek modeli değil, ışıkta okunan derinlik."""
    m = marble(name, polish=False)
    nt = m.node_tree
    N, L = nt.nodes.new, nt.links.new
    b = nt.nodes["Principled BSDF"]
    co = N("ShaderNodeTexCoord")
    sep = N("ShaderNodeSeparateXYZ")
    L(co.outputs["Object"], sep.inputs[0])
    # rulo: x boyunca yinelenen dalga + her dalganın içinde spiral (voronoi uzaklığı)
    wv = N("ShaderNodeTexWave")
    wv.wave_type = "RINGS"
    wv.inputs["Scale"].default_value = 2.2
    wv.inputs["Distortion"].default_value = 2.5
    wv.inputs["Detail"].default_value = 4
    L(co.outputs["Object"], wv.inputs["Vector"])
    vo = N("ShaderNodeTexVoronoi")
    vo.inputs["Scale"].default_value = 2.4
    L(co.outputs["Object"], vo.inputs["Vector"])
    mx = N("ShaderNodeMath")
    mx.operation = "MULTIPLY"
    L(wv.outputs["Fac"], mx.inputs[0])
    L(vo.outputs["Distance"], mx.inputs[1])
    bump = N("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.9
    bump.inputs["Distance"].default_value = 0.04
    L(mx.outputs[0], bump.inputs["Height"])
    old = b.inputs["Normal"].links[0].from_node
    L(old.outputs["Normal"], bump.inputs["Normal"])
    L(bump.outputs["Normal"], b.inputs["Normal"])
    # kabartmanın dipleri hafif gölgeli (zamanla toz) [T]
    ao = N("ShaderNodeAmbientOcclusion")
    ao.inputs["Distance"].default_value = 0.08
    src = b.inputs["Base Color"].links[0].from_socket
    mul = N("ShaderNodeMix")
    mul.data_type = "RGBA"
    mul.blend_type = "MULTIPLY"
    mul.inputs[0].default_value = 0.6
    L(src, mul.inputs[6])
    L(ao.outputs["Color"], mul.inputs[7])
    L(mul.outputs[2], b.inputs["Base Color"])
    return m


def coffers(name):
    """Kasetli alt yüz (saçaklık ve korniş altları): kare kasetler, ortada rozet çukuru."""
    m = marble(name, polish=False)
    nt = m.node_tree
    N, L = nt.nodes.new, nt.links.new
    b = nt.nodes["Principled BSDF"]
    co = N("ShaderNodeTexCoord")
    br = N("ShaderNodeTexBrick")
    br.inputs["Scale"].default_value = 2.5
    br.inputs["Mortar Size"].default_value = 0.06
    br.inputs["Mortar Smooth"].default_value = 0.6
    br.inputs["Brick Width"].default_value = 0.4
    br.inputs["Row Height"].default_value = 0.4
    br.offset = 0.0
    L(co.outputs["Object"], br.inputs["Vector"])
    bump = N("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 1.0
    bump.inputs["Distance"].default_value = 0.05
    bump.invert = True
    L(br.outputs["Fac"], bump.inputs["Height"])
    L(bump.outputs["Normal"], b.inputs["Normal"])
    return m


MAT = {
    "mermer": marble("mermer"),
    "mermer_koyu": marble("mermer_koyu", base=(0.66, 0.64, 0.6), vein=(0.5, 0.48, 0.46)),  # [T] kaplama çeşitliliği
    "doseme": paving("doseme"),
    "tugla": flat("tugla", (0.45, 0.24, 0.16), 0.9),
    "ahsap": flat("ahsap", (0.28, 0.16, 0.08), 0.55),
    "bronz": flat("bronz", (0.55, 0.36, 0.18), 0.35, 0.9),
    "toprak": flat("toprak", (0.42, 0.36, 0.28), 0.95),
}
MAT["kabartma"] = relief("kabartma")
MAT["kaset"] = coffers("kaset")


# ------------------------------------------------------------------ geometri yardımcıları

def link(ob):
    scene.collection.objects.link(ob)
    return ob


def from_bm(name, bm, mat, smooth=False):
    if smooth:
        for f in bm.faces:
            f.smooth = True
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    me.materials.append(MAT[mat])
    return link(ob)


def box(name, x0, x1, y0, y1, z0, z1, mat="mermer"):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector(((v.co.x + 0.5) * (x1 - x0) + x0, (v.co.y + 0.5) * (y1 - y0) + y0, (v.co.z + 0.5) * (z1 - z0) + z0))
    return from_bm(name, bm, mat)


def lathe(name, prof, x, y, z, mat="mermer", segs=48, wobble=None):
    """Dönel profil: prof = [(r, z), ...] aşağıdan yukarı. wobble(theta, z) yarıçap çarpanı."""
    bm = bmesh.new()
    rings = []
    for r, zz in prof:
        ring = []
        for k in range(segs):
            t = 2 * math.pi * k / segs
            rr = r * (wobble(t, zz) if wobble else 1.0)
            ring.append(bm.verts.new((x + rr * math.cos(t), y + rr * math.sin(t), z + zz)))
        rings.append(ring)
    for a, b in zip(rings, rings[1:]):
        for k in range(segs):
            bm.faces.new((a[k], a[(k + 1) % segs], b[(k + 1) % segs], b[k]))
    bm.faces.new(rings[0][::-1])
    bm.faces.new(rings[-1])
    return from_bm(name, bm, mat, smooth=True)


def stepped(name, x0, x1, y_back, z, layers, mat="mermer"):
    """Silme dizisi: layers = [(yükseklik, öne çıkma), ...] aşağıdan yukarı; arka y_back sabit."""
    zz = z
    for h, proj in layers:
        box(name, x0 - proj * 0.3, x1 + proj * 0.3, y_back - proj, y_back, zz, zz + h, mat)
        zz += h
    return zz


def apply_cuts(target, cutters):
    for c in cutters:
        c.hide_render = c.hide_viewport = True
    for c in cutters:
        mod = target.modifiers.new("cut", "BOOLEAN")
        mod.operation = "DIFFERENCE"
        mod.object = c
        mod.solver = "EXACT"
        dg = bpy.context.evaluated_depsgraph_get()
        me = bpy.data.meshes.new_from_object(target.evaluated_get(dg))
        target.modifiers.clear()
        if len(me.polygons) < 6:
            print("   UYARI: kesim atlandi", c.name, flush=True)
            bpy.data.meshes.remove(me)
            continue
        old = target.data
        target.data = me
        bpy.data.meshes.remove(old)
    for c in cutters:
        bpy.data.objects.remove(c)


def arch_cutter(name, cx, y0, y1, z0, w, h):
    half = w / 2
    pts = [(-half, z0)] + [(math.cos(math.pi - math.pi * k / 20) * half, z0 + h - half + math.sin(math.pi - math.pi * k / 20) * half) for k in range(21)] + [(half, z0)]
    bm = bmesh.new()
    f = [bm.verts.new((cx + px, y0, pz)) for px, pz in pts]
    b = [bm.verts.new((cx + px, y1, pz)) for px, pz in pts]
    bm.faces.new(f[::-1])
    bm.faces.new(b)
    n = len(pts)
    for k in range(n):
        bm.faces.new((f[k], f[(k + 1) % n], b[(k + 1) % n], b[k]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return from_bm(name, bm, "mermer")


# ------------------------------------------------------------------ sütun düzenleri

def column(x, y, z, height, d, order):
    """Kaide üstünde Attik altlıklı, entasisli düz gövdeli sütun; kompozit ya da Korint başlık."""
    r = d / 2
    base_h = 0.5 * d
    cap_h = 1.15 * d if order == "korint" else 1.05 * d
    shaft_h = height - base_h - cap_h
    # Attik altlık: plinth, alt torus, skotia, üst torus
    box("plinth", x - r * 1.45, x + r * 1.45, y - r * 1.45, y + r * 1.45, z, z + base_h * 0.32)
    prof = [(r * 1.38, 0.0), (r * 1.4, base_h * 0.08), (r * 1.3, base_h * 0.3), (r * 1.12, base_h * 0.42),
            (r * 1.08, base_h * 0.55), (r * 1.2, base_h * 0.68), (r * 1.17, base_h * 0.86), (r * 1.04, base_h)]
    lathe("altlik", prof, x, y, z + base_h * 0.32 - 0.001)
    # gövde: entasis, üstte %15 incelir; kaide ve başlık halkaları
    sp = []
    for k in range(13):
        t = k / 12
        sp.append((r * (1 - 0.15 * t ** 1.4 + 0.02 * math.sin(math.pi * t)), base_h + t * shaft_h))
    lathe("govde", [(r * 1.06, base_h)] + sp + [(r * 0.94, base_h + shaft_h + 0.04)], x, y, z)
    # başlık: çan, iki sıra akantus, (kompozitte) iyon volütleri, kavisli abaküs
    zc = z + base_h + shaft_h
    rt = r * 0.86
    leaf = lambda t, zz: 1.0 + 0.14 * max(0.0, math.cos(8 * t)) ** 0.6 * (1 - zz / cap_h)  # noqa: E731
    lathe("akantus1", [(rt, 0), (rt * 1.15, cap_h * 0.18), (rt * 1.22, cap_h * 0.36), (rt * 1.1, cap_h * 0.42)], x, y, zc, wobble=leaf)
    leaf2 = lambda t, zz: 1.0 + 0.16 * max(0.0, math.cos(8 * t + math.pi / 8)) ** 0.6  # noqa: E731
    lathe("akantus2", [(rt * 0.95, cap_h * 0.25), (rt * 1.25, cap_h * 0.52), (rt * 1.32, cap_h * 0.66), (rt * 1.15, cap_h * 0.72)], x, y, zc, wobble=leaf2)
    lathe("can", [(rt, 0), (rt * 1.05, cap_h * 0.5), (rt * 1.3, cap_h * 0.86)], x, y, zc)
    a = r * 1.62
    box("abakus", x - a, x + a, y - a, y + a, zc + cap_h * 0.86, zc + cap_h)
    for sx in (-1, 1):
        for sy in (-1, 1):
            vz = zc + cap_h * (0.72 if order == "kompozit" else 0.78)
            vr = r * (0.36 if order == "kompozit" else 0.22)
            bm = bmesh.new()
            res = bmesh.ops.create_cone(bm, cap_ends=True, segments=16, radius1=vr, radius2=vr, depth=vr * 0.9)
            bmesh.ops.transform(bm, matrix=Matrix.Rotation(math.pi / 2, 4, "X") @ Matrix.Rotation(math.pi / 4 * (1 if sx * sy > 0 else -1), 4, "Y"), verts=res["verts"])
            bmesh.ops.translate(bm, vec=(x + sx * r * 1.18, y + sy * r * 1.18, vz), verts=res["verts"])
            from_bm("volut", bm, "mermer", smooth=True)


def pedestal(x0, x1, y0, y1, z, h):
    """Sütun kaidesi: alt silme, gövde (yazıt yüzü), üst silme."""
    box("kaide_alt", x0 - 0.08, x1 + 0.08, y0 - 0.08, y1 + 0.08, z, z + 0.18)
    box("kaide", x0, x1, y0, y1, z + 0.18, z + h - 0.16)
    box("kaide_ust", x0 - 0.07, x1 + 0.07, y0 - 0.07, y1 + 0.07, z + h - 0.16, z + h)


def entablature(x0, x1, y_front, y_back, z, h, dentils=True):
    """Arşitrav (üç fasya), friz, dişli ve konsollu korniş. Yükseklik h."""
    ah, fh, ch = h * 0.38, h * 0.27, h * 0.35
    for k in range(3):  # fasyalar, her biri biraz daha önde
        box("arsitrav", x0, x1, y_front - k * 0.02, y_back, z + k * ah / 3, z + (k + 1) * ah / 3)
    box("friz", x0, x1, y_front + 0.01, y_back, z + ah, z + ah + fh, "kabartma")
    box("kaset", x0 + 0.05, x1 - 0.05, y_front - 0.3, y_front - 0.02, z + ah + fh + ch * 0.44, z + ah + fh + ch * 0.46, "kaset")
    zc = z + ah + fh
    box("kornis_alt", x0 - 0.05, x1 + 0.05, y_front - 0.08, y_back, zc, zc + ch * 0.25)
    if dentils:
        n = int((x1 - x0) / 0.16)
        for i in range(n):
            xx = x0 + (i + 0.5) * (x1 - x0) / n
            box("dis", xx - 0.045, xx + 0.045, y_front - 0.16, y_front - 0.08, zc + ch * 0.25, zc + ch * 0.45)
    box("kornis", x0 - 0.16, x1 + 0.16, y_front - 0.34, y_back, zc + ch * 0.45, zc + ch * 0.78)
    box("sima", x0 - 0.2, x1 + 0.2, y_front - 0.38, y_back, zc + ch * 0.78, zc + ch)
    return z + h


def pediment(cx, w, y_front, y_back, z, kind):
    """Üçgen ya da segmental (yay) alınlık: çerçeve ve iç alan (timpanon)."""
    half = w / 2
    rise = w * 0.22 if kind == "ucgen" else w * 0.2
    pts = []
    if kind == "ucgen":
        pts = [(-half, 0), (0, rise), (half, 0)]
    else:
        R = (half ** 2 + rise ** 2) / (2 * rise)
        a0 = math.asin(half / R)
        pts = [(R * math.sin(-a0 + 2 * a0 * k / 24), R * math.cos(-a0 + 2 * a0 * k / 24) - (R - rise)) for k in range(25)]
    for name, inset, yf, th in (("alinlik_cerceve", 0.0, y_front - 0.3, 0.22), ("timpanon", 0.22, y_front - 0.05, None)):
        poly = [(px * (1 - inset / half), pz * (1 - inset / rise * 1.3)) for px, pz in pts]
        if th:  # çerçeve: dış hat boyunca kalınlık
            bm = bmesh.new()
            outer = pts
            inner = [(px * (1 - 0.3 / half), pz * (1 - 0.3 / rise) + 0.14) for px, pz in pts]
            ring = outer + inner[::-1]
            f = [bm.verts.new((cx + px, yf, z + pz)) for px, pz in ring]
            b = [bm.verts.new((cx + px, y_back, z + pz)) for px, pz in ring]
            n = len(ring)
            bm.faces.new(f)
            bm.faces.new(b[::-1])
            for k in range(n):
                bm.faces.new((f[k], b[k], b[(k + 1) % n], f[(k + 1) % n]))
            bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
            from_bm(name, bm, "mermer")
        else:
            bm = bmesh.new()
            f = [bm.verts.new((cx + px, yf, z + pz)) for px, pz in poly]
            b = [bm.verts.new((cx + px, y_back, z + pz)) for px, pz in poly]
            n = len(poly)
            bm.faces.new(f)
            bm.faces.new(b[::-1])
            for k in range(n - 1):
                bm.faces.new((f[k], b[k], b[k + 1], f[k + 1]))
            bm.faces.new((f[-1], b[-1], b[0], f[0]))
            bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
            from_bm(name, bm, "mermer")


# ------------------------------------------------------------------ yapı

def build():
    half = FW / 2
    # meydan ve sokak döşemesi [T]
    box("meydan", -40, 40, -40, 30, -0.3, 0.0, "doseme")
    n = 160
    u = np.linspace(-1, 1, n)
    xs = 1500 * np.sinh(3 * u) / np.sinh(3)
    X, Y = np.meshgrid(xs, xs)
    R = np.hypot(X, Y)
    Z = -0.35 + np.clip(R - 60, 0, None) * 0.0 + (R > 60) * (90 * (1 / (1 + np.exp(-(R - 300) / 80))) * (0.6 + 0.4 * np.sin(X * 0.004 + 1.3) * np.cos(Y * 0.003)))
    me = bpy.data.meshes.new("arazi")
    verts = np.stack([X.ravel(), Y.ravel(), Z.ravel()], 1)
    faces = [(j * n + i, j * n + i + 1, (j + 1) * n + i + 1, (j + 1) * n + i) for j in range(n - 1) for i in range(n - 1)]
    me.from_pydata(verts.tolist(), [], faces)
    for pp in me.polygons:
        pp.use_smooth = True
    ob = bpy.data.objects.new("arazi", me)
    me.materials.append(MAT["toprak"])
    link(ob)
    # dokuz basamak [K]
    for s in range(STEP_N):
        box("basamak", -half, half, -VEST - (STEP_N - s) * STEP_D, 0, s * STEP_H, (s + 1) * STEP_H, "doseme")
    # stilobat / vestibül zemini
    box("vestibul", -half, half, -VEST, 0.01, Z0 - 0.02, Z0, "doseme")
    # cephe duvarı ve yapı gövdesi; kapılar, pencereler, nişler [K]
    wall = box("cephe_duvar", -half + 0.4, half - 0.4, 0.0, WALL_T, Z0, Z_UP_TOP - 0.2)
    cuts = []
    for x, w, h in ((0.0, 2.3, 4.3), (-5.8, 1.75, 3.7), (5.8, 1.75, 3.7)):  # üç kapı, ortadaki en geniş
        cuts.append(box("kapi", x - w / 2, x + w / 2, -0.1, WALL_T + 0.1, Z0, Z0 + h))
        cuts.append(box("pencere_alt", x - 0.75, x + 0.75, -0.1, WALL_T + 0.1, Z0 + h + 0.55, Z0 + h + 1.5))  # ~0,9 x 1,9 kafesli
    zu = Z_LOW_TOP + UP["ped"]
    for x in UP_PAIRS:  # üst kat pencereleri, ~1,45 x 2,1 [K]
        cuts.append(box("pencere_ust", x - 0.72, x + 0.72, -0.1, WALL_T + 0.1, zu + 0.6, zu + 2.7))
    for x in LOW_PAIRS:  # erdem heykelleri için nişler [K]
        cuts.append(arch_cutter("nis", x, -0.05, 0.55, Z0 + LOW["ped"] + 0.2, 1.15, 3.1))
    apply_cuts(wall, cuts)
    # kapı kanatları (bronz) ve pencere kafesleri [T][K]
    for x, w, h in ((0.0, 2.3, 4.3), (-5.8, 1.75, 3.7), (5.8, 1.75, 3.7)):
        for side in (-1, 1):  # yarı açık iki kanat
            bm = bmesh.new()
            bmesh.ops.create_cube(bm, size=1.0)
            for v in bm.verts:
                v.co = Vector((v.co.x * w / 2, v.co.y * 0.08, v.co.z * h))
            bmesh.ops.transform(bm, matrix=Matrix.Rotation(side * math.radians(70), 4, "Z"), verts=bm.verts)
            bmesh.ops.translate(bm, vec=(x + side * w / 2 - side * math.cos(math.radians(70)) * w / 4, 0.55 + math.sin(math.radians(70)) * w / 4, Z0 + h / 2), verts=bm.verts)
            from_bm("kanat", bm, "bronz")
        grid(x, 0.5, Z0 + h + 0.55, 1.5, 0.95)
    for x in UP_PAIRS:
        grid(x, 0.5, zu + 0.6, 1.44, 2.1)
    # yapının gövdesi: yan duvarlar, arka duvar, düz çatı [K]
    back = WALL_T + HALL_D + WALL_T
    for sx in (-1, 1):
        box("yan_duvar", sx * (HALL_W / 2) - (WALL_T if sx < 0 else 0) * 1, sx * (HALL_W / 2) + (WALL_T if sx > 0 else 0), WALL_T, back, Z0, Z_UP_TOP - 1.2, "mermer_koyu")
    box("arka_duvar", -HALL_W / 2 - WALL_T, HALL_W / 2 + WALL_T, back - WALL_T, back, Z0, Z_UP_TOP - 1.2, "mermer_koyu")
    box("cati", -HALL_W / 2 - WALL_T, HALL_W / 2 + WALL_T, WALL_T, back, Z_UP_TOP - 1.2, Z_UP_TOP - 0.8, "tugla")
    hall(back)
    # alt düzen: kaideler, sütun çiftleri, öne çıkan saçaklık blokları [K]
    yc = -VEST + 0.75
    zl = Z0 + LOW["ped"]
    for px in LOW_PAIRS:
        pedestal(px - PAIR / 2 - 0.55, px + PAIR / 2 + 0.55, yc - 0.55, 0.0, Z0, LOW["ped"])
        for s in (-1, 1):
            # görsel hile [K]: dış çiftler biraz daha ince
            d = LOW["d"] * (0.94 if abs(px) > 5 else 1.0)
            column(px + s * PAIR / 2, yc, zl, LOW["col"], d, "kompozit")
        entablature(px - PAIR / 2 - 0.6, px + PAIR / 2 + 0.6, yc - 0.55, 0.0, zl + LOW["col"], LOW["ent"])
        # arkadaki pilastr çifti (duvarda)
        for s in (-1, 1):
            box("pilastr", px + s * PAIR / 2 - 0.3, px + s * PAIR / 2 + 0.3, -0.12, 0.0, zl, zl + LOW["col"])
    # çiftlerin arasında duvara yaslı geri çekilmiş saçaklık
    entablature(-half + 0.4, half - 0.4, -0.25, 0.0, zl + LOW["col"], LOW["ent"])
    # üst düzen: alt saçaklığın üstünde kaideler, kapıların üstünde sütun çiftleri, alınlıklar [K][F]
    yu = -0.75
    zu = Z_LOW_TOP + UP["ped"]
    for px in UP_PAIRS:
        pedestal(px - PAIR / 2 - 0.45, px + PAIR / 2 + 0.45, yu - 0.42, 0.0, Z_LOW_TOP, UP["ped"])
        for s in (-1, 1):
            column(px + s * PAIR / 2, yu, zu, UP["col"], UP["d"], "korint")
            box("pilastr", px + s * PAIR / 2 - 0.24, px + s * PAIR / 2 + 0.24, -0.1, 0.0, zu, zu + UP["col"])
        ze = entablature(px - PAIR / 2 - 0.5, px + PAIR / 2 + 0.5, yu - 0.42, 0.0, zu + UP["col"], UP["ent"])
        pediment(px, PAIR + 1.4, yu - 0.42, 0.0, ze, "segmental" if px == 0 else "ucgen")
    # üst kat yanlarında (alt çiftlerin üstünde) heykel kürsüleri [K]
    for px in LOW_PAIRS:
        pedestal(px - 0.7, px + 0.7, -0.9, 0.0, Z_LOW_TOP, UP["ped"] + 0.3)
    entablature(-half + 0.4, half - 0.4, -0.2, 0.0, zu + UP["col"], UP["ent"])
    # merdiven yanlarındaki yazıtlı kaideler (bağış heykelleri için) [K]
    for sx in (-1, 1):
        pedestal(sx * (half - 0.9) - 0.7, sx * (half - 0.9) + 0.7, -VEST - STEP_N * STEP_D, -VEST - STEP_N * STEP_D + 1.6, 0.0, 2.2)


def grid(cx, y, z0, w, h):
    """Taş pencere kafesi (kare ızgara) [K: FE V.1 s. 24 parçaları]."""
    n_x, n_z = max(3, int(w / 0.22)), max(3, int(h / 0.22))
    for i in range(1, n_x):
        x = cx - w / 2 + i * w / n_x
        box("kafes", x - 0.025, x + 0.025, y - 0.05, y + 0.05, z0, z0 + h)
    for j in range(1, n_z):
        z = z0 + j * h / n_z
        box("kafes", cx - w / 2, cx + w / 2, y - 0.05, y + 0.05, z - 0.025, z + 0.025)


def hall(back):
    """Okuma salonu: kürsü, iki katlı iç sütunlar ve galeri, kitap nişleri, apsis, düz tavan + oculus [K]."""
    y0, y1 = WALL_T, back - WALL_T
    x0, x1 = -HALL_W / 2, HALL_W / 2
    box("salon_zemin", x0, x1, y0, y1, Z0 - 0.05, Z0, "doseme")
    top = Z_UP_TOP - 1.2
    # kürsü 0,94 m, üç duvar boyunca, ~1,1 m derin
    pw = 1.1
    box("kursu_k", x0, x0 + pw, y0 + 1.6, y1, Z0, Z0 + PODIUM)
    box("kursu_g", x1 - pw, x1, y0 + 1.6, y1, Z0, Z0 + PODIUM)
    box("kursu_b", x0, x1, y1 - pw, y1, Z0, Z0 + PODIUM)
    # iç kaplama duvarları ve nişler: alt kat 2,55 m yüksek, 0,57 m derin [K]
    zg = Z0 + PODIUM + 3.3  # galeri katı [T]
    for zb in (Z0 + PODIUM + 0.25, zg + 0.25):
        # arka duvar: apsisin iki yanında 3'er niş, ~1,07 m
        for sx in (-1, 1):
            for k in range(3):
                xc = sx * (2.9 + k * 1.75)
                niche(xc, y1, zb, 1.07, "b")
        for sx in (-1, 1):  # yan duvarlar: 4'er niş, ~1,15–1,2 m
            for k in range(4):
                yc_ = y0 + 2.6 + k * 2.1
                niche(sx * HALL_W / 2, yc_, zb, 1.17, "k" if sx < 0 else "g")
    # apsis: büyük kemer, heykel kürsüsü; altında mezar odası [K]
    box("apsis_kursu", -1.3, 1.3, y1 - 0.2, y1 + 1.6, Z0, Z0 + PODIUM + 0.6)
    lathe("apsis_kemer", [(2.0, 0), (2.0, 0.6)], 0, y1 - 0.25, Z0 + 6.2, "mermer_koyu", segs=40)
    # iç sütunlar kürsünün kenarında, iki kat [K]
    for k in range(4):
        yc_ = y0 + 2.6 + k * 2.1 + 1.05
        for sx in (-1, 1):
            xx = sx * (HALL_W / 2 - pw + 0.25)
            column(xx, yc_, Z0 + PODIUM, 3.2, 0.42, "kompozit")
            column(xx, yc_, zg + 0.1, 2.7, 0.36, "korint")
    for k in range(5):
        xx = -5.6 + k * 2.8
        if abs(xx) < 1.5:
            continue
        column(xx, y1 - pw + 0.25, Z0 + PODIUM, 3.2, 0.42, "kompozit")
        column(xx, y1 - pw + 0.25, zg + 0.1, 2.7, 0.36, "korint")
    # galeri döşemesi ve korkuluk [K: üst galeri, balkon]
    box("galeri_k", x0, x0 + pw + 0.3, y0 + 1.6, y1, zg - 0.05, zg + 0.1, "mermer")
    box("galeri_g", x1 - pw - 0.3, x1, y0 + 1.6, y1, zg - 0.05, zg + 0.1, "mermer")
    box("galeri_b", x0, x1, y1 - pw - 0.3, y1, zg - 0.05, zg + 0.1, "mermer")
    for xx0, xx1, yy0, yy1 in ((x0 + pw + 0.25, x0 + pw + 0.3, y0 + 1.6, y1 - pw - 0.3), (x1 - pw - 0.3, x1 - pw - 0.25, y0 + 1.6, y1 - pw - 0.3), (x0 + pw + 0.3, x1 - pw - 0.3, y1 - pw - 0.3, y1 - pw - 0.25)):
        box("korkuluk", xx0, xx1, yy0, yy1, zg + 0.1, zg + 1.0, "bronz")
    # düz tavan, ortada oculus [K/T]
    ceil = box("tavan", x0, x1, y0, y1, top - 0.35, top - 0.05, "ahsap")
    apply_cuts(ceil, [box("oculus", -1.0, 1.0, (y0 + y1) / 2 - 1.0, (y0 + y1) / 2 + 1.0, top - 0.5, top + 0.2)])
    roof_hole = bpy.data.objects.get("cati")
    if roof_hole:
        apply_cuts(roof_hole, [box("oculus2", -1.0, 1.0, (y0 + y1) / 2 - 1.0, (y0 + y1) / 2 + 1.0, top - 0.5, top + 0.8)])
    # iç duvar kaplaması (mermer) ve kirişli tavan
    for xx in np.linspace(x0 + 1.4, x1 - 1.4, 7):
        box("kiris", xx - 0.12, xx + 0.12, y0, y1, top - 0.6, top - 0.35, "ahsap")


def niche(x, y, zb, w, wall):
    """Kitap nişi: mermer çerçeve, içinde ahşap dolap (armaria) ve rulolar [K][T]."""
    h, dpt = 2.55, 0.57
    if wall == "b":
        box("nis_ic", x - w / 2, x + w / 2, y - 0.05, y + 0.02, zb, zb + h, "ahsap")
        for sx in (-1, 1):
            box("nis_cerceve", x + sx * (w / 2 + 0.06) - 0.06, x + sx * (w / 2 + 0.06) + 0.06, y - 0.12, y, zb - 0.06, zb + h + 0.06)
        box("nis_cerceve", x - w / 2 - 0.12, x + w / 2 + 0.12, y - 0.12, y, zb + h, zb + h + 0.12)
        for r_ in range(4):
            box("raf", x - w / 2, x + w / 2, y - dpt, y, zb + r_ * h / 4, zb + r_ * h / 4 + 0.03, "ahsap")
    else:
        s = -1 if wall == "k" else 1
        box("nis_ic", x - s * 0.05, x + s * 0.02, y - w / 2, y + w / 2, zb, zb + h, "ahsap")
        for sy in (-1, 1):
            box("nis_cerceve", x - s * 0.12, x, y + sy * (w / 2 + 0.06) - 0.06, y + sy * (w / 2 + 0.06) + 0.06, zb - 0.06, zb + h + 0.06)
        box("nis_cerceve", x - s * 0.12, x, y - w / 2 - 0.12, y + w / 2 + 0.12, zb + h, zb + h + 0.12)


build()

# gerçek dokular (Poly Haven, CC0), varsa
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import antik_mimari as _AM  # noqa: E402
_AM.apply_dokular(args.dokular, "celsus")

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
SUN_ELEV = 38  # sabah, doğudan: cephe doğuya bakar [K]
sky.sun_elevation = math.radians(SUN_ELEV)
sky.sun_rotation = math.radians(-60)
w.node_tree.links.new(sky.outputs[0], bg.inputs[0])
bg.inputs[1].default_value = 0.25
sun = bpy.data.lights.new("gunes", "SUN")
sun.energy = 4.0
sun.color = (1.0, 0.9, 0.78)
sun.angle = math.radians(0.6)
so = link(bpy.data.objects.new("gunes", sun))
so.rotation_euler = (math.radians(90 - SUN_ELEV), 0, math.radians(-90 - 20))

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
cam.clip_end = 2000
co = link(bpy.data.objects.new("kamera", cam))
scene.camera = co
VIEWS = [
    ((0.0, -30.0, 1.7), (0.0, 0.0, 8.5), 30, 0.0),          # meydandan tam cephe
    ((-12.0, -16.0, 1.7), (1.0, 0.0, 7.0), 26, 0.0),        # güneydoğudan çapraz
    ((3.0, -6.5, 2.4), (-2.0, 0.0, 6.0), 18, 0.0),          # merdivenden alt düzen
    ((0.0, 2.2, Z0 + 1.6), (0.0, 13.0, Z0 + 3.5), 15, 0.8), # salonun içi, apsise doğru
]
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(os.path.abspath(args.out), "celsus-hd.blend"))
if not args.no_render:
    pick = [int(v) for v in args.views.split(",")] if args.views else range(len(VIEWS))
    for n in pick:
        pos, tgt, lens, ev = VIEWS[n]
        co.location = Vector(pos)
        co.rotation_euler = (Vector(tgt) - Vector(pos)).to_track_quat("-Z", "Y").to_euler()
        cam.lens = lens
        scene.view_settings.exposure = args.exposure + ev * 2.0
        r.filepath = os.path.join(os.path.abspath(args.out), f"celsus-hd-{n}.png")
        bpy.ops.render.render(write_still=True)
        print("VIEW", n, flush=True)
if args.pano:
    PANOS = [("meydan", (0.0, -14.0, 1.7), 90.0, 0.0), ("vestibul", (0.0, -1.2, Z0 + 1.6), 90.0, 0.2),
             ("salon", (0.0, 6.0, Z0 + 1.6), 90.0, 0.8)]
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
        r.filepath = os.path.join(os.path.abspath(args.out), f"celsus-360-{key}.jpg")
        bpy.ops.render.render(write_still=True)
        print("PANO", key, flush=True)

# ------------------------------------------------------------------ kıyas görünümleri
# Uygulamadaki "bugün / sağlamken" kaydırıcısı için: bugünkü fotoğrafın (src/lib/compare-views.ts)
# çekildiği yere yakın bir yerden, 3:2. Çıktı: <out>/celsus-kiyas-<ad>.jpg
KIYAS = [("cephe", (0.0, -17.0, 1.6), (0.0, 0.0, 8.2), 20)]
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
        r.filepath = os.path.join(os.path.abspath(args.out), f"celsus-kiyas-{key}.jpg")
        bpy.ops.render.render(write_still=True)
        print("KIYAS", key, flush=True)
print("BITTI", flush=True)
