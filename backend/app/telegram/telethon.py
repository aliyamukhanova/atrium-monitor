import os
from datetime import datetime
from zoneinfo import ZoneInfo

from dotenv import load_dotenv
from telethon import TelegramClient, events

from app.database import SessionLocal, engine
from app.models import Reading


load_dotenv()


api_id_value = os.getenv("API_ID")
api_hash = os.getenv("API_HASH")
channel = os.getenv("CHANNEL_NAME")

if not api_id_value:
    raise RuntimeError(
        "API_ID is missing from the .env file."
    )

if not api_hash:
    raise RuntimeError(
        "API_HASH is missing from the .env file."
    )

if not channel:
    raise RuntimeError(
        "CHANNEL_NAME is missing from the .env file."
    )


API_ID = int(api_id_value)
API_HASH = api_hash
CHANNEL = channel

LOCAL_TIMEZONE = ZoneInfo(
    "Asia/Almaty",
)


client = TelegramClient(
    "atrium_session",
    API_ID,
    API_HASH,
)


def normalize_location(
    value: str | None,
) -> str | None:
    if value is None:
        return None

    normalized = value.strip().lower()

    if "atrium" in normalized:
        return "atrium"

    if "outside" in normalized:
        return "outside"

    return normalized


def normalize_brightness(
    value: str | None,
) -> str | None:
    if value is None:
        return None

    normalized = value.strip().lower()

    if "very bright" in normalized:
        return "very bright"

    if "normal" in normalized:
        return "normal"

    if "bright" in normalized:
        return "bright"

    if "dim" in normalized:
        return "dim"

    if "dark" in normalized:
        return "dark"

    return normalized


def normalize_noise(
    value: str | None,
) -> str | None:
    if value is None:
        return None

    normalized = value.strip().lower()

    if "very noisy" in normalized:
        return "very noisy"

    if "mild" in normalized:
        return "mild"

    if "quiet" in normalized:
        return "quiet"

    if "noisy" in normalized:
        return "noisy"

    if "loud" in normalized:
        return "noisy"

    return normalized


def parse_temperature(
    line: str,
) -> float | None:
    value = (
        line.replace("🌡", "")
        .replace("ºC", "")
        .replace("°C", "")
        .strip()
    )

    try:
        return float(value)
    except ValueError:
        return None


def parse_message(
    text: str,
) -> dict[str, str | float | None] | None:
    location = None
    temperature = None
    brightness = None
    noise = None

    for raw_line in text.splitlines():
        line = raw_line.strip()

        if not line:
            continue

        if "🏫" in line:
            location = (
                line.replace("🏫", "")
                .strip()
            )

        elif "🌡" in line:
            temperature = parse_temperature(
                line,
            )

        elif "💡" in line:
            brightness = (
                line.replace("💡", "")
                .strip()
            )

        elif "🔉" in line:
            noise = (
                line.replace("🔉", "")
                .strip()
            )

    normalized_location = (
        normalize_location(location)
    )

    if normalized_location is None:
        return None

    return {
        "location":
            normalized_location,

        "temperature":
            temperature,

        "brightness":
            normalize_brightness(
                brightness,
            ),

        "noise":
            normalize_noise(
                noise,
            ),
    }


def get_local_message_time(
    event,
) -> datetime:
    if event.message.date is None:
        return datetime.now(
            LOCAL_TIMEZONE,
        ).replace(
            tzinfo=None,
        )

    return (
        event.message.date
        .astimezone(
            LOCAL_TIMEZONE,
        )
        .replace(
            tzinfo=None,
        )
    )


@client.on(
    events.NewMessage(
        chats=CHANNEL,
    )
)
async def new_message(
    event,
):
    text = event.raw_text

    print("\nNEW MESSAGE")
    print(text)

    data = parse_message(text)

    if data is None:
        print(
            "Message ignored: "
            "location was not found."
        )
        return

    if data["temperature"] is None:
        print(
            "Message ignored: "
            "temperature was not found."
        )
        return

    measured_at = get_local_message_time(
        event,
    )

    db = SessionLocal()

    try:
        reading = Reading(
            measured_at=measured_at,
            location=data["location"],
            temperature=data[
                "temperature"
            ],
            brightness=data[
                "brightness"
            ],
            noise=data["noise"],
        )

        db.add(reading)
        db.commit()
        db.refresh(reading)

        print(
            "Reading saved:",
            {
                "id":
                    reading.id,

                "location":
                    reading.location,

                "temperature":
                    reading.temperature,

                "brightness":
                    reading.brightness,

                "noise":
                    reading.noise,

                "measured_at":
                    reading.measured_at,
            },
        )

    except Exception as error:
        db.rollback()

        print(
            "Could not save reading:",
            error,
        )

    finally:
        db.close()


print(
    "Telethon database:",
    engine.url,
)

print(
    "Local timezone:",
    LOCAL_TIMEZONE,
)

print(
    "Connecting to Telegram...",
)

client.start()

print("Connected!")

client.run_until_disconnected()