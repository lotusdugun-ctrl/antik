"""
Bir HD yapı sahnesini (scripts/blender/<yer>_hd.py) uygulamaya gidecek hafif, ışığı pişirilmiş GLB'ye çevirir.

Işık, gölge, ortam kapatması (AO) ve malzeme rengi Cycles ile dokuya pişirilir (DIFFUSE: doğrudan + dolaylı + renk;
bakış açısına bağlı parlama pişirilmez),
AgX ile tonlanıp sRGB JPEG olarak gömülür. Uygulama bu dokuyu ışıksız (MeshBasicMaterial)
gösterir: Mozaik3D tarzı yumuşak, "boyanmış" görünüm buradan gelir; telefon gölge hesaplamaz.

    blender -b --factory-startup --python scripts/blender/bake_glb.py -- ^
        --scene scripts/blender/celsus_hd.py --name celsus --out hd-out\\celsus-glb ^
        [--res 4096] [--ground-res 2048] [--samples 256] [--gpu] [--split-y 1.0] ^
        [--drop arazi] [--ground meydan] [--dokular gorseller-ai\\dokular]

Gruplar: yapı --split-y ile ikiye ayrılır (önü / arkası), her biri kendi atlasına; zemin (--ground) ayrı atlas.
Çıktı: <out>/<name>.glb ve <out>/<name>-atlas-*.jpg (kontrol için).
"""
import argparse
import os
import runpy
import sys
import time

import bpy  # noqa: I001
import numpy as np
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument("--scene", required=True)
ap.add_argument("--name", required=True)
ap.add_argument("--out", required=True)
ap.add_argument("--res", type=int, default=4096)
ap.add_argument("--ground-res", type=int, default=2048)
ap.add_argument("--samples", type=int, default=256)
ap.add_argument("--gpu", action="store_true")
ap.add_argument("--split-y", type=float, default=None)
ap.add_argument("--drop", default="arazi", help="virgülle: atılacak nesne adı önekleri")
ap.add_argument("--ground", default="meydan", help="virgülle: zemin nesnesi önekleri")
ap.add_argument("--dokular", default="")
ap.add_argument("--quality", type=int, default=88)
ap.add_argument("--exposure", type=float, default=-2.2, help="dış yüzler (HD görünümlerle aynı)")
ap.add_argument("--exposure-arka", type=float, default=0.4, help="iç mekân atlası daha aydınlık")
ap.add_argument("--no-denoise", action="store_true")
args = ap.parse_args(argv)
out = os.path.abspath(args.out)
os.makedirs(out, exist_ok=True)
t0 = time.time()


def log(*a):
    print(f"[{time.time() - t0:6.0f} s]", *a, flush=True)


# ------------------------------------------------------------------ sahneyi kur (render yok)
scene_args = ["--out", os.path.join(out, "_sahne"), "--no-render"]
if args.dokular:
    scene_args += ["--dokular", args.dokular]
sys.argv = [sys.argv[0], "--"] + scene_args
runpy.run_path(os.path.abspath(args.scene), run_name="__main__")
scene = bpy.context.scene
log("sahne kuruldu")

pref = lambda o, names: any(o.name.split(".")[0] == n or o.name.startswith(n) for n in names)  # noqa: E731
drop = [s for s in args.drop.split(",") if s]
ground = [s for s in args.ground.split(",") if s]
for o in list(bpy.data.objects):
    if o.type == "CAMERA" or (o.type == "MESH" and pref(o, drop)):
        bpy.data.objects.remove(o, do_unlink=True)

# ------------------------------------------------------------------ cycles
scene.render.engine = "CYCLES"
scene.cycles.samples = args.samples
scene.cycles.use_denoising = False
if args.gpu:
    prefs = bpy.context.preferences.addons["cycles"].preferences
    for kind in ("OPTIX", "CUDA", "HIP", "ONEAPI", "METAL"):
        try:
            prefs.compute_device_type = kind
            prefs.get_devices()
            devs = [d for d in prefs.devices if d.type == kind]
            if devs:
                for d in prefs.devices:
                    d.use = d.type == kind
                scene.cycles.device = "GPU"
                log("GPU:", kind, [d.name for d in devs])
                break
        except TypeError:
            continue


