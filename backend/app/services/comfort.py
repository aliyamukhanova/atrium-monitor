def calculate_temperature_score(
    temperature: float,
) -> int:
    if 24 <= temperature <= 28:
        return 100

    if 22 <= temperature <= 30:
        return 80

    if 20 <= temperature <= 32:
        return 60

    return 40


def calculate_noise_score(
    noise: str,
) -> int:
    scores = {
        "quiet": 100,
        "mild": 70,
        "noisy": 40,
        "very noisy": 20,

        # Keep support for older imported data.
        "loud": 40,
    }

    return scores.get(noise, 50)


def calculate_brightness_score(
    brightness: str,
) -> int:
    scores = {
        "normal": 100,
        "bright": 80,
        "very bright": 60,
        "dim": 70,
        "dark": 50,
    }

    return scores.get(
        brightness,
        50,
    )


def calculate_comfort_score(
    temperature: float,
    brightness: str,
    noise: str,
) -> int:
    temperature_score = (
        calculate_temperature_score(
            temperature,
        )
    )

    brightness_score = (
        calculate_brightness_score(
            brightness,
        )
    )

    noise_score = (
        calculate_noise_score(
            noise,
        )
    )

    score = (
        temperature_score * 0.5
        + brightness_score * 0.25
        + noise_score * 0.25
    )

    return round(score)


def get_comfort_status(
    score: int,
) -> str:
    if score >= 90:
        return "Excellent"

    if score >= 70:
        return "Good"

    if score >= 40:
        return "Fair"

    return "Poor"