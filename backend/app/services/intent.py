from typing import Dict

INTENTS = {
    "search": ["find", "search", "look for", "available", "availability", "book"],
    "policy": ["policy", "rules", "borrow", "renew", "limit", "fine"],
    "recommend": ["recommend", "suggest", "like", "similar"],
    "fine": ["fine", "penalty", "overdue", "late"],
    "renew": ["renew", "extend", "due date"],
}

def classify_intent(text: str) -> str:
    t = text.lower()
    for intent, keywords in INTENTS.items():
        for k in keywords:
            if k in t:
                return intent
    return "chat"
