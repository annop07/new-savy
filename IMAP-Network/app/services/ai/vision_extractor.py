"""Multimodal receipt/slip extraction.

Replaces the old per-vendor regex with a vision LLM that reads the actual
image of a Thai bank slip (PromptPay / K PLUS / SCB), a store receipt, or an
e-commerce invoice, and returns a schema-valid ExtractedReceipt.
"""
from __future__ import annotations

import base64

from ...config import settings
from .client import TokenUsage, instructor_client
from .schemas import ExtractedReceipt

VISION_SYSTEM = (
    "You are an expert at reading Thai and English payment slips and receipts: "
    "bank transfer slips (PromptPay, K PLUS, SCB Easy, KMA), store/POS receipts, "
    "and e-commerce invoices (Apple, Steam, Shopee, Lazada). "
    "Extract the fields precisely.\n"
    "- amount: the GRAND TOTAL actually paid, as a plain number with no currency "
    "symbol and no thousands separators.\n"
    "- receipt_date: Thai slips often show the Buddhist year (พ.ศ., e.g. 2568). "
    "Convert to the Gregorian year by subtracting 543, then return ISO YYYY-MM-DD.\n"
    "- For a bank transfer slip, vendor_name is the RECEIVER/payee; put the sender "
    "and bank in notes.\n"
    "- category_hint: pick a concise Thai category.\n"
    "- If a field is genuinely not present, leave it null. Do not invent values.\n"
    "- Set confidence honestly based on image legibility."
)


def extract_from_image(
    image_bytes: bytes,
    mime_type: str = "image/jpeg",
    model: str | None = None,
) -> tuple[ExtractedReceipt, TokenUsage, str]:
    """Read a receipt/slip image → validated ExtractedReceipt (+ token cost)."""
    client = instructor_client()
    active_model = model or settings.VISION_MODEL

    b64 = base64.b64encode(image_bytes).decode()
    data_url = f"data:{mime_type};base64,{b64}"

    usage = TokenUsage()
    receipt, completion = client.chat.completions.create_with_completion(
        model=active_model,
        response_model=ExtractedReceipt,
        max_retries=2,
        messages=[
            {"role": "system", "content": VISION_SYSTEM},
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Extract this receipt/slip as structured data.",
                    },
                    {"type": "image_url", "image_url": {"url": data_url}},
                ],
            },
        ],
    )
    usage.add(completion)
    return receipt, usage, active_model
