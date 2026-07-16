import json
import re

from datetime import datetime

from app.database import SessionLocal
from app.models import Reading

with open("result.json", "r", encoding="utf-8") as f:
    data = json.load(f)

messages = data["messages"]

db = SessionLocal()

db.query(Reading).delete()
db.commit()

for msg in messages:

    text = msg.get("text")

    if not isinstance(text, str):
        continue

    if "Atrium" in text:
        location = "atrium"

    elif "Outside NU" in text:
        location = "outside"

    else:
        continue

    temp_match = re.search(r"(\d+\.?\d*)", text)

    if not temp_match:
        continue

    temperature = float(temp_match.group(1))

    brightness = None

    if "Dark" in text:
        brightness = "dark"

    elif "Normal brightness" in text:
        brightness = "normal"

    elif "Bright" in text:
        brightness = "bright"

    noise = None

    if "Quiet" in text:
        noise = "quiet"

    elif "Mild noise" in text:
        noise = "mild"

    elif "Loud" in text:
        noise = "loud"

    measured_at = datetime.fromisoformat(
        msg["date"]
    )

    reading = Reading(
        measured_at=measured_at,
        location=location,
        temperature=temperature,
        brightness=brightness,
        noise=noise
    )

    db.add(reading)

db.commit()

print("Import complete!")