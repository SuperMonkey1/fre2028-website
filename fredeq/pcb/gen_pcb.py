"""Build the Fredeq rev A board from the schematic netlist: outline, placement, keep-outs.

Coordinates below are the CAD coordinates of loadcell_body.py (mm, top view, y up).
KiCad's y runs down, so a CAD point (x, y) lands at (100 + x, 100 - y) on the board.

Run with KiCad's Python:
    "C:/Program Files/KiCad/10.0/bin/python.exe" gen_pcb.py
"""
import json
import os
import subprocess
import xml.etree.ElementTree as ET

import pcbnew

HERE = os.path.dirname(os.path.abspath(__file__))
KICAD_BIN = r"C:\Program Files\KiCad\10.0\bin"
FP_ROOT = r"C:\Program Files\KiCad\10.0\share\kicad\footprints"
SCH = os.path.join(HERE, "fredeq.kicad_sch")
OUT = os.path.join(HERE, "fredeq.kicad_pcb")

BOARD_T = 1.0
PCB_X, PCB_Y, PCB_R = (29.5, 62.5), (1.0, 31.0), 2.0
USB_TAB = (39.5, 52.5, -0.4)     # x0, x1, y: tab so the USB-C mouth sits past the plate edge (y = 0)

# ref: (x, y, rotation) in CAD coordinates
PLACE = {
    "U1": (40.9, 23.8, 0),       # MDBT42Q, antenna end towards +y (PCB edge), pads clear of the ref coil
    # middle column: LDC1612 level with module pins 26-30 (straight I2C/INT/SD lines), decoupling around it
    "U2": (50.0, 20.0, 0), "C3": (50.0, 16.6, 0), "C4": (53.0, 17.0, 270),
    "L1": (57.0, 20.0, 0),       # sense coil on the slot 2 edge
    "C1": (56.0, 27.0, 90),
    "L2": (32.4, 20.0, 0),       # reference coil over the left block
    "C2": (33.4, 26.9, 0),
    # top of the middle column: TMP117 and I2C pull-ups, a short hop from the module's and the
    # LDC1612's I2C pins (x 46.5-48 left free for the SWD lines leaving the module upwards)
    "U4": (51.0, 25.6, 90), "C5": (51.0, 27.6, 0),
    "R3": (48.6, 24.6, 0), "R2": (48.6, 26.6, 0),
    # top-right: SWD test pads in a row, reached along the top edge (SWDIO, SWCLK, NRESET, +3V3, GND)
    "TP2": (52.8, 29.9, 0), "TP3": (54.85, 29.9, 0), "TP4": (56.9, 29.9, 0),
    "TP1": (58.95, 29.9, 0), "TP5": (61.0, 29.9, 0),     # TP5 clear of the rounded corner
    # bottom: USB-C in the middle, button and dividers left, LEDs centre, power right
    "J1": (46.0, 1.45, 0),       # USB-C: metal shell sticks out 1.6 mm past the tab edge, mouth at y = -2.0,
                                 # flush with the flat facet on the housing
    "R5": (45.5, 8.4, 90), "R6": (46.5, 8.4, 90), "D1": (43.4, 9.1, 90),
    "SW1": (36.6, 7.9, 90),      # pressed by a printed plunger in the housing
    "R9": (37.0, 14.25, 90), "R10": (38.2, 14.25, 270), "C10": (39.4, 14.25, 270),  # GND pads down,
    "R11": (40.6, 14.25, 90), "R12": (41.8, 14.25, 270),                             # away from U1
    "D2": (48.0, 13.0, 0), "R8": (48.0, 11.3, 0),
    "D3": (51.0, 13.0, 0), "R13": (51.0, 11.3, 0),
    "J2": (58.8, 4.4, 0),
    "U3": (55.0, 10.0, 0), "R7": (53.6, 12.8, 0), "C6": (53.4, 6.6, 90), "C7": (57.9, 9.6, 90),
    "U5": (60.4, 10.2, 90), "C8": (60.6, 12.9, 0), "C9": (57.6, 13.0, 0),
}
HOLES = [("H1", "Hole_Pin_2.05mm", 31.5, 3.5), ("H2", "Hole_M2_Screw", 31.5, 7.5),
         ("H3", "Hole_M2_Screw", 31.5, 12.0), ("H4", "Hole_Pin_2.05mm", 31.5, 28.5)]

