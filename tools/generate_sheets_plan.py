import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

wb = openpyxl.Workbook()

# Setup styles
font_title = Font(name='Arial', size=16, bold=True, color='1E293B')
font_subtitle = Font(name='Arial', size=10, italic=True, color='64748B')
font_section = Font(name='Arial', size=11, bold=True, color='FFFFFF')
font_header = Font(name='Arial', size=10, bold=True, color='0F172A')
font_bold = Font(name='Arial', size=10, bold=True, color='0F172A')
font_regular = Font(name='Arial', size=10, color='334155')
font_kpi_num = Font(name='Arial', size=12, bold=True, color='0F172A')
font_kpi_win = Font(name='Arial', size=12, bold=True, color='15803D')

fill_section = PatternFill(start_color='0F172A', end_color='0F172A', fill_type='solid') # Slate 900
fill_accent = PatternFill(start_color='F59E0B', end_color='F59E0B', fill_type='solid')  # Amber 500
fill_header = PatternFill(start_color='F1F5F9', end_color='F1F5F9', fill_type='solid')  # Slate 100
fill_highlight = PatternFill(start_color='FEF3C7', end_color='FEF3C7', fill_type='solid') # Amber 100
fill_green = PatternFill(start_color='DCFCE7', end_color='DCFCE7', fill_type='solid')   # Emerald 100

thin_border = Border(
    left=Side(style='thin', color='CBD5E1'),
    right=Side(style='thin', color='CBD5E1'),
    top=Side(style='thin', color='CBD5E1'),
    bottom=Side(style='thin', color='CBD5E1')
)
top_thick_bottom_double = Border(
    top=Side(style='thin', color='0F172A'),
    bottom=Side(style='double', color='0F172A')
)

align_left = Alignment(horizontal='left', vertical='center')
align_right = Alignment(horizontal='right', vertical='center')
align_center = Alignment(horizontal='center', vertical='center')

# ==========================================
# TAB 1: FINANCIEEL PLAN & SCENARIO'S
# ==========================================
ws1 = wb.active
ws1.title = "Scenario Analyse"
ws1.views.sheetView[0].showGridLines = True

# Title block
ws1['B2'] = "👑 SLOPER KING™ — FINANCIEEL PLAN & SCENARIO-ANALYSE"
ws1['B2'].font = font_title
ws1['B3'] = "D2C Webshop verkoop | Autonome financiering LA 2028 Paralympische campagne"
ws1['B3'].font = font_subtitle

# Headers
headers = [
    "Parameter / Kostentype",
    "Formule / Eenheid",
    "Scenario 1 (10 / 10)",
    "Scenario 2 (20 / 20)",
    "Scenario 3 (30 / 30)"
]
for col_idx, h in enumerate(headers, start=2):
    cell = ws1.cell(row=5, column=col_idx, value=h)
    cell.font = font_header
    cell.fill = fill_highlight if col_idx >= 4 else fill_header
    cell.alignment = align_center if col_idx >= 4 else align_left
    cell.border = thin_border

