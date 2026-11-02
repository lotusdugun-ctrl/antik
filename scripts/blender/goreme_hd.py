"""
Göreme, HD: the valley of rock churches built in Blender as real rock — fairy
chimneys of soft tuff with rain runnels, basalt caps, church fronts carved
INTO the cones (boolean cuts, not boxes stuck on) — then rendered with Cycles.

    blender -b --factory-startup --python scripts/blender/goreme_hd.py -- ^
        --layout scripts/blender/goreme-layout.json --out hd-out\\goreme ^
        [--textures gorseller-ai\\goreme] [--res 1920x1080] [--samples 128] [--gpu]

The cones stand where the web model puts them (rockChurchLayout, dumped to
goreme-layout.json: three.js x, z, y-up; here x, -z, z-up). Everything else
is made here, seeded, so a run gives the same valley every time.

With --textures, the AI textures (doku-tuf-asinmis, doku-tuf, doku-bazalt-sapka,
doku-zemin) are laid over the procedural stone by box projection; without
them the stone is fully procedural.

Out: <out>/goreme-hd-<n>.png (the views) and <out>/goreme-hd.blend.
"""
import argparse
import json
import math
import os
import sys

import bpy  # noqa: I001  (bpy first: it provides bmesh)
import bmesh
import numpy as np
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument("--layout", required=True)
ap.add_argument("--out", required=True)
ap.add_argument("--textures", default="")
ap.add_argument("--res", default="1600x900")
ap.add_argument("--samples", type=int, default=64)
ap.add_argument("--gpu", action="store_true")
ap.add_argument("--views", default="")
ap.add_argument("--no-render", action="store_true")
ap.add_argument("--pano", action="store_true", help="also render the 360 panoramas for the app")
ap.add_argument("--pano-res", default="4096x2048")
ap.add_argument("--pano-samples", type=int, default=0)
args = ap.parse_args(argv)
os.makedirs(args.out, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
RNG = np.random.default_rng(1104)

# ------------------------------------------------------------------ noise

_PERM = np.random.default_rng(7).permutation(4096)


def _hash(ix, iy, iz):
    return (_PERM[(ix * 73856093 ^ iy * 19349663 ^ iz * 83492791) & 4095] / 4095.0) * 2 - 1


def vnoise(x, y, z):
    """Smooth value noise in [-1, 1], numpy arrays."""
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


def fbm(x, y, z, octaves=5, lac=2.03, gain=0.5):
    total, amp, freq = 0.0, 1.0, 1.0
    for _ in range(octaves):
        total = total + amp * vnoise(x * freq, y * freq, z * freq)
        amp *= gain
        freq *= lac
    return total


def ridged(x, y, z, octaves=4):
    total, amp, freq = 0.0, 0.6, 1.0
    for _ in range(octaves):
        n = 1 - np.abs(vnoise(x * freq, y * freq, z * freq))
        total = total + amp * n * n
        amp *= 0.5
        freq *= 2.1
    return total


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


# ------------------------------------------------------------------ materials


_SEAMLESS = {}


def seamless(img):
    """AI pictures are not quite tileable (some have a border): crop the edge, then
    cross-fade the picture with itself shifted by half, so it repeats without seams."""
    if img.name in _SEAMLESS:
        return _SEAMLESS[img.name]
    w, h = img.size
    px = np.empty(w * h * 4, np.float32)
    img.pixels.foreach_get(px)
    a = px.reshape(h, w, 4)
    m = int(min(w, h) * 0.05)
    a = a[m:h - m, m:w - m]
    hh, ww = a.shape[:2]
    b = np.roll(np.roll(a, hh // 2, 0), ww // 2, 1)
    yy, xx = np.mgrid[0:hh, 0:ww]
    edge = np.minimum(np.minimum(xx, ww - 1 - xx) / ww, np.minimum(yy, hh - 1 - yy) / hh)
    wgt = np.clip(edge / 0.18, 0, 1)[..., None]
    out = a * wgt + b * (1 - wgt)
    new = bpy.data.images.new(img.name + "-tile", ww, hh, alpha=True)
    new.pixels.foreach_set(out.astype(np.float32).ravel())
    new.pack()
    _SEAMLESS[img.name] = new
    return new


def tex_image(nt, name, tile=True):
    if not args.textures:
        return None
    for ext in (".png", ".jpg", ".jpeg"):
        for stem in (name, "goreme-" + name):
            p = os.path.join(args.textures, stem + ext)
            if os.path.exists(p):
                node = nt.nodes.new("ShaderNodeTexImage")
                img = bpy.data.images.load(p)
                node.image = seamless(img) if tile else img
                node.projection = "BOX"
                node.projection_blend = 0.35
                return node
    return None


def material(name, base, alt, image=None, scale=1.0, streaks=0.0, chisel=False, lichen=False, bump=0.35, strata=0.0, grime=0.0, vary=0.0, soot=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    bsdf.inputs["Roughness"].default_value = 0.92
    coord = nt.nodes.new("ShaderNodeTexCoord")
    mapping = nt.nodes.new("ShaderNodeMapping")
    nt.links.new(coord.outputs["Object"], mapping.inputs["Vector"])
    # broad colour patches between the two tones
    big = nt.nodes.new("ShaderNodeTexNoise")
    big.inputs["Scale"].default_value = 0.06 * scale
    big.inputs["Detail"].default_value = 4
    nt.links.new(mapping.outputs[0], big.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeMix")
    ramp.data_type = "RGBA"
    ramp.inputs[6].default_value = (*base, 1)
    ramp.inputs[7].default_value = (*alt, 1)
    nt.links.new(big.outputs["Fac"], ramp.inputs[0])
    color = ramp.outputs[2]
    if vary:
        # no two cones the same colour: each object gets its own tint, white to rose to ochre
        oi = nt.nodes.new("ShaderNodeObjectInfo")
        vr = nt.nodes.new("ShaderNodeValToRGB")
        cr = vr.color_ramp
        cr.interpolation = "CONSTANT"
        tints = [(1.0, 0.98, 0.95), (1.0, 0.88, 0.82), (0.97, 0.9, 0.76), (0.9, 0.88, 0.86), (1.0, 0.93, 0.86), (0.93, 0.8, 0.7)]
        cr.elements[0].color = (*tints[0], 1)
        cr.elements[1].position = 1.0 / len(tints)
        cr.elements[1].color = (*tints[1], 1)
        for k, t in enumerate(tints[2:], 2):
            e = cr.elements.new(k / len(tints))
            e.color = (*t, 1)
        nt.links.new(oi.outputs["Random"], vr.inputs["Fac"])
        vm = nt.nodes.new("ShaderNodeMix")
        vm.data_type = "RGBA"
        vm.blend_type = "MULTIPLY"
        vm.inputs[0].default_value = vary
        nt.links.new(color, vm.inputs[6])
        nt.links.new(vr.outputs["Color"], vm.inputs[7])
        color = vm.outputs[2]
    if strata:
        # the ash beds: bands of white, rose and ochre tuff, wavering along the rock
        wave = nt.nodes.new("ShaderNodeTexWave")
        wave.wave_type = "BANDS"
        wave.bands_direction = "Z"
        wave.inputs["Scale"].default_value = 0.035
        wave.inputs["Distortion"].default_value = 5.0
        wave.inputs["Detail"].default_value = 4
        wave.inputs["Detail Scale"].default_value = 0.6
        nt.links.new(coord.outputs["Object"], wave.inputs["Vector"])
        band = nt.nodes.new("ShaderNodeValToRGB")
        cr = band.color_ramp
        cr.elements[0].position = 0.0
        cr.elements[0].color = (0.86, 0.80, 0.70, 1)
        cr.elements[1].position = 0.35
        cr.elements[1].color = (0.80, 0.62, 0.53, 1)
        e = cr.elements.new(0.6)
        e.color = (0.88, 0.83, 0.74, 1)
        e = cr.elements.new(0.85)
        e.color = (0.74, 0.60, 0.42, 1)
        nt.links.new(wave.outputs["Fac"], band.inputs["Fac"])
        sm = nt.nodes.new("ShaderNodeMix")
        sm.data_type = "RGBA"
        sm.blend_type = "MULTIPLY"
        sm.inputs[0].default_value = strata
        nt.links.new(color, sm.inputs[6])
        nt.links.new(band.outputs["Color"], sm.inputs[7])
        color = sm.outputs[2]
    if grime:
        # dirt and shade gather in the hollows, at the foot and under overhangs
        ao = nt.nodes.new("ShaderNodeAmbientOcclusion")
        ao.inputs["Distance"].default_value = 1.5
        ao.samples = 8
        gr = nt.nodes.new("ShaderNodeMapRange")
        gr.inputs["To Min"].default_value = 1.0 - grime
        gr.inputs["To Max"].default_value = 1.0
        nt.links.new(ao.outputs["AO"], gr.inputs["Value"])
        foot = nt.nodes.new("ShaderNodeSeparateXYZ")
        nt.links.new(coord.outputs["Object"], foot.inputs[0])
        fr = nt.nodes.new("ShaderNodeMapRange")
        fr.inputs["From Min"].default_value = 0.0
        fr.inputs["From Max"].default_value = 2.5
        fr.inputs["To Min"].default_value = 1.0 - grime * 0.6
        fr.inputs["To Max"].default_value = 1.0
        nt.links.new(foot.outputs["Z"], fr.inputs["Value"])
        mm = nt.nodes.new("ShaderNodeMath")
        mm.operation = "MULTIPLY"
        nt.links.new(gr.outputs[0], mm.inputs[0])
        nt.links.new(fr.outputs[0], mm.inputs[1])
        cc = nt.nodes.new("ShaderNodeCombineColor")
        for i in range(3):
            nt.links.new(mm.outputs[0], cc.inputs[i])
        gm = nt.nodes.new("ShaderNodeMix")
        gm.data_type = "RGBA"
        gm.blend_type = "MULTIPLY"
        gm.inputs[0].default_value = 1.0
        nt.links.new(color, gm.inputs[6])
        nt.links.new(cc.outputs[0], gm.inputs[7])
        color = gm.outputs[2]
    if streaks:
        # dark rain streaks running down the rock: noise stretched along z
        smap = nt.nodes.new("ShaderNodeMapping")
        smap.inputs["Scale"].default_value = (3.0, 3.0, 0.25)
        nt.links.new(coord.outputs["Object"], smap.inputs["Vector"])
        sn = nt.nodes.new("ShaderNodeTexNoise")
        sn.inputs["Scale"].default_value = 1.6
        sn.inputs["Detail"].default_value = 6
        nt.links.new(smap.outputs[0], sn.inputs["Vector"])
        sr = nt.nodes.new("ShaderNodeMapRange")
        sr.inputs["From Min"].default_value = 0.45
        sr.inputs["From Max"].default_value = 0.75
        sr.inputs["To Min"].default_value = 1.0
        sr.inputs["To Max"].default_value = 1.0 - streaks
        nt.links.new(sn.outputs["Fac"], sr.inputs["Value"])
        mul = nt.nodes.new("ShaderNodeMix")
        mul.data_type = "RGBA"
        mul.blend_type = "MULTIPLY"
        mul.inputs[0].default_value = 1.0
        nt.links.new(color, mul.inputs[6])
        comb = nt.nodes.new("ShaderNodeCombineColor")
        for i in range(3):
            nt.links.new(sr.outputs[0], comb.inputs[i])
        nt.links.new(comb.outputs[0], mul.inputs[7])
        color = mul.outputs[2]
    if soot:
        # centuries of lamp smoke, shepherds' fires and weather: dark blotches and
        # a grey film over the cut stone, heaviest in patches
        sn2 = nt.nodes.new("ShaderNodeTexNoise")
        sn2.inputs["Scale"].default_value = 0.45
        sn2.inputs["Detail"].default_value = 7
        sn2.inputs["Roughness"].default_value = 0.65
        nt.links.new(coord.outputs["Object"], sn2.inputs["Vector"])
        sr2 = nt.nodes.new("ShaderNodeMapRange")
        sr2.inputs["From Min"].default_value = 0.45
        sr2.inputs["From Max"].default_value = 0.72
        sr2.inputs["To Max"].default_value = soot
        nt.links.new(sn2.outputs["Fac"], sr2.inputs["Value"])
        sm2 = nt.nodes.new("ShaderNodeMix")
        sm2.data_type = "RGBA"
        nt.links.new(sr2.outputs[0], sm2.inputs[0])
        nt.links.new(color, sm2.inputs[6])
        sm2.inputs[7].default_value = (0.33, 0.29, 0.26, 1)
        color = sm2.outputs[2]
        # spalled patches: fresh, lighter stone where the skin has flaked off
        fl = nt.nodes.new("ShaderNodeTexVoronoi")
        fl.inputs["Scale"].default_value = 1.3
        nt.links.new(coord.outputs["Object"], fl.inputs["Vector"])
        fr2 = nt.nodes.new("ShaderNodeMapRange")
        fr2.inputs["From Min"].default_value = 0.12
        fr2.inputs["From Max"].default_value = 0.06
        fr2.inputs["To Max"].default_value = 0.5
        nt.links.new(fl.outputs["Distance"], fr2.inputs["Value"])
        fm = nt.nodes.new("ShaderNodeMix")
        fm.data_type = "RGBA"
        nt.links.new(fr2.outputs[0], fm.inputs[0])
        nt.links.new(color, fm.inputs[6])
        fm.inputs[7].default_value = (0.93, 0.86, 0.76, 1)
        color = fm.outputs[2]
    if lichen:
        ln = nt.nodes.new("ShaderNodeTexNoise")
        ln.inputs["Scale"].default_value = 2.5
        ln.inputs["Detail"].default_value = 8
        nt.links.new(mapping.outputs[0], ln.inputs["Vector"])
        lr = nt.nodes.new("ShaderNodeMapRange")
        lr.inputs["From Min"].default_value = 0.58
        lr.inputs["From Max"].default_value = 0.66
        nt.links.new(ln.outputs["Fac"], lr.inputs["Value"])
        lm = nt.nodes.new("ShaderNodeMix")
        lm.data_type = "RGBA"
        lm.inputs[7].default_value = (0.62, 0.45, 0.2, 1)
        nt.links.new(lr.outputs[0], lm.inputs[0])
        nt.links.new(color, lm.inputs[6])
        color = lm.outputs[2]
    img = None
    if image:
        img = tex_image(nt, image)
        if img:
            nt.links.new(mapping.outputs[0], img.inputs["Vector"])
            mapping.inputs["Scale"].default_value = (1 / 2.0, 1 / 2.0, 1 / 2.0)  # 2 m a tile
            ov = nt.nodes.new("ShaderNodeMix")
            ov.data_type = "RGBA"
            ov.blend_type = "OVERLAY"
            ov.inputs[0].default_value = 0.85
            nt.links.new(color, ov.inputs[6])
            nt.links.new(img.outputs["Color"], ov.inputs[7])
            color = ov.outputs[2]
    nt.links.new(color, bsdf.inputs["Base Color"])
    # bump: fine grain, plus chisel strokes on cut faces
    fine = nt.nodes.new("ShaderNodeTexNoise")
    fine.inputs["Scale"].default_value = 9.0 * scale
    fine.inputs["Detail"].default_value = 10
    nt.links.new(coord.outputs["Object"], fine.inputs["Vector"])
    height = fine.outputs["Fac"]
    if chisel:
        wave = nt.nodes.new("ShaderNodeTexWave")
        wave.inputs["Scale"].default_value = 6.0
        wave.inputs["Distortion"].default_value = 1.2
        wave.inputs["Detail"].default_value = 3
        nt.links.new(coord.outputs["Object"], wave.inputs["Vector"])
        add = nt.nodes.new("ShaderNodeMath")
        add.operation = "MULTIPLY_ADD"
        add.inputs[1].default_value = 0.25
        nt.links.new(wave.outputs["Fac"], add.inputs[0])
        nt.links.new(height, add.inputs[2])
        height = add.outputs[0]
    if img:
        add2 = nt.nodes.new("ShaderNodeMath")
        add2.operation = "MULTIPLY_ADD"
        add2.inputs[1].default_value = 0.6
        nt.links.new(img.outputs["Color"], add2.inputs[0])
        nt.links.new(height, add2.inputs[2])
        height = add2.outputs[0]
    bmp = nt.nodes.new("ShaderNodeBump")
    bmp.inputs["Strength"].default_value = bump
    bmp.inputs["Distance"].default_value = 0.02
    nt.links.new(height, bmp.inputs["Height"])
    nt.links.new(bmp.outputs["Normal"], bsdf.inputs["Normal"])
    return m


def ground_material():
    """Soil and dry grass on the flat, bare tuff where the ground is steep: blended in the shader."""
    soil, rock = MAT["toprak"], MAT["tuf"]
    m = soil.copy()
    m.name = "zemin"
    nt = m.node_tree
    out = next(n for n in nt.nodes if n.type == "OUTPUT_MATERIAL")
    bsdf_soil = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    # bring the rock's node tree in as a group would be heavy: rebuild a simple rock BSDF
    rock_bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    rock_bsdf.inputs["Base Color"].default_value = (0.78, 0.68, 0.58, 1)
    rw = nt.nodes.new("ShaderNodeTexWave")
    rw.wave_type = "BANDS"
    rw.bands_direction = "Z"
    rw.inputs["Scale"].default_value = 0.2
    rw.inputs["Distortion"].default_value = 6
    rw.inputs["Detail"].default_value = 3
    rwc = nt.nodes.new("ShaderNodeValToRGB")
    cr = rwc.color_ramp
    cr.elements[0].color = (0.74, 0.65, 0.53, 1)
    cr.elements[1].position = 0.3
    cr.elements[1].color = (0.68, 0.44, 0.35, 1)
    for pos, col in ((0.5, (0.8, 0.74, 0.64)), (0.7, (0.66, 0.5, 0.3)), (0.88, (0.56, 0.52, 0.48))):
        e = cr.elements.new(pos)
        e.color = (*col, 1)
    rgeo = nt.nodes.new("ShaderNodeTexCoord")
    nt.links.new(rgeo.outputs["Object"], rw.inputs["Vector"])
    nt.links.new(rw.outputs["Fac"], rwc.inputs["Fac"])
    rock_bsdf.inputs["Roughness"].default_value = 0.92
    # rain runnels down the slopes: noise stretched along z, plus fine grit
    rmap = nt.nodes.new("ShaderNodeMapping")
    rmap.inputs["Scale"].default_value = (2.2, 2.2, 0.18)
    nt.links.new(rgeo.outputs["Object"], rmap.inputs["Vector"])
    rn = nt.nodes.new("ShaderNodeTexNoise")
    rn.inputs["Scale"].default_value = 1.2
    rn.inputs["Detail"].default_value = 9
    nt.links.new(rmap.outputs[0], rn.inputs["Vector"])
    gn = nt.nodes.new("ShaderNodeTexNoise")
    gn.inputs["Scale"].default_value = 14
    gn.inputs["Detail"].default_value = 6
    nt.links.new(rgeo.outputs["Object"], gn.inputs["Vector"])
    hsum = nt.nodes.new("ShaderNodeMath")
    hsum.operation = "MULTIPLY_ADD"
    hsum.inputs[1].default_value = 0.3
    nt.links.new(gn.outputs["Fac"], hsum.inputs[0])
    nt.links.new(rn.outputs["Fac"], hsum.inputs[2])
    rb = nt.nodes.new("ShaderNodeBump")
    rb.inputs["Strength"].default_value = 0.9
    nt.links.new(hsum.outputs[0], rb.inputs["Height"])
    # runnels hold shade and dust: darken the rock colour in them
    rdk = nt.nodes.new("ShaderNodeMapRange")
    rdk.inputs["From Min"].default_value = 0.35
    rdk.inputs["From Max"].default_value = 0.65
    rdk.inputs["To Min"].default_value = 0.72
    nt.links.new(rn.outputs["Fac"], rdk.inputs["Value"])
    rcm = nt.nodes.new("ShaderNodeMix")
    rcm.data_type = "RGBA"
    rcm.blend_type = "MULTIPLY"
    rcm.inputs[0].default_value = 1.0
    nt.links.new(rwc.outputs["Color"], rcm.inputs[6])
    rcc = nt.nodes.new("ShaderNodeCombineColor")
    for i in range(3):
        nt.links.new(rdk.outputs[0], rcc.inputs[i])
    nt.links.new(rcc.outputs[0], rcm.inputs[7])
    nt.links.new(rcm.outputs[2], rock_bsdf.inputs["Base Color"])
    # the soil: patches of darker earth, gravel and sparse green instead of one flat sand
    sbc = bsdf_soil.inputs["Base Color"]
    if sbc.links:
        src = sbc.links[0].from_socket
        pn = nt.nodes.new("ShaderNodeTexNoise")
        pn.inputs["Scale"].default_value = 0.09
        pn.inputs["Detail"].default_value = 6
        nt.links.new(rgeo.outputs["Object"], pn.inputs["Vector"])
        pr = nt.nodes.new("ShaderNodeValToRGB")
        c2 = pr.color_ramp
        c2.elements[0].position = 0.35
        c2.elements[0].color = (0.62, 0.55, 0.48, 1)
        c2.elements[1].position = 0.65
        c2.elements[1].color = (1.0, 0.97, 0.92, 1)
        e = c2.elements.new(0.5)
        e.color = (0.7, 0.74, 0.55, 1)
        nt.links.new(pn.outputs["Fac"], pr.inputs["Fac"])
        pm = nt.nodes.new("ShaderNodeMix")
        pm.data_type = "RGBA"
        pm.blend_type = "MULTIPLY"
        pm.inputs[0].default_value = 1.0
        nt.links.new(src, pm.inputs[6])
        nt.links.new(pr.outputs["Color"], pm.inputs[7])
        # gravel: small dark and light specks
        vo = nt.nodes.new("ShaderNodeTexVoronoi")
        vo.inputs["Scale"].default_value = 9
        nt.links.new(rgeo.outputs["Object"], vo.inputs["Vector"])
        vr = nt.nodes.new("ShaderNodeMapRange")
        vr.inputs["From Min"].default_value = 0.12
        vr.inputs["From Max"].default_value = 0.2
        vr.inputs["To Min"].default_value = 0.55
        nt.links.new(vo.outputs["Distance"], vr.inputs["Value"])
        gm = nt.nodes.new("ShaderNodeMix")
        gm.data_type = "RGBA"
        gm.blend_type = "MULTIPLY"
        gm.inputs[0].default_value = 1.0
        nt.links.new(pm.outputs[2], gm.inputs[6])
        gc = nt.nodes.new("ShaderNodeCombineColor")
        for i in range(3):
            nt.links.new(vr.outputs[0], gc.inputs[i])
        nt.links.new(gc.outputs[0], gm.inputs[7])
        nt.links.new(gm.outputs[2], sbc)
    nt.links.new(rb.outputs["Normal"], rock_bsdf.inputs["Normal"])
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(geo.outputs["Normal"], sep.inputs[0])
    mr = nt.nodes.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value = 0.93
    mr.inputs["From Max"].default_value = 0.8
    nt.links.new(sep.outputs["Z"], mr.inputs["Value"])
    mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(mr.outputs[0], mix.inputs[0])
    nt.links.new(bsdf_soil.outputs[0], mix.inputs[1])
    nt.links.new(rock_bsdf.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs["Surface"])
    return m


MAT = {
    "tuf": material("tuf", (0.88, 0.8, 0.7), (0.92, 0.76, 0.68), "doku-tuf-asinmis", streaks=0.38, strata=0.75, grime=0.5, vary=1.0, bump=0.5),
    "kesik": material("tuf_kesik", (0.8, 0.72, 0.62), (0.76, 0.66, 0.56), "doku-tuf", chisel=True, bump=0.45, streaks=0.45, strata=0.7, grime=0.65, soot=0.8),
    "bazalt": material("bazalt", (0.17, 0.16, 0.15), (0.24, 0.22, 0.2), "doku-bazalt-sapka", scale=2, lichen=True, bump=0.6),
    "toprak": material("toprak", (0.25, 0.19, 0.14), (0.22, 0.21, 0.11), "doku-zemin", scale=0.6, bump=0.3),
    "boya": material("asi_boya", (0.5, 0.2, 0.13), (0.58, 0.3, 0.2), None, bump=0.05),
}


def _faded(m):
    """The ochre lines are 1000 years old: let the stone show through in patches."""
    nt = m.node_tree
    out = next(n for n in nt.nodes if n.type == "OUTPUT_MATERIAL")
    bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 7.0
    nz.inputs["Detail"].default_value = 6
    mr = nt.nodes.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value = 0.42
    mr.inputs["From Max"].default_value = 0.58
    nt.links.new(nz.outputs["Fac"], mr.inputs["Value"])
    mx = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(mr.outputs[0], mx.inputs[0])
    nt.links.new(tr.outputs[0], mx.inputs[1])
    nt.links.new(bsdf.outputs[0], mx.inputs[2])
    nt.links.new(mx.outputs[0], out.inputs["Surface"])


_faded(MAT["boya"])
MAT["zemin"] = ground_material()


def link(obj):
    scene.collection.objects.link(obj)
    return obj


def mesh_obj(name, verts, faces, mat):
    me = bpy.data.meshes.new(name)
    me.from_pydata([tuple(v) for v in verts], [], faces)
    me.validate()
    me.update()
    for p in me.polygons:
        p.use_smooth = True
    ob = bpy.data.objects.new(name, me)
    ob.data.materials.append(MAT[mat])
    return link(ob)


# ------------------------------------------------------------------ terrain


def ground_height(x, y):
    """The valley floor along x, tuff ridges rising either side."""
    ay = np.abs(y + 4 * fbm(x * 0.01, 0, 3, 3))
    ridge = (30 * smoothstep(22, 48, ay) + 22 * smoothstep(60, 140, ay)) * (0.7 + 0.4 * fbm(x * 0.008, y * 0.008, 1, 3))
    # the ridges are cut by gullies running down to the valley, with sharp tuff spurs between
    gully = -7 * smoothstep(24, 70, ay) * np.maximum(0, ridged(x * 0.045, y * 0.012, 5, 4) - 0.3)
    spurs = 6.0 * smoothstep(22, 50, ay) * ridged(x * 0.08, y * 0.04, 8, 4)
    # badland fluting on the flanks: narrow ribs and runnels down the slope
    flute = 2.6 * smoothstep(20, 36, ay) * (1 - smoothstep(70, 100, ay)) * ridged(x * 0.3, y * 0.07, 3, 3)
    flute += 0.9 * smoothstep(20, 36, ay) * (1 - smoothstep(70, 100, ay)) * ridged(x * 0.9, y * 0.2, 13, 2)
    floor = 0.6 * fbm(x * 0.02, y * 0.02, 9, 4) + 0.15 * fbm(x * 0.2, y * 0.2, 2, 3)
    end = 18 * smoothstep(90, 170, np.abs(x)) * smoothstep(5, 40, ay + 20)
    rock = ridge + gully + spurs + flute + end
    # the ash beds weather unevenly: hard beds stand out as ledges, soft ones slope back
    step = 2.4 + 0.8 * fbm(x * 0.01, y * 0.01, 21, 2)
    q = rock / step
    fq = q - np.floor(q)
    terr = (np.floor(q) + smoothstep(0.5, 1.0, fq)) * step
    flank = smoothstep(18, 30, ay) * (0.55 + 0.45 * fbm(x * 0.03, y * 0.03, 17, 2))
    rock = rock * (1 - 0.7 * flank) + terr * 0.7 * flank
    # broken crests: knobs and notches along the ridge line
    rock += 2.5 * smoothstep(40, 60, ay) * fbm(x * 0.06, y * 0.06, 31, 3)
    return rock + floor - 0.15


def terrain():
    # one grid, fine (about 0.6 m) in the valley and coarse towards the horizon
    n, half, k = 820, 1300.0, 4.2
    u = np.linspace(-1, 1, n)
    xs = half * np.sinh(k * u) / np.sinh(k)
    X, Y = np.meshgrid(xs, xs)
    Z = ground_height(X, Y)
    verts = np.stack([X.ravel(), Y.ravel(), Z.ravel()], 1)
    faces = []
    for j in range(n - 1):
        for i in range(n - 1):
            a = j * n + i
            faces.append((a, a + 1, a + n + 1, a + n))
    ob = mesh_obj("zemin", verts, faces, "zemin")
    return ob


# ------------------------------------------------------------------ cones


def cone_mesh(name, cx, cy, h, r, lean, capped, seed, n_a=144, n_z=120, flare=0.55):
    rng = np.random.default_rng(seed)
    t = np.linspace(0, 1, n_z)[:, None]
    th = np.linspace(0, 2 * math.pi, n_a, endpoint=False)[None, :]
    # profile: a talus skirt at the foot, a long taper, a neck under the cap;
    # no two alike: broad hills, slim spires, mushrooms on a thin stalk
    kind = "mantar" if capped else rng.choice(["sivri", "tepe", "kule", "klasik"], p=[0.3, 0.25, 0.2, 0.25])
    taper = rng.uniform(0.42, 0.66)
    power = rng.uniform(0.7, 1.4)
    flare = flare * rng.uniform(0.7, 1.6)
    if kind == "sivri":  # a slim spire, tapering all the way
        taper, power, flare = rng.uniform(0.7, 0.85), rng.uniform(0.75, 1.0), flare * 0.6
    elif kind == "tepe":  # a broad, worn hill of a cone with a wide talus
        taper, power, flare = rng.uniform(0.35, 0.5), rng.uniform(1.4, 2.0), flare * 1.8
    elif kind == "kule":  # a tower: steep sides, then a sudden point
        taper, power = rng.uniform(0.25, 0.4), rng.uniform(2.0, 3.0)
    prof = (1 + flare * np.exp(-t / rng.uniform(0.08, 0.18))) * (1 - taper * t ** power)
    if capped:
        stalk = rng.uniform(0.15, 0.5)
        prof = prof * (1 - stalk * smoothstep(rng.uniform(0.45, 0.7), 1.0, t))
    else:
        # worn to a blunt point: the last rings close in, but never to nothing
        prof = prof * np.maximum(np.sqrt(np.clip(1 - smoothstep(rng.uniform(0.55, 0.7), 1.0, t) ** 1.8, 0.0, 1)), 0.1)
    # the cross-section is never a circle
    harm = 0.0
    for k in range(2, 7):
        a = rng.uniform(0.02, 0.07) / (k - 1) ** 0.5
        ph = rng.uniform(0, 2 * math.pi) + t * rng.uniform(-2, 2)
        harm = harm + a * np.cos(k * th + ph)
    rr = r * prof * (1 + harm)
    z = t * h + 0 * th
    # erosion: vertical runnels cut by the rain, soft fbm lumps, faint strata ledges
    u = th * r * 1.1
    run = ridged(u * 0.9 + seed, z * 0.09, seed * 0.37, 4)
    lumps = fbm(u * 0.12 + seed, z * 0.12, seed * 1.3, 4)
    strata = 0.5 + 0.5 * np.sin(z * 2 * math.pi / (1.6 + rng.uniform(0, 0.8)) + 1.5 * fbm(u * 0.05, z * 0.02, seed, 2))
    strata = smoothstep(0.55, 0.95, strata)  # sharp ledges, not a ripple
    run_k = rng.uniform(0.3, 0.8)  # some cones deeply fluted, some smooth
    bed_k = rng.choice([0.03, 0.08, 0.16])
    # a hard bed somewhere up the cone: a waist, or a bulge, where the rock changes
    wz, ww = rng.uniform(0.25, 0.65), rng.uniform(0.03, 0.08)
    waist = rng.uniform(-0.12, 0.08) * np.exp(-((t - wz) / ww) ** 2)
    d = -run_k * run * (0.4 + 0.6 * smoothstep(0.08, 0.3, t)) + 0.45 * lumps - bed_k * strata + waist * r
    d = d * (1 - 0.6 * smoothstep(0.9, 1.0, t))
    rr = np.maximum(rr + d * np.clip(r / 4.5, 0.5, 1.4), 0.05)
    ox = cx + lean[0] * t ** 2
    oy = cy + lean[1] * t ** 2
    X = ox + rr * np.cos(th)
    Y = oy + rr * np.sin(th)
    Z = z - 1.2 * (t == 0)  # the foot reaches under the ground
    verts = np.stack([X.ravel(), Y.ravel(), Z.ravel()], 1).tolist()
    faces = []
    for j in range(n_z - 1):
        for i in range(n_a):
            a, b = j * n_a + i, j * n_a + (i + 1) % n_a
            faces.append((a, b, b + n_a, a + n_a))
    verts.append([cx, cy, -1.2])
    bottom = len(verts) - 1
    for i in range(n_a):
        faces.append((bottom, (i + 1) % n_a, i))
    top = None
    if True:
        verts.append([ox[-1, 0], oy[-1, 0], h + (0 if capped else 0.25)])
        top = len(verts) - 1
        base = (n_z - 1) * n_a
        for i in range(n_a):
            faces.append((base + i, base + (i + 1) % n_a, top))
    neck = float(np.mean(rr[-1]))
    return mesh_obj(name, verts, faces, "tuf"), (float(ox[-1, 0]), float(oy[-1, 0]), h, neck)


def cap_rock(name, x, y, z, radius, seed):
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=4, radius=1.0)
    rng = np.random.default_rng(seed)
    co = np.array([v.co[:] for v in bm.verts])
    sx, sy, sz = radius * rng.uniform(1.1, 1.35), radius * rng.uniform(1.0, 1.25), radius * rng.uniform(0.42, 0.6)
    co[:, 2] = np.where(co[:, 2] < 0, co[:, 2] * 0.45, co[:, 2])
    n = fbm(co[:, 0] * 2 + seed, co[:, 1] * 2, co[:, 2] * 2, 4)
    blocky = np.round(n * 3) / 3
    k = 1 + 0.18 * n + 0.08 * blocky
    co = co * k[:, None]
    co[:, 0] *= sx
    co[:, 1] *= sy
    co[:, 2] *= sz
    for v, c in zip(bm.verts, co):
        v.co = (c[0] + x, c[1] + y, c[2] + z + sz * 0.25)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    ob = bpy.data.objects.new(name, me)
    me.materials.append(MAT["bazalt"])
    return link(ob)


# ------------------------------------------------------------------ carving


def cutter_box(name, center, size, yaw):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2]))
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    ob.location = center
    ob.rotation_euler = (0, 0, yaw)
    me.materials.append(MAT["kesik"])
    return link(ob)


def cutter_arch(name, center, width, height, depth, yaw, horseshoe=1.15):
    """A doorway or niche: a (horseshoe) arched outline extruded along local y, one closed solid."""
    half = width / 2
    r = half * horseshoe
    spring = height - r  # centre of the arch circle
    # a horseshoe: the circle runs on below its widest point, down to the jambs
    start = math.acos(min(1.0, half / r))
    pts = [(-half, 0.0)]
    segs = 28
    for k in range(segs + 1):
        a = math.pi + start - (math.pi + 2 * start) * k / segs
        pts.append((math.cos(a) * r, spring + math.sin(a) * r))
    pts.append((half, 0.0))
    bm = bmesh.new()
    front = [bm.verts.new((x, -depth / 2, z)) for x, z in pts]
    back = [bm.verts.new((x, depth / 2, z)) for x, z in pts]
    bm.faces.new(front[::-1])
    bm.faces.new(back)
    n = len(pts)
    for k in range(n):
        a, b = k, (k + 1) % n
        bm.faces.new((front[a], front[b], back[b], back[a]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    ob.location = center
    ob.rotation_euler = (0, 0, yaw)
    me.materials.append(MAT["kesik"])
    return link(ob)


def apply_cuts(target, cutters, union=False):
    """Cut one solid at a time, baking each result. If the exact solver ever
    collapses the rock (it can, on a near-degenerate overlap), that one cutter
    is dropped and the rock kept as it was, instead of losing the whole cone."""
    print("  kesim", target.name, len(cutters), flush=True)
    for c in cutters:
        c.hide_render = True
        c.hide_viewport = True
    for c in cutters:
        before = len(target.data.polygons)
        mod = target.modifiers.new("cut", "BOOLEAN")
        mod.operation = "UNION" if union else "DIFFERENCE"
        mod.object = c
        try:
            mod.solver = "EXACT"
        except TypeError:
            pass
        mod.material_mode = "TRANSFER"
        mod.use_hole_tolerant = True
        dg = bpy.context.evaluated_depsgraph_get()
        me = bpy.data.meshes.new_from_object(target.evaluated_get(dg))
        target.modifiers.clear()
        if len(me.polygons) < before * 0.5:
            print("   UYARI: kesim atlandi", c.name, before, "->", len(me.polygons), flush=True)
            bpy.data.meshes.remove(me)
            continue
        old = target.data
        target.data = me
        bpy.data.meshes.remove(old)
    for c in cutters:
        bpy.data.objects.remove(c)


def cutter_rough_box(name, center, size, out, seed, amp=0.24):
    """A box whose face towards the rock (local -out * y) is rough: the front
    is hewn, not machined, and a thousand years of frost have worked it."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=26, use_grid_fill=True)
    for v in bm.verts:
        x, y, z = v.co.x * size[0], v.co.y * size[1], v.co.z * size[2]
        if v.co.y * out < -0.49:  # the face that becomes the church front
            n = fbm(np.array(x * 0.6 + seed), np.array(z * 0.6), np.array(seed * 0.1), 4)
            y += -out * amp * float(n)
            # the lower front is worn back further where feet and rain have been
            y += -out * 0.12 * float(smoothstep(1.2, -0.5, z + 3.0))
        v.co = Vector((x, y, z))
    for f in bm.faces:
        f.smooth = True
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    ob.location = center
    me.materials.append(MAT["kesik"])
    return link(ob)


def cutter_blob(name, center, radius, seed, squash=(1, 1, 1)):
    """A lump of broken-away rock: a lumpy, faceted sphere."""
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=3, radius=1.0)
    for v in bm.verts:
        c = np.array(v.co[:])
        n = float(fbm(np.array(c[0] * 1.7 + seed), np.array(c[1] * 1.7), np.array(c[2] * 1.7), 3))
        k = radius * (1 + 0.35 * n + 0.15 * round(n * 3) / 3)
        v.co = Vector((c[0] * k * squash[0], c[1] * k * squash[1], c[2] * k * squash[2]))
    for f in bm.faces:
        f.smooth = True
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    ob.location = center
    me.materials.append(MAT["kesik"])
    return link(ob)


def church_front(cone, cx, cy, r, seed, inside=False):
    """Carve a church front into the cone, facing the valley (towards y = 0)."""
    out = -1.0 if cy > 0 else 1.0  # outward normal along y
    yaw = 0.0 if out < 0 else math.pi  # local -y faces outward when yaw 0 ... see below
    face = cy + out * r * 0.62  # the carved plane: deep enough that the front is flat to 8 m
    cuts = []
    # the flat front: everything outside the plane, 7 m wide, 8 m high, is cut away
    cuts.append(cutter_rough_box("front", (cx, face + out * 6.0, 3.0), (7.4, 12.0, 10.0), out, seed))
    plane = face
    def at(x, z, depth, inward=True):
        # centre of a cutter whose outer face sits a little in front of the plane
        return (cx + x, plane - out * (depth / 2 - 0.15), z)
    # door (horseshoe), 1.3 m wide, 2.4 m high, 3.5 m into the rock
    cuts.append(cutter_arch("door", at(0, -0.05, 3.5), 1.3, 2.45, 3.5, 0))
    for e in (-1, 1):
        cuts.append(cutter_arch("win", at(e * 1.8, 2.3, 1.9 if inside else 1.2), 0.55, 1.0, 1.9 if inside else 1.2, 0))
    # blind arcade of five horseshoe arches on flat pilasters
    for k in range(5):
        cuts.append(cutter_arch("arc", at(-2.4 + k * 1.2, 4.0, 0.36), 0.86, 1.45, 0.36, 0))
    # cornice groove and a cross in the middle arch
    cuts.append(cutter_box("cornice", at(0, 5.95, 0.26), (6.6, 0.26, 0.16), 0))
    cuts.append(cutter_box("crossv", at(0, 4.75, 0.38), (0.12, 0.38, 0.62), 0))
    cuts.append(cutter_box("crossh", at(0, 4.85, 0.38), (0.42, 0.38, 0.12), 0))
    if inside:
        cuts += interior_cutters(cx, plane, -out)
    apply_cuts(cone, cuts)
    cuts = []
    # weathering: a corner of the front has fallen away, arch heads and the cornice are chipped
    wr = np.random.default_rng(seed)
    side = wr.choice([-1, 1])
    cuts.append(cutter_blob("cokuk", (cx + side * wr.uniform(3.0, 3.6), plane + out * 0.3, wr.uniform(0.2, 1.4)), wr.uniform(1.2, 1.7), seed, (1.0, 0.8, 1.3)))
    if wr.random() < 0.7:
        cuts.append(cutter_blob("cokuk2", (cx - side * wr.uniform(2.9, 3.4), plane + out * 0.2, wr.uniform(4.6, 5.8)), wr.uniform(0.7, 1.1), seed + 1, (1.0, 0.7, 1.0)))
    for k in range(10):
        if k < 5:
            x, z = -2.4 + k * 1.2 + wr.uniform(-0.45, 0.45), 4.0 + 1.45 + wr.uniform(-0.15, 0.1)
        elif k < 8:
            x, z = wr.uniform(-3.2, 3.2), 5.95 + wr.uniform(-0.1, 0.15)
        else:
            x, z = wr.choice([-0.68, 0.68]) + wr.uniform(-0.05, 0.05), wr.uniform(0.2, 2.0)
        cuts.append(cutter_blob("kirik", (cx + x, plane + out * 0.05, z), wr.uniform(0.1, 0.24), seed * 10 + k))
    apply_cuts(cone, cuts)
    if inside:
        furnish_interior(cone, cx, plane, -out)
    # three worn steps before the door
    steps = []
    for s in range(3):
        steps.append(cutter_box("step", (cx, plane + out * (0.35 + s * 0.35), -0.1 + 0.08 - s * 0.08), (1.9, 0.36 + s * 0.2, 0.3), 0))
    for st in steps:
        st.hide_render = False
        st.hide_viewport = False
    # red ochre lines painted round the arches: thin rings just in front of the plane
    paint_rings(cx, plane + out * 0.012, out)


# ------------------------------------------------------------------ the church inside (Karanlık Kilise)
#
# A cross-in-square cut out of the rock behind the door: four columns, barrel
# vaults over the arms of the cross, a dome on a low drum over the middle, three
# apses in the east wall; walls, vaults and dome painted (lapis-blue grounds,
# a row of saints, scenes in the vaults, the Pantocrator in the dome, the Deesis
# in the apse). Inward distance d is measured from the carved front.

ROOM = dict(d0=0.9, depth=4.4, width=5.0, wall=2.8, vault=1.25, dome=1.35, drum=0.7, apse=1.0, side_apse=0.62)


def _solid(name, bm, center, mat="kesik"):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    ob.location = center
    me.materials.append(MAT[mat])
    return link(ob)


def cutter_cyl(name, center, radius, length, axis, segs=48):
    bm = bmesh.new()
    res = bmesh.ops.create_cone(bm, cap_ends=True, segments=segs, radius1=radius, radius2=radius, depth=length)
    import mathutils
    if axis == "x":
        bmesh.ops.transform(bm, matrix=mathutils.Matrix.Rotation(math.pi / 2, 4, "Y"), verts=res["verts"])
    elif axis == "y":
        bmesh.ops.transform(bm, matrix=mathutils.Matrix.Rotation(math.pi / 2, 4, "X"), verts=res["verts"])
    return _solid(name, bm, center)


def cutter_sphere(name, center, radius):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=24, radius=radius)
    return _solid(name, bm, center)


def interior_cutters(cx, plane, inward):
    R = ROOM
    def W(x, d, z):
        return (cx + x, plane + inward * d, z)
    dc = R["d0"] + R["depth"] / 2
    cuts = [
        cutter_box("naos", W(0, dc, R["wall"] / 2), (R["width"], R["depth"], R["wall"]), 0),
        cutter_cyl("tonoz_x", W(0, dc, R["wall"]), R["vault"], R["width"], "x"),
        cutter_cyl("tonoz_y", W(0, dc, R["wall"]), R["vault"], R["depth"], "y"),
        cutter_cyl("kasnak", W(0, dc, R["wall"] + R["drum"] / 2), R["dome"], R["drum"] + 0.02, "z"),
        cutter_sphere("kubbe", W(0, dc, R["wall"] + R["drum"]), R["dome"]),
    ]
    back = R["d0"] + R["depth"]
    for x, ra in ((0, R["apse"]), (-1.75, R["side_apse"]), (1.75, R["side_apse"])):
        h = R["wall"] - 0.4 if x == 0 else R["wall"] - 0.9
        cuts.append(cutter_cyl("apsis", W(x, back, h / 2), ra, h, "z"))
        cuts.append(cutter_sphere("konk", W(x, back, h), ra))
    return cuts


def furnish_interior(cone, cx, plane, inward):
    R = ROOM
    dc = R["d0"] + R["depth"] / 2
    # the painted surfaces: every cut face inside the room takes the fresco material
    fresk = fresco_material(cx, plane, inward)
    cone.data.materials.append(fresk)
    idx = len(cone.data.materials) - 1
    kesik = cone.data.materials.find("tuf_kesik")
    for p in cone.data.polygons:
        c = p.center
        d = (c.y - plane) * inward
        if p.material_index == kesik and abs(c.x - cx) < R["width"] / 2 + 1.3 and R["d0"] - 0.05 < d < R["d0"] + R["depth"] + 1.4 and c.z > 0.35:
            p.material_index = idx
    # four columns cut free of the rock, with plain block capitals
    for sx in (-1, 1):
        for sd in (-1, 1):
            x, d = sx * R["vault"], dc + sd * R["vault"]
            bm = bmesh.new()
            res = bmesh.ops.create_cone(bm, cap_ends=True, segments=24, radius1=0.3, radius2=0.26, depth=R["wall"])
            bmesh.ops.translate(bm, vec=(0, 0, R["wall"] / 2), verts=res["verts"])
            cap = bmesh.ops.create_cube(bm, size=1.0)
            for v in cap["verts"]:
                v.co = Vector((v.co.x * 0.72, v.co.y * 0.72, v.co.z * 0.28 + R["wall"] - 0.14))
            col = _solid("sutun", bm, (cx + x, plane + inward * d, 0), "kesik")
            col.data.materials.append(fresk)
            for p in col.data.polygons:
                if p.center.z > 0.6:
                    p.material_index = 1
    # an altar block in the main apse and a stone bench along the walls
    back = R["d0"] + R["depth"]
    bm = bmesh.new()
    res = bmesh.ops.create_cube(bm, size=1.0)
    for v in res["verts"]:
        v.co = Vector((v.co.x * 0.9, v.co.y * 0.6, v.co.z * 1.0 + 0.5))
    _solid("sunak", bm, (cx, plane + inward * (back + 0.2), 0), "kesik")
    for sx in (-1, 1):
        bm = bmesh.new()
        res = bmesh.ops.create_cube(bm, size=1.0)
        for v in res["verts"]:
            v.co = Vector((v.co.x * 0.4, v.co.y * (R["depth"] - 0.6), v.co.z * 0.45 + 0.225))
        _solid("seki", bm, (cx + sx * (R["width"] / 2 - 0.2), plane + inward * dc, 0), "kesik")
    # oil lamps: the only light inside but for the door and two windows
    for x, d, z, w in ((0, back - 0.3, 1.25, 40), (-1.25, dc, 2.2, 22), (1.25, dc, 2.2, 22), (0, R["d0"] + 0.8, 2.0, 15)):
        lamp = bpy.data.lights.new("kandil", "POINT")
        lamp.energy = w
        lamp.color = (1.0, 0.62, 0.3)
        lamp.shadow_soft_size = 0.04
        lo = bpy.data.objects.new("kandil", lamp)
        lo.location = (cx + x, plane + inward * d, z)
        link(lo)


def fresco_material(cx, plane, inward):
    """One material for the whole painted room, zoned by height and place:
    a red dado, a row of saints, scenes in the vaults, the Pantocrator in the dome,
    the Deesis in the apse. Each zone uses its AI picture if there is one, else a
    plain lapis ground with ochre bands."""
    R = ROOM
    dc = R["d0"] + R["depth"] / 2
    m = bpy.data.materials.new("fresk")
    m.use_nodes = True
    nt = m.node_tree
    N = nt.nodes.new
    L = nt.links.new
    bsdf = nt.nodes["Principled BSDF"]
    bsdf.inputs["Roughness"].default_value = 0.85
    co = N("ShaderNodeTexCoord")
    sep = N("ShaderNodeSeparateXYZ")
    L(co.outputs["Object"], sep.inputs[0])

    def const(v):
        n = N("ShaderNodeValue")
        n.outputs[0].default_value = v
        return n.outputs[0]

    def math_(op, a, b=None):
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

    def mix(fac, a, b):
        n = N("ShaderNodeMix")
        n.data_type = "RGBA"
        for i, x in ((0, fac), (6, a), (7, b)):
            if isinstance(x, (int, float)):
                n.inputs[i].default_value = x
            elif isinstance(x, tuple):
                n.inputs[i].default_value = x
            else:
                L(x, n.inputs[i])
        return n.outputs[2]

    def band(lo, hi, v):  # 1 where lo < v < hi
        return math_("MULTIPLY", math_("GREATER_THAN", v, lo), math_("LESS_THAN", v, hi))

    def picture(name, origin, size, box=True):
        """`size` metres of wall per picture, starting at `origin` (x, y, z in metres).
        box: repeats round the room (box projection); flat: one picture facing along y."""
        img = tex_image(nt, name, tile=False)
        if img is None:
            return None
        mp = N("ShaderNodeMapping")
        scale = tuple(1 / v for v in size)
        mp.inputs["Scale"].default_value = scale
        if box:
            mp.inputs["Location"].default_value = tuple(-o * k for o, k in zip(origin, scale))
            img.extension = "REPEAT"
        else:
            # flat: u along x, v up the wall (z turned into the picture's y)
            mp.inputs["Rotation"].default_value = (-math.pi / 2, 0, 0)
            mp.inputs["Location"].default_value = (-origin[0] * scale[0], -origin[2] * scale[2], 0)
            img.projection = "FLAT"
            img.extension = "CLIP"
        L(co.outputs["Object"], mp.inputs["Vector"])
        L(mp.outputs[0], img.inputs["Vector"])
        return img.outputs["Color"]

    z = sep.outputs["Z"]
    lapis = (0.035, 0.08, 0.26, 1)
    noise = N("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 3
    L(co.outputs["Object"], noise.inputs["Vector"])
    ground = mix(noise.outputs["Fac"], lapis, (0.05, 0.1, 0.3, 1))
    # ochre and red border lines between the zones
    lines = math_("ADD", band(0.86, 0.92, z), band(2.66, 2.74, z))
    color = mix(lines, ground, (0.62, 0.18, 0.08, 1))
    # dado: red-ochre imitation marble
    dado = mix(noise.outputs["Fac"], (0.42, 0.13, 0.07, 1), (0.75, 0.55, 0.42, 1))
    color = mix(math_("LESS_THAN", z, 0.86), color, dado)
    # the saints, 0.92 - 2.66 m, a row of four every 3.6 m
    saints = picture("fresk-azizler", (0, 0, 0.92), (3.6, 3.6, 1.74))
    if saints:
        color = mix(band(0.92, 2.66, z), color, saints)
    # the vaults: scenes, 2.74 m up
    scene_ = picture("fresk-sahne", (0, 0, 2.74), (3.2, 3.2, 1.8))
    if scene_:
        color = mix(math_("GREATER_THAN", z, 2.74), color, scene_)
    # the apse: the Deesis across the conch
    dvec = math_("MULTIPLY", math_("SUBTRACT", sep.outputs["Y"], plane), inward)
    in_apse = math_("MULTIPLY", math_("GREATER_THAN", dvec, R["d0"] + R["depth"] - 0.1), math_("GREATER_THAN", z, 1.2))
    apse = picture("fresk-apsis", (cx - R["apse"] * 1.6, 0, 1.2), (R["apse"] * 3.2, 1, 2.4), box=False)
    if apse:
        color = mix(in_apse, color, apse)
    # the dome: the Pantocrator, projected from below
    dcy = plane + inward * dc
    dome_c = (cx, dcy)
    dx = math_("SUBTRACT", sep.outputs["X"], dome_c[0])
    dy = math_("SUBTRACT", sep.outputs["Y"], dome_c[1])
    in_dome = math_("GREATER_THAN", z, R["wall"] + 0.1)
    rr = math_("SQRT", math_("ADD", math_("POWER", dx, 2), math_("POWER", dy, 2)))
    in_dome = math_("MULTIPLY", in_dome, math_("LESS_THAN", rr, R["dome"] + 0.05))
    dome_img = tex_image(nt, "fresk-kubbe", tile=False)
    if dome_img:
        cxyz = N("ShaderNodeCombineXYZ")
        L(math_("ADD", math_("DIVIDE", dx, 2 * R["dome"] + 0.1), 0.5), cxyz.inputs[0])
        L(math_("ADD", math_("DIVIDE", math_("MULTIPLY", dy, -inward), 2 * R["dome"] + 0.1), 0.5), cxyz.inputs[1])
        dome_img.projection = "FLAT"
        dome_img.extension = "CLIP"
        L(cxyz.outputs[0], dome_img.inputs["Vector"])
        color = mix(in_dome, color, dome_img.outputs["Color"])
    else:
        color = mix(in_dome, color, (0.55, 0.42, 0.18, 1))
    L(color, bsdf.inputs["Base Color"])
    bmp = N("ShaderNodeBump")
    bmp.inputs["Strength"].default_value = 0.15
    L(noise.outputs["Fac"], bmp.inputs["Height"])
    L(bmp.outputs["Normal"], bsdf.inputs["Normal"])
    return m



def paint_rings(cx, y, out):
    for k in range(5):
        x = cx - 2.4 + k * 1.2
        bm = bmesh.new()
        r = 0.86 / 2 * 1.15
        r_out, r_in = r + 0.06, r + 0.005
        segs = 28
        vs = []
        for i in range(segs + 1):
            a = math.pi * (-0.15 + 1.3 * i / segs)
            for rr in (r_out, r_in):
                vs.append(bm.verts.new((x + math.cos(a) * rr, y, 4.0 + 1.45 - r + math.sin(a) * rr)))
        for i in range(segs):
            a, b, c, d = vs[2 * i], vs[2 * i + 1], vs[2 * i + 3], vs[2 * i + 2]
            bm.faces.new((a, b, c, d) if out < 0 else (d, c, b, a))
        me = bpy.data.meshes.new("boya")
        bm.to_mesh(me)
        bm.free()
        ob = bpy.data.objects.new("boya", me)
        me.materials.append(MAT["boya"])
        link(ob)


def dovecotes(cone, cx, cy, h, r, seed, n=5):
    rng = np.random.default_rng(seed)
    cuts = []
    for k in range(n):
        a = rng.uniform(0, 2 * math.pi)
        z = h * rng.uniform(0.42, 0.68)
        rad = r * (1 - 0.42 * (z / h) ** 1.25) * 0.98
        w, hh = rng.uniform(0.3, 0.5), rng.uniform(0.45, 0.9)
        c = cutter_box("hole", (cx + math.cos(a) * rad, cy + math.sin(a) * rad, z), (w, 1.6, hh), a + math.pi / 2)
        cuts.append(c)
    apply_cuts(cone, cuts)


# ------------------------------------------------------------------ build

layout = json.load(open(args.layout, encoding="utf-8"))
FIRST_CHURCH = next(i for i, c in enumerate(layout) if c["church"])
terrain()
for i, c in enumerate(layout):
    cx, cy = c["x"], -c["z"]
    lean = (c["lean"][0], -c["lean"][1])
    cone, (tx, ty, tz, neck) = cone_mesh(f"peri_{i}", cx, cy, c["h"], c["r"], lean, c["capped"], 100 + i)
    if c["church"]:
        church_front(cone, cx, cy, c["r"], 200 + i, inside=(i == FIRST_CHURCH))
    dovecotes(cone, cx, cy, c["h"], c["r"], 300 + i, n=3 if c["church"] else 5)
    if c["capped"]:
        cap_rock(f"sapka_{i}", tx, ty, tz - 0.3, max(neck * 1.35, c["r"] * 0.5), 400 + i)
    if c["twin"]:
        t = c["twin"]
        sx = cx + (-1 if lean[0] > 0 else 1) * c["r"] * 0.9
        sy = cy + (1 if cy > 0 else -1) * c["r"] * 0.7
        _, (ux, uy, uz, un) = cone_mesh(f"ikiz_{i}", sx, sy, c["h"] * t, c["r"] * t, (0, 0), True, 500 + i, n_a=96, n_z=80)
        cap_rock(f"ikiz_sapka_{i}", ux, uy, uz - 0.2, max(un * 1.4, c["r"] * t * 0.5), 600 + i)

# a few loose boulders fallen from the caps
for k in range(28):
    x, y = RNG.uniform(-60, 60), RNG.uniform(-26, 26)
    if abs(y) < 3:
        continue
    cap_rock(f"kaya_{k}", x, y, float(ground_height(np.array(x), np.array(y))) - 0.5, RNG.uniform(0.3, 1.1), 700 + k)



# ------------------------------------------------------------------ trees and bushes

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "glb"))
import random  # noqa: E402

import antik_trees as AT  # noqa: E402  (the leaf-card trees of the baked scenes)

BARK, LEAF = AT.make_materials(os.path.abspath(args.out), "goreme")


def emit(label, b):
    if not b.f:
        return
    me = bpy.data.meshes.new(label)
    me.from_pydata([tuple(v) for v in b.v], [], b.f)
    me.materials.append(BARK)
    me.materials.append(LEAF)
    me.polygons.foreach_set("material_index", b.mat)
    uv = me.uv_layers.new(name="UVMap")
    uv.data.foreach_set("uv", [x for t in b.uv for x in t])
    me.update()
    try:
        me.normals_split_custom_set([tuple(n) for n in b.nrm])
    except Exception:
        pass
    link(bpy.data.objects.new(label, me))


def clear_of(x, y, pad):
    for c in layout:
        cx, cy = c["x"], -c["z"]
        if math.hypot(x - cx, y - cy) < c["r"] * 1.7 + pad:
            return False
        if c["church"] and abs(x - cx) < 7 and 0 < (cy - y) * math.copysign(1, cy) < 18:
            return False  # keep the view of a church front open
    if math.hypot(x + 8.0, y) < 6.0:  # where the valley panorama is taken
        return False
    return abs(y) > 2.8  # and the path


TINT = (0.62, 0.7, 0.38)
placed = 0
for k in range(600):
    if placed >= 80:
        break
    x, y = RNG.uniform(-80, 80), RNG.uniform(-16, 16)
    if not clear_of(x, y, 2.0):
        continue
    z = float(ground_height(np.array(x), np.array(y)))
    rng = random.Random(900 + k)
    b = AT.Builder()
    if RNG.random() < 0.05:  # a poplar by the water
        AT.cypress_tree(b, rng, Vector((x, y, z + 0.3)), RNG.uniform(10, 15), RNG.uniform(2.6, 3.4), (0.7, 0.8, 0.45), rng.random())
    else:  # apricot, walnut
        AT.crown_tree(b, rng, Vector((x, y, z)), RNG.uniform(3.8, 6.5), RNG.uniform(3.5, 5.5), "broad", TINT, rng.random())
    emit(f"agac_{k}", b)
    placed += 1
b = AT.Builder()
for k in range(500):
    x, y = RNG.uniform(-90, 90), RNG.uniform(-24, 24)
    if not clear_of(x, y, 0.4):
        continue
    z = float(ground_height(np.array(x), np.array(y)))
    rng = random.Random(1300 + k)
    AT.bush(b, rng, Vector((x, y, z + 0.08)), RNG.uniform(0.5, 1.3), RNG.uniform(0.3, 0.7), "maquis", (0.8, 0.8, 0.6))
emit("calilar", b)
# dry grass tussocks over the valley floor
b = AT.Builder()
for k in range(2600):
    x, y = RNG.uniform(-70, 70), RNG.uniform(-20, 20)
    if not clear_of(x, y, 0.0) or abs(y) < 1.8:
        continue
    z = float(ground_height(np.array(x), np.array(y)))
    AT.bush(b, random.Random(5000 + k), Vector((x, y, z)), RNG.uniform(0.25, 0.6), RNG.uniform(0.18, 0.4), "grass", (0.85, 0.78, 0.5))
    if len(b.f) > 60000:
        emit("cimen", b)
        b = AT.Builder()
emit("cimen", b)


# ------------------------------------------------------------------ light, camera, render

w = bpy.data.worlds.new("gok")
scene.world = w
w.use_nodes = True
bg = w.node_tree.nodes["Background"]
sky = w.node_tree.nodes.new("ShaderNodeTexSky")
for kind in ("NISHITA", "MULTIPLE_SCATTERING", "SINGLE_SCATTERING"):
    try:
        sky.sky_type = kind
        break
    except TypeError:
        continue
SUN_ELEV, SUN_AZ = 24, 235
sky.sun_elevation = math.radians(SUN_ELEV)
sky.sun_rotation = math.radians(SUN_AZ)
w.node_tree.links.new(sky.outputs[0], bg.inputs[0])
bg.inputs[1].default_value = 0.18
sun = bpy.data.lights.new("gunes", "SUN")
sun.energy = 4.0
sun.color = (1.0, 0.86, 0.72)
sun.angle = math.radians(0.8)
so = bpy.data.objects.new("gunes", sun)
link(so)
so.rotation_euler = (math.radians(90 - SUN_ELEV), 0, math.radians(SUN_AZ + 90))

r = scene.render
r.engine = "CYCLES"
r.resolution_x, r.resolution_y = [int(v) for v in args.res.split("x")]
scene.cycles.samples = args.samples
scene.cycles.use_denoising = True
scene.view_settings.view_transform = "AgX"
scene.view_settings.exposure = -0.9
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
                print("GPU:", kind)
                break
        except TypeError:
            continue

cam = bpy.data.cameras.new("kamera")
cam.lens = 30
cam.clip_end = 3000
co = bpy.data.objects.new("kamera", cam)
link(co)
scene.camera = co
church = [c for c in layout if c["church"]]
c0 = church[0]
VIEWS = [
    # down the valley at eye level
    ((22.0, -4.0, 1.7), (-25.0, 6.0, 7.0), 28),
    # before a church front
    ((c0["x"] + 2.5, -c0["z"] - math.copysign(13.0, -c0["z"]), 1.7), (c0["x"], -c0["z"], 4.2), 30),
    # from the ridge
    ((48.0, -34.0, None), (-8.0, 0.0, 6.0), 30),
]
fc = layout[FIRST_CHURCH]
_out = -1.0 if -fc["z"] > 0 else 1.0
_plane = -fc["z"] + _out * fc["r"] * 0.62
_in = -_out
_dc = ROOM["d0"] + ROOM["depth"] / 2
VIEWS += [
    # inside, from the door towards the apse
    ((fc["x"] + 0.5, _plane + _in * 1.25, 1.55), (fc["x"], _plane + _in * (ROOM["d0"] + ROOM["depth"]), 1.9), 16),
    # up into the dome
    ((fc["x"] + 0.3, _plane + _in * (_dc - 1.5), 1.1), (fc["x"], _plane + _in * (_dc + 0.2), ROOM["wall"] + ROOM["drum"] + 1.0), 12),
]
if args.views:
    VIEWS = [tuple(tuple(float(x) for x in p.split(",")) if j < 2 else float(p) for j, p in enumerate(v.split(":"))) for v in args.views.split(";")]
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(os.path.abspath(args.out), "goreme-hd.blend"))
if not args.no_render:
    for n, (pos, target, lens) in enumerate(VIEWS):
        if pos[2] is None:  # so high above the ground there
            pos = (pos[0], pos[1], float(ground_height(np.array(pos[0]), np.array(pos[1]))) + 14.0)
        p, t = Vector(pos), Vector(target)
        co.location = p
        co.rotation_euler = (t - p).to_track_quat("-Z", "Y").to_euler()
        cam.lens = lens
        r.filepath = os.path.join(os.path.abspath(args.out), f"goreme-hd-{n}.png")
        bpy.ops.render.render(write_still=True)
        print("VIEW", n, r.filepath, flush=True)
if args.pano:
    # 360-degree panoramas (equirectangular) for the app's HD view: the image centre
    # looks along `yaw` (degrees, 0 = +x, counter-clockwise seen from above)
    cx0, cy0 = fc["x"], -fc["z"]
    PANOS = [
        ("vadi", (-8.0, 0.0, 1.7), 160.0),
        ("kilise-onu", (cx0 + 0.6, _plane - _in * 7.5, 1.7), math.degrees(math.atan2(_in, 0))),
        ("kilise-ici", (cx0, _plane + _in * (ROOM["d0"] + ROOM["depth"] / 2 - 0.6), 1.5), math.degrees(math.atan2(_in, 0))),
        ("sirt", (40.0, -30.0, None), 150.0),
    ]
    cam.type = "PANO"
    for attr, val in (("panorama_type", "EQUIRECTANGULAR"),):
        try:
            setattr(cam, attr, val)
        except (AttributeError, TypeError):
            cam.cycles.panorama_type = val
    r.resolution_x, r.resolution_y = [int(v) for v in args.pano_res.split("x")]
    if args.pano_samples:
        scene.cycles.samples = args.pano_samples
    r.image_settings.file_format = "JPEG"
    r.image_settings.quality = 86
    for key, pos, yaw in PANOS:
        if pos[2] is None:
            pos = (pos[0], pos[1], float(ground_height(np.array(pos[0]), np.array(pos[1]))) + 6.0)
        co.location = pos
        co.rotation_euler = (math.pi / 2, 0, math.radians(yaw) - math.pi / 2)
        r.filepath = os.path.join(os.path.abspath(args.out), f"goreme-360-{key}.jpg")
        bpy.ops.render.render(write_still=True)
        print("PANO", key, r.filepath, flush=True)
print("BITTI", flush=True)
