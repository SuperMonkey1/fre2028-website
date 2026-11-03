"""Photoreal version of the rotating end-card shot (Cycles, white studio, soft contact shadow).
Materials follow the presale product photo (measured colours).

  blender -b sloperking_adshots.blend -P scripts/ad_end_real.py -- OUT_DIR SAMPLES FIRST LAST [STEP]
  -> OUT_DIR/0001.png ... (RGBA: transparent background + shadow, composited on white in ad_edit.py)
"""
import bpy, os, sys, math
from mathutils import Vector

a = sys.argv[sys.argv.index("--") + 1:]
out, samples, first, last = a[0], int(a[1]), int(a[2]), int(a[3])
step = int(a[4]) if len(a) > 4 else 1
sc = bpy.context.scene

GRIP = (0.287, 0.117, 0.012)     # linear, measured on the lit grip paper in the photo
PLA = (0.006, 0.0065, 0.009)     # black PLA (photo: ~ sRGB 11/12/17)
ROPE_ORANGE = (0.36, 0.09, 0.012)

# ---------------------------------------------------------------- materials
body = bpy.data.materials["Body"].node_tree
for n in body.nodes:
    if n.type == "MIX" and getattr(n, "data_type", "") == "RGBA":
        n.inputs[6].default_value = (*PLA, 1)
        n.inputs[7].default_value = (0.11, 0.115, 0.125, 1)     # lasered text: matte grey
    if n.type == "MAP_RANGE" and abs(n.inputs["To Min"].default_value - 0.36) < 1e-3:
        n.inputs["To Min"].default_value = 0.62                # matte PLA, like the photo
    if n.type == "BSDF_PRINCIPLED":
        n.inputs["Specular IOR Level"].default_value = 0.22
        n.inputs["Coat Weight"].default_value = 0.0
# fine print-layer lines on the PLA (bump along the width = layer direction)
bsdf = [n for n in body.nodes if n.type == "BSDF_PRINCIPLED"][0]
tc = body.nodes.new("ShaderNodeTexCoord")
wave = body.nodes.new("ShaderNodeTexWave"); wave.wave_type = "BANDS"; wave.bands_direction = "Z"
wave.inputs["Scale"].default_value = 900.0
body.links.new(tc.outputs["Object"], wave.inputs["Vector"])
bump = body.nodes.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.08
bump.inputs["Distance"].default_value = 0.0001
body.links.new(wave.outputs["Fac"], bump.inputs["Height"]); body.links.new(bump.outputs[0], bsdf.inputs["Normal"])

grip = bpy.data.materials["GripPaper"].node_tree
for n in grip.nodes:
    if n.type == "VALTORGB":
        n.color_ramp.elements[0].color = (GRIP[0] * 0.7, GRIP[1] * 0.68, GRIP[2] * 0.6, 1)
        n.color_ramp.elements[1].color = (GRIP[0] * 1.12, GRIP[1] * 1.1, GRIP[2] * 1.05, 1)
    if n.type == "BSDF_PRINCIPLED":
        n.inputs["Roughness"].default_value = 0.92
        n.inputs["Specular IOR Level"].default_value = 0.25
        n.inputs["Sheen Weight"].default_value = 0.12      # paper grit catches light at grazing angles
    if n.type == "BUMP":
        n.inputs["Strength"].default_value = 0.5

# ---------------------------------------------------------------- white studio
w = sc.world.node_tree
for n in w.nodes:
    if n.type == "BACKGROUND":
        n.inputs["Color"].default_value = (1, 1, 1, 1)
        if n.inputs["Strength"].default_value < 1.0:
            n.inputs["Strength"].default_value = 0.025     # dark studio: no white reflections washing out the black PLA
for l in [o for o in sc.objects if o.type == "LIGHT"]:
    bpy.data.objects.remove(l)


def area(name, loc, power, size, target=(0, 0, 0)):
    ld = bpy.data.lights.new(name, "AREA"); ld.energy = power; ld.size = size; ld.shape = "DISK"
    o = bpy.data.objects.new(name, ld); sc.collection.objects.link(o)
    o.location = loc
    o.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()


area("Softbox", (0.05, 0.25, 0.55), 18, 0.9)        # big key from above-front
area("Rim_L", (-0.45, -0.3, 0.2), 12, 0.3)          # edge light, separates black from white
area("Rim_R", (0.45, -0.25, 0.15), 8, 0.3)
area("Fill", (0.0, 0.6, -0.05), 4, 1.2)             # lifts the black front, keeps the label readable

# ---------------------------------------------------------------- contact shadow
co = [v.co.z for v in bpy.data.objects["SloperKing"].data.vertices]
bpy.ops.mesh.primitive_plane_add(size=0.7, location=(0, 0, min(co) - 0.012))
ground = bpy.context.object
ground.is_shadow_catcher = True

# ---------------------------------------------------------------- Cycles
sc.render.engine = "CYCLES"
cp = bpy.context.preferences.addons["cycles"].preferences
dev = "CPU"
for t in ("HIP", "ONEAPI", "OPENCL"):
    try:
        cp.compute_device_type = t
        cp.get_devices()
        if any(d.type == t for d in cp.devices):
            for d in cp.devices:
                d.use = True
            dev = "GPU"
            break
    except TypeError:
        pass
sc.cycles.device = dev
print("CYCLES DEVICE", dev, cp.compute_device_type)
sc.cycles.samples = samples
sc.cycles.use_denoising = True
sc.cycles.use_adaptive_sampling = True
sc.cycles.max_bounces = 6
sc.render.film_transparent = True
sc.view_settings.view_transform = "AgX"   # camera-like highlights (background is transparent)
sc.view_settings.look = "AgX - Punchy"
sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = 1080, 1920, 100
ims = sc.render.image_settings
if hasattr(ims, "media_type"):
    ims.media_type = "IMAGE"
ims.file_format = "PNG"; ims.color_mode = "RGBA"
os.makedirs(out, exist_ok=True)
k = 0
for f in range(first, last + 1, step):
    k += 1
    sc.frame_set(f)
    sc.render.filepath = os.path.join(out, f"{k:04d}.png")
    bpy.ops.render.render(write_still=True)
print("DONE", k)
