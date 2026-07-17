import os
from datetime import datetime
from typing import Any
from zoneinfo import ZoneInfo

from dotenv import load_dotenv
from telethon import TelegramClient, events
from telethon.sessions import StringSession

from app.database import SessionLocal, engine
from app.models import Reading


# Loads local .env variables during development.
# On Railway, variables are provided through
# the service's Variables settings.
load_dotenv()


def require_environment_variable(
    name: str,
) -> str:
    value = os.getenv(name)

    if value is None or not value.strip():
        raise RuntimeError(
            f"{name} is missing. "
            "Add it to your local .env file "
            "or Railway service variables."
        )

    return value.strip()


API_ID = int(
    require_environment_variable(
        "API_ID",
    )
)

API_HASH = require_environment_variable(
    "API_HASH",
)

CHANNEL = require_environment_variable(
    "CHANNEL_NAME",
)

TELEGRAM_SESSION = (
    require_environment_variable(
        "TELEGRAM_SESSION",
    )
)

LOCAL_TIMEZONE_NAME = os.getenv(
    "LOCAL_TIMEZONE",
    "Asia/Almaty",
)

LOCAL_TIMEZONE = ZoneInfo(
    LOCAL_TIMEZONE_NAME,
)


# StringSession avoids relying on a local
# atrium_session.session file, which is better
# suited to a hosted Railway environment.
client = TelegramClient(
    StringSession(
        TELEGRAM_SESSION,
    ),
    API_ID,
    API_HASH,
    auto_reconnect=True,
    connection_retries=10,
    retry_delay=5,
)


def normalize_text(
    value: str | None,
) -> str | None:
    if value is None:
        return None

    normalized = " ".join(
        value.strip().lower().split()
    )

    return normalized or None


def normalize_location(
    value: str | None,
) -> str | None:
    normalized = normalize_text(
        value,
    )

    if normalized is None:
        return None

    if "atrium" in normalized:
        return "atrium"

    if "outside" in normalized:
        return "outside"

    return normalized


def normalize_brightness(
    value: str | None,
) -> str | None:
    normalized = normalize_text(
        value,
    )

    if normalized is None:
        return None

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
    normalized = normalize_text(
        value,
    )

    if normalized is None:
        return None

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
        .replace(",", ".")
        .strip()
    )

    try:
        return float(value)
    except ValueError:
        return None


def parse_message(
    text: str,
) -> dict[str, str | float | None] | None:
    location: str | None = None
    temperature: float | None = None
    brightness: str | None = None
    noise: str | None = None

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
    event: Any,
) -> datetime:
    telegram_time = (
        event.message.date
        if event.message
        else None
    )

    if telegram_time is None:
        return datetime.now(
            LOCAL_TIMEZONE,
        ).replace(
            tzinfo=None,
        )

    # Telegram provides a timezone-aware
    # timestamp. Convert it to Kazakhstan time
    # before removing timezone information for
    # storage in the current SQLite schema.
    return (
        telegram_time
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
    event: Any,
) -> None:
    text = event.raw_text or ""

    print(
        "\nNEW MESSAGE",
        flush=True,
    )

    print(
        text,
        flush=True,
    )

    data = parse_message(
        text,
    )

    if data is None:
        print(
            "Message ignored: "
            "location was not found.",
            flush=True,
        )
        return

    temperature = data[
        "temperature"
    ]

    if not isinstance(
        temperature,
        (int, float),
    ):
        print(
            "Message ignored: "
            "temperature was not found "
            "or was invalid.",
            flush=True,
        )
        return

    location = data["location"]
    brightness = data["brightness"]
    noise = data["noise"]

    if not isinstance(location, str):
        print(
            "Message ignored: "
            "location was invalid.",
            flush=True,
        )
        return

    measured_at = (
        get_local_message_time(
            event,
        )
    )

    db = SessionLocal()

    try:
        reading = Reading(
            measured_at=measured_at,
            location=location,
            temperature=float(
                temperature,
            ),
            brightness=(
                brightness
                if isinstance(
                    brightness,
                    str,
                )
                else None
            ),
            noise=(
                noise
                if isinstance(
                    noise,
                    str,
                )
                else None
            ),
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
            flush=True,
        )

    except Exception as error:
        db.rollback()

        print(
            "Could not save reading:",
            repr(error),
            flush=True,
        )

    finally:
        db.close()


def run_listener() -> None:
    print(
        "Telethon database:",
        engine.url,
        flush=True,
    )

    print(
        "Local timezone:",
        LOCAL_TIMEZONE_NAME,
        flush=True,
    )

    print(
        "Telegram channel:",
        CHANNEL,
        flush=True,
    )

    print(
        "Connecting to Telegram...",
        flush=True,
    )

    client.start()

    print(
        "Connected to Telegram.",
        flush=True,
    )

    print(
        "Listening for new messages...",
        flush=True,
    )

    client.run_until_disconnected()


if __name__ == "__main__":
    run_listener()