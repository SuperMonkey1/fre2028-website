#!/usr/bin/env python3
import sys
from pathlib import Path

tools_dir = Path(__file__).resolve().parent
if str(tools_dir) not in sys.path:
    sys.path.insert(0, str(tools_dir))

from importlib.machinery import SourceFileLoader
mod = SourceFileLoader("create_gmail_drafts", str(tools_dir / "create-gmail-drafts.py")).load_module()
service = mod.get_gmail_service()

try:
    threads_resp = service.users().threads().list(userId='me', q='epicframe OR info@epicframe.be').execute()
    print("Threads found:", threads_resp)
except Exception as e:
    print("Threads list error:", e)
