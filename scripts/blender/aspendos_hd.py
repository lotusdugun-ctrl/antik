"""
Aspendos Tiyatrosu, HD, SAĞLAM DÖNEM (yaklaşık MS 170–180).

Yapı kartı: docs/yapi-kartlari/aspendos-tiyatrosu.md. [K]: çap 96 m, orkestra 23,9 m,
sahne cephesi (columnatio) 15,7 m, 41 sıra / tek diazoma / altta 10, üstte 21 merdiven,
iki kat x 20 sütun (altta İon, üstte Korint) dörderli gruplar, 5 kapı, ortada Dionysos'lu
üçgen alınlık, sahneye doğru eğimli ahşap çatı (8,1 m), velarium direkleri, 59 kemerli üst galeri.
Ayrıntılı oranlar ve aralıklar [T].

    blender -b --factory-startup --python scripts/blender/aspendos_hd.py -- ^
        --out hd-out\\aspendos [--res 1920x1080] [--samples 256] [--gpu] [--pano]

Eksenler: orkestranın merkezi (0, 0, 0); cavea y < 0 tarafında, sahne binası y > 0; z yukarı.
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
box, lathe, column, pedestal, entablature, pediment = AM.box, AM.lathe, AM.column, AM.pedestal, AM.entablature, AM.pediment

# ------------------------------------------------------------------ ölçüler
R_OUT = 48.0          # [K] çap 96 m
R_ORCH = 23.9 / 2     # [K]
ROWS = 41             # [K]
ROWS_LOW = 20         # [T] diazoma 20. sıradan sonra
RISE, TREAD = 0.40, 0.74   # [T] oturma basamağı
DIAZ = 1.6            # [T] diazoma genişliği
STAGE_H = 2.1         # [K] ~7 ft
STAGE_D = 7.0         # [T] sahne derinliği
FRONS_Y = STAGE_D     # sahne cephesinin duvar yüzü
FRONS_W = 62.0        # [T] sahne cephesi uzunluğu
COLUMNATIO = 15.7     # [K]
LOW = dict(ped=1.0, col=5.6, ent=0.95, d=0.62)   # [T] İon
UP = dict(ped=0.8, col=4.6, ent=0.85, d=0.52)    # [T] Korint
AEDIC = [-18.0, -9.0, 0.0, 9.0, 18.0]            # [T] 5 aedicula; kapılar bunların içinde [K: 5 kapı]

# ------------------------------------------------------------------ malzemeler
AM.MAT.update({
    "kirectasi": AM.marble("kirectasi", base=(0.78, 0.74, 0.66), vein=(0.7, 0.66, 0.6), rough=0.7, polish=False),
    "konglomera": AM.flat("konglomera", (0.62, 0.52, 0.42), 0.95),
    "mermer": AM.marble("mermer"),
    "ahsap": AM.flat("ahsap", (0.36, 0.22, 0.12), 0.6),
    "keten": AM.flat("keten", (0.86, 0.80, 0.68), 0.9),
    "toprak": AM.flat("toprak", (0.42, 0.37, 0.28), 0.95),
    "kabartma": AM.relief("kabartma"),
})
# konglomera duvara blok derzleri [K: düzgün konglomera bloklar]
_m = AM.MAT["konglomera"]
_nt = _m.node_tree
_b = _nt.nodes["Principled BSDF"]
_br = _nt.nodes.new("ShaderNodeTexBrick")
_br.inputs["Scale"].default_value = 0.8
_br.inputs["Mortar Size"].default_value = 0.008
_br.inputs["Brick Width"].default_value = 1.1
_br.inputs["Row Height"].default_value = 0.55
_br.inputs["Color1"].default_value = (0.66, 0.55, 0.44, 1)
_br.inputs["Color2"].default_value = (0.58, 0.49, 0.39, 1)
_br.inputs["Mortar"].default_value = (0.42, 0.36, 0.3, 1)
_co = _nt.nodes.new("ShaderNodeTexCoord")
_mp = _nt.nodes.new("ShaderNodeMapping")
_mp.inputs["Rotation"].default_value = (math.pi / 2, 0, 0)
_nt.links.new(_co.outputs["Object"], _mp.inputs["Vector"])
_nt.links.new(_mp.outputs[0], _br.inputs["Vector"])
_nt.links.new(_br.outputs["Color"], _b.inputs["Base Color"])
_nz = _nt.nodes.new("ShaderNodeTexNoise")
_nz.inputs["Scale"].default_value = 30
_bp = _nt.nodes.new("ShaderNodeBump")
_bp.inputs["Strength"].default_value = 0.5
_nt.links.new(_nz.outputs["Fac"], _bp.inputs["Height"])
_nt.links.new(_bp.outputs["Normal"], _b.inputs["Normal"])


# ------------------------------------------------------------------ cavea

def ring_solid(name, prof, a0=math.pi, a1=2 * math.pi, segs=160, mat="kirectasi"):
    """Yarım halka katı: prof = [(r, z), ...] kapalı kesit, a0..a1 açısı boyunca döndürülür."""
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


def cavea():
    """41 sıra, diazoma, kapalı yarım daire; kesit tek bir basamaklı profil."""
    r0 = R_ORCH + 1.4  # ön sıralar önünde geçit (proedria) [T]
    prof = [(r0, 0.0)]
    r, z = r0, 0.0
    rows_r = []
    for k in range(ROWS):
        if k == ROWS_LOW:  # diazoma: geniş bir geçit ve arkasında duvar
            prof += [(r, z + RISE * 0.5), (r + DIAZ, z + RISE * 0.5)]
            r += DIAZ
            z += RISE * 0.5
            prof += [(r, z + 1.6)]
            z += 1.6
        prof += [(r, z + RISE), (r + TREAD, z + RISE)]
        rows_r.append((r, z + RISE))
        r += TREAD
        z += RISE
    top_r, top_z = r, z
    prof += [(R_OUT, top_z), (R_OUT, -0.5), (r0, -0.5)]
    # profil saat yönünün tersine kapalı olmalı
    ring_solid("cavea", prof)
    # merdivenler: altta 10, üstte 21 [K]; her sıranın ortasında yarım basamak
    def stairs(n, k0, k1):
        for i in range(n):
            a = math.pi + math.pi * (i + 1) / (n + 1)
            for k in range(k0, k1):
                rr, zz = rows_r[k]
                for half in (0, 1):
                    r_a = rr + half * TREAD / 2
                    bm = bmesh.new()
                    bmesh.ops.create_cube(bm, size=1.0)
                    for v in bm.verts:
                        v.co = Vector((v.co.x * TREAD / 2 + TREAD / 4, v.co.y * 0.9, v.co.z * RISE / 2 + RISE / 4))
                    bmesh.ops.transform(bm, matrix=Matrix.Rotation(a, 4, "Z"), verts=bm.verts)
                    bmesh.ops.translate(bm, vec=(r_a * math.cos(a), r_a * math.sin(a), zz - RISE + half * RISE / 2), verts=bm.verts)
                    AM.from_bm("merdiven", bm, "kirectasi")
    stairs(10, 0, ROWS_LOW)
    stairs(21, ROWS_LOW, ROWS)
    # ön sıra: onur koltukları için yüksek arkalıklı sıra [K: senatörler, yargıçlar]
    ring_solid("proedria", [(r0 - 0.9, 0), (r0 - 0.1, 0), (r0 - 0.1, 0.45), (r0 - 0.25, 0.45), (r0 - 0.25, 1.05), (r0 - 0.9, 1.05)], mat="mermer")
    return top_r, top_z


def gallery(top_r, top_z):
    """En üstte 59 kemerli galeri [K]; dış duvar, payeler, düz örtü [T]; velarium direkleri [K]."""
    rin, rout = top_r + 0.3, R_OUT
    h = 4.2
    ring_solid("galeri_dis", [(rout - 0.9, top_z), (rout, top_z), (rout, top_z + h + 0.6), (rout - 0.9, top_z + h + 0.6)], mat="kirectasi")
    ring_solid("galeri_ortu", [(rin, top_z + h), (rout, top_z + h), (rout, top_z + h + 0.6), (rin, top_z + h + 0.6)], mat="kirectasi")
    n = 59
    for i in range(n + 1):
        a = math.pi + math.pi * i / n
        bm = bmesh.new()
        bmesh.ops.create_cube(bm, size=1.0)
        for v in bm.verts:
            v.co = Vector((v.co.x * 0.7, v.co.y * 0.75, v.co.z * h + h / 2))
        bmesh.ops.transform(bm, matrix=Matrix.Rotation(a, 4, "Z"), verts=bm.verts)
        bmesh.ops.translate(bm, vec=(rin * math.cos(a), rin * math.sin(a), top_z), verts=bm.verts)
        AM.from_bm("paye", bm, "kirectasi")
    # kemerler: payeler arasında yarım daire kemer şeritleri
    for i in range(n):
        a = math.pi + math.pi * (i + 0.5) / n
        span = rin * math.pi / n - 0.7
        bm = bmesh.new()
        pts = [(math.cos(math.pi * k / 16) * span / 2, math.sin(math.pi * k / 16) * span / 2) for k in range(17)]
        outer = [(px * 1.0, py + h - span / 2 - 0.35) for px, py in pts]
        verts_f = [bm.verts.new((px, -0.38, pz)) for px, pz in outer] + [bm.verts.new((span / 2 + 0.36, -0.38, h)), bm.verts.new((-span / 2 - 0.36, -0.38, h))]
        verts_b = [bm.verts.new((px, 0.38, pz)) for px, pz in outer] + [bm.verts.new((span / 2 + 0.36, 0.38, h)), bm.verts.new((-span / 2 - 0.36, 0.38, h))]
        poly_f = [verts_f[j] for j in list(range(17)) + [18, 17]]
        poly_b = [verts_b[j] for j in list(range(17)) + [18, 17]]
        bm.faces.new(poly_f)
        bm.faces.new(poly_b[::-1])
        m = len(poly_f)
        for j in range(m):
            bm.faces.new((poly_f[j], poly_b[j], poly_b[(j + 1) % m], poly_f[(j + 1) % m]))
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=Matrix.Rotation(a + math.pi / 2, 4, "Z"))
        bmesh.ops.translate(bm, vec=(rin * math.cos(a), rin * math.sin(a), top_z), verts=bm.verts)
        AM.from_bm("kemer", bm, "kirectasi")
    # velarium: dış duvarın üstünde 58 direk [K], aralarında gerili keten şeritler (yarı açık) [T]
    masts = []
    for i in range(58):
        a = math.pi + math.pi * (i + 0.5) / 58
        x, y = (rout - 0.45) * math.cos(a), (rout - 0.45) * math.sin(a)
        lathe("direk", [(0.13, 0), (0.1, 9.0)], x, y, top_z + h + 0.6, "ahsap", segs=10)
        masts.append((x, y, top_z + h + 9.0))
    for i in range(0, 58, 2):  # her ikinci direkten içe doğru bir şerit; sahnenin üstü açık
        x, y, z = masts[i]
        a = math.atan2(y, x)
        bm = bmesh.new()
        r1, r2 = rout - 0.5, rout - 22
        w1, w2 = 1.6, 0.9
        pts = [(r1, -w1), (r1, w1), (r2, w2), (r2, -w2)]
        vs = [bm.verts.new((rr * math.cos(a) - ww * math.sin(a), rr * math.sin(a) + ww * math.cos(a), z - (r1 - rr) * 0.16)) for rr, ww in pts]
        bm.faces.new(vs)
        AM.from_bm("velum", bm, "keten")


def stage_building(top_z):
    """Sahne, iki katlı sahne cephesi (5 aedicula, 5 kapı), yan kanatlar, eğimli ahşap çatı."""
    hw = FRONS_W / 2
    sb_top = STAGE_H + COLUMNATIO + 4.5  # [K: dışta ~25 m] cephenin üstünde attika
    # sahne binasının gövdesi (arka duvar ve kuleler) [K: konglomera bloklar]
    wall = box("sahne_duvar", -hw - 6, hw + 6, FRONS_Y, FRONS_Y + 3.2, -0.5, sb_top, "konglomera")
    cuts = []
    for i, x in enumerate(AEDIC):  # beş kapı [K]; ortadaki büyük
        w, h = (2.6, 4.6) if x == 0 else (1.8, 3.6)
        cuts.append(box("kapi", x - w / 2, x + w / 2, FRONS_Y - 0.1, FRONS_Y + 3.4, STAGE_H, STAGE_H + h))
    zu = STAGE_H + LOW["ped"] + LOW["col"] + LOW["ent"]
    for x in AEDIC:  # üst kat nişleri
        cuts.append(AM.arch_cutter("nis", x, FRONS_Y - 0.05, FRONS_Y + 0.7, zu + UP["ped"] + 0.3, 1.6, 3.4))
    for x in [-26.5, -13.5, -4.5, 4.5, 13.5, 26.5]:  # aediculaların arasında alt kat nişleri
        cuts.append(AM.arch_cutter("nis", x, FRONS_Y - 0.05, FRONS_Y + 0.6, STAGE_H + LOW["ped"] + 0.4, 1.4, 3.2))
    # dış (arka) yüzde iki sıra pencere [K: üst pencere sırası, konsollar]
    for x in np.linspace(-hw - 3, hw + 3, 14):
        for zz in (sb_top - 4.5, sb_top - 9.5):
            cuts.append(box("pencere", x - 0.6, x + 0.6, FRONS_Y + 2.0, FRONS_Y + 3.4, zz, zz + 1.8))
    AM.apply_cuts(wall, cuts)
    # kapı kanatları (ahşap), kapalı [T]
    for x in AEDIC:
        w, h = (2.6, 4.6) if x == 0 else (1.8, 3.6)
        box("kanat", x - w / 2, x + w / 2, FRONS_Y + 0.6, FRONS_Y + 0.7, STAGE_H, STAGE_H + h, "ahsap")
    # sahne (pulpitum): ahşap döşeme, önünde nişli taş cephe [K]
    box("sahne", -hw, hw, 0.0, FRONS_Y, STAGE_H - 0.15, STAGE_H, "ahsap")
    front = box("sahne_on", -hw, hw, -0.6, 0.0, -0.3, STAGE_H, "kirectasi")
    AM.apply_cuts(front, [AM.arch_cutter("ondur", x, -0.7, -0.3, 0.0, 0.7, 1.4) for x in np.linspace(-hw + 3, hw - 3, 11)])
    # orkestra döşemesi
    box("orkestra", -R_ORCH - 1.5, R_ORCH + 1.5, -R_ORCH - 1.5, 0.0, -0.3, 0.0, "kirectasi")
    # alt düzen: her aedicula 4 İon sütunu, ikişer ikişer; çıkıntılı saçaklık [K][T]
    zl = STAGE_H + LOW["ped"]
    for x in AEDIC:
        for sx in (-1, 1):
            xx = x + sx * (1.9 if x == 0 else 1.6)
            pedestal(xx - 0.5, xx + 0.5, FRONS_Y - 3.0, FRONS_Y, STAGE_H, LOW["ped"])
            for yy in (FRONS_Y - 2.55, FRONS_Y - 0.9):
                column(xx, yy, zl, LOW["col"], LOW["d"], "ion")
        span = 2.0 if x == 0 else 1.7
        entablature(x - span - 0.55, x + span + 0.55, FRONS_Y - 3.0, FRONS_Y, zl + LOW["col"], LOW["ent"])
    entablature(-hw, hw, FRONS_Y - 0.35, FRONS_Y, zl + LOW["col"], LOW["ent"])
    # üst düzen: aynı eksenlerde 4'er Korint sütunu, alınlıklar; ortada Dionysos'lu üçgen [K]
    for x in AEDIC:
        for sx in (-1, 1):
            xx = x + sx * (1.9 if x == 0 else 1.6)
            pedestal(xx - 0.42, xx + 0.42, FRONS_Y - 2.4, FRONS_Y, zu, UP["ped"])
            for yy in (FRONS_Y - 2.0, FRONS_Y - 0.7):
                column(xx, yy, zu + UP["ped"], UP["col"], UP["d"], "korint")
        span = 2.0 if x == 0 else 1.7
        ze = entablature(x - span - 0.45, x + span + 0.45, FRONS_Y - 2.4, FRONS_Y, zu + UP["ped"] + UP["col"], UP["ent"])
        kind = "ucgen" if x == 0 or abs(x) == 18.0 else "segmental"
        pediment(x, 2 * span + 1.4, FRONS_Y - 2.4, FRONS_Y, ze, kind)
    entablature(-hw, hw, FRONS_Y - 0.3, FRONS_Y, zu + UP["ped"] + UP["col"], UP["ent"])
    # ortadaki alınlığın timpanonu: Dionysos ve çiçek rulolu kabartma [K]
    for o in bpy.data.objects:
        if o.name.startswith("timpanon") and abs(o.data.vertices[0].co.x) < 3.5 + 0.1 and o.data.vertices[0].co.z > zu:
            o.data.materials[0] = AM.MAT["kabartma"]
    # eğimli ahşap çatı, 8,1 m, sahne cephesine doğru alçalır [K]
    zr = STAGE_H + COLUMNATIO + 0.8
    bm = bmesh.new()
    vs = [bm.verts.new(p) for p in ((-hw, FRONS_Y, zr), (hw, FRONS_Y, zr), (hw, FRONS_Y - 8.1, zr + 2.2), (-hw, FRONS_Y - 8.1, zr + 2.2))]
    bm.faces.new(vs)
    bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=0.25)
    AM.from_bm("cati", bm, "ahsap")
    for x in np.linspace(-hw, hw, 24):  # çatı kirişleri ve dış uçta konsollar
        bm = bmesh.new()
        bmesh.ops.create_cube(bm, size=1.0)
        L = math.hypot(8.1, 2.2)
        for v in bm.verts:
            v.co = Vector((v.co.x * 0.18, v.co.y * L, v.co.z * 0.3))
        bmesh.ops.transform(bm, matrix=Matrix.Rotation(-math.atan2(2.2, 8.1), 4, "X"), verts=bm.verts)
        bmesh.ops.translate(bm, vec=(x, FRONS_Y - 8.1 / 2, zr + 1.1 - 0.25), verts=bm.verts)
        AM.from_bm("kiris", bm, "ahsap")
    # yan kanatlar (versurae) ve kapalı parodoslar: sahne binasını caveaya bağlar [K]
    for sx in (-1, 1):
        x0, x1 = (hw, R_OUT) if sx > 0 else (-R_OUT, -hw)
        wing = box("kanat_duvar", x0, x1, -0.2, FRONS_Y + 3.2, -0.5, top_z + 4.8, "konglomera")
        # kapalı parodos: orkestraya açılan tonozlu geçit [K]; üstünde tribunal [K]
        AM.apply_cuts(wing, [box("parodos", x0 - 1, x1 + 1, 0.4, 4.2, 0.0, 4.6)])
        box("tribunal", x0 if sx > 0 else x1 - 5.0, x0 + 5.0 if sx > 0 else x1, -2.4, -0.2, 4.6, 5.4, "mermer")

def hill():
    """Cavea'nın yaslandığı akropol yamacı ve çevre arazi [K: kısmen tepeye yaslı]."""
    n = 140
    u = np.linspace(-1, 1, n)
    xs = 900 * np.sinh(3 * u) / np.sinh(3)
    X, Y = np.meshgrid(xs, xs)
    R = np.hypot(X, Y)
    Z = -0.5 + np.where(Y < -30, 1, 0) * np.clip((-Y - 30) * 0.35, 0, 14) * np.exp(-(X / 70) ** 2)
    Z = Z + (R > 200) * 25 * (1 / (1 + np.exp(-(R - 450) / 90)))
    me = bpy.data.meshes.new("arazi")
    verts = np.stack([X.ravel(), Y.ravel(), Z.ravel()], 1)
    faces = [(j * n + i, j * n + i + 1, (j + 1) * n + i + 1, (j + 1) * n + i) for j in range(n - 1) for i in range(n - 1)]
    me.from_pydata(verts.tolist(), [], faces)
    for p in me.polygons:
        p.use_smooth = True
    ob = bpy.data.objects.new("arazi", me)
    me.materials.append(AM.MAT["toprak"])
    AM.link(ob)


