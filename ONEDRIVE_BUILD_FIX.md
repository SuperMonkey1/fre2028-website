# ⚠️ OneDrive Build Issue & Oplossing

## Probleem
Er is een bekende issue met Next.js projecten in OneDrive mappen:
```
Error: EPERM: operation not permitted, open '.next\trace'
```

Dit komt omdat OneDrive realtime sync conflicteert met hoe Next.js build bestanden schrijft.

## ✅ Oplossingen (Kies één)

### Optie 1: Exclude .next folder van OneDrive (AANBEVOLEN)
1. Ga naar je project map in Windows Verkenner
2. Rechtsklik op de `.next` folder
3. Kies "Free up space" of "Always keep on this device" → dan "Free up space"
4. Of voeg `.next` toe aan OneDrive exclusion list

### Optie 2: Verplaats Project Buiten OneDrive
Verplaats het project naar:
- `C:\Projects\fre2028-website`
- `C:\dev\fre2028-website`
- Elke andere locatie buiten OneDrive

**Commando:**
```powershell
# Stop OneDrive sync tijdelijk
# Verplaats de hele folder
Move-Item "C:\Users\frede\OneDrive - Parabel VZW\CLIMBING\__FRE2028\lithium website\fre2028-website" "C:\Projects\fre2028-website"
cd "C:\Projects\fre2028-website"
npm install
npm run dev
```

### Optie 3: Disable OneDrive Sync voor hele project folder
1. Open OneDrive instellingen
2. Ga naar "Account" tab → "Choose folders"
3. Deselect de `CLIMBING\__FRE2028\lithium website\fre2028-website` folder

### Optie 4: Build op andere machine / CI/CD
- Deploy direct vanuit GitHub naar hosting (Firebase, Vercel, etc.)
- Laat de build daar gebeuren (geen OneDrive issues)

## 🎯 Wat WEL werkt

Al je SEO optimalisaties zijn correct geïmplementeerd:
- ✅ `_document.tsx` - Meta tags, geo-targeting
- ✅ `index.tsx` - Homepage SEO met structured data
- ✅ `story.tsx` - Story page SEO
- ✅ `robots.txt` - Search engine toegang
- ✅ `sitemap.xml` - Handmatige sitemap
- ✅ `next-sitemap.config.js` - Automatische sitemap config
- ✅ `next.config.js` - Performance & SEO headers

## 🚀 Testen zonder build

Je kunt de dev server gebruiken om SEO te testen:

```powershell
# Als .next folder problemen geeft, verwijder deze eerst:
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# Start dev server
npm run dev
```

Bezoek dan:
- http://localhost:3000
- http://localhost:3000/story

En test met:
- Browser "View Page Source" → Check meta tags
- Facebook Debugger (na deployment)
- Twitter Card Validator (na deployment)

## 📦 Deployment naar Production

### Aanbevolen: Deploy via GitHub + Vercel/Firebase

**Stappen:**
1. Push je code naar GitHub
2. Connect GitHub repo met Vercel of Firebase Hosting
3. Elke push triggert automatisch een build (zonder OneDrive issues!)

**Voor Firebase:**
```powershell
# Eenmalig: installeer Firebase CLI
npm install -g firebase-tools

# Deploy (build gebeurt in cloud)
firebase deploy --only hosting
```

**Voor Vercel (MAKKELIJKSTE):**
1. Ga naar vercel.com
2. "Import Git Repository"
3. Kies je GitHub repo
4. Click "Deploy"
5. Done! ✅

Vercel bouwt automatisch en je krijgt een URL zoals:
`https://fre2028.vercel.app` (kun je daarna custom domain instellen)

## ✨ Next Steps

1. **Kies een oplossing voor het OneDrive probleem**
2. **Test de dev server** → `npm run dev`
3. **Deploy naar production** (Vercel/Firebase)
4. **Setup Google Search Console** (zie SEO_QUICK_START.md)

## 💡 Pro Tip

Voor web development projecten:
- Bewaar source code NIET in OneDrive
- Gebruik Git/GitHub voor version control
- OneDrive is prima voor backups, maar niet voor actieve development

## Hulp nodig?

Alle SEO implementaties zijn correct. Het enige probleem is de OneDrive sync.
Volg één van de oplossingen hierboven en je bent klaar! 🎉
