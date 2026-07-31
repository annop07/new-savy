from typing import Optional, Tuple
from sqlalchemy.orm import Session
from ..models.category import Category


def resolve_category_from_hint(
    hint: Optional[str], db: Session
) -> Tuple[Optional[int], Optional[str]]:
    """Map a free-text category hint (from the LLM) onto an existing category.

    Matches exactly first, then loosely (substring either way), and finally
    falls back to "อื่นๆ". Returns (category_id, category_name).
    """
    cats = db.query(Category).all()
    if not cats:
        return None, None

    if hint:
        h = hint.strip().lower()
        for c in cats:
            if c.name.lower() == h:
                return c.id, c.name
        for c in cats:
            if c.name.lower() in h or h in c.name.lower():
                return c.id, c.name

    other = next((c for c in cats if c.name == "อื่นๆ"), None)
    return (other.id, other.name) if other else (None, None)


def auto_categorize_vendor(vendor_name: str, db: Session) -> Optional[int]:
    """จัดประเภทอัตโนมัติตามชื่อผู้ให้บริการ"""
    if not vendor_name:
        return None
    
    vendor_lower = vendor_name.lower()
    
    # กำหนดคำสำคัญสำหรับแต่ละหมวดหมู่
    category_keywords = {
        "ช้อปปิ้ง": ["shopee", "lazada", "tiktok shop", "amazon", "ebay", "alibaba", "jd central", "central", "powerbuy"],
        "ความบันเทิง": ["apple", "steam", "netflix", "disney", "spotify", "joox", "youtube", "prime video", "hbo", "game", "entertainment"],
        "ธนาคาร": ["ธนาคาร", "bank", "kasikorn", "kbank", "scb", "bangkok bank", "krungsri", "ธ.ก.ส.", "ออมสิน", "tmb", "ttb", "kiatnakin", "visa", "mastercard"]
    }
    
    # ค้นหาหมวดหมู่ที่ตรงกับคำสำคัญ
    for category_name, keywords in category_keywords.items():
        for keyword in keywords:
            if keyword in vendor_lower:
                # ค้นหา category_id จากชื่อหมวดหมู่
                category = db.query(Category).filter(Category.name == category_name).first()
                if category:
                    return category.id
    
    # ถ้าไม่พบหมวดหมู่ที่ตรงกัน ให้ใช้หมวดหมู่ "อื่นๆ"
    other_category = db.query(Category).filter(Category.name == "อื่นๆ").first()
    if other_category:
        return other_category.id
    
    return None