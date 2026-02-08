from time import time
from typing import Optional

class ResponseCache:
    def __init__(self, ttl_seconds: int = 300, max_items: int = 512):
        self.ttl = ttl_seconds
        self.max = max_items
        self.store: dict[str, tuple[float, str]] = {}

    def _evict(self):
        if len(self.store) <= self.max:
            return
        # remove oldest
        oldest_key = min(self.store.keys(), key=lambda k: self.store[k][0])
        self.store.pop(oldest_key, None)

    def get(self, key: str) -> Optional[str]:
        v = self.store.get(key)
        if not v:
            return None
        ts, val = v
        if time() - ts > self.ttl:
            self.store.pop(key, None)
            return None
        return val

    def set(self, key: str, value: str):
        self.store[key] = (time(), value)
        self._evict()
