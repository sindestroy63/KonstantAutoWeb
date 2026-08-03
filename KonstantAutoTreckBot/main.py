import asyncio

from aiogram import Bot, Dispatcher

from config import BOT_TOKEN, STATUS_POLL_SECONDS
from db import get_tracked_vins, update_last_status  # noqa: F401 (инициализация модулей БД)
from handlers.admin import router as admin_router
from handlers.user import router as user_router
from sheets import build_status_map_by_vin
from watcher import status_watcher


async def main() -> None:
    bot = Bot(BOT_TOKEN)
    dp = Dispatcher()

    # Админ-роутер первым, чтобы кнопка "🛠 Админка" обрабатывалась им, а не fallback в user_router
    dp.include_router(admin_router)
    dp.include_router(user_router)

    # снимаем webhook, чтобы polling работал
    await bot.delete_webhook(drop_pending_updates=True)

    # ЗАПУСК ФОНОВОГО ОТСЛЕЖИВАНИЯ СТАТУСОВ (ПУШ)
    asyncio.create_task(
        status_watcher(
            bot=bot,
            interval_seconds=STATUS_POLL_SECONDS,
            get_status_map_by_vin=build_status_map_by_vin,
            get_tracked_vins=get_tracked_vins,
            update_last_status=update_last_status,
        )
    )

    # запуск бота
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
