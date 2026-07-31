"""Vector store for spending history (RAG).

Each receipt is embedded (locally, via fastembed — no embeddings API bill) and
stored in Qdrant with its user_id in the payload, so semantic search can be
scoped per user. Qdrant runs in embedded file mode by default (zero infra).
"""
from __future__ import annotations

import atexit
from functools import lru_cache

from qdrant_client import QdrantClient, models

from ...config import settings


class ReceiptVectorStore:
    def __init__(self) -> None:
        self.collection = settings.QDRANT_COLLECTION
        location = settings.QDRANT_LOCATION

        if location.startswith("http"):
            self.client = QdrantClient(url=location)
        elif location == ":memory:":
            self.client = QdrantClient(location=":memory:")
        else:
            self.client = QdrantClient(path=location)

        # fastembed does the embedding locally for add()/query().
        self.client.set_model(settings.EMBEDDING_MODEL)
        atexit.register(self._safe_close)

    def _safe_close(self) -> None:
        try:
            self.client.close()
        except Exception:
            pass

    def upsert_receipt(self, receipt_id: int, user_id: int, text: str, payload: dict) -> None:
        """Add or overwrite one receipt's vector (id = receipt id)."""
        meta = {**payload, "user_id": user_id, "receipt_id": receipt_id}
        self.client.add(
            collection_name=self.collection,
            documents=[text],
            metadata=[meta],
            ids=[receipt_id],
        )

    def delete_receipt(self, receipt_id: int) -> None:
        try:
            self.client.delete(
                collection_name=self.collection,
                points_selector=models.PointIdsList(points=[receipt_id]),
            )
        except Exception:
            pass

    def search(self, query: str, user_id: int, top_k: int = 6) -> list[dict]:
        """Semantic search over one user's receipts."""
        try:
            results = self.client.query(
                collection_name=self.collection,
                query_text=query,
                limit=top_k,
                query_filter=models.Filter(
                    must=[
                        models.FieldCondition(
                            key="user_id", match=models.MatchValue(value=user_id)
                        )
                    ]
                ),
            )
        except Exception:
            return []

        hits = []
        for r in results:
            meta = dict(r.metadata or {})
            meta.pop("document", None)
            hits.append(
                {
                    "text": r.document or "",
                    "score": round(r.score, 4),
                    **meta,
                }
            )
        return hits

    def count(self) -> int:
        try:
            return self.client.count(self.collection).count
        except Exception:
            return 0


@lru_cache
def get_vector_store() -> ReceiptVectorStore:
    return ReceiptVectorStore()
