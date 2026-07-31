"""Hybrid receipt extraction from emails.

The original Savy parsed receipt emails with hand-written regex, one branch per
vendor (Apple / K PLUS / Steam). That breaks on every sender it wasn't taught.

This pipeline tries the **LLM** first — it reads the email the way a human would,
so a never-seen-before sender (Lazada, Shopee, Grab, a restaurant...) still parses,
and it picks the real grand total instead of the first number it happens to match.
The regex extractor stays as a **fallback** for when the LLM is unavailable
(no API key, network error, quota) so email sync never hard-fails.
"""
from __future__ import annotations

import logging
from datetime import datetime, time
from typing import Any, Optional

from ...config import settings
from ..receipt_extractor import ReceiptExtractor
from .text_extractor import extract_from_email

logger = logging.getLogger(__name__)

# Below this, we don't trust the LLM's reading enough to store it.
MIN_CONFIDENCE = 0.35


def _to_datetime(value: Any) -> Optional[datetime]:
    """Normalise a date/datetime into a datetime (the Receipt column type)."""
    if value is None:
        return None
    if isinstance(value, datetime):
        return value
    try:
        return datetime.combine(value, time.min)
    except TypeError:
        return None


def _from_llm(email_data: dict) -> Optional[dict]:
    receipt, usage, model = extract_from_email(
        subject=email_data.get("subject") or "",
        sender=email_data.get("from") or "",
        body=email_data.get("body") or "",
    )

    # The prompt tells the model to return amount=0 for non-receipt emails.
    if not receipt.amount or receipt.amount <= 0:
        return None
    if receipt.confidence and receipt.confidence < MIN_CONFIDENCE:
        logger.info(
            "LLM confidence %.2f too low for '%s' — falling back",
            receipt.confidence,
            email_data.get("subject"),
        )
        return None

    notes_bits = []
    if receipt.items:
        notes_bits.append(
            ", ".join(f"{i.quantity:g}× {i.name}" for i in receipt.items[:5])
        )
    if receipt.notes:
        notes_bits.append(receipt.notes)

    attachments = email_data.get("attachments") or []
    return {
        "email_id": f"imap_{email_data['message_id']}",
        "email_subject": email_data.get("subject"),
        "email_from": email_data.get("from"),
        "email_date": email_data.get("date"),
        "vendor_name": receipt.vendor_name,
        "receipt_date": _to_datetime(receipt.receipt_date) or email_data.get("date"),
        "amount": float(receipt.amount),
        "currency": receipt.currency or "THB",
        "receipt_number": receipt.receipt_number,
        "payment_method": receipt.payment_method,
        "notes": " | ".join(notes_bits) or None,
        "category_hint": receipt.category_hint,
        "receipt_file_path": attachments[0]["filename"] if attachments else None,
        "confidence": receipt.confidence,
        "extracted_by": f"llm:{model}",
        "usage": usage.as_dict(),
    }


def _from_regex(email_data: dict) -> Optional[dict]:
    result = ReceiptExtractor.extract_receipt_info(email_data)
    if not result or not result.get("amount"):
        return None
    result.setdefault("currency", "THB")
    result.setdefault("receipt_number", result.get("invoice_number"))
    result.setdefault("payment_method", None)
    result.setdefault("notes", None)
    result["category_hint"] = None
    result["confidence"] = None
    result["extracted_by"] = "regex"
    result["usage"] = None
    return result


def extract_receipt_from_email(
    email_data: dict, use_llm: bool = True
) -> Optional[dict]:
    """Extract one receipt from a fetched email, or None if it isn't one.

    LLM first (when configured and enabled), regex as the safety net.
    """
    if not email_data:
        return None

    if use_llm and settings.llm_configured:
        try:
            parsed = _from_llm(email_data)
            if parsed:
                return parsed
        except Exception as exc:  # noqa: BLE001
            logger.warning(
                "LLM extraction failed for '%s' (%s) — falling back to regex",
                email_data.get("subject"),
                exc,
            )

    return _from_regex(email_data)
