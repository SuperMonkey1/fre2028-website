# 🎯 MARKETING & TRACKING METHODOLOGIE: SLOPER KING™

> **Auteur:** Victor (CCO & Dealmaker) / Fré Leys (PhD.)  
> **Doel:** 100% inzicht in verkeersbronnen, conversies en advertentierendement (ROAS) voor de Sloper King™ webshop.  
> **Status:** Code-integratie gereed in Next.js (`lib/analytics.ts`, `pages/_app.tsx`, `pages/bambum.tsx`).

---

## 1. STRATEGISCHE VISIE: WAAROM METEN WE DIT?

In plaats van blind advertentiebudget uit te geven, hanteren we een **data-gedreven verkoopfunnel**. 
Door elke stap van de bezoeker te meten, weten we exact:
1. Welke Instagram Reel, Reddit-post of klimzaal-flyer échte betalende klanten oplevert.
2. Welk percentage van de bezoekers overstapt van kijker naar koper (Conversieratio / CVR).
3. Wat de werkelijke advertentiekost per verkochte set is (Customer Acquisition Cost / CAC).
4. Waar potentiële kopers eventueel afhaken in het bestelproces (via Clarity schermopnames).

---

## 2. DE 3 TRACKING TOOLS & HOE ZE IN TE STELLEN (STAPPENPLAN)

In de broncode is een centrale tracking library gebouwd die automatisch data doorstuurt naar de drie platformen zodra jij de ID's toevoegt aan je omgevingsvariabelen (`.env.local` of Vercel Environment Variables).

```
+----------------------------------------------------------------------------------------------------+
|                                    DE SLOPER KING™ TRACKING ARCHITECTUUR                           |
+--------------------------+--------------------+----------------------------------------------------+
| Platform                 | Variabele (.env)   | Doel & Functie                                     |
+--------------------------+--------------------+----------------------------------------------------+
| 📊 Google Analytics 4    | NEXT_PUBLIC_GA_ID  | Meet website traffic, landen en bron-attributie    |
| 📸 Meta Pixel (Insta)    | NEXT_PUBLIC_META_PIXEL_ID | Voedt Instagram Ads met aankoopdata (Purchase)   |
| 🎬 Microsoft Clarity     | NEXT_PUBLIC_CLARITY_ID | 100% gratis session recordings & heatmaps        |
+--------------------------+--------------------+----------------------------------------------------+
```

---

