"""Test fixtures: an in-memory SQLite DB seeded with categories and (optionally)
sample receipts. No network / API key required."""
from datetime import datetime, timedelta

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base
from app.models.budget import Budget
from app.models.category import Category
from app.models.receipt import Receipt
from app.models.user import User

CATEGORIES = ["ช้อปปิ้ง", "ความบันเทิง", "ธนาคาร", "อื่นๆ"]


@pytest.fixture
def db():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    for name in CATEGORIES:
        session.add(Category(name=name, is_default=True))
    session.commit()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def seeded_db(db):
    """db + one user, six receipts, and a tight entertainment budget."""
    user = User(username="u", email="u@example.com", password_hash="x")
    db.add(user)
    db.commit()
    db.refresh(user)

    cats = {c.name: c.id for c in db.query(Category).all()}
    now = datetime.now()
    rows = [
        ("Starbucks", "ช้อปปิ้ง", 230.0, 2),
        ("Steam", "ความบันเทิง", 899.0, 5),
        ("Netflix", "ความบันเทิง", 419.0, 7),
        ("Lotus's", "ช้อปปิ้ง", 1250.0, 9),
        ("Grab", "อื่นๆ", 180.0, 3),
        ("K PLUS", "ธนาคาร", 3000.0, 12),
    ]
    for vendor, cat, amount, days_ago in rows:
        db.add(
            Receipt(
                user_id=user.id,
                vendor_name=vendor,
                category_id=cats[cat],
                receipt_date=now - timedelta(days=days_ago),
                amount=amount,
                currency="THB",
            )
        )
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
    return db, user.id