# Section: Verkoopvolume
rows_data = [
    ("VERKOOPVOLUMES (PER MAAND)", "CATEGORY_HEADER"),
    ("Verkochte Single Units (1x)", "stuks/mnd", 10, 20, 30),
    ("Verkochte Complete Pairs (2x)", "stuks/mnd", 10, 20, 30),
    ("Totaal Aantal Bestellingen (Orders)", "=C7+C8", "=C7+C8", "=D7+D8", "=E7+E8"),
    
    ("PRIJZEN & UNIT ECONOMICS", "CATEGORY_HEADER"),
    ("Verkoopprijs Single Unit", "EUR / stuk", 21.00, 21.00, 21.00),
    ("Verkoopprijs Complete Pair", "EUR / set", 39.00, 39.00, 39.00),
    ("COGS Single Unit (Prod + Verpakking)", "EUR / stuk", 3.50, 3.50, 3.30),
    ("COGS Complete Pair (Prod + Verpakking)", "EUR / set", 5.50, 5.50, 5.20),
    ("Stripe Transactiekost Single", "EUR (1.5% + 0.25)", "=C11*0.015+0.25", "=D11*0.015+0.25", "=E11*0.015+0.25"),
    ("Stripe Transactiekost Pair", "EUR (1.5% + 0.25)", "=C12*0.015+0.25", "=D12*0.015+0.25", "=E12*0.015+0.25"),
    ("Netto Verzendsubsidie per order", "EUR / order", 1.00, 1.00, 0.90),

    ("1. INKOMSTEN (BRUTO OMZET)", "CATEGORY_HEADER"),
    ("Omzet Single Units", "EUR", "=C7*C11", "=D7*D11", "=E7*E11"),
    ("Omzet Complete Pairs", "EUR", "=C8*C12", "=D8*D12", "=E8*E12"),
    ("TOTALE BRUTO INKOMSTEN / MND", "EUR", "=C19+C20", "=D19+D20", "=E19+E20"),
    ("TOTALE BRUTO INKOMSTEN / JAAR", "EUR", "=C21*12", "=D21*12", "=E21*12"),

    ("2. KOSTEN OVERZICHT (PER TYPE)", "CATEGORY_HEADER"),
    ("Productiekosten (COGS)", "EUR", "=(C7*C13)+(C8*C14)", "=(D7*D13)+(D8*D14)", "=(E7*E13)+(E8*E14)"),
    ("Stripe Betalingskosten", "EUR", "=(C7*C15)+(C8*C16)", "=(D7*D15)+(D8*D16)", "=(E7*E15)+(E8*E16)"),
    ("Verzendsubsidie & Logistiek", "EUR", "=C9*C17", "=D9*D17", "=E9*E17"),
    ("Social Media Marketing (Meta Ads / Boosts)", "EUR / mnd", 100.00, 250.00, 450.00),
    ("Vaste Kosten (SaaS / Hosting / Tooling)", "EUR / mnd", 40.00, 45.00, 50.00),
    ("TOTALE KOSTEN / MND", "EUR", "=SUM(C25:C29)", "=SUM(D25:D29)", "=SUM(E25:E29)"),
    ("TOTALE KOSTEN / JAAR", "EUR", "=C30*12", "=D30*12", "=E30*12"),

    ("3. WINSTGEVENDHEID (NETTO RESULTAAT)", "CATEGORY_HEADER"),
    ("NETTO WINST PER MAAND", "EUR", "=C21-C30", "=D21-D30", "=E21-E30"),
    ("NETTO WINST PER JAAR", "EUR", "=C34*12", "=D34*12", "=E34*12"),
    ("NETTO WINSTMARGE (%)", "%", "=C34/C21", "=D34/D21", "=E34/E21")
]

current_row = 6
for item in rows_data:
    if item[1] == "CATEGORY_HEADER":
        # Section header
        ws1.merge_cells(start_row=current_row, start_column=2, end_row=current_row, end_column=6)
        cell = ws1.cell(row=current_row, column=2, value=item[0])
        cell.font = font_section
        cell.fill = fill_section
        cell.alignment = align_left
    else:
        label, unit, s1, s2, s3 = item
        ws1.cell(row=current_row, column=2, value=label).font = font_bold if "TOTAAL" in label or "NETTO" in label else font_regular
        ws1.cell(row=current_row, column=3, value=unit).font = font_subtitle
        ws1.cell(row=current_row, column=3).alignment = align_center

        for col_idx, val in enumerate([s1, s2, s3], start=4):
            c = ws1.cell(row=current_row, column=col_idx, value=val)
            c.border = thin_border
            
            # Format numbers
            if "MARGE" in label:
                c.number_format = '0.0%'
                c.font = font_kpi_win
                c.fill = fill_green
            elif "EUR" in unit:
                c.number_format = '€#,##0.00'
                if "NETTO WINST" in label:
                    c.font = font_kpi_win
                    c.fill = fill_green
                    c.border = top_thick_bottom_double
                elif "TOTAAL" in label:
                    c.font = font_kpi_num
                    c.fill = fill_highlight
                else:
                    c.font = font_regular
            else:
                c.number_format = '#,##0'
                c.font = font_regular

    current_row += 1

