"""Dark product shots for the advert, on top of the finished product scene.

  blender -b sloperking_v2.blend -P scripts/ad_shots.py   -> sloperking_adshots.blend

30 fps, rendered with frame_step 1. Cameras switch with timeline markers.
  1-75     adjust : rope steps through the 5 notches, the hang angle changes
  76-150   strong : macro of the cord leaving the notch
  151-225  light  : product alone, floating and turning
  226-300  grip   : macro over the 220-grit grip paper
  301-450  end    : product turning (end card, 5 s)
  451-585  train  : product hanging, slow orbit (backdrop for the training cards)
"""
import bpy, bmesh, math, os, sys
import numpy as np
from mathutils import Vector, Matrix

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from find_notches import find_notches

sc = bpy.context.scene
sc.frame_start, sc.frame_end = 1, 585
SHOTS = {"adjust": (1, 75), "strong": (76, 150), "light": (151, 225), "grip": (226, 300),
         "end": (301, 450), "train": (451, 585)}
BG = (0.0006, 0.0018, 0.0089)        # slate-950 (#020617), linear
AMBER = (0.913, 0.342, 0.0033)       # amber-500 (#F59E0B), linear
TILT = 10.0                           # degrees between neighbouring notches
FONT_B = r"C:\Windows\Fonts\seguibl.ttf"

body = bpy.data.objects["SloperKing"]
grip = bpy.data.objects["GripPaper"]
proj = bpy.data.objects["LabelProjector"]
rope_mat = bpy.data.objects["Rope"].data.materials[0]

# ---------------------------------------------------------------- static, finished product on dark
bpy.context.view_layer.layer_collection.children["Lines"].exclude = True
sw = bpy.data.objects["SweepController"]
sw.animation_data_clear(); sw.location.x = 1.0
for o in (bpy.data.objects["CamRig"], bpy.data.objects["CamTarget"]):
    o.animation_data_clear()
wn = sc.world.node_tree
for n in wn.nodes:
    if n.type == "BACKGROUND" and n.inputs["Strength"].default_value == 1.0:
        n.inputs["Color"].default_value = (*BG, 1)
l = bpy.data.lights.new("RimDark", "AREA"); l.energy = 30; l.size = 0.25; l.color = (0.85, 0.9, 1.0)
lo = bpy.data.objects.new("RimDark", l); sc.collection.objects.link(lo)
lo.location = (-0.3, -0.35, 0.35); lo.rotation_euler = (-lo.location).to_track_quat("-Z", "Y").to_euler()

# ---------------------------------------------------------------- notches + one rope per notch
me = body.data
bm = bmesh.new(); bm.from_mesh(me)
res = bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=(0, 0, 0), plane_no=(1, 0, 0))
edges = [e for e in res["geom_cut"] if isinstance(e, bmesh.types.BMEdge)]
adj = {}
for e in edges:
    a, b = e.verts
    adj.setdefault(a, []).append(b); adj.setdefault(b, []).append(a)
loops, seen = [], set()
for st in adj:
    if st in seen:
        continue
    lp, cur, prev = [st], st, None
    seen.add(st)
    while True:
        nxt = [v for v in adj[cur] if v is not prev and v not in seen]
        if not nxt:
            break
        prev, cur = cur, nxt[0]; seen.add(cur); lp.append(cur)
    loops.append(np.array([v.co[1:] for v in lp]))
bm.free()
notches = sorted(find_notches(loops, skip_largest=False), key=lambda n: n[0][0])
print("NOTCHES", len(notches))
co = np.array([v.co[:] for v in me.vertices])
W = co[:, 0].max()
R, RB = 0.0019, 0.004


def rope_path(hy, hz):
    top0 = np.array([0.012, hy - 0.004, 0.40])

    def strand(side):
        top = top0 * np.array([side, 1, 1])
        cx, cz = side * W, hz + RB
        end = np.array([side * (W + RB), hy, cz])
        tilt = math.atan2(abs(top[0] - end[0]), top[2] - end[2])
        pts = [np.array([side * (W - 0.002), hy, hz])]
        for th in np.linspace(0, math.pi / 2 - tilt, 14):
            pts.append(np.array([cx + side * RB * math.sin(th), hy, cz - RB * math.cos(th)]))
        for t in np.linspace(0, 1, 30)[1:]:
            pts.append(pts[14] + t * (top - pts[14]))
        return np.array(pts)
    inside = np.array([[x, hy, hz] for x in np.linspace(-(W - 0.002), W - 0.002, 40)])[1:-1]
    return np.concatenate([strand(-1)[::-1], inside, strand(1)])


