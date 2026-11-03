"""Fredeq load cell body – compact pill-shaped aluminium S-beam, exported as STEP.

Topology follows the Tindeq Progressor (two slots from opposite edges, gauges on
the block between them), but the outline is a stadium and every size is driven
by the 2 kN rating instead of copied. Verify with FEA and a proof-load test.

Also exports the inductive-sensing assembly: sensor PCB pinned to the left block,
sense coil over the slot 2 edge, reference coil over solid metal, dowel pins,
M2 screws, 0.3 mm shims, placeholder components, battery envelope and a curved
two-part housing (3D-printable, also exported as STL).

The housing clamps the left block only and keeps clearance everywhere else, so
it never carries load past the sensor.

Run with FreeCAD's bundled Python:
    "C:/Program Files/FreeCAD 1.1/bin/python.exe" loadcell_body.py
"""
import os
import sys

FREECAD_BIN = r"C:\Program Files\FreeCAD 1.1\bin"
if FREECAD_BIN not in sys.path:
    sys.path.append(FREECAD_BIN)

import FreeCAD as App  # noqa: E402
import Import  # noqa: E402
import Part  # noqa: E402

V = App.Vector

# --- Parameters (mm) ------------------------------------------------------
W = 32.0            # pill width = 2 x end radius
C = 60.0            # distance between hole centres (room for housing around the holes)
T = 6.0             # plate thickness (7075-T6)

HOLE_D = 18.0       # carabiner holes, leaves (W - HOLE_D) / 2 = 7 mm edge
HOLE_EDGE_R = 1.5   # round-over on hole edges (sling/carabiner friendly), max T/2
OUTER_EDGE_R = 1.0  # round-over on the outer outline, top and bottom (hands, slings, anodising);
                    # slot edges stay sharp (deburr only): the sense coil reads the slot 2 edge

SLOT_W = 4.0        # bending slots, full radius at the closed end
SLOT_PITCH = 18.0   # slot centre-to-centre -> gauge block = SLOT_PITCH - SLOT_W wide
LIGAMENT = 12.0     # material left between slot end and the opposite edge

# Sensor PCB mounting, all in the left block between hole and slot 1.
# Placed where FEA shows low stress, away from the top ligament.
MOUNT_X = 31.5
PIN_YS = (3.5, 28.5)        # dowel pins, max spacing for location
SCREW_YS = (7.5, 12.0)      # M2 screws, in the low-stress lower region
PIN_D, PIN_DEPTH, PIN_LEN = 2.0, 3.0, 4.0
TAP_D, TAP_DEPTH = 1.6, 4.5  # M2 tap drill, blind
SHIM_T, SHIM_OD = 0.3, 4.0   # spacers set the coil-to-metal gap

PCB_X = (29.5, 62.5)        # between the holes, outside the housing's hole keep-out
PCB_Y = (1.0, 31.0)
PCB_TAB = (39.5, 52.5, -0.4)  # x0, x1, y: tab carrying the USB-C mouth past the plate edge
PCB_T = 1.0
PCB_R = 2.0

SENSE_COIL = (57.0, 20.0, 6.0, 9.0, 9)   # on the slot 2 edge, level with the reference coil: cx, cy, w, h, turns
REF_COIL = (32.4, 20.0, 4.4, 10.0, 6)    # over solid metal of the left block
TRACE, TRACE_PITCH, CU_T = 0.13, 0.26, 0.035   # as in pcb/gen_footprints.py

