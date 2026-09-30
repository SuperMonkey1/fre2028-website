#!/usr/bin/env python3
"""
Finds and prints recent emails from Koen Eykens
"""

import sys
import base64
from pathlib import Path

tools_dir = Path(__file__).resolve().parent
if str(tools_dir) not in sys.path:
    sys.path.insert(0, str(tools_dir))

from importlib.machinery import SourceFileLoader
mod = SourceFileLoader("create_gmail_drafts", str(tools_dir / "create-gmail-drafts.py")).load_module()
service = mod.get_gmail_service()

# Search query
query = "from:eykens OR eykens OR Koen"
results = service.users().messages().list(userId='me', q=query, maxResults=10).execute()
messages = results.get('messages', [])

print(f"Gevonden berichten met query '{query}': {len(messages)}")
for m in messages:
    msg = service.users().messages().get(userId='me', id=m['id'], format='full').execute()
    headers = {h['name'].lower(): h['value'] for h in msg['payload']['headers']}
    subject = headers.get('subject', 'Geen onderwerp')
    from_addr = headers.get('from', 'Onbekend')
    date_str = headers.get('date', 'Onbekend')
    
    # Extract body
    body = ""
    payload = msg['payload']
    if 'parts' in payload:
        for part in payload['parts']:
            if part['mimeType'] == 'text/plain':
                data = part['body'].get('data')
                if data:
                    body = base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
            elif part['mimeType'] == 'text/html' and not body:
                data = part['body'].get('data')
                if data:
                    body = base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
    elif 'body' in payload and 'data' in payload['body']:
        data = payload['body']['data']
        body = base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')

    print("=" * 60)
    print(f"Message ID: {m['id']} | Thread ID: {msg['threadId']}")
    print(f"From: {from_addr}")
    print(f"Date: {date_str}")
    print(f"Subject: {subject}")
    print("Body snippet:")
    print(body[:600])
    print("=" * 60)