# keep-outs (CAD x0, y0, x1, y1): no tracks/vias over the coils (kept 0.3 mm clear of the coil
# terminals), and no copper pour near them. KiCad exports every rule area to Freerouting as a
# full keep-out, so the no-pour areas are only added by route_pcb.py after routing.
COIL_NO_TRACKS = [(53.6, 15.1, 60.8, 24.65), (29.9, 14.6, 35.1, 25.2)]
COIL_NO_POUR = [(52.9, 14.4, 61.4, 26.0), (29.5, 14.1, 35.4, 26.4)]

# design rules (JLCPCB 2-layer capabilities, with margin), written to the project file
RULES = {
    "min_clearance": 0.15, "min_copper_edge_clearance": 0.3, "min_track_width": 0.13,
    "min_through_hole_diameter": 0.3, "min_via_diameter": 0.5, "min_via_annular_width": 0.1,
    "min_hole_clearance": 0.25, "min_hole_to_hole": 0.25,
}
NETCLASSES = [  # name, track, clearance, nets
    ("Default", 0.2, 0.15, []),
    ("Power", 0.3, 0.15, ["VBUS", "VBAT", "+3V3", "GND"]),
]
PROJECT = os.path.join(HERE, "fredeq.kicad_pro")
DRU = os.path.join(HERE, "fredeq.kicad_dru")
# inside a coil the top spiral ends on the centre via: an intended net-tie join, not a violation
CUSTOM_RULES = "".join(
    f'(rule "coil {ref} centre via"\n\t(condition "A.memberOfFootprint(\'{ref}\') && B.memberOfFootprint(\'{ref}\')")\n'
    f'\t(constraint hole_clearance (min 0mm))\n\t(constraint clearance (min 0mm)))\n'
    for ref in ("L1", "L2"))


def P(x, y):
    return pcbnew.VECTOR2I(pcbnew.FromMM(100 + x), pcbnew.FromMM(100 - y))


def netlist():
    xml = os.path.join(os.environ.get("TEMP", HERE), "fredeq_netlist.xml")
    subprocess.run([os.path.join(KICAD_BIN, "kicad-cli.exe"), "sch", "export", "netlist",
                    "--format", "kicadxml", "-o", xml, SCH], check=True, capture_output=True)
    root = ET.parse(xml).getroot()
    comps = {}
    for c in root.iter("comp"):
        comps[c.get("ref")] = {"value": c.findtext("value"), "footprint": c.findtext("footprint")}
    pad_net = {}
    for n in root.iter("net"):
        name = n.get("name").replace("/", "{slash}")  # KiCad escapes '/' in net names (unused pins: "AIN4/P0.28")
        for node in n.iter("node"):
            pad_net[(node.get("ref"), node.get("pin"))] = name
    return comps, pad_net


def load_fp(fpid):
    lib, name = fpid.split(":")
    path = os.path.join(HERE, "Fredeq.pretty") if lib == "Fredeq" else os.path.join(FP_ROOT, lib + ".pretty")
    fp = pcbnew.FootprintLoad(path, name)
    if fp is None:
        raise RuntimeError(f"footprint not found: {fpid}")
    fp.SetFPID(pcbnew.LIB_ID(lib, name))
    return fp


def edge_line(board, a, b):
    s = pcbnew.PCB_SHAPE(board)
    s.SetShape(pcbnew.SHAPE_T_SEGMENT)
    s.SetStart(P(*a))
    s.SetEnd(P(*b))
    s.SetLayer(pcbnew.Edge_Cuts)
    s.SetWidth(pcbnew.FromMM(0.05))
    board.Add(s)


def edge_arc(board, start, mid, end):
    s = pcbnew.PCB_SHAPE(board)
    s.SetShape(pcbnew.SHAPE_T_ARC)
    s.SetArcGeometry(P(*start), P(*mid), P(*end))
    s.SetLayer(pcbnew.Edge_Cuts)
    s.SetWidth(pcbnew.FromMM(0.05))
    board.Add(s)


def outline(board):
    (x0, x1), (y0, y1), r = PCB_X, PCB_Y, PCB_R
    tx0, tx1, ty = USB_TAB
    k = r * (1 - 0.5 ** 0.5)
    edge_line(board, (x0 + r, y0), (tx0, y0))
    edge_line(board, (tx0, y0), (tx0, ty))
    edge_line(board, (tx0, ty), (tx1, ty))
    edge_line(board, (tx1, ty), (tx1, y0))
    edge_line(board, (tx1, y0), (x1 - r, y0))
    edge_arc(board, (x1 - r, y0), (x1 - k, y0 + k), (x1, y0 + r))
    edge_line(board, (x1, y0 + r), (x1, y1 - r))
    edge_arc(board, (x1, y1 - r), (x1 - k, y1 - k), (x1 - r, y1))
    edge_line(board, (x1 - r, y1), (x0 + r, y1))
    edge_arc(board, (x0 + r, y1), (x0 + k, y1 - k), (x0, y1 - r))
    edge_line(board, (x0, y1 - r), (x0, y0 + r))
    edge_arc(board, (x0, y0 + r), (x0 + k, y0 + k), (x0 + r, y0))


