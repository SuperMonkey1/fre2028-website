#!/usr/bin/env python3
"""
FRE2028 — Gmail Threads & Responses Synchronizer
Connects to Gmail API (frederik.leys@gmail.com) to:
- Find sent emails to sponsors
- Detect incoming replies from leads
- Fetch message history & snippets
- Return structured JSON for the Admin Outreach page
"""

import os
import sys
import json
import re
import base64
import argparse
from pathlib import Path
from datetime import datetime
from email.utils import parsedate_to_datetime

# Ensure utf-8 output in Windows terminal
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

try:
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
except ImportError:
    print(json.dumps({"success": False, "error": "Google API client libraries niet geïnstalleerd. Run 'pip install google-api-python-client google-auth-oauthlib google-auth'"}))
    sys.exit(1)

# Scopes needed for drafting and reading threads/messages
SCOPES = [
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.readonly'
]

BASE_DIR = Path(__file__).resolve().parent.parent


def get_gmail_service(credentials_path="credentials.json", token_path="token.json", headless=False):
    """Authenticates and returns the Gmail service client."""
    creds = None
    cred_file = BASE_DIR / credentials_path
    token_file = BASE_DIR / token_path

    if token_file.exists():
        try:
            token_data = json.loads(token_file.read_text(encoding="utf-8"))
            granted_scopes = set(token_data.get("scopes", []))
            if not set(SCOPES).issubset(granted_scopes):
                creds = None
            else:
                creds = Credentials.from_authorized_user_file(str(token_file), SCOPES)
        except Exception:
            creds = None

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
                token_file.write_text(creds.to_json(), encoding="utf-8")
            except Exception:
                creds = None

        if (not creds or not creds.valid):
            if headless:
                raise PermissionError("Re-authenticatie met browser vereist voor nieuwe Gmail leestoegang.")
            if cred_file.exists():
                flow = InstalledAppFlow.from_client_secrets_file(str(cred_file), SCOPES)
                creds = flow.run_local_server(port=0)
                token_file.write_text(creds.to_json(), encoding="utf-8")
            else:
                raise FileNotFoundError(
                    f"Credentials file niet gevonden op {cred_file}. Plaats 'credentials.json' of 'token.json' in de project root."
                )

    return build('gmail', 'v1', credentials=creds)


def extract_body(payload):
    """Recursively extract plain text and html body from email payload."""
    plain_text = ""
    html_text = ""

    mime_type = payload.get('mimeType', '')
    body_data = payload.get('body', {}).get('data', '')

    if body_data:
        try:
            decoded = base64.urlsafe_b64decode(body_data.encode('ASCII')).decode('utf-8', errors='replace')
            if 'html' in mime_type:
                html_text = decoded
            else:
                plain_text = decoded
        except Exception:
            pass

    parts = payload.get('parts', [])
    for part in parts:
        p_plain, p_html = extract_body(part)
        if p_plain and not plain_text:
            plain_text = p_plain
        if p_html and not html_text:
            html_text = p_html

    return plain_text, html_text


def parse_header(headers, name):
    for h in headers:
        if h.get('name', '').lower() == name.lower():
            return h.get('value', '')
    return ''


