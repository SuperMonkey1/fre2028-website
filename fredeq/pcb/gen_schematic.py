"""Generate the Fredeq rev A schematic (KiCad) from the netlist below.

Every pin gets a net label at its end (no hand-drawn wires), unused pins get a
no-connect flag. Symbols are copied from the KiCad standard libraries.

Run with any Python 3:
    python gen_schematic.py
then check it with:
    kicad-cli sch erc fredeq.kicad_sch
"""
import os
import re
import uuid

KICAD = r"C:\Program Files\KiCad\10.0\share\kicad"
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "fredeq.kicad_sch")
PROJECT = "fredeq"
ROOT_UUID = "6f1c2a4e-0d3b-4f6a-9a1e-2b7c5d8e9f10"

R0402 = "Resistor_SMD:R_0402_1005Metric"
C0402 = "Capacitor_SMD:C_0402_1005Metric"
C0603 = "Capacitor_SMD:C_0603_1608Metric"

# ref, lib_id, value, footprint, {pin number: net}; pins left out get a no-connect flag
PARTS = [
    # --- Bluetooth MCU module (nRF52832). Antenna end goes at the PCB edge, past the aluminium.
    # Pins chosen by direction on the board: top-right pins face the LDC1612, bottom-right pins
    # the LED and button, bottom-row analog inputs the dividers.
    # pin: GPIO -> 30: P0.16 SCL, 29: P0.15 SDA, 27: P0.13 LDC_INT, 26: P0.12 LDC_SD (level with the
    #             LDC1612 pins), 25: P0.11 LED, 17: P0.04 BUTTON, 15: AIN0, 16: AIN1, 35: P0.21 reset.
    #             DCC/DEC4 unused (LDO mode). Pull-ups for INTB and BUTTON are the nRF's internal ones.
    ("U1", "RF_Module:MDBT42Q-512K", "MDBT42Q-512KV2", "RF_Module:Raytac_MDBT42Q", {
        "11": "+3V3", "1": "GND", "12": "GND", "24": "GND", "39": "GND",
        "30": "SCL", "29": "SDA", "27": "LDC_INT", "26": "LDC_SD",
        "15": "VBAT_SENSE", "16": "VBUS_SENSE",
        "25": "LED", "17": "BUTTON",
        "35": "NRESET", "36": "SWCLK", "37": "SWDIO",
    }),
    # --- Inductive sensing: LDC1612 measures the sense coil (CH0) and the reference coil (CH1)
    ("U2", "Sensor_Proximity:LDC1612", "LDC1612DNTR", "Package_SON:WSON-12-1EP_4x4mm_P0.5mm_EP2.6x3mm", {
        "1": "SCL", "2": "SDA", "3": "GND", "4": "GND", "5": "LDC_INT", "6": "LDC_SD",
        "7": "+3V3", "8": "GND", "13": "GND",
        "9": "COIL0_A", "10": "COIL0_B", "11": "COIL1_A", "12": "COIL1_B",
    }),
    ("L1", "Device:L_Small", "Sense coil", "Fredeq:Coil_Sense_6x9mm", {"1": "COIL0_A", "2": "COIL0_B"}),
    ("C1", "Device:C_Small", "330p C0G", C0402, {"1": "COIL0_A", "2": "COIL0_B"}),
    ("L2", "Device:L_Small", "Reference coil", "Fredeq:Coil_Ref_4.4x10mm", {"1": "COIL1_A", "2": "COIL1_B"}),
    ("C2", "Device:C_Small", "470p C0G", C0402, {"1": "COIL1_A", "2": "COIL1_B"}),
    ("C3", "Device:C_Small", "1u", C0402, {"1": "+3V3", "2": "GND"}),
    ("C4", "Device:C_Small", "100n", C0402, {"1": "+3V3", "2": "GND"}),
    # --- Temperature next to the coils, for span/zero compensation (polled, ALERT unused)
    ("U4", "Sensor_Temperature:TMP117xxDRV", "TMP117AIDRVR", None, {
        "1": "SCL", "2": "GND", "4": "GND", "5": "+3V3", "6": "SDA", "7": "GND",  # 7 = exposed pad
    }),
    ("C5", "Device:C_Small", "100n", C0402, {"1": "+3V3", "2": "GND"}),
    ("R2", "Device:R_Small", "4.7k", R0402, {"1": "+3V3", "2": "SDA"}),
    ("R3", "Device:R_Small", "4.7k", R0402, {"1": "+3V3", "2": "SCL"}),
    # --- USB-C (charge only) + protection
    # power-only, all-SMD (nothing may poke through: the PCB sits 0.3 mm above the aluminium)
    ("J1", "Connector:USB_C_Receptacle_PowerOnly_6P", "GCT USB4135-GF-A",
     "Connector_USB:USB_C_Receptacle_GCT_USB4135-GF-A_6P_TopMnt_Horizontal", {
        "A9": "VBUS", "B9": "VBUS", "A12": "GND", "B12": "GND", "SH": "GND",
        "A5": "CC1", "B5": "CC2",
    }),
    ("R5", "Device:R_Small", "5.1k", R0402, {"1": "CC1", "2": "GND"}),
    ("R6", "Device:R_Small", "5.1k", R0402, {"1": "CC2", "2": "GND"}),
    ("D1", "Device:D_TVS_Small", "PESD5V0S1BA", "Diode_SMD:D_SOD-323", {"1": "GND", "2": "VBUS"}),
    # --- LiPo charger, ~210 mA (0.7C for 300 mAh), red LED while charging
    ("U3", "Battery_Management:MCP73831-2-OT", "MCP73831T-2ACI/OT", None, {
        "1": "CHG_STAT", "2": "GND", "3": "VBAT", "4": "VBUS", "5": "PROG",
    }),
    ("R7", "Device:R_Small", "4.7k", R0402, {"1": "PROG", "2": "GND"}),
    ("C6", "Device:C_Small", "4.7u", C0603, {"1": "VBUS", "2": "GND"}),
    ("C7", "Device:C_Small", "4.7u", C0603, {"1": "VBAT", "2": "GND"}),
    ("D2", "Device:LED_Small", "red", "LED_SMD:LED_0603_1608Metric", {"1": "CHG_STAT", "2": "CHG_LED_A"}),
    ("R8", "Device:R_Small", "1k", R0402, {"1": "VBUS", "2": "CHG_LED_A"}),
    ("J2", "Connector:Conn_01x02_Pin", "Battery", "Connector_JST:JST_SH_SM02B-SRSS-TB_1x02-1MP_P1.00mm_Horizontal",
     {"1": "VBAT", "2": "GND"}),
    # --- 3.3 V low-quiescent LDO (~1 uA)
    ("U5", "Regulator_Linear:XC6206PxxxMR", "XC6206P332MR", None, {"1": "GND", "2": "+3V3", "3": "VBAT"}),
    ("C8", "Device:C_Small", "1u", C0402, {"1": "VBAT", "2": "GND"}),
    ("C9", "Device:C_Small", "10u", C0603, {"1": "+3V3", "2": "GND"}),
    # --- Battery and USB sensing (high-value dividers, ~2 uA)
    ("R9", "Device:R_Small", "1M", R0402, {"1": "VBAT", "2": "VBAT_SENSE"}),
    ("R10", "Device:R_Small", "1M", R0402, {"1": "VBAT_SENSE", "2": "GND"}),
    ("C10", "Device:C_Small", "100n", C0402, {"1": "VBAT_SENSE", "2": "GND"}),
    ("R11", "Device:R_Small", "100k", R0402, {"1": "VBUS", "2": "VBUS_SENSE"}),
    ("R12", "Device:R_Small", "100k", R0402, {"1": "VBUS_SENSE", "2": "GND"}),
    # --- User interface
    ("SW1", "Switch:SW_Push", "XKB TS-1187A", "Button_Switch_SMD:SW_Push_1P1T_XKB_TS-1187A",
     {"1": "BUTTON", "2": "GND"}),  # pressed by a printed plunger in the housing
    ("D3", "Device:LED_Small", "green", "LED_SMD:LED_0603_1608Metric", {"1": "GND", "2": "LED_A"}),
    ("R13", "Device:R_Small", "1k", R0402, {"1": "LED", "2": "LED_A"}),
    # --- Programming: SWD test pads next to the module's SWD pins (pogo jig or wires)
    ("TP1", "Connector:TestPoint", "+3V3", "TestPoint:TestPoint_Pad_D1.0mm", {"1": "+3V3"}),
    ("TP2", "Connector:TestPoint", "SWDIO", "TestPoint:TestPoint_Pad_D1.0mm", {"1": "SWDIO"}),
    ("TP3", "Connector:TestPoint", "SWCLK", "TestPoint:TestPoint_Pad_D1.0mm", {"1": "SWCLK"}),
    ("TP4", "Connector:TestPoint", "NRESET", "TestPoint:TestPoint_Pad_D1.0mm", {"1": "NRESET"}),
    ("TP5", "Connector:TestPoint", "GND", "TestPoint:TestPoint_Pad_D1.0mm", {"1": "GND"}),
    # --- ERC power flags
    ("#FLG01", "power:PWR_FLAG", "PWR_FLAG", "", {"1": "GND"}),
    ("#FLG02", "power:PWR_FLAG", "PWR_FLAG", "", {"1": "VBUS"}),
]

