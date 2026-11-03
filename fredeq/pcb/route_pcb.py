"""Autoroute the Fredeq board with Freerouting, then add GND pours and stitching vias.

GND is left out of the routing job: every GND pad is on the top layer and lands in
the top pour, and stitching vias tie the top and bottom pours together. (A filled
zone exported to Freerouting acts as an obstacle for all other nets.)

Run with KiCad's Python on a fresh board from gen_pcb.py, pointing at the Freerouting jar
(2.1.0 runs on Java 21; 2.5 needs Java 25):
    "C:/Program Files/KiCad/10.0/bin/python.exe" gen_pcb.py
    "C:/Program Files/KiCad/10.0/bin/python.exe" route_pcb.py path/to/freerouting-2.1.0.jar
"""
import math
import os
import random
import re
import subprocess
import sys
import time

import pcbnew

from gen_pcb import COIL_NO_POUR, rule_area
from maze import clear_of_pads, complete, connect, fanout

HERE = os.path.dirname(os.path.abspath(__file__))
KICAD_BIN = os.path.dirname(sys.executable)
PCB = os.path.join(HERE, "fredeq.kicad_pcb")
WORK = os.path.join(os.environ.get("TEMP", HERE), "fredeq_route")
PASSES = 60
TIMEOUT_S = 900
ATTEMPTS = 8
POUR_CLEARANCE, POUR_MIN_WIDTH = 0.25, 0.2
UNROUTED_NETS = ["GND"]           # connected by the pours instead
ROUTE_FIRST = ["COIL1_A", "COIL1_B", "COIL0_A", "COIL0_B", "SCL", "SDA", "LDC_INT", "LDC_SD",
               "SWDIO", "SWCLK", "NRESET", "+3V3", "VBAT", "VBUS"]  # sensitive and short nets first
STITCH_PITCH = 2.0                # grid for GND stitching vias (mm)
STITCH_CLEAR = 0.55               # via edge to other copper / holes / board edge (mm, incl. via radius)
PRE_FANOUT = ("U", "J", "C", "R", "D", "SW")  # GND pads that get a via before the signals are routed
NO_STITCH =["U1", "J1", "J2", "J3", "L1", "L2"]  # never put vias under these footprints


def P(x, y):
    return pcbnew.VECTOR2I(pcbnew.FromMM(100 + x), pcbnew.FromMM(100 - y))


def gnd_pour(board, layer):
    z = pcbnew.ZONE(board)
    z.SetLayer(layer)
    z.SetNet(board.FindNet("GND"))
    z.SetZoneName(f"GND_{'top' if layer == pcbnew.F_Cu else 'bottom'}")
    z.SetLocalClearance(pcbnew.FromMM(POUR_CLEARANCE))
    z.SetMinThickness(pcbnew.FromMM(POUR_MIN_WIDTH))
    z.SetPadConnection(pcbnew.ZONE_CONNECTION_FULL)  # small SMD pads: solid joins reach where spokes can't
    z.SetIslandRemovalMode(pcbnew.ISLAND_REMOVAL_MODE_ALWAYS)  # drop pour fragments cut off by tracks
    z.SetAssignedPriority(0)
    o = z.Outline()
    o.NewOutline()
    for x, y in ((25, -5), (70, -5), (70, 35), (25, 35)):  # clipped to the board edge when filled
        p = P(x, y)
        o.Append(p.x, p.y)
    board.Add(z)


def strip_nets(dsn, nets):
    """Remove nets from the DSN network so Freerouting leaves them alone."""
    text = open(dsn, encoding="utf8").read()
    for net in nets:
        text = re.sub(r"\(net " + re.escape(net) + r"\s*\(pins[^)]*\)\s*\)", "", text)
        text = re.sub(r"(\(class [^\s()]+[^()]*?)\s" + re.escape(net) + r"(?=[\s)])", r"\1", text)
    open(dsn, "w", encoding="utf8").write(text)


def seg_dist(p, a, b):
    ax, ay, bx, by, px, py = a.x, a.y, b.x, b.y, p.x, p.y
    dx, dy = bx - ax, by - ay
    t = 0.0 if dx == dy == 0 else max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    return math.hypot(px - (ax + t * dx), py - (ay + t * dy))


