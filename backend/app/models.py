from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Float
from sqlalchemy import DateTime

from .database import Base


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

    id = Column(Integer, primary_key=True)

    created_at = Column(DateTime)

    category = Column(String)

    comment = Column(String)

    status = Column(String)
    