# ------------------------------------------------------------------ gruplar
def world_center(o):
    pts = [o.matrix_world @ Vector(c) for c in o.bound_box]
    return sum(pts, Vector()) / 8


meshes = [o for o in scene.objects if o.type == "MESH"]
groups = {"zemin": [], "on": [], "arka": []}
for o in meshes:
    if pref(o, ground):
        groups["zemin"].append(o)
    elif args.split_y is not None and world_center(o).y > args.split_y:
        groups["arka"].append(o)
    else:
        groups["on"].append(o)
groups = {k: v for k, v in groups.items() if v}


def join(name, objs):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.hide_set(False)
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.make_single_user(object=True, obdata=True)
    bpy.ops.object.convert(target="MESH")
    if len(objs) > 1:
        bpy.ops.object.join()
    ob = bpy.context.view_layer.objects.active
    ob.name = name
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    return ob


joined = {k: join(f"{args.name}_{k}", v) for k, v in groups.items()}
log("birleştirildi:", {k: len(o.data.polygons) for k, o in joined.items()})


def unwrap(ob):
    me = ob.data
    me.uv_layers.new(name="pisirme")
    me.uv_layers.active = me.uv_layers["pisirme"]
    bpy.ops.object.select_all(action="DESELECT")
    ob.select_set(True)
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=1.15, island_margin=0.0, area_weight=0.0, scale_to_bounds=False)
    bpy.ops.uv.pack_islands(rotate=True, margin=0.002)
    bpy.ops.object.mode_set(mode="OBJECT")
    return "pisirme"


def _bake_into(ob, img, uv, passes):
    """Etkin doku düğümü olarak img'yi her malzemeye ver ve DIFFUSE pişir."""
    for slot in ob.material_slots:
        m = slot.material
        if not m or not m.node_tree:
            continue
        n = m.node_tree.nodes.get("_pisir") or m.node_tree.nodes.new("ShaderNodeTexImage")
        n.name = "_pisir"
        n.image = img
        for x in m.node_tree.nodes:
            x.select = False
        n.select = True
        m.node_tree.nodes.active = n
    bpy.ops.object.select_all(action="DESELECT")
    ob.select_set(True)
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.bake(type="DIFFUSE", pass_filter=passes, margin=12, use_clear=True, uv_layer=uv)


def _pixels(img):
    a = np.empty(img.size[0] * img.size[1] * 4, dtype=np.float32)
    img.pixels.foreach_get(a)
    return a


def _denoise(img):
    """Işık dokusunu Blender'ın OIDN'i ile gürültüden arındırır (boş bir yardımcı sahnede birleştirici)."""
    path = os.path.join(out, "_isik.exr")
    img.filepath_raw = path
    img.file_format = "OPEN_EXR"
    img.save()
    src = bpy.data.images.load(path, check_existing=False)
    sc = bpy.data.scenes.new("_gurultu")
    sc.render.engine = "CYCLES"
    sc.cycles.samples = 1
    sc.render.resolution_x, sc.render.resolution_y = img.size
    sc.render.resolution_percentage = 100
    sc.view_settings.view_transform = "Standard"
    sc.view_settings.look = "None"
    sc.view_settings.exposure = 0.0
    sc.display_settings.display_device = "sRGB"
    sc.render.image_settings.file_format = "OPEN_EXR"
    sc.render.image_settings.color_depth = "32"
    sc.render.film_transparent = False
    ng = bpy.data.node_groups.new("_gurultu", "CompositorNodeTree")
    ng.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
    sc.compositing_node_group = ng
    im = ng.nodes.new("CompositorNodeImage")
    im.image = src
    dn = ng.nodes.new("CompositorNodeDenoise")
    go = ng.nodes.new("NodeGroupOutput")
    ng.links.new(im.outputs["Image"], dn.inputs["Image"])
    ng.links.new(dn.outputs["Image"], go.inputs[0])
    dpath = os.path.join(out, "_isik_temiz.exr")
    sc.render.filepath = dpath
    with bpy.context.temp_override(scene=sc):
        bpy.ops.render.render(write_still=True, scene=sc.name)
    res = bpy.data.images.load(dpath, check_existing=False)
    res.colorspace_settings.name = "Non-Color"
    a = _pixels(res)
    bpy.data.scenes.remove(sc)
    return a


