import os
import re
from datetime import datetime

from dotenv import load_dotenv

from telethon import TelegramClient
from telethon import events

from app.database import SessionLocal
from app.models import Reading

load_dotenv()

API_ID = int(os.getenv("API_ID"))
API_HASH = os.getenv("API_HASH")
CHANNEL = os.getenv("CHANNEL_NAME")

client = TelegramClient(
    "atrium_session",
    API_ID,
    API_HASH,
)

def parse_message(text):

    location = None
    temperature = None
    brightness = None
    noise = None

    for line in text.splitlines():

        line = line.strip()

        if "🏫" in line:
            location = line.replace("🏫", "").strip()

        elif "🌡" in line:

            value = (
                line.replace("🌡", "")
                    .replace("ºC", "")
                    .replace("°C", "")
                    .strip()
            )

            try:
                temperature = float(value)
            except:
                pass

        elif "💡" in line:

            brightness = line.replace("💡", "").strip()

        elif "🔉" in line:

            noise = line.replace("🔉", "").strip()

    if location is None:

        return None

    return {
        "location": location,
        "temperature": temperature,
        "brightness": brightness,
        "noise": noise,
    }

@client.on(events.NewMessage(chats=CHANNEL))
async def new_message(event):

    text = event.raw_text

    print("\nNEW MESSAGE")
    print(text)

    data = parse_message(text)

    if data is None:
        print("Invalid message")
        return

    db = SessionLocal()

    reading = Reading(

        measured_at=datetime.now(),

        location=data["location"],

        temperature=data["temperature"],

        brightness=data["brightness"],

        noise=data["noise"],
    )

    db.add(reading)

    db.commit()

    db.close()

    print("Reading saved!")

    print("Connecting to Telegram...")

client.start()

print("Connected!")

client.run_until_disconnected()