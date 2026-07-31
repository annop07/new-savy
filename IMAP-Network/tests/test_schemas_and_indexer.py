"""Extraction schema contract + the text we embed for each receipt."""
from datetime import date, datetime
from types import SimpleNamespace

import pytest
from pydantic import ValidationError

from app.services.ai.indexer import receipt_to_text
from app.services.ai.schemas import ExtractedReceipt


def test_extracted_receipt_defaults():
    r = ExtractedReceipt(amount=99.5)
    assert r.currency == "THB"
    assert r.items == []
    assert r.confidence == 0.0


def test_extracted_receipt_amount_required():
    with pytest.raises(ValidationError):
        ExtractedReceipt(vendor_name="X")  # amount missing


def test_confidence_bounds():
    with pytest.raises(ValidationError):
        ExtractedReceipt(amount=1, confidence=1.5)


def test_receipt_to_text_includes_key_fields():
    r = SimpleNamespace(
        receipt_date=datetime(2025, 7, 15),
        vendor_name="Starbucks",
        amount=230.0,
        currency="THB",
        payment_method="Credit Card",
        notes="ลาเต้",
    )
    text = receipt_to_text(r, category_name="อาหาร")
    assert "Starbucks" in text
    assert "หมวด: อาหาร" in text
    assert "230.00 THB" in text
    assert "2025-07-15" in text
