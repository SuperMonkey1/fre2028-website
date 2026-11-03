"""Dump the rope-slot outline (mid-width section) to assets/slot_outline.npy.
blender -b sloperking_v1.blend -P scripts/probe_slot.py"""
import bpy, bmesh, os
import numpy as np

root = os.path.dirname(bpy.data.filepath)
me = bpy.data.objects["SloperKing"].data
bm = bmesh.new(); bm.from_mesh(me)
geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
res = bmesh.ops.bisect_plane(bm, geom=geom, plane_co=(0, 0, 0), plane_no=(1, 0, 0))
edges = [e for e in res["geom_cut"] if isinstance(e, bmesh.types.BMEdge)]
# ordered loops via shared vertices
adj = {}
for e in edges:
    a, b = e.verts
    adj.setdefault(a.index, []).append(b); adj.setdefault(b.index, []).append(a)
vco = {v.index: v.co[1:] for e in edges for v in e.verts}
loops, seen = [], set()
for st in adj:
    if st in seen:
        continue
    lp, cur, prev = [st], st, None
    seen.add(st)
    while True:
        nxt = [v.index for v in adj[cur] if v.index != prev and v.index not in seen]
        if not nxt:
            break
        prev, cur = cur, nxt[0]; seen.add(cur); lp.append(cur)
    loops.append(np.array([vco[i] for i in lp]))
print("LOOPS", [len(l) for l in loops])
np.save(os.path.join(root, "assets", "slot_loops.npy"), np.array(loops, dtype=object), allow_pickle=True)
