from aiogram import Router, F
from aiogram.filters import CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.types import Message, ReplyKeyboardRemove, CallbackQuery

from config import ADMIN_CHAT_ID
from db import add_broadcast_user, add_tracking
from keyboards import (
    build_main_kb,
    kb_admin,
    kb_contact,
    kb_cancel,
    kb_pick_class,
    kb_pick_year,
    kb_pick_transmission,
    kb_pick_drive,
    kb_pick_budget,
    kb_pick_timing,
    kb_phone,
    contacts_keyboard,
)
from sheets import (
    load_statuses,
    find_order_by_vin,
    format_progress,
    normalize_vin,
    get_status_title,
)
from states import PickupForm, ConsultForm, BroadcastForm, TrackForm


router = Router()


@router.message(F.text.startswith("🚚 Машин в пути:"))
async def cars_in_transit_click(message: Message):
    if message.chat.type != "private":
        return
    await message.answer(
        "📦 Актуальное число обновляется каждый день ✅",
        reply_markup=build_main_kb(message.from_user.id),
    )


@router.message(F.text == "☎️ Консультация")
async def consult_start(message: Message, state: FSMContext):
    if message.chat.type != "private":
        return

    await state.clear()
    await state.set_state(ConsultForm.datetime)
    await message.answer(
        "☎️ Консультация\n\n"
        "Укажите удобные дату и время (МСК), когда можно созвониться.\n"
        "Например: 20.02 в 18:30",
        reply_markup=kb_cancel,
    )


@router.message(ConsultForm.datetime)
async def consult_datetime(message: Message, state: FSMContext):
    if message.text == "✖️ Отменить":
        await state.clear()
        await message.answer(
            "Ок, отменил.", reply_markup=build_main_kb(message.from_user.id)
        )
        return

    await state.update_data(datetime=message.text.strip())
    await state.set_state(ConsultForm.fio)
    await message.answer("Напишите ваше ФИО.", reply_markup=kb_cancel)


@router.message(ConsultForm.fio)
async def consult_fio(message: Message, state: FSMContext):
    if message.text == "✖️ Отменить":
        await state.clear()
        await message.answer(
            "Ок, отменил.", reply_markup=build_main_kb(message.from_user.id)
        )
        return

    await state.update_data(fio=message.text.strip())
    await state.set_state(ConsultForm.phone)
    await message.answer("Отправьте номер телефона для связи 👇", reply_markup=kb_phone)


def _normalize_phone(raw: str) -> str | None:
    import re

    if not raw:
        return None

    digits = re.sub(r"\D", "", raw)

    if len(digits) == 11 and digits.startswith("8"):
        digits = "7" + digits[1:]

    if len(digits) == 11 and digits.startswith("7"):
        return digits

    return None


@router.message(ConsultForm.phone, F.contact)
async def consult_phone_contact(message: Message, state: FSMContext):
    phone = _normalize_phone(message.contact.phone_number) or message.contact.phone_number
    await state.update_data(phone=phone)

    await state.set_state(ConsultForm.topic)
    await message.answer("Выберите тему консультации:", reply_markup=kb_cons_topic)


@router.message(ConsultForm.phone)
async def consult_phone_text(message: Message, state: FSMContext):
    if message.text == "✖️ Отменить":
        await state.clear()
        await message.answer(
            "Ок, отменил.", reply_markup=build_main_kb(message.from_user.id)
        )
        return

    phone = _normalize_phone(message.text) or message.text.strip()
    await state.update_data(phone=phone)

    await state.set_state(ConsultForm.topic)
    await message.answer("Выберите тему консультации:", reply_markup=kb_cons_topic)


@router.message(ConsultForm.topic)
async def consult_topic(message: Message, state: FSMContext):
    if message.text == "✖️ Отменить":
        await state.clear()
        await message.answer(
            "Ок, отменил.", reply_markup=build_main_kb(message.from_user.id)
        )
        return

    topic = message.text.strip()
    await state.update_data(topic=topic)

    if "Покупка авто" in topic:
        await state.set_state(ConsultForm.goal)
        await message.answer("Цель консультации:", reply_markup=kb_cons_goal)
    else:
        await state.set_state(ConsultForm.other_text)
        await message.answer("Опишите ваш вопрос одним сообщением.", reply_markup=kb_cancel)


