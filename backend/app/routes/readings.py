from datetime import date
from typing import Literal

from fastapi import (
    APIRouter,
    HTTPException,
    Query,
)
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Reading
from app.schemas import ReadingResponse

from app.services.comfort import (
    calculate_comfort_score,
    get_comfort_status,
)

from app.services.current_recommendation import (
    get_current_activity_recommendation,
)

from app.services.recommendations import (
    get_best_study_recommendation,
)


router = APIRouter()


def normalized_location_expression():
    return func.lower(
        func.trim(
            Reading.location,
        )
    )


def get_latest_complete_atrium_reading(
    db: Session,
):
    return (
        db.query(Reading)
        .filter(
            normalized_location_expression()
            == "atrium",

            Reading.temperature.is_not(
                None,
            ),

            Reading.brightness.is_not(
                None,
            ),

            Reading.noise.is_not(
                None,
            ),
        )
        .order_by(
            Reading.measured_at.desc(),
        )
        .first()
    )


def get_latest_outside_reading(
    db: Session,
):
    return (
        db.query(Reading)
        .filter(
            normalized_location_expression()
            == "outside",

            Reading.temperature.is_not(
                None,
            ),
        )
        .order_by(
            Reading.measured_at.desc(),
        )
        .first()
    )


@router.get(
    "/readings",
    response_model=list[ReadingResponse],
)
def get_readings(
    selected_date: date | None = Query(
        default=None,
        alias="date",
    ),
    location: Literal[
        "atrium",
        "outside",
    ]
    | None = None,
    noise: str | None = None,
    brightness: str | None = None,
    min_temperature: float | None = None,
    max_temperature: float | None = None,
    sort_by: Literal[
        "time",
        "temperature",
    ] = "time",
    sort_order: Literal[
        "asc",
        "desc",
    ] = "desc",
):
    db: Session = SessionLocal()

    try:
        query = db.query(Reading)

        if selected_date is not None:
            query = query.filter(
                func.date(
                    Reading.measured_at,
                )
                == selected_date.isoformat()
            )

        if location is not None:
            query = query.filter(
                normalized_location_expression()
                == location,
            )

        if noise is not None:
            query = query.filter(
                func.lower(
                    func.trim(
                        Reading.noise,
                    )
                )
                == noise.strip().lower()
            )

        if brightness is not None:
            query = query.filter(
                func.lower(
                    func.trim(
                        Reading.brightness,
                    )
                )
                == brightness.strip().lower()
            )

        if min_temperature is not None:
            query = query.filter(
                Reading.temperature
                >= min_temperature,
            )

        if max_temperature is not None:
            query = query.filter(
                Reading.temperature
                <= max_temperature,
            )

        if sort_by == "temperature":
            sort_column = (
                Reading.temperature
            )
        else:
            sort_column = (
                Reading.measured_at
            )

        if sort_order == "asc":
            query = query.order_by(
                sort_column.asc(),
            )
        else:
            query = query.order_by(
                sort_column.desc(),
            )

        return query.all()

    finally:
        db.close()


@router.get(
    "/readings/{reading_id}",
    response_model=ReadingResponse,
)
def get_reading_by_id(
    reading_id: int,
):
    db: Session = SessionLocal()

    try:
        reading = (
            db.query(Reading)
            .filter(
                Reading.id == reading_id,
            )
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
    location: Literal[
        "atrium",
        "outside",
    ]
    | None = None,
):
    db: Session = SessionLocal()

    try:
        query = db.query(Reading).filter(
            Reading.temperature.is_not(
                None,
            ),
        )

        if location is not None:
            query = query.filter(
                normalized_location_expression()
                == location,
            )

        if selected_date is None:
            latest_reading = (
                query
                .order_by(
                    Reading.measured_at.desc(),
                )
                .first()
            )

            if latest_reading is None:
                return {
                    "date": None,
                    "average_temperature":
                        None,
                    "minimum_temperature":
                        None,
                    "maximum_temperature":
                        None,
                    "total_readings": 0,
                    "coolest_time": None,
                    "hottest_time": None,
                }

            summary_date = (
                latest_reading
                .measured_at
                .date()
            )
        else:
            summary_date = selected_date

        readings = (
            query
            .filter(
                func.date(
                    Reading.measured_at,
                )
                == summary_date.isoformat()
            )
            .all()
        )

        if not readings:
            return {
                "date":
                    summary_date.isoformat(),
                "average_temperature":
                    None,
                "minimum_temperature":
                    None,
                "maximum_temperature":
                    None,
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
            key=lambda reading:
                reading.temperature,
        )

        hottest_reading = max(
            readings,
            key=lambda reading:
                reading.temperature,
        )

        average_temperature = (
            sum(temperatures)
            / len(temperatures)
        )

        return {
            "date":
                summary_date.isoformat(),

            "average_temperature":
                round(
                    average_temperature,
                    2,
                ),

            "minimum_temperature":
                min(temperatures),

            "maximum_temperature":
                max(temperatures),

            "total_readings":
                len(readings),

            "coolest_time":
                coolest_reading
                .measured_at,

            "hottest_time":
                hottest_reading
                .measured_at,
        }

    finally:
        db.close()


