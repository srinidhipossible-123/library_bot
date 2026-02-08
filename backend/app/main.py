from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import chat, search, user, borrow, renew, auth

app = FastAPI(title="Smart Library Assistant AI", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api")
app.include_router(search.router, prefix="/api")
app.include_router(user.router, prefix="/api")
app.include_router(borrow.router, prefix="/api")
app.include_router(renew.router, prefix="/api")
app.include_router(auth.router, prefix="/api")

@app.get("/api/health")
def health():
    return {"status": "ok"}
