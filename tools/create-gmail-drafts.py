#!/usr/bin/env python3
"""
FRE2028 — Gmail Drafts Generator (Road to LA 2028 Outreach Campaign)
Creates personalized email drafts in Gmail (frederik.leys@gmail.com) via official Gmail API.
DOES NOT SEND ANY EMAILS — ONLY CREATES DRAFTS IN GMAIL FOR REVIEW.
"""

import os
import sys
import json
import re
import base64
import argparse
from pathlib import Path
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Ensure utf-8 output in Windows terminal
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

# Google API client imports
try:
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
except ImportError:
    print("❌ Error: Google API client libraries not installed.")
    print("Run: pip install google-api-python-client google-auth-oauthlib google-auth")
    sys.exit(1)

# Scopes needed for drafting emails
SCOPES = ['https://www.googleapis.com/auth/gmail.compose']

# Workspace Paths
BASE_DIR = Path(__file__).resolve().parent.parent
MAILS_DIR = BASE_DIR / "content" / "Partners" / "mails" / "kort"
STATUS_FILE = BASE_DIR / "tools" / ".drafts_status.json"

# All Leads Configuration with Lead IDs, Names, Companies, Tier, and default contact emails
ALL_LEADS = [
    # Confirmed
    {
        "id": "cronos",
        "name": "Directie / Sponsoring",
        "company": "Cronos Group",
        "role": "IT & Innovatie Groep",
        "tier": "Bevestigde Sponsoring",
        "tierId": 0,
        "contactEmail": "info@cronos-group.com",
        "emailDraftSlug": None,
        "skip": True, # Already confirmed sponsor
    },
    # Tier 1: The Golden Triangle
    {
        "id": "hans-clijsters",
        "name": "Hans Clijsters",
        "company": "Democo Group / Solidaris Brabant",
        "role": "Bestuurder Democo / Bijzonder Gevolmachtigde Solidaris",
        "tier": "Tier 1: The Golden Triangle",
        "tierId": 1,
        "contactEmail": "hans.clijsters@democo.be",
        "emailDraftSlug": "hans-clijsters",
    },
    {
        "id": "heidi-rakels",
        "name": "Heidi Rakels",
        "company": "Guardsquare / XYZT.AI",
        "role": "Co-founder Guardsquare, Advisor XYZT.AI",
        "tier": "Tier 1: The Golden Triangle",
        "tierId": 1,
        "contactEmail": "heidi.rakels@guardsquare.com",
        "emailDraftSlug": "heidi-rakels",
    },
    {
        "id": "francoise-chombar",
        "name": "Françoise Chombar",
        "company": "Melexis / STEM Platform",
        "role": "Voorzitter Melexis, Voorzitter Vlaams STEM-platform",
        "tier": "Tier 1: The Golden Triangle",
        "tierId": 1,
        "contactEmail": "fch@melexis.com",
        "emailDraftSlug": "francoise-chombar",
    },
    # Tier 2: Melexis / Duchâtelet Dynastie
    {
        "id": "roland-duchatelet",
        "name": "Roland Duchâtelet",
        "company": "Xtrion / Vivant",
        "role": "Oprichter Xtrion / Melexis",
        "tier": "Tier 2: Melexis / Duchâtelet Dynastie",
        "tierId": 2,
        "contactEmail": "roland.duchatelet@xtrion.be",
        "emailDraftSlug": "roland-duchatelet",
    },
    {
        "id": "roderick-duchatelet",
        "name": "Roderick Duchâtelet",
        "company": "Sportinvesteerder",
        "role": "Ondernemer, sportinvesteerder",
        "tier": "Tier 2: Melexis / Duchâtelet Dynastie",
        "tierId": 2,
        "contactEmail": "roderick.duchatelet@gmail.com",
        "emailDraftSlug": "roderick-duchatelet",
    },
    {
        "id": "rudi-de-winter",
        "name": "Rudi De Winter",
        "company": "X-Fab",
        "role": "CEO X-Fab (MEMS & sensor-foundry)",
        "tier": "Tier 2: Melexis / Duchâtelet Dynastie",
        "tierId": 2,
        "contactEmail": "rudi.dewinter@xfab.com",
        "emailDraftSlug": "rudi-de-winter",
    },
    # Tier 3: Deep Tech KU Leuven Spin-offs & Alumni
    {
        "id": "urbain-vandeurzen",
        "name": "Urbain Vandeurzen",
        "company": "LMS / Smile Invest / VMF Invest",
        "role": "Oprichter LMS International, Voorzitter Opening the Future",
        "tier": "Tier 3: Deep Tech KU Leuven Spin-offs & Alumni",
        "tierId": 3,
        "contactEmail": "urbain.vandeurzen@smile-invest.com",
        "emailDraftSlug": "urbain-vandeurzen",
    },
    {
        "id": "wilfried-vancraen",
        "name": "Wilfried Vancraen",
        "company": "Materialise",
        "role": "Oprichter & Bestuurder Materialise",
        "tier": "Tier 3: Deep Tech KU Leuven Spin-offs & Alumni",
        "tierId": 3,
        "contactEmail": "wilfried.vancraen@materialise.be",
        "emailDraftSlug": "wilfried-vancraen",
    },
    {
        "id": "kuleuven-alumni",
        "name": "Inge Wullaert / Redactie GeniaaL",
        "company": "KU Leuven Alumni & Alumnirelaties",
        "role": "Directeur Alumnirelaties & Bestuur Alumni Ingenieurs",
        "tier": "Tier 3: Deep Tech KU Leuven Spin-offs & Alumni",
        "tierId": 3,
        "contactEmail": "alumni@kuleuven.be",
        "emailDraftSlug": "kuleuven-alumni",
    },
    {
        "id": "luc-van-den-hove",
        "name": "Luc Van den hove",
        "company": "imec",
        "role": "President & CEO imec",
        "tier": "Tier 3: Deep Tech KU Leuven Spin-offs & Alumni",
        "tierId": 3,
        "contactEmail": "luc.vandenhove@imec.be",
        "emailDraftSlug": "luc-van-den-hove",
    },
    {
        "id": "koenraad-debackere",
        "name": "Koenraad Debackere",
        "company": "KU Leuven R&D (LRD)",
        "role": "Gedelegeerd Bestuurder LRD / Voorzitter Gemma Frisius Fonds",
        "tier": "Tier 3: Deep Tech KU Leuven Spin-offs & Alumni",
        "tierId": 3,
        "contactEmail": "koenraad.debackere@kuleuven.be",
        "emailDraftSlug": "koenraad-debackere",
        "skip": True, # Already contacted
    },
    {
        "id": "paul-van-dun",
        "name": "Paul Van Dun",
        "company": "KU Leuven R&D (LRD)",
        "role": "Algemeen Directeur LRD",
        "tier": "Tier 3: Deep Tech KU Leuven Spin-offs & Alumni",
        "tierId": 3,
        "contactEmail": "paul.vandun@kuleuven.be",
        "emailDraftSlug": "paul-van-dun",
    },
    {
        "id": "martin-de-prycker",
        "name": "Martin De Prycker",
        "company": "Qbic Fund / EVS",
        "role": "Managing Partner Qbic, Bestuurder EVS Broadcast Equipment",
        "tier": "Tier 3: Deep Tech KU Leuven Spin-offs & Alumni",
        "tierId": 3,
        "contactEmail": "martin.deprycker@qbic.be",
        "emailDraftSlug": "martin-de-prycker",
    },
    # Tier 4: Hardware Scale-ups & Peers
    {
        "id": "comate",
        "name": "Sander Van den dries & Wouter Foulon",
        "company": "Comate Engineering & Design",
        "role": "Founders Comate & Comate Ventures",
        "tier": "Tier 4: Hardware Scale-ups & Peers",
        "tierId": 4,
        "contactEmail": "sander@comate.be",
        "emailDraftSlug": "comate",
    },
    {
        "id": "amnovis-replasia",
        "name": "Jonas Van Vaerenbergh & Peter Mercelis",
        "company": "Amnovis / Replasia (ex-LayerWise)",
        "role": "Co-founders LayerWise, Amnovis & Replasia",
        "tier": "Tier 4: Hardware Scale-ups & Peers",
        "tierId": 4,
        "contactEmail": "peter.mercelis@amnovis.com",
        "emailDraftSlug": "amnovis-replasia",
    },
    {
        "id": "xenomatix",
        "name": "Filip Geuens",
        "company": "XenomatiX",
        "role": "CEO XenomatiX (Solid-state Lidar)",
        "tier": "Tier 4: Hardware Scale-ups & Peers",
        "tierId": 4,
        "contactEmail": "filip.geuens@xenomatix.com",
        "emailDraftSlug": "xenomatix",
    },
    {
        "id": "guardsquare-eric",
        "name": "Eric Lafortune",
        "company": "Guardsquare",
        "role": "Co-founder & Chief Architect Guardsquare",
        "tier": "Tier 4: Hardware Scale-ups & Peers",
        "tierId": 4,
        "contactEmail": "eric.lafortune@guardsquare.com",
        "emailDraftSlug": "guardsquare-eric",
    },
    {
        "id": "pharrowtech",
        "name": "Wim Van Thillo",
        "company": "Pharrowtech",
        "role": "CEO Pharrowtech (imec spin-off)",
        "tier": "Tier 4: Hardware Scale-ups & Peers",
        "tierId": 4,
        "contactEmail": "wim.vanthillo@pharrowtech.com",
        "emailDraftSlug": "pharrowtech",
        "skip": True, # Already contacted
    },
    # Tier 5: Impact Investors & Smart Money
    {
        "id": "piet-colruyt",
        "name": "Piet Colruyt",
        "company": "Impact House / Impact Capital",
        "role": "Oprichter Impact Capital, Burgerlijk Ingenieur-Architect KU Leuven",
        "tier": "Tier 5: Impact Investors & Smart Money",
        "tierId": 5,
        "contactEmail": "piet@impactcapital.be",
        "emailDraftSlug": "piet-colruyt",
    },
    {
        "id": "marc-coucke",
        "name": "Marc Coucke",
        "company": "Alychlo / Comate Ventures",
        "role": "Oprichter Alychlo, Partner Comate Ventures",
        "tier": "Tier 5: Impact Investors & Smart Money",
        "tierId": 5,
        "contactEmail": "marc.coucke@alychlo.com",
        "emailDraftSlug": "marc-coucke",
        "skip": True, # Already contacted
    },
    {
        "id": "michel-akkermans",
        "name": "Michel Akkermans",
        "company": "Pamica / imec",
        "role": "Investeerder Pamica, Bestuurder imec",
        "tier": "Tier 5: Impact Investors & Smart Money",
        "tierId": 5,
        "contactEmail": "michel.akkermans@pamica.be",
        "emailDraftSlug": "michel-akkermans",
        "skip": True, # Already contacted
    },
    {
        "id": "jurgen-ingels",
        "name": "Jurgen Ingels",
        "company": "SmartFin / SuperNova",
        "role": "Tech-investeerder SmartFin, Organisator SuperNova festival",
        "tier": "Tier 5: Impact Investors & Smart Money",
        "tierId": 5,
        "contactEmail": "jurgen@smartfinvc.com",
        "emailDraftSlug": "jurgen-ingels",
    },
    {
        "id": "stijn-bijnens",
        "name": "Stijn Bijnens",
        "company": "Cegeka / Proximus",
        "role": "CEO Cegeka, Toekomstig CEO Proximus",
        "tier": "Tier 5: Impact Investors & Smart Money",
        "tierId": 5,
        "contactEmail": "stijn.bijnens@cegeka.com",
        "emailDraftSlug": "stijn-bijnens",
    },
    # Tier 6: Institutionele Gatekeepers
    {
        "id": "jan-paesen",
        "name": "Jan Paesen",
        "company": "Leuven MindGate",
        "role": "Managing Director Leuven MindGate",
        "tier": "Tier 6: Institutionele Gatekeepers",
        "tierId": 6,
        "contactEmail": "jan.paesen@leuvenmindgate.be",
        "emailDraftSlug": "jan-paesen",
        "skip": True, # Already contacted
    },
    {
        "id": "danielle-vanwesenbeeck",
        "name": "Daniëlle Vanwesenbeeck",
        "company": "Voka Vlaams-Brabant / Mastermail",
        "role": "Voorzitter Voka Vlaams-Brabant, CEO Mastermail",
        "tier": "Tier 6: Institutionele Gatekeepers",
        "tierId": 6,
        "contactEmail": "danielle@mastermail.be",
        "emailDraftSlug": "danielle-vanwesenbeeck",
        "skip": True, # Already contacted
    },
    {
        "id": "charles-beauduin",
        "name": "Charles Beauduin",
        "company": "Barco / Vandewiele",
        "role": "Voorzitter Barco, CEO Vandewiele",
        "tier": "Tier 6: Institutionele Gatekeepers",
        "tierId": 6,
        "contactEmail": "charles.beauduin@vandewiele.com",
        "emailDraftSlug": "charles-beauduin",
        "skip": True, # Already contacted
    },
    {
        "id": "wim-van-hecke",
        "name": "Wim Van Hecke",
        "company": "Icometrix",
        "role": "CEO Icometrix (AI voor MRI beeldvorming)",
        "tier": "Tier 6: Institutionele Gatekeepers",
        "tierId": 6,
        "contactEmail": "wim.vanhecke@icometrix.com",
        "emailDraftSlug": "wim-van-hecke",
        "skip": True, # Already contacted
    },
]


