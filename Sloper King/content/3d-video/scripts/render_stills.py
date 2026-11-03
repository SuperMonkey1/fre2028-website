"""Render a few key frames of the .blend for quick checks.
blender -b sloperking_v1.blend -P scripts/render_stills.py -- 1 60 130 200 270 400
"""
import bpy, os, sys

args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else ["60", "130", "275", "420"]
tall = "tall" in args
frames = [int(a) for a in args if a.isdigit()]
sc = bpy.context.scene
root = os.path.dirname(bpy.data.filepath)
out = os.path.join(root, "renders", "stills")
os.makedirs(out, exist_ok=True)
if tall:
    sc.camera = bpy.data.objects["Cam_9x16"]
    sc.render.resolution_x, sc.render.resolution_y = 1080, 1920
look = bpy.data.objects.get("LabelLook")
if look:
    fmt = "tall" if tall else "wide"
    look.parent = sc.camera
    half = {"wide": (0.154, 0.087), "tall": (0.087, 0.154)}[fmt]
    for o in look.children:
        if f"uv_{fmt}" in o:
            u, v = o[f"uv_{fmt}"]
            o.location = (u * half[0], v * half[1], -0.6)
sc.render.image_settings.file_format = "PNG"
if "full" not in args:
    sc.render.resolution_percentage = 50
    sc.eevee.taa_render_samples = 16
for f in frames:
    sc.frame_set(f)
    sc.render.filepath = os.path.join(out, f"{'tall' if tall else 'wide'}_{f:03d}.png")
    bpy.ops.render.render(write_still=True)
