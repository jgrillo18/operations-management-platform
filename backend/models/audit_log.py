from sqlalchemy import Column, Integer, String, DateTime, func

from .database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String, nullable=False)
    entity = Column(String, nullable=False)
    detail = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