def get_first_name(full_name: str) -> str:
    """Extracts first name or clean greeting name from a full name string."""
    if not full_name or full_name.strip() in ["Beste", "Lead", "Partner"]:
        return ""
    if "&" in full_name:
        parts = [p.strip().split()[0] for p in full_name.split("&") if p.strip()]
        return " & ".join(parts)
    first_part = full_name.strip().split()[0]
    return first_part


def build_leuven25_email(lead: dict):
    """Generates the official 'Leuven 25 Support Circle' partnership pitch email."""
    company = lead.get("company", "uw organisatie") or "uw organisatie"
    raw_name = lead.get("name", "") or ""
    first_name = get_first_name(raw_name)
    greeting = f"Beste {first_name}," if first_name else "Beste,"

    lead_id = lead.get("id") or "partner"
    clean_id = re.sub(r'[^a-z0-9_-]', '-', lead_id.lower().strip())
    tracking_url = f"https://fre2028.la/?utm_source={clean_id}&utm_medium=email&utm_campaign=leuven25_support_circle"
    pdf_url = f"https://fre2028.la/Frederik-Leys-Partnership-Dossier.pdf?utm_source={clean_id}&utm_medium=email&utm_campaign=leuven25_support_circle"

    subject = f"Partnerschap Road to LA 2028 — Leuven 25 Support Circle & {company}"

    html_content = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: #18181b; line-height: 1.6; max-width: 640px;">
