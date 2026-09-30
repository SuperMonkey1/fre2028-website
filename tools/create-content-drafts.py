#!/usr/bin/env python3
"""
Creates Gmail drafts for the 3 key content & communication partners:
1. Hotel Bonka (High-End Docu / TV / Storytelling)
2. We Are Your Wingman (Social Media / Vertical Video)
3. De Praeters (Podcast / Audio Storytelling)
"""

import sys
import json
from pathlib import Path

# Add tools to sys.path
tools_dir = Path(__file__).resolve().parent
if str(tools_dir) not in sys.path:
    sys.path.insert(0, str(tools_dir))

from importlib.machinery import SourceFileLoader
create_gmail_mod = SourceFileLoader("create_gmail_drafts", str(tools_dir / "create-gmail-drafts.py")).load_module()

get_gmail_service = create_gmail_mod.get_gmail_service
get_fre2028_label_id = create_gmail_mod.get_fre2028_label_id
create_draft = create_gmail_mod.create_draft

DRAFTS = [
    {
        "id": "hotel-bonka",
        "to": "info@hotelbonka.be",
        "company": "Hotel Bonka",
        "name": "Team Hotel Bonka",
        "subject": "Creatieve samenwerking & storytelling: Dr. Ir. Fré Leys op weg naar LA 2028",
        "plain": """Beste team Hotel Bonka,

Jullie staan in Vlaanderen bekend om verhalen die écht iets in beweging zetten en maatschappelijke impact tastbaar maken met de allerhoogste visuele productiewaarde ("Check in to positive change"). Net daarom kom ik graag bij jullie aankloppen.

Mijn naam is dr. ir. Frederik (Fré) Leys. Ik ben doctor in de ingenieurswetenschappen (KU Leuven) én atleet in de Belgische nationale paraklimploeg (2x goud op de Wereldbeker). Mijn ultieme doel: de allereerste Paralympiër ooit worden uit Leuven op de Paralympische Spelen van Los Angeles in 2028, waar paraklimmen zijn historische debuut maakt.

Mijn traject is geen klassiek sportverhaal: het is een uniek kruispunt van biomechanica, robotica/technologie, veerkracht en grensverleggende topsport.

Ik zoek een creatieve lead media- en contentpartner in Leuven die dit narratief mee tot leven wil brengen. Denk aan:
• Het ontwikkelen van een (mini)documentaire of pitch voor een tv-format/omroep rond de weg naar LA28.
• Het vastleggen van de reis naar internationale Wereldbekers (van Salt Lake City tot Los Angeles) en trainingskampen.
• Een verhaal dat inclusie, spitstechnologie en doorzettingsvermogen op de nationale en internationale kaart zet.

Wat ik wél en niet zoek:
Ik heb geen budget om een commerciële bureaufee te betalen, maar vraag van jullie omgekeerd ook geen financiële sponsoring. Ik geloof rotsvast in een wederkerig barter-partnerschap:
1. Een award-winnende showcase: Een buitengewoon authentieke casus voor jullie portfolio, impactrapportages of creatieve vakprijzen (zoals Cannes Lions of Effie).
2. Exclusieve teamactivatie: Een keynote / lunch & learn door mezelf voor jullie team of zakelijke klanten over veerkracht, innovatie en presteren onder druk.
3. Volledige content- en merktoegang: Unieke beelden, backstage lab- en trainingstoegang, en officiële partnervermelding op fre2028.la.

Hebben jullie zin om hier eens 15 à 20 minuten vrijblijvend over te sparren bij een koffie in Leuven of via een korte videocall?

Met sportieve en collegiale groet,

Dr. Ir. Frederik (Fré) Leys
Doctor in de Ingenieurswetenschappen (KU Leuven)
Paraklimmer Belgische Nationale Ploeg (2x Wereldbeker Goud)
fre2028.la
""",
        "html": """<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: #18181b; line-height: 1.6; max-width: 640px;">
<p>Beste team Hotel Bonka,</p>

<p>Jullie staan in Vlaanderen bekend om verhalen die &eacute;cht iets in beweging zetten en maatschappelijke impact tastbaar maken met de allerhoogste visuele productiewaarde (<em>&quot;Check in to positive change&quot;</em>). Net daarom kom ik graag bij jullie aankloppen.</p>

<p>Mijn naam is <strong>dr. ir. Frederik (Fr&eacute;) Leys</strong>. Ik ben doctor in de ingenieurswetenschappen (KU Leuven) &eacute;n atleet in de Belgische nationale paraklimploeg (2x goud op de Wereldbeker). Mijn ultieme doel: de <strong>allereerste Paralympi&euml;r ooit worden uit Leuven</strong> op de Paralympische Spelen van Los Angeles in 2028, waar paraklimmen zijn historische debuut maakt.</p>

<p>Mijn traject is geen klassiek sportverhaal: het is een uniek kruispunt van <strong>biomechanica, robotica/technologie, veerkracht en grensverleggende topsport</strong>.</p>

<p>Ik zoek een creatieve lead media- en contentpartner in Leuven die dit narratief mee tot leven wil brengen. Denk aan:</p>
<ul style="padding-left: 20px; margin: 12px 0 16px 0; line-height: 1.7;">
  <li style="margin-bottom: 6px;">Het ontwikkelen van een <strong>(mini)documentaire of pitch voor een tv-format/omroep</strong> rond de weg naar LA28.</li>
  <li style="margin-bottom: 6px;">Het vastleggen van de reis naar internationale Wereldbekers (van Salt Lake City tot Los Angeles) en trainingskampen.</li>
  <li style="margin-bottom: 6px;">Een verhaal dat inclusie, spitstechnologie en doorzettingsvermogen op de nationale en internationale kaart zet.</li>
</ul>

<p><strong>Wat ik w&eacute;l en niet zoek:</strong><br>
Ik heb geen budget om een commerci&euml;le bureaufee te betalen, maar vraag van jullie omgekeerd ook geen financi&euml;le sponsoring. Ik geloof rotsvast in een <strong>wederkerig barter-partnerschap</strong>:</p>

<ol style="padding-left: 20px; margin: 12px 0 16px 0; line-height: 1.7;">
  <li style="margin-bottom: 6px;"><strong>Een award-winnende showcase:</strong> Een buitengewoon authentieke casus voor jullie portfolio, impactrapportages of creatieve vakprijzen (zoals Cannes Lions of Effie).</li>
  <li style="margin-bottom: 6px;"><strong>Exclusieve teamactivatie:</strong> Een keynote / lunch &amp; learn door mezelf voor jullie team of zakelijke klanten over veerkracht, innovatie en presteren onder druk.</li>
  <li style="margin-bottom: 6px;"><strong>Volledige content- en merktoegang:</strong> Unieke beelden, backstage lab- en trainingstoegang, en offici&euml;le partnervermelding op <a href="https://fre2028.la/?utm_source=hotel-bonka&utm_medium=email&utm_campaign=content_partner" style="color: #000; text-decoration: underline;">fre2028.la</a>.</li>
</ol>

<p>Hebben jullie zin om hier eens 15 &agrave; 20 minuten vrijblijvend over te sparren bij een koffie in Leuven of via een korte videocall?</p>

<p style="margin-top: 24px;">Met sportieve en collegiale groet,</p>

<p><strong>Dr. Ir. Frederik (Fr&eacute;) Leys</strong><br>
<span style="color: #52525b; font-size: 14px;">Doctor in de Ingenieurswetenschappen (KU Leuven) &bull; Paraklimmer Belgische Nationale Ploeg (2x Goud)</span><br>
<a href="https://fre2028.la/?utm_source=hotel-bonka&utm_medium=email&utm_campaign=content_partner" style="color: #000; text-decoration: underline; font-size: 14px;">fre2028.la</a></p>
</body>
</html>"""
    },
    {
        "id": "we-are-your-wingman",
        "to": "info@weareyourwingman.com",
        "company": "We Are Your Wingman",
        "name": "Team Wingman",
        "subject": "Social media & contentstrategie voor de weg naar LA 2028 – samenwerking met Fré Leys",
        "plain": """Beste team Wingman,

Jullie snappen als geen ander hoe algoritmes werken, hoe je een community opbouwt en hoe je met short-form video en sterke formats echte betrokkenheid creëert. Daarom stuur ik jullie graag dit berichtje.

Mijn naam is dr. ir. Frederik (Fré) Leys: doctor in de ingenieurswetenschappen (KU Leuven) en nationaal paraklimmer (2x Wereldbeker Goud). Mijn doel is helder: de eerste Paralympiër ooit worden uit Leuven op de Paralympische Spelen van Los Angeles 2028.

Vandaag heb ik al een organische basis (o.a. ~5.000 volgers op Instagram en een maandelijks gelezen nieuwsbrief), maar op weg naar LA 2028 wil ik mijn communicatie naar een professioneel niveau tillen om de Paralympische sport en mijn verhaal grootschalig zichtbaar te maken.

Waar ik jullie strategische blik of ondersteuning voor kan gebruiken:
• Contentstrategie & planning: Structuur aanbrengen in een kalender richting kwalificatiemomenten en pieken.
• Short-form & Vertical Video (Reels/TikTok): Formats bedenken en aanscherpen rond training, technologie, bio-hacks en wedstrijden.
• Storytelling & Community engagement: Het vertalen van een complex high-tech topsportverhaal naar hapklare, virale content.

Het partnerschapsmodel (Barter / Synergie):
Ik zoek geen traditionele betalende klant-leverancierrelatie (ik heb hiervoor geen mediabudget), maar vraag ook geen sponsorgeld van jullie. Ik bied een inspirerende win-win:
1. Een tastbare showcase & case study: Bewijs van hoe jullie agency een atleet en maatschappelijk doelwit laat groeien op social media.
2. Exclusieve teamactivatie: Een keynote / lunch & learn voor jullie team of klanten over innovatie, data in sport en extreme focus.
3. Merkambassadeurschap: Jullie bureau in the spotlight als trotse digitale partner op fre2028.la en via mijn kanalen.

Zijn jullie benieuwd wat we samen kunnen neerzetten? Ik kom met veel plezier langs voor een koffie van 15 minuten in Leuven om ideeën uit te wisselen.

Sportieve groet,

Dr. Ir. Frederik (Fré) Leys
Doctor in de Ingenieurswetenschappen (KU Leuven)
Paraklimmer Belgische Nationale Ploeg (2x Wereldbeker Goud)
fre2028.la
""",
        "html": """<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: #18181b; line-height: 1.6; max-width: 640px;">
<p>Beste team Wingman,</p>

<p>Jullie snappen als geen ander hoe algoritmes werken, hoe je een community opbouwt en hoe je met short-form video en sterke formats echte betrokkenheid cre&euml;ert. Daarom stuur ik jullie graag dit berichtje.</p>

<p>Mijn naam is <strong>dr. ir. Frederik (Fr&eacute;) Leys</strong>: doctor in de ingenieurswetenschappen (KU Leuven) en nationaal paraklimmer (2x Wereldbeker Goud). Mijn doel is helder: de <strong>eerste Paralympi&euml;r ooit worden uit Leuven</strong> op de Paralympische Spelen van Los Angeles 2028.</p>

<p>Vandaag heb ik al een organische basis (o.a. ~5.000 volgers op Instagram en een maandelijks gelezen nieuwsbrief), maar op weg naar LA 2028 wil ik mijn communicatie naar een professioneel niveau tillen om de Paralympische sport en mijn verhaal grootschalig zichtbaar te maken.</p>

<p><strong>Waar ik jullie strategische blik of ondersteuning voor kan gebruiken:</strong></p>
<ul style="padding-left: 20px; margin: 12px 0 16px 0; line-height: 1.7;">
  <li style="margin-bottom: 6px;"><strong>Contentstrategie &amp; planning:</strong> Structuur aanbrengen in een kalender richting kwalificatiemomenten en pieken.</li>
  <li style="margin-bottom: 6px;"><strong>Short-form &amp; Vertical Video (Reels/TikTok):</strong> Formats bedenken en aanscherpen rond training, technologie, bio-hacks en wedstrijden.</li>
  <li style="margin-bottom: 6px;"><strong>Storytelling &amp; Community engagement:</strong> Het vertalen van een complex high-tech topsportverhaal naar hapklare, virale content.</li>
</ul>

<p><strong>Het partnerschapsmodel (Barter / Synergie):</strong><br>
Ik zoek geen traditionele betalende klant-leverancierrelatie (ik heb hiervoor geen mediabudget), maar vraag ook geen sponsorgeld van jullie. Ik bied een inspirerende win-win:</p>

<ol style="padding-left: 20px; margin: 12px 0 16px 0; line-height: 1.7;">
  <li style="margin-bottom: 6px;"><strong>Een tastbare showcase &amp; case study:</strong> Bewijs van hoe jullie agency een atleet en maatschappelijk doelwit laat groeien op social media.</li>
  <li style="margin-bottom: 6px;"><strong>Exclusieve teamactivatie:</strong> Een keynote / lunch &amp; learn voor jullie team of klanten over innovatie, data in sport en extreme focus.</li>
  <li style="margin-bottom: 6px;"><strong>Merkambassadeurschap:</strong> Jullie bureau in the spotlight als trotse digitale partner op <a href="https://fre2028.la/?utm_source=we-are-your-wingman&utm_medium=email&utm_campaign=content_partner" style="color: #000; text-decoration: underline;">fre2028.la</a> en via mijn kanalen.</li>
</ol>

<p>Zijn jullie benieuwd wat we samen kunnen neerzetten? Ik kom met veel plezier langs voor een koffie van 15 minuten in Leuven om idee&euml;n uit te wisselen.</p>

<p style="margin-top: 24px;">Sportieve groet,</p>

<p><strong>Dr. Ir. Frederik (Fr&eacute;) Leys</strong><br>
<span style="color: #52525b; font-size: 14px;">Doctor in de Ingenieurswetenschappen (KU Leuven) &bull; Paraklimmer Belgische Nationale Ploeg (2x Goud)</span><br>
<a href="https://fre2028.la/?utm_source=we-are-your-wingman&utm_medium=email&utm_campaign=content_partner" style="color: #000; text-decoration: underline; font-size: 14px;">fre2028.la</a></p>
</body>
</html>"""
    },
    {
        "id": "de-praeters",
        "to": "info@depraeters.be",
        "company": "De Praeters",
        "name": "Team De Praeters",
        "subject": "Podcastconcept: De wetenschap achter topsport & veerkracht op weg naar LA 2028",
        "plain": """Beste team van De Praeters,

Met jullie passie voor stemmen, diepgang en meeslepende audioverhalen weten jullie als geen ander hoe krachtig het medium podcast is om mensen écht te raken.

Mijn naam is dr. ir. Frederik (Fré) Leys: doctor in de ingenieurswetenschappen aan de KU Leuven en nationaal paraklimmer (2x Wereldbeker Goud). Mijn ultieme doel: de eerste Paralympiër ooit worden uit Leuven tijdens de Spelen van Los Angeles 2028.

Richting LA 2028 borrelt het idee om een unieke podcastreeks te lanceren. Niet zomaar een sportbabbel, maar een diepgaande verkenning op het snijvlak van mentale veerkracht, innovatie, biomechanica en wat een winnaar een winnaar maakt.

Mogelijke formats waar ik over nadenk:
• Gesprekken met topatleten, wetenschappers en ondernemers over omgaan met tegenslag en pieken onder druk.
• Een audio-dagboek/documentaire waarin we de fysieke en technologische zoektocht naar LA28 van heel dichtbij volgen.
• Verhalen die de Paralympische beweging en G-sport een volwaardig nationaal podium geven.

Wat ik voorstel qua samenwerking (Barter / Co-productie):
Ik kan geen klassieke productiefee betalen, maar vraag ook geen sponsorgeld. Ik zie dit als een creatieve co-creatie:
1. Een award-winnend audioformat: Een hoogwaardige serie met sterke gasten en een maatschappelijke meerwaarde die jullie portfolio en award-inzendingen versterkt.
2. Kennis & Netwerk: Toegang tot een uniek netwerk van wetenschappers (KU Leuven), ingenieurs en topsporters.
3. Keynote / Studio talk: Een lezing of interne sessie door mezelf voor jullie team of relaties.
4. Partnerbranding: Volledige erkenning als Official Audio/Podcast Partner op alle kanalen en op fre2028.la.

Hebben jullie zin om hier eens een kwartiertje over te brainstormen bij een kop koffie in Leuven?

Hartelijke groet,

Dr. Ir. Frederik (Fré) Leys
Doctor in de Ingenieurswetenschappen (KU Leuven)
Paraklimmer Belgische Nationale Ploeg (2x Wereldbeker Goud)
fre2028.la
""",
        "html": """<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: #18181b; line-height: 1.6; max-width: 640px;">
<p>Beste team van De Praeters,</p>

<p>Met jullie passie voor stemmen, diepgang en meeslepende audioverhalen weten jullie als geen ander hoe krachtig het medium podcast is om mensen &eacute;cht te raken.</p>

<p>Mijn naam is <strong>dr. ir. Frederik (Fr&eacute;) Leys</strong>: doctor in de ingenieurswetenschappen aan de KU Leuven en nationaal paraklimmer (2x Wereldbeker Goud). Mijn ultieme doel: de <strong>eerste Paralympi&euml;r ooit worden uit Leuven</strong> tijdens de Spelen van Los Angeles 2028.</p>

<p>Richting LA 2028 borrelt het idee om een <strong>unieke podcastreeks</strong> te lanceren. Niet zomaar een sportbabbel, maar een diepgaande verkenning op het snijvlak van <strong>mentale veerkracht, innovatie, biomechanica en wat een winnaar een winnaar maakt</strong>.</p>

<p><strong>Mogelijke formats waar ik over nadenk:</strong></p>
<ul style="padding-left: 20px; margin: 12px 0 16px 0; line-height: 1.7;">
  <li style="margin-bottom: 6px;">Gesprekken met topatleten, wetenschappers en ondernemers over omgaan met tegenslag en pieken onder druk.</li>
  <li style="margin-bottom: 6px;">Een audio-dagboek/documentaire waarin we de fysieke en technologische zoektocht naar LA28 van heel dichtbij volgen.</li>
  <li style="margin-bottom: 6px;">Verhalen die de Paralympische beweging en G-sport een volwaardig nationaal podium geven.</li>
</ul>

<p><strong>Wat ik voorstel qua samenwerking (Barter / Co-productie):</strong><br>
Ik kan geen klassieke productiefee betalen, maar vraag ook geen sponsorgeld. Ik zie dit als een creatieve co-creatie:</p>

<ol style="padding-left: 20px; margin: 12px 0 16px 0; line-height: 1.7;">
  <li style="margin-bottom: 6px;"><strong>Een award-winnend audioformat:</strong> Een hoogwaardige serie met sterke gasten en een maatschappelijke meerwaarde die jullie portfolio en award-inzendingen versterkt.</li>
  <li style="margin-bottom: 6px;"><strong>Kennis &amp; Netwerk:</strong> Toegang tot een uniek netwerk van wetenschappers (KU Leuven), ingenieurs en topsporters.</li>
  <li style="margin-bottom: 6px;"><strong>Keynote / Studio talk:</strong> Een lezing of interne sessie door mezelf voor jullie team of relaties.</li>
  <li style="margin-bottom: 6px;"><strong>Partnerbranding:</strong> Volledige erkenning als Official Audio/Podcast Partner op alle kanalen en op <a href="https://fre2028.la/?utm_source=de-praeters&utm_medium=email&utm_campaign=content_partner" style="color: #000; text-decoration: underline;">fre2028.la</a>.</li>
</ol>

<p>Hebben jullie zin om hier eens een kwartiertje over te brainstormen bij een kop koffie in Leuven?</p>

<p style="margin-top: 24px;">Hartelijke groet,</p>

<p><strong>Dr. Ir. Frederik (Fr&eacute;) Leys</strong><br>
<span style="color: #52525b; font-size: 14px;">Doctor in de Ingenieurswetenschappen (KU Leuven) &bull; Paraklimmer Belgische Nationale Ploeg (2x Goud)</span><br>
<a href="https://fre2028.la/?utm_source=de-praeters&utm_medium=email&utm_campaign=content_partner" style="color: #000; text-decoration: underline; font-size: 14px;">fre2028.la</a></p>
</body>
</html>"""
    }
]

def main():
    print("\n🚀 Aanmaken van concepten in Gmail voor de 3 Content Partners...")
    service = get_gmail_service()
    label_id = get_fre2028_label_id(service)
    
    created = []
    for item in DRAFTS:
        draft = create_draft(
            service=service,
            user_id='me',
            to_email=item['to'],
            subject=item['subject'],
            plain_text=item['plain'],
            html_text=item['html'],
            label_id=label_id
        )
        draft_id = draft.get('id', 'N/A')
        print(f"✓ Concept klaar: {item['company']} ({item['to']}) -> Draft ID: {draft_id}")
        created.append({
            "company": item['company'],
            "to": item['to'],
            "draft_id": draft_id,
            "subject": item['subject']
        })
    
    print("\n🎉 Alle 3 de concepten staan nu klaar in je Gmail drafts!")
    print("👉 Directe link: https://mail.google.com/mail/u/0/#drafts\n")

if __name__ == "__main__":
    main()
