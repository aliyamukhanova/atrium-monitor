def calculate_temperature_score(temp):

    if 24 <= temp <= 28:
        return 100

    elif 22 <= temp <= 30:
        return 80

    elif 20 <= temp <= 32:
        return 60

    else:
        return 40
    
def calculate_noise_score(noise):

    scores = {
        "quiet": 100,
        "mild": 70,
        "loud": 40
    }

    return scores.get(noise, 50)

def calculate_brightness_score(brightness):

    scores = {
        "normal": 100,
        "bright": 80,
        "dark": 60
    }

    return scores.get(brightness, 50)

def calculate_comfort_score(
    temperature,
    brightness,
    noise
):

    temp_score = calculate_temperature_score(
        temperature
    )

    brightness_score = calculate_brightness_score(
        brightness
    )

    noise_score = calculate_noise_score(
        noise
    )

    score = (
        temp_score * 0.5 +
        brightness_score * 0.25 +
        noise_score * 0.25
    )

    return round(score)

