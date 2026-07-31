"""Tools the financial-advisor agent can call.

Each tool is a real query against the user's data (SQL summaries + vector
search). The agent decides which to call and when — that's what makes it an
agent rather than a fixed report. Tools are bound to (db, user_id) per request
so a user can never read another user's spending.
"""
from __future__ import annotations

from datetime import date, datetime, timedelta

from sqlalchemy import func

from ...models.budget import Budget
from ...models.category import Category
from ...models.receipt import Receipt
from .vectorstore import get_vector_store


def _month_bounds(year: int, month: int) -> tuple[date, date]:
    start = date(year, month, 1)
    end = date(year + 1, 1, 1) if month == 12 else date(year, month + 1, 1)
    return start, end


class AdvisorTools:
    def __init__(self, db, user_id: int) -> None:
        self.db = db
        self.user_id = user_id

    # ── tools ─────────────────────────────────────────────────────────────
    def get_today(self) -> dict:
        today = datetime.now().date()
        return {
            "date": today.isoformat(),
            "year": today.year,
            "month": today.month,
            "buddhist_year": today.year + 543,
        }

    def get_spending_summary(self, days: int = 30) -> dict:
        since = datetime.now() - timedelta(days=days)
        base = self.db.query(Receipt).filter(
            Receipt.user_id == self.user_id, Receipt.receipt_date >= since
        )
        total = base.with_entities(func.coalesce(func.sum(Receipt.amount), 0.0)).scalar()
        count = base.count()

        by_cat = (
            self.db.query(
                Category.name,
                func.sum(Receipt.amount),
                func.count(Receipt.id),
            )
            .outerjoin(Category, Receipt.category_id == Category.id)
            .filter(Receipt.user_id == self.user_id, Receipt.receipt_date >= since)
            .group_by(Category.name)
            .order_by(func.sum(Receipt.amount).desc())
            .all()
        )
        top_vendors = (
            self.db.query(Receipt.vendor_name, func.sum(Receipt.amount))
            .filter(Receipt.user_id == self.user_id, Receipt.receipt_date >= since)
            .group_by(Receipt.vendor_name)
            .order_by(func.sum(Receipt.amount).desc())
            .limit(5)
            .all()
        )
        return {
            "period_days": days,
            "total_spent": round(total or 0, 2),
            "receipt_count": count,
            "by_category": [
                {"category": c or "ไม่ระบุ", "total": round(t or 0, 2), "count": n}
                for c, t, n in by_cat
            ],
            "top_vendors": [
                {"vendor": v or "ไม่ระบุ", "total": round(t or 0, 2)} for v, t in top_vendors
            ],
        }

    def get_monthly_breakdown(self, month: int, year: int) -> dict:
        start, end = _month_bounds(year, month)
        rows = (
            self.db.query(
                Category.name, func.sum(Receipt.amount), func.count(Receipt.id)
            )
            .outerjoin(Category, Receipt.category_id == Category.id)
            .filter(
                Receipt.user_id == self.user_id,
                Receipt.receipt_date >= start,
                Receipt.receipt_date < end,
            )
            .group_by(Category.name)
            .order_by(func.sum(Receipt.amount).desc())
            .all()
        )
        total = sum((t or 0) for _, t, _ in rows)
        return {
            "month": month,
            "year": year,
            "total": round(total, 2),
            "by_category": [
                {"category": c or "ไม่ระบุ", "total": round(t or 0, 2), "count": n}
                for c, t, n in rows
            ],
        }

    def get_budget_status(self, month: int | None = None, year: int | None = None) -> dict:
        today = datetime.now().date()
        month = month or today.month
        year = year or today.year
        start, end = _month_bounds(year, month)

        budgets = (
            self.db.query(Budget, Category.name)
            .join(Category, Budget.category_id == Category.id)
            .filter(
                Budget.user_id == self.user_id,
                Budget.month == month,
                Budget.year == year,
            )
            .all()
        )
        out = []
        for budget, cat_name in budgets:
            spent = (
                self.db.query(func.coalesce(func.sum(Receipt.amount), 0.0))
                .filter(
                    Receipt.user_id == self.user_id,
                    Receipt.category_id == budget.category_id,
                    Receipt.receipt_date >= start,
                    Receipt.receipt_date < end,
                )
                .scalar()
            ) or 0.0
            pct = round(spent / budget.amount * 100, 1) if budget.amount else 0.0
            out.append(
                {
                    "category": cat_name,
                    "budget": round(budget.amount, 2),
                    "spent": round(spent, 2),
                    "remaining": round(budget.amount - spent, 2),
                    "percentage": pct,
                    "over_budget": spent > budget.amount,
                }
            )
        return {"month": month, "year": year, "budgets": out}

    def search_receipts(self, query: str, top_k: int = 5) -> dict:
        hits = get_vector_store().search(query, user_id=self.user_id, top_k=top_k)
        return {"query": query, "results": hits}

    # ── dispatch ──────────────────────────────────────────────────────────
    def dispatch(self, name: str, args: dict) -> dict:
        fn = getattr(self, name, None)
        if fn is None or name.startswith("_") or name == "dispatch":
            return {"error": "unknown_tool", "tool": name}
        try:
            return fn(**(args or {}))
        except Exception as exc:  # noqa: BLE001
            return {"error": "tool_failed", "detail": str(exc)}


# OpenAI function-calling specs the LLM sees.
TOOL_SPECS: list[dict] = [
    {
        "type": "function",
        "function": {
            "name": "get_today",
            "description": "Get today's date (Gregorian + Buddhist year). Call this first to reason about 'this month' / 'this week'.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_spending_summary",
            "description": "Total spending, category breakdown, and top vendors over the last N days.",
            "parameters": {
                "type": "object",
                "properties": {
                    "days": {"type": "integer", "description": "Look-back window in days", "default": 30}
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_monthly_breakdown",
            "description": "Spending grouped by category for a specific calendar month.",
            "parameters": {
                "type": "object",
                "properties": {
                    "month": {"type": "integer", "minimum": 1, "maximum": 12},
                    "year": {"type": "integer", "description": "Gregorian year, e.g. 2025"},
                },
                "required": ["month", "year"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_budget_status",
            "description": "Compare budget vs actual spending per category for a month. Defaults to the current month.",
            "parameters": {
                "type": "object",
                "properties": {
                    "month": {"type": "integer", "minimum": 1, "maximum": 12},
                    "year": {"type": "integer"},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "search_receipts",
            "description": "Semantic search over the user's receipts (vector RAG). Use for fuzzy questions like 'ค่ากาแฟ' or 'ค่าเดินทางไปกรุงเทพ'.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "top_k": {"type": "integer", "default": 5},
                },
                "required": ["query"],
            },
        },
    },
]