def rule_area(board, rect, name, tracks, pour):
    z = pcbnew.ZONE(board)
    z.SetIsRuleArea(True)
    z.SetZoneName(name)
    ls = pcbnew.LSET()
    ls.AddLayer(pcbnew.F_Cu)
    ls.AddLayer(pcbnew.B_Cu)
    z.SetLayerSet(ls)
    z.SetDoNotAllowTracks(tracks)
    z.SetDoNotAllowVias(tracks)
    z.SetDoNotAllowZoneFills(pour)
    z.SetDoNotAllowPads(False)
    z.SetDoNotAllowFootprints(False)
    x0, y0, x1, y1 = rect
    o = z.Outline()
    o.NewOutline()
    for x, y in ((x0, y0), (x1, y0), (x1, y1), (x0, y1)):
        p = P(x, y)
        o.Append(p.x, p.y)
    board.Add(z)


def write_project():
    classes = [{"name": n, "track_width": t, "clearance": c, "via_diameter": 0.6, "via_drill": 0.3,
                "microvia_diameter": 0.3, "microvia_drill": 0.1, "diff_pair_width": 0.2, "diff_pair_gap": 0.25,
                "diff_pair_via_gap": 0.25, "wire_width": 6, "bus_width": 12, "line_style": 0,
                "pcb_color": "rgba(0, 0, 0, 0.000)", "schematic_color": "rgba(0, 0, 0, 0.000)",
                "priority": 2147483647 if n == "Default" else 0}
               for n, t, c, _ in NETCLASSES]
    patterns = [{"netclass": n, "pattern": net} for n, _, _, nets in NETCLASSES for net in nets]
    pro = {
        "board": {"design_settings": {"rules": RULES}},
        "meta": {"filename": "fredeq.kicad_pro", "version": 3},
        "net_settings": {"classes": classes, "meta": {"version": 4}, "net_colors": None,
                         "netclass_assignments": None, "netclass_patterns": patterns},
    }
    with open(PROJECT, "w", newline="\n") as f:
        json.dump(pro, f, indent=2)
    with open(DRU, "w", newline="\n") as f:
        f.write("(version 1)\n" + CUSTOM_RULES)


def main():
    write_project()
    comps, pad_net = netlist()
    board = pcbnew.CreateEmptyBoard()
    ds = board.GetDesignSettings()
    ds.SetCopperLayerCount(2)
    ds.SetBoardThickness(pcbnew.FromMM(BOARD_T))
    ds.m_TentViasFront = ds.m_TentViasBack = True  # no bare via copper facing the aluminium

    nets = {}
    for name in sorted(set(pad_net.values())):
        ni = pcbnew.NETINFO_ITEM(board, name)
        board.Add(ni)
        nets[name] = ni

    missing = [r for r in comps if r not in PLACE]
    if missing:
        raise RuntimeError(f"no placement for {missing}")
    for ref, info in comps.items():
        fp = load_fp(info["footprint"])
        fp.SetReference(ref)
        fp.SetValue(info["value"])
        x, y, rot = PLACE[ref]
        fp.SetPosition(P(x, y))
        fp.SetOrientationDegrees(rot)
        for pad in fp.Pads():
            net = pad_net.get((ref, pad.GetNumber()))
            if net:
                pad.SetNet(nets[net])
        for z in fp.Zones():  # the module's own keep-outs must not flag its own (unused) pads
            z.SetDoNotAllowPads(False)
        fp.Reference().SetVisible(False)  # too dense for silkscreen refs; they stay on F.Fab
        board.Add(fp)

    for ref, name, x, y in HOLES:
        fp = load_fp(f"Fredeq:{name}")
        fp.SetReference(ref)
        fp.SetPosition(P(x, y))
        fp.Reference().SetVisible(False)
        board.Add(fp)

    outline(board)
    for i, r in enumerate(COIL_NO_TRACKS):
        rule_area(board, r, f"coil_no_tracks_{i}", tracks=True, pour=True)

    board.Save(OUT)
    print(f"wrote {OUT}: {len(comps)} parts, {len(HOLES)} holes, {len(nets)} nets")


if __name__ == "__main__":
    main()
