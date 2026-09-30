#!/usr/bin/env python3
"""
Creates Gmail drafts for Wave 2 Content & Communication Partners:
1. Epic Frame (Cinema Video, Competition Aftermovies & YouTube series)
2. The Kind Kids / Shaved Monkey & Statik (Impact Storytelling, PR & Inclusion)
3. MijnLeuven Mediacrew (Youth creators, Vlogs, TikTok & Local engagement)
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

WAVE2_DRAFTS = [
    {
        "id": "epic-frame",
        "to": "info@epicframe.be",
        "company": "Epic Frame",
        "name": "Team Epic Frame",
        "subject": "Videoproductie & aftermovies: Dr. Ir. Fré Leys op weg naar LA 2028",
        "plain": """Beste team Epic Frame,

Mijn naam is dr. ir. Fré Leys. Ik ben doctor in de ingenieurswetenschappen (KU Leuven) én atleet in de Belgische nationale paraklimploeg (2x goud op Wereldbekers). Mijn ultieme doel: de allereerste Paralympiër ooit worden uit Leuven op de Paralympische Spelen van Los Angeles in 2028, waar paraklimmen zijn historische debuut maakt.

Mijn traject is geen klassiek sportverhaal: als ingenieur (maker en geek) ga ik opzoek naar hoe wetenschap, technologie en innovatie (vaak zelf bedachte) het verschil kunnen maken voor mij om goud te winnen op het hoogste niveau, namelijk de Paralympische spelen. Vandaar mijn leuze "Engineering my way to the Paralympics"

Op weg naar LA 2028 neem ik deel aan internationale Wereldbekers en train ik intensief in Leuven. Ik zoek een gedreven videopartner in Leuven die dit visueel kan vertalen naar cinema-kwaliteit. Denk aan:
• Competition Aftermovies: Korte, filmische verslagen van internationale wedstrijden en trainingskampen.
• YouTube- & Video-Formats: Bijvoorbeeld 'The Golden Fingers of Belgium' (waarin ik klimmers en atleten uitdaag op vingerkracht) of behind-the-scenes video's.
• Beelden van training en lab-innovatie die topsport en technologie samenbrengen.

Wat ik wél en niet zoek:
Ik heb geen budget om een commerciële bureaufee te betalen, maar vraag van jullie omgekeerd ook geen financiële sponsoring. Ik geloof rotsvast in een wederkerig barter-partnerschap:
1. Een award-winnende showcase: Spectaculair actie- en labmateriaal voor jullie showreel en portfolio.
2. Exclusieve teamactivatie: Een keynote / lunch & learn door mezelf voor jullie team of zakelijke klanten over veerkracht, innovatie en presteren onder druk.
3. Volledige content- en merktoegang: Officiële vermelding als Creative Video Partner op fre2028.la en in publicaties.

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
<p>Beste team Epic Frame,</p>

<p>Mijn naam is <strong>dr. ir. Fr&eacute; Leys</strong>. Ik ben doctor in de ingenieurswetenschappen (KU Leuven) &eacute;n atleet in de Belgische nationale paraklimploeg (2x goud op Wereldbekers). Mijn ultieme doel: de <strong>allereerste Paralympi&euml;r ooit worden uit Leuven</strong> op de Paralympische Spelen van Los Angeles in 2028, waar paraklimmen zijn historische debuut maakt.</p>

<p>Mijn traject is geen klassiek sportverhaal: als ingenieur (maker en geek) ga ik opzoek naar hoe <strong>wetenschap, technologie en innovatie</strong> (vaak zelf bedachte) het verschil kunnen maken voor mij om goud te winnen op het hoogste niveau, namelijk de Paralympische spelen. Vandaar mijn leuze <em>&quot;Engineering my way to the Paralympics&quot;</em>.</p>

