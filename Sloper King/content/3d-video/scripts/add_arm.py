"""Add a posed right arm (BodyParts3D bones + muscles) gripping the Sloper King.

Run on the product scene:
  blender -b sloperking_v1.blend -P scripts/add_arm.py
-> saves sloperking_arms_v1.blend

Pose: overhand sloper grip like the photo - forearm hanging vertical in front of
the grip face, wrist flexed, palm on the curved top, fingers over the top.
Rigid segments (forearm / hand / finger phalanges) are posed around joint
centres measured from the bones; muscles + tendons follow by distance-weighted
linear blend skinning.
"""
import bpy, os, math
import numpy as np
from mathutils import Vector, Matrix, kdtree

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BLEND_OUT = os.path.join(ROOT, os.path.basename(bpy.data.filepath).replace("sloperking_", "sloperking_arms_"))

# ---- pose parameters (degrees) -------------------------------------------
WRIST_FLEX = 38
# finger flexion is solved: each joint bends until the finger rests on the surface
THUMB_FLEX = 10
PALM_TISSUE = 0.015      # bone -> palm skin (m)
CONTACT_TILT = 0.0       # extra tilt of the whole arm about X (deg)

parts = [l.split() for l in open(os.path.join(ROOT, "scripts", "bp3d_parts.txt"))
         if l.strip() and not l.startswith("#")]

meshes = {}
for role, fid, name in parts:
    bpy.ops.wm.stl_import(filepath=os.path.join(ROOT, "assets", "bp3d", fid + ".stl"))
    ob = bpy.context.selected_objects[0]
    ob.name = "arm_" + name
    co = np.empty(len(ob.data.vertices) * 3); ob.data.vertices.foreach_get("co", co)
    meshes[name] = (role, ob, co.reshape(-1, 3))

# ---- segments -------------------------------------------------------------
FINGERS = ["index", "middle", "ring", "little"]
seg_of = {}
for n in ("humerus", "radius", "ulna"):
    seg_of[n] = "forearm"
for n in ("scaphoid", "lunate", "triquetral", "pisiform", "trapezium", "trapezoid", "capitate", "hamate",
          "metacarpal2", "metacarpal3", "metacarpal4", "metacarpal5"):
    seg_of[n] = "hand"
for n in ("metacarpal1", "prox_thumb", "dist_thumb"):
    seg_of[n] = "thumb"
for f in FINGERS:
    for ph in ("prox", "mid", "dist"):
        seg_of[f"{ph}_{f}"] = f"{ph}_{f}"


def V(n):
    return meshes[n][2]


def closest_mid(a, b):
    """midpoint of the closest vertex pair between bones a and b."""
    kd = kdtree.KDTree(len(V(b)))
    for i, p in enumerate(V(b)):
        kd.insert(p, i)
    kd.balance()
    best = (1e9, None)
    for p in V(a)[::2]:
        q, _, d = kd.find(p)
        if d < best[0]:
            best = (d, (Vector(p) + q) / 2)
    return best[1]


# joints (BodyParts3D frame, mm: -Y anterior, +Z up, arm hanging)
J = {"wrist": closest_mid("capitate", "lunate")}
MC = {"index": "metacarpal2", "middle": "metacarpal3", "ring": "metacarpal4", "little": "metacarpal5"}
for f in FINGERS:
    J[f"mcp_{f}"] = closest_mid(MC[f], f"prox_{f}")
    J[f"pip_{f}"] = closest_mid(f"prox_{f}", f"mid_{f}")
    J[f"dip_{f}"] = closest_mid(f"mid_{f}", f"dist_{f}")
J["cmc_thumb"] = closest_mid("metacarpal1", "trapezium")
J["elbow"] = closest_mid("humerus", "ulna")
for k, v in J.items():
    print("JOINT", k, tuple(round(c, 1) for c in v))


def rot_about(center, axis, deg):
    return (Matrix.Translation(center) @ Matrix.Rotation(math.radians(deg), 4, axis)
            @ Matrix.Translation(-center))


# flexion = fingertips towards anterior (-Y) while hanging: rotation about -X
AX = Vector((-1, 0, 0))


def apply_T(M, co):
    M = np.array(M)
    return co @ M[:3, :3].T + M[:3, 3]


T = {"forearm": Matrix.Identity(4)}
T["hand"] = rot_about(J["wrist"], AX, WRIST_FLEX)
T["thumb"] = T["hand"] @ rot_about(J["cmc_thumb"], Vector((0, 0, 1)), -THUMB_FLEX)

# ---- global placement (from the hand only) --------------------------------
# forearm axis (elbow -> wrist) becomes vertical with the hand up, palm side
# (anterior) faces -Y towards the grip face, thumb medial (+X).  mm -> m.
u = np.array(J["wrist"] - J["elbow"]); u /= np.linalg.norm(u)
pa = np.array([0, -1.0, 0]); pa -= pa.dot(u) * u; pa /= np.linalg.norm(pa)
src = np.stack([u, pa, np.cross(u, pa)], 1)
dst = np.stack([[0, 0, 1.0], [0, -1.0, 0], [1.0, 0, 0]], 1)
G = dst @ src.T * 0.001
if CONTACT_TILT:
    G = np.array(Matrix.Rotation(math.radians(CONTACT_TILT), 3, "X")) @ G