# functional blocks: title, note, refs; laid out in a 3 x 2 grid of framed regions
BLOCKS = [
    ("MCU and Bluetooth", "Antenna end of U1 at the PCB edge, no copper under it",
     ["U1", "TP1", "TP2", "TP3", "TP4", "TP5", "SW1", "R13", "D3"]),
    ("Inductive sensing", "L1/L2 are PCB coils on the bottom: L1 over the slot 2 edge, L2 over the left block",
     ["U2", "L1", "C1", "L2", "C2", "C3", "C4"]),
    ("Temperature and I2C", "I2C: LDC1612 at 0x2A, TMP117 at 0x48 (polled)",
     ["U4", "C5", "R2", "R3"]),
    ("USB-C (charge only)", "5.1k on CC1/CC2: sink, 5 V only",
     ["J1", "R5", "R6", "D1", "R11", "R12", "#FLG02"]),
    ("Charger and battery", "PROG 4.7k: ~210 mA charge current",
     ["U3", "R7", "C6", "C7", "D2", "R8", "J2", "R9", "R10", "C10"]),
    ("3.3 V supply", "XC6206: ~1 uA quiescent",
     ["U5", "C8", "C9", "#FLG01"]),
]
REGION_W, REGION_H, REGION_X0, REGION_Y0 = 180.0, 170.0, 25.0, 30.0

