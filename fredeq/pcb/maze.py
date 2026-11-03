"""Small 2-layer grid router that finishes the connections an autorouter left open.

A* on a 0.1 mm grid with 45-degree moves and vias. Every existing copper item of another net,
the keep-outs, holes and the board edge are inflated by clearance + half the track width, so
the result passes the board's DRC rules. Connects the pieces of each net, closest pair first.
"""
import heapq
import math
from array import array

import pcbnew

GRID_MM = 0.1
TRACK_MM = 0.2
CLEARANCE_MM = 0.15
EDGE_MM = 0.3
HOLE_CLEAR_MM = 0.25
VIA_COST = 30                     # extra cost of a via, in grid steps
RIP_PENALTY = 20                  # cost of crossing another net's track when looking for what to rip up
MAX_RIPUPS = 6                    # rip-up-and-reroute rounds per complete() call
VIA_PAD_GAP_MM = 0.2              # via copper to any SMD pad, own net too: no vias in or touching pads
LAYERS = (pcbnew.F_Cu, pcbnew.B_Cu)
DIRS = [(1, 0, 1.0), (-1, 0, 1.0), (0, 1, 1.0), (0, -1, 1.0),
        (1, 1, 1.414), (1, -1, 1.414), (-1, 1, 1.414), (-1, -1, 1.414)]


def _seg_dist(px, py, ax, ay, bx, by):
    dx, dy = bx - ax, by - ay
    t = 0.0 if dx == dy == 0 else max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    return math.hypot(px - ax - t * dx, py - ay - t * dy)


def _box_dist(px, py, box):
    dx = max(box.GetLeft() - px, 0, px - box.GetRight())
    dy = max(box.GetTop() - py, 0, py - box.GetBottom())
    return math.hypot(dx, dy)


def is_component_smd(pad):
    """A part's solder pad. The coil spirals are custom-shaped pads by construction, not solder pads."""
    return (pad.GetAttribute() == pcbnew.PAD_ATTRIB_SMD and pad.IsOnCopperLayer()
            and pad.GetShape() != pcbnew.PAD_SHAPE_CUSTOM)


def clear_of_pads(board, p, via_d):
    """True if a via at p keeps VIA_PAD_GAP_MM from every component SMD pad, whatever its net."""
    rr = via_d / 2 + pcbnew.FromMM(VIA_PAD_GAP_MM)
    return all(_box_dist(p.x, p.y, q.GetBoundingBox()) >= rr for q in board.GetPads() if is_component_smd(q))