Rh = np.array(T["hand"])[:3, :3]
palm_n = G @ Rh @ pa; palm_n /= np.linalg.norm(palm_n)
# level the palm across the width (no roll), forearm stays vertical
roll = -math.atan2(palm_n[0], -palm_n[1])
G = np.array(Matrix.Rotation(roll, 3, "Z")) @ G
palm_n = G @ Rh @ pa; palm_n /= np.linalg.norm(palm_n)
heads = []
for f in FINGERS:
    mcp = apply_T(T["hand"], np.array(J[f"mcp_{f}"])[None])
    pm = apply_T(T["hand"], V(MC[f]))
    heads.append(pm[np.argsort(np.linalg.norm(pm - mcp, axis=1))[:150]])
heads = np.concatenate(heads) @ G.T
palm_pt = heads.mean(0) + palm_n * PALM_TISSUE

body = bpy.data.objects["SloperKing"]
bme = body.data
bco = np.array([v.co[:] for v in bme.vertices])
bno = np.array([v.normal[:] for v in bme.vertices])
grip = (np.abs(bco[:, 0]) < 0.02)
score = bno[grip] @ (-palm_n)
tgt_i = np.where(grip)[0][score.argmax()]
target = bco[tgt_i] + bno[tgt_i] * 0.0007
shift = target - palm_pt
shift[0] = -heads.mean(0)[0]       # centre the hand on the width
print("PALM_N", palm_n, "TARGET", target, "SHIFT", shift)


def to_world(co_bp):
    return co_bp @ G.T + shift


# ---- fingers wrap onto the surface ---------------------------------------
from mathutils.bvhtree import BVHTree
bvh = BVHTree.FromPolygons([tuple(v) for v in bco], [tuple(p.vertices) for p in bme.polygons])


def clearance(pts):
    """min signed distance of world points to the sloper surface (+ outside)."""
    m = 1.0
    for p in pts[::4]:
        loc, nrm, _, d = bvh.find_nearest(Vector(p))
        if loc is None:
            continue
        sd = d if (Vector(p) - loc).dot(nrm) >= 0 else -d
        m = min(m, sd)
    return m


TISSUE = {"prox": 0.0075, "mid": 0.0065, "dist": 0.0055}
JOINT_OF = {"prox": "mcp", "mid": "pip", "dist": "dip"}
FLEX_RANGE = {"prox": (-10, 45), "mid": (0, 60), "dist": (0, 40)}
for f in FINGERS:
    parent = T["hand"]
    for ph in ("prox", "mid", "dist"):
        lo, hi = FLEX_RANGE[ph]
        best = lo
        jc = np.array(J[f"{JOINT_OF[ph]}_{f}"])
        bone = V(f"{ph}_{f}")
        dj = np.linalg.norm(bone - jc, axis=1)
        bone = bone[dj > 0.35 * dj.max()]          # ignore the base at the joint
        best, best_err = lo, 1e9
        for ang in range(lo, hi + 1, 2):
            M = parent @ rot_about(jc, AX, ang)
            c = clearance(to_world(apply_T(M, bone)))
            if c < TISSUE[ph] * 0.85:
                break
            best, best_err = ang, abs(c - TISSUE[ph])
        T[f"{ph}_{f}"] = parent @ rot_about(J[f"{JOINT_OF[ph]}_{f}"], AX, best)
        parent = T[f"{ph}_{f}"]
        print("FLEX", f, ph, best)
SEGS = list(T)

# ---- muscles follow by distance-weighted skinning --------------------------
seg_pts = {s: [] for s in SEGS}
for n, s in seg_of.items():
    seg_pts[s].append(V(n)[::3])
seg_kd = {}
for s in SEGS:
    pts = np.concatenate(seg_pts[s])
    kd = kdtree.KDTree(len(pts))
    for i, p in enumerate(pts):
        kd.insert(p, i)
    kd.balance()
    seg_kd[s] = kd
Tnp = {s: np.array(T[s]) for s in SEGS}
Z_FREE = J["wrist"].z + 45      # above this (towards the elbow) everything is rigid forearm


def skin(co):
    out = co.copy()
    m = co[:, 2] < Z_FREE
    if m.any():
        out[m] = _skin(co[m])
    return out


def _skin(co):
    d = np.array([[seg_kd[s].find(p)[2] for s in SEGS] for p in co])   # (N, S)
    w = 1.0 / (d + 0.5) ** 6
    w /= w.sum(1, keepdims=True)
    out = np.zeros_like(co)
    for i, s in enumerate(SEGS):
        if w[:, i].max() < 1e-4:
            continue
        out += w[:, i:i + 1] * apply_T(Tnp[s], co)
    return out


arm_coll = bpy.data.collections.new("Arm")
bpy.context.scene.collection.children.link(arm_coll)
for sub in ("Bones", "Muscles", "KeyMuscles"):
    c = bpy.data.collections.new("Arm" + sub); arm_coll.children.link(c)
for name, (role, ob, co) in meshes.items():
    p = apply_T(Tnp[seg_of[name]], co) if role == "bone" else skin(co)
    p = to_world(p)
    ob.data.vertices.foreach_set("co", p.ravel())
    ob.data.update()
    for c in list(ob.users_collection):
        c.objects.unlink(ob)
    bpy.data.collections[{"bone": "ArmBones", "muscle": "ArmMuscles", "key": "ArmKeyMuscles"}[role]].objects.link(ob)
    for poly in ob.data.polygons:
        poly.use_smooth = True
    ob.data.materials.clear()

bpy.ops.wm.save_as_mainfile(filepath=BLEND_OUT)
print("SAVED", BLEND_OUT)
