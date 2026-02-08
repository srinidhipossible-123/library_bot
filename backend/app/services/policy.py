from typing import Dict, Any
from ..models import Policy

class PolicyStore:
    def __init__(self, policy: Policy | None = None):
        self.policy = policy

    def set(self, policy: Policy):
        self.policy = policy

    def answer(self, question: str) -> Dict[str, Any]:
        if not self.policy:
            return {}
        return {
            "borrowing_limits": self.policy.borrowing_limits,
            "renewal_rules": self.policy.renewal_rules,
            "fine_per_day": self.policy.fine_per_day,
            "membership_rules": self.policy.membership_rules,
        }
