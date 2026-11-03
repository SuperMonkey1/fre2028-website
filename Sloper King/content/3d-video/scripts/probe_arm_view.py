"""Quick workbench views of the arm scene: blender -b sloperking_arms_v1.blend -P scripts/probe_arm_view.py -- tag"""
import bpy, os, sys
from mathutils import Vector

tag = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "a"
sc = bpy.context.scene
root = os.path.dirname(bpy.data.filepath)
out = os.path.join(root, "renders", "probe")
sc.frame_set(440)
bpy.context.view_layer.layer_collection.children["Lines"].exclude = True
cols = {"ArmBones": (0.92, 0.9, 0.82, 1), "ArmMuscles": (0.62, 0.3, 0.3, 1), "ArmKeyMuscles": (1, 0.55, 0.05, 1)}
for cn, c in cols.items():
    for o in bpy.data.collections[cn].objects:
        o.color = c
bpy.data.objects["SloperKing"].color = (0.1, 0.1, 0.1, 1)
bpy.data.objects["GripPaper"].color = (0.75, 0.55, 0.25, 1)
bpy.data.objects["Rope"].color = (1, 0.4, 0.1, 1)
sc.render.engine = "BLENDER_WORKBENCH"
sc.display.shading.color_type = "OBJECT"
sc.display.shading.light = "STUDIO"
sc.render.resolution_x, sc.render.resolution_y = 800, 1000
sc.render.resolution_percentage = 100
cd = bpy.data.cameras.new("pc"); cd.lens = 50; cd.clip_start = 0.01
cam = bpy.data.objects.new("pc", cd); sc.collection.objects.link(cam); sc.camera = cam
tgt = Vector((0, 0.03, -0.06))
views = {"side": (-0.9, 0.0, -0.05), "front34": (-0.5, 0.65, 0.05), "back34": (-0.55, -0.6, 0.0), "photo": (0.25, 0.75, -0.35)}
for nm, d in views.items():
    cam.location = tgt + Vector(d)
    cam.rotation_euler = (tgt - cam.location).to_track_quat("-Z", "Y").to_euler()
    sc.render.filepath = os.path.join(out, f"arm_{tag}_{nm}.png")
    bpy.ops.render.render(write_still=True)
