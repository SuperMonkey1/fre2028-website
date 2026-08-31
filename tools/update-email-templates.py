#!/usr/bin/env python3
"""
Regenerates all 27 HTML email templates with Frederik's approved copy and structure.
Guarantees NO duplicate subject line in body, exact signature, and personalized hooks.
"""

from pathlib import Path

MAILS_DIR = Path("content/Partners/mails")

LEADS_DATA = [
    {
        "slug": "hans-clijsters",
        "salutation": "Beste Hans,",
        "subject": "De weg naar Paralympisch goud & de Leuven 25 Support Circle — Fré Leys",
        "company": "Democo Group / Solidaris Brabant",
        "connection": """We kennen elkaar natuurlijk al een tijdje. Uw betrokkenheid bij zowel <strong>Democo</strong> als <strong>Solidaris Brabant</strong> maakt u tot iemand die als geen ander begrijpt wat veiligheid, veerkracht en inclusiviteit in de praktijk betekenen. Als partner binnen de Leuven 25 Support Circle verbinden we uw organisaties aan een inspirerend verhaal van Leuvense technische excellentie, veiligheidscultuur en G-sport maatschappelijke impact.""",
    },
    {
        "slug": "heidi-rakels",
        "salutation": "Beste Heidi,",
        "subject": "Van burgerlijk ingenieur naar Paralympisch goud — Fré Leys",
        "company": "Guardsquare / XYZT.AI",
        "connection": """Als burgerlijk ingenieur én Olympisch medaillewinnares judo belichaam jij als enige in Vlaanderen exact het pad van topsportmentaliteit gekoppeld aan diepe spitstechnologie. Als partner binnen de Leuven 25 Support Circle verbinden we jouw ervaring en mentorschap aan een authentiek verhaal van Leuvense tech-excellentie en grenzeloze ambitie.""",
    },
    {
        "slug": "francoise-chombar",
        "salutation": "Beste Françoise,",
        "subject": "STEM-ambassadeurschap & de weg naar Paralympisch goud — Fré Leys",
        "company": "Melexis / STEM Platform",
        "connection": """Als boegbeeld van het Vlaams STEM-platform en Melexis doorbreekt u dagelijks vooroordelen over technologie en diversiteit. Mijn profiel als doctor-ingenieur met een fysieke beperking toont aan jongeren en de tech-sector dat wiskundige discipline en topsportkracht hand in hand gaan. Als partner binnen de Leuven 25 Support Circle verbinden we Melexis aan een krachtig verhaal van STEM-diversiteit en maatschappelijke impact.""",
    },
    {
        "slug": "roland-duchatelet",
        "salutation": "Beste Roland,",
        "subject": "Data-gedreven sportanalyse & de weg naar LA 2028 — Fré Leys",
        "company": "Xtrion / Vivant",
        "connection": """Als ingenieur en serie-investeerder in sportoptimalisatie weet u hoe diepe data-analyse en biomechanica prestaties kunnen transformeren. Als partner binnen de Leuven 25 Support Circle verbinden we Xtrion aan een innovatief traject van wetenschappelijke topsportanalyse, precisie-engineering en maatschappelijke impact.""",
    },
    {
        "slug": "roderick-duchatelet",
        "salutation": "Beste Roderick,",
        "subject": "Opkomende olympische topsport & de weg naar LA 2028 — Fré Leys",
        "company": "Sportinvesteerder",
        "connection": """Met uw ruime ervaring in professioneel sportmanagement en investeringen herkent u het enorme groeipotentieel van de klimsport op het olympische en paralympische wereldtoneel. Als partner binnen de Leuven 25 Support Circle verbinden we uw sportvisie aan een baanbrekend traject naar Paralympisch goud.""",
    },
    {
        "slug": "rudi-de-winter",
        "salutation": "Beste Rudi,",
        "subject": "Precisie-engineering, sensoren & Paralympisch goud — Fré Leys",
        "company": "X-Fab",
        "connection": """De wereld van MEMS, sensoren en halfgeleiders draait om uiterste precisie en betrouwbaarheid onder zware omstandigheden — exact wat nodig is om met één functioneel been een overhangende rotswand te bedwingen. Als partner binnen de Leuven 25 Support Circle verbinden we X-Fab aan een authentiek verhaal van technische precisie en employer branding.""",
    },
    {
        "slug": "urbain-vandeurzen",
        "salutation": "Beste Urbain,",
        "subject": "KU Leuven ingenieurskracht & de weg naar LA 2028 — Fré Leys",
        "company": "LMS / Smile Invest / VMF Invest",
        "connection": """Als doctor-ingenieur in de Werktuigkunde van de KU Leuven en bezieler van Opening the Future toont u hoe Leuvense spitstechnologie de wereld kan veroveren. Mijn sportcarrière is een verlengstuk van diezelfde ingenieursdiscipline. Als partner binnen de Leuven 25 Support Circle verbinden we uw mecenaat aan een unieke Leuvense primeur op het wereldpodium.""",
    },
    {
        "slug": "wilfried-vancraen",
        "salutation": "Beste Wilfried,",
        "subject": "Medical 3D printing, biomechanica & Paralympisch goud — Fré Leys",
        "company": "Materialise",
        "connection": """Wat Materialise doet op het snijvlak van patiënt-specifieke implantaten en medische 3D-innovatie sluit naadloos aan bij mijn dagelijkse zoektocht naar biomechanische optimalisatie. Als partner binnen de Leuven 25 Support Circle verbinden we Materialise aan een tastbaar verhaal van Leuvense medische spitstechnologie en inclusieve topsport.""",
    },
    {
        "slug": "kuleuven-alumni",
        "salutation": "Beste Inge en redactie GeniaaL,",
        "subject": "Alumnus doctor-ingenieur naar Paralympisch goud — Fré Leys",
        "company": "KU Leuven Alumni & Alumnirelaties",
        "connection": """Als alumnus doctor in de Werktuigkunde van de KU Leuven draag ik onze facultaire trots graag uit naar het brede alumninetwerk. Mijn traject verbindt academische spitstechnologie met internationale topsport. Als partner binnen de Leuven 25 Support Circle inspireren we tienduizenden alumni en ingenieursleiders met een verhaal van veerkracht en Leuvense innovatie.""",
    },
    {
        "slug": "luc-van-den-hove",
        "salutation": "Beste Luc,",
        "subject": "Wearables, spitstechnologie & Paralympisch goud — Fré Leys",
        "company": "imec",
        "connection": """Wat imec realiseert in grensverleggende nano-elektronica en gezondheidssensoren (OnePlanet) vormt de absolute wereldtop. Als atleet met een fysieke beperking vraag ik het uiterste van biomechanische monitoring. Als partner binnen de Leuven 25 Support Circle verbinden we imec aan een inspirerend verhaal van Leuvense spitstechnologie en menselijke topprestaties.""",
    },
    {
        "slug": "koenraad-debackere",
        "salutation": "Beste Koenraad,",
        "subject": "Valorisatie, spitstechnologie & Paralympisch goud — Fré Leys",
        "company": "KU Leuven R&D (LRD)",
        "connection": """Als architect van het Leuvense spin-off ecosysteem en valorisatie van KU Leuven spitstechnologie weet u hoe academische discipline leidt tot wereldprestaties. Als partner binnen de Leuven 25 Support Circle verbinden we het innovatieve universitaire ecosysteem aan een historisch Leuvens topsporttraject.""",
    },
    {
        "slug": "paul-van-dun",
        "salutation": "Beste Paul,",
        "subject": "Leuvense spin-offs & de weg naar Paralympisch goud — Fré Leys",
        "company": "KU Leuven R&D (LRD)",
        "connection": """Vanuit LRD bouwt u dagelijks bruggen tussen spitstechnologie en ondernemerschap. Als doctor in de Werktuigkunde belichaam ik diezelfde drive op de internationale klimwand. Als partner binnen de Leuven 25 Support Circle verbinden we de Leuvense innovatiekracht aan een ongekend verhaal van doorzettingsvermogen.""",
    },
    {
        "slug": "martin-de-prycker",
        "salutation": "Beste Martin,",
        "subject": "Deep Tech, topsportmedia & Paralympisch goud — Fré Leys",
        "company": "Qbic Fund / EVS",
        "connection": """Uw expertise op het kruispunt van Deep Tech fondsen (Qbic) en wereldwijde olympische broadcasttechnologie (EVS) sluit perfect aan bij de exponentiële groei van de klimsport. Als partner binnen de Leuven 25 Support Circle verbinden we uw netwerk aan een authentiek verhaal van technologische en sportieve topprestaties.""",
    },
    {
        "slug": "comate",
        "salutation": "Beste Sander en Wouter,",
        "subject": "Hardware builders grit & de weg naar Paralympisch goud — Fré Leys",
        "company": "Comate Engineering & Design",
        "connection": """Als ingenieurs die complexe fysieke producten vanaf een wit blad realiseren, begrijpen jullie de combinatie van berekende precisie en pure doorzettingskracht. Comate staat symbool voor het allerbeste in Vlaams hardware-design. Als partner binnen de Leuven 25 Support Circle verbinden we Comate aan een inspirerend verhaal van Leuvense hardware-engineering, employer branding en maatschappelijke impact.""",
    },
    {
        "slug": "amnovis-replasia",
        "salutation": "Beste Jonas en Peter,",
        "subject": "Additive manufacturing, biomechanica & Paralympisch goud — Fré Leys",
        "company": "Amnovis / Replasia",
        "connection": """Als mede-ingenieurs van de KU Leuven en pioniers in 3D-metaalprinten en adaptieve medische implantaten begrijpen jullie de biomechanische interactie tussen mens en structuur tot op micronniveau. Als partner binnen de Leuven 25 Support Circle verbinden we Amnovis en Replasia aan een tastbaar verhaal van Leuvense additieve spitstechnologie en inclusieve topsport.""",
    },
    {
        "slug": "xenomatix",
        "salutation": "Beste Filip,",
        "subject": "Precisie-engineering: Van lidar wegdekmeting tot olympisch paraklimmen — Fré Leys",
        "company": "XenomatiX",
        "connection": """Of het nu gaat om het millimeter-nauwkeurig scannen van een wegdek via solid-state lidar, of het optisch lezen van de route op een klimwand: succes draait om meetprecisie en focus. Als partner binnen de Leuven 25 Support Circle verbinden we XenomatiX aan een authentiek verhaal van Leuvense sensortechnologie, employer branding en topsportkracht.""",
    },
    {
        "slug": "guardsquare-eric",
        "salutation": "Beste Eric,",
        "subject": "Van diepe niche-expertise naar wereldfaam — Fré Leys",
        "company": "Guardsquare",
        "connection": """Wat jij met ProGuard en Guardsquare hebt neergezet — vanuit een diepe technische focus en onwrikbare code-integriteit een wereldwijde standaard bouwen — is pure inspiratie. Zowel in softwarebeveiliging als op een extreme klimroute is er geen marge voor fouten. Als partner binnen de Leuven 25 Support Circle verbinden we Guardsquare aan een verhaal van Leuvense technische excellentie en extreme focus.""",
    },
    {
        "slug": "pharrowtech",
        "salutation": "Beste Wim,",
        "subject": "Leuvense deep-tech innovatie & de weg naar Paralympisch goud — Fré Leys",
        "company": "Pharrowtech",
        "connection": """Wat Pharrowtech neerzet in mmWave draadloze spitstechnologie vanuit het Leuvense imec-ecosysteem toont hoe wiskundige discipline en innovatie grenzen verleggen. Als snelgroeiende scale-up is sterke employer branding cruciaal. Als partner binnen de Leuven 25 Support Circle verbinden we Pharrowtech aan een internationaal resonerend verhaal van spitstechnologie en menselijke volharding.""",
    },
    {
        "slug": "piet-colruyt",
        "salutation": "Beste Piet,",
        "subject": "Inclusie, maatschappelijke impact & de weg naar LA 2028 — Fré Leys",
        "company": "Impact House / Impact Capital",
        "connection": """Als ingenieur-architect en pionier in impact investing weet je als geen ander dat echte verandering ontstaat wanneer structureel denken gekoppeld wordt aan een diepe maatschappelijke missie. Als partner binnen de Leuven 25 Support Circle verbinden we Impact Capital aan een inspirerend verhaal van Leuvense inclusie, adaptieve sportinnovatie en maatschappelijke impact.""",
    },
    {
        "slug": "marc-coucke",
        "salutation": "Beste Marc,",
        "subject": "Topsportpassie, veerkracht & Belgisch goud in LA 2028 — Fré Leys",
        "company": "Alychlo / Comate Ventures",
        "connection": """Uw passie voor de Belgische topsport en uw geloof in ondernemers met buitengewone ambitie en veerkracht zijn welbekend. Via mijn sterke connectie met het Leuvense innovatie-ecosysteem en Comate Ventures zie ik hoe ondernemerschap en sport elkaar versterken. Als partner binnen de Leuven 25 Support Circle verbinden we uw ondernemershart aan een historisch Belgisch succesverhaal.""",
    },
    {
        "slug": "michel-akkermans",
        "salutation": "Beste Michel,",
        "subject": "Van KU Leuven ingenieur naar Paralympisch goud — Fré Leys",
        "company": "Pamica / imec",
        "connection": """Als burgerlijk ingenieur van de KU Leuven en serial tech-ondernemer en investeerder weet u wat het betekent om met berekend risico en ongekende focus internationaal het verschil te maken. Als partner binnen de Leuven 25 Support Circle verbinden we uw leiderschap aan een inspirerend verhaal van Leuvense tech-excellentie en data-gedreven topsport.""",
    },
    {
        "slug": "jurgen-ingels",
        "salutation": "Beste Jurgen,",
        "subject": "Ingenieursdenken, extreme veerkracht & het podium van LA 2028 — Fré Leys",
        "company": "SmartFin / SuperNova",
        "connection": """Jouw filosofie over schalen, focus en het doorbreken van schijnbaar onmogelijke barrières is de drijvende kracht achter de tech-community. Mijn verhaal als ingenieur-atleet — wiskundig analyseren, trainen met extreme discipline en presteren onder maximale stress — breng ik heel graag als keynote op SuperNova of binnen uw netwerk. Als partner binnen de Leuven 25 Support Circle verbinden we SmartFin aan een energiek verhaal van veerkracht en innovatie.""",
    },
    {
        "slug": "stijn-bijnens",
        "salutation": "Beste Stijn,",
        "subject": "Data-gedreven veerkracht & innovatie richting LA 2028 — Fré Leys",
        "company": "Cegeka / Proximus",
        "connection": """Jouw leiderschap in het verbinden van spitstechnologie (AI, cloud, 5G) aan menselijke meerwaarde en wendbaarheid is een baken voor het IT-landschap. Topklimmen met één been is een continue oefening in data-analyse, route-optimalisatie en mentale veerkracht. Als partner binnen de Leuven 25 Support Circle verbinden we jullie organisatie aan een authentiek verhaal van innovatie, inclusie en technologisch leiderschap.""",
    },
    {
        "slug": "jan-paesen",
        "salutation": "Beste Jan,",
        "subject": "Leuvense ambassadeur op het wereldpodium: Health, High-Tech & LA 2028 — Fré Leys",
        "company": "Leuven MindGate",
        "connection": """Leuven MindGate positioneert onze regio wereldwijd als dé hotspot voor Health, High-Tech en Creativiteit. Mijn traject als Leuvense burgerlijk ingenieur en paraklimmer brengt die drie pijlers op een unieke manier samen. Als partner binnen de Leuven 25 Support Circle kan ik als officiële stads- en innovatie-ambassadeur ons regionale ecosysteem internationaal vertegenwoordigen.""",
    },
    {
        "slug": "danielle-vanwesenbeeck",
        "salutation": "Beste Daniëlle,",
        "subject": "Ondernemersveerkracht, regionale trots & de weg naar LA 2028 — Fré Leys",
        "company": "Voka Vlaams-Brabant / Mastermail",
        "connection": """Als boegbeeld van Voka Vlaams-Brabant en gedreven toponderneemster zet u zich dagelijks in om ondernemerschap en veerkracht te stimuleren. Ondernemen en topsport met een beperking delen hetzelfde DNA: berekende risico's nemen en blijven doorgaan. Als partner binnen de Leuven 25 Support Circle bieden we Voka-ondernemers pure inspiratie over weerbaarheid en inclusief leiderschap.""",
    },
    {
        "slug": "charles-beauduin",
        "salutation": "Beste Charles,",
        "subject": "Wereldwijde technologische excellentie & de weg naar LA 2028 — Fré Leys",
        "company": "Barco / Vandewiele",
        "connection": """Met Barco en Vandewiele bewijst u al decennialang hoe Vlaamse spitstechnologie en industriële machinebouw op wereldvlak de standaard zetten. Uw steun voor technologische innovatie en Belgische topexcellentie sluit naadloos aan bij mijn missie als ingenieur-atleet. Als partner binnen de Leuven 25 Support Circle verbinden we uw industrieel leiderschap aan een historische Paralympische primeur.""",
    },
    {
        "slug": "wim-van-hecke",
        "salutation": "Beste Wim,",
        "subject": "Gezondheidstechnologie, data & de weg naar de Paralympische Spelen 2028 — Fré Leys",
        "company": "Icometrix",
        "connection": """Als ingenieur met een fysieke beperking is mijn sportcarrière een continue wisselwerking tussen data, biomechanica en menselijke veerkracht. Als partner binnen de Leuven 25 Support Circle verbinden we Icometrix aan een inspirerend verhaal van Leuvense health-tech excellentie en maatschappelijke impact.""",
    },
]

