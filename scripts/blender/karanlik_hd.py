"""
Karanlık Kilise manastırı, HD, SAĞLAM DÖNEM (yaklaşık 1100): avlu ve iki katlı cephe.

Yapı kartı: docs/yapi-kartlari/karanlik-kilise.md. Her ölçünün kaynağı/etiketi orada.
Bu sürüm (v1): kaya kütlesi, 5 x 14 m avlu, alt kat cephesi (kapılar, 19 kör niş,
Malta haçlı madalyonlar, pilastrlar, silmeler), alt revakın sağlam tavanı, üst revak
(sağlam ön duvar, sırayla kubbeli ve tonozlu bölmeler, narteks penceresi), kuzeydeki
merdiven girişi. Kilisenin içi (narteks + beş kubbeli naos) bir sonraki adımda.

    blender -b --factory-startup --python scripts/blender/karanlik_hd.py -- ^
        --out hd-out\\karanlik [--res 1920x1080] [--samples 128] [--gpu]

Eksenler (metre): x cephe boyunca (0 = güney ucu, 14 = kuzey ucu), y < 0 avlu (batı),
y > 0 kayanın içi (doğu), z yukarı; avlu tabanı z = 0.
"""
import argparse
import math
import os
import sys

import bpy  # noqa: I001
import bmesh
import numpy as np
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument("--out", required=True)
ap.add_argument("--dokular", default="", help="Poly Haven dokuları klasörü (gorseller-ai\\dokular)")
ap.add_argument("--res", default="1600x900")
ap.add_argument("--samples", type=int, default=64)
ap.add_argument("--gpu", action="store_true")
ap.add_argument("--no-render", action="store_true")
ap.add_argument("--exposure", type=float, default=-2.0)
ap.add_argument("--frescoes", default="", help="fresk fotoğrafları klasörü (karanlik-freskler.json'daki anahtarlar .jpg)")
ap.add_argument("--pano", action="store_true", help="uygulama için 360° panoramalar")
ap.add_argument("--pano-res", default="4096x2048")
ap.add_argument("--pano-samples", type=int, default=0)
ap.add_argument("--views", default="", help="virgülle görünüm numaraları, ör. 0,2")
args = ap.parse_args(argv)
os.makedirs(args.out, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

# ------------------------------------------------------------------ ölçüler (yapı kartı §3, §6)
COURT_W, COURT_D = 14.0, 5.0          # [K] avlu ~5 x 14 m
LOW_H = 6.4                           # [T] alt kat yüksekliği (fotoğraftan)
UP_H = 3.0                            # [T] üst revak oda yüksekliği (kubbeler hariç)
PORTICO_D = 2.6                       # [T] alt revak tavanının / üst revakın derinliği
SLAB = 0.5                            # [T] alt revak tavanı = üst revak tabanı kalınlığı
GROUPS = [3, 2, 3, 2, 3, 3, 3]        # [F] 19 kör niş, pilastrlar arası gruplar
NICHE_W, NICHE_H, NICHE_D = 0.5, 1.5, 0.2
ARC_Z0 = 3.05                         # nişlerin tabanı
MOULD = [(2.62, 2.86), (5.0, 5.22)]   # [F] niş bandının altındaki ve üstündeki silmeler
UP_BAYS = 5                           # [T] üst revakta bölme sayısı

# ------------------------------------------------------------------ gürültü
_PERM = np.random.default_rng(7).permutation(4096)


def _hash(ix, iy, iz):
    return (_PERM[(ix * 73856093 ^ iy * 19349663 ^ iz * 83492791) & 4095] / 4095.0) * 2 - 1


def vnoise(x, y, z):
    x, y, z = np.asarray(x, float), np.asarray(y, float), np.asarray(z, float)
    x0, y0, z0 = np.floor(x).astype(np.int64), np.floor(y).astype(np.int64), np.floor(z).astype(np.int64)
    fx, fy, fz = x - x0, y - y0, z - z0
    ux, uy, uz = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy), fz * fz * (3 - 2 * fz)
    out = 0.0
    for dx in (0, 1):
        for dy in (0, 1):
            for dz in (0, 1):
                w = (ux if dx else 1 - ux) * (uy if dy else 1 - uy) * (uz if dz else 1 - uz)
                out = out + w * _hash(x0 + dx, y0 + dy, z0 + dz)
    return out


def fbm(x, y, z, octaves=5):
    total, amp, f = 0.0, 1.0, 1.0
    for _ in range(octaves):
        total = total + amp * vnoise(np.asarray(x) * f, np.asarray(y) * f, np.asarray(z) * f)
        amp *= 0.5
        f *= 2.03
    return total


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


# ------------------------------------------------------------------ malzemeler

