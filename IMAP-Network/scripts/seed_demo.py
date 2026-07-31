"""Seed a demo user + sample spending, then index it for RAG.

Run:  python -m scripts.seed_demo

Then log in as  demo@savy.app / demo1234  (POST /api/v1/token) and try the
AI endpoints: /api/v1/ai/ask and /api/v1/ai/advisor.
"""
from datetime import datetime, timedelta

from app.database import Base, SessionLocal, engine
from app.models.budget import Budget
from app.models.category import Category
from app.models.receipt import Receipt
from app.models.user import User
from app.services.ai.indexer import index_receipt
from app.services.auth_service import get_password_hash
from app.services.init_data import create_initial_categories, update_categories


def _bootstrap() -> None:
    """Ensure tables + default categories exist (so seeding works on a fresh DB)."""
    Base.metadata.create_all(bind=engine)
    s = SessionLocal()
    try:
        create_initial_categories(s)
        update_categories(s)
    finally:
        s.close()

DEMO_EMAIL = "demo@savy.app"
DEMO_PASSWORD = "demo1234"

SEED = [
    # vendor, category, amount, days_ago, payment, note
    ("Starbucks", "ช้อปปิ้ง", 230.0, 2, "Credit Card", "กาแฟลาเต้กับครัวซองต์"),
    ("Steam", "ความบันเทิง", 899.0, 5, "PromptPay", "ซื้อเกม Elden Ring"),
    ("Netflix", "ความบันเทิง", 419.0, 7, "Credit Card", "ค่าสมาชิกรายเดือน"),
    ("Lotus's", "ช้อปปิ้ง", 1250.0, 9, "Cash", "ของใช้ในบ้าน"),
    ("Grab", "อื่นๆ", 180.0, 3, "PromptPay", "ค่าเดินทางไปมหาวิทยาลัย"),
    ("K PLUS transfer", "ธนาคาร", 3000.0, 12, "bank transfer", "โอนเงินให้แม่"),
]


def main() -> None:
    _bootstrap()
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == DEMO_EMAIL).first()
        if not user:
            user = User(
                username="demo",
                email=DEMO_EMAIL,
                password_hash=get_password_hash(DEMO_PASSWORD),
                full_name="Savy Demo",
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"created demo user id={user.id}")
        else:
            # fresh start: drop old demo receipts
            db.query(Receipt).filter(Receipt.user_id == user.id).delete()
            db.query(Budget).filter(Budget.user_id == user.id).delete()
            db.commit()
            print(f"reusing demo user id={user.id} (cleared old receipts)")

        cats = {c.name: c.id for c in db.query(Category).all()}
        now = datetime.now()

        for vendor, cat, amount, days_ago, pay, note in SEED:
            r = Receipt(
                user_id=user.id,
                vendor_name=vendor,
                category_id=cats.get(cat),
                receipt_date=now - timedelta(days=days_ago),
                amount=amount,
                currency="THB",
                payment_method=pay,
                notes=note,
            )
            db.add(r)
            db.commit()
            db.refresh(r)
            index_receipt(r, cat)

        # a tight entertainment budget so the advisor has something to flag
        db.add(
            Budget(
                user_id=user.id,
                category_id=cats["ความบันเทิง"],
                amount=800.0,
                month=now.month,
                year=now.year,
            )
        )
        db.commit()

        print(f"seeded {len(SEED)} receipts + 1 budget")
        print(f"login:  {DEMO_EMAIL} / {DEMO_PASSWORD}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
