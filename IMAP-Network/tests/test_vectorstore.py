"""Vector store embeds locally (fastembed) and scopes search per user.

No API key needed; embeddings run locally. First run downloads the small
embedding model, then it's cached.
"""
import pytest

from app.config import settings
from app.services.ai import vectorstore as vs


@pytest.fixture
def store(monkeypatch):
    monkeypatch.setattr(settings, "QDRANT_LOCATION", ":memory:")
    return vs.ReceiptVectorStore()


def test_search_scoped_by_user_and_ranked(store):
    store.upsert_receipt(1, user_id=10, text="กาแฟ Starbucks ลาเต้ coffee latte",
                         payload={"vendor_name": "Starbucks"})
    store.upsert_receipt(2, user_id=10, text="ค่าเกม Steam Elden Ring game",
                         payload={"vendor_name": "Steam"})
    store.upsert_receipt(3, user_id=99, text="กาแฟ coffee Amazon",
                         payload={"vendor_name": "Amazon Cafe"})

    hits = store.search("coffee กาแฟ", user_id=10, top_k=5)
    assert hits, "expected at least one hit"
    ids = {h["receipt_id"] for h in hits}
    assert 3 not in ids  # user 99's receipt must never leak to user 10
    assert hits[0]["receipt_id"] == 1  # the coffee receipt ranks first


def test_delete_removes_from_index(store):
    store.upsert_receipt(1, user_id=10, text="Netflix subscription",
                         payload={"vendor_name": "Netflix"})
    assert store.search("Netflix", user_id=10)
    store.delete_receipt(1)
    assert store.search("Netflix", user_id=10) == []
