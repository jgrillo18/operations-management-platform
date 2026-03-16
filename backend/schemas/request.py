from datetime import datetime

from pydantic import BaseModel, field_validator

VALID_STATUSES  = {"OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"}
VALID_PRIORITIES = {"LOW", "MEDIUM", "HIGH", "CRITICAL"}


class RequestCreate(BaseModel):
    title: str
    description: str = ""
    priority: str = "MEDIUM"

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: str) -> str:
        if v not in VALID_PRIORITIES:
            raise ValueError(
                f"Invalid priority. Must be one of: {', '.join(sorted(VALID_PRIORITIES))}"
            )
        return v


class RequestUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in VALID_STATUSES:
            raise ValueError(
                f"Invalid status. Must be one of: {', '.join(sorted(VALID_STATUSES))}"
            )
        return v


class RequestOut(BaseModel):
    id: int
    title: str
    description: str
    status: str
    priority: str
    created_at: datetime

    model_config = {"from_attributes": True}
