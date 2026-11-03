"""Generate the Fredeq footprint library: the two sensing coils and the mounting holes.

Coils are two-layer rectangular spirals: B.Cu (facing the aluminium) winds inward,
a via pad in the middle, F.Cu mirrored so both layers carry current the same way
round (inductances add). Pads 1 and 2 are the terminals, joined by the spiral
copper, so the footprint is a net tie ("1,2").

Run with any Python 3:
    python gen_footprints.py
"""
import math
import os

HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.path.join(HERE, "Fredeq.pretty")

TRACE, PITCH = 0.13, 0.26        # JLCPCB 2-layer: 5 mil track / 5 mil gap
LEAD = 0.8                       # terminal pads sit this far outside the outer turn
PAD, DRILL = 0.6, 0.3

# name: (width, height, turns) in mm
COILS = {
    "Coil_Sense_6x9mm": (6.0, 9.0, 9),
    "Coil_Ref_4.4x10mm": (4.4, 10.0, 6),
}


def fp_header(name, descr, attrs, extra=""):
    return (f'(footprint "{name}"\n\t(version 20241229)\n\t(generator "fredeq_gen")\n\t(layer "F.Cu")\n'
            f'\t(descr "{descr}")\n'
            f'\t(property "Reference" "REF**" (at 0 -7 0) (layer "F.SilkS") (effects (font (size 0.8 0.8) (thickness 0.12))))\n'
            f'\t(property "Value" "{name}" (at 0 7 0) (layer "F.Fab") (effects (font (size 0.8 0.8) (thickness 0.12))))\n'
            f'\t(attr {attrs})\n{extra}')


def line(a, b, layer, width=TRACE):
    return (f'\t(fp_line (start {a[0]:.4f} {a[1]:.4f}) (end {b[0]:.4f} {b[1]:.4f}) '
            f'(stroke (width {width}) (type solid)) (layer "{layer}"))\n')


def rect(x0, y0, x1, y1, layer, width=0.05):
    return (f'\t(fp_rect (start {x0:.3f} {y0:.3f}) (end {x1:.3f} {y1:.3f}) '
            f'(stroke (width {width}) (type solid)) (fill no) (layer "{layer}"))\n')


def spiral_pad(num, layer, pts):
    """Custom SMD pad whose shape is the spiral itself, anchored at the outer terminal, so KiCad sees
    the copper as part of the pad (connectivity counts pads, not footprint graphics). No mask: covered."""
    ax, ay = pts[0]
    prims = "".join(f"\t\t\t(gr_line (start {p[0] - ax:.4f} {p[1] - ay:.4f}) (end {q[0] - ax:.4f} {q[1] - ay:.4f}) "
                    f"(width {TRACE}))\n" for p, q in zip(pts, pts[1:]))
    return (f'\t(pad "{num}" smd custom (at {ax:.4f} {ay:.4f}) (size {TRACE} {TRACE}) (layers "{layer}")\n'
            f'\t\t(options (clearance outline) (anchor circle))\n\t\t(primitives\n{prims}\t\t)\n\t)\n')


def via_pad(num, x, y):
    return (f'\t(pad "{num}" thru_hole circle (at {x:.4f} {y:.4f}) (size {PAD} {PAD}) (drill {DRILL}) '
            f'(layers "*.Cu") (remove_unused_layers no))\n')  # tented: no bare copper facing the aluminium


def spiral(w, h, turns):
    """Inward clockwise spiral (screen coords, y down) from the top-left outer corner; ends at the
    middle of the free inner area. Returns points and the x of that end point (mirror axis)."""
    a, b = w / 2, h / 2
    pts = [(-a, -b)]
    for i in range(turns):
        ai, bi = a - i * PITCH, b - i * PITCH
        pts += [(ai, -bi), (ai, bi), (-ai + PITCH, bi), (-ai + PITCH, -bi + PITCH)]
    an = a - turns * PITCH
    inner_left, inner_right = -an, a - (turns - 1) * PITCH
    xm = (inner_left + inner_right) / 2
    pts += [(xm, -b + turns * PITCH), (xm, 0.0)]
    return pts, xm