def box_dist(p, box):
    dx = max(box.GetLeft() - p.x, 0, p.x - box.GetRight())
    dy = max(box.GetTop() - p.y, 0, p.y - box.GetBottom())
    return math.hypot(dx, dy)


def stitch(board):
    gnd = board.FindNet("GND")
    ds = board.GetDesignSettings()
    via_d, via_drill = ds.GetCurrentViaSize(), ds.GetCurrentViaDrill()
    clear = pcbnew.FromMM(STITCH_CLEAR) + via_d / 2
    edge = board.GetBoardEdgesBoundingBox()
    outline = pcbnew.SHAPE_POLY_SET()
    board.GetBoardPolygonOutlines(outline, True)
    blocked = [fp.GetBoundingBox(False) for fp in board.GetFootprints() if fp.GetReference() in NO_STITCH]
    keepouts = [z for z in board.Zones() if z.GetIsRuleArea()]
    for fp in board.GetFootprints():
        keepouts += [z for z in fp.Zones() if z.GetIsRuleArea()]
    others = [p for p in board.GetPads() if p.GetNetname() != "GND" and p.IsOnCopperLayer()]
    holes = [p for p in board.GetPads() if p.GetAttribute() == pcbnew.PAD_ATTRIB_NPTH]
    tracks = [t for t in board.GetTracks() if t.Type() == pcbnew.PCB_TRACE_T and t.GetNetname() != "GND"]
    others += [v for v in board.GetTracks() if v.Type() == pcbnew.PCB_VIA_T and v.GetNetname() != "GND"]
    drilled = [v.GetPosition() for v in board.GetTracks() if v.Type() == pcbnew.PCB_VIA_T]  # GND fan-out too
    hole_gap = via_drill + pcbnew.FromMM(0.25)
    added = 0
    step = pcbnew.FromMM(STITCH_PITCH)
    y = edge.GetTop() + step // 2
    while y < edge.GetBottom():
        x = edge.GetLeft() + step // 2
        while x < edge.GetRight():
            p = pcbnew.VECTOR2I(int(x), int(y))
            ring = [pcbnew.VECTOR2I(int(x + clear * math.cos(a)), int(y + clear * math.sin(a)))
                    for a in (k * math.pi / 4 for k in range(8))]
            ok = all(outline.Contains(q) for q in [p] + ring)  # inside the board, clear of the edge
            ok = ok and not any(b.Contains(p) for b in blocked)
            ok = ok and not any(z.Outline().Contains(p) for z in keepouts)
            ok = ok and all(box_dist(p, q.GetBoundingBox()) > clear for q in others + holes)
            ok = ok and all(seg_dist(p, t.GetStart(), t.GetEnd()) > clear + t.GetWidth() / 2 for t in tracks)
            ok = ok and clear_of_pads(board, p, via_d)
            ok = ok and all(math.hypot(p.x - h.x, p.y - h.y) > hole_gap for h in drilled)
            if ok:
                v = pcbnew.PCB_VIA(board)
                v.SetPosition(p)
                v.SetWidth(via_d)
                v.SetDrill(via_drill)
                v.SetNet(gnd)
                board.Add(v)
                added += 1
            x += step
        y += step
    return added


def free_spot(board, p, clear):
    """True if a GND via at p keeps `clear` from other-net copper, holes, keep-outs and the board edge."""
    outline = pcbnew.SHAPE_POLY_SET()
    board.GetBoardPolygonOutlines(outline, True)
    ring = [pcbnew.VECTOR2I(int(p.x + clear * math.cos(a)), int(p.y + clear * math.sin(a)))
            for a in (k * math.pi / 4 for k in range(8))]
    if not all(outline.Contains(q) for q in [p] + ring):
        return False
    zones = [z for z in board.Zones() if z.GetIsRuleArea()]
    for fp in board.GetFootprints():
        zones += [z for z in fp.Zones() if z.GetIsRuleArea()]
    if any(z.Outline().Contains(p) for z in zones):
        return False
    if not clear_of_pads(board, p, board.GetDesignSettings().GetCurrentViaSize()):
        return False
    for q in board.GetPads():
        if q.IsOnCopperLayer() and (q.GetNetname() != "GND" or q.GetAttribute() == pcbnew.PAD_ATTRIB_NPTH) and \
                box_dist(p, q.GetBoundingBox()) <= clear:
            return False
    for t in board.GetTracks():
        if t.GetNetname() == "GND":
            continue
        if t.Type() == pcbnew.PCB_VIA_T:
            if box_dist(p, t.GetBoundingBox()) <= clear:
                return False
        elif seg_dist(p, t.GetStart(), t.GetEnd()) <= clear + t.GetWidth() / 2:
            return False
    return True


