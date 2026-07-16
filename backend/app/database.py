import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import (
    declarative_base,
    sessionmaker,
)


BACKEND_DIR = (
    Path(__file__)
    .resolve()
    .parent
    .parent
)

DEFAULT_DATABASE_PATH = (
    BACKEND_DIR / "atrium.db"
)

DATABASE_PATH = os.getenv(
    "DATABASE_PATH",
    str(DEFAULT_DATABASE_PATH),
)

SQLALCHEMY_DATABASE_URL = (
    f"sqlite:///{DATABASE_PATH}"
)


engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={
        "check_same_thread": False,
    },
)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


Base = declarative_base()