<p>{greeting}</p>

<p>Ik neem graag even contact met je op.</p>

<p>Ik ben Fré Leys, een Leuvense paraklimmer met een duidelijke missie: <strong>goud behalen op de Paralympische Spelen van LA 2028</strong>. Om de stap naar voltijds topsporter te kunnen zetten, lanceer ik momenteel de <strong>&quot;Leuven 25 Support Circle&quot;</strong>. Dit is een lokaal netwerk van exact 25 Leuvense partnerbedrijven die mijn traject financieel steunen met een bijdrage van <strong>€100 per maand</strong>, oftewel <strong>€1.200 per jaar</strong>. Met dit budget dek ik mijn levensonderhoud, trainingsgerelateerde kosten en de niet-gesubsidieerde kosten om aan wedstrijden te kunnen deelnemen, zodat ik me 100% professioneel kan focussen op topsport. Hiermee zou ik de allereerste Paralympiër uit Leuven ooit worden.</p>

<p><strong>Wat krijgt {company} concreet terug als partner?</strong></p>

<ul style="padding-left: 20px; margin: 12px 0 16px 0; line-height: 1.7;">
  <li style="margin-bottom: 6px;"><strong>Zichtbaarheid:</strong> Jouw bedrijfslogo op de website (<a href="{tracking_url}" style="color: #000; text-decoration: underline;">fre2028.la</a>), de officiële campagneposter en mijn trainingskledij.</li>
  <li style="margin-bottom: 6px;"><strong>Exclusief Jaarevent:</strong> Een jaarlijks partnerevent, bijvoorbeeld een kliminitiatie met vertoning van mijn <a href="https://www.youtube.com/watch?v=MZuKnpXXbUo" style="color: #000; text-decoration: underline;">documentaire</a> of een keynote over veerkracht, innovatie en topsport.</li>
  <li style="margin-bottom: 6px;"><strong>Grote Poster 2028:</strong> Jouw logo op de campagneposter die in 2028 huis-aan-huis wordt gebust in Leuven en op elke Leuvense school hangt.</li>
  <li style="margin-bottom: 6px;"><strong>Leuvense Kerstmarkt 2027:</strong> Zichtbaarheid en activatiemogelijkheden op de Kerstmarkt in Leuven.</li>
  <li style="margin-bottom: 6px;"><strong>Maatschappelijke Impact:</strong> Een structurele bijdrage aan de promotie van paraklimmen (via <a href="https://paraclimbing.be" style="color: #000; text-decoration: underline;">paraclimbing.be</a>) en de Paralympische Spelen in Leuven.</li>
  <li style="margin-bottom: 6px;"><strong>Maatwerk & Flexibiliteit:</strong> Elke andere vorm van return, activatie of samenwerking op maat van jullie bedrijf is uiteraard bespreekbaar.</li>
