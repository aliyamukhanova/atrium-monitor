from fastapi import APIRouter, HTTPException, Query
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

from datetime import date
from typing import Literal




router = APIRouter()


@router.get(
    "/readings",
    response_model=list[ReadingResponse],
)
def get_readings(
    selected_date: date | None = Query(
        default=None,
        alias="date",
    ),
    location: Literal["atrium", "outside"] | None = None,
    noise: str | None = None,
    brightness: str | None = None,
    min_temperature: float | None = None,
    max_temperature: float | None = None,
    sort_by: Literal["time", "temperature"] = "time",
    sort_order: Literal["asc", "desc"] = "desc",
):
    db: Session = SessionLocal()

    try:
        query = db.query(Reading)

        # Filter by calendar date.
        if selected_date is not None:
            query = query.filter(
                func.date(Reading.measured_at)
                == selected_date.isoformat()
            )

        # Filter by location.
        if location is not None:
            query = query.filter(
                Reading.location == location
            )

        # Filter by noise category.
        if noise is not None:
            query = query.filter(
                Reading.noise == noise
            )

        # Filter by brightness category.
        if brightness is not None:
            query = query.filter(
                Reading.brightness == brightness
            )

        # Filter by minimum temperature.
        if min_temperature is not None:
            query = query.filter(
                Reading.temperature >= min_temperature
            )

        # Filter by maximum temperature.
        if max_temperature is not None:
            query = query.filter(
                Reading.temperature <= max_temperature
            )

        # Choose which database column to sort.
        if sort_by == "temperature":
            sort_column = Reading.temperature
        else:
            sort_column = Reading.measured_at

        # Choose ascending or descending order.
        if sort_order == "asc":
            query = query.order_by(sort_column.asc())
        else:
            query = query.order_by(sort_column.desc())

        return query.all()

    finally:
        db.close()
        

@router.get(
    "/readings/{reading_id}",
    response_model=ReadingResponse,
)
def get_reading_by_id(reading_id: int):
    db: Session = SessionLocal()

    try:
        reading = (
            db.query(Reading)
            .filter(Reading.id == reading_id)
            .first()
        )

        if reading is None:
            raise HTTPException(
                status_code=404,
                detail="Reading not found",
            )

        return reading

    finally:
        db.close()
        

@router.get("/summary")
def get_summary(
    selected_date: date | None = Query(
        default=None,
        alias="date",
    ),
):
    db: Session = SessionLocal()

    try:
        query = db.query(Reading)

        if selected_date is not None:
            query = query.filter(
                func.date(Reading.measured_at)
                == selected_date.isoformat()
            )

        readings = query.all()

        if not readings:
            return {
                "date": (
                    selected_date.isoformat()
                    if selected_date
                    else None
                ),
                "average_temperature": None,
                "minimum_temperature": None,
                "maximum_temperature": None,
                "total_readings": 0,
                "coolest_time": None,
                "hottest_time": None,
            }

        temperatures = [
            reading.temperature
            for reading in readings
        ]

        coolest_reading = min(
            readings,
            key=lambda reading: reading.temperature,
        )

        hottest_reading = max(
            readings,
            key=lambda reading: reading.temperature,
        )

        average_temperature = (
            sum(temperatures) / len(temperatures)
        )

        return {
            "date": (
                selected_date.isoformat()
                if selected_date
                else None
            ),
            "average_temperature": round(
                average_temperature,
                2,
            ),
            "minimum_temperature": min(temperatures),
            "maximum_temperature": max(temperatures),
            "total_readings": len(readings),
            "coolest_time":
                coolest_reading.measured_at,
            "hottest_time":
                hottest_reading.measured_at,
        }

    finally:
        db.close()
    
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
    
from fastapi import HTTPException


@router.get("/current")
def get_current_state():
    db: Session = SessionLocal()

    try:
        latest_atrium = (
            db.query(Reading)
            .filter(Reading.location == "atrium")
            .order_by(Reading.measured_at.desc())
            .first()
        )

        latest_outside = (
            db.query(Reading)
            .filter(Reading.location == "outside")
            .order_by(Reading.measured_at.desc())
            .first()
        )

        if latest_atrium is None:
            raise HTTPException(
                status_code=404,
                detail="No atrium readings found",
            )

        status_parts = []

        if latest_atrium.temperature >= 32:
            status_parts.append("Very hot")
        elif latest_atrium.temperature >= 29:
            status_parts.append("Warm")
        elif latest_atrium.temperature >= 23:
            status_parts.append("Comfortable")
        else:
            status_parts.append("Cool")

        if latest_atrium.noise == "quiet":
            status_parts.append("quiet")
        elif latest_atrium.noise == "mild":
            status_parts.append("moderately quiet")
        elif latest_atrium.noise == "noisy":
            status_parts.append("noisy")
        elif latest_atrium.noise == "very noisy":
            status_parts.append("very noisy")

        status = " and ".join(status_parts)

        return {
            "atrium": {
                "temperature": latest_atrium.temperature,
                "brightness": latest_atrium.brightness,
                "noise": latest_atrium.noise,
                "measured_at": latest_atrium.measured_at,
            },
            "outside": {
                "temperature": (
                    latest_outside.temperature
                    if latest_outside
                    else None
                ),
                "measured_at": (
                    latest_outside.measured_at
                    if latest_outside
                    else None
                ),
            },
            "status": status,
        }

    finally:
        db.close()

@router.get("/chart-data")
def get_chart_data(
    selected_date: date | None = Query(
        default=None,
        alias="date",
    ),
):
    db: Session = SessionLocal()

    try:
        query = db.query(Reading)

        if selected_date is not None:
            query = query.filter(
                func.date(Reading.measured_at)
                == selected_date.isoformat()
            )

        readings = (
            query
            .order_by(Reading.measured_at.asc())
            .all()
        )

        return [
            {
                "id": reading.id,
                "time": reading.measured_at,
                "hour": reading.measured_at.hour,
                "location": reading.location,
                "temperature": reading.temperature,
                "brightness": reading.brightness,
                "noise": reading.noise,
            }
            for reading in readings
        ]

    finally:
        db.close()