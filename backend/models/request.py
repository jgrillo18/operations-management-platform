from sqlalchemy import Column, Integer, String, DateTime, func

from .database import Base

VALID_STATUSES = ("OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED")


class Request(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, default="")
    status = Column(String, nullable=False, default="OPEN")
    priority = Column(String, nullable=False, server_default="MEDIUM")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
