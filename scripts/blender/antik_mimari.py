"""
Ortak mimari yardımcılar (Celsus'tan ayrıldı): mermer ve kireçtaşı malzemeleri, kutu, dönel
profil, sütun (Attik altlık, entasis, kompozit / Korint / İon başlık), kaide, saçaklık, alınlık.
Kullanım: bpy.ops.wm.read_factory_settings(...) SONRASINDA `import antik_mimari as AM`.
Cephe -y yönüne bakar (ön = küçük y).
"""
import math
import os

import bpy  # noqa: I001
import bmesh
import numpy as np
from mathutils import Matrix, Vector

scene = bpy.context.scene
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
        mod.use_hole_tolerant = True
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
    cap_h = {"korint": 1.15 * d, "ion": 0.5 * d}.get(order, 1.05 * d)
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
    zc = z + base_h + shaft_h
    if order == "ion":
        # İon başlık: yumurta dizili ekinus, iki yanda büyük volütler, ince abaküs
        rt = r * 0.86
        egg = lambda t, zz: 1.0 + 0.06 * max(0.0, math.cos(12 * t))  # noqa: E731
        lathe("ekinus", [(rt, 0), (rt * 1.2, cap_h * 0.25), (rt * 1.25, cap_h * 0.4)], x, y, zc, wobble=egg)
        box("yastik", x - r * 1.45, x + r * 1.45, y - r * 0.9, y + r * 0.9, zc + cap_h * 0.3, zc + cap_h * 0.62)
        for sx in (-1, 1):
            bm = bmesh.new()
            res = bmesh.ops.create_cone(bm, cap_ends=True, segments=20, radius1=r * 0.42, radius2=r * 0.42, depth=r * 1.85)
            bmesh.ops.transform(bm, matrix=Matrix.Rotation(math.pi / 2, 4, "X"), verts=res["verts"])
            bmesh.ops.translate(bm, vec=(x + sx * r * 1.3, y, zc + cap_h * 0.38), verts=res["verts"])
            from_bm("volut", bm, "mermer", smooth=True)
        box("abakus", x - r * 1.25, x + r * 1.25, y - r * 1.05, y + r * 1.05, zc + cap_h * 0.72, zc + cap_h)
        return
    # başlık: çan, iki sıra akantus, (kompozitte) iyon volütleri, kavisli abaküs
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




# ------------------------------------------------------------------ gerçek dokular (Poly Haven, CC0)

def apply_pbr(m, folder, tex_id, size_m, color_mix):
    """Var olan malzemeye taranmış doku ekler: renk (OVERLAY ile, `color_mix` kadar),
    pürüzlülük ve normal haritası. Kutu izdüşümü, nesne koordinatları; karo `size_m` metre."""
    base = os.path.abspath(os.path.join(folder, tex_id, tex_id))
    if not os.path.exists(base + "_diff_2k.jpg") or os.path.getsize(base + "_diff_2k.jpg") < 20000:
        return False
    nt = m.node_tree
    N, L = nt.nodes.new, nt.links.new
    b = next((n for n in nt.nodes if n.type == "BSDF_PRINCIPLED"), None)
    if b is None:
        return False
    co = N("ShaderNodeTexCoord")
    mp = N("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (1 / size_m,) * 3
    L(co.outputs["Object"], mp.inputs["Vector"])

    def img(suffix, color=True):
        n = N("ShaderNodeTexImage")
        try:
            n.image = bpy.data.images.load(base + suffix, check_existing=True)
        except RuntimeError:
            print("   doku okunamadi:", base + suffix, flush=True)
        if not color:
            n.image.colorspace_settings.name = "Non-Color"
        n.projection = "BOX"
        n.projection_blend = 0.3
        L(mp.outputs[0], n.inputs["Vector"])
        return n
    if color_mix > 0:
        d = img("_diff_2k.jpg")
        src = b.inputs["Base Color"].links[0].from_socket if b.inputs["Base Color"].links else None
        ov = N("ShaderNodeMix")
        ov.data_type = "RGBA"
        ov.blend_type = "OVERLAY"
        ov.inputs[0].default_value = color_mix
        if src is not None:
            L(src, ov.inputs[6])
        else:
            ov.inputs[6].default_value = b.inputs["Base Color"].default_value
        L(d.outputs["Color"], ov.inputs[7])
        L(ov.outputs[2], b.inputs["Base Color"])
    if os.path.exists(base + "_rough_2k.jpg"):
        rr = img("_rough_2k.jpg", False)
        L(rr.outputs["Color"], b.inputs["Roughness"])
    if os.path.exists(base + "_nor_gl_2k.jpg"):
        nn = img("_nor_gl_2k.jpg", False)
        nm = N("ShaderNodeNormalMap")
        nm.inputs["Strength"].default_value = 1.0
        L(nn.outputs["Color"], nm.inputs["Color"])
        bump = next((lk.from_node for lk in b.inputs["Normal"].links if lk.from_node.type == "BUMP"), None)
        if bump is not None:
            L(nm.outputs["Normal"], bump.inputs["Normal"])
        else:
            L(nm.outputs["Normal"], b.inputs["Normal"])
    return True


def apply_dokular(folder, site):
    """dokular.json'daki eşleşmeyle, adı anahtarla başlayan tüm malzemelere doku ekler."""
    import json
    if not folder or not os.path.isdir(folder):
        return
    cfg = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "dokular.json"), encoding="utf-8"))
    pairs = cfg["eslesme"].get(site, {})
    done = []
    for m in list(bpy.data.materials):
        if not m.use_nodes:
            continue
        for key, (tex_id, mix) in sorted(pairs.items(), key=lambda kv: -len(kv[0])):
            if m.name == key or m.name.startswith(key + "_") or m.name.startswith(key + "."):
                if apply_pbr(m, folder, tex_id, cfg["dokular"][tex_id]["size_m"], mix):
                    done.append(m.name)
                break
    print("dokular:", ", ".join(done) or "yok", flush=True)