<p>Op weg naar LA 2028 neem ik deel aan internationale Wereldbekers en train ik intensief in Leuven. Ik zoek een gedreven videopartner in Leuven die dit visueel kan vertalen naar cinema-kwaliteit. Denk aan:</p>
<ul style="padding-left: 20px; margin: 12px 0 16px 0; line-height: 1.7;">
  <li style="margin-bottom: 6px;"><strong>Competition Aftermovies:</strong> Korte, filmische verslagen van internationale wedstrijden en trainingskampen.</li>
  <li style="margin-bottom: 6px;"><strong>YouTube- &amp; Video-Formats:</strong> Bijvoorbeeld <em>'The Golden Fingers of Belgium'</em> (waarin ik klimmers en atleten uitdaag op vingerkracht) of behind-the-scenes video's.</li>
  <li style="margin-bottom: 6px;"><strong>Beelden van training en lab-innovatie</strong> die topsport en technologie samenbrengen.</li>
</ul>

<p><strong>Wat ik w&eacute;l en niet zoek:</strong><br>
Ik heb geen budget om een commerci&euml;le bureaufee te betalen, maar vraag van jullie omgekeerd ook geen financi&euml;le sponsoring. Ik geloof rotsvast in een <strong>wederkerig barter-partnerschap</strong>:</p>

<ol style="padding-left: 20px; margin: 12px 0 16px 0; line-height: 1.7;">
  <li style="margin-bottom: 6px;"><strong>Een award-winnende showcase:</strong> Spectaculair actie- en labmateriaal voor jullie showreel en portfolio.</li>
  <li style="margin-bottom: 6px;"><strong>Exclusieve teamactivatie:</strong> Een keynote / lunch &amp; learn door mezelf voor jullie team of zakelijke klanten over veerkracht, innovatie en presteren onder druk.</li>
  <li style="margin-bottom: 6px;"><strong>Volledige content- en merktoegang:</strong> Offici&euml;le vermelding als Creative Video Partner op <a href="https://fre2028.la/?utm_source=epic-frame&utm_medium=email&utm_campaign=content_partner" style="color: #000; text-decoration: underline;">fre2028.la</a> en in publicaties.</li>
</ol>

<p>Hebben jullie zin om hier eens 15 &agrave; 20 minuten vrijblijvend over te sparren bij een koffie in Leuven of via een korte videocall?</p>

<p style="margin-top: 24px;">Met sportieve en collegiale groet,</p>

<p><strong>Fr&eacute; Leys</strong><br>
<span style="color: #52525b; font-size: 14px;">Doctor in de Ingenieurswetenschappen (KU Leuven) &bull; Paraklimmer Belgische Nationale Ploeg (2x Goud)</span><br>
<a href="https://fre2028.la/?utm_source=epic-frame&utm_medium=email&utm_campaign=content_partner" style="color: #000; text-decoration: underline; font-size: 14px;">fre2028.la</a></p>
</body>
</html>"""
    },
    {
        "id": "the-kind-kids",
        "to": "info@shavedmonkey.be",
        "company": "The Kind Kids (Shaved Monkey & Statik)",
        "name": "Team Shaved Monkey en Statik",
        "subject": "Inclusieve storytelling & impact: Dr. Ir. Fré Leys op weg naar LA 2028",
        "plain": """Beste team Shaved Monkey en Statik,

Mijn naam is dr. ir. Fré Leys. Ik ben doctor in de ingenieurswetenschappen (KU Leuven) én atleet in de Belgische nationale paraklimploeg (2x goud op Wereldbekers). Mijn ultieme doel: de allereerste Paralympiër ooit worden uit Leuven op de Paralympische Spelen van Los Angeles in 2028, waar paraklimmen zijn historische debuut maakt.

Mijn traject is geen klassiek sportverhaal: als ingenieur (maker en geek) ga ik opzoek naar hoe wetenschap, technologie en innovatie (vaak zelf bedachte) het verschil kunnen maken voor mij om goud te winnen op het hoogste niveau, namelijk de Paralympische spelen. Vandaar mijn leuze "Engineering my way to the Paralympics"

Mijn traject draait om meer dan medailles: het gaat over het herdefiniëren van menselijke mogelijkheden, het doorbreken van maatschappelijke stereotypen rond fysieke beperkingen, en het toegankelijk maken van sport voor iedereen via paraclimbing.be.

