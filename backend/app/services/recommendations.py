from collections import defaultdict

from app.services.comfort import (
    calculate_comfort_score
)

def get_best_study_recommendation(
    readings
):
    grouped_scores = defaultdict(list)

    for reading in readings:

        score = calculate_comfort_score(
            reading.temperature,
            reading.brightness,
            reading.noise
        )

        hour = reading.measured_at.hour

        key = (
            hour,
            reading.location
        )

        grouped_scores[key].append(
            score
        )

    best_hour = None
    best_location = None
    best_average = -1

    for (
        hour,
        location
    ), scores in grouped_scores.items():

        average_score = (
            sum(scores)
            / len(scores)
        )

        if average_score > best_average:

            best_average = average_score

            best_hour = hour

            best_location = location

    return {
        "best_hour": best_hour,
        "best_location": best_location,
        "comfort_score":
            round(best_average)
    }