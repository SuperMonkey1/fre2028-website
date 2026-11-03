"""Render the animation to MP4.
blender -b sloperking_v1.blend -P scripts/render_video.py -- wide|tall [percent] [samples]
test (default): 50 % / 12 samples  -  final: 100 64
optional 4th arg: speed (2 = twice as fast, renders every 2nd frame)
"""
import bpy, os, sys

args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else ["wide"]
start = None
fmt = args[0]
pct = int(args[1]) if len(args) > 1 else 50
samples = int(args[2]) if len(args) > 2 else 12
speed = int(args[3]) if len(args) > 3 else 1
sc = bpy.context.scene
if fmt == "tall":
    sc.camera = bpy.data.objects["Cam_9x16"]
    sc.render.resolution_x, sc.render.resolution_y = 1080, 1920
else:
    sc.camera = bpy.data.objects["Cam_16x9"]
    sc.render.resolution_x, sc.render.resolution_y = 1920, 1080
sc.render.resolution_percentage = pct
look = bpy.data.objects.get("LabelLook")
if look:  # labels face / title sticks to the active camera
    look.parent = sc.camera
    half = {"wide": (0.154, 0.087), "tall": (0.087, 0.154)}[fmt]
    for o in look.children:
        if f"uv_{fmt}" in o:
            u, v = o[f"uv_{fmt}"]
            o.location = (u * half[0], v * half[1], -0.6)
sc.eevee.taa_render_samples = samples
sc.frame_step = speed
ims = sc.render.image_settings
if hasattr(ims, "media_type"):
    ims.media_type = "VIDEO"
ims.file_format = "FFMPEG"
sc.render.ffmpeg.format = "MPEG4"
sc.render.ffmpeg.codec = "H264"
sc.render.ffmpeg.constant_rate_factor = "HIGH"
sc.render.ffmpeg.audio_codec = "NONE"
root = os.path.dirname(bpy.data.filepath)
sc.render.filepath = os.path.join(root, "renders", f"{os.path.splitext(os.path.basename(bpy.data.filepath))[0]}_{fmt}_{pct}pct{'_%dx' % speed if speed > 1 else ''}_")
bpy.ops.render.render(animation=True)
