from fastapi import APIRouter
from ..models import ChatRequest, ChatResponse, Book, Policy
from ..services.intent import classify_intent
from ..services.vector_store import VectorStore
from ..services.policy import PolicyStore
from ..services.llm import generate_response
from ..services.cache import ResponseCache
from ..data import load_books, load_policy

router = APIRouter(tags=["chat"])

vs = VectorStore()
ps = PolicyStore()
cache = ResponseCache(ttl_seconds=300)

books = load_books()
vs.index(books)
policy = load_policy()
ps.set(policy)

@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    intent = classify_intent(req.message)
    ctx = {}
    books_out: list[Book] | None = None
    key = f"{intent}:{req.message.strip().lower()}"
    cached = cache.get(key)
    if cached:
        return ChatResponse(response=cached, intent=intent, books=None, context={})
    if intent == "search":
        results = vs.search(req.message, top_k=5)
        books_out = [b for b, _ in results]
        ctx = {"result_count": str(len(books_out))}
    if intent == "policy":
        ctx = ps.answer(req.message)
    if intent == "recommend":
        results = vs.search(req.message, top_k=3)
        books_out = [b for b, _ in results]
    msgs = []
    if req.history:
        msgs.extend(req.history)
    msgs.append({"role": "user", "content": req.message})
    sys = "You are a library assistant. Answer concisely. Use provided context."
    answer = generate_response(sys, msgs)
    cache.set(key, answer)
    return ChatResponse(response=answer, intent=intent, books=books_out, context=ctx)
