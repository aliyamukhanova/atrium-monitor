from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine
from .database import Base

import app.models

from app.routes.readings import router as readings_router
from app.routes.reports import (
    router as reports_router,
)

app = FastAPI()

app.include_router(readings_router)
app.include_router(reports_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"message": "Server is working"}