# pins the library symbol lacks: lib_id -> (number, name, x, y, angle). The TMP117 footprint has an
# exposed pad (7) that the library symbol leaves out; the datasheet allows tying it to GND.
EXTRA_PINS = {
    "Sensor_Temperature:TMP117xxDRV": [("7", "EP", 2.54, -10.16, 90)],
}

TOK = re.compile(r'\s*(\(|\)|"(?:[^"\\]|\\.)*"|[^\s()"]+)')


def parse(text):
    stack, cur = [], []
    for m in TOK.finditer(text):
        t = m.group(1)
        if t == "(":
            stack.append(cur)
            cur = []
        elif t == ")":
            done = cur
            cur = stack.pop()
            cur.append(done)
        else:
            cur.append(t)
    return cur


def dump(x, ind=0):
    if not isinstance(x, list):
        return x
    atoms = [i for i in x if not isinstance(i, list)]
    subs = [i for i in x if isinstance(i, list)]
    if not subs:
        return "(" + " ".join(atoms) + ")"
    s = "(" + " ".join(atoms)
    for i in subs:
        s += "\n" + "\t" * (ind + 1) + dump(i, ind + 1)
    return s + "\n" + "\t" * ind + ")"


def find(x, key):
    return [i for i in x if isinstance(i, list) and i and i[0] == key]


def unq(s):
    return s[1:-1] if s.startswith('"') else s


def q(s):
    return '"' + str(s).replace('"', '\\"') + '"'


def uid():
    return q(uuid.uuid4())


_libs = {}


