from telethon.sync import TelegramClient
from telethon.sessions import StringSession

API_ID = 39041275
API_HASH = "b01041a6810ac1f13ff303500d38bc02"

with TelegramClient(
    StringSession(),
    API_ID,
    API_HASH,
) as client:
    print("\nSESSION STRING:\n")
    print(client.session.save())