def tube_mesh(name, path, radius, seg=16):
    t = np.gradient(path, axis=0); t /= np.linalg.norm(t, axis=1)[:, None]
    n = np.cross(t[0], [0, 1, 0] if abs(t[0][1]) < 0.9 else [1, 0, 0]); n /= np.linalg.norm(n)
    verts = []
    for i in range(len(path)):
        if i:
            n = n - t[i] * n.dot(t[i]); n /= np.linalg.norm(n)
        b = np.cross(t[i], n)
        for k in range(seg):
            a = 2 * math.pi * k / seg
            verts.append(path[i] + radius * (math.cos(a) * n + math.sin(a) * b))
    faces = [(i * seg + k, i * seg + (k + 1) % seg, (i + 1) * seg + (k + 1) % seg, (i + 1) * seg + k)
             for i in range(len(path) - 1) for k in range(seg)]
    m = bpy.data.meshes.new(name); m.from_pydata([tuple(v) for v in verts], [], faces)
    L = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(path, axis=0), axis=1))])
    uv = m.uv_layers.new(name="UVMap")
    for p in m.polygons:
        p.use_smooth = True
        ks = [m.loops[li].vertex_index % seg for li in p.loop_indices]
        for li in p.loop_indices:
            i, k = divmod(m.loops[li].vertex_index, seg)
            uv.data[li].uv = (L[i], (seg if (k == 0 and seg - 1 in ks) else k) / seg)
    o = bpy.data.objects.new(name, m); sc.collection.objects.link(o)
    m.materials.append(rope_mat)
    return o


bpy.data.objects.remove(bpy.data.objects["Rope"])
pivots, ropes = [], []
for k, (c, r, o) in enumerate(notches):
    hy, hz = c - o * (r - R)
    pivots.append(np.array([0, hy, hz]))
    ropes.append(tube_mesh(f"Rope_{k}", rope_path(hy, hz), R))

# ---------------------------------------------------------------- hang empty (tilt about the active notch)
hang = bpy.data.objects.new("Hang", None); sc.collection.objects.link(hang)
for o in (body, grip, proj):
    mw = o.matrix_world.copy(); o.parent = hang; o.matrix_world = mw

# engraved position numbers 1-5 on the end face above each notch
num_dim = bpy.data.materials.new("NumDim"); num_dim.use_nodes = True
num_dim.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.3, 0.3, 0.31, 1)
num_on = bpy.data.materials.new("NumOn"); num_on.use_nodes = True
pb = num_on.node_tree.nodes["Principled BSDF"]
pb.inputs["Emission Color"].default_value = (*AMBER, 1); pb.inputs["Emission Strength"].default_value = 3
font = bpy.data.fonts.load(FONT_B) if os.path.exists(FONT_B) else None
numbers = []
for k, (c, r, o) in enumerate(notches):
    pos = c - o * (r + 0.0032)
    pair = []
    for mat in (num_dim, num_on):
        cu = bpy.data.curves.new(f"n{k}", "FONT"); cu.body = str(k + 1); cu.size = 0.0042
        cu.align_x = "CENTER"; cu.align_y = "CENTER"; cu.extrude = 0.00008
        if font:
            cu.font = font
        cu.materials.append(mat)
        ob = bpy.data.objects.new(f"num{k}_{mat.name}", cu); sc.collection.objects.link(ob)
        ob.location = (-W - 0.0002, pos[0], pos[1])
        ob.rotation_euler = (math.radians(90), 0, math.radians(-90))   # faces -X
        ob.parent = hang
        pair.append(ob)
    numbers.append(pair)


def hang_pose(k, theta=None):
    th = math.radians((k - 2) * TILT if theta is None else theta)
    Rm = Matrix.Rotation(th, 4, "X")
    p = Vector(pivots[k])
    return Matrix.Translation(p) @ Rm @ Matrix.Translation(-p)


def key_hang(f, M):
    hang.matrix_world = M
    hang.keyframe_insert("location", frame=f); hang.keyframe_insert("rotation_euler", frame=f)


def vis(ob, f, on):
    ob.hide_render = not on; ob.keyframe_insert("hide_render", frame=f)


f0, f1 = SHOTS["adjust"]
step = 15
for i in range(5):        # position 5 -> 1: easiest first, ends on the hardest
    k = 4 - i
    a = f0 + i * step
    key_hang(a, hang_pose(k)); key_hang(a + 9, hang_pose(k))
    for j in range(5):
        vis(ropes[j], a if i else 0, j == k)
        vis(numbers[j][0], a if i else 0, j != k)
        vis(numbers[j][1], a if i else 0, j == k)
# all other shots: neutral pose on notch 3 (index 2), rope on, numbers off
for name in ("strong", "light", "grip", "end", "train"):
    a, b = SHOTS[name]
    key_hang(a, hang_pose(2)); key_hang(b, hang_pose(2))
    for j in range(5):
        vis(ropes[j], a, j == 2 and name not in ("light", "end"))
        vis(numbers[j][0], a, False); vis(numbers[j][1], a, False)
