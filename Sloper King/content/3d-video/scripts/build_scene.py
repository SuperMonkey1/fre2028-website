"""Sloper King: technical drawing -> reality.  Builds sloperking_v1.blend.

Run:  blender -b --factory-startup -P scripts/build_scene.py
Timeline (30 fps, 450 frames = 15 s):
  0-20     pure white
  20-110   profile outlines drawn line by line + silhouette
  90-200   surface raster drawn fast, dimension line, rope line
  220-330  scan sweep along the width: drawing -> real product
  330-450  hero shot, camera keeps orbiting
"""
import bpy, bmesh, math, os
import numpy as np
from mathutils import Vector, Matrix

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
STL = r"C:\Users\frede\Documents\Atelier Leys\SLOPY 90 FULL.stl"
LABEL = os.path.join(ROOT, "assets", "label.png")
import sys
VER = (sys.argv[sys.argv.index("--") + 1:] or ["v1"])[0] if "--" in sys.argv else "v1"
BLEND = os.path.join(ROOT, f"sloperking_{VER}.blend")

FPS, F_END = 30, 450
T_SWEEP0, T_SWEEP1 = 220, 330
ROPE_NOTCH = 2      # which of the 5 slot notches holds the rope (0 = front)
TILT = 0           # degrees about X
LABEL_W, LABEL_DZ = 0.074, -0.0108
GRIP_LINE = 0.42  # grip edge height (fraction of part height)

LINE_COL = (0.03, 0.05, 0.09)
SCAN_COL = (1.0, 0.42, 0.08)
PLA_COL = (0.012, 0.012, 0.014)
GRIP_COL = (0.30, 0.19, 0.075)

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.fps = FPS
sc.frame_start, sc.frame_end = 1, F_END

# ---------------------------------------------------------------- model
bpy.ops.wm.stl_import(filepath=STL)
body = bpy.context.selected_objects[0]
body.name = "SloperKing"
me = body.data
co = np.empty(len(me.vertices) * 3)
me.vertices.foreach_get("co", co)
co = co.reshape(-1, 3) * 0.001                       # mm -> m
co -= (co.min(0) + co.max(0)) / 2                    # centre on bbox
# profile lives in STL XY, extruded along STL Z.  Map to world:
# width along X, profile in YZ, slot leg on top, label face towards +Y.
co = np.stack([co[:, 2], co[:, 0], co[:, 1]], 1)
a = math.radians(TILT)  # level the top surface like it hangs in the photo
co = co @ np.array([[1, 0, 0], [0, math.cos(a), math.sin(a)], [0, -math.sin(a), math.cos(a)]])
co -= (co.min(0) + co.max(0)) / 2
me.vertices.foreach_set("co", co.ravel())
me.update()
for p in me.polygons:
    p.use_smooth = True
bpy.context.view_layer.objects.active = body
try:
    bpy.ops.object.shade_auto_smooth(angle=math.radians(35))
except Exception:
    pass
co = np.array([v.co[:] for v in me.vertices])
BMIN, BMAX = co.min(0), co.max(0)
print("BBOX", BMIN, BMAX)

tris = np.array([p.vertices[:] for p in me.polygons])  # STL -> all triangles


def section(plane_co, plane_no, offset=0.0):
    """Intersect mesh with plane -> list of polylines (Nx3 arrays)."""
    n = np.array(plane_no, float); n /= np.linalg.norm(n)
    d = (co - np.array(plane_co)) @ n + 1e-7
    segs = {}
    adj = {}
    dt = d[tris]
    crossing = tris[(dt.max(1) > 0) & (dt.min(1) < 0)]
    for t in crossing:
        ds = d[t]
        pts = []
        for a, b in ((0, 1), (1, 2), (2, 0)):
            if (ds[a] > 0) != (ds[b] > 0):
                ia, ib = t[a], t[b]
                key = (min(ia, ib), max(ia, ib))
                if key not in segs:
                    s = ds[a] / (ds[a] - ds[b])
                    segs[key] = co[ia] + s * (co[ib] - co[ia])
                pts.append(key)
        if len(pts) == 2:
            adj.setdefault(pts[0], []).append(pts[1])
            adj.setdefault(pts[1], []).append(pts[0])
    lines, seen = [], set()
    for start in adj:
        if start in seen:
            continue
        chain, cur, prev = [start], start, None
        seen.add(start)
        while True:
            nxt = [k for k in adj[cur] if k != prev and k not in seen]
            if not nxt:
                if chain[0] in adj[cur] and len(chain) > 2:
                    chain.append(chain[0])  # close loop
                break
            prev, cur = cur, nxt[0]
            seen.add(cur)
            chain.append(cur)
        if len(chain) > 4:
            lines.append(np.array([segs[k] for k in chain]))
    return lines


