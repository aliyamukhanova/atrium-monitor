from collections import defaultdict
from datetime import date
from statistics import pstdev

from app.services.comfort import (
    calculate_comfort_score,
)


FIRST_STUDY_HOUR = 8
LAST_STUDY_HOUR = 22

PREDICTION_DAYS = 7
MINIMUM_READINGS_PER_HOUR = 2

HISTORICAL_WEIGHT = 0.65
TREND_WEIGHT = 0.20
CONSISTENCY_WEIGHT = 0.15

MAX_TREND_ADJUSTMENT = 15.0


def empty_recommendation():
    return {
        "best_hour": None,
        "best_location": "atrium",
        "comfort_score": None,
        "confidence": "low",
        "prediction_basis": (
            "Not enough complete atrium data"
        ),
    }


def normalize_location(
    location: str | None,
) -> str:
    if not location:
        return ""

    return location.strip().lower()


def is_complete_atrium_reading(
    reading,
) -> bool:
    return (
        normalize_location(
            reading.location,
        )
        == "atrium"
        and reading.temperature is not None
        and reading.brightness is not None
        and reading.noise is not None
    )


def is_valid_study_hour(
    reading,
) -> bool:
    hour = reading.measured_at.hour

    return (
        FIRST_STUDY_HOUR
        <= hour
        < LAST_STUDY_HOUR
    )


def calculate_recency_weight(
    days_old: int,
) -> float:
    """
    More recent readings receive more weight.

    Latest day: 7
    One day old: 6
    ...
    Six days old: 1
    """

    return max(
        PREDICTION_DAYS - days_old,
        1,
    )


def calculate_weighted_average(
    values: list[dict],
) -> float:
    weighted_total = sum(
        item["score"] * item["weight"]
        for item in values
    )

    total_weight = sum(
        item["weight"]
        for item in values
    )

    if total_weight == 0:
        return 0.0

    return weighted_total / total_weight


def calculate_consistency_score(
    scores: list[float],
) -> float:
    """
    A stable hour receives a higher score.

    If the historical scores vary greatly,
    confidence in that hour is lower.
    """

    if len(scores) < 2:
        return 50.0

    standard_deviation = pstdev(
        scores,
    )

    consistency_score = (
        100 - standard_deviation * 4
    )

    return max(
        0.0,
        min(
            100.0,
            consistency_score,
        ),
    )


def calculate_current_trend(
    latest_day_readings,
) -> float:
    """
    Estimate whether comfort today is
    improving or worsening.

    Positive result:
    conditions are improving.

    Negative result:
    conditions are worsening.
    """

    if len(latest_day_readings) < 2:
        return 0.0

    sorted_readings = sorted(
        latest_day_readings,
        key=lambda reading:
            reading.measured_at,
    )

    scored_readings = [
        calculate_comfort_score(
            reading.temperature,
            reading.brightness,
            reading.noise,
        )
        for reading in sorted_readings
    ]

    split_index = max(
        1,
        len(scored_readings) // 2,
    )

    earlier_scores = (
        scored_readings[:split_index]
    )

    later_scores = (
        scored_readings[split_index:]
    )

    if not later_scores:
        return 0.0

    earlier_average = (
        sum(earlier_scores)
        / len(earlier_scores)
    )

    later_average = (
        sum(later_scores)
        / len(later_scores)
    )

    trend = (
        later_average
        - earlier_average
    )

    return max(
        -MAX_TREND_ADJUSTMENT,
        min(
            MAX_TREND_ADJUSTMENT,
            trend,
        ),
    )


def calculate_confidence(
    reading_count: int,
    consistency_score: float,
) -> str:
    if (
        reading_count >= 6
        and consistency_score >= 80
    ):
        return "high"

    if (
        reading_count >= 3
        and consistency_score >= 60
    ):
        return "medium"

    return "low"


def get_best_study_recommendation(
    readings,
):
    """
    Predict the best study hour using:

    1. A recency-weighted historical comfort
       score for each hour.
    2. Today's current comfort trend.
    3. The consistency of conditions at that
       hour.
    4. Only complete atrium readings.
    5. Only readings between 08:00 and 21:59.
    """

    valid_readings = [
        reading
        for reading in readings
        if (
            is_complete_atrium_reading(
                reading,
            )
            and is_valid_study_hour(
                reading,
            )
        )
    ]

    if not valid_readings:
        return empty_recommendation()

    latest_date: date = max(
        reading.measured_at.date()
        for reading in valid_readings
    )

    recent_readings = []

    for reading in valid_readings:
        days_old = (
            latest_date
            - reading.measured_at.date()
        ).days

        if (
            0
            <= days_old
            < PREDICTION_DAYS
        ):
            recent_readings.append(
                reading,
            )

    if not recent_readings:
        return empty_recommendation()

    latest_day_readings = [
        reading
        for reading in recent_readings
        if (
            reading.measured_at.date()
            == latest_date
        )
    ]

    current_trend = (
        calculate_current_trend(
            latest_day_readings,
        )
    )

    grouped_scores = defaultdict(list)

    for reading in recent_readings:
        days_old = (
            latest_date
            - reading.measured_at.date()
        ).days

        score = calculate_comfort_score(
            reading.temperature,
            reading.brightness,
            reading.noise,
        )

        grouped_scores[
            reading.measured_at.hour
        ].append(
            {
                "score": score,
                "weight":
                    calculate_recency_weight(
                        days_old,
                    ),
            }
        )

    best_hour = None
    best_predicted_score = -1.0
    best_confidence = "low"

    for hour, values in grouped_scores.items():
        if (
            len(values)
            < MINIMUM_READINGS_PER_HOUR
        ):
            continue

        scores = [
            item["score"]
            for item in values
        ]

        historical_score = (
            calculate_weighted_average(
                values,
            )
        )

        consistency_score = (
            calculate_consistency_score(
                scores,
            )
        )

        trend_score = max(
            0.0,
            min(
                100.0,
                historical_score
                + current_trend,
            ),
        )

        predicted_score = (
            historical_score
            * HISTORICAL_WEIGHT
            + trend_score
            * TREND_WEIGHT
            + consistency_score
            * CONSISTENCY_WEIGHT
        )

        predicted_score = max(
            0.0,
            min(
                100.0,
                predicted_score,
            ),
        )

        confidence = (
            calculate_confidence(
                reading_count=len(values),
                consistency_score=(
                    consistency_score
                ),
            )
        )

        if (
            predicted_score
            > best_predicted_score
        ):
            best_predicted_score = (
                predicted_score
            )

            best_hour = hour
            best_confidence = confidence

    if best_hour is None:
        return empty_recommendation()

    return {
        "best_hour": best_hour,
        "best_location": "atrium",
        "comfort_score": round(
            best_predicted_score,
        ),
        "confidence":
            best_confidence,
        "prediction_basis": (
            "Prediction based on recent "
            "historical comfort, current "
            "trend, and hourly consistency"
        ),
    }