@router.message(ConsultForm.goal)
async def consult_goal(message: Message, state: FSMContext):
    if message.text == "✖️ Отменить":
        await state.clear()
        await message.answer(
            "Ок, отменил.", reply_markup=build_main_kb(message.from_user.id)
        )
        return

    await state.update_data(goal=message.text.strip())
    data = await state.get_data()
    await state.clear()

    await message.answer(
        "✅ Заявка на консультацию отправлена! Мы свяжемся с вами.",
        reply_markup=build_main_kb(message.from_user.id),
    )

    if ADMIN_CHAT_ID:
        text = (
            "☎️ <b>Консультация</b>\n"
            f"🕒 Когда: {data.get('datetime','—')}\n"
            f"👤 ФИО: {data.get('fio','—')}\n"
            f"📞 Тел: {data.get('phone','—')}\n"
            f"🧩 Тема: {data.get('topic','—')}\n"
            f"🎯 Цель: {data.get('goal','—')}\n"
            f"\nTG: @{message.from_user.username or '—'} | id:{message.from_user.id}"
        )
        await message.bot.send_message(ADMIN_CHAT_ID, text, parse_mode="HTML")


@router.message(ConsultForm.other_text)
async def consult_other_text(message: Message, state: FSMContext):
    if message.text == "✖️ Отменить":
        await state.clear()
        await message.answer(
            "Ок, отменил.", reply_markup=build_main_kb(message.from_user.id)
        )
        return

    await state.update_data(other_text=message.text.strip())
    data = await state.get_data()
    await state.clear()

    await message.answer(
        "✅ Заявка на консультацию отправлена! Мы свяжемся с вами.",
        reply_markup=build_main_kb(message.from_user.id),
    )

    if ADMIN_CHAT_ID:
        text = (
            "☎️ <b>Консультация</b>\n"
            f"🕒 Когда: {data.get('datetime','—')}\n"
            f"👤 ФИО: {data.get('fio','—')}\n"
            f"📞 Тел: {data.get('phone','—')}\n"
            f"🧩 Тема: {data.get('topic','—')}\n"
            f"📝 Вопрос: {data.get('other_text','—')}\n"
            f"\nTG: @{message.from_user.username or '—'} | id:{message.from_user.id}"
        )
        await message.bot.send_message(ADMIN_CHAT_ID, text, parse_mode="HTML")


CONTACTS_MESSAGE = (
    "<b>Контакты KONSTANT AUTO</b>\n\n"
    "<b>Мы всегда на связи и готовы помочь\n"
    "с подбором и доставкой автомобиля\n"
    "из-за рубежа.</b>\n\n"
    "☎️ <code>+79277198887</code>\n\n"
    "<b>Выберите удобный способ связи:</b>"
)


@router.message(F.text == "📞 Контакты")
async def contacts_handler(message: Message):
    if message.chat.type != "private":
        return

    await message.answer(
        CONTACTS_MESSAGE,
        parse_mode="HTML",
        reply_markup=contacts_keyboard,
    )


@router.callback_query(F.data == "contacts_back")
async def contacts_back_callback(callback: CallbackQuery):
    if not callback.message or not callback.from_user:
        return
    await callback.answer()
    await callback.message.answer(
        "Главное меню 👇",
        reply_markup=build_main_kb(callback.from_user.id),
    )


@router.message(CommandStart())
async def start_handler(message: Message):
    user_id = message.from_user.id
    add_broadcast_user(user_id)

    await message.answer(
        "<b>Добро пожаловать в KONSTANTAuto! 🚗</b>\n\n"
        "<i>Здесь Вы можете быстро и удобно оставить заявку на подбор автомобиля из Китая, "
        "Кореи, ОАЭ, Европы или Америки. Мы подберём, проверим и привезём авто под ваши задачи — "
        "всё прозрачно и под ключ.</i>\n\n"
        "📋 Вы можете:\n"
        "— Оставить заявку на подбор авто\n"
        "— Получить консультацию\n"
        "— Отследить статус заказанного автомобиля\n\n"
        "Выберите нужный раздел в меню ниже 👇",
        parse_mode="HTML",
        reply_markup=build_main_kb(message.from_user.id),
    )


@router.message(F.text == "📝 Заявка на подбор")
async def pickup_start(message: Message, state: FSMContext):
    await state.clear()

    if message.chat.type != "private":
        await message.answer(
            "📲 Анкета заполняется в личном чате с ботом. Напишите мне в личку."
        )
        return

    await state.set_state(PickupForm.brand_model)
    await message.answer(
        "Какую марку и модель автомобиля вы рассматриваете?\nМожно указать несколько вариантов.",
        reply_markup=kb_cancel,
    )


@router.message(PickupForm.brand_model)
async def pickup_brand_model(message: Message, state: FSMContext):
    if message.text == "✖️ Отменить":
        await state.clear()
        await message.answer(
            "Ок, отменил.", reply_markup=build_main_kb(message.from_user.id)
        )
        return

    await state.update_data(brand_model=message.text.strip())
    await state.set_state(PickupForm.car_class)
    await message.answer(
        "Какой класс автомобиля вы рассматриваете?",
        reply_markup=kb_pick_class,
    )


