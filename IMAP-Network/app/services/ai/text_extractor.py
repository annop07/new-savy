"""Text-based receipt extraction from email bodies.

The AI upgrade of the old regex ReceiptExtractor: instead of hand-written
patterns per vendor, the LLM reads the raw email text and returns the same
ExtractedReceipt schema — so a never-seen-before sender still parses.
"""
from __future__ import annotations

from ...config import settings
from .client import TokenUsage, instructor_client
from .schemas import ExtractedReceipt

TEXT_SYSTEM = (
    "You extract structured receipt data from the raw text of a purchase/receipt "
    "email (Apple, Steam, banks, shops, subscriptions). Return the grand total as "
    "a plain number, an ISO date (convert Buddhist year พ.ศ. to Gregorian by "
    "subtracting 543), the vendor, a concise Thai category_hint, and any line items. "
    "If the email is clearly NOT a receipt/payment, set amount to 0 and confidence low. "
    "Never invent values that aren't in the text."
)


def extract_from_email(
    subject: str,
    sender: str,
    body: str,
    model: str | None = None,
) -> tuple[ExtractedReceipt, TokenUsage, str]:
    """Read an email → validated ExtractedReceipt (+ token cost)."""
    client = instructor_client()
    active_model = model or settings.LLM_MODEL

    content = (
        f"From: {sender}\n"
        f"Subject: {subject}\n"
        f"---\n"
        f"{body[:6000]}"  # keep prompt bounded
    )

    usage = TokenUsage()
    receipt, completion = client.chat.completions.create_with_completion(
        model=active_model,
        response_model=ExtractedReceipt,
        max_retries=2,
        messages=[
            {"role": "system", "content": TEXT_SYSTEM},
            {"role": "user", "content": content},
        ],
    )
    usage.add(completion)
    return receipt, usage, active_model
