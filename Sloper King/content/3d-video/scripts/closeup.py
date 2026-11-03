import bpy, os
from mathutils import Vector
sc = bpy.context.scene
sc.frame_set(440)
cd = bpy.data.cameras.new("probe"); cd.lens = 60
c = bpy.data.objects.new("probe", cd); sc.collection.objects.link(c)
c.location = (-0.22, 0.05, 0.08)
c.rotation_euler = (Vector((-0.045, 0.0, 0.01)) - c.location).to_track_quat("-Z", "Y").to_euler()
sc.camera = c
sc.render.resolution_percentage = 50
sc.render.filepath = os.path.join(os.path.dirname(bpy.data.filepath), "renders", "stills", "closeup_slot.png")
bpy.ops.render.render(write_still=True)