# Placeholder components on the PCB top: name, (x0, y0, x1, y1, height)
# Positions follow the KiCad layout in pcb/gen_pcb.py
COMPONENTS = [
    ("BLE_module", (35.8, 16.2, 46.0, 32.8, 2.2)),  # MDBT42Q, antenna end at y 28-32.8, past the PCB edge
    ("LDC1612", (48.0, 18.0, 52.0, 22.0, 0.8)),
    ("USB_C", (41.53, -2.0, 50.47, 4.9, 3.26)),    # GCT USB4135: shell sticks out 1.6 mm past the PCB tab,
                                                    # mouth at y = -2.0, flush with the housing facet
    ("Button", (34.05, 5.35, 39.15, 10.45, 1.5)),   # XKB TS-1187A 5.1x5.1; printed plunger added below
    ("LED", (50.2, 12.6, 51.8, 13.4, 0.6)),         # green status
    ("LED_charge", (47.2, 12.6, 48.8, 13.4, 0.6)),  # red, charging
]                                                   # nothing metal above the sense coil (x 54-60, y 15.5-24.5)

BATTERY = (34.5, 6.0, 28.0, 20.0, 4.0)  # x0, y0, length, width, thickness (LiPo ~250-300 mAh)
BATTERY_GAP = 1.5

# Housing: oval tube around the middle of the plate, split at the plate's mid-plane
# (FDM/SLA/MJF first, injection moulding later)
WALL = 1.6
HOUSING_X = (27.4, 64.6)    # end faces stay >= 11.4 mm from the hole centres (clear of the round-over)
HOUSING_YC, HOUSING_ZC = W / 2, 3.5
HOUSING_A, HOUSING_B = 22.0, 12.5  # ellipse half-width (y) and half-height (z): tall enough for a straight
                                   # USB-C opening through the side wall
EDGE_R = 3.0                # rounded edges of the oval end faces
CLEARANCE = 0.4             # gap to the body wherever the housing must float
SPLIT_Z = 3.0               # parting plane at the plate's mid-plane
BOSS_XY = [(31.0, -3.0), (61.0, -3.0), (31.0, 35.0), (61.0, 35.0)]  # symmetric about the housing centre (46, 16),
                                                                     # beside the plate, >= 8 mm from both coils
BOSS_D, INSERT_D, INSERT_DEPTH = 5.0, 3.2, 4.0  # M2 heat-set inserts in the top half, screws from below
SCREW_CLEAR_D, CBORE_D, CBORE_Z = 2.4, 4.4, -1.0
BUTTON_HOLE = (36.6, 7.9, 4.2)
LED_HOLES = [(48.0, 13.0, 2.0), (51.0, 13.0, 2.0)]  # red charging, green status
BUTTON_STEM = (3.5, 8.3)    # printed plunger: diameter, top above the PCB (pokes ~0.5 mm through the top)
USB_FACET = (13.4, 7.2, 1.2)  # flat seat for the plug overmold (~12.4 x 6.5): width, height, corner radius
USB_FACET_WALL = 1.2        # wall thickness behind the facet (ends 0.2 mm short of the PCB tab edge)
USB_PROUD = 0.2             # receptacle mouth stands this far proud of the facet: the plug seats on the metal
USB_SNUG = 0.15             # clearance around the receptacle mouth in the snug stadium opening

# Material / rating, only for the sanity check printed at the end
WLL_N = 2000.0
DENSITY = 2.81e-3   # g/mm3, 7075-T6
YIELD_MPA = 503.0
UTS_MPA = 572.0
# ---------------------------------------------------------------------------

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_BODY = os.path.join(HERE, "fredeq_loadcell_body.step")
OUT_ASM = os.path.join(HERE, "fredeq_sensor_assembly.step")
OUT_STL = {k: os.path.join(HERE, f"fredeq_housing_{k}.stl") for k in ("top", "bottom")}
R = W / 2
L = C + W
Z0, H = -1.0, T + 2.0  # cutting tools overshoot the plate on both faces
X1, X2 = R, R + C      # hole centres
PCB_Z = T + SHIM_T     # underside of the PCB
PCB_TOP = PCB_Z + PCB_T
XDIR = V(1, 0, 0)


