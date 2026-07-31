from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Query
from typing import List, Optional
from ...database import get_db, SessionLocal
from ...models.user import User
from ...models.imap_setting import ImapSetting
from ...models.receipt import Receipt
from ...schemas.imap_setting import ImapSettingCreate, ImapSettingUpdate, ImapSettingResponse
from ...services.auth_service import get_current_user
from ...services.imap_service import IMAPClient
from ...services.encryption_service import encrypt_password
# เพิ่มบรรทัดนี้ในส่วน imports
from ...services.category_service import auto_categorize_vendor, resolve_category_from_hint
from ...services.ai.email_pipeline import extract_receipt_from_email
from ...services.ai.indexer import index_receipt

# ตั้งค่า logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/imap-settings", tags=["imap-settings"])

@router.get("/", response_model=List[ImapSettingResponse])
def get_imap_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """ดึงการตั้งค่า IMAP ทั้งหมดของผู้ใช้"""
    settings = db.query(ImapSetting).filter(
        ImapSetting.user_id == current_user.id
    ).all()
    
    return settings


@router.post("/", response_model=ImapSettingResponse, status_code=status.HTTP_201_CREATED)
def create_imap_setting(
    imap_setting: ImapSettingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # โค้ดเดิมของคุณ...
    """สร้างการตั้งค่า IMAP ใหม่"""
    # ตรวจสอบว่ามีการตั้งค่าสำหรับอีเมลนี้แล้วหรือไม่
    db_imap_setting = db.query(ImapSetting).filter(
        ImapSetting.user_id == current_user.id,
        ImapSetting.email == imap_setting.email
    ).first()
    
    if db_imap_setting:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="มีการตั้งค่า IMAP สำหรับอีเมลนี้แล้ว"
        )
    
    # เข้ารหัสรหัสผ่าน
    encrypted_password = encrypt_password(imap_setting.password)
    
    # สร้างการตั้งค่าใหม่
    db_imap_setting = ImapSetting(
        user_id=current_user.id,
        email=imap_setting.email,
        server=imap_setting.server,
        port=imap_setting.port,
        username=imap_setting.username,
        password_encrypted=encrypted_password,
        use_ssl=imap_setting.use_ssl,
        folder=imap_setting.folder
    )
    
    db.add(db_imap_setting)
    db.commit()
    db.refresh(db_imap_setting)
    
    return db_imap_setting

# เพิ่ม endpoint ต่อไปนี้หลังจากโค้ดเดิมของคุณ

@router.post("/{imap_setting_id}/test", status_code=status.HTTP_200_OK)
def test_imap_connection(
    imap_setting_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """ทดสอบการเชื่อมต่อ IMAP"""
    db_imap_setting = db.query(ImapSetting).filter(
        ImapSetting.id == imap_setting_id,
        ImapSetting.user_id == current_user.id
    ).first()
    
    if not db_imap_setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ไม่พบการตั้งค่า IMAP"
        )
    
    # ทดสอบการเชื่อมต่อ
    imap_client = IMAPClient(db_imap_setting)
    connected = imap_client.connect()
    
    if connected:
        imap_client.disconnect()
        return {"status": "success", "message": "เชื่อมต่อกับเซิร์ฟเวอร์ IMAP สำเร็จ"}
    else:
        return {"status": "error", "message": "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ IMAP ได้"}

@router.post("/{imap_setting_id}/sync", status_code=status.HTTP_202_ACCEPTED)
def sync_emails(
    imap_setting_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    days_back: int = 30,
    limit: int = 50,
    use_llm: bool = Query(
        True,
        description="อ่านอีเมลด้วย LLM (รองรับทุกผู้ให้บริการ); ปิดเพื่อใช้ regex อย่างเดียว",
    ),
):
    """เริ่มซิงค์อีเมลในเบื้องหลัง โดยสามารถระบุจำนวนวันย้อนหลังได้"""
    db_imap_setting = db.query(ImapSetting).filter(
        ImapSetting.id == imap_setting_id,
        ImapSetting.user_id == current_user.id
    ).first()
    
    if not db_imap_setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ไม่พบการตั้งค่า IMAP"
        )
    
    # เพิ่มงานในเบื้องหลังพร้อมส่งพารามิเตอร์เพิ่มเติม
    background_tasks.add_task(
        sync_emails_background, imap_setting_id, current_user.id, days_back, limit, use_llm
    )
    
    # อัปเดตเวลาซิงค์ล่าสุด
    db_imap_setting.last_sync = datetime.now()
    db.commit()
    
    return {"status": "accepted", "message": f"เริ่มซิงค์อีเมลย้อนหลัง {days_back} วัน จำกัด {limit} ฉบับในเบื้องหลังแล้ว"}

