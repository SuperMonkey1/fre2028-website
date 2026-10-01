# 📈 COMPLEET FINANCIEEL PLAN: SLOPER KING™ (5-TAB MODEL)

> **Bestand:** [Sloper_King_Financieel_Plan.xlsx](file:///c:/Users/frede/Documents/GitHub/fre2028-website/Sloper%20King/financieel/Sloper_King_Financieel_Plan.xlsx)  
> **Auteur:** Fré Leys (PhD.) / BamBum Innovation  
> **Status:** 100% Dynamisch Excel / Google Sheets model met onderling gekoppelde formules.

---

## 📑 OVERZICHT VAN DE 5 TABS IN HET SPREADSHEET

```
+----------------------------------------------------------------------------------------------------+
|                                      TAB 1: OVERZICHT & SCENARIO'S                                 |
|  - Koppelt automatisch data uit Tab 2 (COGS), Tab 4 (Vaste Kosten) en Tab 5 (Verzendkosten)        |
|  - Berekent live: Omzet, COGS, Stripe, Verzendsubsidie, Marketing, Winst en Terugverdientijd       |
+----------------------------------------------------------------------------------------------------+
       ▲                                ▲                                 ▲
       │                                │                                 │
+---------------+              +--------------------+            +-------------------+
|     TAB 2     |              |       TAB 4        |            |       TAB 5       |
|  COGS DETAIL  |              |   INVESTERINGEN    |            |   VERZENDKOSTEN   |
| Single: €2.93 |              | CapEx: € 124,37    |            | Klant vs. Mezelf  |
| Pair:   €4.95 |              | Maandlast: € 41,73 |            | Gewogen subsidie  |
+---------------+              +--------------------+            +-------------------+
       ▲
       │
+---------------+              +--------------------+            +-------------------+
|     TAB 3     |              |       TAB 6        |            |       TAB 7       |
| UITGAVEN LOG  |              | VRIENDEN & AFHAAL  |            | B2B KLIMZALEN     |
| Batch inkoop  |              | Post vs. Afhaling  |            | Wholesale & Packs |
| Prijs / stuk  |              | Marge & Korting    |            | Extra Winst/mnd   |
+---------------+              +--------------------+            +-------------------+
```

---

## 1. TAB 1: OVERZICHT & SCENARIO-ANALYSE (SINGLE VS. PAIR SPLIT)

| Parameter / Kostenpost | Bron / Eenheid | **Scenario 1: Single (10x)** | **Scenario 1: Pair (10x)** | **Scenario 2: Single (20x)** | **Scenario 2: Pair (20x)** | **Scenario 3: Single (30x)** | **Scenario 3: Pair (30x)** |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Verkocht Volume** | stuks / mnd | **10** | **10** | **20** | **20** | **30** | **30** |
| **Verkoopprijs per Unit** | EUR / stuk | € 24,95 | € 44,95 | € 24,95 | € 44,95 | € 24,95 | € 44,95 |
| **COGS per Unit** | *Uit Tab 2* | € 2,93 | € 4,95 | € 2,93 | € 4,95 | € 2,93 | € 4,95 |
| **Stripe Fee per Order** | 1.5% + €0.25 | € 0,62 | € 0,92 | € 0,62 | € 0,92 | € 0,62 | € 0,92 |
| **Verzendsubsidie / Order**| *Uit Tab 5* | € 0,915 | € 0,915 | € 0,915 | € 0,915 | € 0,915 | € 0,915 |
| **1. BRUTO OMZET / MND** | Stuks × Prijs | **€ 249,50** | **€ 449,50** | **€ 499,00** | **€ 899,00** | **€ 748,50** | **€ 1.348,50** |
| **2. KOSTEN PER TYPE** | | | | | | | |
| • *Productiekosten (COGS)*| Stuks × COGS | € 29,30 | € 49,50 | € 58,60 | € 99,00 | € 87,90 | € 148,50 |
| • *Stripe Betalingskosten*| Stuks × Stripe | € 6,24 | € 9,24 | € 12,49 | € 18,49 | € 18,73 | € 27,73 |
| • *Verzendsubsidie* | Stuks × Subsidie | € 9,15 | € 9,15 | € 18,30 | € 18,30 | € 27,45 | € 27,45 |
| • *Social Media Ads* | Verdeeld | € 50,00 | € 50,00 | € 125,00 | € 125,00 | € 225,00 | € 225,00 |
| • *Vaste Kosten & CapEx* | 50/50 split | € 20,87 | € 20,87 | € 20,87 | € 20,87 | € 20,87 | € 20,87 |
| **TOTALE KOSTEN / MND** | Som kosten | **€ 115,56** | **€ 138,76** | **€ 235,26** | **€ 281,66** | **€ 379,95** | **€ 449,55** |
| **3. NETTO RESULTAAT** | | | | | | | |
| • **NETTO WINST / MND** | Omzet - Kosten | **€ 133,94** | **€ 310,74** | **€ 263,74** | **€ 617,34** | **€ 368,55** | **€ 898,95** |
| • **NETTO WINST / JAAR** | Maand × 12 | **€ 1.607,28** | **€ 3.728,88** | **€ 3.164,88** | **€ 7.408,08** | **€ 4.422,60** | **€ 10.787,40** |
| • **NETTO WINSTMARGE (%)**| Winst / Omzet | **53,7%** | **69,1%** | **52,9%** | **68,7%** | **49,2%** | **66,7%** |
| **4. SCENARIO TOTAAL** | **Gecombineerd**| **Scenario 1 Totaal** | | **Scenario 2 Totaal** | | **Scenario 3 Totaal** | |
| • *Totale Omzet / Maand* | Single + Pair | **€ 699,00 / mnd** | | **€ 1.398,00 / mnd** | | **€ 2.097,00 / mnd** | |
| • *Totale Kosten / Maand*| Single + Pair | **€ 254,31 / mnd** | | **€ 516,90 / mnd** | | **€ 829,49 / mnd** | |
| • **TOTALE WINST / MND** | Single + Pair | **€ 444,69 / mnd** | | **€ 881,10 / mnd** | | **€ 1.267,51 / mnd** | |
| • **TOTALE WINST / JAAR**| Maand × 12 | **€ 5.336,22 / jr** | | **€ 10.573,20 / jr** | | **€ 15.210,18 / jr** | |
| • **GEZAMENLIJKE MARGE** | Totaal Winst/Omzet | **63,6%** | | **63,0%** | | **60,4%** | |

---

## 2. TAB 2: COGS DETAIL (EXACTE MATERIAALKOSTEN)

| Onderdeel / Materiaal | Basiskost per Item | Aantal in Single (1x) | Kost Single (1x) | Aantal in Pair (2x) | Kost Pair (2x) | Opmerking |
| :--- | :--- | :---: | :--- | :---: | :--- | :--- |
| **PLA Filament** | € 0,94 | 1 | € 0,94 | 2 | € 1,88 | ~76g per geprinte unit |
| **Sand paper (GoldX 220)** | € 0,14 | 1 | € 0,14 | 2 | € 0,28 | 1 contactstrip per unit |
| **Rope (Semi-statisch 4mm)**| € 0,43 | 1 | € 0,43 | 2 | € 0,86 | 800kg rated cord |
| **Laser print / Sticker** | € 0,50 | 1 | € 0,50 | 2 | € 1,00 | Logo badge & mascot |
| **Double naamkaartje** | € 0,25 | 1 | € 0,25 | 1 | € 0,25 | 1x per doos / order |
| **Cotton bag + Stamp** | € 0,67 | 0 | € 0,00 | 1 | € 0,67 | Enkel bij Complete Pair |
| **Verzendzakje / Doosje** | € 0,67 | 1 | € 0,67 | 0 | € 0,00 | Single verpakking |
| **TOTAAL UNIT COST (COGS)**| | | **€ 2,93** | | **€ 4,95** | **Exact gevalideerd** |

---

## 3. TAB 3: UITGAVEN & INKOOP LOGBOEK (BATCHES)

| Batch / Bestelling | Materiaal | Totaalbedrag Factuur | Aantal Eenheden | Berekende Eenheidskost | Koppeling naar COGS |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **Batch 1 Filament** | Matzwart PLA (10x 1kg) | € 188,00 | 200 units | **€ 0,94** | PLA Filament |
| **Batch 1 Schuurpapier** | GoldX 220-Grit rol (25m)| € 35,00 | 250 strips | **€ 0,14** | Sand paper |
| **Batch 1 Koord** | Petzl 4mm koord (100m) | € 50,59 | 118 stukken | **€ 0,43** | Rope |
| **Batch 1 Zakjes** | Katoenen zakjes + stempel| € 67,00 | 100 stuks | **€ 0,67** | Cotton bag |
| **Batch 1 Labels** | Laser stickers | € 100,00 | 200 stuks | **€ 0,50** | Laser print |
| **Batch 1 Drukwerk** | Double naamkaartjes | € 100,00 | 400 stuks | **€ 0,25** | Double naamkaartje |
| **Batch 1 Verpakking** | Verzendzakjes (Temu) | € 33,50 | 50 stuks | **€ 0,67** | Verzendzakje |
| **TOTAAL VOORRAAD INKOOP** | | **€ 574,09** | | | *Vloeit door naar COGS* |

---

## 4. TAB 4: VASTE INVESTERINGEN & TOOLING (CAPEX)

| Investering / Tool | Categorie | Kostprijs (EUR) | Afschrijving | Maandelijkse Kost (EUR) | Status |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **Rollagers voor spool holder** | Hardware Mod | **€ 6,00** | 12 mnd | € 0,50 / mnd | Actief |
| **Printer A1 mini** | 3D Printer | **€ 0,00** | 12 mnd | € 0,00 / mnd | Reeds in bezit |
| **Temu zakjes test (20x25cm, 50st)** | Verpakking Test | **€ 27,19** | 6 mnd | € 4,53 / mnd | Testbatch |
| **Double sided tape test** | Materiaal Test | **€ 17,19** | 6 mnd | € 2,87 / mnd | Montage tape |
| **Hot cutter** | Snijapparatuur | **€ 58,99** | 24 mnd | € 2,46 / mnd | Touwsnijder |
| **Test UV laser** | Branding Test | **€ 15,00** | 12 mnd | € 1,25 / mnd | Uitharding |
| **Domein, Stripe & Vercel Hosting** | Vaste Software | € 0,00 (eenmalig) | Maandelijks | € 30,00 / mnd | Vaste last |
| **TOTAAL EENMALIGE CAPEX** | | **€ 124,37** | | **€ 41,73 / mnd** | *Koppelt naar Dashboard* |

---

## 5. TAB 5: VERZENDKOSTEN DETAIL (KLANT VS. MEZELF)

| Bestemming (Land / Regio) | Reële Kost voor Fré | Aangerekend aan Klant | Verschil (Subsidie) | Order Mix (%) | Gewogen Subsidie |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **België (Leuven Afhaling)** | € 0,00 | € 0,00 *(Gratis)* | € 0,00 | 15% | € 0,00 |
| **België (bpost Tracked)** | € 4,75 | € 3,99 | € 0,76 | 35% | € 0,27 |
| **Nederland (NL)** | € 6,00 | € 4,95 | € 1,05 | 20% | € 0,21 |
| **Duitsland (DE)** | € 7,15 | € 4,95 | € 2,20 | 10% | € 0,22 |
| **Frankrijk (Mondial Relay)**| € 4,50 | € 3,95 | € 0,55 | 5% | € 0,03 |
| **Frankrijk (Thuislevering)**| € 8,00 | € 5,50 | € 2,50 | 5% | € 0,13 |
| **Oostenrijk (AUT)** | € 9,35 | € 6,95 | € 2,40 | 4% | € 0,10 |
| **Italië (IT)** | € 10,35 | € 6,95 | € 3,40 | 3% | € 0,10 |
| **Spanje (ES)** | € 10,35 | € 6,95 | € 3,40 | 3% | € 0,10 |
| **TOTAAL / GEWOGEN GEMIDDELDE** | | | | **100%** | **€ 0,915 / order** |

---

## 6. TAB 6: VRIENDENKORTING & AFHAALPRIJZEN (LEUVEN)

| Scenario / Verkoopkanaal | Officiële Webshopprijs | Bespaarde Kosten | Aanbevolen Vriendenprijs | Toegepaste Korting | COGS | Nettowinst Fré | Winstmarge (%) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Scenario A: Single (Verzonden via Post)** | € 24,95 | € 6,50 (CAC) | **€ 20,00** | -€ 4,95 (-19,8%) | € 2,93 | **€ 15,60** | **78,0%** |
| **Scenario A: Pair (Verzonden via Post)** | € 44,95 | € 7,50 (CAC) | **€ 35,00** | -€ 9,95 (-22,1%) | € 4,95 | **€ 28,36** | **81,0%** |
| **Scenario B: Single (Afhaling Leuven / Zaal)**| € 24,95 | € 8,71 (CAC+Post+Fee) | **€ 16,00** | -€ 8,95 (-35,9%) | € 2,26 | **€ 13,74** | **85,9%** |
| **Scenario B: Pair (Afhaling Leuven / Zaal)** | € 44,95 | € 10,00 (CAC+Post+Fee) | **€ 30,00** | -€ 14,95 (-33,3%) | € 4,95 | **€ 25,05** | **83,5%** |

---

## 7. TAB 7: B2B KLIMZALEN & WHOLESALE RETAIL

### A. Wholesale Unit Economics per Stuk

| Verkoopmodel | Adviesprijs Klant (incl. BTW) | Adviesprijs (excl. 21% BTW) | Inkoopprijs Zaal (excl. BTW) | Marge Klimzaal | COGS Fré | Nettowinst Fré per Stuk | Marge Fré (%) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Directe Inkoop: Single (1x)** | € 24,95 | € 20,62 | **€ 13,40** | € 7,22 (35%) | € 2,93 | **€ 10,47** | **78,1%** |
| **Directe Inkoop: Complete Pair (2x)**| € 44,95 | € 37,15 | **€ 24,15** | € 13,00 (35%) | € 4,95 | **€ 19,20** | **79,5%** |
| **Consignatie: Single (1x)** | € 24,95 | € 20,62 | **€ 15,46** | € 5,15 (25%) | € 2,93 | **€ 12,53** | **81,0%** |
| **Consignatie: Complete Pair (2x)** | € 44,95 | € 37,15 | **€ 27,86** | € 9,29 (25%) | € 4,95 | **€ 22,91** | **82,2%** |

### B. Display Bundels & Maandelijkse Schaal-Scenario's

* **Starter Gym Display Pack (€120 ex. BTW):** 4x Pair + 2x Single + 1x Demo Unit + Toonbank Display.
  - Winkelwaarde klanten: € 229,70 | Marge klimzaal: **€ 69,83** | Nettowinst Fré: **€ 89,34 / pack** (74,5% marge).
* **Pro Gym Restock Pack (€235 ex. BTW):** 10x Complete Pair in doos.
  - Winkelwaarde klanten: € 449,50 | Marge klimzaal: **€ 136,50** | Nettowinst Fré: **€ 185,50 / pack** (78,9% marge).
* **Extra Winst via Partnerzalen (Bovenop Webshop):**
  - **Piloot (3 zalen: Leuven, Gent, Antwerpen @ 3 pairs/mnd):** **+€ 172,80 / mnd (+€ 2.073,60 / jr)**
  - **Vlaams Netwerk (8 partnerzalen @ 3 pairs/mnd):** **+€ 460,80 / mnd (+€ 5.529,60 / jr)**
  - **Benelux Netwerk (15 partnerzalen @ 4 pairs/mnd):** **+€ 1.152,00 / mnd (+€ 13.824,00 / jr)**

