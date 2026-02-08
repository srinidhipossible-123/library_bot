from fastapi import APIRouter, HTTPException
from ..models import User
from ..db import db

router = APIRouter(tags=["user"])

@router.get("/user/{user_id}", response_model=User)
async def get_user(user_id: str):
    u = await db.users.find_one({"_id": user_id}) or await db.users.find_one({"_id": {"$eq": user_id}})
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    return User(
        id=str(u["_id"]),
        email=u["email"],
        full_name=u.get("full_name", ""),
        membership_type=u.get("membership_type", "public"),
        max_books=u.get("max_books", 3),
    )
