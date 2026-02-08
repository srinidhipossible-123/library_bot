from fastapi import APIRouter, HTTPException
from passlib.context import CryptContext
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from ..db import db

router = APIRouter(tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def serialize_user(u: dict) -> dict:
    return {
        "id": str(u.get("_id")),
        "email": u["email"],
        "full_name": u.get("full_name", ""),
        "membership_type": u.get("membership_type", "public"),
        "max_books": u.get("max_books", 3),
    }

@router.post("/auth/signup")
async def signup(payload: dict):
    email = payload.get("email")
    password = payload.get("password")
    full_name = payload.get("full_name", "")
    membership_type = payload.get("membership_type", "public")
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = pwd_context.hash(password)
    max_books = 5 if membership_type == "student" else 10 if membership_type == "faculty" else 3
    doc = {
        "email": email,
        "password_hash": hashed,
        "full_name": full_name,
        "membership_type": membership_type,
        "max_books": max_books,
    }
    r = await db.users.insert_one(doc)
    return {"ok": True, "id": str(r.inserted_id)}

@router.post("/auth/login")
async def login(payload: dict):
    email = payload.get("email")
    password = payload.get("password")
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")
    u = await db.users.find_one({"email": email})
    if not u:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not pwd_context.verify(password, u.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return serialize_user(u)
