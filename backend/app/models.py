from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Float
from sqlalchemy import DateTime
from .database import Base
from datetime import datetime


class Reading(Base):
    __tablename__ = "readings"

    id = Column(Integer, primary_key=True)

    measured_at = Column(DateTime)

    location = Column(String)

    temperature = Column(Float)

    brightness = Column(String, nullable=True)

    noise = Column(String, nullable=True)


class Report(Base):
    __tablename__ = "reports"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    category = Column(
        String,
        nullable=False,
    )

    comment = Column(
        String,
        nullable=True,
    )

    status = Column(
        String,
        default="open",
        nullable=False,
    )