</ul>

<p>Meer details kan je vinden in deze bijlage: <a href="{pdf_url}" style="color: #000; font-weight: bold; text-decoration: underline;">Partnerschap Dossier (PDF)</a>.</p>

<p>Ik ben benieuwd naar jouw blik op mijn project en kom graag eens aftoetsen of een samenwerking binnen die &quot;Leuven 25&quot; een match zou zijn.</p>

<p>Zou je het zien zitten om binnenkort eens af te spreken?<br>
Laat maar weten wanneer dat voor jou zou passen.</p>

<p style="margin-top: 24px;">Vriendelijke groeten,</p>

<p><strong>Fré Leys</strong><br>
<a href="{tracking_url}" style="color: #52525b; text-decoration: none; font-size: 14px;">fre2028.la</a> • <span style="color: #71717a; font-size: 13px;">Paraclimbing • Road to LA 2028</span></p>
</body>
</html>"""

    plain_content = f"""{greeting}

Ik neem graag even contact met je op.

Ik ben Fré Leys, een Leuvense paraklimmer met een duidelijke missie: goud behalen op de Paralympische Spelen van LA 2028. Om de stap naar voltijds topsporter te kunnen zetten, lanceer ik momenteel de "Leuven 25 Support Circle". Dit is een lokaal netwerk van exact 25 Leuvense partnerbedrijven die mijn traject financieel steunen met een bijdrage van €100 per maand, oftewel €1.200 per jaar. Met dit budget dek ik mijn levensonderhoud, trainingsgerelateerde kosten en de niet-gesubsidieerde kosten om aan wedstrijden te kunnen deelnemen, zodat ik me 100% professioneel kan focussen op topsport. Hiermee zou ik de allereerste Paralympiër uit Leuven ooit worden.

