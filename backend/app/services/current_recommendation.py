from app.services.comfort import (
    calculate_comfort_score,
)


def get_current_activity_recommendation(
    atrium_reading,
    outside_reading,
):
    """
    Recommend what the user should do now.

    The decision uses:
    - the latest complete atrium reading;
    - the latest outside temperature;
    - the atrium comfort score.

    Possible activities:
    - study in the atrium;
    - go outside;
    - relax in the dorm.
    """

    comfort_score = calculate_comfort_score(
        atrium_reading.temperature,
        atrium_reading.brightness,
        atrium_reading.noise,
    )

    atrium_temperature = (
        atrium_reading.temperature
    )

    brightness = (
        atrium_reading.brightness
        .strip()
        .lower()
    )

    noise = (
        atrium_reading.noise
        .strip()
        .lower()
    )

    outside_temperature = (
        outside_reading.temperature
        if outside_reading is not None
        else None
    )

    suitable_study_noise = noise in {
        "quiet",
        "mild",
    }

    suitable_study_brightness = (
        brightness
        in {
            "dim",
            "normal",
            "bright",
        }
    )

    suitable_study_temperature = (
        22
        <= atrium_temperature
        <= 29
    )

    # First preference: study in the atrium
    # when all important atrium conditions
    # are reasonably suitable.
    if (
        comfort_score >= 75
        and suitable_study_noise
        and suitable_study_brightness
        and suitable_study_temperature
    ):
        return {
            "activity": "study",
            "title":
                "Study in the atrium",
            "reason": (
                "The atrium currently has "
                "suitable temperature, "
                "lighting, and noise levels "
                "for focused work."
            ),
            "comfort_score":
                comfort_score,
            "atrium_temperature":
                atrium_temperature,
            "outside_temperature":
                outside_temperature,
            "measured_at":
                atrium_reading.measured_at,
        }

    outside_is_suitable = (
        outside_temperature is not None
        and 17
        <= outside_temperature
        <= 28
    )

    atrium_has_problem = (
        comfort_score < 75
        or not suitable_study_noise
        or not suitable_study_temperature
    )

    outside_is_cooler = (
        outside_temperature is not None
        and outside_temperature
        <= atrium_temperature - 2
    )

    # Second preference: recommend going
    # outside when outdoor temperature is
    # suitable and the atrium is currently
    # less comfortable.
    if (
        outside_is_suitable
        and (
            atrium_has_problem
            or outside_is_cooler
        )
    ):
        if outside_is_cooler:
            reason = (
                "It is noticeably cooler "
                "outside than in the atrium, "
                "and the outdoor temperature "
                "is suitable for a break."
            )
        else:
            reason = (
                "The atrium is not currently "
                "ideal for focused study, "
                "while the outdoor temperature "
                "is suitable."
            )

        return {
            "activity": "outside",
            "title": "Go outside",
            "reason": reason,
            "comfort_score":
                comfort_score,
            "atrium_temperature":
                atrium_temperature,
            "outside_temperature":
                outside_temperature,
            "measured_at":
                max(
                    atrium_reading.measured_at,
                    outside_reading.measured_at,
                ),
        }

    # Fallback when neither the atrium nor
    # the available outside conditions are
    # especially suitable.
    if outside_temperature is None:
        reason = (
            "The atrium is not currently "
            "ideal for studying, and no "
            "recent outdoor temperature is "
            "available."
        )
    elif outside_temperature > 28:
        reason = (
            "The atrium is not currently "
            "ideal for studying, and it is "
            "too warm outside for a "
            "comfortable break."
        )
    elif outside_temperature < 17:
        reason = (
            "The atrium is not currently "
            "ideal for studying, and it is "
            "cool outside."
        )
    else:
        reason = (
            "Neither the atrium nor the "
            "available outdoor conditions "
            "are currently ideal."
        )

    return {
        "activity": "dorm",
        "title":
            "Relax in the dorm",
        "reason": reason,
        "comfort_score":
            comfort_score,
        "atrium_temperature":
            atrium_temperature,
        "outside_temperature":
            outside_temperature,
        "measured_at":
            atrium_reading.measured_at,
    }