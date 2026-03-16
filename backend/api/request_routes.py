from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from models.database import SessionLocal
from schemas.request import RequestCreate, RequestOut, RequestUpdate
from services.request_service import (
    create_request,
    delete_request,
    get_request,
    list_requests,
    update_status,
)

router = APIRouter(prefix="/requests", tags=["Requests"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("", response_model=RequestOut, status_code=status.HTTP_201_CREATED)
def create(data: RequestCreate, db: Session = Depends(get_db)):
    return create_request(db, data)


@router.get("", response_model=List[RequestOut])
def list_all(
    filter_status: Optional[str] = Query(None, alias="status"),
    filter_priority: Optional[str] = Query(None, alias="priority"),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return list_requests(db, status=filter_status, priority=filter_priority, search=search)


@router.get("/{request_id}", response_model=RequestOut)
def get_one(request_id: int, db: Session = Depends(get_db)):
    return get_request(db, request_id)


@router.put("/{request_id}", response_model=RequestOut)
def update(request_id: int, data: RequestUpdate, db: Session = Depends(get_db)):
    return update_status(db, request_id, data)


@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(request_id: int, db: Session = Depends(get_db)):
    delete_request(db, request_id)
