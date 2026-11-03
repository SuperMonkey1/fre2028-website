"""Arms sequence on top of the product video (timeline frames 450-1200).

  blender -b sloperking_v1.blend -P scripts/add_arm.py        -> sloperking_arms_v1.blend (posed arm)
  blender -b sloperking_arms_v1.blend -P scripts/arm_scene.py -> sloperking_arms_v1.blend (animated)

Rendered with frame_step 2 like the product video (render_video.py ... 2).
Timeline (scene frames):
  450-560   camera swings to the side, bones drawn as line art
  560-640   bones become real (scan from the hand down to the elbow)
  640-730   other forearm muscles appear
  730-1010  1 FDP, 2 FDS, 3 FCR, 4 FCU light up one by one (others ghosted)
  1010-1110 translucent skin, the four keep glowing through
  1110-1200 end title

Ad mode (`-- ad`, used by the advert): faster, finger flexors and wrist flexors
light up as two groups (2 + 2), then a "fight the pump" pulse and a close-up
camera (Cam_close) on the open hand for the "pulley safe" shot:
  450-620 bones + muscles, 620 FDP+FDS, 770 FCR+FCU, 920-980 skin,
  980-1100 pump, 1100-1250 close-up.
"""
import bpy, bmesh, math, os, sys
import numpy as np
from mathutils import Vector, Matrix

sc = bpy.context.scene
F_END = 1200

BONE_COL = (0.83, 0.78, 0.66)
MUSCLE_COL = (0.42, 0.07, 0.06)
SKIN_COL = (0.82, 0.58, 0.47)
GLOW_COL = (0.913, 0.342, 0.0033)   # website amber-500 (#F59E0B)
LINE_COL = (0.03, 0.05, 0.09)

AD = "--" in sys.argv and "ad" in sys.argv[sys.argv.index("--") + 1:]
if AD:
    T_BONE_LINES = 455
    T_BONE_SWEEP = (515, 570)
    T_MUSCLE_SWEEP = (560, 620)
    T_KEYS = 620
    KEY_LEN = 150        # 2.5 s per group in the advert
    GROUPS = [[0, 1], [2, 3]]       # 2 finger flexors, + 2 wrist flexors
    T_SKIN = (920, 980)
    T_PUMP = (980, 1100)
    T_TITLE = None
    F_END = 1250
else:
    T_BONE_LINES = 470
    T_BONE_SWEEP = (560, 640)
    T_MUSCLE_SWEEP = (640, 730)
    T_KEYS = 730
    KEY_LEN = 70
    GROUPS = [[0], [1], [2], [3]]
    T_SKIN = (1010, 1090)
    T_PUMP = None
    T_TITLE = 1115
sc.frame_end = F_END
T_ALL = T_KEYS + len(GROUPS) * KEY_LEN
KEYS = [  # order of appearance, website numbering
    ("FDP", ["FDP"], "flexor digitorum profundus", "finger flexor"),
    ("FDS", ["FDS_humeroulnar", "FDS_radial"], "flexor digitorum superficialis", "finger flexor"),
    ("FCR", ["FCR"], "flexor carpi radialis", "wrist flexor, thumb side"),
    ("FCU", ["FCU_humeral", "FCU_ulnar"], "flexor carpi ulnaris", "wrist flexor, pinky side"),
]
FONT_B = r"C:\Windows\Fonts\seguibl.ttf"
FONT_R = r"C:\Windows\Fonts\segoeui.ttf"

bones = list(bpy.data.collections["ArmBones"].objects)
muscles = list(bpy.data.collections["ArmMuscles"].objects)
keyobs = {o.name[4:]: o for o in bpy.data.collections["ArmKeyMuscles"].objects}
arm_all = bones + muscles + list(keyobs.values())

allco = np.concatenate([np.array([v.co[:] for v in o.data.vertices]) for o in arm_all if o.name != "arm_humerus"])
Z_TOP, Z_BOT = allco[:, 2].max(), allco[:, 2].min()
print("ARM Z", Z_TOP, Z_BOT)


def key(obj, path, frame, value, index=-1):
    if index >= 0:
        getattr(obj, path)[index] = value
        obj.keyframe_insert(path, index=index, frame=frame)
    else:
        setattr(obj, path, value)
        obj.keyframe_insert(path, frame=frame)


