from fastapi import FastAPI

from .database import engine
from .database import Base

import app.models

from app.routes.readings import router as readings_router

app = FastAPI()

app.include_router(readings_router)

Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "Server is working"}