@router.message(PickupForm.car_class)
async def pickup_class(message: Message, state: FSMContext):
    if message.text == "✖️ Отменить":
        await state.clear()
        await message.answer(
            "Ок, отменил.", reply_markup=build_main_kb(message.from_user.id)
        )
        return

    await state.update_data(car_class=message.text.strip())
    await state.set_state(PickupForm.year)
    await message.answer("Какой год выпуска вы рассматриваете?", reply_markup=kb_pick_year)


@router.message(PickupForm.year)
async def pickup_year(message: Message, state: FSMContext):
    if message.text == "✖️ Отменить":
        await state.clear()
        await message.answer(
            "Ок, отменил.", reply_markup=build_main_kb(message.from_user.id)
        )
        return

    await state.update_data(year=message.text.strip())
    await state.set_state(PickupForm.transmission)
    await message.answer(
        "Какую коробку передач вы предпочитаете?",
        reply_markup=kb_pick_transmission,
    )


@router.message(PickupForm.transmission)
async def pickup_trans(message: Message, state: FSMContext):
    if message.text == "✖️ Отменить":
        await state.clear()
        await message.answer(
            "Ок, отменил.", reply_markup=build_main_kb(message.from_user.id)
        )
        return

    await state.update_data(transmission=message.text.strip())
    await state.set_state(PickupForm.drive)
    await message.answer("Какой привод вам подходит?", reply_markup=kb_pick_drive)


@router.message(PickupForm.drive)
async def pickup_drive(message: Message, state: FSMContext):
    if message.text == "✖️ Отменить":
        await state.clear()
        await message.answer(
            "Ок, отменил.", reply_markup=build_main_kb(message.from_user.id)
        )
        return

    await state.update_data(drive=message.text.strip())
    await state.set_state(PickupForm.budget)
    await message.answer("На какой бюджет вы ориентируетесь?", reply_markup=kb_pick_budget)


@router.message(PickupForm.budget)
async def pickup_budget(message: Message, state: FSMContext):
    if message.text == "✖️ Отменить":
        await state.clear()
        await message.answer(
            "Ок, отменил.", reply_markup=build_main_kb(message.from_user.id)
        )
        return

    await state.update_data(budget=message.text.strip())
    await state.set_state(PickupForm.timing)
    await message.answer(
        "В какие сроки вы хотели бы получить автомобиль?",
        reply_markup=kb_pick_timing,
    )


@router.message(PickupForm.timing)
async def pickup_timing(message: Message, state: FSMContext):
    if message.text == "✖️ Отменить":
        await state.clear()
        await message.answer(
            "Ок, отменил.", reply_markup=build_main_kb(message.from_user.id)
        )
        return

    await state.update_data(timing=message.text.strip())
    await state.set_state(PickupForm.name_city)
    await message.answer("Пожалуйста, укажите ваше ФИО и город.", reply_markup=kb_cancel)


@router.message(PickupForm.name_city)
async def pickup_name_city(message: Message, state: FSMContext):
    if message.text == "✖️ Отменить":
        await state.clear()
        await message.answer(
            "Ок, отменил.", reply_markup=build_main_kb(message.from_user.id)
        )
        return

    await state.update_data(name_city=message.text.strip())
    await state.set_state(PickupForm.phone)
    await message.answer("Отправьте номер телефона для связи 👇", reply_markup=kb_phone)


@router.message(PickupForm.phone, F.contact)
async def pickup_phone_contact(message: Message, state: FSMContext):
    phone = _normalize_phone(message.contact.phone_number) or message.contact.phone_number
    await state.update_data(phone=phone)

    data = await state.get_data()
    await state.clear()

    await message.answer(
        "✅ Заявка отправлена! Менеджер скоро свяжется с вами.",
        reply_markup=build_main_kb(message.from_user.id),
    )

    if ADMIN_CHAT_ID:
        text = (
            "📝 <b>Заявка на подбор</b>\n"
            f"👤 {data.get('name_city','—')}\n"
            f"📞 {data.get('phone','—')}\n\n"
            f"🚘 Марка/модель: {data.get('brand_model','—')}\n"
            f"🏷 Класс: {data.get('car_class','—')}\n"
            f"📅 Год: {data.get('year','—')}\n"
            f"⚙️ КПП: {data.get('transmission','—')}\n"
            f"🛞 Привод: {data.get('drive','—')}\n"
            f"💰 Бюджет: {data.get('budget','—')}\n"
            f"⏱ Сроки: {data.get('timing','—')}\n"
            f"\nTG: @{message.from_user.username or '—'} | id:{message.from_user.id}"
        )
        await message.bot.send_message(ADMIN_CHAT_ID, text, parse_mode="HTML")