def slot(x, y_open, y_end):
    """Straight slot centred on x, open at y_open, round end centred at y_end."""
    y0, y1 = sorted((y_open, y_end))
    if y_open < y_end:
        y0 -= 1.0  # run past the open edge
    else:
        y1 += 1.0
    body = Part.makeBox(SLOT_W, y1 - y0, H, V(x - SLOT_W / 2, y0, Z0))
    end = Part.makeCylinder(SLOT_W / 2, H, V(x, y_end, Z0))
    return body.fuse(end)


def blind_hole(d, depth, x, y):
    return Part.makeCylinder(d / 2, depth + 1.0, V(x, y, T - depth))


def rounded_rect(x0, y0, x1, y1, r, z, t):
    core = Part.makeBox(x1 - x0 - 2 * r, y1 - y0, t, V(x0 + r, y0, z))
    core = core.fuse(Part.makeBox(x1 - x0, y1 - y0 - 2 * r, t, V(x0, y0 + r, z)))
    corners = [Part.makeCylinder(r, t, V(cx, cy, z))
               for cx in (x0 + r, x1 - r) for cy in (y0 + r, y1 - r)]
    return core.fuse(corners).removeSplitter()


def stadium(grow, z, t):
    """Pill outline of the body grown by `grow`, extruded from z over t."""
    r = R + grow
    return Part.makeBox(C, 2 * r, t, V(X1, R - r, z)).fuse([
        Part.makeCylinder(r, t, V(X1, R, z)),
        Part.makeCylinder(r, t, V(X2, R, z)),
    ]).removeSplitter()


def coil(cx, cy, w, h, turns):
    """Rectangular planar spiral as copper on the PCB underside."""
    segs = []
    z = PCB_Z - CU_T

    def track(xa, ya, xb, yb):
        x0, x1 = sorted((xa, xb))
        y0, y1 = sorted((ya, yb))
        segs.append(Part.makeBox(x1 - x0 + TRACE, y1 - y0 + TRACE, CU_T,
                                 V(x0 - TRACE / 2, y0 - TRACE / 2, z)))

    for i in range(turns):
        a = w / 2 - i * TRACE_PITCH
        b = h / 2 - i * TRACE_PITCH
        track(cx - a, cy - b, cx + a, cy - b)
        track(cx + a, cy - b, cx + a, cy + b)
        track(cx + a, cy + b, cx - a + TRACE_PITCH, cy + b)
        track(cx - a + TRACE_PITCH, cy + b, cx - a + TRACE_PITCH, cy - b + TRACE_PITCH)
    return segs[0].fuse(segs[1:]).removeSplitter()


def rrect_y(xc, zc, w, h, r, y0, y1):
    """Rounded rectangle in the x-z plane, extruded along y from y0 to y1 (r = h/2 gives a stadium)."""
    r = min(r, w / 2, h / 2)
    ln = y1 - y0
    parts = [Part.makeBox(w - 2 * r, ln, h, V(xc - w / 2 + r, y0, zc - h / 2))]
    if h - 2 * r > 1e-6:
        parts.append(Part.makeBox(w, ln, h - 2 * r, V(xc - w / 2, y0, zc - h / 2 + r)))
    parts += [Part.makeCylinder(r, ln, V(xc + sx * (w / 2 - r), y0, zc + sz * (h / 2 - r)), V(0, 1, 0))
              for sx in (-1, 1) for sz in (-1, 1)]
    return parts[0].fuse(parts[1:]).removeSplitter()


def housing_volume(inset):
    """Oval tube along the plate, shrunk by `inset` for the inner cavity."""
    x0, x1 = HOUSING_X[0] + inset, HOUSING_X[1] - inset
    c = V(x0, HOUSING_YC, HOUSING_ZC)
    oval = Part.Ellipse(c + V(0, HOUSING_A - inset, 0), c + V(0, 0, HOUSING_B - inset), c)
    vol = Part.Face(Part.Wire(oval.toShape())).extrude(V(x1 - x0, 0, 0))
    ends = [e for e in vol.Edges if isinstance(e.Curve, Part.Ellipse)]
    r = EDGE_R - inset
    while r >= 0.5:  # step down if OCC can't make the round-over
        try:
            return vol.makeFillet(r, ends)
        except Part.OCCError:
            r -= 0.25
    return vol


