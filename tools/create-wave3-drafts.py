#!/usr/bin/env python3
"""
Creates Gmail drafts for Wave 3 Content & Communication Partners:
1. Jack & Charlie (Medialife) (High-energy video, TV reportages & action reels)
2. Billycom (In-house studio Heverlee, video interviews & press copywriting)
3. Cypres (Propaganda Group) (Long-form content marketing, journalism & B2B storytelling)
"""

import sys
import json
from pathlib import Path

tools_dir = Path(__file__).resolve().parent
if str(tools_dir) not in sys.path:
    sys.path.insert(0, str(tools_dir))

from importlib.machinery import SourceFileLoader
create_gmail_mod = SourceFileLoader("create_gmail_drafts", str(tools_dir / "create-gmail-drafts.py")).load_module()

get_gmail_service = create_gmail_mod.get_gmail_service
get_fre2028_label_id = create_gmail_mod.get_fre2028_label_id
create_draft = create_gmail_mod.create_draft

WAVE3_DRAFTS = [
    {
        "id": "jack-and-charlie",
        "to": "info@medialife.be",
        "company": "Jack & Charlie (Medialife)",
        "name": "Team Jack & Charlie",
        "subject": "Creatieve videopartner gezocht: Dr. Ir. Fré Leys op weg naar LA 2028",
        "plain": """Beste team Jack & Charlie,

Mijn naam is dr. ir. Fré Leys. Ik ben doctor in de ingenieurswetenschappen (KU Leuven) én atleet in de Belgische nationale paraklimploeg (2x goud op Wereldbekers). Mijn ultieme doel: de allereerste Paralympiër ooit worden uit Leuven op de Paralympische Spelen van Los Angeles in 2028, waar paraklimmen zijn historische debuut maakt.

Mijn traject is geen klassiek sportverhaal: als ingenieur (maker en geek) ga ik opzoek naar hoe wetenschap, technologie en innovatie (vaak zelf bedachte) het verschil kunnen maken voor mij om goud te winnen op het hoogste niveau, namelijk de Paralympische spelen. Vandaar mijn leuze "Engineering my way to the Paralympics"

Als creatief videoagentschap aan de Leuvense Vaartkom weten jullie hoe je krachtige beelden omzet in dynamische videocontent. Ik zoek een videopartner die het verhaal van topsport en spitstechnologie visueel kan versterken. Denk aan:
• Snelle, high-energy reels en reportages van intensieve trainingen en testmomenten in Leuven.
• Korte wedstrijdverslagen en behind-the-scenes beelden van internationale Wereldbekers.
• Dynamische motion graphics en video formats die de Paralympische sport een modern, strak podium geven.

Wat ik wél en niet zoek:
Ik heb geen budget om een commerciële bureaufee te betalen, maar vraag van jullie omgekeerd ook geen financiële sponsoring. Ik geloof rotsvast in een wederkerig barter-partnerschap:
1. Een award-winnende showcase: Spectaculair actie- en technologiemateriaal voor jullie showreel en portfolio.
2. Exclusieve teamactivatie: Een keynote / lunch & learn door mezelf voor jullie team of zakelijke klanten over veerkracht, innovatie en presteren onder druk.
3. Volledige content- en merktoegang: Officiële partnervermelding op fre2028.la en in videocredits.

Hebben jullie zin om hier eens 15 à 20 minuten vrijblijvend over te sparren bij een koffie aan de Vaartkom of via een korte videocall?

Met sportieve en collegiale groet,

Fré Leys
Doctor in de Ingenieurswetenschappen (KU Leuven) • Paraklimmer Belgische Nationale Ploeg (2x Goud)
fre2028.la
""",
        "html": """<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: #18181b; line-height: 1.6; max-width: 640px;">
<p>Beste team Jack &amp; Charlie,</p>

<p>Mijn naam is <strong>dr. ir. Fr&eacute; Leys</strong>. Ik ben doctor in de ingenieurswetenschappen (KU Leuven) &eacute;n atleet in de Belgische nationale paraklimploeg (2x goud op Wereldbekers). Mijn ultieme doel: de <strong>allereerste Paralympi&euml;r ooit worden uit Leuven</strong> op de Paralympische Spelen van Los Angeles in 2028, waar paraklimmen zijn historische debuut maakt.</p>

<p>Mijn traject is geen klassiek sportverhaal: als ingenieur (maker en geek) ga ik opzoek naar hoe <strong>wetenschap, technologie en innovatie</strong> (vaak zelf bedachte) het verschil kunnen maken voor mij om goud te winnen op het hoogste niveau, namelijk de Paralympische spelen. Vandaar mijn leuze <em>&quot;Engineering my way to the Paralympics&quot;</em>.</p>

<p>Als creatief videoagentschap aan de Leuvense Vaartkom weten jullie hoe je krachtige beelden omzet in dynamische videocontent. Ik zoek een videopartner die het verhaal van topsport en innovatieve technologie visueel kan versterken. Denk aan:</p>
<ul style="padding-left: 20px; margin: 12px 0 16px 0; line-height: 1.7;">
  <li style="margin-bottom: 6px;"><strong>Snelle, high-energy reels en reportages</strong> van intensieve trainingen en testmomenten in Leuven.</li>
  <li style="margin-bottom: 6px;"><strong>Korte wedstrijdverslagen</strong> en behind-the-scenes beelden van internationale Wereldbekers.</li>
  <li style="margin-bottom: 6px;"><strong>Dynamische motion graphics en formats</strong> die de Paralympische sport een modern, strak podium geven.</li>
</ul>

<p><strong>Wat ik w&eacute;l en niet zoek:</strong><br>
Ik heb geen budget om een commerci&euml;le bureaufee te betalen, maar vraag van jullie omgekeerd ook geen financi&euml;le sponsoring. Ik geloof rotsvast in een <strong>wederkerig barter-partnerschap</strong>:</p>

<ol style="padding-left: 20px; margin: 12px 0 16px 0; line-height: 1.7;">
  <li style="margin-bottom: 6px;"><strong>Een award-winnende showcase:</strong> Spectaculair actie- en technologiemateriaal voor jullie showreel en portfolio.</li>
  <li style="margin-bottom: 6px;"><strong>Exclusieve teamactivatie:</strong> Een keynote / lunch &amp; learn door mezelf voor jullie team of zakelijke klanten over veerkracht, innovatie en presteren onder druk.</li>
  <li style="margin-bottom: 6px;"><strong>Volledige content- en merktoegang:</strong> Offici&euml;le partnervermelding op <a href="https://fre2028.la/?utm_source=jack-and-charlie&utm_medium=email&utm_campaign=content_partner" style="color: #000; text-decoration: underline;">fre2028.la</a> en in videocredits.</li>
</ol>

<p>Hebben jullie zin om hier eens 15 &agrave; 20 minuten vrijblijvend over te sparren bij een koffie aan de Vaartkom of via een korte videocall?</p>

<p style="margin-top: 24px;">Met sportieve en collegiale groet,</p>

<p><strong>Fr&eacute; Leys</strong><br>
<span style="color: #52525b; font-size: 14px;">Doctor in de Ingenieurswetenschappen (KU Leuven) &bull; Paraklimmer Belgische Nationale Ploeg (2x Goud)</span><br>
<a href="https://fre2028.la/?utm_source=jack-and-charlie&utm_medium=email&utm_campaign=content_partner" style="color: #000; text-decoration: underline; font-size: 14px;">fre2028.la</a></p>
</body>
</html>"""
    },
    {
        "id": "billycom",
        "to": "hello@billycom.be",
        "company": "Billycom",
        "name": "Team Billycom",
        "subject": "Studio interviews & storytelling: Dr. Ir. Fré Leys op weg naar LA 2028",
        "plain": """Beste team Billycom,

Mijn naam is dr. ir. Fré Leys. Ik ben doctor in de ingenieurswetenschappen (KU Leuven) én atleet in de Belgische nationale paraklimploeg (2x goud op Wereldbekers). Mijn ultieme doel: de allereerste Paralympiër ooit worden uit Leuven op de Paralympische Spelen van Los Angeles in 2028, waar paraklimmen zijn historische debuut maakt.

Mijn traject is geen klassiek sportverhaal: als ingenieur (maker en geek) ga ik opzoek naar hoe wetenschap, technologie en innovatie (vaak zelf bedachte) het verschil kunnen maken voor mij om goud te winnen op het hoogste niveau, namelijk de Paralympische spelen. Vandaar mijn leuze "Engineering my way to the Paralympics"

Met jullie combinatie van sterke redactionele copywriting én een eigen in-house videostudio in Heverlee hebben jullie een unieke troef in handen. Ik zoek een contentpartner die kan ondersteunen bij:
• Professionele studio-opnames en diepte-interviews in jullie studio in Heverlee.
• Scherpe redactionele content en persberichten richting klassieke en regionale nieuwsmedia.
• Videoverklaringen en content ter ondersteuning van partners en de promotie van de Paralympische beweging.

Wat ik wél en niet zoek:
Ik heb geen budget om een commerciële bureaufee te betalen, maar vraag van jullie omgekeerd ook geen financiële sponsoring. Ik geloof rotsvast in een wederkerig barter-partnerschap:
1. Een inspirerende showcase: Een buitengewoon authentiek topsport- en innovatieproject voor jullie portfolio.
2. Exclusieve teamactivatie: Een keynote / lunch & learn door mezelf voor jullie team of klanten over veerkracht, innovatie en presteren onder druk.
3. Volledige content- en merktoegang: Officiële vermelding als Content & Studio Partner op fre2028.la en in publicaties.

Hebben jullie zin om hier eens 15 à 20 minuten vrijblijvend over te sparren bij een koffie in Heverlee/Leuven of via een korte videocall?

Met sportieve en collegiale groet,

Fré Leys
Doctor in de Ingenieurswetenschappen (KU Leuven) • Paraklimmer Belgische Nationale Ploeg (2x Goud)
fre2028.la
""",
        "html": """<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: #18181b; line-height: 1.6; max-width: 640px;">
<p>Beste team Billycom,</p>

<p>Mijn naam is <strong>dr. ir. Fr&eacute; Leys</strong>. Ik ben doctor in de ingenieurswetenschappen (KU Leuven) &eacute;n atleet in de Belgische nationale paraklimploeg (2x goud op Wereldbekers). Mijn ultieme doel: de <strong>allereerste Paralympi&euml;r ooit worden uit Leuven</strong> op de Paralympische Spelen van Los Angeles in 2028, waar paraklimmen zijn historische debuut maakt.</p>

<p>Mijn traject is geen klassiek sportverhaal: als ingenieur (maker en geek) ga ik opzoek naar hoe <strong>wetenschap, technologie en innovatie</strong> (vaak zelf bedachte) het verschil kunnen maken voor mij om goud te winnen op het hoogste niveau, namelijk de Paralympische spelen. Vandaar mijn leuze <em>&quot;Engineering my way to the Paralympics&quot;</em>.</p>

<p>Met jullie combinatie van sterke redactionele copywriting &eacute;n een eigen in-house videostudio in Heverlee hebben jullie een unieke troef in handen. Ik zoek een contentpartner die kan ondersteunen bij:</p>
<ul style="padding-left: 20px; margin: 12px 0 16px 0; line-height: 1.7;">
  <li style="margin-bottom: 6px;"><strong>Professionele studio-opnames en diepte-interviews</strong> in jullie studio in Heverlee.</li>
  <li style="margin-bottom: 6px;"><strong>Scherpe redactionele content en persberichten</strong> richting klassieke en regionale nieuwsmedia.</li>
  <li style="margin-bottom: 6px;"><strong>Videoverklaringen en content</strong> ter ondersteuning van partners en de promotie van de Paralympische beweging.</li>
</ul>

<p><strong>Wat ik w&eacute;l en niet zoek:</strong><br>
Ik heb geen budget om een commerci&euml;le bureaufee te betalen, maar vraag van jullie omgekeerd ook geen financi&euml;le sponsoring. Ik geloof rotsvast in een <strong>wederkerig barter-partnerschap</strong>:</p>

<ol style="padding-left: 20px; margin: 12px 0 16px 0; line-height: 1.7;">
  <li style="margin-bottom: 6px;"><strong>Een inspirerende showcase:</strong> Een buitengewoon authentiek topsport- en innovatieproject voor jullie portfolio.</li>
  <li style="margin-bottom: 6px;"><strong>Exclusieve teamactivatie:</strong> Een keynote / lunch &amp; learn door mezelf voor jullie team of klanten over veerkracht, innovatie en presteren onder druk.</li>
  <li style="margin-bottom: 6px;"><strong>Volledige content- en merktoegang:</strong> Offici&euml;le vermelding als Content &amp; Studio Partner op <a href="https://fre2028.la/?utm_source=billycom&utm_medium=email&utm_campaign=content_partner" style="color: #000; text-decoration: underline;">fre2028.la</a> en in publicaties.</li>
</ol>

<p>Hebben jullie zin om hier eens 15 &agrave; 20 minuten vrijblijvend over te sparren bij een koffie in Heverlee/Leuven of via een korte videocall?</p>

<p style="margin-top: 24px;">Met sportieve en collegiale groet,</p>

<p><strong>Fr&eacute; Leys</strong><br>
<span style="color: #52525b; font-size: 14px;">Doctor in de Ingenieurswetenschappen (KU Leuven) &bull; Paraklimmer Belgische Nationale Ploeg (2x Goud)</span><br>
<a href="https://fre2028.la/?utm_source=billycom&utm_medium=email&utm_campaign=content_partner" style="color: #000; text-decoration: underline; font-size: 14px;">fre2028.la</a></p>
</body>
</html>"""
    },
    {
        "id": "cypres",
        "to": "connect@cypres.com",
        "company": "Cypres (Propaganda Group)",
        "name": "Team Cypres",
        "subject": "Content marketing & journalistiek: Dr. Ir. Fré Leys op weg naar LA 2028",
        "plain": """Beste team Cypres,

Mijn naam is dr. ir. Fré Leys. Ik ben doctor in de ingenieurswetenschappen (KU Leuven) én atleet in de Belgische nationale paraklimploeg (2x goud op Wereldbekers). Mijn ultieme doel: de allereerste Paralympiër ooit worden uit Leuven op de Paralympische Spelen van Los Angeles in 2028, waar paraklimmen zijn historische debuut maakt.

Mijn traject is geen klassiek sportverhaal: als ingenieur (maker en geek) ga ik opzoek naar hoe wetenschap, technologie en innovatie (vaak zelf bedachte) het verschil kunnen maken voor mij om goud te winnen op het hoogste niveau, namelijk de Paralympische spelen. Vandaar mijn leuze "Engineering my way to the Paralympics"

Jullie zijn in Vlaanderen de referentie voor duurzame contentmarketing, diepgaande bedrijfsjournalistiek en thought leadership ("Content to connect"). Ik zoek een partner die kan helpen om dit verhaal redactioneel en strategisch te structureren. Denk aan:
• Journalistieke diepte-interviews en longform verhalen rond mentale veerkracht, innovatie en topsport.
• Het redactioneel uitbouwen van mijn maandelijkse nieuwsbrief en blogplatform richting bedrijven en media.
• Hoogwaardige B2B-content die de brug slaat tussen het Paralympische traject en het innovatieve bedrijfsleven.

Wat ik wél en niet zoek:
Ik heb geen budget om een commerciële bureaufee te betalen, maar vraag van jullie omgekeerd ook geen financiële sponsoring. Ik geloof rotsvast in een wederkerig barter-partnerschap:
1. Een hoogwaardige contentcase: Een buitengewoon authentiek project rond 'content to connect' voor jullie portfolio.
2. Exclusieve teamactivatie: Een keynote / lunch & learn door mezelf voor jullie team of zakelijke klanten over veerkracht, innovatie en presteren onder druk.
3. Volledige content- en merktoegang: Officiële vermelding als Editorial & Content Partner op fre2028.la.

Hebben jullie zin om hier eens 15 à 20 minuten vrijblijvend over te sparren bij een koffie in Leuven/Wilsele of via een korte videocall?

Met sportieve en collegiale groet,

Fré Leys
Doctor in de Ingenieurswetenschappen (KU Leuven) • Paraklimmer Belgische Nationale Ploeg (2x Goud)
fre2028.la
""",
        "html": """<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: #18181b; line-height: 1.6; max-width: 640px;">
<p>Beste team Cypres,</p>

<p>Mijn naam is <strong>dr. ir. Fr&eacute; Leys</strong>. Ik ben doctor in de ingenieurswetenschappen (KU Leuven) &eacute;n atleet in de Belgische nationale paraklimploeg (2x goud op Wereldbekers). Mijn ultieme doel: de <strong>allereerste Paralympi&euml;r ooit worden uit Leuven</strong> op de Paralympische Spelen van Los Angeles in 2028, waar paraklimmen zijn historische debuut maakt.</p>

<p>Mijn traject is geen klassiek sportverhaal: als ingenieur (maker en geek) ga ik opzoek naar hoe <strong>wetenschap, technologie en innovatie</strong> (vaak zelf bedachte) het verschil kunnen maken voor mij om goud te winnen op het hoogste niveau, namelijk de Paralympische spelen. Vandaar mijn leuze <em>&quot;Engineering my way to the Paralympics&quot;</em>.</p>

<p>Jullie zijn in Vlaanderen de referentie voor duurzame contentmarketing, diepgaande bedrijfsjournalistiek en thought leadership (<em>&quot;Content to connect&quot;</em>). Ik zoek een partner die kan helpen om dit verhaal redactioneel en strategisch te structureren. Denk aan:</p>
<ul style="padding-left: 20px; margin: 12px 0 16px 0; line-height: 1.7;">
  <li style="margin-bottom: 6px;"><strong>Journalistieke diepte-interviews en longform verhalen</strong> rond mentale veerkracht, innovatie en topsport.</li>
  <li style="margin-bottom: 6px;"><strong>Het redactioneel uitbouwen van mijn maandelijkse nieuwsbrief</strong> en blogplatform richting bedrijven en media.</li>
  <li style="margin-bottom: 6px;"><strong>Hoogwaardige B2B-content</strong> die de brug slaat tussen het Paralympische traject en het innovatieve bedrijfsleven.</li>
</ul>

<p><strong>Wat ik w&eacute;l en niet zoek:</strong><br>
Ik heb geen budget om een commerci&euml;le bureaufee te betalen, maar vraag van jullie omgekeerd ook geen financi&euml;le sponsoring. Ik geloof rotsvast in een <strong>wederkerig barter-partnerschap</strong>:</p>

<ol style="padding-left: 20px; margin: 12px 0 16px 0; line-height: 1.7;">
  <li style="margin-bottom: 6px;"><strong>Een hoogwaardige contentcase:</strong> Een buitengewoon authentiek project rond 'content to connect' voor jullie portfolio.</li>
  <li style="margin-bottom: 6px;"><strong>Exclusieve teamactivatie:</strong> Een keynote / lunch &amp; learn door mezelf voor jullie team of zakelijke klanten over veerkracht, innovatie en presteren onder druk.</li>
  <li style="margin-bottom: 6px;"><strong>Volledige content- en merktoegang:</strong> Offici&euml;le vermelding als Editorial &amp; Content Partner op <a href="https://fre2028.la/?utm_source=cypres&utm_medium=email&utm_campaign=content_partner" style="color: #000; text-decoration: underline;">fre2028.la</a>.</li>
</ol>

<p>Hebben jullie zin om hier eens 15 &agrave; 20 minuten vrijblijvend over te sparren bij een koffie in Leuven/Wilsele of via een korte videocall?</p>

<p style="margin-top: 24px;">Met sportieve en collegiale groet,</p>

<p><strong>Fr&eacute; Leys</strong><br>
<span style="color: #52525b; font-size: 14px;">Doctor in de Ingenieurswetenschappen (KU Leuven) &bull; Paraklimmer Belgische Nationale Ploeg (2x Goud)</span><br>
<a href="https://fre2028.la/?utm_source=cypres&utm_medium=email&utm_campaign=content_partner" style="color: #000; text-decoration: underline; font-size: 14px;">fre2028.la</a></p>
</body>
</html>"""
    }
]

def main():
    print("\n🚀 Aanmaken van Wave 3 concepten in Gmail...")
    service = get_gmail_service()
    label_id = get_fre2028_label_id(service)

    created = []
    for item in WAVE3_DRAFTS:
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

    print("\n🎉 Alle 3 de Wave 3 concepten staan nu klaar in je Gmail drafts!")
    print("👉 Directe link: https://mail.google.com/mail/u/0/#drafts\n")

if __name__ == "__main__":
    main()