# ==========================================
# TAB 2: COGS & UNIT ECONOMICS DETAIL
# ==========================================
ws2 = wb.create_sheet(title="COGS Detail")
ws2.views.sheetView[0].showGridLines = True

ws2['B2'] = "🔬 COGS & PRODUCTIEKOSTEN DETAIL (BAMBUM INNOVATION)"
ws2['B2'].font = font_title
ws2['B3'] = "Kostprijsopbouw per fysiek onderdeel en verpakking"
ws2['B3'].font = font_subtitle

cogs_headers = ["Onderdeel / Materiaal", "Leverancier / Specificatie", "Kost Single (1x)", "Kost Paar (2x)", "Toelichting"]
for col_idx, h in enumerate(cogs_headers, start=2):
    c = ws2.cell(row=5, column=col_idx, value=h)
    c.font = font_header
    c.fill = fill_header
    c.border = thin_border

cogs_data = [
    ("PLA Filament (Matzwart)", "eSUN / Bambu Lab (~76g/unit)", 0.93, 1.86, "Duurzaam bioplastic PLA"),
    ("Schuurpapier (220-grit)", "CROP GoldX rol", 0.14, 0.28, "Contactstrip voor sloperwrijving"),
    ("Draagkoord (4mm, 800kg)", "Petzl semi-statisch (Deporvillage)", 0.37, 0.74, "High-tensile semi-statisch koord"),
    ("Katoenen Draagtasje", "Custom fabric bag + BamBum stempel", 0.00, 0.60, "Exclusief bij complete set van 2"),
    ("Laser Stickers & Productlabels", "Zwart op wit custom badges", 0.50, 1.00, "Branding & mascotte kroon"),
    ("Quickstart & Biomechanics Guide", "Pocket card 8.5x12cm + QR video", 0.70, 0.70, "Met directe link naar video's"),
    ("Verzendverpakking (Doosje/Tape)", "Brievenbusdoosje + bescherming", 0.86, 0.32, "Stevige verzendbescherming"),
    ("TOTAAL PRODUCTIEKOST (COGS)", "Per eenheid", "=SUM(D6:D12)", "=SUM(E6:E12)", "100% verpakt en klaar voor verzending")
]

for row_idx, row_val in enumerate(cogs_data, start=6):
    is_total = (row_idx == 13)
    ws2.cell(row=row_idx, column=2, value=row_val[0]).font = font_bold if is_total else font_regular
    ws2.cell(row=row_idx, column=3, value=row_val[1]).font = font_subtitle
    
    c_single = ws2.cell(row=row_idx, column=4, value=row_val[2])
    c_single.number_format = '€#,##0.00'
    c_single.font = font_kpi_num if is_total else font_regular
    c_single.border = top_thick_bottom_double if is_total else thin_border
    if is_total: c_single.fill = fill_highlight
    
    c_pair = ws2.cell(row=row_idx, column=5, value=row_val[3])
    c_pair.number_format = '€#,##0.00'
    c_pair.font = font_kpi_num if is_total else font_regular
    c_pair.border = top_thick_bottom_double if is_total else thin_border
    if is_total: c_pair.fill = fill_highlight

    ws2.cell(row=row_idx, column=6, value=row_val[4]).font = font_regular

# ==========================================
# TAB 3: VERZENDKOSTEN & LANDEN
# ==========================================
ws3 = wb.create_sheet(title="Verzendkosten EU")
ws3.views.sheetView[0].showGridLines = True

ws3['B2'] = "🌍 VERZENDKOSTEN STRATEGIE PER BESTEMMING (EU)"
ws3['B2'].font = font_title
ws3['B3'] = "Transportkosten vs. klanttarief en margeabsorptie (<300g brievenbus/pakket)"
ws3['B3'].font = font_subtitle

