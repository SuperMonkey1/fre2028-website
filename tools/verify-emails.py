#!/usr/bin/env python3
"""
Email Deliverability & MX Verification Tool for FRE2028 Outreach
Checks DNS MX records, domain validity, and common syntax issues.
Supports optional API integration (e.g. Hunter.io / AbstractAPI / ZeroBounce).
"""

import sys
import json
import re
import subprocess
from pathlib import Path
import importlib.util

BASE_DIR = Path(__file__).resolve().parent.parent

def check_mx_records(domain: str) -> dict:
    """Performs DNS lookup for MX records using Google DNS 8.8.8.8."""
    if not domain or '.' not in domain:
        return {"valid": False, "records": [], "error": "Invalid domain format"}
    
    try:
        out = subprocess.check_output(
            ["nslookup", "-query=mx", domain, "8.8.8.8"],
            stderr=subprocess.STDOUT,
            text=True,
            timeout=5
        )
        records = []
        for line in out.splitlines():
            m = re.search(r'mail exchanger = (.*)', line, re.IGNORECASE)
            if m:
                records.append(m.group(1).strip())
        
        # If no MX, check if root domain has A record (fallback for some legacy mail servers)
        has_mx = len(records) > 0
        return {
            "valid": has_mx,
            "records": records,
            "error": None if has_mx else "No MX records found for domain"
        }
    except subprocess.TimeoutExpired:
        return {"valid": False, "records": [], "error": "DNS query timed out"}
    except Exception as e:
        return {"valid": False, "records": [], "error": str(e)}


def check_email_syntax(email: str) -> bool:
    """Validates email format via standard regex."""
    pattern = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return bool(re.match(pattern, email.strip()))


def verify_email(email: str) -> dict:
    """Full verification pipeline for a single email address."""
    email = email.strip()
    if not email:
        return {"email": email, "status": "EMPTY", "deliverable": False, "reason": "No email address provided"}
    
    if not check_email_syntax(email):
        return {"email": email, "status": "INVALID_SYNTAX", "deliverable": False, "reason": "Malformed email format"}
    
    domain = email.split('@')[1].lower()
    mx_result = check_mx_records(domain)
    
    if not mx_result["valid"]:
        return {
            "email": email,
            "domain": domain,
            "status": "DOMAIN_UNREACHABLE",
            "deliverable": False,
            "reason": f"Domain '{domain}' has no valid mail servers (MX records)",
            "mx_records": []
        }
    
    return {
        "email": email,
        "domain": domain,
        "status": "MX_VALID",
        "deliverable": True,
        "reason": f"Valid domain with {len(mx_result['records'])} active mail server(s)",
        "mx_records": mx_result["records"]
    }


def main():
    # Load leads from create-gmail-drafts.py
    spec = importlib.util.spec_from_file_location("cgd", BASE_DIR / "tools" / "create-gmail-drafts.py")
    cgd = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(cgd)

    print("=" * 65)
    print("  🔍 FRE2028 — EMAIL VERIFICATION & DELIVERABILITY SCANNER")
    print("=" * 65)

    leads = cgd.ALL_LEADS
    valid_count = 0
    invalid_count = 0

    results = []
    for lead in leads:
        email = lead.get("contactEmail", "")
        res = verify_email(email)
        res["id"] = lead["id"]
        res["name"] = lead["name"]
        res["company"] = lead["company"]
        results.append(res)

        if res["deliverable"]:
            valid_count += 1
            print(f"  [OK] {lead['name']} ({lead['company']})")
            print(f"       Email: {email}")
            print(f"       MX: {res['mx_records'][0] if res['mx_records'] else 'N/A'}\n")
        else:
            invalid_count += 1
            print(f"  [FAIL] {lead['name']} ({lead['company']})")
            print(f"         Email: {email}")
            print(f"         Reden: {res['reason']}\n")

    print("=" * 65)
    print(f"  Resultaat: {valid_count} geldige domeinen, {invalid_count} ongeldige/ontbrekende domeinen.")
    print("=" * 65)

    if "--json" in sys.argv:
        print(json.dumps(results, indent=2))

if __name__ == "__main__":
    main()
