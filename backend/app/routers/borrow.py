from fastapi import APIRouter, HTTPException
from datetime import date
from bson import ObjectId
from ..models import BorrowRecord
from ..services.rules import due_date_for_membership
from ..data import load_policy, load_books
from ..db import db

router = APIRouter(tags=["borrow"])

policy = load_policy()
books_json = {b.id: b for b in load_books()}

@router.post("/borrow", response_model=BorrowRecord)
async def borrow(user_id: str, book_id: str, membership: str):
    d = due_date_for_membership(membership, policy.renewal_rules)
    rec = BorrowRecord(
        id=f"{user_id}-{book_id}-{int(date.today().toordinal())}",
        user_id=user_id,
        book_id=book_id,
        borrowed_date=date.today(),
        due_date=d,
        renewed_count=0,
        status="active",
        fine_amount=0.0,
    )
    await db.borrowed_books.insert_one({
        "_id": rec.id,
        "user_id": user_id,
        "book_id": book_id,
        "borrowed_date": rec.borrowed_date.isoformat(),
        "due_date": rec.due_date.isoformat(),
        "returned_date": None,
        "renewed_count": 0,
        "status": "active",
        "fine_amount": 0.0,
    })
    return rec

@router.get("/borrowed")
async def borrowed(user_id: str):
    cursor = db.borrowed_books.find({"user_id": user_id}).sort("borrowed_date", -1)
    items = []
    async for b in cursor:
        book_id = b.get("book_id")
        bj = books_json.get(book_id)
        items.append({
            "id": b.get("_id"),
            "borrowed_date": b.get("borrowed_date"),
            "due_date": b.get("due_date"),
            "returned_date": b.get("returned_date"),
            "status": b.get("status"),
            "fine_amount": b.get("fine_amount", 0.0),
            "renewed_count": b.get("renewed_count", 0),
            "book": {
                "title": bj.title if bj else "",
                "author": bj.author if bj else "",
                "genre": bj.genre if bj else "",
                "cover_url": bj.cover_url if bj else None,
            }
        })
    return items