def lib_symbol(lib_id):
    """Symbol from the standard library, flattened if it extends another, named Lib:Name."""
    lib, name = lib_id.split(":")
    if lib not in _libs:
        path = os.path.join(KICAD, "symbols", f"{lib}.kicad_sym")
        _libs[lib] = {unq(s[1]): s for s in find(parse(open(path, encoding="utf8").read())[0], "symbol")}
    sym = _libs[lib][name]
    ext = find(sym, "extends")
    if ext:
        parent = _libs[lib][unq(ext[0][1])]
        pname = unq(parent[1])
        own_props = find(sym, "property")
        body = [i for i in parent[2:] if not (isinstance(i, list) and i[0] in ("property", "symbol"))]
        units = []
        for u in find(parent, "symbol"):
            u = list(u)
            u[1] = q(name + unq(u[1])[len(pname):])
            units.append(u)
        sym = ["symbol", q(name)] + body + own_props + units
    sym = list(sym)
    sym[1] = q(lib_id)
    for num, pname, x, y, ang in EXTRA_PINS.get(lib_id, []):
        unit = next(u for u in find(sym, "symbol") if unq(u[1]).endswith("_1_1"))
        unit.append(["pin", "passive", "line", ["at", str(x), str(y), str(ang)], ["length", "2.54"],
                     ["name", q(pname), ["effects", ["font", ["size", "1.27", "1.27"]]]],
                     ["number", q(num), ["effects", ["font", ["size", "1.27", "1.27"]]]]])
    return sym


def pins_of(sym):
    out = {}
    for u in find(sym, "symbol"):
        for p in find(u, "pin"):
            at = find(p, "at")[0]
            out[unq(find(p, "number")[0][1])] = (float(at[1]), float(at[2]), int(float(at[3])) if len(at) > 3 else 0)
    return out


def snap(v):
    return round(round(v / 1.27) * 1.27, 2)


