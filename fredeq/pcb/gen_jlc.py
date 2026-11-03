"""Export the JLCPCB fabrication and assembly files for the Fredeq board.

Writes to jlcpcb/:
  fredeq_gerbers.zip   Gerbers + Excellon drill (upload for PCB fabrication)
  fredeq_bom.csv       BOM with LCSC part numbers (upload for assembly)
  fredeq_cpl.csv       pick-and-place / CPL file (upload for assembly)

Parts without an LCSC number (the Raytac module and the GCT USB-C) are left out of the
assembly files and listed at the end: solder them by hand, or order them through JLCPCB
Global Sourcing. Coils, test pads and holes are copper/holes only and never placed.

Run with any Python 3:
    python gen_jlc.py
"""
import csv
import os
import subprocess
import tempfile
import xml.etree.ElementTree as ET
import zipfile

KICAD_CLI = r"C:\Program Files\KiCad\10.0\bin\kicad-cli.exe"
HERE = os.path.dirname(os.path.abspath(__file__))
PCB = os.path.join(HERE, "fredeq.kicad_pcb")
SCH = os.path.join(HERE, "fredeq.kicad_sch")
OUT = os.path.join(HERE, "jlcpcb")
LAYERS = "F.Cu,B.Cu,F.Paste,B.Paste,F.Silkscreen,B.Silkscreen,F.Mask,B.Mask,Edge.Cuts"

# schematic value -> LCSC part number (checked on lcsc.com / jlcpcb.com, Oct 2026). None = not on LCSC.
LCSC = {
    "LDC1612DNTR": "C1847959",
    "TMP117AIDRVR": "C699536",
    "MCP73831T-2ACI/OT": "C424093",
    "XC6206P332MR": "C5446",
    "PESD5V0S1BA": "C19224",
    "XKB TS-1187A": "C318884",          # TS-1187A-B-A-B
    "Battery": "C160402",               # JST SM02B-SRSS-TB(LF)(SN)
    "330p C0G": "C5591231",             # Yageo CC0402JRNPO0BN331, 100 V NP0
    "470p C0G": "C75274",               # FH 0402CG471J500NT, 50 V C0G
    "100n": "C1525", "1u": "C52923", "4.7u": "C19666", "10u": "C19702",
    "1k": "C11702", "4.7k": "C25900", "5.1k": "C25905", "100k": "C25741", "1M": "C26083",
    "red": "C2286", "green": "C72043",
    "MDBT42Q-512KV2": None,             # Raytac module: not stocked by LCSC
    "GCT USB4135-GF-A": None,           # not stocked by LCSC (DigiKey/Mouser: Global Sourcing)
}
NOT_PLACED = ("L", "TP", "H", "#")      # PCB coils, test pads, holes, power flags


def run(*args):
    subprocess.run([KICAD_CLI, *args], check=True, capture_output=True)


def components():
    xml = os.path.join(tempfile.gettempdir(), "fredeq_jlc_netlist.xml")
    run("sch", "export", "netlist", "--format", "kicadxml", "-o", xml, SCH)
    return [(c.get("ref"), c.findtext("value"), c.findtext("footprint").split(":")[-1])
            for c in ET.parse(xml).getroot().iter("comp")]


def main():
    os.makedirs(OUT, exist_ok=True)

    # --- Gerbers + drill -------------------------------------------------------------
    with tempfile.TemporaryDirectory() as tmp:
        run("pcb", "export", "gerbers", "--layers", LAYERS, "--subtract-soldermask", "--no-x2",
            "--use-drill-file-origin", "-o", tmp + os.sep, PCB)
        run("pcb", "export", "drill", "--format", "excellon", "--excellon-units", "mm",
            "--excellon-zeros-format", "decimal", "--excellon-oval-format", "alternate",
            "--excellon-separate-th", "--drill-origin", "plot", "-o", tmp + os.sep, PCB)
        files = sorted(os.listdir(tmp))
        with zipfile.ZipFile(os.path.join(OUT, "fredeq_gerbers.zip"), "w", zipfile.ZIP_DEFLATED) as z:
            for f in files:
                z.write(os.path.join(tmp, f), f)

    # --- BOM ------------------------------------------------------------------------------
    placed, manual, groups = set(), [], {}
    for ref, value, fp in components():
        if ref.startswith(NOT_PLACED):
            continue
        if value not in LCSC:
            raise SystemExit(f"no LCSC entry for {ref} '{value}': add it to LCSC in gen_jlc.py")
        if LCSC[value] is None:
            manual.append((ref, value))
            continue
        groups.setdefault((value, fp, LCSC[value]), []).append(ref)
        placed.add(ref)
    with open(os.path.join(OUT, "fredeq_bom.csv"), "w", newline="", encoding="utf8") as f:
        w = csv.writer(f)
        w.writerow(["Comment", "Designator", "Footprint", "LCSC Part #"])
        for (value, fp, part), refs in sorted(groups.items(), key=lambda kv: kv[1][0]):
            w.writerow([value, ",".join(sorted(refs, key=lambda r: (r.rstrip("0123456789"), int(r.lstrip("ABCDEFGHIJKLMNOPQRSTUVWXYZ") or 0)))),
                        fp, part])

    # --- CPL ------------------------------------------------------------------------------
    pos = os.path.join(tempfile.gettempdir(), "fredeq_pos.csv")
    run("pcb", "export", "pos", "--format", "csv", "--units", "mm", "--side", "front",
        "--use-drill-file-origin", "-o", pos, PCB)
    rows = list(csv.DictReader(open(pos, encoding="utf8")))
    with open(os.path.join(OUT, "fredeq_cpl.csv"), "w", newline="", encoding="utf8") as f:
        w = csv.writer(f)
        w.writerow(["Designator", "Mid X", "Mid Y", "Layer", "Rotation"])
        for r in rows:
            if r["Ref"] in placed:
                w.writerow([r["Ref"], f'{float(r["PosX"]):.4f}mm', f'{float(r["PosY"]):.4f}mm', "Top",
                            f'{float(r["Rot"]) % 360:.1f}'])

    missing = placed - {r["Ref"] for r in rows}
    print(f"gerbers: {len(files)} files -> {os.path.join(OUT, 'fredeq_gerbers.zip')}")
    print(f"BOM: {len(groups)} lines, {len(placed)} parts placed by JLCPCB")
    print(f"CPL: {sum(r['Ref'] in placed for r in rows)} placements" + (f", MISSING {sorted(missing)}" if missing else ""))
    print("hand-solder / Global Sourcing:", ", ".join(f"{r} ({v})" for r, v in manual))


if __name__ == "__main__":
    main()