class Router:
    def __init__(self, board, skip_nets=(), soft_nets=()):
        """soft_nets: their tracks and vias are left out (pads stay), to find what to rip up."""
        self.b = board
        self.skip = set(skip_nets)
        self.soft = set(soft_nets)
        self.g = pcbnew.FromMM(GRID_MM)
        bb = board.GetBoardEdgesBoundingBox()
        self.x0, self.y0 = bb.GetLeft(), bb.GetTop()
        self.nx, self.ny = bb.GetWidth() // self.g + 1, bb.GetHeight() // self.g + 1
        self.r = pcbnew.FromMM(CLEARANCE_MM + TRACK_MM / 2)        # keep-away for a track centre line
        self.via_d, self.via_drill = board.GetDesignSettings().GetCurrentViaSize(), \
            board.GetDesignSettings().GetCurrentViaDrill()
        self.via_extra = max(1, math.ceil((self.via_d / 2 - pcbnew.FromMM(TRACK_MM / 2)) / self.g))
        self.holes = []                                           # drilled holes: (x, y, radius), any net
        self.hole_gap = pcbnew.FromMM(HOLE_CLEAR_MM)
        n = self.nx * self.ny
        self.cover = [array("H", bytes(2 * n)) for _ in LAYERS]   # other-copper count per cell
        self.no_via = bytearray(n)                                # via centres too close to an SMD pad
        self.own = {}                                             # net -> {(layer, idx): count}
        self.width = pcbnew.FromMM(TRACK_MM)
        self._edges()
        self._rasterize_board()

    # --- grid helpers -------------------------------------------------------------
    def pos(self, idx):
        return self.x0 + (idx % self.nx) * self.g, self.y0 + (idx // self.nx) * self.g

    def cell(self, x, y):
        ix, iy = round((x - self.x0) / self.g), round((y - self.y0) / self.g)
        if 0 <= ix < self.nx and 0 <= iy < self.ny:
            return iy * self.nx + ix
        return None

    def _mark(self, layer_i, x0, y0, x1, y1, inside, net, delta=1):
        """Mark cells in a nm box for which inside(px, py) is true, as owned by net (delta -1: unmark)."""
        ix0, ix1 = int(max(0, (x0 - self.x0) // self.g)), int(min(self.nx - 1, (x1 - self.x0) // self.g + 1))
        iy0, iy1 = int(max(0, (y0 - self.y0) // self.g)), int(min(self.ny - 1, (y1 - self.y0) // self.g + 1))
        cov = self.cover[layer_i]
        own = self.own.setdefault(net, {}) if net else None
        for iy in range(iy0, iy1 + 1):
            py = self.y0 + iy * self.g
            for ix in range(ix0, ix1 + 1):
                px = self.x0 + ix * self.g
                if inside(px, py):
                    i = iy * self.nx + ix
                    cov[i] += delta
                    if own is not None:
                        own[(layer_i, i)] = own.get((layer_i, i), 0) + delta

    def mark_segment(self, layer_i, a, b, half, net, delta=1):
        rr = half + self.r
        self._mark(layer_i, min(a.x, b.x) - rr, min(a.y, b.y) - rr, max(a.x, b.x) + rr, max(a.y, b.y) + rr,
                   lambda px, py: _seg_dist(px, py, a.x, a.y, b.x, b.y) < rr, net, delta)

    def mark_circle(self, layer_i, c, rad, net, delta=1):
        rr = rad + self.r
        self._mark(layer_i, c.x - rr, c.y - rr, c.x + rr, c.y + rr,
                   lambda px, py: math.hypot(px - c.x, py - c.y) < rr, net, delta)

    def mark_box(self, layer_i, box, extra, net):
        rr = extra + self.r
        self._mark(layer_i, box.GetLeft() - rr, box.GetTop() - rr, box.GetRight() + rr, box.GetBottom() + rr,
                   lambda px, py: _box_dist(px, py, box) < rr, net)

    def _edges(self):
        outline = pcbnew.SHAPE_POLY_SET()
        self.b.GetBoardPolygonOutlines(outline, True)
        inside = bytearray(self.nx * self.ny)
        for i in range(self.nx * self.ny):
            x, y = self.pos(i)
            inside[i] = outline.Contains(pcbnew.VECTOR2I(int(x), int(y)))
        k = math.ceil(pcbnew.FromMM(EDGE_MM + TRACK_MM / 2) / self.g)
        for layer_i in range(len(LAYERS)):
            cov = self.cover[layer_i]
            for i in range(self.nx * self.ny):
                if not inside[i]:
                    cov[i] += 1
        for i in range(self.nx * self.ny):  # erode the inside by the edge clearance
            if inside[i]:
                continue
            ix, iy = i % self.nx, i // self.nx
            for dy in range(-k, k + 1):
                for dx in range(-k, k + 1):
                    jx, jy = ix + dx, iy + dy
                    if 0 <= jx < self.nx and 0 <= jy < self.ny and dx * dx + dy * dy <= k * k:
                        j = jy * self.nx + jx
                        if inside[j] and self.cover[0][j] < 60000:
                            for cov in self.cover:
                                cov[j] = max(cov[j], 1) if cov[j] else 1

    def _rasterize_board(self):
        for pad in self.b.GetPads():
            if not pad.IsOnCopperLayer():
                continue  # paste-only apertures (e.g. in an exposed pad) are not copper
            if pad.GetDrillSize().x > 0:
                self.holes.append((pad.GetPosition().x, pad.GetPosition().y, pad.GetDrillSize().x / 2))
            net = pad.GetNetname()
            if pad.GetAttribute() == pcbnew.PAD_ATTRIB_NPTH:
                rad = pad.GetDrillSize().x / 2 + pcbnew.FromMM(HOLE_CLEAR_MM - CLEARANCE_MM)
                for li in range(len(LAYERS)):
                    self.mark_circle(li, pad.GetPosition(), rad, None)
                continue
            for li, layer in enumerate(LAYERS):
                if pad.IsOnLayer(layer):
                    self.mark_box(li, pad.GetBoundingBox(), 0, net)
            if is_component_smd(pad):
                self._ban_vias(pad.GetBoundingBox())
        for t in self.b.GetTracks():
            if t.GetNetname() not in self.soft:
                self.add_item(t)
        zones = [z for z in self.b.Zones()]
        for fp in self.b.GetFootprints():
            zones += list(fp.Zones())
        for z in zones:
            if z.GetIsRuleArea() and z.GetDoNotAllowTracks():
                box = z.GetBoundingBox()
                for li, layer in enumerate(LAYERS):
                    if z.IsOnLayer(layer):
                        self._mark(li, box.GetLeft(), box.GetTop(), box.GetRight(), box.GetBottom(),
                                   lambda px, py, o=z.Outline(): o.Contains(pcbnew.VECTOR2I(int(px), int(py))), None)
                        self.mark_box(li, box, -self.r + pcbnew.FromMM(TRACK_MM / 2), None)

    def _ban_vias(self, box):
        rr = self.via_d / 2 + pcbnew.FromMM(VIA_PAD_GAP_MM)
        ix0, ix1 = int(max(0, (box.GetLeft() - rr - self.x0) // self.g)), \
            int(min(self.nx - 1, (box.GetRight() + rr - self.x0) // self.g + 1))
        iy0, iy1 = int(max(0, (box.GetTop() - rr - self.y0) // self.g)), \
            int(min(self.ny - 1, (box.GetBottom() + rr - self.y0) // self.g + 1))
        for iy in range(iy0, iy1 + 1):
            for ix in range(ix0, ix1 + 1):
                if _box_dist(self.x0 + ix * self.g, self.y0 + iy * self.g, box) < rr:
                    self.no_via[iy * self.nx + ix] = 1

    def add_item(self, t, delta=1):
        net = t.GetNetname()
        if t.Type() == pcbnew.PCB_VIA_T:
            for li in range(len(LAYERS)):
                self.mark_circle(li, t.GetPosition(), t.GetWidth(pcbnew.F_Cu) / 2, net, delta)
            hole = (t.GetPosition().x, t.GetPosition().y, t.GetDrillValue() / 2)
            self.holes.append(hole) if delta > 0 else self.holes.remove(hole)
        elif t.Type() == pcbnew.PCB_TRACE_T:
            li = LAYERS.index(t.GetLayer())
            self.mark_segment(li, t.GetStart(), t.GetEnd(), t.GetWidth() / 2, net, delta)

    def remove_item(self, t):
        self.add_item(t, -1)

    # --- search -------------------------------------------------------------------------
    def free(self, net, li, i):
        own = self.own.get(net, {})
        return self.cover[li][i] - own.get((li, i), 0) == 0

    def via_ok(self, net, i):
        if self.no_via[i]:
            return False
        x, y = self.pos(i)
        need = self.via_drill / 2 + self.hole_gap
        if any(math.hypot(x - hx, y - hy) < need + hr for hx, hy, hr in self.holes):
            return False  # hole-to-hole spacing, also between vias of the same net
        ix, iy = i % self.nx, i // self.nx
        k = self.via_extra
        for dy in range(-k, k + 1):
            for dx in range(-k, k + 1):
                jx, jy = ix + dx, iy + dy
                if not (0 <= jx < self.nx and 0 <= jy < self.ny):
                    return False
                j = jy * self.nx + jx
                if not (self.free(net, 0, j) and self.free(net, 1, j)):
                    return False
        return True

    def search(self, net, sources, targets, tbox=None, max_cost=1e18, penalty=None, vias=True):
        """A* from sources to targets: a set of (layer, cell), or a callable goal(layer, cell)
        (then plain Dijkstra, no tbox). penalty(layer, cell): extra cost of entering a cell."""
        if callable(targets):
            goal, h = targets, (lambda i: 0.0)
        else:
            goal = targets.__contains__
            tx0, ty0, tx1, ty1 = tbox

            def h(i):
                ix, iy = i % self.nx, i // self.nx
                dx = max(tx0 - ix, 0, ix - tx1)
                dy = max(ty0 - iy, 0, iy - ty1)
                return max(dx, dy) + 0.414 * min(dx, dy)

        best, came, heap = {}, {}, []
        for s in sources:
            best[s] = 0.0
            heapq.heappush(heap, (h(s[1]), 0.0, s))
        while heap:
            f, g, (li, i) = heapq.heappop(heap)
            if g > max_cost:
                return None
            if goal((li, i)):
                path = [(li, i)]
                while path[-1] in came:
                    path.append(came[path[-1]])
                return path[::-1]
            if g > best.get((li, i), 1e18):
                continue
            ix, iy = i % self.nx, i // self.nx
            steps = []
            for dx, dy, c in DIRS:
                jx, jy = ix + dx, iy + dy
                if 0 <= jx < self.nx and 0 <= jy < self.ny:
                    j = jy * self.nx + jx
                    if self.free(net, li, j) and (dx == 0 or dy == 0 or (
                            self.free(net, li, iy * self.nx + jx) and self.free(net, li, jy * self.nx + ix))):
                        steps.append(((li, j), c))
            if vias and self.via_ok(net, i):
                steps.append(((1 - li, i), VIA_COST))
            for node, c in steps:
                ng = g + c + (penalty(*node) if penalty else 0)
                if ng < best.get(node, 1e18):
                    best[node] = ng
                    came[node] = (li, i)
                    heapq.heappush(heap, (ng + h(node[1]), ng, node))
        return None


class Pieces:
    """Connected pieces of one net: pads, tracks and vias joined by touching copper."""

    def __init__(self, board, net):
        self.items = [p for p in board.GetPads() if p.GetNetname() == net and p.IsOnCopperLayer()]
        self.items += [t for t in board.GetTracks() if t.GetNetname() == net]
        n = len(self.items)
        self.parent = list(range(n))
        for a in range(n):
            for b in range(a + 1, n):
                if self._touch(self.items[a], self.items[b]):
                    self.union(a, b)

    def find(self, a):
        while self.parent[a] != a:
            self.parent[a] = self.parent[self.parent[a]]
            a = self.parent[a]
        return a

    def union(self, a, b):
        self.parent[self.find(a)] = self.find(b)

    @staticmethod
    def _points(it):
        if it.Type() == pcbnew.PCB_TRACE_T:
            return [it.GetStart(), it.GetEnd()]
        return [it.GetPosition()]

    def _touch(self, a, b):
        pa, pb = a.Type() == pcbnew.PCB_PAD_T, b.Type() == pcbnew.PCB_PAD_T
        if pa and pb:
            same = a.GetParentFootprint() == b.GetParentFootprint() and a.GetNumber() == b.GetNumber()
            custom = pcbnew.PAD_SHAPE_CUSTOM in (a.GetShape(), b.GetShape())  # coil spiral joins its pads
            return same and (custom or a.GetBoundingBox().Intersects(b.GetBoundingBox()))
        if pa or pb:
            pad, other = (a, b) if pa else (b, a)
            if other.Type() == pcbnew.PCB_TRACE_T and not pad.IsOnLayer(other.GetLayer()):
                return False
            box = pad.GetBoundingBox()
            return any(box.Contains(p) for p in self._points(other))
        both = pcbnew.PCB_TRACE_T in (a.Type(), b.Type()) and a.Type() == b.Type()
        if both and a.GetLayer() != b.GetLayer():
            return False  # tracks on different layers only meet through a via
        for p in self._points(a):
            for q in self._points(b):
                if math.hypot(p.x - q.x, p.y - q.y) < pcbnew.FromMM(0.01):
                    return True
        for seg, pts in ((a, self._points(b)), (b, self._points(a))):
            if seg.Type() == pcbnew.PCB_TRACE_T:
                s, e = seg.GetStart(), seg.GetEnd()
                if any(_seg_dist(p.x, p.y, s.x, s.y, e.x, e.y) < seg.GetWidth() / 2 for p in pts):
                    return True
        return False

    def groups(self):
        out = {}
        for i, it in enumerate(self.items):
            out.setdefault(self.find(i), []).append(it)
        return list(out.values())


def _cells_of(router, items):
    """Cells a route may end on: inside pad copper on its layers, or on a track/via centre."""
    cells = set()
    for it in items:
        if it.Type() == pcbnew.PCB_PAD_T and it.GetShape() == pcbnew.PAD_SHAPE_CUSTOM:
            continue  # a coil spiral: connect at its terminal pads, never onto the spiral
        if it.Type() == pcbnew.PCB_PAD_T:
            box = it.GetBoundingBox()
            shrink = pcbnew.FromMM(0.05)
            for li, layer in enumerate(LAYERS):
                if not it.IsOnLayer(layer):
                    continue
                ix0 = int((box.GetLeft() + shrink - router.x0) // router.g + 1)
                ix1 = int((box.GetRight() - shrink - router.x0) // router.g)
                iy0 = int((box.GetTop() + shrink - router.y0) // router.g + 1)
                iy1 = int((box.GetBottom() - shrink - router.y0) // router.g)
                for iy in range(iy0, iy1 + 1):
                    for ix in range(ix0, ix1 + 1):
                        cells.add((li, iy * router.nx + ix))
                c = router.cell(it.GetPosition().x, it.GetPosition().y)
                if c is not None:
                    cells.add((li, c))
        elif it.Type() == pcbnew.PCB_VIA_T:
            c = router.cell(it.GetPosition().x, it.GetPosition().y)
            if c is not None:
                cells |= {(0, c), (1, c)}
        else:
            li = LAYERS.index(it.GetLayer())
            s, e = it.GetStart(), it.GetEnd()
            n = max(1, int(math.hypot(e.x - s.x, e.y - s.y) / router.g))
            for k in range(n + 1):
                c = router.cell(s.x + (e.x - s.x) * k / n, s.y + (e.y - s.y) * k / n)
                if c is not None:
                    cells.add((li, c))
    return cells


def _commit(router, board, net_name, path, src_items, dst_items):
    net = board.FindNet(net_name)
    new = []

    def track(li, a, b):
        if a == b:
            return
        t = pcbnew.PCB_TRACK(board)
        t.SetStart(pcbnew.VECTOR2I(int(a[0]), int(a[1])))
        t.SetEnd(pcbnew.VECTOR2I(int(b[0]), int(b[1])))
        t.SetWidth(router.width)
        t.SetLayer(LAYERS[li])
        t.SetNet(net)
        board.Add(t)
        new.append(t)

    # collapse straight runs into segments, vias at layer changes
    pts = [(li, router.pos(i)) for li, i in path]
    i = 1
    run_start = 0
    while i < len(pts):
        li0, p0 = pts[i - 1]
        li1, p1 = pts[i]
        if li1 != li0:  # via
            track(li0, pts[run_start][1], p0)
            v = pcbnew.PCB_VIA(board)
            v.SetPosition(pcbnew.VECTOR2I(int(p0[0]), int(p0[1])))
            v.SetWidth(router.via_d)
            v.SetDrill(router.via_drill)
            v.SetNet(net)
            board.Add(v)
            new.append(v)
            run_start = i
        elif i + 1 < len(pts) and pts[i + 1][0] == li1:
            d0 = (p1[0] - p0[0], p1[1] - p0[1])
            d1 = (pts[i + 1][1][0] - p1[0], pts[i + 1][1][1] - p1[1])
            if d0 != d1:
                track(li1, pts[run_start][1], p1)
                run_start = i
        i += 1
    track(pts[-1][0], pts[run_start][1], pts[-1][1])

    # tie the ends into pad centres so the joins are clean
    for end, items in ((pts[0], src_items), (pts[-1], dst_items)):
        li, p = end
        for it in items:
            if it.Type() == pcbnew.PCB_PAD_T and it.IsOnLayer(LAYERS[li]) and it.GetBoundingBox().Contains(
                    pcbnew.VECTOR2I(int(p[0]), int(p[1]))):
                c = it.GetPosition()
                track(li, p, (c.x, c.y))
                break
    for t in new:
        router.add_item(t)
    return len(new)


def fanout(board, pads, net="GND", max_mm=4.0):
    """From each pad, route to the nearest spot where a via fits and drop a via there
    (to reach the pour on the other layer). Returns the number of pads fanned out."""
    router = Router(board)
    done = 0
    for pad in pads:
        li = 0 if pad.IsOnLayer(pcbnew.F_Cu) else 1
        src = [(l, c) for l, c in _cells_of(router, [pad]) if l == li and router.free(net, l, c)]
        goal = (lambda node: node[0] == li and router.via_ok(net, node[1]))
        # one layer only: a via on the way would not be checked against the via at the end
        path = router.search(net, src, goal, max_cost=max_mm / GRID_MM, vias=False) if src else None
        if path is None:  # no room for a via of its own: run a track to an existing via of the net
            vias = [t for t in board.GetTracks() if t.Type() == pcbnew.PCB_VIA_T and t.GetNetname() == net]
            if vias and connect(board, net, [pad], vias):
                router = Router(board)
                done += 1
            else:
                print(f"  fanout: no via spot for {pad.GetParentFootprint().GetReference()} pad {pad.GetNumber()}")
            continue
        _commit(router, board, net, path, [pad], [])
        x, y = router.pos(path[-1][1])
        v = pcbnew.PCB_VIA(board)
        v.SetPosition(pcbnew.VECTOR2I(int(x), int(y)))
        v.SetWidth(router.via_d)
        v.SetDrill(router.via_drill)
        v.SetNet(board.FindNet(net))
        board.Add(v)
        router.add_item(v)
        done += 1
    return done


def connect(board, net, src_items, dst_items):
    """Route one connection between two given sets of copper items of a net. True on success."""
    router = Router(board)
    src = {s for s in _cells_of(router, src_items) if router.free(net, s[0], s[1])}
    dst = {s for s in _cells_of(router, dst_items) if router.free(net, s[0], s[1])}
    if not src or not dst:
        return False
    xs = [i % router.nx for _, i in dst]
    ys = [i // router.nx for _, i in dst]
    path = router.search(net, list(src), dst, (min(xs), min(ys), max(xs), max(ys)))
    if path is None:
        return False
    _commit(router, board, net, path, src_items, dst_items)
    return True


def _route_pair(router, net, src_items, dst_items, penalty=None):
    src = {s for s in _cells_of(router, src_items) if router.free(net, s[0], s[1])}
    dst = {s for s in _cells_of(router, dst_items) if router.free(net, s[0], s[1])}
    if not src or not dst:
        return None
    xs = [i % router.nx for _, i in dst]
    ys = [i // router.nx for _, i in dst]
    return router.search(net, list(src), dst, (min(xs), min(ys), max(xs), max(ys)), penalty=penalty)


def _blockers(router, loose, net, src_items, dst_items):
    """Nets whose tracks or vias stand in the way of the cheapest path that may cross them.
    loose: a router without any signal tracks, so only pads, keep-outs and skipped nets block."""
    path = _route_pair(loose, net, src_items, dst_items,
                       penalty=lambda li, i: 0 if router.free(net, li, i) else RIP_PENALTY)
    if path is None:
        return set()
    cells = set(path)
    k = router.via_extra
    for (l0, i), (l1, _) in zip(path, path[1:]):
        if l0 != l1:  # a via needs room on both layers
            ix, iy = i % router.nx, i // router.nx
            cells |= {(l, (iy + dy) * router.nx + ix + dx) for l in (0, 1)
                      for dy in range(-k, k + 1) for dx in range(-k, k + 1)}
    return {n for n, own in router.own.items() if n != net and n not in router.skip
            and any(own.get(c, 0) > 0 for c in cells)}


def complete(board, skip_nets=("GND",), first=()):
    """Route every open connection the board still has, nets in `first` before the rest. A connection
    that finds no way through rips up the signal nets in its way and they are routed again after it.
    Returns (routed count, list of nets that failed)."""
    router = Router(board, skip_nets)
    nets = sorted({p.GetNetname() for p in board.GetPads() if p.GetNetname()} - set(skip_nets))
    nets = [n for n in nets if not n.startswith("unconnected-")]
    queue = [n for n in first if n in nets] + [n for n in nets if n not in first]
    routed, failed, ripups = 0, [], 0
    loose = None                                  # built on the first rip-up: signal tracks left out
    tries = {}                                    # connections made per net: a guard against loops
    while queue:
        net = queue.pop(0)
        while True:
            groups = Pieces(board, net).groups()
            if len(groups) < 2:
                break
            tries[net] = tries.get(net, 0) + 1
            if tries[net] > 3 * len(groups) + 10:
                print(f"  {net}: pieces do not merge, giving up", flush=True)
                failed.append(net)
                break
            # closest pair of pieces, by pad/track point distance
            best = None
            for a in range(len(groups)):
                for b in range(a + 1, len(groups)):
                    pa = [q for it in groups[a] for q in Pieces._points(it)]
                    pb = [q for it in groups[b] for q in Pieces._points(it)]
                    d = min(math.hypot(p.x - q.x, p.y - q.y) for p in pa for q in pb)
                    if best is None or d < best[0]:
                        best = (d, a, b)
            _, a, b = best
            path = _route_pair(router, net, groups[a], groups[b])
            if path is None and ripups < MAX_RIPUPS:
                loose = loose or Router(board, skip_nets, set(nets))
                ripped = _blockers(router, loose, net, groups[a], groups[b])
                if ripped:
                    ripups += 1
                    print(f"  rip-up {ripups}: {sorted(ripped)} for {net}", flush=True)
                    for t in list(board.GetTracks()):
                        if t.GetNetname() in ripped:
                            router.remove_item(t)
                            board.Remove(t)
                    path = _route_pair(router, net, groups[a], groups[b])
                    queue[0:0] = [n for n in sorted(ripped) if n not in queue]
                    failed = [n for n in failed if n not in ripped]
            if path is None:
                failed.append(net)
                break
            _commit(router, board, net, path, groups[a], groups[b])
            routed += 1
    return routed, failed