# --- Body ------------------------------------------------------------------
tools = [Part.makeCylinder(HOLE_D / 2, H, V(x, R, Z0)) for x in (X1, X2)]

# S-beam: left slot open at the bottom edge, right slot open at the top edge
x_left = L / 2 - SLOT_PITCH / 2
x_right = L / 2 + SLOT_PITCH / 2
tools.append(slot(x_left, 0.0, W - LIGAMENT - SLOT_W / 2))
tools.append(slot(x_right, W, LIGAMENT + SLOT_W / 2))

tools += [blind_hole(PIN_D, PIN_DEPTH, MOUNT_X, y) for y in PIN_YS]
tools += [blind_hole(TAP_D, TAP_DEPTH, MOUNT_X, y) for y in SCREW_YS]

blank = stadium(0.0, 0.0, T)
blank = blank.makeFillet(OUTER_EDGE_R, [e for e in blank.Edges if e.BoundBox.ZLength < 1e-6])
body = blank.cut(Part.makeCompound(tools)).removeSplitter()

hole_edges = [
    e for e in body.Edges
    if isinstance(e.Curve, Part.Circle) and abs(e.Curve.Radius - HOLE_D / 2) < 1e-6
]
body = body.makeFillet(HOLE_EDGE_R, hole_edges)

assert body.isValid() and len(body.Solids) == 1, "invalid solid"
body.exportStep(OUT_BODY)

# --- Sensor assembly ----------------------------------------------------------
pcb = rounded_rect(PCB_X[0], PCB_Y[0], PCB_X[1], PCB_Y[1], PCB_R, PCB_Z, PCB_T)
pcb = pcb.fuse(Part.makeBox(PCB_TAB[1] - PCB_TAB[0], PCB_Y[0] - PCB_TAB[2] + 0.5, PCB_T,
                            V(PCB_TAB[0], PCB_TAB[2], PCB_Z))).removeSplitter()  # USB-C tab
pcb = pcb.cut(Part.makeCompound(
    [Part.makeCylinder(PIN_D / 2 + 0.025, PCB_T + 2, V(MOUNT_X, y, PCB_Z - 1)) for y in PIN_YS]
    + [Part.makeCylinder(1.1, PCB_T + 2, V(MOUNT_X, y, PCB_Z - 1)) for y in SCREW_YS]
))

parts = [("Body_7075", body), ("Sensor_PCB", pcb),
         ("Sense_coil", coil(*SENSE_COIL)), ("Reference_coil", coil(*REF_COIL))]

for i, y in enumerate(PIN_YS, 1):
    parts.append((f"Dowel_pin_{i}", Part.makeCylinder(PIN_D / 2, PIN_LEN, V(MOUNT_X, y, T - PIN_DEPTH))))
for i, y in enumerate(PIN_YS + SCREW_YS, 1):
    ring = Part.makeCylinder(SHIM_OD / 2, SHIM_T, V(MOUNT_X, y, T)).cut(
        Part.makeCylinder(1.1, SHIM_T, V(MOUNT_X, y, T)))
    parts.append((f"Shim_{i}", ring))
for i, y in enumerate(SCREW_YS, 1):
    head = Part.makeCylinder(1.9, 2.0, V(MOUNT_X, y, PCB_TOP))
    shank = Part.makeCylinder(1.0, PCB_TOP - (T - TAP_DEPTH + 0.5), V(MOUNT_X, y, T - TAP_DEPTH + 0.5))
    parts.append((f"M2_screw_PCB_{i}", head.fuse(shank).removeSplitter()))