# ---------------------------------------------------------------- materials
def node_mat(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    return m, nt


sweep = bpy.data.objects.new("SweepController", None)
sc.collection.objects.link(sweep)
sweep.empty_display_size = 0.05
SW0, SW1 = BMIN[0] - 0.012, BMAX[0] + 0.03


def sweep_mask(nt, soft=0.004, noise=0.006):
    """Returns (real, band) sockets. real=1 behind the scan line."""
    tc = nt.nodes.new("ShaderNodeTexCoord"); tc.object = sweep
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Object"], sep.inputs[0])
    nz = nt.nodes.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 60
    gp = nt.nodes.new("ShaderNodeNewGeometry")
    nt.links.new(gp.outputs["Position"], nz.inputs["Vector"])
    nzm = nt.nodes.new("ShaderNodeMath"); nzm.operation = "MULTIPLY_ADD"
    nt.links.new(nz.outputs["Fac"], nzm.inputs[0])
    nzm.inputs[1].default_value = noise
    nzm.inputs[2].default_value = -noise / 2
    x = nt.nodes.new("ShaderNodeMath"); x.operation = "ADD"
    nt.links.new(sep.outputs["X"], x.inputs[0]); nt.links.new(nzm.outputs[0], x.inputs[1])
    real = nt.nodes.new("ShaderNodeMapRange"); real.interpolation_type = "SMOOTHSTEP"
    real.inputs["From Min"].default_value = soft
    real.inputs["From Max"].default_value = -soft
    nt.links.new(x.outputs[0], real.inputs["Value"])
    ab = nt.nodes.new("ShaderNodeMath"); ab.operation = "ABSOLUTE"
    nt.links.new(x.outputs[0], ab.inputs[0])
    band = nt.nodes.new("ShaderNodeMapRange"); band.interpolation_type = "SMOOTHSTEP"
    band.inputs["From Min"].default_value = soft * 1.2
    band.inputs["From Max"].default_value = 0.0
    nt.links.new(ab.outputs[0], band.inputs["Value"])
    return real.outputs[0], band.outputs[0]


def emission(nt, col, strength=1.0):
    e = nt.nodes.new("ShaderNodeEmission")
    e.inputs["Color"].default_value = (*col, 1)
    e.inputs["Strength"].default_value = strength
    return e.outputs[0]


def mix(nt, fac, a, b):
    m = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(fac, m.inputs[0]); nt.links.new(a, m.inputs[1]); nt.links.new(b, m.inputs[2])
    return m.outputs[0]


def add(nt, a, b):
    m = nt.nodes.new("ShaderNodeAddShader")
    nt.links.new(a, m.inputs[0]); nt.links.new(b, m.inputs[1])
    return m.outputs[0]


def output(nt, sock):
    o = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(sock, o.inputs["Surface"])


# line material: visible until the scan passes
line_mat, nt = node_mat("Line")
real, band = sweep_mask(nt)
tr = nt.nodes.new("ShaderNodeBsdfTransparent").outputs[0]
output(nt, mix(nt, real, emission(nt, LINE_COL), tr))

line_soft, nt = node_mat("LineSoft")   # raster: lighter
real, band = sweep_mask(nt)
tr = nt.nodes.new("ShaderNodeBsdfTransparent").outputs[0]
output(nt, mix(nt, real, emission(nt, (0.32, 0.4, 0.5)), tr))

# body: white paper -> black PLA with engraved label
body_mat, nt = node_mat("Body")
real, band = sweep_mask(nt)
bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
bsdf.inputs["Roughness"].default_value = 0.36
bsdf.inputs["Specular IOR Level"].default_value = 0.35
# label projection (planar, from an empty placed on the label face)
proj = bpy.data.objects.new("LabelProjector", None)
sc.collection.objects.link(proj)
proj.empty_display_type = "PLAIN_AXES"
tc = nt.nodes.new("ShaderNodeTexCoord"); tc.object = proj
mp = nt.nodes.new("ShaderNodeMapping")
mp.inputs["Location"].default_value = (0.5, 0.5, 0)
mp.inputs["Rotation"].default_value = (0, 0, math.pi)
nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
img = nt.nodes.new("ShaderNodeTexImage")
img.image = bpy.data.images.load(LABEL)
img.extension = "CLIP"
nt.links.new(mp.outputs[0], img.inputs["Vector"])
# only on faces looking along the projector (no bleed onto the back)
gm = nt.nodes.new("ShaderNodeNewGeometry")
dot = nt.nodes.new("ShaderNodeVectorMath"); dot.operation = "DOT_PRODUCT"
nt.links.new(gm.outputs["Normal"], dot.inputs[0])
facing_vec = dot.inputs[1]
gate = nt.nodes.new("ShaderNodeMapRange")
gate.inputs["From Min"].default_value = 0.55; gate.inputs["From Max"].default_value = 0.8
nt.links.new(dot.outputs["Value"], gate.inputs["Value"])
lum = nt.nodes.new("ShaderNodeMath"); lum.operation = "MULTIPLY"
nt.links.new(img.outputs["Color"], lum.inputs[0]); nt.links.new(gate.outputs[0], lum.inputs[1])
col = nt.nodes.new("ShaderNodeMix"); col.data_type = "RGBA"
nt.links.new(lum.outputs[0], col.inputs["Factor"])
col.inputs[6].default_value = (*PLA_COL, 1)
col.inputs[7].default_value = (0.32, 0.32, 0.33, 1)   # lasered PLA turns matte grey
nt.links.new(col.outputs[2], bsdf.inputs["Base Color"])
rough = nt.nodes.new("ShaderNodeMapRange")
rough.inputs["To Min"].default_value = 0.36; rough.inputs["To Max"].default_value = 0.85
nt.links.new(lum.outputs[0], rough.inputs["Value"]); nt.links.new(rough.outputs[0], bsdf.inputs["Roughness"])
paper = emission(nt, (1, 1, 1))
surf = mix(nt, real, paper, bsdf.outputs[0])
# scan glow
e = nt.nodes.new("ShaderNodeEmission"); e.inputs["Color"].default_value = (*SCAN_COL, 1)
str_ = nt.nodes.new("ShaderNodeMath"); str_.operation = "MULTIPLY"; str_.inputs[1].default_value = 12
nt.links.new(band, str_.inputs[0]); nt.links.new(str_.outputs[0], e.inputs["Strength"])
output(nt, add(nt, surf, e.outputs[0]))
me.materials.append(body_mat)

# grip paper (sandpaper): invisible during drawing, appears with the scan
grip_mat, nt = node_mat("GripPaper")
real, band = sweep_mask(nt)
g = nt.nodes.new("ShaderNodeBsdfPrincipled")
g.inputs["Roughness"].default_value = 1.0
g.inputs["Specular IOR Level"].default_value = 0.08
nz = nt.nodes.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 2500; nz.inputs["Detail"].default_value = 2
cr = nt.nodes.new("ShaderNodeValToRGB")
cr.color_ramp.elements[0].color = (GRIP_COL[0] * 0.55, GRIP_COL[1] * 0.55, GRIP_COL[2] * 0.55, 1)
cr.color_ramp.elements[1].color = (GRIP_COL[0] * 1.15, GRIP_COL[1] * 1.12, GRIP_COL[2] * 1.1, 1)
nt.links.new(nz.outputs["Fac"], cr.inputs[0]); nt.links.new(cr.outputs[0], g.inputs["Base Color"])
bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = 0.35; bp.inputs["Distance"].default_value = 0.0003
nt.links.new(nz.outputs["Fac"], bp.inputs["Height"]); nt.links.new(bp.outputs[0], g.inputs["Normal"])
tr = nt.nodes.new("ShaderNodeBsdfTransparent").outputs[0]
output(nt, mix(nt, real, tr, g.outputs[0]))

# rope: orange/white braid
rope_mat, nt = node_mat("Rope")
real, band = sweep_mask(nt)
r = nt.nodes.new("ShaderNodeBsdfPrincipled"); r.inputs["Roughness"].default_value = 0.75
r.inputs["Sheen Weight"].default_value = 0.4
tc = nt.nodes.new("ShaderNodeTexCoord")
wv = nt.nodes.new("ShaderNodeTexWave"); wv.wave_type = "BANDS"; wv.bands_direction = "DIAGONAL"
wv.inputs["Scale"].default_value = 1.0
mpr = nt.nodes.new("ShaderNodeMapping"); mpr.inputs["Scale"].default_value = (260, 2, 1)
nt.links.new(tc.outputs["UV"], mpr.inputs["Vector"]); nt.links.new(mpr.outputs[0], wv.inputs["Vector"])
crr = nt.nodes.new("ShaderNodeValToRGB")
crr.color_ramp.interpolation = "CONSTANT"
crr.color_ramp.elements[0].color = (0.9, 0.85, 0.75, 1)
crr.color_ramp.elements[1].position = 0.45
crr.color_ramp.elements[1].color = (0.85, 0.22, 0.01, 1)
nt.links.new(wv.outputs["Fac"], crr.inputs[0]); nt.links.new(crr.outputs[0], r.inputs["Base Color"])
bpr = nt.nodes.new("ShaderNodeBump"); bpr.inputs["Strength"].default_value = 0.6
nt.links.new(wv.outputs["Fac"], bpr.inputs["Height"]); nt.links.new(bpr.outputs[0], r.inputs["Normal"])
tr = nt.nodes.new("ShaderNodeBsdfTransparent").outputs[0]
output(nt, mix(nt, real, tr, r.outputs[0]))

# silhouette (inverted hull)
hull_mat, nt = node_mat("Silhouette")
real, band = sweep_mask(nt)
tr = nt.nodes.new("ShaderNodeBsdfTransparent").outputs[0]
fade = nt.nodes.new("ShaderNodeValue"); fade.name = "fade"; fade.outputs[0].default_value = 0
inv = nt.nodes.new("ShaderNodeMath"); inv.operation = "MULTIPLY"
one_minus = nt.nodes.new("ShaderNodeMath"); one_minus.operation = "SUBTRACT"; one_minus.inputs[0].default_value = 1
nt.links.new(real, one_minus.inputs[1])
nt.links.new(one_minus.outputs[0], inv.inputs[0]); nt.links.new(fade.outputs[0], inv.inputs[1])
output(nt, mix(nt, inv.outputs[0], tr, emission(nt, LINE_COL)))
hull_mat.use_backface_culling = True
me.materials.append(hull_mat)
sil = body.modifiers.new("silhouette", "SOLIDIFY")
sil.thickness = 0.0005
sil.offset = 1
sil.use_flip_normals = True
sil.use_rim = False
sil.material_offset = 1
fade.outputs[0].keyframe_insert("default_value", frame=40)
fade.outputs[0].default_value = 1
fade.outputs[0].keyframe_insert("default_value", frame=80)

# ---------------------------------------------------------------- drawn lines
line_coll = bpy.data.collections.new("Lines")
sc.collection.children.link(line_coll)


def make_curve(name, polylines, radius, mat, f0, f1, coll=line_coll):
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = radius
    cu.bevel_resolution = 2
    cu.use_fill_caps = True
    cu.bevel_factor_mapping_end = "SPLINE"
    for pl in polylines:
        sp = cu.splines.new("POLY")
        sp.points.add(len(pl) - 1)
        for i, p in enumerate(pl):
            sp.points[i].co = (*p, 1)
    cu.materials.append(mat)
    ob = bpy.data.objects.new(name, cu)
    coll.objects.link(ob)
    cu.bevel_factor_end = 0
    cu.keyframe_insert("bevel_factor_end", frame=f0)
    cu.bevel_factor_end = 1
    cu.keyframe_insert("bevel_factor_end", frame=f1)
    ob.hide_render = True
    ob.keyframe_insert("hide_render", frame=f0 - 1)
    ob.hide_render = False
    ob.keyframe_insert("hide_render", frame=f0)
    return ob


W = BMAX[0]
# 1) profile outlines at both ends, outer then inner (rope channel)
f = 20
for xs in (-(W - 0.0012), (W - 0.0012)):
    loops = sorted(section((xs, 0, 0), (1, 0, 0)), key=lambda l: -len(l))
    for i, l in enumerate(loops):
        make_curve(f"profile_{xs:+.3f}_{i}", [l], 0.00028, line_mat, f, f + 32)
        f += 10
    f += 6
# 2) long edges: planes along the width (Y and Z constant) -> raster lines along X
f = 92
steps_y = np.arange(BMIN[1] + 0.006, BMAX[1] - 0.003, 0.0075)
steps_z = np.arange(BMIN[2] + 0.006, BMAX[2] - 0.003, 0.0075)
for y in steps_y:
    pl = section((0, y, 0), (0, 1, 0))
    if pl:
        make_curve(f"rasterY_{y:+.3f}", pl, 0.00013, line_soft, f, f + 12)
        f += 3
f2 = 100
for z in steps_z:
    pl = section((0, 0, z), (0, 0, 1))
    if pl:
        make_curve(f"rasterZ_{z:+.3f}", pl, 0.00013, line_soft, f2, f2 + 12)
        f2 += 3
# 3) cross sections across the width
f3 = max(f, f2)
for x in np.linspace(-W + 0.009, W - 0.009, 9):
    pl = section((x, 0, 0), (1, 0, 0))
    make_curve(f"rasterX_{x:+.3f}", pl, 0.00013, line_soft, f3, f3 + 14)
    f3 += 4
print("raster done at frame", f3)

# ---------------------------------------------------------------- rope channel / rope
mid = section((0, 0, 0), (1, 0, 0))
mid = sorted(mid, key=lambda l: -len(l))
outer = mid[0]
holes = mid[1:]


def seg_dist(P, loop):
    """min distance from points P (Nx2) to closed polyline loop (Mx2)."""
    A, Bp = loop[:-1], loop[1:]
    AB = Bp - A
    t = np.clip(((P[:, None, :] - A[None]) * AB[None]).sum(-1) / ((AB ** 2).sum(-1) + 1e-12), 0, 1)
    proj = A[None] + t[..., None] * AB[None]
    return np.sqrt(((P[:, None, :] - proj) ** 2).sum(-1)).min(1)


def inside(P, loop):
    y, z = loop[:, 0], loop[:, 1]
    res = np.zeros(len(P), bool)
    for i in range(len(loop) - 1):
        y1, z1, y2, z2 = y[i], z[i], y[i + 1], z[i + 1]
        c = ((z1 > P[:, 1]) != (z2 > P[:, 1])) & (P[:, 0] < (y2 - y1) * (P[:, 1] - z1) / (z2 - z1 + 1e-12) + y1)
        res ^= c
    return res


# rope sits snug in one of the notches ('half holes') of the slot, pulled into it
sys.path.insert(0, HERE)
from find_notches import find_notches
notches = sorted(find_notches([h[:, 1:3] for h in mid], skip_largest=False), key=lambda n: n[0][0])
print("NOTCHES", [tuple(np.round(n[0] * 1000, 1)) for n in notches])
R_ROPE = 0.0019
nc, nr, nopen = notches[min(ROPE_NOTCH, len(notches) - 1)]
hy, hz = nc - nopen * (nr - R_ROPE)
r_in = nr
print("HOLES", len(holes), "inscribed r", r_in)
ztop = outer[np.abs(outer[:, 1] - hy) < 0.006][:, 2].max()
print("CHANNEL", hy, hz, "ztop", ztop)
R = R_ROPE
RB = 0.004            # bend radius where the rope leaves the slot
TOP = np.array([0.012, hy - 0.004, 0.40])   # strands converge towards the holder


def strand(side):
    """slot exit -> bend -> straight up to the holder, for side = -1 / +1."""
    top = TOP * np.array([side, 1, 1])
    cx, cz = side * W, hz + RB                      # bend centre
    end = np.array([side * (W + RB), hy, cz])
    tilt = math.atan2(abs(top[0] - end[0]), top[2] - end[2])
    pts = [np.array([side * (W - 0.002), hy, hz])]
    for th in np.linspace(0, math.pi / 2 - tilt, 14):
        pts.append(np.array([cx + side * RB * math.sin(th), hy, cz - RB * math.cos(th)]))
    for t in np.linspace(0, 1, 30)[1:]:
        pts.append(pts[14] + t * (top - pts[14]))
    return np.array(pts)


left, right = strand(-1), strand(1)
inside_ = np.array([[x, hy, hz] for x in np.linspace(-(W - 0.002), W - 0.002, 40)])[1:-1]
rope_path = np.concatenate([left[::-1], inside_, right])
make_curve("rope_line", [rope_path], 0.00025, line_mat, 150, 205)


def tube_mesh(name, path, radius, seg=16):
    """Tube along path with UVs: U along length (metres), V around."""
    t = np.gradient(path, axis=0)
    t /= np.linalg.norm(t, axis=1)[:, None]
    n = np.cross(t[0], [0, 1, 0] if abs(t[0][1]) < 0.9 else [1, 0, 0]); n /= np.linalg.norm(n)
    verts, frames = [], []
    for i in range(len(path)):  # parallel transport frame
        if i:
            n = n - t[i] * n.dot(t[i]); n /= np.linalg.norm(n)
        b = np.cross(t[i], n)
        frames.append((n, b))
        for k in range(seg):
            a = 2 * math.pi * k / seg
            verts.append(path[i] + radius * (math.cos(a) * n + math.sin(a) * b))
    faces = []
    for i in range(len(path) - 1):
        for k in range(seg):
            k2 = (k + 1) % seg
            faces.append((i * seg + k, i * seg + k2, (i + 1) * seg + k2, (i + 1) * seg + k))
    m = bpy.data.meshes.new(name)
    m.from_pydata([tuple(v) for v in verts], [], faces)
    L = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(path, axis=0), axis=1))])
    uv = m.uv_layers.new(name="UVMap")
    for p in m.polygons:
        p.use_smooth = True
        for li in p.loop_indices:
            vi = m.loops[li].vertex_index
            i, k = divmod(vi, seg)
            # seam fix: last column wraps to 1.0
            kk = k if not (k == 0 and any(m.loops[l].vertex_index % seg == seg - 1 for l in p.loop_indices)) else seg
            uv.data[li].uv = (L[i], kk / seg)
    o = bpy.data.objects.new(name, m)
    sc.collection.objects.link(o)
    return o


