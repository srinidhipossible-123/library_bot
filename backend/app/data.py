import json
from pathlib import Path
from typing import List
from .models import Book, Policy

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

def load_books() -> List[Book]:
    p = DATA_DIR / "books.json"
    if not p.exists():
        return []
    data = json.loads(p.read_text(encoding="utf-8"))
    return [Book(**b) for b in data]

def load_policy() -> Policy:
    p = DATA_DIR / "policies.json"
    if not p.exists():
        return Policy(
            borrowing_limits={"student": 5, "faculty": 10, "public": 3},
            renewal_rules={"default": 14, "max_renewals": 2},
            fine_per_day=0.5,
            membership_rules={"student": "Requires student ID"},
        )
    data = json.loads(p.read_text(encoding="utf-8"))
    return Policy(**data)