@router.get("/latest")
def get_latest():
    db: Session = SessionLocal()

    try:
        return (
            db.query(Reading)
            .order_by(
                Reading.measured_at.desc(),
            )
            .first()
        )

    finally:
        db.close()


@router.get("/comfort-score")
def get_comfort_score():
    db: Session = SessionLocal()

    try:
        latest_complete_atrium = (
            get_latest_complete_atrium_reading(
                db,
            )
        )

        if latest_complete_atrium is None:
            raise HTTPException(
                status_code=404,
                detail=(
                    "No complete atrium "
                    "reading found"
                ),
            )

        score = calculate_comfort_score(
            latest_complete_atrium
            .temperature,

            latest_complete_atrium
            .brightness,

            latest_complete_atrium
            .noise,
        )

        return {
            "comfort_score": score,
            "status":
                get_comfort_status(score),
            "measured_at":
                latest_complete_atrium
                .measured_at,
        }

    finally:
        db.close()


@router.get(
    "/current-recommendation",
)
def get_current_recommendation():
    db: Session = SessionLocal()

    try:
        latest_complete_atrium = (
            get_latest_complete_atrium_reading(
                db,
            )
        )

        if latest_complete_atrium is None:
            raise HTTPException(
                status_code=404,
                detail=(
                    "No complete atrium "
                    "reading found"
                ),
            )

        latest_outside = (
            get_latest_outside_reading(
                db,
            )
        )

        return (
            get_current_activity_recommendation(
                latest_complete_atrium,
                latest_outside,
            )
        )

    finally:
        db.close()


@router.get("/recommendations")
def get_recommendations():
    db: Session = SessionLocal()

    try:
        readings = (
            db.query(Reading)
            .filter(
                normalized_location_expression()
                == "atrium",

                Reading.temperature.is_not(
                    None,
                ),

                Reading.brightness.is_not(
                    None,
                ),

                Reading.noise.is_not(
                    None,
                ),
            )
            .order_by(
                Reading.measured_at.asc(),
            )
            .all()
        )

        recommendation = (
            get_best_study_recommendation(
                readings,
            )
        )

        best_hour = recommendation[
            "best_hour"
        ]

        if best_hour is None:
            best_study_time = (
                "Not enough data"
            )
        else:
            end_hour = (
                best_hour + 1
            ) % 24

            best_study_time = (
                f"{best_hour:02d}:00–"
                f"{end_hour:02d}:00"
            )

        return {
            "best_study_time":
                best_study_time,

            "recommended_location":
                "atrium",

            "comfort_score":
                recommendation[
                    "comfort_score"
                ],

            "prediction_basis":
                recommendation[
                    "prediction_basis"
                ],

            "confidence":
                recommendation.get(
                    "confidence",
                    "low",
                ),
        }

    finally:
        db.close()


@router.get("/current")
def get_current_state():
    db: Session = SessionLocal()

    try:
        latest_atrium = (
            db.query(Reading)
            .filter(
                normalized_location_expression()
                == "atrium",
            )
            .order_by(
                Reading.measured_at.desc(),
            )
            .first()
        )

        latest_outside = (
            get_latest_outside_reading(
                db,
            )
        )

        if latest_atrium is None:
            raise HTTPException(
                status_code=404,
                detail=(
                    "No atrium readings found"
                ),
            )

        status_parts: list[str] = []

        if latest_atrium.temperature >= 32:
            status_parts.append(
                "Very hot",
            )
        elif latest_atrium.temperature >= 29:
            status_parts.append(
                "Warm",
            )
        elif latest_atrium.temperature >= 23:
            status_parts.append(
                "Comfortable",
            )
        else:
            status_parts.append(
                "Cool",
            )

        normalized_noise = (
            latest_atrium.noise
            .strip()
            .lower()
            if latest_atrium.noise
            else None
        )

        noise_labels = {
            "quiet": "quiet",
            "mild":
                "moderately quiet",
            "noisy": "noisy",
            "very noisy":
                "very noisy",
        }

        if normalized_noise in noise_labels:
            status_parts.append(
                noise_labels[
                    normalized_noise
                ],
            )

        status = " and ".join(
            status_parts,
        )

        return {
            "atrium": {
                "temperature":
                    latest_atrium
                    .temperature,

                "brightness":
                    latest_atrium
                    .brightness,

                "noise":
                    latest_atrium.noise,

                "measured_at":
                    latest_atrium
                    .measured_at,
            },

            "outside": {
                "temperature": (
                    latest_outside
                    .temperature
                    if latest_outside
                    else None
                ),

                "measured_at": (
                    latest_outside
                    .measured_at
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
                func.date(
                    Reading.measured_at,
                )
                == selected_date.isoformat()
            )

        readings = (
            query
            .order_by(
                Reading.measured_at.asc(),
            )
            .all()
        )

        return [
            {
                "id": reading.id,
                "time":
                    reading.measured_at,
                "hour":
                    reading.measured_at.hour,
                "location":
                    reading.location,
                "temperature":
                    reading.temperature,
                "brightness":
                    reading.brightness,
                "noise": reading.noise,
            }
            for reading in readings
        ]

    finally:
        db.close()