Wat krijgt {company} concreet terug als partner?

• Zichtbaarheid: Jouw bedrijfslogo op de website ({tracking_url}), de officiële campagneposter en mijn trainingskledij.
• Exclusief Jaarevent: Een jaarlijks partnerevent, bijvoorbeeld een kliminitiatie met vertoning van mijn documentaire (https://www.youtube.com/watch?v=MZuKnpXXbUo) of een keynote over veerkracht, innovatie en topsport.
• Grote Poster 2028: Jouw logo op de campagneposter die in 2028 huis-aan-huis wordt gebust in Leuven en op elke Leuvense school hangt.
• Leuvense Kerstmarkt 2027: Zichtbaarheid en activatiemogelijkheden op de Kerstmarkt in Leuven.
• Maatschappelijke Impact: Een structurele bijdrage aan de promotie van paraklimmen (via https://paraclimbing.be) en de Paralympische Spelen in Leuven.
• Maatwerk & Flexibiliteit: Elke andere vorm van return, activatie of samenwerking op maat van jullie bedrijf is uiteraard bespreekbaar.

Meer details kan je vinden in deze bijlage: {pdf_url}

Ik ben benieuwd naar jouw blik op mijn project en kom graag eens aftoetsen of een samenwerking binnen die "Leuven 25" een match zou zijn.

Zou je het zien zitten om binnenkort eens af te spreken?
Laat maar weten wanneer dat voor jou zou passen.

Vriendelijke groeten,

Fré Leys
fre2028.la"""

    return subject, html_content, plain_content, tracking_url


def prepare_email_contents(lead: dict):
    """Prepares personalized HTML and plain-text email bodies with UTM links."""
    return build_leuven25_email(lead)


def get_gmail_service(credentials_path="credentials.json", token_path="token.json"):
    """Authenticates and returns the Gmail service client."""
    creds = None
    cred_file = BASE_DIR / credentials_path
    token_file = BASE_DIR / token_path

    if token_file.exists():
        creds = Credentials.from_authorized_user_file(str(token_file), SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
            token_file.write_text(creds.to_json(), encoding="utf-8")
        elif cred_file.exists():
            flow = InstalledAppFlow.from_client_secrets_file(str(cred_file), SCOPES)
            creds = flow.run_local_server(port=0)
            token_file.write_text(creds.to_json(), encoding="utf-8")
        else:
            raise FileNotFoundError(
                f"❌ Credentials file niet gevonden op {cred_file}. Plaats 'credentials.json' of 'token.json' in de project root."
            )

    return build('gmail', 'v1', credentials=creds)


def get_fre2028_label_id(service):
    """Finds the label ID for FRE2028 in Gmail."""
    try:
        labels_resp = service.users().labels().list(userId='me').execute()
        for label in labels_resp.get('labels', []):
            if label.get('name', '').strip().upper() == 'FRE2028':
                return label.get('id')
    except Exception:
        pass
    return None


def create_draft(service, user_id, to_email, subject, plain_text, html_text, label_id=None):
    """Creates a draft in Gmail with FRE2028 label attached."""
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = 'me'
    if to_email:
        msg['To'] = to_email

    msg.attach(MIMEText(plain_text, 'plain', 'utf-8'))
    msg.attach(MIMEText(html_text, 'html', 'utf-8'))

    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode('utf-8')
    body = {'message': {'raw': raw}}

    draft = service.users().drafts().create(userId=user_id, body=body).execute()

    # Apply FRE2028 label to the draft message
    if label_id and draft.get('message', {}).get('id'):
        try:
            service.users().messages().modify(
                userId=user_id,
                id=draft['message']['id'],
                body={'addLabelIds': [label_id]}
            ).execute()
        except Exception:
            pass

    return draft


def main():
    parser = argparse.ArgumentParser(description="FRE2028 Gmail Drafts Generator (Road to LA 2028 Outreach)")
    parser.add_argument("--all", action="store_true", help="Generate drafts for all leads in pipeline")
    parser.add_argument("--target", type=str, default=None, help="Target specific lead ID (e.g. 'hans-clijsters')")
    parser.add_argument("--lead-json", type=str, default=None, help="JSON string or file path for a single dynamic lead")
    parser.add_argument("--leads-json", type=str, default=None, help="JSON string or file path for array of dynamic leads")
    parser.add_argument("--tier", type=int, default=None, help="Target specific Tier (1-6)")
    parser.add_argument("--dry-run", action="store_true", help="Preview email contents without calling Gmail API")
    parser.add_argument("--json", action="store_true", help="Output results as JSON for API consumption")
    parser.add_argument("--status-only", action="store_true", help="Check Gmail API connection status only")
    parser.add_argument("--custom-email", type=str, default=None, help="Override recipient email for target")
    parser.add_argument("--credentials", type=str, default="credentials.json", help="Path to credentials.json")
    parser.add_argument("--token", type=str, default="token.json", help="Path to token.json")
    args = parser.parse_args()

    # Status check only
    if args.status_only:
        try:
            service = get_gmail_service(args.credentials, args.token)
            profile = service.users().getProfile(userId='me').execute()
            res = {
                "connected": True,
                "email": profile.get("emailAddress"),
                "messagesTotal": profile.get("messagesTotal"),
                "threadsTotal": profile.get("threadsTotal"),
            }
            if args.json:
                print(json.dumps(res))
            else:
                print(f"✓ Gmail verbonden als: {res['email']}")
            return
        except Exception as e:
            res = {"connected": False, "error": str(e)}
            if args.json:
                print(json.dumps(res))
            else:
                print(f"❌ Gmail niet verbonden: {e}")
            sys.exit(1)

    # Filter selection
    selected = []
    if args.lead_json:
        try:
            if os.path.exists(args.lead_json):
                with open(args.lead_json, 'r', encoding='utf-8') as f:
                    lead_data = json.load(f)
            else:
                lead_data = json.loads(args.lead_json)
            if args.custom_email:
                lead_data["contactEmail"] = args.custom_email
            selected.append(lead_data)
        except Exception as e:
            print(json.dumps({"success": False, "error": f"Ongeldige lead-json: {e}"}))
            sys.exit(1)
    elif args.leads_json:
        try:
            if os.path.exists(args.leads_json):
                with open(args.leads_json, 'r', encoding='utf-8') as f:
                    leads_data = json.load(f)
            else:
                leads_data = json.loads(args.leads_json)
            selected = [l for l in leads_data if not l.get("skip")]
        except Exception as e:
            print(json.dumps({"success": False, "error": f"Ongeldige leads-json: {e}"}))
            sys.exit(1)
    else:
        for lead in ALL_LEADS:
            if lead.get("skip"):
                continue
            if args.target:
                if lead["id"] == args.target:
                    lead_copy = dict(lead)
                    if args.custom_email:
                        lead_copy["contactEmail"] = args.custom_email
                    selected.append(lead_copy)
            elif args.tier is not None:
                if lead.get("tierId") == args.tier:
                    selected.append(lead)
            else:
                selected.append(lead)

    if not selected:
        err_msg = f"Geen leads gevonden voor het opgegeven filter (target: {args.target}, tier: {args.tier})."
        if args.json:
            print(json.dumps({"success": False, "error": err_msg}))
        else:
            print(f"❌ {err_msg}")
        sys.exit(1)

    if not args.json:
        print("\n" + "=" * 64)
        print("  🏔️  FRE2028 — GMAIL DRAFTS GENERATOR (ROAD TO LA 2028)")
        print("  📧 Account: frederik.leys@gmail.com")
        print(f"  📋 Aantal te verwerken leads: {len(selected)}")
        print("  🔒 Veiligheid: Er worden ENKEL CONCEPTEN (drafts) aangemaakt.")
        print("=" * 64 + "\n")

    if args.dry_run:
        dry_results = []
        if not args.json:
            print("🔍 [DRY-RUN MODUS] Voorbeeld van gegenereerde concepten:\n")
        for i, lead in enumerate(selected, 1):
            try:
                subject, html_text, plain_text, tracking_url = prepare_email_contents(lead)
                dry_results.append({
                    "leadId": lead["id"],
                    "name": lead["name"],
                    "company": lead["company"],
                    "email": lead.get("contactEmail", ""),
                    "subject": subject,
                    "trackingUrl": tracking_url,
                    "plainPreview": plain_text[:200]
                })
                if not args.json:
                    print(f"[{i}/{len(selected)}] {lead['name']} ({lead['company']})")
                    print(f"  Aan: {lead.get('contactEmail', '(geen email ingevuld)')}")
                    print(f"  Onderwerp: {subject}")
                    print(f"  Tracking URL: {tracking_url}")
                    print(f"  Inhoud preview:\n  " + plain_text[:240].replace('\n', '\n  ') + "\n  ...")
                    print("-" * 64)
            except Exception as e:
                if not args.json:
                    print(f"  ❌ Fout bij laden template voor {lead['id']}: {e}")
        if args.json:
            print(json.dumps({"success": True, "dryRun": True, "leads": dry_results}))
        return

    # Authenticate with Gmail API
    if not args.json:
        print("🔑 Verbinden met Gmail API...")
    try:
        service = get_gmail_service(args.credentials, args.token)
        profile = service.users().getProfile(userId='me').execute()
        if not args.json:
            print(f"✓ Authenticatie geslaagd voor: {profile.get('emailAddress')}\n")
    except Exception as e:
        if args.json:
            print(json.dumps({"success": False, "error": f"Authenticatie mislukt: {e}"}))
        else:
            print(f"❌ Authenticatie mislukt: {e}")
        sys.exit(1)

    fre2028_label_id = get_fre2028_label_id(service)

    # Status tracking dict
    status_records = {}
    if STATUS_FILE.exists():
        try:
            status_records = json.loads(STATUS_FILE.read_text(encoding="utf-8"))
        except Exception:
            status_records = {}

    success_count = 0
    results_list = []
    if not args.json:
        print("🚀 Aanmaken van concepten in Gmail...")
    for i, lead in enumerate(selected, 1):
        lead_id = lead["id"]
        recipient = lead.get("contactEmail", "")
        try:
            subject, html_text, plain_text, tracking_url = prepare_email_contents(lead)
            draft = create_draft(service, 'me', recipient, subject, plain_text, html_text, label_id=fre2028_label_id)
            draft_id = draft.get('id', 'N/A')
            if not args.json:
                print(f"[{i}/{len(selected)}] ✓ Concept klaar: {lead['name']} ({lead['company']}) -> Draft ID: {draft_id}")
            
            lead_record = {
                "leadId": lead_id,
                "name": lead["name"],
                "company": lead["company"],
                "email": recipient,
                "draftId": draft_id,
                "subject": subject,
                "trackingUrl": tracking_url,
                "status": "DRAFT_CREATED",
            }
            status_records[lead_id] = lead_record
            results_list.append(lead_record)
            success_count += 1
        except HttpError as err:
            err_str = str(err)
            if not args.json:
                print(f"[{i}/{len(selected)}] ❌ Gmail API Fout voor {lead['name']}: {err_str}")
            results_list.append({"leadId": lead_id, "error": err_str, "status": "ERROR"})
        except Exception as e:
            err_str = str(e)
            if not args.json:
                print(f"[{i}/{len(selected)}] ❌ Fout voor {lead['name']}: {err_str}")
            results_list.append({"leadId": lead_id, "error": err_str, "status": "ERROR"})

    # Save status
    try:
        STATUS_FILE.write_text(json.dumps(status_records, indent=2, ensure_ascii=False), encoding="utf-8")
    except Exception:
        pass

    if args.json:
        print(json.dumps({
            "success": True,
            "successCount": success_count,
            "totalRequested": len(selected),
            "results": results_list,
            "gmailDraftsUrl": "https://mail.google.com/mail/u/0/#drafts"
        }))
        return

    print("\n" + "=" * 64)
    print(f"  🎉 SUCCES! {success_count} van de {len(selected)} concepten staan klaar in Gmail!")
    print("  📁 Map: Gmail -> Concepten / Drafts")
    print("  🌐 Directe link: https://mail.google.com/mail/u/0/#drafts")
    print("  🔒 Er is NIETS verzonden — u kan elk concept rustig nalezen.")
    print("=" * 64 + "\n")



if __name__ == "__main__":
    main()