def fetch_lead_thread(service, lead_email, my_email="frederik.leys@gmail.com"):
    """Queries Gmail for all threads involving lead_email."""
    clean_email = lead_email.strip().lower()
    if not clean_email or '@' not in clean_email:
        return None

    query = f"to:{clean_email} OR from:{clean_email}"
    try:
        response = service.users().threads().list(userId='me', q=query, maxResults=5).execute()
    except Exception as e:
        return None

    threads = response.get('threads', [])
    if not threads:
        return None

    all_messages_data = []
    seen_msg_ids = set()
    has_sent = False
    has_reply = False
    first_sent_date = None
    last_reply_date = None
    latest_subject = ""
    main_thread_id = threads[0]['id']

    my_email_lower = my_email.lower()

    for t_summary in threads:
        t_id = t_summary.get('id')
        try:
            thread = service.users().threads().get(userId='me', id=t_id, format='full').execute()
        except Exception:
            continue

        for msg in thread.get('messages', []):
            msg_id = msg.get('id')
            if msg_id in seen_msg_ids:
                continue
            seen_msg_ids.add(msg_id)

            headers = msg.get('payload', {}).get('headers', [])
            from_hdr = parse_header(headers, 'From')
            to_hdr = parse_header(headers, 'To')
            subject_hdr = parse_header(headers, 'Subject')
            date_hdr = parse_header(headers, 'Date')

            if subject_hdr and not latest_subject:
                latest_subject = subject_hdr

            # Parse date
            dt_str = ""
            iso_date = ""
            if date_hdr:
                try:
                    dt = parsedate_to_datetime(date_hdr)
                    iso_date = dt.strftime('%Y-%m-%d')
                    dt_str = dt.strftime('%d/%m/%Y %H:%M')
                except Exception:
                    iso_date = ""
                    dt_str = date_hdr

            label_ids = msg.get('labelIds', [])
            is_draft = 'DRAFT' in label_ids
            is_from_me = (my_email_lower in from_hdr.lower())

            if is_from_me and not is_draft:
                has_sent = True
                main_thread_id = t_id
                if not first_sent_date and iso_date:
                    first_sent_date = iso_date

            if (not is_from_me) and not is_draft:
                has_reply = True
                main_thread_id = t_id
                last_reply_date = iso_date or last_reply_date

            plain_body, html_body = extract_body(msg.get('payload', {}))
            snippet = msg.get('snippet', '')

            if not snippet and plain_body:
                snippet = plain_body[:200]

            timestamp = int(msg.get('internalDate', 0))

            all_messages_data.append({
                "id": msg_id,
                "from": from_hdr,
                "to": to_hdr,
                "subject": subject_hdr,
                "date": date_hdr,
                "isoDate": iso_date,
                "displayDate": dt_str,
                "timestamp": timestamp,
                "snippet": snippet,
                "body": plain_body or snippet,
                "htmlBody": html_body,
                "isFromMe": is_from_me,
                "isDraft": is_draft
            })

    if not all_messages_data:
        return None

    # Filter out pure drafts if we have actual sent messages
    if has_sent or has_reply:
        filtered_msgs = [m for m in all_messages_data if not m.get('isDraft')]
        if filtered_msgs:
            all_messages_data = filtered_msgs

    # Sort chronologically (oldest sent first, latest reply last)
    all_messages_data.sort(key=lambda m: m.get('timestamp', 0))

    # Find the most recent reply date
    for m in reversed(all_messages_data):
        if not m.get('isFromMe') and not m.get('isDraft') and m.get('isoDate'):
            last_reply_date = m.get('isoDate')
            break

    return {
        "threadId": main_thread_id,
        "contactEmail": clean_email,
        "subject": latest_subject,
        "hasSent": has_sent,
        "hasReply": has_reply,
        "sentDate": first_sent_date,
        "lastReplyDate": last_reply_date,
        "messageCount": len(all_messages_data),
        "messages": all_messages_data
    }


def main():
    parser = argparse.ArgumentParser(description="Synchronize Gmail threads for FRE2028 leads")
    parser.add_argument("--email", help="Single lead contact email to check")
    parser.add_argument("--leads-json", help="JSON string or file path containing array of leads")
    parser.add_argument("--json", action="store_true", default=True, help="Output results as JSON")
    parser.add_argument("--auth-check", action="store_true", help="Check if Gmail authentication with read scope is valid")
    parser.add_argument("--interactive", action="store_true", default=False, help="Open browser flow for OAuth if re-auth required")

    args = parser.parse_args()

    # Authenticate
    try:
        service = get_gmail_service(headless=not args.interactive)
        profile = service.users().getProfile(userId='me').execute()
        my_email = profile.get('emailAddress', 'frederik.leys@gmail.com')
    except Exception as e:
        print(json.dumps({
            "success": False,
            "needsReauth": True,
            "error": f"Gmail API authenticatie vereist: {str(e)}"
        }))
        sys.exit(0)

    if args.auth_check:
        print(json.dumps({
            "success": True,
            "connected": True,
            "email": my_email,
            "scopes": SCOPES
        }))
        return

    results = {}

    if args.email:
        thread_info = fetch_lead_thread(service, args.email, my_email)
        if thread_info and isinstance(thread_info, dict) and "messages" in thread_info:
            results[args.email] = thread_info
    elif args.leads_json:
        try:
            if os.path.exists(args.leads_json):
                with open(args.leads_json, 'r', encoding='utf-8') as f:
                    leads_data = json.load(f)
            else:
                leads_data = json.loads(args.leads_json)
        except Exception as e:
            print(json.dumps({"success": False, "error": f"Ongeldige leads JSON: {str(e)}"}))
            sys.exit(1)

        for lead in leads_data:
            lead_id = lead.get('id')
            email = lead.get('contactEmail')
            if email and email.strip():
                thread_info = fetch_lead_thread(service, email, my_email)
                if thread_info and isinstance(thread_info, dict) and "messages" in thread_info:
                    if lead_id:
                        results[lead_id] = thread_info
                    if email:
                        results[email.lower().strip()] = thread_info

    print(json.dumps({
        "success": True,
        "myEmail": my_email,
        "resultsCount": len(results),
        "results": results
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
