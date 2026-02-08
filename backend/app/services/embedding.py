from typing import List
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sentence_transformers import SentenceTransformer
from ..config import EMBEDDING_MODEL

class Embedder:
    def __init__(self):
        try:
            self.model = SentenceTransformer(EMBEDDING_MODEL)
            self.use_st = True
        except Exception:
            self.vectorizer = TfidfVectorizer(stop_words="english")
            self.use_st = False
            self.tfidf_fitted = False

    def encode(self, texts: List[str]) -> np.ndarray:
        if self.use_st:
            return np.array(self.model.encode(texts, normalize_embeddings=True))
        if not self.tfidf_fitted:
            self.vectorizer.fit(texts)
            self.tfidf_fitted = True
        return self.vectorizer.transform(texts).toarray()