def generate_html(lead):
    return f"""<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <title>Email – {lead['company']}</title>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: #18181b; line-height: 1.6; max-width: 640px; margin: 30px auto; padding: 0 20px; }}
    .subject-line {{ display: none; }}
    p {{ margin: 0 0 16px 0; }}
    ul {{ margin: 6px 0 18px 20px; padding: 0; }}
    li {{ margin-bottom: 8px; }}
    strong {{ color: #09090b; }}
    a {{ color: #1a73e8; text-decoration: underline; }}
    .signature {{ margin-top: 28px; border-top: 1px solid #e4e4e7; padding-top: 18px; color: #27272a; }}
  </style>
</head>
<body>

<div class="subject-line">{lead['subject']}</div>

<p>{lead['salutation']}</p>

<p>Mijn naam is Fré Leys. Ik doctoreerde in de Werktuigkunde aan de KU Leuven, heb een aangeboren afwijking aan mijn rechterbeen, en klim al tien jaar op mondiaal niveau voor het Belgische nationale paraklimteam. Met 6 internationale medailles – waaronder 2x Wereldbeker Goud – mik ik op een historische mijlpaal: goud op de Paralympische Spelen in Los Angeles 2028. Ik zou daarmee de eerste Paralympiër van Leuven worden!</p>

<p><strong>De connectie met {lead['company'].split('/')[0].strip()}:</strong><br>
{lead['connection']}</p>

<p><strong>Wat houdt het partnership in?</strong></p>

<ul>
  <li>Een structureel partnership van <strong>€100/maand (€1.200/jaar)</strong> richting LA 2028</li>
  <li><strong>Visibiliteit & Employer Branding</strong>: Logo op <a href="https://fre2028.la">fre2028.la</a>, trainingskledij en aanwezig op al mijn initiatieven.</li>
  <li>Een <strong>inspirerende keynote</strong> over de fundamenten van het waarmaken van dromen en doorzettingsvermogen</li>
  <li>Of een <strong>kliminitiatie / teambuilding dag</strong> voor +/- 8 personen</li>
  <li><strong>Maatwerk</strong>: Alles is bespreekbaar en af te stemmen op de specifieke doelen van jullie organisatie.</li>
</ul>

<p>Het volledige partnerschap dossier kan je hier alvast bekijken: <a href="https://fre2028.la/Frederik-Leys-Partnership-Dossier.pdf">Partnerschap Dossier (PDF)</a></p>

<p>Zou je het zien zitten om kennis te maken en te zien wat er mogelijk is?</p>

<div class="signature">
  <p>Met vriendelijke groeten,<br><br>
  <strong>Fré Leys</strong><br>
  Vice World Champion (Paraclimbing, Leg Amputee)<br>
  More info on <a href="https://fre2028.la" style="color: #1a73e8; text-decoration: underline; font-weight: bold;">fre2028.la</a></p>
</div>

</body>
</html>"""

MAILS_DIR.mkdir(parents=True, exist_ok=True)

for lead in LEADS_DATA:
    filepath = MAILS_DIR / f"{lead['slug']}.html"
    content = generate_html(lead)
    filepath.write_text(content, encoding="utf-8")
    print(f"[OK] Generated: {lead['slug']}.html")

print(f"\nSuccessfully regenerated all {len(LEADS_DATA)} email templates!")

