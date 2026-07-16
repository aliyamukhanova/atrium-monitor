from fastapi import APIRouter
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import SessionLocal
from app.models import Reading
from app.schemas import ReadingResponse

from app.services.comfort import (
    calculate_comfort_score
)

from app.services.recommendations import (
    get_best_study_recommendation
)


router = APIRouter()


@router.get(
    "/readings",
    response_model=list[ReadingResponse]
)
def get_readings():

    db: Session = SessionLocal()

    return db.query(Reading).all()

@router.get("/summary")
def get_summary():

    db: Session = SessionLocal()

    avg_temp = db.query(
        func.avg(Reading.temperature)
    ).scalar()

    min_temp = db.query(
        func.min(Reading.temperature)
    ).scalar()

    max_temp = db.query(
        func.max(Reading.temperature)
    ).scalar()

    total_readings = db.query(
        Reading
    ).count()

    return {
        "average_temperature": round(avg_temp, 2),
        "minimum_temperature": min_temp,
        "maximum_temperature": max_temp,
        "total_readings": total_readings
    }
    
@router.get("/latest")
def get_latest():

    db: Session = SessionLocal()

    latest = (
        db.query(Reading)
        .order_by(Reading.measured_at.desc())
        .first()
    )

    return latest

@router.get("/comfort-score")
def get_comfort_score():

    db: Session = SessionLocal()

    latest = (
        db.query(Reading)
        .order_by(
            Reading.measured_at.desc()
        )
        .first()
    )

    score = calculate_comfort_score(
        latest.temperature,
        latest.brightness,
        latest.noise
    )

    status = "Poor"

    if score >= 90:
        status = "Excellent"

    elif score >= 70:
        status = "Good"

    elif score >= 40:
        status = "Fair"

    return {
        "comfort_score": score,
        "status": status
    }
    
@router.get(
    "/recommendations"
)
def get_recommendations():

    db: Session = SessionLocal()

    readings = (
        db.query(Reading)
        .all()
    )

    recommendation = (
        get_best_study_recommendation(
            readings
        )
    )

    return {
        "best_study_time":
            f"{recommendation['best_hour']:02d}:00",

        "recommended_location":
            recommendation[
                "best_location"
            ],

        "comfort_score":
            recommendation[
                "comfort_score"
            ]
    }