def length(pts):
    return sum(math.dist(p, q) for p, q in zip(pts, pts[1:]))


def coil(name, w, h, turns):
    a, b = w / 2, h / 2
    pts, xm = spiral(w, h, turns)
    if a - turns * PITCH < PAD / 2 + PITCH:
        raise ValueError(f"{name}: too many turns for the via pad")
    mirror = [(2 * xm - x, y) for x, y in pts]
    s = fp_header(name, f"PCB coil {w}x{h} mm, {turns} turns per layer on B.Cu + F.Cu, "
                        f"{TRACE} mm track, {PITCH} mm pitch",
                  "exclude_from_pos_files exclude_from_bom",
                  '\t(net_tie_pad_groups "1,2")\n')
    p1 = (pts[0][0], pts[0][1] - LEAD)
    p2 = (mirror[0][0], mirror[0][1] - LEAD)
    # each spiral is a custom pad (B.Cu = pad 1, F.Cu = pad 2), so the centre via (pad 1) and the
    # outer terminals are connected in KiCad's eyes; the net tie allows pad 2's spiral to touch it
    s += spiral_pad("1", "B.Cu", [p1] + pts)
    s += spiral_pad("2", "F.Cu", [p2] + mirror)
    s += via_pad("1", *p1) + via_pad("1", xm, 0.0) + via_pad("2", *p2)
    x0, x1 = min(-a, 2 * xm - a) - 0.25, max(a, 2 * xm + a) + 0.25
    s += rect(x0, -b - LEAD - 0.45, x1, b + 0.25, "F.CrtYd")
    s += rect(x0 + 0.1, -b + 0.1 - 0.0, x1 - 0.1, b + 0.15, "F.Fab", 0.1)
    s += ")\n"
    total = 2 * length(pts) + 2 * LEAD
    return s, total


def hole(name, drill, keep_d, descr):
    s = fp_header(name, descr, "board_only exclude_from_pos_files exclude_from_bom")
    s += (f'\t(pad "" np_thru_hole circle (at 0 0) (size {drill} {drill}) (drill {drill}) (layers "*.Cu" "*.Mask"))\n')
    s += f'\t(fp_circle (center 0 0) (end {keep_d / 2:.3f} 0) (stroke (width 0.05) (type solid)) (fill no) (layer "F.CrtYd"))\n'
    s += f'\t(fp_circle (center 0 0) (end {keep_d / 2:.3f} 0) (stroke (width 0.1) (type solid)) (fill no) (layer "F.Fab"))\n'
    return s + ")\n"


def main():
    os.makedirs(LIB, exist_ok=True)
    for name, (w, h, n) in COILS.items():
        text, total = coil(name, w, h, n)
        open(os.path.join(LIB, f"{name}.kicad_mod"), "w", newline="\n").write(text)
        print(f"{name}: {n} turns/layer, copper length {total:.0f} mm")
    open(os.path.join(LIB, "Hole_Pin_2.05mm.kicad_mod"), "w", newline="\n").write(
        hole("Hole_Pin_2.05mm", 2.05, 2.6, "NPTH for a 2 mm dowel pin (slip fit through the PCB)"))
    open(os.path.join(LIB, "Hole_M2_Screw.kicad_mod"), "w", newline="\n").write(
        hole("Hole_M2_Screw", 2.2, 4.4, "NPTH for an M2 screw, courtyard = screw head clearance"))
    table = ('(fp_lib_table\n\t(version 7)\n\t(lib (name "Fredeq") (type "KiCad") (uri "${KIPRJMOD}/Fredeq.pretty") '
             '(options "") (descr "Fredeq coils and mounting holes"))\n)\n')
    open(os.path.join(HERE, "fp-lib-table"), "w", newline="\n").write(table)


if __name__ == "__main__":
    main()
