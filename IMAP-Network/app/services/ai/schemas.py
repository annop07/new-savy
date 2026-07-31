"""Pydantic schemas for the AI layer.

These are the *contracts* the LLM must satisfy (extraction) and the shapes the
AI endpoints return. Kept separate from app/schemas (the DB/CRUD schemas).
"""
from __future__ import annotations

from datetime import date
from typing import List, Optional

from pydantic import BaseModel, Field


# ── LLM extraction contract ───────────────────────────────────────────────
class ExtractedItem(BaseModel):
    name: str = Field(..., description="Line-item / product name")
    quantity: float = Field(1, description="Quantity, default 1")
    unit_price: Optional[float] = Field(None, description="Price per unit")
    total: Optional[float] = Field(None, description="Line total = quantity * unit_price")


class ExtractedReceipt(BaseModel):
    """What the vision/text model must return for any slip or receipt."""

    vendor_name: Optional[str] = Field(
        None, description="Merchant, store, or (for a bank transfer slip) the receiver/payee"
    )
    receipt_date: Optional[date] = Field(
        None,
        description=(
            "Transaction date as ISO YYYY-MM-DD. Thai slips often use the Buddhist "
            "calendar (พ.ศ.); convert to Gregorian by subtracting 543 from the year."
        ),
    )
    amount: float = Field(
        ..., description="Grand total actually paid, as a plain number (no ฿/$/commas)"
    )
    currency: str = Field("THB", description="ISO currency code, e.g. THB, USD")
    receipt_number: Optional[str] = Field(
        None, description="Receipt / invoice / transaction reference id"
    )
    payment_method: Optional[str] = Field(
        None, description="e.g. PromptPay, bank transfer, credit card, cash, QR"
    )
    category_hint: Optional[str] = Field(
        None,
        description=(
            "Best-guess spending category in Thai, one of: อาหาร, เดินทาง, ช้อปปิ้ง, "
            "บิล/ค่าบริการ, บันเทิง, สุขภาพ, การศึกษา, อื่นๆ"
        ),
    )
    items: List[ExtractedItem] = Field(
        default_factory=list, description="Line items if the receipt lists them"
    )
    notes: Optional[str] = Field(
        None, description="Anything useful that doesn't fit above (sender name, bank, memo)"
    )
    confidence: float = Field(
        0.0, ge=0, le=1, description="Honest 0-1 confidence that this extraction is correct"
    )


# ── API response shapes ───────────────────────────────────────────────────
class ExtractionResponse(BaseModel):
    receipt: ExtractedReceipt
    model: str
    usage: dict
    saved_receipt_id: Optional[int] = None  # set when ?save=true persisted it


class SourceReceipt(BaseModel):
    id: Optional[int] = None
    vendor_name: Optional[str] = None
    amount: Optional[float] = None
    receipt_date: Optional[str] = None
    category: Optional[str] = None
    score: float = 0.0


class AskRequest(BaseModel):
    question: str
    top_k: int = 6


class AskResponse(BaseModel):
    answer: str
    sources: List[SourceReceipt]
    model: str
    usage: dict


class AdvisorRequest(BaseModel):
    question: Optional[str] = Field(
        None,
        description="Optional focus, e.g. 'ช่วยดูงบเดือนนี้'. If omitted, do a full review.",
    )


class AdvisorResponse(BaseModel):
    answer: str
    tool_calls: list
    iterations: int
    model: str
    usage: dict