def unstitched_pads(board):
    """GND pads that sit in a piece of the top pour with no via to the bottom pour."""
    vias = [t.GetPosition() for t in board.GetTracks() if t.Type() == pcbnew.PCB_VIA_T and t.GetNetname() == "GND"]
    vias += [p.GetPosition() for p in board.GetPads() if p.GetNetname() == "GND" and p.GetAttribute() == pcbnew.PAD_ATTRIB_PTH]
    pads = [p for p in board.GetPads() if p.GetNetname() == "GND" and p.IsOnLayer(pcbnew.F_Cu)
            and p.GetAttribute() == pcbnew.PAD_ATTRIB_SMD]
    out = []
    for z in [z for z in board.Zones() if not z.GetIsRuleArea() and z.GetNetname() == "GND"
              and z.GetLayer() == pcbnew.F_Cu]:
        polys = z.GetFilledPolysList(pcbnew.F_Cu)
        for k in range(polys.OutlineCount()):
            if not any(polys.Contains(v, k) for v in vias):
                inside = [p for p in pads if polys.Contains(p.GetPosition(), k)]
                out += inside[:1]  # one via per piece is enough
    return out


def stitch_bare_fragments(board):
    """Pieces of the top pour with neither a via nor a GND pad: place a via inside where one fits."""
    gnd = board.FindNet("GND")
    ds = board.GetDesignSettings()
    via_d, via_drill = ds.GetCurrentViaSize(), ds.GetCurrentViaDrill()
    clear = pcbnew.FromMM(STITCH_CLEAR) + via_d / 2
    hole_gap = via_drill + pcbnew.FromMM(0.25)
    step = pcbnew.FromMM(0.1)
    vias = [t.GetPosition() for t in board.GetTracks() if t.Type() == pcbnew.PCB_VIA_T]
    holes = vias + [p.GetPosition() for p in board.GetPads() if p.GetDrillSize().x > 0]
    gnd_pads = [p.GetPosition() for p in board.GetPads() if p.GetNetname() == "GND"]
    added = 0
    for z in [z for z in board.Zones() if not z.GetIsRuleArea() and z.GetNetname() == "GND"
              and z.GetLayer() == pcbnew.F_Cu]:
        polys = z.GetFilledPolysList(pcbnew.F_Cu)
        for k in range(polys.OutlineCount()):
            if any(polys.Contains(v, k) for v in vias + gnd_pads):
                continue
            box = polys.Outline(k).BBox()
            spot, y = None, box.GetTop()
            while spot is None and y <= box.GetBottom():
                x = box.GetLeft()
                while x <= box.GetRight():
                    p = pcbnew.VECTOR2I(int(x), int(y))
                    if polys.Contains(p, k) and free_spot(board, p, clear) and \
                            all(math.hypot(p.x - h.x, p.y - h.y) > hole_gap for h in holes):
                        spot = p
                        break
                    x += step
                y += step
            if spot is None:
                print("  bare pour piece: no room for a via")
                continue
            v = pcbnew.PCB_VIA(board)
            v.SetPosition(spot)
            v.SetWidth(via_d)
            v.SetDrill(via_drill)
            v.SetNet(gnd)
            board.Add(v)
            vias.append(spot)
            holes.append(spot)
            added += 1
    return added


