#!/usr/bin/env python3
"""
Updates Gmail drafts for We Are Your Wingman and De Praeters
matching Fré's direct, authentic tone and structure.
"""

import sys
import base64
from pathlib import Path
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

tools_dir = Path(__file__).resolve().parent
if str(tools_dir) not in sys.path:
    sys.path.insert(0, str(tools_dir))

from importlib.machinery import SourceFileLoader
create_gmail_mod = SourceFileLoader("create_gmail_drafts", str(tools_dir / "create-gmail-drafts.py")).load_module()

get_gmail_service = create_gmail_mod.get_gmail_service
get_fre2028_label_id = create_gmail_mod.get_fre2028_label_id

UPDATED_DRAFTS = [
    {
        "to": "info@weareyourwingman.com",
        "company": "We Are Your Wingman",
        "subject": "Social media & contentstrategie voor de weg naar LA 2028 – samenwerking met Fré Leys",
        "plain": """Beste team Wingman,

Mijn naam is dr. ir. Fré Leys. Ik ben doctor in de ingenieurswetenschappen (KU Leuven) én atleet in de Belgische nationale paraklimploeg (2x goud op Wereldbekers). Mijn ultieme doel: de allereerste Paralympiër ooit worden uit Leuven op de Paralympische Spelen van Los Angeles in 2028, waar paraklimmen zijn historische debuut maakt.

Mijn traject is geen klassiek sportverhaal: als ingenieur (maker en geek) ga ik opzoek naar hoe wetenschap, technologie en innovatie (vaak zelf bedachte) het verschil kunnen maken voor mij om goud te winnen op het hoogste niveau, namelijk de Paralympische spelen. Vandaar mijn leuze "Engineering my way to the Paralympics"

Vandaag heb ik al een organische basis (o.a. ~5.000 volgers op Instagram en een maandelijks gelezen nieuwsbrief), maar op weg naar LA 2028 wil ik mijn communicatie en social media naar een professioneel niveau tillen om de Paralympische sport en mijn verhaal grootschalig zichtbaar te maken.

Waar ik jullie strategische blik of ondersteuning voor kan gebruiken:
• Contentstrategie & planning: Structuur aanbrengen in een kalender richting kwalificatiemomenten en pieken.
• Short-form & Vertical Video (Reels/TikTok): Formats bedenken en aanscherpen rond training, technologie, bio-hacks en wedstrijden.
• Storytelling & Community engagement: Het vertalen van een complex topsportverhaal naar hapklare, virale content.

Wat ik wél en niet zoek:
Ik heb geen budget om een commerciële bureaufee te betalen, maar vraag van jullie omgekeerd ook geen financiële sponsoring. Ik geloof rotsvast in een wederkerig barter-partnerschap:
1. Een tastbare showcase & case study: Bewijs van hoe jullie agency een atleet en maatschappelijk doelwit laat groeien op social media.
2. Exclusieve teamactivatie: Een keynote / lunch & learn door mezelf voor jullie team of klanten over veerkracht, innovatie en presteren onder druk.
3. Volledige content- en merktoegang: Jullie bureau in the spotlight als trotse digitale partner op fre2028.la en via mijn kanalen.

Hebben jullie zin om hier eens 15 à 20 minuten vrijblijvend over te sparren bij een koffie in Leuven of via een korte videocall?

Met sportieve en collegiale groet,

Fré Leys
Doctor in de Ingenieurswetenschappen (KU Leuven) • Paraklimmer Belgische Nationale Ploeg (2x Goud)
fre2028.la
""",
        "html": """<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: #18181b; line-height: 1.6; max-width: 640px;">
<p>Beste team Wingman,</p>

<p>Mijn naam is <strong>dr. ir. Fr&eacute; Leys</strong>. Ik ben doctor in de ingenieurswetenschappen (KU Leuven) &eacute;n atleet in de Belgische nationale paraklimploeg (2x goud op Wereldbekers). Mijn ultieme doel: de <strong>allereerste Paralympi&euml;r ooit worden uit Leuven</strong> op de Paralympische Spelen van Los Angeles in 2028, waar paraklimmen zijn historische debuut maakt.</p>

<p>Mijn traject is geen klassiek sportverhaal: als ingenieur (maker en geek) ga ik opzoek naar hoe <strong>wetenschap, technologie en innovatie</strong> (vaak zelf bedachte) het verschil kunnen maken voor mij om goud te winnen op het hoogste niveau, namelijk de Paralympische spelen. Vandaar mijn leuze <em>&quot;Engineering my way to the Paralympics&quot;</em>.</p>

<p>Vandaag heb ik al een organische basis (o.a. ~5.000 volgers op Instagram en een maandelijks gelezen nieuwsbrief), maar op weg naar LA 2028 wil ik mijn communicatie en social media naar een professioneel niveau tillen om de Paralympische sport en mijn verhaal grootschalig zichtbaar te maken.</p>

<p><strong>Waar ik jullie strategische blik of ondersteuning voor kan gebruiken:</strong></p>
<ul style="padding-left: 20px; margin: 12px 0 16px 0; line-height: 1.7;">
  <li style="margin-bottom: 6px;"><strong>Contentstrategie &amp; planning:</strong> Structuur aanbrengen in een kalender richting kwalificatiemomenten en pieken.</li>
  <li style="margin-bottom: 6px;"><strong>Short-form &amp; Vertical Video (Reels/TikTok):</strong> Formats bedenken en aanscherpen rond training, technologie, bio-hacks en wedstrijden.</li>
  <li style="margin-bottom: 6px;"><strong>Storytelling &amp; Community engagement:</strong> Het vertalen van een complex topsportverhaal naar hapklare, virale content.</li>
</ul>

<p><strong>Wat ik w&eacute;l en niet zoek:</strong><br>
Ik heb geen budget om een commerci&euml;le bureaufee te betalen, maar vraag van jullie omgekeerd ook geen financi&euml;le sponsoring. Ik geloof rotsvast in een <strong>wederkerig barter-partnerschap</strong>:</p>

<ol style="padding-left: 20px; margin: 12px 0 16px 0; line-height: 1.7;">
  <li style="margin-bottom: 6px;"><strong>Een tastbare showcase &amp; case study:</strong> Bewijs van hoe jullie agency een atleet en maatschappelijk doelwit laat groeien op social media.</li>
  <li style="margin-bottom: 6px;"><strong>Exclusieve teamactivatie:</strong> Een keynote / lunch &amp; learn door mezelf voor jullie team of klanten over veerkracht, innovatie en presteren onder druk.</li>
  <li style="margin-bottom: 6px;"><strong>Volledige content- en merktoegang:</strong> Jullie bureau in the spotlight als trotse digitale partner op <a href="https://fre2028.la/?utm_source=we-are-your-wingman&utm_medium=email&utm_campaign=content_partner" style="color: #000; text-decoration: underline;">fre2028.la</a> en via mijn kanalen.</li>
</ol>

<p>Hebben jullie zin om hier eens 15 &agrave; 20 minuten vrijblijvend over te sparren bij een koffie in Leuven of via een korte videocall?</p>

<p style="margin-top: 24px;">Met sportieve en collegiale groet,</p>

<p><strong>Fr&eacute; Leys</strong><br>
<span style="color: #52525b; font-size: 14px;">Doctor in de Ingenieurswetenschappen (KU Leuven) &bull; Paraklimmer Belgische Nationale Ploeg (2x Goud)</span><br>
<a href="https://fre2028.la/?utm_source=we-are-your-wingman&utm_medium=email&utm_campaign=content_partner" style="color: #000; text-decoration: underline; font-size: 14px;">fre2028.la</a></p>
</body>
</html>"""
    },
    {
        "to": "info@depraeters.be",
        "company": "De Praeters",
        "subject": "Podcastconcept: De wetenschap achter topsport & veerkracht op weg naar LA 2028",
        "plain": """Beste team De Praeters,

Mijn naam is dr. ir. Fré Leys. Ik ben doctor in de ingenieurswetenschappen (KU Leuven) én atleet in de Belgische nationale paraklimploeg (2x goud op Wereldbekers). Mijn ultieme doel: de allereerste Paralympiër ooit worden uit Leuven op de Paralympische Spelen van Los Angeles in 2028, waar paraklimmen zijn historische debuut maakt.

Mijn traject is geen klassiek sportverhaal: als ingenieur (maker en geek) ga ik opzoek naar hoe wetenschap, technologie en innovatie (vaak zelf bedachte) het verschil kunnen maken voor mij om goud te winnen op het hoogste niveau, namelijk de Paralympische spelen. Vandaar mijn leuze "Engineering my way to the Paralympics"

Richting LA 2028 borrelt het idee om een unieke podcastreeks te lanceren. Niet zomaar een sportbabbel, maar een diepgaande verkenning op het snijvlak van mentale veerkracht, wetenschap, technologie, biomechanica en wat een winnaar een winnaar maakt.

Mogelijke formats waar ik over nadenk:
• Gesprekken met topatleten, wetenschappers en ondernemers over omgaan met tegenslag en pieken onder druk.
• Een audio-dagboek/documentaire waarin we de fysieke en technologische zoektocht naar LA28 van heel dichtbij volgen.
• Verhalen die de Paralympische beweging en G-sport een volwaardig nationaal podium geven.

Wat ik wél en niet zoek:
Ik heb geen budget om een commerciële bureaufee te betalen, maar vraag van jullie omgekeerd ook geen financiële sponsoring. Ik geloof rotsvast in een wederkerig barter-partnerschap:
1. Een award-winnend audioformat: Een hoogwaardige serie met sterke gasten en een maatschappelijke meerwaarde die jullie portfolio en award-inzendingen versterkt.
2. Kennis & Netwerk: Toegang tot een uniek netwerk van wetenschappers (KU Leuven), ingenieurs en topsporters.
3. Exclusieve teamactivatie: Een keynote / lezing door mezelf voor jullie team of relaties over veerkracht, innovatie en topsport.
4. Volledige partnerbranding: Erkenning als Official Audio/Podcast Partner op alle kanalen en op fre2028.la.

Hebben jullie zin om hier eens 15 à 20 minuten vrijblijvend over te sparren bij een koffie in Leuven of via een korte videocall?

Met sportieve en collegiale groet,

Fré Leys
Doctor in de Ingenieurswetenschappen (KU Leuven) • Paraklimmer Belgische Nationale Ploeg (2x Goud)
fre2028.la
""",
        "html": """<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: #18181b; line-height: 1.6; max-width: 640px;">
<p>Beste team De Praeters,</p>

<p>Mijn naam is <strong>dr. ir. Fr&eacute; Leys</strong>. Ik ben doctor in de ingenieurswetenschappen (KU Leuven) &eacute;n atleet in de Belgische nationale paraklimploeg (2x goud op Wereldbekers). Mijn ultieme doel: de <strong>allereerste Paralympi&euml;r ooit worden uit Leuven</strong> op de Paralympische Spelen van Los Angeles in 2028, waar paraklimmen zijn historische debuut maakt.</p>

<p>Mijn traject is geen klassiek sportverhaal: als ingenieur (maker en geek) ga ik opzoek naar hoe <strong>wetenschap, technologie en innovatie</strong> (vaak zelf bedachte) het verschil kunnen maken voor mij om goud te winnen op het hoogste niveau, namelijk de Paralympische spelen. Vandaar mijn leuze <em>&quot;Engineering my way to the Paralympics&quot;</em>.</p>

<p>Richting LA 2028 borrelt het idee om een <strong>unieke podcastreeks</strong> te lanceren. Niet zomaar een sportbabbel, maar een diepgaande verkenning op het snijvlak van <strong>mentale veerkracht, wetenschap, technologie, biomechanica en wat een winnaar een winnaar maakt</strong>.</p>

<p><strong>Mogelijke formats waar ik over nadenk:</strong></p>
<ul style="padding-left: 20px; margin: 12px 0 16px 0; line-height: 1.7;">
  <li style="margin-bottom: 6px;">Gesprekken met topatleten, wetenschappers en ondernemers over omgaan met tegenslag en pieken onder druk.</li>
  <li style="margin-bottom: 6px;">Een audio-dagboek/documentaire waarin we de fysieke en technologische zoektocht naar LA28 van heel dichtbij volgen.</li>
  <li style="margin-bottom: 6px;">Verhalen die de Paralympische beweging en G-sport een volwaardig nationaal podium geven.</li>
</ul>

<p><strong>Wat ik w&eacute;l en niet zoek:</strong><br>
Ik heb geen budget om een commerci&euml;le bureaufee te betalen, maar vraag van jullie omgekeerd ook geen financi&euml;le sponsoring. Ik geloof rotsvast in een <strong>wederkerig barter-partnerschap</strong>:</p>

<ol style="padding-left: 20px; margin: 12px 0 16px 0; line-height: 1.7;">
  <li style="margin-bottom: 6px;"><strong>Een award-winnend audioformat:</strong> Een hoogwaardige serie met sterke gasten en een maatschappelijke meerwaarde die jullie portfolio en award-inzendingen versterkt.</li>
  <li style="margin-bottom: 6px;"><strong>Kennis &amp; Netwerk:</strong> Toegang tot een uniek netwerk van wetenschappers (KU Leuven), ingenieurs en topsporters.</li>
  <li style="margin-bottom: 6px;"><strong>Exclusieve teamactivatie:</strong> Een keynote / lezing door mezelf voor jullie team of relaties over veerkracht, innovatie en topsport.</li>
  <li style="margin-bottom: 6px;"><strong>Volledige partnerbranding:</strong> Erkenning als Official Audio/Podcast Partner op alle kanalen en op <a href="https://fre2028.la/?utm_source=de-praeters&utm_medium=email&utm_campaign=content_partner" style="color: #000; text-decoration: underline;">fre2028.la</a>.</li>
</ol>

<p>Hebben jullie zin om hier eens 15 &agrave; 20 minuten vrijblijvend over te sparren bij een koffie in Leuven of via een korte videocall?</p>

<p style="margin-top: 24px;">Met sportieve en collegiale groet,</p>

<p><strong>Fr&eacute; Leys</strong><br>
<span style="color: #52525b; font-size: 14px;">Doctor in de Ingenieurswetenschappen (KU Leuven) &bull; Paraklimmer Belgische Nationale Ploeg (2x Goud)</span><br>
<a href="https://fre2028.la/?utm_source=de-praeters&utm_medium=email&utm_campaign=content_partner" style="color: #000; text-decoration: underline; font-size: 14px;">fre2028.la</a></p>
</body>
</html>"""
    }
]

