from datetime import date, timedelta
from typing import Dict

def due_date_for_membership(membership: str, renewal_rules: Dict[str, int]) -> date:
    days = renewal_rules.get(membership, renewal_rules.get("default", 14))
    return date.today() + timedelta(days=days)

def fine_estimate(days_overdue: int, fine_per_day: float) -> float:
    if days_overdue <= 0:
        return 0.0
    return round(days_overdue * fine_per_day, 2)

def can_renew(renewed_count: int, membership: str, renewal_rules: Dict[str, int]) -> bool:
    limit = renewal_rules.get(f"{membership}_max_renewals", renewal_rules.get("max_renewals", 2))
    return renewed_count < limit