def _new_mat(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    return m, nt, nt.nodes["Principled BSDF"]


def tuff_material(name, base, crust=0.0, chisel=0.0, masonry=0.0):
    """Tüf: açık krem; yontulmuş yüzeylerde çapraz keski izleri, dış kayada gri-kahve
    kabuk; istenirse kırmızı aşı boyasıyla taş örgü taklidi çizgiler [K][F]."""
    m, nt, bsdf = _new_mat(name)
    N, L = nt.nodes.new, nt.links.new
    bsdf.inputs["Roughness"].default_value = 0.93
    co = N("ShaderNodeTexCoord")
    big = N("ShaderNodeTexNoise")
    big.inputs["Scale"].default_value = 0.25
    big.inputs["Detail"].default_value = 6
    L(co.outputs["Object"], big.inputs["Vector"])
    ramp = N("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (*[c * 0.9 for c in base], 1)
    ramp.color_ramp.elements[1].color = (*[min(1, c * 1.06) for c in base], 1)
    L(big.outputs["Fac"], ramp.inputs["Fac"])
    color = ramp.outputs["Color"]
    if crust:
        # yağmur ve likenle koyulaşmış dış kabuk; yukarı bakan yüzlerde ve tepede daha çok
        cn = N("ShaderNodeTexNoise")
        cn.inputs["Scale"].default_value = 0.6
        cn.inputs["Detail"].default_value = 8
        L(co.outputs["Object"], cn.inputs["Vector"])
        cr = N("ShaderNodeMapRange")
        cr.inputs["From Min"].default_value = 0.42
        cr.inputs["From Max"].default_value = 0.62
        cr.inputs["To Max"].default_value = crust
        L(cn.outputs["Fac"], cr.inputs["Value"])
        cm = N("ShaderNodeMix")
        cm.data_type = "RGBA"
        L(cr.outputs[0], cm.inputs[0])
        L(color, cm.inputs[6])
        cm.inputs[7].default_value = (0.42, 0.38, 0.33, 1)
        color = cm.outputs[2]
        # dikey yağmur izleri
        sm = N("ShaderNodeMapping")
        sm.inputs["Scale"].default_value = (2.5, 2.5, 0.2)
        L(co.outputs["Object"], sm.inputs["Vector"])
        sn = N("ShaderNodeTexNoise")
        sn.inputs["Scale"].default_value = 1.4
        L(sm.outputs[0], sn.inputs["Vector"])
        sr = N("ShaderNodeMapRange")
        sr.inputs["From Min"].default_value = 0.5
        sr.inputs["From Max"].default_value = 0.75
        sr.inputs["To Min"].default_value = 1.0
        sr.inputs["To Max"].default_value = 0.72
        L(sn.outputs["Fac"], sr.inputs["Value"])
        mul = N("ShaderNodeMix")
        mul.data_type = "RGBA"
        mul.blend_type = "MULTIPLY"
        mul.inputs[0].default_value = 1.0
        L(color, mul.inputs[6])
        cc = N("ShaderNodeCombineColor")
        for i in range(3):
            L(sr.outputs[0], cc.inputs[i])
        L(cc.outputs[0], mul.inputs[7])
        color = mul.outputs[2]
    if masonry:
        # kırmızı çizgilerle taş örgü taklidi (Barbara, Karanlık üst revak) [K][F]
        br = N("ShaderNodeTexBrick")
        br.inputs["Scale"].default_value = 1.0
        br.inputs["Mortar Size"].default_value = 0.01
        br.inputs["Brick Width"].default_value = 0.7
        br.inputs["Row Height"].default_value = 0.32
        br.inputs["Color1"].default_value = (1, 1, 1, 1)
        br.inputs["Color2"].default_value = (1, 1, 1, 1)
        br.inputs["Mortar"].default_value = (0.0, 0.0, 0.0, 1)
        mp = N("ShaderNodeMapping")
        mp.inputs["Rotation"].default_value = (math.pi / 2, 0, 0)
        L(co.outputs["Object"], mp.inputs["Vector"])
        L(mp.outputs[0], br.inputs["Vector"])
        inv = N("ShaderNodeMath")
        inv.operation = "GREATER_THAN"
        inv.inputs[1].default_value = 0.5
        L(br.outputs["Fac"], inv.inputs[0])
        k = N("ShaderNodeMath")
        k.operation = "MULTIPLY"
        k.inputs[1].default_value = masonry
        L(inv.outputs[0], k.inputs[0])
        mm = N("ShaderNodeMix")
        mm.data_type = "RGBA"
        L(k.outputs[0], mm.inputs[0])
        L(color, mm.inputs[6])
        mm.inputs[7].default_value = (0.55, 0.13, 0.07, 1)
        color = mm.outputs[2]
    L(color, bsdf.inputs["Base Color"])
    # kabartı: ince tane + keski izleri (çapraz, eğik dalgalar)
    fine = N("ShaderNodeTexNoise")
    fine.inputs["Scale"].default_value = 18
    fine.inputs["Detail"].default_value = 8
    L(co.outputs["Object"], fine.inputs["Vector"])
    h = fine.outputs["Fac"]
    if chisel:
        for rot in (0.6, -0.5):
            cm2 = N("ShaderNodeMapping")
            cm2.inputs["Rotation"].default_value = (rot, rot * 0.7, 0.3)
            L(co.outputs["Object"], cm2.inputs["Vector"])
            wv = N("ShaderNodeTexWave")
            wv.inputs["Scale"].default_value = 9.0
            wv.inputs["Distortion"].default_value = 3.0
            wv.inputs["Detail"].default_value = 2
            L(cm2.outputs[0], wv.inputs["Vector"])
            ad = N("ShaderNodeMath")
            ad.operation = "MULTIPLY_ADD"
            ad.inputs[1].default_value = chisel
            L(wv.outputs["Fac"], ad.inputs[0])
            L(h, ad.inputs[2])
            h = ad.outputs[0]
    bmp = N("ShaderNodeBump")
    bmp.inputs["Strength"].default_value = 0.45
    bmp.inputs["Distance"].default_value = 0.015
    L(h, bmp.inputs["Height"])
    L(bmp.outputs["Normal"], bsdf.inputs["Normal"])
    return m


def paint_material(name, kind):
    """Taze aşı boyası çıkartmaları (sağlam dönem: tam ve canlı).
    kind 'malta': daire içinde Malta haçı; 'serit': kırmızı-beyaz dama şeridi."""
    m, nt, bsdf = _new_mat(name)
    N, L = nt.nodes.new, nt.links.new
    bsdf.inputs["Roughness"].default_value = 0.9
    bsdf.inputs["Base Color"].default_value = (0.52, 0.12, 0.06, 1)
    co = N("ShaderNodeTexCoord")
    sep = N("ShaderNodeSeparateXYZ")
    L(co.outputs["Object"], sep.inputs[0])

    def mth(op, a, b=None):
        n = N("ShaderNodeMath")
        n.operation = op
        for i, x in enumerate((a, b)):
            if x is None:
                continue
            if isinstance(x, (int, float)):
                n.inputs[i].default_value = x
            else:
                L(x, n.inputs[i])
        return n.outputs[0]

    x, z = sep.outputs["X"], sep.outputs["Z"]
    if kind == "malta":
        R = 0.2
        rr = mth("DIVIDE", mth("SQRT", mth("ADD", mth("MULTIPLY", x, x), mth("MULTIPLY", z, z))), R)
        a = N("ShaderNodeMath")
        a.operation = "ARCTAN2"
        L(z, a.inputs[0])
        L(x, a.inputs[1])
        q = mth("FLOORED_MODULO", mth("ADD", a.outputs[0], math.pi / 4), math.pi / 2)
        off = mth("ABSOLUTE", mth("SUBTRACT", q, math.pi / 4))
        # kollar dışa doğru genişleyen kamalar, uçları çentikli
        arm = mth("LESS_THAN", off, mth("ADD", 0.08, mth("MULTIPLY", rr, 0.5)))
        notch = mth("GREATER_THAN", mth("ADD", rr, mth("MULTIPLY", off, 1.6)), 0.98)
        arm = mth("MULTIPLY", mth("MULTIPLY", arm, mth("LESS_THAN", rr, 0.86)), mth("SUBTRACT", 1.0, notch))
        ring = mth("MULTIPLY", mth("GREATER_THAN", rr, 0.9), mth("LESS_THAN", rr, 1.0))
        mask = mth("MAXIMUM", arm, ring)
    else:  # serit: dama
        cx = mth("FLOOR", mth("DIVIDE", x, 0.06))
        cz = mth("FLOOR", mth("DIVIDE", z, 0.06))
        mask = mth("FLOORED_MODULO", mth("ADD", cx, cz), 2.0)
    tr = N("ShaderNodeBsdfTransparent")
    mx = N("ShaderNodeMixShader")
    L(mask, mx.inputs[0])
    L(tr.outputs[0], mx.inputs[1])
    L(bsdf.outputs[0], mx.inputs[2])
    out = next(n for n in nt.nodes if n.type == "OUTPUT_MATERIAL")
    L(mx.outputs[0], out.inputs["Surface"])
    return m


MAT = {
    "kaya": tuff_material("kaya", (0.62, 0.53, 0.40), crust=0.8, chisel=0.0),
    "yontu": tuff_material("yontu", (0.68, 0.60, 0.47), chisel=0.4),
    "revak": tuff_material("revak", (0.70, 0.62, 0.50), chisel=0.25, masonry=0.85),
    "malta": paint_material("malta", "malta"),
    "serit": paint_material("serit", "serit"),
}


def toprak_material():
    m, nt, bsdf = _new_mat("toprak")
    N, L = nt.nodes.new, nt.links.new
    co = N("ShaderNodeTexCoord")
    n = N("ShaderNodeTexNoise")
    n.inputs["Scale"].default_value = 0.4
    n.inputs["Detail"].default_value = 8
    L(co.outputs["Object"], n.inputs["Vector"])
    r = N("ShaderNodeValToRGB")
    r.color_ramp.elements[0].color = (0.42, 0.34, 0.26, 1)
    r.color_ramp.elements[1].color = (0.62, 0.54, 0.43, 1)
    L(n.outputs["Fac"], r.inputs["Fac"])
    L(r.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.97
    b = N("ShaderNodeBump")
    b.inputs["Strength"].default_value = 0.5
    L(n.outputs["Fac"], b.inputs["Height"])
    L(b.outputs["Normal"], bsdf.inputs["Normal"])
    return m


MAT["toprak"] = toprak_material()
MAT["fresk"] = None  # fresco_material() aşağıda tanımlı; build()'den önce kurulur


# ------------------------------------------------------------------ yardımcılar

def link(ob):
    scene.collection.objects.link(ob)
    return ob


def from_bm(name, bm, mat, loc=(0, 0, 0), smooth=False):
    if smooth:
        for f in bm.faces:
            f.smooth = True
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    ob.location = loc
    me.materials.append(MAT[mat])
    return link(ob)


def box(name, x0, x1, y0, y1, z0, z1, mat="yontu"):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector(((v.co.x + 0.5) * (x1 - x0) + x0, (v.co.y + 0.5) * (y1 - y0) + y0, (v.co.z + 0.5) * (z1 - z0) + z0))
    return from_bm(name, bm, mat)


def rough_box(name, x0, x1, y0, y1, z0, z1, amp=0.35, seed=1.0, flat=()):
    """Kaba oyulmuş boşluk: yüzleri gürültüyle oynatılmış kutu. `flat` içindeki
    yüzler ('x0','x1','y0','y1','z0','z1') düz kalır (yontulmuş cephe, taban)."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=34, use_grid_fill=True)
    for v in bm.verts:
        u, w, t = v.co.x + 0.5, v.co.y + 0.5, v.co.z + 0.5
        x, y, z = x0 + u * (x1 - x0), y0 + w * (y1 - y0), z0 + t * (z1 - z0)
        # fade the roughness out towards the faces that stay flat, so nothing folds over
        k = 1.0
        dist = {"x0": x - x0, "x1": x1 - x, "y0": y - y0, "y1": y1 - y, "z0": z - z0, "z1": z1 - z}
        for key in flat:
            k = min(k, float(smoothstep(0.0, 4 * amp, dist[key])))
        if k:
            n = [float(fbm(x * 0.35 + o, y * 0.35, z * 0.35 + seed, 4)) for o in (0.0, 17.0, 31.0)]
            x += amp * k * n[0]
            y += amp * k * n[1]
            z += amp * k * n[2]
        v.co = Vector((x, y, z))
    return from_bm(name, bm, "yontu", smooth=True)


def arch_prism(name, cx, y0, y1, z0, width, height, horseshoe=1.0, mat="yontu"):
    """Kemerli açıklık (kapı, pencere, niş): yay biçimli profil, y0..y1 boyunca."""
    half = width / 2
    r = half * horseshoe
    spring = z0 + height - r
    start = math.acos(min(1.0, half / r))
    pts = [(-half, z0)]
    for k in range(25):
        a = math.pi + start - (math.pi + 2 * start) * k / 24
        pts.append((math.cos(a) * r, spring + math.sin(a) * r))
    pts.append((half, z0))
    bm = bmesh.new()
    f = [bm.verts.new((cx + x, y0, z)) for x, z in pts]
    b = [bm.verts.new((cx + x, y1, z)) for x, z in pts]
    bm.faces.new(f[::-1])
    bm.faces.new(b)
    n = len(pts)
    for k in range(n):
        bm.faces.new((f[k], f[(k + 1) % n], b[(k + 1) % n], b[k]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return from_bm(name, bm, mat)


def cyl(name, center, radius, length, axis, mat="yontu", segs=48):
    import mathutils
    bm = bmesh.new()
    res = bmesh.ops.create_cone(bm, cap_ends=True, segments=segs, radius1=radius, radius2=radius, depth=length)
    if axis == "x":
        bmesh.ops.transform(bm, matrix=mathutils.Matrix.Rotation(math.pi / 2, 4, "Y"), verts=res["verts"])
    elif axis == "y":
        bmesh.ops.transform(bm, matrix=mathutils.Matrix.Rotation(math.pi / 2, 4, "X"), verts=res["verts"])
    return from_bm(name, bm, mat, center)


def sphere(name, center, radius, mat="yontu"):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=24, radius=radius)
    return from_bm(name, bm, mat, center)


def apply_cuts(target, cutters):
    """Kesicileri tek tek uygula; çözücü kayayı çökertirse o kesiciyi atla."""
    print("  kesim", target.name, len(cutters), flush=True)
    for c in cutters:
        c.hide_render = c.hide_viewport = True
    for c in cutters:
        before = len(target.data.polygons)
        ok = False
        for attempt in range(4):
            if attempt:  # exact solver tripped on a degenerate overlap: nudge the cutter and retry
                c.location.x += 0.0137 * attempt
                c.location.y -= 0.0091 * attempt
                c.location.z += 0.0053 * attempt
            mod = target.modifiers.new("cut", "BOOLEAN")
            mod.operation = "DIFFERENCE"
            mod.object = c
            mod.solver = "EXACT"
            mod.material_mode = "TRANSFER"
            mod.use_hole_tolerant = attempt < 2
            dg = bpy.context.evaluated_depsgraph_get()
            me = bpy.data.meshes.new_from_object(target.evaluated_get(dg))
            target.modifiers.clear()
            if len(me.polygons) >= max(200, before * 0.1):
                ok = True
                break
            bpy.data.meshes.remove(me)
        if not ok:
            print("   UYARI: kesim atlandi", c.name, flush=True)
            continue
        if attempt:
            print("   kesim", c.name, "deneme", attempt, flush=True)
        old = target.data
        target.data = me
        bpy.data.meshes.remove(old)
    for c in cutters:
        bpy.data.objects.remove(c)


# ------------------------------------------------------------------ kaya kütlesi [F]

def massif():
    """Avlunun oyulduğu büyük tüf kütlesi: önü düzensiz, tepesi sivri çıkıntılı."""
    x0, x1, y0, y1, z0, z1 = -11.0, 26.0, -COURT_D - 0.6, 20.0, -4.0, 13.0
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=44, use_grid_fill=True)
    for v in bm.verts:
        u, w, t = v.co.x + 0.5, v.co.y + 0.5, v.co.z + 0.5
        x, y, z = x0 + u * (x1 - x0), y0 + w * (y1 - y0), z0 + t * (z1 - z0)
        # one smooth deformation of the whole block (no face-by-face jumps, so it never folds):
        # broken peaks on top, a hollowed and bulging front, wavering ends
        top = t ** 3
        peaks = 7.0 * np.clip(fbm(x * 0.09, y * 0.09, 3.0, 4) + 0.35, 0, None) ** 1.3
        z += top * (float(peaks) + 1.5 * float(fbm(x * 0.4, y * 0.4, 9, 3)))
        y += (1 - w) ** 6 * 1.3 * float(fbm(x * 0.12, z * 0.12, 5.0, 5)) * float(smoothstep(-4.0, -3.0, z))
        side = u ** 6 + (1 - u) ** 6
        x += side * (1 if u > 0.5 else -1) * 1.5 * float(fbm(y * 0.12, z * 0.12, 7.0, 3))
        v.co = Vector((x, y, z))
    return from_bm("kaya", bm, "kaya", smooth=True)


def ground():
    # the valley floor, rising to tuff hills towards the horizon
    n = 200
    u = np.linspace(-1, 1, n)
    xs = 600 * np.sinh(3 * u) / np.sinh(3)
    X, Y = np.meshgrid(xs, xs)
    R = np.hypot(X - 7, Y + 30)
    Z = -3.6 + 0.5 * fbm(X * 0.05, Y * 0.05, 1, 4) - 0.04 * np.clip(-Y - 9, 0, None)
    Z = Z + smoothstep(60, 400, R) * (40 + 30 * fbm(X * 0.01, Y * 0.01, 4, 4))
    me = bpy.data.meshes.new("zemin")
    verts = np.stack([X.ravel(), Y.ravel(), Z.ravel()], 1)
    faces = [(j * n + i, j * n + i + 1, (j + 1) * n + i + 1, (j + 1) * n + i) for j in range(n - 1) for i in range(n - 1)]
    me.from_pydata(verts.tolist(), [], faces)
    for p in me.polygons:
        p.use_smooth = True
    ob = bpy.data.objects.new("zemin", me)
    me.materials.append(MAT["toprak"])
    return link(ob)


# ------------------------------------------------------------------ avlu ve cephe

def niche_xs():
    """19 niş: pilastrlarla ayrılmış gruplar [F]."""
    n_g = len(GROUPS)
    pan = COURT_W / n_g
    xs, pil = [], []
    for g, k in enumerate(GROUPS):
        c = (g + 0.5) * pan
        for j in range(k):
            xs.append(c + (j - (k - 1) / 2) * (NICHE_W + 0.16))
        pil.append(g * pan)
    pil.append(COURT_W)
    return xs, pil, pan


def build():
    rock = massif()
    ground()
    cuts = []
    # 1) avlu: göğe açık kısım (y < -PORTICO_D) ve alt revak (tavanı sağlam) [K][T]
    cuts.append(rough_box("avlu", 0, COURT_W, -14, -PORTICO_D, 0, 40, amp=0.45, flat=("z0", "y1")))
    cuts.append(box("alt_revak", 0, COURT_W, -PORTICO_D - 0.01, 0, 0, LOW_H))
    # 2) alt kat cephesi y = 0: silmeler çıkıntılı kalsın diye aradaki yüzeyler geri çekilir
    xs, pil, pan = niche_xs()
    cuts.append(box("alt_duvar", 0.0, COURT_W, -0.01, 0.12, 0.0, MOULD[0][0]))
    cuts.append(box("ust_duvar", 0.0, COURT_W, -0.01, 0.12, MOULD[1][1], LOW_H))
    for g in range(len(GROUPS)):  # pilastrlar arası panolar
        cuts.append(box("pano", pil[g] + 0.17, pil[g + 1] - 0.17, -0.01, 0.07, MOULD[0][1], MOULD[1][0]))
    for i, x in enumerate(xs):  # anahtar deliği biçimli kör nişler [K]
        cuts.append(arch_prism(f"nis{i}", x, -0.01, NICHE_D, ARC_Z0, NICHE_W, NICHE_H, 1.2))
    # kapılar: yemekhane (en sol), iki oda kapısı; üstlerinde lünetler [K][F]
    for name, x in (("yemekhane", 1.0), ("oda1", 5.0), ("oda2", 11.0)):
        cuts.append(box(f"kapi_{name}", x - 0.5, x + 0.5, -0.01, 2.2, 0.0, 2.15))
        cuts.append(arch_prism(f"lunet_{name}", x, -0.01, 0.16, 2.2, 1.2, 0.6, 1.0))
    # Meryem panosu (cephede, kilise girişinden ~5 m): sığ kemerli resim nişi [K]
    cuts.append(arch_prism("meryem", 8.2, -0.01, 0.1, 0.55, 1.8, 2.0, 1.0))
    # duvar dibi seki [F]
    # 3) kuzey uçta kilise girişi: yarım kemerli kapı, içeride kavisli merdiven [K][F]
    cuts.append(box("kilise_kapi", COURT_W - 0.6, COURT_W + 1.5, -1.6, -0.6, 0.0, 2.2))
    for s in range(14):  # merdiven: kuzeye, sonra doğuya kıvrılarak üst seviyeye çıkar
        a = s / 13 * math.pi * 0.9
        cxs, cys = COURT_W + 2.6 - 1.4 * math.cos(a), -1.1 + 1.4 * math.sin(a) * 1.6
        z = s * (LOW_H + SLAB) / 14
        cuts.append(box(f"basamak{s}", cxs - 0.8, cxs + 0.8, cys - 0.8, cys + 0.8, z, z + 2.3))
    # 4) üst revak: sağlam ön duvar (y = -PORTICO_D'de), içeride bölmeler [K][T]
    zf = LOW_H + SLAB
    cuts.append(box("ust_revak", 0.4, COURT_W - 0.4, -PORTICO_D + 0.45, 0.25, zf, zf + UP_H))
    bw = (COURT_W - 0.8) / UP_BAYS
    for b in range(UP_BAYS):
        cx = 0.4 + (b + 0.5) * bw
        ym = (-PORTICO_D + 0.45 + 0.25) / 2
        if b % 2 == 0:  # kubbeli bölme [K]
            cuts.append(sphere(f"kubbe{b}", (cx, ym, zf + UP_H - 0.1), min(bw, PORTICO_D - 0.2) / 2 * 0.98))
        else:  # beşik tonozlu bölme [K]
            cuts.append(cyl(f"tonoz{b}", (cx, ym, zf + UP_H), bw / 2 * 0.95, PORTICO_D - 0.2, "y"))
        # ön duvarda pencere: kemerli [T]
        cuts.append(arch_prism(f"pencere{b}", cx, -PORTICO_D - 0.05, -PORTICO_D + 0.5, zf + 0.9, 0.75, 1.35, 1.0))
    # arka duvarda narteks penceresi (kilisenin tek penceresi) [K][F]
    cuts.append(box("narteks_pencere", 0.4 + 2.5 * bw - 0.35, 0.4 + 2.5 * bw + 0.35, 0.2, 1.4, zf + 0.9, zf + 1.6))
    # arka duvarda madalyonlu kemerli niş (bugün güvercinlik delikli) [F]
    cuts.append(arch_prism("ust_nis", 0.4 + 3.5 * bw, 0.2, 0.55, zf + 0.5, 1.3, 2.2, 1.0))
    # ön cephenin üstünde kaba yontulmuş saçak [T]
    cuts.append(rough_box("sacak", -0.3, COURT_W + 0.3, -PORTICO_D - 1.2, -PORTICO_D + 0.05, zf + UP_H + 1.4, 40, amp=0.5, seed=4.0))
    apply_cuts(rock, cuts)
    # 5) içeri: narteks, mezar odası, naos, yemekhane, alt kat odaları
    apply_cuts(rock, interior_cutters(zf))
    furnish(zf)
    # yontulmuş yüzlere yontu malzemesi; üst revakın içi boyalı taş örgü
    ki = rock.data.materials.find("yontu")
    rock.data.materials.append(MAT["revak"])
    ri = len(rock.data.materials) - 1
    for p in rock.data.polygons:
        c = p.center
        if p.material_index == ki and c.z > zf - 0.05 and -PORTICO_D + 0.4 < c.y < 0.3 and 0.35 < c.x < COURT_W - 0.35:
            p.material_index = ri
    paint_interior(rock, zf)
    # 6) boyalar: niş başlarında Malta haçlı madalyonlar, silmelerde dama şeritler [K][F]
    for x in xs:
        disc(x, NICHE_D - 0.005, ARC_Z0 + NICHE_H - 0.42)
    for z0, z1 in MOULD:
        strip(0.0, COURT_W, -0.004, z0 + 0.04, z1 - 0.04)
    # alt revak tavanının kenarında dama şerit
    strip(0.0, COURT_W, -PORTICO_D + 0.02, LOW_H - 0.3, LOW_H - 0.1, facing=-1)


# ------------------------------------------------------------------ iç mekân (yapı kartı §4, §5)
# Kilise üst seviyede (z = zf). Narteks cepheye paralel uzanır, kuzeyden merdivenle
# girilir; güney ucunda mezar odası; doğusunda naos (doğu = +y, kayanın derinliği).
NAR = dict(x0=6.2, x1=13.4, y0=0.8, y1=3.4, wall=2.5)          # [K] dikdörtgen, beşik tonozlu; ölçü [T]
TOMB = dict(x0=3.4, x1=5.9, y0=0.8, y1=3.4, wall=2.1)          # [K] narteksin güneyinde; ölçü [T]
NAOS = dict(cx=9.8, cy=7.1, half=3.0, wall=2.6, bay=1.1, col=0.24)  # [K] 4 sütun, kapalı Yunan haçı; ölçü [T]
REF = dict(x0=-0.6, x1=2.6, y0=2.2, y1=18.2, wall=2.2)         # [K] 15 m masa; ölçü [T]


def interior_cutters(zf):
    N, T, A, R = NAR, TOMB, NAOS, REF
    c = []
    # merdivenin üstünden narteksin kuzey ucuna geçit [K: kuzeyden kavisli merdiven]
    c.append(box("gecit", N["x1"] - 0.4, COURT_W + 3.2, -0.6, 1.6, zf, zf + 2.3))
    # narteks: dikdörtgen, beşik tonoz (x boyunca) [K]
    ym = (N["y0"] + N["y1"]) / 2
    rv = (N["y1"] - N["y0"]) / 2
    c.append(box("narteks", N["x0"], N["x1"], N["y0"], N["y1"], zf, zf + N["wall"]))
    c.append(cyl("narteks_tonoz", ((N["x0"] + N["x1"]) / 2, ym, zf + N["wall"]), rv, N["x1"] - N["x0"], "x"))
    # mezar odası: iki mezar + bir çocuk arkosolyumu [K]
    c.append(box("mezar_kapi", T["x1"] - 0.1, N["x0"] + 0.1, 1.6, 2.6, zf, zf + 1.9))
    c.append(box("mezar_odasi", T["x0"], T["x1"], T["y0"], T["y1"], zf, zf + T["wall"]))
    c.append(cyl("mezar_tonoz", ((T["x0"] + T["x1"]) / 2, ym, zf + T["wall"]), rv, T["x1"] - T["x0"], "x"))
    for k, gx in enumerate((3.8, 4.7)):
        c.append(box(f"mezar{k}", gx, gx + 0.65, 1.2, 3.1, zf - 0.55, zf + 0.01))
    c.append(arch_prism("arkosolyum", 5.2, T["y1"] - 0.02, T["y1"] + 0.6, zf + 0.5, 1.0, 1.0, 1.0))
    # naosa kapı: narteksin doğu duvarında, naosun ekseninde
    c.append(arch_prism("naos_kapi", A["cx"], N["y1"] - 0.05, A["cy"] - A["half"] + 0.05, zf, 1.0, 2.15, 1.1))
    # naos: kare gövde, haç kollarında beşik tonozlar, köşelerde küçük kubbeler, ortada kasnaklı kubbe [K]
    h, cx, cy, b, W = A["half"], A["cx"], A["cy"], A["bay"], A["wall"]
    c.append(box("naos", cx - h, cx + h, cy - h, cy + h, zf, zf + W))
    c.append(cyl("tonoz_dogu_bati", (cx, cy, zf + W), b, 2 * h, "y"))
    c.append(cyl("tonoz_kuzey_guney", (cx, cy, zf + W), b, 2 * h, "x"))
    for sx in (-1, 1):
        for sy in (-1, 1):
            kx, ky = cx + sx * (b + (h - b) / 2), cy + sy * (b + (h - b) / 2)
            c.append(sphere(f"kose_kubbe{sx}{sy}", (kx, ky, zf + W - 0.15), (h - b) / 2 * 0.98))
    c.append(cyl("kasnak", (cx, cy, zf + W + b * 0.75), b * 0.95, b * 1.5, "z"))
    c.append(sphere("orta_kubbe", (cx, cy, zf + W + b * 1.5), b * 0.95))
    # üç apsis: ortada büyük, yanlarda küçük; yarım kubbeli (konk) [K]
    back = cy + h
    for ax, ra, hh in ((cx, 1.15, W - 0.1), (cx - 2.1, 0.6, W - 0.7), (cx + 2.1, 0.6, W - 0.7)):
        c.append(cyl("apsis", (ax, back, zf + hh / 2), ra, hh, "z"))
        c.append(sphere("konk", (ax, back, zf + hh), ra))
    # yemekhane: uzun, beşik tonozlu; dip ucunda apsis [K]
    c.append(box("yemekhane", R["x0"], R["x1"], R["y0"], R["y1"], 0, R["wall"]))
    c.append(cyl("yemekhane_tonoz", ((R["x0"] + R["x1"]) / 2, (R["y0"] + R["y1"]) / 2, R["wall"]), (R["x1"] - R["x0"]) / 2, R["y1"] - R["y0"], "y"))
    c.append(cyl("yemekhane_apsis", ((R["x0"] + R["x1"]) / 2, R["y1"], R["wall"] / 2 + 0.4), 1.2, R["wall"] + 0.8, "z"))
    # yemekhanenin yanından üst kata (depo) çıkan merdiven [K]; ilk basamaklar
    for s_ in range(6):
        c.append(box(f"ym_merdiven{s_}", R["x1"] - 0.1, R["x1"] + 1.0, 4.0 + s_ * 0.35, 4.4 + s_ * 0.35, s_ * 0.3, s_ * 0.3 + 2.2))
    # alt kat odaları (depo ya da hücre olabilir) [K]
    for name, x in (("oda1", 5.0), ("oda2", 11.0)):
        c.append(box(f"{name}_ic", x - 1.4, x + 1.4, 2.1, 5.2, 0, 2.5))
    return c


def solid_cyl(name, x, y, z0, z1, r, mat="yontu"):
    bm = bmesh.new()
    res = bmesh.ops.create_cone(bm, cap_ends=True, segments=32, radius1=r, radius2=r * 0.92, depth=z1 - z0)
    bmesh.ops.translate(bm, vec=(0, 0, (z1 - z0) / 2), verts=res["verts"])
    return from_bm(name, bm, mat, (x, y, z0), smooth=True)


def lamp(x, y, z, w):
    li = bpy.data.lights.new("kandil", "POINT")
    li.energy = w
    li.color = (1.0, 0.6, 0.28)
    li.shadow_soft_size = 0.05
    ob = bpy.data.objects.new("kandil", li)
    ob.location = (x, y, z)
    link(ob)
    # kandilin kendisi: küçük pişmiş toprak kap
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=12, v_segments=6, radius=0.06)
    from_bm("kandil_kap", bm, "kaya", (x, y, z - 0.09))


def furnish(zf):
    A, R = NAOS, REF
    cx, cy, b, W = A["cx"], A["cy"], A["bay"], A["wall"]
    # dört sütun (biri özgün, üçü 1980'lerde yeniden örüldü [K]; sağlam dönemde dördü de kaya)
    for sx in (-1, 1):
        for sy in (-1, 1):
            x, y = cx + sx * b, cy + sy * b
            solid_cyl("sutun", x, y, zf, zf + W - 0.18, A["col"], "fresk")
            box("baslik", x - 0.32, x + 0.32, y - 0.32, y + 0.32, zf + W - 0.2, zf + W + 0.02, "fresk")
    # duvar dibi sekiler ve apsiste sunak [T]
    h = A["half"]
    for sx in (-1, 1):
        box("seki", cx + sx * h - (0.4 if sx > 0 else 0), cx + sx * h + (0.4 if sx < 0 else 0), cy - h + 0.4, cy + h - 0.6, zf, zf + 0.42, "fresk")
    box("sunak", cx - 0.45, cx + 0.45, cy + h + 0.2, cy + h + 0.75, zf, zf + 1.0)
    solid_cyl("yan_sunak", cx + 2.1, cy + h + 0.15, zf, zf + 0.95, 0.28)  # sağ apsiste yuvarlak sunak [K]
    # yemekhane: 15 m taş masa ve iki yanında sekiler, kayadan bırakılmış [K]
    mx = (R["x0"] + R["x1"]) / 2
    box("masa", mx - 0.42, mx + 0.42, R["y0"] + 0.9, R["y0"] + 0.9 + 15.0, 0, 0.78)
    for sx in (-1, 1):
        box("yemekhane_seki", mx + sx * 1.05 - 0.22, mx + sx * 1.05 + 0.22, R["y0"] + 0.9, R["y0"] + 15.9, 0, 0.45)
    # kandiller: içerideki tek ışık narteks penceresi ve kapılar [K]; gerisi kandil [T]
    for x, y, z, w in ((cx, cy, zf + 2.1, 26), (cx - 1.7, cy + 1.7, zf + 2.0, 12), (cx + 1.7, cy + 1.7, zf + 2.0, 12),
                       (cx, cy + A["half"] - 0.2, zf + 1.8, 16), (cx, cy - 1.9, zf + 2.0, 12),
                       (8.0, 2.1, zf + 2.0, 14), (11.8, 2.1, zf + 2.0, 14), (4.6, 2.1, zf + 1.6, 6)):
        lamp(x, y, z, w)
    for k in range(4):
        lamp(mx, R["y0"] + 2.5 + k * 4.0, 1.9, 14)


def fresco_material():
    """Fresk zonları, sağlam dönem: mavi-gri zemin [F], kırmızı-okr çerçeveler, kırmızı
    damarlı mermer taklidi etek, ayakta azizler sırası (hale ve figür lekeleri), üstte sahneler.
    YER TUTUCU: gerçek fresk görüntüleri (CC0 / CC BY fotoğraflar) karttaki yerlerine sonra konacak."""
    m, nt, bsdf = _new_mat("fresk")
    N, L = nt.nodes.new, nt.links.new
    bsdf.inputs["Roughness"].default_value = 0.88
    co = N("ShaderNodeTexCoord")
    sep = N("ShaderNodeSeparateXYZ")
    L(co.outputs["Object"], sep.inputs[0])

    def mth(op, a, b_=None):
        n = N("ShaderNodeMath")
        n.operation = op
        for i, x in enumerate((a, b_)):
            if x is None:
                continue
            if isinstance(x, (int, float)):
                n.inputs[i].default_value = x
            else:
                L(x, n.inputs[i])
        return n.outputs[0]

    def mix(f, a, b_):
        n = N("ShaderNodeMix")
        n.data_type = "RGBA"
        for i, x in ((0, f), (6, a), (7, b_)):
            if isinstance(x, (int, float, tuple)):
                n.inputs[i].default_value = x
            else:
                L(x, n.inputs[i])
        return n.outputs[2]

    def band(lo, hi, v):
        return mth("MULTIPLY", mth("GREATER_THAN", v, lo), mth("LESS_THAN", v, hi))

    zf = LOW_H + SLAB
    z = mth("SUBTRACT", sep.outputs["Z"], zf)  # yerden yükseklik
    along = mth("ADD", sep.outputs["X"], sep.outputs["Y"])  # duvar boyunca
    nz = N("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 6
    nz.inputs["Detail"].default_value = 6
    L(co.outputs["Object"], nz.inputs["Vector"])
    ground = mix(nz.outputs["Fac"], (0.20, 0.26, 0.30, 1), (0.27, 0.32, 0.35, 1))
    color = ground
    # etek: kırmızı damarlı mermer taklidi [F: sütunlardaki çizgili desen]
    vein = N("ShaderNodeTexWave")
    vein.inputs["Scale"].default_value = 1.6
    vein.inputs["Distortion"].default_value = 3.5
    vein.inputs["Detail"].default_value = 3
    L(co.outputs["Object"], vein.inputs["Vector"])
    vr = N("ShaderNodeMapRange")
    vr.inputs["From Min"].default_value = 0.88
    vr.inputs["From Max"].default_value = 0.97
    L(vein.outputs["Fac"], vr.inputs["Value"])
    dado = mix(vr.outputs[0], (0.80, 0.72, 0.62, 1), (0.58, 0.20, 0.11, 1))
    color = mix(mth("LESS_THAN", z, 0.85), color, dado)
    # resim panoları: kırmızı çerçeveli dikey bölmeler (her ~1.3 m). Figürler buraya,
    # karttaki yerlerine gerçek fresk görüntüleriyle gelecek; uydurma figür çizilmiyor.
    u = mth("FLOORED_MODULO", along, 1.3)
    vline = mth("MULTIPLY", mth("LESS_THAN", u, 0.05), band(0.95, 2.45, z))
    color = mix(vline, color, (0.58, 0.20, 0.09, 1))
    # panoların içinde sıva ve boya dokusu: hafif okr ve gri lekeler
    pn = N("ShaderNodeTexNoise")
    pn.inputs["Scale"].default_value = 1.5
    pn.inputs["Detail"].default_value = 4
    L(co.outputs["Object"], pn.inputs["Vector"])
    color = mix(mth("MULTIPLY", band(0.95, 2.45, z), mth("MULTIPLY", pn.outputs["Fac"], 0.35)), color, (0.55, 0.45, 0.30, 1))
    # çerçeve bantları
    lines = mth("MAXIMUM", band(0.85, 0.95, z), band(2.45, 2.55, z))
    color = mix(lines, color, (0.58, 0.20, 0.09, 1))
    # tonoz ve kubbelerde sahne zemini daha açık, okr kenarlı
    upper = mth("GREATER_THAN", z, 2.55)
    color = mix(mth("MULTIPLY", upper, 0.35), color, (0.62, 0.50, 0.32, 1))
    L(color, bsdf.inputs["Base Color"])
    bmp = N("ShaderNodeBump")
    bmp.inputs["Strength"].default_value = 0.12
    L(nz.outputs["Fac"], bmp.inputs["Height"])
    L(bmp.outputs["Normal"], bsdf.inputs["Normal"])
    return m


def picture_material(key, origin, U, V, W, H):
    """Fresk zemini + gerçek fresk fotoğrafı, düzlemsel izdüşümle: görüntünün sol alt köşesi
    `origin`, sağa doğru U, yukarı doğru V (birim vektörler), boyutu W x H metre."""
    if not args.frescoes:
        return None
    path = os.path.abspath(os.path.join(args.frescoes, key + ".jpg"))
    if not os.path.exists(path) or os.path.getsize(path) < 20000:
        print("   fresk yok ya da eksik indi:", path, flush=True)
        return None
    m = MAT["fresk"].copy()
    m.name = "fresk_" + key
    nt = m.node_tree
    N, L = nt.nodes.new, nt.links.new
    bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    base = bsdf.inputs["Base Color"].links[0].from_socket
    co = N("ShaderNodeTexCoord")
    sub = N("ShaderNodeVectorMath")
    sub.operation = "SUBTRACT"
    sub.inputs[1].default_value = origin
    L(co.outputs["Object"], sub.inputs[0])
    comb = N("ShaderNodeCombineXYZ")
    for i, (axis, size) in enumerate(((U, W), (V, H))):
        d = N("ShaderNodeVectorMath")
        d.operation = "DOT_PRODUCT"
        d.inputs[1].default_value = axis
        L(sub.outputs[0], d.inputs[0])
        q = N("ShaderNodeMath")
        q.operation = "DIVIDE"
        q.inputs[1].default_value = size
        L(d.outputs["Value"], q.inputs[0])
        L(q.outputs[0], comb.inputs[i])
    img = N("ShaderNodeTexImage")
    try:
        img.image = bpy.data.images.load(path)
    except RuntimeError as e:
        print("   fresk okunamadi:", path, e, flush=True)
        bpy.data.materials.remove(m)
        return None
    img.extension = "CLIP"
    img.interpolation = "Cubic"
    L(comb.outputs[0], img.inputs["Vector"])
    mx = N("ShaderNodeMix")
    mx.data_type = "RGBA"
    L(img.outputs["Alpha"], mx.inputs[0])
    L(base, mx.inputs[6])
    L(img.outputs["Color"], mx.inputs[7])
    L(mx.outputs[2], bsdf.inputs["Base Color"])
    return m


def fresco_regions(zf):
    """Karttaki fresk yerleri (cappadociahistory.com'a göre), her biri: anahtar, bölge
    testi (yüz merkezi c, normal n), izdüşüm (origin, U, V, W, H)."""
    A, N_ = NAOS, NAR
    cx, cy, h, b, W = A["cx"], A["cy"], A["half"], A["bay"], A["wall"]
    top = zf + W + b
    X, Y, Z = (1, 0, 0), (0, 1, 0), (0, 0, 1)
    mX, mY = (-1, 0, 0), (0, -1, 0)
    back = cy + h
    return [
        ("deesis", lambda c, n: c.y > back - 0.05 and abs(c.x - cx) < 1.25 and c.z > zf + 1.85,
         (cx - 1.25, 0, zf + 1.85), X, Z, 2.5, top - zf - 1.85),
        ("babalar", lambda c, n: c.y > back - 0.05 and abs(c.x - cx) < 1.25 and zf + 0.85 < c.z <= zf + 1.85,
         (cx - 1.25, 0, zf + 0.85), X, Z, 2.5, 1.0),
        ("dogum", lambda c, n: c.x < cx - h + 0.05 and abs(c.y - cy) < b and c.z > zf + 0.9,
         (0, cy - b, zf + 0.9), Y, Z, 2 * b, top - zf - 0.9),
        ("carmih", lambda c, n: c.x > cx + h - 0.05 and abs(c.y - cy) < b and c.z > zf + 0.9,
         (0, cy + b, zf + 0.9), mY, Z, 2 * b, top - zf - 0.9),
        ("degisim", lambda c, n: c.y < cy - h + 0.05 and abs(c.x - cx) < b and c.z > zf + 2.2,
         (cx + b, 0, zf + 2.2), mX, Z, 2 * b, top - zf - 2.2),
        ("bas_melek", lambda c, n: c.y < cy - h + 0.05 and cx - h + 0.15 < c.x < cx - b - 0.1 and zf + 0.85 < c.z < zf + 2.5,
         (cx - b - 0.1, 0, zf + 0.85), mX, Z, h - b - 0.25, 1.65),
        ("mikail", lambda c, n: c.y < cy - h + 0.05 and cx + b + 0.1 < c.x < cx + h - 0.15 and zf + 0.85 < c.z < zf + 2.5,
         (cx + h - 0.15, 0, zf + 0.85), mX, Z, h - b - 0.25, 1.65),
        ("tonoz_kuzey", lambda c, n: c.x < cx - b and abs(c.y - cy) < b and c.z > zf + W - 0.05 and n.z < -0.2,
         (cx - b, cy - b, 0), mX, Y, h - b, 2 * b),
        ("son_aksam", lambda c, n: c.x > cx + b and abs(c.y - cy) < b and c.z > zf + W - 0.05 and n.z < -0.2,
         (cx + h, cy - b, 0), mX, Y, h - b, 2 * b),
        ("tonoz_bati", lambda c, n: c.y < cy - b and abs(c.x - cx) < b and c.z > zf + W - 0.05 and n.z < -0.2,
         (cx + b, cy - h, 0), mX, Y, 2 * b, h - b),
        ("tonoz_dogu", lambda c, n: cy + b < c.y < back - 0.1 and abs(c.x - cx) < b and c.z > zf + W - 0.05 and n.z < -0.2,
         (cx + b, cy + b, 0), mX, Y, 2 * b, h - b),
        ("kutsama", lambda c, n: N_["y0"] - 0.1 < c.y < N_["y1"] + 0.1 and 8.0 < c.x < 11.6 and c.z > zf + N_["wall"] - 0.05 and n.z < -0.2,
         (11.6, N_["y0"], 0), mX, Y, 3.6, N_["y1"] - N_["y0"]),
    ]


def paint_interior(rock, zf):
    """Kilisenin (narteks, mezar odası, naos) kesik yüzleri fresk; tabanlar çıplak taş.
    --frescoes verilmişse gerçek fresk fotoğrafları karttaki yerlerine konur."""
    regions = []
    for key, test, origin, U, V, W, H in fresco_regions(zf):
        m = picture_material(key, origin, U, V, W, H)
        if m is not None:
            rock.data.materials.append(m)
            regions.append((test, len(rock.data.materials) - 1))
    rock.data.materials.append(MAT["fresk"])
    fi = len(rock.data.materials) - 1
    ki = rock.data.materials.find("yontu")
    A, N_, T = NAOS, NAR, TOMB
    for p in rock.data.polygons:
        if p.material_index != ki:
            continue
        c = p.center
        if c.z < zf + 0.05 or p.normal.z > 0.9:
            continue
        in_naos = abs(c.x - A["cx"]) < A["half"] + 1.3 and A["cy"] - A["half"] - 0.1 < c.y < A["cy"] + A["half"] + 1.3
        in_nar = T["x0"] - 0.1 < c.x < N_["x1"] + 0.1 and N_["y0"] - 0.1 < c.y < N_["y1"] + 0.15
        if in_naos or in_nar:
            p.material_index = fi
            for test, idx in regions:
                if test(c, p.normal):
                    p.material_index = idx
                    break


def disc(x, y, z, r=0.2):
    bm = bmesh.new()
    bmesh.ops.create_circle(bm, cap_ends=True, segments=40, radius=r * 1.02)
    import mathutils
    bmesh.ops.transform(bm, matrix=mathutils.Matrix.Rotation(math.pi / 2, 4, "X"), verts=bm.verts)
    from_bm("madalyon", bm, "malta", (x, y, z))


def strip(x0, x1, y, z0, z1, facing=1):
    bm = bmesh.new()
    vs = [bm.verts.new(p) for p in ((x0, 0, z0), (x1, 0, z0), (x1, 0, z1), (x0, 0, z1))]
    bm.faces.new(vs if facing < 0 else vs[::-1])
    from_bm("serit", bm, "serit", (0, y, 0))


MAT["fresk"] = fresco_material()
build()

# gerçek dokular (Poly Haven, CC0), varsa
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import antik_mimari as _AM  # noqa: E402
_AM.apply_dokular(args.dokular, "karanlik")

# ------------------------------------------------------------------ ışık, kamera, işleme
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
SUN_ELEV, SUN_AZ = 32, 250  # öğleden sonra, batıdan: cephe batıya bakıyor [T]
sky.sun_elevation = math.radians(SUN_ELEV)
sky.sun_rotation = math.radians(SUN_AZ)
w.node_tree.links.new(sky.outputs[0], bg.inputs[0])
bg.inputs[1].default_value = 0.2
sun = bpy.data.lights.new("gunes", "SUN")
sun.energy = 4.0
sun.color = (1.0, 0.88, 0.74)
sun.angle = math.radians(0.6)
so = link(bpy.data.objects.new("gunes", sun))
# güneş batı-güneybatıdan (avlu tarafı, -y) gelsin
so.rotation_euler = (math.radians(90 - SUN_ELEV), 0, math.radians(-90 - 25))

r = scene.render
r.engine = "CYCLES"
r.resolution_x, r.resolution_y = [int(v) for v in args.res.split("x")]
scene.cycles.samples = args.samples
scene.cycles.use_denoising = True
scene.view_settings.view_transform = "AgX"
scene.view_settings.exposure = args.exposure
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
    ((7.0, -24.0, -1.8), (7.0, 0.0, 5.0), 22),    # vadiden, avluya bakış
    ((5.5, -4.6, 1.65), (6.5, 0.0, 3.6), 20),     # avluda, cephenin önünde
    ((1.2, -1.2, LOW_H + SLAB + 1.6), (COURT_W - 1, -1.0, LOW_H + SLAB + 1.8), 14, 0.0),  # üst revak içi
    ((-6.0, -20.0, 6.0), (8.0, 0.0, 5.0), 28),   # güneybatıdan çapraz
    ((12.9, 1.4, LOW_H + SLAB + 1.6), (4.0, 2.6, LOW_H + SLAB + 1.7), 14, 1.2),     # narteks, kuzeyden güneye
    ((9.8, 4.4, LOW_H + SLAB + 1.6), (9.8, 10.5, LOW_H + SLAB + 1.5), 13, 1.0),     # naos, kapıdan apsise
    ((10.4, 5.6, LOW_H + SLAB + 1.2), (9.8, 7.3, LOW_H + SLAB + 5.0), 11, 1.4),     # orta kubbeye bakış
    ((1.0, 2.6, 1.6), (1.0, 18.0, 0.9), 16, 1.0),                                  # yemekhane, masa boyunca
]
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(os.path.abspath(args.out), "karanlik-hd.blend"))
if not args.no_render:
    pick = [int(v) for v in args.views.split(",")] if args.views else range(len(VIEWS))
    for n in pick:
        pos, tgt, lens = VIEWS[n][:3]
        # iç mekânlar kandille aydınlanır: göz alışmış gibi pozlamayı aç
        scene.view_settings.exposure = args.exposure + (VIEWS[n][3] if len(VIEWS[n]) > 3 else 0.0) * 2.4
        p, t = Vector(pos), Vector(tgt)
        co.location = p
        co.rotation_euler = (t - p).to_track_quat("-Z", "Y").to_euler()
        cam.lens = lens
        r.filepath = os.path.join(os.path.abspath(args.out), f"karanlik-hd-{n}.png")
        bpy.ops.render.render(write_still=True)
        print("VIEW", n, r.filepath, flush=True)
if args.pano:
    # 360° (eşdikdörtgen) panoramalar; görüntü ortası `yaw` yönüne bakar (derece, 0 = +x)
    zf = LOW_H + SLAB
    PANOS = [
        ("avlu", (7.0, -3.8, 1.65), 90.0, 0.0),
        ("ust-revak", (7.0, -1.0, zf + 1.6), 0.0, 0.9),
        ("narteks", (9.8, 2.1, zf + 1.6), 90.0, 1.2),
        ("naos", (NAOS["cx"], NAOS["cy"] - 0.5, zf + 1.6), 90.0, 1.0),
        ("yemekhane", (1.0, 6.0, 1.6), 90.0, 1.0),
    ]
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
        scene.view_settings.exposure = args.exposure + ev * 2.4
        r.filepath = os.path.join(os.path.abspath(args.out), f"karanlik-360-{key}.jpg")
        bpy.ops.render.render(write_still=True)
        print("PANO", key, r.filepath, flush=True)

# ------------------------------------------------------------------ kıyas görünümleri
# Uygulamadaki "bugün / sağlamken" kaydırıcısı için: bugünkü fotoğrafın (src/lib/compare-views.ts)
# çekildiği yere yakın bir yerden, 3:2. Çıktı: <out>/karanlik-kiyas-<ad>.jpg
KIYAS = [('dis', (10.0, -22.0, -2.6), (6.0, 0.0, 6.5), 24)]
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
        r.filepath = os.path.join(os.path.abspath(args.out), f"karanlik-kiyas-{key}.jpg")
        bpy.ops.render.render(write_still=True)
        print("KIYAS", key, flush=True)
print("BITTI", flush=True)