rope = tube_mesh("Rope", rope_path, R)
rope.data.materials.append(rope_mat)

# ---------------------------------------------------------------- dimension line "90 mm"
dz = BMAX[2] + 0.012
dim = [np.array([[-W, BMIN[1] + 0.01, dz], [W, BMIN[1] + 0.01, dz]]),
       np.array([[-W, BMIN[1] + 0.01, dz - 0.004], [-W, BMIN[1] + 0.01, dz + 0.004]]),
       np.array([[W, BMIN[1] + 0.01, dz - 0.004], [W, BMIN[1] + 0.01, dz + 0.004]])]
make_curve("dim_90", dim, 0.00018, line_mat, 120, 150)
bpy.ops.object.text_add(location=(0, BMIN[1] + 0.01, dz + 0.0035))
txt = bpy.context.object
txt.name = "dim_text"
txt.data.body = "90 mm"
txt.data.size = 0.0075
txt.data.align_x = "CENTER"
txt.rotation_euler = (math.radians(90), 0, math.radians(180))
txt.data.materials.append(line_mat)
txt.hide_render = True
txt.keyframe_insert("hide_render", frame=139)
txt.hide_render = False
txt.keyframe_insert("hide_render", frame=140)
for o in list(txt.users_collection):
    o.objects.unlink(txt)
