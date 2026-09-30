#!/usr/bin/env python3
"""
FRE2028 — Gmail Authorization Script
Opens a browser window to authorize Gmail with Compose, Readonly, and Modify scopes.
Updates token.json with the new permissions.
"""

import os
import sys
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

try:
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
except ImportError:
    print("❌ Error: Google API libraries not installed.")
    print("Run: pip install google-api-python-client google-auth-oauthlib google-auth")
    sys.exit(1)

SCOPES = [
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify'
]

def main():
    cred_file = BASE_DIR / "credentials.json"
    token_file = BASE_DIR / "token.json"

    if not cred_file.exists():
        print(f"❌ credentials.json niet gevonden op {cred_file}")
        sys.exit(1)

    print("\n" + "=" * 60)
    print("  🔑 GMAIL LEES- EN SCHRIJFRECHTEN AANZETTEN (FRE2028)")
    print("=" * 60)
    print("\nEr opent nu een venster in je standaardbrowser...")
    print("1. Kies je Google account (frederik.leys@gmail.com)")
    print("2. Vink de gevraagde machtigingen aan (lezen en beheren van e-mails)")
    print("3. Klik op 'Doorgaan' / 'Toestaan'\n")

    flow = InstalledAppFlow.from_client_secrets_file(str(cred_file), SCOPES)
    creds = flow.run_local_server(port=0)

    token_file.write_text(creds.to_json(), encoding="utf-8")
    print("✓ token.json succesvol bijgewerkt met volledige lees- en schrijfrechten!")

    service = build('gmail', 'v1', credentials=creds)
    profile = service.users().getProfile(userId='me').execute()
    print(f"✓ Verbonden als: {profile.get('emailAddress')}")
    print("\n🎉 Vanaf nu kan het systeem automatisch antwoorden in bestaande conversaties plaatsen!")
    print("=" * 60 + "\n")

if __name__ == "__main__":
    main()