top_r, top_z = cavea()
gallery(top_r, top_z)
stage_building(top_z)
hill()

# gerçek dokular (Poly Haven, CC0), varsa
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import antik_mimari as _AM  # noqa: E402
_AM.apply_dokular(args.dokular, "aspendos")

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
    ((0.0, -40.0, 18.5), (0.0, 6.0, 9.0), 24),         # üst caveadan sahneye
    ((-26.0, -30.0, 17.5), (2.0, 5.0, 8.0), 22),       # yan caveadan çapraz
    ((0.0, -8.0, 1.7), (0.0, 7.0, 9.0), 18),           # orkestradan sahne cephesi
    ((6.0, 4.0, STAGE_H + 1.7), (-25.0, -30.0, 10.0), 16),  # sahneden caveaya
    ((70.0, 120.0, 30.0), (0.0, 0.0, 10.0), 28),        # dışarıdan, sahne binasının arkası
]
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(os.path.abspath(args.out), "aspendos-hd.blend"))
if not args.no_render:
    pick = [int(v) for v in args.views.split(",")] if args.views else range(len(VIEWS))
    for n in pick:
        pos, tgt, lens = VIEWS[n]
        co.location = Vector(pos)
        co.rotation_euler = (Vector(tgt) - Vector(pos)).to_track_quat("-Z", "Y").to_euler()
        cam.lens = lens
        scene.view_settings.exposure = args.exposure
        r.filepath = os.path.join(os.path.abspath(args.out), f"aspendos-hd-{n}.png")
        bpy.ops.render.render(write_still=True)
        print("VIEW", n, flush=True)
if args.pano:
    PANOS = [("orkestra", (0.0, -4.0, 1.7), 90.0), ("ust-cavea", (0.0, -38.0, 18.0), 90.0), ("sahne", (0.0, 3.0, STAGE_H + 1.7), -90.0)]
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
        r.filepath = os.path.join(os.path.abspath(args.out), f"aspendos-360-{key}.jpg")
        bpy.ops.render.render(write_still=True)
        print("PANO", key, flush=True)

# ------------------------------------------------------------------ kıyas görünümleri
# Uygulamadaki "bugün / sağlamken" kaydırıcısı için: bugünkü fotoğrafın (src/lib/compare-views.ts)
# çekildiği yere yakın bir yerden, 3:2. Çıktı: <out>/aspendos-kiyas-<ad>.jpg
KIYAS = [('sahne', (0.0, -42.0, 19.0), (0.0, 6.0, 8.0), 20)]
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
        r.filepath = os.path.join(os.path.abspath(args.out), f"aspendos-kiyas-{key}.jpg")
        bpy.ops.render.render(write_still=True)
        print("KIYAS", key, flush=True)
print("BITTI", flush=True)
