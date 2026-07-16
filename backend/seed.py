import json
import re

from datetime import datetime

from app.database import SessionLocal
from app.models import Reading


with open("result.json", "r", encoding="utf-8") as f:
    data = json.load(f)


messages = data["messages"]

db = SessionLocal()

try:
    # Clear old readings so you do not create duplicates
    db.query(Reading).delete()
    db.commit()

    imported_count = 0

    for msg in messages:
        text = msg.get("text")

        # Skip messages that do not contain normal text
        if not isinstance(text, str):
            continue

        # Detect location
        if "Atrium" in text:
            location = "atrium"

        elif "Outside NU" in text:
            location = "outside"

        else:
            continue

        # Extract temperature
        temp_match = re.search(r"(\d+(?:\.\d+)?)", text)

        if not temp_match:
            continue

        temperature = float(temp_match.group(1))

        # Outdoor readings do not have brightness
        brightness = None

        if "Very bright" in text:
            brightness = "very bright"

        elif "Normal brightness" in text:
            brightness = "normal"

        elif "Bright" in text:
            brightness = "bright"

        elif "Dim" in text:
            brightness = "dim"

        elif "Dark" in text:
            brightness = "dark"

        # Outdoor readings do not have noise
        noise = None

        if "Very noisy" in text:
            noise = "very noisy"

        elif "Mild noise" in text:
            noise = "mild"

        elif "Noisy" in text:
            noise = "noisy"

        elif "Quiet" in text:
            noise = "quiet"

        # Convert Telegram date text into a Python datetime
        measured_at = datetime.fromisoformat(msg["date"])

        # Create one database row for this message
        reading = Reading(
            measured_at=measured_at,
            location=location,
            temperature=temperature,
            brightness=brightness,
            noise=noise,
        )

        db.add(reading)
        imported_count += 1

    # Save all created rows
    db.commit()

    print(f"Import complete! Imported {imported_count} readings.")

except Exception:
    db.rollback()
    raise

finally:
    db.close()