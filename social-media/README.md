# Social Media Posts - 1000 Dagen Campaign

Deze map bevat HTML templates voor social media posts voor de "1000 Dagen tot LA 2028" campagne.

## Bestanden

### 📱 Instagram Post (1080x1080px)
**Bestand:** `instagram-post.html`
- Vierkant formaat voor feed posts
- Design gebaseerd op de brochure voorkant
- Zwarte achtergrond met climbing image
- Bold typography met countdown "1000 DAGEN"

### 📲 Instagram Story (1080x1920px)
**Bestand:** `instagram-story.html`
- Verticaal formaat voor stories
- Volledig scherm design
- Call-to-action onderaan: "FRE2028.LA"

### 💼 LinkedIn Post (1200x627px)
**Bestand:** `linkedin-post.html`
- Professioneel horizontaal formaat
- Horizontale layout met countdown links en boodschap rechts
- Geschikt voor LinkedIn sharing

### 👥 Facebook Post (1200x630px)
**Bestand:** `facebook-post.html`
- Horizontaal formaat voor Facebook
- Gecentreerde layout
- Optimaal voor Facebook timeline

## Gebruik

### Optie 1: Screenshot maken
1. Open het HTML bestand in een browser
2. Zoom naar 100%
3. Maak een screenshot van de post
4. Upload naar het social media platform

### Optie 2: Browser Print naar PNG
1. Open het HTML bestand
2. Open Developer Tools (F12)
3. Gebruik screenshot functie (vaak in het ... menu)
4. Selecteer "Capture full size screenshot"

### Optie 3: Met Node.js/Puppeteer (Aanbevolen)
```bash
npm install puppeteer
```

Maak een `generate-images.js` bestand:
```javascript
const puppeteer = require('puppeteer');
const path = require('path');

async function generateImage(filename, width, height) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setViewport({ width, height });
  await page.goto(`file://${path.join(__dirname, filename)}`);
  
  const outputName = filename.replace('.html', '.png');
  await page.screenshot({ 
    path: outputName,
    fullPage: false 
  });
  
  await browser.close();
  console.log(`✅ Generated: ${outputName}`);
}

(async () => {
  await generateImage('instagram-post.html', 1080, 1080);
  await generateImage('instagram-story.html', 1080, 1920);
  await generateImage('linkedin-post.html', 1200, 627);
  await generateImage('facebook-post.html', 1200, 630);
})();
```

Run: `node generate-images.js`

## Design Elementen

### Kleuren
- **Primair:** Zwart (#000)
- **Tekst:** Wit (#fff)
- **Secondary:** Grijstinten (#d0d0d0, #888)

### Typografie
- **Groot (Countdown):** 120-180px, font-weight: 900
- **Headings:** 24-48px, font-weight: 700
- **Body:** 26-42px, font-weight: 400

### Afbeelding
- Gebruikt: `/images/web/me_innsbruck_banner_web.webp`
- Effect: Grayscale, 30-40% opacity
- Gradient overlay voor leesbaarheid

## Boodschap

De posts bevatten de volgende kernboodschap:

> "Nog exact 1000 Dagen tot de Paralympische spelen. Op deze symbolische dag start ik mijn communicatie campagne om paraklimmen en de paralympische spelen onder de aandacht te brengen. Mijn doel is om de eerste paralympier van Leuven te worden."

Met call-to-action: **FRE2028.LA** (nieuwsbrief inschrijving)

## Locatie

De social media bestanden staan in de **project root** onder `social-media/` (niet in `public/`).

## Aanpassingen

Om de bestanden aan te passen:
1. Open het HTML bestand in een text editor
2. Pas de tekst aan in de HTML structure
3. Pas styling aan in de `<style>` sectie
4. Test in browser voor correcte weergave

## Social Media Specificaties Bronnen

Afmetingen zijn gebaseerd op de officiële richtlijnen:
- **Instagram:** 1080x1080 (feed), 1080x1920 (story)
- **LinkedIn:** 1200x627
- **Facebook:** 1200x630

---

**Contact:** fre@fre2028.la | www.fre2028.la
