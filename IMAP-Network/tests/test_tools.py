"""Agent data tools compute correct spending summaries (no LLM involved)."""
from datetime import datetime

from app.services.ai.tools import AdvisorTools


def test_spending_summary_totals(seeded_db):
    db, user_id = seeded_db
    summary = AdvisorTools(db, user_id).get_spending_summary(days=30)
    # 230 + 899 + 419 + 1250 + 180 + 3000
    assert summary["total_spent"] == 5978.0
    assert summary["receipt_count"] == 6
    ent = next(c for c in summary["by_category"] if c["category"] == "ความบันเทิง")
    assert ent["total"] == 1318.0  # Steam + Netflix


def test_budget_status_flags_overspend(seeded_db):
    db, user_id = seeded_db
    now = datetime.now()
    status = AdvisorTools(db, user_id).get_budget_status(now.month, now.year)
    ent = next(b for b in status["budgets"] if b["category"] == "ความบันเทิง")
    assert ent["budget"] == 800.0
    assert ent["spent"] == 1318.0
    assert ent["over_budget"] is True
    assert ent["remaining"] == -518.0


def test_monthly_breakdown_isolates_other_months(seeded_db):
    db, user_id = seeded_db
    now = datetime.now()
    # A month with no seeded receipts must return zero (proves date scoping works).
    other_month = 1 if now.month != 1 else 2
    result = AdvisorTools(db, user_id).get_monthly_breakdown(other_month, now.year - 1)
    assert result["total"] == 0
    assert result["by_category"] == []


def test_unknown_tool_returns_error(seeded_db):
    db, user_id = seeded_db
    out = AdvisorTools(db, user_id).dispatch("drop_tables", {})
    assert out["error"] == "unknown_tool"
