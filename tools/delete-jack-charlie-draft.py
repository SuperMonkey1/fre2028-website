#!/usr/bin/env python3
import sys
from pathlib import Path

tools_dir = Path(__file__).resolve().parent
if str(tools_dir) not in sys.path:
    sys.path.insert(0, str(tools_dir))

from importlib.machinery import SourceFileLoader
mod = SourceFileLoader("create_gmail_drafts", str(tools_dir / "create-gmail-drafts.py")).load_module()
service = mod.get_gmail_service()

drafts_resp = service.users().drafts().list(userId='me').execute()
deleted_count = 0
for d in drafts_resp.get('drafts', []):
    try:
        d_data = service.users().drafts().get(userId='me', id=d['id'], format='metadata').execute()
        headers = {h['name'].lower(): h['value'] for h in d_data.get('message', {}).get('payload', {}).get('headers', [])}
        to_val = headers.get('to', '').strip().lower()
        subj = headers.get('subject', '').lower()
        if 'medialife.be' in to_val or 'jack' in to_val:
            service.users().drafts().delete(userId='me', id=d['id']).execute()
            print(f"✓ Concept in Gmail succesvol verwijderd voor {to_val} (Draft ID: {d['id']})")
            deleted_count += 1
    except Exception as e:
        print(f"Error checking draft {d.get('id')}: {e}")

if deleted_count == 0:
    print("Geen concept gevonden voor Jack & Charlie in Gmail.")
