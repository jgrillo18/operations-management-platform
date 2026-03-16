from fastapi import HTTPException

from models.request import Request
from schemas.request import RequestCreate, RequestUpdate
from services.audit_service import log_action


def _get_or_404(db, request_id: int) -> Request:
    req = db.query(Request).filter(Request.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    return req


def create_request(db, data: RequestCreate) -> Request:
    req = Request(title=data.title, description=data.description, priority=data.priority)
    db.add(req)
    db.commit()
    db.refresh(req)
    log_action(db, "CREATE_REQUEST", f"Request#{req.id}", data.title)
    return req


def list_requests(db, status: str = None, priority: str = None, search: str = None):
    q = db.query(Request)
    if status:
        q = q.filter(Request.status == status)
    if priority:
        q = q.filter(Request.priority == priority)
    if search:
        q = q.filter(Request.title.ilike(f"%{search}%"))
    return q.order_by(Request.created_at.desc()).all()


def get_request(db, request_id: int) -> Request:
    return _get_or_404(db, request_id)


def update_status(db, request_id: int, data: RequestUpdate) -> Request:
    req = _get_or_404(db, request_id)
    old_status = req.status
    req.status = data.status
    db.commit()
    db.refresh(req)
    log_action(
        db,
        "UPDATE_STATUS",
        f"Request#{request_id}",
        f"{old_status} → {data.status}",
    )
    return req


def delete_request(db, request_id: int) -> None:
    req = _get_or_404(db, request_id)
    title = req.title
    db.delete(req)
    db.commit()
    log_action(db, "DELETE_REQUEST", f"Request#{request_id}", title)
