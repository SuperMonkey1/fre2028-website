import bpy, bmesh, sys
from mathutils import Vector

STL = r"C:\Users\frede\Documents\Atelier Leys\SLOPY 90 FULL.stl"
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.wm.stl_import(filepath=STL)
ob = bpy.context.selected_objects[0]
me = ob.data
print("verts", len(me.vertices), "faces", len(me.polygons))
xs = [v.co for v in me.vertices]
mn = Vector((min(v.x for v in xs), min(v.y for v in xs), min(v.z for v in xs)))
mx = Vector((max(v.x for v in xs), max(v.y for v in xs), max(v.z for v in xs)))
print("min", tuple(round(c, 2) for c in mn), "max", tuple(round(c, 2) for c in mx), "size", tuple(round(c, 2) for c in mx - mn))

# area-weighted normal histogram to find big flat/curved faces
from collections import defaultdict
h = defaultdict(float)
for p in me.polygons:
    n = p.normal
    key = (round(n.x, 1), round(n.y, 1), round(n.z, 1))
    h[key] += p.area
for k, a in sorted(h.items(), key=lambda x: -x[1])[:15]:
    print("normal", k, "area", round(a, 1))

# cross-section profile: sample vertices near the middle of the smallest-extent axis... print a slice
size = mx - mn
axes = sorted(range(3), key=lambda i: size[i])
print("axes by size", axes)
