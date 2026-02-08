from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime, date

class Book(BaseModel):
    id: str
    title: str
    author: str
    genre: str
    keywords: List[str] = []
    summary: Optional[str] = None
    availability: int = 0
    location: Optional[str] = None
    copies: int = 0
    cover_url: Optional[str] = None

class Policy(BaseModel):
    borrowing_limits: Dict[str, int]
    renewal_rules: Dict[str, int]
    fine_per_day: float
    membership_rules: Dict[str, str]

class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None
    history: Optional[List[Dict[str, str]]] = None

class ChatResponse(BaseModel):
    response: str
    intent: str
    books: Optional[List[Book]] = None
    context: Optional[Dict[str, str]] = None

class SearchQuery(BaseModel):
    query: str
    filters: Optional[Dict[str, str]] = None

class User(BaseModel):
    id: str
    email: str
    full_name: str
    membership_type: str
    max_books: int

class BorrowRecord(BaseModel):
    id: str
    user_id: str
    book_id: str
    borrowed_date: date
    due_date: date
    returned_date: Optional[date] = None
    renewed_count: int = 0
    status: str = "active"
    fine_amount: float = 0.0