def join_pour_islands(board):
    """Treat the GND pour pieces on both layers as nodes joined by GND vias (and PTH pads); every
    group not connected to the main one gets a via at a spot inside it and inside a main piece on
    the other layer. Returns the number of vias added."""
    gnd = board.FindNet("GND")
    ds = board.GetDesignSettings()
    via_d, via_drill = ds.GetCurrentViaSize(), ds.GetCurrentViaDrill()
    clear = pcbnew.FromMM(STITCH_CLEAR) + via_d / 2
    hole_gap = via_drill + pcbnew.FromMM(0.25)
    step = pcbnew.FromMM(0.1)
    zones = {z.GetLayer(): z for z in board.Zones() if not z.GetIsRuleArea() and z.GetNetname() == "GND"}
    polys = {l: z.GetFilledPolysList(l) for l, z in zones.items()}
    nodes = [(l, k) for l in polys for k in range(polys[l].OutlineCount())]
    parent = {n: n for n in nodes}

    def find(n):
        while parent[n] != n:
            parent[n] = parent[parent[n]]
            n = parent[n]
        return n

    links = [t.GetPosition() for t in board.GetTracks() if t.Type() == pcbnew.PCB_VIA_T and t.GetNetname() == "GND"]
    links += [p.GetPosition() for p in board.GetPads() if p.GetNetname() == "GND" and p.GetDrillSize().x > 0]
    for p in links:
        hit = [(l, k) for l in polys for k in range(polys[l].OutlineCount()) if polys[l].Contains(p, k)]
        for a, b in zip(hit, hit[1:]):
            parent[find(a)] = find(b)
    area = {}
    for n in nodes:
        area[find(n)] = area.get(find(n), 0) + polys[n[0]].Outline(n[1]).Area()
    main = max(area, key=area.get)
    holes = [t.GetPosition() for t in board.GetTracks() if t.Type() == pcbnew.PCB_VIA_T]
    holes += [p.GetPosition() for p in board.GetPads() if p.GetDrillSize().x > 0]
    added = 0
    for root in [r for r in area if r != main]:
        members = [n for n in nodes if find(n) == root]
        placed = False
        for l, k in members:
            other = pcbnew.B_Cu if l == pcbnew.F_Cu else pcbnew.F_Cu
            mains = [kk for kk in range(polys[other].OutlineCount()) if find((other, kk)) == main] if other in polys else []
            box = polys[l].Outline(k).BBox()
            y = box.GetTop()
            while not placed and y <= box.GetBottom():
                x = box.GetLeft()
                while x <= box.GetRight():
                    p = pcbnew.VECTOR2I(int(x), int(y))
                    if polys[l].Contains(p, k) and any(polys[other].Contains(p, kk) for kk in mains) and \
                            free_spot(board, p, clear) and all(math.hypot(p.x - h.x, p.y - h.y) > hole_gap for h in holes):
                        v = pcbnew.PCB_VIA(board)
                        v.SetPosition(p)
                        v.SetWidth(via_d)
                        v.SetDrill(via_drill)
                        v.SetNet(gnd)
                        board.Add(v)
                        holes.append(p)
                        added += 1
                        placed = True
                        break
                    x += step
                y += step
            if placed:
                break
        if not placed:  # no room for a via: route a GND track from a pad in the island to a main via
            island_pads = [p for p in board.GetPads() if p.GetNetname() == "GND" and p.IsOnCopperLayer()
                           and any(p.IsOnLayer(l) and polys[l].Contains(p.GetPosition(), k) for l, k in members)]
            main_vias = [t for t in board.GetTracks() if t.Type() == pcbnew.PCB_VIA_T and t.GetNetname() == "GND"
                         and any(polys[l].Contains(t.GetPosition(), k) for l, k in nodes if find((l, k)) == main)]
            if island_pads and main_vias and connect(board, "GND", island_pads[:1], main_vias):
                added += 1
            else:
                print(f"  GND island ({len(members)} pour pieces) could not be joined")
    return added


def isolated_gnd_pads(board):
    """GND pads that DRC reports as unconnected."""
    rpt = os.path.join(WORK, "drc.rpt")
    subprocess.run([os.path.join(KICAD_BIN, "kicad-cli.exe"), "pcb", "drc", "-o", rpt, PCB],
                   capture_output=True)
    text = open(rpt, encoding="utf8").read()
    pads = []
    for num, ref in sorted(set(re.findall(r"Pad (\S+) \[GND\] of (\S+)", text))):
        fp = board.FindFootprintByReference(ref)
        pads += [q for q in fp.Pads() if q.GetNumber() == num] if fp else []
    return pads


