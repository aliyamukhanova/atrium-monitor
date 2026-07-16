import os

from fastapi import FastAPI
from fastapi.middleware.cors import (
    CORSMiddleware,
)

import app.models

from app.database import Base, engine
from app.routes.readings import (
    router as readings_router,
)
from app.routes.reports import (
    router as reports_router,
)


# Create database tables that do not
# already exist.
Base.metadata.create_all(
    bind=engine,
)


app = FastAPI(
    title="Atrium Monitor API",
    description=(
        "API for atrium conditions, "
        "analytics, recommendations, "
        "and user reports."
    ),
    version="1.0.0",
)


# Read allowed frontend addresses from an
# environment variable in production.
#
# Example Railway value:
# ALLOWED_ORIGINS=http://localhost:5173,https://atrium-monitor.vercel.app
allowed_origins_value = os.getenv(
    "ALLOWED_ORIGINS",
    (
        "http://localhost:5173,"
        "http://127.0.0.1:5173"
    ),
)

allowed_origins = [
    origin.strip()
    for origin in allowed_origins_value.split(",")
    if origin.strip()
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    readings_router,
)

app.include_router(
    reports_router,
)


@app.get("/")
def root():
    return {
        "message":
            "Atrium Monitor API is running",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
    }


print(
    "FastAPI database:",
    engine.url,
)

print(
    "Allowed CORS origins:",
    allowed_origins,
)