def sync_emails_background(
    imap_setting_id: int,
    user_id: int,
    days_back: int = 30,
    limit: int = 50,
    use_llm: bool = True,
):
    """ฟังก์ชันสำหรับทำงานในเบื้องหลัง เพื่อซิงค์อีเมล

    ใบเสร็จถูกอ่านด้วย LLM (fallback เป็น regex) แล้ว index เข้า vector store
    เพื่อให้ค้นหา/วิเคราะห์ด้วย AI ได้เหมือนใบเสร็จที่สแกนจากสลิป
    """
    db_session = SessionLocal()
    
    try:
        # ดึงข้อมูลการตั้งค่า IMAP
        db_imap_setting = db_session.query(ImapSetting).filter(
            ImapSetting.id == imap_setting_id,
            ImapSetting.user_id == user_id
        ).first()
        
        if not db_imap_setting:
            logger.error(f"ไม่พบการตั้งค่า IMAP ID: {imap_setting_id}")
            return
        
        # เชื่อมต่อกับ IMAP
        imap_client = IMAPClient(db_imap_setting)
        if not imap_client.connect():
            logger.error(f"ไม่สามารถเชื่อมต่อกับ IMAP ID: {imap_setting_id}")
            return
        
        try:
            # ส่งจำนวนวันย้อนหลังและจำนวนจำกัดไปยังเมธอด search_emails
            message_ids = imap_client.search_emails(days=days_back, limit=limit)
            logger.info(f"พบอีเมลทั้งหมด {len(message_ids)} รายการ")
            
            # ดึงข้อมูลอีเมลและสร้างใบเสร็จ
            receipt_count = 0
            llm_count = 0
            pending_index: list[tuple[Receipt, str | None]] = []

            def flush(session) -> None:
                """Commit แล้ว index ใบเสร็จที่เพิ่งบันทึก (ต้อง commit ก่อนจึงมี id)"""
                session.commit()
                for receipt, cat_name in pending_index:
                    index_receipt(receipt, cat_name)
                pending_index.clear()

            for message_id in message_ids:
                email_data = imap_client.get_email(message_id)
                if not email_data:
                    continue

                # แยกข้อมูลใบเสร็จ: LLM ก่อน แล้ว fallback เป็น regex
                receipt_data = extract_receipt_from_email(email_data, use_llm=use_llm)
                if not receipt_data or not receipt_data.get("amount"):
                    continue

                if str(receipt_data.get("extracted_by", "")).startswith("llm"):
                    llm_count += 1

                # ตรวจสอบว่ามีใบเสร็จนี้อยู่แล้วหรือไม่
                existing_receipt = db_session.query(Receipt).filter(
                    Receipt.user_id == user_id,
                    Receipt.email_id == receipt_data["email_id"]
                ).first()

                if existing_receipt:
                    continue

                # หมวดหมู่: ใช้คำแนะนำจาก LLM ก่อน ถ้าไม่มีค่อยเดาจากชื่อผู้ให้บริการ
                category_id, category_name = resolve_category_from_hint(
                    receipt_data.get("category_hint"), db_session
                )
                if not receipt_data.get("category_hint"):
                    category_id = (
                        auto_categorize_vendor(receipt_data["vendor_name"], db_session)
                        or category_id
                    )

                # สร้างใบเสร็จใหม่
                new_receipt = Receipt(
                    user_id=user_id,
                    email_id=receipt_data["email_id"],
                    email_subject=receipt_data["email_subject"],
                    email_from=receipt_data["email_from"],
                    email_date=receipt_data["email_date"],
                    vendor_name=receipt_data["vendor_name"],
                    receipt_date=receipt_data["receipt_date"],
                    amount=receipt_data["amount"],
                    currency=receipt_data.get("currency") or "THB",
                    receipt_number=receipt_data.get("receipt_number"),
                    payment_method=receipt_data.get("payment_method"),
                    notes=receipt_data.get("notes"),
                    receipt_file_path=receipt_data.get("receipt_file_path"),
                    category_id=category_id  # เพิ่มหมวดหมู่อัตโนมัติ
                )

                db_session.add(new_receipt)
                receipt_count += 1
                pending_index.append((new_receipt, category_name))

                # Commit ทุก 10 รายการเพื่อลดการใช้หน่วยความจำ
                if receipt_count % 10 == 0:
                    flush(db_session)

            # Commit ข้อมูลที่เหลือ
            if pending_index:
                flush(db_session)

            logger.info(
                "สร้างใบเสร็จใหม่ทั้งหมด %s รายการ (อ่านด้วย LLM %s, regex %s)",
                receipt_count,
                llm_count,
                receipt_count - llm_count,
            )
           
        finally:
            # ยกเลิกการเชื่อมต่อ IMAP ไม่ว่าจะสำเร็จหรือไม่
            imap_client.disconnect()
        
    except Exception as e:
        logger.error(f"เกิดข้อผิดพลาดในการซิงค์อีเมล: {str(e)}")
        db_session.rollback()
    
    finally:
        # ปิด session ไม่ว่าจะสำเร็จหรือไม่
        db_session.close()