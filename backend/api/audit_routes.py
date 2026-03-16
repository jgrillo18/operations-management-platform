from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from models.database import SessionLocal
from schemas.audit import AuditLogOut
from services.audit_service import list_logs

router = APIRouter(prefix="/audit", tags=["Audit"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("", response_model=List[AuditLogOut])
def get_logs(
    limit: int = Query(100, ge=1, le=500, description="Max number of log entries"),
    db: Session = Depends(get_db),
):
    return list_logs(db, limit)
