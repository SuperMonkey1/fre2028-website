"""Render one shot of the open .blend to a PNG sequence (for the advert edit).

blender -b scene.blend -P scripts/render_shot.py -- NAME FMT PCT SAMPLES STEP START END [CAMERA]
  -> renders/ad/<FMT>_<PCT>/<NAME>/0001.png ...
Frames are numbered from 1 in output order, so the edit does not care about STEP.
Without CAMERA the scene camera / timeline markers decide.
"""
import bpy, os, sys

a = sys.argv[sys.argv.index("--") + 1:]
name, fmt, pct, samples, step, start, end = a[0], a[1], int(a[2]), int(a[3]), int(a[4]), int(a[5]), int(a[6])
camera = a[7] if len(a) > 7 else None
sc = bpy.context.scene
if camera:
    sc.timeline_markers.clear()
    sc.camera = bpy.data.objects[camera]
elif fmt == "wide" and "Cam_16x9" in bpy.data.objects and not sc.timeline_markers:
    sc.camera = bpy.data.objects["Cam_16x9"]
elif fmt == "tall" and "Cam_9x16" in bpy.data.objects and not sc.timeline_markers:
    sc.camera = bpy.data.objects["Cam_9x16"]
sc.render.resolution_x, sc.render.resolution_y = (1080, 1920) if fmt == "tall" else (1920, 1080)
sc.render.resolution_percentage = pct
sc.eevee.taa_render_samples = samples
look = bpy.data.objects.get("LabelLook")
if look:
    look.parent = sc.camera
    half = {"wide": (0.154, 0.087), "tall": (0.087, 0.154)}[fmt]
    for o in look.children:
        if f"uv_{fmt}" in o:
            u, v = o[f"uv_{fmt}"]
            o.location = (u * half[0], v * half[1], -0.6)
ims = sc.render.image_settings
if hasattr(ims, "media_type"):
    ims.media_type = "IMAGE"
ims.file_format = "PNG"
ims.color_mode = "RGB"
ims.compression = 30
out = os.path.join(os.path.dirname(bpy.data.filepath), "renders", "ad", f"{fmt}_{pct}", name)
os.makedirs(out, exist_ok=True)
n = 0
for f in range(start, end + 1, step):
    n += 1
    sc.frame_set(f)
    sc.render.filepath = os.path.join(out, f"{n:04d}.png")
    bpy.ops.render.render(write_still=True)
print("SHOT", name, n, "frames ->", out)