# ---------------------------------------------------------------- sweeps (vertical)
def make_sweep(name, z0, z1, f0, f1):
    e = bpy.data.objects.new(name, None)
    sc.collection.objects.link(e)
    e.rotation_euler = (0, math.radians(90), 0)   # local X -> world -Z
    e.location = (0, 0, z0)
    e.keyframe_insert("location", index=2, frame=f0)
    e.location.z = z1
    e.keyframe_insert("location", index=2, frame=f1)
    return e


sw_bone = make_sweep("SweepBones", Z_TOP + 0.01, float(np.concatenate([np.array([v.co[:] for v in o.data.vertices]) for o in bones])[:, 2].min()) - 0.01, *T_BONE_SWEEP)
sw_musc = make_sweep("SweepMuscles", Z_TOP + 0.01, Z_BOT - 0.01, *T_MUSCLE_SWEEP)
sw_skin = make_sweep("SweepSkin", Z_TOP + 0.01, Z_BOT - 0.01, *T_SKIN)


def node_mat(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    for attr in ("use_transparent_shadow",):
        if hasattr(m, attr):
            setattr(m, attr, True)
    return m, nt


def sweep_real(nt, sweep, soft=0.006):
    tc = nt.nodes.new("ShaderNodeTexCoord"); tc.object = sweep
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Object"], sep.inputs[0])
    real = nt.nodes.new("ShaderNodeMapRange"); real.interpolation_type = "SMOOTHSTEP"
    real.inputs["From Min"].default_value = soft
    real.inputs["From Max"].default_value = -soft
    nt.links.new(sep.outputs["X"], real.inputs["Value"])
    ab = nt.nodes.new("ShaderNodeMath"); ab.operation = "ABSOLUTE"
    nt.links.new(sep.outputs["X"], ab.inputs[0])
    band = nt.nodes.new("ShaderNodeMapRange"); band.interpolation_type = "SMOOTHSTEP"
    band.inputs["From Min"].default_value = soft * 1.3
    band.inputs["From Max"].default_value = 0.0
    nt.links.new(ab.outputs[0], band.inputs["Value"])
    return real.outputs[0], band.outputs[0]


def mul(nt, a, b):
    m = nt.nodes.new("ShaderNodeMath"); m.operation = "MULTIPLY"
    for i, x in enumerate((a, b)):
        if isinstance(x, (int, float)):
            m.inputs[i].default_value = x
        else:
            nt.links.new(x, m.inputs[i])
    return m.outputs[0]


def value(nt, name, v):
    n = nt.nodes.new("ShaderNodeValue"); n.name = name; n.label = name
    n.outputs[0].default_value = v
    return n


def finish(nt, surface, opacity, band=None, band_strength=10):
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    mx = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(opacity, mx.inputs[0]); nt.links.new(tr.outputs[0], mx.inputs[1]); nt.links.new(surface, mx.inputs[2])
    out = mx.outputs[0]
    if band is not None:
        e = nt.nodes.new("ShaderNodeEmission"); e.inputs["Color"].default_value = (*GLOW_COL, 1)
        nt.links.new(mul(nt, band, band_strength), e.inputs["Strength"])
        ad = nt.nodes.new("ShaderNodeAddShader")
        nt.links.new(out, ad.inputs[0]); nt.links.new(e.outputs[0], ad.inputs[1])
        out = ad.outputs[0]
    o = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(out, o.inputs["Surface"])


# bones
bone_mat, nt = node_mat("ArmBone")
real, band = sweep_real(nt, sw_bone)
b = nt.nodes.new("ShaderNodeBsdfPrincipled")
b.inputs["Base Color"].default_value = (*BONE_COL, 1)
b.inputs["Roughness"].default_value = 0.55
b.inputs["Subsurface Weight"].default_value = 0.15
b.inputs["Subsurface Radius"].default_value = (0.004, 0.003, 0.002)
paper = nt.nodes.new("ShaderNodeEmission"); paper.inputs["Color"].default_value = (1, 1, 1, 1)
bm_ = nt.nodes.new("ShaderNodeMixShader")
nt.links.new(real, bm_.inputs[0]); nt.links.new(paper.outputs[0], bm_.inputs[1]); nt.links.new(b.outputs[0], bm_.inputs[2])
op = value(nt, "opacity", 1.0)
finish(nt, bm_.outputs[0], op.outputs[0], band)
for o in bones:
    o.data.materials.append(bone_mat)


def muscle_mat(name, glow=False):
    m, nt = node_mat(name)
    real, band = sweep_real(nt, sw_musc)
    p = nt.nodes.new("ShaderNodeBsdfPrincipled")
    p.inputs["Base Color"].default_value = (*MUSCLE_COL, 1)
    p.inputs["Roughness"].default_value = 0.42
    p.inputs["Subsurface Weight"].default_value = 0.25
    p.inputs["Subsurface Radius"].default_value = (0.006, 0.002, 0.001)
    p.inputs["Emission Color"].default_value = (*GLOW_COL, 1)
    g = value(nt, "glow", 0.0)
    nt.links.new(mul(nt, g.outputs[0], 0.9), p.inputs["Emission Strength"])
    # glowing muscle also tints its base colour amber
    mixc = nt.nodes.new("ShaderNodeMix"); mixc.data_type = "RGBA"
    nt.links.new(g.outputs[0], mixc.inputs["Factor"])
    mixc.inputs[6].default_value = (*MUSCLE_COL, 1)
    mixc.inputs[7].default_value = (0.85, 0.28, 0.02, 1)
    nt.links.new(mixc.outputs[2], p.inputs["Base Color"])
    op = value(nt, "opacity", 1.0)
    finish(nt, p.outputs[0], mul(nt, real, op.outputs[0]), band)
    return m


other_mat = muscle_mat("ArmMuscle")
for o in muscles:
    o.data.materials.append(other_mat)
key_mats = {}
for short, names, *_ in KEYS:
    km = muscle_mat("Key_" + short)
    key_mats[short] = km
    for n in names:
        keyobs[n].data.materials.append(km)


def node_key(mat, node, frame, v):
    s = mat.node_tree.nodes[node].outputs[0]
    s.default_value = v
    s.keyframe_insert("default_value", frame=frame)


# ---------------------------------------------------------------- bone line art
line_mat, nt = node_mat("ArmLine")
real, _ = sweep_real(nt, sw_bone)
e = nt.nodes.new("ShaderNodeEmission"); e.inputs["Color"].default_value = (*LINE_COL, 1)
inv = nt.nodes.new("ShaderNodeMath"); inv.operation = "SUBTRACT"; inv.inputs[0].default_value = 1
nt.links.new(real, inv.inputs[1])
finish(nt, e.outputs[0], inv.outputs[0])

line_coll = bpy.data.collections.new("ArmLines")
sc.collection.children.link(line_coll)


def section(co, tris, z):
    d = co[:, 2] - z + 1e-7
    dt = d[tris]
    crossing = tris[(dt.max(1) > 0) & (dt.min(1) < 0)]
    segs, adj = {}, {}
    for t in crossing:
        ds = d[t]
        pts = []
        for a, b_ in ((0, 1), (1, 2), (2, 0)):
            if (ds[a] > 0) != (ds[b_] > 0):
                ia, ib = t[a], t[b_]
                k = (min(ia, ib), max(ia, ib))
                if k not in segs:
                    s = ds[a] / (ds[a] - ds[b_])
                    segs[k] = co[ia] + s * (co[ib] - co[ia])
                pts.append(k)
        if len(pts) == 2:
            adj.setdefault(pts[0], []).append(pts[1]); adj.setdefault(pts[1], []).append(pts[0])
    lines, seen = [], set()
    for st in adj:
        if st in seen:
            continue
        chain, cur, prev = [st], st, None
        seen.add(st)
        while True:
            nxt = [k for k in adj[cur] if k != prev and k not in seen]
            if not nxt:
                if st in adj[cur] and len(chain) > 2:
                    chain.append(st)
                break
            prev, cur = cur, nxt[0]; seen.add(cur); chain.append(cur)
        if len(chain) > 3:
            lines.append(np.array([segs[k] for k in chain]))
    return lines


def make_curve(name, polylines, radius, f0, f1):
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"; cu.bevel_depth = radius; cu.bevel_resolution = 1
    cu.bevel_factor_mapping_end = "SPLINE"
    for pl in polylines:
        sp = cu.splines.new("POLY"); sp.points.add(len(pl) - 1)
        for i, p in enumerate(pl):
            sp.points[i].co = (*p, 1)
    cu.materials.append(line_mat)
    ob = bpy.data.objects.new(name, cu)
    line_coll.objects.link(ob)
    cu.bevel_factor_end = 0; cu.keyframe_insert("bevel_factor_end", frame=f0)
    cu.bevel_factor_end = 1; cu.keyframe_insert("bevel_factor_end", frame=f1)
    ob.hide_render = True; ob.keyframe_insert("hide_render", frame=f0 - 1)
    ob.hide_render = False; ob.keyframe_insert("hide_render", frame=f0)
    return ob


# draw order: hand first (top), down to the elbow
order = sorted(bones, key=lambda o: -max(v.co.z for v in o.data.vertices))
for i, o in enumerate(order):
    co = np.array([v.co[:] for v in o.data.vertices])
    tris = np.array([p.vertices[:] for p in o.data.polygons])
    h = np.ptp(co[:, 2])
    step = 0.0045 if h > 0.06 else 0.0025
    pls = []
    for z in np.arange(co[:, 2].min() + step / 2, co[:, 2].max(), step):
        pls += section(co, tris, z)
    if pls:
        f0 = T_BONE_LINES + int(i * 1.8)
        make_curve("bl_" + o.name, pls, 0.00011, f0, f0 + 34)

# bone silhouettes (inverted hull)
hull, nt = node_mat("ArmHull")
real, _ = sweep_real(nt, sw_bone)
fade = value(nt, "fade", 0.0)
inv = nt.nodes.new("ShaderNodeMath"); inv.operation = "SUBTRACT"; inv.inputs[0].default_value = 1
nt.links.new(real, inv.inputs[1])
e = nt.nodes.new("ShaderNodeEmission"); e.inputs["Color"].default_value = (*LINE_COL, 1)
finish(nt, e.outputs[0], mul(nt, inv.outputs[0], fade.outputs[0]))
hull.use_backface_culling = True
node_key(hull, "fade", T_BONE_LINES, 0.0)
node_key(hull, "fade", T_BONE_LINES + 30, 1.0)
for o in bones:
    o.data.materials.append(hull)
    s = o.modifiers.new("silhouette", "SOLIDIFY")
    s.thickness = 0.0004; s.offset = 1; s.use_flip_normals = True; s.use_rim = False; s.material_offset = 1

# ---------------------------------------------------------------- skin
OFFS = {"prox": 0.0045, "mid": 0.0045, "dist": 0.0042, "meta": 0.0025, "humerus": 0.001}
bm = bmesh.new()
for o in arm_all:
    n = o.name[4:]
    if n == "humerus":
        continue
    off = 0.0015
    for k, v in OFFS.items():
        if n.startswith(k):
            off = v
    tmp = bmesh.new(); tmp.from_mesh(o.data); tmp.normal_update()
    for v in tmp.verts:
        v.co += v.normal * off
    me_tmp = bpy.data.meshes.new("tmp"); tmp.to_mesh(me_tmp); tmp.free()
    bm.from_mesh(me_tmp)
    bpy.data.meshes.remove(me_tmp)
skin_src = bpy.data.meshes.new("skin_src"); bm.to_mesh(skin_src); bm.free()
skin = bpy.data.objects.new("ArmSkin", skin_src)
sc.collection.objects.link(skin)
rm = skin.modifiers.new("remesh", "REMESH"); rm.mode = "VOXEL"; rm.voxel_size = 0.0011
sm = skin.modifiers.new("smooth", "SMOOTH"); sm.factor = 0.9; sm.iterations = 12
dg = bpy.context.evaluated_depsgraph_get()
skin_me = bpy.data.meshes.new_from_object(skin.evaluated_get(dg))
skin.modifiers.clear()
skin.data = skin_me
bpy.data.meshes.remove(skin_src)
for p in skin_me.polygons:
    p.use_smooth = True
print("SKIN verts", len(skin_me.vertices))

skin_mat, nt = node_mat("ArmSkin")
real, band = sweep_real(nt, sw_skin, soft=0.008)
p = nt.nodes.new("ShaderNodeBsdfPrincipled")
p.inputs["Base Color"].default_value = (*SKIN_COL, 1)
p.inputs["Roughness"].default_value = 0.5
p.inputs["Subsurface Weight"].default_value = 0.3
# x-ray: faces looking at the camera are clear, the silhouette is denser
lw = nt.nodes.new("ShaderNodeLayerWeight"); lw.inputs["Blend"].default_value = 0.35
xr = nt.nodes.new("ShaderNodeMapRange")
xr.inputs["To Min"].default_value = 0.28; xr.inputs["To Max"].default_value = 0.95
nt.links.new(lw.outputs["Facing"], xr.inputs["Value"])
finish(nt, p.outputs[0], mul(nt, real, xr.outputs[0]), band, band_strength=6)
skin_me.materials.append(skin_mat)

# ---------------------------------------------------------------- key muscles: ghosting + glow + labels
font_b = bpy.data.fonts.load(FONT_B) if os.path.exists(FONT_B) else None
font_r = bpy.data.fonts.load(FONT_R) if os.path.exists(FONT_R) else None
label_mat, nt = node_mat("LabelInk")
e = nt.nodes.new("ShaderNodeEmission"); e.inputs["Color"].default_value = (0.02, 0.03, 0.05, 1)
op = value(nt, "opacity", 1.0)
finish(nt, e.outputs[0], op.outputs[0])
accent_mat, nt = node_mat("LabelAccent")
e = nt.nodes.new("ShaderNodeEmission"); e.inputs["Color"].default_value = (*GLOW_COL, 1)
e.inputs["Strength"].default_value = 1.2
finish(nt, e.outputs[0], value(nt, "opacity", 1.0).outputs[0])

labels = bpy.data.collections.new("ArmLabels")
sc.collection.children.link(labels)
look = bpy.data.objects.new("LabelLook", None)     # render_video.py parents this to the active camera
sc.collection.objects.link(look)
look.parent = bpy.data.objects["Cam_16x9"]
LABEL_DEPTH = 0.6
# label column in normalised screen coords (u, v), per format; render_video.py applies them
LABEL_UV = {"wide": [(-0.94, 0.62), (-0.94, 0.30), (-0.94, -0.02), (-0.94, -0.34)],
            "tall": [(-0.94, 0.42), (-0.94, 0.26), (-0.94, 0.10), (-0.94, -0.06)]}
if AD:  # advert: labels to the right of the arm (more room there), leader from the left edge
    LABEL_UV["tall"] = [(0.36, 0.40), (0.36, 0.24), (0.36, 0.08), (0.36, -0.08)]   # clear of the copy below
HALF = {"wide": (0.154, 0.087), "tall": (0.087, 0.154)}


def text(body, size, font, mat, parent, loc, align="LEFT"):
    cu = bpy.data.curves.new("t", "FONT"); cu.body = body; cu.size = size
    if font:
        cu.font = font
    cu.align_x = align; cu.align_y = "CENTER"
    cu.materials.append(mat)
    ob = bpy.data.objects.new("lbl_" + body[:12], cu)
    labels.objects.link(ob)
    ob.parent = parent
    ob.location = loc
    return ob


def show(ob, f_on, f_off=None):
    ob.hide_render = True; ob.keyframe_insert("hide_render", frame=0)
    ob.keyframe_insert("hide_render", frame=f_on - 1)
    ob.hide_render = False; ob.keyframe_insert("hide_render", frame=f_on)
    if f_off:
        ob.keyframe_insert("hide_render", frame=f_off - 1)
        ob.hide_render = True; ob.keyframe_insert("hide_render", frame=f_off)


def place(ob, fmt, uv):
    hx, hy = HALF[fmt]
    ob.location = (uv[0] * hx, uv[1] * hy, -LABEL_DEPTH)


key_list = list(key_mats.values())
view_dir = Vector((-0.64, -0.77, 0.0))     # towards the camera in the muscle part
group_of = {i: g for g, grp in enumerate(GROUPS) for i in grp}
for i, (short, names, latin, role) in enumerate(KEYS):
    gi = group_of[i]
    f = T_KEYS + gi * KEY_LEN
    km = key_mats[short]
    node_key(km, "glow", f, 0.0); node_key(km, "glow", f + 12, 1.0)
    if gi + 1 < len(GROUPS):  # dims a bit when the next group comes in
        node_key(km, "glow", f + KEY_LEN, 1.0); node_key(km, "glow", f + KEY_LEN + 12, 0.45)
for gi, grp in enumerate(GROUPS):
    f = T_KEYS + gi * KEY_LEN
    for m in [other_mat] + key_list:
        idx = key_list.index(m) if m in key_list else -1
        if idx in grp:
            tgt = 1.0
        elif idx >= 0 and group_of[idx] < gi:
            tgt = 0.45
        else:
            tgt = 0.16
        node_key(m, "opacity", f, m.node_tree.nodes["opacity"].outputs[0].default_value)
        node_key(m, "opacity", f + 12, tgt)
for i, (short, names, latin, role) in enumerate(KEYS):
    f = T_KEYS + group_of[i] * KEY_LEN
    # anchor: belly point facing the camera
    co = np.concatenate([np.array([v.co[:] for v in keyobs[n].data.vertices]) for n in names])
    zc = co[:, 2].min() + 0.45 * np.ptp(co[:, 2])
    belly = co[np.abs(co[:, 2] - zc) < 0.02]
    anchor = Vector(belly[(belly @ np.array(view_dir)).argmax()])
    pos = bpy.data.objects.new(f"lblpos_{i}", None); labels.objects.link(pos)
    pos.parent = look
    for fmt in LABEL_UV:
        pos[f"uv_{fmt}"] = LABEL_UV[fmt][i]
    place(pos, "wide", LABEL_UV["wide"][i])
    if AD:  # phone-readable: big abbreviation + short role, no latin
        extra = short in ("FCR", "FCU")      # what the Sloper King adds over a hangboard
        t1 = text(("+ " if extra else "") + short, 0.0135, font_b, accent_mat if extra else label_mat, pos, (0, 0, 0))
        t2 = text(role.split(",")[0] + ("  ·  extra" if extra else ""), 0.0056, font_b, accent_mat if extra else label_mat, pos, (0, -0.0105, 0))
    else:
        t1 = text(f"{i + 1}  {short}", 0.0075, font_b, label_mat, pos, (0, 0, 0))
        t2 = text(f"{latin}\n{role}", 0.0034, font_r, label_mat, pos, (0, -0.0072, 0))
    end = bpy.data.objects.new(f"lblend_{i}", None); labels.objects.link(end)
    end.parent = pos; end.location = (-0.003, 0.001, 0) if AD else (0.031, 0.0005, 0)
    anc = bpy.data.objects.new(f"anchor_{short}", None); labels.objects.link(anc)
    anc.location = anchor
    lead = bpy.data.curves.new("lead", "CURVE"); lead.dimensions = "3D"; lead.bevel_depth = 0.00012
    sp = lead.splines.new("POLY"); sp.points.add(1)
    lead.materials.append(accent_mat)
    lo = bpy.data.objects.new("lead_" + short, lead); labels.objects.link(lo)
    for j, hook_ob in enumerate((end, anc)):
        hm = lo.modifiers.new(f"hook{j}", "HOOK"); hm.object = hook_ob
        hm.vertex_indices_set([j])
    for ob in (t1, t2, lo):
        show(ob, f + 8, T_SKIN[0] + 40)

for m in key_list:      # finale: all four glow
    node_key(m, "glow", T_ALL, m.node_tree.nodes["glow"].outputs[0].default_value)
    node_key(m, "glow", T_ALL + 12, 1.0)
    node_key(m, "opacity", T_ALL, m.node_tree.nodes["opacity"].outputs[0].default_value)
    node_key(m, "opacity", T_ALL + 12, 1.0)
node_key(other_mat, "opacity", T_ALL, 0.16)
node_key(other_mat, "opacity", T_ALL + 12, 0.35)

if T_PUMP:  # fight the pump: the glow pulses harder and faster, then holds
    f, k, period = T_PUMP[0], 0, 22.0
    while f < T_PUMP[1] - 6:
        amp = 1.0 + 1.6 * (f - T_PUMP[0]) / (T_PUMP[1] - T_PUMP[0])
        for m in key_list:
            node_key(m, "glow", int(f), amp if k % 2 == 0 else 0.75)
        f += period / 2; period = max(8.0, period * 0.86); k += 1
    for m in key_list:
        node_key(m, "glow", T_PUMP[1], 2.4)

# title (bottom centre of the frame)
tpos = bpy.data.objects.new("titlepos", None); labels.objects.link(tpos)
tpos.parent = look
tpos["uv_wide"] = (0.56, 0.0); tpos["uv_tall"] = (0.0, -0.82)
place(tpos, "wide", tpos["uv_wide"])
if T_TITLE:
    tt = text("4 MUSCLES ACTIVE", 0.012, font_b, label_mat, tpos, (0, 0, 0), "CENTER")
    ts = text("FDP  ·  FDS  ·  FCR  ·  FCU", 0.0048, font_r, accent_mat, tpos, (0, -0.0115, 0), "CENTER")
    for ob in (tt, ts):
        show(ob, T_TITLE)

# ---------------------------------------------------------------- camera continues
rig = bpy.data.objects["CamRig"]
target = bpy.data.objects["CamTarget"]
cams = {"Cam_16x9": (0.50, 1.15, 1.6), "Cam_9x16": (0.52, 0.85, 1.08)}
CAM_KEYS = ((450, -18, 10), (520, -80, 4), (640, 132, 2), (980, 142, 4), (1100, 150, 6)) if AD else \
    ((450, -18, 10), (560, -80, 4), (760, 132, 2), (1010, 142, 4), (1200, 150, 6))
F_SIDE, F_BACK = (520, 640) if AD else (560, 760)
for fr, az, el in CAM_KEYS:
    rig.rotation_euler = (math.radians(el), 0, math.radians(az))
    rig.keyframe_insert("rotation_euler", frame=fr)
zmid = (Z_TOP + 0.02 + Z_BOT) / 2
for fr, z in ((450, 0.004), (F_SIDE, -0.07), (F_BACK, zmid), (F_END, zmid)):
    target.location.z = z; target.keyframe_insert("location", index=2, frame=fr)
    rig.location.z = z; rig.keyframe_insert("location", index=2, frame=fr)
for cn, (d0, d_side, d1) in cams.items():
    c = bpy.data.objects[cn]
    c.location.y = d0; c.keyframe_insert("location", index=1, frame=450)
    c.location.y = d_side; c.keyframe_insert("location", index=1, frame=F_SIDE)
    c.location.y = d1; c.keyframe_insert("location", index=1, frame=F_BACK)
    c.data.clip_end = 20

if AD:  # close-up of the open hand on the curve (pulley safe shot), slow push-in
    cd = bpy.data.cameras.new("Cam_close"); cd.lens = 60; cd.clip_start = 0.01
    cc = bpy.data.objects.new("Cam_close", cd); sc.collection.objects.link(cc)
    hand_t = Vector((0, 0.02, 0.012))
    for fr, loc in ((1100, (-0.30, 0.16, -0.02)), (1250, (-0.24, 0.12, -0.005))):
        cc.location = hand_t + Vector(loc)
        cc.rotation_euler = (hand_t - cc.location).to_track_quat("-Z", "Y").to_euler()
        cc.keyframe_insert("location", frame=fr); cc.keyframe_insert("rotation_euler", frame=fr)

# arm objects hidden during the product intro
for o in arm_all + [skin]:
    o.hide_render = True; o.keyframe_insert("hide_render", frame=1)
    o.keyframe_insert("hide_render", frame=T_BONE_LINES - 1)
    o.hide_render = False; o.keyframe_insert("hide_render", frame=T_BONE_LINES)

out = bpy.data.filepath.replace(".blend", "_ad.blend") if AD and "_ad" not in bpy.data.filepath else bpy.data.filepath
bpy.ops.wm.save_as_mainfile(filepath=out)
print("SAVED", out)
