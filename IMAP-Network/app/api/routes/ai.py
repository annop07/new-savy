"""AI endpoints: vision extraction, RAG Q&A, and the agentic advisor."""
from __future__ import annotations

from datetime import datetime, time

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from ...config import settings
from ...database import get_db
from ...models.receipt import Receipt
from ...models.user import User
from ...services.category_service import resolve_category_from_hint
from ...services.ai.agent import answer_question, run_advisor
from ...services.ai.indexer import index_receipt
from ...services.ai.schemas import (
    AdvisorRequest,
    AdvisorResponse,
    AskRequest,
    AskResponse,
    ExtractedReceipt,
    ExtractionResponse,
)
from ...services.ai.vectorstore import get_vector_store
from ...services.ai.vision_extractor import extract_from_image
from ...services.auth_service import get_current_user

router = APIRouter(prefix="/ai", tags=["ai"])


def _guard_llm() -> None:
    if not settings.llm_configured:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="LLM not configured: set OPENAI_API_KEY in .env",
        )


@router.get("/health")
def ai_health() -> dict:
    return {
        "llm_configured": settings.llm_configured,
        "llm_model": settings.LLM_MODEL,
        "vision_model": settings.VISION_MODEL,
        "base_url": settings.OPENAI_BASE_URL,
        "vectors_indexed": get_vector_store().count(),
    }


@router.post("/extract-image", response_model=ExtractionResponse)
async def extract_image(
    file: UploadFile = File(...),
    save: bool = Query(False, description="Persist the extracted receipt to the DB"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a slip/receipt image → structured receipt. ?save=true also stores it."""
    _guard_llm()
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please upload an image file (png/jpg/webp).",
        )
    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Empty file.")

    try:
        receipt, usage, model = extract_from_image(image_bytes, file.content_type)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Vision extraction failed: {exc}",
        )

    saved_id = None
    if save:
        saved_id = _persist_extracted(db, current_user.id, receipt)

    return ExtractionResponse(
        receipt=receipt, model=model, usage=usage.as_dict(), saved_receipt_id=saved_id
    )


def _persist_extracted(db: Session, user_id: int, receipt: ExtractedReceipt) -> int:
    category_id, category_name = resolve_category_from_hint(receipt.category_hint, db)
    receipt_dt = (
        datetime.combine(receipt.receipt_date, time.min)
        if receipt.receipt_date
        else datetime.now()
    )
    notes_bits = []
    if receipt.category_hint:
        notes_bits.append(f"หมวด(AI): {receipt.category_hint}")
    if receipt.notes:
        notes_bits.append(receipt.notes)
    if receipt.confidence:
        notes_bits.append(f"confidence={receipt.confidence:.2f}")

    db_receipt = Receipt(
        user_id=user_id,
        vendor_name=receipt.vendor_name,
        category_id=category_id,
        receipt_date=receipt_dt,
        amount=receipt.amount,
        currency=receipt.currency or "THB",
        receipt_number=receipt.receipt_number,
        payment_method=receipt.payment_method,
        notes=" | ".join(notes_bits) or None,
    )
    db.add(db_receipt)
    db.commit()
    db.refresh(db_receipt)
    index_receipt(db_receipt, category_name)
    return db_receipt.id


@router.post("/ask", response_model=AskResponse)
def ask(
    body: AskRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Semantic Q&A over your spending history (RAG)."""
    _guard_llm()
    try:
        result = answer_question(db, current_user.id, body.question, top_k=body.top_k)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, f"Ask failed: {exc}")
    return AskResponse(**result)


@router.post("/advisor", response_model=AdvisorResponse)
def advisor(
    body: AdvisorRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Agentic financial advisor: pulls your real data via tools, then advises."""
    _guard_llm()
    try:
        result = run_advisor(db, current_user.id, body.question)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, f"Advisor failed: {exc}")
    return AdvisorResponse(**result)