### STAP 1: Google Analytics 4 (GA4) Instellen
1. Surf naar [analytics.google.com](https://analytics.google.com) en log in met je Google-account.
2. Maak een nieuwe Property aan genaamd **`Fre2028 / Sloper King`**.
3. Kies **Web** als Data Stream en vul `https://www.fre2028.la` in.
4. Kopieer je **Measurement ID** (begint met `G-`, bijv. `G-XXXXXXXXXX`).
5. Plak deze in je `.env.local` bestand:
   ```env
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```

---

### STAP 2: Meta Pixel (Instagram & Facebook Ads) Instellen
1. Surf naar [business.facebook.com](https://business.facebook.com) (Meta Business Suite / Events Manager).
2. Ga naar **Gegevensbronnen (Data Sources)** $\rightarrow$ **Nieuwe dataset / Pixel toevoegen**.
3. Noem de pixel **`Sloper King Pixel`**.
4. Kopieer de numerieke **Pixel ID** (bijv. `123456789012345`).
5. Plak deze in je `.env.local` bestand:
   ```env
   NEXT_PUBLIC_META_PIXEL_ID=123456789012345
   ```
*Zodra dit actief is, optimaliseert Instagram je advertenties automatisch voor mensen met de hoogste koopintentie.*

---

### STAP 3: Microsoft Clarity (Gratis Heatmaps & Schermopnames)
1. Surf naar [clarity.microsoft.com](https://clarity.microsoft.com) en maak een gratis account aan.
2. Klik op **Add New Project** $\rightarrow$ Project Name: **`Sloper King`**, Website URL: `https://www.fre2028.la`.
3. Ga naar **Settings** $\rightarrow$ **Overview** en kopieer je **Project ID** (een korte code zoals `k7x8m9q2`).
4. Plak deze in je `.env.local` bestand:
   ```env
   NEXT_PUBLIC_CLARITY_ID=k7x8m9q2
   ```
*Nu kan je live zien hoe klimmers over je pagina bewegen, waar ze klikken en op welke knoppen ze twijfelen.*

---

## 3. DE 5 GEÏMPLEMENTEERDE FUNNEL-EVENTS

In [`pages/bambum.tsx`](file:///c:/Users/frede/Documents/GitHub/fre2028-website/pages/bambum.tsx) worden de volgende 5 gebeurtenissen automatisch gelogd:

| Funnel Stap | Event Naam in GA4 | Event Naam in Meta Pixel | Trigger Moment |
| :--- | :--- | :--- | :--- |
| **1. Landingspagina** | `view_item_list` | `ViewContent` | Bezoeker landt op `/bambum`. |
| **2. Video Bekeken** | `video_engagement` | `WatchVideoDocu` | Bezoeker klikt op de 15-minuten breakdown video knop. |
| **3. Product Selectie**| `select_item` | `select_single` / `select_pair` | Bezoeker kiest tussen Single (€ 24,95) of Pair (€ 44,95). |
| **4. Checkout Start** | `begin_checkout` | `InitiateCheckout` | Bezoeker klikt op "Proceed to Secure Stripe Checkout". |
| **5. Aankoop Voltooid**| `purchase` | `Purchase` | Stripe keert succesvol terug met orderbedrag & sessie-ID. |

---

## 4. UTM-LINK GENERATOR & CAMPAGNE-TAGGING

Gebruik altijd **UTM-parameters** in je links zodat je in Google Analytics exact ziet welke post omzet heeft gedraaid.

### Structuur van een UTM Link:
`https://www.fre2028.la/bambum?utm_source=[KANAAL]&utm_medium=[TYPE]&utm_campaign=[NAAM]`

### Kant-en-klare Voorbeelden voor Jouw Promoties:

1. **Instagram Bio Link:**
   `https://www.fre2028.la/bambum?utm_source=instagram&utm_medium=bio_link&utm_campaign=main_profile`
2. **Instagram Reel (Biomechanica / 4 Spieren Hook):**
   `https://www.fre2028.la/bambum?utm_source=instagram&utm_medium=reels&utm_campaign=hook_4_muscles`
3. **Reddit Post op `r/climbharder`:**
   `https://www.fre2028.la/bambum?utm_source=reddit&utm_medium=forum&utm_campaign=biomechanics_pulley_safe`
4. **QR-Code op Toonbankdisplay in Klimzalen:**
   `https://www.fre2028.la/bambum?utm_source=gym_display&utm_medium=qr_code&utm_campaign=stordeur_leuven`
5. **E-mail Outreach naar Klimtrainers:**
   `https://www.fre2028.la/bambum?utm_source=coach_outreach&utm_medium=email&utm_campaign=trainer_pack`

---

## 5. DATA INTERPRETATIE PLAYBOOK: HOE STUUR JE BIJ?

Als CCO adviseer ik om wekelijks 10 minuten naar deze 3 KPI's te kijken:

### Scenario A: Veel traffic, maar weinig aankopen (CVR < 1,5%)
* **Diagnose:** Bezoekers vinden het concept interessant, maar twijfelen over de prijs, verzendkosten of specificaties.
* **Actie:** Bekijk in Microsoft Clarity 10 sessies. Haken mensen af bij het selecteren van het verzendland? Is de foto van het complete pair duidelijk genoeg? Voeg eventueel meer social proof toe.

### Scenario B: Hoge advertentiekost per verkoop (Paid CAC > € 14,00)
* **Diagnose:** De advertentie-hook is te algemeen of de video spreekt niet direct het specifieke klimmer-probleem aan (pomp / slopers / pulley ontlasting).
* **Actie:** Vervang de video door een kortere 8-seconden clip met een harde visuele hook (kabelmachine actie + close-up van de matte finish met gouden kroon).

### Scenario C: 80%+ van de bestellingen kiest het Complete Pair (€ 44,95)
* **Diagnose:** Klimmers begrijpen de meerwaarde van bilaterale training en de katoenen pouch.
* **Actie:** Bevestig de focus op het Pair. Overweeg de Starter Single Unit puur als 'anker' te houden om het paar nog aantrekkelijker te maken.
