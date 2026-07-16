from pydantic import BaseModel
from datetime import datetime


class ReadingResponse(BaseModel):
    id: int
    measured_at: datetime
    location: str
    temperature: float
    brightness: str | None
    noise: str | None

    class Config:
        from_attributes = True