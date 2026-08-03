import os

from dotenv import load_dotenv


# Загрузка переменных окружения
load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
GOOGLE_CREDS_JSON = os.getenv("GOOGLE_CREDS_JSON", "google-creds.json")
SHEET_ID = os.getenv("SHEET_ID")
ADMIN_CHAT_ID_RAW = os.getenv("ADMIN_CHAT_ID")
ADMIN_CHAT_ID = int(ADMIN_CHAT_ID_RAW) if ADMIN_CHAT_ID_RAW else None

STATUS_POLL_SECONDS = int(os.getenv("STATUS_POLL_SECONDS", "60"))


def get_admin_ids() -> list[int]:
    return [int(x) for x in os.getenv("ADMIN_ID", "").split(",") if x.strip().isdigit()]


def is_admin(user_id: int) -> bool:
    return user_id in get_admin_ids()

