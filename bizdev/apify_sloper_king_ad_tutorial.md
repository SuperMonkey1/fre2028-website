# Apify Playbook: Data-Driven Content & Ad Intelligence for Bambum Sloper King

Dit document beschrijft hoe je [Apify](https://apify.com) inzet om data, hooks, pijnpunten en winnende advertentieconcepten te minen voor de **Bambum Sloper King** (en aanverwante klimtrainingstools).

---

## 1. Doel & Strategie

In plaats van te gokken welke hooks en advertenties werken, gebruiken we web scraping en social intelligence om:
1. **Lopende advertenties van concurrenten te analyseren** (longevity = profitability).
2. **Echte frustraties en behoeften van klimmers te minen** (Reddit, YouTube).
3. **Virale formats en sound trends te identificeren** (Instagram Reels, TikTok).
4. **De ruwe data met AI om te zetten in kant-en-klare ad scripts en content hooks**.

---

## 2. Benodigde Apify Actors & Data Mining

### A. Concurrentie & Meta Ads (Creative Espionage)
* **Actor:** `apify/facebook-ads-scraper` of `curious_coder/facebook-ads-library-scraper`
* **Doelen/Merken:**
  * Merken van hangboards/holds: *Beastmaker*, *Tension Climbing*, *Lattice Training*, *Escape Climbing / Kingdom*, *Metolius*.
* **Zoekparameters:**
  * Zoektermen: `hangboard`, `sloper`, `grip strength`, `climbing training`.
  * Filter op: Advertenties die **>30 dagen actief** zijn (indicatie van winstgevende ROAS).
* **Wat te extraheren:**
  * Eerste 3 seconden van video-ads (visual hook).
  * Primaire advertentieteksten (body copy) en call-to-actions (CTA).

---

### B. Klantentaal & Pijnpunten Minen (Reddit)
* **Actor:** `trudax/reddit-scraper`
* **Subreddits:**
  * `r/climbharder`
  * `r/bouldering`
  * `r/climbing`
* **Zoektermen:**
  * `"train slopers"`, `"sloper strength"`, `"wrist pain slopers"`, `"falling off slopers"`, `"contact strength"`.
* **Wat te extraheren:**
  * Posts en top-comments met hoge interactie.
  * Exacte bewoordingen van klimmers over polsbelasting, open-hand grip en frustraties.

---

### C. Video Hooks & Reacties (YouTube)
* **Actor:** `streamers/youtube-comments-scraper` of `streamers/youtube-scraper`
* **Doelkanalen & Video's:**
  * *Lattice Training*, *Hooper's Beta*, *Emil Abrahamsson*, *Dave MacLeod*.
  * Zoek op tutorials over sloper-techniek en polsblessures.
* **Wat te extraheren:**
  * Veelgestelde vragen in de comments.
  * Meningen over hout vs. kunststof (textuur, wrijving, velbesparing).

---

### D. Virale Content & Formats (Instagram / TikTok)
* **Actor:** `apify/instagram-hashtag-scraper` / `clockworks/free-tiktok-scraper`
* **Hashtags:** `#hangboard`, `#slopertraining`, `#boulderingtraining`, `#fingertraining`
* **Wat te extraheren:**
  * Top 10% reels/video's gesorteerd op share/save ratio.
  * Formats (splitscreen, micro-beta, audio trends, fail-to-send progressions).

---

## 3. Data Processing Pipeline (Apify $\to$ AI Prompts)

Exporteer de gescrapete data als JSON/CSV en voer de samenvatting in een LLM (Gemini / Claude / ChatGPT) met onderstaande prompt:

```text
Je bent een senior direct-response copywriter en expert in sportmarketing/bouldering.
Hieronder vind je gescrapete reacties van klimmers en data van lopende hangboard-advertenties:

[PLAK HIER RELEVANTE REDDIT/YOUTUBE COMMENTS EN META AD COPIES]

Product: Bambum Sloper King (houten trainingshold/sloper voor open-hand kracht, polsstabiliteit en velvriendelijke training).

Genereer op basis van deze data:
1. 5 Killer Video Hooks (eerste 3 seconden) die direct inspelen op de genoemde frustraties.
2. 2 UGC Script Outlines (30-45 sec) volgens het PAS-framework (Problem - Agitate - Solve).
3. 3 Varianten voor Meta Ad Primary Copy gericht op gevorderde boulderaars (V5+).
```

---

## 4. Drie Bewezen Creatieve Formats voor de Sloper King

1. **The "Ego Check" (Hook Focus):**
   * *Visual:* Klimmer hangt moeiteloos aan een microsmall crimp, maar glijdt meteen af van een eenvoudige sloper.
   * *Tekst overlay:* "Sterke vingers $\neq$ contactkracht. Waarom 80% van de klimmers slopers vermijdt."
2. **The "Skin & Friction" Vergelijking:**
   * *Visual:* Hars/polyester holds die de huid openrijten vs. de ergonomische, fijne houten afwerking van de Bambum Sloper King.
   * *Angle:* Langer trainen zonder je huid te verbranden.
3. **The "Micro-Beta" Tip (Organisch & Retargeting):**
   * *Visual:* Close-up van polshoek en handplaatsing: actief trekken vanuit de pols vs. passief hangen.
