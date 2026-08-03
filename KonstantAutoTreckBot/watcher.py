import asyncio
from datetime import datetime
from typing import Callable, Dict, Tuple

from aiogram import Bot

from sheets import load_statuses, get_status_title


async def status_watcher(
    bot: Bot,
    interval_seconds: int,
    get_status_map_by_vin: Callable[[], Dict[str, Tuple[str, str, str, str]]],
    get_tracked_vins,
    update_last_status,
) -> None:
    """
    Периодически сравнивает статусы заказов по VIN и отправляет обновления пользователям.
    Логика полностью повторяет исходную реализацию status_watcher из main.py.
    """
    while True:
        try:
            sheet_map = get_status_map_by_vin()
            statuses = load_statuses()
            links = get_tracked_vins()

            now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            for vin, tg_user_id, last_status in links:
                if vin not in sheet_map:
                    continue

                status_code, car, updated, comment = sheet_map[vin]

                if last_status != status_code:
                    status_title = get_status_title(status_code, statuses)

                    lines = ["🚗 Обновление статуса вашего автомобиля"]
                    if car:
                        lines.append(f"🚘 Авто: {car}")
                    lines.append(f"📍 Новый статус: {status_title}")
                    if updated:
                        lines.append(f"🕒 Обновлено: {updated}")
                    if comment:
                        lines.append(f"💬 Комментарий: {comment}")

                    await bot.send_message(tg_user_id, "\n".join(lines))

                    update_last_status(vin, status_code, now_str)

        except Exception as e:
            print("status_watcher error:", e)

        await asyncio.sleep(interval_seconds)