# product turns for light / end
for name, (z0, z1) in (("light", (-25, 95)), ("end", (20, 70))):
    a, b = SHOTS[name]
    for f, z in ((a, z0), (b, z1)):
        hang.matrix_world = Matrix.Rotation(math.radians(z), 4, "Z")
        hang.keyframe_insert("rotation_euler", frame=f); hang.keyframe_insert("location", frame=f)
if hang.animation_data and hang.animation_data.action:
    act = hang.animation_data.action
    fcs = act.fcurves if hasattr(act, "fcurves") else [fc for l in act.layers for s in l.strips for cb in s.channelbags for fc in cb.fcurves]
    for fc in fcs:
        for kp in fc.keyframe_points:
            kp.interpolation = "BEZIER"

# ---------------------------------------------------------------- cameras
def cam(name, lens, keys, target_keys, dof=None):
    cd = bpy.data.cameras.new(name); cd.lens = lens; cd.clip_start = 0.005
    c = bpy.data.objects.new(name, cd); sc.collection.objects.link(c)
    t = bpy.data.objects.new(name + "_target", None); sc.collection.objects.link(t)
    for (f, loc), (_, tgt) in zip(keys, target_keys):
        c.location = loc; c.keyframe_insert("location", frame=f)
        t.location = tgt; t.keyframe_insert("location", frame=f)
    tc = c.constraints.new("TRACK_TO"); tc.target = t; tc.track_axis = "TRACK_NEGATIVE_Z"; tc.up_axis = "UP_Y"
    if dof:
        cd.dof.use_dof = True; cd.dof.focus_object = t; cd.dof.aperture_fstop = dof[1]
    return c


p2 = pivots[2]
ex = Vector((-W - 0.002, p2[1], p2[2] + 0.004))
g = np.array([v.co[:] for v in grip.data.vertices])
gn = np.array([v.normal[:] for v in grip.data.vertices])
# lower edge of the grip (straight cut, boundary with the engraved black zone), centred on the width
edge = g[g[:, 2] < g[:, 2].min() + 0.0015]
gtop = Vector((0.0, edge[:, 1].mean(), edge[:, 2].mean() + 0.004))
gnorm = Vector(proj.matrix_world.col[2][:3]).normalized()     # label normal = face direction
inner = Vector((0, co[:, 1].min(), co[:, 2].min()))     # concave side of the bend
if gnorm.dot(gtop - inner) < 0:
    gnorm = -gnorm
print("GRIP target", tuple(round(x, 4) for x in gtop), "normal", tuple(round(x, 2) for x in gnorm))
cams = {
    "adjust": cam("Cam_adjust", 60, [(1, (-0.46, 0.0, 0.01)), (75, (-0.43, 0.01, 0.02))],
                  [(1, (0, 0.0, 0.0)), (75, (0, 0.0, 0.0))]),
    "strong": cam("Cam_strong", 60, [(76, ex + Vector((-0.07, -0.05, 0.03))), (150, ex + Vector((-0.045, -0.032, 0.02)))],
                  [(76, ex), (150, ex)], dof=(0.075, 4.0)),
    "light": cam("Cam_light", 60, [(151, (0.0, 0.48, 0.12)), (225, (0.0, 0.44, 0.1))],
                 [(151, (0, 0, 0.0)), (225, (0, 0, 0.0))]),
    "grip": cam("Cam_grip", 70, [(226, gtop + gnorm * 0.095 + Vector((-0.035, 0, 0.02))), (300, gtop + gnorm * 0.095 + Vector((0.035, 0, 0.02)))],
                [(226, gtop + Vector((-0.01, 0, 0.002))), (300, gtop + Vector((0.01, 0, 0.002)))], dof=(0.1, 6.0)),
    "end": cam("Cam_end", 60, [(301, (0.0, 0.74, -0.02)), (450, (0.0, 0.68, -0.02))],
               [(301, (0, 0, -0.07)), (450, (0, 0, -0.07))]),
    "train": cam("Cam_train", 50, [(451, (-0.3, 0.45, 0.05)), (585, (0.3, 0.45, 0.05))],
                 [(451, (0, 0, 0.03)), (585, (0, 0, 0.03))]),
}
sc.timeline_markers.clear()
for name, (a, b) in SHOTS.items():
    m = sc.timeline_markers.new(name, frame=a); m.camera = cams[name]
sc.camera = cams["adjust"]
sc.render.resolution_x, sc.render.resolution_y = 1080, 1920

out = os.path.join(ROOT, "sloperking_adshots.blend")
bpy.ops.wm.save_as_mainfile(filepath=out)
print("SAVED", out)
