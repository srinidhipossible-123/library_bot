from fastapi import APIRouter
from ..models import SearchQuery, Book
from ..services.vector_store import VectorStore
from ..data import load_books

router = APIRouter(tags=["search"])

vs = VectorStore()
books = load_books()
vs.index(books)

@router.post("/search", response_model=list[Book])
def search(q: SearchQuery):
    res = vs.search(q.query, top_k=10)
    return [b for b, _ in res]
