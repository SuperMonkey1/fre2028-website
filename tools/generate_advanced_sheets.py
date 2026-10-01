import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

def create_financial_workbook():
    wb = openpyxl.Workbook()

    # Professional styles
    font_title = Font(name='Arial', size=14, bold=True, color='0F172A')
    font_subtitle = Font(name='Arial', size=9, italic=True, color='64748B')
    font_section = Font(name='Arial', size=10, bold=True, color='FFFFFF')
    font_header = Font(name='Arial', size=10, bold=True, color='0F172A')
    font_bold = Font(name='Arial', size=10, bold=True, color='0F172A')
    font_regular = Font(name='Arial', size=10, color='334155')
    font_kpi_win = Font(name='Arial', size=11, bold=True, color='15803D')
    font_kpi_num = Font(name='Arial', size=10, bold=True, color='0F172A')

    fill_section = PatternFill(start_color='0F172A', end_color='0F172A', fill_type='solid') # Slate 900
    fill_header = PatternFill(start_color='F1F5F9', end_color='F1F5F9', fill_type='solid')  # Slate 100
    fill_highlight = PatternFill(start_color='FEF3C7', end_color='FEF3C7', fill_type='solid') # Amber 100
    fill_green = PatternFill(start_color='DCFCE7', end_color='DCFCE7', fill_type='solid')   # Emerald 100
    fill_blue = PatternFill(start_color='E0F2FE', end_color='E0F2FE', fill_type='solid')    # Sky 100

    thin_border = Border(
        left=Side(style='thin', color='CBD5E1'),
        right=Side(style='thin', color='CBD5E1'),
        top=Side(style='thin', color='CBD5E1'),
        bottom=Side(style='thin', color='CBD5E1')
    )
    double_bottom_border = Border(
        left=Side(style='thin', color='CBD5E1'),
        right=Side(style='thin', color='CBD5E1'),
        top=Side(style='thin', color='CBD5E1'),
        bottom=Side(style='double', color='0F172A')
    )

    align_left = Alignment(horizontal='left', vertical='center')
    align_right = Alignment(horizontal='right', vertical='center')
    align_center = Alignment(horizontal='center', vertical='center')

    # =========================================================================
    # TAB 1: OVERZICHT & SCENARIO'S (STRICTLY FROM COLUMN A, ROW 1)
    # =========================================================================
    ws1 = wb.active
    ws1.title = "Overzicht & Scenario's"
    ws1.views.sheetView[0].showGridLines = True

    ws1['A1'] = "👑 SLOPER KING™ — OVERZICHT & SCENARIO ANALYSE (SINGLE VS. PAIR)"
    ws1['A1'].font = font_title
    ws1['A2'] = "D2C Webshop verkoop | Uitsplitsing per producttype (Single Unit vs. Complete Pair) per scenario"
    ws1['A2'].font = font_subtitle

    # Row 3: Super Headers for Scenarios
    ws1.merge_cells('C3:D3')
    ws1['C3'] = "SCENARIO 1 (10 Single / 10 Pair)"
    ws1['C3'].font = font_header
    ws1['C3'].fill = fill_highlight
    ws1['C3'].alignment = align_center

    ws1.merge_cells('E3:F3')
    ws1['E3'] = "SCENARIO 2 (20 Single / 20 Pair)"
    ws1['E3'].font = font_header
    ws1['E3'].fill = fill_highlight
    ws1['E3'].alignment = align_center

    ws1.merge_cells('G3:H3')
    ws1['G3'] = "SCENARIO 3 (30 Single / 30 Pair)"
    ws1['G3'].font = font_header
    ws1['G3'].fill = fill_highlight
    ws1['G3'].alignment = align_center

    for c_i in range(3, 9):
        ws1.cell(row=3, column=c_i).border = thin_border

    headers_ws1 = [
        "Parameter / Kostenpost", 
        "Bron / Eenheid", 
        "Single (10x)", "Pair (10x)", 
        "Single (20x)", "Pair (20x)", 
        "Single (30x)", "Pair (30x)"
    ]
    for col_idx, h in enumerate(headers_ws1, start=1):
        c = ws1.cell(row=4, column=col_idx, value=h)
        c.font = font_header
        c.fill = fill_highlight if col_idx >= 3 else fill_header
        c.alignment = align_center if col_idx >= 3 else align_left
        c.border = thin_border

    structure_ws1 = [
        # Row 5: Category
        ("VERKOOPVOLUMES (PER MAAND)", "CATEGORY"),
        # Row 6
        ("Verkocht Volume (Orders / mnd)", "stuks/mnd", 10, 10, 20, 20, 30, 30),
        
        # Row 7: Category
        ("UNIT ECONOMICS & PRIJZEN", "CATEGORY"),
        # Row 8
        ("Verkoopprijs per Unit", "EUR / stuk", 24.95, 44.95, 24.95, 44.95, 24.95, 44.95),
        # Row 9
        ("COGS per Unit (Materiaalkost)", "EUR / stuk", "='COGS Detail'!E13", "='COGS Detail'!G13", "='COGS Detail'!E13", "='COGS Detail'!G13", "='COGS Detail'!E13", "='COGS Detail'!G13"),
        # Row 10
        ("Stripe Transactiekost per Order", "EUR / order", "=C8*0.015+0.25", "=D8*0.015+0.25", "=E8*0.015+0.25", "=F8*0.015+0.25", "=G8*0.015+0.25", "=H8*0.015+0.25"),
        # Row 11
        ("Gemiddelde Verzendsubsidie per order", "EUR / order", "='Verzendkosten'!G15", "='Verzendkosten'!G15", "='Verzendkosten'!G15", "='Verzendkosten'!G15", "='Verzendkosten'!G15", "='Verzendkosten'!G15"),
        
        # Row 12: Category
        ("1. INKOMSTEN (BRUTO OMZET)", "CATEGORY"),
        # Row 13
        ("Bruto Omzet per Maand", "EUR / mnd", "=C6*C8", "=D6*D8", "=E6*E8", "=F6*F8", "=G6*G8", "=H6*H8"),
        # Row 14
        ("Bruto Omzet per Jaar", "EUR / jaar", "=C13*12", "=D13*12", "=E13*12", "=F13*12", "=G13*12", "=H13*12"),
        
        # Row 15: Category
        ("2. KOSTEN OVERZICHT (PER TYPE & VERDEELD)", "CATEGORY"),
        # Row 16
        ("Productiekosten (COGS)", "EUR / mnd", "=C6*C9", "=D6*D9", "=E6*E9", "=F6*F9", "=G6*G9", "=H6*H9"),
        # Row 17
        ("Stripe Betalingskosten", "EUR / mnd", "=C6*C10", "=D6*D10", "=E6*E10", "=F6*F10", "=G6*G10", "=H6*H10"),
        # Row 18
        ("Verzendsubsidie & Logistiek", "EUR / mnd", "=C6*C11", "=D6*D11", "=E6*E11", "=F6*F11", "=G6*G11", "=H6*H11"),
        # Row 19
        ("Social Media Marketing (Meta Ads split)", "EUR / mnd", 50.00, 50.00, 125.00, 125.00, 225.00, 225.00),
        # Row 20
        ("Vaste Kosten & Afschrijving (50/50 split)", "EUR / mnd", "='Investeringen'!F14/2", "='Investeringen'!F14/2", "='Investeringen'!F14/2", "='Investeringen'!F14/2", "='Investeringen'!F14/2", "='Investeringen'!F14/2"),
        # Row 21
        ("TOTALE KOSTEN PER MAAND", "EUR / mnd", "=SUM(C16:C20)", "=SUM(D16:D20)", "=SUM(E16:E20)", "=SUM(F16:F20)", "=SUM(G16:G20)", "=SUM(H16:H20)"),
        # Row 22
        ("TOTALE KOSTEN PER JAAR", "EUR / jaar", "=C21*12", "=D21*12", "=E21*12", "=F21*12", "=G21*12", "=H21*12"),
        
        # Row 23: Category
        ("3. NETTO RESULTAAT PER PRODUCTTYPE", "CATEGORY"),
        # Row 24
        ("NETTO WINST PER MAAND", "EUR / mnd", "=C13-C21", "=D13-D21", "=E13-E21", "=F13-F21", "=G13-G21", "=H13-H21"),
        # Row 25
        ("NETTO WINST PER JAAR", "EUR / jaar", "=C24*12", "=D24*12", "=E24*12", "=F24*12", "=G24*12", "=H24*12"),
        # Row 26
        ("NETTO WINSTMARGE (%)", "%", "=C24/C13", "=D24/D13", "=E24/E13", "=F24/F13", "=G24/G13", "=H24/H13"),
        
        # Row 27: Category
        ("4. GECOMBINEERD SCENARIO TOTAAL (SINGLE + PAIR SAMEN)", "CATEGORY"),
        # Row 28
        ("Totale Gecombineerde Omzet / Maand", "EUR / mnd", "=C13+D13", "=C13+D13", "=E13+F13", "=E13+F13", "=G13+H13", "=G13+H13"),
        # Row 29
        ("Totale Gecombineerde Kosten / Maand", "EUR / mnd", "=C21+D21", "=C21+D21", "=E21+F21", "=E21+F21", "=G21+H21", "=G21+H21"),
        # Row 30
        ("TOTALE NETTO WINST PER MAAND", "EUR / mnd", "=C24+D24", "=C24+D24", "=E24+F24", "=E24+F24", "=G24+H24", "=G24+H24"),
        # Row 31
        ("TOTALE NETTO WINST PER JAAR", "EUR / jaar", "=C30*12", "=C30*12", "=E30*12", "=E30*12", "=G30*12", "=G30*12"),
        # Row 32
        ("GEZAMENLIJKE WINSTMARGE (%)", "%", "=C30/C28", "=C30/C28", "=E30/E28", "=E30/E28", "=G30/G28", "=G30/G28")
    ]

    for row_idx, r_info in enumerate(structure_ws1, start=5):
        if r_info[1] == "CATEGORY":
            ws1.merge_cells(start_row=row_idx, start_column=1, end_row=row_idx, end_column=8)
            c = ws1.cell(row=row_idx, column=1, value=r_info[0])
            c.font = font_section
            c.fill = fill_section
            c.alignment = align_left
        else:
            lbl = r_info[0]
            unit = r_info[1]
            vals = r_info[2:]
            
            is_total = "TOTAAL" in lbl or "NETTO" in lbl
            is_combined = row_idx >= 28
            
            c_lbl = ws1.cell(row=row_idx, column=1, value=lbl)
            c_lbl.font = font_bold if (is_total or is_combined) else font_regular
            c_lbl.border = thin_border
            
            c_u = ws1.cell(row=row_idx, column=2, value=unit)
            c_u.font = font_subtitle
            c_u.alignment = align_center
            c_u.border = thin_border

            for c_i, val in enumerate(vals, start=3):
                c = ws1.cell(row=row_idx, column=c_i, value=val)
                c.border = double_bottom_border if ("NETTO WINST" in lbl) else thin_border
                
                if "%" in unit or "MARGE" in lbl:
                    c.number_format = '0.0%'
                    c.font = font_kpi_win
                    c.fill = fill_green
                    c.alignment = align_center
                elif "EUR" in unit or "COGS" in lbl or "Omzet" in lbl or "TOTALE" in lbl or "WINST" in lbl:
                    c.number_format = '€#,##0.00'
                    c.alignment = align_right
                    if "NETTO WINST" in lbl:
                        c.font = font_kpi_win
                        c.fill = fill_green
                    elif is_total or is_combined:
                        c.font = font_kpi_num
                        c.fill = fill_highlight
                    else:
                        c.font = font_regular
                elif "stuks" in unit or "orders" in unit:
                    c.number_format = '#,##0'
                    c.font = font_bold if is_total else font_regular
                    c.alignment = align_center
                else:
                    c.number_format = '€#,##0.00'
                    c.alignment = align_right

    # Merge combined rows across the scenario pairs (C28:D28, E28:F28, G28:H28, etc.)
    for r_idx in range(28, 33):
        ws1.merge_cells(start_row=r_idx, start_column=3, end_row=r_idx, end_column=4)
        ws1.merge_cells(start_row=r_idx, start_column=5, end_row=r_idx, end_column=6)
        ws1.merge_cells(start_row=r_idx, start_column=7, end_row=r_idx, end_column=8)


    # =========================================================================
    # TAB 2: COGS DETAIL (STRICTLY FROM COLUMN A, ROW 1)
    # =========================================================================
    ws2 = wb.create_sheet(title="COGS Detail")
    ws2.views.sheetView[0].showGridLines = True

    ws2['A1'] = "🔬 COGS DETAIL & STUKSPRIJS BEREKENING"
    ws2['A1'].font = font_title
    ws2['A2'] = "Exacte materiaalkosten per onderdeel en vergelijking Single Unit vs. Complete Pair"
    ws2['A2'].font = font_subtitle

    cogs_cols = ["Onderdeel / Materiaal", "Specificatie & Leverancier", "Basiskost per Item", "Aantal Single (1x)", "Kost Single (1x)", "Aantal Pair (2x)", "Kost Pair (2x)", "Opmerking"]
    for col_idx, h in enumerate(cogs_cols, start=1):
        c = ws2.cell(row=4, column=col_idx, value=h)
        c.font = font_header
        c.fill = fill_header
        c.border = thin_border

    cogs_rows = [
        # Row 5
        ("PLA Filament", "eSUN / Bambu Lab (~76g/unit)", 0.94, 1, "=C5*D5", 2, "=C5*F5", "0.94 per geprinte unit"),
        # Row 6
        ("Sand paper (GoldX)", "CROP GoldX 220-grit contactstrip", 0.14, 1, "=C6*D6", 2, "=C6*F6", "0.14 per contactstrip"),
        # Row 7
        ("Rope (Semi-statisch 4mm)", "Petzl 800kg load cord", 0.43, 1, "=C7*D7", 2, "=C7*F7", "0.43 per voorgemonteerd koord"),
        # Row 8
        ("Laser print / Sticker", "Zwart op wit laser badge", 0.50, 1, "=C8*D8", 2, "=C8*F8", "0.50 per unit branding"),
        # Row 9
        ("Double naamkaartje", "Instructie & QR quickstart", 0.25, 1, "=C9*D9", 1, "=C9*F9", "Slechts 1x per bestelling/doos"),
        # Row 10
        ("Cotton bag + Stamp", "Katoenen draagtasje met BamBum stempel", 0.67, 0, "=C10*D10", 1, "=C10*F10", "Enkel inbegrepen bij Pair (1x)"),
        # Row 11
        ("Verzendzakje / Doosje", "Brievenbusverpakking", 0.67, 1, "=C11*D11", 0, "=C11*F11", "Single verpakking")
    ]

    for row_idx, r in enumerate(cogs_rows, start=5):
        ws2.cell(row=row_idx, column=1, value=r[0]).font = font_bold
        ws2.cell(row=row_idx, column=2, value=r[1]).font = font_subtitle
        
        c_base = ws2.cell(row=row_idx, column=3, value=r[2])
        c_base.number_format = '€#,##0.00'
        c_base.font = font_regular
        
        c_q1 = ws2.cell(row=row_idx, column=4, value=r[3])
        c_q1.number_format = '#,##0'
        c_q1.alignment = align_center
        
        c_k1 = ws2.cell(row=row_idx, column=5, value=r[4])
        c_k1.number_format = '€#,##0.00'
        c_k1.font = font_bold
        
        c_q2 = ws2.cell(row=row_idx, column=6, value=r[5])
        c_q2.number_format = '#,##0'
        c_q2.alignment = align_center
        
        c_k2 = ws2.cell(row=row_idx, column=7, value=r[6])
        c_k2.number_format = '€#,##0.00'
        c_k2.font = font_bold
        
        ws2.cell(row=row_idx, column=8, value=r[7]).font = font_subtitle
        
        for c_i in range(1, 9):
            ws2.cell(row=row_idx, column=c_i).border = thin_border

    # Row 13: Totals
    ws2.cell(row=13, column=1, value="TOTALE UNIT COST (COGS)").font = font_title
    ws2.cell(row=13, column=2, value="Productiekost per verpakte eenheid").font = font_subtitle
    ws2.cell(row=13, column=3, value="-").alignment = align_center
    ws2.cell(row=13, column=4, value="1x Single").alignment = align_center

    c_tot_s = ws2.cell(row=13, column=5, value="=SUM(E5:E11)")
    c_tot_s.number_format = '€#,##0.00'
    c_tot_s.font = font_kpi_num
    c_tot_s.fill = fill_highlight

    ws2.cell(row=13, column=6, value="1x Pair").alignment = align_center

    c_tot_p = ws2.cell(row=13, column=7, value="=SUM(G5:G11)")
    c_tot_p.number_format = '€#,##0.00'
    c_tot_p.font = font_kpi_num
    c_tot_p.fill = fill_highlight

    ws2.cell(row=13, column=8, value="Gevalideerd: Single €2.93 | Pair €4.95").font = font_kpi_win

    for c_i in range(1, 9):
        ws2.cell(row=13, column=c_i).border = double_bottom_border


    # =========================================================================
    # TAB 3: UITGAVEN & INKOOP
    # =========================================================================
    ws3 = wb.create_sheet(title="Uitgaven & Inkoop")
    ws3.views.sheetView[0].showGridLines = True

    ws3['A1'] = "🛒 UITGAVEN & INKOOP LOGBOEK (BATCHES)"
    ws3['A1'].font = font_title
    ws3['A2'] = "Inkoop van grondstoffen, materialen en bulkorders ter herberekening van de eenheidskosten"
    ws3['A2'].font = font_subtitle

    exp_cols = ["Datum / Bestelling", "Leverancier / Winkel", "Gekocht Materiaal", "Totaalbedrag Factuur (EUR)", "Aantal Eenheden in Batch", "Berekende Kost per Stuk (EUR)", "Koppeling naar COGS Item"]
    for col_idx, h in enumerate(exp_cols, start=1):
        c = ws3.cell(row=4, column=col_idx, value=h)
        c.font = font_header
        c.fill = fill_header
        c.border = thin_border

    exp_rows = [
        ("Batch 1 Inkoop", "eSUN / 3DPrima", "Matzwart PLA Filament (10x 1kg spoelen)", 188.00, 200, "=D5/E5", "PLA Filament (€0.94 / unit)"),
        ("Batch 1 Inkoop", "CROP", "GoldX 220-Grit Schuurpapier rol (25m)", 35.00, 250, "=D6/E6", "Sand paper (€0.14 / strip)"),
        ("Batch 1 Inkoop", "Deporvillage", "Petzl 4mm Semi-statisch koord (100m)", 50.59, 118, "=D7/E7", "Rope (€0.43 / stuk)"),
        ("Batch 1 Inkoop", "Custom Textiel", "Katoenen zakjes + BamBum Stempel (100 stuks)", 67.00, 100, "=D8/E8", "Cotton bag + Stamp (€0.67)"),
        ("Batch 1 Inkoop", "Laser Service", "Matzwarte Laser Stickers (200 stuks)", 100.00, 200, "=D9/E9", "Laser print (€0.50 / unit)"),
        ("Batch 1 Inkoop", "Drukkerij", "Double-sided Quickstart Kaartjes (400 stuks)", 100.00, 400, "=D10/E10", "Double naamkaartje (€0.25)"),
        ("Batch 1 Inkoop", "Temu", "Verzendzakjes 20x25cm (50 stuks test)", 33.50, 50, "=D11/E11", "Verzendzakje (€0.67)")
    ]

    for row_idx, exp in enumerate(exp_rows, start=5):
        ws3.cell(row=row_idx, column=1, value=exp[0]).font = font_bold
        ws3.cell(row=row_idx, column=2, value=exp[1]).font = font_regular
        ws3.cell(row=row_idx, column=3, value=exp[2]).font = font_regular
        
        c_tot = ws3.cell(row=row_idx, column=4, value=exp[3])
        c_tot.number_format = '€#,##0.00'
        c_tot.font = font_regular
        
        c_qty = ws3.cell(row=row_idx, column=5, value=exp[4])
        c_qty.number_format = '#,##0'
        c_qty.alignment = align_center
        
        c_unit = ws3.cell(row=row_idx, column=6, value=f"=D{row_idx}/E{row_idx}")
        c_unit.number_format = '€#,##0.00'
        c_unit.font = font_bold
        c_unit.fill = fill_highlight
        
        ws3.cell(row=row_idx, column=7, value=exp[6]).font = font_subtitle
        
        for c_i in range(1, 8):
            ws3.cell(row=row_idx, column=c_i).border = thin_border

    ws3.cell(row=13, column=1, value="TOTAAL GEÏNVESTEERD IN VOORRAAD").font = font_bold
    c_exp_tot = ws3.cell(row=13, column=4, value="=SUM(D5:D11)")
    c_exp_tot.number_format = '€#,##0.00'
    c_exp_tot.font = font_kpi_num
    c_exp_tot.fill = fill_highlight

    for c_i in range(1, 8):
        ws3.cell(row=13, column=c_i).border = double_bottom_border


    # =========================================================================
    # TAB 4: INVESTERINGEN (CAPEX)
    # =========================================================================
    ws4 = wb.create_sheet(title="Investeringen")
    ws4.views.sheetView[0].showGridLines = True

    ws4['A1'] = "🛠️ VASTE INVESTERINGEN & TOOLING (CAPEX)"
    ws4['A1'].font = font_title
    ws4['A2'] = "Overzicht van vaste apparatuur, tooling tests en maandelijkse afschrijving"
    ws4['A2'].font = font_subtitle

    inv_cols = ["Investering / Tool", "Categorie", "Kostprijs (EUR)", "Status / Toelichting", "Afschrijvingstermijn (Mnd)", "Maandelijkse Kost (EUR)"]
    for col_idx, h in enumerate(inv_cols, start=1):
        c = ws4.cell(row=4, column=col_idx, value=h)
        c.font = font_header
        c.fill = fill_header
        c.border = thin_border

    inv_rows = [
        ("Rollagers voor spool holder", "Hardware Mod", 6.00, "Spool holder upgrade", 12, "=C5/E5"),
        ("Printer A1 mini", "3D Printer", 0.00, "Reeds in bezit / €0 initiële investering", 12, "=C6/E6"),
        ("Temu zakjes test (20x25cm en 50)", "Verpakking Test", 27.19, "Testverpakking sample batch", 6, "=C7/E7"),
        ("Double sided tape test", "Materiaal Test", 17.19, "Montagetape schuurpapier hechting", 6, "=C8/E8"),
        ("Hot cutter", "Tooling & Snijapparatuur", 58.99, "Professionele touwsnijder / smeltbrander", 24, "=C9/E9"),
        ("Test UV laser", "Branding & Labeling", 15.00, "UV-uitharding test tool", 12, "=C10/E10"),
        ("Domein & Hosting Platform (Vercel/Stripe)", "Vaste Maandelijkse Software", 0.00, "Software / webshop hosting", 1, 30.00)
    ]

    for row_idx, inv in enumerate(inv_rows, start=5):
        ws4.cell(row=row_idx, column=1, value=inv[0]).font = font_bold
        ws4.cell(row=row_idx, column=2, value=inv[1]).font = font_subtitle
        
        c_cost = ws4.cell(row=row_idx, column=3, value=inv[2])
        c_cost.number_format = '€#,##0.00'
        c_cost.font = font_regular
        
        ws4.cell(row=row_idx, column=4, value=inv[3]).font = font_regular
        
        c_term = ws4.cell(row=row_idx, column=5, value=inv[4])
        c_term.number_format = '#,##0'
        c_term.alignment = align_center
        
        c_mth = ws4.cell(row=row_idx, column=6, value=inv[5])
        c_mth.number_format = '€#,##0.00'
        c_mth.font = font_bold
        
        for c_i in range(1, 7):
            ws4.cell(row=row_idx, column=c_i).border = thin_border

    # Row 14: Totals
    ws4.cell(row=14, column=1, value="TOTAAL EENMALIGE CAPEX & MAANDLAST").font = font_title
    ws4.cell(row=14, column=2, value="Gekoppeld aan Dashboard").font = font_subtitle

    c_inv_tot = ws4.cell(row=14, column=3, value="=SUM(C5:C10)")
    c_inv_tot.number_format = '€#,##0.00'
    c_inv_tot.font = font_kpi_num
    c_inv_tot.fill = fill_highlight

    ws4.cell(row=14, column=4, value="-").alignment = align_center
    ws4.cell(row=14, column=5, value="-").alignment = align_center

    c_mth_tot = ws4.cell(row=14, column=6, value="=SUM(F5:F11)")
    c_mth_tot.number_format = '€#,##0.00'
    c_mth_tot.font = font_kpi_win
    c_mth_tot.fill = fill_green

    for c_i in range(1, 7):
        ws4.cell(row=14, column=c_i).border = double_bottom_border


    # =========================================================================
    # TAB 5: VERZENDKOSTEN DETAIL & TARIEVENMATRIX
    # =========================================================================
    ws5 = wb.create_sheet(title="Verzendkosten")
    ws5.views.sheetView[0].showGridLines = True

    ws5['A1'] = "🌍 VERZENDKOSTEN DETAIL & VERVOERDERS BENCHMARK"
    ws5['A1'].font = font_title
    ws5['A2'] = "Werkelijke logistieke tarieven (Inposteasy PUDO, DPD PUDO, DPD direct) vs. klanttarieven en subsidie"
    ws5['A2'].font = font_subtitle

    # Section 1: Active Model & Weighted Average
    ws5.merge_cells('A3:G3')
    ws5['A3'] = "1. ACTIEF VERZENDPROFIEL & SUBSIDIEBEREKENING (GEKOPPELD AAN DASHBOARD)"
    ws5['A3'].font = font_section
    ws5['A3'].fill = fill_section

    shp_cols = ["Bestemming (Land / Regio)", "Gekozen Vervoerder & Service", "Reële Kost voor Fré (EUR)", "Tarief Aangerekend aan Klant (EUR)", "Verschil / Subsidie per Order (EUR)", "Geschatte Order Mix (%)", "Gewogen Subsidie (EUR)"]
    for col_idx, h in enumerate(shp_cols, start=1):
        c = ws5.cell(row=4, column=col_idx, value=h)
        c.font = font_header
        c.fill = fill_header
        c.border = thin_border

    shp_rows = [
        ("België (Leuven Afhaling)", "Lokaal op afspraak te Leuven", 0.00, 0.00, "=C5-D5", 0.15, "=E5*F5"),
        ("België (Inpost PUDO / Lockers)", "Inposteasy Afhaalpunt / Locker", 3.80, 3.80, "=C6-D6", 0.25, "=E6*F6"),
        ("België (DPD direct Thuis)", "DPD Home Delivery met Tracking", 5.62, 4.95, "=C7-D7", 0.10, "=E7*F7"),
        ("Nederland (DPD PUDO / Lockers)", "DPD Parcelshop / Locker (Laagste kost)", 6.61, 5.50, "=C8-D8", 0.15, "=E8*F8"),
        ("Nederland (DPD direct Thuis)", "DPD Home Delivery met Tracking", 8.35, 6.95, "=C9-D9", 0.05, "=E9*F9"),
        ("Duitsland (DPD PUDO / Lockers)", "DPD Parcelshop / Locker", 8.35, 6.50, "=C10-D10", 0.10, "=E10*F10"),
        ("Frankrijk (Inpost PUDO / Lockers)", "Inposteasy / Mondial Relay Locker", 7.42, 5.95, "=C11-D11", 0.08, "=E11*F11"),
        ("Luxemburg (Inpost PUDO)", "Inposteasy Afhaalpunt / Locker", 7.42, 5.95, "=C12-D12", 0.02, "=E12*F12"),
        ("Spanje & Portugal (Inpost PUDO)", "Inposteasy Locker (ES/POR: €10.14)", 10.14, 7.95, "=C13-D13", 0.05, "=E13*F13"),
        ("Italië & Polen (Inpost PUDO)", "Inposteasy Locker (IT: €10.14 / PO: €10.99)", 10.40, 7.95, "=C14-D14", 0.05, "=E14*F14")
    ]

    for row_idx, shp in enumerate(shp_rows, start=5):
        ws5.cell(row=row_idx, column=1, value=shp[0]).font = font_bold
        ws5.cell(row=row_idx, column=2, value=shp[1]).font = font_subtitle
        
        c_real = ws5.cell(row=row_idx, column=3, value=shp[2])
        c_real.number_format = '€#,##0.00'
        c_real.font = font_regular
        
        c_client = ws5.cell(row=row_idx, column=4, value=shp[3])
        c_client.number_format = '€#,##0.00'
        c_client.font = font_bold
        c_client.fill = fill_highlight
        
        c_sub = ws5.cell(row=row_idx, column=5, value=shp[4])
        c_sub.number_format = '€#,##0.00'
        c_sub.font = font_regular
        
        c_mix = ws5.cell(row=row_idx, column=6, value=shp[5])
        c_mix.number_format = '0.0%'
        c_mix.alignment = align_center
        
        c_wsub = ws5.cell(row=row_idx, column=7, value=shp[6])
        c_wsub.number_format = '€#,##0.00'
        c_wsub.font = font_bold
        
        for c_i in range(1, 8):
            ws5.cell(row=row_idx, column=c_i).border = thin_border

    # Row 15: Totals
    ws5.cell(row=15, column=1, value="TOTAAL / GEWOGEN GEMIDDELDE").font = font_title
    ws5.cell(row=15, column=2, value="Gekoppeld aan Dashboard (G15)").font = font_subtitle
    ws5.cell(row=15, column=3, value="-").alignment = align_center
    ws5.cell(row=15, column=4, value="-").alignment = align_center
    ws5.cell(row=15, column=5, value="-").alignment = align_center

    c_tmix = ws5.cell(row=15, column=6, value="=SUM(F5:F14)")
    c_tmix.number_format = '0.0%'
    c_tmix.font = font_kpi_num

    c_wavg = ws5.cell(row=15, column=7, value="=SUM(G5:G14)")
    c_wavg.number_format = '€#,##0.00'
    c_wavg.font = font_kpi_win
    c_wavg.fill = fill_green

    for c_i in range(1, 8):
        ws5.cell(row=15, column=c_i).border = double_bottom_border

    # Section 2: Complete Carrier Comparison Matrix (Inpost vs DPD)
    ws5.merge_cells('A17:J17')
    ws5['A17'] = "2. COMPLETE VERVOERDERS BENCHMARK & TARIEVENMATRIX (INPOSTEASY VS. DPD)"
    ws5['A17'].font = font_section
    ws5['A17'].fill = PatternFill(start_color='1E293B', end_color='1E293B', fill_type='solid')

    headers_matrix = ["Vervoerder & Verzendmethode", "BE", "NL", "LU", "FR", "ES", "POR", "IT", "PO", "GE (DE)"]
    for c_i, h in enumerate(headers_matrix, start=1):
        c = ws5.cell(row=18, column=c_i, value=h)
        c.font = font_header
        c.fill = fill_header
        c.alignment = align_center if c_i >= 2 else align_left
        c.border = thin_border

    matrix_rows = [
        ("Inposteasy (PUDO Lockers / Afhaalpunten)", 3.80, 7.42, 7.42, 7.42, 10.14, 10.14, 10.14, 10.99, "-"),
        ("DPD (PUDO Lockers / Parcelshops)", 3.87, 6.61, "-", 10.54, "-", "-", "-", "-", 8.35),
        ("DPD direct (Thuislevering aan de deur)", 5.62, 8.35, "-", 12.32, "-", "-", "-", "-", 10.12)
    ]

    for idx, m_row in enumerate(matrix_rows, start=19):
        for c_i, val in enumerate(m_row, start=1):
            c = ws5.cell(row=idx, column=c_i, value=val)
            c.border = thin_border
            if c_i == 1:
                c.font = font_bold
                c.alignment = align_left
            elif val == "-":
                c.alignment = align_center
                c.font = font_regular
            else:
                c.number_format = '€#,##0.00'
                c.alignment = align_right
                c.font = font_regular
                # Highlight cheapest options
                if (idx == 19 and c_i in [2, 4, 5, 6, 7, 8, 9]) or (idx == 20 and c_i in [3, 10]):
                    c.font = font_bold
                    c.fill = fill_highlight


    # =========================================================================
    # TAB 6: VRIENDEN & AFHALING (STRICTLY FROM COLUMN A, ROW 1)
    # =========================================================================
    ws6 = wb.create_sheet(title="Vrienden & Afhaling")
    ws6.views.sheetView[0].showGridLines = True

    ws6['A1'] = "🤝 VRIENDENKORTING & AFHAALPRIJZEN (LEUVEN)"
    ws6['A1'].font = font_title
    ws6['A2'] = "Berekening van vriendenprijzen op basis van wegvallende marketing- (CAC), verpakkings- en verzendkosten"
    ws6['A2'].font = font_subtitle

    headers_ws6 = [
        "Scenario / Verkoopkanaal", 
        "Officiële Webshopprijs", 
        "Bespaarde Kosten per Order", 
        "Aanbevolen Vriendenprijs", 
        "Toegepaste Korting (€)", 
        "Toegepaste Korting (%)", 
        "COGS (Materiaalkost)", 
        "Jouw Nettowinst (€)", 
        "Nettowinstmarge (%)"
    ]
    for col_idx, h in enumerate(headers_ws6, start=1):
        c = ws6.cell(row=4, column=col_idx, value=h)
        c.font = font_header
        c.fill = fill_highlight if col_idx == 4 else fill_header
        c.alignment = align_center if col_idx >= 2 else align_left
        c.border = thin_border

    # Row 5: Category 1
    ws6.merge_cells(start_row=5, start_column=1, end_row=5, end_column=9)
    c5_cat = ws6.cell(row=5, column=1, value="SCENARIO A: GEEN MARKETING (CAC = €0), WEL VERZENDING VIA BPOST / POSTNL")
    c5_cat.font = font_section
    c5_cat.fill = fill_section

    # Row 6: Single Unit Verzonden
    r6_data = ["Single Unit (1x) — Verzonden via Post", 24.95, 6.50, 20.00, "=B6-D6", "=E6/B6", "='COGS Detail'!E13", "=D6-G6-(D6*0.015+0.25)-'Verzendkosten'!G15", "=H6/D6"]
    # Row 7: Complete Pair Verzonden
    r7_data = ["Complete Pair (2x) — Verzonden via Post", 44.95, 7.50, 35.00, "=B7-D7", "=E7/B7", "='COGS Detail'!G13", "=D7-G7-(D7*0.015+0.25)-'Verzendkosten'!G15", "=H7/D7"]

    # Row 8: Category 2
    ws6.merge_cells(start_row=8, start_column=1, end_row=8, end_column=9)
    c8_cat = ws6.cell(row=8, column=1, value="SCENARIO B: GEEN MARKETING (CAC = €0) ÉN LOKALE AFHALING TE LEUVEN (GEEN VERZENDING)")
    c8_cat.font = font_section
    c8_cat.fill = fill_section

    # Row 9: Single Unit Afhaling
    r9_data = ["Single Unit (1x) — Afhaling te Leuven / Klimzaal", 24.95, 8.71, 16.00, "=B9-D9", "=E9/B9", "='COGS Detail'!E13-0.67", "=D9-G9", "=H9/D9"]
    # Row 10: Complete Pair Afhaling
    r10_data = ["Complete Pair (2x) — Afhaling te Leuven / Klimzaal", 44.95, 10.00, 30.00, "=B10-D10", "=E10/B10", "='COGS Detail'!G13", "=D10-G10", "=H10/D10"]

    # Write rows 6, 7, 9, 10
    for r_num, row_vals in [(6, r6_data), (7, r7_data), (9, r9_data), (10, r10_data)]:
        for c_idx, val in enumerate(row_vals, start=1):
            c = ws6.cell(row=r_num, column=c_idx, value=val)
            c.border = thin_border
            if c_idx == 1:
                c.font = font_bold
                c.alignment = align_left
            elif c_idx in [2, 3, 4, 5, 7, 8]:
                c.number_format = '€#,##0.00'
                c.alignment = align_right
                if c_idx == 4:
                    c.font = font_bold
                    c.fill = fill_highlight
                elif c_idx == 8:
                    c.font = font_kpi_win
                    c.fill = fill_green
            elif c_idx in [6, 9]:
                c.number_format = '0.0%'
                c.alignment = align_center
                c.font = font_bold

    # Breakdown Section on Row 12
    ws6.merge_cells(start_row=12, start_column=1, end_row=12, end_column=9)
    c12_cat = ws6.cell(row=12, column=1, value="DETAIL OVERZICHT: WAAROM KAN DEZE KORTING GEGEVEN WORDEN?")
    c12_cat.font = font_section
    c12_cat.fill = PatternFill(start_color='334155', end_color='334155', fill_type='solid')

    headers_breakdown = ["Kostencomponent per Order", "Reguliere Webshopklant", "Vriend (Scenario A: Verzonden)", "Vriend (Scenario B: Afhaling)", "Besparing / Verklaring"]
    for c_i, h in enumerate(headers_breakdown, start=1):
        c = ws6.cell(row=13, column=c_i, value=h)
        c.font = font_header
        c.fill = fill_header
        c.border = thin_border

    breakdown_data = [
        ("Social Media Marketing (Meta Ads CAC)", "€ 6,50 - € 7,50", "€ 0,00", "€ 0,00", "100% bespaard via persoonlijke connectie / mond-tot-mond"),
        ("Verzendsubsidie (Transport Fré)", "€ 0,92", "€ 0,92", "€ 0,00", "Volledig uitgespaard bij afhaling te Leuven / zaal"),
        ("Verzendzakje / Brievenbusdoosje", "€ 0,67", "€ 0,67", "€ 0,00", "Geen postverpakking nodig bij directe overhandiging"),
        ("Stripe Betaaltransactiekosten", "€ 0,62 - € 0,92", "€ 0,55 - € 0,78", "€ 0,00", "Geen transactiekosten bij Payconiq, overschrijving of cash"),
        ("TOTALE BESPAARDE KOSTEN PER ORDER", "€ 0,00", "€ 6,50 à € 7,50", "€ 8,70 à € 10,00", "Vloeit integraal door naar een eerlijke vriendenprijs")
    ]
    for idx, b_row in enumerate(breakdown_data, start=14):
        for c_i, val in enumerate(b_row, start=1):
            c = ws6.cell(row=idx, column=c_i, value=val)
            c.border = thin_border
            if idx == 18:
                c.font = font_bold
                c.fill = fill_highlight
            else:
                c.font = font_bold if c_i == 1 else font_regular


    # =========================================================================
    # TAB 7: B2B KLIMZALEN & RETAIL (STRICTLY FROM COLUMN A, ROW 1)
    # =========================================================================
    ws7 = wb.create_sheet(title="B2B Klimzalen & Retail")
    ws7.views.sheetView[0].showGridLines = True

    ws7['A1'] = "🧗 B2B KLIMZALEN & WHOLESALE RETAIL"
    ws7['A1'].font = font_title
    ws7['A2'] = "Wholesale marges voor klimzalen, toonbank display packs en B2B consignatie vs. directe inkoop"
    ws7['A2'].font = font_subtitle

    headers_ws7 = [
        "Product / Verkoopmodel", 
        "Adviesprijs Klant (incl. BTW)", 
        "Adviesprijs (excl. 21% BTW)", 
        "Inkoopprijs Zaal (excl. BTW)", 
        "Marge Klimzaal (€)", 
        "Marge Klimzaal (%)", 
        "COGS Fré (€)", 
        "Nettowinst Fré per Stuk (€)", 
        "Nettomarge Fré (%)"
    ]
    for col_idx, h in enumerate(headers_ws7, start=1):
        c = ws7.cell(row=4, column=col_idx, value=h)
        c.font = font_header
        c.fill = fill_highlight if col_idx in [4, 8] else fill_header
        c.alignment = align_center if col_idx >= 2 else align_left
        c.border = thin_border

    # Row 5: Category 1 (Directe Inkoop 35% Marge Zaal)
    ws7.merge_cells(start_row=5, start_column=1, end_row=5, end_column=9)
    c5_b2b = ws7.cell(row=5, column=1, value="1. DIRECTE INKOOP DOOR KLIMZAAL (35% MARGE VOOR DE ZAAL — BULK FACTUUR)")
    c5_b2b.font = font_section
    c5_b2b.fill = fill_section

    # Row 6 & 7: Directe inkoop
    r6_b2b = ["Single Unit (1x) — Directe Inkoop", 24.95, "=B6/1.21", "=C6*(1-0.35)", "=C6-D6", "=E6/C6", "='COGS Detail'!E13", "=D6-G6", "=H6/D6"]
    r7_b2b = ["Complete Pair (2x) — Directe Inkoop", 44.95, "=B7/1.21", "=C7*(1-0.35)", "=C7-D7", "=E7/C7", "='COGS Detail'!G13", "=D7-G7", "=H7/D7"]

    # Row 8: Category 2 (Consignatie 25% Marge Zaal)
    ws7.merge_cells(start_row=8, start_column=1, end_row=8, end_column=9)
    c8_b2b = ws7.cell(row=8, column=1, value="2. CONSIGNATIE / TEST-STAND MODEL (25% MARGE VOOR DE ZAAL — BETALING PER VERKOCHT STUK)")
    c8_b2b.font = font_section
    c8_b2b.fill = fill_section

    # Row 9 & 10: Consignatie
    r9_b2b = ["Single Unit (1x) — Consignatie", 24.95, "=B9/1.21", "=C9*(1-0.25)", "=C9-D9", "=E9/C9", "='COGS Detail'!E13", "=D9-G9", "=H9/D9"]
    r10_b2b = ["Complete Pair (2x) — Consignatie", 44.95, "=B10/1.21", "=C10*(1-0.25)", "=C10-D10", "=E10/C10", "='COGS Detail'!G13", "=D10-G10", "=H10/D10"]

    for r_num, row_vals in [(6, r6_b2b), (7, r7_b2b), (9, r9_b2b), (10, r10_b2b)]:
        for c_idx, val in enumerate(row_vals, start=1):
            c = ws7.cell(row=r_num, column=c_idx, value=val)
            c.border = thin_border
            if c_idx == 1:
                c.font = font_bold
                c.alignment = align_left
            elif c_idx in [2, 3, 4, 5, 7, 8]:
                c.number_format = '€#,##0.00'
                c.alignment = align_right
                if c_idx == 4:
                    c.font = font_bold
                    c.fill = fill_highlight
                elif c_idx == 8:
                    c.font = font_kpi_win
                    c.fill = fill_green
            elif c_idx in [6, 9]:
                c.number_format = '0.0%'
                c.alignment = align_center
                c.font = font_bold

    # Section 3: Gym Starter Display Packs on Row 12
    ws7.merge_cells(start_row=12, start_column=1, end_row=12, end_column=9)
    c12_pack = ws7.cell(row=12, column=1, value="3. GYM TOONBANK DISPLAY PACKS (STARTER BUNDELS)")
    c12_pack.font = font_section
    c12_pack.fill = PatternFill(start_color='1E293B', end_color='1E293B', fill_type='solid')

    headers_packs = [
        "Display Pakket", 
        "Inhoud & Specificatie", 
        "B2B Pakketprijs (excl. BTW)", 
        "Winkelwaarde Klanten (incl. BTW)", 
        "Marge Klimzaal (€)", 
        "Totale COGS Fré (€)", 
        "Nettowinst Fré per Pakket (€)", 
        "Nettomarge Fré (%)"
    ]
    for c_i, h in enumerate(headers_packs, start=1):
        c = ws7.cell(row=13, column=c_i, value=h)
        c.font = font_header
        c.fill = fill_header
        c.border = thin_border

    r14_pack = [
        "Starter Gym Display Pack", 
        "4x Pair + 2x Single + 1x Demo Unit + Toonbank Display", 
        120.00, 
        229.70, 
        "=D14/1.21-C14", 
        "=(4*'COGS Detail'!G13)+(2*'COGS Detail'!E13)+5.00", 
        "=C14-F14", 
        "=G14/C14"
    ]
    r15_pack = [
        "Pro Gym Restock Pack (10 Pairs)", 
        "10x Complete Pair (inclusief zakjes en guide cards)", 
        235.00, 
        449.50, 
        "=D15/1.21-C15", 
        "=10*'COGS Detail'!G13", 
        "=C15-F15", 
        "=G15/C15"
    ]

    for r_num, row_vals in [(14, r14_pack), (15, r15_pack)]:
        for c_idx, val in enumerate(row_vals, start=1):
            c = ws7.cell(row=r_num, column=c_idx, value=val)
            c.border = thin_border
            if c_idx == 1:
                c.font = font_bold
                c.alignment = align_left
            elif c_idx == 2:
                c.font = font_regular
                c.alignment = align_left
            elif c_idx in [3, 4, 5, 6, 7]:
                c.number_format = '€#,##0.00'
                c.alignment = align_right
                if c_idx == 3:
                    c.font = font_bold
                    c.fill = fill_highlight
                elif c_idx == 7:
                    c.font = font_kpi_win
                    c.fill = fill_green
            elif c_idx == 8:
                c.number_format = '0.0%'
                c.alignment = align_center
                c.font = font_bold

    # Section 4: Gym Scaling Scenarios on Row 17
    ws7.merge_cells(start_row=17, start_column=1, end_row=17, end_column=9)
    c17_scen = ws7.cell(row=17, column=1, value="4. KLIMZALEN SCHAAL-SCENARIO'S (EXTRA MAANDELIJKSE WINST BOVENOP WEBSHOP)")
    c17_scen.font = font_section
    c17_scen.fill = fill_section

    headers_gym_scen = [
        "Netwerk / Partnerzalen", 
        "Gem. Verkoop per Zaal", 
        "Totaal Pairs / Maand", 
        "B2B Omzet / Maand (excl. BTW)", 
        "COGS Productiekost / Maand", 
        "EXTRA NETTOWINST / MAAND", 
        "EXTRA NETTOWINST / JAAR"
    ]
    for c_i, h in enumerate(headers_gym_scen, start=1):
        c = ws7.cell(row=18, column=c_i, value=h)
        c.font = font_header
        c.fill = fill_header
        c.border = thin_border

    gym_scenarios_data = [
        ("Piloot (3 partnerzalen: Leuven, Gent, Antwerpen)", "3 pairs / zaal / mnd", 9, "=C19*D7", "=C19*'COGS Detail'!G13", "=D19-E19", "=F19*12"),
        ("Vlaams Netwerk (8 partnerzalen)", "3 pairs / zaal / mnd", 24, "=C20*D7", "=C20*'COGS Detail'!G13", "=D20-E20", "=F20*12"),
        ("Benelux Netwerk (15 partnerzalen)", "4 pairs / zaal / mnd", 60, "=C21*D7", "=C21*'COGS Detail'!G13", "=D21-E21", "=F21*12")
    ]
    for idx, g_row in enumerate(gym_scenarios_data, start=19):
        for c_i, val in enumerate(g_row, start=1):
            c = ws7.cell(row=idx, column=c_i, value=val)
            c.border = thin_border
            if c_i == 1:
                c.font = font_bold
                c.alignment = align_left
            elif c_i == 2:
                c.alignment = align_center
                c.font = font_regular
            elif c_i == 3:
                c.alignment = align_center
                c.font = font_bold
            elif c_i in [4, 5]:
                c.number_format = '€#,##0.00'
                c.alignment = align_right
            elif c_i == 6:
                c.number_format = '€#,##0.00'
                c.font = font_kpi_win
                c.fill = fill_green
                c.alignment = align_right
            elif c_i == 7:
                c.number_format = '€#,##0.00'
                c.font = font_kpi_win
                c.fill = fill_green
                c.alignment = align_right


    # =========================================================================
    # AUTO-FIT COLUMN WIDTHS ACROSS ALL TABS (From Column A)
    # =========================================================================
    for ws in [ws1, ws2, ws3, ws4, ws5, ws6, ws7]:
        for col in ws.columns:
            max_len = 0
            for cell in col:
                val_str = str(cell.value or '')
                if not val_str.startswith('='):
                    max_len = max(max_len, len(val_str))
            col_letter = get_column_letter(col[0].column)
            ws.column_dimensions[col_letter].width = max(max_len + 4, 12)

    # Specific fine tuning
    ws1.column_dimensions['A'].width = 46
    ws1.column_dimensions['B'].width = 24
    ws1.column_dimensions['C'].width = 18
    ws1.column_dimensions['D'].width = 18
    ws1.column_dimensions['E'].width = 18
    ws1.column_dimensions['F'].width = 18
    ws1.column_dimensions['G'].width = 18
    ws1.column_dimensions['H'].width = 18

    ws2.column_dimensions['A'].width = 30
    ws2.column_dimensions['B'].width = 38
    ws2.column_dimensions['C'].width = 20
    ws2.column_dimensions['D'].width = 18
    ws2.column_dimensions['E'].width = 20
    ws2.column_dimensions['F'].width = 18
    ws2.column_dimensions['G'].width = 20
    ws2.column_dimensions['H'].width = 40

    ws3.column_dimensions['A'].width = 20
    ws3.column_dimensions['B'].width = 24
    ws3.column_dimensions['C'].width = 44
    ws3.column_dimensions['D'].width = 26
    ws3.column_dimensions['E'].width = 26
    ws3.column_dimensions['F'].width = 28
    ws3.column_dimensions['G'].width = 30

    ws4.column_dimensions['A'].width = 38
    ws4.column_dimensions['B'].width = 28
    ws4.column_dimensions['C'].width = 20
    ws4.column_dimensions['D'].width = 40
    ws4.column_dimensions['E'].width = 26
    ws4.column_dimensions['F'].width = 26

    ws5.column_dimensions['A'].width = 38
    ws5.column_dimensions['B'].width = 38
    ws5.column_dimensions['C'].width = 24
    ws5.column_dimensions['D'].width = 30
    ws5.column_dimensions['E'].width = 28
    ws5.column_dimensions['F'].width = 22
    ws5.column_dimensions['G'].width = 24
    ws5.column_dimensions['H'].width = 16
    ws5.column_dimensions['I'].width = 16
    ws5.column_dimensions['J'].width = 16

    ws6.column_dimensions['A'].width = 45
    ws6.column_dimensions['B'].width = 24
    ws6.column_dimensions['C'].width = 26
    ws6.column_dimensions['D'].width = 25
    ws6.column_dimensions['E'].width = 22
    ws6.column_dimensions['F'].width = 22
    ws6.column_dimensions['G'].width = 22
    ws6.column_dimensions['H'].width = 22
    ws6.column_dimensions['I'].width = 20

    ws7.column_dimensions['A'].width = 45
    ws7.column_dimensions['B'].width = 28
    ws7.column_dimensions['C'].width = 26
    ws7.column_dimensions['D'].width = 26
    ws7.column_dimensions['E'].width = 20
    ws7.column_dimensions['F'].width = 20
    ws7.column_dimensions['G'].width = 18
    ws7.column_dimensions['H'].width = 26
    ws7.column_dimensions['I'].width = 20

    output_path = "Sloper King/financieel/Sloper_King_Financieel_Plan.xlsx"
    wb.save(output_path)
    print(f"File successfully created: {output_path}")

if __name__ == '__main__':
    create_financial_workbook()

