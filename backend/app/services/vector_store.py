import numpy as np
from typing import List, Tuple
from .embedding import Embedder
from ..models import Book

class VectorStore:
    def __init__(self):
        self.embedder = Embedder()
        self.items: List[Book] = []
        self.matrix: np.ndarray | None = None
        self.texts: List[str] = []

    def index(self, books: List[Book]):
        self.items = books
        self.texts = [f"{b.title} {b.author} {b.genre} {' '.join(b.keywords)} {b.summary or ''}" for b in books]
        self.matrix = self.embedder.encode(self.texts)

    def search(self, query: str, top_k: int = 5) -> List[Tuple[Book, float]]:
        if self.matrix is None or not self.items:
            return []
        q = self.embedder.encode([query])[0]
        if q.ndim == 1:
            qv = q.reshape(1, -1)
        else:
            qv = q
        sims = (self.matrix @ qv.T).squeeze()
        idxs = np.argsort(-sims)[:top_k]
        return [(self.items[int(i)], float(sims[int(i)])) for i in idxs]
