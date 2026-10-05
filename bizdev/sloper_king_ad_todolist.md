# To-Do List: Bambum Sloper King Ad & Content Campaign

Dit actieplan volgt het stappenplan uit de Apify Tutorial: [apify_sloper_king_ad_tutorial.md](file:///c:/Users/frede/Documents/GitHub/fre2028-website/bizdev/apify_sloper_king_ad_tutorial.md).

---

## Fase 1: Setup & Data Scraping (Apify)
*Zie Sectie 2 van de [Apify Tutorial](file:///c:/Users/frede/Documents/GitHub/fre2028-website/bizdev/apify_sloper_king_ad_tutorial.md) voor concrete actor-namen en zoekparameters.*

- [ ] **Apify Account & API Configureren**
  - [ ] Account aanmaken / inloggen op Apify.
  - [ ] Gratis tier of starter credits activeren.
- [ ] **Concurrentieonderzoek (Meta Ads)**
  - [ ] Run `apify/facebook-ads-scraper` op Beastmaker, Tension Climbing, Lattice Training en Escape/Kingdom Climbing.
  - [ ] Filter op ads die langer dan 30 dagen live staan.
  - [ ] Exporteer winnende copy's en hook-patronen naar JSON/CSV.
- [ ] **Pijnpunten Minen (Reddit)**
  - [ ] Run `trudax/reddit-scraper` op `r/climbharder`, `r/bouldering` en `r/climbing`.
  - [ ] Zoeken naar queries rondom sloperkracht, polspijn en wrijving.
  - [ ] Top-upvoted reacties en exacte klantentaal extraheren.
- [ ] **Social Trends & Formats Scrapen (IG / TikTok / YouTube)**
  - [ ] Run `streamers/youtube-comments-scraper` op top sloper-tutorials van Lattice / Hooper's Beta.
  - [ ] Run `apify/instagram-hashtag-scraper` op `#slopertraining` en `#hangboard`.
  - [ ] Sorteer op engagement/views en noteer de top 5 virale visual formats.

---

## Fase 2: Content Creatie & Copywriting (AI Pipeline)
*Zie Sectie 3 & 4 van de [Apify Tutorial](file:///c:/Users/frede/Documents/GitHub/fre2028-website/bizdev/apify_sloper_king_ad_tutorial.md) voor de LLM-prompts en formats.*

- [ ] **Data Synthese met AI**
  - [ ] Upload de gescrapete CSV/JSON data naar Claude / Gemini.
  - [ ] Draai de prompt uit de tutorial om hooks en scripts te genereren.
- [ ] **Ad Scripts & Copy Uitschrijven**
  - [ ] 5x Hook-varianten opstellen (bijv. "The Ego Check", "Wood vs. Plastic Skin Burn").
  - [ ] 2x UGC video scripts uitwerken (30-45 seconden, PAS-structuur).
  - [ ] 3x Ad headlines en primary text varianten klaarmaken voor Meta Ads.

---

## Fase 3: Productie & Asset Verzameling
- [ ] **Beeldmateriaal Schieten / Verzamelen**
  - [ ] Macro close-up beelden maken van het hout en de afwerking van de Sloper King.
  - [ ] B-roll opnemen van polspositie (actief vs. passief hangen) en gripcontact.
  - [ ] "Sloper slip vs. hold" demo opnemen voor de eerste 3 seconden visual hook.
- [ ] **Video Editing**
  - [ ] Snelle dynamische montage met captions en sound overlays.
  - [ ] Call-to-action toevoegen aan het einde van elke video.

---

## Fase 4: Launch & A/B Testing
- [ ] **Meta Ad Campaign Opzetten**
  - [ ] Doelgroep instellen: klimmers, boulderaars, hangboard interesses.
  - [ ] A/B test inrichten tussen de verschillende hooks ("Ego Check" vs. "Skin & Friction").
- [ ] **Performance Review**
  - [ ] CTR (doorklikratio), hook-rate (3s view rate) en ROAS monitoren na 7 dagen.
  - [ ] Verliezers pauzeren en winnende creatieve concepten opschalen.
