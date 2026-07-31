"""Turn Receipt rows into embeddable text and keep the vector store in sync."""
from __future__ import annotations

import logging

from .vectorstore import get_vector_store

logger = logging.getLogger(__name__)


def receipt_to_text(receipt, category_name: str | None = None) -> str:
    """A compact natural-language line describing a receipt (what we embed)."""
    parts = []
    if receipt.receipt_date:
        parts.append(receipt.receipt_date.strftime("%Y-%m-%d"))
    if receipt.vendor_name:
        parts.append(f"ร้าน/ผู้รับ: {receipt.vendor_name}")
    if category_name:
        parts.append(f"หมวด: {category_name}")
    parts.append(f"จำนวนเงิน: {receipt.amount:.2f} {receipt.currency or 'THB'}")
    if receipt.payment_method:
        parts.append(f"ชำระโดย: {receipt.payment_method}")
    if receipt.notes:
        parts.append(str(receipt.notes))
    return " | ".join(parts)


def index_receipt(receipt, category_name: str | None = None) -> None:
    """Upsert one receipt into the vector store. Best-effort (never blocks CRUD)."""
    try:
        store = get_vector_store()
        text = receipt_to_text(receipt, category_name)
        store.upsert_receipt(
            receipt_id=receipt.id,
            user_id=receipt.user_id,
            text=text,
            payload={
                "vendor_name": receipt.vendor_name,
                "amount": receipt.amount,
                "currency": receipt.currency,
                "category": category_name,
                "receipt_date": (
                    receipt.receipt_date.strftime("%Y-%m-%d")
                    if receipt.receipt_date
                    else None
                ),
            },
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("index_receipt failed for id=%s: %s", getattr(receipt, "id", "?"), exc)


def deindex_receipt(receipt_id: int) -> None:
    try:
        get_vector_store().delete_receipt(receipt_id)
    except Exception as exc:  # noqa: BLE001
        logger.warning("deindex_receipt failed for id=%s: %s", receipt_id, exc)
