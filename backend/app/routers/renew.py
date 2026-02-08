from fastapi import APIRouter
from ..services.rules import can_renew
from ..data import load_policy

router = APIRouter(tags=["renew"])

policy = load_policy()

@router.get("/renew/eligibility")
def renew_eligibility(renewed_count: int, membership: str):
    ok = can_renew(renewed_count, membership, policy.renewal_rules)
    return {"eligible": ok}
