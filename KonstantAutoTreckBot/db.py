import sqlite3
from datetime import datetime, timezone
from typing import List, Tuple, Optional


# =======================
# Подключения к БД
# =======================

# База для рассылки (users.db)
conn_users = sqlite3.connect("users.db")
cursor_users = conn_users.cursor()
cursor_users.execute(
    """
    CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY
    )
    """
)
conn_users.commit()

# База для прочих данных бота (bot.db)
conn_bot = sqlite3.connect("bot.db")
cursor_bot = conn_bot.cursor()

cursor_bot.execute(
    """
    CREATE TABLE IF NOT EXISTS users (
        tg_user_id INTEGER PRIMARY KEY,
        phone TEXT,
        updated_at TEXT
    )
    """
)

cursor_bot.execute(
    """
    CREATE TABLE IF NOT EXISTS client_links (
        vin TEXT PRIMARY KEY,
        tg_user_id INTEGER NOT NULL,
        last_status TEXT,
        last_notified_at TEXT
    )
    """
)
conn_bot.commit()


# =======================
# Работа с пользователями (телефон, рассылка)
# =======================

def save_user_phone(tg_user_id: int, phone: str) -> None:
    cursor_bot.execute(
        """
        INSERT INTO users (tg_user_id, phone, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(tg_user_id)
        DO UPDATE SET phone=excluded.phone, updated_at=excluded.updated_at
        """,
        (tg_user_id, phone, datetime.now(timezone.utc).isoformat()),
    )
    conn_bot.commit()


def add_broadcast_user(user_id: int) -> None:
    cursor_users.execute(
        "INSERT OR IGNORE INTO users (user_id) VALUES (?)",
        (user_id,),
    )
    conn_users.commit()


def get_broadcast_user_count() -> int:
    cursor_users.execute("SELECT COUNT(*) FROM users")
    row = cursor_users.fetchone()
    return int(row[0]) if row else 0


def get_broadcast_users() -> List[int]:
    cursor_users.execute("SELECT user_id FROM users")
    rows = cursor_users.fetchall()
    return [row[0] for row in rows]


# =======================
# Отслеживание по VIN (client_links)
# =======================

def add_tracking(vin: str, chat_id: int) -> None:
    cursor_bot.execute(
        """
        INSERT INTO client_links (vin, tg_user_id, last_status, last_notified_at)
        VALUES (?, ?, 
            COALESCE((SELECT last_status FROM client_links WHERE vin=?), NULL),
            COALESCE((SELECT last_notified_at FROM client_links WHERE vin=?), NULL)
        )
        ON CONFLICT(vin) DO UPDATE SET tg_user_id=excluded.tg_user_id
        """,
        (vin, chat_id, vin, vin),
    )
    conn_bot.commit()


def get_tracked_vins() -> List[Tuple[str, int, Optional[str]]]:
    cursor_bot.execute("SELECT vin, tg_user_id, last_status FROM client_links")
    return cursor_bot.fetchall()


def get_tracking_by_vin(vin: str) -> Optional[Tuple[str, int, Optional[str], Optional[str]]]:
    cursor_bot.execute(
        "SELECT vin, tg_user_id, last_status, last_notified_at FROM client_links WHERE vin=?",
        (vin,),
    )
    row = cursor_bot.fetchone()
    return row if row is not None else None


def update_last_status(vin: str, status: str, notified_at: str) -> None:
    cursor_bot.execute(
        "UPDATE client_links SET last_status=?, last_notified_at=? WHERE vin=?",
        (status, notified_at, vin),
    )
    conn_bot.commit()