Waar we elkaar als Leuvense impactpartners kunnen versterken:
• Inclusieve merkidentiteit & narratief: Een krachtige beeldtaal en tone-of-voice die inclusie, wetenschap en veerkracht centraal stelt.
• Maatschappelijke impactcampagnes: Het thema toegankelijkheid en doorzettingsvermogen verbinden met overheden, scholen en het brede publiek.
• Digitale toegankelijkheid: Samen het voorbeeld stellen in inclusieve communicatiedragers.

Wat ik wél en niet zoek:
Ik heb geen budget om een commerciële bureaufee te betalen, maar vraag van jullie omgekeerd ook geen financiële sponsoring. Ik geloof rotsvast in een wederkerig barter-partnerschap:
1. Een levende B-Corp & impact-case: Een uitzonderlijk authentiek project voor jullie portfolio en impactrapportages.
2. Exclusieve teamactivatie: Een keynote / inspiratiesessie door mezelf voor jullie team of klanten over adaptief denken, inclusie en veerkracht.
3. Rolmodel-ambassadeurschap: Mijn actieve steun voor jullie eigen maatschappelijke projecten en partnervermelding op fre2028.la.

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
<p>Beste team Shaved Monkey en Statik,</p>

<p>Mijn naam is <strong>dr. ir. Fr&eacute; Leys</strong>. Ik ben doctor in de ingenieurswetenschappen (KU Leuven) &eacute;n atleet in de Belgische nationale paraklimploeg (2x goud op Wereldbekers). Mijn ultieme doel: de <strong>allereerste Paralympi&euml;r ooit worden uit Leuven</strong> op de Paralympische Spelen van Los Angeles in 2028, waar paraklimmen zijn historische debuut maakt.</p>

<p>Mijn traject is geen klassiek sportverhaal: als ingenieur (maker en geek) ga ik opzoek naar hoe <strong>wetenschap, technologie en innovatie</strong> (vaak zelf bedachte) het verschil kunnen maken voor mij om goud te winnen op het hoogste niveau, namelijk de Paralympische spelen. Vandaar mijn leuze <em>&quot;Engineering my way to the Paralympics&quot;</em>.</p>

<p>Mijn traject draait om meer dan medailles: het gaat over het herdefini&euml;ren van menselijke mogelijkheden, het doorbreken van maatschappelijke stereotypen rond fysieke beperkingen, en het toegankelijk maken van sport voor iedereen via <a href="https://paraclimbing.be" style="color: #000; text-decoration: underline;">paraclimbing.be</a>.</p>

<p><strong>Waar we elkaar als Leuvense impactpartners kunnen versterken:</strong></p>
<ul style="padding-left: 20px; margin: 12px 0 16px 0; line-height: 1.7;">
  <li style="margin-bottom: 6px;"><strong>Inclusieve merkidentiteit &amp; narratief:</strong> Een krachtige beeldtaal en tone-of-voice die inclusie, wetenschap en veerkracht centraal stelt.</li>
  <li style="margin-bottom: 6px;"><strong>Maatschappelijke impactcampagnes:</strong> Het thema toegankelijkheid en doorzettingsvermogen verbinden met overheden, scholen en het brede publiek.</li>
  <li style="margin-bottom: 6px;"><strong>Digitale toegankelijkheid:</strong> Samen het voorbeeld stellen in inclusieve communicatiedragers.</li>
</ul>

<p><strong>Wat ik w&eacute;l en niet zoek:</strong><br>
Ik heb geen budget om een commerci&euml;le bureaufee te betalen, maar vraag van jullie omgekeerd ook geen financi&euml;le sponsoring. Ik geloof rotsvast in een <strong>wederkerig barter-partnerschap</strong>:</p>

<ol style="padding-left: 20px; margin: 12px 0 16px 0; line-height: 1.7;">
  <li style="margin-bottom: 6px;"><strong>Een levende B-Corp &amp; impact-case:</strong> Een uitzonderlijk authentiek project voor jullie portfolio en impactrapportages.</li>
  <li style="margin-bottom: 6px;"><strong>Exclusieve teamactivatie:</strong> Een keynote / inspiratiesessie door mezelf voor jullie team of klanten over adaptief denken, inclusie en veerkracht.</li>
  <li style="margin-bottom: 6px;"><strong>Rolmodel-ambassadeurschap:</strong> Mijn actieve steun voor jullie eigen maatschappelijke projecten en partnervermelding op <a href="https://fre2028.la/?utm_source=the-kind-kids&utm_medium=email&utm_campaign=content_partner" style="color: #000; text-decoration: underline;">fre2028.la</a>.</li>
