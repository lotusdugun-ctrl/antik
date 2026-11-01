# Run inside Blender: reports the version and the GPUs Cycles can use.
import bpy, sys, pathlib
out = []
out.append(f"Blender {bpy.app.version_string}")
prefs = bpy.context.preferences.addons["cycles"].preferences
for kind in ("HIP", "CUDA", "OPTIX", "ONEAPI", "METAL"):
    try:
        prefs.compute_device_type = kind
        prefs.get_devices()
        devs = [d.name for d in prefs.devices if d.type == kind]
        if devs:
            out.append(f"{kind}: {', '.join(devs)}")
    except Exception as e:
        pass
if len(out) == 1:
    out.append("Ekran karti bulunamadi: islemler CPU ile yapilir (daha yavas).")
text = "\n".join(out)
print("\n=== SONUC ===\n" + text)
target = pathlib.Path(sys.argv[sys.argv.index("--") + 1])
target.write_text(text + "\n", encoding="utf-8")
