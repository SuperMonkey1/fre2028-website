import bpy, os, numpy as np
from mathutils import Vector

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "renders", "probe")
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
parts = [l.split() for l in open(os.path.join(ROOT, "scripts", "bp3d_parts.txt")) if l.strip() and not l.startswith("#")]
cols = {"bone": (0.9, 0.88, 0.8, 1), "muscle": (0.6, 0.35, 0.35, 1), "key": (1, 0.55, 0.0, 1)}
allco = []
for role, fid, name in parts:
    bpy.ops.wm.stl_import(filepath=os.path.join(ROOT, "assets", "bp3d", fid + ".stl"))
    ob = bpy.context.selected_objects[0]
    ob.name = name
    ob.color = cols[role]
    co = np.array([v.co[:] for v in ob.data.vertices])
    allco.append(co)
    print(f"PART {name:28s} {len(co):7d} min {np.round(co.min(0),1)} max {np.round(co.max(0),1)}")
a = np.concatenate(allco)
mn, mx = a.min(0), a.max(0)
print("ALL", mn, mx)
c = (mn + mx) / 2
sc.render.engine = "BLENDER_WORKBENCH"
sc.display.shading.color_type = "OBJECT"
sc.render.resolution_x, sc.render.resolution_y = 700, 1000
cd = bpy.data.cameras.new("c"); cd.type = "ORTHO"; cd.ortho_scale = float((mx - mn).max()) * 1.05; cd.clip_end = 5000
cam = bpy.data.objects.new("c", cd); sc.collection.objects.link(cam); sc.camera = cam
for nm, d in {"arm_front": (0, -1, 0), "arm_side": (1, 0, 0), "arm_back": (0, 1, 0)}.items():
    cam.location = Vector(c) + Vector(d) * 1000
    cam.rotation_euler = (-Vector(d)).to_track_quat("-Z", "Y").to_euler()
    sc.render.filepath = os.path.join(OUT, nm + ".png")
    bpy.ops.render.render(write_still=True)