line_coll.objects.link(txt)

# ---------------------------------------------------------------- grip paper + label placement
cvec = Vector((0, BMIN[1], BMIN[2]))    # point inside the concave side of the bend
z_thr = BMIN[2] + GRIP_LINE * (BMAX[2] - BMIN[2])
label_pts, label_nrm = [], Vector()
hole_loops = [h[:, 1:3] for h in holes]
gbm = bmesh.new(); gbm.from_mesh(me)
gbm.faces.ensure_lookup_table()
drop = []
for fa in gbm.faces:
    c = fa.calc_center_median(); n = fa.normal
    on_hole = any(seg_dist(np.array([[c.y, c.z]]), h)[0] < 0.0012 for h in hole_loops)
    outer_ = n.dot(c - cvec) > 0 and abs(n.x) < 0.35 and c.y > BMIN[1] + 0.006 and not on_hole
    if not outer_:
        drop.append(fa)
    elif abs(c.x) < W - 0.0035 and BMIN[2] + 0.004 < c.z < z_thr - 0.002:
        label_pts.append(c.copy()); label_nrm += n * fa.calc_area()
bmesh.ops.delete(gbm, geom=drop, context="FACES")
# clean straight cuts: grip edge parallel to the text, margins at both ends
for co_, no_ in (((0, 0, z_thr), (0, 0, -1)), ((W - 0.0035, 0, 0), (1, 0, 0)), ((-(W - 0.0035), 0, 0), (-1, 0, 0))):
    geom = gbm.verts[:] + gbm.edges[:] + gbm.faces[:]
    bmesh.ops.bisect_plane(gbm, geom=geom, plane_co=co_, plane_no=no_, clear_outer=True)
