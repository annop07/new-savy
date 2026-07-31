"""The financial-advisor agent + the RAG question-answerer.

`run_advisor` is a classic tool-calling loop: the LLM decides which data tools
to pull (spending summary, budget status, semantic receipt search), then writes
advice grounded in what it found. `answer_question` is a lighter RAG path for
one-shot questions over the receipt history.
"""
from __future__ import annotations

import json

from ...config import settings
from .client import TokenUsage, raw_client
from .tools import TOOL_SPECS, AdvisorTools

ADVISOR_SYSTEM = (
    "You are Savy, a friendly and practical personal-finance advisor for a Thai user. "
    "Answer in Thai. Use the tools to look up the user's REAL spending and budgets — "
    "never guess numbers. Typical flow: call get_today, then get_spending_summary "
    "and/or get_budget_status, use search_receipts for fuzzy questions. "
    "Then give a concise, specific answer: point out overspending vs budget, notable "
    "categories or vendors, and 1-3 concrete, actionable suggestions. Use ฿ and real "
    "figures from the tools. If there is no data, say so plainly."
)


def _tool_call_payload(choice) -> dict:
    return {
        "role": "assistant",
        "content": choice.content,
        "tool_calls": [
            {
                "id": tc.id,
                "type": "function",
                "function": {"name": tc.function.name, "arguments": tc.function.arguments},
            }
            for tc in choice.tool_calls
        ],
    }


def run_advisor(db, user_id: int, question: str | None = None, model: str | None = None) -> dict:
    client = raw_client()
    active_model = model or settings.LLM_MODEL
    tools = AdvisorTools(db, user_id)

    user_msg = question or (
        "ช่วยรีวิวการใช้จ่ายของฉันในเดือนนี้ เทียบกับงบประมาณ "
        "แล้วให้คำแนะนำการวางแผนงบสั้นๆ"
    )
    messages: list[dict] = [
        {"role": "system", "content": ADVISOR_SYSTEM},
        {"role": "user", "content": user_msg},
    ]

    trace: list[dict] = []
    usage = TokenUsage()

    for iteration in range(1, settings.MAX_TOOL_ITERATIONS + 1):
        response = client.chat.completions.create(
            model=active_model,
            messages=messages,
            tools=TOOL_SPECS,
            tool_choice="auto",
        )
        usage.add(response)
        choice = response.choices[0].message

        if not choice.tool_calls:
            return {
                "answer": choice.content or "",
                "tool_calls": trace,
                "iterations": iteration,
                "model": active_model,
                "usage": usage.as_dict(),
            }

        messages.append(_tool_call_payload(choice))
        for tc in choice.tool_calls:
            try:
                args = json.loads(tc.function.arguments or "{}")
            except json.JSONDecodeError:
                args = {}
            result = tools.dispatch(tc.function.name, args)
            trace.append({"tool": tc.function.name, "arguments": args, "result": result})
            messages.append(
                {
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "content": json.dumps(result, ensure_ascii=False, default=str),
                }
            )

    # Iteration cap → force a final answer with what we have.
    final = client.chat.completions.create(
        model=active_model,
        messages=messages
        + [{"role": "user", "content": "พอแล้ว สรุปคำแนะนำจากข้อมูลที่มีตอนนี้เลย"}],
    )
    usage.add(final)
    return {
        "answer": final.choices[0].message.content or "",
        "tool_calls": trace,
        "iterations": settings.MAX_TOOL_ITERATIONS,
        "model": active_model,
        "usage": usage.as_dict(),
    }


def answer_question(db, user_id: int, question: str, top_k: int = 6, model: str | None = None) -> dict:
    """RAG: retrieve the most relevant receipts, then answer grounded in them."""
    from .tools import AdvisorTools

    client = raw_client()
    active_model = model or settings.LLM_MODEL
    tools = AdvisorTools(db, user_id)

    hits = tools.search_receipts(question, top_k=top_k)["results"]
    summary = tools.get_spending_summary(days=30)

    context = {
        "matched_receipts": hits,
        "last_30_days_summary": summary,
    }
    usage = TokenUsage()
    response = client.chat.completions.create(
        model=active_model,
        messages=[
            {
                "role": "system",
                "content": (
                    "You answer questions about the user's spending using ONLY the JSON "
                    "context provided (matched receipts from vector search + a 30-day "
                    "summary). Answer in Thai, cite real ฿ figures, and if the context "
                    "doesn't contain the answer, say you don't have enough data."
                ),
            },
            {
                "role": "user",
                "content": f"คำถาม: {question}\n\nCONTEXT:\n{json.dumps(context, ensure_ascii=False, default=str)}",
            },
        ],
    )
    usage.add(response)

    sources = [
        {
            "id": h.get("receipt_id"),
            "vendor_name": h.get("vendor_name"),
            "amount": h.get("amount"),
            "receipt_date": h.get("receipt_date"),
            "category": h.get("category"),
            "score": h.get("score", 0.0),
        }
        for h in hits
    ]
    return {
        "answer": response.choices[0].message.content or "",
        "sources": sources,
        "model": active_model,
        "usage": usage.as_dict(),
    }
