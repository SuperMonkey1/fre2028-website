#!/usr/bin/env python3
"""
Finds the Epic Frame / Koen Eykens thread and attaches the draft reply directly to it.
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
mod = SourceFileLoader("create_gmail_drafts", str(tools_dir / "create-gmail-drafts.py")).load_module()
service = mod.get_gmail_service()
label_id = mod.get_fre2028_label_id(service)

# Search threads for epicframe or Koen
threads_resp = service.users().threads().list(userId='me', q='epicframe OR info@epicframe.be').execute()
threads = threads_resp.get('threads', [])

print(f"Gevonden threads: {len(threads)}")
if not threads:
    print("❌ Geen thread gevonden voor epicframe!")
    sys.exit(1)

# Get the most recent thread
target_thread_summary = threads[0]
thread_id = target_thread_summary['id']
print(f"Target Thread ID: {thread_id}")

thread_data = service.users().threads().get(userId='me', id=thread_id, format='full').execute()
messages = thread_data.get('messages', [])
print(f"Aantal berichten in thread: {len(messages)}")

latest_msg = messages[-1]
latest_headers = {h['name'].lower(): h['value'] for h in latest_msg['payload']['headers']}

from_header = latest_headers.get('from', '')
to_header = latest_headers.get('to', '')
subject_header = latest_headers.get('subject', 'Re: Videoproductie & aftermovies: Dr. Ir. Fré Leys op weg naar LA 2028')
if not subject_header.lower().startswith('re:'):
    subject_header = f"Re: {subject_header}"

msg_id_header = latest_headers.get('message-id', '')
references_header = latest_headers.get('references', '')
if msg_id_header:
    if references_header:
        references_header = f"{references_header} {msg_id_header}"
    else:
        references_header = msg_id_header

print(f"Laatste bericht van: {from_header}")
print(f"Message-ID: {msg_id_header}")
print(f"Subject: {subject_header}")

# Prepare Reply Content
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

# Construct MIME Message
msg = MIMEMultipart('alternative')
msg['Subject'] = subject_header
msg['From'] = 'me'
# Reply to sender of latest message
reply_to_addr = from_header if from_header else 'info@epicframe.be'
msg['To'] = reply_to_addr

if msg_id_header:
    msg['In-Reply-To'] = msg_id_header
if references_header:
    msg['References'] = references_header

msg.attach(MIMEText(plain_text, 'plain', 'utf-8'))
msg.attach(MIMEText(html_text, 'html', 'utf-8'))

raw = base64.urlsafe_b64encode(msg.as_bytes()).decode('utf-8')
draft_body = {
    'message': {
        'raw': raw,
        'threadId': thread_id
    }
}

draft = service.users().drafts().create(userId='me', body=draft_body).execute()
draft_id = draft.get('id')
print(f"🎉 SUCCESS! Concept direct gekoppeld in thread {thread_id} -> Draft ID: {draft_id}")
