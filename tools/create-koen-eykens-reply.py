#!/usr/bin/env python3
"""
Creates a polite, classy Gmail draft reply to Koen Eykens (Epic Frame)
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
create_draft = create_gmail_mod.create_draft

subject = "Re: Videoproductie & aftermovies: Dr. Ir. Fré Leys op weg naar LA 2028"
to_email = "info@epicframe.be"

plain_text = """Dag Koen,

Volledig begrijpelijk! Kwalitatieve videoproductie, crew en montagetijd kosten uiteraard handenvol werk en middelen. Fijn dat je zo snel en eerlijk laat weten hoe jullie erin staan.

Mocht er in de toekomst een format, merkpitch of campagne passeren waarbij jullie voor een klant of partner een uniek profiel zoeken op het snijvlak van topsport, technologie en doorzettingsvermogen, weet dan dat mijn deur in Leuven altijd openstaat.

Veel succes met jullie producties bij Epic Frame!

Met sportieve groet,

Fré Leys
Doctor in de Ingenieurswetenschappen (KU Leuven) • Paraklimmer Belgische Nationale Ploeg (2x Goud)
fre2028.la
"""

html_text = """<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: #18181b; line-height: 1.6; max-width: 640px;">
<p>Dag Koen,</p>

<p>Volledig begrijpelijk! Kwalitatieve videoproductie, crew en montagetijd kosten uiteraard handenvol werk en middelen. Fijn dat je zo snel en eerlijk laat weten hoe jullie erin staan.</p>

<p>Mocht er in de toekomst een format, merkpitch of campagne passeren waarbij jullie voor een klant of partner een uniek profiel zoeken op het snijvlak van <strong>topsport, technologie en doorzettingsvermogen</strong>, weet dan dat mijn deur in Leuven altijd openstaat.</p>

<p>Veel succes met jullie producties bij Epic Frame!</p>

<p style="margin-top: 24px;">Met sportieve groet,</p>

<p><strong>Fr&eacute; Leys</strong><br>
<span style="color: #52525b; font-size: 14px;">Doctor in de Ingenieurswetenschappen (KU Leuven) &bull; Paraklimmer Belgische Nationale Ploeg (2x Goud)</span><br>
<a href="https://fre2028.la/?utm_source=epic-frame&utm_medium=email&utm_campaign=reply_koen" style="color: #000; text-decoration: underline; font-size: 14px;">fre2028.la</a></p>
</body>
</html>"""

def main():
    service = get_gmail_service()
    label_id = get_fre2028_label_id(service)
    
    draft = create_draft(
        service=service,
        user_id='me',
        to_email=to_email,
        subject=subject,
        plain_text=plain_text,
        html_text=html_text,
        label_id=label_id
    )
    draft_id = draft.get('id', 'N/A')
    print(f"✓ Reactie-concept klaar in Gmail voor Koen Eykens ({to_email}) -> Draft ID: {draft_id}")
    print("👉 Directe link: https://mail.google.com/mail/u/0/#drafts")

if __name__ == "__main__":
    main()
