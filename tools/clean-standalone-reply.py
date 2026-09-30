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
for d in drafts_resp.get('drafts', []):
    try:
        d_data = service.users().drafts().get(userId='me', id=d['id'], format='metadata').execute()
        headers = {h['name'].lower(): h['value'] for h in d_data.get('message', {}).get('payload', {}).get('headers', [])}
        to_val = headers.get('to', '').strip().lower()
        subj = headers.get('subject', '').lower()
        if 'epicframe' in to_val and 're:' in subj:
            service.users().drafts().delete(userId='me', id=d['id']).execute()
            print(f"✓ Standalone reply draft verwijderd (ID: {d['id']})")
    except Exception as e:
        print(f"Error: {e}")