for name, (x0, y0, x1, y1, h) in COMPONENTS:
    if name == "USB_C":  # receptacle body is a stadium in the x-z plane
        parts.append((name, rrect_y((x0 + x1) / 2, PCB_TOP + h / 2, x1 - x0, h, h / 2, y0, y1)))
    else:
        parts.append((name, Part.makeBox(x1 - x0, y1 - y0, h, V(x0, y0, PCB_TOP))))
bx0, by0, bx1, by1, bh = dict(COMPONENTS)["Button"]
stem_d, stem_h = BUTTON_STEM
parts.append(("Button_stem", Part.makeCylinder(stem_d / 2, stem_h - bh, V((bx0 + bx1) / 2, (by0 + by1) / 2, PCB_TOP + bh))))

bx, by, bl, bw, bt = BATTERY
parts.append(("Battery_envelope", Part.makeBox(bl, bw, bt, V(bx, by, -BATTERY_GAP - bt))))

# --- Housing -------------------------------------------------------------------
outer = housing_volume(0.0)
inner = housing_volume(WALL)
shell = outer.cut(inner)
shell = shell.cut(stadium(CLEARANCE, -CLEARANCE, T + 2 * CLEARANCE))  # plate passes through, floating

# features that fill the cavity, trimmed to the inner volume (the clamps touch the left block)
bosses = [Part.makeCylinder(BOSS_D / 2, 60.0, V(x, y, -30.0)) for x, y in BOSS_XY]
clamp_bottom = Part.makeBox(5.0, 28.0, 30.0, V(MOUNT_X - 2.5, 2.0, -30.0))      # up to the body underside
clamp_top = [Part.makeCylinder(2.0, 30.0, V(MOUNT_X, y, PCB_TOP)) for y in PIN_YS]  # down onto the PCB over the shims
fill = Part.makeCompound(bosses + [clamp_bottom] + clamp_top).common(inner, 0.01)  # fuzzy: exact fails on the filleted cavity
shell = shell.fuse(fill)

# USB-C: a flat seat on the oval for the plug overmold, flush with the receptacle mouth, with a solid
# wall behind it (stops 0.2 mm short of the PCB tab edge)
ux0, uy0, ux1, _, uh = dict(COMPONENTS)["USB_C"]
uxc, uzc = (ux0 + ux1) / 2, PCB_TOP + uh / 2
fw, fh, fr = USB_FACET
fy = uy0 + USB_PROUD  # facet plane
# solid from the outer surface to behind the facet, one wall thickness wider than the facet all round:
# after the facet is cut, this leaves a closed pocket (floor and sides join the oval wall to the facet wall)
usb_wall = rrect_y(uxc, uzc, fw + 2 * WALL, fh + 2 * WALL, fr + WALL,
                   fy - 20.0, fy + USB_FACET_WALL).common(outer, 0.01)
shell = shell.fuse(usb_wall)

# screws from below through the bottom half into heat-set inserts in the top half
cuts = [Part.makeCylinder(SCREW_CLEAR_D / 2, SPLIT_Z - CBORE_Z, V(x, y, CBORE_Z)) for x, y in BOSS_XY]
cuts += [Part.makeCylinder(CBORE_D / 2, 20.0, V(x, y, CBORE_Z - 20.0)) for x, y in BOSS_XY]
cuts += [Part.makeCylinder(INSERT_D / 2, INSERT_DEPTH, V(x, y, SPLIT_Z)) for x, y in BOSS_XY]
for x, y, d in [BUTTON_HOLE] + LED_HOLES:
    cuts.append(Part.makeCylinder(d / 2, 20.0, V(x, y, PCB_TOP)))
