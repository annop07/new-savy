"""The hybrid email extractor: LLM first, regex fallback, no network needed."""
from datetime import date, datetime

import pytest

from app.config import settings
from app.services.ai import email_pipeline
from app.services.ai.client import TokenUsage
from app.services.ai.schemas import ExtractedItem, ExtractedReceipt
from app.services.category_service import resolve_category_from_hint

STEAM_EMAIL = {
    "message_id": "abc123",
    "subject": "Steam Receipt",
    "from": "noreply@steampowered.com",
    "date": datetime(2025, 1, 23, 10, 0),
    "body": "รวมทั้งหมด: ฿34.00\nใบกำกับสินค้า: 55512345",
    "attachments": [],
}

LAZADA_EMAIL = {
    "message_id": "xyz789",
    "subject": "ขอบคุณที่สั่งซื้อ",
    "from": "no-reply@lazada.co.th",
    "date": datetime(2025, 7, 20, 9, 0),
    "body": "คำสั่งซื้อ #480021559\nเสื้อยืด x2 390 บาท\nค่าส่ง 40 บาท\nยอดรวมทั้งสิ้น 430 บาท",
    "attachments": [],
}


def _fake_llm(receipt: ExtractedReceipt):
    def _call(subject, sender, body, model=None):
        return receipt, TokenUsage(), "fake-model"

    return _call


@pytest.fixture
def llm_on(monkeypatch):
    monkeypatch.setattr(settings, "OPENAI_API_KEY", "test-key")


def test_llm_result_is_used_when_available(monkeypatch, llm_on):
    monkeypatch.setattr(
        email_pipeline,
        "extract_from_email",
        _fake_llm(
            ExtractedReceipt(
                vendor_name="Lazada",
                receipt_date=date(2025, 7, 20),
                amount=430.0,
                currency="THB",
                receipt_number="480021559",
                payment_method="TrueMoney",
                category_hint="ช้อปปิ้ง",
                items=[ExtractedItem(name="เสื้อยืด", quantity=2, unit_price=195, total=390)],
                confidence=0.95,
            )
        ),
    )

    out = email_pipeline.extract_receipt_from_email(LAZADA_EMAIL)
    # The grand total, not the first number (390) or the order id.
    assert out["amount"] == 430.0
    assert out["vendor_name"] == "Lazada"
    assert out["payment_method"] == "TrueMoney"
    assert out["category_hint"] == "ช้อปปิ้ง"
    assert out["extracted_by"].startswith("llm")
    assert isinstance(out["receipt_date"], datetime)  # DB column needs a datetime
    assert "เสื้อยืด" in out["notes"]
    assert out["email_id"] == "imap_xyz789"


def test_falls_back_to_regex_when_llm_raises(monkeypatch, llm_on):
    def boom(**kwargs):
        raise RuntimeError("LLM down")

    monkeypatch.setattr(email_pipeline, "extract_from_email", boom)

    out = email_pipeline.extract_receipt_from_email(STEAM_EMAIL)
    assert out["extracted_by"] == "regex"
    assert out["amount"] == 34.0  # regex still handles the vendors it knows


def test_low_confidence_falls_back(monkeypatch, llm_on):
    monkeypatch.setattr(
        email_pipeline,
        "extract_from_email",
        _fake_llm(ExtractedReceipt(vendor_name="???", amount=999.0, confidence=0.1)),
    )
    out = email_pipeline.extract_receipt_from_email(STEAM_EMAIL)
    assert out["extracted_by"] == "regex"
    assert out["amount"] == 34.0


def test_non_receipt_email_returns_none(monkeypatch, llm_on):
    # amount=0 is how the prompt tells the model to flag "not a receipt".
    monkeypatch.setattr(
        email_pipeline,
        "extract_from_email",
        _fake_llm(ExtractedReceipt(amount=0, confidence=0.9)),
    )
    newsletter = {**STEAM_EMAIL, "body": "ข่าวสารประจำสัปดาห์ ไม่มียอดเงิน"}
    assert email_pipeline.extract_receipt_from_email(newsletter) is None


def test_regex_only_when_llm_disabled(monkeypatch, llm_on):
    def should_not_run(**kwargs):
        raise AssertionError("LLM must not be called when use_llm=False")

    monkeypatch.setattr(email_pipeline, "extract_from_email", should_not_run)
    out = email_pipeline.extract_receipt_from_email(STEAM_EMAIL, use_llm=False)
    assert out["extracted_by"] == "regex"


def test_category_hint_resolution(db):
    cid, name = resolve_category_from_hint("ช้อปปิ้ง", db)
    assert name == "ช้อปปิ้ง"

    # Loose match: "บันเทิง" should find "ความบันเทิง"
    _, loose = resolve_category_from_hint("บันเทิง", db)
    assert loose == "ความบันเทิง"

    # Unknown hint falls back to "อื่นๆ"
    _, fallback = resolve_category_from_hint("ยานอวกาศ", db)
    assert fallback == "อื่นๆ"