shipping_headers = ["Bestemming (Land)", "Vervoerder Opties", "Reële Transportkost", "Klantentooling (Webshop)", "Verschil (Subsidie)", "Psychologische Drempel"]
for col_idx, h in enumerate(shipping_headers, start=2):
    c = ws3.cell(row=5, column=col_idx, value=h)
    c.font = font_header
    c.fill = fill_header
    c.border = thin_border

shipping_data = [
    ("België (Leuven Afhaling)", "Lokaal op afspraak", 0.00, 0.00, "=E6-D6", "Gratis afhaalpunt"),
    ("België (bpost Tracked)", "bpost brievenbus/pakket", 4.75, 3.99, "=E7-D7", "Lage binnenlandse drempel"),
    ("Nederland (NL)", "PostNL / DPD Tracked", 6.00, 4.95, "=E8-D8", "Zeer prijsgevoelig (max €5)"),
    ("Duitsland (DE)", "DHL Paket / DPD", 7.15, 4.95, "=E9-D9", "Standaard €5 voor klimtools"),
    ("Frankrijk (Mondial Relay)", "Point Relais / Lockers", 4.50, 3.95, "=E10-D10", "Populairste methode in FR"),
    ("Frankrijk (Thuislevering)", "Colissimo / DPD", 8.00, 5.50, "=E11-D11", "Thuislevering met tracking"),
    ("Oostenrijk (AUT)", "Post AT / DPD", 9.35, 6.95, "=E12-D12", "Innsbruck klimhub gewend aan EU shipping"),
    ("Italië (IT)", "Poste Italiane / DPD", 10.35, 6.95, "=E13-D13", "Niche hardware import geaccepteerd"),
    ("Spanje (ES)", "SEUR / Correos / DPD", 10.35, 6.95, "=E14-D14", "Siurana/Catalunya klimregio")
]

for row_idx, row_val in enumerate(shipping_data, start=6):
    ws3.cell(row=row_idx, column=2, value=row_val[0]).font = font_bold
    ws3.cell(row=row_idx, column=3, value=row_val[1]).font = font_regular
    
    c_real = ws3.cell(row=row_idx, column=4, value=row_val[2])
    c_real.number_format = '€#,##0.00'
    c_real.font = font_regular
    c_real.border = thin_border
    
    c_client = ws3.cell(row=row_idx, column=5, value=row_val[3])
    c_client.number_format = '€#,##0.00'
    c_client.font = font_kpi_num
    c_client.fill = fill_highlight
    c_client.border = thin_border

    c_diff = ws3.cell(row=row_idx, column=6, value=row_val[4])
    c_diff.number_format = '€#,##0.00'
    c_diff.font = font_regular
    c_diff.border = thin_border

    ws3.cell(row=row_idx, column=7, value=row_val[5]).font = font_subtitle

# Auto-adjust column widths
for ws in [ws1, ws2, ws3]:
    for col in ws.columns:
        max_len = max(len(str(cell.value or '')) for cell in col)
        col_letter = get_column_letter(col[0].column)
        ws.column_dimensions[col_letter].width = max(max_len + 3, 12)

# Specific column adjustments
ws1.column_dimensions['B'].width = 42
ws1.column_dimensions['C'].width = 24
ws1.column_dimensions['D'].width = 22
ws1.column_dimensions['E'].width = 22
ws1.column_dimensions['F'].width = 22

ws2.column_dimensions['B'].width = 34
ws2.column_dimensions['C'].width = 38
ws2.column_dimensions['D'].width = 18
ws2.column_dimensions['E'].width = 18
ws2.column_dimensions['F'].width = 38

ws3.column_dimensions['B'].width = 30
ws3.column_dimensions['C'].width = 30
ws3.column_dimensions['D'].width = 20
ws3.column_dimensions['E'].width = 24
ws3.column_dimensions['F'].width = 20
ws3.column_dimensions['G'].width = 42

output_path = "Sloper King/financieel/Sloper_King_Financieel_Plan.xlsx"
wb.save(output_path)
print(f"Successfully generated: {output_path}")