gbm.normal_update()
for v in gbm.verts:
    v.co += v.normal * 0.00005
gme = bpy.data.meshes.new("GripPaper")
gbm.to_mesh(gme)
gme.materials.clear()
for p in gme.polygons:
    p.use_smooth = True
    p.material_index = 0
grip = bpy.data.objects.new("GripPaper", gme)
sc.collection.objects.link(grip)
gs = grip.modifiers.new("thick", "SOLIDIFY"); gs.thickness = 0.0006; gs.offset = 1
gme.materials.append(grip_mat)
gbm.free()

if label_pts:
    lc = sum(label_pts, Vector()) / len(label_pts)
    ln = label_nrm.normalized()
    # keep text upright: projector X along world X
    zx = ln; xx = Vector((1, 0, 0)); yy = zx.cross(xx).normalized(); xx = yy.cross(zx).normalized()
    proj.matrix_world = Matrix((
        (xx.x, yy.x, zx.x, lc.x),
        (xx.y, yy.y, zx.y, lc.y),
        (xx.z, yy.z, zx.z, lc.z),
        (0, 0, 0, 1)))
    LW = LABEL_W
    proj.location = lc + yy * LABEL_DZ
    proj.scale = (LW, LW * 920 / 2400, 0.05)
    facing_vec.default_value = ln[:]
    print("LABEL", lc, ln)