def main():
    syms = {}
    for _, lib_id, *_ in PARTS:
        if lib_id not in syms:
            syms[lib_id] = lib_symbol(lib_id)

    # each block gets a framed region; parts flow left to right inside it, sized from the pin extents
    by_ref = {p[0]: p for p in PARTS}
    assert sorted(by_ref) == sorted(r for b in BLOCKS for r in b[2]), "every part must be in exactly one block"
    placed, frames = [], []
    for bi, (title, note, refs) in enumerate(BLOCKS):
        rx = REGION_X0 + (bi % 3) * REGION_W
        ry = REGION_Y0 + (bi // 3) * REGION_H
        frames.append((title, note, rx, ry))
        x, y, row_h = rx + 5.0, ry + 22.0, 0.0
        for ref in refs:
            _, lib_id, value, fp, nets = by_ref[ref]
            pins = pins_of(syms[lib_id])
            xs = [p[0] for p in pins.values()]
            ys = [p[1] for p in pins.values()]
            two_pin = len(pins) <= 2
            w = (max(xs) - min(xs)) + (22.0 if two_pin else 38.0)
            h = (max(ys) - min(ys)) + (22.0 if two_pin else 16.0)
            if x + w > rx + REGION_W - 5.0:
                x, y, row_h = rx + 5.0, y + row_h, 0.0
            lead = 6.0 if two_pin else 19.0  # room for labels on the left
            sx, sy = snap(x + lead - min(xs)), snap(y + max(ys) + 6.0)  # schematic y runs down
            placed.append((ref, lib_id, value, fp, nets, pins, sx, sy))
            x += w
            row_h = max(row_h, h)

    out = [f'(kicad_sch\n\t(version 20250114)\n\t(generator "fredeq_gen")\n\t(generator_version "9.0")\n'
           f'\t(uuid {q(ROOT_UUID)})\n\t(paper "A2")\n\t(title_block\n\t\t(title "Fredeq sensor board")\n'
           f'\t\t(rev "A")\n\t\t(company "Fredeq")\n\t\t(comment 1 "Generated by gen_schematic.py")\n\t)']
    out.append("\t(lib_symbols\n" + "\n".join("\t\t" + dump(s, 2) for s in syms.values()) + "\n\t)")

    font = "(effects (font (size 1.27 1.27)))"
    hidden = "(effects (font (size 1.27 1.27)) (hide yes))"
    for ref, lib_id, value, fp, nets, pins, sx, sy in placed:
        is_power = ref.startswith("#")
        in_bom = not (is_power or ref.startswith(("L", "TP")))  # coils and test pads are PCB copper only
        if fp is None:
            fp = next((unq(p[2]) for p in find(syms[lib_id], "property") if unq(p[1]) == "Footprint"), "")
        ys = [p[1] for p in pins.values()]
        if len(pins) <= 2 and all(a % 180 == 90 for *_, a in pins.values()):  # vertical R/C/L: text to the right
            side = "(effects (font (size 1.27 1.27)) (justify left))"
            ref_at, val_at, ref_fx, val_fx = (snap(sx + 2.54), snap(sy - 1.27)), (snap(sx + 2.54), snap(sy + 1.27)), side, side
        elif len(pins) <= 2:  # horizontal LEDs, switch, connector: text above and below
            ref_at, val_at, ref_fx, val_fx = (sx, snap(sy - max(ys) - 2.54)), (sx, snap(sy - min(ys) + 2.54)), font, font
        else:
            ref_at, val_at, ref_fx, val_fx = (sx, snap(sy - max(ys) - 3.81)), (sx, snap(sy - min(ys) + 3.81)), font, font
        lines = [f'\t(symbol (lib_id {q(lib_id)}) (at {sx} {sy} 0) (unit 1) (exclude_from_sim no) '
                 f'(in_bom {"yes" if in_bom else "no"}) (on_board {"no" if is_power else "yes"}) (dnp no) (uuid {uid()})',
                 f'\t\t(property "Reference" {q(ref)} (at {ref_at[0]} {ref_at[1]} 0) {hidden if is_power else ref_fx})',
                 f'\t\t(property "Value" {q(value)} (at {val_at[0]} {val_at[1]} 0) {val_fx})',
                 f'\t\t(property "Footprint" {q(fp)} (at {sx} {sy} 0) {hidden})',
                 f'\t\t(property "Datasheet" "" (at {sx} {sy} 0) {hidden})']
        lines += [f'\t\t(pin {q(n)} (uuid {uid()}))' for n in pins]
        lines.append(f'\t\t(instances (project {q(PROJECT)} (path "/{ROOT_UUID}" (reference {q(ref)}) (unit 1))))')
        lines.append("\t)")
        out.append("\n".join(lines))

        for num, (px, py, ang) in pins.items():
            ax, ay = snap(sx + px), snap(sy - py)
            net = nets.get(num)
            if net is None:
                out.append(f"\t(no_connect (at {ax} {ay}) (uuid {uid()}))")
                continue
            # label points away from the body: pin angle is the direction into the symbol. Global labels,
            # so net names carry no sheet prefix ("SDA", not "/SDA") and match the board scripts.
            la, just = {0: (180, "right"), 180: (0, "left"), 90: (270, "right"), 270: (90, "left")}[ang % 360]
            out.append(f'\t(global_label {q(net)} (shape bidirectional) (at {ax} {ay} {la}) (fields_autoplaced yes) '
                       f'(effects (font (size 1.27 1.27)) (justify {just})) (uuid {uid()}) '
                       f'(property "Intersheetrefs" "${{INTERSHEET_REFS}}" (at {ax} {ay} 0) '
                       f'(effects (font (size 1.27 1.27)) (hide yes))))')

    for title, note, rx, ry in frames:
        out.append(f'\t(rectangle (start {snap(rx)} {snap(ry)}) (end {snap(rx + REGION_W - 3)} {snap(ry + REGION_H - 3)}) '
                   f'(stroke (width 0) (type dash)) (fill (type none)) (uuid {uid()}))')
        out.append(f'\t(text {q(title)} (exclude_from_sim no) (at {snap(rx + 3)} {snap(ry + 8)} 0) '
                   f'(effects (font (size 3 3) (bold yes)) (justify left bottom)) (uuid {uid()}))')
        out.append(f'\t(text {q(note)} (exclude_from_sim no) (at {snap(rx + 3)} {snap(ry + 13)} 0) '
                   f'(effects (font (size 1.8 1.8) (italic yes)) (justify left bottom)) (uuid {uid()}))')

    out.append('\t(sheet_instances (path "/" (page "1")))\n\t(embedded_fonts no)\n)')
    with open(OUT, "w", encoding="utf8", newline="\n") as f:
        f.write("\n".join(out) + "\n")

    used = {n for *_, nets in PARTS for n in nets.values()}
    print(f"wrote {OUT}: {len(PARTS)} symbols, {len(used)} nets")


if __name__ == "__main__":
    main()
