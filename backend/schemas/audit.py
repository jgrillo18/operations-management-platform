from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class AuditLogOut(BaseModel):
    id: int
    action: str
    entity: str
    detail: Optional[str] = None
    timestamp: datetime

    model_config = {"from_attributes": True}
