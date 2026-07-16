from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Literal


class ReadingResponse(BaseModel):
    id: int
    measured_at: datetime
    location: str
    temperature: float
    brightness: str | None
    noise: str | None

    class Config:
        from_attributes = True
        
ReportCategory = Literal[
    "too hot",
    "too noisy",
    "too bright",
    "too dark",
    "comfortable",
    "other",
]

ReportStatus = Literal[
    "open",
    "resolved",
]

class ReportCreate(BaseModel):
    category: ReportCategory

    comment: str | None = Field(
        default=None,
        max_length=500,
    )


class ReportUpdate(BaseModel):
    category: ReportCategory | None = None

    comment: str | None = Field(
        default=None,
        max_length=500,
    )

    status: ReportStatus | None = None


class ReportResponse(BaseModel):
    id: int
    created_at: datetime
    category: str
    comment: str | None
    status: str

    model_config = ConfigDict(
        from_attributes=True,
    )