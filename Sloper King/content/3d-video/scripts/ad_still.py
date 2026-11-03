"""Render single frames of the edited advert (thumbnail / cover).
blender -b sloperking_ad_edit.blend -P scripts/ad_still.py -- OUT_PREFIX PCT t1 [t2 ...]   (times in seconds)"""
import bpy, os, sys
a = sys.argv[sys.argv.index("--") + 1:]
prefix, pct, times = a[0], int(a[1]), [float(x) for x in a[2:]]
sc = bpy.context.scene
sc.render.resolution_percentage = pct
ims = sc.render.image_settings
if hasattr(ims, "media_type"):
    ims.media_type = "IMAGE"
ims.file_format = "PNG"
for t in times:
    sc.frame_set(int(round(t * sc.render.fps)) + 1)
    sc.render.filepath = f"{prefix}_{t:04.1f}s.png"
    bpy.ops.render.render(write_still=True)
