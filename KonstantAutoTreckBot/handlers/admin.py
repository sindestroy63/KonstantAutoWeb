from aiogram import Router, F
from aiogram.filters import BaseFilter, Command
from aiogram.fsm.context import FSMContext
from aiogram.types import (
    Message,
    ReplyKeyboardRemove,
    InlineKeyboardMarkup,
    InlineKeyboardButton,
    CallbackQuery,
)

from config import is_admin


class AdminFilter(BaseFilter):
    """Фильтр: только для пользователей из ADMIN_ID."""

    async def __call__(self, message: Message) -> bool:
        return message.from_user is not None and is_admin(message.from_user.id)
from db import (
    get_broadcast_user_count,
    get_broadcast_users,
    get_tracking_by_vin,
    update_last_status,
)
from keyboards import kb_admin, build_main_kb
from sheets import (
    load_statuses,
    find_order_by_vin,
    get_status_title,
    update_order_status,
    format_progress,
    get_all_orders,
    get_order_display_label,
    _safe_str,
)
from states import BroadcastForm
from datetime import datetime


router = Router()


@router.message(F.text == "🛠 Админка", AdminFilter(), F.chat.type == "private")
async def admin_panel(message: Message):
    await message.answer("🛠 Админ-панель:", reply_markup=kb_admin)


@router.message(F.text == "⬅️ Назад")
async def admin_back(message: Message):
    if message.chat.type != "private":
        return
    await message.answer("Главное меню 👇", reply_markup=build_main_kb(message.from_user.id))


@router.message(F.text == "👤 Пользователи")
async def admin_users(message: Message):
    if message.chat.type != "private":
        return
    if not is_admin(message.from_user.id):
        return

    count = get_broadcast_user_count()
    await message.answer(f"👤 Пользователей в базе: {count}", reply_markup=kb_admin)


@router.message(F.text == "📢 Рассылка")
async def admin_broadcast_start(message: Message, state: FSMContext):
    if message.chat.type != "private":
        return
    if not is_admin(message.from_user.id):
        return

    await state.set_state(BroadcastForm.text)
    await message.answer(
        "✉️ Отправь текст рассылки одним сообщением.\n\n"
        "Отмена: /cancel",
        reply_markup=ReplyKeyboardRemove(),
    )


@router.message(Command("cancel"))
async def cancel_any(message: Message, state: FSMContext):
    if message.chat.type != "private":
        return
    await state.clear()
    await message.answer("Ок, отменил.", reply_markup=build_main_kb(message.from_user.id))


@router.message(BroadcastForm.text)
async def admin_broadcast_send(message: Message, state: FSMContext):
    if message.chat.type != "private":
        return
    if not is_admin(message.from_user.id):
        return

    text = message.text.strip()
    await state.clear()

    users = get_broadcast_users()

    sent = 0
    failed = 0

    for uid in users:
        try:
            await message.bot.send_message(uid, text)
            sent += 1
        except Exception:
            failed += 1

    await message.answer(
        f"📢 Рассылка завершена!\n\n✅ Отправлено: {sent}\n❌ Ошибок: {failed}",
        reply_markup=kb_admin,
    )


def _truncate_label(label: str, max_len: int = 50) -> str:
    """Обрезает подпись кнопки для лимита Telegram, если нужно."""
    label = (label or "").strip()
    if len(label) <= max_len:
        return label
    return label[: max_len - 1].rstrip() + "…"


@router.message(F.text == "🚗 Клиенты")
async def admin_clients_list(message: Message):
    if message.chat.type != "private":
        return
    if not is_admin(message.from_user.id):
        return

    orders = get_all_orders()
    if not orders:
        await message.answer(
            "В таблице заказов пока нет ни одной заявки с указанным VIN.",
            reply_markup=kb_admin,
        )
        return

    kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text=_truncate_label(get_order_display_label(order)),
                    callback_data=f"client:{order['_vin']}",
                )
            ]
            for order in orders
        ]
    )

    await message.answer(
        "📂 Все заявки из таблицы. Выберите клиента для просмотра и изменения статуса:",
        reply_markup=kb,
    )