</ol>

<p>Hebben jullie zin om hier eens 15 &agrave; 20 minuten vrijblijvend over te sparren bij een koffie in Leuven of via een korte videocall?</p>

<p style="margin-top: 24px;">Met sportieve en collegiale groet,</p>

<p><strong>Fr&eacute; Leys</strong><br>
<span style="color: #52525b; font-size: 14px;">Doctor in de Ingenieurswetenschappen (KU Leuven) &bull; Paraklimmer Belgische Nationale Ploeg (2x Goud)</span><br>
<a href="https://fre2028.la/?utm_source=the-kind-kids&utm_medium=email&utm_campaign=content_partner" style="color: #000; text-decoration: underline; font-size: 14px;">fre2028.la</a></p>
</body>
</html>"""
    },
    {
        "id": "mijnleuven-mediacrew",
        "to": "mijnleuven@leuven.be",
        "company": "MijnLeuven Mediacrew (Stad Leuven)",
        "name": "Mediacrew van MijnLeuven",
        "subject": "MijnLeuven Mediacrew x Fré Leys: Jonge makers op weg naar LA 2028",
        "plain": """Beste Mediacrew van MijnLeuven,

Mijn naam is dr. ir. Fré Leys. Ik ben doctor in de ingenieurswetenschappen (KU Leuven) én atleet in de Belgische nationale paraklimploeg (2x goud op Wereldbekers). Mijn ultieme doel: de allereerste Paralympiër ooit worden uit Leuven op de Paralympische Spelen van Los Angeles in 2028, waar paraklimmen zijn historische debuut maakt.

Mijn traject is geen klassiek sportverhaal: als ingenieur (maker en geek) ga ik opzoek naar hoe wetenschap, technologie en innovatie (vaak zelf bedachte) het verschil kunnen maken voor mij om goud te winnen op het hoogste niveau, namelijk de Paralympische spelen. Vandaar mijn leuze "Engineering my way to the Paralympics"

Omdat ik in Leuven train en woon, wil ik Leuvense jongeren en jonge mediamakers heel graag betrekken bij dit avontuur.

Wat ik voor de Mediacrew in gedachten heb:
• Behind-the-scenes toegang: Jonge fotografen en videografen mogen meekomen naar klimtrainingen en labsessies in Leuven om unieke beelden te schieten.
• TikTok- & Vlog-formats: Samen toffe, snelle video's maken over topsport, technologie en trainen met een prothese.
• Lokale impact: Het Paralympische verhaal en G-sport dichter bij de Leuvense jeugd en scholen brengen.

Wat krijgen de makers en MijnLeuven ervoor terug?
1. Unieke praktijkervaring: Werken met een internationale topatleet in een spectaculaire sport- en labcontext (topmateriaal voor hun eigen portfolio!).
2. Exclusieve kliminitiatie & Meet-and-greet: Ik neem de Mediacrew met veel plezier mee voor een kliminitiatie of workshop rond doorzettingsvermogen.
3. Zichtbaarheid: Volledige credits en bereik via fre2028.la en mijn sociale kanalen.

Lijkt het jullie tof om eens samen te zitten om te kijken hoe we dit kunnen vormgeven? Ik kom met veel plezier langs bij jullie op kantoor in Leuven!

Met sportieve en collegiale groet,

Fré Leys
Doctor in de Ingenieurswetenschappen (KU Leuven) • Paraklimmer Belgische Nationale Ploeg (2x Goud)
fre2028.la
""",
        "html": """<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: #18181b; line-height: 1.6; max-width: 640px;">
<p>Beste Mediacrew van MijnLeuven,</p>