cuts.append(rrect_y(uxc, uzc, fw, fh, fr, fy - 20.0, fy))  # flat facet, just behind the receptacle mouth
sw, sh = ux1 - ux0 + 2 * USB_SNUG, uh + 2 * USB_SNUG
cuts.append(rrect_y(uxc, uzc, sw, sh, sh / 2, fy - 20.0, fy + 4.0))  # snug stadium opening, through the curved roof edge
shell = shell.cut(Part.makeCompound(cuts))  # no removeSplitter here: it corrupts this shape

housing_top = shell.common(Part.makeBox(200, 200, 100, V(-50, -50, SPLIT_Z)))
housing_bottom = shell.common(Part.makeBox(200, 200, 100, V(-50, -50, SPLIT_Z - 100)))
parts += [("Housing_top", housing_top), ("Housing_bottom", housing_bottom)]
for i, (x, y) in enumerate(BOSS_XY, 1):
    head = Part.makeCylinder(1.9, 2.0, V(x, y, CBORE_Z - 2.0))
    shank = Part.makeCylinder(1.0, SPLIT_Z + INSERT_DEPTH - 0.5 - CBORE_Z, V(x, y, CBORE_Z))
    parts.append((f"M2_screw_housing_{i}", head.fuse(shank).removeSplitter()))

for key, shape in (("top", housing_top), ("bottom", housing_bottom)):
    shape.exportStl(OUT_STL[key])

doc = App.newDocument("FredeqSensorAssembly")
objs = []
for name, shape in parts:
    assert shape.isValid(), name
    obj = doc.addObject("Part::Feature", name)
    obj.Shape = shape
    objs.append(obj)
doc.recompute()
Import.export(objs, OUT_ASM)

# Hand check: each ligament carries the load P plus moment P * (offset to load line)
sigma = WLL_N / (LIGAMENT * T) + WLL_N * (W / 2 - LIGAMENT / 2) / (T * LIGAMENT ** 2 / 6)
web = (x_left - SLOT_W / 2) - (X1 + HOLE_D / 2)
bb = body.BoundBox
hb = housing_top.fuse(housing_bottom).BoundBox
print(f"STEP written: {OUT_BODY}")
print(f"STEP written: {OUT_ASM} ({len(parts)} parts)")
print(f"STL written: {OUT_STL['top']}, {OUT_STL['bottom']}")
print(f"Body: {bb.XLength:.1f} x {bb.YLength:.1f} x {bb.ZLength:.1f} mm, "
      f"mass {body.Volume * DENSITY:.0f} g (7075-T6)")
print(f"Housing: {hb.XLength:.1f} x {hb.YLength:.1f} x {hb.ZLength:.1f} mm, "
      f"top {housing_top.Volume / 1000:.1f} cm3, bottom {housing_bottom.Volume / 1000:.1f} cm3")
print(f"Gauge block: {SLOT_PITCH - SLOT_W:.0f} x {W:.0f} mm, web hole-to-slot: {web:.1f} mm")
scx, scy, scw, sch, _ = SENSE_COIL
coil_metal = min(((bx - min(max(bx, scx - scw / 2), scx + scw / 2)) ** 2
                  + (by - min(max(by, scy - sch / 2), scy + sch / 2)) ** 2) ** 0.5 for bx, by in BOSS_XY)
print(f"Coil gap to metal: {SHIM_T - CU_T:.3f} mm, sense coil spans x {scx - scw / 2:.1f}-{scx + scw / 2:.1f} "
      f"(slot edge at {x_right + SLOT_W / 2:.1f}), y {scy - sch / 2:.1f}-{scy + sch / 2:.1f} "
      f"(slot straight from {LIGAMENT + SLOT_W / 2:.1f} to {W:.1f}, PCB edge {PCB_Y[1]:.1f})")
print(f"Nearest housing insert/screw to the sense coil: {coil_metal:.1f} mm")
print(f"Ligament stress at WLL {WLL_N:.0f} N (beam theory, no Kt): {sigma:.0f} MPa "
      f"-> yield x{YIELD_MPA / sigma:.2f}, ultimate x{UTS_MPA / sigma:.2f}")