@router.message(PickupForm.phone)
async def pickup_phone_text(message: Message, state: FSMContext):
    if message.text == "✖️ Отменить":
        await state.clear()
        await message.answer(
            "Ок, отменил.", reply_markup=build_main_kb(message.from_user.id)
        )
        return

    phone = _normalize_phone(message.text) or message.text.strip()
    await state.update_data(phone=phone)

    data = await state.get_data()
    await state.clear()

    await message.answer(
        "✅ Заявка отправлена! Менеджер скоро свяжется с вами.",
        reply_markup=build_main_kb(message.from_user.id),
    )

    if ADMIN_CHAT_ID:
        text = (
            "📝 <b>Заявка на подбор</b>\n"
            f"👤 {data.get('name_city','—')}\n"
            f"📞 {data.get('phone','—')}\n\n"
            f"🚘 Марка/модель: {data.get('brand_model','—')}\n"
            f"🏷 Класс: {data.get('car_class','—')}\n"
            f"📅 Год: {data.get('year','—')}\n"
            f"⚙️ КПП: {data.get('transmission','—')}\n"
            f"🛞 Привод: {data.get('drive','—')}\n"
            f"💰 Бюджет: {data.get('budget','—')}\n"
            f"⏱ Сроки: {data.get('timing','—')}\n"
            f"\nTG: @{message.from_user.username or '—'} | id:{message.from_user.id}"
        )
        await message.bot.send_message(ADMIN_CHAT_ID, text, parse_mode="HTML")


@router.message(F.text == "🚗 Отследить авто")
async def track_handler(message: Message, state: FSMContext):
    if message.chat.type != "private":
        await message.answer(
            "📲 Отправка VIN доступна только в личном чате с ботом.\n"
            "Пожалуйста, напишите боту в личку."
        )
        return

    await state.clear()
    await state.set_state(TrackForm.vin)
    await message.answer(
        "Чтобы найти вашу заявку, введите VIN-код вашего автомобиля (17 символов, латинские буквы и цифры, без I, O и Q).",
        reply_markup=kb_cancel,
    )


@router.message(TrackForm.vin)
async def track_vin_handler(message: Message, state: FSMContext):
    if message.text == "✖️ Отменить":
        await state.clear()
        await message.answer(
            "Ок, отменил.", reply_markup=build_main_kb(message.from_user.id)
        )
        return

    vin = normalize_vin(message.text)

    if not vin:
        await message.answer(
            "Некорректный VIN.\n\n"
            "VIN должен содержать 17 символов (латинские буквы и цифры, без I, O и Q).\n"
            "Пожалуйста, введите VIN ещё раз."
        )
        return

    add_tracking(vin, message.from_user.id)

    statuses = load_statuses()
    order = find_order_by_vin(vin)

    await state.clear()

    if not order:
        await message.answer(
            "Заявка по этому VIN не найдена.\n"
            "Проверьте, что VIN совпадает с тем, который вы указывали.",
            reply_markup=build_main_kb(message.from_user.id),
        )
        return

    car = order.get("car", "—")
    order_id = order.get("order_id", "—")
    status_code = order.get("status", "—")
    status_title = get_status_title(status_code, statuses)
    updated = order.get("status_updated_at", order.get("updated", "—"))
    comment = order.get("comment", "")

    progress = format_progress(status_code, statuses)

    text = (
        "<b>🚗 Отслеживание доставки автомобиля</b>\n\n"
        f"📄 <b>Заявка:</b> {order_id}\n"
        f"🚘 <b>Автомобиль:</b> {car}\n"
        f"📍 <b>Текущий статус:</b> {status_title}\n"
        f"🕒 <b>Обновлено:</b> {updated}\n"
    )

    if comment:
        text += f"\n💬 <b>Комментарий менеджера:</b>\n{comment}\n"

    text += "\n<b>Ход выполнения заявки:</b>\n" + progress

    await message.answer(
        text,
        parse_mode="HTML",
        reply_markup=build_main_kb(message.from_user.id),
    )


@router.message(F.contact)
async def contact_handler(message: Message):
    await message.answer(
        "Сейчас отслеживание заказа выполняется по VIN-коду, а не по номеру телефона.\n"
        "Пожалуйста, отправьте VIN (17 символов, латинские буквы и цифры, без I, O и Q) текстом.",
        reply_markup=build_main_kb(message.from_user.id),
    )


@router.message()
async def fallback_handler(message: Message):
    if message.chat.type != "private":
        return

    if message.text and message.text.startswith("/"):
        return

    await message.answer(
        "Выберите действие кнопками внизу 👇",
        reply_markup=build_main_kb(message.from_user.id),
    )