def route(board_file, ses, order):
    board = pcbnew.LoadBoard(board_file)
    if ses and not pcbnew.ImportSpecctraSES(board, ses):
        raise RuntimeError("SES import failed")
    # GND fan-out first, before signals can fence the GND pads in (vias stay off the pads)
    gnd_pads = [p for p in board.GetPads() if p.GetNetname() == "GND" and p.IsOnLayer(pcbnew.F_Cu)
                and p.GetAttribute() == pcbnew.PAD_ATTRIB_SMD
                and p.GetParentFootprint().GetReference().startswith(PRE_FANOUT)]
    fanout(board, gnd_pads)
    routed, failed = complete(board, UNROUTED_NETS, order)
    return board, routed, failed


def main():
    mode = sys.argv[1]
    os.makedirs(WORK, exist_ok=True)
    dsn, ses = os.path.join(WORK, "fredeq.dsn"), os.path.join(WORK, "fredeq.ses")
    unrouted = os.path.join(WORK, "fredeq_unrouted.kicad_pcb")

    board = pcbnew.LoadBoard(PCB)
    if any(not z.GetIsRuleArea() for z in board.Zones()):
        raise RuntimeError("board already routed: run gen_pcb.py first for a fresh, unrouted board")
    board.Save(unrouted)
    if mode != "--maze-only":  # Freerouting first, our grid router finishes what it leaves open
        if not pcbnew.ExportSpecctraDSN(board, dsn):
            raise RuntimeError("DSN export failed")
        strip_nets(dsn, UNROUTED_NETS)
        if "--reuse" not in sys.argv:  # --reuse: import the last Freerouting result instead of routing again
            cmd = ["java", "-jar", mode] if mode.endswith(".jar") else [mode]
            cmd += ["-de", dsn, "-do", ses, "-mp", str(PASSES), "--gui.enabled=false"]
            subprocess.run(cmd, check=True, timeout=TIMEOUT_S)
    else:
        ses = None

    # sequential routing has no rip-up: if nets fail, start again with them first, keep the best
    # and when a set of failures comes back, shuffle the order instead of flipping between two
    order, best, seen = list(ROUTE_FIRST), None, set()
    rng = random.Random(1)
    for attempt in range(ATTEMPTS):
        t0 = time.time()
        b, routed, failed = route(unrouted, ses, order)
        print(f"attempt {attempt + 1}: {routed} connections routed, failed: {failed or 'none'} "
              f"({time.time() - t0:.0f} s)", flush=True)
        if best is None or len(failed) < len(best[1]):
            best = (b, failed)
        if not failed:
            break
        if frozenset(failed) in seen:
            rng.shuffle(order)
        seen.add(frozenset(failed))
        order = list(dict.fromkeys(failed + order))
    board = best[0]

    for i, r in enumerate(COIL_NO_POUR):
        rule_area(board, r, f"coil_no_pour_{i}", tracks=False, pour=True)
    gnd_pour(board, pcbnew.F_Cu)
    gnd_pour(board, pcbnew.B_Cu)
    vias = stitch(board)
    pcbnew.ZONE_FILLER(board).Fill(board.Zones())
    board.Save(PCB)
    handled = set()  # a pad joined by a track to a via elsewhere still sits in a via-less pour piece
    for _ in range(4):  # pour pieces and GND pads the stitching grid missed get a via
        bare = stitch_bare_fragments(board)
        pads = [p for p in unstitched_pads(board) + isolated_gnd_pads(board)
                if (p.GetParentFootprint().GetReference(), p.GetNumber()) not in handled]
        handled |= {(p.GetParentFootprint().GetReference(), p.GetNumber()) for p in pads}
        if not pads and not bare:
            joined = join_pour_islands(board)
            if not joined:
                break
            print(f"GND pour islands joined: {joined}")
            pcbnew.ZONE_FILLER(board).Fill(board.Zones())
            board.Save(PCB)
            continue
        if pads:
            print(f"GND pads needing a via: {len(pads)}, fanned out: {fanout(board, pads)}")
        if bare:
            print(f"bare pour pieces stitched: {bare}")
        pcbnew.ZONE_FILLER(board).Fill(board.Zones())
        board.Save(PCB)
    tracks = [t for t in board.GetTracks() if t.Type() == pcbnew.PCB_TRACE_T]
    length = sum(pcbnew.ToMM(t.GetLength()) for t in tracks)
    print(f"routed: {len(tracks)} track segments ({length:.0f} mm), {vias} GND stitching vias")


if __name__ == "__main__":
    main()