# ---------------------------------------------------------------- sweep animation
sweep.location.x = SW0
sweep.keyframe_insert("location", index=0, frame=T_SWEEP0)
sweep.location.x = SW1
sweep.keyframe_insert("location", index=0, frame=T_SWEEP1)

# ---------------------------------------------------------------- world, lights
world = bpy.data.worlds.new("White")
sc.world = world
world.use_nodes = True
wn = world.node_tree; wn.nodes.clear()
lp = wn.nodes.new("ShaderNodeLightPath")
b_cam = wn.nodes.new("ShaderNodeBackground"); b_cam.inputs["Color"].default_value = (1, 1, 1, 1)
b_env = wn.nodes.new("ShaderNodeBackground"); b_env.inputs["Color"].default_value = (1, 1, 1, 1)
b_env.inputs["Strength"].default_value = 0.07
wm = wn.nodes.new("ShaderNodeMixShader")
wn.links.new(lp.outputs["Is Camera Ray"], wm.inputs[0])
wn.links.new(b_env.outputs[0], wm.inputs[1]); wn.links.new(b_cam.outputs[0], wm.inputs[2])
wo = wn.nodes.new("ShaderNodeOutputWorld"); wn.links.new(wm.outputs[0], wo.inputs["Surface"])


def area(name, loc, power, size, color=(1, 1, 1)):
    l = bpy.data.lights.new(name, "AREA"); l.energy = power; l.size = size; l.color = color
    o = bpy.data.objects.new(name, l); sc.collection.objects.link(o)
    o.location = loc
    o.rotation_euler = (-Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    return o


area("Key", (-0.45, 0.4, 0.4), 14, 0.5)
area("Fill", (0.5, 0.35, 0.05), 4, 0.7)
area("Rim", (0.25, -0.45, 0.35), 18, 0.25)
area("Top", (0.0, 0.05, 0.6), 6, 0.6)

# ---------------------------------------------------------------- cameras on an orbit rig
rig = bpy.data.objects.new("CamRig", None); sc.collection.objects.link(rig)
rig.location = (0, 0, 0.004)
target = bpy.data.objects.new("CamTarget", None); sc.collection.objects.link(target)
target.location = (0, 0, 0.004)


def camera(name, lens, dist):
    cd = bpy.data.cameras.new(name); cd.lens = lens; cd.clip_start = 0.01
    cd.dof.use_dof = False
    c = bpy.data.objects.new(name, cd); sc.collection.objects.link(c)
    c.parent = rig
    c.location = (0, dist, 0)
    t = c.constraints.new("TRACK_TO"); t.target = target; t.track_axis = "TRACK_NEGATIVE_Z"; t.up_axis = "UP_Y"
    return c


cam_wide = camera("Cam_16x9", 70, 0.50)
cam_tall = camera("Cam_9x16", 70, 0.52)
# orbit: azimuth (rig Z) and elevation (rig X)
for fr, az, el in ((1, -52, 26), (220, -38, 18), (330, -30, 14), (450, -18, 10)):
    rig.rotation_euler = (math.radians(el), 0, math.radians(az))
    rig.keyframe_insert("rotation_euler", frame=fr)
for fc in (rig.animation_data.action.fcurves if hasattr(rig.animation_data.action, "fcurves") else []):
    for k in fc.keyframe_points:
        k.interpolation = "BEZIER"
sc.camera = cam_wide

# ---------------------------------------------------------------- render settings
for eng in ("BLENDER_EEVEE", "BLENDER_EEVEE_NEXT"):
    try:
        sc.render.engine = eng
        break
    except TypeError:
        pass
sc.eevee.taa_render_samples = 64
sc.render.filter_size = 1.0
sc.view_settings.view_transform = "Standard"
sc.view_settings.look = "None"
sc.render.resolution_x, sc.render.resolution_y = 1920, 1080
sc.render.resolution_percentage = 100
sc.render.film_transparent = False

bpy.ops.wm.save_as_mainfile(filepath=BLEND)
print("SAVED", BLEND)