<p>Mijn naam is <strong>dr. ir. Fr&eacute; Leys</strong>. Ik ben doctor in de ingenieurswetenschappen (KU Leuven) &eacute;n atleet in de Belgische nationale paraklimploeg (2x goud op Wereldbekers). Mijn ultieme doel: de <strong>allereerste Paralympi&euml;r ooit worden uit Leuven</strong> op de Paralympische Spelen van Los Angeles in 2028, waar paraklimmen zijn historische debuut maakt.</p>

<p>Mijn traject is geen klassiek sportverhaal: als ingenieur (maker en geek) ga ik opzoek naar hoe <strong>wetenschap, technologie en innovatie</strong> (vaak zelf bedachte) het verschil kunnen maken voor mij om goud te winnen op het hoogste niveau, namelijk de Paralympische spelen. Vandaar mijn leuze <em>&quot;Engineering my way to the Paralympics&quot;</em>.</p>

<p>Omdat ik in Leuven train en woon, wil ik Leuvense jongeren en jonge mediamakers heel graag betrekken bij dit avontuur.</p>

<p><strong>Wat ik voor de Mediacrew in gedachten heb:</strong></p>
<ul style="padding-left: 20px; margin: 12px 0 16px 0; line-height: 1.7;">
  <li style="margin-bottom: 6px;"><strong>Behind-the-scenes toegang:</strong> Jonge fotografen en videografen mogen meekomen naar klimtrainingen en labsessies in Leuven om unieke beelden te schieten.</li>
  <li style="margin-bottom: 6px;"><strong>TikTok- &amp; Vlog-formats:</strong> Samen toffe, snelle video's maken over topsport, technologie en trainen met een prothese.</li>
  <li style="margin-bottom: 6px;"><strong>Lokale impact:</strong> Het Paralympische verhaal en G-sport dichter bij de Leuvense jeugd en scholen brengen.</li>
</ul>

<p><strong>Wat krijgen de makers en MijnLeuven ervoor terug?</strong></p>
<ol style="padding-left: 20px; margin: 12px 0 16px 0; line-height: 1.7;">
  <li style="margin-bottom: 6px;"><strong>Unieke praktijkervaring:</strong> Werken met een internationale topatleet in een spectaculaire sport- en labcontext (topmateriaal voor hun eigen portfolio!).</li>
  <li style="margin-bottom: 6px;"><strong>Exclusieve kliminitiatie &amp; Meet-and-greet:</strong> Ik neem de Mediacrew met veel plezier mee voor een kliminitiatie of workshop rond doorzettingsvermogen.</li>
  <li style="margin-bottom: 6px;"><strong>Zichtbaarheid:</strong> Volledige credits en bereik via <a href="https://fre2028.la/?utm_source=mijnleuven&utm_medium=email&utm_campaign=content_partner" style="color: #000; text-decoration: underline;">fre2028.la</a> en mijn sociale kanalen.</li>
</ol>

<p>Lijkt het jullie tof om eens samen te zitten om te kijken hoe we dit kunnen vormgeven? Ik kom met veel plezier langs bij jullie op kantoor in Leuven!</p>

<p style="margin-top: 24px;">Met sportieve en collegiale groet,</p>

<p><strong>Fr&eacute; Leys</strong><br>
<span style="color: #52525b; font-size: 14px;">Doctor in de Ingenieurswetenschappen (KU Leuven) &bull; Paraklimmer Belgische Nationale Ploeg (2x Goud)</span><br>
<a href="https://fre2028.la/?utm_source=mijnleuven&utm_medium=email&utm_campaign=content_partner" style="color: #000; text-decoration: underline; font-size: 14px;">fre2028.la</a></p>
</body>
</html>"""
    }
]

def main():
    print("\n🚀 Aanmaken van Wave 2 concepten in Gmail...")
    service = get_gmail_service()
    label_id = get_fre2028_label_id(service)

    created = []
    for item in WAVE2_DRAFTS:
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

    print("\n🎉 Alle 3 de Wave 2 concepten staan nu klaar in je Gmail drafts!")
    print("👉 Directe link: https://mail.google.com/mail/u/0/#drafts\n")

if __name__ == "__main__":
    main()
