import bpy, math, os
from mathutils import Vector

STL = r"C:\Users\frede\Documents\Atelier Leys\SLOPY 90 FULL.stl"
OUT = os.path.join(os.path.dirname(__file__), "..", "renders", "probe")
os.makedirs(OUT, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.wm.stl_import(filepath=STL)
ob = bpy.context.selected_objects[0]
bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
ob.location = (0, 0, 0)
ob.scale = (0.001,) * 3  # mm -> m

# flat-face report: faces whose normal is constant across big area
from collections import defaultdict
h = defaultdict(float)
for p in ob.data.polygons:
    n = p.normal
    h[(round(n.x, 2), round(n.y, 2), round(n.z, 2))] += p.area
print("TOP", sorted(h.items(), key=lambda x: -x[1])[:6])

sc = bpy.context.scene
sc.render.engine = "BLENDER_WORKBENCH"
sc.render.resolution_x = 800
sc.render.resolution_y = 800
sc.display.shading.light = "STUDIO"
sc.display.shading.show_cavity = True
cam_data = bpy.data.cameras.new("cam")
cam_data.type = "ORTHO"
cam_data.ortho_scale = 0.18
cam = bpy.data.objects.new("cam", cam_data)
sc.collection.objects.link(cam)
sc.camera = cam

views = {"px": (1, 0, 0), "py": (0, 1, 0), "pz": (0, 0, 1), "iso": (1, -1, 0.8), "iso2": (-1, 1, 0.8)}
for name, d in views.items():
    v = Vector(d).normalized() * 1.0
    cam.location = v
    cam.rotation_euler = (-v).to_track_quat("-Z", "Y" if name != "pz" else "Y").to_euler()
    sc.render.filepath = os.path.join(OUT, name + ".png")
    bpy.ops.render.render(write_still=True)