def make_mime_msg(item):
    msg = MIMEMultipart('alternative')
    msg['Subject'] = item['subject']
    msg['From'] = 'me'
    msg['To'] = item['to']
    msg.attach(MIMEText(item['plain'], 'plain', 'utf-8'))
    msg.attach(MIMEText(item['html'], 'html', 'utf-8'))
    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode('utf-8')
    return {'message': {'raw': raw}}

def main():
    service = get_gmail_service()
    label_id = get_fre2028_label_id(service)

    # List drafts
    drafts_resp = service.users().drafts().list(userId='me').execute()
    existing_drafts = drafts_resp.get('drafts', [])

    drafts_by_recipient = {}
    for d in existing_drafts:
        try:
            d_data = service.users().drafts().get(userId='me', id=d['id'], format='metadata').execute()
            headers = {h['name'].lower(): h['value'] for h in d_data.get('message', {}).get('payload', {}).get('headers', [])}
            to_val = headers.get('to', '').strip().lower()
            if to_val:
                drafts_by_recipient[to_val] = d['id']
        except Exception:
            pass

    for item in UPDATED_DRAFTS:
        to_email = item['to'].lower()
        body = make_mime_msg(item)
        if to_email in drafts_by_recipient:
            draft_id = drafts_by_recipient[to_email]
            updated = service.users().drafts().update(userId='me', id=draft_id, body=body).execute()
            print(f"✓ Draft bijgewerkt voor {item['company']} ({item['to']}) -> ID: {updated.get('id')}")
        else:
            created = service.users().drafts().create(userId='me', body=body).execute()
            print(f"✓ Nieuwe draft aangemaakt voor {item['company']} ({item['to']}) -> ID: {created.get('id')}")
            if label_id and created.get('message', {}).get('id'):
                try:
                    service.users().messages().modify(
                        userId='me',
                        id=created['message']['id'],
                        body={'addLabelIds': [label_id]}
                    ).execute()
                except Exception:
                    pass

    print("\n🎉 De drafts voor Wingman en De Praeters zijn succesvol geüpdatet in Gmail!")

if __name__ == "__main__":
    main()