def bake(ob, res, tag, exposure):
    uv = unwrap(ob)
    log(f"pişiriliyor: {tag} {res}px, {len(ob.data.polygons)} yüz")
    alb = bpy.data.images.new(f"_renk_{tag}", res, res, float_buffer=True)
    _bake_into(ob, alb, uv, {"COLOR"})
    light = bpy.data.images.new(f"_isik_{tag}", res, res, float_buffer=True)
    light.colorspace_settings.name = "Non-Color"
    _bake_into(ob, light, uv, {"DIRECT", "INDIRECT"})
    log("pişti:", tag)
    lit = _pixels(light)
    if not args.no_denoise:
        try:
            lit = _denoise(light)
            log("gürültü temizlendi")
        except Exception as error:  # birleştirici yoksa ham ışıkla devam
            log("gürültü temizlenemedi:", error)
    col = _pixels(alb)
    comb = col * lit
    comb[3::4] = 1.0
    final = bpy.data.images.new(f"{args.name}-atlas-{tag}", res, res, float_buffer=True)
    final.pixels.foreach_set(comb)
    # AgX ile tonla ve sRGB JPEG olarak yaz (uygulama ışıksız gösterir)
    scene.view_settings.exposure = exposure
    scene.render.image_settings.file_format = "JPEG"
    scene.render.image_settings.quality = args.quality
    path = os.path.join(out, f"{args.name}-atlas-{tag}.jpg")
    final.save_render(path, scene=scene)
    baked = bpy.data.images.load(path)
    # tek, sade malzeme: taban rengi = pişmiş doku
    mat = bpy.data.materials.new(f"{args.name}_{tag}_pismis")
    mat.use_nodes = True
    nt = mat.node_tree
    b = nt.nodes["Principled BSDF"]
    t = nt.nodes.new("ShaderNodeTexImage")
    t.image = baked
    uvn = nt.nodes.new("ShaderNodeUVMap")
    uvn.uv_map = uv
    nt.links.new(uvn.outputs[0], t.inputs[0])
    nt.links.new(t.outputs[0], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 1.0
    ob.data.materials.clear()
    ob.data.materials.append(mat)
    for layer in list(ob.data.uv_layers):
        if layer.name != uv:
            ob.data.uv_layers.remove(layer)
    return ob


for tag, ob in joined.items():
    bake(ob, args.ground_res if tag == "zemin" else args.res, tag,
         args.exposure_arka if tag == "arka" else args.exposure)

# ------------------------------------------------------------------ dışa aktar
for o in list(bpy.data.objects):
    if o not in joined.values():
        bpy.data.objects.remove(o, do_unlink=True)
for ob in joined.values():
    ob.select_set(True)
glb = os.path.join(out, f"{args.name}.glb")
bpy.ops.export_scene.gltf(
    filepath=glb, export_format="GLB", use_selection=True, export_apply=True,
    export_image_format="JPEG", export_jpeg_quality=args.quality,
    export_normals=False, export_tangents=False, export_materials="EXPORT",
    export_yup=True,
)
log("GLB:", glb, f"{os.path.getsize(glb) / 1e6:.1f} MB")
print("BITTI", flush=True)
