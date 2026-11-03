"""Clean 3D frame for the thumbnail: the advert camera with a lens shift (moves the product
down without changing the perspective).
blender -b sloperking_arms_ad.blend -P scripts/render_thumb_frame.py -- FRAME SHIFT_Y [LENS_FACTOR] [OUT_NAME] [noskin]"""
import bpy, os, sys
a = sys.argv[sys.argv.index("--") + 1:]
frame, shift = int(a[0]), float(a[1])
lens_f = float(a[2]) if len(a) > 2 else 1.0
out_name = a[3] if len(a) > 3 else "thumb_frame"
if "noskin" in a and "ArmSkin" in bpy.data.objects:
    sk = bpy.data.objects["ArmSkin"]; sk.animation_data_clear(); sk.hide_render = True
sc = bpy.context.scene
sc.camera = bpy.data.objects["Cam_9x16"]
sc.camera.data.shift_y = shift
sc.camera.data.lens *= lens_f      # < 1: product smaller, more room for copy
sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = 1080, 1920, 100
sc.eevee.taa_render_samples = 32
look = bpy.data.objects.get("LabelLook")
if look:
    look.parent = sc.camera
    for o in look.children:            # labels on their 9:16 positions (as render_shot.py)
        if "uv_tall" in o:
            u, v = o["uv_tall"]
            o.location = (u * 0.087, v * 0.154, -0.6)
ims = sc.render.image_settings
if hasattr(ims, "media_type"):
    ims.media_type = "IMAGE"
ims.file_format = "PNG"
sc.frame_set(frame)
sc.render.filepath = os.path.join(os.path.dirname(bpy.data.filepath), "renders", "ad", out_name + ".png")
bpy.ops.render.render(write_still=True)