@router.callback_query(F.data.startswith("client:"))
async def admin_client_card(callback: CallbackQuery):
    if not callback.message:
        return
    if not callback.from_user or not is_admin(callback.from_user.id):
        return

    vin = callback.data.split(":", 1)[1]

    order = find_order_by_vin(vin)
    statuses = load_statuses()

    if not order:
        await callback.answer("Заявка по этому VIN не найдена.", show_alert=True)
        return

    client_name = _safe_str(order.get("client_name"), "—")
    car = _safe_str(order.get("car"), "—")
    status_code = order.get("status")
    status_title = get_status_title(status_code, statuses)
    status_updated_at = _safe_str(order.get("status_updated_at"), "—")
    comment = _safe_str(order.get("comment"))

    progress = format_progress(status_code, statuses)

    text = (
        "<b>Клиентская заявка</b>\n\n"
        f"👤 <b>Клиент:</b> {client_name}\n"
        f"🚘 <b>Автомобиль:</b> {car}\n"
        f"🔢 <b>VIN:</b> {vin}\n"
        f"📍 <b>Текущий статус:</b> {status_title}\n"
        f"🕒 <b>Обновлено:</b> {status_updated_at}\n"
    )

    if comment:
        text += f"\n💬 <b>Комментарий:</b>\n{comment}\n"

    text += "\n<b>Ход выполнения заявки:</b>\n" + progress

    status_buttons = []
    for s in statuses:
        code = _safe_str(s.get("status_code"))
        if not code:
            continue
        label = _safe_str(s.get("status_title")) or code
        status_buttons.append([
            InlineKeyboardButton(text=label, callback_data=f"setstatus:{vin}:{code}")
        ])
    kb = InlineKeyboardMarkup(inline_keyboard=status_buttons)

    await callback.message.edit_text(text, parse_mode="HTML", reply_markup=kb)
    await callback.answer()


@router.callback_query(F.data.startswith("setstatus:"))
async def admin_set_status(callback: CallbackQuery):
    if not callback.message:
        return
    if not callback.from_user or not is_admin(callback.from_user.id):
        return

    try:
        _, vin, new_status_code = callback.data.split(":", 2)
    except ValueError:
        await callback.answer("Некорректные данные статуса.", show_alert=True)
        return

    # Обновляем статус в Google Sheets
    update_order_status(vin, new_status_code)

    # Обновляем локальное хранилище последнего статуса,
    # чтобы вотчер не дублировал уведомление
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    update_last_status(vin, new_status_code, now_str)

    # Уведомляем клиента (если он есть в базе)
    tracking = get_tracking_by_vin(vin)
    statuses = load_statuses()
    status_title = get_status_title(new_status_code, statuses)

    if tracking is not None:
        _, tg_user_id, _, _ = tracking
        notify_text = (
            "🔔 <b>Обновление статуса вашей заявки</b>\n\n"
            f"VIN: <b>{vin}</b>\n"
            f"📍 Новый статус: <b>{status_title}</b>\n"
            f"🕒 Обновлено: <b>{now_str}</b>"
        )
        try:
            await callback.bot.send_message(tg_user_id, notify_text, parse_mode="HTML")
        except Exception:
            # Игнорируем ошибки отправки конкретному пользователю
            pass

    await callback.answer("Статус обновлён.")

    # Обновляем карточку клиента для админа
    order = find_order_by_vin(vin)
    if not order:
        return

    client_name = _safe_str(order.get("client_name"), "—")
    car = _safe_str(order.get("car"), "—")
    status_updated_at = _safe_str(order.get("status_updated_at"), now_str)
    comment = _safe_str(order.get("comment"))

    progress = format_progress(new_status_code, statuses)

    text = (
        "<b>Клиентская заявка</b>\n\n"
        f"👤 <b>Клиент:</b> {client_name}\n"
        f"🚘 <b>Автомобиль:</b> {car}\n"
        f"🔢 <b>VIN:</b> {vin}\n"
        f"📍 <b>Текущий статус:</b> {status_title}\n"
        f"🕒 <b>Обновлено:</b> {status_updated_at}\n"
    )

    if comment:
        text += f"\n💬 <b>Комментарий:</b>\n{comment}\n"

    text += "\n<b>Ход выполнения заявки:</b>\n" + progress

    status_buttons = []
    for s in statuses:
        code = _safe_str(s.get("status_code"))
        if not code:
            continue
        label = _safe_str(s.get("status_title")) or code
        status_buttons.append([
            InlineKeyboardButton(text=label, callback_data=f"setstatus:{vin}:{code}")
        ])
    kb = InlineKeyboardMarkup(inline_keyboard=status_buttons)

    await callback.message.edit_text(text, parse_mode="HTML", reply_markup=kb)

